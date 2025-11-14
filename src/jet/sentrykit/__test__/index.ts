/**
 * 测试
 */
import * as Sentry from '@sentry/browser';
import { createSentryConfig } from '../index';

/**
 * {
 *   type: "event",
 *   exception: { ... },
 *   breadcrumbs: [ ... ],
 *   request: { url },
 *   tags: { ... },
 *   extra: { ... },
 *   contexts: { ... },
 * }
 */
function injectTestFields(event: { [K: string]: any } = {}) {
	// 1) URL / URL-QUERY 测试字段
	// https://example.com/profile?token=REMOVED&password=REMOVED&foo=REMOVED
	event.request = {
		url: 'https://example.com/profile?token=123&password=abc&foo=bar'
	};

	// 2) breadcrumbs URL 测试
	event.breadcrumbs = [
		{
			category: 'fetch',
			data: {
				url: 'https://api.test.com/data?id=99&secret=hidden' // https://api.test.com/data?id=REMOVED&secret=REMOVED
			}
		},
		{
			category: 'navigation',
			data: {
				from: 'https://old.com?a=1&b=2', // https://old.com?a=REMOVED&b=REMOVED
				to: 'https://new.com?x=9&y=8' // https://new.com?x=REMOVED&y=REMOVED
			}
		}
	];

	// 3) spans URL 测试
	event.spans = [
		{
			op: 'http.client',
			description: 'GET https://api.test.com/user?password=visible', // https://api.test.com/user?password=REMOVED
			data: {
				method: 'GET',
				url: 'https://api.test.com/user?password=visible' // https://api.test.com/user?password=REMOVED
			}
		}
	];

	// 4) timestamp 测试
	event.timestamp = Date.now() / 1000;
	event.start_timestamp = Date.now() / 1000;
	event.end_timestamp = Date.now() / 1000 + 1;

	// 5) contexts 测试
	event.contexts = {
		user: {
			id: '123',
			email: 'xx@xx.com',
			auth: 'secret'
		}
	};

	// 6) extra 测试
	event.extra = {
		password: 'abc123',
		secretKey: 'super-secret',
		deep: {
			inside: {
				token: '123456'
			}
		},
		arguments: [
			...(event.extra?.arguments ?? []), // 不写这句就覆盖 captureException 中的同名元素
			{
				safeField1: 'ok',
				removeMe: 'bad'
			}
		]
	};

	// 7) tags 测试
	event.tags = {
		userAgent: 'Chrome',
		visibilitychange: 'keep_me',
		session_id: '123456'
	};

	return event;
}

/**
 * {
 *    type: "transaction",
 *    transaction: "route",
 *    start_timestamp,
 *    timestamp,
 *    contexts: { trace: {...} },
 *    spans: [{...}, {...}],
 * }
 */
function injectTestFieldsForTransaction(tx: { [K: string]: any } = {}) {
	// 添加 spans 测试 URL
	tx.spans = [
		{
			description: 'GET https://api.test.com/user?token=123&secret=abc',
			op: 'http.client',
			data: {
				method: 'GET',
				url: 'https://api.test.com/user?token=123&secret=abc'
			},
			start_timestamp: tx.start_timestamp,
			timestamp: tx.timestamp
		},
		{
			description: 'POST https://upload.com/file?id=888&key=xyz',
			op: 'http.client',
			data: {
				method: 'POST',
				url: 'https://upload.com/file?id=888&key=xyz'
			},
			start_timestamp: tx.start_timestamp + 0.1,
			timestamp: tx.timestamp + 0.2
		}
	];

	// 添加 contexts 测试
	tx.contexts = {
		...tx.contexts,
		device: {
			id: 'device-123',
			secret: 'xxx'
		}
	};

	// 添加 extra 测试（transaction 中 extra 放在 contexts.app 或 extra 下都可以）
	tx.extra = {
		perfSecret: 'should_remove',
		perfKey: 'should_remove'
	};

	return tx;
}

export default function () {
	// 1. 测试 Transport（fetch/xhr）
	// makeTransport → getRequest 正常
	// envelopeToIngestionEvents 正常
	// processForPrivacy 正常
	// makeFetchTransport 正常
	globalThis.fetch = async (url, req) => {
		console.log('%c[SentryKit] FETCH FETCH →', 'color: green;', url);
		console.log('%c[SentryKit] BODY →', 'color: green;', JSON.parse(req?.body as string));

		return new Response(null, {
			status: 200,
			headers: {
				'X-Sentry-Rate-Limits': '',
				'Retry-After': ''
			}
		});
	};

	// 激活 transaction API
	Sentry.addTracingExtensions();

	// 2. 初始化
	// baseConfig 工作正常
	// debug logger 正常
	// environment 逻辑正常
	Sentry.init(
		createSentryConfig({
			project: 'your-test-project',
			environment: 'qa',
			debug: true,
			beforeBreadcrumb(breadcrumb, hint) {
				console.log('%c[SentryKit] beforeBreadcrumb →', 'color: blue;', breadcrumb);

				// 删除所有 fetch breadcrumb
				if (breadcrumb.category === 'fetch') {
					return null;
				}

				// URL 脱敏
				if (breadcrumb.data?.url) {
					breadcrumb.data.url = breadcrumb.data.url.replace(/\?.*$/, '?REDACTED');
				}

				return breadcrumb;
			},
			beforeSend(event) {
				console.log('%c[SentryKit] beforeSend HIT →', 'color: blue;', event);
				return injectTestFields(event);
			},
			beforeSendTransaction(transaction) {
				console.log('%c[SentryKit] beforeSendTransaction HIT →', 'color: blue;', transaction);
				return injectTestFieldsForTransaction(transaction);
			}
		})
	);

	console.log('%c[SentryKit] %cinit done !', 'color: green;', 'color: magenta;');

	// 3. 验证 SentryKit 是否成功 hook init (monitorSentryHubBindClient)
	Sentry.captureMessage('SentryKit basic transport test');

	// 4. Privacy Rules 测试
	// 删除所有 tags
	// 保留 visibilitychange
	// 删除 extra.*
	// 保留 extra.arguments
	Sentry.captureException(new Error('Test privacy'), {
		extra: {
			password: 'abc123',
			arguments: [
				{
					safeField2: 'ok'
				}
			]
		},
		tags: {
			userAgent: 'TEST',
			visibilitychange: 'keep_me'
		}
	});

	// 5. 验证 Sentry 官方行为是否保持一致
	// 5.2 beforeBreadcrumb
	// 不会出现在最终事件 → 正确, 因为 SentryKit 默认会过滤 console breadcrumb。
	Sentry.addBreadcrumb({ category: 'console', message: 'should remove' });

	// 5.3 beforeSendTransaction
	// 查看 fetch body 是否出现 "type": "transaction"。
	Sentry.startTransaction({
		name: 'test',
		op: 'custom',
		metadata: {
			source: 'custom'
		}
	}).finish();

	console.log('--------------------- Batch Tests Start ---------------------');
	Sentry.captureMessage('msg');
	Sentry.captureException(new Error('err'));
	Sentry.startTransaction({ name: 'tx' }).finish();
	Sentry.captureMessage('rules test', { tags: { secret: 'a' }, extra: { password: 'b' } });
	Sentry.addBreadcrumb({ category: 'manual', message: 'hello' });
	console.error('console test');
	history.pushState({}, '', '/test');
	Sentry.setUser({ id: 'u1', email: 'xxx@xx.com' });
	Sentry.captureException(new Error('user test'));
	console.log('--------------------- Batch Tests End ---------------------');
}
