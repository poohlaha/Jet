/**
 * @fileOverview 路由 Intent
 * @date 2025-11-10
 * @author poohlaha
 * @description
 */
import { DispatcherIntent } from '../../../environment/dispatching/base/dispatcher'
import { Optional } from '../../../utils/optional'
import { ExternalUrlAction } from '../../models/actions/actions'

export const ROUTER_INTENT_KIND = 'RouteUrlIntent' as const

export interface RouterResponse {
  intent: DispatcherIntent<unknown>
  action: ExternalUrlAction
}

export interface RouteUrlIntent extends DispatcherIntent<Optional<RouterResponse>> {
  $kind: typeof ROUTER_INTENT_KIND
  payload: RouteUrlPayloadIntent
}

export interface RouteUrlPayloadIntent {
  route: string
  replace?: boolean
  params?: Record<string, any>
}

export function isRouteUrlIntent(intent: DispatcherIntent<unknown>): intent is RouteUrlIntent {
  return intent.$kind === ROUTER_INTENT_KIND
}

export function makeRouteUrlIntent(options: Omit<RouteUrlIntent, '$kind'>): RouteUrlIntent {
  return { $kind: ROUTER_INTENT_KIND, ...options }
}
