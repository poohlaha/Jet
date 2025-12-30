/**
 * @fileOverview ExternalUrlAction
 * @date 2025-11-10
 * @author poohlaha
 * @description
 */

import { Dependencies } from '../types'
import { LOGGER_PREFIX_NAME, PERFORMED } from '../config'
import { ExternalUrlAction } from '../models/actions/actions'

export const EXTERNAL_URL_ACTION_KIND = 'ExternalUrlAction'

export function registerHandler(dependencies: Dependencies) {
  const { jet, logger } = dependencies

  const log = logger.loggerFor(`[${LOGGER_PREFIX_NAME} ${EXTERNAL_URL_ACTION_KIND}]`)

  log.info(`Registering ${EXTERNAL_URL_ACTION_KIND}Handler`)

  jet.onAction('ExternalUrlAction', async (action: ExternalUrlAction) => {
    log.info('received external URL action:', action)
    return PERFORMED
  })
}
