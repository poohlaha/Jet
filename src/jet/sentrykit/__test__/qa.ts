import * as Sentry from '@sentry/browser';

globalThis.fetch = async (url, req) => {
	console.log('[SentryKit] FETCH FETCH →', url);
	console.log('[SentryKit] BODY →', req && req?.body && JSON.parse(req?.body as string));

	return new Response(null, {
		status: 200,
		headers: {
			'X-Sentry-Rate-Limits': '',
			'Retry-After': ''
		}
	});
};

(function mockXHR() {
	const OriginalXHR = window.XMLHttpRequest;

	function MockXHR() {
		// @ts-ignore
		this.readyState = 4;
		// @ts-ignore
		this.status = 200;
	}

	MockXHR.prototype.open = function (method: string, url: string) {
		console.log('%c[MOCK XHR OPEN]', 'color: orange;', method, url);
		this._url = url;
	};

	MockXHR.prototype.send = function () {
		console.log('%c[MOCK XHR SEND]', 'color: orange;', this._url);

		// *** 关键：调用 onreadystatechange 触发 Sentry 的 XHR Breadcrumb ***
		if (this.onreadystatechange) {
			this.onreadystatechange();
		}

		// *** 关键：调用 onload 触发完成状态 ***
		if (this.onload) {
			this.onload();
		}
	};

	// @ts-ignore
	window.XMLHttpRequest = MockXHR;
})();

export async function runSentryKitQATest() {
	console.log('%c=== SentryKit QA TEST START ===', 'color: green; font-size: 14px;');

	// 1. 触发自动 fetch breadcrumb
	console.log('%c[TEST] Trigger fetch breadcrumb', 'color: blue;');
	await fetch('https://api.test.com/data?id=99&secret=hidden');

	// 2. 触发 XHR breadcrumb
	console.log('%c[TEST] Trigger XHR breadcrumb', 'color: blue;');
	const xhr = new XMLHttpRequest();
	xhr.open('GET', 'https://api.test.com/user?password=visible', true);
	xhr.send();

	// 3. 触发 console breadcrumb
	console.log('%c[TEST] Trigger console breadcrumb', 'color: blue;');
	console.error('console test');

	// 4. 触发 navigation breadcrumb
	console.log('%c[TEST] Trigger navigation breadcrumb', 'color: blue;');
	history.pushState({}, '', '/test-navigation');

	// 5. 触发 click breadcrumb
	console.log('%c[TEST] Trigger click breadcrumb', 'color: blue;');
	const btn = document.createElement('button');
	btn.textContent = 'Click me';
	document.body.appendChild(btn);
	btn.click(); // 自动生成 click breadcrumb

	// 6. 设置 Scope（user/tags/extra）
	console.log('%c[TEST] Set user/tags/extra', 'color: blue;');
	Sentry.setUser({ id: 'u1', email: 'xxx@xx.com' });
	Sentry.setTag('session_id', '123456');
	Sentry.setExtra('secretKey', 'super-secret');

	// 7. 捕获 message（beforeSend）
	console.log('%c[TEST] captureMessage', 'color: blue;');
	Sentry.captureMessage('Privacy Test Message', {
		tags: { keepTag: 'safe', secret: 'REMOVE_ME' },
		extra: { token: 'to-be-removed' }
	});

	// 8. 捕获错误（error + privacy rules 完整命中）
	console.log('%c[TEST] captureException', 'color: blue;');
	Sentry.captureException(new Error('Complex Privacy Test Error'), {
		extra: {
			password: 'abc123',
			secretKey: 'super-secret',
			deep: { nested: true },
			arguments: [{ safeField: 'ok' }]
		},
		tags: {
			userAgent: 'Chrome',
			visibilitychange: 'true',
			session_id: '123456'
		}
	});

	// 9. 启动 transaction（beforeSendTransaction 测试）
	Sentry.addTracingExtensions();

	console.log('%c[TEST] startTransaction', 'color: blue;');
	const tx = Sentry.startTransaction({
		name: 'qa-transaction',
		op: 'qa.test',
		metadata: { source: 'custom' }
	});

	console.log('%c[TEST] span added', 'color: blue;');
	const span = tx.startChild({
		op: 'http.client',
		description: 'GET https://api.test.com/user?password=visible',
		data: { url: 'https://api.test.com/user?password=visible' }
	});
	span.finish();
	tx.finish();
	console.log('%c[TEST] finishTransaction', 'color: blue;');

	console.log('%c=== SentryKit QA TEST TRIGGERED ===', 'color: green; font-size: 14px;');
}
