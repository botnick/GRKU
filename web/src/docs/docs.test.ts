import { describe, expect, it } from 'vitest';
import { LANGUAGES } from '../i18n';
import { loadAllDocs } from './load';
import { parseInline, targetUrl } from './inline';
import { DOC_PAGES, docSlug, DOCS_SITE_PAGES } from './pages';
import { searchDocs } from './search';
import { docsStructuredData } from './seo';
import { docMarkdown } from './markdown';
import type { DocsContent } from './types';

const all = await loadAllDocs();
const [en] = all as [DocsContent, ...DocsContent[]];
const codes = ['en', 'th', 'zh-Hans', 'zh-Hant', 'ja', 'ko'] as const;

/** The shape of a manual without its words: block kinds, ids, images, and list lengths. */
const shape = (content: DocsContent) =>
  JSON.stringify(content.pages, (key, value) => (typeof value === 'string' && !['kind', 'id', 'screen', 'photo', 'mode', 'tone'].includes(key) ? '' : value));

describe('docs', () => {
  it('has a page for each slug in every language, with the shape of the English one', () => {
    expect(all).toHaveLength(LANGUAGES.length);
    for (const content of all) {
      expect(Object.keys(content.pages).sort()).toEqual(DOC_PAGES.map((page) => page.slug).sort());
      expect(shape(content)).toBe(shape(en));
    }
  });

  it('links only to pages and sections that exist, in every language', () => {
    const ids = new Map(DOC_PAGES.map(({ slug }) => [slug, new Set(en.pages[slug].blocks.flatMap((block) => (block.kind === 'h2' ? [block.id] : [])))]));
    all.forEach((content, index) => {
      const texts: string[] = [];
      JSON.stringify(content, (_key, value) => {
        if (typeof value === 'string') texts.push(value);
        return value;
      });
      for (const text of texts) {
        for (const part of parseInline(text)) {
          if (part.kind !== 'link') continue;
          expect(targetUrl(part.target, codes[index]!), `${codes[index]}: ${part.target}`).not.toBeNull();
          if (part.target.startsWith('doc:') && part.target.includes('#')) {
            const [slug, id] = part.target.slice(4).split('#') as [keyof typeof en.pages, string];
            expect(ids.get(slug)?.has(id), part.target).toBe(true);
          }
        }
      }
    });
  });

  it('gives each page a unique title and search title in each language', () => {
    for (const content of all) {
      const pages = Object.values(content.pages);
      expect(new Set(pages.map((page) => page.title)).size).toBe(pages.length);
      expect(new Set(pages.map((page) => page.seo)).size).toBe(pages.length);
    }
  });

  it('finds pages and sections by their words', () => {
    expect(searchDocs(en, 'xpan')[0]?.slug).toBe('framing');
    expect(searchDocs(en, 'firmware version')[0]?.slug).toBe('firmware');
    expect(searchDocs(en, 'zzzz')).toEqual([]);
    expect(searchDocs(en, '1.71').map((result) => result.slug)).toContain('cameras');
  });

  it('maps each docs page to its slug', () => {
    expect(DOCS_SITE_PAGES).toHaveLength(DOC_PAGES.length + 1);
    expect(docSlug('docs')).toBeNull();
    expect(docSlug('docs/install')).toBe('install');
    expect(docSlug('install')).toBeNull();
  });

  it('writes structured data and Markdown for the answer engines', () => {
    const install = docsStructuredData(en, 'en', 'docs/install', '2026-11-27') as { '@type': string }[];
    expect(install.map((node) => node['@type'])).toEqual(['TechArticle', 'HowTo']);
    const faq = docsStructuredData(en, 'en', 'docs/faq', null) as { '@type': string; mainEntity?: unknown[] }[];
    expect(faq.find((node) => node['@type'] === 'FAQPage')?.mainEntity?.length).toBeGreaterThan(3);
    const markdown = docMarkdown(en, 'install', 'en');
    expect(markdown).toMatch(/^# Install GRKU/);
    expect(markdown).toContain('https://grku.app/en/install/');
  });
});

describe('the settings of the modules', () => {
  it('match the modules of the repository (run node scripts/module-settings.mjs after a change)', async () => {
    const { readFileSync } = await import('node:fs');
    // @ts-expect-error The script has no types.
    const { generatedBody } = await import('../../scripts/module-settings.mjs');
    expect(readFileSync(new URL('./moduleSettings.generated.ts', import.meta.url), 'utf8')).toBe(generatedBody);
  });

  it('are all in the manual, each with what it does', async () => {
    const { MODULE_SETTINGS } = await import('./moduleSettings.generated');
    const blocks = Object.values(en.pages).flatMap((page) => page.blocks.filter((block) => block.kind === 'settings'));
    for (const module of MODULE_SETTINGS.filter((item) => item.settings.length > 0)) {
      const block = blocks.find((item) => item.kind === 'settings' && item.module === module.dir);
      expect(block, `the manual has no settings table of ${module.dir}`).toBeDefined();
      for (const setting of module.settings) {
        expect(block && block.kind === 'settings' && block.notes[setting.key], `${module.dir}: ${setting.key} has no note`).toBeTruthy();
      }
    }
  });
});
