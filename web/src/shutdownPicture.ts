import { SHUTDOWN_PICTURE, type CardChanges, type CardFile } from './card';
import { loadWasm } from './package';
import { DESIGN_FONTS, drawDesign, type DesignChoice } from './shutdownDesigns';

/** The size of the picture of Shutdown Screen (`grku_core::goodbye`). */
export const PICTURE_WIDTH = 720;
export const PICTURE_HEIGHT = 480;
/** The name of the file in the `GRKU` folder of the card. */
export const PICTURE_NAME = 'GOODBYE.JPG';

/**
 * The shutdown picture of the page: the file that the user made from a picture, `remove` to
 * delete the file of the card, or null to leave the card as it is.
 */
export type PictureChoice = Uint8Array | 'remove' | null;

/** The part of a source of `width` by `height` that fills the picture: centered, at its ratio. */
export function coverCrop(width: number, height: number): { x: number; y: number; width: number; height: number } {
  const wide = width * PICTURE_HEIGHT > height * PICTURE_WIDTH;
  const crop = wide
    ? { width: (height * PICTURE_WIDTH) / PICTURE_HEIGHT, height }
    : { width, height: (width * PICTURE_HEIGHT) / PICTURE_WIDTH };
  return { x: (width - crop.width) / 2, y: (height - crop.height) / 2, ...crop };
}

/** The JPEG of 720 by 480 RGBA pixels, as the camera shows it. */
async function encode(pixels: Uint8ClampedArray): Promise<Uint8Array> {
  const wasm = await loadWasm();
  return wasm.shutdownPicture(new Uint8Array(pixels.buffer, pixels.byteOffset, pixels.byteLength));
}

/**
 * Loads the faces that the designs draw `text` with, so a design draws the same in the preview
 * and in the file. The page of each language loads its own fonts; a Thai text on another page
 * loads the Thai face here. A face that does not load leaves a system font.
 */
export async function prepareDesignFonts(text: string): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  const thai = /[\u0E00-\u0E7F]/.test(text);
  if (thai) {
    await Promise.all([
      import('@fontsource/ibm-plex-sans-thai/thai-500.css'),
      import('@fontsource/ibm-plex-sans-thai/thai-700.css'),
    ]).catch(() => undefined);
  }
  const specs = [...DESIGN_FONTS, ...(thai ? ['700 40px "IBM Plex Sans Thai"', '500 40px "IBM Plex Sans Thai"'] : [])];
  await Promise.all(specs.map((spec) => document.fonts.load(spec, `Aa0 ${text}`).catch(() => [])));
}

/** The file of a design, drawn once its fonts have loaded. */
export async function makeDesignPicture(choice: DesignChoice): Promise<Uint8Array> {
  await prepareDesignFonts(choice.text);
  const canvas = new OffscreenCanvas(PICTURE_WIDTH, PICTURE_HEIGHT);
  const context = canvas.getContext('2d')!;
  drawDesign(context, choice);
  return encode(context.getImageData(0, 0, PICTURE_WIDTH, PICTURE_HEIGHT).data);
}

/**
 * The file of the picture in `source`, an image file of any size: the center of the picture at
 * the ratio of the screen, as a JPEG that the camera shows. It fails for a file that the browser
 * cannot decode.
 */
export async function makePicture(source: Blob): Promise<Uint8Array> {
  const bitmap = await createImageBitmap(source, { imageOrientation: 'from-image' });
  try {
    const canvas = new OffscreenCanvas(PICTURE_WIDTH, PICTURE_HEIGHT);
    const context = canvas.getContext('2d')!;
    const crop = coverCrop(bitmap.width, bitmap.height);
    context.imageSmoothingQuality = 'high';
    context.drawImage(bitmap, crop.x, crop.y, crop.width, crop.height, 0, 0, PICTURE_WIDTH, PICTURE_HEIGHT);
    return await encode(context.getImageData(0, 0, PICTURE_WIDTH, PICTURE_HEIGHT).data);
  } finally {
    bitmap.close();
  }
}

/** Whether the camera shows `bytes`, the file of a card. */
export async function isPicture(bytes: Uint8Array): Promise<boolean> {
  return (await loadWasm()).shutdownPictureUsable(bytes);
}

/** The change of the file of the card, `onCard`, that a write makes for `choice`. */
export function pictureChange(onCard: Uint8Array | null, choice: PictureChoice): CardChanges['shutdown'] {
  if (choice === null) return 'same';
  if (choice === 'remove') return onCard ? 'remove' : 'same';
  const same = onCard !== null && onCard.length === choice.length && onCard.every((byte, i) => byte === choice[i]);
  return same ? 'same' : 'write';
}

/**
 * The picture of the page for Shutdown Screen: the GRKU logo (`LOGO_PATH`), a ready-made design
 * (`shutdownDesigns`), the picture of the user, no picture (the camera shows its own screen, and a write removes the file of the card),
 * or the picture that the card has, left as it is.
 */
export type ShutdownKind = 'logo' | 'design' | 'own' | 'none' | 'keep';

/** The GRKU logo under the site root: a file of `shutdownPicture`, so the camera shows it as it is. */
export const LOGO_PATH = 'shutdown/grku.jpg';

const KIND_KEY = 'grku.shutdown';
const OWN_KEY = 'grku.shutdownPicture';
const KINDS: readonly ShutdownKind[] = ['logo', 'design', 'own', 'none', 'keep'];

/** The choice of the last visit: the kind, or null before the first choice, and the picture of the user. */
export function loadShutdown(storage: Pick<Storage, 'getItem'> | null): { kind: ShutdownKind | null; own: Uint8Array | null } {
  let kind: ShutdownKind | null = null;
  let own: Uint8Array | null = null;
  try {
    const saved = storage?.getItem(KIND_KEY) ?? null;
    if (KINDS.includes(saved as ShutdownKind)) kind = saved as ShutdownKind;
    const text = storage?.getItem(OWN_KEY) ?? null;
    if (text) own = Uint8Array.from(atob(text), (char) => char.charCodeAt(0));
  } catch {
    // An unreadable value is the same as none.
  }
  return { kind, own };
}

export function saveShutdownKind(storage: Pick<Storage, 'setItem'> | null, kind: ShutdownKind) {
  try {
    storage?.setItem(KIND_KEY, kind);
  } catch {
    // A convenience: without storage, the next visit starts from the default.
  }
}

/** Keeps the picture of the user for the next visit, or forgets it. */
export function saveOwnPicture(storage: Pick<Storage, 'setItem' | 'removeItem'> | null, bytes: Uint8Array | null) {
  try {
    if (!bytes) {
      storage?.removeItem(OWN_KEY);
      return;
    }
    let text = '';
    for (const byte of bytes) text += String.fromCharCode(byte);
    storage?.setItem(OWN_KEY, btoa(text));
  } catch {
    // A full storage keeps the picture for this visit only.
  }
}

/**
 * The kind that applies: the chosen one while it can apply, else the picture of the card where
 * the card has one, so a card keeps a picture that the user never chose here, else the logo.
 */
export function shutdownKind(chosen: ShutdownKind | null, own: Uint8Array | null, onCard: Uint8Array | null): ShutdownKind {
  if (chosen === 'own' && !own) chosen = null;
  if (chosen === 'keep' && !onCard) chosen = null;
  return chosen ?? (onCard ? 'keep' : 'logo');
}

/**
 * The file of a kind, `remove` for no picture, or null to leave the card; the logo and the design
 * are null until they load or draw.
 */
export function pictureFor(
  kind: ShutdownKind,
  logo: Uint8Array | null,
  own: Uint8Array | null,
  design: Uint8Array | null = null,
): PictureChoice {
  switch (kind) {
    case 'logo':
      return logo;
    case 'design':
      return design;
    case 'own':
      return own;
    case 'none':
      return 'remove';
    case 'keep':
      return null;
  }
}

/** What a card write does for the planned change: the file to write, or the path to delete. */
export function shutdownWrite(
  change: CardChanges['shutdown'],
  choice: PictureChoice,
): { files: CardFile[]; remove: string[] } {
  if (change === 'write' && choice instanceof Uint8Array) {
    return { files: [{ path: SHUTDOWN_PICTURE, bytes: choice }], remove: [] };
  }
  return { files: [], remove: change === 'remove' ? [SHUTDOWN_PICTURE] : [] };
}

let logoFile: Promise<Uint8Array> | null = null;

/** The file of the GRKU logo, fetched once; a failed fetch tries again at the next call. */
export function loadLogo(url: string): Promise<Uint8Array> {
  logoFile ??= fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`Shutdown logo: ${response.status}`);
      return response.arrayBuffer();
    })
    .then((buffer) => new Uint8Array(buffer))
    .catch((error: unknown) => {
      logoFile = null;
      throw error;
    });
  return logoFile;
}
