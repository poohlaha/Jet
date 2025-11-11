/**
 * @fileOverview 录制运行时日志
 * @date 2025-11-07
 * @author poohlaha
 * @description
 */
import type { Logger, LoggerFactory } from './logger';

type LogRecord = {
    level: 'info' | 'warn' | 'error' | 'debug';
    source: string;
    args: any[];
    timestamp: number;
};

export class RecordingLogger implements Logger {
    constructor(private readonly source: string, private buffer: LogRecord[]) {
        this.source = source || 'Jet'
        if (this.source.indexOf('[') == -1) {
            this.source = `[${this.source}]`
        }
    }

    private record(level: LogRecord['level'], args: any[]) {
        this.buffer.push({
            level,
            source: this.source,
            args,
            timestamp: Date.now(),
        });
    }

    info(...args: any[]) {
        this.record('info', args);
        console.log(`%c${this.source}`, 'color: green;', ...args);
    }

    warn(...args: any[]) {
        this.record('warn', args);
        console.warn(`%c${this.source}`, 'color: orange;', ...args);
    }

    error(...args: any[]) {
        this.record('error', args);
        console.error(`%c${this.source}`, 'color: red;', ...args);
    }

    debug(...args: any[]) {
        this.record('debug', args);
        console.debug(`%c${this.source}`, 'color: gray;', ...args);
    }
}

export class RecordingLoggerFactory implements LoggerFactory {
    private buffer: LogRecord[] = [];

    loggerFor(source: string): Logger {
        return new RecordingLogger(source, this.buffer);
    }

    exportLogs(): LogRecord[] {
        return [...this.buffer];
    }

    clear() {
        this.buffer = [];
    }
}