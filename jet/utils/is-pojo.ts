/**
 * @fileOverview POJO
 * @date 2023-12-05
 * @author poohlaha
 */
export function isPOJO(arg: unknown): arg is Record<string, unknown> {
  if (!arg || typeof arg !== 'object') {
    return false
  }

  const proto = Object.getPrototypeOf(arg)
  if (!proto) {
    return true // `Object.create(null)`
  }

  return proto === Object.prototype
}
