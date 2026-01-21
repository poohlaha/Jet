/**
 * @fileOverview 导出
 * @date 2023-12-05
 * @author poohlaha
 */
import { NetworkIntent } from './api/intents/network/network-intent'
import { StoreIntent } from './api/intents/store/store-intent'
import { LoggerFactory, Logger } from './shared/logger/logger'
import { ConsoleMetrics } from './environment/metrics'
import { FeaturesCallbacks } from './dependencies/net'

import { ConsoleLoggerFactory } from './shared/logger/consoleLogger'
import { CompositeLoggerFactory } from './shared/logger/compositeLogger'
import { ErrorKitLoggerFactory } from './shared/logger/errorkit/errorKitLogger'
import { DeferredLoggerFactory } from './shared/logger/deferredLogger'

import { setupErrorKit } from './shared/logger/errorkit/errorkit'
import { registerActionHandlers } from './action-handlers/register-action-handlers'
import { setupRuntimeFeatures } from './shared/features'

import { makeFlowIntent, makeCompoundIntent, makeExternalUrlAction } from './api/intents/intent'

import { initializeUniqueIdContext, getUniqueIdGenerator } from './utils/uniqueId'

import { Action, ActionModel, Intent, Environment } from './types'
import { ERROR_KIT_CONFIG } from './errorkit-config'
import { bootstrap } from './bootstrap'
import { CONTEXT_NAME } from './config'
import { Jet } from './jet'
import * as Utils from './utils/utils'

export type { StoreIntent, NetworkIntent, LoggerFactory, Logger, FeaturesCallbacks, Action, ActionModel, Intent, Environment }

export {
  makeFlowIntent,
  makeCompoundIntent,
  makeExternalUrlAction,
  ConsoleMetrics,
  ConsoleLoggerFactory,
  CompositeLoggerFactory,
  ErrorKitLoggerFactory,
  DeferredLoggerFactory,
  initializeUniqueIdContext,
  getUniqueIdGenerator,
  setupErrorKit,
  registerActionHandlers,
  setupRuntimeFeatures,
  ERROR_KIT_CONFIG,
  Jet,
  bootstrap,
  CONTEXT_NAME,
  Utils
}
