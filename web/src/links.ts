import type { Language } from './i18n';

export const REPOSITORY = 'https://github.com/botnick/GRKit';
/** The repository this fork comes from. */
export const UPSTREAM = 'https://github.com/ahonn/grkit';

/** A guide in `resources/` in the page language, or in English. */
/** The languages that have their own guides in `resources/`; the others read the English ones. */
const GUIDE_LANGUAGES: readonly Language[] = ['zh-Hans', 'zh-Hant', 'ja', 'ko'];

export function guideLanguage(language: Language): Language {
  return GUIDE_LANGUAGES.includes(language) ? language : 'en';
}

export function guideUrl(name: 'RECOVERY' | 'DUMP' | 'TERMS', language: Language): string {
  const guide = guideLanguage(language);
  return `${REPOSITORY}/blob/main/resources/${name}${guide === 'en' ? '' : `.${guide}`}.md`;
}
