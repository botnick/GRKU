/**
 * The part of the Develop page that tells what it is in plain text, for people and for search
 * engines: the popular looks, and the questions, which the page shows and the FAQPage data repeats.
 */
import type { DevelopText } from './text.en';

/** The popular looks of the page: the effect, its name on the box, and its line of the text. */
export const POPULAR_LOOKS = [
  { id: 'portra-400-endura-v1', name: 'Kodak Portra 400', text: 'lookPortra' },
  { id: 'gold-200-premier-v1', name: 'Kodak Gold 200', text: 'lookGold' },
  { id: 'fj-classic-chrome-v1', name: 'Fujifilm Classic Chrome', text: 'lookChrome' },
  { id: 'positive-film-grii-v1', name: 'GR II Positive (GRKU)', text: 'lookGrii' },
  { id: 'kodachrome-64-v1', name: 'Kodachrome 64', text: 'lookKodachrome' },
  { id: 'ff-cinestill800t-v1', name: 'CineStill 800T', text: 'lookCinestill' },
  { id: 'fj-classic-neg-v1', name: 'Fujifilm Classic Neg', text: 'lookNeg' },
  { id: 'trix-400-mono-v1', name: 'Kodak Tri-X 400', text: 'lookTrix' },
] as const satisfies readonly { id: string; name: string; text: keyof DevelopText }[];

/** The questions of the page, in order. */
export function faqOf(d: DevelopText): { q: string; a: string }[] {
  return [
    { q: d.faq1q, a: d.faq1a },
    { q: d.faq2q, a: d.faq2a },
    { q: d.faq3q, a: d.faq3a },
    { q: d.faq4q, a: d.faq4a },
    { q: d.faq5q, a: d.faq5a },
    { q: d.faq6q, a: d.faq6a },
  ];
}
