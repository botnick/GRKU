// Writes the WebP copies of the home page pictures, which the page shows in place of the JPEGs:
//   node scripts/build-webp.mjs
// Each JPEG of public/landing/ (scripts/build-landing.mjs and scripts/build-hero.mjs write them)
// gets a WebP of its own size and smaller ones for phones and thumbnails (`-720.webp`, `-360.webp`). The camera
// pictures of resources/images that the page shows become WebPs in src/assets/. Run it after
// either script, or after a new sample of public/samples. It needs cwebp of libwebp.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { signPaths } from './image-rights.mjs';

const LANDING = fileURLToPath(new URL('../public/landing/', import.meta.url));
const IMAGES = fileURLToPath(new URL('../../resources/images/', import.meta.url));
const ASSETS = fileURLToPath(new URL('../src/assets/', import.meta.url));
const SAMPLES = fileURLToPath(new URL('../public/samples/', import.meta.url));
/** The widths of the smaller copies: a phone screen at twice its pixels, and a thumbnail. src/landing.ts names them. */
const WIDTHS = [720, 360];

const webp = (input, output, ...options) =>
  execFileSync('cwebp', ['-quiet', '-m', '6', '-sharp_yuv', '-metadata', 'none', ...options, input, '-o', output]);

let count = 0;
for (const entry of readdirSync(LANDING, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.jpg')) continue;
  const input = join(entry.parentPath, entry.name);
  const base = input.slice(0, -'.jpg'.length);
  webp(input, `${base}.webp`, '-q', '75');
  for (const width of WIDTHS) webp(input, `${base}-${width}.webp`, '-q', '75', '-resize', String(width), '0');
  count += 1;
}

// The thumbnails of the preview samples, 80 pixels wide on the page: 160 pixels for a sharp screen.
for (const name of readdirSync(SAMPLES)) {
  if (name.endsWith('.jpg')) webp(join(SAMPLES, name), join(SAMPLES, name.replace(/\.jpg$/, '-160.webp')), '-q', '75', '-resize', '160', '0');
}

// The camera screens: flat drawing with a photo inside, which a lossy WebP keeps sharp.
mkdirSync(ASSETS, { recursive: true });
for (const name of ['camera-adj', 'camera-menu']) {
  webp(join(IMAGES, `${name}.png`), join(ASSETS, `${name}.webp`), '-q', '82');
}
// The rights of GRKU in the metadata of each picture (HANDOFF.md, Signatures).
signPaths([LANDING, SAMPLES, ASSETS]);
console.log(`WebP: ${count} landing pictures, the sample thumbnails, 2 camera screens.`);
