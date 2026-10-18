import { CONTACT } from '../consts';

// Film-by-film facts for /window-tint/3m-films/.
//
// The shop already names these three films (Silver / Gold / Platinum). The
// sentences below are 3M's published product language, kept next to — not
// instead of — the figures already on the tint pages. See the PR note on the
// 90% vs 95% infrared figures.
//
// Sources, retrieved 2026-10-18:
// - 3M Ceramic IR Series product page
// - 3M Obsidian Series product page
// - 3M Color Stable Series (CS IR) brochure
// - 3M Automotive Window Film vehicle-owner warranty card

export interface WindowFilm {
  id: string;
  tier: 'Silver' | 'Gold' | 'Platinum';
  /** Shop name already used on the tint page. */
  shopName: string;
  /** 3M's product name. */
  productName: string;
  /** Answer-first summary. Does not repeat the tint page's 90% / 99% lines. */
  summary: string;
  points: string[];
}

export const WINDOW_FILMS_PATH = '/window-tint/3m-films/';

export const WINDOW_FILMS: WindowFilm[] = [
  {
    id: 'obsidian',
    tier: 'Silver',
    shopName: '3M Obsidian carbon',
    productName: '3M™ Automotive Window Film Obsidian Series',
    summary:
      'Obsidian is the Silver film. 3M rates it at up to 60% total solar energy rejection and up to 99% UV rejection.',
    points: [
      'Incorporates patented infused technology for better durability, color retention, and fade resistance than many other dyed films. That technology helps prevent purpling.',
      'Combines strong heat rejection, low reflectivity, and ultraviolet protection.',
      'Rejects up to 60% of total solar energy.',
      'Rejects up to 99% of UV light.',
      'Available in multiple tint levels that can block up to 95% of visible light.',
      'Non-metalized, so it won’t interfere with electronic devices, including 5G.',
    ],
  },
  {
    id: 'cs-ir',
    tier: 'Gold',
    shopName: '3M CS IR nano ceramic',
    productName: '3M™ Automotive Window Film Color Stable Series (CS IR)',
    summary:
      'Color Stable CS IR is the Gold film. 3M rates it at up to 64% total solar energy rejection and up to 99% UV rejection, and it will not fade to purple.',
    points: [
      'Nano-ceramic technology in a non-metallized film. It won’t interfere with mobile devices, GPS, or satellite radio.',
      'Rejects up to 64% of total solar energy and lessens the need for the air conditioner.',
      'Rejects up to 99% of UV light.',
      'A deep shade that won’t fade to purple.',
      'Sold with a limited lifetime warranty for as long as you own the vehicle.',
    ],
  },
  {
    id: 'ceramic-ir',
    tier: 'Platinum',
    shopName: '3M Ceramic IR',
    productName: '3M™ Automotive Window Film Ceramic IR Series',
    summary:
      'Ceramic IR is the Platinum film. 3M rates this film at up to 95% infrared rejection and up to 66% total solar energy rejection, and up to 99.9% UV rejection.',
    points: [
      'Rejects up to 66% of total solar energy and provides up to 95% infrared rejection, reducing the feel of the sun’s heat on your skin.',
      'Infrared rejection comes from absorptive nano-ceramic technology.',
      'Rejects up to 99.9% of ultraviolet (UV) light.',
      'Metal-free, so it won’t interfere with electronics, GPS, satellite radio, or mobile devices, including 5G.',
      'Available in multiple tint levels that block up to 95% of visible light, in a neutral color.',
      'Earns the Skin Cancer Foundation’s Seal of Recommendation.',
    ],
  },
];

export const WINDOW_FILM_FAQS: { q: string; a: string }[] = [
  {
    q: 'Which 3M film is right for me?',
    a: `It depends on the vehicle and the shade. Mario’s Tint Shop installs three 3M films in Murfreesboro: Silver is Obsidian (up to 60% total solar energy rejection), Gold is Color Stable CS IR (up to 64% total solar energy rejection, and it won’t fade to purple), and Platinum is Ceramic IR (up to 95% infrared rejection and up to 66% total solar energy rejection). Every vehicle is quoted individually and for free. Call ${CONTACT.phoneDisplay}.`,
  },
  {
    q: 'What is the difference between Obsidian, CS IR, and Ceramic IR?',
    a: 'They are three different 3M films. Obsidian is a dyed film with 3M’s infused technology, rated up to 60% total solar energy rejection and up to 99% UV. Color Stable CS IR is a nano-ceramic film rated up to 64% total solar energy rejection and up to 99% UV, and it won’t fade to purple. Ceramic IR is the nano-ceramic film 3M rates at up to 95% infrared rejection, up to 66% total solar energy rejection, and up to 99.9% UV.',
  },
  {
    q: 'Will 3M Obsidian, CS IR, or Ceramic IR interfere with GPS or my phone?',
    a: 'No. All three are non-metalized. 3M states they won’t interfere with GPS, mobile devices, or satellite radio. Ceramic IR and Obsidian also call out 5G.',
  },
  {
    q: 'What warranty do these 3M films carry?',
    a: 'A limited lifetime warranty for as long as you own the vehicle, and only for the original owner. Ceramic IR and Color Stable are warranted to keep their solar properties without cracking or crazing, to keep adhesion without blistering, bubbling, or delaminating, and to keep their color without fading to purple. Obsidian is warranted to keep its solar properties without cracking or crazing, to keep adhesion without blistering, bubbling, or delaminating, and to keep its color. If the film is defective under that warranty, 3M and the dealer replace the defective film and reapply it at no charge. The warranty is void if the film is abused or cared for improperly.',
  },
];

/** 3M performance footnote and limited-warranty language, kept together at the end of the film page. */
export const WINDOW_FILM_DISCLAIMER = [
  'Performance. Figures above are 3M’s published estimates. Data shown for this kind of film is the estimated performance of film applied to 1/4 inch (6 mm) thick, 73% VLT automotive green glass, and is for reference only. TSER is total solar energy rejected: the percentage of total solar energy rejected by filmed glass. The higher this value, the less solar heat is transmitted. Infrared rejection (IRR) is the percent of solar infrared energy in the 900–1,000 nm wavelength range rejected by the film, measured on film with the liner alone (no glass). IRER is the percent of solar infrared energy rejected from 780–2,500 nm, including energy that is absorbed and then reradiated into the car. Ultraviolet rejection is the percentage of UV light rejected by the filmed glass. VLT is the percentage of visible light that passes through filmed glass. The higher the number, the lighter the film.',
  'The law on auto tint varies by state. Tennessee law requires a minimum of 35% VLT on the front side, rear side, and rear windows. 3M is not responsible for determining whether a particular shade is legal on a vehicle.',
  'Limited warranty and limited remedy. Valid in the United States and Canada. 3M and the Authorized Automotive Window Film Dealer warrant the coverage described above for as long as you own your vehicle. This warranty is provided only to the original consumer and is not transferable. If the product is found defective under the warranty, the seller will replace the quantity of film proved to be defective and will provide reapplication labor free of charge during the warranty period. The warranty is void if the product has been subjected to abuse or improper care. Except for the obligation to replace defective film and reapply it, the seller shall not be liable in either tort or contract for any loss or damage, direct, indirect, special, consequential, or incidental, arising out of the use or inability to use this product. Some states do not allow the exclusion or limitation of incidental or consequential damages, so the limitation above may not apply to you. This warranty gives you specific legal rights, and you may also have other rights which vary from state to state.',
];
