/**
 * The painted backgrounds of the seasonal templates: pictures of the GRKU mascot made for the
 * screen of 720 by 480 (`public/studio/art/<id>.webp`). The page reads one when a picture shows
 * it; until it has, and where it cannot, the background is the `color` of the art, so a picture
 * always draws.
 */
import type { Photo } from './render';

export interface Art {
  id: string;
  /** The main color of the picture, drawn until it loads. */
  color: string;
}

export const ARTS: readonly Art[] = [
  { id: 'xmas-santa', color: '#E9D6C4' },
  { id: 'xmas-gift', color: '#F1D9C2' },
  { id: 'xmas-snow', color: '#1E2B4A' },
  { id: 'xmas-cocoa', color: '#E6CDB0' },
  { id: 'ny-party', color: '#141B3A' },
  { id: 'ny-balloons', color: '#F7D5C2' },
];

export const ART_IDS: readonly string[] = ARTS.map((art) => art.id);

export const findArt = (id: string): Art | undefined => ARTS.find((art) => art.id === id);

export const artUrl = (id: string) => `/studio/art/${id}.webp`;

const loaded = new Map<string, Photo>();
const listeners = new Set<() => void>();

/** Calls `listener` whenever the picture of an art has loaded, so a canvas draws again with it. */
export function onArtLoaded(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
const pending = new Map<string, Promise<Photo | null>>();

/** The picture of an art, if this visit has read it. */
export function artImage(id: string): Photo | undefined {
  return loaded.get(id);
}

/** Reads the picture of an art once a visit; null where it does not load (a failed read is tried again later). */
export function loadArt(id: string): Promise<Photo | null> {
  const done = loaded.get(id);
  if (done) return Promise.resolve(done);
  let request = pending.get(id);
  if (!request) {
    request = (async () => {
      try {
        if (!findArt(id) || typeof fetch === 'undefined' || typeof createImageBitmap === 'undefined') return null;
        const response = await fetch(artUrl(id));
        if (!response.ok) return null;
        const image = await createImageBitmap(await response.blob());
        loaded.set(id, image);
        for (const listener of listeners) listener();
        return image;
      } catch {
        return null;
      }
    })();
    pending.set(id, request);
    // Only a read on its way is shared; a read that failed is tried again the next time.
    void request.then(() => pending.delete(id));
  }
  return request;
}
