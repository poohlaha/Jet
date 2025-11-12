/**
 * @fileOverview 核心 Jet 类
 * @date 2025-11-10
 * @author poohlaha
 * @description
 * - 管理 ActionDispatcher（handler 注册的承载者）
 * - 提供 dispatch(intent)：接收 Intent、处理 prefetch、执行 handler（通过 dispatcher）、把 handler 的返回解析为 Page、捕获并转成 ErrorPage、并用 metrics 记录耗时
 * - 提供 perform(action)：直接调用 dispatcher（跳过 intent 层）
 * - 管理 prefetch 存储（setPrefetched）
 * - 提供 navToken 机制（简单的数字 token）用于避免异步返回覆盖较新的导航状态
 * prefetch map: 用于 SSR 情形或提前加载时把已加载 page 注入 Jet。比如服务端渲染把 page 随 HTML 注入到客户端（在客户端创建 Jet 时传入 prefetched），客户端 dispatch 时可直接命中并避免重复网络请求。
 * metrics wrapper: 在 dispatch 层做监测是合理的（统一管控一次 dispatch 的耗时），便于运维与性能分析。
 * 错误处理: 不直接抛出而是转为 ErrorPage，这样 UI 层的 {#await} 可以在 then 分支拿到 ErrorPage，保持渲染路径一致（正如你最初代码中的 transformRejectionIntoErrorPage 的思路）。
 * nested action support：允许 handler 返回另一个 action ($kind) 以委托进一步处理，便于 handler 组合（示例：flow-handler 可返回 externalUrlAction，由另一个 handler 处理）
 */
import type {ActionModel, Intent, Page} from './types';
import {LOGGER_PREFIX_NAME, PERFORMED} from "./types";
import {ActionDispatcher} from './actionDispatcher';
import {makeErrorPage} from './tools/errorPage';
import type {Logger} from './logger/logger';
import {LoggerFactory} from "./logger/logger";
import type {Metrics} from './tools/metrics';
import type {Runtime} from './tools/runtime';

export type JetOptions = {
    dispatcher: ActionDispatcher; // handler registry/执行器
    logger: Logger; // 记录日志（默认为 console）
    metrics?: Metrics; // 记录耗时（默认为 consoleMetrics）
    runtime?: Runtime; // 注入运行时信息
    prefetched?: Map<string, Page>; // 支持注入 SSR 的预取结果
};


export class Jet {
    private readonly dispatcher: ActionDispatcher; // 保存传入的 dispatcher
    private readonly logger: Logger; // logger 实例
    private readonly metrics: Metrics; // metrics 实例
    private readonly runtime: Runtime; // 运行环境信息
    private prefetched: Map<string, Page>; // Map, 用于在 dispatch 时检查是否已有预取的 page
    private navToken = 0; // 数字计数器，每次导航增加，协助判断“是否是最新导航”

    static load({
         dispatcher,
         loggerFactory,
         metrics,
         runtime,
         prefetched
    }: {
        dispatcher: ActionDispatcher,
        loggerFactory: LoggerFactory,
        metrics?: Metrics,
        runtime: Runtime,
        prefetched?: Map<string, Page>
    }) {

        let jet: Jet;

        jet = new Jet({
            dispatcher,
            logger: loggerFactory.loggerFor(LOGGER_PREFIX_NAME),
            metrics,
            runtime,
            prefetched
        })

        return jet;
    }

    constructor(options: JetOptions) {
        this.dispatcher = options.dispatcher;
        this.logger = options.logger ?? (console as any);
        this.metrics = options.metrics ?? (console as any);
        this.runtime = options.runtime ?? ({ isClient: true, isServer: false, platform: 'browser' } as Runtime);
        this.prefetched = options.prefetched ?? new Map();
    }

    private capitalizeFirstLetter(str: string = '') {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    async dispatch(intent: Intent): Promise<Page> {
        // Prefetch cache
        if (intent.key && this.prefetched.has(intent.key)) {
            this.logger.info('prefetched hit', intent.key);
            return this.prefetched.get(intent.key)!;
        }

        try {
            return await this.metrics.asyncTime(`Jet Dispatch ${this.capitalizeFirstLetter(intent.kind || '')}`, async () => {
                // Map intent -> action model (simple mapping)
                const action: ActionModel = { $kind: intent.kind, payload: intent.payload };
                const outcome = await this.dispatcher.perform(action);

                if (outcome === PERFORMED) {
                    this.logger.info(`${intent.kind} performed`);
                    // 返回一个特殊的“空页面”占位（不触发错误页）
                    return { type: 'noop', title: '', component: null } as any;
                }

                // Handler may return a Page directly, or { page } envelope, or another action
                if (outcome && typeof outcome === 'object') {
                    if ('type' in outcome) return outcome as Page;
                    if ('page' in outcome) return outcome.page as Page;
                    // 如果 outcome 是另一个 action（$kind），可以再次 perform
                    if ('$kind' in outcome) {
                        const nested = await this.dispatcher.perform(outcome as ActionModel);
                        if (nested && typeof nested === 'object' && 'type' in nested) return nested as Page;
                    }
                }

                // default: produce error page
                return makeErrorPage(new Error('Handler did not produce a Page'));
            });
        } catch (err) {
            this.logger.error('dispatch failed', intent.kind, err);
            return makeErrorPage(err);
        }
    }

    // 委托给 dispatcher
    perform(action: ActionModel) {
        return this.dispatcher.perform(action);
    }

    // 把 page 存到 prefetch map（用于 SSR hydration）
    setPrefetched(key: string, page: Page) {
        this.prefetched.set(key, page);
    }

    // 提供 nav token 生成与比较，用在 UI 层（比如 PageResolver 或上层导航状态）以确保只有最新的导航结果更新 UI，从而避免竞态问题（旧 promise 晚到覆盖新页面/导航）
    nextNavToken() {
        return ++this.navToken;
    }

    isLatestNav(token: number) {
        return token === this.navToken;
    }

    // 注册 Action Handler
    onAction(kind: string, handler: (action: any) => Promise<any> | any) {
        this.logger.info(`[${LOGGER_PREFIX_NAME} onAction] registering handler for`, kind);
        this.dispatcher.register(kind, async (action) => {
            try {
                // 执行 handler
                const result = await handler(action);

                // handler 可以返回 Page / string / void
                if (result && typeof result === 'object' && 'type' in result) {
                    return result;
                }

                return result ?? PERFORMED;
            } catch (err) {
                this.logger.error(`[${LOGGER_PREFIX_NAME} onAction] handler failed`, kind, err);
                return makeErrorPage(err);
            }
        });
    }
}