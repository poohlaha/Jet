/**
 * @fileOverview 类型定义
 * @date 2025-11-07
 * @author poohlaha
 * @description
 */

// 访问上下文（当前节点的信息）
export interface VisitContext {
	// 当前所在对象
	obj: Record<string, any>;

	// 当前处理的字段 key(数组使用字符串索引)
	key: string;

	// 当前字段的值
	value: any;

	// 字段完整路径（如 "user.email" 或 "exception.0.stacktrace"）
	path: string;

	// 父级上下文
	parentContext?: VisitContext;
}

/* -------------------------------------------------------------------------- */
/*                             ANY 类型的规则                                  */
/* -------------------------------------------------------------------------- */

/**
 * 针对任意字段路径的匹配规则
 */
export interface AnyRuleBase {
	type: 'any';
	matchPath?: RegExp | ((ctx: { path: string; key: string; value: any }) => boolean);
}

/**
 * any + action = keep / remove / replace
 */
export interface AnyKeepRule extends AnyRuleBase {
	action: 'keep';
}

export interface AnyRemoveRule extends AnyRuleBase {
	action: 'remove';
}

export interface AnyReplaceRule extends AnyRuleBase {
	action: 'replace';
	replace:
		| string
		| number
		| boolean
		| null
		| object
		| ((ctx: { path: string; key: string; value: any }) => any);
}

/* -------------------------------------------------------------------------- */
/*                            TIMESTAMP 类型规则                               */
/* -------------------------------------------------------------------------- */

export interface TimestampRule {
	type: 'timestamp';
	matchPath?: RegExp | ((ctx: { path: string; key: string; value: any }) => boolean);
	precision:
		| number
		| 'seconds'
		| 'minutes'
		| ((ctx: {
				eventType: string;
				path: string;
				key: string;
				timestamp: number;
		  }) => number | 'seconds' | 'minutes');
}

/* -------------------------------------------------------------------------- */
/*                           URL 类型规则（整体 URL）                           */
/* -------------------------------------------------------------------------- */

export interface UrlRuleBase {
	type: 'url';
	matchPath?: RegExp | ((ctx: { path: string; key: string; value: string }) => boolean);
}

export interface UrlRemoveRule extends UrlRuleBase {
	action: 'remove';
}

export interface UrlReplaceRule extends UrlRuleBase {
	action: 'replace';
	replace:
		| string
		| ((ctx: { path: string; key: string; url: string; eventType: string }) => string);
}

/* -------------------------------------------------------------------------- */
/*                      URL-QUERY 类型（针对查询参数）                          */
/* -------------------------------------------------------------------------- */

export interface UrlQueryRule {
	type: 'url-query';
	matchPath?: RegExp | ((ctx: { path: string; key: string; value: string }) => boolean);
	matchQueryName?:
		| RegExp
		| ((ctx: {
				url: string;
				queryName: string;
				queryValue: string;
				path: string;
				key: string;
				eventType: string;
		  }) => boolean);

	action: 'keep' | 'remove' | 'replace';
	replace?:
		| string
		| ((ctx: {
				key: string;
				path: string;
				url: string;
				queryName: string;
				queryValue: string;
				eventType: string;
		  }) => string);
}

/* -------------------------------------------------------------------------- */
/*                               PrivacyRule 联合类型                           */
/* -------------------------------------------------------------------------- */

export type PrivacyRule =
	| AnyKeepRule
	| AnyRemoveRule
	| AnyReplaceRule
	| UrlRuleBase
	| UrlRemoveRule
	| UrlReplaceRule
	| UrlQueryRule
	| TimestampRule;
