import { defineConfig } from 'astro/config';
import nodeAdapter from '@astrojs/node';
import react from '@astrojs/react';

import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
	integrations: [react(), tailwind()],
	output: 'static',
	srcDir: 'frontend/src',
	publicDir: 'frontend/public',
});
