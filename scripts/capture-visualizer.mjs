// Screenshots of the live visualizer (before/after). Uses system Chrome.
// Usage: node scripts/capture-visualizer.mjs <url> <out-dir> <label>
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const url = process.argv[2] || 'http://127.0.0.1:4321/visualizer/';
const outDir = process.argv[3] || '/tmp/viz-shots';
const label = process.argv[4] || 'shot';
fs.mkdirSync(outDir, { recursive: true });

const chrome = process.env.CHROME_PATH || '/usr/bin/google-chrome';

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
  ],
});

async function shot(page, name) {
  const file = path.join(outDir, `${label}-${name}.png`);
  const stage = await page.$('#visualizer');
  if (stage) {
    await stage.screenshot({ path: file });
  } else {
    await page.screenshot({ path: file, fullPage: false });
  }
  console.log('wrote', file);
}

async function settle(page) {
  await page.waitForSelector('#visualizer', { timeout: 20000 });
  // 3D path: wait until the loading overlay hides. Frame path: base image decoded.
  await page.waitForFunction(() => {
    const loading = document.getElementById('model-loading');
    if (loading) return loading.hidden === true;
    const img = document.getElementById('stage-base');
    return !!img && img.complete && img.naturalWidth > 0;
  }, { timeout: 45000 });
  await new Promise((r) => setTimeout(r, 400));
}

const desktop = await browser.newPage();
await desktop.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
await desktop.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
await settle(desktop);
await desktop.evaluate(() => document.getElementById('visualizer')?.scrollIntoView({ block: 'start' }));
await shot(desktop, 'desktop-clear');

await desktop.click('[data-tint-zone="front-side"]');
await desktop.click('[data-tint-zone="rear"]');
await desktop.click('[data-shade="dark"]');
await new Promise((r) => setTimeout(r, 500));
await shot(desktop, 'desktop-tint-dark');

await desktop.click('[data-mode="ppf"]');
await desktop.click('[data-ppf="full-front"]');
await new Promise((r) => setTimeout(r, 500));
await shot(desktop, 'desktop-ppf');

await desktop.click('[data-angle="rear"]');
await new Promise((r) => setTimeout(r, 700));
await shot(desktop, 'desktop-ppf-rear');

const mobile = await browser.newPage();
await mobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await mobile.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
await settle(mobile);
await mobile.evaluate(() => document.getElementById('visualizer')?.scrollIntoView({ block: 'start' }));
await mobile.click('[data-tint-zone="front-side"]');
await mobile.click('[data-shade="medium"]');
await new Promise((r) => setTimeout(r, 500));
await shot(mobile, 'mobile-tint');

await browser.close();
