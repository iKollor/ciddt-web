import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
	integrations: [react(), tailwind()],
	output: 'server',
	adapter: node({
		mode: 'standalone',
	}),
	srcDir: 'frontend/src',
	publicDir: 'frontend/public',
	image: {
		remotePatterns: [{ protocol: 'https' }],
	},
});
