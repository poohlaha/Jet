/**
 * @fileOverview Svelte 集成, 把 Jet 实例注入/读取到 Svelte 的上下文（setContext / getContext），以便组件能通过 getJet() 获得同一个 Jet 实例
 * @date 2025-11-10
 * @author poohlaha
 * @description 使用 Svelte 内置 context 机制是一种自然方式把运行时（Jet）共享到整个组件树，而不需要用全局变量或 prop drilling
 */
import { setContext, getContext } from 'svelte';
import type { Jet } from './jet';
const KEY = 'jet';

// 顶层（bootstrap/主入口）调用，使用 setContext(KEY, jet) 把 jet 放入 Svelte 的上下文树
export function setJetContext(jet: Jet) { setContext(KEY, jet); }

// 在任何子组件调用，返回注入的 Jet 实例；若不存在则抛错 Jet not found，提示忘了在 root 注入。
export function getJet(): Jet { const j = getContext<Jet>(KEY); if (!j) throw new Error('Jet not found in context'); return j; }