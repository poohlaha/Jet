/**
 * @fileOverview 项目启动
 * @date 2025-11-10
 * @author poohlaha
 * @description
 */
import { ConsoleLoggerFactory } from './jet/shared/logger/consoleLogger'
import { CompositeLoggerFactory } from './jet/shared/logger/compositeLogger'
import { ErrorKitLoggerFactory } from './jet/shared/logger/errorkit/errorKitLogger'
import { DeferredLoggerFactory } from './jet/shared/logger/deferredLogger'
import { setupErrorKit } from './jet/shared/logger/errorkit/errorkit'
import { registerActionHandlers } from './jet/action-handlers/register-action-handlers'
import { setupRuntimeFeatures } from './jet/shared/features'
import { ERROR_KIT_CONFIG } from './jet/errorkit-config'
import { bootstrap } from './bootstrap'
import { LOGGER_PREFIX_NAME } from './jet/config'
import { setJet } from './globalJet'

export async function startApplication(store: Record<string, any> = {}, navigate: (to: string) => void) {
  console.log(
    `🟢%c[${LOGGER_PREFIX_NAME}] %cStarting application...`,
    'color: green;font-weight:bold;',
    'color: magenta;font-weight:bold;'
  )

  // 日志
  let logger: any
  const onyxFeatures = await setupRuntimeFeatures(new DeferredLoggerFactory(() => logger))
  const consoleLogger = new ConsoleLoggerFactory()
  const errorKit = setupErrorKit(
    {
      ...ERROR_KIT_CONFIG,
      environment: process.env.NODE_ENV || 'qa'
    },
    consoleLogger
  )
  logger = new CompositeLoggerFactory([
    consoleLogger,
    new ErrorKitLoggerFactory(errorKit),
    ...(onyxFeatures ? [onyxFeatures.recordingLogger] : [])
  ])

  const jet = await bootstrap({
    loggerFactory: logger,
    featuresCallbacks: {
      getITFEValues(): string[] | undefined {
        return onyxFeatures?.featureKit?.itfe
      }
    },
    store,
    navigate
  })

  window.__JET__ = jet

  // 全局保存
  setJet(jet)

  // 注册 ActionHandlers
  registerActionHandlers({
    jet,
    logger
  })

  console.log(
    `🟢%c[${LOGGER_PREFIX_NAME}] %cApplication ready`,
    'color: green;font-weight:bold;',
    'color: magenta;font-weight:bold;'
  )
}
