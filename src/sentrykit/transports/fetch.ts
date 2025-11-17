/**
 * @fileOverview 用于创建一个“基于 Fetch API 的网络传输层（Transport）”
 * @date 2025-11-13
 * @author poohlaha
 * @description 将 Envelope 通过 fetch 发送到 Sentry 服务器，并返回带有状态码与限流头的响应给 createTransport。
 *
 * 工作流程:
 * - envelope → 序列化 → body
 * - 调用 fetch(url, { method: 'POST', body, headers })
 * - 处理响应
 * - 调用 privacy 处理
 * - 错误放入重试队列
 *
 * x-sentry-rate-limits:
 *   客户端收到后，会 阻止对应类型事件发送，直到时间过期
 *   避免短时间内大量事件压垮后端
 *   格式: <retry_after>: <categories>: <scope>
 *   如: 60:error;transaction:organization
 *       60 → 限流持续 60 秒
 *       error;transaction → 受限事件类型
 *       organization → 限流作用域（可全局或某项目）
 *
 * retry-after:
 *   告诉客户端何时可以重试请求
 *   格式:
 *       秒数: Retry-After: 120 → 2 分钟后再重试
 *       HTTP 日期: Retry-After: Wed, 21 Oct 2025 07:28:00 GMT
 */
import { getNativeFetchImplementation } from './utils';
import { createTransport, TransportOptions, TransportRequest, TransportResponse } from './base';

export function makeFetchTransport(
	options: TransportOptions,
	nativeFetch = getNativeFetchImplementation()
) {
	if (!nativeFetch) {
		throw new Error('[SentryKit] Fetch API is not available in this environment.');
	}

	async function makeRequest(request: any): Promise<TransportResponse> {
		const requestOptions: RequestInit = {
			method: request.method ?? 'POST',
			body: request.body,
			headers: request.headers,
			keepalive: true, // v8 默认允许 keepalive
			...options.fetchOptions
		};

		const response = await nativeFetch!(request.url || '', requestOptions);

		// 构建 TransportResponse 格式
		return {
			statusCode: response.status,
			headers: {
				'x-sentry-rate-limits': response.headers.get('x-sentry-rate-limits') || '',
				'retry-after': response.headers.get('retry-after') || ''
			}
		};
	}

	return createTransport(options, makeRequest);
}
