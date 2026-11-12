// A FUJIFILM recipe as the camera applies it, from measurements of camera JPEGs (effects/sources/FUJIFILM_RECIPES.md):
// WB shift on scene light, the film simulation (FUJIFILM's own F-Log2 LUT), then on its output the
// Highlight/Shadow tone curve per channel, Color as a chroma scale, Color Chrome, and Color Chrome FX Blue.
import fs from 'node:fs';

// ---- colour helpers (sRGB / CIELAB D65, as the camera JPEGs were measured) -------------------------
const dec = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const enc = (v) => { v = Math.min(1, Math.max(0, v)); return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055; };
const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
const fi = (t) => (t ** 3 > 216 / 24389 ? t ** 3 : (116 * t - 16) / (24389 / 27));
export function toLab([r, g, b]) {
  const R = dec(r), G = dec(g), B = dec(b);
  const X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047, Y = 0.2126 * R + 0.7152 * G + 0.0722 * B, Z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883;
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}
export function fromLab([L, a, b]) {
  const fy = (L + 16) / 116, X = fi(fy + a / 500) * 0.95047, Y = fi(fy), Z = fi(fy - b / 200) * 1.08883;
  const R = 3.2406 * X - 1.5372 * Y - 0.4986 * Z, G = -0.9689 * X + 1.8758 * Y + 0.0415 * Z, B = 0.0557 * X - 0.204 * Y + 1.057 * Z;
  return [enc(R), enc(G), enc(B)];
}
const Lstar = (v) => 116 * f(dec(v)) - 16; // L* of a neutral sRGB value
const vOfL = (L) => enc(fi((L + 16) / 116));

// ---- measured tables ---------------------------------------------------------------------------------
// ΔL* of a neutral at L* = 2.5, 7.5, ... 97.5 per step, from X-T3 JPEGs of Imaging Resource (the
// Sunlit series XT3OUTB HT/ST M2 M1 P0 P1), each less the exposure difference of its frame (the median
// where the setting cannot act). Down: the mean of -1 and of -2 halved (they agree within 0.3); up: +1.
const HIGHLIGHT_M1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -0.05, -0.51, -1.18, -2.02, -2.72, -3.03, -2.94, -2.05, -0.87];
const SHADOW_M1 = [1.4, 3.59, 4.25, 4.39, 4.06, 3.7, 3.27, 2.66, 1.77, 0.99, 0.37, 0.09, 0, 0, 0, 0, 0, 0, 0, 0];
const HIGHLIGHT_P1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.22, 0.67, 1.52, 2.44, 3.09, 3.07, 2.65, 1.69, 0.86];
const SHADOW_P1 = [-0.99, -2.63, -3.76, -4.29, -4.4, -4.05, -3.79, -3.23, -2.31, -1.36, -0.62, -0.15, 0, 0, 0, 0, 0, 0, 0, 0];
const interp = (table, L) => { const p = Math.min(19, Math.max(0, (L - 2.5) / 5)), i = Math.min(18, Math.floor(p)), w = p - i; return table[i] * (1 - w) + table[i + 1] * w; };
// Color Chrome Strong: ΔL* by (L*, C*) at full hue weight, from the FUJIFILM bluebell pair and the
// Fuji X Weekly X-T30 Off/Weak/Strong series; Weak is half (measured 0.47-0.52).
const CC_L = [25, 50, 75], CC_C = [8, 16, 33, 55];
const CC_STRONG = [
  [0, -2.9, -5.9, -7.5],
  [0, -1.5, -3.4, -6.3],
  [0, 0, -1.0, -3.6],
];
const bilinear = (L, C) => {
  const li = L <= 25 ? 0 : L >= 75 ? 1 : L < 50 ? 0 : 1, lw = Math.min(1, Math.max(0, (L - CC_L[li]) / 25));
  let ci = 0; while (ci < 2 && C > CC_C[ci + 1]) ci++;
  const cw = Math.min(1, Math.max(0, (C - CC_C[ci]) / (CC_C[ci + 1] - CC_C[ci])));
  const at = (l, c) => CC_STRONG[l][c];
  const top = at(li, ci) * (1 - cw) + at(li, ci + 1) * cw, bot = at(li + 1, ci) * (1 - cw) + at(li + 1, ci + 1) * cw;
  return top * (1 - lw) + bot * lw;
};
// Hue weight of Color Chrome (CIELAB hue in degrees): reds to greens; magenta-reds at half.
const ccHue = (h) => (h < 15 || h >= 345 ? 0.5 : h < 30 ? 0.5 + (h - 15) / 30 : h <= 150 ? 1 : h < 180 ? (180 - h) / 30 : 0);
// FX Blue Strong: ΔL* ≈ -0.32 C*, up to -15, on blue hues (centre 255°, ±45°); Weak is half (measured 0.49).
const blueHue = (h) => Math.max(0, 1 - Math.abs(h - 255) / 45);
// WB shift: per step, a gain on scene light (ln): red 0.045, blue 0.095 (+1R/-1B pair, Fuji X Weekly,
// through the slope of the tone curve of a film simulation).
const WB_R = 0.045, WB_B = 0.095;
// Color: chroma scale per step (Ektar and Provia 400 pairs; FUJIFILM_RECIPES.md gives its range).
const COLOR_STEP = 1.055;

export function settings(r) {
  const strength = (v) => (v === 'Strong' ? 1 : v === 'Weak' ? 0.5 : 0);
  return {
    wbRed: Number(r['WB Shift Red'] ?? 0), wbBlue: Number(r['WB Shift Blue'] ?? 0),
    highlight: Number(r.Highlight ?? 0), shadow: Number(r.Shadow ?? 0), color: Number(r.Color ?? 0),
    chrome: strength(r['Color Chrome Effect']), chromeBlue: strength(r['Color Chrome Effect Blue']),
  };
}

// The scene gains of the WB shift (R, G, B), for scene linear light before the film simulation.
export const wbGains = (s) => [Math.exp(WB_R * s.wbRed), 1, Math.exp(WB_B * s.wbBlue)];

// Everything after the film simulation, on display sRGB values 0..1.
export function post(rgb, s) {
  // Tone curve per channel: the neutral ΔL* at the L* of each channel value.
  const tone = (v) => {
    const L = Lstar(v);
    const h = s.highlight < 0 ? -s.highlight * interp(HIGHLIGHT_M1, L) : s.highlight * interp(HIGHLIGHT_P1, L);
    const sh = s.shadow < 0 ? -s.shadow * interp(SHADOW_M1, L) : s.shadow * interp(SHADOW_P1, L);
    return vOfL(Math.min(100, Math.max(0, L + h + sh)));
  };
  let c = rgb.map(tone);
  let [L, a, b] = toLab(c);
  // Color: chroma scale, lightness and hue kept.
  const k = COLOR_STEP ** s.color;
  a *= k; b *= k;
  const C = Math.hypot(a, b), h = ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
  // Color Chrome and FX Blue darken a colour by its chroma; its a*, b* stay.
  L += s.chrome * ccHue(h) * bilinear(L, C);
  L += s.chromeBlue * blueHue(h) * -Math.min(15, 0.32 * C);
  return fromLab([Math.max(0, L), a, b]);
}

// ---- the cube ---------------------------------------------------------------------------------------
// F-Log2 (FUJIFILM data sheet).
const FL = { a: 5.555556, b: 0.064829, c: 0.245281, d: 0.384316, e: 8.799461, f: 0.092864, cut1: 0.000889, cut2: 0.100686685370811 };
const flogDecode = (y) => (y >= FL.cut2 ? (10 ** ((y - FL.d) / FL.c) - FL.b) / FL.a : (y - FL.f) / FL.e);
const flogEncode = (x) => (x >= FL.cut1 ? FL.c * Math.log10(FL.a * x + FL.b) + FL.d : FL.e * x + FL.f);
export function readCube(file) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const rows = lines.filter((l) => /^\s*-?[\d.]+(e-?\d+)?\s+-?[\d.]+(e-?\d+)?\s+-?[\d.]+(e-?\d+)?\s*$/i.test(l)).map((l) => l.trim().split(/\s+/).map(Number));
  return { n: Math.round(Math.cbrt(rows.length)), rows, header: lines.filter((l) => /^\s*#/.test(l)) };
}
export function sample(cube, r, g, b) {
  const n = cube.n, p = [r, g, b].map((v) => Math.min(n - 1, Math.max(0, v * (n - 1))));
  const i = p.map((v) => Math.min(n - 2, Math.floor(v))), w = p.map((v, k) => v - i[k]);
  const out = [0, 0, 0];
  for (let d = 0; d < 8; d++) {
    const o = [d & 1, (d >> 1) & 1, (d >> 2) & 1];
    const wt = o.reduce((acc, bit, k) => acc * (bit ? w[k] : 1 - w[k]), 1);
    const row = cube.rows[(i[0] + o[0]) + (i[1] + o[1]) * n + (i[2] + o[2]) * n * n];
    for (let k = 0; k < 3; k++) out[k] += wt * row[k];
  }
  return out;
}
// The recipe cube: F-Log2 in, the look out. The film simulation LUT gives BT.709-encoded values, which
// the camera writes as its JPEG values; post() works on them as sRGB values, as they were measured.
export function recipeCube(simCube, s) {
  const n = simCube.n, g = wbGains(s), out = [];
  for (let bi = 0; bi < n; bi++) for (let gi = 0; gi < n; gi++) for (let ri = 0; ri < n; ri++) {
    const scene = [ri, gi, bi].map((v, k) => flogDecode(v / (n - 1)) * g[k]);
    const disp = sample(simCube, ...scene.map(flogEncode));
    out.push(post(disp.map((v) => Math.min(1, Math.max(0, v))), s));
  }
  return { n, rows: out };
}
export function writeCube(file, cube, title) {
  fs.writeFileSync(file, `TITLE "${title}"\nLUT_3D_SIZE ${cube.n}\n${cube.rows.map((r) => r.map((v) => v.toFixed(6)).join(' ')).join('\n')}\n`);
}
