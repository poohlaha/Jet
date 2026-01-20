/**
 * @fileOverview Network Service
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
import { NetworkIntent } from '../../api/intents/network/network-intent'
import { IHttpRequestFetchProps, IHttpRequestProps } from '../../dependencies/net/types'
import { Jet } from '../../jet'
import { WebRuntime } from '../runtime'

const SERVICE_NAME = 'NetworkService'

export function registerService(jet: Jet, runtime: WebRuntime) {
  runtime.exportingService(SERVICE_NAME, {
    async request(payload: IHttpRequestProps, fetchProps?: IHttpRequestFetchProps, key: string = '', once: boolean = true) {
      return jet.dispatch<NetworkIntent>({
        $kind: 'NetworkIntent',
        payload,
        fetchProps,
        key,
        once
      })
    }
  })
}
