// FinePix CCD, a look of this repository: the bright, clean daylight color that people call the
// FUJIFILM FinePix CCD look. Writes a 33-point .cube on the GR Standard JPEG, which
// `grku effects import --input standard` fits:
//
//   node effects/sources/make_finepix_ccd.mjs finepix-ccd-v1.cube
//
// A CIELAB transform with parameters set by eye and by measurement against daylight reference
// photographs (a pale cyan sky, steel-blue water, warm skin and browns, cool clean whites), and
// checked against FinePix F10/F11/F30/F31fd/J10/Z5fd camera JPEGs. Not camera data.

import { writeFileSync } from 'node:fs';

const P = {
  lift: 2.5, // mid-tone lift in L* at L* 50 (mid gray stays within 0.15 EV of Standard)
  contrast: 1.06, // slope of the tone curve around L* 50
  sat: 0.96, // chroma
  satHigh: 0.8, // chroma toward white, from L* 70
  shadow: [1.5, 0.3], // a*, b* added around L* 22
  highlight: [-1.5, -1.6], // a*, b* added from L* 55, fading out at white
  // [hue center, width, hue shift, chroma scale, L* shift] in CIELAB LCh: deep blues toward a
  // pale cyan, blues and cyans quieter, yellows and browns toward orange, skin kept, greens quieter.
  bumps: [
    [285, 28, -40, 0.6, 7],
    [255, 22, -12, 0.78, 3],
    [215, 25, -3, 0.9, 1],
    [80, 18, -10, 0.95, 0],
    [50, 18, 2, 1.0, 1],
    [130, 35, 4, 0.85, 0],
    [25, 20, 0, 1.05, 0],
  ],
};

const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const enc = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
const fi = (t) => (t > 0.206893 ? t * t * t : (t - 16 / 116) / 7.787);
const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

function toLab(r, g, b) {
  r = lin(r); g = lin(g); b = lin(b);
  const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const Y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}

/** Linear sRGB of a CIELAB (D65) color. */
function fromLab(L, a, b) {
  const fy = (L + 16) / 116, X = fi(fy + a / 500) * 0.95047, Y = fi(fy), Z = fi(fy - b / 200) * 1.08883;
  return [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.204 * Y + 1.057 * Z];
}

function hueDiff(h, c) {
  let d = h - c;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

function tone(L) {
  const x = Math.min(1, Math.max(0, L / 100));
  let y = x + (P.lift / 100) * Math.sin(Math.PI * x) ** 1.2 * (1 - 0.3 * x);
  y = 0.5 + (y - 0.5) * P.contrast;
  return Math.min(100, Math.max(0, y * 100));
}

function transform([r, g, bl]) {
  let [L, a, b] = toLab(r, g, bl);
  let C = Math.hypot(a, b), h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  // The hue changes fade out toward neutral, so grays stay gray.
  const weight = smooth(C / 8);
  let dh = 0, scale = 1, dL = 0;
  for (const [center, width, shift, chroma, lift] of P.bumps) {
    const g = Math.exp(-0.5 * (hueDiff(h, center) / width) ** 2);
    dh += shift * g;
    scale *= 1 + (chroma - 1) * g;
    dL += lift * g;
  }
  h += dh * weight;
  L += dL * weight * Math.min(1, C / 30);
  const Lt = tone(L);
  C *= scale * P.sat * (Lt > 70 ? 1 + (P.satHigh - 1) * smooth((Lt - 70) / 30) : 1);
  a = C * Math.cos((h * Math.PI) / 180);
  b = C * Math.sin((h * Math.PI) / 180);
  const shadows = Math.exp(-0.5 * ((Lt - 22) / 14) ** 2);
  const highlights = smooth((Lt - 55) / 30) * (1 - smooth((Lt - 97) / 3));
  a += P.shadow[0] * shadows + P.highlight[0] * highlights;
  b += P.shadow[1] * shadows + P.highlight[1] * highlights;
  return fromLab(Lt, a, b).map((v) => Math.min(1, Math.max(0, enc(Math.min(1, Math.max(0, v))))));
}

const out = process.argv[2];
if (!out) throw new Error('Usage: node effects/sources/make_finepix_ccd.mjs OUT.cube');
const N = 33;
let text = `TITLE "FinePix CCD (GR Standard input)"\nLUT_3D_SIZE ${N}\nDOMAIN_MIN 0 0 0\nDOMAIN_MAX 1 1 1\n`;
for (let bi = 0; bi < N; bi++)
  for (let gi = 0; gi < N; gi++)
    for (let ri = 0; ri < N; ri++) {
      const o = transform([ri / (N - 1), gi / (N - 1), bi / (N - 1)]);
      text += `${o[0].toFixed(6)} ${o[1].toFixed(6)} ${o[2].toFixed(6)}\n`;
    }
writeFileSync(out, text);
