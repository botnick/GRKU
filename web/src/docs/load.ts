// The text of the manual in each language, each its own script, so a page loads only its own.
import type { Language } from '../i18n';
import type { DocsContent } from './types';

const LOADERS: Readonly<Record<Language, () => Promise<DocsContent>>> = {
  en: () => import('./content/en').then((module) => module.en),
  th: () => import('./content/th').then((module) => module.th),
  'zh-Hans': () => import('./content/zh-Hans').then((module) => module.zhHans),
  'zh-Hant': () => import('./content/zh-Hant').then((module) => module.zhHant),
  ja: () => import('./content/ja').then((module) => module.ja),
  ko: () => import('./content/ko').then((module) => module.ko),
};

const loaded: Partial<Record<Language, DocsContent>> = {};

/** The text of the languages that loadDocs loaded. */
export const DOCS = loaded as Readonly<Partial<Record<Language, DocsContent>>>;

/** Loads the manual of `language` into DOCS. */
export async function loadDocs(language: Language): Promise<DocsContent> {
  return (loaded[language] ??= await LOADERS[language]());
}

/** Loads the manual of every language, for the prerender, the assistant's knowledge, and the tests. */
export function loadAllDocs(): Promise<DocsContent[]> {
  return Promise.all((Object.keys(LOADERS) as Language[]).map(loadDocs));
}
