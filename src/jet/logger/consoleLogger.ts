/**
 * @fileOverview 基础层，打印到控制台
 * @date 2025-11-07
 * @author poohlaha
 * @description
 */
import type {Logger, LoggerFactory} from './logger'

export class ConsoleLogger implements Logger {

    constructor(private readonly prefix: string = '') {
        this.prefix = prefix || 'Jet'
        if (this.prefix.indexOf('[') == -1) {
            this.prefix = `[${this.prefix}]`
        }
    }

    info(...args: any[]) {
        console.log(`%c${this.prefix}`, 'color: green;', ...args);
    }

    warn(...args: any[]) {
        console.warn(`%c${this.prefix}`, 'color: orange;', ...args);
    }

    error(...args: any[]) {
        console.error(`%c${this.prefix}`, 'color: red;', ...args);
    }

    debug(...args: any[]) {
        console.debug(`%c${this.prefix}`, 'color: gray;', ...args);
    }
}

export class ConsoleLoggerFactory implements LoggerFactory {

    loggerFor(name: string): Logger {
        return new ConsoleLogger(name);
    }
}