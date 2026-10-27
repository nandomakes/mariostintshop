// Port de api/apply.js (Vercel Function) a Cloudflare Workers. Mismo contrato:
// recibe el multipart de /careers/, valida, y manda el correo con el CV adjunto
// por Resend. Los secretos llegan en `env` (wrangler secret put), no en process.env.

// El límite de cuerpo en Workers Free es 100 MB; se conserva el tope de 4 MB del CV.
const MAX_RESUME_BYTES = 4 * 1024 * 1024;
const RESUME_TYPES = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};
const MAX_FIELD = 5000;

const json = (status, body, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...extra },
  });

const esc = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const field = (form, name) => String(form.get(name) ?? '').trim().slice(0, MAX_FIELD);

// Sin Buffer: base64 por bloques para no reventar la pila con archivos grandes.
const toBase64 = (buf) => {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};

export async function handleApply(request, env) {
  if (request.method !== 'POST') return json(405, { error: 'Method not allowed.' }, { allow: 'POST' });

  const apiKey = env.RESEND_API_KEY;
  const to = env.CAREERS_NOTIFY_EMAIL;
  const from = env.CAREERS_FROM_EMAIL || "Mario's Tint Shop Careers <onboarding@resend.dev>";
  if (!apiKey || !to) {
    console.error('apply: RESEND_API_KEY or CAREERS_NOTIFY_EMAIL is not set');
    return json(500, { error: 'Applications are temporarily unavailable. Please call the shop.' });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return json(400, { error: 'Invalid submission.' });
  }

  // Honeypot: 200 para que el bot no reintente; se registra en los logs.
  if (field(form, 'hp_website_confirm')) {
    console.warn('apply: honeypot triggered', {
      position: field(form, 'position'),
      ua: request.headers.get('user-agent'),
    });
    return json(200, { ok: true });
  }

  // Límite de envíos (Workers Rate Limiting, gratis): por IP y un tope global.
  // El honeypot queda antes y no consume cuota. Si el binding no existe (pruebas locales), no se limita.
  if (env.APPLY_LIMITER && env.APPLY_GLOBAL_LIMITER) {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const perIp = await env.APPLY_LIMITER.limit({ key: ip });
    const global = perIp.success ? await env.APPLY_GLOBAL_LIMITER.limit({ key: 'global' }) : null;
    if (!perIp.success || !global.success) {
      console.warn('apply: rate limited', { scope: perIp.success ? 'global' : 'ip' });
      return json(429, { error: 'Too many requests. Please try again in a minute or call the shop.' }, { 'retry-after': '60' });
    }
  }

  const name = field(form, 'name');
  const email = field(form, 'email');
  const phone = field(form, 'phone');
  const position = field(form, 'position');
  const experience = field(form, 'experience');
  const availability = field(form, 'availability');

  if (!position || !name || !phone || !experience || !availability) {
    return json(400, { error: 'Please fill in every field.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(400, { error: 'Please enter a valid email address.' });
  }

  const resume = form.get('resume');
  if (!resume || typeof resume !== 'object' || resume.size === 0) {
    return json(400, { error: 'Please attach your resume.' });
  }
  const ext = RESUME_TYPES[resume.type];
  if (!ext) return json(400, { error: 'Resume must be a PDF or Word document.' });
  if (resume.size > MAX_RESUME_BYTES) return json(400, { error: 'Resume must be under 4 MB.' });
  const safeName = name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'applicant';
  const attachments = [{ filename: `resume-${safeName}.${ext}`, content: toBase64(await resume.arrayBuffer()) }];

  const rows = [
    ['Position', position],
    ['Name', name],
    ['Email', email],
    ['Phone', phone],
    ['Experience', experience || '—'],
    ['Can start', availability || '—'],
  ];
  const html = `
    <h2 style="font-family:sans-serif">New job application: ${esc(position)}</h2>
    <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top"><b>${k}</b></td><td style="padding:6px 0">${esc(v)}</td></tr>`
        )
        .join('')}
    </table>
    <p style="font-family:sans-serif;font-size:12px;color:#999">Sent from the careers page on mariostintshop.com. Reply to this email to answer the applicant directly.</p>
  `;

  const sendError = 'We could not send your application. Please try again or call the shop.';
  let res;
  try {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: to.split(',').map((s) => s.trim()).filter(Boolean),
        reply_to: email,
        subject: `Job application: ${position} — ${name}`,
        html,
        attachments,
      }),
    });
  } catch (err) {
    console.error('apply: Resend request failed', err);
    return json(502, { error: sendError });
  }

  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    console.error('apply: Resend error', res.status, body);
    return json(502, { error: sendError });
  }
  console.log('apply: sent', { id: body.id, position });
  return json(200, { ok: true, id: body.id });
}
