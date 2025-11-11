/**
 * @fileOverview 事件绑定中心
 * @date 2025-11-10
 * @author poohlaha
 * @description 统一注册所有 Action Handler（flowAction、externalUrlAction、compoundAction 等）。
 */
import {Dependencies} from "./types";

import { registerHandler as registerFlowActionHandler } from './handlers/flowAction'
import { registerHandler as registerExternalURLActionHandler } from './handlers/externalUrlAction'
import { registerHandler as registerCompoundActionHandler } from './handlers/compoundAction'

export function registerActionHandlers(dependencies: Dependencies) {
    registerCompoundActionHandler(dependencies);
    registerFlowActionHandler(dependencies);
    registerExternalURLActionHandler(dependencies);
}