// Photos for the assistant: a picture of the camera screen or of the card's files, from the
// camera or the library on a phone, or pasted or dropped on a computer. Each one is drawn on a
// canvas, which turns it upright by its EXIF orientation and leaves every bit of metadata (place,
// time, camera) behind, then shrunk to 1280 px on its long side and sent as a JPEG. The service
// passes it to the model and keeps nothing (services/plus/src/chat/image.ts checks it again).

/** The largest file the visitor may pick, before it is shrunk. */
export const MAX_ORIGINAL = 8 * 1024 * 1024;
/** The long side of a sent photo. */
export const MAX_SIDE = 1280;
/** The long side of the small copy that stays with the conversation on this device. */
export const THUMB_SIDE = 240;
/** The most base64 characters of one sent photo (the service takes 400 KB decoded, 600 KB a body). */
export const MAX_BASE64 = 270_000;

export type PhotoProblem = 'notImage' | 'tooBig' | 'unreadable';

export class PhotoError extends Error {
  constructor(public problem: PhotoProblem) {
    super(problem);
  }
}

export interface Photo {
  /** The JPEG for the service, base64 without the data: prefix. */
  data: string;
  /** The same photo as a data URL, for the preview. */
  url: string;
  /** A small JPEG data URL that the conversation keeps on this device. */
  thumb: string;
  width: number;
  height: number;
}

/** Whether a picked, pasted, or dropped file can be a photo, before reading it. */
export function checkFile(file: { type: string; size: number; name?: string }): PhotoProblem | null {
  const heic = /\.(heic|heif)$/i.test(file.name ?? '');
  if (!file.type.startsWith('image/') && !heic) return 'notImage';
  if (/^image\/svg/.test(file.type)) return 'notImage';
  if (file.size > MAX_ORIGINAL) return 'tooBig';
  return null;
}

/** The size that fits `width` × `height` into `max` on the long side, never larger than it was. */
export function fitSize(width: number, height: number, max: number): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

type Source = { image: CanvasImageSource; width: number; height: number; close?: () => void };

/** The file as something to draw, upright: createImageBitmap, else an <img> (both apply EXIF orientation). */
async function decode(file: Blob): Promise<Source> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { image: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    } catch {
      // Safari reads some files (HEIC) only through <img>.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return { image: img, width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    // The <img> keeps its decoded pixels after the URL is revoked.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function draw(source: Source, max: number, quality: number): string {
  const size = fitSize(source.width, source.height, max);
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext('2d');
  if (!context) throw new PhotoError('unreadable');
  // A transparent PNG on white, as JPEG has no transparency.
  context.fillStyle = '#fff';
  context.fillRect(0, 0, size.width, size.height);
  context.imageSmoothingQuality = 'high';
  context.drawImage(source.image, 0, 0, size.width, size.height);
  return canvas.toDataURL('image/jpeg', quality);
}

/** Reads, turns upright, shrinks, and re-encodes a photo. Throws PhotoError. */
export async function preparePhoto(file: File): Promise<Photo> {
  const problem = checkFile(file);
  if (problem) throw new PhotoError(problem);
  let source: Source;
  try {
    source = await decode(file);
  } catch {
    throw new PhotoError('unreadable');
  }
  try {
    if (!source.width || !source.height) throw new PhotoError('unreadable');
    // Smaller and softer until it fits: screens with fine text stay readable at these steps.
    let url = '';
    for (const [side, quality] of [
      [MAX_SIDE, 0.8],
      [MAX_SIDE, 0.65],
      [1024, 0.6],
      [800, 0.55],
    ] as const) {
      url = draw(source, side, quality);
      if (url.length - url.indexOf(',') - 1 <= MAX_BASE64) break;
    }
    const data = url.slice(url.indexOf(',') + 1);
    if (!url.startsWith('data:image/jpeg;base64,') || data.length > MAX_BASE64) throw new PhotoError('unreadable');
    const size = fitSize(source.width, source.height, MAX_SIDE);
    return { data, url, thumb: draw(source, THUMB_SIDE, 0.7), ...size };
  } finally {
    source.close?.();
  }
}

/** The image files of a paste or a drop. */
export function imageFiles(list: DataTransfer | null): File[] {
  if (!list) return [];
  const files = [...list.files];
  if (files.length) return files;
  return [...list.items].filter((item) => item.kind === 'file').map((item) => item.getAsFile()).filter((file): file is File => !!file);
}

/** Whether a drag carries files (the page then shows where to drop). */
export const dragHasFiles = (list: DataTransfer | null) => !!list && [...list.types].includes('Files');
