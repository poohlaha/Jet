/**
 * @fileOverview Storage Service
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
import { StorageIntent } from '../../api/intents/storage/storage-intent'
import { Jet } from '../../jet'
import { WebRuntime } from '../runtime'

const SERVICE_NAME = 'StorageService'

export function registerService(jet: Jet, runtime: WebRuntime) {
  runtime.exportingService(SERVICE_NAME, {
    async setLocal({ key, value }: StorageIntent) {
      return jet.dispatch({
        $kind: 'LocalStorageSetIntent',
        key,
        value
      })
    },

    async getLocal(key: string = '') {
      return jet.dispatch({
        $kind: 'LocalStorageGetIntent',
        key
      })
    },

    async removeLocal(key: string = '') {
      return jet.dispatch({
        $kind: 'LocalStorageRemoveIntent',
        key
      })
    },

    async clearLocal() {
      return jet.dispatch({
        $kind: 'LocalStorageClearIntent'
      })
    },

    async setSession({ key, value }: StorageIntent) {
      return jet.dispatch({
        $kind: 'SessionStorageSetIntent',
        key,
        value
      })
    },

    async getSession(key: string = '') {
      return jet.dispatch({
        $kind: 'SessionStorageRemoveIntent',
        key
      })
    },

    async removeSession(key: string = '') {
      return jet.dispatch({
        $kind: 'SessionStorageRemoveIntent',
        key
      })
    },

    async clearSession() {
      return jet.dispatch({
        $kind: 'SessionStorageClearIntent'
      })
    }
  })
}
