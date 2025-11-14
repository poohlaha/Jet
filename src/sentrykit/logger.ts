/**
 * @fileOverview 内部调试日志
 * @date 2025-11-07
 * @author poohlaha
 * @description
 */
import { __SENTRY_DEBUG__ } from './types';

const originalLog = console.log;

let enabled = false;

export const enableLogger = () => {
	enabled = true;
};

export const createLogger =
	(prefix: string) =>
	(...args: any[]) => {
		if ((typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__) && enabled) {
			// 生成格式化字符串: "%c[prefix] %carg1 %carg2 ..."
			const styles = [];
			let format = `%c${prefix}`;
			styles.push('color: green; font-weight: bold;');

			for (let i = 0; i < args.length; i++) {
				format += ' %c%s';
				styles.push('color: gray;'); // args 的颜色
			}

			originalLog(format, ...styles, ...args);
		}
	};
