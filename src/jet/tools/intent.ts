/**
 * @fileOverview 语义化工厂
 * @date 2025-11-10
 * @author poohlaha
 * @description 提供便捷构造 Intent 的函数, 让上层调用更可读、易管理
 */

import type { Intent } from '../types';

// 使用工厂函数集中管理 key 的格式和 kind 的命名，避免各处字符串拼写错误；也方便将来扩展（例如自动添加 metrics tags）
export function makeFlowIntent(route: string, payload?: any): Intent {
    return { kind: 'flowAction', payload: { route, ...payload }, key: `flow:${route}` };
}

export function makeExternalUrlIntent(url: string): Intent {
    return { kind: 'externalUrlAction', payload: { url }, key: `external:${url}` };
}

// 用于把 error 转成 intent 并 dispatch
export function makeErrorPageIntent(error?: any): Intent {
    return { kind: 'makeErrorPage', payload: { error }, key: 'error' };
}