/**
 * @fileOverview 聚合多个 LoggerFactory，统一接口
 * @date 2025-11-07
 * @author poohlaha
 * @description
 */
import type { Logger, LoggerFactory } from './logger'

export class CompositeLoggerFactory implements LoggerFactory {
  private factories: LoggerFactory[]
  constructor(factories: LoggerFactory[]) {
    this.factories = factories
  }

  loggerFor(name: string): Logger {
    const loggers = this.factories.map(f => f.loggerFor(name))
    return {
      info: (...args) => loggers.forEach(l => l.info(...args)),
      warn: (...args) => loggers.forEach(l => l.warn(...args)),
      error: (...args) => loggers.forEach(l => l.error(...args)),
      debug: (...args) => loggers.forEach(l => l.debug(...args))
    }
  }
}
