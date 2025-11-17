/**
 * @fileOverview 类型
 * @date 2025-11-13
 * @author poohlaha
 * @description
 */
import { PrivacyRule } from '../privacy/types';
import { TransportOptions } from './base';
import { PrivacySettings } from '../config';

export interface SentryKitUserOptions {
	// 用户必须提供，用于标识项目
	project: string;

	// SDK 版本/头部信息调试模式(如果 true 则启用内部 logger)
	debug?: boolean;

	// 运行环境(prod | qa)
	environment?: 'prod' | 'qa';

	// 用户可自定义 ingestUrl(否则自动选择内置)
	ingestUrl?: string;

	// topic: 错误和事务上传的分类
	topic?: string | { error: string; traces: string };

	// 隐私相关的快捷设置(如 allowQueryParams 等)
	privacySettings?: PrivacySettings;

	/**
	 * 直接自定义隐私规则。
	 * - false → 完全禁用隐私过滤（不推荐）
	 * - 数组 → 用户追加的规则
	 * - function(defaults) → 替换默认规则
	 */
	privacyRules?: false | PrivacyRule[] | ((defaults: PrivacyRule[]) => PrivacyRule[]);

	// 是否在 prod 环境过滤 headless browser(默认 true)
	filterHeadless?: boolean;

	// Sentry SDK 的 maxBreadcrumbs(默认 0)
	maxBreadcrumbs?: number;

	// 版本信息(写入 event.release)
	release?: string;

	redactKeys?: string[];
	sampleRate?: number;
	tracesSampleRate?: number;
	tracesSampler?: (ctx: any) => number;

	// 下传给 transport 的额外配置
	transportOptions?: Partial<TransportOptions>;

	// 自定义用户级 hooks
	// Error Events
	// 数据脱敏、添加或修改 error.extra、删除不需要的 tags、覆盖 request.url、过滤某类错误不发送
	beforeSend?: (event: any, hint: any) => any | null;

	// Transaction Events
	// 修改 span、删除某些 Http spans、给 transaction 添加标记、删除敏感 trace 数据
	beforeSendTransaction?: (event: any, hint: any) => any | null;

	// 在 Breadcrumb 被加入 event 之前，对每一个 breadcrumb 进行过滤、修改、脱敏的 Hook
	beforeBreadcrumb?: (breadcrumb: any, hint: any) => any | null;
}

export interface SentryKitConfig extends SentryKitUserOptions {
	// 明确环境为 prod | qa(此时已确定)
	environment: 'prod' | 'qa';

	// SDK 把事件上传到服务器的 URL
	ingestUrl: string;

	// 完整隐私规则（经过合并与生成）
	privacyRules: PrivacyRule[];

	// 事件所属的分类, 发送到后端时使用的 Kafka Topic/日志 Topic 名字, 强制转化为对象形式
	topic: { error: string; traces: string };

	// Transport 函数(makeTransport)
	transport: any;

	// 固定为 "https://dsn@bypass/1"
	dsn: string;

	// 禁用 session tracking
	autoSessionTracking: false;

	// 禁用 client reports
	sendClientReports: false;

	// replay 相关字段(SentryKit 不使用)
	replaysSessionSampleRate: any;
	replaysOnErrorSampleRate: any;

	// transportOptions 必须包含 sentryKitConfig 本身
	transportOptions?: Partial<TransportOptions> & {
		sentryKitConfig: SentryKitConfig;
	};
}
