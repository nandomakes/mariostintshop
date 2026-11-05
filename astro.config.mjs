// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Canonical domain — must match SITE.url in src/consts.ts (www).
  // Vercel 308-redirects the apex (mariostintshop.com) to www, so canonical
  // tags, og:url and sitemap <loc>s must all use www or they point at a
  // redirect. Also keep public/robots.txt's Sitemap: line on www.
  site: 'https://www.mariostintshop.com',
  integrations: [
    tailwind(),
    sitemap({
      // /quote-sent/ is a noindex thank-you page. Keep it out of the sitemap
      // even if a future page starts linking to it.
      filter: (page) => new URL(page).pathname.replace(/\/+$/, '') !== '/quote-sent',
      // Static brochure site with no per-page content dates — the build date
      // is the honest lastmod signal.
      serialize(item) {
        if (new URL(item.url).pathname.replace(/\/+$/, '') === '/quote-sent') return undefined;
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
});
