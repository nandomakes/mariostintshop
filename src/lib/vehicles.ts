// Parametric side-view vehicle generator for the tint/PPF visualizer.
// Lives outside the .astro frontmatter because the Astro compiler mis-parses
// raw SVG markup inside frontmatter template literals.
type RearStyle = 'trunk' | 'hatch' | 'bed';
interface VehicleCfg {
  id: string;
  label: string;
  frontX: number; rearX: number;
  hoodY: number;               // hood height at front tip
  cowlX: number; cowlY: number; // windshield base
  aTopX: number; roofY: number; // A-pillar top / roof height
  cTopX: number;               // roof end (C-pillar top)
  deckX: number; deckY: number; // rear deck / tailgate shoulder
  wheelF: number; wheelB: number; wheelR: number;
  bottom: number;              // rocker line
  bSplit: number;              // B-pillar position within greenhouse (0-1)
  rear: RearStyle;
  bedStartX?: number;          // pickup only: bed begins here
}

const CFGS: VehicleCfg[] = [
  { id: 'sedan',   label: 'Sedan',   frontX: 84,  rearX: 778, hoodY: 178, cowlX: 306, cowlY: 170, aTopX: 378, roofY: 120, cTopX: 566, deckX: 648, deckY: 164, wheelF: 252, wheelB: 644, wheelR: 45, bottom: 256, bSplit: 0.47, rear: 'trunk' },
  { id: 'suv',     label: 'SUV',     frontX: 92,  rearX: 762, hoodY: 164, cowlX: 296, cowlY: 156, aTopX: 356, roofY: 98,  cTopX: 648, deckX: 700, deckY: 150, wheelF: 254, wheelB: 630, wheelR: 50, bottom: 252, bSplit: 0.44, rear: 'hatch' },
  { id: 'sport',   label: 'Sport',   frontX: 72,  rearX: 782, hoodY: 194, cowlX: 336, cowlY: 186, aTopX: 412, roofY: 140, cTopX: 548, deckX: 668, deckY: 180, wheelF: 250, wheelB: 650, wheelR: 44, bottom: 258, bSplit: 0.52, rear: 'trunk' },
  { id: 'truck',   label: 'Truck',   frontX: 90,  rearX: 792, hoodY: 156, cowlX: 296, cowlY: 148, aTopX: 348, roofY: 96,  cTopX: 474, deckX: 516, deckY: 152, wheelF: 248, wheelB: 656, wheelR: 50, bottom: 250, bSplit: 0.55, rear: 'bed', bedStartX: 524 },
  { id: 'compact', label: 'Compact', frontX: 146, rearX: 712, hoodY: 174, cowlX: 328, cowlY: 166, aTopX: 384, roofY: 114, cTopX: 574, deckX: 616, deckY: 156, wheelF: 288, wheelB: 596, wheelR: 44, bottom: 254, bSplit: 0.46, rear: 'hatch' },
  { id: 'cuv',     label: 'CUV',     frontX: 112, rearX: 746, hoodY: 168, cowlX: 308, cowlY: 160, aTopX: 366, roofY: 106, cTopX: 610, deckX: 662, deckY: 152, wheelF: 268, wheelB: 612, wheelR: 47, bottom: 252, bSplit: 0.45, rear: 'hatch' },
];

const N = (v: number) => v.toFixed(1);

function bodyPath(c: VehicleCfg): string {
  const archR = c.wheelR + 13;
  const half = c.wheelR + 10;
  let d = `M ${N(c.frontX + 16)} ${N(c.bottom)}`;
  d += ` C ${N(c.frontX + 4)} ${N(c.bottom)} ${N(c.frontX)} ${N(c.bottom - 8)} ${N(c.frontX)} ${N(c.bottom - 16)}`;
  d += ` L ${N(c.frontX)} ${N(c.hoodY + 30)}`;
  d += ` C ${N(c.frontX)} ${N(c.hoodY + 10)} ${N(c.frontX + 14)} ${N(c.hoodY + 3)} ${N(c.frontX + 44)} ${N(c.hoodY)}`;
  d += ` C ${N((c.frontX + 44 + c.cowlX) / 2)} ${N(c.hoodY - 7)} ${N(c.cowlX - 40)} ${N(c.cowlY - 2)} ${N(c.cowlX)} ${N(c.cowlY)}`;
  d += ` C ${N(c.cowlX + 22)} ${N((c.cowlY + c.roofY) / 2)} ${N(c.aTopX - 22)} ${N(c.roofY + 10)} ${N(c.aTopX)} ${N(c.roofY + 2)}`;
  d += ` C ${N((c.aTopX + c.cTopX) / 2)} ${N(c.roofY - 6)} ${N(c.cTopX - 20)} ${N(c.roofY)} ${N(c.cTopX)} ${N(c.roofY + 2)}`;
  if (c.rear === 'bed') {
    const bx = c.bedStartX!;
    d += ` C ${N(c.cTopX + 16)} ${N(c.roofY + 6)} ${N(c.deckX - 10)} ${N(c.deckY - 16)} ${N(c.deckX)} ${N(c.deckY)}`;
    d += ` L ${N(bx)} ${N(c.deckY)} L ${N(c.rearX - 12)} ${N(c.deckY)}`;
    d += ` C ${N(c.rearX - 3)} ${N(c.deckY)} ${N(c.rearX)} ${N(c.deckY + 6)} ${N(c.rearX)} ${N(c.deckY + 14)}`;
  } else if (c.rear === 'hatch') {
    d += ` C ${N(c.cTopX + 18)} ${N(c.roofY + 4)} ${N(c.deckX - 14)} ${N(c.deckY - 18)} ${N(c.deckX)} ${N(c.deckY)}`;
    d += ` C ${N((c.deckX + c.rearX) / 2)} ${N(c.deckY + 2)} ${N(c.rearX - 16)} ${N(c.deckY + 4)} ${N(c.rearX)} ${N(c.deckY + 16)}`;
  } else {
    d += ` C ${N(c.cTopX + 36)} ${N(c.roofY + 8)} ${N((c.cTopX + c.deckX) / 2)} ${N((c.roofY + c.deckY) / 2)} ${N(c.deckX)} ${N(c.deckY)}`;
    d += ` C ${N((c.deckX + c.rearX) / 2)} ${N(c.deckY - 3)} ${N(c.rearX - 24)} ${N(c.deckY)} ${N(c.rearX - 6)} ${N(c.deckY + 10)}`;
    d += ` C ${N(c.rearX)} ${N(c.deckY + 15)} ${N(c.rearX)} ${N(c.deckY + 18)} ${N(c.rearX)} ${N(c.deckY + 24)}`;
  }
  d += ` L ${N(c.rearX)} ${N(c.bottom - 16)}`;
  d += ` C ${N(c.rearX)} ${N(c.bottom - 8)} ${N(c.rearX - 4)} ${N(c.bottom)} ${N(c.rearX - 16)} ${N(c.bottom)}`;
  d += ` L ${N(c.wheelB + half)} ${N(c.bottom)}`;
  d += ` A ${N(archR)} ${N(archR)} 0 0 0 ${N(c.wheelB - half)} ${N(c.bottom)}`;
  d += ` L ${N(c.wheelF + half)} ${N(c.bottom)}`;
  d += ` A ${N(archR)} ${N(archR)} 0 0 0 ${N(c.wheelF - half)} ${N(c.bottom)}`;
  d += ` L ${N(c.frontX + 16)} ${N(c.bottom)} Z`;
  return d;
}

const poly = (pts: [number, number][]) =>
  'M ' + pts.map(([x, y]) => `${N(x)} ${N(y)}`).join(' L ') + ' Z';

/** Band that follows a slope between two points, with given thickness. */
function band(x1: number, y1: number, x2: number, y2: number, t: number) {
  return poly([[x1, y1], [x2, y2], [x2, y2 + t], [x1, y1 + t]]);
}

function buildVehicle(c: VehicleCfg) {
  const beltY = c.cowlY + 4;
  const glassTop = c.roofY + 9;
  const bX = c.aTopX + (c.cTopX - c.aTopX) * c.bSplit;

  // ── Glass zones (side view) ──────────────────────────────────────
  const windshield = poly([
    [c.cowlX + 6, beltY], [c.cowlX + 20, beltY],
    [c.aTopX + 18, glassTop], [c.aTopX + 6, glassTop],
  ]);
  const visor = poly([
    [c.cowlX + 6 + (c.aTopX - c.cowlX) * 0.62, beltY + (glassTop - beltY) * 0.62],
    [c.cowlX + 20 + (c.aTopX - c.cowlX) * 0.62, beltY + (glassTop - beltY) * 0.62],
    [c.aTopX + 18, glassTop], [c.aTopX + 6, glassTop],
  ]);
  const frontWin = poly([
    [c.cowlX + 26, beltY], [bX - 4, beltY], [bX - 4, glassTop], [c.aTopX + 24, glassTop],
  ]);
  const rearWinEndX = c.rear === 'bed' ? c.cTopX + 24 : c.cTopX + 10;
  const rearWin = poly([
    [bX + 5, beltY], [rearWinEndX + (c.rear === 'bed' ? 8 : 22), beltY],
    [rearWinEndX, glassTop], [bX + 5, glassTop],
  ]);
  const rearGlass = poly([
    [rearWinEndX + (c.rear === 'bed' ? 14 : 30), beltY],
    [rearWinEndX + (c.rear === 'bed' ? 26 : 44), beltY],
    [rearWinEndX + 14, glassTop], [rearWinEndX + 4, glassTop],
  ]);
  const sunroofW = Math.min(110, c.cTopX - c.aTopX - 60);
  const sunroof = poly([
    [c.aTopX + 30, c.roofY + 1], [c.aTopX + 30 + sunroofW, c.roofY + 1],
    [c.aTopX + 30 + sunroofW, c.roofY + 8], [c.aTopX + 30, c.roofY + 8],
  ]);

  // ── PPF zones ────────────────────────────────────────────────────
  const hoodFull = band(c.frontX + 44, c.hoodY, c.cowlX, c.cowlY, 15);
  const hoodPartial = band(c.frontX + 44, c.hoodY, c.frontX + 44 + (c.cowlX - c.frontX - 44) * 0.45, c.hoodY + (c.cowlY - c.hoodY) * 0.45 - 4, 15);
  const bumperF = poly([
    [c.frontX, c.hoodY + 12], [c.frontX + 42, c.hoodY + 6],
    [c.frontX + 42, c.bottom - 4], [c.frontX + 14, c.bottom - 4], [c.frontX, c.bottom - 18],
  ]);
  const rearTopY = c.rear === 'bed' ? c.deckY : c.rear === 'hatch' ? c.deckY + 8 : c.deckY + 12;
  const bumperR = poly([
    [c.rearX - 40, rearTopY + 14], [c.rearX, rearTopY + 10],
    [c.rearX, c.bottom - 18], [c.rearX - 14, c.bottom - 4], [c.rearX - 40, c.bottom - 4],
  ]);
  const archBand = (wx: number) => {
    const R1 = c.wheelR + 13, R2 = c.wheelR - 2;
    const h1 = c.wheelR + 10, h2 = c.wheelR - 6;
    return `M ${N(wx - h1)} ${N(c.bottom)} A ${N(R1)} ${N(R1)} 0 0 1 ${N(wx + h1)} ${N(c.bottom)} L ${N(wx + h2)} ${N(c.bottom)} A ${N(R2)} ${N(R2)} 0 0 0 ${N(wx - h2)} ${N(c.bottom)} Z`;
  };
  const fenderF = archBand(c.wheelF);
  const fenderR = archBand(c.wheelB);
  const mirror = poly([
    [c.cowlX + 4, c.cowlY - 4], [c.cowlX + 26, c.cowlY - 9],
    [c.cowlX + 28, c.cowlY + 3], [c.cowlX + 8, c.cowlY + 6],
  ]);
  const doorEndX = c.rear === 'bed' ? c.bedStartX! - 6 : Math.min(c.deckX - 16, c.cTopX + 46);
  const doors = poly([
    [c.cowlX + 12, beltY + 8], [doorEndX, beltY + 8],
    [doorEndX, c.bottom - 10], [c.cowlX + 12, c.bottom - 10],
  ]);
  const roofBand = band(c.aTopX + 16, c.roofY + 1, c.cTopX - 8, c.roofY + 1, 9);
  const handleY = beltY + 16;
  const handles =
    `M ${N(bX + 12)} ${N(handleY)} h 30 v 7 h -30 Z` +
    (c.rear === 'bed' ? '' : ` M ${N(doorEndX - 46)} ${N(handleY)} h 30 v 7 h -30 Z`);
  const doorEdges =
    `M ${N(bX - 1.5)} ${N(beltY + 6)} h 3 v ${N(c.bottom - 16 - beltY)} h -3 Z` +
    ` M ${N(doorEndX - 1.5)} ${N(beltY + 6)} h 3 v ${N(c.bottom - 16 - beltY)} h -3 Z`;
  const rocker = poly([
    [c.wheelF + c.wheelR + 12, c.bottom - 13], [c.wheelB - c.wheelR - 12, c.bottom - 13],
    [c.wheelB - c.wheelR - 12, c.bottom - 3], [c.wheelF + c.wheelR + 12, c.bottom - 3],
  ]);
  const trunk =
    c.rear === 'bed'
      ? band(c.bedStartX! + 4, c.deckY + 1, c.rearX - 12, c.deckY + 1, 12)
      : c.rear === 'hatch'
        ? poly([[c.deckX - 2, c.deckY], [c.rearX - 8, c.deckY + 14], [c.rearX - 10, c.deckY + 34], [c.deckX - 2, c.deckY + 20]])
        : band(c.deckX, c.deckY, c.rearX - 10, c.deckY + 8, 13);

  // ── Decorative details ───────────────────────────────────────────
  const headlight = poly([
    [c.frontX + 8, c.hoodY + 14], [c.frontX + 52, c.hoodY + 8],
    [c.frontX + 48, c.hoodY + 24], [c.frontX + 8, c.hoodY + 28],
  ]);
  const tailTopY = c.rear === 'bed' ? c.deckY + 4 : c.rear === 'hatch' ? c.deckY + 12 : c.deckY + 14;
  const taillight = poly([
    [c.rearX - 34, tailTopY + 6], [c.rearX - 2, tailTopY + 2],
    [c.rearX - 2, tailTopY + 16], [c.rearX - 34, tailTopY + 18],
  ]);

  const wheels = [c.wheelF, c.wheelB]
    .map(
      (wx) => `
      <circle cx="${N(wx)}" cy="${N(c.bottom + 6)}" r="${N(c.wheelR)}" fill="#0C0D0F"/>
      <circle cx="${N(wx)}" cy="${N(c.bottom + 6)}" r="${N(c.wheelR * 0.46)}" fill="#2E3238"/>
      <circle cx="${N(wx)}" cy="${N(c.bottom + 6)}" r="${N(c.wheelR * 0.17)}" fill="#15171A"/>`
    )
    .join('');

  // Zone paths are also collected so the page can render mini "coverage
  // icons" (a small gray car with the zone highlighted, SunTek-style).
  const zones: Record<string, string> = {};
  const gz = (id: string, d: string) => {
    zones[id] = d;
    return `<path class="gz" data-z="${id}" d="${d}"/>`;
  };
  const pz = (id: string, d: string) => {
    zones[id] = d;
    return `<path class="pz" data-z="${id}" d="${d}"/>`;
  };

  const inner = `
    <ellipse cx="${N((c.frontX + c.rearX) / 2)}" cy="312" rx="${N((c.rearX - c.frontX) / 2 + 16)}" ry="11" fill="#000" opacity="0.42"/>
    <path class="body-fill" d="${bodyPath(c)}"/>
    <path class="body-shine" d="${bodyPath(c)}" fill="url(#body-gloss)"/>
    <line x1="${N(bX)}" y1="${N(beltY + 6)}" x2="${N(bX)}" y2="${N(c.bottom - 14)}" stroke="#000" stroke-opacity="0.26" stroke-width="2.5"/>
    ${c.rear === 'bed' ? '' : `<path d="M ${N(doorEndX)} ${N(beltY + 6)} C ${N(doorEndX + 4)} ${N((beltY + c.bottom) / 2)} ${N(doorEndX + 4)} ${N((beltY + c.bottom) / 2)} ${N(doorEndX - 2)} ${N(c.bottom - 14)}" stroke="#000" stroke-opacity="0.22" stroke-width="2.2" fill="none"/>`}
    ${c.rear === 'bed' ? `<line x1="${N(c.bedStartX!)}" y1="${N(c.deckY + 4)}" x2="${N(c.bedStartX!)}" y2="${N(c.bottom - 14)}" stroke="#000" stroke-opacity="0.3" stroke-width="2.5"/>` : ''}
    <path d="${handles}" fill="#000" opacity="0.32"/>
    <path d="${headlight}" fill="#DCE7F0" opacity="0.92"/>
    <path d="${taillight}" fill="#C2263C" opacity="0.9"/>
    <path class="body-fill" d="${mirror}"/>
    <g class="glass-group">
      ${gz('front-side', frontWin)}${gz('rear-side', rearWin)}${gz('rear', rearGlass)}
      ${gz('windshield-base', windshield)}${gz('visor', visor)}${gz('sunroof', sunroof)}
    </g>
    <g class="ppf-group">
      ${pz('bumper-front', bumperF)}${pz('hood-full', hoodFull)}${pz('hood-partial', hoodPartial)}
      ${pz('fenders-full', fenderF + ' ' + fenderR)}${pz('fenders-partial', fenderF)}
      ${pz('mirrors', mirror)}${pz('rocker', rocker)}${pz('roof', roofBand)}
      ${pz('doors', doors)}${pz('handles', handles)}${pz('door-edges', doorEdges)}
      ${pz('trunk', trunk)}${pz('bumper-rear', bumperR)}${pz('full', bodyPath(c))}
    </g>
    ${wheels}`;

  return { id: c.id, label: c.label, inner, body: bodyPath(c), zones };
}

export const VEHICLES = CFGS.map(buildVehicle);
export const initial = VEHICLES[0];

/**
 * Mini coverage icon: gray body silhouette with one zone highlighted in the
 * accent blue — used for the SunTek-style zone pickers.
 */
export function zoneIcon(zoneId: string): string {
  const v = VEHICLES[0]; // sedan is the generic icon body
  const d = v.zones[zoneId];
  if (!d) return '';
  return (
    `<path d="${v.body}" fill="#6B7280"/>` +
    `<path d="${d}" fill="#00A8FF"/>`
  );
}
