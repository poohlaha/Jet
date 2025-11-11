/**
 * @fileOverview 延迟创建 logger（防止循环依赖）
 * @date 2025-11-07
 * @author poohlaha
 * @description
 */
import type { LoggerFactory, Logger } from './logger';

export class DeferredLoggerFactory implements LoggerFactory {

    constructor(private resolver: () => LoggerFactory) {}

    loggerFor(name: string): Logger {
        return this.resolver().loggerFor(name);
    }
}