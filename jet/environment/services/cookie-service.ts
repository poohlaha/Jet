/**
 * @fileOverview Cookie Service
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
import { CookieIntent } from '../../api/intents/cookie/cookie-intent'
import { Jet } from '../../jet'
import { WebRuntime } from '../runtime'

const SERVICE_NAME = 'CookieService'

export function registerService(jet: Jet, runtime: WebRuntime) {
  runtime.exportingService(SERVICE_NAME, {
    async set({ key, value, domain, expires, path }: CookieIntent) {
      return jet.dispatch({
        $kind: 'CookieSetIntent',
        key,
        value,
        domain,
        expires,
        path
      })
    },

    async get(key: string = '') {
      return jet.dispatch({
        $kind: 'CookieGetIntent',
        key
      })
    },

    async clear({ key, domain, path }: CookieIntent) {
      return jet.dispatch({
        $kind: 'CookieClearIntent',
        key,
        domain,
        path
      })
    }
  })
}
