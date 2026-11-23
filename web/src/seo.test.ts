import { describe, expect, it } from 'vitest';
import { LANGUAGES } from './i18n';
import { INDEXED_PAGES, LANGUAGE_PATHS, pagePath } from './languagePage';
import { alternates, alternateTags, localeTags, OG_LOCALES, SITE, sitemapUrl, sitemapXml } from './seo';

const codes = LANGUAGES.map((language) => language.code);
const urls = (page: (typeof INDEXED_PAGES)[number]) => Object.fromEntries(codes.map((code) => [code, `${SITE}${pagePath(code, page)}`]));

describe('hreflang', () => {
  it('names every language and English as x-default, the same set on every page of the group', () => {
    for (const page of INDEXED_PAGES) {
      const links = alternates(urls(page));
      expect(links.map((link) => link.hreflang)).toEqual([...codes, 'x-default']);
      expect(links.at(-1)!.href).toBe(`${SITE}${pagePath('en', page)}`);
      // Reciprocal: each page of the group is among the links that every page of the group carries.
      for (const code of codes) expect(links).toContainEqual({ hreflang: code, href: `${SITE}${pagePath(code, page)}` });
    }
  });

  it('puts the Thai page at the root and every other language under its own path', () => {
    const links = alternates(urls('home'));
    expect(links.find((link) => link.hreflang === 'th')!.href).toBe(`${SITE}/`);
    expect(links.find((link) => link.hreflang === 'zh-Hant')!.href).toBe(`${SITE}/zh-hant/`);
    expect(new Set(links.map((link) => link.href)).size).toBe(codes.length);
  });

  it('gives a page in one language no hreflang links, and a page without English the first language as x-default', () => {
    expect(alternates({ en: `${SITE}/en/licenses/` })).toEqual([]);
    const two = alternates({ th: `${SITE}/terms/`, ja: `${SITE}/ja/terms/` });
    expect(two.at(-1)).toEqual({ hreflang: 'x-default', href: `${SITE}/terms/` });
  });

  it('writes the link tags', () => {
    expect(alternateTags(alternates({ th: `${SITE}/`, en: `${SITE}/en/` }), ' ')).toBe(
      `<link rel="alternate" hreflang="th" href="${SITE}/" /> <link rel="alternate" hreflang="en" href="${SITE}/en/" /> <link rel="alternate" hreflang="x-default" href="${SITE}/en/" />`,
    );
  });
});

describe('Open Graph locales', () => {
  it('has a locale for every language and lists the others as alternates', () => {
    for (const code of codes) expect(OG_LOCALES[code]).toMatch(/^[a-z]{2}_[A-Z]{2}$/);
    const tags = localeTags('th', codes, '\n');
    expect(tags.split('\n')[0]).toBe('<meta property="og:locale" content="th_TH" />');
    expect(tags).not.toContain('og:locale:alternate" content="th_TH"');
    expect(tags.split('\n')).toHaveLength(codes.length);
  });
});

describe('sitemap', () => {
  it('writes each page with its lastmod and its hreflang links', () => {
    const entry = sitemapUrl({ loc: `${SITE}/`, lastmod: '2026-11-24', alternates: alternates(urls('home')) });
    expect(entry).toContain(`<loc>${SITE}/</loc>`);
    expect(entry).toContain('<lastmod>2026-11-24</lastmod>');
    expect(entry).toContain(`<xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/en/"/>`);
    expect(entry.match(/<xhtml:link/g)).toHaveLength(codes.length + 1);
  });

  it('leaves out lastmod when the day is not known', () => {
    expect(sitemapUrl({ loc: `${SITE}/en/`, lastmod: null, alternates: [] })).not.toContain('lastmod');
  });

  it('is one urlset with the xhtml namespace, with addresses on the site', () => {
    const entries = INDEXED_PAGES.flatMap((page) => codes.map((code) => ({ loc: `${SITE}${pagePath(code, page)}`, alternates: alternates(urls(page)) })));
    const xml = sitemapXml(entries);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">')).toBe(true);
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
    expect(xml.match(/<url>/g)).toHaveLength(INDEXED_PAGES.length * codes.length);
    for (const [, path] of Object.entries(LANGUAGE_PATHS)) expect(xml).toContain(`<loc>${SITE}${path}</loc>`);
    // Every address is absolute, on the site, and ends with a slash, as the canonical links do.
    for (const match of xml.matchAll(/(?:<loc>|href=")([^<"]+)/g)) expect(match[1]).toMatch(/^https:\/\/grku\.app\/(?:[^?#]*\/)?$/);
  });
});
