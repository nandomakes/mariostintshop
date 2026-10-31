import { handleApply } from './apply.js';

// Solo el apex. workers.dev, previews y www no entran aquí. No toca DNS ni correo:
// es un 301 HTTP cuando el request ya llegó a este Worker con ese host.
// Se muta el URL del request (no se reparsea el path) para conservar ruta y query
// aunque el path empiece por "//".
const APEX_HOST = 'mariostintshop.com';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === APEX_HOST) {
      url.protocol = 'https:';
      url.hostname = 'www.mariostintshop.com';
      url.port = '';
      return Response.redirect(url.href, 301);
    }

    const { pathname } = url;
    if (pathname === '/api/apply' || pathname === '/api/apply/') return handleApply(request, env);
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Not found.' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      });
    }
    return env.ASSETS.fetch(request);
  },
};
