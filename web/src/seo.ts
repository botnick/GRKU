// The search engine parts of the pages that scripts/prerender.mjs and scripts/build-docs.mjs
// write: the hreflang links, the sitemap, and the Open Graph locales. Node runs this file as it
// is from build-docs.mjs, so it holds only plain code and type imports.
import type { Language } from './i18n';

export const SITE = 'https://grku.app';

/** The language of the search results that have no page of their own language: English. */
export const DEFAULT_LANGUAGE: Language = 'en';

/** The Open Graph locale of each language. */
export const OG_LOCALES: Readonly<Record<Language, string>> = {
  th: 'th_TH',
  en: 'en_US',
  'zh-Hans': 'zh_CN',
  'zh-Hant': 'zh_TW',
  ja: 'ja_JP',
  ko: 'ko_KR',
};

/** One hreflang link: a language (or `x-default`) and the address of the page in it. */
export interface Alternate {
  hreflang: string;
  href: string;
}

/**
 * The hreflang links of a page that exists in the languages of `urls`, each with its own
 * address: one link for each language, the page itself among them, and `x-default` on the
 * English page. A page in one language only has none, as hreflang names other versions.
 */
export function alternates(urls: Readonly<Partial<Record<Language, string>>>): Alternate[] {
  const entries = Object.entries(urls) as [Language, string][];
  if (entries.length < 2) return [];
  const fallback = urls[DEFAULT_LANGUAGE] ?? entries[0]![1];
  return [...entries.map(([hreflang, href]) => ({ hreflang, href })), { hreflang: 'x-default', href: fallback }];
}

/** The `<link rel="alternate">` tags of `links`, one per line with `indent` before the next. */
export function alternateTags(links: readonly Alternate[], indent = '\n    '): string {
  return links.map(({ hreflang, href }) => `<link rel="alternate" hreflang="${hreflang}" href="${href}" />`).join(indent);
}

/** The `og:locale` of `language` and an `og:locale:alternate` for each of `others`. */
export function localeTags(language: Language, others: readonly Language[], indent = '\n    '): string {
  return [
    `<meta property="og:locale" content="${OG_LOCALES[language]}" />`,
    ...others.filter((other) => other !== language).map((other) => `<meta property="og:locale:alternate" content="${OG_LOCALES[other]}" />`),
  ].join(indent);
}

/** A page of the sitemap: its address, the day it last changed when known, and its hreflang links. */
export interface SitemapEntry {
  loc: string;
  lastmod?: string | null;
  alternates: readonly Alternate[];
}

const xml = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');

/** The `<url>` element of one page. */
export function sitemapUrl({ loc, lastmod, alternates: links }: SitemapEntry): string {
  return [
    '  <url>',
    `    <loc>${xml(loc)}</loc>`,
    ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
    ...links.map(({ hreflang, href }) => `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${xml(href)}"/>`),
    '  </url>',
  ].join('\n');
}

/** The sitemap of `entries`. */
export function sitemapXml(entries: readonly SitemapEntry[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map(sitemapUrl).join('\n')}
</urlset>
`;
}
