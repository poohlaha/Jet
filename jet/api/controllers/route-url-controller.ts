/**
 * @fileOverview Route Controller
 * @date 2025-11-10
 * @author poohlaha
 * @description
 * Jet?.route({
 *  $kind: 'RouteUrlIntent',
 *  url: '/',
 *  payload: {
 *     id: '',
 *  }
 * })
 */
import { IntentController } from '../../environment/dispatching/base/dispatcher'
import {ROUTER_INTENT_KIND, RouteUrlIntent, RouteUrlPayloadIntent} from '../intents/route-url/route-url-intent'
import { WebObjectGraph } from '../../environment/objectGraph'
import Utils from '../../utils/utils'
import { ExternalUrlAction } from '../models/actions/actions'

export const RouteUrlIntentController: IntentController<RouteUrlIntent> = {
  $intentKind: ROUTER_INTENT_KIND,

  // @ts-ignore
  async perform(intent: RouteUrlIntent, objectGraph: WebObjectGraph) {
    // const targetIntent = objectGraph.router.intentFor(intent.url)
    const payload = (intent.payload || {}) as RouteUrlPayloadIntent
    let route = payload.route || ''

    if (Utils.isBlank(route)) {
      objectGraph.console.error('url did not resolve to a route url controller:', route)
      return null
    }

    const replace = intent.payload.replace ?? false
    const params = payload.params || {}
    const urlParams = new URLSearchParams()
    if (Object.keys(params).length > 0) {
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue

        if (Array.isArray(value)) {
          value.forEach(v => urlParams.append(key, String(v)))
        } else {
          urlParams.set(key, String(value))
        }
      }

      const query = urlParams.toString() || ''
      if (!Utils.isBlank(query)) {
        route = `${route}${route.indexOf('?') !== -1 ? '&' : '?'}${query}`
      }
    }

    // 判断是不是外部链接
    const isExternal = route.startsWith('http://') || route.startsWith('https://') || (!route.startsWith('/') && route.includes('.'))

    if (isExternal) {
      // 如果是外部 URL 但没有协议，默认加 https://
      if (!route.startsWith('http://') && !route.startsWith('https://')) {
        route = `https://${route}`
      }

      return {
        intent,
        action: new ExternalUrlAction(route, isExternal, replace, false)
      }
    }

    return {
      intent,
      action: new ExternalUrlAction(route, false, replace, true)
    }
  }
}
