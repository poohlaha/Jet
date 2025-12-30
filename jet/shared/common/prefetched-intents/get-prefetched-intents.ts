import { getCookie } from '../../../utils/cookie'
import { deserializeServerData, stableStringify } from './server-data'
import { type PrefetchedIntent, isPrefetchedIntents } from './types'
import { LoggerFactory } from '../../../shared/logger/logger'
import { isSome } from '../../../utils/utils'
import { LOGGER_PREFIX_NAME } from '../../../config'

export function getPrefetchedIntents(
  loggerFactory: LoggerFactory,
  options?: { evenIfSignedIn?: boolean; featureKitItfe?: string }
): Map<string, unknown> {
  const logger = loggerFactory.loggerFor(`${LOGGER_PREFIX_NAME} Prefetched Intents`)
  const evenIfSignedIn = options?.evenIfSignedIn
  const itfe = options?.featureKitItfe

  const data = deserializeServerData()
  if (!data || !isPrefetchedIntents(data)) {
    return new Map()
  }

  if ((!evenIfSignedIn && getCookie('media-user-token')) || itfe) {
    logger.info('Discarding prefetched intents - signed in user or ITFE enabled')
    return new Map()
  }

  logger.debug('received prefetched intents from the server:', data)
  return new Map(
    data
      .map(({ intent, data }: PrefetchedIntent): [string, unknown] | null => {
        try {
          if (intent.$kind.includes('Library')) {
            return null
          }
          // NOTE: PrefetchedIntents.get depends on stableStringify
          return [stableStringify(intent), data]
        } catch (e) {
          return null
        }
      })
      .filter(isSome)
  )
}
