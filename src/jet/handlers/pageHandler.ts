/**
 * @fileOverview 页面导航器
 * @date 2025-11-10
 * @author poohlaha
 * @description
 */
import {Dependencies} from "../types";

export const PAGE_ACTION_KIND = 'pageAction';

export async function pageHandler(action: any) {
    const route = action.payload?.route || '/'

    // @ts-ignore
    const pages = import.meta.glob('../../pages/*.svelte');
    const name = route === '/' ? 'Home' : route.slice(1).replace(/^\w/, (c: string) => c.toUpperCase());
    const key = `../../pages/${name}.svelte`;

    let loader = pages[key] || pages['../../pages/NotFound.svelte'];
    const mod = await loader();
    // @ts-ignore
    const component = mod.default;

    return { type: 'page', route, component };
}

export async function registerHandler(dependencies: Dependencies) {
    const { jet, logger } = dependencies;
    jet.onAction(PAGE_ACTION_KIND, async (action: any) => {
        return await pageHandler(action)
    })
}