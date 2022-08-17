import image from '@astrojs/image';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import robotsTxt from 'astro-robots-txt';
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://kyoya.dev',
  experimental: {
    integrations: true,
  },
  integrations: [tailwind(), react(), image(), sitemap(), robotsTxt()],
  markdown: {
    shikiConfig: {
      theme: 'dracula',
    },
  },
});
