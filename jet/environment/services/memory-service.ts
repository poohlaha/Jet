/**
 * @fileOverview Memory Service
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
import { MemoryIntent } from '../../api/intents/memory/memory-intent'
import { Jet } from '../../jet'
import { WebRuntime } from '../runtime'

const SERVICE_NAME = 'MemoryService'

export function registerService(jet: Jet, runtime: WebRuntime) {
  runtime.exportingService(SERVICE_NAME, {
    async set({ key, value }: MemoryIntent) {
      return jet.dispatch({
        $kind: 'MemorySetIntent',
        key,
        value
      })
    },

    async get(key: string = '') {
      return jet.dispatch({
        $kind: 'MemoryGetIntent',
        key
      })
    },

    async remove(key: string = '') {
      return jet.dispatch({
        $kind: 'MemoryRemoveIntent',
        key
      })
    },

    async clear() {
      return jet.dispatch({
        $kind: 'MemoryClearIntent'
      })
    }
  })
}
