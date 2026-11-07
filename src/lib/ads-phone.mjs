// Google Ads website-call conversions on the existing GA4 gtag.
//
// Official behavior this follows (read 2026-11-07):
// - support.google.com/google-ads/answer/7548399 — adapt an existing Google
//   tag by adding gtag('config', 'AW-…'). Do not load a second gtag.js.
// - support.google.com/google-ads/answer/6095883 — website calls use a phone
//   snippet, not an event snippet. The number must match the on-page text.
//   A callback is how a tel: link that does not show the digits (the mobile
//   call button) gets the forwarding number.
//
// Gated off unless PUBLIC_ADS_PHONE_CONVERSION is exactly "on" at build time.
// Nothing here fires gtag('event', 'conversion'): a page view or a click is
// not a completed call. Google counts the call only after the forwarding
// number is dialed and the call meets the duration set on the action.
//
// The Ads email printed (615)410-7170. The site renders (615) 410-7170.
// Google's help says a mismatch means the number is not found, so the
// snippet uses the rendered NAP. tel:+16154107170 is a different string;
// the callback updates those hrefs only when Google actually returns a
// forwarding number. Organic visits never enter the callback, and
// script/JSON-LD is not walked, so schema stays the real number.

export const ADS_PHONE_FLAG = 'on';
export const ADS_CONVERSION_ID = 'AW-18560918238';
export const ADS_PHONE_SEND_TO = 'AW-18560918238/AJwWCMXj2rMdEN7FxJJF';
export const ADS_PHONE_DISPLAY = '(615) 410-7170';
export const ADS_PHONE_DIGITS = '16154107170';

const AW_ID_RE = /^AW-\d+$/;
const SEND_TO_RE = /^AW-\d+\/[A-Za-z0-9_-]+$/;

export function adsPhoneConversionEnabled(flag) {
  return flag === ADS_PHONE_FLAG;
}

export function resolveAdsPhoneConfig(flag) {
  if (!adsPhoneConversionEnabled(flag)) return null;
  return {
    conversionId: ADS_CONVERSION_ID,
    sendTo: ADS_PHONE_SEND_TO,
    displayNumber: ADS_PHONE_DISPLAY,
    businessDigits: ADS_PHONE_DIGITS,
  };
}

export function assertAdsPhoneConfig(config) {
  if (!config || typeof config !== 'object') {
    throw new Error('ads phone config missing');
  }
  const id = String(config.conversionId || '');
  const sendTo = String(config.sendTo || '');
  if (id.includes('GTM-') || sendTo.includes('GTM-') || id.startsWith('GTM') || sendTo.startsWith('GTM')) {
    throw new Error('refusing a GTM container id as a gtag config');
  }
  if (!AW_ID_RE.test(id)) throw new Error('Ads config id must be an AW- id');
  if (!SEND_TO_RE.test(sendTo) || !sendTo.startsWith(`${id}/`)) {
    throw new Error('phone destination must be AW-id/label on that same id');
  }
  if (config.displayNumber !== ADS_PHONE_DISPLAY) {
    throw new Error('phone_conversion_number must be the rendered shop number');
  }
  if (config.businessDigits !== ADS_PHONE_DIGITS) {
    throw new Error('business digits must match the published tel link');
  }
  return config;
}

/**
 * Replace visible NAP with a Google forwarding number.
 * Called only from the phone snippet callback, which Google invokes when it
 * has a forwarding number (ad click). Empty or non-phone values change nothing.
 * Skips script/style/noscript so JSON-LD telephone is left alone.
 */
export function applyForwardingNumber(doc, options) {
  const formattedNumber = options && options.formattedNumber ? String(options.formattedNumber) : '';
  const mobileNumber = options && options.mobileNumber ? String(options.mobileNumber) : '';
  const displayNumber = options && options.displayNumber ? String(options.displayNumber) : '';
  const businessDigits = options && options.businessDigits ? String(options.businessDigits) : '';
  const result = { textNodes: 0, telLinks: 0, ariaLabels: 0 };
  if (!doc || !displayNumber || !businessDigits) return result;

  function toTel(raw) {
    const text = String(raw || '').trim();
    if (!text) return '';
    const plus = text.charAt(0) === '+';
    const digits = text.replace(/\D/g, '');
    if (!digits || digits.length < 10 || digits.length > 15) return '';
    if (plus) return `tel:+${digits}`;
    if (digits.length === 10) return `tel:+1${digits}`;
    return `tel:+${digits}`;
  }

  const formattedOk = /^[+()\d][+()\d.\s-]{6,24}$/.test(formattedNumber);
  const telHref = toTel(mobileNumber);
  const scope = doc.body || doc;
  const skip = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, TEMPLATE: 1 };
  const national =
    businessDigits.length === 11 && businessDigits.charAt(0) === '1' ? businessDigits.slice(1) : '';

  function replaceText(el) {
    if (!el || !el.tagName || skip[el.tagName]) return;
    const children = el.childNodes;
    if (!children) return;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (!child) continue;
      if (child.nodeType === 3) {
        const value = child.nodeValue;
        if (value && value.indexOf(displayNumber) !== -1) {
          child.nodeValue = value.split(displayNumber).join(formattedNumber);
          result.textNodes += 1;
        }
      } else if (child.nodeType === 1) {
        replaceText(child);
      }
    }
  }

  if (formattedOk) replaceText(scope);

  if (telHref && scope.querySelectorAll) {
    const links = scope.querySelectorAll('a[href^="tel:"]');
    for (let i = 0; i < links.length; i++) {
      const href = links[i].getAttribute('href') || '';
      const digits = href.replace(/\D/g, '');
      if (digits === businessDigits || (national && digits === national)) {
        links[i].setAttribute('href', telHref);
        result.telLinks += 1;
      }
    }
  }

  if (formattedOk && scope.querySelectorAll) {
    const labelled = scope.querySelectorAll('[aria-label]');
    for (let i = 0; i < labelled.length; i++) {
      const label = labelled[i].getAttribute('aria-label') || '';
      if (label.indexOf(displayNumber) !== -1) {
        labelled[i].setAttribute('aria-label', label.split(displayNumber).join(formattedNumber));
        result.ariaLabels += 1;
      }
    }
  }

  return result;
}

/** Inline commands appended after the existing GA4 config. Empty when gated off. */
export function renderAdsPhoneHeadScript(config) {
  assertAdsPhoneConfig(config);
  const fn = applyForwardingNumber.toString();
  if (!fn.startsWith('function applyForwardingNumber') || !fn.includes('querySelectorAll')) {
    throw new Error('forwarding function could not be inlined');
  }
  if (fn.includes('innerHTML') || fn.includes('gtag') || fn.includes('GTM-')) {
    throw new Error('forwarding function source is not safe to inline');
  }
  return `if (typeof gtag === 'function') {
  gtag('config', ${JSON.stringify(config.conversionId)});
  gtag('config', ${JSON.stringify(config.sendTo)}, {
    phone_conversion_number: ${JSON.stringify(config.displayNumber)},
    phone_conversion_callback: function (formattedNumber, mobileNumber) {
      (${fn})(document, {
        formattedNumber: formattedNumber,
        mobileNumber: mobileNumber,
        displayNumber: ${JSON.stringify(config.displayNumber)},
        businessDigits: ${JSON.stringify(config.businessDigits)}
      });
    }
  });
}
`;
}
