// The structured data of the manual pages for search and answer engines (scripts/prerender.mjs):
// a TechArticle for each doc, a HowTo for the steps of a doc, and a FAQPage for the questions.
import type { Language } from '../i18n';
import { plainInline } from './inline';
import { docUrl } from './markdown';
import { docSlug } from './pages';
import type { DocsContent } from './types';

const SITE = 'https://grku.app';

/** The JSON-LD nodes of a docs page, to add to the @graph of the page. */
export function docsStructuredData(content: DocsContent, language: Language, page: string, lastmod: string | null): object[] {
  const slug = docSlug(page);
  const url = docUrl(language, slug);
  const publisher = { '@id': `${SITE}/#organization` };
  if (!slug) {
    return [{ '@type': 'CollectionPage', '@id': `${url}#manual`, url, name: content.home.title, description: content.home.lead, inLanguage: language, publisher, ...(lastmod ? { dateModified: lastmod } : {}) }];
  }
  const doc = content.pages[slug];
  const nodes: object[] = [
    {
      '@type': 'TechArticle',
      '@id': `${url}#article`,
      url,
      headline: doc.seo,
      name: doc.title,
      description: doc.lead,
      inLanguage: language,
      keywords: doc.keywords,
      author: publisher,
      publisher,
      isPartOf: { '@id': `${SITE}/#website` },
      about: { '@type': 'SoftwareApplication', name: 'GRKU', operatingSystem: 'RICOH GR III, GR IIIx, GR IV', applicationCategory: 'MultimediaApplication' },
      ...(lastmod ? { dateModified: lastmod } : {}),
    },
  ];
  // The first list of steps, named by the heading above it: each doc says which procedure it is.
  const at = doc.blocks.findIndex((block) => block.kind === 'steps');
  const steps = doc.blocks[at];
  const heading = doc.blocks.slice(0, Math.max(at, 0)).reverse().find((block) => block.kind === 'h2');
  if (steps && steps.kind === 'steps' && steps.items.length >= 3) {
    nodes.push({
      '@type': 'HowTo',
      '@id': `${url}#howto`,
      name: heading && heading.kind === 'h2' ? `${doc.title}: ${heading.text}` : doc.title,
      description: doc.lead,
      inLanguage: language,
      step: steps.items.map((item, index) => ({ '@type': 'HowToStep', position: index + 1, text: plainInline(item) })),
    });
  }
  if (slug === 'faq') {
    const questions: { name: string; text: string }[] = [];
    doc.blocks.forEach((block, index) => {
      const next = doc.blocks[index + 1];
      if (block.kind === 'h2' && next?.kind === 'p') questions.push({ name: block.text, text: plainInline(next.text) });
    });
    nodes.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      inLanguage: language,
      mainEntity: questions.map((item) => ({ '@type': 'Question', name: item.name, acceptedAnswer: { '@type': 'Answer', text: item.text } })),
    });
  }
  return nodes;
}
