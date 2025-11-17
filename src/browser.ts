/**
 * @fileOverview 项目启动
 * @date 2025-11-10
 * @author poohlaha
 * @description
 */
import { bootstrap } from './bootstrap';
import App from './App.svelte';
import { makeFlowIntent } from './jet/tools/intent';
import { registerActionHandlers } from './jet/registerActionHandlers';

import { ConsoleLoggerFactory } from './jet/logger/consoleLogger';
import { CompositeLoggerFactory } from './jet/logger/compositeLogger';
import { DeferredLoggerFactory } from './jet/logger/deferredLogger';
import { LOGGER_PREFIX_NAME } from './jet/types';
import { setupRuntimeFeatures } from './jet/utils/features/runtime';
import { setupErrorKit } from './jet/logger/errorkit/errorkit';
import { ERROR_KIT_CONFIG } from './jet/errorkit';
import { ErrorKitLoggerFactory } from './jet/logger/errorkit/errorKitLogger';

import Test from './sentrykit/__test__/index';
import { runSentryKitQATest } from './sentrykit/__test__/qa';

export async function startApplication(hydrate: boolean = false) {
	console.log(
		`%c[${LOGGER_PREFIX_NAME}] %cStarting application...`,
		'color: green;',
		'color: magenta;'
	);

	// 日志
	let logger: any;
	const onyxFeatures = await setupRuntimeFeatures(new DeferredLoggerFactory(() => logger));
	const consoleLogger = new ConsoleLoggerFactory();
	const errorKit = setupErrorKit(ERROR_KIT_CONFIG, consoleLogger);
	logger = new CompositeLoggerFactory([
		consoleLogger,
		new ErrorKitLoggerFactory(errorKit),
		...(onyxFeatures ? [onyxFeatures.recordingLogger] : [])
	]);

	// 启动 Jet Runtime
	const jet = bootstrap(logger, LOGGER_PREFIX_NAME);

	// 初始化 Svelte 组件
	const container = document.getElementById('app');
	const app = new App({
		target: container!,
		hydrate,
		props: {
			jet,
			page: new Promise(() => {}),
			isFirstPage: true
		}
	});

	// 注册 ActionHandlers
	registerActionHandlers({
		jet,
		logger,
		updateApp: (props: any) => {
			console.log(
				`%c[${LOGGER_PREFIX_NAME}] %cupdateApp ->`,
				'color:green;',
				'color: blue;',
				props
			);
			app.$set(props);
		}
	});

	// 首次加载路由
	const initialRoute = window.location.pathname || '/';
	const initialIntent = makeFlowIntent(initialRoute);
	await jet.dispatch(initialIntent);

	console.log(`%c[${LOGGER_PREFIX_NAME}] %cApplication ready`, 'color: green;', 'color: magenta;');

	await Test();
}
