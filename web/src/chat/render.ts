// The answers of the assistant as the panel shows them: a small Markdown (paragraphs, lists,
// **bold**, `code`, links), the link buttons of the site places the answer names, the look cards
// of a ```looks block, and the quick replies of a ```chips block. Only known site paths become
// buttons; any other link stays plain text, so an answer can never send a visitor elsewhere.
import type { Language } from '../i18n';
import { LANGUAGE_PATHS } from '../languagePage';
import { DOCS_SITE_PAGES } from '../docs/pages';

export type Inline = { kind: 'text'; text: string } | { kind: 'bold'; text: string } | { kind: 'code'; text: string } | { kind: 'link'; text: string; link: SiteLink };

export type Block = { kind: 'paragraph'; parts: Inline[] } | { kind: 'list'; ordered: boolean; items: Inline[][] };

/** A place of the site that a link button opens. */
export type SiteLink =
  | { kind: 'page'; href: string; path: string }
  | { kind: 'plus'; start: 'tiers' | 'key' }
  | { kind: 'mail'; href: string }
  | { kind: 'external'; href: string };

export interface LookPick {
  id: string;
  why: string;
}

export interface Reply {
  blocks: Block[];
  /** The site places of the answer, each once, in order: the buttons under it. */
  links: { text: string; link: SiteLink }[];
  looks: LookPick[];
  /** Quick replies the answer offers. */
  chips: string[];
}

/** The site paths that an answer may link, without the language prefix; `#` and `?look=` follow. */
const PATHS = ['/', '/install/', '/install/camera/', '/install/modules/', '/install/write/', '/guide/', '/develop/', '/recovery/', '/terms/', ...DOCS_SITE_PAGES.map((page) => `/${page}/`)];
const GUIDE_ANCHORS = ['put', 'camera', 'use', 'update', 'uninstall', 'help'];
const EXTERNAL = /^https:\/\/(www\.)?ricoh-imaging\.(co\.jp|com)(\/[\w./?=&#-]*)?$/;
const LOOK_ID = /^[a-z0-9][a-z0-9-]{2,40}$/;

/**
 * The site place of a link target of an answer, in the visitor's language, or null for a target
 * that is no place of the site. `/install/` becomes `/en/install/` on the English page.
 */
export function siteLink(target: string, language: Language): SiteLink | null {
  const raw = target.trim().replace(/^https:\/\/(www\.)?grku\.app(?=\/)/, '');
  if (/^mailto:support@grku\.app$/i.test(raw) || /^support@grku\.app$/i.test(raw)) return { kind: 'mail', href: 'mailto:support@grku.app' };
  if (EXTERNAL.test(raw)) return { kind: 'external', href: raw };
  if (raw === '/#plus' || raw === '#plus') return { kind: 'plus', start: 'tiers' };
  if (raw === '/#plus-key' || raw === '#plus-key') return { kind: 'plus', start: 'key' };
  const match = /^(\/[a-z/-]*?)(?:\?look=([a-z0-9-]+))?(?:#([a-z0-9-]+))?$/.exec(raw);
  if (!match) return null;
  let path = match[1]!.endsWith('/') ? match[1]! : `${match[1]}/`;
  // A path given with a language prefix, such as /en/install/.
  for (const prefix of Object.values(LANGUAGE_PATHS)) if (prefix !== '/' && path.startsWith(prefix)) path = path.slice(prefix.length - 1);
  if (!PATHS.includes(path)) return null;
  const look = match[2];
  const anchor = match[3];
  if (look && (!LOOK_ID.test(look) || (path !== '/develop/' && path !== '/install/'))) return null;
  // A section of the manual: any heading id of a page of the manual (docs/content).
  const docsAnchor = path.startsWith('/docs/') && path !== '/docs/' && !!anchor && /^[a-z][a-z0-9-]{1,30}$/.test(anchor);
  if (anchor && !(path === '/guide/' && GUIDE_ANCHORS.includes(anchor)) && !docsAnchor) return null;
  const href = `${LANGUAGE_PATHS[language]}${path.slice(1)}${look ? `?look=${look}` : ''}${anchor ? `#${anchor}` : ''}`;
  return { kind: 'page', href, path };
}

/** The inline parts of a line: **bold**, `code`, [text](target), and bare site paths stay text. */
export function inline(text: string, language: Language): Inline[] {
  const parts: Inline[] = [];
  const pattern = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) parts.push({ kind: 'text', text: text.slice(last, match.index) });
    if (match[1] !== undefined) parts.push({ kind: 'bold', text: match[1] });
    else if (match[2] !== undefined) parts.push({ kind: 'code', text: match[2] });
    else {
      const link = siteLink(match[4]!, language);
      parts.push(link ? { kind: 'link', text: match[3]!, link } : { kind: 'text', text: match[3]! });
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ kind: 'text', text: text.slice(last) });
  return parts;
}

/** The JSON of a fenced block, or null. */
function fenced(text: string, name: string): { body: unknown; rest: string } | null {
  const pattern = new RegExp('```' + name + '\\s*\\n?([\\s\\S]*?)(```|$)');
  const match = pattern.exec(text);
  if (!match) return null;
  const rest = text.slice(0, match.index) + text.slice(match.index + match[0].length);
  try {
    return { body: JSON.parse(match[1]!.trim()), rest };
  } catch {
    // Still streaming, or broken: hide the block.
    return { body: null, rest };
  }
}

/** A look id as models sometimes misspell it (tri-x-400-mono-v1 for trix-400-mono-v1): letters and digits only. */
export const lookKey = (id: string) => id.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Links that a small model wrote a little wrong, as it meant them: the path inside the brackets
 * ([Guide /guide/] or [Guide (/guide/)]), a space before the round brackets, or a stray character
 * in the path of GRKU Plus (/+#plus, / #plus). Only a site path or a mail address counts; a looks
 * block, whose JSON holds quotes and braces, is never touched.
 */
export function repairLinks(text: string): string {
  return text
    .replace(/\[([^[\]\n{}"]{1,80}?)\s*\(?\s*((?:\/|#)[^\s\]()]*|support@grku\.app)\s*\)?\](?!\()/g, '[$1]($2)')
    .replace(/\]\s+\(((?:\/|#)[^)\s]*)\)/g, ']($1)')
    .replace(/\]\(\s+([^)\s]+)\s*\)/g, ']($1)')
    .replace(/\]\(\s*\/\s*\+?\s*#/g, '](/#')
    .replace(/\]\(\s*\/\s*\+\s*\//g, '](/');
}

/**
 * An answer, complete or still streaming, as blocks, link buttons, look cards, and quick replies.
 * `resolveLook` gives the library id of a look id, or null for a look the library does not have.
 */
export function parseReply(text: string, language: Language, resolveLook: (id: string) => string | null = (id) => id): Reply {
  let body = repairLinks(text.replace(/\r/g, ''));
  const looks: LookPick[] = [];
  // A looks block that lost its fence: a line that is only a JSON array of {"id": …}.
  if (!body.includes('```looks')) body = body.replace(/^\s*(\[\s*\{\s*"id"[\s\S]*?\}\s*\])\s*$/m, (_, json: string) => `\`\`\`looks\n${json}\n\`\`\``);
  const lookBlock = fenced(body, 'looks');
  if (lookBlock) {
    body = lookBlock.rest;
    if (Array.isArray(lookBlock.body)) {
      for (const item of lookBlock.body as unknown[]) {
        const { id, why } = (item ?? {}) as { id?: unknown; why?: unknown };
        const known = typeof id === 'string' && LOOK_ID.test(id) ? resolveLook(id) : null;
        if (known && !looks.some((look) => look.id === known)) looks.push({ id: known, why: typeof why === 'string' ? why.slice(0, 120) : '' });
      }
    }
  }
  const chips: string[] = [];
  const chipBlock = fenced(body, 'chips');
  if (chipBlock) {
    body = chipBlock.rest;
    if (Array.isArray(chipBlock.body)) {
      for (const chip of chipBlock.body as unknown[]) if (typeof chip === 'string' && chip.trim() && chip.length <= 60) chips.push(chip.trim());
    }
  }
  // Any other fence shows as text without the fence.
  body = body.replace(/```\w*\n?/g, '');

  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ kind: 'paragraph', parts: inline(paragraph.join(' '), language) });
    paragraph = [];
  };
  const flushList = () => {
    if (list) blocks.push({ kind: 'list', ordered: list.ordered, items: list.items.map((item) => inline(item, language)) });
    list = null;
  };
  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim().replace(/^#{1,6}\s+/, '');
    const bullet = /^[-*•]\s+(.*)$/.exec(line);
    const number = /^\d{1,2}[.)]\s+(.*)$/.exec(line);
    if (!line) {
      flushParagraph();
      flushList();
    } else if (bullet || number) {
      flushParagraph();
      const ordered = !!number;
      if (list && list.ordered !== ordered) flushList();
      list ??= { ordered, items: [] };
      list.items.push((bullet ?? number)![1]!);
    } else if (list && /^\s{2,}/.test(rawLine)) {
      // A continued list item.
      list.items[list.items.length - 1] += ` ${line}`;
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();

  const links: Reply['links'] = [];
  const seen = new Set<string>();
  const collect = (parts: Inline[]) => {
    for (const part of parts) {
      if (part.kind !== 'link') continue;
      const key = JSON.stringify(part.link);
      if (seen.has(key) || part.link.kind === 'mail') continue;
      seen.add(key);
      links.push({ text: part.text, link: part.link });
    }
  };
  for (const block of blocks) {
    if (block.kind === 'paragraph') collect(block.parts);
    else block.items.forEach(collect);
  }
  // A line or a list of links alone ("Guide | Develop") repeats the buttons under the answer: leave it out.
  const onlyLinks = (parts: Inline[]) => parts.some((p) => p.kind === 'link') && parts.every((p) => p.kind === 'link' || (p.kind === 'text' && /^[\s|·•,、/–—:-]*$/.test(p.text)));
  const linksOnly = (block: Block) => (block.kind === 'paragraph' ? onlyLinks(block.parts) : block.items.every(onlyLinks));
  const shown = blocks.filter((block, index) => !(index > 0 && linksOnly(block)));
  return { blocks: shown, links: links.slice(0, 4), looks: looks.slice(0, 4), chips: chips.slice(0, 4) };
}

/** The plain text of an answer, for Copy: the Markdown marks and the blocks out. */
export function plainText(text: string): string {
  return text
    .replace(/```(looks|chips)[\s\S]*?(```|$)/g, '')
    .replace(/```\w*\n?/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1')
    .trim();
}
