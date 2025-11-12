/**
 * @fileOverview 基础层，打印到控制台
 * @date 2025-11-07
 * @author poohlaha
 * @description
 */
import type { LoggerFactory } from './logger';
import {LOGGER_PREFIX_NAME} from "../types";
import {RecordingLoggerFactory} from "./recordingLogger";

export async function setupRuntimeFeatures(
    logger: LoggerFactory
): Promise<{
    recordingLogger: LoggerFactory;
    featureKit?: any;
    recordingEnabled?: boolean;
}> {
    const recordingLogger = new RecordingLoggerFactory();

    (window as any).__JET__LOGS__ = {
        export: () => recordingLogger.exportLogs(),
        clear: () => recordingLogger.clear(),
    };

    // 等待下一 tick，确保 logger 已准备
    await Promise.resolve();

    try {
        const log = logger.loggerFor(`${LOGGER_PREFIX_NAME} RuntimeFeatures`);
        log.info('Setting up runtime features...');

        log.info('Runtime features ready, RecordingLoggerFactory initialized ✅');
    } catch {
        console.warn(`%c[${LOGGER_PREFIX_NAME} RuntimeFeatures]%c logger not yet ready, continuing...`, 'color: green;', 'color: orange;');
    }

    return {
        recordingLogger,
        featureKit: {
            itfe: 'mock-itfe-id',
        },
        recordingEnabled: true,
    };
}