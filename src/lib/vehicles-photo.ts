// Photo-calibrated overlay geometry for the tint/PPF visualizer.
//
// Each vehicle is a real 90°-profile render (public/images/vehicles/*.png,
// 2064×816, drawn into an 860×340 viewBox at the same 2.529 aspect ratio, so
// photo-px × 860/2064 = SVG-px). The glass zones below were auto-traced from
// each render's bluish-glass pixels, so tint overlays land exactly on the real
// windows. PPF body zones are generated parametrically from per-vehicle anchors
// (measured from the same renders), which is enough for the illustrative blue
// coverage overlay. Lives outside .astro frontmatter — the Astro compiler
// mis-parses raw SVG markup in frontmatter template literals.

export interface PhotoVehicle {
  id: string;
  label: string;
  photo: string;
  overlay: string;
}

interface Anchors {
  frontX: number; rearX: number;
  roofY: number; ground: number;
  beltY: number;           // bottom of the side glass (door top)
  hoodY: number;           // hood surface height near the cowl
  cowlX: number;           // windshield base x (front pillar foot)
  deckX: number;           // rear deck / tailgate shoulder x
  aTopX: number; cTopX: number; // greenhouse span (front/rear pillar tops)
  wheelFx: number; wheelBx: number; wheelR: number;
}

interface Glass {
  frontSide: string;
  rearSide: string;
  rear: string;            // rear quarter / rear-most glass ('' → derived)
}

interface Cfg {
  id: string; label: string; a: Anchors; g: Glass;
}

const N = (v: number) => v.toFixed(1);
const poly = (pts: [number, number][]) =>
  'M ' + pts.map(([x, y]) => `${N(x)} ${N(y)}`).join(' L ') + ' Z';

// Trapezoid across the top slice of a box (used for the visor strip).
function topStrip(box: [number, number, number, number], frac = 0.34): string {
  const [x0, y0, x1, y1] = box;
  const yb = y0 + (y1 - y0) * frac;
  return poly([[x0 + 6, y0], [x1 - 6, y0], [x1 - 10, yb], [x0 + 10, yb]]);
}

// Crescent band hugging a wheel arch.
function arch(wx: number, ground: number, R: number): string {
  const R1 = R + 11, R2 = R - 3, h1 = R + 9, h2 = R - 5;
  return (
    `M ${N(wx - h1)} ${N(ground)} A ${N(R1)} ${N(R1)} 0 0 1 ${N(wx + h1)} ${N(ground)}` +
    ` L ${N(wx + h2)} ${N(ground)} A ${N(R2)} ${N(R2)} 0 0 0 ${N(wx - h2)} ${N(ground)} Z`
  );
}

function buildPPF(a: Anchors): Record<string, string> {
  const shoulderY = a.beltY + 22;      // body waistline just below the glass
  const rockerY = a.ground - 26;       // rocker sill line
  const noseTop = a.hoodY - 2;
  const hoodBand = 20;

  const bumperFront = poly([
    [a.frontX, a.hoodY + 6], [a.frontX + 56, noseTop],
    [a.frontX + 56, rockerY], [a.frontX + 20, rockerY], [a.frontX, a.ground - 48],
  ]);
  const hoodFull = poly([
    [a.frontX + 56, noseTop], [a.cowlX, a.beltY + 2],
    [a.cowlX, a.beltY + 2 + hoodBand], [a.frontX + 56, noseTop + hoodBand + 4],
  ]);
  const midHoodX = a.frontX + 56 + (a.cowlX - a.frontX - 56) * 0.5;
  const midHoodY = noseTop + (a.beltY + 2 - noseTop) * 0.5;
  const hoodPartial = poly([
    [a.frontX + 56, noseTop], [midHoodX, midHoodY],
    [midHoodX, midHoodY + hoodBand], [a.frontX + 56, noseTop + hoodBand + 4],
  ]);
  const mirror = poly([
    [a.cowlX + 16, a.beltY - 8], [a.cowlX + 44, a.beltY - 12],
    [a.cowlX + 46, a.beltY + 2], [a.cowlX + 18, a.beltY + 6],
  ]);
  const doorEndX = a.deckX - 8;
  const doors = poly([
    [a.cowlX + 18, shoulderY], [doorEndX, shoulderY],
    [doorEndX, rockerY], [a.cowlX + 18, rockerY],
  ]);
  const midBodyX = (a.cowlX + doorEndX) / 2;
  const handleY = shoulderY + 12;
  const handles =
    `M ${N(a.cowlX + 40)} ${N(handleY)} h 34 v 8 h -34 Z` +
    ` M ${N(midBodyX + 20)} ${N(handleY)} h 34 v 8 h -34 Z`;
  const doorEdges =
    `M ${N(midBodyX - 2)} ${N(shoulderY)} h 4 v ${N(rockerY - shoulderY)} h -4 Z` +
    ` M ${N(doorEndX - 3)} ${N(shoulderY)} h 4 v ${N(rockerY - shoulderY)} h -4 Z`;
  const rocker = poly([
    [a.wheelFx + a.wheelR + 6, rockerY], [a.wheelBx - a.wheelR - 6, rockerY],
    [a.wheelBx - a.wheelR - 6, a.ground - 10], [a.wheelFx + a.wheelR + 6, a.ground - 10],
  ]);
  const roof = poly([
    [a.aTopX + 14, a.roofY], [a.cTopX - 14, a.roofY],
    [a.cTopX - 18, a.roofY + 10], [a.aTopX + 18, a.roofY + 10],
  ]);
  const trunk = poly([
    [a.deckX, a.beltY + 6], [a.rearX - 8, a.beltY + 18],
    [a.rearX - 10, a.beltY + 40], [a.deckX, a.beltY + 30],
  ]);
  const bumperRear = poly([
    [a.rearX - 52, a.beltY + 28], [a.rearX, a.beltY + 22],
    [a.rearX, a.ground - 40], [a.rearX - 24, rockerY], [a.rearX - 52, rockerY],
  ]);

  return {
    'bumper-front': bumperFront,
    'hood-full': hoodFull,
    'hood-partial': hoodPartial,
    'fenders-full': arch(a.wheelFx, a.ground, a.wheelR) + ' ' + arch(a.wheelBx, a.ground, a.wheelR),
    'fenders-partial': arch(a.wheelFx, a.ground, a.wheelR),
    mirrors: mirror,
    doors,
    handles,
    'door-edges': doorEdges,
    rocker,
    roof,
    trunk,
    'bumper-rear': bumperRear,
  };
}

function buildOverlay(c: Cfg): string {
  const { a, g } = c;
  const fsBox: [number, number, number, number] = boxOf(g.frontSide);
  const visor = topStrip(fsBox);
  const sunroof = poly([
    [a.aTopX + 24, a.roofY - 2], [a.cTopX - 30, a.roofY - 2],
    [a.cTopX - 34, a.roofY + 7], [a.aTopX + 28, a.roofY + 7],
  ]);
  const rear = g.rear || derivedRear(g);

  const gz = (id: string, d: string) => `<path class="gz" data-z="${id}" d="${d}"/>`;
  const pz = (id: string, d: string) => `<path class="pz" data-z="${id}" d="${d}"/>`;
  const ppf = buildPPF(a);

  return (
    `<g class="glass-group">` +
    gz('front-side', g.frontSide) + gz('rear-side', g.rearSide) + gz('rear', rear) +
    gz('visor', visor) + gz('sunroof', sunroof) +
    `</g>` +
    `<g class="ppf-group">` +
    Object.entries(ppf).map(([id, d]) => pz(id, d)).join('') +
    `</g>`
  );
}

// Bounding box of a path's coordinate pairs.
function boxOf(d: string): [number, number, number, number] {
  const nums = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const x = nums[i], y = nums[i + 1];
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return [x0, y0, x1, y1];
}

// Small rear quarter glass for fastbacks/hatches with no distinct rear pane.
function derivedRear(g: Glass): string {
  const [, y0, x1, y1] = boxOf(g.rearSide);
  return poly([[x1 + 4, y0 + 3], [x1 + 46, y0 + 8], [x1 + 40, y1 - 6], [x1 + 4, y1 - 3]]);
}

// ── Per-vehicle configs (anchors measured from the renders; glass auto-traced) ──
const CFGS: Cfg[] = [
  {
    id: 'sedan', label: 'Sedan',
    a: { frontX: 35, rearX: 825, roofY: 88, ground: 322, beltY: 170, hoodY: 210, cowlX: 232, deckX: 690, aTopX: 250, cTopX: 612, wheelFx: 168, wheelBx: 650, wheelR: 64 },
    g: {
      frontSide: 'M 365.4 104.6 L 353.8 107.1 L 349.2 109.6 L 342.9 112.1 L 337.9 114.6 L 331.7 117.1 L 327.5 119.6 L 323.3 122.1 L 317.1 124.6 L 311.3 127.1 L 307.9 129.6 L 301.7 132.1 L 297.9 134.6 L 291.7 137.1 L 288.8 139.6 L 285 142.1 L 278.8 144.6 L 272.5 147.1 L 272.5 149.6 L 267.9 152.1 L 262.5 154.6 L 258.8 157.1 L 254.6 159.6 L 248.3 162.1 L 245.4 164.6 L 242.1 167.1 L 238.8 169.6 L 249.6 169.6 L 254.6 167.1 L 262.5 164.6 L 266.7 162.1 L 270.4 159.6 L 274.6 157.1 L 278.3 154.6 L 281.7 152.1 L 285.4 149.6 L 289.6 147.1 L 293.3 144.6 L 297.5 142.1 L 301.3 139.6 L 305.4 137.1 L 310 134.6 L 314.2 132.1 L 318.3 129.6 L 322.9 127.1 L 327.5 124.6 L 332.1 122.1 L 337.1 119.6 L 342.5 117.1 L 347.1 114.6 L 352.5 112.1 L 358.3 109.6 L 363.8 107.1 L 366.3 104.6 Z',
      rearSide: 'M 462.1 105 L 440.4 107.5 L 424.2 110 L 411.3 112.5 L 402.1 115 L 393.8 117.5 L 386.7 120 L 380 122.5 L 373.8 125 L 368.3 127.5 L 362.9 130 L 357.5 132.5 L 352.5 135 L 347.9 137.5 L 343.3 140 L 338.8 142.5 L 334.2 145 L 330.8 147.5 L 332.5 150 L 339.6 152.5 L 340.8 155 L 341.3 157.5 L 342.1 160 L 342.5 162.5 L 342.9 165 L 380.8 165 L 428.3 162.5 L 454.2 160 L 454.6 157.5 L 455.4 155 L 456.3 152.5 L 457.1 150 L 457.9 147.5 L 467.1 145 L 467.9 142.5 L 468.8 140 L 469.2 137.5 L 470 135 L 470.8 132.5 L 471.7 130 L 472.5 127.5 L 472.9 125 L 473.8 122.5 L 464.2 120 L 464.6 117.5 L 465.8 115 L 467.9 112.5 L 469.6 110 L 469.6 107.5 L 467.5 105 Z',
      rear: 'M 504.2 104.6 L 502.9 107.1 L 502.5 109.6 L 502.1 112.1 L 502.1 114.6 L 501.7 117.1 L 501.3 119.6 L 495.8 122.1 L 495 124.6 L 495 127.1 L 494.2 129.6 L 493.8 132.1 L 493.3 134.6 L 492.9 137.1 L 492.5 139.6 L 492.1 142.1 L 491.7 144.6 L 501.7 147.1 L 501.7 149.6 L 501.7 152.1 L 501.7 154.6 L 501.7 157.1 L 521.3 157.1 L 559.6 154.6 L 595 152.1 L 606.3 149.6 L 606.7 147.1 L 607.5 144.6 L 607.9 142.1 L 608.8 139.6 L 609.2 137.1 L 609.6 134.6 L 610 132.1 L 610.4 129.6 L 611.3 127.1 L 611.7 124.6 L 612.1 122.1 L 612.5 119.6 L 610 117.1 L 599.2 114.6 L 586.3 112.1 L 569.6 109.6 L 549.6 107.1 L 517.5 104.6 Z',
    },
  },
  {
    id: 'suv', label: 'SUV',
    a: { frontX: 35, rearX: 825, roofY: 66, ground: 322, beltY: 150, hoodY: 196, cowlX: 232, deckX: 700, aTopX: 240, cTopX: 608, wheelFx: 185, wheelBx: 650, wheelR: 68 },
    g: {
      frontSide: 'M 342.1 87.9 L 336.3 90.4 L 330 92.9 L 324.2 95.4 L 318.3 97.9 L 312.5 100.4 L 307.1 102.9 L 302.1 105.4 L 296.7 107.9 L 292.9 110.4 L 289.6 112.9 L 281.7 115.4 L 277.1 117.9 L 271.7 120.4 L 266.7 122.9 L 262.9 125.4 L 258.8 127.9 L 254.2 130.4 L 250 132.9 L 245.8 135.4 L 243.3 137.9 L 251.7 137.9 L 257.1 135.4 L 261.3 132.9 L 265.4 130.4 L 269.2 127.9 L 273.8 125.4 L 278.3 122.9 L 282.9 120.4 L 287.5 117.9 L 292.1 115.4 L 296.3 112.9 L 301.3 110.4 L 305.8 107.9 L 310.8 105.4 L 315.8 102.9 L 320.8 100.4 L 326.7 97.9 L 331.3 95.4 L 335.8 92.9 L 341.7 90.4 L 343.3 87.9 Z',
      rearSide: 'M 452.1 83.8 L 431.3 86.3 L 416.7 88.8 L 405 91.3 L 395.4 93.8 L 386.7 96.3 L 379.6 98.8 L 372.5 101.3 L 365.4 103.8 L 359.6 106.3 L 353.8 108.8 L 347.9 111.3 L 342.5 113.8 L 337.1 116.3 L 332.1 118.8 L 331.3 121.3 L 330.4 123.8 L 330 126.3 L 329.2 128.8 L 328.3 131.3 L 332.5 133.8 L 335 136.3 L 335.4 138.8 L 335.8 141.3 L 336.3 143.8 L 336.3 146.3 L 338.3 148.8 L 387.1 148.8 L 439.2 146.3 L 451.3 143.8 L 452.1 141.3 L 452.9 138.8 L 453.8 136.3 L 454.2 133.8 L 455 131.3 L 455.4 128.8 L 455.8 126.3 L 456.3 123.8 L 456.7 121.3 L 456.7 118.8 L 456.7 116.3 L 457.1 113.8 L 457.5 111.3 L 458.3 108.8 L 458.8 106.3 L 460 103.8 L 462.5 101.3 L 463.3 98.8 L 463.3 96.3 L 463.8 93.8 L 463.8 91.3 L 463.3 88.8 L 461.3 86.3 L 455.4 83.8 Z',
      rear: 'M 511.3 81.7 L 506.3 84.2 L 505 86.7 L 504.6 89.2 L 504.2 91.7 L 504.2 94.2 L 503.8 96.7 L 503.3 99.2 L 503.3 101.7 L 502.9 104.2 L 502.9 106.7 L 502.5 109.2 L 502.1 111.7 L 502.1 114.2 L 501.7 116.7 L 501.7 119.2 L 501.3 121.7 L 501.3 124.2 L 500.8 126.7 L 500.4 129.2 L 500.4 131.7 L 500 134.2 L 500 136.7 L 499.6 139.2 L 499.6 141.7 L 516.7 141.7 L 559.2 139.2 L 591.3 136.7 L 603.8 134.2 L 604.2 131.7 L 604.6 129.2 L 604.6 126.7 L 605 124.2 L 605.4 121.7 L 605.4 119.2 L 605.8 116.7 L 606.3 114.2 L 606.3 111.7 L 606.7 109.2 L 607.1 106.7 L 607.5 104.2 L 607.5 101.7 L 607.9 99.2 L 608.3 96.7 L 608.8 94.2 L 608.8 91.7 L 596.7 89.2 L 577.1 86.7 L 553.8 84.2 L 518.8 81.7 Z',
    },
  },
  {
    id: 'sport', label: 'Sport',
    a: { frontX: 35, rearX: 825, roofY: 104, ground: 324, beltY: 173, hoodY: 214, cowlX: 300, deckX: 700, aTopX: 348, cTopX: 586, wheelFx: 165, wheelBx: 655, wheelR: 62 },
    g: {
      frontSide: 'M 469.6 112.9 L 440.4 115.4 L 424.2 117.9 L 412.9 120.4 L 403.8 122.9 L 395.4 125.4 L 387.9 127.9 L 381.7 130.4 L 376.3 132.9 L 389.6 135.4 L 383.8 137.9 L 377.9 140.4 L 372.9 142.9 L 367.5 145.4 L 362.9 147.9 L 357.9 150.4 L 353.3 152.9 L 348.8 155.4 L 352.9 157.9 L 362.1 160.4 L 362.9 162.9 L 363.8 165.4 L 364.6 167.9 L 365.8 170.4 L 366.7 172.9 L 393.8 172.9 L 450 170.4 L 451.3 167.9 L 451.7 165.4 L 452.5 162.9 L 453.3 160.4 L 454.2 157.9 L 455 155.4 L 455.8 152.9 L 456.7 150.4 L 457.5 147.9 L 458.3 145.4 L 459.2 142.9 L 460 140.4 L 461.3 137.9 L 467.1 135.4 L 467.9 132.9 L 468.8 130.4 L 469.6 127.9 L 470.4 125.4 L 470.8 122.9 L 471.7 120.4 L 472.5 117.9 L 473.3 115.4 L 474.2 112.9 Z',
      rearSide: 'M 490.8 119.2 L 490.4 121.7 L 490 124.2 L 489.6 126.7 L 489.2 129.2 L 488.8 131.7 L 488.8 134.2 L 500 136.7 L 501.3 139.2 L 501.7 141.7 L 502.5 144.2 L 503.3 146.7 L 503.8 149.2 L 504.2 151.7 L 504.6 154.2 L 505 156.7 L 505 159.2 L 505 161.7 L 505.8 164.2 L 506.3 166.7 L 520 166.7 L 555 164.2 L 580.4 161.7 L 585.4 159.2 L 584.2 156.7 L 582.9 154.2 L 581.7 151.7 L 580 149.2 L 579.2 146.7 L 577.5 144.2 L 576.3 141.7 L 575 139.2 L 573.8 136.7 L 572.5 134.2 L 571.3 131.7 L 570 129.2 L 567.5 126.7 L 550 124.2 L 529.2 121.7 L 492.9 119.2 Z',
      rear: '',
    },
  },
  {
    id: 'truck', label: 'Truck',
    a: { frontX: 35, rearX: 825, roofY: 76, ground: 324, beltY: 148, hoodY: 190, cowlX: 250, deckX: 540, aTopX: 265, cTopX: 530, wheelFx: 155, wheelBx: 670, wheelR: 66 },
    g: {
      frontSide: 'M 367.9 79.6 L 360.4 82.1 L 355 84.6 L 345 87.1 L 337.9 89.6 L 330.4 92.1 L 322.9 94.6 L 315.8 97.1 L 308.8 99.6 L 301.7 102.1 L 294.6 104.6 L 287.1 107.1 L 280.4 109.6 L 273.3 112.1 L 269.6 114.6 L 268.8 117.1 L 268.3 119.6 L 267.5 122.1 L 267.1 124.6 L 266.3 127.1 L 265.4 129.6 L 265 132.1 L 277.5 134.6 L 276.7 137.1 L 276.3 139.6 L 275.8 142.1 L 275.4 144.6 L 274.2 147.1 L 282.9 147.1 L 333.8 144.6 L 378.8 142.1 L 385.4 139.6 L 386.3 137.1 L 386.7 134.6 L 387.1 132.1 L 387.5 129.6 L 388.3 127.1 L 388.8 124.6 L 393.8 122.1 L 394.2 119.6 L 394.6 117.1 L 395 114.6 L 395.4 112.1 L 395.8 109.6 L 396.3 107.1 L 396.7 104.6 L 397.5 102.1 L 397.9 99.6 L 398.3 97.1 L 398.8 94.6 L 399.2 92.1 L 399.6 89.6 L 400 87.1 L 400.4 84.6 L 400 82.1 L 368.3 79.6 Z',
      rearSide: 'M 419.2 85.4 L 419.2 87.9 L 418.8 90.4 L 418.3 92.9 L 418.3 95.4 L 417.9 97.9 L 417.9 100.4 L 417.5 102.9 L 417.5 105.4 L 417.1 107.9 L 417.1 110.4 L 416.7 112.9 L 416.7 115.4 L 416.7 117.9 L 416.3 120.4 L 427.5 122.9 L 427.9 125.4 L 427.9 127.9 L 428.3 130.4 L 428.3 132.9 L 427.9 135.4 L 427.9 137.9 L 443.8 137.9 L 493.8 135.4 L 520.4 132.9 L 520.4 130.4 L 520.4 127.9 L 520.4 125.4 L 520.8 122.9 L 520.8 120.4 L 520.8 117.9 L 530 115.4 L 530 112.9 L 530 110.4 L 530 107.9 L 530 105.4 L 530 102.9 L 529.6 100.4 L 525.4 97.9 L 506.7 95.4 L 489.6 92.9 L 463.3 90.4 L 445.8 87.9 L 420 85.4 Z',
      rear: '',
    },
  },
  {
    id: 'compact', label: 'Compact',
    a: { frontX: 35, rearX: 820, roofY: 52, ground: 324, beltY: 140, hoodY: 182, cowlX: 250, deckX: 690, aTopX: 345, cTopX: 695, wheelFx: 172, wheelBx: 688, wheelR: 60 },
    // compact render has TRANSPARENT windows (not opaque glass like the others),
    // so the color trace missed them; these trapezoids hug the greenhouse.
    g: {
      frontSide: poly([[360, 66], [478, 63], [483, 136], [350, 138]]),
      rearSide: poly([[528, 64], [642, 66], [644, 132], [532, 134]]),
      rear: poly([[650, 72], [694, 76], [692, 122], [652, 124]]),
    },
  },
  {
    id: 'cuv', label: 'CUV',
    a: { frontX: 35, rearX: 823, roofY: 56, ground: 324, beltY: 144, hoodY: 192, cowlX: 232, deckX: 700, aTopX: 322, cTopX: 608, wheelFx: 175, wheelBx: 655, wheelR: 66 },
    g: {
      frontSide: 'M 460 73.8 L 432.5 76.3 L 417.5 78.8 L 406.3 81.3 L 397.1 83.8 L 389.6 86.3 L 382.9 88.8 L 376.3 91.3 L 370.4 93.8 L 365.4 96.3 L 359.6 98.8 L 355 101.3 L 350.4 103.8 L 345.8 106.3 L 341.7 108.8 L 337.5 111.3 L 333.3 113.8 L 329.6 116.3 L 325.8 118.8 L 322.9 121.3 L 322.9 123.8 L 323.3 126.3 L 323.8 128.8 L 324.6 131.3 L 325 133.8 L 325.8 136.3 L 327.1 138.8 L 330.4 141.3 L 332.1 143.8 L 339.6 143.8 L 353.8 141.3 L 416.7 138.8 L 459.6 136.3 L 459.2 133.8 L 462.9 131.3 L 463.3 128.8 L 463.3 126.3 L 464.2 123.8 L 464.6 121.3 L 464.6 118.8 L 461.3 116.3 L 462.5 113.8 L 462.9 111.3 L 463.3 108.8 L 462.5 106.3 L 462.5 103.8 L 462.1 101.3 L 462.1 98.8 L 462.1 96.3 L 462.5 93.8 L 462.5 91.3 L 463.3 88.8 L 463.8 86.3 L 465.4 83.8 L 468.8 81.3 L 468.8 78.8 L 468.3 76.3 L 463.8 73.8 Z',
      rearSide: 'M 503.8 74.2 L 502.5 76.7 L 502.1 79.2 L 501.7 81.7 L 501.3 84.2 L 500.8 86.7 L 500.8 89.2 L 500.4 91.7 L 500 94.2 L 499.6 96.7 L 499.2 99.2 L 498.8 101.7 L 498.3 104.2 L 498.3 106.7 L 497.5 109.2 L 497.5 111.7 L 497.1 114.2 L 496.7 116.7 L 499.2 119.2 L 492.1 121.7 L 491.7 124.2 L 491.3 126.7 L 490.4 129.2 L 490 131.7 L 490 134.2 L 510.8 134.2 L 541.3 131.7 L 570.4 129.2 L 600.8 126.7 L 603.3 124.2 L 600 121.7 L 603.3 119.2 L 603.8 116.7 L 604.2 114.2 L 604.6 111.7 L 605 109.2 L 605.8 106.7 L 606.3 104.2 L 606.7 101.7 L 607.1 99.2 L 607.5 96.7 L 607.9 94.2 L 607.5 91.7 L 607.1 89.2 L 603.3 86.7 L 591.3 84.2 L 579.2 81.7 L 563.8 79.2 L 544.2 76.7 L 516.7 74.2 Z',
      rear: '',
    },
  },
];

export const PHOTO_VEHICLES: PhotoVehicle[] = CFGS.map((c) => ({
  id: c.id,
  label: c.label,
  photo: `/images/vehicles/${c.id}.png`,
  overlay: buildOverlay(c),
}));

export const initialPhoto = PHOTO_VEHICLES[0];

// Mini coverage icon for the zone pickers: a gray sedan silhouette with one
// zone highlighted in accent blue (sedan is the generic reference body).
const SEDAN = CFGS[0];
export function sedanZonePath(zoneId: string): string {
  const a = SEDAN.a, g = SEDAN.g;
  const ppf = buildPPF(a);
  if (ppf[zoneId]) return ppf[zoneId];
  if (zoneId === 'front-side') return g.frontSide;
  if (zoneId === 'rear-side') return g.rearSide;
  if (zoneId === 'rear') return g.rear;
  if (zoneId === 'visor') return topStrip(boxOf(g.frontSide));
  if (zoneId === 'sunroof') return poly([[a.aTopX + 24, a.roofY - 2], [a.cTopX - 30, a.roofY - 2], [a.cTopX - 34, a.roofY + 7], [a.aTopX + 28, a.roofY + 7]]);
  return '';
}

// A simple sedan body silhouette (rounded slab) as the icon backdrop.
const ICON_BODY = poly([
  [40, 210], [232, 172], [300, 108], [560, 96], [690, 150], [820, 172],
  [820, 300], [40, 300],
]);

export function zoneIconPhoto(zoneId: string): string {
  const d = sedanZonePath(zoneId);
  if (!d) return '';
  return `<path d="${ICON_BODY}" fill="#6B7280"/><path d="${d}" fill="#00A8FF"/>`;
}
