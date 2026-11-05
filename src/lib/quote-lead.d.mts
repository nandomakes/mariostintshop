export const QUOTE_LEAD_STORAGE_KEY: string;
export const TINTWIZ_HOST: string;

export function referrerHostname(referrer: string | null | undefined): string | null;

/** True only for a first fire in this session whose referrer host is TintWiz. */
export function shouldFireGenerateLead(
  referrer: string | null | undefined,
  alreadyFired: boolean,
): boolean;

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

export function classifyAnchorClick(input: AnchorClickInput): TrackedEvent | null;

/** GA4 `location` for the quote link on this pathname. No personal data. */
export function quoteLocationFromPath(pathname: string): string;
