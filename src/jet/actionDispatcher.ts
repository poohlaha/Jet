/**
 * @fileOverview 注册和执行动作
 * @date 2025-11-07
 * @author poohlaha
 * @description 注册各种 action handler, 负责把 ActionModel 派发给对应 handler 并返回 handler 的产出
 */

import type { ActionModel } from './types';

export type ActionHandler = (action: ActionModel) => Promise<any> | any;

export class ActionDispatcher {
	private handlers = new Map<string, ActionHandler>();

	register(kind: string, handler: ActionHandler) {
		this.handlers.set(kind, handler);
	}

	async perform(action: ActionModel) {
		const handler = this.handlers.get(action.$kind);
		if (!handler) {
			throw new Error(`No handler for action kind ${action.$kind}`);
		}
		return await handler(action);
	}
}
