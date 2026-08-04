// Optimizes the raw 3D car models (assets-src/models3d-src) into lean,
// tint-ready GLBs at public/models3d/<vehicle>.glb.
//
// Cars keep their ORIGINAL factory colors (base-color textures stay,
// recompressed to WebP 1024px; detail maps dropped with explicit PBR
// factors so nothing goes pastel). Window glass becomes real-looking
// mirror glass, split into TINT ZONES so the visualizer can darken each
// coverage zone independently:
//
//   glass_visor       — the whole windshield (front-glass sun tint)
//   glass_front       — front door windows
//   glass_rearside    — rear door windows + quarters
//   glass_rearwin     — rear window
//   glass_lamps       — head/tail-light lenses, never tinted
//
// The body paint is likewise silver-grey and split into PPF ZONES so the
// visualizer can shade each paint-protection package independently:
//
//   ppf_bumper_f      — front bumper
//   ppf_hood_f        — leading section of hood + fender fronts (partial)
//   ppf_hood_r        — remainder of hood/fenders up to the windshield
//   ppf_mirror        — mirror caps (wrapped from partial front up)
//   ppf_roof          — roof + A-pillars / roofline
//   ppf_rocker        — sill + lower doors, wrapping the rear wheel arch
//   ppf_side          — door skins (full-wrap only)
//   ppf_rear          — everything aft of the cabin (full-wrap only)
//
// Unlike glass, PPF zones are cut by CLIPPING triangles against each zone
// plane rather than sorting whole triangles into buckets: a "partial hood"
// really is a straight cut across the middle of one panel, and bucketing
// leaves the edge following the mesh topology instead of a line.
//
// Debug: COLOR_ZONES=1 paints the glass zones, PPF_ZONES=1 paints the body
// zones (and greys the glass out) so each split can be checked visually.
//
// Run: node scripts/build-models.mjs

import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, simplify, draco, textureCompress } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const SRC = path.join(ROOT, 'assets-src', 'models3d-src');
const OUT = path.join(ROOT, 'public', 'models3d');
const COLOR_ZONES = !!process.env.COLOR_ZONES;
// PPF_ZONES=1 paints the paint-protection zones instead, and knocks the glass
// back to a flat dark grey so it can't be mistaken for a body zone (the two
// palettes would otherwise share colours).
const PPF_ZONES = !!process.env.PPF_ZONES;

// Per model: source, how to recognize window glass, mesh simplification,
// and the zone split along the cabin-glass long axis. `noseSign` says which
// end of the long axis the nose points to (+1 = positive coordinates).
// Fractions are measured nose → tail across the cabin glass span.
// Every car is silver-grey so the green PPF shading reads clearly against it.
const BODY_SILVER = '#b9bec4';

const MODELS = {
  sedan: {
    src: '2022_bmw_m5_cs.glb',
    glass: /Window_Material$/i,
    bodyPaint: /Paint_Material$/i,
    bodyColor: BODY_SILVER,
    blackParts: /Wheel|Grille/i, // dark-gray rims + grille
    silverParts: /SpecularTint/i, // silver-grey grille trim
    simplifyRatio: 0.6,
    noseSign: +1,
    upSign: +1,
    // Raw pane noseFracs (0=nose): tiny front-glass bits ~0.02-0.04,
    // windshield ~0.38, front door ~0.48, rear door ~0.63, rear quarter
    // ~0.73, rear window ~0.83, tail-light lenses ~0.93-0.97. lampFront trims
    // the front bits, lampRear trims the tail-light lenses (both sit high
    // enough to dodge the beltline test but must never tint); cuts are
    // rescaled to keep every real window's zone identical.
    zoneCuts: { ws: 0.38, front: 0.55, rearside: 0.89 },
    lampFrontFrac: 0.15, lampRearFrac: 0.12,
    // hoodR stops short of the front door shut line so the front end never
    // laps onto the door. roofStart is the windshield base (glass_visor
    // starts at 0.311), keeping the roof zone off the hood bulges.
    // rockerEnd carries the sill past the rear wheel arch.
    ppfCuts: {
      bumper: 0.09, hoodF: 0.21, hoodR: 0.31, rear: 0.76,
      high: 0.74, low: 0.36, roofStart: 0.31,
      rockerEnd: 0.88,
    },
  },
  suv: {
    src: '2023-lamborghini-urus-performante/source/2023_lamborghini_urus_performante.glb',
    glass: /Window_Material$/i,
    bodyPaint: /Paint_Material$/i,
    bodyColor: BODY_SILVER,
    simplifyRatio: 0.6,
    noseSign: +1,
    upSign: +1,
    // Pane noseFracs (0=nose): windshield ~0.27, front door ~0.38, rear
    // door ~0.64, rear quarter ~0.76, rear hatch ~0.94. Cuts fall between
    // panes: windshield→visor, front door→front, rear door+quarter→rearside,
    // rear hatch→rearwin.
    zoneCuts: { ws: 0.33, front: 0.5, rearside: 0.83 },
    lampFrontFrac: 0.16, lampRearFrac: 0.08,
    // hoodR/roofStart sit at the windshield base (glass_visor starts 0.295).
    ppfCuts: {
      bumper: 0.10, hoodF: 0.22, hoodR: 0.295, rear: 0.80,
      high: 0.76, low: 0.47, roofStart: 0.295,
      rockerEnd: 0.88,
    },
  },
  sport: {
    src: '2020-porsche-718-cayman-gt4/source/2020_porsche_718_cayman_gt4.glb',
    glass: /Window_Material$/i,
    bodyPaint: /Paint_Material$/i,
    bodyColor: BODY_SILVER,
    simplifyRatio: 0.75,
    noseSign: +1,
    upSign: +1,
    // Two-door. Pane noseFracs (0=nose): windshield ~0.26, door window
    // ~0.48, rear quarter light ~0.70, rear window ~0.91. front/rearside cut
    // at 0.6 splits the big door window (front-side) from the small quarter
    // behind it (rear-side).
    zoneCuts: { ws: 0.4, front: 0.6, rearside: 0.88 },
    lampFrontFrac: 0.18, lampRearFrac: 0.13,
    // Mid-engine: short frunk up front, engine deck from ~0.66 back.
    // hoodR/roofStart sit at the windshield base (glass_visor starts 0.320).
    ppfCuts: {
      bumper: 0.10, hoodF: 0.20, hoodR: 0.32, rear: 0.66,
      high: 0.78, low: 0.36, roofStart: 0.32,
      rockerEnd: 0.76,
    },
  },
  truck: {
    src: '2021-ram-1500-trx/source/ram1500trx.glb',
    glass: /Window_Material$/i,
    bodyPaint: /Paint_Material$/i,
    bodyColor: BODY_SILVER,
    blackParts: /Wheel|Grille/i,
    simplifyRatio: 0.6,
    noseSign: +1,
    upSign: +1,
    // Pane noseFracs (0=nose): windshield ~0.02-0.13 (centred), front door
    // ~0.18-0.25 (sides), rear door ~0.41-0.48 (sides), 3-piece rear cab
    // window ~0.555, tail glass ~1.0. rearside cut at 0.52 keeps the rear
    // doors as rear-side and sends the cab backlight to rear-window.
    zoneCuts: { ws: 0.15, front: 0.33, rearside: 0.52 },
    lampFrontFrac: 0, lampRearFrac: 0,
    // Crew cab: short hood, cab to ~0.60, bed + tailgate behind that.
    // roofStart sits at the windshield base (glass_visor starts 0.228), but
    // hoodR (full-front cutoff) must stop short of the front door, which
    // starts at ~0.18 — 0.235 used to land inside the door's own glass span
    // and let "full front" bleed onto the door skin.
    ppfCuts: {
      bumper: 0.07, hoodF: 0.16, hoodR: 0.175, rear: 0.60,
      high: 0.80, low: 0.50, roofStart: 0.228,
      rockerEnd: 0.70,
    },
  },
};

// Real-glass look per shade: mirror-smooth metallic surface (strong
// environment reflections) whose body darkens with the film's VLT.
// The visualizer holds the same table for runtime zone toggling.
// Alpha = how opaque the film reads. Kept intentionally below full opacity
// on every shade (even Dark) so part of the interior stays visible through
// the glass — real automotive film darkens the cabin but never hides it
// completely. The RGB still darkens per VLT, so darker shades tint the
// interior you see rather than blacking it out.
export const GLASS_LOOK = {
  clear: [0.8, 0.84, 0.88, 0.08],
  light: [0.5, 0.54, 0.58, 0.22],
  medium: [0.17, 0.19, 0.21, 0.36],
  dark: [0.02, 0.024, 0.03, 0.5],
};
// Hex sRGB → linear RGBA (glTF baseColorFactor is linear).
function hexToLinear(hex) {
  const s = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const n = parseInt(hex.replace('#', ''), 16);
  return [s(((n >> 16) & 255) / 255), s(((n >> 8) & 255) / 255), s((n & 255) / 255), 1];
}

// Glass is dielectric: reflections should come from Fresnel (strong at
// grazing angles, see-through face-on) — that reads as real tinted glass.
// A little metalness keeps the dark-tint "mirror" feel without going full
// chrome. Very low roughness keeps the softbox reflections crisp.
const GLASS_METALLIC = 0.35;
const GLASS_ROUGHNESS = 0.04;

// PPF body zones. `nose` cuts are fractions of the car's length measured
// nose(0) → tail(1); `high`/`low` are fractions of its height (0 = ground).
// Defaults suit a normal three-box car; per-vehicle overrides live in MODELS.
const PPF_CUTS_DEFAULT = {
  bumper: 0.10, // nose → here is the front bumper
  hoodF: 0.22, //  bumper → here is the "partial front" hood/fender strip
  hoodR: 0.40, //  → here is the rest of the hood, ending at the windshield
  rear: 0.78, //   from here back is rear quarters/bumper/trunk
  high: 0.72, //   above this, from roofStart back, is roof + A-pillars
  low: 0.30, //    below this is rockers + lower doors
  // Nothing ahead of this can be "roof". Without it a raised hood bulge
  // clears the `high` line and gets taken by the roof zone, which puts a
  // stray patch in the middle of the hood and breaks the straight cut.
  // Set it at the base of the windshield.
  roofStart: 0.32,
  // The rocker panel begins at the front door, so the fender keeps its own
  // lower rear corner instead of losing it to the sill. Defaults to hoodR.
  // It ends well behind `rear`, wrapping the rear wheel arch; defaults to
  // rear + 0.06.
  rockerStart: undefined,
  rockerEnd: undefined,
};

// Mirror caps are not part of the paint mesh on these models (they're carbon
// or trim), but they are wrapped in every package from partial front up. They
// are reliably the widest thing on the car: the paint tops out around 0.89 of
// the half-width while the caps reach ~1.0, so a lateral threshold isolates
// them cleanly. Bounds keep the test off the door skins and wheel arches.
const MIRROR = { lat: 0.93, nfLo: 0.30, nfHi: 0.58, hfLo: 0.55, hfHi: 0.85 };

// Paint zone colors: silver body, green where film is applied. The green
// matches the accent used across the site's tint previews.
export const PPF_LOOK = {
  bare: hexToLinear(BODY_SILVER),
  covered: hexToLinear('#13b545'),
};

const ZONE_DEBUG_COLORS = {
  glass_windshield: [1, 0, 0, 1],
  glass_visor: [1, 1, 0, 1],
  glass_front: [0, 1, 0, 1],
  glass_rearside: [0, 0, 1, 1],
  glass_rearwin: [1, 0, 1, 1],
  glass_lamps: [1, 0.5, 0, 1],
  ppf_bumper_f: [1, 0, 0, 1],
  ppf_hood_f: [1, 0.55, 0, 1],
  ppf_hood_r: [1, 1, 0, 1],
  ppf_roof: [0, 0.8, 1, 1],
  ppf_rocker: [0.6, 0, 1, 1],
  ppf_side: [0, 1, 0.3, 1],
  ppf_rear: [1, 0, 0.8, 1],
  ppf_mirror: [0, 0, 1, 1],
};

// ── PPF zone carving ────────────────────────────────────────────────
// The film's edges are straight lines on a real car, so the zones can't be
// assigned per whole triangle — that leaves a ragged boundary that follows
// the mesh topology. Instead every triangle crossing a zone plane is clipped
// against it, producing new vertices exactly on the line.
//
// All zone boundaries are axis-aligned planes (a station along the car's
// length, or a height), which keeps the clipping to a simple 1D test.

// Split a polygon by an axis-aligned plane. Returns [below, above]; either
// may be empty. Vertices are {p:[3], n:[3], t:[2]}.
function clipPolygon(poly, axis, value) {
  const below = [], above = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const da = a.p[axis] - value;
    const db = b.p[axis] - value;
    if (da <= 0) below.push(a);
    if (da >= 0) above.push(a);
    if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
      const s = da / (da - db);
      const m = {
        p: [0, 1, 2].map((k) => a.p[k] + (b.p[k] - a.p[k]) * s),
        n: a.n && b.n ? [0, 1, 2].map((k) => a.n[k] + (b.n[k] - a.n[k]) * s) : null,
        t: a.t && b.t ? [0, 1].map((k) => a.t[k] + (b.t[k] - a.t[k]) * s) : null,
      };
      if (m.n) {
        const L = Math.hypot(...m.n) || 1;
        m.n = m.n.map((v) => v / L);
      }
      below.push(m);
      above.push(m);
    }
  }
  return [below, above];
}

function splitPpfZones(doc, cfg) {
  if (!cfg.bodyPaint) return;
  const root = doc.getRoot();

  // Model axes: longest bbox axis = longitudinal, smallest = vertical.
  let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
  for (const mesh of root.listMeshes()) for (const p of mesh.listPrimitives()) {
    const pos = p.getAttribute('POSITION');
    if (!pos) continue;
    const a = pos.getMin([]), b = pos.getMax([]);
    for (let i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], a[i]); mx[i] = Math.max(mx[i], b[i]); }
  }
  const ext = [mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]];
  const L = ext.indexOf(Math.max(...ext));
  const V = ext.indexOf(Math.min(...ext));

  const paintPrims = [];
  for (const mesh of root.listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      if (cfg.bodyPaint.test(prim.getMaterial()?.getName() || '')) paintPrims.push({ mesh, prim });
    }
  }
  if (!paintPrims.length) return;

  const c = { ...PPF_CUTS_DEFAULT, ...(cfg.ppfCuts ?? {}) };
  const rockerStart = c.rockerStart ?? c.hoodR;
  const rockerEnd = c.rockerEnd ?? c.rear + 0.06;
  const noseUp = cfg.noseSign > 0;
  const upPos = (cfg.upSign ?? 1) > 0;
  // Convert a nose fraction (0 = nose) / height fraction (0 = ground) into a
  // world coordinate on the relevant axis.
  const noseToWorld = (f) => (noseUp ? mn[L] + (1 - f) * ext[L] : mn[L] + f * ext[L]);
  const highToWorld = (f) => (upPos ? mn[V] + f * ext[V] : mn[V] + (1 - f) * ext[V]);
  const noseOf = (p) => (noseUp ? 1 - (p - mn[L]) / ext[L] : (p - mn[L]) / ext[L]);
  const highOf = (p) => (upPos ? (p - mn[V]) / ext[V] : 1 - (p - mn[V]) / ext[V]);

  const zoneOf = (nf, hf) => {
    // Roof first: the A-pillars sit directly above the cowl, so testing the
    // hood by length alone would sweep them into the front-end zones and a
    // "full front" would run up the pillar to the roof. Gated on roofStart
    // so a raised hood bulge can't be mistaken for roof.
    if (hf > c.high && nf > c.roofStart) return 'ppf_roof';
    // Sill next, and before the rear cut, so the strip carries on past the
    // doors and wraps the front of the rear wheel arch.
    if (hf < c.low && nf > rockerStart && nf < rockerEnd) return 'ppf_rocker';
    if (nf < c.bumper) return 'ppf_bumper_f';
    if (nf < c.hoodF) return 'ppf_hood_f';
    if (nf < c.hoodR) return 'ppf_hood_r';
    if (nf > c.rear) return 'ppf_rear';
    return 'ppf_side';
  };

  // Every plane any zone boundary can lie on.
  const planes = [
    ...[c.bumper, c.hoodF, c.hoodR, c.rear, rockerStart, rockerEnd, c.roofStart]
      .map((f) => ({ axis: L, value: noseToWorld(f) })),
    ...[c.low, c.high].map((f) => ({ axis: V, value: highToWorld(f) })),
  ];

  const basePaint = paintPrims[0].prim.getMaterial();
  const buffer = root.listBuffers()[0];
  const mats = {};
  const out = {}; // zone → { p:[], n:[], t:[] }
  const counts = {};
  let hasN = false, hasT = false;

  for (const { prim } of paintPrims) {
    const pos = prim.getAttribute('POSITION');
    const nrm = prim.getAttribute('NORMAL');
    const uv = prim.getAttribute('TEXCOORD_0');
    const idx = prim.getIndices();
    if (!pos || !idx) continue;
    if (nrm) hasN = true;
    if (uv) hasT = true;

    for (let t = 0; t < idx.getCount(); t += 3) {
      let polys = [[0, 1, 2].map((k) => {
        const vi = idx.getScalar(t + k);
        return {
          p: pos.getElement(vi, [0, 0, 0]),
          n: nrm ? nrm.getElement(vi, [0, 0, 0]) : null,
          t: uv ? uv.getElement(vi, [0, 0]) : null,
        };
      })];
      for (const pl of planes) {
        const next = [];
        for (const poly of polys) {
          const [lo, hi] = clipPolygon(poly, pl.axis, pl.value);
          if (lo.length >= 3) next.push(lo);
          if (hi.length >= 3) next.push(hi);
        }
        polys = next;
      }
      for (const poly of polys) {
        let cl = 0, cv = 0;
        for (const v of poly) { cl += v.p[L]; cv += v.p[V]; }
        const z = zoneOf(noseOf(cl / poly.length), highOf(cv / poly.length));
        const o = out[z] ??= { p: [], n: [], t: [] };
        // Fan-triangulate the fragment.
        for (let k = 1; k < poly.length - 1; k++) {
          for (const v of [poly[0], poly[k], poly[k + 1]]) {
            o.p.push(v.p[0], v.p[1], v.p[2]);
            if (v.n) o.n.push(v.n[0], v.n[1], v.n[2]);
            if (v.t) o.t.push(v.t[0], v.t[1]);
          }
          counts[z] = (counts[z] || 0) + 1;
        }
      }
    }
  }

  // Rebuild: the first paint primitive becomes the first zone, the rest are
  // added alongside it; any leftover paint primitives are dropped.
  const host = paintPrims[0].mesh;
  for (const { mesh, prim } of paintPrims) mesh.removePrimitive(prim);

  for (const [z, o] of Object.entries(out)) {
    const prim = doc.createPrimitive().setMaterial(mats[z] ??= basePaint.clone().setName(z));
    prim.setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(o.p)).setBuffer(buffer));
    if (hasN && o.n.length) prim.setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(o.n)).setBuffer(buffer));
    if (hasT && o.t.length) prim.setAttribute('TEXCOORD_0', doc.createAccessor().setType('VEC2').setArray(new Float32Array(o.t)).setBuffer(buffer));
    host.addPrimitive(prim);
  }
  console.log('  ppf:  ', Object.entries(counts).map(([z, n]) => `${z.replace('ppf_', '')}=${n}`).join(' '));

  // ── Mirror caps ───────────────────────────────────────────────────
  // Not paint, so they survived the split above with their original trim
  // material. Pull the two cap components out onto their own zone so they
  // wrap along with the front end.
  const A = [0, 1, 2].find((i) => i !== L && i !== V);
  const latMid = mn[A] + ext[A] / 2;
  const halfW = (ext[A] / 2) || 1;
  const mirrorMat = basePaint.clone().setName('ppf_mirror');
  let mirrorTris = 0;

  for (const mesh of root.listMeshes()) {
    for (const prim of [...mesh.listPrimitives()]) {
      const name = prim.getMaterial()?.getName() || '';
      // Skip glass (the mirror's own reflective face) and anything already zoned.
      if (name.startsWith('glass_') || name.startsWith('ppf_')) continue;
      const pos = prim.getAttribute('POSITION');
      const idx = prim.getIndices();
      if (!pos || !idx) continue;
      const triCount = idx.getCount() / 3;

      // Union-find over triangles sharing vertices → connected components.
      const parent = new Int32Array(triCount).fill(-1);
      const find = (a) => { while (parent[a] >= 0) a = parent[a]; return a; };
      const owner = new Map();
      for (let t = 0; t < triCount; t++) {
        for (let k = 0; k < 3; k++) {
          const vi = idx.getScalar(t * 3 + k);
          if (owner.has(vi)) { const a = find(owner.get(vi)), b = find(t); if (a !== b) parent[b] = a; }
          else owner.set(vi, t);
        }
      }
      const stats = new Map();
      for (let t = 0; t < triCount; t++) {
        const c2 = find(t);
        const o = stats.get(c2) ?? (stats.set(c2, { n: 0, nf: 0, hf: 0, lat: 0 }), stats.get(c2));
        for (let k = 0; k < 3; k++) {
          const v = pos.getElement(idx.getScalar(t * 3 + k), [0, 0, 0]);
          o.nf += noseOf(v[L]);
          o.hf += highOf(v[V]);
          o.lat = Math.max(o.lat, Math.abs(v[A] - latMid) / halfW);
        }
        o.n += 3;
      }
      const isMirror = new Set();
      for (const [c2, o] of stats) {
        const nf = o.nf / o.n, hf = o.hf / o.n;
        if (o.lat >= MIRROR.lat && nf >= MIRROR.nfLo && nf <= MIRROR.nfHi && hf >= MIRROR.hfLo && hf <= MIRROR.hfHi) {
          isMirror.add(c2);
        }
      }
      if (!isMirror.size) continue;

      const keep = [], take = [];
      for (let t = 0; t < triCount; t++) {
        (isMirror.has(find(t)) ? take : keep).push(idx.getScalar(t * 3), idx.getScalar(t * 3 + 1), idx.getScalar(t * 3 + 2));
      }
      if (!take.length) continue;
      mirrorTris += take.length / 3;
      const mk = (arr) => doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(arr)).setBuffer(buffer);
      mesh.addPrimitive(prim.clone().setIndices(mk(take)).setMaterial(mirrorMat));
      if (keep.length) prim.setIndices(mk(keep));
      else mesh.removePrimitive(prim);
    }
  }
  if (mirrorTris) console.log(`  mirror: ${mirrorTris} tris`);
  else console.log('  mirror: none found');
}

const io = new NodeIO()
  .registerExtensions(KHRONOS_EXTENSIONS)
  .registerDependencies({
    'draco3d.decoder': await draco3d.createDecoderModule(),
    'draco3d.encoder': await draco3d.createEncoderModule(),
  });

fs.mkdirSync(OUT, { recursive: true });

for (const [vehicle, cfg] of Object.entries(MODELS)) {
  const srcAbs = path.join(SRC, cfg.src);
  const outAbs = path.join(OUT, `${vehicle}.glb`);
  const before = fs.statSync(srcAbs).size;
  const doc = await io.read(srcAbs);
  const root = doc.getRoot();

  // ── Materials: keep original colors, fix PBR factors, prep glass ──
  for (const mat of root.listMaterials()) {
    const name = mat.getName() || '';
    const hadMR = !!mat.getMetallicRoughnessTexture();
    mat.setMetallicRoughnessTexture(null);
    mat.setNormalTexture(null);
    mat.setOcclusionTexture(null);
    mat.setEmissiveTexture(null);

    if (cfg.glass.test(name)) {
      mat.setBaseColorTexture(null);
      mat.setBaseColorFactor(GLASS_LOOK.clear);
      mat.setAlphaMode('BLEND');
      mat.setMetallicFactor(GLASS_METALLIC);
      mat.setRoughnessFactor(GLASS_ROUGHNESS);
      mat.setDoubleSided(true);
      for (const ext of mat.listExtensions()) ext.dispose();
    } else if (/paint|coloured/i.test(name)) {
      // Automotive paint is a dielectric base under a glossy clearcoat, NOT
      // bare metal: keep metalness low so colour stays rich instead of going
      // chrome/plasticky, and let a smooth-ish clearcoat carry the HDR
      // reflections. (High metalness here looked like anodized metal.)
      mat.setMetallicFactor(0.1);
      mat.setRoughnessFactor(0.32);
      if (cfg.bodyColor && cfg.bodyPaint?.test(name)) {
        mat.setBaseColorTexture(null);
        mat.setBaseColorFactor(hexToLinear(cfg.bodyColor));
      }
    } else if (cfg.blackParts?.test(name)) {
      mat.setBaseColorTexture(null);
      mat.setBaseColorFactor(hexToLinear('#3a3a3a'));
      mat.setMetallicFactor(0.6);
      mat.setRoughnessFactor(0.28);
    } else if (cfg.silverParts?.test(name)) {
      mat.setBaseColorTexture(null);
      mat.setBaseColorFactor(hexToLinear('#5c6065'));
      mat.setMetallicFactor(0.9);
      mat.setRoughnessFactor(0.25);
    } else if (/chrome|crome/i.test(name)) {
      mat.setMetallicFactor(1);
      mat.setRoughnessFactor(0.12);
    } else if (hadMR || mat.getMetallicFactor() === 1) {
      mat.setMetallicFactor(0.1);
      mat.setRoughnessFactor(0.55);
    }

    // FBX import tags many solid parts as BLEND, which disables depth-write
    // and renders them see-through (e.g. the RAM's wheels/tyres). Force
    // OPAQUE for any non-glass material that is fully opaque; keep genuine
    // translucency (lamp lenses, alpha-decal badges) on BLEND.
    if (!cfg.glass.test(name) && mat.getAlphaMode() === 'BLEND' && (mat.getBaseColorFactor()[3] ?? 1) >= 0.99) {
      mat.setAlphaMode('OPAQUE');
    }
  }

  // ── Glass vertex colors: near-zero alpha makes BLEND glass invisible ──
  for (const mesh of root.listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const n = prim.getMaterial()?.getName() || '';
      if (!cfg.glass.test(n)) continue;
      const c = prim.getAttribute('COLOR_0');
      if (c) prim.setAttribute('COLOR_0', null);
    }
  }

  // ── Named lamp meshes (truck): whole meshes that are light lenses ──
  const isGlassName = (n) => cfg.glass.test(n || '');
  const mkGlassMat = (base, name) => base.clone().setName(name);
  let lampMat = null;
  if (cfg.lampMeshes?.length) {
    for (const mesh of root.listMeshes()) {
      if (!cfg.lampMeshes.includes(mesh.getName())) continue;
      for (const prim of mesh.listPrimitives()) {
        const mat = prim.getMaterial();
        if (!mat || !isGlassName(mat.getName())) continue;
        lampMat ??= mkGlassMat(mat, 'glass_lamps');
        prim.setMaterial(lampMat);
      }
    }
  }

  if (cfg.stripVertexColors) {
    for (const mesh of root.listMeshes()) {
      for (const prim of mesh.listPrimitives()) {
        const c = prim.getAttribute('COLOR_0');
        if (c) prim.setAttribute('COLOR_0', null);
      }
    }
  }

  // ── Zone split ────────────────────────────────────────────────────
  // Model axes: longest bbox axis = longitudinal, smallest = vertical.
  {
    let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
    for (const mesh of root.listMeshes()) for (const p of mesh.listPrimitives()) {
      const pos = p.getAttribute('POSITION');
      if (!pos) continue;
      const a = pos.getMin([]), b = pos.getMax([]);
      for (let i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], a[i]); mx[i] = Math.max(mx[i], b[i]); }
    }
    const ext = [mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]];
    const L = ext.indexOf(Math.max(...ext)); // longitudinal
    const V = ext.indexOf(Math.min(...ext)); // vertical
    const vMid = mn[V] + ext[V] * 0.5;
    const up = cfg.upSign ?? 1;

    // Average of a triangle's three vertices along one axis. Shared by the
    // glass and PPF splits below.
    const centroid = (pos, idx, t, axis) => {
      const v = [0, 0, 0];
      let c = 0;
      for (let k = 0; k < 3; k++) c += pos.getElement(idx.getScalar(t + k), v)[axis];
      return c / 3;
    };

    // Collect glass primitives (excluding named lamps).
    const glassPrims = [];
    for (const mesh of root.listMeshes()) {
      for (const prim of mesh.listPrimitives()) {
        const n = prim.getMaterial()?.getName() || '';
        if (isGlassName(n) && n !== 'glass_lamps') glassPrims.push({ mesh, prim });
      }
    }
    if (glassPrims.length) {
      const baseMat = glassPrims[0].prim.getMaterial();

      // Pass 1: lamp lenses = glass triangles below the vertical midline
      // (cabin glass sits above the beltline). Also find the cabin span.
      const tri = { lamp: [], cabin: [] };
      let cMin = 1e9, cMax = -1e9;
      for (const { prim } of glassPrims) {
        const pos = prim.getAttribute('POSITION');
        const idx = prim.getIndices();
        for (let t = 0; t < idx.getCount(); t += 3) {
          if ((centroid(pos, idx, t, V) - vMid) * up < 0) continue;
          const c = centroid(pos, idx, t, L);
          if (c < cMin) cMin = c;
          if (c > cMax) cMax = c;
        }
      }
      const span = cMax - cMin;

      // On the Forza rips the light lenses share the window material AND sit
      // high (above the beltline), so height alone cannot catch them. They DO
      // sit at the absolute longitudinal extremes of the glass span, separated
      // from the cabin by hood and trunk — trim those extremes off as lamps,
      // then band the remaining cabin span into zones.
      const cuts = cfg.zoneCuts;
      const rawNoseFrac = (c) => {
        const f = (c - cMin) / span;
        return cfg.noseSign > 0 ? 1 - f : f; // 0 at the nose
      };
      const lampFront = cfg.lampFrontFrac ?? 0;
      const lampRear = cfg.lampRearFrac ?? 0;
      // Cabin span in nose-fraction terms: [lampFront, 1 - lampRear].
      const cabinLen = 1 - lampFront - lampRear;
      const noseFrac = (c) => (rawNoseFrac(c) - lampFront) / cabinLen;
      const isLampFrac = (c) => {
        const f = rawNoseFrac(c);
        return f < lampFront || f > 1 - lampRear;
      };

      // Pass 2: find the REAL panes. Each physical pane (a door window, the
      // windshield, the rear glass, a lamp lens) is a connected component of
      // the glass mesh — triangles sharing vertices. Zoning whole components
      // instead of individual triangles means the tint never cuts mid-pane.
      // The whole windshield is the "visor" zone (front-glass sun tint) — a
      // clean full pane, no ragged top-strip split.
      const zoneOfPoint = (vC, cL) => {
        if ((vC - vMid) * up < 0) return 'glass_lamps';
        if (isLampFrac(cL)) return 'glass_lamps';
        const f = noseFrac(cL);
        if (f < cuts.ws) return 'glass_visor';
        if (f < cuts.front) return 'glass_front';
        if (f < cuts.rearside) return 'glass_rearside';
        return 'glass_rearwin';
      };
      const zoneMats = {};
      const buffer = root.listBuffers()[0];
      let counts = {};
      for (const { mesh, prim } of glassPrims) {
        const pos = prim.getAttribute('POSITION');
        const idx = prim.getIndices();
        const triCount = idx.getCount() / 3;

        // Union-find over triangles via shared vertex indices.
        const parent = new Int32Array(triCount).fill(-1);
        const find = (a) => { while (parent[a] >= 0) a = parent[a]; return a; };
        const union = (a, b) => {
          a = find(a); b = find(b);
          if (a !== b) parent[b] = a;
        };
        const vertOwner = new Map();
        for (let t = 0; t < triCount; t++) {
          for (let k = 0; k < 3; k++) {
            const vi = idx.getScalar(t * 3 + k);
            if (vertOwner.has(vi)) union(vertOwner.get(vi), t);
            else vertOwner.set(vi, t);
          }
        }

        // Assign each connected component to ONE zone by its centroid. The
        // real panes overlap along the car's length (the windshield is raked
        // back over the front doors), so per-triangle zoning slices a pane
        // where the zone planes cross it. Zoning by the whole component's
        // centroid keeps every physical pane intact — a front door window is
        // all "front", never part windshield/visor.
        const compCentroid = new Map(); // comp → { v, l, n }
        for (let t = 0; t < triCount; t++) {
          const c = find(t);
          const o = compCentroid.get(c) ?? (compCentroid.set(c, { v: 0, l: 0, n: 0 }), compCentroid.get(c));
          o.v += centroid(pos, idx, t * 3, V);
          o.l += centroid(pos, idx, t * 3, L);
          o.n++;
        }
        const compZone = new Map();
        for (const [c, o] of compCentroid) compZone.set(c, zoneOfPoint(o.v / o.n, o.l / o.n));

        // Bucket triangles by their COMPONENT's zone.
        const buckets = {};
        for (let t = 0; t < triCount; t++) {
          const z = compZone.get(find(t));
          (buckets[z] ??= []).push(idx.getScalar(t * 3), idx.getScalar(t * 3 + 1), idx.getScalar(t * 3 + 2));
        }
        const zones = Object.keys(buckets);
        zones.forEach((z, i) => {
          counts[z] = (counts[z] || 0) + buckets[z].length / 3;
          let mat;
          if (z === 'glass_lamps') mat = lampMat ??= mkGlassMat(baseMat, 'glass_lamps');
          else mat = zoneMats[z] ??= mkGlassMat(baseMat, z);
          const indices = doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(buckets[z])).setBuffer(buffer);
          if (i === 0) {
            prim.setIndices(indices).setMaterial(mat);
          } else {
            mesh.addPrimitive(prim.clone().setIndices(indices).setMaterial(mat));
          }
        });
      }
      console.log('  zones:', Object.entries(counts).map(([z, n]) => `${z.replace('glass_', '')}=${n}`).join(' '));
    }

  }

  // ── Geometry + texture diet ──
  await doc.transform(
    dedup({ keepUniqueNames: true }),
    prune(),
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: cfg.simplifyRatio, error: 0.0008 }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024] })
  );

  // PPF zones are carved AFTER simplification, because simplifying a mesh
  // that is already split drags the boundary vertices around and leaves the
  // cut lines rippling.
  splitPpfZones(doc, cfg);

  if (COLOR_ZONES || PPF_ZONES) {
    for (const mat of root.listMaterials()) {
      const name = mat.getName();
      const isPpf = name.startsWith('ppf_');
      const isGlass = name.startsWith('glass_');
      if (PPF_ZONES && isGlass) {
        mat.setBaseColorFactor([0.05, 0.05, 0.06, 1]).setAlphaMode('OPAQUE');
        continue;
      }
      if (PPF_ZONES && !isPpf) continue;
      if (COLOR_ZONES && !PPF_ZONES && isPpf) continue;
      const c = ZONE_DEBUG_COLORS[name];
      if (c) mat.setBaseColorFactor(c).setAlphaMode('OPAQUE');
    }
  }

  await doc.transform(weld(), draco());
  await io.write(outAbs, doc);
  const after = fs.statSync(outAbs).size;
  console.log(`✓ ${vehicle}.glb  ${(before / 1e6).toFixed(1)}MB → ${(after / 1e6).toFixed(2)}MB${COLOR_ZONES ? '  [ZONE DEBUG COLORS]' : ''}`);
}
console.log('\nDone. Optimized models in public/models3d/');
