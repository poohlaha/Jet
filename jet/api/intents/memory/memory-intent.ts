/**
 * @fileOverview Memory Intent
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
import { DispatcherIntent } from '../../../environment/dispatching/base/dispatcher'

export const MEMORY_INTENT_KIND = 'MemoryIntent' as const

export interface MemoryIntent extends DispatcherIntent<unknown> {
  $kind: typeof MEMORY_INTENT_KIND
  key: string
  value: string
}

export function isMemoryIntent(intent: DispatcherIntent<unknown>): intent is MemoryIntent {
  return intent.$kind === MEMORY_INTENT_KIND
}

export function makeMemoryIntent(options: Omit<MemoryIntent, '$kind'>): MemoryIntent {
  return { $kind: MEMORY_INTENT_KIND, ...options }
}
