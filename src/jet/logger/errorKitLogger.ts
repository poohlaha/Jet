/**
 * @fileOverview 捕获并上报错误
 * @date 2025-11-07
 * @author poohlaha
 * @description
 */
import type {Logger, LoggerFactory} from './logger'
import {LOGGER_PREFIX_NAME} from "../types";

export function setupErrorKit(config: Record<string, any>, logger: LoggerFactory) {
    const log = logger.loggerFor(`${LOGGER_PREFIX_NAME} ErrorKit`);

    return {
        captureError(error: any, context?: any) {
            log.error('Captured Error:', error, context);
            // 模拟发送错误到远程
            // fetch('/report-error', { method: 'POST', body: JSON.stringify({ error, context }) })
        },
        config,
    };
}

/**
 * 在捕获 error 日志时自动调用 errorKit.captureError()
 */
export class ErrorKitLoggerFactory implements LoggerFactory {
    constructor(private errorKit: any) {}

    loggerFor(name: string): Logger {
        return {
            info: (..._args) => {},
            warn: (..._args) => {},
            error: (...args) => {
                console.log(`%c[${LOGGER_PREFIX_NAME} %cErrorKitLogger:${name}]`, 'color: green;', 'color: red;', ...args);
                try {
                    this.errorKit.captureError(args[0], { source: name });
                } catch (err) {
                    console.error(`%c[${LOGGER_PREFIX_NAME} $cErrorKitLogger failed:]`, 'color: green;', 'color: red;', err);
                }
            },
            debug: (..._args) => {},
        };
    }
}