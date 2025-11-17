/**
 * @fileOverview XMLHttpRequest 实现
 * @date 2025-11-13
 * @author poohlaha
 * @description 提供 fetch 的替代版本
 * - 某些系统环境没有 fetch
 * - 某些 CSP 限制 fetch
 * - 内部框架可能需要 sync XHR
 */
import { createTransport, TransportOptions, TransportRequest, TransportResponse } from './base';

const XHR_READYSTATE_DONE = 4;

export function makeXHRTransport(options: TransportOptions) {
	function makeRequest(request: TransportRequest): Promise<TransportResponse> {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.onerror = reject;
			xhr.onreadystatechange = () => {
				if (xhr.readyState === XHR_READYSTATE_DONE) {
					resolve({
						statusCode: xhr.status,
						headers: {
							'x-sentry-rate-limits': xhr.getResponseHeader('X-Sentry-Rate-Limits') || '',
							'retry-after': xhr.getResponseHeader('Retry-After') || ''
						}
					});
				}
			};

			xhr.open('POST', request.url || '');
			for (const header in request.headers) {
				if (Object.prototype.hasOwnProperty.call(request.headers, header)) {
					xhr.setRequestHeader(header, request.headers[header]);
				}
			}

			xhr.send(request.body as any);
		});
	}

	return createTransport(options, makeRequest);
}
