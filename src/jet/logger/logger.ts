/**
 * @fileOverview 日志
 * @date 2025-11-07
 * @author poohlaha
 * @description
 * ConsoleLoggerFactory: 基础层，打印到控制台
 * ErrorKitLoggerFactory: 错误上报层（把错误发到 ErrorKit）
 * RecordingLogger: 录制调试日志
 * CompositeLoggerFactory: 聚合多个 LoggerFactory，统一接口
 * DeferredLoggerFactory: 延迟创建 logger（防止循环依赖）
 */
export interface Logger {
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    debug(...args: any[]): void;
}

export interface LoggerFactory {
    loggerFor(name: string): Logger;
}