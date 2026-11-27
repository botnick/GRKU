// Writes the language pages, the sitemap, the 404 page, and the edge worker after `vite build`.
//
// Search engines and link previews read the HTML that the server sends. The page renders in the
// browser, so this script renders the first screen of each page of each language into its own
// file: the home page and the install page, at dist/index.html and dist/install/index.html for
// Thai, and under dist/<language>/ for the others. Each page names its other languages with
// hreflang links. The edge worker sends a visitor of a Thai page to the same page of their
// language, and the looks page of the earlier site to the install page.
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';
import { lastModified } from './lastmod.mjs';

const web = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(web, 'dist');
// Inside web/, so the Node build resolves react and the other packages from web/node_modules.
const server = join(web, 'node_modules', '.cache', 'grku-prerender');
/** The header links and the footer of the document pages in each language, for scripts/build-docs.mjs. */
const DOC_CHROME = join(web, 'node_modules', '.cache', 'grku-doc-chrome.json');

/** The `content` or text of an HTML attribute or element. */
const escape = (text) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

/** Replaces the one match of `pattern` in `html`, and fails when the template has none. */
function replaceOne(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`dist/index.html has no match for ${pattern}`);
  return html.replace(pattern, replacement);
}

/** The headers of the `/*` rule in `_headers`, which the worker adds to the root page. */
function siteHeaders(file) {
  const headers = {};
  let all = false;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      all = line.trim() === '/*';
      continue;
    }
    if (!all) continue;
    const colon = line.indexOf(':');
    headers[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  if (!headers['Content-Security-Policy']) throw new Error('_headers has no Content-Security-Policy for /*');
  return headers;
}

async function renderer() {
  await build({
    root: web,
    logLevel: 'warn',
    build: { ssr: 'src/prerender.tsx', outDir: server, emptyOutDir: true, copyPublicDir: false, license: false },
  });
  // The page renders as for a browser that it knows nothing about. Node has its own navigator
  // and storage, which would show the hints for an unknown browser. Without a browser, the
  // catalog requests never answer, so the effect lists render their fallback.
  for (const name of ['navigator', 'localStorage', 'sessionStorage']) {
    Object.defineProperty(globalThis, name, { value: undefined, configurable: true });
  }
  globalThis.fetch = () => new Promise(() => {});
  const module = await import(pathToFileURL(join(server, 'prerender.js')).href);
  // The pages that load a part of the site on demand render it at once, as the browser does after main.tsx loads it.
  await module.preloadAll();
  // The text of every language, each its own module (src/strings/).
  await module.loadAllStrings();
  return module;
}

async function edgeWorker(headers) {
  await build({
    root: web,
    configFile: false,
    logLevel: 'warn',
    define: { __SITE_HEADERS__: JSON.stringify(headers) },
    build: {
      outDir: dist,
      emptyOutDir: false,
      copyPublicDir: false,
      minify: false,
      target: 'es2022',
      lib: { entry: 'src/edge.ts', formats: ['es'], fileName: () => '_worker.js' },
    },
  });
  // Only the Thai pages and the old looks pages run the worker. Pages serves the other files directly.
  const include = [...Object.keys(SITE_PAGES).map((name) => pagePath('th', name)), ...codes.flatMap((code) => [`${LANGUAGE_PATHS[code]}looks`, `${LANGUAGE_PATHS[code]}looks/`])];
  writeFileSync(join(dist, '_routes.json'), `${JSON.stringify({ version: 1, include, exclude: [] }, null, 2)}\n`);
}

const template = readFileSync(join(dist, 'index.html'), 'utf8');
const {
  render,
  docChrome,
  LANGUAGES,
  LANGUAGE_PATHS,
  SITE_PAGES,
  INDEXED_PAGES,
  STRINGS,
  VERSION,
  SITE,
  pagePath,
  pageText,
  alternates: hreflangLinks,
  alternateTags,
  localeTags,
  sitemapXml,
  DEVELOP_STRINGS,
  faqOf,
  DOCS,
  docsStructuredData,
  isDocsPage,
  DOC_PAGES,
  docSlug,
} = await renderer();
const pageNames = Object.keys(SITE_PAGES);
const codes = LANGUAGES.map((language) => language.code);
const pageUrl = (code, name = 'home') => `${SITE}${pagePath(code, name)}`;
/** The hreflang links of a page: every language, and English for the others. */
const alternates = (name) => hreflangLinks(Object.fromEntries(codes.map((code) => [code, pageUrl(code, name)])));
/** The files that each indexed page comes from, relative to web/, for the <lastmod> of the sitemap. */
const PAGE_SOURCES = {
  home: ['src/i18n.ts', 'src/components/Home.tsx', 'src/components/Faq.tsx', 'src/whatsNew.ts', 'src/landing-data.ts', 'src/cameras.ts'],
  install: ['src/i18n.ts', 'src/components/Workbench.tsx', 'src/cameras.ts'],
  guide: ['src/guide.ts', 'src/components/Guide.tsx', 'src/components/GuideArt.tsx'],
  develop: ['src/components/Develop.tsx', 'src/develop', 'develop'],
};
/** The name of a page in its breadcrumb: its title without the name of the site. */
const crumb = (title, name = '') => title.replace(name.startsWith('docs') ? /\s*·\s*[^·]*$/ : /\s*·\s*GRKU$/, '');

function structuredData(code, name) {
  const strings = STRINGS[code];
  const text = pageText(code, name);
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE}/#organization`,
        name: 'GRKU',
        url: `${SITE}/`,
        email: 'support@grku.app',
        logo: { '@type': 'ImageObject', url: `${SITE}/icons/icon-512.png`, width: 512, height: 512 },
      },
      { '@type': 'WebSite', '@id': `${SITE}/#website`, name: 'GRKU', url: `${SITE}/`, inLanguage: codes, publisher: { '@id': `${SITE}/#organization` } },
      {
        '@type': 'WebPage',
        '@id': `${pageUrl(code, name)}#webpage`,
        url: pageUrl(code, name),
        name: text.title,
        description: text.description,
        inLanguage: code,
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@id': name === 'develop' ? `${pageUrl(code, name)}#webapp` : `${pageUrl(code)}#app` },
        primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE}/og.jpg`, width: 1200, height: 630 },
        ...(name === 'home' ? {} : { breadcrumb: { '@id': `${pageUrl(code, name)}#breadcrumb` } }),
      },
      // The app, described once in each language: on the home page and the first step of the install.
      (name === 'home' || name === 'install') && {
        '@type': 'SoftwareApplication',
        '@id': `${pageUrl(code)}#app`,
        name: 'GRKU',
        url: pageUrl(code),
        description: strings.description,
        inLanguage: code,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'RICOH GR III, GR IIIx, GR IV',
        softwareVersion: VERSION,
        image: [`${SITE}/og.jpg`, `${SITE}/og-square.jpg`],
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher: { '@id': `${SITE}/#organization` },
      },
      // The Develop page is a web app of its own: it runs in the browser, free, with GRKU Plus
      // for full-size downloads.
      name === 'develop' && {
        '@type': 'WebApplication',
        '@id': `${pageUrl(code, name)}#webapp`,
        name: crumb(text.title, name),
        url: pageUrl(code, name),
        description: text.description,
        inLanguage: code,
        applicationCategory: 'PhotographyApplication',
        applicationSubCategory: 'MultimediaApplication',
        operatingSystem: 'Any (web browser)',
        browserRequirements: 'Requires JavaScript and WebAssembly',
        isAccessibleForFree: true,
        image: `${SITE}/og/develop-${code}.jpg`,
        featureList: [
          DEVELOP_STRINGS[code].looksTitle,
          ...['grain', 'glow', 'leak', 'diffusion', 'date', 'border'].map((module) => strings.moduleNames[{ grain: 'grain', glow: 'glow', leak: 'lightLeak', diffusion: 'diffusion', date: 'dateStamp', border: 'border' }[module]]),
          DEVELOP_STRINGS[code].plusLine1,
        ],
        offers: [
          { '@type': 'Offer', name: 'GRKU', price: '0', priceCurrency: 'THB' },
          { '@type': 'Offer', name: 'GRKU Plus', price: '49', priceCurrency: 'THB', description: DEVELOP_STRINGS[code].plusLine1 },
        ],
        isPartOf: { '@id': `${pageUrl(code)}#app` },
        publisher: { '@id': `${SITE}/#organization` },
      },
      // Home › page, in the language of the page.
      name !== 'home' && {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl(code, name)}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'GRKU', item: pageUrl(code) },
          ...(name === 'install' || name === 'guide' || name === 'develop' || name === 'docs'
            ? []
            : name.startsWith('docs/')
              ? [{ '@type': 'ListItem', position: 2, name: STRINGS[code].docsNav, item: pageUrl(code, 'docs') }]
              : [{ '@type': 'ListItem', position: 2, name: crumb(pageText(code, 'install').title), item: pageUrl(code, 'install') }]),
          {
            '@type': 'ListItem',
            position: name === 'install' || name === 'guide' || name === 'develop' || name === 'docs' ? 2 : 3,
            name: crumb(text.title, name),
            item: pageUrl(code, name),
          },
        ],
      },
      // The questions of the Develop page, the same text as the page shows.
      name === 'develop' && {
        '@type': 'FAQPage',
        '@id': `${pageUrl(code, name)}#faq`,
        inLanguage: code,
        mainEntity: faqOf(DEVELOP_STRINGS[code]).map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
      // The FAQ of the home page, as Google and the answer engines read it.
      name === 'home' && {
        '@type': 'FAQPage',
        '@id': `${pageUrl(code)}#faq`,
        inLanguage: code,
        mainEntity: strings.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a.join(' ') },
        })),
      },
      // The manual: a TechArticle for each doc, its steps as a HowTo, and the questions as a FAQPage.
      ...(isDocsPage(name) ? docsStructuredData(DOCS[code], code, name, lastModified(web, ['src/docs', 'src/components/DocsPage.tsx'])) : []),
    ].filter(Boolean),
  };
  // A JSON-LD block ends at `</script>`, so `<` never appears as itself.
  return JSON.stringify(data).replaceAll('<', '\\u003c');
}

/**
 * The font files that a Thai page preloads in place of Inter: the Thai page sets its Latin letters
 * in IBM Plex Sans Thai too (index.css), so Inter would only take the connection from the photo.
 */
const THAI_FONTS = readdirSync(join(dist, 'assets'))
  .filter((file) => /^ibm-plex-sans-thai-(thai|latin)-(400|700)-normal-[\w-]+\.woff2$/.test(file))
  .sort()
  .map((file) => `<link rel="preload" href="/assets/${file}" as="font" type="font/woff2" crossorigin="">`);
if (THAI_FONTS.length !== 4) throw new Error(`dist/assets has ${THAI_FONTS.length} of the 4 IBM Plex Sans Thai fonts`);

/**
 * The faces of the preloaded IBM Plex Sans Thai fonts, in the head of a Thai page. fonts.ts adds the
 * other weights after the script runs; until then a Thai page would set its text in Inter and the
 * fonts of the system, which costs a second layout and the Inter files. The Unicode ranges are those
 * of the fontsource styles.
 */
const THAI_STYLE = (() => {
  const css = readFileSync(join(web, 'node_modules', '@fontsource', 'ibm-plex-sans-thai', '400.css'), 'utf8');
  const range = (subset) => {
    const found = new RegExp(`ibm-plex-sans-thai-${subset}-400-normal[\\s\\S]*?unicode-range:\\s*([^;]+);`).exec(css)?.[1];
    if (!found) throw new Error(`@fontsource/ibm-plex-sans-thai/400.css has no ${subset} range`);
    return found.trim();
  };
  return readdirSync(join(dist, 'assets'))
    .filter((file) => /^ibm-plex-sans-thai-(thai|latin)-(400|700)-normal-[\w-]+\.woff2$/.test(file))
    .sort()
    .map((file) => {
      const [, subset, weight] = /^ibm-plex-sans-thai-(thai|latin)-(\d+)-/.exec(file);
      return `@font-face{font-family:'IBM Plex Sans Thai';font-style:normal;font-display:swap;font-weight:${weight};src:url(/assets/${file}) format('woff2');unicode-range:${range(subset)}}`;
    })
    .join('');
})();

/** The preloads of `html` with the fonts of `code`. */
function preloadFonts(html, code) {
  if (code !== 'th') return html;
  html = replaceOne(html, /<\/head>/, `  <style>${THAI_STYLE}</style>\n  </head>`);
  const inter = /\s*<link rel="preload" href="\/assets\/inter-latin-[^"]*" as="font"[^>]*>/g;
  if (!inter.test(html)) throw new Error('dist/index.html preloads no Inter font');
  return replaceOne(html.replace(inter, ''), /(<link rel="preload" href="\/assets\/jetbrains-mono-[^>]*>)/, `$1\n    ${THAI_FONTS.join('\n    ')}`);
}

function page(code, name) {
  const text = pageText(code, name);
  const title = escape(text.title);
  const description = escape(text.description);
  let html = preloadFonts(template, code);
  html = replaceOne(html, /<html lang="[^"]*"/, `<html lang="${code}"`);
  html = replaceOne(html, /<title>[^<]*<\/title>/, `<title>${title}</title>`);
  html = replaceOne(html, /(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${description}$2`);
  html = replaceOne(html, /(<meta property="og:url" content=")[^"]*(")/, `$1${pageUrl(code, name)}$2`);
  html = replaceOne(html, /(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`);
  html = replaceOne(html, /(<meta property="og:description" content=")[^"]*(")/, `$1${description}$2`);
  html = replaceOne(html, /(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`);
  html = replaceOne(html, /(<meta name="twitter:description" content=")[^"]*(")/, `$1${description}$2`);
  html = replaceOne(html, /<meta property="og:locale" content="[^"]*" \/>/, localeTags(code, codes));
  // The picture of the link preview, described in the language of the page.
  const imageAlt = escape(STRINGS[code].site.ogImageAlt);
  html = html.replace(/(<meta (?:property="og:image:alt"|name="twitter:image:alt") content=")[^"]*(")/g, `$1${imageAlt}$2`);
  // The Develop page has a link preview of its own: a photo before and after a look.
  if (name === 'develop') {
    const alt = escape(DEVELOP_STRINGS[code].ogAlt);
    html = replaceOne(html, /(<meta property="og:image" content=")[^"]*og\.jpg(")/, `$1${SITE}/og/develop-${code}.jpg$2`);
    html = replaceOne(html, /(<meta name="twitter:image" content=")[^"]*(")/, `$1${SITE}/og/develop-${code}.jpg$2`);
    html = html.replace(/(<meta (?:property="og:image:alt"|name="twitter:image:alt") content=")[^"]*(")/g, `$1${alt}$2`);
  }
  // The manual has a link preview for its home and each group of docs, in the language of the page.
  if (isDocsPage(name)) {
    const slug = docSlug(name);
    const section = slug ? DOC_PAGES.find((doc) => doc.slug === slug).group : 'home';
    const image = `${SITE}/og/docs-${section}-${code}.jpg`;
    html = replaceOne(html, /(<meta property="og:image" content=")[^"]*og\.jpg(")/, `$1${image}$2`);
    html = replaceOne(html, /(<meta name="twitter:image" content=")[^"]*(")/, `$1${image}$2`);
    html = html.replace(/(<meta (?:property="og:image:alt"|name="twitter:image:alt") content=")[^"]*(")/g, `$1${title}$2`);
  }
  // The later steps of the install hold only the controls of one step: search engines skip them
  // and follow their links to the first step, which carries the hreflang links and the sitemap entry.
  const indexed = INDEXED_PAGES.includes(name);
  const head = [
    `<link rel="canonical" href="${pageUrl(code, name)}" />`,
    ...(indexed ? [alternateTags(alternates(name))] : []),
    // The Markdown of a doc, for answer engines and assistants (scripts/build-docs-text.mjs).
    ...(name.startsWith('docs/') ? [`<link rel="alternate" type="text/markdown" href="${pageUrl(code, name)}index.md" />`] : []),
    `<script type="application/ld+json">${structuredData(code, name)}</script>`,
  ].join('\n    ');
  if (!indexed) html = replaceOne(html, /(<meta name="robots" content=")[^"]*(")/, '$1noindex, follow$2');
  html = replaceOne(html, /<\/head>/, `  ${head}\n  </head>`);
  return replaceOne(html, /<div id="root"><\/div>/, `<div id="root">${render(code, name)}</div>`);
}

/** The value of an HTML attribute as the browser reads it. */
const unescape = (text) =>
  text.replaceAll('&quot;', '"').replaceAll('&#x27;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');

/**
 * Allows the style attributes of the rendered pages in the Content-Security-Policy of `_headers`.
 * The page itself sets styles through the DOM, which the policy allows, but a style attribute
 * in the HTML needs its hash. Without them, the compare slider and the frames lose their layout
 * until the script runs.
 */
function allowStyleAttributes(file, pages, elements = []) {
  const styles = new Set(elements);
  for (const html of pages) {
    for (const match of html.matchAll(/\sstyle="([^"]*)"/g)) styles.add(unescape(match[1]));
  }
  if (styles.size === 0) return;
  const hashes = [...styles]
    .sort()
    .map((style) => `'sha256-${createHash('sha256').update(style).digest('base64')}'`)
    .join(' ');
  const headers = readFileSync(file, 'utf8');
  const policy = /(Content-Security-Policy:[^\n]*style-src 'self')/;
  if (!policy.test(headers)) throw new Error("_headers has no style-src 'self' in its Content-Security-Policy");
  writeFileSync(file, headers.replace(policy, `$1 'unsafe-hashes' ${hashes}`));
}

/**
 * Allows the theme script of the head (index.html, src/theme.ts) in the Content-Security-Policy
 * of `_headers`, by its hash. Every page carries it: the language pages, the 404 page, and the
 * document pages of scripts/build-docs.mjs.
 */
function allowThemeScript(file, html) {
  const script = /<script id="theme">([^<]*)<\/script>/.exec(html)?.[1];
  if (!script) throw new Error('dist/index.html has no <script id="theme">');
  const hash = `'sha256-${createHash('sha256').update(script).digest('base64')}'`;
  const headers = readFileSync(file, 'utf8');
  const policy = /(Content-Security-Policy:[^\n]*script-src 'self')/;
  if (!policy.test(headers)) throw new Error("_headers has no script-src 'self' in its Content-Security-Policy");
  writeFileSync(file, headers.replace(policy, `$1 ${hash}`));
}

const pages = [];
for (const code of codes) {
  for (const name of pageNames) {
    const file = join(dist, `.${pagePath(code, name)}`, 'index.html');
    mkdirSync(dirname(file), { recursive: true });
    const html = page(code, name);
    writeFileSync(file, html);
    pages.push(html);
  }
}

allowStyleAttributes(join(dist, '_headers'), pages, [THAI_STYLE]);
allowThemeScript(join(dist, '_headers'), template);

// Pages serves 404.html with status 404 for a path without a file. Without it, Pages serves the
// root page for every path, and search engines see each wrong address as a copy of the site.
let notFound = template;
notFound = replaceOne(notFound, /<title>[^<]*<\/title>/, '<title>Page not found · GRKU</title>');
// One robots tag, noindex, and none of the link preview or description tags of the home page.
notFound = replaceOne(notFound, /<meta name="robots" content="[^"]*" \/>/, '<meta name="robots" content="noindex" />');
notFound = replaceOne(notFound, /\s*<meta\s+name="description"[^>]*>/, '');
notFound = notFound.replace(/\s*<meta (?:property="og:[^"]*"|name="twitter:[^"]*") content="[^"]*" \/>/g, '');
notFound = notFound.replace(/\s*<!-- (?:The link preview|Two pictures)[^>]*-->/g, '');
notFound = notFound.replace(/\s*<script\b[^>]*\bsrc="[^"]*"[^>]*><\/script>/g, '');
notFound = notFound.replace(/\s*<link rel="modulepreload"[^>]*>/g, '');
notFound = replaceOne(
  notFound,
  /<div id="root"><\/div>/,
  `<main class="not-found"><h1>GRKU</h1><p>Page not found.</p><p>${codes
    .map((code) => `<a href="${LANGUAGE_PATHS[code]}" lang="${code}">${escape(LANGUAGES.find((item) => item.code === code).label)}</a>`)
    .join(' · ')}</p></main>`,
);
writeFileSync(join(dist, '404.html'), notFound);

// The sitemap of the indexed pages; scripts/build-docs.mjs adds the document pages.
writeFileSync(
  join(dist, 'sitemap.xml'),
  sitemapXml(
    INDEXED_PAGES.flatMap((name) => {
      const lastmod = lastModified(web, PAGE_SOURCES[name] ?? (name.startsWith('docs') ? ['src/docs', 'src/components/DocsPage.tsx'] : ['src']));
      return codes.map((code) => ({ loc: pageUrl(code, name), lastmod, alternates: alternates(name) }));
    }),
  ),
);

// The header links and the footer of the document pages, which scripts/build-docs.mjs reads.
writeFileSync(DOC_CHROME, JSON.stringify(Object.fromEntries(codes.map((code) => [code, docChrome(code)]))));

await edgeWorker(siteHeaders(join(dist, '_headers')));
rmSync(server, { recursive: true, force: true });
