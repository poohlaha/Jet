/**
 * @fileOverview 隐私开关、选项、策略
 * @date 2025-11-07
 * @author poohlaha
 * @description 提供 `隐私规则的配置入口`
 * - 是否启用 URL 参数过滤？
 * - 是否采集完整 URL？还是仅域名？
 * - 是否上传 request body？
 * - 是否启用字段白名单模式？
 */
import { createLogger } from '../logger';
import { __SENTRY_DEBUG__ } from '../types';
import { PrivacyRule } from './types';
const debug = createLogger('[SentryKit Privacy settings]');

/**
 * 从用户提供的隐私配置构造隐私规则数组（PrivacyRule[]）
 *
 * @param allowQueryParams - 允许保留的 URL 查询参数
 * @param allowExtra - 允许保留的 extra.xxx 字段
 * @param allowTags - 允许保留的 tags.xxx 字段
 * @param timestampPrecision - 时间戳模糊化规则
 */
export function createPrivacyRulesFrom({
	allowQueryParams,
	allowExtra,
	allowTags,
	timestampPrecision
}: {
	allowQueryParams?: string[] | ((url: string) => string[]);
	allowExtra?: string[];
	allowTags?: string[];
	timestampPrecision?: number | 'seconds' | 'minutes';
}): PrivacyRule[] {
	const privacyRules: PrivacyRule[] = [];

	// 1. 允许保留 tags.xxx
	if (allowTags?.length) {
		privacyRules.push({
			type: 'any',
			matchPath: ({ path, key }: any) => {
				const shouldKeep = path === `tags.${key}` && allowTags.includes(key);
				(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) &&
					shouldKeep &&
					debug(`Keeping the tag "${key}" for path: "${path}"`);
				return shouldKeep;
			},
			action: 'keep'
		});
	}

	// 2. 允许保留 extra.xxx
	if (allowExtra?.length) {
		privacyRules.push({
			type: 'any',
			matchPath: ({ path, key }: any) => {
				const shouldKeep = path === `extra.${key}` && allowExtra.includes(key);
				(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) &&
					shouldKeep &&
					debug(`Keeping the extra "${key}" for path: "${path}"`);
				return shouldKeep;
			},
			action: 'keep'
		});
	}

	// 3. 允许保留特定 URL 查询参数
	if (allowQueryParams) {
		privacyRules.push({
			type: 'url-query',
			matchQueryName: ({ url, queryName, path }: any) => {
				const params =
					typeof allowQueryParams === 'function' ? allowQueryParams(url) : allowQueryParams;
				const shouldKeep = params.includes(queryName);
				(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) &&
					shouldKeep &&
					debug(`Keeping the query name "${queryName}" for path: "${path}"`);
				return shouldKeep;
			},
			action: 'keep'
		});
	}

	// 4. 时间戳模糊化规则
	// error → 应用 timestampPrecision
	// transaction → 不处理
	if (timestampPrecision) {
		privacyRules.push({
			type: 'timestamp',
			precision: ({ eventType, timestamp, path }) => {
				if (eventType === 'error') {
					(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) &&
						debug(`Reducing timestamp to "${timestampPrecision}" for path: "${path}"`);
					return timestampPrecision;
				}
				return timestamp;
			}
		});
	}

	return privacyRules;
}
