/**
 * @fileOverview 组装配置、默认隐私规则
 * @date 2025-11-07
 * @author poohlaha
 * @description
 * - 合并用户配置与默认配置
 * - 应用隐私设置
 * - 应用 transport 相关设置
 * - 决定 “是否启用 fetch？是否启用 XHR？”
 */
import { SDK_VERSION } from '@sentry/browser';
import { isHeadlessBrowser } from './utils';
import { createPrivacyRulesFrom } from './privacy/settings';
import { createLogger } from './logger';
import { makeTransport } from './transports';
import { SentryKitConfig, SentryKitUserOptions } from './transports/types';
import {
	__SENTRY_DEBUG__,
	DEFAULT_DSN,
	DEFAULT_ENVIRONMENT,
	DEFAULT_TOPIC,
	INGEST_URLS,
	SUPPORTED_SENTRY_VERSION
} from './types';

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
 * 根据用户配置, 生成最终的 SentryKit Config。
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
		topic: DEFAULT_TOPIC,
		environment: DEFAULT_ENVIRONMENT,
		filterHeadless: true,
		maxBreadcrumbs: 0,
		release: undefined,
		redactKeys: undefined,
		sampleRate: undefined,
		tracesSampleRate: undefined,
		tracesSampler: undefined,
		...userOptions,

		privacyRules,
		dsn: DEFAULT_DSN,
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
 * 这些 hooks 会被 注入到 Sentry.init() 的 options 中，作为事件发送前的拦截器
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
		// 在一个 error event（普通事件/异常）完成构造并准备要上报到 transport 之前调用, v
		// event：将要上报的事件对象（可以直接修改它或返回一个新对象）
		// hint：上下文信息（通常包含原始 exception、syntheticException、request info 等——SDK 内部会在构造事件时填充一些额外上下文）
		beforeSend: (event: any, hint: any) => {
			if (shouldSkipEvent) return null;
			return config.beforeSend ? config.beforeSend(event, hint) : event;
		},

		// 在一个 transaction/trace event（性能追踪事务）构建并准备上报之前调用, 可返回 Promise
		// 语义、行为与 beforeSend 类似，但针对 trace 类型事件
		// event：transaction 事件对象（包含 spans、transaction name、contexts、measurements 等）
		// hint：上下文（可能包含 trace context、原始数据等）
		beforeSendTransaction: (event: any, hint: any) => {
			if (shouldSkipEvent) return null;
			return config.beforeSendTransaction ? config.beforeSendTransaction(event, hint) : event;
		},

		// 每次 SDK 拦截到一条 breadcrumb（例如：网络请求、console、navigation、user action）准备加入当前事件/会话的 breadcrumbs 列表时调用, 同步
		// 与上面两个不同: 它发生在“事件构造早期”，用于决定是否把这条 breadcrumb 记录下来
		// breadcrumb：要加入的 breadcrumb 对象（通常含 category, message, level, data 等）
		// hint：额外上下文（例如原始 console args、xhr info 等）
		beforeBreadcrumb: (breadcrumb: any, hint: any) => {
			if (breadcrumb.category === 'console') return null;
			return config.beforeBreadcrumb ? config.beforeBreadcrumb(breadcrumb, hint) : breadcrumb;
		}
	};
}
