/**
 * @fileOverview Storage Intent
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
import { DispatcherIntent } from '../../../environment/dispatching/base/dispatcher'

export const STORAGE_INTENT_KIND = 'StorageIntent' as const

export interface Storage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface StorageIntent extends DispatcherIntent<unknown> {
  $kind: typeof STORAGE_INTENT_KIND
  key: string
  value: string
}

export function isStorageIntent(intent: DispatcherIntent<unknown>): intent is StorageIntent {
  return intent.$kind === STORAGE_INTENT_KIND
}

export function makeStorageIntent(options: Omit<StorageIntent, '$kind'>): StorageIntent {
  return { $kind: STORAGE_INTENT_KIND, ...options }
}
