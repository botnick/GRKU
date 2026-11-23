// The language pages of the site. The edge worker (edge.ts) and the page share this module, so
// it must not touch the DOM at import time.
import type { Language } from './i18n';

/** The address of each language page. Thai is the root page; the edge worker sends visitors of other languages to theirs. */
export const LANGUAGE_PATHS: Readonly<Record<Language, string>> = {
  th: '/',
  en: '/en/',
  'zh-Hans': '/zh-hans/',
  'zh-Hant': '/zh-hant/',
  ja: '/ja/',
  ko: '/ko/',
};

/**
 * The pages that scripts/build-docs.mjs renders from the Markdown of the repository, under each
 * language path: `resources/TERMS.md` is `/terms/` on the Thai page and `/en/terms/` on the
 * English one. A page shows the Markdown of its language, or the English one.
 */
export const DOC_PATHS = {
  TERMS: 'terms/',
  RECOVERY: 'recovery/',
  DUMP: 'firmware-dump/',
  LICENSES: 'licenses/',
} as const;

export type DocName = keyof typeof DOC_PATHS;

/** The cookie that keeps the language that the visitor chose. The edge worker reads it. */
export const LANGUAGE_COOKIE = 'grku_language';

const CODES = Object.keys(LANGUAGE_PATHS) as Language[];

export function isLanguage(value: unknown): value is Language {
  return CODES.some((code) => code === value);
}

/** The page of the fast-boot firmware under each language page. */
const FASTBOOT_PAGE = 'fastboot/';

/** The path of `pathname` with one trailing slash, in lower case. */
const normalized = (pathname: string) => pathname.toLowerCase().replace(/\/?$/, '/');

/** Whether `pathname` is the fast-boot firmware page of a language. */
export function isFastbootPath(pathname: string): boolean {
  const path = normalized(pathname);
  return CODES.some((code) => path === `${LANGUAGE_PATHS[code]}${FASTBOOT_PAGE}`);
}

/** The address of the fast-boot firmware page in `language`. */
export function fastbootPath(language: Language): string {
  return `${LANGUAGE_PATHS[language]}${FASTBOOT_PAGE}`;
}

/**
 * The pages of the site under each language path: the home page, the four steps of the
 * install: the film looks (`/install/`), the camera, the modules, and the card write, and the
 * install guide, which tells the same in plain steps with pictures.
 * `/install/` is the Thai first step and `/en/install/` the English one.
 */
export const SITE_PAGES = {
  home: '',
  install: 'install/',
  camera: 'install/camera/',
  modules: 'install/modules/',
  write: 'install/write/',
  guide: 'guide/',
} as const;

export type SitePage = keyof typeof SITE_PAGES;

/** The steps of the install, in order. The first is the film looks. */
export const INSTALL_STEPS = ['install', 'camera', 'modules', 'write'] as const satisfies readonly SitePage[];

export type InstallStep = (typeof INSTALL_STEPS)[number];

export const isInstallStep = (page: SitePage): page is InstallStep => (INSTALL_STEPS as readonly SitePage[]).includes(page);

/**
 * The pages that search engines index, with hreflang links and sitemap entries: the home page,
 * the first step, and the install guide. The later steps hold only the controls of one step, so they ask not to be
 * indexed and lead search engines on to the first step.
 */
export const INDEXED_PAGES: readonly SitePage[] = ['home', 'install', 'guide'];

const PAGE_NAMES = Object.keys(SITE_PAGES) as SitePage[];

/** The address of `page` in `language`. */
export function pagePath(language: Language, page: SitePage): string {
  return `${LANGUAGE_PATHS[language]}${SITE_PAGES[page]}`;
}

/**
 * The looks page of an earlier version of the site, now the install page, which starts with the
 * looks. The edge worker sends it there; a browser that loads it anyway shows the install page.
 */
const LOOKS_PAGE = 'looks/';

/** The address of the old looks page in `language`. */
export function looksPath(language: Language): string {
  return `${LANGUAGE_PATHS[language]}${LOOKS_PAGE}`;
}

/** The language of `pathname` when it is an old looks page, else null. */
export function looksLanguage(pathname: string): Language | null {
  const path = normalized(pathname);
  return CODES.find((code) => looksPath(code) === path) ?? null;
}

/** The page at `pathname`, or null for an address that is no page of the site. An old looks page is the install page. */
export function pathPage(pathname: string): SitePage | null {
  const path = normalized(pathname);
  for (const code of CODES) {
    for (const page of PAGE_NAMES) {
      if (pagePath(code, page) === path) return page;
    }
  }
  return looksLanguage(pathname) ? 'install' : null;
}

/** The language of the page at `pathname`, a page of a language or its fast-boot page. Any other path is Thai. */
export function pathLanguage(pathname: string): Language {
  const path = normalized(pathname);
  return (
    CODES.find(
      (code) =>
        fastbootPath(code) === path || looksPath(code) === path || PAGE_NAMES.some((page) => pagePath(code, page) === path),
    ) ?? 'th'
  );
}

/** Countries where Traditional Chinese is the usual script. */
const TRADITIONAL = new Set(['TW', 'HK', 'MO']);

/**
 * Maps language tags, most preferred first, to a supported language. Traditional script wins
 * for TW, HK, and MO. A bare `zh` takes the script of `country` when the caller knows it.
 */
export function matchLanguage(tags: readonly string[], country?: string | null): Language {
  for (const tag of tags) {
    const lower = tag.toLowerCase();
    if (lower === 'zh' || lower.startsWith('zh-')) {
      if (/hant|-(tw|hk|mo)\b/.test(lower)) return 'zh-Hant';
      if (/hans|-(cn|sg|my)\b/.test(lower)) return 'zh-Hans';
      return country && TRADITIONAL.has(country) ? 'zh-Hant' : 'zh-Hans';
    }
    if (lower === 'ja' || lower.startsWith('ja-')) return 'ja';
    if (lower === 'ko' || lower.startsWith('ko-')) return 'ko';
    if (lower === 'th' || lower.startsWith('th-')) return 'th';
    if (lower === 'en' || lower.startsWith('en-')) return 'en';
  }
  return 'en';
}

/** The tags of an Accept-Language header, most preferred first, without `*` and q=0 entries. */
export function acceptedLanguages(header: string): string[] {
  return header
    .split(',')
    .map((part, index) => {
      const [tag = '', ...params] = part.split(';').map((item) => item.trim());
      const q = params.find((param) => param.startsWith('q='));
      const quality = q === undefined ? 1 : Number(q.slice(2));
      return { tag, quality: Number.isFinite(quality) ? quality : 0, index };
    })
    .filter((item) => item.tag !== '' && item.tag !== '*' && item.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index)
    .map((item) => item.tag);
}

/** The value of the cookie `name` in a Cookie header or `document.cookie`. */
export function cookieValue(cookies: string, name: string): string | null {
  for (const part of cookies.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return value.join('=');
  }
  return null;
}

/**
 * Search engine crawlers and link preview fetchers. They get the page at the address they ask
 * for, the same page a visitor of its language gets, so every language page is indexed and a
 * shared link previews in the language of the link. Some of them send an Accept-Language header.
 */
const CRAWLER =
  /bot\b|bot\/|crawl|spider|slurp|yeti|baidu|yandex|sogou|bytespider|petalbot|facebookexternalhit|meta-externalagent|twitterbot|slackbot|discordbot|linkedinbot|whatsapp|telegrambot|lighthouse|google-inspectiontool|googleother|embedly|skypeuripreview|pinterest|redditbot|applebot|duckduck|qwant|semrush|ahrefs|ia_archiver/i;

/** Whether the User-Agent header names a crawler or a link preview fetcher. */
export function isCrawler(userAgent: string | null): boolean {
  return userAgent !== null && CRAWLER.test(userAgent);
}

export interface Visitor {
  /** The Cookie header. */
  cookie: string | null;
  /** The Accept-Language header. */
  acceptLanguage: string | null;
  /** The country of the visitor's IP address, as an ISO 3166-1 alpha-2 code. */
  country: string | null;
  /** The User-Agent header. */
  userAgent?: string | null;
}

/**
 * The language page for a visitor of a root page, or null to serve the root page itself (Thai).
 * A language that the visitor chose comes first, then the browser languages; the country picks
 * only the script of a bare `zh`. A request without either, which is how search engines crawl,
 * and any crawler or link preview get the page they asked for, so the Thai pages stay reachable.
 */
export function visitorLanguage({ cookie, acceptLanguage, country, userAgent = null }: Visitor): Language | null {
  if (isCrawler(userAgent)) return null;
  const chosen = cookie === null ? null : cookieValue(cookie, LANGUAGE_COOKIE);
  if (isLanguage(chosen)) return chosen;
  const tags = acceptedLanguages(acceptLanguage ?? '');
  if (tags.length > 0) return matchLanguage(tags, country);
  return null;
}
