// ════════════════════════════════════════════════════════════════════
// CENTRALIZED SITE DATA — MARIO'S TINT SHOP
// Edit ONLY this file (+ the images in /public/images) to personalize
// the whole site. Items marked ⚠️ REPLACE need the client's real data.
// ════════════════════════════════════════════════════════════════════

export const SITE = {
  name: "Mario's Tint Shop",
  brand: "Mario's Tint Shop",
  shortName: 'Mario',
  role: 'Premium Auto Tint, PPF & Ceramic Coating',
  city: 'Murfreesboro, TN',
  yearsInBusiness: '10+',
  license: 'BBB A+ Accredited',
  title:
    "Mario's Tint Shop | Premium Window Tint, PPF & Ceramic Coating in Murfreesboro, TN",
  description:
    "Premium automotive window tinting, paint protection film (PPF), and ceramic coating in Murfreesboro, TN. 10+ years of experience, BBB A+ rated, Tesla specialists. Book a free call.",
  url: 'https://www.mariostintshop.com', // ⚠️ REPLACE: real domain
  themeColor: '#111111',
};

// ── Contact / Phone ─────────────────────────────────────────────────
// ⚠️ REPLACE: real phone in international format for the tel: link.
export const PHONE_DISPLAY = '(615) 000-0000'; // ⚠️ REPLACE
export const PHONE_TEL = '+16150000000'; // ⚠️ REPLACE (digits only, +1…)
export const WHATSAPP_NUMBER = '16150000000'; // ⚠️ REPLACE (digits only, no +)

export const CONTACT = {
  address: '000 Old Fort Pkwy', // ⚠️ REPLACE
  city: 'Murfreesboro, TN 37129', // ⚠️ REPLACE zip
  phoneDisplay: PHONE_DISPLAY,
  phoneTel: PHONE_TEL,
  email: 'info@mariostintshop.com', // ⚠️ REPLACE
  schedule: 'Mon–Sat, 9:00 a.m. to 6:00 p.m.', // ⚠️ REPLACE
  scheduleShort: 'Mon–Sat 9–6',
  geo: { lat: 35.8456, lng: -86.3903 }, // Murfreesboro, TN (approx.)
  googleBusinessUrl: '#', // ⚠️ REPLACE
  bbbUrl: '#', // ⚠️ REPLACE
};

// ── Hero copy ───────────────────────────────────────────────────────
export const HERO = {
  kicker: "Welcome to Mario's Tint Shop",
  line1: 'Perfecting Every Surface',
  line2: 'with Skilled Hands',
  sub: "We protect your vehicle with premium window tint, paint protection film, and ceramic coating — installed with precision by Murfreesboro's trusted specialists.",
  address: 'We are ready for you at: ',
  addressPlace: '000 Old Fort Pkwy, Murfreesboro, TN', // ⚠️ REPLACE
};

// ── Images (paths under /public/images) ─────────────────────────────
// ⚠️ REPLACE each placeholder (Unsplash) with real high-contrast shop
// photography. Keep the same keys or update the paths here.
export const IMAGES = {
  heroBg: {
    src: '/images/hero.png',
    alt: '',
    width: 1584,
    height: 672,
  },
  hero: {
    src: 'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&h=1400&q=80',
    alt: 'Detailer working on a vehicle in a professional studio',
    width: 1200,
    height: 1400,
  },
  install: {
    src: '/images/lambo.svg',
    alt: 'Lamborghini with premium tint and paint protection',
    width: 774,
    height: 284,
  },
  detail: {
    src: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&h=1000&q=80',
    alt: 'Close detail of a glossy dark luxury car surface',
    width: 1400,
    height: 1000,
  },
  garage: {
    src: 'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1400&h=1000&q=80',
    alt: 'Clean professional detailing studio interior',
    width: 1400,
    height: 1000,
  },
  tesla: {
    src: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1400&h=900&q=80',
    alt: 'Tesla parked in a modern setting',
    width: 1400,
    height: 900,
  },
  fleet: {
    src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1600&h=800&q=80',
    alt: 'Row of premium vehicles ready for service',
    width: 1600,
    height: 800,
  },
};

// ── Trust stats (num → animated count-up; text → static) ────────────
export interface Stat {
  num?: number;
  suffix?: string;
  text?: string;
  label: string;
}
export const STATS: Stat[] = [
  { num: 10, suffix: '+', label: 'Years Experience' },
  { text: 'A+', label: 'BBB Rating' },
  { text: 'Tesla', label: 'Specialists' },
  { num: 500, suffix: '+', label: '5-Star Reviews' },
];

// ── "Why choose us" ─────────────────────────────────────────────────
export const WHY_US = {
  lead: "A great protection job isn't about promises — it's about results.",
  intro: 'Everything we do is built to keep you confident in your vehicle.',
  bullets: [
    'Certified, experienced installers on every single job.',
    "We don't push unnecessary work — we protect what matters.",
    'Premium, warranty-backed films and coatings only.',
    'We respect your time and hit our promised turnaround.',
    '87% of our new customers come from referrals.',
  ],
  cards: [
    {
      title: 'Certified Installers',
      body: 'Our team has years of hands-on experience with tint, PPF, and ceramic. We know how to install film flawlessly — and how to avoid the mistakes that cause peeling and bubbling.',
    },
    {
      title: 'Premium Materials',
      body: 'First, we assess your vehicle and recommend exactly what it needs. Then we use only trusted, warranty-backed films and coatings — no bargain product, no surprises, no hidden charges.',
    },
  ],
};

// ── Warranty highlight ──────────────────────────────────────────────
export const WARRANTY = {
  headline: 'Lifetime warranty on premium tint & film',
  body: "We stand behind our work with manufacturer-backed warranties. If an issue ever comes up, simply bring your vehicle back and we'll make it right — at our expense.",
};

// ── About section ───────────────────────────────────────────────────
export const ABOUT = {
  number: '01',
  title: ["About Mario's", 'Tint Shop'],
  lead: 'Murfreesboro’s trusted specialists for premium window tint, paint protection film, and ceramic coating.',
  body1:
    'For over a decade we’ve treated every vehicle like our own — from daily drivers to show cars and Teslas. No shortcuts, no bargain film, no guesswork.',
  body2:
    'Our certified installers work in a clean, controlled bay using only warranty-backed materials. The result is protection that looks factory-clean and holds up for years — and a BBB A+ reputation built one flawless install at a time.',
};

// ── Instagram ───────────────────────────────────────────────────────
export const INSTAGRAM = {
  handle: '@mariostintshop', // ⚠️ REPLACE
  url: 'https://instagram.com/', // ⚠️ REPLACE with real profile
  label: '#OurInstagram',
};

// ── Fleet / commercial offer ────────────────────────────────────────
export const OFFER = {
  discount: '-15%',
  title: 'Off Fleet & Commercial Work',
  body: 'We value long-term partnerships and offer preferred pricing for fleets, dealerships, delivery services, and commercial clients. Call us to discuss terms and volume rates.',
};

// ── Services ────────────────────────────────────────────────────────
export interface Feature {
  title: string;
  body: string;
}

export interface Service {
  id: string;
  slug: string; // -> /services/{slug}
  kicker: string; // technical label (uppercase)
  name: string;
  short: string; // card description on the home grid
  meta: string; // tagline / scope shown on the card
  startingPrice: string; // ⚠️ REPLACE with real pricing
  includes: string[]; // "what's included" rows for the packages section
  // Per-service page content:
  heroSubcopy: string;
  intro: string;
  features: Feature[];
  process: string[];
  faqs: { q: string; a: string }[];
  image: keyof typeof IMAGES;
}

export const SERVICES: Service[] = [
  {
    id: 'window-tinting',
    slug: 'window-tinting',
    kicker: 'Window Tinting',
    name: 'Car Window Tinting',
    short:
      'Premium ceramic and carbon window film that cuts heat, blocks UV, and gives a clean, factory-finished look — installed to last.',
    meta: 'Ceramic & carbon films · lifetime warranty',
    startingPrice: 'from $199', // ⚠️ REPLACE
    includes: [
      'Full vehicle ceramic or carbon film',
      'Up to 99% UV rejection',
      'Legal TN shade consultation',
      'Lifetime warranty against fading & bubbling',
    ],
    heroSubcopy:
      'High-performance ceramic and carbon window films that reject heat, block 99% of UV, and stay bubble-free for the life of your vehicle.',
    intro:
      'Not all tint is created equal. We install premium ceramic and carbon films that deliver serious heat rejection and glare control without the purple fade or bubbling of cheap film. Every install is cut and fit precisely for a factory-clean finish.',
    features: [
      { title: 'Heat & Glare Rejection', body: 'Ceramic films block infrared heat so your cabin stays cooler and your A/C works less on Tennessee summer days.' },
      { title: '99% UV Protection', body: 'Protect your skin and keep your interior from cracking and fading with near-total UV blocking.' },
      { title: 'Clean, Legal Finish', body: 'Precision-cut film with no bubbles or purple fade, installed to match Tennessee tint regulations.' },
      { title: 'Lifetime Warranty', body: 'Our premium films are backed by a manufacturer lifetime warranty against fading, peeling, and bubbling.' },
    ],
    process: [
      'Free consultation to choose the right shade and film grade',
      'Precise computer-cut patterns for a clean edge-to-edge fit',
      'Dust-controlled installation by certified technicians',
      'Final inspection and cure-time care instructions',
    ],
    faqs: [
      { q: 'How dark can I legally tint in Tennessee?', a: 'Tennessee allows a minimum of 35% VLT on front side, rear side, and rear windows. We help you choose a legal shade that still delivers strong heat and UV protection.' },
      { q: 'How long does the tint take to cure?', a: 'Most tint fully cures within 3–5 days depending on weather. We ask you to keep windows rolled up during that time for the best result.' },
      { q: 'Will the tint turn purple over time?', a: 'No. Our premium ceramic and carbon films are dyed and constructed to never fade to purple, unlike low-cost dyed films.' },
    ],
    image: 'detail',
  },
  {
    id: 'ppf',
    slug: 'paint-protection-film',
    kicker: 'Paint Protection',
    name: 'Paint Protection Film (PPF)',
    short:
      'Clear bra film that shields your paint from rock chips, scratches, road rash, and UV damage — invisible protection that keeps your finish flawless.',
    meta: 'Self-healing clear bra · full & partial',
    startingPrice: 'from $899', // ⚠️ REPLACE
    includes: [
      'Self-healing urethane clear bra',
      'Full-front, track pack, or full-body coverage',
      'Wrapped, invisible edges',
      'Up to 10-year manufacturer warranty',
    ],
    heroSubcopy:
      'Virtually invisible, self-healing clear bra that guards your paint against rock chips, scratches, and road debris — without changing the look of your car.',
    intro:
      'Paint Protection Film is the strongest defense for your finish. This transparent, self-healing urethane film absorbs impacts from rocks, sand, and road debris that would otherwise chip and scratch your paint — preserving both the look and the resale value of your vehicle.',
    features: [
      { title: 'Rock Chip & Scratch Defense', body: 'A tough urethane layer takes the hits from highway debris so your paint stays flawless.' },
      { title: 'Self-Healing Finish', body: 'Light swirls and scratches disappear with heat from the sun or warm water.' },
      { title: 'UV & Stain Resistance', body: 'Blocks UV yellowing and resists bug acids, tar, and road salt common on TN roads.' },
      { title: 'Invisible Protection', body: 'Optically clear film preserves your factory look while protecting high-impact areas.' },
    ],
    process: [
      'Walk-around to map high-impact zones and coverage options',
      'Custom-tailored patterns for full-front, track pack, or full-body',
      'Meticulous hand installation with wrapped edges',
      'Curing and a final detail so the film disappears into the paint',
    ],
    faqs: [
      { q: 'What areas should I protect with PPF?', a: 'Popular options are a full-front package (bumper, hood, fenders, mirrors) for rock-chip zones, or full-body coverage for complete protection. We tailor coverage to how and where you drive.' },
      { q: 'How long does PPF last?', a: 'Quality PPF lasts 8–10 years and is backed by a manufacturer warranty against yellowing, cracking, and delamination.' },
      { q: 'Can PPF and ceramic coating be combined?', a: 'Yes — many clients add a ceramic coating over PPF for the easiest cleaning and maximum gloss. We can bundle both.' },
    ],
    image: 'install',
  },
  {
    id: 'ceramic-coating',
    slug: 'ceramic-coating',
    kicker: 'Ceramic Coating',
    name: 'Ceramic Coating',
    short:
      'A durable nano-ceramic layer that bonds to your paint for deep gloss, hydrophobic protection, and resistance to scratches, swirls, and contaminants.',
    meta: 'Nano-ceramic · multi-year protection',
    startingPrice: 'from $699', // ⚠️ REPLACE
    includes: [
      'Full decontamination & paint prep',
      'Multi-stage paint correction',
      'Nano-ceramic coating application',
      '2–5+ year protection tiers',
    ],
    heroSubcopy:
      'A liquid nano-ceramic layer that bonds to your paint for years of deep gloss, easy cleaning, and protection from swirls, stains, and contaminants.',
    intro:
      'Ceramic coating is a semi-permanent bond that transforms how your paint looks and how easily it stays clean. It adds a hard, hydrophobic layer that repels water, dirt, and chemicals while giving your finish an incredible depth of gloss that ordinary wax can never match.',
    features: [
      { title: 'Hydrophobic Self-Cleaning', body: 'Water, mud, and grime bead up and slide off, so washes are faster and less frequent.' },
      { title: 'Swirl & Scratch Resistance', body: 'A hardened ceramic layer resists the fine swirls and marring from washing and daily driving.' },
      { title: 'Deep, Lasting Gloss', body: 'A glass-like shine with real depth that outlasts and outshines traditional wax.' },
      { title: 'Chemical & UV Protection', body: 'Guards against bird droppings, bug acids, road salt, and UV oxidation that dull your paint.' },
    ],
    process: [
      'Full decontamination wash and clay treatment',
      'Multi-stage paint correction to remove existing swirls',
      'Ceramic coating applied panel-by-panel in a controlled bay',
      'Infrared or timed cure, then a final quality inspection',
    ],
    faqs: [
      { q: 'How long does ceramic coating last?', a: 'Depending on the package, our coatings last from 2 to 5+ years with proper maintenance. We offer tiered options to match your goals and budget.' },
      { q: 'Does ceramic coating replace PPF?', a: 'No. Ceramic coating resists swirls, chemicals, and water spots but does not stop rock chips. For impact protection, pair it with PPF.' },
      { q: 'Do I still need to wash my car?', a: 'Yes, but far less often and much more easily. Dirt releases with a simple rinse and gentle wash — no waxing required.' },
    ],
    image: 'garage',
  },
  {
    id: 'tesla',
    slug: 'tesla',
    kicker: 'Tesla Services',
    name: 'Tesla Services',
    short:
      'Specialized tint, PPF, and ceramic coating tailored to every Tesla model — precision patterns for Model 3, Y, S, and X.',
    meta: 'Model 3 · Y · S · X · Cybertruck',
    startingPrice: 'from $299', // ⚠️ REPLACE
    includes: [
      'Model-specific tint & PPF patterns',
      'Panoramic glass-roof ceramic tint',
      'Soft-paint-safe installation',
      'Tint, PPF & ceramic bundles',
    ],
    heroSubcopy:
      'Tesla-specialized window tint, paint protection film, and ceramic coating with model-specific patterns for a flawless, factory-integrated result.',
    intro:
      "Teslas deserve a specialist. From the panoramic glass roof to the delicate factory paint, we've dialed in tint, PPF, and ceramic packages built specifically for every Tesla model — so protection looks like it came from the factory, not the aftermarket.",
    features: [
      { title: 'Model-Specific Patterns', body: 'Precision-cut coverage engineered for Model 3, Y, S, X, and Cybertruck panels and glass.' },
      { title: 'Glass Roof Heat Control', body: 'Ceramic tint options for the panoramic roof cut cabin heat and glare dramatically.' },
      { title: 'Soft-Paint Protection', body: "PPF tuned for Tesla's softer factory paint, guarding the most chip-prone areas." },
      { title: 'Range-Friendly Comfort', body: 'Lower cabin heat means less A/C load — a small win for comfort and efficiency.' },
    ],
    process: [
      'Model-specific consultation on tint, PPF, and ceramic options',
      'Pre-cut patterns matched to your exact Tesla model',
      'Clean-room installation with wrapped, invisible edges',
      'Final inspection and care guidance',
    ],
    faqs: [
      { q: 'Do you work on all Tesla models?', a: 'Yes — Model 3, Model Y, Model S, Model X, and Cybertruck. We use model-specific patterns for each.' },
      { q: 'Can you tint the Tesla glass roof?', a: 'Yes. We offer ceramic film for the panoramic roof that significantly reduces heat and glare while keeping visibility clear.' },
      { q: 'What protects Tesla paint best?', a: 'A full-front or full-body PPF package handles rock chips, and a ceramic coating on top keeps it glossy and easy to clean. We commonly do both together on Teslas.' },
    ],
    image: 'tesla',
  },
  {
    id: 'commercial-films',
    slug: 'commercial-films',
    kicker: 'Commercial Films',
    name: 'Office & Commercial Films',
    short:
      'Architectural window films for offices and commercial buildings — cut glare and energy costs, add privacy, and protect interiors from UV fading.',
    meta: 'Offices · storefronts · buildings',
    startingPrice: 'Custom quote', // ⚠️ REPLACE
    includes: [
      'Solar & heat-control films',
      'Glare-reduction for workspaces',
      'Privacy, frost & security films',
      'After-hours installation',
    ],
    heroSubcopy:
      'Architectural window film for offices, storefronts, and commercial buildings — reduce glare and energy costs, add privacy, and protect interiors.',
    intro:
      'Commercial window film is a fast, high-return upgrade for any workspace. It lowers cooling costs, eliminates screen glare, protects furnishings from UV fading, and adds privacy and security — all without replacing a single pane of glass.',
    features: [
      { title: 'Lower Energy Costs', body: 'Reject solar heat to ease HVAC load and cut cooling bills across the building.' },
      { title: 'Glare & Comfort Control', body: 'Eliminate harsh screen glare so employees stay comfortable and productive.' },
      { title: 'Privacy & Security', body: 'Frosted, reflective, and safety films add privacy and hold glass together on impact.' },
      { title: 'UV Fade Protection', body: 'Block 99% of UV to protect flooring, furniture, and merchandise from fading.' },
    ],
    process: [
      'On-site assessment and film recommendation',
      'Written estimate with energy and glare goals',
      'After-hours installation to avoid business disruption',
      'Walk-through and warranty documentation',
    ],
    faqs: [
      { q: 'Do you install after business hours?', a: 'Yes. We schedule commercial installs around your operations, including evenings and weekends, to minimize disruption.' },
      { q: 'What kinds of commercial film do you offer?', a: 'Solar/heat-control, glare-reduction, decorative and privacy frost, reflective, and safety/security films for storefronts and office buildings.' },
      { q: 'Can film really lower our energy bills?', a: 'Yes. By rejecting solar heat gain, quality window film reduces cooling load and can deliver a meaningful return on energy costs.' },
    ],
    image: 'fleet',
  },
];

/** Look up a service by its slug (used by the per-service pages). */
export const getService = (slug: string) =>
  SERVICES.find((s) => s.slug === slug);

// ── Testimonials ────────────────────────────────────────────────────
// ⚠️ REPLACE with real reviews (ideally from Google / BBB, with names)
// and real photos of the customer's finished vehicle (the evidence shot).
export const TESTIMONIALS = [
  {
    quote: 'Flawless tint job on my truck — no bubbles, perfectly cut, and the cabin stays so much cooler. These guys are pros.',
    author: 'James R.',
    photo: {
      src: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&h=500&q=80',
      alt: "James's truck with fresh window tint",
    },
  },
  {
    quote: 'Had a full-front PPF done on my Tesla Model Y. You literally cannot see the film, and the paint is bulletproof now. Worth every penny.',
    author: 'Priya S.',
    photo: {
      src: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&h=500&q=80',
      alt: "Priya's Tesla with paint protection film",
    },
  },
  {
    quote: 'The ceramic coating made my black paint look wet. Rain just rolls off and washing takes half the time. Highly recommend.',
    author: 'Derek M.',
    photo: {
      src: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&h=500&q=80',
      alt: "Derek's car after ceramic coating",
    },
  },
];

// ── Instagram gallery (placeholder photos — ⚠️ REPLACE with real work) ──
export const GALLERY = [
  { src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&h=600&q=80', alt: 'Sports car detail' },
  { src: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&h=600&q=80', alt: 'Glossy dark car surface' },
  { src: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&h=600&q=80', alt: 'Muscle car front' },
  { src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&h=600&q=80', alt: 'Premium vehicle' },
  { src: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=600&h=600&q=80', alt: 'Film installation' },
  { src: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=600&h=600&q=80', alt: 'Car rear detail' },
];

// ── Navigation ──────────────────────────────────────────────────────
export const NAV_LINKS = [
  { href: '/#about', label: 'About' },
  { href: '/#services', label: 'Services' },
  { href: '/#gallery', label: 'Gallery' },
  { href: '/#testimonials', label: 'Reviews' },
];

// ── Social profiles (⚠️ REPLACE the # placeholders with real URLs) ──
export const SOCIALS = [
  { name: 'Instagram', href: INSTAGRAM.url },
  { name: 'Facebook', href: '#' }, // ⚠️ REPLACE
  { name: 'Google', href: CONTACT.googleBusinessUrl },
];

// ── "Done with confidence" benefit cards (4-up on the home page) ────
export const BENEFITS = [
  {
    title: 'Expertise & Experience',
    body: 'Certified installers with 10+ years of hands-on tint, PPF, and ceramic work — no peeling, no bubbling, no shortcuts.',
  },
  {
    title: 'Customized Solutions',
    body: 'We assess your vehicle first and recommend exactly what it needs — never unnecessary work or bargain product.',
  },
  {
    title: 'Value for Money',
    body: 'Premium, warranty-backed films and coatings at honest prices. No surprises, no hidden charges.',
  },
  {
    title: 'Long-Term Benefits',
    body: 'Protection that preserves your paint, your interior, and your resale value for years — backed by lifetime warranties.',
  },
];

