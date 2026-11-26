// The pages of the user manual (/docs/), in reading order. The edge worker and languagePage.ts
// import this list, so it holds no text: the text of each language is in docs/content/<language>.ts.
// The structure follows the docs of GRKit (MIT, github.com/ahonn/GRKit), the project GRKU grew out of.

/** The groups of the manual, in the order of the sidebar and the docs home page. */
export const DOC_GROUPS = ['start', 'camera', 'site', 'help'] as const;
export type DocGroup = (typeof DOC_GROUPS)[number];

export const DOC_PAGES = [
  { slug: 'start', group: 'start' },
  { slug: 'firmware', group: 'start' },
  { slug: 'install', group: 'start' },
  { slug: 'controls', group: 'start' },
  { slug: 'update', group: 'start' },
  { slug: 'film-look', group: 'camera' },
  { slug: 'recipes', group: 'camera' },
  { slug: 'framing', group: 'camera' },
  { slug: 'crop', group: 'camera' },
  { slug: 'guides', group: 'camera' },
  { slug: 'date', group: 'camera' },
  { slug: 'glow', group: 'camera' },
  { slug: 'light-leak', group: 'camera' },
  { slug: 'diffusion', group: 'camera' },
  { slug: 'grain', group: 'camera' },
  { slug: 'border', group: 'camera' },
  { slug: 'mode-dial', group: 'camera' },
  { slug: 'raw', group: 'camera' },
  { slug: 'settings', group: 'camera' },
  { slug: 'looks', group: 'site' },
  { slug: 'plus', group: 'site' },
  { slug: 'shutdown', group: 'site' },
  { slug: 'develop', group: 'site' },
  { slug: 'assistant', group: 'site' },
  { slug: 'not-showing', group: 'help' },
  { slug: 'stuck', group: 'help' },
  { slug: 'faq', group: 'help' },
  { slug: 'cameras', group: 'help' },
] as const satisfies readonly { slug: string; group: DocGroup }[];

export type DocSlug = (typeof DOC_PAGES)[number]['slug'];

/** The site page of the docs home, and of each doc. */
export type DocsSitePage = 'docs' | `docs/${DocSlug}`;

export const DOCS_SITE_PAGES: readonly DocsSitePage[] = ['docs', ...DOC_PAGES.map((page) => `docs/${page.slug}` as const)];

export const isDocSlug = (value: string): value is DocSlug => DOC_PAGES.some((page) => page.slug === value);

/** The doc of a site page, or null for the docs home and the other pages. */
export function docSlug(page: string): DocSlug | null {
  if (!page.startsWith('docs/')) return null;
  const slug = page.slice('docs/'.length);
  return isDocSlug(slug) ? slug : null;
}

export const isDocsPage = (page: string): page is DocsSitePage => page === 'docs' || docSlug(page) !== null;
