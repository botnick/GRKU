import type { Cover } from './catalog';

/** The kind of film of an effect, for the filters of the list: what the stripe of its box says. */
export type FilmKind = 'negative' | 'slide' | 'mono' | 'cine' | 'instant' | 'camera' | 'imported';

export const FILM_KINDS: readonly FilmKind[] = ['negative', 'slide', 'mono', 'cine', 'instant', 'camera', 'imported'];

/** The films that are slide (reversal) film, by the start of the name on the box. */
const SLIDE = ['VELVIA', 'PROVIA', 'ASTIA', 'SENSIA', 'EKTACHROME', 'KODACHROME', 'ELITE', 'PRECISA', 'AGFACHROME', 'AEROCHROME', 'X-PRO', 'POLACHROME', 'FORTIA'];
/** The film simulations of the FUJIFILM digital cameras: by the name and number on the box (scripts/flap-icons.py FUJI_SIMS). */
const FUJI_SIMS = ['PROVIA', 'VELVIA', 'ASTIA', 'CLASSIC CHROME', 'CLASSIC NEG', 'PRO NEG STD', 'REALA ACE', 'ETERNA', 'ETERNA BB', 'ACROS'];
/** The FUJIFILM recipes by effect ID: a film simulation with the camera's settings, on the box of the
 * film each is named after (scripts/flap-icons.py FUJI_RECIPES). Free camera looks, as the simulations. */
export const FUJI_RECIPES = ['fj-reggies-portra-v1', 'fj-kodachrome-64-v1', 'fj-gold-200-v1', 'fj-tri-x-400-v1', 'fj-reggies-superia-v1'];
/** The instant films, by the start of the name on the box. */
const INSTANT = ['INSTAX', 'FP-', 'PX', 'TIME ZERO', 'POLAROID', 'TYPE'];

interface Classified {
  id?: string;
  monochrome?: boolean;
  cover?: Cover;
  look?: string;
  imported?: unknown;
  card?: unknown;
}

/** The same rules as the stripe of the box (scripts/flap-icons.py, film_kind). */
export function filmKind(effect: Classified): FilmKind {
  if (effect.imported || effect.card) return 'imported';
  const cover = effect.cover;
  const name = (cover?.name ?? '').toUpperCase();
  const look = (effect.look ?? '').toLowerCase();
  if (cover?.brand === 'FUJIFILM' && FUJI_SIMS.includes(`${name} ${cover.number ?? ''}`.trim())) return 'camera';
  if (effect.id && FUJI_RECIPES.includes(effect.id)) return 'camera';
  if (effect.monochrome) return 'mono';
  if (cover?.template === 'cine') return 'cine';
  if (cover?.brand === 'POLAROID' || INSTANT.some((prefix) => name.startsWith(prefix)) || look.includes('instax')) return 'instant';
  if (SLIDE.some((prefix) => name.startsWith(prefix)) || look.includes('projected') || look.includes('slide')) return 'slide';
  if (cover?.brand === 'RICOH') return 'camera';
  return 'negative';
}

/** The brand as it reads on the box, from the code of the cover. */
const BRANDS: Record<string, string> = {
  Kodak: 'Kodak',
  FUJIFILM: 'Fujifilm',
  ILFORD: 'Ilford',
  AGFA: 'Agfa',
  CINESTILL: 'CineStill',
  HARMAN: 'Harman',
  LOMO: 'Lomography',
  ROLLEI: 'Rollei',
  POLAROID: 'Polaroid',
  RICOH: 'Ricoh',
};

export function brandOf(effect: Classified): string {
  const code = effect.cover?.brand;
  return code ? (BRANDS[code] ?? code) : '';
}

/**
 * The colours of the brand band of the film boxes (scripts/flap-icons.py BANDS), for the small
 * brand mark of the filters: the band, then its text. Polaroid's band is white with the rainbow.
 */
export const BRAND_STYLE: Readonly<Record<string, { band: string; text: string; rainbow?: boolean }>> = {
  Kodak: { band: '#fac800', text: '#d2141e' },
  Fujifilm: { band: '#008c46', text: '#ffffff' },
  Ilford: { band: '#000000', text: '#ffffff' },
  Agfa: { band: '#d2141e', text: '#ffffff' },
  Polaroid: { band: '#ffffff', text: '#000000', rainbow: true },
  Lomography: { band: '#000000', text: '#ffffff' },
  Rollei: { band: '#14285a', text: '#ffffff' },
  CineStill: { band: '#000000', text: '#ffffff' },
  Harman: { band: '#000000', text: '#f08c00' },
  Ricoh: { band: '#282828', text: '#ffffff' },
};
