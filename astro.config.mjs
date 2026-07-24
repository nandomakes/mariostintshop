// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Canonical domain — must match SITE.url in src/consts.ts (non-www).
  site: 'https://mariostintshop.com',
  integrations: [tailwind(), sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
});
