import type { Cover } from './catalog';

/** The kind of film of an effect, for the filters of the list: what the stripe of its box says. */
export type FilmKind = 'negative' | 'slide' | 'mono' | 'cine' | 'instant' | 'camera' | 'imported';

export const FILM_KINDS: readonly FilmKind[] = ['negative', 'slide', 'mono', 'cine', 'instant', 'camera', 'imported'];

/** The films that are slide (reversal) film, by the start of the name on the box. */
const SLIDE = ['VELVIA', 'PROVIA', 'ASTIA', 'SENSIA', 'EKTACHROME', 'KODACHROME', 'ELITE', 'PRECISA', 'AGFACHROME', 'AEROCHROME', 'X-PRO', 'POLACHROME', 'FORTIA'];
/** The instant films, by the start of the name on the box. */
const INSTANT = ['INSTAX', 'FP-', 'PX', 'TIME ZERO', 'POLAROID', 'TYPE'];

interface Classified {
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
