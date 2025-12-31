/**
 * @fileOverview Cookit Intent
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
import { DispatcherIntent } from '../../../environment/dispatching/base/dispatcher'

export const COOKIE_INTENT_KIND = 'CookieSetIntent' as const

export interface Storage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface CookieIntent extends DispatcherIntent<unknown> {
  $kind: typeof COOKIE_INTENT_KIND
  key: string
  value: string
  domain?: string
  expires?: number
  path?: string
}

export function isCookieIntent(intent: DispatcherIntent<unknown>): intent is CookieIntent {
  return intent.$kind === COOKIE_INTENT_KIND
}

export function makeCookieIntent(options: Omit<CookieIntent, '$kind'>): CookieIntent {
  return { $kind: COOKIE_INTENT_KIND, ...options }
}
