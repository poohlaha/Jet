/**
 * @fileOverview 类型
 * @date 2025-11-13
 * @author poohlaha
 * @description
 */
export const __SENTRY_DEBUG__ = true;

/**
 * SentryKit 当前支持的官方 Sentry Browser SDK 版本。
 * 若用户的 @sentry/browser 版本不一致：事件会被丢弃。
 */
export const SUPPORTED_SENTRY_VERSION = '7.57.0';

// XP(Experience Platform)上报服务的地址
export const INGEST_URLS = { prod: 'https://xp.apple.com', qa: 'https://xp-qa.apple.com' };

// 默认 DSN
export const DEFAULT_DSN = 'https://dsn@bypass/1'

// 默认 Topic
export const DEFAULT_TOPIC = 'xp_amp_web_error_log'

// 默认 environment
export const DEFAULT_ENVIRONMENT = 'qa'