/**
 * @fileOverview Store Service
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
import { StoreIntent, StorePayload } from '../../api/intents/store/store-intent'
import { Jet } from '../../jet'
import { WebRuntime } from '../runtime'

const SERVICE_NAME = 'StoreService'

export function registerService(jet: Jet, runtime: WebRuntime) {
  runtime.exportingService(SERVICE_NAME, {
    async event(payload: StorePayload) {
      return jet.dispatch<StoreIntent>({
        $kind: 'StoreIntent',
        payload
      })
    }
  })
}
