/**
 * @fileOverview Optional
 * @date 2023-12-05
 * @author poohlaha
 */
export type Optional<T> = T | None
export type None = null | undefined

export function isSome<T>(optional: Optional<T>): optional is T {
  return optional !== null && optional !== undefined
}

export function isNone<T>(optional: Optional<T>): optional is None {
  return optional === null || optional === undefined
}
