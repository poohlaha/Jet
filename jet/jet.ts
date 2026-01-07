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
import { Logger, LoggerFactory } from './shared/logger/logger'
import { Metrics } from './environment/metrics'
import { CONTEXT_NAME, UNSUPPORTED } from './config'
import { ActionDispatcher } from './engine/actions/action-dispatcher'
import { Action, ActionModel } from './types'
import { makeDependencies } from './dependencies/makeDependencies'
import { FeaturesCallbacks } from './dependencies/net'
import { bootstrap } from './bootstrap'
import { WebObjectGraph } from './environment/objectGraph'
import { WebRuntime } from './environment/runtime'
import { PrefetchedIntents } from './shared/common/prefetched-intents'
import { DispatcherIntent } from './environment/dispatching/base/dispatcher'
import { makeRouteUrlIntent, RouteUrlIntent } from './api/intents/route-url/route-url-intent'
import Utils from './utils/utils'
import { STORE_INTENT_KIND, StoreIntent } from './api/intents/store/store-intent'
import { makeExternalUrlAction } from './api/intents/intent'
import { makeServices } from './environment/services/makeServices'
import { Service } from './environment/services'

export type JetOptions = {
  runtime: WebRuntime
  logger: Logger // 记录日志（默认为 console）
  objectGraph: WebObjectGraph
  actionDispatcher: ActionDispatcher // handler registry/执行器
  metrics?: Metrics // 记录耗时（默认为 consoleMetrics）
  prefetched?: Map<string, Action>
  prefetchedIntents: PrefetchedIntents
}

export class Jet {
  private readonly runtime: WebRuntime
  private readonly actionDispatcher: ActionDispatcher // 保存传入的 dispatcher
  private readonly log: Logger // logger 实例
  readonly metrics: Metrics // metrics 实例
  // @ts-ignore
  private prefetched: Map<string, Action> // Map, 用于在 dispatch 时检查是否已有预取的 事件
  private readonly prefetchedIntents: PrefetchedIntents

  readonly objectGraph: WebObjectGraph
  private readonly wiredActions: Set<string>

  static load({
    loggerFactory,
    context,
    metrics,
    prefetched,
    featuresCallbacks,
    store,
    navigate
  }: {
    loggerFactory: LoggerFactory
    context: Map<string, unknown>
    metrics?: Metrics
    prefetched?: Map<string, Action>
    featuresCallbacks?: FeaturesCallbacks
    store: Record<string, any>
    navigate: (to: string) => void
  }) {
    const dependencies = makeDependencies(loggerFactory, featuresCallbacks)

    const { runtime, objectGraph } = bootstrap(dependencies, store, navigate)

    let jet: Jet

    const prefetchedIntents = PrefetchedIntents.empty()

    const actionDispatcher = new ActionDispatcher()

    jet = new Jet({
      logger: loggerFactory.loggerFor(CONTEXT_NAME),
      runtime,
      objectGraph,
      actionDispatcher,
      metrics,
      prefetched,
      prefetchedIntents
    })

    makeServices(jet, runtime)

    context.set(CONTEXT_NAME, jet)

    return jet
  }

  constructor(options: JetOptions) {
    this.log = options.logger ?? (console as any)
    this.runtime = options.runtime
    this.objectGraph = options.objectGraph
    this.actionDispatcher = options.actionDispatcher
    this.metrics = options.metrics ?? (console as any)
    this.prefetched = options.prefetched ?? new Map()
    this.prefetchedIntents = options.prefetchedIntents
    this.wiredActions = new Set()
  }

  async dispatch<I extends DispatcherIntent<unknown>>(intent: I): Promise<any> {
    const data = this.prefetchedIntents.get(intent)
    if (data) {
      this.log.info('re-using prefetched intent response for:', intent, 'data:', data)
      return data
    }

    let message = `Runtime Dispatch ${Utils.capitalizeFirstLetter(intent.$kind || '')}`
    if (intent.$kind === STORE_INTENT_KIND) {
      message = `${message}, Function: ${(intent as StoreIntent).payload?.action || ''}`
    }

    try {
      return await this.metrics.asyncTime(message, async () => {
        return this.runtime.dispatch(intent)
      })
    } catch (err) {
      this.log.error('runtime dispatch failed', intent.$kind, err)
      return null
    }
  }

  /**
   * Perform a Jet action, returning the outcome.
   */
  async perform(action: ActionModel) {
    const outcome = await this.actionDispatcher.perform(action)
    if (outcome === UNSUPPORTED) {
      this.log.error('unable to perform action:', action)
    }

    return outcome
  }

  async route(intent: RouteUrlIntent) {
    const routerResponse = await this.dispatch<RouteUrlIntent>(makeRouteUrlIntent({ ...intent }))

    if (routerResponse && routerResponse.action) {
      return await this.perform(makeExternalUrlAction(intent.payload.route || '', { ...routerResponse }))
    }

    this.log.warn(
      'url did not resolve to a flow action with a discernable intent:',
      intent.payload.route,
      routerResponse
    )
    return null
  }

  onAction(kind: string, implementation: Function) {
    if (this.wiredActions.has(kind)) {
      throw new Error(`onAction called twice with the same action type: ${kind}`)
    }

    this.actionDispatcher.register(kind, implementation)
    this.wiredActions.add(kind)
  }

  get logger(): Logger {
    return this.log
  }

  // 调用 service
  services = new Proxy({} as Service, {
    get: (_, serviceName: string) => {
      if (serviceName === '$$typeof' || typeof serviceName === 'symbol') {
        return undefined
      }

      const wrap = (obj: any, path: string[] = []): any => {
        return new Proxy(obj, {
          get: (target, methodName: string) => {
            const method = (target as any)[methodName]
            const name = [...path, methodName]

            // 方法
            if (typeof method === 'function') {
              return async (...args: any[]) => {
                return this.metrics.asyncTime(
                  `Runtime Service \`${String(serviceName)}.${String(methodName)}\``,
                  async () => method.apply(target, args)
                )
              }
            }

            // 对象
            if (typeof method === 'object' && method !== null) {
              return wrap(method, name)
            }

            return method
          }
        })
      }

      // StoreService
      if (serviceName === 'StoreService') {
        const stores = this.objectGraph.treatmentStore
        return wrap(stores, ['StoreService'])
      }

      const service = this.runtime.serviceWithName(serviceName)
      if (!service) {
        this.log.error(`Runtime Service \`${serviceName}\` not found`)
        return undefined
      }

      return wrap(service)
    }
  })
}
