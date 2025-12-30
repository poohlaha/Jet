/**
 * @fileOverview 事件绑定中心
 * @date 2025-11-10
 * @author poohlaha
 * @description 统一注册所有 Action Handler（flowAction、externalUrlAction、compoundAction 等）。
 */
import { Dependencies } from '../types'

import { registerHandler as registerCompoundActionHandler } from './compound-action'
import { registerHandler as registerExternalURLActionHandler } from './external-url-action'

export function registerActionHandlers(dependencies: Dependencies) {
  registerCompoundActionHandler(dependencies)
  registerExternalURLActionHandler(dependencies)
}
