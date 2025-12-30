/**
 * @fileOverview Router Factory
 * @date 2025-11-07
 * @author poohlaha
 * @description
 */
import { WebIntentDispatcher } from '../dispatching/base'
import { WebObjectGraph } from '../objectGraph'

// @ts-ignore
export function makeRouterUsingRegisteredControllers(dispatcher: WebIntentDispatcher, objectGraph: WebObjectGraph) {
  /*
    for (const controller of dispatcher.registeredControllers) {
      if (isRouteProvider(controller)) {
          registerRoutesProvider({}, controller, objectGraph)
      }
  }
   */
  return {}
}
