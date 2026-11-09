import type { Language } from './i18n';
import { DOC_PATHS, LANGUAGE_PATHS, type DocName } from './languagePage';

export { DOC_PATHS, type DocName };

export const REPOSITORY = 'https://github.com/botnick/GRKU';
/** The repository GRKU's code began from. */
export const UPSTREAM = 'https://github.com/ahonn/GRKit';

/** The languages that have their own guides in `resources/`; the others read the English ones. */
const GUIDE_LANGUAGES: readonly Language[] = ['zh-Hans', 'zh-Hant', 'ja', 'ko'];

/** The language of the PDF guide for a page language. */
export function guideLanguage(language: Language): Language {
  return GUIDE_LANGUAGES.includes(language) ? language : 'en';
}

/** The address of a document page on the site, in the page language. */
export function docUrl(name: DocName, language: Language): string {
  return `${LANGUAGE_PATHS[language]}${DOC_PATHS[name]}`;
}

/** The guide of `name` on the site, in the page language. */
export function guideUrl(name: 'RECOVERY' | 'DUMP' | 'TERMS', language: Language): string {
  return docUrl(name, language);
}
