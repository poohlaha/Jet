/**
 * @fileOverview 定义核心共享类型
 * @date 2025-11-10
 * @author poohlaha
 * @description 核心共享类型: Intent、ActionModel、Page、Opt, 所有模块都依赖这些基础类型
 */
import { Jet } from './jet'
import { LoggerFactory } from './shared/logger/logger'

export type Action =
  | { type: 'action'; func?: null | Function; result?: string; args?: Array<any> }
  | { type: 'error'; errorMessage: string; func?: null | Function; result?: string; args?: Array<any> }

// 外部: 路由、用户点击等
export type Intent<T = any> = {
  $kind: string // 语义化的意图种类, 如: flowAction | makeErrorPage | compoundAction
  payload?: T // 意图的参数
  key?: string // 一个可用于 prefetch/cache 的标识（例如 flow:/article），用于在 SSR 注入已加载的 page，从而在客户端避免重复请求
  data?: string
}

// 内部: 可被 handler 注册, 便于解耦
export type ActionModel = {
  $kind: string // 实际要执行的 action 类型(用于匹配注册 handler)
  payload?: any // action 的参数/有效载荷
  key?: string
}

export const ENVS = [
  'qa', // 开发版本
  'development', // 开发版本
  'production', // 正式发布版本
  'internal' // 内部测试版本（企业/QA）
] as const

export type ENV = (typeof ENVS)[number]

export const ENVIRONMENT = {
  QA: ENVS[0],
  DEV: ENVS[1],
  PROD: ENVS[2],
  INTERNAL: ENVS[3]
} as const

export type Environment = ENV

export interface Dependencies {
  jet: Jet
  logger: LoggerFactory
}
