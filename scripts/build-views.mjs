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
const TPL_DIR = path.join(VIEWS_DIR, 'masks');
const OUT_TS = path.join(ROOT, 'src', 'lib', 'vehicles-views.ts');

// Canonical window ids the visualizer maps to tint zones.
const WINDOW_IDS = [
  'front-windshield', 'driver-front-window', 'driver-rear-window',
  'quarter-window', 'rear-windshield', 'glass-roof',
];
const MASK_COLORS = {
  'front-windshield': '#ff2d78', 'driver-front-window': '#00b3ff',
  'driver-rear-window': '#e6c800', 'quarter-window': '#18c964',
  'rear-windshield': '#ff7a00', 'glass-roof': '#b36bff',
};

// Parse hand-editable mask SVG: any <path> whose id (or inkscape:label)
// matches a window id overrides the auto-traced mask for that window.
function readHandMasks(slug) {
  const file = path.join(TPL_DIR, `${slug}.svg`);
  if (!fs.existsSync(file)) return null;
  const svg = fs.readFileSync(file, 'utf8');
  const out = {};
  for (const tag of svg.matchAll(/<path\b[^>]*>/g)) {
    const t = tag[0];
    const id = t.match(/\bid="([^"]+)"/)?.[1];
    const label = t.match(/\binkscape:label="([^"]+)"/)?.[1];
    const name = [id, label].find((n) => n && WINDOW_IDS.includes(n));
    if (!name) continue;
    const d = t.match(/\bd="([^"]+)"/)?.[1];
    if (!d) continue;
    if (/\btransform="/.test(t)) {
      console.warn(`! ${slug}.svg: path "${name}" has a transform attribute — flatten transforms before saving (path ignored)`);
      continue;
    }
    out[name] = d;
  }
  return Object.keys(out).length ? out : null;
}

// Write an editable tracing template: the render embedded at native scale
// plus the current masks as semi-transparent starting shapes.
async function writeTemplate(slug, buf, w, h, windows) {
  const file = path.join(TPL_DIR, `${slug}.svg`);
  if (fs.existsSync(file)) return;
  fs.mkdirSync(TPL_DIR, { recursive: true });
  const png = await sharp(buf).resize({ width: 1720 }).png({ compressionLevel: 9 }).toBuffer();
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">\n`;
  svg += `  <!-- Plantilla de trazado: edita los nodos de cada path (NO los renombres,\n`;
  svg += `       NO muevas/escales la imagen, NO apliques transforms). Ids validos:\n`;
  svg += `       ${WINDOW_IDS.join(', ')}.\n`;
  svg += `       Al guardar, corre: node scripts/build-views.mjs -->\n`;
  svg += `  <image id="render" x="0" y="0" width="${w}" height="${h}" xlink:href="data:image/png;base64,${png.toString('base64')}"/>\n`;
  svg += `  <g id="window-masks">\n`;
  for (const [id, d] of Object.entries(windows)) {
    const c = MASK_COLORS[id] ?? '#ff2d78';
    svg += `    <path id="${id}" d="${d}" fill="${c}" fill-opacity="0.35" stroke="${c}" stroke-width="3"/>\n`;
  }
  svg += `  </g>\n</svg>\n`;
  fs.writeFileSync(file, svg);
  console.log(`+ tracing template ${path.relative(ROOT, file)}`);
}

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

// Drop zone: any raw SVG left in public/images/VIEWS is ingested here first
// (moved to src/assets so the 4-5 MB sources never ship with the deploy).
const SOURCE_EXTS = /\.(svg|png|jpe?g|webp)$/i;
const DROP_DIR = path.join(ROOT, 'public', 'images', 'views');
if (fs.existsSync(DROP_DIR)) {
  for (const f of fs.readdirSync(DROP_DIR).filter((f) => SOURCE_EXTS.test(f) && !/^[a-z]+-(front|rear)\.webp$/.test(f))) {
    fs.mkdirSync(VIEWS_DIR, { recursive: true });
    fs.copyFileSync(path.join(DROP_DIR, f), path.join(VIEWS_DIR, f));
    fs.rmSync(path.join(DROP_DIR, f));
    console.log(`→ ingested ${f} from public/images/VIEWS`);
    // A fresh source render invalidates the derived webp so it regenerates.
    const parsed = parseName(f);
    if (parsed) {
      const webp = path.join(DROP_DIR, `${parsed.vehicle}-${parsed.view}.webp`);
      if (fs.existsSync(webp)) fs.rmSync(webp);
    }
  }
}

const entries = {};
// Sources may be SVG wrappers (render embedded as base64) or plain raster
// images (png/jpg/webp) named with the same <CATEGORY> <VIEW> convention.
// When both exist for one view, the largest usable file wins.
const bySlug = {};
for (const f of fs.readdirSync(VIEWS_DIR).filter((f) => SOURCE_EXTS.test(f))) {
  const parsed = parseName(f.replace(SOURCE_EXTS, ''));
  if (!parsed) {
    console.warn(`! ${f}: filename does not match <CATEGORY> <VIEW>.<ext> — skipped`);
    continue;
  }
  const slug = `${parsed.vehicle}-${parsed.view}`;
  (bySlug[slug] ??= { parsed, files: [] }).files.push(f);
}

for (const [slug, { parsed, files: candidates }] of Object.entries(bySlug)) {
  let buf = null, chosen = null;
  for (const f of candidates.sort((a, b) => fs.statSync(path.join(VIEWS_DIR, b)).size - fs.statSync(path.join(VIEWS_DIR, a)).size)) {
    if (/\.svg$/i.test(f)) {
      const svg = fs.readFileSync(path.join(VIEWS_DIR, f), 'utf8');
      const images = [...svg.matchAll(/data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)/g)];
      if (images.length === 0) {
        console.warn(`! ${f}: empty placeholder (no embedded render) — skipped`);
        continue;
      }
      const big = images.reduce((a, b) => (b[2].length > a[2].length ? b : a));
      buf = Buffer.from(big[2], 'base64');
    } else {
      buf = fs.readFileSync(path.join(VIEWS_DIR, f));
    }
    chosen = f;
    break;
  }
  if (!buf) continue;
  const file = chosen;
  const webpRel = `/images/views/${slug}.webp`;
  const webpAbs = path.join(ROOT, 'public', webpRel);
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
  let windows = fs.existsSync(maskFile) ? JSON.parse(fs.readFileSync(maskFile, 'utf8')) : {};
  // Hand-drawn masks (src/assets/vehicle-views/masks/<slug>.svg) win over
  // the auto-traced ones, window by window.
  const hand = readHandMasks(slug);
  let source = 'auto';
  if (hand) {
    windows = { ...windows, ...hand };
    source = `hand(${Object.keys(hand).join(',')})`;
  }
  if (!Object.keys(windows).length) console.warn(`! ${file}: no window masks found at ${maskFile}`);
  await writeTemplate(slug, buf, w, h, windows);
  (entries[parsed.vehicle] ??= {})[parsed.view] = {
    src: webpRel,
    width: meta.width,
    height: meta.height,
    vb,
    windows,
  };
  console.log(`✓ ${file} → ${parsed.vehicle}/${parsed.view} (${meta.width}x${meta.height}, vb ${vb.join(' ')}, ${Object.keys(windows).length} windows, masks: ${source})`);
}

const banner = `// AUTO-GENERATED by scripts/build-views.mjs — do not edit by hand.
// Source imagery: src/assets/vehicle-views/*.svg (mapping derived from filenames).
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
