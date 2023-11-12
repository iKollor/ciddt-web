import { defineConfig } from 'astro/config';
import nodeAdapter from '@astrojs/node';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	integrations: [react()],
	output: 'static',
	srcDir: 'frontend/src',
	publicDir: 'frontend/public',
});
