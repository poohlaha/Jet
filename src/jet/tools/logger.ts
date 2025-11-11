/**
 * @fileOverview 日志
 * @date 2025-11-07
 * @author poohlaha
 * @description 提供可插拔的 logger 接口与一个基于 console 的实现 consoleLogger。供 Jet 和 handler 打印信息
 */
export interface Logger {
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  debug(...args: any[]): void;
}

export const consoleLogger: Logger = {
  info: (...a) => console.info('%c[jet]', 'color:green;', ...a),
  warn: (...a) => console.warn('%c[jet]', 'color:orange;', ...a),
  error: (...a) => console.error('%c[jet]', 'color:red;', ...a),
  debug: (...a) => console.debug('%c[jet]', 'color:blue;', ...a),
};