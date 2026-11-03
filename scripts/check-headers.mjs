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

console.log('check-headers: CSP matches');
