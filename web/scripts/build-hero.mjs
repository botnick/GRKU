// Builds the pictures of the home page hero in public/landing/hero/ from a sample photo of the
// preview (public/samples/<name>.grlinear): the Standard development and each look of the hero
// (LANDING_LOOKS), with the preview tables of the effects folder, as the looks page renders them.
//   node scripts/build-hero.mjs EFFECTS [SAMPLE]
// EFFECTS is the site effects folder of the preview target (catalog.json and preview/). SAMPLE is
// a sample of public/samples, `achensee` by default; the page credits it from its .json.
// It encodes with cjpeg of libjpeg-turbo, whose chroma subsampling keeps each picture near 200 KB.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { LANDING_LOOKS } from '../src/landing-data.ts';
import { decodeLinear } from '../src/preview/linear.ts';
import { applyLinearLut } from '../src/preview/lut.ts';

const SAMPLES = fileURLToPath(new URL('../public/samples/', import.meta.url));
const OUTPUT = fileURLToPath(new URL('../public/landing/hero/', import.meta.url));
const QUALITY = '78';

const [effects, sample = 'achensee'] = process.argv.slice(2);
if (!effects) throw new Error('Usage: node scripts/build-hero.mjs EFFECTS [SAMPLE]');

const packed = gunzipSync(readFileSync(join(SAMPLES, `${sample}.grlinear`)));
const image = decodeLinear(packed.buffer.slice(packed.byteOffset, packed.byteOffset + packed.byteLength));
const catalog = JSON.parse(readFileSync(join(effects, 'catalog.json'), 'utf8'));

const tables = [['standard', 'preview/standard.lut']];
for (const { name, image: slug } of LANDING_LOOKS) {
  const effect = catalog.effects.find((item) => item.name === name);
  if (!effect) throw new Error(`The catalog has no ${name}`);
  tables.push([slug, effect.preview]);
}

mkdirSync(OUTPUT, { recursive: true });
for (const [slug, path] of tables) {
  const table = readFileSync(join(effects, path));
  const size = Math.round(Math.cbrt(table.length / 3));
  const rgba = applyLinearLut(image.data, table, size);
  // cjpeg reads a binary PPM, which holds RGB without alpha.
  const rgb = Buffer.alloc(image.width * image.height * 3);
  for (let i = 0, j = 0; j < rgb.length; i += 4, j += 3) {
    rgb[j] = rgba[i];
    rgb[j + 1] = rgba[i + 1];
    rgb[j + 2] = rgba[i + 2];
  }
  const ppm = Buffer.concat([Buffer.from(`P6\n${image.width} ${image.height}\n255\n`), rgb]);
  const jpg = execFileSync('cjpeg', ['-quality', QUALITY, '-optimize', '-progressive'], { input: ppm, maxBuffer: 1 << 26 });
  writeFileSync(join(OUTPUT, `${sample}-${slug}.jpg`), jpg);
}
console.log(`Hero: ${sample}, ${image.width} x ${image.height}, ${tables.length} pictures.`);
