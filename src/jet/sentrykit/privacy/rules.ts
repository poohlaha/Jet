/**
 * @fileOverview 深度脱敏引擎
 * @date 2025-11-07
 * @author poohlaha
 * @description
 */
import { createLogger } from '../logger';
import { __SENTRY_DEBUG__ } from '../types';
import { PrivacyRule, VisitContext } from './types';

const debug = createLogger('[SentryKit Privacy rules]');

/**
 * 回调函数返回值类型
 * - undefined：继续遍历
 * - "remove"：删除该字段
 */
export type VisitAction = void | 'remove';

// 回调函数类型
export type VisitCallback = (ctx: VisitContext) => VisitAction;

export type RuleType = 'url' | 'url-query' | 'timestamp' | string;

// 匹配路径时的上下文信息
export interface MatchPathFnContext {
	eventType: string;
	path: string;
	key: string;
	value: any;
}

// url-query 规则下的 matchQueryName 可用的上下文参数
export interface QueryMatchFnContext {
	eventType: string;
	path: string;
	key: string;
	url: string;
	queryName: string;
	queryValue: string;
}

// 递归访问对象并应用隐私规则。
export function visit(
	obj: Record<string, any> | any[],
	callback: VisitCallback,
	parentContext?: VisitContext
) {
	// 构建父路径前缀
	const parentPath = parentContext?.path ? parentContext.path + '.' : '';

	const _visit = (key: string): VisitAction => {
		const path = parentPath + key;
		const value = (obj as any)[key];

		const action = callback({
			obj,
			key,
			value,
			path,
			parentContext
		});

		// // 如果 callback 返回 remove，则删除该键
		if (action === 'remove') {
			return action;
		}

		// 若当前值仍是对象或数组，递归处理
		if (value !== null && typeof value === 'object') {
			visit(value, callback, {
				obj,
				key,
				value,
				path,
				parentContext
			});
		}
	};

	// 数组遍历
	if (Array.isArray(obj)) {
		for (let i = 0; i < obj.length; i++) {
			const action = _visit(i.toString());

			// 若需要删除该数组元素
			if (action === 'remove') {
				obj.splice(i, 1);
				i--;
			}
		}

		return;
	}

	for (const key in obj) {
		const action = _visit(key);
		if (action === 'remove') {
			delete obj[key];
		}
	}
}

/**
 * 判断当前字段（context）是否与隐私规则（rule）匹配。
 *
 * 匹配逻辑如下：
 * 1. 若 rule.type 类型要求字段的值类型不符（如 URL 必须是字符串），则返回 false。
 * 2. 若 rule 未指定 matchPath，则使用默认字段名判断（例如 url / timestamp）。
 * 3. 若 matchPath 是函数，则交给用户定义逻辑判断。
 * 4. 若 matchPath 是正则表达式，则用正则测试路径。
 */
export function matchesPath(rule: PrivacyRule, eventType: string, context: VisitContext): boolean {
	const value = (context.obj as any)[context.key];

	// 1. 特定 rule.type 与 value 的类型不符 → 不匹配
	if ((rule.type === 'url' || rule.type === 'url-query') && typeof value !== 'string') {
		return false;
	}

	if (rule.type === 'timestamp' && typeof value !== 'number') {
		return false;
	}

	// 2. 未定义 matchPath → 使用默认规则
	if (!rule.matchPath) {
		if (rule.type === 'url' || rule.type === 'url-query') {
			return isURLField(context);
		}
		if (rule.type === 'timestamp') {
			return isTimestampField(context);
		}

		// 其他类型默认匹配
		return true;
	}

	// 3. matchPath 是函数 → 调用并返回结果
	if (typeof rule.matchPath === 'function') {
		const ctx: MatchPathFnContext = {
			eventType,
			path: context.path,
			key: context.key,
			value: context.value
		};
		return rule.matchPath(ctx);
	}

	// 4. matchPath 是正则 → 测试路径
	return rule.matchPath.test(context.path);
}

/**
 * 判断 URL 查询参数是否匹配 url-query 隐私规则。
 * 该函数只处理 rule.type === "url-query" 的情况：
 * 1. 若规则类型不是 url-query，则直接返回 false。
 * 2. 若未指定 matchQueryName，则默认匹配所有 query 项。
 * 3. 若 matchQueryName 是函数，则调用它判断。
 * 4. 若 matchQueryName 是正则，则用正则匹配 queryName。
 */
export function matchesQuery(
	rule: PrivacyRule,
	eventType: string,
	context: VisitContext,
	queryName: string,
	queryValue: string
): boolean {
	// 1. 规则必须是 url-query 类型，其他类型不适用
	if (rule.type !== 'url-query') {
		return false;
	}

	// 2. 未提供 matchQueryName → 默认匹配所有查询参数
	if (!rule.matchQueryName) {
		return true;
	}

	// 3. matchQueryName 是函数 → 调用函数判断
	const matcher = rule.matchQueryName;
	if (typeof matcher === 'function') {
		const ctx: QueryMatchFnContext = {
			eventType,
			path: context.path,
			key: context.key,
			url: context.value,
			queryName,
			queryValue
		};

		return matcher(ctx);
	}

	// 4. matchQueryName 是正则表达式 → 测试 queryName
	return matcher.test(queryName);
}

const KnownURLFields = [
	(context: any) =>
		/^spans\.\d+\.data\.url$/.test(context.path) &&
		context.parentContext.obj.op === 'http.client' &&
		(Object.defineProperty(context.obj, '_url', {
			enumerable: false,
			value: context.value
		}) ||
			true),
	(context: any) =>
		/^spans\.\d+\.description$/.test(context.path) &&
		context.obj.op === 'http.client' &&
		context.obj.data &&
		context.obj.description ===
			`${context.obj.data.method} ${context.obj.data._url || context.obj.data.url}`,
	(context: any) =>
		/^breadcrumbs\.\d+\.data\.url$/.test(context.path) &&
		(context.parentContext.obj.category === 'fetch' ||
			context.parentContext.obj.category === 'xhr'),
	(context: any) =>
		/^breadcrumbs\.\d+\.data\.from$/.test(context.path) &&
		context.parentContext.obj.category === 'navigation',
	(context: any) =>
		/^breadcrumbs\.\d+\.data\.to$/.test(context.path) &&
		context.parentContext.obj.category === 'navigation',
	(context: any) => /^request\.url$/.test(context.path),
	(context: any) => /^request\.headers\.Referer$/.test(context.path)
];

const isURLField = (context: VisitContext) => KnownURLFields.some((test) => test(context));

const isTimestampField = (context: VisitContext) => {
	return typeof context.value === 'number' && context.path.toLowerCase().endsWith('timestamp');
};

/**
 * 对事件应用隐私规则，返回处理后的安全事件。
 * @param event ingestion event（已经拆 Envelope 后的 event[type/payload]）
 * @param rules 隐私规则数组
 */
export function processForPrivacy(event: any, rules: PrivacyRule[]): any {
	// 判定事件类型（不同类型可能触发不同规则）
	const eventType = event._itemHeader?.type === 'transaction' ? 'transaction' : 'error';

	// 深度遍历 event 所有字段
	visit(event, (context: VisitContext) => {
		const { path, key, obj } = context;

		// 遍历所有规则
		// @ts-ignore
		for (const [i, rule] of rules.entries()) {
			// 不匹配该字段 → 跳过
			if (!matchesPath(rule, eventType, context)) {
				continue;
			}

			// rule.action === keep → 跳过该字段
			if ('action' in rule && rule.action === 'keep') {
				continue;
			}

			// 1. Timestamp 规则（模糊化/替换 timestamp）
			if (rule.type === 'timestamp') {
				const timestamp = (obj as any)[key];

				// precision: number | "seconds" | "minutes" | (function)
				const timestampOrPrecision =
					typeof rule.precision === 'function'
						? rule.precision({ eventType, path, key, timestamp })
						: rule.precision;

				if (typeof timestampOrPrecision === 'number') {
					(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) &&
						timestamp !== timestampOrPrecision &&
						debug(
							`Setting timestamp to a new value of "${timestampOrPrecision}" for path: "${path}"`
						);
					(obj as any)[key] = timestampOrPrecision;
				} else if (timestampOrPrecision === 'seconds') {
					(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) &&
						debug(`Reducing timestamp to "${timestampOrPrecision}" for path: "${path}"`);
					(obj as any)[key] = Math.round(timestamp);
				} else if (timestampOrPrecision === 'minutes') {
					(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) &&
						debug(`Reducing timestamp to "${timestampOrPrecision}" for path: "${path}"`);
					(obj as any)[key] = Math.round(timestamp / 60) * 60;
				}

				continue;
			}

			// 2. URL Query 参数规则
			if (rule.type === 'url-query') {
				const url = (obj as any)[key];
				const [base, oldQuery = ''] = url.split('?');
				const queryParams = new URLSearchParams(oldQuery);
				// @ts-ignore
				const entries = [...queryParams.entries()];

				entries.forEach(([queryName, queryValue]) => {
					// 是否匹配该 query 参数
					if (!matchesQuery(rule, eventType, context, queryName, queryValue)) {
						return;
					}

					// 如果后面还有规则覆盖它，则当前规则跳过
					const hasActionAfterwards = rules
						.slice(i + 1)
						.some(
							(r) =>
								matchesPath(r, eventType, context) &&
								matchesQuery(r, eventType, context, queryName, queryValue)
						);

					if (hasActionAfterwards) {
						(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) &&
							debug(
								`Skipping the active rule as there is an overriding rule for the query "${queryName}" in the url "${url}" in path "${path}".`
							);
						return;
					}

					if (rule.action === 'remove') {
						(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) &&
							debug(
								`Removing query "${queryName}" from the url "${url}" in the path: "${path}"  (value was: "${queryValue}")`
							);
						queryParams.delete(queryName);
					} else if (rule.action === 'replace') {
						const newValue =
							typeof rule.replace === 'function'
								? rule.replace({
										key,
										path,
										url,
										queryName,
										queryValue,
										eventType
									})
								: rule.replace;

						(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) &&
							newValue !== queryValue &&
							debug(
								`Setting query "${queryName}" in the url "${url}" to a new value of "${newValue}" for path: "${path}" (value was: "${queryValue}")`
							);
						queryParams.set(queryName, newValue);
					}
				});

				const query = queryParams.toString();
				(obj as any)[key] = base + (query ? `?${query}` : '');

				continue;
			}

			// 3. URL 规则（处理整个 URL）
			if (rule.type === 'url') {
				const hasActionAfterwards = rules
					.slice(i + 1)
					.some((r) => matchesPath(r, eventType, context) && r.type === 'url');

				if (hasActionAfterwards) {
					(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) &&
						debug(
							`Skipping the active rule as there is an overriding rule for the url "${(obj as any)[key]}" in path "${path}".`
						);
					continue;
				}

				if (rule.action === 'remove') {
					(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) &&
						debug(`Removing the url "${(obj as any)[key]}" in the path: "${path}"`);
					return 'remove';
				} else if (rule.action === 'replace') {
					const newValue =
						typeof rule.replace === 'function'
							? rule.replace({
									key,
									path,
									url: (obj as any)[key],
									eventType
								})
							: rule.replace;
					(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) &&
						newValue !== (obj as any)[key] &&
						debug(
							`Setting the url"${(obj as any)[key]}" to a new value of "${newValue}" for path: "${path}" (value was: "${(obj as any)[key]}")`
						);
					(obj as any)[key] = newValue;
				}

				continue;
			}

			// 4. Any 规则（针对任意字段）
			if (rule.type === 'any' && 'action' in rule) {
				const hasActionAfterwards = rules
					.slice(i + 1)
					.some((r) => matchesPath(r, eventType, context) && r.type === 'any');

				if (hasActionAfterwards) {
					(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) &&
						debug(
							`Skipping the active rule as there is an overriding rule for the path "${path}".`
						);
					continue;
				}

				if (rule.action === 'remove') {
					(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) &&
						debug(`Removing the path "${path}" (value was: "${(obj as any)[key]}")`);
					return 'remove';
				} else if (rule.action === 'replace') {
					const newValue =
						typeof rule.replace === 'function'
							? rule.replace({
									key,
									path,
									value: (obj as any)[key],
									eventType
								})
							: rule.replace;
					(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) &&
						newValue !== (obj as any)[key] &&
						debug(
							`Setting a new value of "${newValue}" for path: "${path}" (value was: "${(obj as any)[key]}")`
						);
					(obj as any)[key] = newValue;
				}
			}
		}
	});

	return event;
}
