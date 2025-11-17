/**
 * @fileOverview
 * @date 2025-11-07
 * @author poohlaha
 * @description
 */
import { processForPrivacy } from '../privacy/rules';
import { Envelope, supportsFetch } from '@sentry/core';
import { checkEnvelopeSentrySDKCompatibility } from '../utils';
import { envelopeToIngestionEvents } from '../ingestion-event';
import { makeFetchTransport } from './fetch';
import { makeXHRTransport } from './xhr';
import { TransportOptions } from './base';

/**
 * 构造 SentryKit 私有 Ingest URL。
 * 示例：
 *   ingestUrl: "https://amp.test.com"
 *   topic:     "error"
 * 输出：
 *   https://amp.test.com/report/2/error
 */
export function createTransportUrl(ingestUrl: string, topic: string): string {
	const url = new URL(ingestUrl);
	url.pathname = `/report/2/${topic}`;
	return url.toString();
}

/**
 * 生成 SentryKit 专用 Transport
 * 它会覆盖 options.getRequest，使 createTransport() 能正确构造 Request。
 *
 * transport.send(envelope) 流程:
 * - 发送前检查 rate limit
 * - 筛选 envelope item
 * - 调用 options.getRequest(envelope)
 *   - 调用在 makeTransport 里定义的 getRequest：
 *     - 检查 SDK 版本
 *     - 转 ingestion events
 *     - 执行 processForPrivacy
 *     - 生成 URL + body + headers
 * - makeRequest(request)
 *   - fetch：执行 fetch
 *   - XHR：执行 XMLHttpRequest
 * - 发送完成后：
 *   - 更新 rate limits
 *   - 返回 promise(resolvedSyncPromise / rejectedSyncPromise)
 *
 * 异步 buffer 控制
 *   - transport 内部有一个 buffer(promise buffer):
 *     - 事件进入 buffer 队列
 *     - 可以控制同时发送的请求数，防止短时间大量事件压垮服务器
 *   - buffer 会在队列满、或请求失败时
 *     - 标记事件丢失(queue_overflow / network_error)
 *     - 避免 crash
 *
 * 响应处理
 *   - 事件发送成功
 *     - 更新 rate limit(X-Sentry-Rate-Limits / Retry-After)
 *     - promise resolve
 *   - 事件发送失败
 *     - 调用 recordDroppedEvent(记录丢失事件)
 *     - promise reject 或 resolve(取决于 error 类型)
 */
export function makeTransport(options: TransportOptions) {
	/**
	 * getRequest: envelope -> TransportRequest
	 *
	 * 此方法会被 createTransport() 调用
	 * 这里将 envelope 转换成自定义 ingestion payload:
	 *
	 *   { events: [...] }
	 *
	 * 而不是使用标准 Sentry envelope 格式。
	 */
	options.getRequest = (envelope: Envelope): any => {
		// 若 SDK 版本不兼容，直接丢弃事件
		if (!checkEnvelopeSentrySDKCompatibility(envelope)) {
			return false; // createTransport 会跳过发送
		}

		// envelope -> ingestionEvents
		const rawEvents = envelopeToIngestionEvents(envelope, options.sentryKitConfig);

		// 对每个事件进行隐私清理
		const events = rawEvents.map((evt) =>
			processForPrivacy(
				JSON.parse(JSON.stringify(evt)), // 深拷贝，避免污染原始事件
				options.sentryKitConfig.privacyRules
			)
		);

		// 根据 event 类型选择 topic
		const topic = events[0]._itemHeader.type === 'transaction' ? 'traces' : 'error';

		// 构造自定义 ingest API URL
		const url = createTransportUrl(
			options.sentryKitConfig.ingestUrl,
			options.sentryKitConfig.topic[topic]
		);

		// 最终送给 makeFetchTransport 或 makeXHRTransport 的 TransportRequest
		return {
			url,
			body: JSON.stringify({ events }),
			headers: {
				'Content-Type': 'application/json'
			}
		};
	};

	// 根据环境选择 fetch 或 XHR
	return supportsFetch() ? makeFetchTransport(options) : makeXHRTransport(options);
}
