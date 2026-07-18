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
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
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
    simplifyRatio: 0.6,
  },
  suv: {
    src: '2023-lamborghini-urus-performante/source/2023_lamborghini_urus_performante.glb',
    glass: /Window_Material$/i,
    simplifyRatio: 0.6,
  },
  sport: {
    src: '2020-porsche-718-cayman-gt4/source/2020_porsche_718_cayman_gt4.glb',
    glass: /Window_Material$/i,
    simplifyRatio: 0.75,
  },
  truck: {
    src: 'ford-f150-raptor/source/Ford Raptor.glb',
    glass: /^glass/i,
    simplifyRatio: 0.5,
    // This rip carries broken purple vertex colors on every primitive
    // (interior, brake discs render magenta). Strip COLOR_0 entirely.
    stripVertexColors: true,
  },
};

// Clear glass baseline; the visualizer darkens this live per shade.
const GLASS_RGBA = [0.62, 0.68, 0.74, 0.25];

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
  //    that is where most of the texture weight lives. Window glass is
  //    normalized to clear so the visualizer can tint it live.
  for (const mat of root.listMaterials()) {
    const name = mat.getName() || '';
    mat.setMetallicRoughnessTexture(null);
    mat.setNormalTexture(null);
    mat.setOcclusionTexture(null);
    mat.setEmissiveTexture(null);

    if (cfg.glass.test(name)) {
      mat.setBaseColorTexture(null);
      mat.setBaseColorFactor(GLASS_RGBA);
      mat.setAlphaMode('BLEND');
      mat.setMetallicFactor(0);
      mat.setRoughnessFactor(0.05);
      mat.setDoubleSided(true);
      // Remove transmission/volume/etc — plain alpha glass tints predictably
      // and renders cheaper than refractive transmission.
      for (const ext of mat.listExtensions()) ext.dispose();
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
