// Quote measurement. Two different events, on purpose:
// - quote_form_click: the visitor opened TintWiz. Intention only, not a lead.
// - generate_lead: the thank-you page, once per session, and only when the
//   referrer hostname is exactly app.tintwiz.com. No personal data in either.
//
// Plain ESM so `node scripts/check-quote-lead.mjs` runs on Node 20 and 22
// without --experimental-strip-types. Types live in quote-lead.d.mts.

export const QUOTE_LEAD_STORAGE_KEY = 'quote_sent_lead_fired';
export const TINTWIZ_HOST = 'app.tintwiz.com';

/** @param {string | null | undefined} referrer */
export function referrerHostname(referrer) {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname;
  } catch {
    return null;
  }
}

/** True only for a first fire in this session whose referrer host is TintWiz. */
export function shouldFireGenerateLead(referrer, alreadyFired) {
  if (alreadyFired) return false;
  return referrerHostname(referrer) === TINTWIZ_HOST;
}

/**
 * One result per link activation. `click` covers the primary button, modified
 * clicks, and keyboard Enter. `auxclick` with button 1 is the middle click,
 * which does not also emit `click`. Any other aux button (context menu) is ignored.
 */
export function classifyAnchorClick(input) {
  if (input.type === 'auxclick' && input.button !== 1) return null;
  if (input.type !== 'click' && input.type !== 'auxclick') return null;

  if (input.quoteLocation) {
    try {
      if (new URL(input.href).hostname === TINTWIZ_HOST) {
        return {
          name: 'quote_form_click',
          params: { location: input.quoteLocation },
        };
      }
    } catch {
      // A bad href is not an outbound quote click.
    }
  }

  if (input.href.startsWith('tel:')) {
    return { name: 'phone_call_click', params: { link_url: input.href } };
  }

  if (input.attributeHref?.includes('#contact')) {
    return {
      name: 'quote_cta_click',
      params: { link_text: input.text.trim() },
    };
  }

  return null;
}

/** GA4 `location` for the quote link on this pathname. No personal data. */
export function quoteLocationFromPath(pathname) {
  const path = (pathname || '/').replace(/\/+$/, '') || '/';
  if (path === '/') return 'home';
  if (path === '/visualizer') return 'visualizer';
  const service = path.match(/^\/services\/([^/]+)$/);
  if (service) return `service_${service[1].replace(/-/g, '_')}`;
  return 'site';
}
