/**
 * The text of the Develop page in the six languages of the site. It loads with the page, so the
 * other pages do not carry it. The other languages came through Gemini (grku-tools/i18n-th.mjs),
 * as the rest of the site, and were checked with i18n-review.mjs.
 */
import type { Language } from '../i18n';
import { en, type DevelopText } from './text.en';
import { ja, ko, th, zhHans, zhHant } from './text.other';

export type { DevelopText };

export const DEVELOP_STRINGS: Readonly<Record<Language, DevelopText>> = { en, 'zh-Hans': zhHans, 'zh-Hant': zhHant, ja, ko, th };

/** A text with its ${name} values filled in. */
export function format(text: string, values: Readonly<Record<string, string | number>> = {}): string {
  return text.replace(/\$\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));
}
