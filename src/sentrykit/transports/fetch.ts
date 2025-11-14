/**
 * @fileOverview 用于创建一个“基于 Fetch API 的网络传输层（Transport）”
 * @date 2025-11-13
 * @author poohlaha
 * @description 将 Envelope 通过 fetch 发送到 Sentry 服务器，并返回带有状态码与限流头的响应给 createTransport。
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
