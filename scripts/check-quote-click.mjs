// Logic for quote_form_click: one event per activation, location from the path.
// Exits 1 on any mismatch. Plain ESM, no experimental flags.
import { classifyAnchorClick, quoteLocationFromPath } from '../src/lib/quote-click.mjs';

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
  'lookalike host does not match',
  classifyAnchorClick({
    ...quoteClick,
    href: 'https://app.tintwiz.com.evil.example/',
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
check('service location', quoteLocationFromPath('/services/window-tinting/'), 'service_window_tinting');
check('ppf location', quoteLocationFromPath('/services/paint-protection-film'), 'service_paint_protection_film');
check('ceramic location', quoteLocationFromPath('/services/ceramic-coating/'), 'service_ceramic_coating');
check('tesla location', quoteLocationFromPath('/services/tesla/'), 'service_tesla');
check('commercial location', quoteLocationFromPath('/services/commercial-films/'), 'service_commercial_films');
check('unknown location', quoteLocationFromPath('/privacy/'), 'site');

if (failed) {
  console.error(`check-quote-click: ${failed} failed`);
  process.exit(1);
}
console.log('check-quote-click: ok');
