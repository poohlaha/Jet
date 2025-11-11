<script lang="ts">
    import LoadingSpinner from './LoadingSpinner.svelte';
    export let page;
    export let isFirstPage = false;
    // $: console.log('[PageResolver] got page', page);
</script>

{#await page}
    <div data-testid="page-loading">
        <LoadingSpinner delay={isFirstPage ? 1500 : 800} />
    </div>
{:then page}
    <p>Current route: {page?.route}</p>
    {#if page?.type === 'page'}
        {#key page.route}
            <!-- 动态加载组件 -->
            <svelte:component this={page.component} resolvedPage={page} />
        {/key}
    {:else if page?.type === 'error'}
        <div class="error">
            <h2>{page.title}</h2>
            <pre>{page.errorMessage}</pre>
        </div>
    {:else}
        <p>Unknown page type: {page?.type}</p>
    {/if}
{:catch error}
    <div class="error">Error: {String(error)}</div>
{/await}