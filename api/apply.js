// Vercel Function: receives a job application from /careers/ and emails it,
// resume attached, to the shop via Resend. Lives outside src/ because the Astro
// site is fully static — Vercel deploys /api/* as functions alongside it.

// Vercel caps a function request body at 4.5 MB, multipart overhead included.
const MAX_RESUME_BYTES = 4 * 1024 * 1024;
const RESUME_TYPES = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};
const MAX_FIELD = 5000;

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const esc = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const field = (form, name) => String(form.get(name) ?? '').trim().slice(0, MAX_FIELD);

export async function POST(request) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CAREERS_NOTIFY_EMAIL;
  const from = process.env.CAREERS_FROM_EMAIL || "Mario's Tint Shop Careers <onboarding@resend.dev>";
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

  // Honeypot: real visitors never see this field, bots fill everything.
  if (field(form, 'company')) return json(200, { ok: true });

  const name = field(form, 'name');
  const email = field(form, 'email');
  const phone = field(form, 'phone');
  const position = field(form, 'position');
  const experience = field(form, 'experience');
  const availability = field(form, 'availability');
  const employmentType = field(form, 'employmentType');

  if (!position || !name || !phone || !experience || !employmentType || !availability) {
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
  const attachments = [
    {
      filename: `resume-${safeName}.${ext}`,
      content: Buffer.from(await resume.arrayBuffer()).toString('base64'),
    },
  ];

  const rows = [
    ['Position', position],
    ['Name', name],
    ['Email', email],
    ['Phone', phone],
    ['Experience', experience || '—'],
    ['Looking for', employmentType || '—'],
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

  const res = await fetch('https://api.resend.com/emails', {
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

  if (!res.ok) {
    console.error('apply: Resend error', res.status, await res.text());
    return json(502, { error: 'We could not send your application. Please try again or call the shop.' });
  }
  return json(200, { ok: true });
}
