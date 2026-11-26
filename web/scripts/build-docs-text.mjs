// Writes the user manual (/docs/) as Markdown after the prerender, for answer engines and
// assistants: the Markdown of each doc next to its page (<page>/index.md), the whole manual in
// every language in /llms-full.txt, and the list of the docs in /llms.txt.
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const web = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(web, 'dist');
const server = await createServer({ root: web, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true } });
try {
  const { loadDocs } = await server.ssrLoadModule('/src/docs/load.ts');
  const { docMarkdown, docUrl, manualMarkdown } = await server.ssrLoadModule('/src/docs/markdown.ts');
  const { DOC_PAGES } = await server.ssrLoadModule('/src/docs/pages.ts');
  const { LANGUAGE_PATHS } = await server.ssrLoadModule('/src/languagePage.ts');
  const codes = ['en', 'th', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  const full = [
    '# GRKU manual, all languages',
    '',
    '> The user manual of GRKU (https://grku.app/docs/): how to install it on a RICOH GR III, GR IIIx, or GR IV, every feature and setting on the camera, the site, and troubleshooting. English first, then Thai, Simplified Chinese, Traditional Chinese, Japanese, and Korean.',
    '',
  ];
  for (const code of codes) {
    const content = await loadDocs(code);
    for (const { slug } of DOC_PAGES) {
      const file = join(dist, `.${LANGUAGE_PATHS[code]}docs/${slug}/index.md`);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, docMarkdown(content, slug, code));
    }
    full.push(manualMarkdown(content, code), '');
  }
  writeFileSync(join(dist, 'llms-full.txt'), full.join('\n'));
  const en = await loadDocs('en');
  const th = await loadDocs('th');
  appendFileSync(
    join(dist, 'llms.txt'),
    [
      '',
      '## Manual',
      '',
      `- [${en.home.title}](${docUrl('en', null)}), [Thai](${docUrl('th', null)}): ${en.home.lead} The whole manual in every language as Markdown: https://grku.app/llms-full.txt. Each page has its Markdown at index.md.`,
      ...DOC_PAGES.map(({ slug }) => `- [${en.pages[slug].title}](${docUrl('en', slug)}) ([ไทย: ${th.pages[slug].title}](${docUrl('th', slug)})): ${en.pages[slug].lead}`),
      '',
    ].join('\n'),
  );
  console.log(`docs text: ${DOC_PAGES.length} pages x ${codes.length} languages, llms-full.txt ${(readFileSync(join(dist, 'llms-full.txt')).length / 1024).toFixed(0)} KB`);
} finally {
  await server.close();
}
