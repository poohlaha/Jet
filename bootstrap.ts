/**
 * @fileOverview 在应用启动时创建 ActionDispatcher、注册 handler、创建 Jet 实例并注入 Svelte context。还可以设置预取条目（示例中 jet.setPrefetched('flow:/', ...)）
 * @date 2025-11-10
 * @author poohlaha
 * @description 把 bootstrap 中的 wiring 集中在一个文件，便于替换/测试（例如在单元测试中可以创建一个使用 mock handler 的 Jet）
 */
import { LoggerFactory } from './jet/shared/logger/logger'
import { ConsoleMetrics } from './jet/environment/metrics'
import { Jet } from './jet/jet'
import type { FeaturesCallbacks } from './jet/dependencies/net'

export async function bootstrap({
  loggerFactory,
  featuresCallbacks,
  store,
  navigate
}: {
  loggerFactory: LoggerFactory
  featuresCallbacks?: FeaturesCallbacks
  store: Record<string, any>
  navigate: (to: string) => void
}) {
  // 注册 Store Action
  // dispatcher.register(STORE_ACTION_KIND, storeHandler)

  // metrics
  const consoleMetrics = new ConsoleMetrics(loggerFactory)

  // jet
  const jet = Jet.load({
    loggerFactory,
    metrics: consoleMetrics,
    featuresCallbacks,
    store,
    navigate
  })

  return jet
}
