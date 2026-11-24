/**
 * The pictures that the visitor places as layers in the Studio: a logo, a cut-out with
 * transparency, a photo. Each is made small in the browser first (at most 1440 pixels on its longer
 * side), keeps its transparency, and stays in this browser (IndexedDB) under an id that its layer
 * names. Where the browser keeps no data, the pictures last for this visit.
 */
import { newId } from './model';
import type { Photo } from './render';

/** The longer side of a picture as kept: enough for a layer as large as the screen, zoomed in twice. */
export const IMAGE_MAX = 1440;

const DB_NAME = 'grku-studio';
const STORE = 'images';

/** The pictures of this visit, decoded. */
const memory = new Map<string, Photo>();

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null);
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function withStore<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | null> {
  const db = await openDb();
  if (!db) return null;
  try {
    return await new Promise<T | null>((resolve) => {
      const transaction = db.transaction(STORE, mode);
      const request = work(transaction.objectStore(STORE));
      transaction.oncomplete = () => resolve(request.result ?? null);
      transaction.onerror = () => resolve(null);
      transaction.onabort = () => resolve(null);
    });
  } catch {
    return null;
  } finally {
    db.close();
  }
}

/** The size of a picture of `width` by `height` made small to at most `max` on its longer side. */
export function fitSize(width: number, height: number, max = IMAGE_MAX): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/** Whether any pixel of RGBA `data` is not fully opaque. */
export function hasAlpha(data: Uint8ClampedArray): boolean {
  for (let i = 3; i < data.length; i += 4) if (data[i]! < 255) return true;
  return false;
}

/**
 * Reads an image file of any size and kind that the browser decodes (PNG, JPEG, WebP, HEIC where
 * the browser reads it), turned as its camera took it, makes it small, and keeps it. It fails for
 * a file that the browser cannot decode.
 */
export async function addImage(source: Blob): Promise<{ id: string; aspect: number; image: Photo }> {
  const full = await createImageBitmap(source, { imageOrientation: 'from-image' });
  const { width, height } = fitSize(full.width, full.height);
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d')!;
  context.imageSmoothingQuality = 'high';
  context.drawImage(full, 0, 0, width, height);
  full.close();
  const alpha = hasAlpha(context.getImageData(0, 0, width, height).data);
  // WebP keeps transparency in a small file; a browser without it writes PNG.
  const blob = alpha ? await canvas.convertToBlob({ type: 'image/webp', quality: 0.9 }) : await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.88 });
  const id = newId();
  const image = await createImageBitmap(canvas);
  memory.set(id, image);
  await withStore('readwrite', (store) => store.put(blob, id));
  return { id, aspect: width / height, image };
}

/** The pictures of `ids`, decoded, from this visit or this browser; a missing one is left out. */
export async function loadImages(ids: Iterable<string>): Promise<Map<string, Photo>> {
  const found = new Map<string, Photo>();
  for (const id of new Set(ids)) {
    let image = memory.get(id);
    if (!image) {
      const blob = await withStore<Blob>('readonly', (store) => store.get(id) as IDBRequest<Blob>);
      if (blob instanceof Blob) {
        try {
          image = await createImageBitmap(blob);
          memory.set(id, image);
        } catch {
          // A picture that no longer decodes is left out.
        }
      }
    }
    if (image) found.set(id, image);
  }
  return found;
}

/** Forgets the kept pictures that no layer of `keep` names. */
export async function pruneImages(keep: Iterable<string>): Promise<void> {
  const wanted = new Set(keep);
  const keys = await withStore<IDBValidKey[]>('readonly', (store) => store.getAllKeys());
  for (const key of keys ?? []) {
    if (typeof key === 'string' && !wanted.has(key)) await withStore('readwrite', (store) => store.delete(key));
  }
}
