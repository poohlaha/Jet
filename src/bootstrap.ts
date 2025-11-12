/**
 * @fileOverview 在应用启动时创建 ActionDispatcher、注册 handler、创建 Jet 实例并注入 Svelte context。还可以设置预取条目（示例中 jet.setPrefetched('flow:/', ...)）
 * @date 2025-11-10
 * @author poohlaha
 * @description 把 bootstrap 中的 wiring 集中在一个文件，便于替换/测试（例如在单元测试中可以创建一个使用 mock handler 的 Jet）
 */
import { ActionDispatcher } from './jet/actionDispatcher';
import { Jet } from './jet/jet';
import { ConsoleMetrics } from './jet/tools/metrics';
import { browserRuntime } from './jet/tools/runtime';
import { pageHandler, PAGE_ACTION_KIND } from './jet/handlers/pageHandler'
import {LoggerFactory} from "./jet/logger/logger";
import {PERFORMED} from "./jet/types";

export function bootstrap(loggerFactory: LoggerFactory, loggerPrefixName = '') {
    const dispatcher = new ActionDispatcher();

    // 注册 Page Action
    dispatcher.register(PAGE_ACTION_KIND, pageHandler)

    // log
    const log = loggerFactory.loggerFor(`[${loggerPrefixName}] [bootstrap]`);

    // metrics
    const consoleMetrics = new ConsoleMetrics(loggerFactory)

    const jet = Jet.load({
        dispatcher,
        loggerFactory,
        metrics: consoleMetrics,
        runtime: browserRuntime,
    });

    // 注册事件监听器系统
    jet.onAction = (kind: string, handler: Function) => {
        dispatcher.register(kind, async (action) => {
            await handler(action);
            return PERFORMED;
        });
    };

    return jet;
}

/*
// 希望直接在模块加载时自动启动
// @ts-ignore
if (!import.meta.env?.VITEST) {
    startApplication();
}
 */
