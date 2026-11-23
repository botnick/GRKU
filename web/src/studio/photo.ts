/**
 * The photo of a Studio background. The browser keeps it as a JPEG of at most 1800 by 1200, so it
 * fits the storage of the page and still covers the screen when it is zoomed in twice.
 */

const PHOTO_KEY = 'grku.studioPhoto';
const MAX_WIDTH = 1800;
const MAX_HEIGHT = 1200;

function toBase64(bytes: Uint8Array): string {
  let text = '';
  for (let i = 0; i < bytes.length; i += 0x8000) text += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(text);
}

/** The photo of the last visit, decoded, or null. */
export async function loadPhoto(storage: Pick<Storage, 'getItem'> | null): Promise<ImageBitmap | null> {
  try {
    const text = storage?.getItem(PHOTO_KEY);
    if (!text) return null;
    const bytes = Uint8Array.from(atob(text), (char) => char.charCodeAt(0));
    return await createImageBitmap(new Blob([bytes], { type: 'image/jpeg' }));
  } catch {
    return null;
  }
}

/**
 * Decodes `source`, an image file of any size, turned as its camera took it, and keeps a smaller
 * copy in this browser. It fails for a file that the browser cannot decode.
 */
export async function savePhoto(storage: Pick<Storage, 'setItem'> | null, source: Blob): Promise<ImageBitmap> {
  const bitmap = await createImageBitmap(source, { imageOrientation: 'from-image' });
  const scale = Math.min(1, MAX_WIDTH / bitmap.width, MAX_HEIGHT / bitmap.height, Math.sqrt((MAX_WIDTH * MAX_HEIGHT) / (bitmap.width * bitmap.height)));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d')!;
  context.imageSmoothingQuality = 'high';
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.86 });
  try {
    storage?.setItem(PHOTO_KEY, toBase64(new Uint8Array(await blob.arrayBuffer())));
  } catch {
    // A full storage keeps the photo for this visit only.
  }
  return createImageBitmap(canvas);
}
