/**
 * @fileOverview Envelope → ingestion events 转换
 * @date 2025-11-13
 * @author poohlaha
 * @description ingestion events 是最终上报给服务器的实际数据形式
 */
import { Envelope, EnvelopeItem } from '@sentry/core';

export function envelopeToIngestionEvents(envelope: Envelope, options: any) {
	const [_envelopeHeader, items] = envelope;

	// Ingest API 不需要 dsn 字段，必须删除
	delete _envelopeHeader.dsn;

	// 各个事件都共享的字段
	const sharedFields = {
		_envelopeHeader,
		project: options.project,
		v: 4 // Sentry ingest 协议版本
	};

	// 遍历 envelope 内的每个 item
	return items.map((item: EnvelopeItem) => {
		const [itemHeader, payload] = item;
		const itemType = itemHeader.type;

		// 1. 不支持的 item 类别(如 session、replay、attachment 等), 这里只提取 事件和事务
		// Event: 普通错误或日志(JS 报错、捕获的异常、console.error 等), 上报到 error topic
		// Transaction: 性能追踪或用户操作流程(页面加载时间、接口耗时、事务链路), 上报到 traces topic
		if (itemType !== 'event' && itemType !== 'transaction') {
			return {
				...sharedFields,
				_itemHeader: itemHeader,
				_debugLogs: [`Items of type "${itemType}" are not supported yet. Dropped the item.`]
			};
		}

		// 2. 事件类型（event 或 transaction）
		// 将 payload 展开并与 sharedFields 合并
		return {
			...sharedFields,
			_itemHeader: itemHeader,
			...(payload as Record<string, any>)
		};
	});
}
