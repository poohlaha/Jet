/**
 * @fileOverview 提供运行时信息（平台、isServer/isClient），便于 handler 或其他逻辑基于环境做不同行为（例如 SSR 下避免某些 browser-only 操作）
 * @date 2025-11-10
 * @author poohlaha
 * @description 通过依赖注入的 runtime，可以用相同 Jet 代码在 SSR 与 client 之间运行（server 传入 server runtime）
 */
export interface Runtime {
    isServer: boolean;
    isClient: boolean;
    platform?: string;
}

export const browserRuntime: Runtime = {
    isServer: typeof window === 'undefined',
    isClient: typeof window !== 'undefined',
    platform: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
}
