/**
 * @fileOverview 注册和执行动作
 * @date 2025-11-07
 * @author poohlaha
 * @description 注册各种 action handler, 负责把 ActionModel 派发给对应 handler 并返回 handler 的产出
 */

import type { ActionModel } from '../../types'
import { UNSUPPORTED } from '../../config'

export type ActionHandler = (action: ActionModel) => Promise<any> | any

export class ActionDispatcher {
  private implementations: Record<string, any>

  constructor() {
    this.implementations = {}
  }

  register(type: string, implementation: any) {
    if (type in this.implementations) {
      console.error(`An implementation is already registered for ${type}`)
    }

    this.implementations[type] = implementation
  }

  async perform(action: ActionModel) {
    const handler = this.implementations[action.$kind]
    if (!handler) {
      console.error(`No handler for action kind ${action.$kind}`)
      return UNSUPPORTED
    }

    return await handler(action)
  }
}
