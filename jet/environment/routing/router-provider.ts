/**
 * @fileOverview Router Provider
 * @date 2025-11-07
 * @author poohlaha
 * @description
 */
import * as Optional from '../../utils/optional'
import { WebObjectGraph } from '../objectGraph'

export function isRouteProvider(provider: { [K: string]: any }) {
  if (typeof provider !== 'object') {
    return false
  }

  return Optional.isSome(provider?.routes)
}

export function registerRoutesProvider(
  router: { [K: string]: any },
  provider: { [K: string]: any },
  objectGraph: WebObjectGraph
) {
  provider.routes(objectGraph).forEach((definition: { [K: string]: any } = {}) => {
    router.associate(definition.rules, definition.handler)
  })
}
