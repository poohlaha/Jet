import { Environment } from '../../types'
import { RecordingLoggerFactory } from '../../shared/logger/recordingLogger'
import { LoggerFactory } from '../../shared/logger/logger'
import { LOGGER_PREFIX_NAME } from '../../config'
import { __FF_ARYA } from './consts'

export type FeatureOverride = {
  itfe?: string[]
} & Partial<Record<Environment, boolean>>

export type FeatureOverrides = Record<string, FeatureOverride>

interface FeatureConfig {
  [featureName: string]: {
    enabled: boolean
    itfe?: string[]
  }
}

export interface FeatureConfigOverride {
  itfe?: string[]
  [env: string]: boolean | string[] | undefined
}

interface LoadFeatureKitOptions {
  enableToolbar?: boolean
  radarConfig?: {
    component: string
    app: string
    build: string
  }
}

export interface FeatureKit {
  itfe: Array<string>
  isEnabled: (featureName: string) => boolean
  listEnabled: () => string[]
}

export interface OnyxFeatures {
  featureKit: FeatureKit
  recordingLogger: RecordingLoggerFactory
}

export function loadFeatureKit(
  namespace: string,
  env: Environment,
  config: FeatureConfig,
  logger: LoggerFactory,
  options?: LoadFeatureKitOptions
): OnyxFeatures {
  queueMicrotask(() => {
    try {
      console.log(`%c[${LOGGER_PREFIX_NAME} queueMicrotask] Executed microtask`, 'color: green;')
      const log = logger.loggerFor(`${LOGGER_PREFIX_NAME} RuntimeFeatures`)
      log.info(`Loading FeatureKit for ${namespace} in ${env}`)

      if (options?.enableToolbar) {
        log.info('Toolbar enabled')
      }

      if (options?.radarConfig) {
        log.info('Radar config:', options.radarConfig)
      }
    } catch {
      console.warn(`[${LOGGER_PREFIX_NAME} RuntimeFeatures] Deferred logger not ready yet`)
    }
  })

  const recordingLogger = new RecordingLoggerFactory()
  const featureKit: FeatureKit = {
    itfe: config[__FF_ARYA].itfe || [],
    isEnabled: (featureName: string) => !!config[featureName]?.enabled,
    listEnabled: () => Object.keys(config).filter(key => config[key].enabled)
  }

  window.JetDebug = {
    ...(window as any).JetDebug,
    featureKit,
    JetLogs: {
      export: () => recordingLogger.exportLogs(),
      clear: () => recordingLogger.clear()
    }
  }

  return {
    featureKit,
    recordingLogger
  }
}

export function buildRuntimeFeatureKitConfig(
  features: Record<string, string>,
  overrides: FeatureOverrides,
  currentEnv: Environment
): FeatureConfig {
  const config: FeatureConfig = {}

  for (const key in features) {
    // 默认禁用
    config[features[key]] = { enabled: false }
  }

  // 应用 overrides
  for (const featureKey in overrides) {
    const override = overrides[featureKey]
    config[featureKey] = {
      enabled: override[currentEnv] ?? false,
      itfe: override.itfe || []
    }
  }

  return config
}

/**
 * 构建单个 feature 的配置
 * @param overrides 各环境的启用状态及 itfe 白名单
 */
export function buildFeatureConfig(overrides: FeatureConfigOverride) {
  return { ...overrides }
}
