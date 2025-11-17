/**
 * @fileOverview SentryKit 入口
 * @date 2025-11-07
 * @author poohlaha
 * @description
 */
import {
	checkSentrySDKCompatibility,
	monitorSentryHubBindClient,
	monitorSentryConfig
} from './utils';
import { enableLogger } from './logger';
import { baseConfig, beforeHooksOptions } from './config';
import { __SENTRY_DEBUG__ } from './types';
import type { SentryKitUserOptions } from './transports/types';

/**
 * 1. 检查 SDK 版本是否兼容（与 SUPPORTED_SENTRY_VERSION 对比）
 * 2. 监听 hub.bindClient（用于校验 createSentryConfig 的使用）
 */
checkSentrySDKCompatibility();
(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) && monitorSentryHubBindClient();

/**
 * 创建 SentryKit 的完整配置对象（提供给 Sentry.init）
 *
 * - 合并默认配置（baseConfig）
 * - 注入 beforeSend / beforeBreadcrumb / beforeSendTransaction
 * - 校验 project / tracesTopic / tracesSampling
 * - 校验配置来源是否合法
 */

export function createSentryConfig(userOptions: SentryKitUserOptions) {
	// 1. 用户启用 debug 时，打开内部日志
	if ((typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) && userOptions.debug) {
		enableLogger();
	}

	// 2. 构造最终配置（默认值 + 用户配置 + 隐私规则）
	const config = baseConfig(userOptions || {});
	if (!config.project) {
		throw new Error('[SentryKit Configuration Error]: The required `project` field is not set.');
	}

	// 3. trace 配置完整性检查
	// 双向一致性校验: 开启 trace(性能监控), 那必须配置 trace 的 topic; 如果配置了 trace 的 topic，那必须开启 trace
	const hasTracesConfig = config.tracesSampleRate || config.tracesSampler;
	const hasTracesTopic = config.topic.traces;
	if (hasTracesConfig && !hasTracesTopic) {
		throw new Error(
			'[SentryKit Configuration Error]: The `topic.traces` field is not set while trace sampling is configured.'
		);
	}

	if (hasTracesTopic && !hasTracesConfig) {
		throw new Error(
			'[SentryKit Configuration Error]: Trace sampling is configured but `topic.traces` is not set.'
		);
	}

	// 4. 注入 hooks → beforeSend / beforeBreadcrumb / beforeSendTransaction
	const originalConfig = { ...config, ...beforeHooksOptions(config) };

	// 5. 监控配置，确保用户没有绕过 createSentryConfig
	if (typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) {
		monitorSentryConfig(originalConfig);
	}

	// 6. 返回给 Sentry.init() 使用的完整配置
	return originalConfig;
}

export const SentryKit = {
	createSentryConfig
};

export type { SentryKitUserOptions };
export default SentryKit;
