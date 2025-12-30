/**
 * @fileOverview
 * @date 2025-11-07
 * @author poohlaha
 * @description
 */
import { Dependencies } from './dependencies/makeDependencies'
import { makeObjectGraph } from './environment/objectGraph'
import { WebIntentDispatcher } from './environment/dispatching/base'
import { DISPATCHER_TYPE, NAVIGATE_TYPE, ROUTER_TYPE, TREATMENT_STORE_TYPE } from './environment/objectGraph/types'
import { WebRuntime } from './environment/runtime'
import { makeRouterUsingRegisteredControllers } from './environment/routing/router-factory'
import { RouteUrlIntentController } from './api/controllers/route-url-controller'
import { NetworkIntentController } from './api/controllers/network-controller'
import { MemoryGetIntentController, MemorySetIntentController } from './api/controllers/memory-controller'
import {
  LocalStorageClearIntentController,
  LocalStorageGetIntentController,
  LocalStorageRemoveIntentController,
  LocalStorageSetIntentController,
  SessionStorageClearIntentController,
  SessionStorageGetIntentController,
  SessionStorageRemoveIntentController,
  SessionStorageSetIntentController
} from './api/controllers/storage-controller'
import {
  CookieSetIntentController,
  CookieGetIntentController,
  CookieClearIntentController
} from './api/controllers/cookie-controller'
import { StoreIntentController } from './api/controllers/store-controller'

function makeIntentDispatcher(): WebIntentDispatcher {
  const intentDispatcher = new WebIntentDispatcher()

  // router
  intentDispatcher.register(RouteUrlIntentController)

  // network
  intentDispatcher.register(NetworkIntentController)

  // memory
  intentDispatcher.register(MemoryGetIntentController)
  intentDispatcher.register(MemorySetIntentController)

  // storage
  intentDispatcher.register(LocalStorageGetIntentController)
  intentDispatcher.register(LocalStorageSetIntentController)
  intentDispatcher.register(LocalStorageRemoveIntentController)
  intentDispatcher.register(LocalStorageClearIntentController)
  intentDispatcher.register(SessionStorageGetIntentController)
  intentDispatcher.register(SessionStorageSetIntentController)
  intentDispatcher.register(SessionStorageRemoveIntentController)
  intentDispatcher.register(SessionStorageClearIntentController)

  // cookie
  intentDispatcher.register(CookieGetIntentController)
  intentDispatcher.register(CookieSetIntentController)
  intentDispatcher.register(CookieClearIntentController)

  // store
  intentDispatcher.register(StoreIntentController)

  return intentDispatcher
}

export function bootstrap(dependencies: Dependencies, store: Record<string, any>, navigate: (to: string) => void) {
  const intentDispatcher = makeIntentDispatcher()

  const baseObjectGraph = makeObjectGraph(dependencies)

  const router = makeRouterUsingRegisteredControllers(intentDispatcher, baseObjectGraph)

  const appObjectGraph = baseObjectGraph
    .adding(ROUTER_TYPE, router)
    .adding(DISPATCHER_TYPE, intentDispatcher)
    .adding(TREATMENT_STORE_TYPE, store || {})
    .adding(NAVIGATE_TYPE, navigate)

  return {
    runtime: new WebRuntime(intentDispatcher, appObjectGraph),
    objectGraph: appObjectGraph
  }
}
