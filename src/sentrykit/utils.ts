/**
 * @fileOverview SDK 版本校验与配置防改保护
 * @date 2025-11-07
 * @author poohlaha
 * @description
 */
import { getCurrentHub, SDK_VERSION } from '@sentry/browser';
import { SUPPORTED_SENTRY_VERSION } from './types';
import { Envelope, SdkInfo } from '@sentry/core';

export interface SentryKitExtendedConfig {
	__sentrykit_original_config?: Record<string, any>; // 原始配置备份
	_metadata?: {
		sdk?: SdkInfo;
	};
	[key: string]: any;
}

/**
 * 检测是否为 headless 浏览器环境
 *
 * 用途:
 * - SentryKit 判断是否运行在自动化环境、爬虫环境
 * - Headless 环境中可能需要限制某些行为（用来过滤无意义的事件）
 */
export function isHeadlessBrowser(): boolean {
	const n = navigator;

	return (
		n.userAgent === undefined ||
		n.appVersion === undefined ||
		n.plugins === undefined ||
		n.languages === undefined ||
		n.languages.length === 0 ||
		n.language === '' ||
		n.webdriver ||
		n.plugins.length === 0 ||
		/HeadlessChrome/.test(n.userAgent) ||
		/headless/i.test(n.appVersion)
	);
}

// 构造版本不匹配的错误提示。
function versionMismatchErrorMessage(sdkVersion?: string): string {
	sdkVersion || (sdkVersion = 'unknown');
	return `[SentryKit] Version mismatch between the installed Sentry SDK version (${sdkVersion}) and supported SDK version (${SUPPORTED_SENTRY_VERSION}) by SentryKit. Make sure to use supported version of the Sentry SDK (${SUPPORTED_SENTRY_VERSION}).`;
}

// 检查指定版本是否与 SentryKit 兼容
export function checkSentryKitIsCompatibleWith(sdkVersion?: string): boolean {
	if (sdkVersion !== SUPPORTED_SENTRY_VERSION) {
		console.error(
			`[SentryKit Versioning Error] ${versionMismatchErrorMessage(
				sdkVersion
			)} All sent data will be discarded.`
		);

		return false;
	}

	return true;
}

// 检查当前使用的 @sentry/browser SDK 是否与 SentryKit 匹配。
export function checkSentrySDKCompatibility() {
	return checkSentryKitIsCompatibleWith(SDK_VERSION);
}

// 检查 Envelope 中记录的 Sentry SDK 版本是否一致。
export function checkEnvelopeSentrySDKCompatibility(envelope: Envelope) {
	const [envelopeHeader, items] = envelope;
	return checkSentryKitIsCompatibleWith(envelopeHeader.sdk?.version);
}

// 正确使用 SentryKit 的指引文案
const correctSetupGuide = `The correct way to use SentryKit is as follows:

import {createSentryConfig} from 'sentrykit'

Sentry.init(createSentryConfig({
  // all your configs
}))`;

// 将用户提供的 config 保存一份副本，用于后续校验“配置是否被意外修改”。
export function monitorSentryConfig(config: SentryKitExtendedConfig): SentryKitExtendedConfig {
	// 存储一份原始配置，用于确保初始化后不被修改
	config.__sentrykit_original_config = { ...config };
	return config;
}

// Hook 住 hub.bindClient，使得每次绑定 client 时都检查 SentryKit 配置是否正确(生产环境需要关闭, 防止性能损耗)
export function monitorSentryHubBindClient() {
	const hub = getCurrentHub();
	const originalBindClient = hub.bindClient;

	hub.bindClient = (client: any) => {
		assertCorrectSentryKitConfiguration(client.getOptions());
		originalBindClient.call(hub, client);
	};
}

/**
 * 校验 SentryKit 的初始化配置是否正确
 *
 * 要求:
 * 1. 使用 createSentryConfig 创建配置
 * 2. 初始化后不可修改除 integrations 外的字段
 * 3. SDK version 必须匹配 SUPPORTED_SENTRY_VERSION
 */
export function assertCorrectSentryKitConfiguration(config: SentryKitExtendedConfig) {
	const sdkVersion = config._metadata?.sdk?.version;
	if (sdkVersion !== SUPPORTED_SENTRY_VERSION) {
		throw new Error(`[SentryKit Initialization Error] ${versionMismatchErrorMessage(sdkVersion)}`);
	}

	const originalConfig = (config as any).__sentrykit_original_config;
	if (!originalConfig) {
		throw new Error(
			`[SentryKit Initialization Error] Configuration has to be generated through \`createSentryConfig\` function. ${correctSetupGuide}`
		);
	}

	for (const key in originalConfig) {
		if (key === 'integrations') {
			continue;
		}

		if (originalConfig[key] !== config[key]) {
			throw new Error(
				`[SentryKit Initialization Error] Configuration generated through \`createSentryConfig\` function has been changed. ${correctSetupGuide}`
			);
		}
	}
}
