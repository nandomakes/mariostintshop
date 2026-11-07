// Website-call snippet: gated off by default, no GTM loader, no conversion event.
// The browser pass stubs gtag and aborts every measurement host so the test
// never sends a hit to production Ads or GA4 and never clicks an ad.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadEnv } from 'vite';
import puppeteer from 'puppeteer-core';
import { classifyAnchorClick } from '../src/lib/quote-click.mjs';
import {
  ADS_CONVERSION_ID,
  ADS_PHONE_DIGITS,
  ADS_PHONE_DISPLAY,
  ADS_PHONE_SEND_TO,
  adsPhoneForPage,
  renderAdsPhoneHeadScript,
  resolveAdsPhoneConfig,
} from '../src/lib/ads-phone.mjs';

const chrome = process.env.CHROME_PATH || '/usr/bin/google-chrome';
const distMode = process.argv.includes('--dist');
const browserMode = process.argv.includes('--browser');
const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

let failed = 0;
function fail(message) {
  failed += 1;
  console.error('FAIL', message);
}

const MEASUREMENT_HOST =
  /(^|\.)(google-analytics\.com|analytics\.google\.com|googletagmanager\.com|googleadservices\.com|doubleclick\.net|googlesyndication\.com)$/i;

function directiveMap(csp) {
  const map = new Map();
  for (const part of csp.split(';')) {
    const tokens = part.trim().split(/\s+/);
    if (!tokens[0]) continue;
    map.set(tokens[0], new Set(tokens.slice(1)));
  }
  return map;
}

function readCsps() {
  const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const headersFile = fs.readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');
  const vercelCsp = vercel.headers
    ?.find((block) => block.source === '/(.*)')
    ?.headers?.find((h) => h.key === 'Content-Security-Policy')?.value;
  const headersCsp = headersFile.match(/^ {2}Content-Security-Policy: (.+)$/m)?.[1]?.trim();
  return { vercelCsp, headersCsp };
}

const REQUIRED = {
  'script-src': ['https://www.googletagmanager.com', 'https://www.googleadservices.com', 'https://www.google.com'],
  'img-src': [
    'https://www.googleadservices.com',
    'https://googleads.g.doubleclick.net',
    'https://pagead2.googlesyndication.com',
    'https://www.google.com',
  ],
  'connect-src': [
    'https://www.googleadservices.com',
    'https://googleads.g.doubleclick.net',
    'https://pagead2.googlesyndication.com',
    'https://www.google.com',
    'https://ad.doubleclick.net',
  ],
  'frame-src': ['https://www.googletagmanager.com'],
};

function checkCsp() {
  const { vercelCsp, headersCsp } = readCsps();
  if (!vercelCsp || vercelCsp !== headersCsp) {
    fail('CSP missing or drifted');
    return;
  }
  const map = directiveMap(vercelCsp);
  for (const [directive, hosts] of Object.entries(REQUIRED)) {
    const have = map.get(directive);
    if (!have) {
      fail(`CSP missing ${directive}`);
      continue;
    }
    for (const host of hosts) {
      if (!have.has(host)) fail(`${directive} missing ${host}`);
    }
  }
  const script = map.get('script-src') || new Set();
  if (script.has('https://tagmanager.google.com')) fail('CSP allows the GTM preview origin');
  if (script.has("'unsafe-eval'")) fail('CSP gained unsafe-eval');
  if (vercelCsp.includes('GTM-')) fail('CSP contains a GTM container id');
}

function checkGateAndSnippet() {
  for (const flag of [undefined, '', '1', 'true', 'ON', 'yes', 'off']) {
    if (resolveAdsPhoneConfig(flag) !== null) fail(`flag ${JSON.stringify(flag)} enabled the snippet`);
  }
  const config = resolveAdsPhoneConfig('on');
  if (!config) {
    fail('flag on did not resolve a config');
    return;
  }
  if (config.conversionId !== ADS_CONVERSION_ID || config.sendTo !== ADS_PHONE_SEND_TO) {
    fail('resolved ids drifted');
  }
  if (config.displayNumber !== '(615) 410-7170' || config.displayNumber.includes('(615)410')) {
    fail('snippet number lost the space used on the page');
  }

  let script = '';
  try {
    script = renderAdsPhoneHeadScript(config);
  } catch (error) {
    fail(`render threw: ${error.message}`);
    return;
  }
  if (!script.includes(`gtag('config', ${JSON.stringify(ADS_CONVERSION_ID)})`)) {
    fail('missing base AW config on the existing tag');
  }
  if (!script.includes(`gtag('config', ${JSON.stringify(ADS_PHONE_SEND_TO)}`)) {
    fail('missing phone destination config');
  }
  if (!script.includes(`phone_conversion_number: ${JSON.stringify(ADS_PHONE_DISPLAY)}`)) {
    fail('phone_conversion_number is not the rendered NAP');
  }
  if (!script.includes('phone_conversion_callback')) fail('missing forwarding callback');
  if (/gtag\(\s*['"]event['"]\s*,\s*['"]conversion['"]/.test(script)) {
    fail('snippet fires a conversion event');
  }
  if (script.includes('gtag/js') || script.includes('GTM-') || script.includes('googletagmanager.com/gtm.js')) {
    fail('snippet installs a second loader or GTM');
  }
  if (script.includes('innerHTML') || script.includes('document.write')) fail('snippet writes HTML');

  let refused = false;
  try {
    renderAdsPhoneHeadScript({ ...config, conversionId: 'GTM-M83NJ4MQ', sendTo: 'GTM-M83NJ4MQ/label' });
  } catch {
    refused = true;
  }
  if (!refused) fail('GTM id was accepted as gtag config');

  const consts = fs.readFileSync(new URL('../src/consts.ts', import.meta.url), 'utf8');
  if (!consts.includes(`export const PHONE_DISPLAY = '${ADS_PHONE_DISPLAY}'`)) {
    fail('PHONE_DISPLAY does not match the snippet number');
  }
  if (!consts.includes(`export const PHONE_TEL = '+${ADS_PHONE_DIGITS}'`)) {
    fail('PHONE_TEL does not match the business digits');
  }
  if (!consts.includes("export const GA4_ID = 'G-L5RB0B2JTL'")) fail('GA4 id drifted');

  const click = classifyAnchorClick({
    type: 'click',
    button: 0,
    href: `tel:+${ADS_PHONE_DIGITS}`,
    attributeHref: `tel:+${ADS_PHONE_DIGITS}`,
    quoteLocation: null,
    text: ADS_PHONE_DISPLAY,
  });
  if (!click || click.name !== 'phone_call_click') fail('tel click is no longer phone_call_click');
  if (click && JSON.stringify(click).includes('conversion')) fail('phone click is classified as a conversion');

  const layout = fs.readFileSync(new URL('../src/layouts/Layout.astro', import.meta.url), 'utf8');
  if (!layout.includes('adsPhoneForPage') || !layout.includes('renderAdsPhoneHeadScript')) {
    fail('Layout does not use the shared GA4 gate');
  }
  if (layout.includes('GTM-') || layout.includes('gtag/js?id=AW')) fail('Layout adds GTM or a second loader');
  const privacySrc = fs.readFileSync(new URL('../src/pages/privacy/index.astro', import.meta.url), 'utf8');
  if (!privacySrc.includes('adsPhoneForPage')) fail('privacy disclosure does not use the shared GA4 gate');
  if (adsPhoneForPage('', 'on') !== null || adsPhoneForPage(undefined, 'on') !== null) {
    fail('empty GA4 id still enables the Ads phone config');
  }
  if (!adsPhoneForPage('G-L5RB0B2JTL', 'on')) fail('GA4 id plus flag on did not enable the config');
  if (adsPhoneForPage('G-L5RB0B2JTL', '') !== null) fail('empty Ads flag enabled the config');
}

const PUBLIC_ENV_KEYS = ['PUBLIC_ADS_PHONE_CONVERSION', 'PUBLIC_GA4_ID'];

function withPublicShell(overrides, fn) {
  const saved = new Map();
  for (const key of PUBLIC_ENV_KEYS) saved.set(key, process.env[key]);
  try {
    for (const key of PUBLIC_ENV_KEYS) {
      if (!Object.prototype.hasOwnProperty.call(overrides, key) || overrides[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = overrides[key];
      }
    }
    return fn();
  } finally {
    for (const [key, value] of saved) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

function checkEnvPrecedence() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ads-phone-env-'));
  const file = path.join(dir, '.env.production');
  fs.writeFileSync(file, 'PUBLIC_ADS_PHONE_CONVERSION=on\nPUBLIC_GA4_ID=G-FROMFILE\n');
  try {
    withPublicShell({}, () => {
      const env = loadEnv('production', dir, 'PUBLIC_');
      if (env.PUBLIC_ADS_PHONE_CONVERSION !== 'on' || env.PUBLIC_GA4_ID !== 'G-FROMFILE') {
        fail(`.env.production was not read: ${JSON.stringify(env)}`);
      }
    });
    withPublicShell({ PUBLIC_ADS_PHONE_CONVERSION: 'off', PUBLIC_GA4_ID: 'G-SHELL' }, () => {
      const env = loadEnv('production', dir, 'PUBLIC_');
      if (env.PUBLIC_ADS_PHONE_CONVERSION !== 'off' || env.PUBLIC_GA4_ID !== 'G-SHELL') {
        fail(`shell did not override .env.production: ${JSON.stringify(env)}`);
      }
    });
    withPublicShell({ PUBLIC_ADS_PHONE_CONVERSION: '', PUBLIC_GA4_ID: '' }, () => {
      const env = loadEnv('production', dir, 'PUBLIC_');
      if (env.PUBLIC_ADS_PHONE_CONVERSION !== '' || env.PUBLIC_GA4_ID !== '') {
        fail(`empty shell did not override .env.production: ${JSON.stringify(env)}`);
      }
    });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function publicBuildEnv() {
  return loadEnv('production', repoRoot, 'PUBLIC_');
}

function fixtureHtml(script) {
  return `<!doctype html><html><head>
<script>
window.__calls = [];
window.gtag = function () {
  var args = [];
  for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
  window.__calls.push(args);
};
</script>
<script>${script}</script>
<script type="application/ld+json">{"telephone":"+${ADS_PHONE_DIGITS}","description":"Call ${ADS_PHONE_DISPLAY}"}</script>
</head><body>
<a href="tel:+${ADS_PHONE_DIGITS}">${ADS_PHONE_DISPLAY}</a>
<a href="tel:+${ADS_PHONE_DIGITS}" aria-label="Call Mario's Tint Shop at ${ADS_PHONE_DISPLAY}"><svg></svg></a>
<a href="tel:+16155550000">Other</a>
<p>Quotes are free at ${ADS_PHONE_DISPLAY}.</p>
</body></html>`;
}

async function checkBrowser() {
  const config = resolveAdsPhoneConfig('on');
  const script = renderAdsPhoneHeadScript(config);
  const continued = [];
  const aborted = [];
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      let host = '';
      let pathname = '';
      try {
        const url = new URL(req.url());
        host = url.hostname;
        pathname = url.pathname;
      } catch {
        continued.push(req.url());
        req.continue();
        return;
      }
      const measurement =
        MEASUREMENT_HOST.test(host) ||
        (host === 'www.google.com' && /^\/(pagead|ccm|rmkt)\b/.test(pathname));
      if (measurement) {
        aborted.push(req.url());
        req.abort('blockedbyclient');
        return;
      }
      if (req.url() === 'about:blank' || req.url().startsWith('data:')) {
        req.continue();
        return;
      }
      continued.push(req.url());
      req.continue();
    });

    await page.setContent(fixtureHtml(script), { waitUntil: 'domcontentloaded' });
    const before = await page.evaluate(() => {
      const schema = document.head.querySelector('script[type="application/ld+json"]').textContent;
      const hrefs = Array.from(document.querySelectorAll('a[href^="tel:"]')).map((a) => a.getAttribute('href'));
      return {
        schema,
        hrefs,
        text: document.body.innerText,
        calls: window.__calls.map((args) => [args[0], args[1]]),
        hasCallback: typeof window.__calls[1]?.[2]?.phone_conversion_callback === 'function',
      };
    });

    if (before.schema !== `{"telephone":"+${ADS_PHONE_DIGITS}","description":"Call ${ADS_PHONE_DISPLAY}"}`) {
      fail(`schema changed before callback: ${before.schema}`);
    }
    if (before.hrefs.join(',') !== `tel:+${ADS_PHONE_DIGITS},tel:+${ADS_PHONE_DIGITS},tel:+16155550000`) {
      fail(`tel hrefs changed before callback: ${before.hrefs.join(',')}`);
    }
    if (!before.text.includes(ADS_PHONE_DISPLAY)) fail('display number missing before callback');
    if (before.calls.length !== 2) fail(`expected 2 gtag configs, got ${before.calls.length}`);
    if (before.calls[0][0] !== 'config' || before.calls[0][1] !== ADS_CONVERSION_ID) {
      fail(`first config was ${before.calls[0]}`);
    }
    if (before.calls[1][0] !== 'config' || before.calls[1][1] !== ADS_PHONE_SEND_TO) {
      fail(`phone config was ${before.calls[1]}`);
    }
    if (!before.hasCallback) fail('phone config has no callback');
    if (before.calls.some((args) => args[0] === 'event')) fail('snippet pushed an event');

    const after = await page.evaluate(() => {
      const params = window.__calls[1][2];
      params.phone_conversion_callback('(615) 555-0199', '+16155550199');
      const schema = document.head.querySelector('script[type="application/ld+json"]').textContent;
      const links = Array.from(document.querySelectorAll('a'));
      return {
        schema,
        hrefs: links.map((a) => a.getAttribute('href')),
        texts: links.map((a) => a.textContent),
        aria: links[1].getAttribute('aria-label'),
        paragraph: document.querySelector('p').textContent,
      };
    });
    if (after.schema.includes('555-0199') || !after.schema.includes(`+${ADS_PHONE_DIGITS}`)) {
      fail(`JSON-LD was rewritten: ${after.schema}`);
    }
    if (after.hrefs[0] !== 'tel:+16155550199' || after.hrefs[1] !== 'tel:+16155550199') {
      fail(`business tel links were not rewritten: ${after.hrefs.join(',')}`);
    }
    if (after.hrefs[2] !== 'tel:+16155550000') fail('unrelated tel link changed');
    if (after.texts[0] !== '(615) 555-0199') fail(`link text is ${after.texts[0]}`);
    if (after.texts[1] !== '') fail('icon button gained text');
    if (after.aria !== "Call Mario's Tint Shop at (615) 555-0199") fail(`aria is ${after.aria}`);
    if (after.paragraph !== 'Quotes are free at (615) 555-0199.') fail(`paragraph is ${after.paragraph}`);

    const again = await page.evaluate(() => {
      const params = window.__calls[1][2];
      params.phone_conversion_callback('(615) 555-0100', '+16155550100');
      return document.querySelector('a').getAttribute('href');
    });
    if (again !== 'tel:+16155550199') fail(`second callback rewrote an already-swapped link to ${again}`);

    await page.evaluate(async () => {
      const urls = [
        'https://www.google-analytics.com/g/collect?synthetic=1',
        'https://www.googleadservices.com/pagead/conversion/AW-18560918238/?synthetic=1',
        'https://googleads.g.doubleclick.net/pagead/conversion/?synthetic=1',
        'https://www.googletagmanager.com/gtag/js?id=AW-18560918238',
        'https://ad.doubleclick.net/favicon.ico?synthetic=1',
        'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
      ];
      await Promise.all(
        urls.map((url) =>
          fetch(url, { method: 'GET', mode: 'no-cors', cache: 'no-store' }).catch(() => undefined),
        ),
      );
    });
    if (continued.length) fail(`measurement or unexpected request was sent: ${continued.join(' ')}`);
    for (const host of [
      'google-analytics.com',
      'googleadservices.com',
      'googleads.g.doubleclick.net',
      'ad.doubleclick.net',
      'pagead2.googlesyndication.com',
      'googletagmanager.com',
    ]) {
      if (!aborted.some((url) => url.includes(host))) fail(`probe to ${host} was not intercepted`);
    }
  } finally {
    await browser.close();
  }
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

async function checkDist() {
  const dist = new URL('../dist/', import.meta.url);
  if (!fs.existsSync(dist)) {
    fail('dist/ is missing');
    return;
  }
  const loaded = publicBuildEnv();
  const enabled = loaded.PUBLIC_ADS_PHONE_CONVERSION === 'on';
  const ga4Env = Object.prototype.hasOwnProperty.call(loaded, 'PUBLIC_GA4_ID')
    ? loaded.PUBLIC_GA4_ID
    : undefined;
  const ga4Id = ga4Env === undefined ? 'G-L5RB0B2JTL' : ga4Env;
  const htmlFiles = walk(dist.pathname).filter((file) => file.endsWith('.html'));
  if (!htmlFiles.length) fail('dist has no html');

  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const rel = path.relative(dist.pathname, file);
    // public/ verification files are not Layout pages and must stay tag-free.
    if (!html.includes('Skip to content')) {
      if (html.includes('AW-') || html.includes('phone_conversion') || html.includes('GTM-')) {
        fail(`${rel} is not a site page but contains Ads or GTM markup`);
      }
      continue;
    }
    const loaders = html.match(/https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^"'&\s<]+/g) || [];
    if (ga4Id) {
      if (loaders.length !== 1 || loaders[0] !== `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`) {
        fail(`${rel} gtag loader is ${JSON.stringify(loaders)}`);
      }
    } else if (loaders.length) {
      fail(`${rel} loaded gtag while PUBLIC_GA4_ID is empty`);
    }
    if (html.includes('GTM-') || html.includes('/gtm.js')) fail(`${rel} contains GTM`);
    if (/gtag\(\s*['"]event['"]\s*,\s*['"]conversion['"]/.test(html)) {
      fail(`${rel} fires a conversion event`);
    }
    if (!html.includes(`"telephone":"+${ADS_PHONE_DIGITS}"`)) {
      fail(`${rel} dropped the business telephone`);
    }
    if (enabled && ga4Id) {
      if (!html.includes(ADS_CONVERSION_ID) || !html.includes('phone_conversion_number')) {
        fail(`${rel} is missing the gated phone snippet`);
      }
      if (!html.includes(ADS_PHONE_DISPLAY)) fail(`${rel} lost the static display number`);
      if (!html.includes(`tel:+${ADS_PHONE_DIGITS}`)) fail(`${rel} lost the static tel link`);
    } else {
      if (html.includes('AW-') || html.includes('phone_conversion')) {
        fail(`${rel} emits Ads phone tracking while the gate is off`);
      }
    }
  }

  const privacy = htmlFiles.find((file) => file.endsWith(`${path.sep}privacy${path.sep}index.html`));
  if (!privacy) fail('privacy page missing from dist');
  else {
    const html = fs.readFileSync(privacy, 'utf8');
    if (enabled && ga4Id) {
      if (!html.includes('website call conversions')) fail('enabled privacy page does not disclose call conversions');
      if (html.includes('does not run an advertising pixel')) {
        fail('enabled privacy page still says there is no advertising tag');
      }
    } else if (!html.includes('This website does not run an advertising pixel and does not show ads.')) {
      fail('default privacy disclosure changed while the gate is off');
    }
  }

  if (!browserMode) return;
  if (!fs.existsSync(chrome)) {
    fail(`chrome missing at ${chrome}; set CHROME_PATH. npm run build does not need it.`);
    return;
  }
  const samples = [
    'index.html',
    path.join('privacy', 'index.html'),
    path.join('services', 'window-tinting', 'index.html'),
  ];
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const page = await browser.newPage();
    const leaked = [];
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.url().startsWith('data:') || req.url() === 'about:blank') {
        req.continue();
        return;
      }
      let host = '';
      try {
        host = new URL(req.url()).hostname;
      } catch {
        host = '';
      }
      const measurement = MEASUREMENT_HOST.test(host) || host === 'www.google.com' || host === 'google.com';
      if (measurement) leaked.push(req.url());
      // Abort every external URL. Measurement hosts must not be continued,
      // and image CDNs must not be fetched just to read the phone markup.
      req.abort('blockedbyclient');
    });
    for (const rel of samples) {
      const file = path.join(dist.pathname, rel);
      const html = fs.readFileSync(file, 'utf8');
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      const observed = await page.evaluate((display) => {
        const hrefs = Array.from(document.querySelectorAll('a[href^="tel:"]')).map((a) => a.getAttribute('href'));
        const schema = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
          .map((node) => node.textContent)
          .join('\n');
        const configs = (window.dataLayer || [])
          .filter((entry) => entry && entry[0] === 'config')
          .map((entry) => String(entry[1]));
        const events = (window.dataLayer || [])
          .filter((entry) => entry && entry[0] === 'event')
          .map((entry) => String(entry[1]));
        return {
          hrefs,
          schema,
          configs,
          events,
          showsDisplay: document.body.innerText.includes(display),
        };
      }, ADS_PHONE_DISPLAY);
      if (!observed.hrefs.length || observed.hrefs.some((href) => href !== `tel:+${ADS_PHONE_DIGITS}`)) {
        fail(`${rel} tel links are ${observed.hrefs.join(',')}`);
      }
      if (!observed.schema.includes(`"+${ADS_PHONE_DIGITS}"`) && !observed.schema.includes(`+${ADS_PHONE_DIGITS}`)) {
        fail(`${rel} schema telephone changed in the browser`);
      }
      if (!observed.showsDisplay) fail(`${rel} does not show ${ADS_PHONE_DISPLAY}`);
      if (observed.events.includes('conversion')) fail(`${rel} dataLayer has a conversion event`);
      if (enabled && ga4Id) {
        if (!observed.configs.includes(ADS_CONVERSION_ID) || !observed.configs.includes(ADS_PHONE_SEND_TO)) {
          fail(`${rel} dataLayer configs are ${observed.configs.join(',')}`);
        }
        const swapped = await page.evaluate(() => {
          const phone = (window.dataLayer || []).find((entry) => entry && String(entry[1] || '').includes('/'));
          const callback = phone && phone[2] && phone[2].phone_conversion_callback;
          if (typeof callback !== 'function') return { ok: false };
          callback('(615) 555-0199', '+16155550199');
          const schema = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .map((node) => node.textContent)
            .join('\n');
          const hrefs = Array.from(document.querySelectorAll('a[href^="tel:"]')).map((a) => a.getAttribute('href'));
          return {
            ok: true,
            schema,
            hrefs,
            text: document.body.innerText,
          };
        });
        if (!swapped.ok) fail(`${rel} built phone snippet has no callback`);
        else {
          if (swapped.schema.includes('555-0199') || !swapped.schema.includes('+16154107170')) {
            fail(`${rel} callback rewrote JSON-LD`);
          }
          if (swapped.hrefs.some((href) => href === 'tel:+16154107170')) {
            fail(`${rel} callback left a business tel link`);
          }
          if (!swapped.hrefs.length || swapped.hrefs.some((href) => href !== 'tel:+16155550199')) {
            fail(`${rel} callback hrefs are ${swapped.hrefs.join(',')}`);
          }
          if (!swapped.text.includes('(615) 555-0199')) fail(`${rel} callback did not replace visible text`);
          if (swapped.text.includes('(615) 410-7170')) fail(`${rel} callback left the published number visible`);
        }
      } else if (observed.configs.some((id) => id.startsWith('AW-'))) {
        fail(`${rel} dataLayer has an Ads config while gated off`);
      }
    }
    if (ga4Id && !leaked.some((url) => url.includes(`googletagmanager.com/gtag/js?id=${ga4Id}`))) {
      fail('dist pages did not try to load gtag, so the network block was not exercised');
    }
    if (leaked.some((url) => url.includes('/gtag/js?id=AW-') || url.includes('/gtag/js?id=GTM-'))) {
      fail(`dist pages loaded a second Google tag: ${leaked.join(' ')}`);
    }
  } finally {
    await browser.close();
  }
}

checkCsp();
if (!distMode) {
  checkGateAndSnippet();
  checkEnvPrecedence();
  if (browserMode) {
    if (!fs.existsSync(chrome)) fail(`chrome missing at ${chrome}; set CHROME_PATH`);
    else await checkBrowser();
  }
} else {
  await checkDist();
}

if (failed) {
  console.error(`check-ads-phone: ${failed} failed`);
  process.exit(1);
}
console.log(distMode ? 'check-ads-phone: dist ok' : 'check-ads-phone: ok');
