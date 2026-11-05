// Outbound quote click. Intention only: the visitor opened TintWiz.
// Not a lead, and no personal data. Plain ESM so the check runs on Node 20
// and 22 without experimental flags. Types live in quote-click.d.mts.

export const TINTWIZ_HOST = 'app.tintwiz.com';

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
