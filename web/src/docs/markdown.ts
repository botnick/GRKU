// The manual as Markdown, for /llms-full.txt and the Markdown copy of each page
// (scripts/build-docs-text.mjs), so answer engines and assistants read the same text as the page.
import type { Language } from '../i18n';
import { CAMERAS } from '../cameras';
import { LANGUAGE_PATHS } from '../languagePage';
import { parseInline, targetUrl } from './inline';
import { settingRows } from './settingsTable';
import { DOC_PAGES, type DocSlug } from './pages';
import type { DocBlock, DocsContent } from './types';

const SITE = 'https://grku.app';

/** Text with inline marks as Markdown, with absolute links. */
export function inlineMarkdown(text: string, language: Language): string {
  return parseInline(text)
    .map((part) => {
      switch (part.kind) {
        case 'code':
          return `\`${part.text}\``;
        case 'bold':
          return `**${part.text}**`;
        case 'key':
          return `**${part.text}**`;
        case 'link': {
          const url = targetUrl(part.target, language);
          return url ? `[${part.text}](${url.startsWith('/') ? SITE + url : url})` : part.text;
        }
        default:
          return part.text;
      }
    })
    .join('');
}

function blockMarkdown(block: DocBlock, content: DocsContent, language: Language): string {
  const md = (text: string) => inlineMarkdown(text, language);
  switch (block.kind) {
    case 'p':
      return md(block.text);
    case 'h2':
      return `## ${block.text}`;
    case 'steps':
      return block.items.map((item, index) => `${index + 1}. ${md(item)}`).join('\n');
    case 'list':
      return block.items.map((item) => `- ${md(item)}`).join('\n');
    case 'note':
      return `> **${block.title}:** ${md(block.text)}`;
    case 'path':
      return block.items.map((item) => `**${item}**`).join(' › ');
    case 'table':
      return [`| ${block.head.join(' | ')} |`, `| ${block.head.map(() => '---').join(' | ')} |`, ...block.rows.map((row) => `| ${row.map(md).join(' | ')} |`)].join('\n');
    case 'files':
    case 'card':
      return block.items.map(([name, about]) => `- \`${name}\`: ${about}`).join('\n');
    case 'settings':
      return [
        `| ${content.ui.settingCol} | ${content.ui.choicesCol} |`,
        '| --- | --- |',
        ...(settingRows(block.module, language) ?? []).map((row) => `| **${row.name}** | ${row.values.map((value, index) => (index === row.default ? `**${value}** (${content.ui.defaultMark})` : value)).join(', ')}. ${md(block.notes[row.key] ?? '')} |`),
      ].join('\n');
    case 'flow':
      return block.steps.map((step) => `- ${md(step.see)} → ${md(step.then)}`).join('\n');
    case 'cameras':
      return [
        `| ${content.ui.camera} | ${content.ui.firmware} | ${content.ui.modeset} |`,
        '| --- | --- | --- |',
        ...CAMERAS.filter((camera) => camera.support).map((camera) => `| ${camera.name} | ${camera.support!.firmware} | ${camera.support!.modeset} |`),
      ].join('\n');
    default:
      return '';
  }
}

/** The address of a doc on the site. */
export const docUrl = (language: Language, slug: DocSlug | null) => `${SITE}${LANGUAGE_PATHS[language]}docs/${slug ? `${slug}/` : ''}`;

/** One page of the manual as Markdown. */
export function docMarkdown(content: DocsContent, slug: DocSlug, language: Language): string {
  const page = content.pages[slug];
  return [
    `# ${page.title}`,
    '',
    page.lead,
    '',
    ...page.blocks.map((block) => blockMarkdown(block, content, language)).filter(Boolean).flatMap((text) => [text, '']),
    `Source: ${docUrl(language, slug)}`,
    '',
  ].join('\n');
}

/** The whole manual of a language as Markdown. */
export function manualMarkdown(content: DocsContent, language: Language): string {
  return [
    `# ${content.home.title} (${language})`,
    '',
    content.home.lead,
    '',
    ...DOC_PAGES.map(({ slug }) => docMarkdown(content, slug, language).replace(/^# /, '## ').replace(/\n## /g, '\n### ')),
  ].join('\n');
}
