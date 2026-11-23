import type { en } from './strings/en';
import { GUIDE_STRINGS } from './guide';
import { cookieValue, fastbootPath, isLanguage, LANGUAGE_COOKIE, LANGUAGE_PATHS, pagePath, pathLanguage, type SitePage } from './languagePage';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh-Hans', label: '简体中文' },
  { code: 'zh-Hant', label: '繁體中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'th', label: 'ไทย' },
] as const;

export type Language = (typeof LANGUAGES)[number]['code'];

/** Text with inline code: a part that starts with a backtick is code. */
export type RichText = readonly string[];

/** A question of the FAQ. The install guide finds the ones it repeats by their `id`. */
export interface FaqItem {
  id?: 'adj' | 'format';
  q: string;
  a: RichText;
}

export type Strings = typeof en;

export { sentences } from './sentences';

/** The text of each language, each its own script (src/strings/), so a page loads only its own. */
const LOADERS: Readonly<Record<Language, () => Promise<Strings>>> = {
  en: () => import('./strings/en').then((module) => module.en),
  'zh-Hans': () => import('./strings/zh-Hans').then((module) => module.zhHans),
  'zh-Hant': () => import('./strings/zh-Hant').then((module) => module.zhHant),
  ja: () => import('./strings/ja').then((module) => module.ja),
  ko: () => import('./strings/ko').then((module) => module.ko),
  th: () => import('./strings/th').then((module) => module.th),
};

const loaded: Partial<Record<Language, Strings>> = {};

/**
 * The text of the languages that loadStrings loaded. The page loads the text of its language
 * before the first render (main.tsx), and of another language before it shows it.
 */
export const STRINGS = loaded as Readonly<Record<Language, Strings>>;

/** Loads the text of `language` into STRINGS. */
export async function loadStrings(language: Language): Promise<Strings> {
  return (loaded[language] ??= await LOADERS[language]());
}

/** Loads the text of every language, for the prerender and the tests. */
export function loadAllStrings(): Promise<Strings[]> {
  return Promise.all(LANGUAGES.map((item) => loadStrings(item.code)));
}

/** Where the page kept the chosen language before each language had its own page. */
const LEGACY_STORAGE_KEY = 'grku.language';

export { matchLanguage } from './languagePage';

/** The language of this page, from its address. */
export function pageLanguage(): Language {
  return pathLanguage(location.pathname);
}

/**
 * The language that an earlier visit chose and kept in the browser storage. The cookie of the
 * language pages replaces it, so this moves the choice to the cookie and gives it once.
 */
export function takeLegacyLanguage(): Language | null {
  try {
    const saved = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (saved === null) return null;
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    if (!isLanguage(saved) || cookieValue(document.cookie, LANGUAGE_COOKIE) !== null) return null;
    saveLanguage(saved);
    return saved;
  } catch {
    // Storage can be unavailable, for example in a private window.
    return null;
  }
}

/** Keeps the chosen language for a year, so the root page sends the visitor to it. */
function saveLanguage(language: Language): void {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${LANGUAGE_COOKIE}=${language}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

/** A page of the site, or the fast-boot firmware page of a language. */
export type PageName = SitePage | 'fastboot';

/** The title, the description, and the address of a page of the site in `language`. */
export function pageText(language: Language, page: PageName = 'home'): { title: string; description: string; path: string } {
  const strings = STRINGS[language];
  switch (page) {
    case 'fastboot':
      return { title: `${strings.fastboot.title} · GRKU`, description: strings.fastboot.lead, path: fastbootPath(language) };
    case 'install':
      return { title: strings.site.toolTitle, description: strings.site.toolDescription, path: pagePath(language, page) };
    case 'camera':
      return { title: strings.site.cameraTitle, description: strings.site.cameraDescription, path: pagePath(language, page) };
    case 'modules':
      return { title: strings.site.modulesTitle, description: strings.site.modulesDescription, path: pagePath(language, page) };
    case 'write':
      return { title: strings.site.writeTitle, description: strings.site.writeDescription, path: pagePath(language, page) };
    case 'guide':
      return { title: GUIDE_STRINGS[language].title, description: GUIDE_STRINGS[language].description, path: pagePath(language, page) };
    default:
      return { title: strings.title, description: strings.description, path: LANGUAGE_PATHS[language] };
  }
}

/** Sets the language, the title, the description, and the canonical address of the document. */
export function showLanguage(language: Language, page: PageName = 'home'): void {
  const text = pageText(language, page);
  document.documentElement.lang = language;
  document.title = text.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', text.description);
  // The canonical address stays on grku.app, also for a preview deployment of the site.
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute('href', new URL(text.path, canonical.getAttribute('href') ?? location.href).href);
  }
}

/** Applies a language, moves to the address of `page` in it, and remembers it for the next visit. */
export function applyLanguage(language: Language, page: PageName = 'home'): void {
  history.replaceState(history.state, '', `${pageText(language, page).path}${location.search}${location.hash}`);
  showLanguage(language, page);
  saveLanguage(language);
}
