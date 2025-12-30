/**
 * @fileOverview 路由 Intent
 * @date 2025-11-10
 * @author poohlaha
 * @description
 */
import { DispatcherIntent } from '../../../environment/dispatching/base/dispatcher'
import { FlowAction } from '../../models/actions/flow-action'
import { Optional } from '../../../utils/optional'

export const ROUTER_INTENT_KIND = 'RouteUrlIntent' as const

export interface RouterResponse {
  /**
   * The intent to dispatch to get the view model for this URL.
   */
  intent: DispatcherIntent<unknown>

  /**
   * action to navigate to a new page of the app.
   */
  action: FlowAction
}

export interface RouteUrlIntent extends DispatcherIntent<Optional<RouterResponse>> {
  $kind: typeof ROUTER_INTENT_KIND
  url: string
  payload?: Record<string, any>
  replace?: boolean
}

export function isRouteUrlIntent(intent: DispatcherIntent<unknown>): intent is RouteUrlIntent {
  return intent.$kind === ROUTER_INTENT_KIND
}

export function makeRouteUrlIntent(options: Omit<RouteUrlIntent, '$kind'>): RouteUrlIntent {
  return { $kind: ROUTER_INTENT_KIND, ...options }
}
