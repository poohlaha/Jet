import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
	plugins: [tailwindcss(), svelte({
		compilerOptions: {
			compatibility: { componentApi: 4 },
			hmr: false
		},
	})],
	server: {
		port: 9099,
		host: true,
	},
});
