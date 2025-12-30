/**
 * @fileOverview 执行多个子 action
 * @date 2025-11-10
 * @author poohlaha
 * @description
 */
import { Dependencies } from '../types'
import { LOGGER_PREFIX_NAME, PERFORMED } from '../config'

export const COMPOUND_ACTION_KIND = 'CompoundAction'

export function registerHandler(dependencies: Dependencies) {
  const { jet, logger } = dependencies

  const log = logger.loggerFor(`[${LOGGER_PREFIX_NAME} ${COMPOUND_ACTION_KIND}]`)

  log.info(`Registering ${COMPOUND_ACTION_KIND}Handler`)

  jet.onAction(COMPOUND_ACTION_KIND, async (action: any) => {
    log.info(`received ${COMPOUND_ACTION_KIND}:`, action)

    /*
    // Perform actions in sequence
    await jet.perform(action).catch(e => {
      throw new Error(`an error occurred while handling CompoundAction: ${e}`)
    })
     */

    return PERFORMED
  })
}
