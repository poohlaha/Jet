/**
 * @fileOverview Store Intent
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
import { DispatcherIntent } from '../../../environment/dispatching/base/dispatcher'

export const STORE_INTENT_KIND = 'StoreIntent' as const

export interface StoreIntent extends DispatcherIntent<unknown> {
  $kind: typeof STORE_INTENT_KIND
  payload?: StorePayload
}

export interface StorePayload {
  name: string
  action: string
  args?: Array<any>
}

export function isStorageIntent(intent: DispatcherIntent<unknown>): intent is StoreIntent {
  return intent.$kind === STORE_INTENT_KIND
}

export function makeStorageIntent(options: Omit<StoreIntent, '$kind'>): StoreIntent {
  return { $kind: STORE_INTENT_KIND, ...options }
}
