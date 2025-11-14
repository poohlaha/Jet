/**
 * @fileOverview Utils 类
 * @date 2025-11-13
 * @author poohlaha
 * @description
 */
import { logger as logger2 } from '@sentry/core';
import { GLOBAL_OBJ } from '@sentry/core';
import { __SENTRY_DEBUG__ } from '../types';

type FetchImpl = typeof fetch | undefined;

const WINDOW: any = GLOBAL_OBJ;

// 缓存已解析出的 fetch 实现，避免每次都做 iframe 检查（性能开销）。
let cachedFetchImpl: FetchImpl | undefined = undefined;

/**
 * 获取「尽可能原生、未被 polyfill 修改」的 fetch 实现。
 *
 * 逻辑：
 * 1. 如果缓存存在直接返回缓存;
 * 2. 优先判断 window.fetch 是否为原生实现(isNativeFetch);
 *    - 如果是，直接 bind(WINDOW) 并缓存返回;
 *    - 否则（fetch 被 polyfill 或被修改），尝试通过创建 sandbox iframe, 从 iframe.contentWindow.fetch 获取未被页面脚本污染的实现;
 *      - 如果成功，使用 iframe 的 fetch;
 *      - 无法获取时，回退到 window.fetch（即使它可能被 polyfill 覆盖）
 *
 * 说明：
 *    - 在 web worker 中没有 document，不会尝试创建 iframe;
 *    - 绑定（.bind(WINDOW)）是为了保证调用时的 this 指向全局对象（部分实现依赖 this）
 *    - 使用 try/catch 包裹 iframe 操作，以防 CSP/跨域/创建失败导致异常
 */
export function getNativeFetchImplementationOld(): FetchImpl {
	if (cachedFetchImpl) {
		return cachedFetchImpl;
	}

	/*
   // 如果全局的 fetch 看起来是“原生实现”，直接使用之
    if (isNativeFetch(WINDOW.fetch)) {
        cachedFetchImpl = WINDOW.fetch.bind(WINDOW);
        return cachedFetchImpl;
    }
     */

	const document = WINDOW.document;
	let fetchImpl = WINDOW.fetch;

	// 如果存在 document（说明在 window 环境而非 web worker），尝试 sandbox iframe
	if (document && typeof document.createElement === 'function') {
		try {
			// 创建一个隐藏的 iframe，用于从干净的执行环境取回原生 fetch
			const sandbox = document.createElement('iframe');
			sandbox.hidden = true;

			// 将 iframe 挂到 document.head ，以便 contentWindow 可用
			document.head.appendChild(sandbox);

			const contentWindow = sandbox.contentWindow;
			if (contentWindow && contentWindow.fetch) {
				// 如果 iframe 的 window 上存在 fetch，则使用 iframe 的实现
				fetchImpl = contentWindow.fetch;
			}

			// 清理 iframe 节点（不保留）
			document.head.removeChild(sandbox);
		} catch (e: any) {
			// 若创建 iframe 失败(CSP、跨域或其他原因)，记录 debug warn 并降级使用 window.fetch
			(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) &&
				logger2.warn(
					'[SentryKit] Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ',
					e
				);
		}
	}

	//  bind 到全局对象以保证 this 行为一致(某些 fetch 实现依赖 this)
	cachedFetchImpl = fetchImpl ? fetchImpl.bind(WINDOW) : undefined;
	return cachedFetchImpl;
}

export function getNativeFetchImplementation(): FetchImpl {
	if (cachedFetchImpl) {
		return cachedFetchImpl;
	}

	const g = typeof globalThis !== 'undefined' ? globalThis : window;
	const fetchImpl = g.fetch;

	if (!fetchImpl) {
		(typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) &&
			logger2.warn('Fetch API is not available in this environment.');
		return (cachedFetchImpl = undefined);
	}

	// v8 不再要求绑定 this，因为现代 fetch 实现都与 globalThis 解耦。
	cachedFetchImpl = fetchImpl;

	return cachedFetchImpl;
}

function clearCachedFetchImplementation() {
	cachedFetchImpl = void 0;
}
