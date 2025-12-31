/**
 * @fileOverview uniqueId
 * @date 2025-11-10
 * @author poohlaha
 * @description
 */
import { LoggerFactory } from '../shared/logger/logger'

export const UNIQUE_ID_CONTEXT_NAME = 'web-unique-id'

interface UniqueContext {
  nextId: number
}

export function initializeUniqueIdContext(context: Map<string, unknown>, loggerFactory: LoggerFactory): void {
  const logger = loggerFactory.loggerFor('uniqueIdContext')

  if (context.has(UNIQUE_ID_CONTEXT_NAME)) {
    logger.warn(`${UNIQUE_ID_CONTEXT_NAME} context has already been created. Cannot be created more than once`)
  } else {
    const INITAL_STATE: UniqueContext = { nextId: 0 }
    context.set(UNIQUE_ID_CONTEXT_NAME, INITAL_STATE)
  }
}

export type UniqueIdGenerator = () => string

export function maybeGetUniqueIdGenerator(context: Map<string, unknown> = new Map()): UniqueIdGenerator | undefined {
  const UNIQUE_ID_PREFIX = 'uid-'
  const state: UniqueContext = context.get(UNIQUE_ID_CONTEXT_NAME) as UniqueContext
  const isNextIdANumber = typeof state?.nextId === 'number'

  if (!isNextIdANumber) {
    return
  }

  return () => {
    const id = `${UNIQUE_ID_PREFIX}${state.nextId}`
    state.nextId += 1
    return id
  }
}

export function getUniqueIdGenerator(context: Map<string, unknown> = new Map()): UniqueIdGenerator {
  const uniqueIdGenerator = maybeGetUniqueIdGenerator(context)

  if (!uniqueIdGenerator) {
    throw new Error(`${UNIQUE_ID_CONTEXT_NAME} context has not been initialized. Initialize at application bootstrap.`)
  }

  return uniqueIdGenerator
}
