import image from '@astrojs/image';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://kyoya.dev',
  integrations: [tailwind(), react(), image(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'dracula',
    },
  },
});
