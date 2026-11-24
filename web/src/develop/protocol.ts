/** The messages between the Develop page and its workers (develop.worker.ts). */
import type { Fidelity } from './exif';
import type { DevelopSettings } from './settings';

/** The tables of a look: the site's preview table of the effect and the baseline (Standard). */
export interface LookUrls {
  /** The preview table of the effect, or null for the photo as it is. */
  look: string | null;
  standard: string;
  monochrome: boolean;
}

export type Request =
  | { type: 'init'; module: WebAssembly.Module }
  /** Opens a photo for previews: decodes it at `side` pixels on its long side. */
  | { type: 'open'; id: number; file: File; side: number; standard: string }
  | { type: 'close'; id: number }
  /** A preview; `thumb` makes it that many pixels on its long side (the cards of the styles). */
  | { type: 'preview'; id: number; seq: number; channel: string; settings: DevelopSettings; urls: LookUrls; thumb?: number }
  /** Develops a photo at full size, then makes its JPEG: at most `maxSide` on the long side with the credit, or full size. */
  | { type: 'export'; id: number; file: File; settings: DevelopSettings; urls: LookUrls; maxSide: number | null; credit: string | null; seed: number };

export interface Opened {
  width: number;
  height: number;
  fidelity: Fidelity;
  camera: string;
  imageControl: string | null;
  taken: string | null;
  iso: number | null;
  /** The photo as it is, upright, at preview size. */
  before: ImageBitmap;
}

export type Response =
  | { type: 'opened'; id: number; photo: Opened }
  | { type: 'preview'; id: number; seq: number; channel: string; image: ImageBitmap; ms: number; margins: [number, number, number, number] }
  | { type: 'progress'; id: number; phase: 'decode' | 'colour' | 'modules' | 'encode'; fraction: number }
  | { type: 'exported'; id: number; blob: Blob; width: number; height: number; ms: number }
  | { type: 'error'; id: number; seq?: number; channel?: string; message: string };

/** A seed of a photo for the dust and scratches of Light Leak, the same at each size. */
export function photoSeed(file: Pick<File, 'name' | 'size' | 'lastModified'>): number {
  let h = 0x811c9dc5;
  for (const c of `${file.name}\n${file.size}\n${file.lastModified}`) h = Math.imul(h ^ c.charCodeAt(0), 0x01000193);
  return h >>> 0 || 1;
}
