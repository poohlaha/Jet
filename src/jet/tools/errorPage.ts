/**
 * @fileOverview 错误页面
 * @date 2025-11-07
 * @author poohlaha
 * @description 把异常对象转换为 Page(错误页)
 */
import type { Page } from '../types';

// 统一错误显示：当 dispatch 中抛出异常时，我们希望把错误转换为可渲染的 ErrorPage，以便 UI 层走 then 分支而不是 catch（transformRejectionIntoErrorPage 思路）
export function makeErrorPage(error: unknown): Page {
    const message = error instanceof Error ? error.message : String(error ?? 'Unknown error');
    return { type: 'error', title: 'Error', errorMessage: message };
}

// 从 action.payload 取 error 并调用 makeErrorPage。便于将 makeErrorPage 注册为 action handler
export function errorHandler(action: any): Page {
    return makeErrorPage(action.payload?.error);
}