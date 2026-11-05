// Quote measurement. Two different events, on purpose:
// - quote_form_click: the visitor opened TintWiz. Intention only, not a lead.
// - generate_lead: the thank-you page, once per session, and only when the
//   referrer hostname is exactly app.tintwiz.com. No personal data in either.

export const QUOTE_LEAD_STORAGE_KEY = 'quote_sent_lead_fired';
export const TINTWIZ_HOST = 'app.tintwiz.com';

export function referrerHostname(referrer: string | null | undefined): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname;
  } catch {
    return null;
  }
}

/** True only for a first fire in this session whose referrer host is TintWiz. */
export function shouldFireGenerateLead(
  referrer: string | null | undefined,
  alreadyFired: boolean,
): boolean {
  if (alreadyFired) return false;
  return referrerHostname(referrer) === TINTWIZ_HOST;
}

export interface AnchorClickInput {
  type: string;
  button: number;
  href: string;
  attributeHref: string | null;
  quoteLocation: string | null;
  text: string;
}

export interface TrackedEvent {
  name: 'quote_form_click' | 'phone_call_click' | 'quote_cta_click';
  params: Record<string, string>;
}

/**
 * One result per link activation. `click` covers the primary button, modified
 * clicks, and keyboard Enter. `auxclick` with button 1 is the middle click,
 * which does not also emit `click`. Any other aux button (context menu) is ignored.
 */
export function classifyAnchorClick(input: AnchorClickInput): TrackedEvent | null {
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
export function quoteLocationFromPath(pathname: string): string {
  const path = (pathname || '/').replace(/\/+$/, '') || '/';
  if (path === '/') return 'home';
  if (path === '/visualizer') return 'visualizer';
  const service = path.match(/^\/services\/([^/]+)$/);
  if (service) return `service_${service[1].replace(/-/g, '_')}`;
  return 'site';
}
