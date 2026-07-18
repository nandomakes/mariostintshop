// Optimizes the raw 3D car models (assets-src/models3d-src) into lean,
// tint-ready GLBs at public/models3d/<vehicle>.glb.
//
// Per model (cars keep their ORIGINAL factory colors):
//  - keep base-color textures, recompressed to WebP at 1024px
//  - drop normal / metallic-roughness / occlusion / emissive textures
//    (detail maps that cost megabytes and add little on a small stage)
//  - normalize window glass to clear (alphaMode BLEND, light color, no
//    baked tint, no transmission — the visualizer drives darkness at runtime)
//  - weld + simplify heavy meshes, then Draco-compress
//
// Run: node scripts/build-models.mjs

import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS, KHRMaterialsVariants } from '@gltf-transform/extensions';
import { dedup, prune, weld, simplify, draco, textureCompress } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const SRC = path.join(ROOT, 'assets-src', 'models3d-src');
const OUT = path.join(ROOT, 'public', 'models3d');

// Which source file becomes which vehicle, and how to recognize its
// paint (→ light silver) and window glass (→ clear, runtime-tintable).
// "lights" materials must never be touched (tail lights stay red, etc.).
const MODELS = {
  sedan: {
    src: '2022_bmw_m5_cs.glb',
    glass: /Window_Material$/i,
    carveLamps: true,
    simplifyRatio: 0.6,
  },
  suv: {
    src: '2023-lamborghini-urus-performante/source/2023_lamborghini_urus_performante.glb',
    glass: /Window_Material$/i,
    carveLamps: true,
    simplifyRatio: 0.6,
  },
  sport: {
    src: '2020-porsche-718-cayman-gt4/source/2020_porsche_718_cayman_gt4.glb',
    glass: /Window_Material$/i,
    carveLamps: true,
    simplifyRatio: 0.75,
  },
  truck: {
    src: 'ford-f150-raptor/source/Ford Raptor.glb',
    glass: /^glass/i,
    simplifyRatio: 0.5,
    // This rip carries broken purple vertex colors on every primitive
    // (interior, brake discs render magenta). Strip COLOR_0 entirely.
    stripVertexColors: true,
    // glass.006 also covers the headlight lenses (mesh Object_104,
    // identified by color-coding every glass primitive). They get their
    // own "glass_lamps" material so runtime tinting skips them.
    lampMeshes: ['Object_104'],
  },
};

// Window-glass looks per tint shade, baked as KHR_materials_variants.
// Runtime shade switching is then just `viewer.variantName = shade` —
// model-viewer applies variants natively, immune to the async material-sync
// races that made live setBaseColorFactor() mutations silently revert.
// The cars' interiors are near-black, so translucent-dark glass over them
// reads the same as opaque-dark glass. Clear glass therefore carries its own
// milky-light body (like film-simulator renders) so every shade step is
// visibly distinct regardless of what sits behind the pane.
const GLASS_LOOK = {
  clear: [0.62, 0.67, 0.72, 0.45],
  light: [0.4, 0.44, 0.48, 0.58],
  medium: [0.16, 0.18, 0.2, 0.74],
  dark: [0.015, 0.02, 0.026, 0.92],
};
const SHADE_T = { clear: 0, light: 1, medium: 2, dark: 3 }; // kept for iteration order
const glassRGBA = (shadeOrT) => GLASS_LOOK[typeof shadeOrT === 'string' ? shadeOrT : Object.keys(SHADE_T)[shadeOrT]] ?? GLASS_LOOK.clear;

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

  // 1. Cars keep their original look: base-color textures stay. Detail maps
  //    (normal / metallic-roughness / occlusion / emissive) are dropped —
  //    that is where most of the texture weight lives. Because dropping an
  //    MR texture leaves glTF's defaults (metallic 1 + roughness 1 = dull,
  //    washed-out "pastel" shading), every material gets explicit factors.
  for (const mat of root.listMaterials()) {
    const name = mat.getName() || '';
    const hadMR = !!mat.getMetallicRoughnessTexture();
    mat.setMetallicRoughnessTexture(null);
    mat.setNormalTexture(null);
    mat.setOcclusionTexture(null);
    mat.setEmissiveTexture(null);

    if (cfg.glass.test(name)) {
      // Real-glass look: mirror-smooth so the environment reflects off it.
      // Default state = clear; shade variants are attached further below.
      mat.setBaseColorTexture(null);
      mat.setBaseColorFactor(glassRGBA('clear'));
      mat.setAlphaMode('BLEND');
      mat.setMetallicFactor(0.35);
      mat.setRoughnessFactor(0.05);
      mat.setDoubleSided(true);
      for (const ext of mat.listExtensions()) ext.dispose();
    } else if (/paint|coloured/i.test(name)) {
      // Glossy car paint.
      mat.setMetallicFactor(0.4);
      mat.setRoughnessFactor(0.22);
    } else if (/chrome|crome/i.test(name)) {
      mat.setMetallicFactor(1);
      mat.setRoughnessFactor(0.12);
    } else if (hadMR || mat.getMetallicFactor() === 1) {
      // Generic trim/plastic/rubber: matte dielectric, keeps color saturated.
      mat.setMetallicFactor(0.1);
      mat.setRoughnessFactor(0.55);
    }
  }

  // Glass meshes in these rips carry VEC4 vertex colors whose alpha
  // multiplies the material's — with near-zero values the BLEND glass
  // renders fully invisible. Strip COLOR_0 from every glass primitive.
  for (const mesh of root.listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const n = prim.getMaterial()?.getName() || '';
      if (!cfg.glass.test(n)) continue;
      const c = prim.getAttribute('COLOR_0');
      if (c) {
        prim.setAttribute('COLOR_0', null);
        console.log(`  stripped glass vertex colors (${(mesh.getName() || '').slice(0, 40)})`);
      }
    }
  }

  if (cfg.lampMeshes?.length) {
    let lampMat = null;
    for (const mesh of root.listMeshes()) {
      if (!cfg.lampMeshes.includes(mesh.getName())) continue;
      for (const prim of mesh.listPrimitives()) {
        const mat = prim.getMaterial();
        if (!mat || !cfg.glass.test(mat.getName() || '')) continue;
        if (!lampMat) {
          // Roughness differs slightly from the window glass so dedup()
          // cannot merge the two materials back together.
          lampMat = mat.clone().setName('glass_lamps').setRoughnessFactor(0.06);
        }
        prim.setMaterial(lampMat);
        console.log(`  split headlight lenses off "${mat.getName()}" → glass_lamps (${mesh.getName()})`);
      }
    }
  }

  if (cfg.carveLamps) {
    // Some rips fold head/tail-light lenses into the window-glass material.
    // Discriminate by HEIGHT: lamp lenses sit below the beltline while cabin
    // glass lives above it. Vertical = the model's smallest bbox axis (cars
    // are longer and wider than they are tall); the cabin side is whichever
    // half holds MORE glass triangles.
    let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
    for (const mesh of root.listMeshes()) for (const p of mesh.listPrimitives()) {
      const pos = p.getAttribute('POSITION');
      if (!pos) continue;
      const a = pos.getMin([]), b = pos.getMax([]);
      for (let i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], a[i]); mx[i] = Math.max(mx[i], b[i]); }
    }
    const ext = [mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]];
    const axis = ext.indexOf(Math.min(...ext));
    const mid = mn[axis] + ext[axis] * 0.5;

    let lampMat = root.listMaterials().find((m) => m.getName() === 'glass_lamps') ?? null;
    for (const mesh of root.listMeshes()) {
      for (const prim of [...mesh.listPrimitives()]) {
        const mat = prim.getMaterial();
        const name = mat?.getName() || '';
        if (!mat || !cfg.glass.test(name) || name === 'glass_lamps') continue;
        const pos = prim.getAttribute('POSITION');
        const idx = prim.getIndices();
        if (!pos || !idx) continue;
        const above = [], below = [];
        const v = [0, 0, 0];
        for (let t = 0; t < idx.getCount(); t += 3) {
          let c = 0;
          for (let k = 0; k < 3; k++) c += pos.getElement(idx.getScalar(t + k), v)[axis];
          (c / 3 > mid ? above : below).push(idx.getScalar(t), idx.getScalar(t + 1), idx.getScalar(t + 2));
        }
        // Cabin glass is the bulk; lamps the minority half.
        const [keep, lamps] = above.length >= below.length ? [above, below] : [below, above];
        if (!lamps.length) continue;
        if (!lampMat) lampMat = mat.clone().setName('glass_lamps').setRoughnessFactor(0.06);
        // New index accessors; both primitives share the same vertex streams.
        const buffer = root.listBuffers()[0];
        const mkIndices = (arr) => doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(arr)).setBuffer(buffer);
        prim.setIndices(mkIndices(keep));
        const lampPrim = prim.clone().setIndices(mkIndices(lamps)).setMaterial(lampMat);
        lampPrim.setExtension('KHR_materials_variants', null);
        mesh.addPrimitive(lampPrim);
        console.log(`  carved ${lamps.length / 3} lamp tris below beltline out of "${name}" (kept ${keep.length / 3})`);
      }
    }
  }

  if (cfg.stripVertexColors) {
    let stripped = 0;
    for (const mesh of root.listMeshes()) {
      for (const prim of mesh.listPrimitives()) {
        const color = prim.getAttribute('COLOR_0');
        if (color) {
          prim.setAttribute('COLOR_0', null);
          color.dispose();
          stripped++;
        }
      }
    }
    console.log(`  stripped vertex colors from ${stripped} primitives`);
  }

  // Attach the four shade variants to every window-glass primitive
  // (glass_lamps and factory light glass are deliberately left out).
  {
    const variantsExt = doc.createExtension(KHRMaterialsVariants);
    const shadeMaterials = {};
    const variants = {};
    for (const [shade, t] of Object.entries(SHADE_T)) {
      variants[shade] = variantsExt.createVariant(shade);
    }
    let mapped = 0;
    for (const mesh of root.listMeshes()) {
      for (const prim of mesh.listPrimitives()) {
        const mat = prim.getMaterial();
        if (!mat || !cfg.glass.test(mat.getName() || '') || mat.getName() === 'glass_lamps') continue;
        const list = variantsExt.createMappingList();
        for (const [shade, t] of Object.entries(SHADE_T)) {
          const key = mat.getName() + ':' + shade;
          if (!shadeMaterials[key]) {
            shadeMaterials[key] = mat.clone().setName(key).setBaseColorFactor(glassRGBA(shade));
          }
          list.addMapping(variantsExt.createMapping().setMaterial(shadeMaterials[key]).addVariant(variants[shade]));
        }
        prim.setExtension('KHR_materials_variants', list);
        mapped++;
      }
    }
    console.log(`  shade variants attached to ${mapped} glass primitives`);
  }

  // 2. Geometry + texture diet.
  await doc.transform(
    dedup(),
    prune(),
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: cfg.simplifyRatio, error: 0.0008 }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024] }),
    draco()
  );

  await io.write(outAbs, doc);
  const after = fs.statSync(outAbs).size;
  console.log(
    `✓ ${vehicle}.glb  ${(before / 1e6).toFixed(1)}MB → ${(after / 1e6).toFixed(2)}MB  (${cfg.src})`
  );
}
console.log('\nDone. Optimized models in public/models3d/');
