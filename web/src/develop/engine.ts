/**
 * The development of one picture with develop.wasm (web/develop/): the film look into 4:2:2 planes,
 * the modules of the camera in its order, the border, then RGBA pixels for the screen or a JPEG.
 * It touches no DOM, so the worker and the Node checks run the same code.
 */
import { borderMargins, scaleMargins, steps, type DevelopSettings, type Margins } from './settings';

interface Exports {
  memory: WebAssembly.Memory;
  dev_alloc(bytes: number): number;
  dev_free(): void;
  dev_time(year: number, month: number, day: number, hour: number, minute: number, second: number): void;
  dev_shot(known: number, iso: number, fNumber: number, exposureUs: number, av: number, tv: number, sv: number, sceneEv: number): void;
  dev_white(r: number, g: number, b: number): void;
  dev_set(y: number, c: number, w: number, h: number, sy: number, sc: number, sw: number, sh: number, turns: number, mono: number): number;
  dev_color8(rgba: number, top: number, rows: number, lut: number, n: number): void;
  dev_color16(rgb: number, top: number, rows: number, table: number, size: number, low: number, weight: number): void;
  dev_screennail(): void;
  dev_downscale(y: number, c: number, dw: number, dh: number, pitch: number, acc: number): void;
  dev_blend(rgba: number, bw: number, bh: number, left: number, top: number): void;
  dev_rgba(out: number, turns: number, margin: number, border: number): void;
  dev_encode(quality: number, margin: number, border: number, app1: number, app1Bytes: number, out: number, cap: number): void;
  dev_glow(bloom: number, halation: number, color: number): void;
  dev_leak(look: number, vignette: number, dust: number, leak: number, scratches: number, seed: number): void;
  dev_diffusion(strength: number, mist: number, streak: number): void;
  dev_softness(level: number): void;
  dev_grain(level: number, size: number, full: number): void;
  dev_date(style: number, look: number, position: number, color: number, size: number, corner: number, glow: number, caption: number): void;
}

/** A running develop.wasm. Its memory grows to the largest picture; drop it to give the memory back. */
export class Engine {
  private sink: ((bytes: Uint8Array) => void) | null = null;
  private tick: ((done: number, total: number) => void) | null = null;
  private readonly x: Exports;
  private constructor(x: Exports) {
    this.x = x;
  }

  static async create(module: WebAssembly.Module): Promise<Engine> {
    let engine: Engine | null = null;
    const instance = await WebAssembly.instantiate(module, {
      env: {
        flush: (at: number, bytes: number) => engine!.sink?.(new Uint8Array(engine!.x.memory.buffer, at, bytes).slice()),
        progress: (done: number, total: number) => engine!.tick?.(done, total),
      },
    });
    engine = new Engine(instance.exports as unknown as Exports);
    return engine;
  }

  get exports(): Exports {
    return this.x;
  }

  alloc(bytes: number): number {
    const at = this.x.dev_alloc(bytes);
    if (!at) throw new Error('Out of memory');
    return at;
  }

  bytes(at: number, length: number): Uint8Array {
    return new Uint8Array(this.x.memory.buffer, at, length);
  }

  /** Copies `data` into new memory and returns its address. */
  put(data: ArrayBufferView): number {
    const at = this.alloc(data.byteLength);
    this.bytes(at, data.byteLength).set(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
    return at;
  }

  free(): void {
    this.x.dev_free();
  }

  /** Runs `encode` with its JPEG pieces collected and its progress reported. */
  collect(encode: () => void, progress?: (fraction: number) => void): Uint8Array[] {
    const parts: Uint8Array[] = [];
    this.sink = (bytes) => parts.push(bytes);
    this.tick = progress ? (done, total) => progress(total ? done / total : 1) : null;
    try {
      encode();
    } finally {
      this.sink = null;
      this.tick = null;
    }
    return parts;
  }
}

/** A picture in its stored orientation, read in strips of rows. */
export interface Source {
  /** The stored size; the width is even. */
  width: number;
  height: number;
  /** The quarter turns clockwise that show it upright (EXIF Orientation). */
  turns: number;
  /** 8-bit RGBA rows of a JPEG or another picture, or 16-bit linear RGB rows of a RAW development. */
  kind: 'rgba8' | 'linear16';
  /** Fills `into` with rows `top` to `top + rows - 1`. */
  read(top: number, rows: number, into: Uint8Array | Uint16Array): void | Promise<void>;
}

/** The colour of the look for a source: the table of dev_color8 or dev_color16, and its white. */
export type LookTable =
  | { kind: 'rgba8'; lut: Uint16Array; n: number; white: [number, number, number] }
  | { kind: 'linear16'; table: Uint8Array; size: number; low: Uint16Array; weight: Float32Array; white: [number, number, number] };

export interface ShotData {
  taken: { year: number; month: number; day: number; hour: number; minute: number; second: number } | null;
  iso: number | null;
  fNumber: number | null;
  exposure: number | null;
}

export interface Picture {
  /** The planes in the memory of the engine. */
  y: number;
  c: number;
  width: number;
  height: number;
  turns: number;
}

const STRIP = 64;

/** The screennail size for a picture: 720 wide, as the camera's (720 x 480 for 3:2). */
export function screennailSize(width: number, height: number): [number, number] {
  const sw = Math.min(720, width & ~1);
  return [sw, Math.max(2, Math.round((height * sw) / width))];
}

/** The film look of `source` into new planes. */
export async function colour(engine: Engine, source: Source, look: LookTable, progress?: (fraction: number) => void): Promise<Picture> {
  const { width, height } = source;
  if (width % 2 || width < 16 || height < 16) throw new Error('Unsupported picture size');
  if (look.kind !== source.kind) throw new Error('Look table of another kind');
  const y = engine.alloc(width * height), c = engine.alloc(width * height);
  const x = engine.exports;
  x.dev_set(y, c, width, height, 0, 0, 0, 0, source.turns, 0);
  if (look.kind === 'rgba8') {
    const lut = engine.put(look.lut);
    const strip = engine.alloc(width * STRIP * 4);
    for (let top = 0; top < height; top += STRIP) {
      const rows = Math.min(STRIP, height - top);
      await source.read(top, rows, engine.bytes(strip, width * rows * 4));
      x.dev_color8(strip, top, rows, lut, look.n);
      progress?.((top + rows) / height);
    }
  } else {
    const table = engine.put(look.table), low = engine.put(look.low), weight = engine.put(look.weight);
    const strip = engine.alloc(width * STRIP * 6);
    for (let top = 0; top < height; top += STRIP) {
      const rows = Math.min(STRIP, height - top);
      await source.read(top, rows, new Uint16Array(engine.exports.memory.buffer, strip, width * rows * 3));
      x.dev_color16(strip, top, rows, table, look.size, low, weight);
      progress?.((top + rows) / height);
    }
  }
  return { y, c, width, height, turns: source.turns };
}

/** The shot data and the time of a picture for the modules. */
export function setShot(engine: Engine, shot: ShotData, white: [number, number, number], now = new Date()): void {
  const x = engine.exports;
  const t = shot.taken ?? { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate(), hour: now.getHours(), minute: now.getMinutes(), second: now.getSeconds() };
  x.dev_time(t.year, t.month, t.day, t.hour, t.minute, t.second);
  if (shot.iso && shot.fNumber && shot.exposure) {
    const av = Math.round(2 * Math.log2(shot.fNumber) * 256);
    const tv = Math.round(-Math.log2(shot.exposure) * 256);
    const sv = Math.round(Math.log2(shot.iso / 3.125) * 256);
    const ev = Math.log2((shot.fNumber * shot.fNumber) / shot.exposure) - Math.log2(shot.iso / 100);
    x.dev_shot(1, shot.iso, Math.round(shot.fNumber * 10), Math.round(shot.exposure * 1e6), av, tv, sv, Math.round(ev * 256));
  } else {
    x.dev_shot(0, 0, 0, 0, 0, 0, 0, 0);
  }
  x.dev_white(...white);
}

export interface ModuleOptions {
  mono: boolean;
  /** The width of the full picture, when `picture` is a smaller preview of it (Grain). */
  fullWidth?: number;
  /** The seed of the dust and scratches of Light Leak (0: from the picture, as the camera). */
  seed?: number;
  /** Leaves out Film Softness, which does not show below the full size. */
  preview?: boolean;
  progress?: (fraction: number) => void;
}

/**
 * The modules of `settings` on the planes of `picture`, in the order of the camera, each with a
 * screennail made from the picture as it is then.
 */
export function runModules(engine: Engine, picture: Picture, settings: DevelopSettings, iso: number | null, options: ModuleOptions): void {
  const x = engine.exports;
  const [sw, sh] = screennailSize(picture.width, picture.height);
  const sy = engine.alloc(sw * sh), sc = engine.alloc(sw * sh);
  x.dev_set(picture.y, picture.c, picture.width, picture.height, sy, sc, sw, sh, picture.turns, options.mono ? 1 : 0);
  const list = steps(settings, iso).filter((step) => !(options.preview && step.module === 'softness'));
  list.forEach((step, i) => {
    x.dev_screennail();
    switch (step.module) {
      case 'glow':
        x.dev_glow(step.bloom, step.halation, step.color);
        break;
      case 'leak':
        x.dev_leak(step.look, step.vignette, step.dust, step.leak, step.scratches, options.seed ?? 0);
        break;
      case 'diffusion':
        x.dev_diffusion(step.strength, step.mist, step.streak);
        break;
      case 'softness':
        x.dev_softness(step.level);
        break;
      case 'grain':
        x.dev_grain(step.level, step.size, options.fullWidth ?? 0);
        break;
      case 'date':
        x.dev_date(step.style, step.look, step.position, step.color, step.size, step.corner, step.glow, step.caption);
        break;
    }
    options.progress?.((i + 1) / list.length);
  });
}

/** The border of `settings` for the picture, in its pixels. */
export const marginsOf = (settings: DevelopSettings, picture: Picture): Margins =>
  borderMargins(settings.border.style, picture.width, picture.height, picture.turns);

/** The size of the picture with its border, upright. */
export function canvasSize(picture: Picture, margins: Margins): [number, number] {
  const w = picture.width + margins[0] + margins[2], h = picture.height + margins[1] + margins[3];
  return picture.turns & 1 ? [h, w] : [w, h];
}

/** Upright RGBA pixels of the picture with its border, for the screen. */
export function rgba(engine: Engine, picture: Picture, margins: Margins, black: boolean): { width: number; height: number; data: Uint8ClampedArray<ArrayBuffer> } {
  const [width, height] = canvasSize(picture, margins);
  const out = engine.alloc(width * height * 4);
  const m = engine.put(new Uint32Array(margins));
  engine.exports.dev_set(picture.y, picture.c, picture.width, picture.height, 0, 0, 0, 0, picture.turns, 0);
  engine.exports.dev_rgba(out, picture.turns, m, black ? 0 : 255);
  const data = new Uint8ClampedArray(width * height * 4);
  data.set(engine.bytes(out, width * height * 4));
  return { width, height, data };
}

/**
 * A smaller copy of the picture whose canvas (with the border) has `maxSide` on its long side,
 * with the border drawn into its planes, so that a credit line can go over it.
 */
export function shrink(engine: Engine, picture: Picture, margins: Margins, black: boolean, maxSide: number): { picture: Picture; margins: Margins } {
  const cw = picture.width + margins[0] + margins[2], ch = picture.height + margins[1] + margins[3];
  const scale = Math.min(1, maxSide / Math.max(cw, ch));
  const m = scaleMargins(margins, scale);
  const w = Math.max(16, Math.round((picture.width * scale) / 2) * 2), h = Math.max(16, Math.round(picture.height * scale));
  const W = w + m[0] + m[2], H = h + m[1] + m[3];
  const y = engine.alloc(W * H), c = engine.alloc(W * H);
  engine.bytes(y, W * H).fill(black ? 0 : 255);
  engine.bytes(c, W * H).fill(128);
  const acc = engine.alloc(Math.max(w, 16) * 4);
  engine.exports.dev_set(picture.y, picture.c, picture.width, picture.height, 0, 0, 0, 0, picture.turns, 0);
  engine.exports.dev_downscale(y + m[1] * W + m[0], c + m[1] * W + m[0], w, h, W, acc);
  return { picture: { y, c, width: W, height: H, turns: picture.turns }, margins: m };
}

/** RGBA pixels (from a small canvas) blended over the picture at (left, top) of its stored planes. */
export function blend(engine: Engine, picture: Picture, pixels: { width: number; height: number; data: Uint8ClampedArray }, left: number, top: number): void {
  const at = engine.put(pixels.data);
  engine.exports.dev_set(picture.y, picture.c, picture.width, picture.height, 0, 0, 0, 0, picture.turns, 0);
  engine.exports.dev_blend(at, pixels.width, pixels.height, left & ~1, top);
}

/** The JPEG of the picture inside `margins`, with the APP1 (EXIF) `app1`. */
export function encode(engine: Engine, picture: Picture, margins: Margins, black: boolean, quality: number, app1: Uint8Array | null, progress?: (fraction: number) => void): Uint8Array[] {
  const m = engine.put(new Uint32Array(margins));
  const exif = app1 ? engine.put(app1) : 0;
  const cap = 1 << 20;
  const out = engine.alloc(cap);
  engine.exports.dev_set(picture.y, picture.c, picture.width, picture.height, 0, 0, 0, 0, picture.turns, 0);
  return engine.collect(() => engine.exports.dev_encode(quality, m, black ? 0 : 255, exif, app1?.length ?? 0, out, cap), progress);
}
