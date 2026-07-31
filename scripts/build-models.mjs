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
//   ppf_roof          — roof + A-pillars / roofline
//   ppf_rocker        — rockers + lower doors
//   ppf_side          — door skins (full-wrap only)
//   ppf_rear          — everything aft of the cabin (full-wrap only)
//
// Unlike glass, PPF zones are split PER-TRIANGLE rather than per connected
// component: a "partial hood" really is a straight cut across the middle of
// one panel, which is exactly how the film is laid in the real world.
//
// Debug: COLOR_ZONES=1 node scripts/build-models.mjs paints each zone a
// loud color so the split can be verified visually.
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
    ppfCuts: { bumper: 0.09, hoodF: 0.21, hoodR: 0.38, rear: 0.76, high: 0.74, low: 0.42 },
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
    ppfCuts: { bumper: 0.10, hoodF: 0.22, hoodR: 0.36, rear: 0.80, high: 0.76, low: 0.46 },
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
    ppfCuts: { bumper: 0.10, hoodF: 0.20, hoodR: 0.32, rear: 0.66, high: 0.78, low: 0.42 },
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
    ppfCuts: { bumper: 0.07, hoodF: 0.16, hoodR: 0.29, rear: 0.60, high: 0.80, low: 0.48 },
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
  high: 0.72, //   above this in the cabin band is roof + A-pillars
  low: 0.30, //    below this in the cabin band is rockers + lower doors
};

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
};

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

    // ── PPF split: carve the painted body into film zones ───────────
    // Per-triangle (not per-component): the body shell is one connected
    // surface, and a real "partial front" is a straight cut across the
    // hood anyway.
    if (cfg.bodyPaint) {
      const paintPrims = [];
      for (const mesh of root.listMeshes()) {
        for (const prim of mesh.listPrimitives()) {
          if (cfg.bodyPaint.test(prim.getMaterial()?.getName() || '')) paintPrims.push({ mesh, prim });
        }
      }
      if (paintPrims.length) {
        const basePaint = paintPrims[0].prim.getMaterial();
        const c = { ...PPF_CUTS_DEFAULT, ...(cfg.ppfCuts ?? {}) };
        const lenSpan = ext[L] || 1;
        const vSpan = ext[V] || 1;
        // 0 at the nose, 1 at the tail.
        const bodyNose = (p) => {
          const f = (p - mn[L]) / lenSpan;
          return cfg.noseSign > 0 ? 1 - f : f;
        };
        // 0 at the ground, 1 at the roof.
        const bodyHigh = (p) => {
          const f = (p - mn[V]) / vSpan;
          return (cfg.upSign ?? 1) > 0 ? f : 1 - f;
        };
        const ppfZone = (nf, hf) => {
          if (nf < c.bumper) return 'ppf_bumper_f';
          if (nf < c.hoodF) return 'ppf_hood_f';
          if (nf < c.hoodR) return 'ppf_hood_r';
          if (nf > c.rear) return 'ppf_rear';
          if (hf > c.high) return 'ppf_roof';
          if (hf < c.low) return 'ppf_rocker';
          return 'ppf_side';
        };

        const paintMats = {};
        const buffer2 = root.listBuffers()[0];
        const pcounts = {};
        for (const { mesh, prim } of paintPrims) {
          const pos = prim.getAttribute('POSITION');
          const idx = prim.getIndices();
          if (!pos || !idx) continue;
          const buckets = {};
          for (let t = 0; t < idx.getCount(); t += 3) {
            const z = ppfZone(bodyNose(centroid(pos, idx, t, L)), bodyHigh(centroid(pos, idx, t, V)));
            (buckets[z] ??= []).push(idx.getScalar(t), idx.getScalar(t + 1), idx.getScalar(t + 2));
          }
          Object.keys(buckets).forEach((z, i) => {
            pcounts[z] = (pcounts[z] || 0) + buckets[z].length / 3;
            const mat = paintMats[z] ??= basePaint.clone().setName(z);
            const indices = doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(buckets[z])).setBuffer(buffer2);
            if (i === 0) prim.setIndices(indices).setMaterial(mat);
            else mesh.addPrimitive(prim.clone().setIndices(indices).setMaterial(mat));
          });
        }
        console.log('  ppf:  ', Object.entries(pcounts).map(([z, n]) => `${z.replace('ppf_', '')}=${n}`).join(' '));
      }
    }
  }

  if (COLOR_ZONES) {
    for (const mat of root.listMaterials()) {
      const c = ZONE_DEBUG_COLORS[mat.getName()];
      if (c) mat.setBaseColorFactor(c).setAlphaMode('OPAQUE');
    }
  }

  // ── Geometry + texture diet ──
  await doc.transform(
    dedup({ keepUniqueNames: true }),
    prune(),
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: cfg.simplifyRatio, error: 0.0008 }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024] }),
    draco()
  );

  await io.write(outAbs, doc);
  const after = fs.statSync(outAbs).size;
  console.log(`✓ ${vehicle}.glb  ${(before / 1e6).toFixed(1)}MB → ${(after / 1e6).toFixed(2)}MB${COLOR_ZONES ? '  [ZONE DEBUG COLORS]' : ''}`);
}
console.log('\nDone. Optimized models in public/models3d/');
