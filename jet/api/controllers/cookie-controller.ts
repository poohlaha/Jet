/**
 * @fileOverview Cookie Controller
 * @date 2025-11-10
 * @author poohlaha
 * @description
 */
import { IntentController } from '../../environment/dispatching/base/dispatcher'
import { CookieIntent } from '../intents/cookie/cookie-intent'
import { WebObjectGraph } from '../../environment/objectGraph'

export const CookieSetIntentController: IntentController<CookieIntent> = {
  $intentKind: 'CookieSetIntentController',

  // @ts-ignore
  async perform(intent: CookieIntent, objectGraph: WebObjectGraph) {
    const cookie = objectGraph.cookie
    cookie.setCookie(intent.key, intent.value, intent.domain || '', intent.expires ?? 0, intent.path || '')
  }
}

export const CookieGetIntentController: IntentController<CookieIntent> = {
  $intentKind: 'CookieGetIntentController',

  // @ts-ignore
  async perform(intent: CookieIntent, objectGraph: WebObjectGraph): any {
    const cookie = objectGraph.cookie
    return cookie.getCookie(intent.key)
  }
}

export const CookieClearIntentController: IntentController<CookieIntent> = {
  $intentKind: 'CookieClearIntentController',

  // @ts-ignore
  async perform(intent: CookieIntent, objectGraph: WebObjectGraph) {
    const cookie = objectGraph.cookie
    cookie.clear(intent.key, intent.domain || '', intent.path || '')
  }
}
