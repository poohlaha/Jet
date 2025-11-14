/**
 * @fileOverview 组装配置、默认隐私规则
 * @date 2025-11-07
 * @author poohlaha
 * @description
 */
import { SDK_VERSION } from '@sentry/browser';
import { isHeadlessBrowser } from './utils';
import { createPrivacyRulesFrom } from './privacy/settings';
import { createLogger } from './logger';
import { makeTransport } from './transport';
import { SentryKitConfig, SentryKitUserOptions } from './transports/types';
import { __SENTRY_DEBUG__, INGEST_URLS, SUPPORTED_SENTRY_VERSION } from './types';

const debug = createLogger('[SentryKit Config]');

// SentryKit 支持的环境类型
export const ENVIRONMENTS = { prod: 'prod', qa: 'qa' };

/**
 * SentryKit 的默认隐私规则。
 *
 * 说明：
 * - 删除所有 tags，除明确允许的几个性能相关 tags
 * - 删除所有 extra，除 extra.arguments
 * - 删除所有 user.xx 字段
 * - 所有 URL 查询参数统一替换为 "REMOVED"
 */
const defaultPrivacyRules: any[] = [
	// 1. 删除所有 tags.xx
	{
		type: 'any',
		matchPath: /tags\..+$/,
		action: 'remove'
	},

	// 2. 保留特定安全 tags
	{
		type: 'any',
		matchPath:
			/tags\.(http\.status_code|visibilitychange|effectiveConnectionType|connectionType|deviceMemory|hardwareConcurrency|lcp\..+)$/,
		action: 'keep'
	},

	// 3. 删除所有 extra.xxx
	{
		type: 'any',
		matchPath: /^extra\.[^.]+$/,
		action: 'remove'
	},

	// 4. 保留 extra.arguments
	{
		type: 'any',
		matchPath: /^extra\.arguments$/,
		action: 'keep'
	},

	// 5. 删除所有 user.xxx
	{
		type: 'any',
		matchPath: /^user\.[^.]+$/,
		action: 'remove'
	},

	// 6. URL 查询参数全部替换为 "REMOVED"
	{
		type: 'url-query',
		action: 'replace',
		replace: 'REMOVED'
	}
];

export interface PrivacySettings {
	allowQueryParams?: string[] | ((url: string) => string[]);
	allowExtra?: string[];
	allowTags?: string[];
	timestampPrecision?: number | 'seconds' | 'minutes';
}

// 定义中间类型: topic 可以是 string 或对象（最终会被规范化）
type SentryKitConfigIntermediate = Omit<SentryKitConfig, 'topic'> & {
	topic: string | { error: string; traces: string };
};

/**
 * 生成最终的 SentryKit Config。
 * 这是 createSentryConfig() 的核心内部逻辑。
 */
export function baseConfig(userOptions: SentryKitUserOptions): SentryKitConfig {
	// 1. 构造最终的 privacyRules
	const privacyRules =
		typeof userOptions.privacyRules === 'function'
			? userOptions.privacyRules(defaultPrivacyRules)
			: userOptions.privacyRules === false
				? []
				: [...defaultPrivacyRules, ...(userOptions.privacyRules || [])];

	// 通过 privacySettings 追加规则
	if (userOptions.privacySettings) {
		privacyRules.push(...createPrivacyRulesFrom(userOptions.privacySettings));
	}

	// 2. 组装最终 config 对象（默认值 + 用户值）
	const config = {
		transport: makeTransport,
		ingestUrl: '',
		topic: 'xp_amp_web_error_log',
		environment: 'qa',
		filterHeadless: true,
		maxBreadcrumbs: 0,
		release: undefined,
		redactKeys: undefined,
		sampleRate: undefined,
		tracesSampleRate: undefined,
		tracesSampler: undefined,
		...userOptions,

		privacyRules,
		dsn: 'https://dsn@bypass/1',
		autoSessionTracking: false,
		sendClientReports: false,
		replaysSessionSampleRate: undefined,
		replaysOnErrorSampleRate: undefined
	} as SentryKitConfigIntermediate;

	// 3. topic 若是字符串 → 转换为 {error, traces}
	if (typeof config.topic === 'string') {
		config.topic = { error: config.topic, traces: '' };
	}

	// 4. 注入 sentryKitConfig 供 transport 层使用
	config.transportOptions = {
		...config.transportOptions,
		sentryKitConfig: config as SentryKitConfig
	};

	// 5. 若用户未指定 ingestUrl → 根据 environment 自动选取
	if (!config.ingestUrl) {
		config.ingestUrl = config.environment === ENVIRONMENTS.prod ? INGEST_URLS.prod : INGEST_URLS.qa;
	}

	(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) &&
		debug(
			`Initialized with environment "${config.environment}" and ingestUrl "${config.ingestUrl}".`
		);
	(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) &&
		debug(
			config.topic.traces
				? `Tracing topic is set to "${config.topic.traces}".`
				: `No tracing topic is set.`
		);

	return config as SentryKitConfig;
}

/**
 * 为 Sentry Browser SDK 创建 beforeSend / beforeBreadcrumb 等 hooks。
 * SentryKit 用它将自己的过滤逻辑整合到 Sentry 的生命周期中。
 */
export function beforeHooksOptions(config: any) {
	//  1. 检查 SDK 版本是否与要求的版本一致
	const IS_SUPPORTED_SDK = SDK_VERSION === SUPPORTED_SENTRY_VERSION;

	// 2. 是否跳过所有事件（Headless、SDK mismatch）
	const shouldSkipEvent =
		!IS_SUPPORTED_SDK ||
		(config.environment === ENVIRONMENTS.prod && config.filterHeadless && isHeadlessBrowser());

	(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) &&
		shouldSkipEvent &&
		debug('Events and transactions will not be sent to sentry.');

	// 3. 返回最终提供给 Sentry.init 的 hooks
	return {
		beforeSend: (event: any, hint: any) => {
			if (shouldSkipEvent) return null;
			return config.beforeSend ? config.beforeSend(event, hint) : event;
		},
		beforeSendTransaction: (event: any, hint: any) => {
			if (shouldSkipEvent) return null;
			return config.beforeSendTransaction ? config.beforeSendTransaction(event, hint) : event;
		},
		beforeBreadcrumb: (breadcrumb: any, hint: any) => {
			if (breadcrumb.category === 'console') return null;
			return config.beforeBreadcrumb ? config.beforeBreadcrumb(breadcrumb, hint) : breadcrumb;
		}
	};
}
