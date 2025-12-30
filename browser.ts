/**
 * @fileOverview 项目启动
 * @date 2025-11-10
 * @author poohlaha
 * @description
 */
import {
  ConsoleLoggerFactory,
  CompositeLoggerFactory,
  ErrorKitLoggerFactory,
  DeferredLoggerFactory,
  setupErrorKit,
  registerActionHandlers,
  setupRuntimeFeatures,
  ERROR_KIT_CONFIG,
  LOGGER_PREFIX_NAME
} from './jet/export'
import { setJet } from './globalJet'
import { bootstrap } from './bootstrap'

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
