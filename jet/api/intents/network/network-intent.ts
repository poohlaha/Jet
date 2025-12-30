/**
 * @fileOverview Network Intent
 * @date 2025-11-10
 * @author poohlaha
 * @description
 */
import { Optional } from '../../../utils/optional'
import { DispatcherIntent } from '../../../environment/dispatching/base/dispatcher'
import { IHttpRequestProps, IHttpRequestFetchProps, HttpResponse } from '../../../dependencies/net/types'

export const NETWORK_INTENT_KIND = 'NetworkIntent' as const

export interface NetworkIntent extends DispatcherIntent<Optional<HttpResponse>> {
  $kind: typeof NETWORK_INTENT_KIND
  payload: IHttpRequestProps
  fetchProps?: IHttpRequestFetchProps
}

export function isNetworkIntent(intent: DispatcherIntent<unknown>): intent is NetworkIntent {
  return intent.$kind === NETWORK_INTENT_KIND
}

export function makeNetworkIntent(options: Omit<NetworkIntent, '$kind'>): NetworkIntent {
  return { $kind: NETWORK_INTENT_KIND, ...options }
}
