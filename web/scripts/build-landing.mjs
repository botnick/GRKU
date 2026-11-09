// Builds the images of the landing page in public/landing/, and the pictures of the recipe
// presets in public/recipes/, from the source photos, which stay outside the repository:
//   node scripts/build-landing.mjs PHOTOS EFFECTS [GRAIN [RECIPES]]
// PHOTOS holds the JPEGs of SOURCES under their `file` names. EFFECTS is the site effects folder
// of the preview target (catalog.json and preview/). The film looks use the preview tables, as
// the effects section does. Date Imprint and Glow run the module code on the full-size photo,
// built for this computer like `grku module test` (it needs cargo and a C compiler). Grain comes
// from the camera's own grain stage, so GRAIN holds pictures that GR III firmware 2.10 recorded of
// the tram photo (Tramway by MIKI Yoshihito) at ISO 100, with Film Look Tri-X 400 and each Grain strength (GRAIN_FILES).
// The recipe presets also come from the camera: the preview tables end at diffuse white, so they
// cannot show the lights that Glow needs. RECIPES holds pictures that GR III firmware 2.10
// developed from GR III DNGs, without a recipe and with each preset (RECIPE_FILES).
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import jpeg from 'jpeg-js';
import { LANDING_LOOKS } from '../src/landing-data.ts';
import { applyLinearLut } from '../src/preview/lut.ts';
import { linearSample } from './linear-sample.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const OUTPUT = fileURLToPath(new URL('../public/landing/', import.meta.url));
const RECIPES = fileURLToPath(new URL('../public/recipes/', import.meta.url));
const QUALITY = 80;

/** The source photos. The page credits each one; src/landing-data.ts holds the credits. */
const SOURCES = {
  wheels: { file: 'wheels.jpg', sha256: 'adad224ecc0a4b2b92823e6b55adc7834a544384f4ef4abf7fe3a8e3cb415618' },
  wakkanai: { file: 'wakkanai.jpg', sha256: '38c22eec21cf023199e6efe076b7c3b8376e310e4a3398e0c08ca60827b2f65b' },
  hokkaido: { file: 'hokkaido.jpg', sha256: 'c645e9b007fda23366487816c0ea966a008e116943379ec66b0411077a0825a7' },
  // The module examples, one GR photo each (src/landing-data.ts has the credits).
  achensee: { file: 'achensee.jpg', sha256: '9ed1c1468de11add173798983ca43b9ea9459cbd016342ead68c5ac6603c21b4' },
  tram: { file: 'tram-green.jpg', sha256: 'dff8652af5e3210cc305401fa0b9e7eaf61137fafabcbdb4612d4fd75593743e' },
  clouds: { file: 'clouds.jpg', sha256: '878cb9c5c51774fef083a402668126e866d71c7a748c14460d3251f78d68de65' },
  beach: { file: 'beach.jpg', sha256: 'cde8cef67b3f2968f17960e6e94caed6b8e4bc2b0353d82f1e6258c22cb6c157' },
  nathans: { file: 'nathans.jpg', sha256: '82d7565d8ac7340a0dd4791843d61e5979f7d74d18bb90e7edb4af5e4ca9e0cf' },
  neon: { file: 'neon.jpg', sha256: 'fa8008900549b7bd24b3de7ea53baff0d34080608f1fab9d492d093d520823c3' },
  temple: { file: 'temple.jpg', sha256: 'ceec94cbe739c86daaf732170b31c91231199acec527dc388da1baf71c23332d' },
};
/** The recorded Grain pictures in GRAIN, Weak to Extra Strong, 6000 x 4000. */
const GRAIN_FILES = ['grain-1-weak.jpg', 'grain-2-medium.jpg', 'grain-3-strong.jpg', 'grain-4-extra.jpg'];
/**
 * The developed pictures in RECIPES, 6000 x 4000, each with the top left of its crop: a photo
 * without a recipe, then the presets that use the photo. The site credits each photo
 * (src/landing-data.ts): the takeaway is Tony Barrett's night-takeaway-queue.dng of
 * discuss.pixls.us/t/40918, and the dunes are R0000357.DNG of raw.pixls.us.
 */
const RECIPE_FILES = [
  ['takeaway.jpg', 620, 330],
  ['cinestill-800t.jpg', 620, 330],
  ['dunes.jpg', 1200, 700],
  ['bennet-800.jpg', 1200, 700],
  ['reggie-negative.jpg', 1200, 700],
];

const [photos, effects, grain, recipes] = process.argv.slice(2);
if (!photos || !effects) throw new Error('Usage: node scripts/build-landing.mjs PHOTOS EFFECTS [GRAIN [RECIPES]]');
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
function photo(key) {
  const { file, sha256: expected } = SOURCES[key];
  const bytes = readFileSync(join(photos, file));
  if (sha256(bytes) !== expected) throw new Error(`${file} is not the expected photo`);
  return bytes;
}
const encode = (width, height, rgba) => jpeg.encode({ data: rgba, width, height }, QUALITY).data;
mkdirSync(join(OUTPUT, 'looks'), { recursive: true });

// 1. The film looks: the Standard development and each look of the hero.
const catalog = JSON.parse(readFileSync(join(effects, 'catalog.json'), 'utf8'));
const { image, meanError } = linearSample(photo('wheels'), readFileSync(join(effects, 'preview/standard.lut')));
const tables = [['Standard', 'standard', 'preview/standard.lut']];
// The looks of the hero (landing-data.ts), by their catalog names.
for (const { name, image } of LANDING_LOOKS) {
  const effect = catalog.effects.find((item) => item.name === name);
  if (!effect) throw new Error(`The catalog has no ${name}`);
  tables.push([name, image, effect.preview]);
}
for (const [, slug, path] of tables) {
  const table = readFileSync(join(effects, path));
  const size = Math.round(Math.cbrt(table.length / 3));
  writeFileSync(join(OUTPUT, 'looks', `${slug}.jpg`), encode(image.width, image.height, applyLinearLut(image.data, table, size)));
}
console.log(`Looks: ${image.width} x ${image.height}, baseline difference ${meanError.toFixed(2)} of 255.`);

// 2. The module examples, 1200 x 800 each, as the camera records (3:2). The plane filters run
// the module code on the full photo; Framing, Crop, and Guides are geometry, done here.
const OUT_W = 1200;
const OUT_H = 800;
const work = mkdtempSync(join(tmpdir(), 'grku-landing-'));
try {
  const decoded = (key) => jpeg.decode(photo(key), { useTArray: true, formatAsRGBA: false, maxMemoryUsageInMB: 1024 });
  /** RGB pixels of a part of a picture, kept from `left`, `top`, `width` x `height`. */
  function part(picture, left, top, width, height) {
    const data = new Uint8Array(width * height * 3);
    for (let y = 0; y < height; y++) {
      const from = ((top + y) * picture.width + left) * 3;
      data.set(picture.data.subarray(from, from + width * 3), y * width * 3);
    }
    return { width, height, data };
  }
  /**
   * RGBA pixels of the part `left`, `top`, `width` x `height` of an RGB picture at `outW` x
   * `outH`: the mean of the source pixels under each output pixel (a box filter), which reduces
   * without aliasing, and samples bilinearly when it enlarges.
   */
  function resample(picture, left, top, width, height, outW = OUT_W, outH = OUT_H) {
    const rgba = new Uint8Array(outW * outH * 4);
    const sx = width / outW;
    const sy = height / outH;
    const src = picture.data;
    for (let y = 0; y < outH; y++) {
      const y0 = top + y * sy, y1 = top + (y + 1) * sy;
      const ya = Math.floor(y0), yb = Math.max(ya + 1, Math.ceil(y1));
      for (let x = 0; x < outW; x++) {
        const x0 = left + x * sx, x1 = left + (x + 1) * sx;
        const xa = Math.floor(x0), xb = Math.max(xa + 1, Math.ceil(x1));
        let r = 0, g = 0, bl = 0, weight = 0;
        for (let yy = ya; yy < yb; yy++) {
          const wy = Math.min(yy + 1, y1) - Math.max(yy, y0);
          if (wy <= 0) continue;
          const row = Math.min(picture.height - 1, yy) * picture.width;
          for (let xx = xa; xx < xb; xx++) {
            const wx = Math.min(xx + 1, x1) - Math.max(xx, x0);
            if (wx <= 0) continue;
            const w = wx * wy, at = (row + Math.min(picture.width - 1, xx)) * 3;
            r += src[at] * w; g += src[at + 1] * w; bl += src[at + 2] * w; weight += w;
          }
        }
        const to = (y * outW + x) * 4;
        rgba[to] = Math.round(r / weight); rgba[to + 1] = Math.round(g / weight); rgba[to + 2] = Math.round(bl / weight); rgba[to + 3] = 255;
      }
    }
    return { width: outW, height: outH, rgba };
  }
  /** The whole picture at the output size. */
  const whole = (picture) => resample(picture, 0, 0, picture.width, picture.height);
  /** Mixes the pixel at (x, y) toward black by `amount` (0 to 1). */
  function darken(image, x, y, amount) {
    const at = (y * image.width + x) * 4;
    for (let c = 0; c < 3; c++) image.rgba[at + c] = Math.round(image.rgba[at + c] * (1 - amount));
  }
  function setPixel(image, x, y, r, g, bl) {
    if (x < 0 || y < 0 || x >= image.width || y >= image.height) return;
    const at = (y * image.width + x) * 4;
    image.rgba[at] = r; image.rgba[at + 1] = g; image.rgba[at + 2] = bl;
  }
  /** A guide line of the live view: white, two pixels, over a one-pixel shadow. */
  function line(image, x0, y0, x1, y1) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= steps; i++) {
      const x = Math.round(x0 + ((x1 - x0) * i) / steps), y = Math.round(y0 + ((y1 - y0) * i) / steps);
      const vertical = Math.abs(x1 - x0) < Math.abs(y1 - y0);
      for (let k = -1; k <= 2; k++) {
        const shadow = k === -1 || k === 2;
        const px = vertical ? x + k : x, py = vertical ? y : y + k;
        if (shadow) setPixel(image, px, py, 0, 0, 0); else setPixel(image, px, py, 255, 255, 255);
      }
    }
  }
  /** The renderer of a module: its sources, its generated descriptor, the harness, and landing-render.c. */
  function renderer(module, define) {
    const objects = join(work, module);
    execFileSync('cargo', ['run', '-q', '-p', 'grku-cli', '--', 'module', 'test', '--dir', join(ROOT, 'modules', module), '--objects', objects], {
      cwd: ROOT,
      stdio: ['ignore', 'ignore', 'inherit'],
    });
    const manifest = readFileSync(join(ROOT, 'modules', module, 'module.toml'), 'utf8');
    const sources = [...(/^sources = \[(.*)\]/m.exec(manifest)?.[1] ?? '').matchAll(/"([^"]+)"/g)].map((m) => join(ROOT, 'modules', module, m[1]));
    const sdk = join(ROOT, 'runtime', 'sdk');
    const executable = join(work, `render-${module}`);
    execFileSync('cc', [
      '-std=c11', '-O2', '-Wall', '-Wno-unused-function', '-DGRKU_TEST_PLANE_BYTES=(64U<<20)', `-D${define}`,
      '-include', join(sdk, 'grku_test.h'), '-I', sdk, '-I', objects,
      join(objects, 'grku_module.c'), ...sources, fileURLToPath(new URL('landing-render.c', import.meta.url)), join(sdk, 'grku_test.c'),
      '-o', executable,
    ], { stdio: ['ignore', 'ignore', 'inherit'] });
    return (picture, args, env = {}) => {
      const input = join(work, 'in.rgb');
      const output = join(work, 'out.rgb');
      writeFileSync(input, picture.data);
      execFileSync(executable, [input, String(picture.width), String(picture.height), output, ...args.map(String)], {
        env: { ...process.env, ...env },
        stdio: ['ignore', 'ignore', 'inherit'],
      });
      return { width: picture.width, height: picture.height, data: readFileSync(output) };
    };
  }
  const save = (name, { width, height, rgba }) => writeFileSync(join(OUTPUT, name), encode(width, height, rgba));

  // Each example has its "before": the same view without the module, for the slider of the site.
  // Framing: the live view of XPan 65:24 on the Achensee, the picture outside the frame dimmed,
  // as the Dark mask of the camera shows it.
  {
    const image = whole(decoded('achensee'));
    save('framing-xpan-before.jpg', image);
    const band = Math.round((OUT_W * 24) / 65);
    const top = (OUT_H - band) >> 1;
    for (let y = 0; y < OUT_H; y++) if (y < top || y >= top + band) for (let x = 0; x < OUT_W; x++) darken(image, x, y, 0.55);
    save('framing-xpan.jpg', image);
    console.log('Framing: done.');
  }
  // Crop: the 50 mm field of the 28 mm lens on the tram, 28/50 of the width around the middle.
  {
    const tram = decoded('tram');
    const w = Math.round(tram.width * (28 / 50)) & ~1, h = Math.round((w * 2) / 3);
    const left = (tram.width - w) >> 1, top = (tram.height - h) >> 1;
    // Before: the whole 28 mm frame with the frame lines of the crop, as the live view shows it.
    const before = whole(tram);
    const fx0 = Math.round((left / tram.width) * OUT_W), fx1 = Math.round(((left + w) / tram.width) * OUT_W);
    const fy0 = Math.round((top / tram.height) * OUT_H), fy1 = Math.round(((top + h) / tram.height) * OUT_H);
    line(before, fx0, fy0, fx1, fy0); line(before, fx0, fy1, fx1, fy1); line(before, fx0, fy0, fx0, fy1); line(before, fx1, fy0, fx1, fy1);
    save('crop-50-before.jpg', before);
    save('crop-50.jpg', resample(tram, left, top, w, h));
    console.log('Crop: done.');
  }
  // Guides: the thirds over the clouds, as the live view draws them.
  {
    const image = whole(decoded('clouds'));
    save('guides-thirds-before.jpg', image);
    for (const t of [1 / 3, 2 / 3]) {
      line(image, Math.round(OUT_W * t), 0, Math.round(OUT_W * t), OUT_H - 1);
      line(image, 0, Math.round(OUT_H * t), OUT_W - 1, Math.round(OUT_H * t));
    }
    save('guides-thirds.jpg', image);
    console.log('Guides: done.');
  }
  // The date of the Wakkanai photo (EXIF 2023-03-15 07:47), 'YY M D in each digit look, then
  // the bottom right part of the photo.
  const date = renderer('date', 'RENDER_DATE');
  const wakkanai = decoded('wakkanai');
  save('date-before.jpg', resample(wakkanai, 3600, 2400, 2400, 1600));
  ['classic', 'gr1s', 'gr2'].forEach((look, value) => {
    const out = date(wakkanai, [1, value], { RENDER_TIME: '2023 3 15 7 47' });
    save(`date-${look}.jpg`, resample(out, 3600, 2400, 2400, 1600));
  });
  console.log('Date Imprint: done.');
  // Glow on the lit trees of the Red Brick Office at night (EXIF 4.3 EV at ISO 100), 3:2 as the
  // camera records it: Off, then Bloom and Halation at the Medium strength, the lights at one third.
  const glow = renderer('glow', 'RENDER_GLOW');
  const full = decoded('hokkaido');
  const night = part(full, (full.width - 5262) >> 1, (full.height - 3508) >> 1, 5262, 3508);
  const lights = (picture) => resample(picture, 1100, 1550, 3000, 2000);
  save('glow-off.jpg', lights(glow(night, [0, 0, 4.3])));
  save('bloom.jpg', lights(glow(night, [2, 0, 4.3])));
  save('halation.jpg', lights(glow(night, [0, 2, 4.3])));
  console.log('Glow: done.');
  // Light Leak: the Leaky preset on the beach, the Dusty preset on Nathan's.
  const leak = renderer('lightleak', 'RENDER_LEAK');
  const beach = decoded('beach'), nathans = decoded('nathans');
  save('leak-leaky-before.jpg', whole(beach));
  save('leak-leaky.jpg', whole(leak(beach, [4])));
  save('leak-dusty-before.jpg', whole(nathans));
  save('leak-dusty.jpg', whole(leak(nathans, [3])));
  console.log('Light Leak: done.');
  // Diffusion: Black Pro-Mist 1/2 with the amber Streak on the neon sign.
  const diffusion = renderer('diffusion', 'RENDER_DIFFUSION');
  const neon = decoded('neon');
  save('diffusion-half-before.jpg', whole(neon));
  save('diffusion-half.jpg', whole(diffusion(neon, [3, 0, 2])));
  console.log('Diffusion: done.');
  // Border: the white 3% edge on the temple.
  const border = renderer('border', 'RENDER_BORDER');
  const temple = decoded('temple');
  save('border-white-before.jpg', whole(temple));
  save('border-white.jpg', whole(border(temple, [1])));
  console.log('Border: done.');

  // The recipe presets: a 4:3 part of each developed picture, at a third of its size.
  if (recipes) {
    mkdirSync(RECIPES, { recursive: true });
    RECIPE_FILES.forEach(([file, left, top]) => {
      const picture = jpeg.decode(readFileSync(join(recipes, file)), { useTArray: true, formatAsRGBA: false, maxMemoryUsageInMB: 1024 });
      if (picture.width !== 6000 || picture.height !== 4000) throw new Error(`${file} is not a 6000 x 4000 picture`);
      const { width, height, rgba } = crop(picture, left, top, 2160, 1620, 3);
      writeFileSync(join(RECIPES, file), encode(width, height, rgba));
    });
    console.log('Recipe presets: done.');
  }

  // Grain: the light grey footbridge girder, at full size. A smaller size averages the grain
  // away, and the grain shows most on light mid tones.
  if (grain) {
    GRAIN_FILES.forEach((file, index) => {
      const picture = jpeg.decode(readFileSync(join(grain, file)), { useTArray: true, formatAsRGBA: false, maxMemoryUsageInMB: 1024 });
      if (picture.width !== 6000 || picture.height !== 4000) throw new Error(`${file} is not a 6000 x 4000 picture`);
      save(`grain-${index + 1}.jpg`, resample(picture, 1950, 450, 720, 480, 720, 480));
    });
    console.log('Grain: done.');
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
