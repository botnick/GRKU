// The search of the manual: every word of the query in a page, best first. After GRKit (MIT).
import { plainInline } from './inline';
import { DOC_PAGES, type DocSlug } from './pages';
import type { DocBlock, DocsContent } from './types';

export interface DocResult {
  slug: DocSlug;
  title: string;
  group: string;
  /** The heading of the section that holds the words, when it is not the top of the page. */
  section?: { id: string; text: string };
}

/** The words of a block as a reader sees them. */
export function blockText(block: DocBlock): string {
  switch (block.kind) {
    case 'p':
      return plainInline(block.text);
    case 'note':
      return `${block.title}: ${plainInline(block.text)}`;
    case 'h2':
      return block.text;
    case 'steps':
    case 'list':
      return block.items.map(plainInline).join(' ');
    case 'path':
      return block.items.join(' › ');
    case 'table':
      return [block.head.join(' | '), ...block.rows.map((row) => row.map(plainInline).join(' | '))].join('\n');
    case 'files':
      return block.items.map(([path, about]) => `${path}: ${about}`).join('\n');
    case 'screen':
    case 'photo':
    case 'camera':
    case 'frame':
      return block.alt;
    case 'card':
      return block.items.map(([name, about]) => `${name}: ${about}`).join('\n');
    default:
      return '';
  }
}

const fold = (text: string) => text.toLowerCase().normalize('NFKC');

/** The pages that hold each word of `query`, best first: title, then keywords, then the text. */
export function searchDocs(content: DocsContent, query: string, limit = 8): DocResult[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const found: { result: DocResult; score: number; order: number }[] = [];
  DOC_PAGES.forEach(({ slug, group }, order) => {
    const page = content.pages[slug];
    const title = fold(page.title);
    const keywords = fold(`${content.groups[group]} ${page.keywords}`);
    // The text of each section, so a result can open the section that holds the words.
    const sections: { id?: string; heading?: string; text: string }[] = [{ text: fold(page.lead) }];
    for (const block of page.blocks) {
      if (block.kind === 'h2') sections.push({ id: block.id, heading: block.text, text: fold(block.text) });
      else sections[sections.length - 1]!.text += ` ${fold(blockText(block))}`;
    }
    const body = sections.map((section) => section.text).join(' ');
    let score = 0;
    for (const word of words) {
      const points = title.startsWith(word) ? 8 : title.includes(word) ? 6 : keywords.includes(word) ? 4 : body.includes(word) ? 1 : 0;
      if (points === 0) return;
      score += points;
    }
    const hit = sections.find((section) => section.id && words.every((word) => section.text.includes(word)));
    found.push({
      result: { slug, title: page.title, group: content.groups[group], ...(hit && !title.includes(words[0]!) ? { section: { id: hit.id!, text: hit.heading! } } : {}) },
      score,
      order,
    });
  });
  return found
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, limit)
    .map((item) => item.result);
}
