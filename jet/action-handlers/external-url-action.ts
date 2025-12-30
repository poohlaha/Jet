/**
 * @fileOverview ExternalUrlAction
 * @date 2025-11-10
 * @author poohlaha
 * @description
 */

import { ActionModel, Dependencies } from '../types'
import { LOGGER_PREFIX_NAME, PERFORMED } from '../config'
import { ExternalUrlAction } from '../api/models/actions/actions'

export const EXTERNAL_URL_ACTION_KIND = 'ExternalUrlAction'

export function registerHandler(dependencies: Dependencies) {
  const { jet, logger } = dependencies

  const log = logger.loggerFor(`[${LOGGER_PREFIX_NAME} ${EXTERNAL_URL_ACTION_KIND}]`)

  log.info(`Registering ${EXTERNAL_URL_ACTION_KIND}Handler`)

  jet.onAction('ExternalUrlAction', async (actionModel: ActionModel) => {
    log.info('received external url action:', actionModel.$kind)
    const action = (actionModel.payload?.action || {}) as ExternalUrlAction
    const url = action.getUrl() || ''
    const external = action.getExternal()
    const replace = action.getReplace()

    if (external) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      replace ? window.location.replace(url) : (window.location.href = url)
    } else {
      const useNavigate: any = jet.objectGraph.navigate
      if (useNavigate) {
        useNavigate?.(url, { replace: replace })
      } else {
        throw new Error('No navigate registered to object graph.')
      }
    }

    return PERFORMED
  })
}
