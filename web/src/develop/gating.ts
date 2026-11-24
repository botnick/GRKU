/**
 * What the Develop page gives for free and what GRKU Plus adds. Plus is any purchase (plus.ts,
 * studioUnlocked): the whole shelf, more slots, or a pack.
 *
 * Free: every look previews; the camera looks and the starter looks download; a download is at
 * most FREE_SIDE pixels on its long side with a small GRKU credit; FREE_PHOTOS photos at a time.
 * Plus: every look downloads, at full size, without the credit, PLUS_PHOTOS photos at a time.
 */
import { DEFAULT_LOOKS, packOf, studioUnlocked, type Entitlement } from '../plus';

export const FREE_SIDE = 2048;
export const FREE_PHOTOS = 5;
export const PLUS_PHOTOS = 50;
/** The credit of a free download. */
export const CREDIT = 'GRKU · grku.app';

type Look = Parameters<typeof packOf>[0] & { id: string };

/** Whether GRKU Plus opens the Develop page in full. */
export const developPlus = (owned: Entitlement) => studioUnlocked(owned);

/** Whether a look downloads without Plus: a look of the camera (in no pack) or a starter look. */
export const freeLook = (look: Look) => packOf(look) === null || DEFAULT_LOOKS.includes(look.id);

/** Whether a download of `look` (null: no look) is allowed. */
export const canDownload = (look: Look | null, owned: Entitlement) => look === null || freeLook(look) || developPlus(owned);

export interface Limits {
  /** The long side of a download, or null for the full size. */
  maxSide: number | null;
  /** The credit line, or null. */
  credit: string | null;
  /** How many photos the page holds at once. */
  photos: number;
}

export function limitsOf(owned: Entitlement): Limits {
  return developPlus(owned) ? { maxSide: null, credit: null, photos: PLUS_PHOTOS } : { maxSide: FREE_SIDE, credit: CREDIT, photos: FREE_PHOTOS };
}
