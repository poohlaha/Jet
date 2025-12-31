/**
 * @fileOverview 注册所有 dependencies
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
import { LoggerFactory } from '../shared/logger/logger'
import { FeaturesCallbacks, Net } from './net'
import { WebClient } from './client'
import { WebMetricsIdentifiers } from './metricsIdentifiers'
import { WebMemory } from './memory'
import { WebConsole } from './console'
import { makeUnauthenticatedUser } from './user'
import { WebStorage } from './storage'
import { WebCookie } from './cookie'
import { getEnv } from '../utils/utils'

export type Dependencies = ReturnType<typeof makeDependencies>

export function makeDependencies(loggerFactory: LoggerFactory, featuresCallbacks?: FeaturesCallbacks) {
  return {
    client: new WebClient(getEnv()),
    console: new WebConsole(loggerFactory),
    metricsIdentifiers: new WebMetricsIdentifiers(),
    net: new Net(loggerFactory, featuresCallbacks),
    memory: new WebMemory(),
    storage: {
      local: new WebStorage(window.localStorage),
      session: new WebStorage(window.sessionStorage)
    },
    cookie: new WebCookie(),
    user: makeUnauthenticatedUser(),
    URL
  }
}
