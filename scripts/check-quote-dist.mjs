// Confirms the built site no longer embeds the TintWiz iframe, that the seven
// quote pages each have one outbound form link, and that the dropped
// confirmation route is not in the build or the sitemap.
import fs from 'node:fs';
import path from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const QUOTE_URL = 'https://app.tintwiz.com/web/cs/k555dou4xrsun17jpll6ltqkldyiejb8';
const pages = {
  'index.html': 'home',
  'visualizer/index.html': 'visualizer',
  'services/window-tinting/index.html': 'service_window_tinting',
  'services/paint-protection-film/index.html': 'service_paint_protection_film',
  'services/ceramic-coating/index.html': 'service_ceramic_coating',
  'services/tesla/index.html': 'service_tesla',
  'services/commercial-films/index.html': 'service_commercial_films',
};

let failed = 0;
function fail(message) {
  failed += 1;
  console.error('FAIL', message);
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

const root = dist.pathname;
if (!fs.existsSync(root)) {
  console.error('check-quote-dist: dist/ is missing');
  process.exit(1);
}

const files = walk(root);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const text = htmlFiles.map((file) => ({ file, html: fs.readFileSync(file, 'utf8') }));

const joined = text.map((item) => item.html).join('\n');
if (joined.includes('/web/ce/') || joined.includes('app.tintwiz.com/web/ce')) {
  fail('dist still contains the TintWiz embed URL /web/ce/');
}

let tintwizIframes = 0;
let otherIframes = 0;
for (const { file, html } of text) {
  const iframes = html.match(/<iframe\b[^>]*>/gi) || [];
  for (const tag of iframes) {
    if (/tintwiz|\/web\/ce\//i.test(tag)) {
      tintwizIframes += 1;
      fail(`tintwiz iframe in ${path.relative(root, file)}: ${tag.slice(0, 180)}`);
    } else {
      otherIframes += 1;
    }
  }
}

function anchorsWith(html, url) {
  return (html.match(/<a\b[^>]*>/gi) || []).filter((tag) => tag.includes(url));
}

const counts = [];
for (const [rel, location] of Object.entries(pages)) {
  const file = path.join(root, rel);
  const html = fs.readFileSync(file, 'utf8');
  const tags = anchorsWith(html, QUOTE_URL);
  counts.push({ rel, location, count: tags.length });
  if (tags.length !== 1) {
    fail(`${rel} has ${tags.length} quote links, expected 1`);
    continue;
  }
  const tag = tags[0];
  const target = tag.match(/\btarget="([^"]*)"/)?.[1];
  const relAttr = tag.match(/\brel="([^"]*)"/)?.[1] ?? '';
  const loc = tag.match(/\bdata-quote-location="([^"]*)"/)?.[1];
  if (target !== '_blank') fail(`${rel} target is ${target}`);
  if (relAttr.split(/\s+/).filter(Boolean).join(' ') !== 'noopener') {
    fail(`${rel} rel is "${relAttr}", expected "noopener"`);
  }
  if (loc !== location) fail(`${rel} location is ${loc}, expected ${location}`);
}

for (const { file, html } of text) {
  const rel = path.relative(root, file);
  if (pages[rel]) continue;
  const extra = anchorsWith(html, QUOTE_URL);
  if (extra.length) fail(`${rel} unexpectedly links to the quote form (${extra.length})`);
}

const dropped = ['quote-' + 'sent', 'generate_' + 'lead', 'quote-' + 'lead'];
if (fs.existsSync(path.join(root, dropped[0])) || fs.existsSync(path.join(root, `${dropped[0]}.html`))) {
  fail('dist still contains the confirmation page');
}
const textExt = new Set(['.html', '.js', '.css', '.xml', '.txt', '.mjs', '.json', '.svg', '.webmanifest']);
for (const file of files) {
  const rel = path.relative(root, file);
  for (const token of dropped) {
    if (rel.includes(token)) fail(`dist path contains ${token}: ${rel}`);
  }
  if (!textExt.has(path.extname(file))) continue;
  const body = fs.readFileSync(file, 'utf8');
  for (const token of dropped) {
    if (body.includes(token)) fail(`dist file contains ${token}: ${rel}`);
  }
}

const sitemaps = files.filter((file) => path.basename(file).startsWith('sitemap') && file.endsWith('.xml'));
if (!sitemaps.length) fail('no sitemap xml in dist');
for (const file of sitemaps) {
  const xml = fs.readFileSync(file, 'utf8');
  if (xml.includes(dropped[0])) fail(`${path.basename(file)} lists the confirmation route`);
}

const headerCsp = fs.readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');
if (headerCsp.includes('app.tintwiz.com')) {
  fail('public/_headers still allows app.tintwiz.com in CSP');
}

console.log('quote links:', counts.map((row) => `${row.rel}=${row.count} (${row.location})`).join(', '));
console.log(`iframes: tintwiz=${tintwizIframes} other=${otherIframes}`);

if (failed) {
  console.error(`check-quote-dist: ${failed} failed`);
  process.exit(1);
}
console.log('check-quote-dist: ok');
