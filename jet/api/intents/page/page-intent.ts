/**
 * @fileOverview Page Intent
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
import { DispatcherIntent } from '../../../environment/dispatching/base/dispatcher'

export const PAGE_INTENT_KIND = 'PageIntent' as const

export interface PageIntent extends DispatcherIntent<unknown> {
  $kind: typeof PAGE_INTENT_KIND
  payload?: Record<string, any>
}

export interface WithPageIntent {
  previewPlatform?: string
}

export function isPageIntent(intent: DispatcherIntent<unknown>): intent is PageIntent {
  return intent.$kind === PAGE_INTENT_KIND
}

export function makePageIntent(options: Omit<PageIntent, '$kind'>): PageIntent {
  return { $kind: PAGE_INTENT_KIND, ...options }
}
