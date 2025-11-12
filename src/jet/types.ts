/**
 * @fileOverview 定义核心共享类型
 * @date 2025-11-10
 * @author poohlaha
 * @description 核心共享类型: Intent、ActionModel、Page、Opt, 所有模块都依赖这些基础类型
 */
import {Jet} from "./jet";
import {LoggerFactory} from "./logger/logger";

export type Opt<T> = T | null | undefined;

/**
 * type: 字符串标签，用于 type-guard / 分发到不同 UI 组件
 * webNavigation: 可选属性，表示页面应该呈现的导航信息(侧栏/面包屑等), 留作扩展
 */
export type Page =
    | { type: 'home'; title: string; welcomeText: string; webNavigation?: any }
    | { type: 'article'; title: string; content: string; webNavigation?: any }
    | { type: 'error'; title: string; errorMessage: string; webNavigation?: any };

// 外部: 路由、用户点击等
export type Intent<T = any> = {
    kind: string; // 语义化的意图种类, 如: flowAction | makeErrorPage
    payload?: T; // 意图的参数
    key?: string; // 一个可用于 prefetch/cache 的标识（例如 flow:/article），用于在 SSR 注入已加载的 page，从而在客户端避免重复请求
};

// 内部: 可被 handler 注册, 便于解耦
export type ActionModel = {
    $kind: string; // 实际要执行的 action 类型(用于匹配注册 handler)
    payload?: any; // action 的参数/有效载荷
};

export interface Dependencies {
    jet: Jet;
    logger: LoggerFactory,
    updateApp?: (props: any) => void;
}

export const LOGGER_PREFIX_NAME = 'Jet'

export const PERFORMED = Symbol('performed')
