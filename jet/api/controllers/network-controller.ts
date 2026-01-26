/**
 * @fileOverview Network Controller
 * @date 2025-11-07
 * @author poohlaha
 * @description
 */
import { IntentController } from '../../environment/dispatching/base/dispatcher'
import { Optional } from '../../utils/optional'
import {HttpResponse, IHttpRequestProps} from '../../dependencies/net/types'
import { NETWORK_INTENT_KIND, NetworkIntent } from '../intents/network/network-intent'
import { WebObjectGraph } from '../../environment/objectGraph'
import Utils from '../../utils/utils'
import { Net } from '../../dependencies/net'

export const NetworkIntentController: IntentController<NetworkIntent> = {
  $intentKind: NETWORK_INTENT_KIND,

  // @ts-ignore
  async perform(intent: NetworkIntent, objectGraph: WebObjectGraph): Promise<Optional<HttpResponse>> {
    const payload = (intent.payload || {}) as IHttpRequestProps
    let url = payload.url || ''
    if (Utils.isBlank(url)) {
      objectGraph.console.error('url did not resolve to a network controller', url)
      return null
    }

    // 用于上报
    const data = await objectGraph.metricsIdentifiers?.getMetricsFieldsForContexts([
      {
        type: 'api_request',
        key: `${intent.key || ''}|${url}`
      }
    ])

    objectGraph.console.log('filled point data: ', data)

    const once = intent.once ?? true
    const needFeaturesCallbacks = intent.needFeaturesCallbacks ?? true
    if (once) {
      return (objectGraph.network as Net).once(payload, intent.fetchProps || {}, needFeaturesCallbacks)
    }

    return (objectGraph.network as Net).send(payload, intent.fetchProps || {}, needFeaturesCallbacks)
  }
}
