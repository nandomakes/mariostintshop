// Optimizes the raw 3D car models (assets-src/models3d-src) into lean,
// tint-ready GLBs at public/models3d/<vehicle>.glb.
//
// Cars keep their ORIGINAL factory colors (base-color textures stay,
// recompressed to WebP 1024px; detail maps dropped with explicit PBR
// factors so nothing goes pastel). Window glass becomes real-looking
// mirror glass, split into TINT ZONES so the visualizer can darken each
// coverage zone independently:
//
//   glass_windshield  — never tinted (legal)
//   glass_visor       — top band of the windshield
//   glass_front       — front door windows
//   glass_rearside    — rear door windows + quarters
//   glass_rearwin     — rear window
//   glass_lamps       — head/tail-light lenses, never tinted
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
const MODELS = {
  sedan: {
    src: '2022_bmw_m5_cs.glb',
    glass: /Window_Material$/i,
    bodyPaint: /Paint_Material$/i,
    bodyColor: '#13b545',
    simplifyRatio: 0.6,
    noseSign: +1,
    upSign: +1,
    zoneCuts: { ws: 0.44, front: 0.7, rearside: 0.85 },
    lampFrontFrac: 0.16, lampRearFrac: 0.08,
  },
  suv: {
    src: '2023-lamborghini-urus-performante/source/2023_lamborghini_urus_performante.glb',
    glass: /Window_Material$/i,
    simplifyRatio: 0.6,
    noseSign: +1,
    upSign: +1,
    zoneCuts: { ws: 0.44, front: 0.64, rearside: 0.85 },
    lampFrontFrac: 0.16, lampRearFrac: 0.08,
  },
  sport: {
    src: '2020-porsche-718-cayman-gt4/source/2020_porsche_718_cayman_gt4.glb',
    glass: /Window_Material$/i,
    simplifyRatio: 0.75,
    noseSign: +1,
    upSign: +1,
    // two-door: no rear side band worth splitting finely
    zoneCuts: { ws: 0.4, front: 0.75, rearside: 0.88 },
    lampFrontFrac: 0.18, lampRearFrac: 0.13,
  },
  truck: {
    src: 'ford-f150-raptor/source/Ford Raptor.glb',
    glass: /^glass/i,
    bodyPaint: /PAINT_1/i, // body only, not PAINT_2 (tyre wall)
    bodyColor: '#cc1518',
    simplifyRatio: 0.5,
    stripVertexColors: true,
    lampMeshes: ['Object_104'],
    noseSign: -1,
    upSign: -1,
    zoneCuts: { ws: 0.34, front: 0.6, rearside: 0.88 },
  },
};

// Real-glass look per shade: mirror-smooth metallic surface (strong
// environment reflections) whose body darkens with the film's VLT.
// The visualizer holds the same table for runtime zone toggling.
export const GLASS_LOOK = {
  clear: [0.8, 0.84, 0.88, 0.18],
  light: [0.5, 0.54, 0.58, 0.42],
  medium: [0.17, 0.19, 0.21, 0.66],
  dark: [0.02, 0.024, 0.03, 0.88],
};
// Hex sRGB → linear RGBA (glTF baseColorFactor is linear).
function hexToLinear(hex) {
  const s = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const n = parseInt(hex.replace('#', ''), 16);
  return [s(((n >> 16) & 255) / 255), s(((n >> 8) & 255) / 255), s((n & 255) / 255), 1];
}

const GLASS_METALLIC = 0.5;
const GLASS_ROUGHNESS = 0.03;

const ZONE_DEBUG_COLORS = {
  glass_windshield: [1, 0, 0, 1],
  glass_visor: [1, 1, 0, 1],
  glass_front: [0, 1, 0, 1],
  glass_rearside: [0, 0, 1, 1],
  glass_rearwin: [1, 0, 1, 1],
  glass_lamps: [0, 1, 1, 1],
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
      mat.setMetallicFactor(0.4);
      mat.setRoughnessFactor(0.22);
      if (cfg.bodyColor && cfg.bodyPaint?.test(name)) {
        mat.setBaseColorTexture(null);
        mat.setBaseColorFactor(hexToLinear(cfg.bodyColor));
      }
    } else if (/chrome|crome/i.test(name)) {
      mat.setMetallicFactor(1);
      mat.setRoughnessFactor(0.12);
    } else if (hadMR || mat.getMetallicFactor() === 1) {
      mat.setMetallicFactor(0.1);
      mat.setRoughnessFactor(0.55);
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
      const centroid = (pos, idx, t, axis) => {
        const v = [0, 0, 0];
        let c = 0;
        for (let k = 0; k < 3; k++) c += pos.getElement(idx.getScalar(t + k), v)[axis];
        return c / 3;
      };
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

      let wsTop = -1e9, wsBottom = 1e9; // in up-oriented coords
      for (const { prim } of glassPrims) {
        const pos = prim.getAttribute('POSITION');
        const idx = prim.getIndices();
        for (let t = 0; t < idx.getCount(); t += 3) {
          const vC = centroid(pos, idx, t, V);
          if ((vC - vMid) * up < 0) continue;
          const cL = centroid(pos, idx, t, L);
          if (isLampFrac(cL)) continue;
          const f = noseFrac(cL);
          if (f >= 0 && f < cuts.ws) {
            const vU = vC * up;
            if (vU > wsTop) wsTop = vU;
            if (vU < wsBottom) wsBottom = vU;
          }
        }
      }
      const visorLine = wsTop - (wsTop - wsBottom) * 0.3; // top 30% of windshield

      // Pass 2: find the REAL panes. Each physical pane (a door window, the
      // windshield, the rear glass, a lamp lens) is a connected component of
      // the glass mesh — triangles sharing vertices. Zoning whole components
      // instead of individual triangles means the tint never cuts mid-pane.
      const zoneOfPoint = (vC, cL) => {
        if ((vC - vMid) * up < 0) return 'glass_lamps';
        if (isLampFrac(cL)) return 'glass_lamps';
        const f = noseFrac(cL);
        if (f < cuts.ws) return 'ws'; // visor split happens per-triangle below
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

        // Vote each component's zone by its triangles' point-classification;
        // majority wins so a pane never splits across zones.
        const compVotes = new Map();
        const triZone = new Array(triCount);
        for (let t = 0; t < triCount; t++) {
          const z = zoneOfPoint(centroid(pos, idx, t * 3, V), centroid(pos, idx, t * 3, L));
          triZone[t] = z;
          const c = find(t);
          const votes = compVotes.get(c) ?? (compVotes.set(c, {}), compVotes.get(c));
          votes[z] = (votes[z] || 0) + 1;
        }
        // Majority zone per component; if a component's votes are heavily
        // mixed (panes welded together in the source), fall back to
        // per-triangle zoning for that component only.
        const compZone = new Map();
        for (const [c, votes] of compVotes) {
          const sorted = Object.entries(votes).sort((a, b) => b[1] - a[1]);
          const total = sorted.reduce((s, [, n]) => s + n, 0);
          compZone.set(c, sorted[0][1] / total >= 0.7 ? sorted[0][0] : null);
        }

        // Bucket triangles by their COMPONENT's zone. The windshield pane is
        // the one exception: it splits per-triangle at the visor line.
        const buckets = {};
        for (let t = 0; t < triCount; t++) {
          let z = compZone.get(find(t)) ?? triZone[t]; // null → mixed comp → per-tri
          if (z === 'ws') {
            const vC = centroid(pos, idx, t * 3, V);
            z = vC * up > visorLine ? 'glass_visor' : 'glass_windshield';
          }
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
