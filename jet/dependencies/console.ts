/**
 * @fileOverview 控制台
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
import { Logger, LoggerFactory } from '../shared/logger/logger'
import { CONTEXT_NAME } from '../config'

export class WebConsole {
  private readonly logger: Logger

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.loggerFor(`${CONTEXT_NAME} Console`)
  }

  error(...data: unknown[]): void {
    this.logger.error(...data)
  }

  info(...data: unknown[]): void {
    this.logger.info(...data)
  }

  log(...data: unknown[]): void {
    this.logger.info(...data)
  }

  warn(...data: unknown[]): void {
    this.logger.warn(...data)
  }
}
