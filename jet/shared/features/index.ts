/**
 * @fileOverview 运行时环境初始化模块
 * @date 2025-11-07
 * @author poohlaha
 * @description 用于在开发/内部环境加载特性开关系统
 */
import { LoggerFactory } from '../../shared/logger/logger'
import { buildFeatureConfig, buildRuntimeFeatureKitConfig, loadFeatureKit, OnyxFeatures } from './featureKit'
import { Environment, ENVIRONMENT } from '../../types'

export const BUILD = process.env.VERSION as string

export async function setupRuntimeFeatures(logger: LoggerFactory): Promise<OnyxFeatures | void> {
  // 判断环境
  // @ts-ignore
  if (process.env.APP_SCOPE === 'internal' || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'qa') {
    const currentEnv = process.env.APP_SCOPE || process.env.NODE_ENV || 'qa'

    const features = await import('./consts')

    const config = buildRuntimeFeatureKitConfig(
      features,
      {
        [features.__FF_SHOW_RADAR]: buildFeatureConfig({
          [ENVIRONMENT.DEV]: true
        }),
        [features.__FF_ARYA]: {
          ...buildFeatureConfig({ [ENVIRONMENT.DEV]: false }),
          itfe: ['y9ttlj15']
        }
      },
      currentEnv as Environment
    )

    // Load runtime featureKit
    return loadFeatureKit('com.jet.web', ENVIRONMENT.DEV, config, logger, {
      enableToolbar: true,
      radarConfig: {
        component: 'Web',
        app: 'App',
        build: BUILD
      }
    })
  }
}
