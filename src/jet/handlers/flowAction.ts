/**
 * @fileOverview 处理 flowAction（导航相关）的业务逻辑
 * @date 2025-11-10
 * @author poohlaha
 * @description 根据 action.payload.route 返回不同的 Page 或返回另一个 ActionModel（用于委托处理，例如打开外部 URL）
 */
import { Dependencies, LOGGER_PREFIX_NAME, PERFORMED } from '../types';
import { makeFlowIntent } from '../tools/intent';
import { PAGE_ACTION_KIND } from './pageHandler';

export const FLOW_ACTION_KIND = 'flowAction';

export async function registerHandler(dependencies: Dependencies) {
	const { jet, logger, updateApp } = dependencies;

	const log = logger.loggerFor(`[${LOGGER_PREFIX_NAME} ${FLOW_ACTION_KIND}]`);

	log.info('Registering FlowActionHandler');

	let isFirstPage = true;

	jet.onAction?.(FLOW_ACTION_KIND, async (action: any) => {
		log.info('FlowAction received:', action);

		const route = action.payload?.route || '/';
		const intent = makeFlowIntent(route);

		const shouldReplace = isFirstPage;
		const page = await getPage(intent);

		// 通知 UI 层更新
		updateApp?.({
			page: page.promise.then((page: any) => {
				const state = {
					route: page.route || page.payload?.route || window.location.pathname
				};

				if (shouldReplace) {
					history.replaceState(state, '', route);
				} else {
					history.pushState(state, '', route);
				}

				return page;
			}),
			isFirstPage
		});

		isFirstPage = true;
		return PERFORMED;
	});

	// 浏览器前进/后退
	window.addEventListener('popstate', async (event: any) => {
		const state = event.state;
		const route = state?.route || window.location.pathname;
		log.info(
			`[${LOGGER_PREFIX_NAME} ${FLOW_ACTION_KIND}] popstate route =`,
			route,
			'state =',
			state
		);

		if (state?.page) {
			// 有缓存的路由信息 -> 重新加载对应页面
			const intent = makeFlowIntent(route);
			const page = await getPage(intent);

			// 直接复用缓存的页面
			updateApp?.({
				page: page.promise.then((page: any) => page),
				isFirstPage
			});

			return;
		}

		// 没有缓存, 则重新计算
		const intent = makeFlowIntent(window.location.pathname);
		const page = await getPage(intent);
		updateApp?.({
			page: page.promise.then((page: any) => page),
			isFirstPage
		});
	});

	async function getPage(intent: any): Promise<{ promise: Promise<any> }> {
		const page = (async () => {
			try {
				const page = await jet.dispatch({
					kind: PAGE_ACTION_KIND,
					payload: intent.payload // 比如 { route: '/about' }
				});
				log.info('FlowAction destination resolved to:', page);
				return page;
			} catch (e: any) {
				log.error('FlowAction dispatch rejected:', e);
				e.isFirstPage = isFirstPage;
				throw e;
			}
		})();

		// 等待 500 ms，超时则立即显示 spinner
		await Promise.race([page, new Promise((resolve) => setTimeout(resolve, 500))]).catch(() => {});

		return { promise: page };
	}
}
