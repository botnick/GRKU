// The inline marks of the manual text (types.ts): `code`, **bold**, {{KEY}}, and [label](target).
// After the docs of GRKit (MIT, github.com/ahonn/GRKit).
import type { Language } from '../i18n';
import { DOC_PATHS, LANGUAGE_PATHS, pagePath, SITE_PAGES, type SitePage } from '../languagePage';
import { FEEDBACK } from '../links';
import { isDocSlug } from './pages';

export type InlinePart =
  | { kind: 'text'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'bold'; text: string }
  | { kind: 'key'; text: string }
  | { kind: 'link'; text: string; target: string };

const MARKS = /`([^`]+)`|\*\*([^*]+)\*\*|\{\{([^}]+)\}\}|\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Splits text with inline marks into its parts. */
export function parseInline(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let at = 0;
  for (const match of text.matchAll(MARKS)) {
    if (match.index > at) parts.push({ kind: 'text', text: text.slice(at, match.index) });
    const [whole, code, bold, key, label, target] = match;
    if (code !== undefined) parts.push({ kind: 'code', text: code });
    else if (bold !== undefined) parts.push({ kind: 'bold', text: bold });
    else if (key !== undefined) parts.push({ kind: 'key', text: key });
    else parts.push({ kind: 'link', text: label!, target: target! });
    at = match.index + whole.length;
  }
  if (at < text.length) parts.push({ kind: 'text', text: text.slice(at) });
  return parts;
}

/** The text of inline marks as a reader sees it, for the search index and the assistant. */
export function plainInline(text: string): string {
  return parseInline(text)
    .map((part) => part.text)
    .join('');
}

/** The document pages of build-docs.mjs that a doc can link (`site:recovery`). */
const DOC_TARGETS: Readonly<Record<string, string>> = { recovery: DOC_PATHS.RECOVERY, terms: DOC_PATHS.TERMS, 'firmware-dump': DOC_PATHS.DUMP };

/** Whether `target` opens the GRKU Plus sheet of the page (`site:plus`, `site:plus-key`). */
export const plusTarget = (target: string): 'tiers' | 'key' | null =>
  target === 'site:plus' ? 'tiers' : target === 'site:plus-key' ? 'key' : null;

/** The address of a link target in `language`; an unknown target is null. */
export function targetUrl(target: string, language: Language): string | null {
  if (target === 'support') return FEEDBACK;
  if (target.startsWith('https://')) return target;
  if (target.startsWith('doc:')) {
    const [slug = '', id] = target.slice(4).split('#');
    if (!isDocSlug(slug)) return null;
    return `${pagePath(language, `docs/${slug}`)}${id ? `#${id}` : ''}`;
  }
  if (target.startsWith('site:')) {
    const name = target.slice(5);
    // Without the script, the GRKU Plus links open the looks, where GRKU Plus is.
    if (plusTarget(target)) return pagePath(language, 'install');
    if (Object.hasOwn(DOC_TARGETS, name)) return `${LANGUAGE_PATHS[language]}${DOC_TARGETS[name]}`;
    if (Object.hasOwn(SITE_PAGES, name)) return pagePath(language, name as SitePage);
  }
  return null;
}
