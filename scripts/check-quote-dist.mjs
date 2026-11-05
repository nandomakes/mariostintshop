// Confirms the built site no longer embeds the TintWiz iframe, that the seven
// quote pages each have one outbound form link, and that /quote-sent/ is
// noindex and absent from the sitemap.
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

const thanksPath = path.join(root, 'quote-sent/index.html');
if (!fs.existsSync(thanksPath)) {
  fail('dist/quote-sent/index.html is missing');
} else {
  const html = fs.readFileSync(thanksPath, 'utf8');
  const robots = html.match(/<meta\b[^>]*name="robots"[^>]*>/i)?.[0] ?? '';
  if (!/content="noindex,\s*nofollow"/.test(robots)) {
    fail(`quote-sent robots tag is missing noindex, nofollow: ${robots}`);
  }
  if (/rel="canonical"/i.test(html)) fail('quote-sent must not declare a canonical');
  if (!html.includes('tel:+16154107170')) fail('quote-sent is missing the shop phone link');
  if (!/href="\/"/.test(html)) fail('quote-sent is missing the link back home');
  if (html.includes(QUOTE_URL)) fail('quote-sent must not link to the TintWiz form');
  if (/<(?:pre|code)\b/i.test(html)) fail('quote-sent renders a code block');

  const scripts = [...html.matchAll(/\bsrc="([^"]+\.js)"/g)].map((match) => match[1]);
  const seen = new Set();
  const bodies = [];
  const queue = [...scripts];
  while (queue.length) {
    const src = queue.shift();
    if (!src || seen.has(src)) continue;
    seen.add(src);
    const asset = path.join(root, src.replace(/^\//, ''));
    if (!fs.existsSync(asset)) continue;
    const code = fs.readFileSync(asset, 'utf8');
    bodies.push(code);
    for (const match of code.matchAll(/from\s*["'](\.[^"']+)["']/g)) {
      const next = path.posix.normalize(path.posix.join(path.posix.dirname(src), match[1]));
      queue.push(next.startsWith('/') ? next : `/${next}`);
    }
  }
  const bundle = bodies.join('\n');
  if (!bundle.includes('quote_sent_lead_fired')) fail('quote-sent script is missing the session key');
  if (!bundle.includes('generate_lead')) fail('quote-sent script is missing generate_lead');
  if (!bundle.includes('app.tintwiz.com')) fail('quote-sent script is missing the TintWiz host check');
  if (!bundle.includes('quote_sent')) fail('quote-sent script is missing location quote_sent');
  // The event name must sit behind the host check in the shared module, not as a
  // bare call in the HTML.
  if (html.includes('generate_lead')) fail('generate_lead is inlined into the quote-sent HTML');
}

const sitemaps = files.filter((file) => path.basename(file).startsWith('sitemap') && file.endsWith('.xml'));
if (!sitemaps.length) fail('no sitemap xml in dist');
for (const file of sitemaps) {
  const xml = fs.readFileSync(file, 'utf8');
  if (xml.includes('quote-sent')) fail(`${path.basename(file)} lists /quote-sent/`);
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
