<script lang="ts">
    export let resolvedPage;
</script>

{#if resolvedPage?.type === 'home'}
    <h1>{resolvedPage.title}</h1>
    <p>{resolvedPage.welcomeText}</p>
{:else if resolvedPage?.type === 'article'}
    <h1>{resolvedPage.title}</h1>
    <p>{resolvedPage.content}</p>
{:else if resolvedPage?.type === 'error'}
    <h2>⚠️ {resolvedPage.title}</h2>
    <pre>{resolvedPage.errorMessage}</pre>
{:else}
    <p>Unknown page</p>
{/if}