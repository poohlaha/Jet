/**
 * @fileOverview 基础层，打印到控制台
 * @date 2025-11-07
 * @author poohlaha
 * @description
 */
import type { Logger, LoggerFactory } from './logger'

export class ConsoleLogger implements Logger {
  private isVConsole: boolean = typeof window !== 'undefined' && window.__VCONSOLE_INSTANCE

  constructor(private readonly prefix: string = '') {
    this.prefix = prefix || 'Jet'
    if (this.prefix.indexOf('[') === -1) {
      this.prefix = `[${this.prefix}]`
    }
  }

  info(...args: any[]) {
    if (this.isVConsole) {
      console.log(`🟢 ${this.prefix}`, ...args)
    } else {
      console.log(`🟢%c${this.prefix}`, 'color: green; font-weight: bold;', ...args)
    }
  }

  warn(...args: any[]) {
    if (this.isVConsole) {
      console.warn(`🟡 ${this.prefix}`, ...args)
    } else {
      console.warn(`🟡%c${this.prefix}`, 'color: orange; font-weight: bold;', ...args)
    }
  }

  error(...args: any[]) {
    if (this.isVConsole) {
      console.error(`🔴 ${this.prefix}`, ...args)
    } else {
      console.error(`🔴%c${this.prefix}`, 'color: red; font-weight: bold;', ...args)
    }
  }

  debug(...args: any[]) {
    if (this.isVConsole) {
      console.debug(`🐞 ${this.prefix}`, ...args)
    } else {
      console.debug(`🐞%c${this.prefix}`, 'color: gray; font-weight: bold;', ...args)
    }
  }
}

export class ConsoleLoggerFactory implements LoggerFactory {
  loggerFor(name: string): Logger {
    return new ConsoleLogger(name)
  }
}
