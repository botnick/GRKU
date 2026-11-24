/**
 * The film look of a JPEG as one table. The site's preview tables develop scene-linear light, so a
 * JPEG starts from the linear light whose Standard development is the JPEG, as
 * scripts/linear-sample.mjs finds it for the samples: the inverse neutral curve of each channel,
 * then a fixed-point iteration through the whole Standard table. Each JPEG has 256 levels per
 * channel, so this table holds that inversion and the look for a grid of JPEG colours, and the
 * picture takes it with one trilinear lookup per pixel (dev_color8). A grid of 65 stays within
 * 0.05 levels of the exact inversion on average, at most 2.
 */
import { srgbCoordinate } from '../preview/lut';

/** The fixed-point steps of the inversion, as linear-sample.mjs. */
const STEPS = 8;
/** The samples of the neutral curve of each channel. */
const SAMPLES = 4096;

const linear = (s: number) => (s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4);

/** An RGB table with `size` points on each axis, red fastest, sampled trilinearly at coordinates 0..1. */
function sampler(table: Uint8Array) {
  const size = Math.round(Math.cbrt(table.length / 3));
  if (size ** 3 * 3 !== table.length || size < 2) throw new Error('Preview table size mismatch');
  const s1 = size * 3, s2 = size * size * 3;
  return (r: number, g: number, b: number, out: Float64Array) => {
    const x = Math.min(1, Math.max(0, r)) * (size - 1), y = Math.min(1, Math.max(0, g)) * (size - 1), z = Math.min(1, Math.max(0, b)) * (size - 1);
    const ix = Math.min(Math.floor(x), size - 2), iy = Math.min(Math.floor(y), size - 2), iz = Math.min(Math.floor(z), size - 2);
    const fr = x - ix, fg = y - iy, fb = z - iz;
    const base = ix * 3 + iy * s1 + iz * s2;
    for (let c = 0; c < 3; c++) {
      const o = base + c;
      const c00 = table[o]! + (table[o + 3]! - table[o]!) * fr;
      const c10 = table[o + s1]! + (table[o + s1 + 3]! - table[o + s1]!) * fr;
      const c01 = table[o + s2]! + (table[o + s2 + 3]! - table[o + s2]!) * fr;
      const c11 = table[o + s2 + s1]! + (table[o + s2 + s1 + 3]! - table[o + s2 + s1]!) * fr;
      const c0 = c00 + (c10 - c00) * fg, c1 = c01 + (c11 - c01) * fg;
      out[c] = c0 + (c1 - c0) * fb;
    }
    return out;
  };
}

/** The inversion of the Standard development of `standard` (the baseline table of the catalog). */
export function standardInverse(standard: Uint8Array) {
  const sample = sampler(standard);
  const out = new Float64Array(3);
  const develop = (r: number, g: number, b: number) =>
    sample(srgbCoordinate(Math.min(1, Math.max(0, r))), srgbCoordinate(Math.min(1, Math.max(0, g))), srgbCoordinate(Math.min(1, Math.max(0, b))), out);
  const curves = [new Float64Array(SAMPLES + 1), new Float64Array(SAMPLES + 1), new Float64Array(SAMPLES + 1)] as const;
  for (let i = 0; i <= SAMPLES; i++) {
    const v = linear(i / SAMPLES);
    develop(v, v, v);
    for (let c = 0; c < 3; c++) curves[c]![i] = out[c]!;
  }
  /** The linear value whose neutral development in channel c is y (0..255). */
  const invert = (c: number, y: number) => {
    const curve = curves[c]!;
    let lo = 0, hi = SAMPLES;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (curve[mid]! < y) lo = mid;
      else hi = mid;
    }
    const span = curve[hi]! - curve[lo]!;
    return linear((lo + (span > 0 ? Math.min(1, Math.max(0, (y - curve[lo]!) / span)) : 0)) / SAMPLES);
  };
  const x = new Float64Array(3), x0 = new Float64Array(3);
  /** The scene-linear RGB (0..1, each a 16-bit level) of a JPEG colour (0..255 floats). */
  return (r: number, g: number, b: number, result: Float64Array) => {
    const y = [r, g, b];
    for (let c = 0; c < 3; c++) x0[c] = x[c] = Math.round(invert(c, y[c]!) * 65535) / 65535;
    for (let step = 0; step < STEPS; step++) {
      develop(x[0]!, x[1]!, x[2]!);
      for (let c = 0; c < 3; c++) x[c] = Math.min(1, Math.max(0, x[c]! + x0[c]! - invert(c, out[c]!)));
    }
    for (let c = 0; c < 3; c++) result[c] = Math.round(x[c]! * 65535) / 65535;
    return result;
  };
}

/**
 * The table of dev_color8: for each JPEG colour of an n x n x n grid, red fastest, the RGB of the
 * look x 256. `look` null keeps the colour of the photo (the Standard development of its light).
 */
export function jpegLookTable(standard: Uint8Array, look: Uint8Array | null, n = 65): Uint16Array {
  const inverse = standardInverse(standard);
  const develop = sampler(look ?? standard);
  const lin = new Float64Array(3), out = new Float64Array(3);
  const table = new Uint16Array(n * n * n * 3);
  let at = 0;
  for (let b = 0; b < n; b++)
    for (let g = 0; g < n; g++)
      for (let r = 0; r < n; r++) {
        if (!look) {
          // The photo as it is: the identity, exactly.
          table[at++] = Math.round((r * 255 * 256) / (n - 1));
          table[at++] = Math.round((g * 255 * 256) / (n - 1));
          table[at++] = Math.round((b * 255 * 256) / (n - 1));
          continue;
        }
        inverse((r * 255) / (n - 1), (g * 255) / (n - 1), (b * 255) / (n - 1), lin);
        develop(srgbCoordinate(lin[0]!), srgbCoordinate(lin[1]!), srgbCoordinate(lin[2]!), out);
        for (let c = 0; c < 3; c++) table[at++] = Math.round(Math.min(255, Math.max(0, out[c]!)) * 256);
      }
  return table;
}

/** The white of a look table of dev_color8 (picture_white): its RGB for JPEG white. */
export function tableWhite(table: Uint16Array, n: number): [number, number, number] {
  const at = (n * n * n - 1) * 3;
  return [0, 1, 2].map((c) => Math.min(255, Math.round(table[at + c]! / 256))) as [number, number, number];
}

/** The grid index and weight of each 16-bit linear level for a preview table of `size` (preview/lut.ts). */
export function linearIndex(size: number): { low: Uint16Array; weight: Float32Array } {
  const low = new Uint16Array(65536), weight = new Float32Array(65536);
  for (let v = 0; v < 65536; v++) {
    const x = srgbCoordinate(v / 65535) * (size - 1);
    const i = Math.min(Math.floor(x), size - 2);
    low[v] = i;
    weight[v] = x - i;
  }
  return { low, weight };
}

/** The white of a preview table: its RGB for linear white. */
export function linearWhite(table: Uint8Array): [number, number, number] {
  const at = table.length - 3;
  return [table[at]!, table[at + 1]!, table[at + 2]!];
}
