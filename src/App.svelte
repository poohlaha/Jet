<script lang="ts">
    import PageResolver from './components/PageResolver.svelte';
    import {makeErrorPageIntent, makeFlowIntent} from './jet/tools/intent';
    // import { getJet } from './jet/svelte';
    import { setJetContext } from './jet/svelte'

   // const jet = getJet();

    // 现在 jet 是通过 props 传进来的 —— 可以在组件初始化时调用 setJetContext
    export let jet: any;

    // Jet runtime 会负责更新 page，这里只是声明一个占位
    export let page: Promise<any> | any = new Promise(() => {});
    export let isFirstPage: boolean = true;
    // export let registerApp: (instance: any) => void;

    setJetContext(jet);

    $: pageWithRejectionErrorPage = transformRejectionIntoErrorPage(page);

    function transformRejectionIntoErrorPage(
        page: any,
    ) {
        if (!(page instanceof Promise)) {
            return page;
        }

        return (async () => {
            try {
                return await page;
            } catch (error) {
                return jet.dispatch(
                    makeErrorPageIntent({
                        error: error instanceof Error ? error : null,
                    }),
                );
            }
        })();
    }

    function loadRoute(route: string) {
        console.log('%c[App] loadRoute ->', 'color:green;', route);
        const intent = makeFlowIntent(route);

        // 调用 dispatch 并更新 page
        const result = jet.dispatch(intent);
        page = transformRejectionIntoErrorPage(result);
        isFirstPage = false;

        // 同步更新 App 自身（触发重新渲染）
        jet.__app?.$set({ page, isFirstPage });
    }

    /*
    $: {
        const route = window.location.pathname || '/';
        loadRoute(route);
    }
     */

    // 进行 pushState 并重新 dispatch
    function goto(route: string) {
        history.pushState({}, '', route);

        console.log('%c[App] loadRoute ->', 'color:green;', route);
        console.log('%c[App] jet', 'color:green;', jet);
        jet.dispatch(makeFlowIntent(route));
        // loadRoute(route);
    }

    /*
    onMount(() => {
        registerApp?.({
            $set: (values: any) => {
                page = values.page;
                isFirstPage = values.isFirstPage;
            },
        });
        console.log('[App] registerApp 调用完成');
    });
     */
</script>

<div class="app-container" data-testid="app-container">
    <div class="navigation-container">
        <nav>
            <a href="/" on:click|preventDefault={() => goto('/')}>Home</a> |
            <a href="/about" on:click|preventDefault={() => goto('/about')}>About</a> |
            <a href="/article" on:click|preventDefault={() => goto('/article')}>Article</a> |
            <a href="/external" on:click|preventDefault={() => goto('/external')}>External</a> |
            <a href="/no" on:click|preventDefault={() => goto('/no')}>404</a>
        </nav>
    </div>

    <div class="page-container">
        <PageResolver {page} {isFirstPage} />
    </div>
</div>
