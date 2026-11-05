// The production CSP is declared twice while Vercel config still exists:
// public/_headers (Cloudflare Workers) and vercel.json. The build fails
// if those two CSP strings drift.
import fs from 'node:fs';

const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const headersFile = fs.readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');

const vercelCsp = vercel.headers
  ?.find((block) => block.source === '/(.*)')
  ?.headers?.find((h) => h.key === 'Content-Security-Policy')?.value;

const headersMatch = headersFile.match(/^ {2}Content-Security-Policy: (.+)$/m);
const headersCsp = headersMatch?.[1]?.trim();

if (!vercelCsp || !headersCsp) {
  console.error('check-headers: could not find the CSP in vercel.json and public/_headers');
  process.exit(1);
}

if (vercelCsp !== headersCsp) {
  console.error('check-headers: Content-Security-Policy differs between vercel.json and public/_headers');
  console.error('--- vercel.json');
  console.error(vercelCsp);
  console.error('--- public/_headers');
  console.error(headersCsp);
  process.exit(1);
}

// IndexNow key file: Content-Type must stay text/plain on both hosts.
const indexNowPaths = [
  '/ab9f4a4827772e697759a7154c75584c.txt',
  '/ab9f4a4827772e697759a7154c75584c.txt/',
];
const indexNowType = 'text/plain; charset=utf-8';

for (const path of indexNowPaths) {
  const vercelType = vercel.headers
    ?.find((block) => block.source === path)
    ?.headers?.find((h) => h.key === 'Content-Type')?.value;
  const headersHasType = headersFile.includes(`${path}\n  Content-Type: ${indexNowType}\n`)
    || headersFile.includes(`${path}\n  Content-Type: ${indexNowType}`);

  if (vercelType !== indexNowType || !headersHasType) {
    console.error(`check-headers: IndexNow Content-Type missing or drifted for ${path}`);
    console.error('--- vercel.json');
    console.error(vercelType ?? '(missing)');
    process.exit(1);
  }
}

console.log('check-headers: CSP and IndexNow Content-Type match');
