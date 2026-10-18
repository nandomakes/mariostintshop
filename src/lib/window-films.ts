import { CONTACT } from '../consts';

// Mario's film copy for /window-tint/3m-films/. Wording below is his text.
// Phone display uses the site constant, which is the same number.

export interface WindowFilm {
  id: string;
  /** Product name used in schema. Taken from his headings. */
  productName: string;
  /** His section heading, including the subtitle. */
  heading: string;
  paragraphs: string[];
  points: string[];
  /** His "Choose X if" line, kept whole. */
  chooseIf: string;
}

export const WINDOW_FILMS_PATH = '/window-tint/3m-films/';

export const WINDOW_FILM_TITLE = '3M Window Tint at Mario’s Tint Shop';

export const WINDOW_FILM_TAGLINE = 'Choose your look. Enjoy greater comfort.';

export const WINDOW_FILM_INTRO = [
  'The right window tint can make your vehicle look better, feel cooler, and be more comfortable every time you drive. At Mario’s Tint Shop, we offer three trusted 3M film options—Color Stable IR, Ceramic IR, and Crystalline—so you can choose the combination of appearance, heat rejection, privacy, and value that fits you best.',
  'Not sure which film is right for your vehicle? We’ll walk you through the differences and help you make a confident choice.',
];

export const WINDOW_FILMS: WindowFilm[] = [
  {
    id: 'color-stable-ir',
    productName: '3M™ Color Stable IR',
    heading: '3M™ Color Stable IR — Great Style and Everyday Value',
    paragraphs: [
      'Color Stable IR is an excellent choice for drivers who want a rich charcoal appearance, improved comfort, and dependable 3M quality at an accessible price.',
      'Its ceramic technology helps reduce solar heat, while its fade-resistant color helps your tint maintain its attractive appearance over time. With several shade options available, you can choose the level of privacy and sunlight reduction you prefer.',
    ],
    points: [
      'Rejects up to 64% of total solar energy, depending on shade and glass.',
      'Ceramic technology helps reduce heat entering through your windows.',
      'Fade-resistant color helps your vehicle continue looking sharp.',
      'Multiple shades let you customize appearance, privacy, and sunlight reduction.',
      'Non-metalized construction helps prevent interference with GPS, mobile devices, and satellite radio.',
      'Backed by a 3M limited lifetime warranty, subject to warranty terms.',
    ],
    chooseIf:
      'Choose Color Stable IR if: You want a stylish charcoal look, everyday heat control, and excellent value.',
  },
  {
    id: 'ceramic-ir',
    productName: '3M™ Ceramic IR',
    heading: '3M™ Ceramic IR — More Comfort in the Heat',
    paragraphs: [
      'If keeping your vehicle cooler is a top priority, Ceramic IR gives you a noticeable upgrade in heat comfort. Its advanced nano-ceramic technology helps reduce infrared heat and the uncomfortable feeling of direct sunlight on your skin.',
      'Ceramic IR combines strong performance with a clean, neutral appearance, making it a popular choice for drivers who spend a lot of time on the road or want enhanced comfort without a metallic look.',
    ],
    points: [
      'Rejects up to 95% of infrared radiation within 3M’s specified measurement range.',
      'Rejects up to 66% of total solar energy, depending on shade and glass.',
      'Blocks up to 99.9% of ultraviolet light.',
      'Helps reduce glare while adding privacy, depending on shade.',
      'Metal-free construction helps maintain connectivity with GPS, satellite radio, and mobile devices.',
      'Backed by a 3M limited lifetime warranty, subject to warranty terms.',
    ],
    chooseIf:
      'Choose Ceramic IR if: You want stronger heat comfort and advanced ceramic performance with a traditional tinted appearance.',
  },
  {
    id: 'crystalline',
    productName: '3M™ Crystalline™',
    heading: '3M™ Crystalline™ — Premium Heat Rejection Without a Dark Look',
    paragraphs: [
      'Crystalline is the ideal choice for customers who want premium heat rejection without necessarily choosing a dark tint. Its advanced multilayer optical technology uses more than 200 layers to help manage sunlight and heat.',
      'That means you can enjoy a more comfortable interior while keeping your windows relatively light and open-looking. Crystalline is also available in darker shades if you want additional privacy and a deeper appearance.',
    ],
    points: [
      'Advanced multilayer technology provides substantial heat rejection.',
      'Lighter shades help reduce heat without making your windows look heavily tinted.',
      'Blocks up to 99.9% of ultraviolet light, depending on product and glass.',
      'Helps reduce glare, depending on shade.',
      'Non-metalized construction helps prevent interference with connected devices.',
      'Backed by a 3M limited lifetime warranty, subject to warranty terms.',
    ],
    chooseIf:
      'Choose Crystalline if: You want premium technology, strong heat rejection, and the flexibility to keep your windows looking lighter.',
  },
];

export const WINDOW_FILM_WHICH = {
  heading: 'Which 3M Film Is Right for You?',
  points: [
    'Color Stable IR: The best balance of style, comfort, and value.',
    'Ceramic IR: A stronger choice for drivers who want enhanced heat comfort.',
    'Crystalline: The premium option for powerful heat rejection with lighter-looking shades.',
  ],
};

export const WINDOW_FILM_CTA = {
  heading: 'See the Difference Before You Decide',
  body: 'Visit Mario’s Tint Shop to compare film samples and shades in person. We’ll explain the differences clearly, answer your questions, and help you choose the film that best fits your vehicle, lifestyle, and budget.',
  phoneLine: `Call ${CONTACT.phoneDisplay} for a personalized quote.`,
  addressLine: `${CONTACT.address}, ${CONTACT.city}`,
};

export const WINDOW_FILM_DISCLAIMER =
  'Performance varies by film series, shade, and existing glass. “Up to” figures represent maximum published performance and do not apply to every shade. Infrared rejection is a separate measurement from total solar energy rejection. Warranty terms, exclusions, and installation requirements apply. Shade selection is subject to applicable tint laws.';

/** FAQ uses only the comparison he wrote. */
export const WINDOW_FILM_FAQS: { q: string; a: string }[] = [
  {
    q: WINDOW_FILM_WHICH.heading,
    a: WINDOW_FILM_WHICH.points.join(' '),
  },
];

/** His paragraphs and bullets, for Product schema. No added figures. */
export const filmSchemaDescription = (film: WindowFilm) =>
  [...film.paragraphs, ...film.points, film.chooseIf].join(' ');
