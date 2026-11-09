// Renders the Markdown documents of the repository as pages of the site, after `vite build` and
// the prerender: the terms of use, the recovery guide, the firmware dump guide, and the licenses,
// under each language path (src/links.ts DOC_PATHS). A page shows the Markdown of its language
// (resources/<NAME>.<language>.md) or the English one, and says so. The pages link the site
// stylesheet of the build for the tokens and the fonts, and public/docs.css for the text.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { DOC_PATHS, LANGUAGE_PATHS } from '../src/languagePage.ts';

const REPOSITORY = 'https://github.com/botnick/GRKU';

const SITE = 'https://grku.app';
const web = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(web, '..');
const dist = join(web, 'dist');

/** Where each document comes from, and its title in each language of the site. */
const DOCS = {
  TERMS: { file: (code) => join(root, 'resources', `TERMS${code === 'en' ? '' : `.${code}`}.md`) },
  RECOVERY: { file: (code) => join(root, 'resources', `RECOVERY${code === 'en' ? '' : `.${code}`}.md`) },
  DUMP: { file: (code) => join(root, 'resources', `DUMP${code === 'en' ? '' : `.${code}`}.md`) },
  LICENSES: { file: (code) => join(root, 'resources', `LICENSES${code === 'en' ? '' : `.${code}`}.md`) },
};

/** The line that says the page is in English because the language has no translation yet. */
const ENGLISH_NOTE = {
  th: 'หน้านี้ยังมีเฉพาะภาษาอังกฤษ',
  'zh-Hans': '此页面目前仅提供英文版。',
  'zh-Hant': '此頁面目前僅提供英文版。',
  ja: 'このページは現在英語版のみです。',
  ko: '이 페이지는 현재 영어로만 제공됩니다.',
};

const codes = Object.keys(LANGUAGE_PATHS);
const template = readFileSync(join(dist, 'index.html'), 'utf8');
// The site stylesheet of this build, for the tokens and the fonts.
const stylesheet = /<link rel="stylesheet"[^>]*href="([^"]+\.css)"/.exec(template)?.[1];
if (!stylesheet) throw new Error('dist/index.html has no stylesheet link');
const fontPreloads = [...template.matchAll(/<link rel="preload"[^>]*as="font"[^>]*>/g)].map((m) => m[0]).join('\n    ');

const escape = (text) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

/** The source of a document for a page language: its own translation, or English. */
function source(name, code) {
  const own = DOCS[name].file(code);
  if (existsSync(own)) return { file: own, language: code };
  return { file: DOCS[name].file('en'), language: 'en' };
}

/** Rewrites the links of the repository to the pages of the site, in the page language. */
function rewriteLinks(markdown, code) {
  const base = LANGUAGE_PATHS[code];
  return markdown
    .replace(/\]\(\.\.\/effects\/NOTICE\.md\)/g, `](${base}${DOC_PATHS.LICENSES})`)
    .replace(/\]\(\.\.\/LICENSE\)/g, `](${base}${DOC_PATHS.LICENSES})`)
    .replace(/\]\(RECOVERY(?:\.[a-zA-Z-]+)?\.md\)/g, `](${base}${DOC_PATHS.RECOVERY})`)
    .replace(/\]\(DUMP(?:\.[a-zA-Z-]+)?\.md\)/g, `](${base}${DOC_PATHS.DUMP})`)
    .replace(/\]\(TERMS(?:\.[a-zA-Z-]+)?\.md\)/g, `](${base}${DOC_PATHS.TERMS})`)
    .replace(/\]\(LICENSES(?:\.[a-zA-Z-]+)?\.md\)/g, `](${base}${DOC_PATHS.LICENSES})`)
    .replace(/\]\((?:\.\.\/)?docs\/([^)]+)\.md\)/g, `](${REPOSITORY}/blob/main/docs/$1.md)`);
}

/** The first heading of the Markdown, as the page title. */
const titleOf = (markdown) => /^#\s+(.+)$/m.exec(markdown)?.[1]?.trim() ?? 'GRKU';
/** The first paragraph, without Markdown, as the description. */
function descriptionOf(markdown) {
  const paragraph = markdown
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .find((block) => block && !block.startsWith('#') && !block.startsWith('-') && !block.startsWith('1.'));
  return (paragraph ?? '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[`*_]/g, '').replace(/\s+/g, ' ').slice(0, 200);
}

const renderer = new marked.Renderer();
// External links open in a new tab; the pages of the site open in place.
renderer.link = function ({ href, title, tokens }) {
  const text = this.parser.parseInline(tokens);
  const external = /^https?:\/\//.test(href) && !href.startsWith(SITE);
  return `<a href="${escape(href)}"${title ? ` title="${escape(title)}"` : ''}${external ? ' target="_blank" rel="noreferrer"' : ''}>${text}</a>`;
};
marked.setOptions({ renderer, gfm: true });

function page(name, code) {
  const { file, language } = source(name, code);
  const markdown = rewriteLinks(readFileSync(file, 'utf8'), code);
  const title = titleOf(markdown);
  const description = descriptionOf(markdown);
  const body = marked.parse(markdown);
  const url = `${SITE}${LANGUAGE_PATHS[code]}${DOC_PATHS[name]}`;
  const alternates = codes
    .map((other) => `<link rel="alternate" hreflang="${other}" href="${SITE}${LANGUAGE_PATHS[other]}${DOC_PATHS[name]}" />`)
    .join('\n    ');
  const nav = Object.entries(DOC_PATHS)
    .map(([other, path]) => {
      const otherTitle = titleOf(readFileSync(source(other, code).file, 'utf8'));
      return `<a href="${LANGUAGE_PATHS[code]}${path}"${other === name ? ' aria-current="page"' : ''}>${escape(otherTitle)}</a>`;
    })
    .join('');
  const note = language !== code && ENGLISH_NOTE[code] ? `<p class="doc-lang-note" lang="${code}">${ENGLISH_NOTE[code]}</p>` : '';
  return `<!doctype html>
<html lang="${code}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escape(title)} · GRKU</title>
    <meta name="description" content="${escape(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="GRKU" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${escape(title)} · GRKU" />
    <meta property="og:description" content="${escape(description)}" />
    <meta property="og:image" content="${SITE}/og.jpg" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image" content="${SITE}/og-square.jpg" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="1200" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escape(title)} · GRKU" />
    <meta name="twitter:description" content="${escape(description)}" />
    <meta name="twitter:image" content="${SITE}/og.jpg" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <meta name="theme-color" content="#171717" />
    <link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="/icons/icon-192.png" type="image/png" sizes="192x192" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" sizes="180x180" />
    <link rel="manifest" href="/site.webmanifest" />
    <link rel="canonical" href="${url}" />
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: `${title} · GRKU`, description, inLanguage: code, isPartOf: { '@id': `${SITE}/#website` } },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'GRKU', item: `${SITE}${LANGUAGE_PATHS[code]}` },
            { '@type': 'ListItem', position: 2, name: title, item: url },
          ],
        },
      ],
    }).replaceAll('<', '\\u003c')}</script>
    ${alternates}
    ${fontPreloads}
    <link rel="stylesheet" href="${stylesheet}" />
    <link rel="stylesheet" href="/docs.css" />
  </head>
  <body class="doc-page">
    <header class="doc-header">
      <div class="doc-header-inner">
        <a class="doc-brand" href="${LANGUAGE_PATHS[code]}">GRKU<span>.</span></a>
        <nav class="doc-nav" aria-label="GRKU">${nav}</nav>
      </div>
    </header>
    <main class="doc-main"${language !== code ? ` lang="${language}"` : ''}>
      ${note}
      ${body}
    </main>
    <footer class="doc-footer">
      <div class="doc-footer-inner">
        <a href="${LANGUAGE_PATHS[code]}">GRKU</a>
        <a href="${REPOSITORY}" target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </footer>
  </body>
</html>
`;
}

const urls = [];
for (const code of codes) {
  for (const name of Object.keys(DOC_PATHS)) {
    const dir = join(dist, `.${LANGUAGE_PATHS[code]}`, DOC_PATHS[name]);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), page(name, code));
    urls.push(`${SITE}${LANGUAGE_PATHS[code]}${DOC_PATHS[name]}`);
  }
}

// The document pages join the sitemap of the prerender.
const sitemap = join(dist, 'sitemap.xml');
if (existsSync(sitemap)) {
  const entries = urls
    .map((url) => {
      const doc = Object.keys(DOC_PATHS).find((name) => url.endsWith(DOC_PATHS[name]));
      const alternates = codes
        .map((other) => `    <xhtml:link rel="alternate" hreflang="${other}" href="${SITE}${LANGUAGE_PATHS[other]}${DOC_PATHS[doc]}"/>`)
        .join('\n');
      return `  <url>\n    <loc>${url}</loc>\n${alternates}\n  </url>`;
    })
    .join('\n');
  writeFileSync(sitemap, readFileSync(sitemap, 'utf8').replace('</urlset>', `${entries}\n</urlset>`));
}
console.log(`docs: ${urls.length} pages`);
