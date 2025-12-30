/**
 * @fileOverview Store Controller
 * @date 2025-11-10
 * @author poohlaha
 * @description
 */
import { IntentController } from '../../environment/dispatching/base/dispatcher'
import { WebObjectGraph } from '../../environment/objectGraph'
import { STORE_INTENT_KIND, StoreIntent, StorePayload } from '../intents/store/store-intent'
import Utils from '../../utils/utils'

export const StoreIntentController: IntentController<StoreIntent> = {
  $intentKind: STORE_INTENT_KIND,

  // @ts-ignore
  async perform(intent: StoreIntent, objectGraph: WebObjectGraph): any {
    const payload = intent.payload || {}
    if (Utils.isObjectNull(payload)) {
      objectGraph.console.error('payload did not resolve to a store controller.')
      return null
    }

    const treatmentStore = objectGraph.treatmentStore || {}
    if (Utils.isObjectNull(treatmentStore || {})) {
      objectGraph.console.error('no Store registered.')
      return null
    }

    const action = (payload as StorePayload).action || ''
    const name = (payload as StorePayload).name || ''
    const args = (payload as StorePayload).args || []

    // @ts-ignore
    const store = treatmentStore[name] || {}
    if (Utils.isObjectNull(store)) {
      objectGraph.console.error(`can not find store: \`${name}\`.`)
      return null
    }

    if (!store[action]) {
      objectGraph.console.warn(`can not find store action: \`${action}\`.`)
      return null
    }

    return store[action](...args)
  }
}
