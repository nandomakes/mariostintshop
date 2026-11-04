// Renders the visualizer's two fixed camera angles (front / rear) to
// WebP + AVIF stills, plus per-window tint masks and per-package PPF masks.
// The page only ever shows these two orbits (drag is disabled), so the stills
// keep the same framing the 3D viewer used.
//
// Requires the optimized GLBs in public/models3d and system Chrome.
//   node scripts/render-visualizer-frames.mjs            # all vehicles
//   node scripts/render-visualizer-frames.mjs sedan      # one vehicle

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'images', 'visualizer');
const DEBUG = '/tmp/viz-frames';
const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome';
const W = 1290;
const H = 780;

const VEHICLES = (process.argv.slice(2).filter((a) => !a.startsWith('--'))).length
  ? process.argv.slice(2).filter((a) => !a.startsWith('--'))
  : ['sedan', 'suv', 'sport', 'truck'];
const ANGLES = ['front', 'rear'];

const TINT = {
  glass_front: 'front-side',
  glass_rearside: 'rear-side',
  glass_rearwin: 'rear',
  glass_visor: 'visor',
};
const PPF_ZONES = [
  'ppf_bumper_f', 'ppf_hood_f', 'ppf_hood_r', 'ppf_mirror',
  'ppf_rocker', 'ppf_roof', 'ppf_side', 'ppf_rear',
];
const PACKAGES = {
  'partial-front': ['ppf_bumper_f', 'ppf_hood_f', 'ppf_mirror'],
  'full-front': ['ppf_bumper_f', 'ppf_hood_f', 'ppf_hood_r', 'ppf_mirror'],
  'track-pack': ['ppf_bumper_f', 'ppf_hood_f', 'ppf_hood_r', 'ppf_mirror', 'ppf_rocker'],
  'full-wrap': PPF_ZONES,
};
// Matches PPF_LOOK.covered in the page (#13b545).
const PPF_GREEN = { r: 19, g: 181, b: 69 };

const HTML = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <script type="module" src="/node_modules/@google/model-viewer/dist/model-viewer.min.js"></script>
  <style>html,body{margin:0;background:#fff} model-viewer{width:${W}px;height:${H}px;background:#fff}</style>
</head>
<body>
  <model-viewer
    id="viewer"
    loading="eager"
    bounds="tight"
    shadow-intensity="0.9"
    shadow-softness="0.8"
    exposure="1"
    tone-mapping="neutral"
    environment-image="/models3d/studio-env.hdr"
    camera-orbit="-35deg 84deg 70%"
    field-of-view="22deg"
    interaction-prompt="none"
    interpolation-decay="0"
  ></model-viewer>
  <script type="module">
    const params = new URLSearchParams(location.search);
    const viewer = document.getElementById('viewer');
    const vehicle = params.get('vehicle') || 'sedan';
    const angle = params.get('angle') || 'front';
    viewer.src = '/models3d/' + vehicle + '.glb';

    function frame() {
      const front = -35;
      const theta = angle === 'front' ? front : front + 180;
      let center = null;
      let length = 0;
      try {
        const t = viewer.getCameraTarget();
        const d = viewer.getDimensions();
        center = { x: t.x, y: t.y, z: t.z };
        length = Math.max(d.x, d.z);
      } catch (e) {}
      viewer.cameraOrbit = theta + 'deg 84deg 70%';
      if (center) {
        const dir = angle === 'front' ? 1 : -1;
        viewer.cameraTarget = center.x + 'm ' + center.y + 'm ' + (center.z + dir * length * 0.07) + 'm';
      }
      viewer.jumpCameraToGoal();
    }

    window.__frame = frame;
    window.__ready = new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('model load timeout')), 90000);
      viewer.addEventListener('load', async () => {
        clearTimeout(t);
        frame();
        await viewer.updateComplete;
        resolve(viewer.model.materials.map((m) => m.name));
      });
      viewer.addEventListener('error', (e) => {
        clearTimeout(t);
        reject(new Error('model-viewer error ' + (e.detail || '')));
      });
    });

    function threeMaterialsOf(facade) {
      const found = [];
      const seen = new Set();
      const stack = [
        { o: facade, d: 0 },
        { o: facade.pbrMetallicRoughness, d: 0 },
      ];
      while (stack.length) {
        const { o, d } = stack.pop();
        if (!o || typeof o !== 'object' || seen.has(o) || d > 4) continue;
        seen.add(o);
        if (o.isMaterial) {
          found.push(o);
          continue;
        }
        const vals = [];
        if (typeof o.forEach === 'function') {
          try { o.forEach((v) => vals.push(v)); } catch (e) {}
        }
        for (const s of Object.getOwnPropertySymbols(o)) {
          try { vals.push(o[s]); } catch (e) {}
        }
        for (const v of vals) stack.push({ o: v, d: d + 1 });
      }
      return found;
    }

    window.__isolate = async (name) => {
      viewer.style.background = '#000';
      viewer.shadowIntensity = 0;
      viewer.exposure = 0.15;
      await Promise.all(viewer.model.materials.map((m) => (m.isLoaded ? null : m.ensureLoaded())));
      let touched = 0;
      for (const facade of viewer.model.materials) {
        const on = facade.name === name;
        try { facade.setAlphaMode('OPAQUE'); } catch (e) {}
        try { facade.setTransmissionFactor(0); } catch (e) {}
        try { facade.setClearcoatFactor(0); } catch (e) {}
        try { facade.setEmissiveFactor(on ? [1, 1, 1] : [0, 0, 0]); } catch (e) {}
        try { facade.setEmissiveStrength(on ? 8 : 0); } catch (e) {}
        facade.pbrMetallicRoughness.setMetallicFactor(0);
        facade.pbrMetallicRoughness.setRoughnessFactor(1);
        facade.pbrMetallicRoughness.setBaseColorFactor(on ? [1, 1, 1, 1] : [0, 0, 0, 1]);
        for (const mat of threeMaterialsOf(facade)) {
          touched++;
          mat.map = null;
          mat.emissiveMap = null;
          mat.normalMap = null;
          mat.roughnessMap = null;
          mat.metalnessMap = null;
          mat.aoMap = null;
          mat.envMap = null;
          mat.envMapIntensity = 0;
          if (mat.color) mat.color.set(on ? 0xffffff : 0x000000);
          if (mat.emissive) mat.emissive.set(on ? 0xffffff : 0x000000);
          mat.emissiveIntensity = on ? 8 : 0;
          mat.metalness = 0;
          mat.roughness = 1;
          mat.opacity = 1;
          mat.transparent = false;
          mat.transmission = 0;
          mat.clearcoat = 0;
          mat.needsUpdate = true;
        }
      }
      const orb = viewer.getCameraOrbit();
      window.__flip = !window.__flip;
      const nudge = window.__flip ? 0.0002 : -0.0002;
      viewer.cameraOrbit = (orb.theta + nudge) + 'rad ' + orb.phi + 'rad ' + orb.radius + 'm';
      viewer.jumpCameraToGoal();
      await viewer.updateComplete;
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return touched;
    };

    window.__restoreBase = async () => {
      viewer.shadowIntensity = 0.9;
      viewer.exposure = 1;
      // Reload is the only reliable way back to authored materials.
    };
  </script>
</body>
</html>`;

function startServer() {
  const types = {
    '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary',
    '.hdr': 'application/octet-stream', '.wasm': 'application/wasm', '.png': 'image/png',
  };
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (url.pathname === '/__render.html') {
      res.writeHead(200, { 'content-type': 'text/html' });
      res.end(HTML);
      return;
    }
    const rel = decodeURIComponent(url.pathname);
    const file = rel.startsWith('/node_modules/')
      ? path.join(ROOT, rel)
      : path.join(ROOT, 'public', rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function luminanceMask(data, info) {
  const out = Buffer.alloc(info.width * info.height * 4);
  let opaque = 0;
  for (let i = 0, p = 0; i < data.length; i += 4, p += 4) {
    const L = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    // Lift mid-grey edges, drop the near-black background.
    const a = L < 12 ? 0 : Math.min(255, Math.round((L - 12) * (255 / (255 - 12))));
    out[p] = 0;
    out[p + 1] = 0;
    out[p + 2] = 0;
    out[p + 3] = a;
    if (a > 20) opaque++;
  }
  return { buffer: out, opaque, info };
}

async function writeBase(png, stem) {
  const img = sharp(png);
  await img.clone().webp({ quality: 72, effort: 5, smartSubsample: true }).toFile(`${stem}.webp`);
  await img.clone().avif({ quality: 42, effort: 6 }).toFile(`${stem}.avif`);
  const small = img.clone().resize({ width: 640 });
  await small.clone().webp({ quality: 70, effort: 5 }).toFile(`${stem}-640.webp`);
  await small.clone().avif({ quality: 40, effort: 6 }).toFile(`${stem}-640.avif`);
}

async function writeTintMask(raw, info, file) {
  await sharp(raw, { raw: { width: info.width, height: info.height, channels: 4 } })
    .webp({ quality: 50, alphaQuality: 75, effort: 5, smartSubsample: true })
    .toFile(file);
}

async function writePpfMask(raws, file) {
  const inputs = raws.map((raw) => ({
    input: raw,
    raw: { width: W, height: H, channels: 4 },
    blend: 'dest-over',
  }));
  // Union the black masks, then paint the covered pixels green.
  const union = await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  }).composite(inputs).raw().toBuffer();
  const painted = Buffer.alloc(union.length);
  for (let i = 0; i < union.length; i += 4) {
    const a = union[i + 3];
    painted[i] = PPF_GREEN.r;
    painted[i + 1] = PPF_GREEN.g;
    painted[i + 2] = PPF_GREEN.b;
    painted[i + 3] = a;
  }
  await sharp(painted, { raw: { width: W, height: H, channels: 4 } })
    .webp({ quality: 55, alphaQuality: 80, effort: 5 })
    .toFile(file);
}

async function grab(page) {
  const el = await page.$('#viewer');
  return el.screenshot({ type: 'png', omitBackground: false });
}

async function shotMask(page, material) {
  const touched = await page.evaluate((name) => window.__isolate(name), material);
  await new Promise((r) => setTimeout(r, 180));
  const png = await grab(page);
  if (process.env.PROBE) fs.writeFileSync(path.join(DEBUG, `raw-${material}.png`), png);
  console.log('  three materials touched', touched);
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== W || info.height !== H) {
    throw new Error(`mask shot ${info.width}x${info.height}, expected ${W}x${H}`);
  }
  return luminanceMask(data, info);
}

const server = await startServer();
const port = server.address().port;
console.log('render server', port);

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(DEBUG, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--hide-scrollbars',
  ],
});

const manifest = {};

try {
  for (const vehicle of VEHICLES) {
    manifest[vehicle] = {};
    for (const angle of ANGLES) {
      const page = await browser.newPage();
      page.on('pageerror', (err) => console.error('pageerror', vehicle, angle, err.message));
      page.on('console', (msg) => {
        if (msg.type() === 'error') console.error('console', vehicle, angle, msg.text());
      });
      await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
      const url = `http://127.0.0.1:${port}/__render.html?vehicle=${vehicle}&angle=${angle}`;
      console.log('load', vehicle, angle);
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });
      const names = await page.evaluate(() => window.__ready);
      console.log('  materials', names.filter((n) => n.startsWith('glass_') || n.startsWith('ppf_')).join(' '));
      await new Promise((r) => setTimeout(r, 250));

      const basePng = await grab(page);
      const stem = path.join(OUT, `${vehicle}-${angle}`);
      await writeBase(basePng, stem);
      fs.writeFileSync(path.join(DEBUG, `${vehicle}-${angle}.png`), basePng);
      const baseStat = fs.statSync(`${stem}.webp`).size;

      const tintRaw = {};
      for (const [material, id] of Object.entries(TINT)) {
        if (!names.includes(material)) {
          console.warn('  missing', material);
          continue;
        }
        const mask = await shotMask(page, material);
        console.log(`  tint ${id} opaque=${mask.opaque}`);
        if (mask.opaque < 30) console.warn('  WARNING tiny mask', id);
        const file = path.join(OUT, `${vehicle}-${angle}-${id}.webp`);
        await writeTintMask(mask.buffer, mask.info, file);
        tintRaw[material] = mask.buffer;
        fs.writeFileSync(path.join(DEBUG, `${vehicle}-${angle}-${id}.png`), await sharp(mask.buffer, {
          raw: { width: W, height: H, channels: 4 },
        }).png().toBuffer());
      }
      if (process.env.PROBE) {
        console.log('probe stop after tint masks');
        await page.close();
        await browser.close();
        server.close();
        process.exit(0);
      }

      const ppfRaw = {};
      for (const material of PPF_ZONES) {
        if (!names.includes(material)) {
          console.warn('  missing', material);
          continue;
        }
        const mask = await shotMask(page, material);
        console.log(`  ppf ${material} opaque=${mask.opaque}`);
        ppfRaw[material] = mask.buffer;
      }

      for (const [pkg, zones] of Object.entries(PACKAGES)) {
        const raws = zones.map((z) => ppfRaw[z]).filter(Boolean);
        if (!raws.length) continue;
        const file = path.join(OUT, `${vehicle}-${angle}-ppf-${pkg}.webp`);
        await writePpfMask(raws, file);
      }

      manifest[vehicle][angle] = {
        webp: fs.statSync(`${stem}.webp`).size,
        avif: fs.statSync(`${stem}.avif`).size,
        webp640: fs.statSync(`${stem}-640.webp`).size,
        avif640: fs.statSync(`${stem}-640.avif`).size,
      };
      console.log(`  base webp ${baseStat} avif ${manifest[vehicle][angle].avif} 640avif ${manifest[vehicle][angle].avif640}`);
      await page.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}

const bytes = (dir) => {
  let n = 0;
  for (const f of fs.readdirSync(dir)) n += fs.statSync(path.join(dir, f)).size;
  return n;
};
console.log('OUT bytes', bytes(OUT));
console.log(JSON.stringify(manifest, null, 2));
