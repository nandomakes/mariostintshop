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
  description:
    "Murfreesboro's elite tint shop and leading 3M dealer. Professional automotive window tinting, paint protection film (PPF), and ceramic coating serving Murfreesboro, Nashville & Middle Tennessee. 25+ years of experience, BBB A+ rated, 5.0-star Google rating.",
  url: 'https://mariostintshop.com',
  themeColor: '#111111',
};

// ── Contact / Phone ─────────────────────────────────────────────────
export const PHONE_DISPLAY = '(615) 410-7170';
export const PHONE_TEL = '+16154107170';
export const WHATSAPP_NUMBER = '16154107170'; // digits only, no +

export const CONTACT = {
  address: '515 NW Broad St',
  city: 'Murfreesboro, TN 37130',
  phoneDisplay: PHONE_DISPLAY,
  phoneTel: PHONE_TEL,
  email: 'mario@mariostintshop.com',
  schedule: 'Mon–Fri, 8:00 a.m. to 5:00 p.m. · Sat by appointment',
  scheduleShort: 'Mon–Fri 8–5',
  geo: { lat: 35.8470688, lng: -86.3974265 },
  googleBusinessUrl:
    "https://www.google.com/maps/place/Mario's+Tint+Shop/@35.8470688,-86.4000014,17z/data=!4m8!3m7!1s0x886407f99c411c3b:0x274579f0ecaef14!8m2!3d35.8470688!4d-86.3974265!9m1!1b1!16s%2Fg%2F11c1rsgy6y",
  bbbUrl: '#',
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
  { num: 25, suffix: '+', label: 'Years Experience' },
  { text: 'A+', label: 'BBB Rating' },
  { text: '3M', label: 'Platinum Dealer' },
  { num: 128, suffix: '+', label: '5-Star Reviews' },
];

// ── "Why choose us" ─────────────────────────────────────────────────
export const WHY_US = {
  lead: 'Our mission is to provide top-notch automotive paint protection and window tinting services.',
  intro:
    'We use only the highest quality materials and tools to ensure perfect results — and our A+ rating from the Better Business Bureau is a testament to our commitment to excellence.',
  bullets: [
    'Authorized 3M Platinum Dealer — certified 3M, XPEL & SunTek installers.',
    'Over 25 years of experience in the automotive and window film industry.',
    'Lifetime warranty available on our window films.',
    '5.0-star Google rating from 128+ customer reviews.',
    'A+ rated by the Better Business Bureau.',
  ],
  cards: [
    {
      title: 'Authorized 3M Platinum Dealer',
      body: 'As a leading 3M dealer in the Nashville area, we install the full range of 3M automotive and architectural films — from Obsidian carbon tint to Ceramic IR and Prestige series — all backed by comprehensive 3M manufacturer warranties.',
    },
    {
      title: 'Premium Materials Only',
      body: 'We use industry-leading brands like 3M, XPEL, SunTek, and STEK on every job. First we assess your vehicle and recommend exactly what it needs — no bargain film, no surprises, no hidden charges.',
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
    "We're a one-stop shop for window tinting, paint protection film, ceramic coating, and office & commercial films. Our attention to detail and commitment to premium brands like 3M, XPEL, and SunTek ensure every installation meets the highest standards — backed by an A+ BBB rating and a 5.0-star Google rating.",
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
  image: keyof typeof IMAGES;
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
      'Professional car window tinting with premium 3M films — increased comfort, up to 99% UV protection, improved privacy, and a stylish custom look for any vehicle.',
    intro:
      "At Mario's Tint Shop in Murfreesboro, TN, we are committed to offering the best car window tinting service that enhances the appearance of your vehicle and provides numerous benefits for your daily driving. As an Authorized 3M Platinum Dealer, we offer premium 3M window films tailored for every budget and performance need.",
    features: [
      { title: 'Increased Comfort', body: "Window tinting significantly reduces solar heat and harsh glare entering your car's cabin, keeping your vehicle cooler and easing the load on your A/C." },
      { title: 'Up to 99% UV Protection', body: 'Our premium ceramic and carbon films block up to 99% of damaging UVA and UVB rays, protecting you and preventing interior fading and cracking.' },
      { title: 'Safety & Privacy', body: 'The film helps hold shattered glass together on impact, and reduced visibility into your car deters break-ins by keeping valuables out of sight.' },
      { title: '3M Tiered Packages', body: 'Choose Silver (3M Obsidian carbon), Gold (3M CS IR nano ceramic), or Platinum (3M Ceramic IR with up to 90% infrared heat rejection).' },
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
      'Professional clear bra installation by certified 3M, XPEL & SunTek installers — self-healing defense against scratches, UV damage, and rock chips.',
    meta: '3M PPF & STEK DYNO Platinum · 10-year warranty',
    startingPrice: 'Free quote',
    includes: [
      'Partial Front End: 12"–18" hood, fenders, bumper & mirrors',
      'Full Front End: full hood, fenders, bumper & mirrors',
      'Complete Coverage: every exposed painted surface',
      '10-year manufacturer warranty (3M / STEK)',
    ],
    heroSubcopy:
      "Premium self-healing paint protection film (clear bra) from 3M and STEK — safeguarding your car's factory paint against scratches, chips, and road hazards.",
    intro:
      "At Mario's Tint Shop we specialize in premium paint protection film (PPF) — an invisible clear bra that protects your factory paint from scratches, chips, and road debris. We are certified dealers and installers for 3M, XPEL, and SunTek, with cutting-edge self-healing films where minor scratches vanish when exposed to heat.",
    features: [
      { title: '3M Paint Protection', body: 'Self-healing PPF combined with ceramic coating technology — exceptional clarity, gloss, and hydrophobic performance, backed by a 10-year warranty.' },
      { title: 'STEK DYNO Platinum', body: 'High-gloss, self-healing top coat resistant to UV, chemicals, and stains, with excellent optical clarity for a nearly invisible finish. 10-year warranty.' },
      { title: 'Self-Healing Technology', body: "Minor scratches and swirl marks on the film's surface vanish when exposed to heat — warm water or sunlight — keeping your vehicle looking new." },
      { title: 'Enhanced Resale Value', body: 'A vehicle protected with PPF retains its appearance and value over time, and the film is virtually invisible once applied.' },
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
    image: 'garage',
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
    image: 'tesla',
  },
  {
    id: 'commercial-films',
    slug: 'commercial-films',
    kicker: 'Commercial Films',
    name: 'Office & Commercial Films',
    short:
      '3M and Avery Dennison window tinting solutions for office and commercial buildings — professional installation for optimal protection and energy efficiency.',
    meta: '3M Prestige · Ceramic · Night Vision · Low-E',
    startingPrice: 'Custom quote',
    includes: [
      '3M Prestige: up to 97% IR / 60% total heat rejection',
      '3M Ceramic Architectural: up to 80% IR rejection',
      '3M Night Vision & All Season (Low-E) films',
      'Avery Dennison spectrally selective & reflective lines',
    ],
    heroSubcopy:
      'Enhance your business environment with 3M commercial and office window films — heat rejection up to 97% IR, 99% UV blocking, energy savings, and preserved views.',
    intro:
      "At Mario's Tint Shop, we understand the importance of creating a comfortable, functional, and aesthetically pleasing environment for your business and employees. We install 3M and Avery Dennison architectural films that reject heat, block 99% of UV rays, and lower energy costs — with paybacks in as little as three years.",
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
    image: 'fleet',
  },
];

/** Look up a service by its slug (used by the per-service pages). */
export const getService = (slug: string) =>
  SERVICES.find((s) => s.slug === slug);

// ── Testimonials ────────────────────────────────────────────────────
// Real 5-star Google reviews from the shop's Google Business profile
// (5.0 rating · 128+ reviews). ⚠️ Photos are placeholders — swap for
// real photos of each customer's finished vehicle when available.
export const TESTIMONIALS = [
  {
    quote:
      "Mario and his team are the best. They got my new Honda Passport Trailsport looking super clean. Thank you guys for always giving us the best tint money can buy and top notch professionalism. I'm a customer for life.",
    author: 'Christopher Moers',
    photo: {
      src: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&h=500&q=80',
      alt: "Customer's SUV with fresh window tint",
    },
  },
  {
    quote:
      "Just had both of my Teslas tinted and protected with PPF by Mario's Tint, and I couldn't be happier! Mario's workmanship is absolutely impeccable — every detail was handled with care.",
    author: 'Cameron Stacey',
    photo: {
      src: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&h=500&q=80',
      alt: "Customer's Tesla with tint and paint protection film",
    },
  },
  {
    quote:
      'Place is awesome. Super cheap prices and got my 4 windows on my F250 done in 30 minutes. They take care of you and anything else wrong with the tint in the future. Lifetime warranty available.',
    author: 'Ethan Stoquert',
    photo: {
      src: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&h=500&q=80',
      alt: "Customer's truck after window tinting",
    },
  },
  {
    quote:
      "Mario has done 4 vehicles for me, from peeling off old tint and applying new on my old truck, to a complete ceramic tint on my 2 brand new SUV's fresh off the lot. As a local it's shops like this that always make things smooth.",
    author: 'Nathan Fair',
    photo: {
      src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&h=500&q=80',
      alt: "Customer's SUV with ceramic tint",
    },
  },
  {
    quote:
      "Everyone I dealt with was friendly and professional, and the whole process was smooth and straightforward. The products they used were high quality and backed by a warranty, which gave me a lot of confidence in the work.",
    author: 'Brandon Gurule',
    photo: {
      src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&h=500&q=80',
      alt: "Customer's vehicle after professional tint installation",
    },
  },
  {
    quote:
      "Took my third vehicle here yesterday to get tinted and once again they knock it out of the park. Incredibly knowledgeable staff and impeccable work at a fair price. I'll never go anywhere else for a tint.",
    author: 'Jamie Pearman',
    photo: {
      src: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=800&h=500&q=80',
      alt: "Customer's car during film installation",
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

// ── Social profiles ─────────────────────────────────────────────────
export const SOCIALS = [
  { name: 'Instagram', href: INSTAGRAM.url },
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
    body: 'Certified 3M, XPEL & SunTek installers using industry-leading films and coatings, backed by comprehensive manufacturer warranties.',
  },
  {
    title: 'One-Stop Shop',
    body: 'Window tinting, paint protection film, ceramic coating, and office & commercial films — everything your vehicle or building needs.',
  },
  {
    title: 'Trusted by Middle Tennessee',
    body: 'A+ BBB rating and a 5.0-star Google rating from 128+ reviews, serving Murfreesboro, Nashville, Smyrna, La Vergne & beyond.',
  },
];

