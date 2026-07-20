// Generates a real HDR studio environment (public/models3d/studio-env.hdr)
// for the visualizer's <model-viewer>. The old SDR .jpg had no dynamic
// range, so metallic paint and glass reflected a flat pale wash ("pastel"
// look). A true HDR studio — dark surround with a few very bright softbox
// strips — gives glass and paint the crisp bright reflection streaks that
// read as real showroom glass.
//
// Equirectangular, RGBE Radiance .hdr, run-length encoded.
// Run: node scripts/build-env.mjs

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')),
  '..'
);
const OUT = path.join(ROOT, 'public', 'models3d', 'studio-env.hdr');

const W = 1024;
const H = 512;

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smoothstep = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// Soft-edged rectangular softbox in equirectangular UV space.
// u wraps 0..1 (azimuth), v is 0 at top → 1 at bottom (elevation).
function softbox(u, v, { u0, u1, v0, v1, featherU, featherV, intensity }) {
  const du =
    smoothstep(u0 - featherU, u0 + featherU, u) * (1 - smoothstep(u1 - featherU, u1 + featherU, u));
  const dv =
    smoothstep(v0 - featherV, v0 + featherV, v) * (1 - smoothstep(v1 - featherV, v1 + featherV, v));
  return du * dv * intensity;
}

// Studio light rig: a MOSTLY DARK surround with a few narrow, bright strip
// lights. The earlier version used huge, high-intensity panels (including a
// full 360° ring) — that pumped so much average irradiance into the upper
// hemisphere that every panel's diffuse color washed out toward white,
// regardless of paint color. Real product-photography studios keep the
// overall sphere dark and let a handful of narrow strips do the work, so
// reflections read as bright streaks on an otherwise dark, saturated body
// color. Intensities are linear HDR, but modest — enough to streak, not
// enough to flood.
const LIGHTS = [
  { u0: 0.08, u1: 0.30, v0: 0.08, v1: 0.15, featherU: 0.02, featherV: 0.015, intensity: 8 },
  { u0: 0.56, u1: 0.82, v0: 0.07, v1: 0.13, featherU: 0.02, featherV: 0.015, intensity: 10 },
  { u0: 0.34, u1: 0.52, v0: 0.24, v1: 0.27, featherU: 0.03, featherV: 0.006, intensity: 14 },
  { u0: 0.64, u1: 0.80, v0: 0.28, v1: 0.32, featherU: 0.025, featherV: 0.008, intensity: 6 },
];

function radiance(u, v) {
  // Base surround: dark, cool studio. Keep it low so panel diffuse color
  // stays saturated — the strips above supply the bright streaks.
  const ceiling = 0.03;
  const floor = 0.015;
  const base = v < 0.5 ? ceiling : floor + (0.5 - Math.abs(v - 0.72)) * 0.02;

  // Soft ground fill so the underside of the car isn't pitch black.
  const groundFill = v > 0.5 ? smoothstep(0.5, 0.9, v) * 0.03 : 0;

  let lum = base + Math.max(0, groundFill);
  for (const l of LIGHTS) lum += softbox(u, v, l);

  // Lights read as clean neutral white with a faint cool tint; surround is
  // neutral. Return linear RGB.
  return [lum * 1.0, lum * 1.0, lum * (lum > 1 ? 1.04 : 1.02)];
}

// ── float → RGBE ──────────────────────────────────────────────────────
function toRGBE(r, g, b, out, o) {
  const v = Math.max(r, g, b);
  if (v < 1e-32) {
    out[o] = out[o + 1] = out[o + 2] = out[o + 3] = 0;
    return;
  }
  const e = Math.ceil(Math.log2(v));
  const scale = Math.pow(2, -e) * 256;
  out[o] = Math.min(255, Math.max(0, Math.floor(r * scale)));
  out[o + 1] = Math.min(255, Math.max(0, Math.floor(g * scale)));
  out[o + 2] = Math.min(255, Math.max(0, Math.floor(b * scale)));
  out[o + 3] = e + 128;
}

// ── new-style RLE scanline (Radiance) ─────────────────────────────────
function writeScanlineRLE(bytes, chans, width) {
  bytes.push(2, 2, (width >> 8) & 0xff, width & 0xff);
  for (const ch of chans) {
    let cur = 0;
    while (cur < width) {
      // Locate the next run of >= 4 identical bytes.
      let runStart = cur;
      let runLen = 0;
      while (runStart < width) {
        runLen = 1;
        while (runStart + runLen < width && runLen < 127 && ch[runStart + runLen] === ch[runStart]) runLen++;
        if (runLen >= 4) break;
        runStart += runLen;
        runLen = 0;
      }
      // Emit literals up to the run.
      while (cur < runStart) {
        const n = Math.min(128, runStart - cur);
        bytes.push(n);
        for (let k = 0; k < n; k++) bytes.push(ch[cur + k]);
        cur += n;
      }
      // Emit the run.
      if (runLen >= 4) {
        bytes.push(128 + runLen);
        bytes.push(ch[runStart]);
        cur = runStart + runLen;
      }
    }
  }
}

const header = `#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y ${H} +X ${W}\n`;
const bytes = [];
for (const c of header) bytes.push(c.charCodeAt(0));

const rowRGBE = new Uint8Array(W * 4);
const chR = new Uint8Array(W);
const chG = new Uint8Array(W);
const chB = new Uint8Array(W);
const chE = new Uint8Array(W);

for (let y = 0; y < H; y++) {
  const v = (y + 0.5) / H;
  for (let x = 0; x < W; x++) {
    const u = (x + 0.5) / W;
    const [r, g, b] = radiance(u, v);
    toRGBE(r, g, b, rowRGBE, x * 4);
    chR[x] = rowRGBE[x * 4];
    chG[x] = rowRGBE[x * 4 + 1];
    chB[x] = rowRGBE[x * 4 + 2];
    chE[x] = rowRGBE[x * 4 + 3];
  }
  writeScanlineRLE(bytes, [chR, chG, chB, chE], W);
}

fs.writeFileSync(OUT, Buffer.from(bytes));
console.log(`✓ studio-env.hdr  ${W}×${H}  ${(bytes.length / 1024).toFixed(0)} KB`);
