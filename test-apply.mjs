// Prueba local de worker/apply.js sin red: fetch simulado, nunca llama a Resend.
import { handleApply } from './worker/apply.js';
const calls = [];
globalThis.fetch = async (url, init) => { calls.push({ url, body: JSON.parse(init.body) }); return new Response('{"id":"fake-123"}', { status: 200 }); };
const env = { RESEND_API_KEY: 'fake', CAREERS_NOTIFY_EMAIL: 'a@example.com, b@example.com' };
const mk = (o, file = true) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.append(k, v);
  if (file) f.append('resume', new File([new Uint8Array(1000).fill(65)], 'cv.pdf', { type: 'application/pdf' }));
  return new Request('https://x/api/apply', { method: 'POST', body: f }); };
const ok = { name: 'Ana Test', email: 'ana@example.com', phone: '1', position: 'tint-installer', experience: '2y', availability: 'now' };
const run = async (label, req, e = env) => { const r = await handleApply(req, e); console.log(label.padEnd(28), r.status, await r.text(), 'resend calls:', calls.length); };
await run('sin secretos', mk(ok), {});
await run('honeypot', mk({ ...ok, hp_website_confirm: 'spam' }));
await run('falta campo', mk({ ...ok, phone: '' }));
await run('email invalido', mk({ ...ok, email: 'nope' }));
await run('sin CV', mk(ok, false));
await run('valido (fetch simulado)', mk(ok));
const c = calls[0]; console.log('payload:', c.url, c.body.to, c.body.reply_to, c.body.subject, c.body.attachments[0].filename, Buffer.from(c.body.attachments[0].content, 'base64').length, 'bytes');
