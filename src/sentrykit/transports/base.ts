/**
 * @fileOverview Transport 的抽象基类
 * @date 2025-11-13
 * @author poohlaha
 * @description
 */
import {
	createEnvelope,
	Envelope,
	EnvelopeItem,
	envelopeItemTypeToDataCategory,
	forEachEnvelopeItem,
	isRateLimited,
	logger,
	makePromiseBuffer,
	resolvedSyncPromise,
	SentryError,
	serializeEnvelope,
	TransportMakeRequestResponse,
	updateRateLimits
} from '@sentry/core';
import { __SENTRY_DEBUG__ } from '../types';
import { SentryKitConfig } from './types';

/**
 * 默认的缓冲队列大小。
 * 每次 send() 调用实际上会创建一个任务加入队列，这里限制同一时间最多允许多少个未完成任务。
 * 超过后会丢弃事件（queue_overflow），以防止内存无限增长。
 */
export const DEFAULT_TRANSPORT_BUFFER_SIZE = 30;

/**
 * 传输层请求对象。
 * createTransport() 并不直接发送 HTTP，它只是构造出一个请求对象，
 * 然后交给 makeRequest() 去执行。
 * 这是最终传输层必须返回给 makeRequest 的结构。
 */
export interface TransportRequest {
	// 请求体，一般是序列化后的 envelope(Uint8Array 或 string)
	body: Uint8Array | string;

	// 可选的 URL
	url?: string;

	// 请求头
	headers?: Record<string, string>;

	// 请求方式
	method?: string;

	// 额外的字段, 例如浏览器 fetch 需要的 keepalive、credentials 等
	options?: Record<string, any>;
}

/**
 * 传输层的响应结构。
 * createTransport 不关心具体网络实现，只关心能否拿到 statusCode 及响应 header。
 */
export interface TransportResponse {
	// HTTP 状态码，如 200、429 等
	statusCode?: number;

	// 服务器回传的响应头，用于判断 rate-limit 信息
	headers?: Record<string, string>;

	// 服务器返回的 body
	body?: any;
}

/**
 * TransportOptions 是上层（Sentry Client）传给 createTransport 的配置。
 * createTransport 的行为会依赖这些选项。
 */
export interface TransportOptions {
	// 指定请求发送的 URL（如 Sentry DSN 生成的 ingest/ URL）
	url?: string;

	// 字节序列化器，默认 TextEncoder
	textEncoder?: TextEncoder;

	// 自定义将 envelope -> TransportRequest 的过程。
	// 如果不存在，则用默认序列化逻辑。
	getRequest?: (envelope: Envelope) => TransportRequest | null | undefined;

	// 缓冲队列大小。默认是 30。
	// 如果这里设置大于 30，则会覆盖默认值。
	bufferSize?: number;

	// 记录事件丢弃，例如 ratelimit_backoff, queue_overflow, network_error 等。
	// SDK 会依赖它统计 drop 个数。
	recordDroppedEvent: (reason: string, category: string, event?: any) => void;

	fetchOptions: { [K: string]: any };

	sentryKitConfig: SentryKitConfig;
}

// rateLimit 描述：category -> timestamp（直到何时不能发送）
export type RateLimits = Record<string, number>;

/**
 * createTransport —— 创建一个基础传输层。
 * 它本身不做任何真正的网络请求，只：
 * - 检查是否被限流（rate-limit）
 * - 统计丢弃事件
 * - 序列化 envelope
 * - 交给 makeRequest() 去做真正的发送
 * - 使用 promise buffer 控制并发次数
 *
 * makeRequest 是由上层（如 fetchTransport、XHRTransport、NativeTransport）提供的。
 * 因此 createTransport 是所有传输的“公共底层逻辑”。
 * createTransport 创建一个传输层（transport）实例，负责把 SDK 内部的 Envelope（事件/事务/附件等的统一打包格式）安全、合规地交给底层网络实现去发送，同时处理客户端限流、队列并发控制和丢弃统计。
 */
export function createTransport(
	options: TransportOptions,
	makeRequest: (request: TransportRequest) => Promise<TransportResponse>,
	buffer = makePromiseBuffer<TransportResponse>(options.bufferSize || DEFAULT_TRANSPORT_BUFFER_SIZE)
) {
	// 当前 SDK 内缓存的 rate-limit 数据
	let rateLimits: RateLimits = {};

	// flush() 会等待所有 buffer 中的任务执行完成
	const flush = (timeout?: number) => buffer.drain(timeout);

	// send(envelope), 主逻辑——尝试发送 envelope，如果成功执行网络请求，返回其 promise。
	function send(envelope: Envelope): PromiseLike<TransportResponse | void> {
		const filteredEnvelopeItems: EnvelopeItem[] = [];

		// 1. 遍历 envelope 的每个 item，检查是否被 rate-limit 限制。
		// 如果是，则丢弃并调用 recordDroppedEvent()。
		forEachEnvelopeItem(envelope, (item, type) => {
			const envelopeItemDataCategory = envelopeItemTypeToDataCategory(type);

			if (isRateLimited(rateLimits, envelopeItemDataCategory)) {
				// 从 item 中取出真正的 event（仅 event/transaction 类型包含 event 本体）
				const event = getEventForEnvelopeItem(item, type);

				// 统计被限流导致的丢弃
				options.recordDroppedEvent('ratelimit_backoff', envelopeItemDataCategory, event);
			} else {
				filteredEnvelopeItems.push(item);
			}
		});

		// 如果全部被过滤，则没有东西可发，立即返回 resolvedSyncPromise
		if (filteredEnvelopeItems.length === 0) {
			return resolvedSyncPromise();
		}

		// 2. 根据可发送的 items 构建新的 envelope
		const filteredEnvelope = createEnvelope(envelope[0], filteredEnvelopeItems as any);

		// 用于记录 envelope 内所有 item 的丢失事件, 如: 网络错误/队列溢出
		const recordEnvelopeLoss = (reason: string) => {
			forEachEnvelopeItem(filteredEnvelope, (item, type) => {
				const event = getEventForEnvelopeItem(item, type);
				options.recordDroppedEvent(reason, envelopeItemTypeToDataCategory(type), event);
			});
		};

		// 3. 将 envelope 转为 TransportRequest（包含 URL、body、headers）
		// 可以自定义 getRequest，否则用默认 envelope 序列化。
		const getRequest =
			options.getRequest ||
			((env: Envelope) => ({
				body: serializeEnvelope(env)
				// method: 'POST',
				// url: options.url,
				// headers: { 'content-type': 'application/x-sentry-envelope' },
			}));

		const request = getRequest(filteredEnvelope);
		if (!request) {
			return resolvedSyncPromise();
		}

		// 4. 构建网络请求任务（交给 promise buffer 管理）
		const requestTask = () =>
			makeRequest(request).then(
				(response) => {
					// 非 2xx 的响应，给出 debug 提示
					if (
						response.statusCode !== undefined &&
						(response.statusCode < 200 || response.statusCode >= 300)
					) {
						(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) &&
							logger.warn(
								`[SentryKit] Sentry responded with status code ${response.statusCode} to sent event.`
							);
					}

					// 更新内存中的 rateLimit
					rateLimits = updateRateLimits(rateLimits, response as TransportMakeRequestResponse);

					return response;
				},
				(error) => {
					// 网络错误被视为整条 envelope 失败
					recordEnvelopeLoss('network_error');
					throw error;
				}
			);

		// 5. 把 requestTask 放入 buffer（限流队列）
		return buffer.add(requestTask).then(
			(result) => result,
			(error) => {
				if (error instanceof SentryError) {
					// 队列满了 → 丢弃
					(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) &&
						logger.error('[SentryKit] Skipped sending event because buffer is full.');
					recordEnvelopeLoss('queue_overflow');
					return resolvedSyncPromise();
				}
				throw error;
			}
		);
	}

	// 给测试识别
	(send as any).__sentry__baseTransport__ = true;

	return { send, flush };
}

// 从 envelope item 中提取出真正的事件对象（仅 event/transaction 类型有）
function getEventForEnvelopeItem(item: EnvelopeItem, type: string) {
	if (type !== 'event' && type !== 'transaction') {
		return undefined;
	}
	return Array.isArray(item) ? item[1] : undefined;
}
