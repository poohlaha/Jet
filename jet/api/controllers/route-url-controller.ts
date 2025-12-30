/**
 * @fileOverview 路由 Controller
 * @date 2025-11-10
 * @author poohlaha
 * @description
 * Jet?.onRoute({
 *  $kind: 'RouteUrlIntent',
 *  url: '/',
 *  payload: {
 *     id: '',
 *  }
 * })
 */
import { IntentController } from '../../environment/dispatching/base/dispatcher'
import { ROUTER_INTENT_KIND, RouteUrlIntent } from '../intents/route-url/route-url-intent'
import { WebObjectGraph } from '../../environment/objectGraph'
import Utils from '../../utils/utils'

export const RouteUrlIntentController: IntentController<RouteUrlIntent> = {
  $intentKind: ROUTER_INTENT_KIND,

  // @ts-ignore
  async perform(intent: RouteUrlIntent, objectGraph: WebObjectGraph) {
    // const targetIntent = objectGraph.router.intentFor(intent.url)
    let url = intent.url || ''

    if (Utils.isBlank(url)) {
      objectGraph.console.error('url did not resolve to a route url controller:', intent.url)
      return true
    }

    const replace = intent.replace ?? false
    const payload = intent.payload || {}

    const params = new URLSearchParams()
    if (Object.keys(payload).length > 0) {
      for (const [key, value] of Object.entries(payload)) {
        if (value === undefined || value === null) continue

        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, String(v)))
        } else {
          params.set(key, String(value))
        }
      }

      const query = params.toString() || ''
      if (!Utils.isBlank(query)) {
        url = `${url}${url.indexOf('?') !== -1 ? '&' : '?'}${query}`
      }
    }

    const parsedUrl = new URL(url)

    // window
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      replace ? window.location.replace(url) : (window.location.href = url)
      return true
    }

    // navigate
    const navigate: any = objectGraph.navigate
    if (!navigate) {
      return false
    }

    navigate?.(url)
    return true
  }
}
