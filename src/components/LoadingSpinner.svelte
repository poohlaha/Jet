<script lang="ts">
    export let delay = 0;
    let show = false;
    setTimeout(() => (show = true), delay);
</script>

{#if show}
    <div class="spinner">Loading...</div>
{/if}

<style>
    .spinner {
        animation: spin 1s linear infinite;
        border: 3px solid #ddd;
        border-top: 3px solid #333;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        margin: 2rem auto;
    }

    @keyframes spin {
        from {
            transform: rotate(0);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
