/**
 * @fileOverview 运行时环境初始化模块
 * @date 2025-11-07
 * @author poohlaha
 * @description 用于在开发/内部环境加载特性开关系统
 */
import {LoggerFactory} from "../../logger/logger";
import {RecordingLoggerFactory} from "../../logger/recordingLogger";
import {LOGGER_PREFIX_NAME} from "../../types";

export interface FeatureKit {
    itfe: string,
    isEnabled(flag: string): boolean;
    enable(flag: string): void;
    disable(flag: string): void;
    list(): string[];
}

export async function setupRuntimeFeatures(
    logger: LoggerFactory
): Promise<{
    recordingLogger: RecordingLoggerFactory;
    featureKit?: FeatureKit;
    recordingEnabled?: boolean;
} | void> {
    // 判断环境
    // @ts-ignore
    if (import.meta.env.APP_SCOPE === 'internal' || import.meta.env.DEV) {
        const recordingLogger = new RecordingLoggerFactory();

        // 默认启用 radar
        const enabledFlags = new Set<string>(['showRadar']);

        const featureKit: FeatureKit = {
            itfe: 'mock-itfe-id',
            isEnabled: (flag: string) => enabledFlags.has(flag),
            enable: (flag: string) => enabledFlags.add(flag),
            disable: (flag: string) => enabledFlags.delete(flag),
            list: () => Array.from(enabledFlags),
        };

        (window as any).JetDebug = {
            ...(window as any).JetDebug,
            featureKit,
            JetLogs: {
                export: () => recordingLogger.exportLogs(),
                clear: () => recordingLogger.clear(),
            },
        };

        // js 事件循环, queueMicrotask 比 Promise.then 还早执行
        queueMicrotask(() => {
            try {
                console.log(`%c[${LOGGER_PREFIX_NAME} queueMicrotask] Executed microtask`, 'color: green;');
                const log = logger.loggerFor(`${LOGGER_PREFIX_NAME} RuntimeFeatures`);
                log.info('Runtime features initialized.');
                log.info(`FeatureKit itfe = ${featureKit.itfe}`);
                log.info(`Enabled flags = ${featureKit.list().join(', ') || '(none)'}`);
                log.info('Runtime features initialized (deferred logger)');
            } catch {
                console.warn(`[${LOGGER_PREFIX_NAME} RuntimeFeatures] Deferred logger not ready yet`);
            }
        });

        return {
            recordingLogger,
            featureKit,
            recordingEnabled: true,
        };
    }
}