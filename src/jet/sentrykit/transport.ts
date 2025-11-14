/**
 * @fileOverview
 * @date 2025-11-07
 * @author poohlaha
 * @description
 */
import { processForPrivacy } from './privacy/rules';
import { Envelope, supportsFetch } from '@sentry/core';
import { checkEnvelopeSentrySDKCompatibility } from './utils';
import { envelopeToIngestionEvents } from './ingestion-event';
import { makeFetchTransport } from './transports/fetch';
import { makeXHRTransport } from './transports/xhr';
import { TransportOptions, TransportRequest } from './transports/base';

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
 * 生成 SentryKit 专用 Transport。
 * 它会覆盖 options.getRequest，使 createTransport() 能正确构造 Request。
 */
export function makeTransport(options: TransportOptions) {
	/**
	 * getRequest: envelope -> TransportRequest
	 *
	 * 此方法会被 createTransport() 调用
	 * 这里将 envelope 转换成自定义 ingestion payload：
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
