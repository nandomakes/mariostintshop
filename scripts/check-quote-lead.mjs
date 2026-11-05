// Logic for quote_form_click and the /quote-sent/ generate_lead guard.
// Simulates an empty referrer, another host, app.tintwiz.com, and a second
// visit in the same session. Exits 1 on any mismatch.
import {
  QUOTE_LEAD_STORAGE_KEY,
  classifyAnchorClick,
  quoteLocationFromPath,
  referrerHostname,
  shouldFireGenerateLead,
} from '../src/lib/quote-lead.ts';

const QUOTE_URL = 'https://app.tintwiz.com/web/cs/k555dou4xrsun17jpll6ltqkldyiejb8';

let failed = 0;
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    failed += 1;
    console.error('FAIL', name);
    console.error('  actual  ', JSON.stringify(actual));
    console.error('  expected', JSON.stringify(expected));
  }
}

check('empty referrer host', referrerHostname(''), null);
check('missing referrer host', referrerHostname(null), null);
check('garbage referrer host', referrerHostname('not a url'), null);
check('tintwiz host', referrerHostname('https://app.tintwiz.com/web/cs/abc'), 'app.tintwiz.com');
check(
  'lookalike host',
  referrerHostname('https://app.tintwiz.com.evil.example/'),
  'app.tintwiz.com.evil.example',
);
check(
  'host hidden in query',
  referrerHostname('https://evil.example/?next=https://app.tintwiz.com/'),
  'evil.example',
);

check('empty referrer does not fire', shouldFireGenerateLead('', false), false);
check('null referrer does not fire', shouldFireGenerateLead(null, false), false);
check('other host does not fire', shouldFireGenerateLead('https://example.com/', false), false);
check(
  'substring trick does not fire',
  shouldFireGenerateLead('https://evil.example/app.tintwiz.com', false),
  false,
);
check(
  'subdomain trick does not fire',
  shouldFireGenerateLead('https://app.tintwiz.com.evil.example/', false),
  false,
);
check(
  'tintwiz referrer fires',
  shouldFireGenerateLead('https://app.tintwiz.com/web/cs/k555dou4xrsun17jpll6ltqkldyiejb8', false),
  true,
);
check(
  'tintwiz referrer does not fire twice',
  shouldFireGenerateLead('https://app.tintwiz.com/web/cs/k555dou4xrsun17jpll6ltqkldyiejb8', true),
  false,
);
check('http tintwiz still matches host', shouldFireGenerateLead('http://app.tintwiz.com/x', false), true);

// Session: first visit from TintWiz fires and stores the key; a second visit
// in the same session does not, even with the same referrer. A visit with no
// referrer never stores the key, so a later valid referrer in that session can.
function sessionVisit(storage, referrer) {
  const already = storage.get(QUOTE_LEAD_STORAGE_KEY) === '1';
  if (!shouldFireGenerateLead(referrer, already)) return null;
  storage.set(QUOTE_LEAD_STORAGE_KEY, '1');
  return { name: 'generate_lead', location: 'quote_sent' };
}

const session = new Map();
check('session first tintwiz', sessionVisit(session, 'https://app.tintwiz.com/done'), {
  name: 'generate_lead',
  location: 'quote_sent',
});
check('session second tintwiz', sessionVisit(session, 'https://app.tintwiz.com/done'), null);
check('session key', session.get(QUOTE_LEAD_STORAGE_KEY), '1');

const quiet = new Map();
check('session empty referrer', sessionVisit(quiet, ''), null);
check('session other host', sessionVisit(quiet, 'https://mariostintshop.com/'), null);
check('session key stays unset', quiet.get(QUOTE_LEAD_STORAGE_KEY), undefined);
check(
  'later valid referrer can still fire',
  sessionVisit(quiet, 'https://app.tintwiz.com/back'),
  { name: 'generate_lead', location: 'quote_sent' },
);

const quoteClick = {
  type: 'click',
  button: 0,
  href: QUOTE_URL,
  attributeHref: QUOTE_URL,
  quoteLocation: 'home',
  text: 'Get Free Quote >',
};
check('primary click', classifyAnchorClick(quoteClick), {
  name: 'quote_form_click',
  params: { location: 'home' },
});
check('keyboard enter is a click', classifyAnchorClick({ ...quoteClick, button: 0 }), {
  name: 'quote_form_click',
  params: { location: 'home' },
});
check('middle click', classifyAnchorClick({ ...quoteClick, type: 'auxclick', button: 1 }), {
  name: 'quote_form_click',
  params: { location: 'home' },
});
check('right click ignored', classifyAnchorClick({ ...quoteClick, type: 'auxclick', button: 2 }), null);
check(
  'quote without location is not a quote event',
  classifyAnchorClick({ ...quoteClick, quoteLocation: null }),
  null,
);
check(
  'host only in the path does not match',
  classifyAnchorClick({
    ...quoteClick,
    href: 'https://evil.example/app.tintwiz.com',
    quoteLocation: 'home',
  }),
  null,
);

check(
  'phone click',
  classifyAnchorClick({
    type: 'click',
    button: 0,
    href: 'tel:+16154107170',
    attributeHref: 'tel:+16154107170',
    quoteLocation: null,
    text: '(615) 410-7170',
  }),
  { name: 'phone_call_click', params: { link_url: 'tel:+16154107170' } },
);
check(
  'on-page quote button',
  classifyAnchorClick({
    type: 'click',
    button: 0,
    href: 'https://www.mariostintshop.com/#contact',
    attributeHref: '/#contact',
    quoteLocation: null,
    text: 'Get Free Quote',
  }),
  { name: 'quote_cta_click', params: { link_text: 'Get Free Quote' } },
);

check('home location', quoteLocationFromPath('/'), 'home');
check('home location slash', quoteLocationFromPath(''), 'home');
check('visualizer location', quoteLocationFromPath('/visualizer/'), 'visualizer');
check(
  'service location',
  quoteLocationFromPath('/services/window-tinting/'),
  'service_window_tinting',
);
check(
  'ppf location',
  quoteLocationFromPath('/services/paint-protection-film'),
  'service_paint_protection_film',
);
check('unknown location', quoteLocationFromPath('/privacy/'), 'site');

if (QUOTE_LEAD_STORAGE_KEY !== 'quote_sent_lead_fired') {
  failed += 1;
  console.error('FAIL storage key');
}

if (failed) {
  console.error(`check-quote-lead: ${failed} failed`);
  process.exit(1);
}
console.log('check-quote-lead: ok');
