// Builds src/lib/vehicles-views.ts from the raw renders in src/assets/vehicle-views.
//
// The mapping is derived from the FILENAMES — nothing is hardcoded per image:
//   "CUV FRONTAL.svg"  → vehicle "cuv",   view "front"
//   "TRUCK REAR.svg"   → vehicle "truck", view "rear"
// Empty placeholder SVGs (no embedded render) are skipped with a warning.
//
// Each usable render is extracted from its SVG wrapper (base64 PNG), converted
// to a web-friendly webp (public/images/views/<vehicle>-<view>.webp), and merged
// with its traced window masks (src/lib/view-masks/<vehicle>-<view>.json) whose
// path coordinates live in the render's native pixel space.
//
// Run: node scripts/build-views.mjs

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const VIEWS_DIR = path.join(ROOT, 'src', 'assets', 'vehicle-views');
const MASKS_DIR = path.join(ROOT, 'src', 'lib', 'view-masks');
const OUT_TS = path.join(ROOT, 'src', 'lib', 'vehicles-views.ts');

// Filename → visualizer vehicle id. Keys are the tokens used in the VIEWS
// folder; values are the vehicle ids used by the visualizer's picker.
const CATEGORY_TOKENS = { sedan: 'sedan', sport: 'sport', suv: 'suv', cuv: 'cuv', truck: 'truck' };
const VIEW_TOKENS = { front: 'front', frontal: 'front', rear: 'rear' };

function parseName(file) {
  const stem = file.replace(/\.svg$/i, '').trim().toLowerCase();
  const tokens = stem.split(/[\s_-]+/);
  const vehicle = tokens.map((t) => CATEGORY_TOKENS[t]).find(Boolean);
  const view = tokens.map((t) => VIEW_TOKENS[t]).find(Boolean);
  return vehicle && view ? { vehicle, view } : null;
}

const entries = {};
const files = fs.readdirSync(VIEWS_DIR).filter((f) => f.toLowerCase().endsWith('.svg'));

for (const file of files) {
  const parsed = parseName(file);
  if (!parsed) {
    console.warn(`! ${file}: filename does not match <CATEGORY> <VIEW>.svg — skipped`);
    continue;
  }
  const svg = fs.readFileSync(path.join(VIEWS_DIR, file), 'utf8');
  const images = [...svg.matchAll(/data:image\/(png|jpeg);base64,([A-Za-z0-9+/=]+)/g)];
  if (images.length === 0) {
    console.warn(`! ${file}: empty placeholder (no embedded render) — skipped`);
    continue;
  }
  // The largest embedded raster is the vehicle render.
  const big = images.reduce((a, b) => (b[2].length > a[2].length ? b : a));
  const slug = `${parsed.vehicle}-${parsed.view}`;
  const webpRel = `/images/views/${slug}.webp`;
  const webpAbs = path.join(ROOT, 'public', webpRel);
  const buf = Buffer.from(big[2], 'base64');
  const meta = await sharp(buf).metadata();
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;

  // The renders ship with an opaque near-black backdrop. Key it out by
  // flood-filling from the image borders (so black interiors stay opaque).
  const dark = (i) => data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2] < 36;
  const seen = new Uint8Array(w * h);
  const queue = [];
  for (let x = 0; x < w; x++) {
    for (const y of [0, h - 1]) { const i = y * w + x; if (dark(i) && !seen[i]) { seen[i] = 1; queue.push(i); } }
  }
  for (let y = 0; y < h; y++) {
    for (const x of [0, w - 1]) { const i = y * w + x; if (dark(i) && !seen[i]) { seen[i] = 1; queue.push(i); } }
  }
  while (queue.length) {
    const i = queue.pop();
    const x = i % w, y = (i / w) | 0;
    data[i * 4 + 3] = 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const j = ny * w + nx;
      if (!seen[j] && dark(j)) { seen[j] = 1; queue.push(j); }
    }
  }
  // Soften the keyed edge: pixels adjacent to transparency get partial alpha.
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (data[i * 4 + 3] === 0) continue;
      let holes = 0;
      for (const d of [i - 1, i + 1, i - w, i + w]) if (data[d * 4 + 3] === 0) holes++;
      if (holes) data[i * 4 + 3] = Math.max(60, 255 - holes * 70);
    }
  }
  if (!fs.existsSync(webpAbs)) {
    await sharp(data, { raw: { width: w, height: h, channels: 4 } })
      .resize({ width: 1720 })
      .webp({ quality: 82, alphaQuality: 90 })
      .toFile(webpAbs);
    console.log(`+ extracted ${webpRel} (background keyed out)`);
  }

  // Tight framing window (SVG viewBox). Some source renders are cropped
  // mid-vehicle (e.g. Cybertruck rear view loses the nose); framing to the
  // content bbox puts any such cut flush with the frame edge — full-bleed,
  // like the original SVG compositions — instead of floating in empty space.
  let bx0 = w, by0 = h, bx1 = 0, by1 = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 60) {
        if (x < bx0) bx0 = x;
        if (x > bx1) bx1 = x;
        if (y < by0) by0 = y;
        if (y > by1) by1 = y;
      }
    }
  }
  const PAD = 20;
  bx0 = Math.max(0, bx0 - PAD); by0 = Math.max(0, by0 - PAD);
  bx1 = Math.min(w, bx1 + PAD); by1 = Math.min(h, by1 + PAD);
  // Expand the short dimension toward the canvas aspect so all views share
  // one frame shape (stable preview height when switching views/vehicles).
  const AR = w / h;
  let cw = bx1 - bx0, ch = by1 - by0;
  if (cw / ch < AR) {
    const want = Math.min(w, Math.round(AR * ch));
    let nx0 = Math.max(0, Math.round(bx0 - (want - cw) / 2));
    if (nx0 + want > w) nx0 = w - want;
    bx0 = nx0; cw = want;
  } else {
    const want = Math.min(h, Math.round(cw / AR));
    let ny0 = Math.max(0, Math.round(by0 - (want - ch) / 2));
    if (ny0 + want > h) ny0 = h - want;
    by0 = ny0; ch = want;
  }
  const vb = [bx0, by0, cw, ch];

  const maskFile = path.join(MASKS_DIR, `${slug}.json`);
  const windows = fs.existsSync(maskFile) ? JSON.parse(fs.readFileSync(maskFile, 'utf8')) : {};
  if (!Object.keys(windows).length) console.warn(`! ${file}: no window masks found at ${maskFile}`);
  (entries[parsed.vehicle] ??= {})[parsed.view] = {
    src: webpRel,
    width: meta.width,
    height: meta.height,
    vb,
    windows,
  };
  console.log(`✓ ${file} → ${parsed.vehicle}/${parsed.view} (${meta.width}x${meta.height}, vb ${vb.join(' ')}, ${Object.keys(windows).length} windows)`);
}

const banner = `// AUTO-GENERATED by scripts/build-views.mjs — do not edit by hand.
// Source imagery: public/images/VIEWS/*.svg (mapping derived from filenames).
// Window mask paths: src/lib/view-masks/*.json (native pixel coordinates).

export type VehicleView = {
  /** Web-optimized render (webp with alpha). */
  src: string;
  /** Native pixel size of the render (the mask coordinate space). */
  width: number;
  height: number;
  /** Tight framing window [x, y, w, h] used as the SVG viewBox. */
  vb: [number, number, number, number];
  /** Window id → SVG path (d attribute) in native pixel coordinates. */
  windows: Record<string, string>;
};

export type VehicleViews = { front?: VehicleView; rear?: VehicleView };

export const VEHICLE_VIEWS: Record<string, VehicleViews> = `;

fs.writeFileSync(OUT_TS, banner + JSON.stringify(entries, null, 2) + ' as const;\n');
console.log(`\nWrote ${path.relative(ROOT, OUT_TS)} (${Object.keys(entries).length} vehicles)`);
