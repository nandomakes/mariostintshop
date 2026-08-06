// ════════════════════════════════════════════════════════════════════
// CENTRALIZED SITE DATA — MARIO'S TINT SHOP
// Edit ONLY this file (+ the images in /public/images) to personalize
// the whole site. Items marked ⚠️ REPLACE need the client's real data.
// ════════════════════════════════════════════════════════════════════

export const SITE = {
  name: "Mario's Tint Shop",
  brand: "Mario's Tint Shop",
  shortName: 'Mario',
  role: '3M Window Tinting, PPF & Ceramic Coating',
  city: 'Murfreesboro, TN',
  yearsInBusiness: '25+',
  license: 'BBB A+ Accredited · Authorized 3M Platinum Dealer',
  title:
    "Mario's Tint Shop | 3M Window Tinting, PPF & Ceramic Coating in Murfreesboro, TN",
  // Kept under ~155 chars so Google doesn't truncate it in search results.
  description:
    '3M window tinting, paint protection film & ceramic coating in Murfreesboro, TN. 25+ years experience, BBB A+ rated, 5.0-star Google reviews.',
  // Must match `site` in astro.config.mjs. www, because Vercel 308-redirects
  // the apex to www — a non-www canonical would point at a redirect.
  url: 'https://www.mariostintshop.com',
  themeColor: '#111111',
};

// ── Contact / Phone ─────────────────────────────────────────────────
export const PHONE_DISPLAY = '(615) 410-7170';
export const PHONE_TEL = '+16154107170';
// Tintwiz booking/quote form — the client's live estimator. Embedded as an
// iframe in QuoteCTA. Replace only if Tintwiz issues a new embed URL.
export const TINTWIZ_FORM_URL =
  'https://app.tintwiz.com/web/ce/k555dou4xrsun17jpll6ltqkldyiejb8';

export const CONTACT = {
  address: '515 NW Broad St',
  city: 'Murfreesboro, TN 37130',
  phoneDisplay: PHONE_DISPLAY,
  phoneTel: PHONE_TEL,
  email: 'mario@mariostintshop.com',
  schedule: 'Mon–Fri, 8:00 a.m. to 5:00 p.m. · Sat by appointment',
  scheduleShort: 'Mon–Fri 8–5',
  // Single source of truth for opening hours: the footer list and the
  // JSON-LD openingHoursSpecification are both derived from this, so the
  // three can no longer drift apart.
  hours: [
    { label: 'Mon–Fri', value: '8:00 a.m. – 5:00 p.m.' },
    { label: 'Saturday', value: 'By appointment' },
    { label: 'Sunday', value: 'Closed' },
  ],
  hoursSpec: [
    {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '17:00',
    },
    // Saturday is appointment-only; marked as such rather than omitted, so
    // Google doesn't show the shop as closed on Saturdays.
    { days: ['Saturday'], opens: '09:00', closes: '15:00', byAppointment: true },
  ],
  geo: { lat: 35.8470688, lng: -86.3974265 },
  googleBusinessUrl:
    "https://maps.app.goo.gl/ChC6iGfAj8wzBpwk6",
  bbbUrl:
    'https://www.bbb.org/us/tn/murfreesboro/profile/car-window-tinting/marios-tint-shop-0573-37192075',
};

// ── Hero copy ───────────────────────────────────────────────────────
export const HERO = {
  kicker: "Murfreesboro's Elite Tint Shop",
  line1: 'Leading 3M Dealer',
  line2: 'in Middle Tennessee',
  sub: "Mario's Tint Shop is the premier provider of 3M automotive and architectural window tinting, paint protection film, and ceramic coating services to customers in Middle Tennessee.",
  address: 'We are ready for you at: ',
  addressPlace: '515 NW Broad St, Murfreesboro, TN 37130',
};

// ── Images ──────────────────────────────────────────────────────────
// These live in src/assets/images (NOT public/) so Astro processes them:
// each one is emitted as hashed, responsive AVIF/WebP under /_astro/ and
// served with a one-year immutable cache. `src` is an ImageMetadata object
// carrying intrinsic width/height — render it with <Image>/<Picture> from
// `astro:assets` and never hand-write width/height at the call site.
import heroBgImg from './assets/images/hero-4.png';
import previewImg from './assets/images/our-services.webp';
import tinting1Img from './assets/images/tinting-1.webp';
import tintingImg from './assets/images/tinting-2.webp';
import paintImg from './assets/images/paint-1.webp';
import coatingImg from './assets/images/coating-1.webp';
import teslaSvcImg from './assets/images/tesla-1.webp';
import officeImg from './assets/images/office.webp';
import office2Img from './assets/images/office-2.webp';
import installImg from './assets/images/lambo-hero.webp';

export const IMAGES = {
  heroBg: {
    src: heroBgImg,
    alt: '',
  },
  // Satisfaction-badge image in the "Our services" section.
  preview: {
    src: previewImg,
    alt: "Red Lexus IS with freshly installed window tint at Mario's Tint Shop",
  },
  // Per-service imagery (card preview + service page).
  tinting1: {
    src: tinting1Img,
    alt: 'White SUV with freshly installed window tint in the shop',
  },
  tinting: {
    src: tintingImg,
    alt: 'Car window tinting installation',
  },
  paint: {
    src: paintImg,
    alt: 'Paint protection film application',
  },
  coating: {
    src: coatingImg,
    alt: 'Ceramic coating finish on a vehicle',
  },
  teslaSvc: {
    src: teslaSvcImg,
    alt: 'Tesla with premium tint and protection',
  },
  office: {
    src: officeImg,
    alt: 'Office and commercial window film',
  },
  office2: {
    src: office2Img,
    alt: 'Commercial building with window film installed',
  },
  install: {
    src: installImg,
    alt: 'Lamborghini with premium tint and paint protection',
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
  { num: 25, suffix: '+', label: 'Years Experience' },
  { text: 'A+', label: 'BBB Rating' },
  { text: '3M', label: 'Platinum Dealer' },
  { num: 390, suffix: '+', label: '5-Star Reviews' },
];

// ── "Why choose us" ─────────────────────────────────────────────────
export const WHY_US = {
  lead: 'Our mission is to provide top-notch automotive paint protection and window tinting services.',
  intro:
    'We use only the highest quality materials and tools to ensure perfect results — and our A+ rating from the Better Business Bureau is a testament to our commitment to excellence.',
  bullets: [
    'Authorized 3M Platinum Dealer — certified 3M installers.',
    'Over 25 years of experience in the automotive and window film industry.',
    'Lifetime warranty available on our window films.',
    '5.0-star Google rating from 390+ customer reviews.',
    'A+ rated by the Better Business Bureau.',
  ],
  cards: [
    {
      title: 'Authorized 3M Platinum Dealer',
      body: 'As a leading 3M dealer in the Nashville area, we install the full range of 3M automotive and architectural films — from Obsidian carbon tint to Ceramic IR and Prestige series — all backed by comprehensive 3M manufacturer warranties.',
    },
    {
      title: 'Premium Materials Only',
      body: 'We use exclusively 3M film and coating products on every job. First we assess your vehicle and recommend exactly what it needs — no bargain film, no surprises, no hidden charges.',
    },
  ],
};

// ── Warranty highlight ──────────────────────────────────────────────
export const WARRANTY = {
  headline: 'Lifetime warranty available on our window films',
  body: "We stand behind our work with manufacturer-backed warranties — including 3M's comprehensive 10-year PPF warranty. If an issue ever comes up, simply bring your vehicle back and we'll make it right.",
};

// ── About section ───────────────────────────────────────────────────
export const ABOUT = {
  number: '01',
  title: ["About Mario's", 'Tint Shop'],
  lead: "Mario's Tint Shop was built on decades of experience in the automotive accessories and window tinting industry — over 25 years working with vehicle accessories, automotive electronics, and professional window film installation.",
  body1:
    "For more than 10 years, Mario's Tint Shop has proudly served Murfreesboro, Nashville, and the surrounding Middle Tennessee communities with professional automotive window tinting and paint protection film installation, building a strong reputation for high-quality workmanship, premium materials, and exceptional customer service.",
  body2:
    "We're a one-stop shop for window tinting, paint protection film, ceramic coating, and office & commercial films. Our attention to detail and commitment to premium 3M products ensure every installation meets the highest standards — backed by an A+ BBB rating and a 5.0-star Google rating.",
};

// ── Instagram ───────────────────────────────────────────────────────
export const INSTAGRAM = {
  handle: '@mariostintshop',
  url: 'https://www.instagram.com/mariostintshop/',
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
  image: keyof typeof IMAGES; // card preview (and service page unless pageImage is set)
  pageImage?: keyof typeof IMAGES; // overrides the service-page image when it differs from the card
}

export const SERVICES: Service[] = [
  {
    id: 'window-tinting',
    slug: 'window-tinting',
    kicker: 'Window Tinting',
    name: 'Car Window Tinting',
    short:
      'Quality 3M car window tinting that protects your vehicle, keeps your interior cooler, and blocks up to 99% of damaging UV rays.',
    meta: '3M Obsidian · CS IR nano ceramic · Ceramic IR',
    startingPrice: 'Free quote',
    includes: [
      'Silver: 3M™ Obsidian Series carbon film',
      'Gold: 3M™ CS IR nano ceramic film',
      'Platinum: 3M™ Ceramic IR — up to 90% IR rejection',
      'Lifetime warranty available',
    ],
    heroSubcopy:
      'Premium 3M™ Ceramic IR window tint in Murfreesboro — infrared heat rejection, up to 99% UV protection, less glare, and a stylish custom look for any vehicle.',
    intro:
      "Tennessee summers can make a vehicle unbearably hot. At Mario's Tint Shop in Murfreesboro, TN, we install premium 3M™ Ceramic IR window film engineered to reject infrared heat, block up to 99% of harmful UV rays, and give you a cooler, more comfortable drive. Whether you're commuting across Murfreesboro, running I-24, or parked in the summer sun, ceramic tint cuts heat and glare and protects your interior from fading. As an Authorized 3M Platinum Dealer we serve Murfreesboro, Smyrna, Lebanon, Franklin, Nashville and the surrounding Middle Tennessee area, with films tailored to every budget and performance need.",
    features: [
      { title: 'Infrared Heat Rejection', body: '3M™ Ceramic IR rejects up to 90% of infrared heat — the part of sunlight you actually feel — so the cabin stays cooler and your A/C works less.' },
      { title: 'Up to 99% UV Protection', body: 'Our premium ceramic and carbon films block up to 99% of damaging UVA and UVB rays, protecting leather, vinyl, dashboards, and upholstery from fading and cracking.' },
      { title: 'No Signal Interference', body: "Non-metallized ceramic construction won't interfere with GPS, Bluetooth, cell phone, or satellite radio signals — unlike older metallic films." },
      { title: 'Reduced Glare, Safer Driving', body: 'Cutting harsh glare from low sun and oncoming headlights makes for a more comfortable, less fatiguing drive, day or night.' },
      { title: 'Safety & Privacy', body: 'The film helps hold shattered glass together on impact, and reduced visibility into your car deters break-ins by keeping valuables out of sight.' },
      { title: '3M Tiered Packages', body: 'Choose Silver (3M Obsidian carbon), Gold (3M CS IR nano ceramic), or Platinum (3M Ceramic IR) — multiple shades, excellent visibility, manufacturer-backed limited warranty.' },
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
      { q: 'Is ceramic window tint worth it over standard film?', a: "If heat is what bothers you, yes. Standard dyed film mainly darkens the glass, while 3M™ Ceramic IR is built to reject infrared — up to 90% of it — so the cabin actually feels cooler rather than just looking darker. It also keeps GPS, Bluetooth, and cell signals clear, and carries a manufacturer's limited warranty." },
      { q: 'Which areas do you serve?', a: 'We are based in Murfreesboro and regularly tint vehicles from Smyrna, Lebanon, Franklin, La Vergne, Brentwood, Nashville, and across Rutherford County and Middle Tennessee.' },
      { q: 'Do you offer more than window tint?', a: 'We do — paint protection film (PPF), ceramic coatings, windshield protection film, and full vehicle appearance protection. Many customers pair ceramic tint with PPF on the front end.' },
    ],
    image: 'tinting',
    pageImage: 'tinting1',
  },
  {
    id: 'ppf',
    slug: 'paint-protection-film',
    kicker: 'Paint Protection',
    name: 'Paint Protection Film (PPF)',
    short:
      'Professional clear bra installation by certified 3M installers — self-healing defense against scratches, UV damage, and rock chips.',
    meta: '3M Paint Protection Film · 10-year warranty',
    startingPrice: 'Free quote',
    includes: [
      'Partial Front End: 12"–18" hood, fenders, bumper & mirrors',
      'Full Front End: full hood, fenders, bumper & mirrors',
      'Complete Coverage: every exposed painted surface',
      '10-year manufacturer warranty (3M)',
    ],
    heroSubcopy:
      "Premium self-healing paint protection film (clear bra) from 3M — safeguarding your car's factory paint against scratches, chips, and road hazards.",
    intro:
      "At Mario's Tint Shop we specialize in premium 3M paint protection film (PPF) — an invisible clear bra that protects your factory paint from scratches, chips, and road debris. We are certified 3M dealers and installers, with cutting-edge self-healing film where minor scratches vanish when exposed to heat.",
    features: [
      { title: '3M Paint Protection', body: 'Self-healing PPF combined with ceramic coating technology — exceptional clarity, gloss, and hydrophobic performance, backed by a 10-year warranty.' },
      { title: 'Self-Healing Technology', body: "Minor scratches and swirl marks on the film's surface vanish when exposed to heat — warm water or sunlight — keeping your vehicle looking new." },
      { title: 'Enhanced Resale Value', body: 'A vehicle protected with PPF retains its appearance and value over time, and the film is virtually invisible once applied.' },
      { title: '10-Year 3M Warranty', body: "Every installation is backed by 3M's comprehensive manufacturer warranty against yellowing, cracking, and delamination." },
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
    image: 'paint',
  },
  {
    id: 'ceramic-coating',
    slug: 'ceramic-coating',
    kicker: 'Ceramic Coating',
    name: 'Ceramic Coating',
    short:
      "Say goodbye to scratches, swirls, and blemishes — 3M ceramic coating keeps your vehicle's paint protected and looking great for years to come.",
    meta: '3M ceramic coating · up to 5-year protection',
    startingPrice: 'Free quote',
    includes: [
      '3M automotive paint ceramic coating',
      'Bonds to paint, PPF, glass, trim & vinyl wraps',
      'Single layer: up to 3 years · dual layer: up to 5 years',
      'Hydrophobic "wet look" finish',
    ],
    heroSubcopy:
      "A leading-industry 3M ceramic formula that safeguards your car's paint against environmental contaminants, harsh UV rays, and damaging factors — with a durable, hydrophobic gloss.",
    intro:
      "At Mario's Tint Shop in Murfreesboro, our ceramic coating service utilizes a leading-industry 3M formula designed to safeguard your car's paint against environmental contaminants, harsh UV rays, and other damaging factors. The durable, hydrophobic layer enhances gloss and clarity while repelling dirt and water — making it easy to maintain that showroom finish.",
    features: [
      { title: 'Superior Environmental Protection', body: 'Robust defense against dirt, road debris, UV rays, chemical etching from bug splatter, and corrosive bird droppings.' },
      { title: 'Long-Lasting Durability', body: 'A single layer protects for up to three years; a dual-layer application lasts up to five years with proper maintenance.' },
      { title: 'Hydrophobic Easy Cleaning', body: 'Excellent water beading sheds water quickly and makes cleaning off dirt, bugs, and droppings much easier — with a lasting "wet look" finish.' },
      { title: 'Chemical Resistance', body: 'Resistant to harsh chemicals like road salt and high/low pH cleaners, preserving your paint and boosting resale value.' },
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
    image: 'coating',
  },
  {
    id: 'tesla',
    slug: 'tesla',
    kicker: 'Tesla Services',
    name: 'Tesla Services',
    short:
      'High-quality 3M window tint, PPF, and ceramic coating services designed to fit the needs of all Tesla models — Model 3, Y, S, and X.',
    meta: 'Model 3 · Y · S · X · 3M Nano Ceramic',
    startingPrice: 'Free quote',
    includes: [
      '3M Nano Ceramic window tint for Tesla glass',
      '3M PPF (clear bra) with 10-year warranty',
      'Panoramic roof & large rear window expertise',
      'Zero interference with GPS or cell signals',
    ],
    heroSubcopy:
      'The leading 3M installer for Tesla owners in the Nashville area — precision-fit window tint, paint protection film, and ceramic coating for every Tesla model.',
    intro:
      "As a leading installer of high-quality 3M automotive products in the Nashville area, Mario's Tint Shop offers Tesla owners a comprehensive range of services to enhance the comfort, appearance, and protection of their electric vehicles. We understand the unique specifications of all Tesla models, ensuring a precision fit and flawless finish for every installation.",
    features: [
      { title: '3M Nano Ceramic Tint', body: "High heat rejection keeps your Tesla cooler and reduces A/C strain — customized to your preference and compliant with Tennessee tint laws." },
      { title: 'Zero Signal Interference', body: "The non-metallized ceramic construction won't interfere with your Tesla's GPS, cell phone signals, or radio reception." },
      { title: 'Tesla Glass Expertise', body: 'Our installers understand the unique glass features of Tesla cars, including the large rear windows and panoramic roofs.' },
      { title: '3M PPF Protection', body: "Durable 3M clear bra guards against road debris and minor abrasions, backed by 3M's comprehensive 10-year warranty." },
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
    image: 'teslaSvc',
  },
  {
    id: 'commercial-films',
    slug: 'commercial-films',
    kicker: 'Commercial Films',
    name: 'Office & Commercial Films',
    short:
      '3M window tinting solutions for office and commercial buildings — professional installation for optimal protection and energy efficiency.',
    meta: '3M Prestige · Ceramic · Night Vision · Low-E',
    startingPrice: 'Custom quote',
    includes: [
      '3M Prestige: up to 97% IR / 60% total heat rejection',
      '3M Ceramic Architectural: up to 80% IR rejection',
      '3M Night Vision & All Season (Low-E) films',
      '3M spectrally selective & reflective lines',
    ],
    heroSubcopy:
      'Enhance your business environment with 3M commercial and office window films — heat rejection up to 97% IR, 99% UV blocking, energy savings, and preserved views.',
    intro:
      "At Mario's Tint Shop, we understand the importance of creating a comfortable, functional, and aesthetically pleasing environment for your business and employees. We install 3M architectural films that reject heat, block 99% of UV rays, and lower energy costs — with paybacks in as little as three years.",
    features: [
      { title: '3M Prestige Series', body: "The ultimate in heat rejection — blocks up to 97% of the sun's infrared light and up to 60% of total heat while remaining virtually clear." },
      { title: 'Significant Energy Savings', body: 'By rejecting solar heat, the films reduce HVAC strain and lower air conditioning costs, with potential paybacks in as little as three years.' },
      { title: '99% UV Protection', body: 'All 3M films block up to 99% of harmful UV rays, preventing fading of interior furnishings, flooring, and merchandise.' },
      { title: 'Preserved Views & Comfort', body: 'Non-metallized options offer high optical clarity without a mirrored look or interference with cell phone and GPS signals.' },
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
    image: 'office2',
    pageImage: 'office',
  },
];

/** Look up a service by its slug (used by the per-service pages). */
export const getService = (slug: string) =>
  SERVICES.find((s) => s.slug === slug);

// ── Testimonials ────────────────────────────────────────────────────
// Real 5-star Google reviews from the shop's Google Business profile
// (5.0 rating, on our way to 400+ reviews). Photos are the customers' own review photos,
// pulled from Google Maps and self-hosted under src/assets/images/reviews.
// Globbed rather than imported one-by-one; `review()` throws at build time if
// a file is renamed or missing, so a broken photo can't reach production.
const reviewPhotos = import.meta.glob<{ default: ImageMetadata }>(
  './assets/images/reviews/*.{webp,jpg}',
  { eager: true }
);
function review(file: string): ImageMetadata {
  const mod = reviewPhotos[`./assets/images/reviews/${file}`];
  if (!mod) throw new Error(`Missing review photo: src/assets/images/reviews/${file}`);
  return mod.default;
}

export const TESTIMONIALS = [
  {
    quote:
      "Mario and his team are the best. They got my new Honda Passport Trailsport looking super clean. Thank you guys for always giving us the best tint money can buy and top-notch professionalism. I'm a customer for life.",
    author: 'Christopher Moers',
    photo: {
      src: review('review-1.webp'),
      alt: "Christopher's black Honda Passport with fresh window tint",
    },
  },
  {
    quote:
      'Place is awesome. Super cheap prices and got all 4 windows on my F250 done in 30 minutes. They take care of you and anything else wrong with the tint in the future — lifetime warranty available.',
    author: 'Ethan Stoquert',
    photo: {
      src: review('review-2.webp'),
      alt: "Ethan's truck after window tinting",
    },
  },
  {
    quote:
      "Mario has done 4 vehicles for me, from peeling off old tint on my truck to a complete ceramic tint on my 2 brand-new SUVs fresh off the lot. Shops like this always make things smooth.",
    author: 'Nathan Fair',
    photo: {
      src: review('review-3.webp'),
      alt: "Nathan's SUV with ceramic window tint",
    },
  },
  {
    quote:
      "Highly recommended. The work performed at Mario's Tint Shop is outstanding. The staff is very knowledgeable and friendly, they use high-quality materials, and they keep your car clean during the install.",
    author: 'Chase Ramos',
    photo: {
      src: review('review-4.webp'),
      alt: "Chase's silver Honda Civic with tinted windows",
    },
  },
  {
    quote:
      'Has tinted two of my vehicles — a 4Runner and a Tacoma. Customer service is amazing, super nice guys who explain all the options and do an amazing job. The 4Runner tint is over 2 years old and still looks incredible.',
    author: 'Tyler Johnston',
    photo: {
      src: review('review-5.webp'),
      alt: "Tyler's Toyota after professional tint installation",
    },
  },
  {
    quote:
      "Mario's tint is the best in Tennessee — great service, great people, and great business. Very professional and knowledgeable. They've done my headlights and tail lights, which isn't easy, but they got me right.",
    author: 'Damone Pledger Jr',
    photo: {
      src: review('review-6.webp'),
      alt: "Damone's white sedan tinted in Mario's Tint Shop",
    },
  },
  {
    quote:
      "This place is incredible. Don't go anywhere else. Save your money and get the best professional tint you've ever had in your life! I've been here twice already and they do incredible work.",
    author: 'Jody Locke',
    photo: { src: review('review-jody.jpg'), alt: "Jody Locke's vehicle after tint installation" },
  },
  {
    quote:
      "Amazing work, attention to detail, very professional and friendly! I highly recommend Mario's tint shop!",
    author: 'Whitney Stanbrough',
    photo: { src: review('review-whitney.jpg'), alt: "Whitney Stanbrough's vehicle after tint installation" },
  },
  {
    quote:
      'I have experienced excellent service twice so far. They always complete my request with high quality. I recommend this shop because the work time is fast and the price is fair.',
    author: 'H N',
    photo: { src: review('review-hn.jpg'), alt: "H N's vehicle after tint installation" },
  },
  {
    quote:
      'Mario is very professional and does an amazing job. He has actually tinted three of my cars. I would definitely recommend him, so go and check him out!',
    author: 'Reshonda Goins',
    photo: { src: review('review-reshonda.jpg'), alt: "Reshonda Goins's vehicle after tint installation" },
  },
  {
    quote:
      'These guys are professionals and treated my brand-new IS with care and respect. Their work is outstanding and exceeded my expectations, money well spent!',
    author: 'Erik Allerup',
    photo: { src: review('review-erik.jpg'), alt: "Erik Allerup's Lexus IS after tint installation" },
  },
  {
    quote:
      'Mario greeted me when I walked into his shop. Very nice guy and hard worker. I was in and out within an hour of arrival with great-looking tint at a great price. I would highly recommend his shop for tint.',
    author: 'Daniel Bess',
    photo: { src: review('review-daniel.jpg'), alt: "Daniel Bess's vehicle after tint installation" },
  },
  {
    quote:
      'Very professional tint job. Very informative and knowledgeable staff. Recommend to anyone needing automobile tint done.',
    author: 'Justin',
    photo: { src: review('review-justin.jpg'), alt: "Justin's vehicle after tint installation" },
  },
  {
    quote:
      'Mario is extremely professional and a pleasure to work with. He tinted my new 2500 and it looks awesome.',
    author: 'James Perrigo',
    photo: { src: review('review-james.jpg'), alt: "James Perrigo's RAM 2500 after tint installation" },
  },
  {
    quote: 'They did an excellent job on my F-150. I highly recommend.',
    author: 'Scott Hammers',
    photo: { src: review('review-scott.jpg'), alt: "Scott Hammers's F-150 after tint installation" },
  },
];

// Aggregate rating shown on the Google review badge — keep in sync with
// Layout.astro's schema.org aggregateRating and the STATS review count.
export const GOOGLE_RATING = {
  value: 5.0,
  count: 390,
  url: CONTACT.googleBusinessUrl,
};

// ── Instagram gallery (real posts from @mariostintshop) ─────────────
// Order matters: Gallery.astro maps these by index onto its bento layout.
import ig1 from './assets/images/instagram/ig-1.webp';
import igColumna1 from './assets/images/instagram/columna-1.jpg';
import igColumna2 from './assets/images/instagram/columna2.jpeg';
import ig4 from './assets/images/instagram/ig-4.webp';
import igColumna31 from './assets/images/instagram/columna3-1.jpeg';
import ig6 from './assets/images/instagram/ig-6.webp';
import igColumna32 from './assets/images/instagram/columna3-2.jpg';

export const GALLERY = [
  { src: ig1, alt: "Window tint work by Mario's Tint Shop" },
  { src: igColumna1, alt: "Red sedan with freshly tinted windows at Mario's Tint Shop" },
  { src: igColumna2, alt: "White Cadillac Escalade with tinted windows at Mario's Tint Shop" },
  { src: ig4, alt: "Detail work by Mario's Tint Shop" },
  { src: igColumna31, alt: "Paint protection film being applied to a red Corvette at Mario's Tint Shop" },
  { src: ig6, alt: "Finished vehicle by Mario's Tint Shop" },
  { src: igColumna32, alt: "Tesla Model Y in the bay at Mario's Tint Shop" },
];

// ── Navigation ──────────────────────────────────────────────────────
export const NAV_LINKS = [
  { href: '/#about', label: 'About' },
  { href: '/#services', label: 'Services' },
  { href: '/visualizer', label: 'Visualizer' },
  { href: '/#gallery', label: 'Gallery' },
  { href: '/#testimonials', label: 'Reviews' },
];

// ── Social profiles ─────────────────────────────────────────────────
export const SOCIALS = [
  { name: 'Instagram', href: INSTAGRAM.url },
  { name: 'TikTok', href: 'https://www.tiktok.com/@mariostintshop' },
  { name: 'Facebook', href: 'https://www.facebook.com/mariostintshop' },
  { name: 'Google', href: CONTACT.googleBusinessUrl },
];

// ── "Done with confidence" benefit cards (4-up on the home page) ────
export const BENEFITS = [
  {
    title: 'Expertise & Experience',
    body: 'Over 25 years in the automotive and window film industry — expert craftsmanship with no peeling, no bubbling, no shortcuts.',
  },
  {
    title: 'Authorized 3M Platinum Dealer',
    body: 'Certified 3M installers using industry-leading films and coatings, backed by comprehensive manufacturer warranties.',
  },
  {
    title: 'One-Stop Shop',
    body: 'Window tinting, paint protection film, ceramic coating, and office & commercial films — everything your vehicle or building needs.',
  },
  {
    title: 'Trusted by Middle Tennessee',
    body: 'A+ BBB rating and a 5.0-star Google rating from 390+ reviews, serving Murfreesboro, Nashville, Smyrna, La Vergne & beyond.',
  },
];

