// Writes the knowledge pack of the GRKU assistant to dist/chat/knowledge.json after `vite build`
// (src/chat/knowledge.ts says what it holds). The Worker of the assistant (services/plus/src/chat)
// reads it from the site, so the assistant knows what this build of the site says.
//
// Usage: node scripts/build-chat-knowledge.mjs [OUT_FILE]   (default dist/chat/knowledge.json)
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const web = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(web, '..');
const out = resolve(process.argv[2] ?? join(web, 'dist', 'chat', 'knowledge.json'));

/** The workspace version (Cargo.toml), as the site shows it. */
function version() {
  const manifest = readFileSync(join(root, 'Cargo.toml'), 'utf8');
  const found = /^\[workspace\.package\][^[]*?^version = "([^"]+)"/m.exec(manifest)?.[1];
  if (!found) throw new Error('Cargo.toml has no [workspace.package] version');
  return found;
}

/** The effects of the repository: what the catalog of a release holds. */
function effects() {
  const dir = join(root, 'effects');
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'sources')
    .flatMap((entry) => {
      let data;
      try {
        data = JSON.parse(readFileSync(join(dir, entry.name, 'effect.json'), 'utf8'));
      } catch {
        return [];
      }
      return [{ id: data.effect_id, name: data.name, cover: data.cover, monochrome: (data.flags & 1) === 1, film: data.attribution?.target }];
    });
}

// The TypeScript sources of the site load through Vite, as the prerender does, so their imports
// resolve as in the build.
const server = await createServer({ root: web, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true } });
try {
  const { buildKnowledge } = await server.ssrLoadModule('/src/chat/knowledge.ts');
  const { en } = await server.ssrLoadModule('/src/strings/en.ts');
  const { GUIDE_STRINGS } = await server.ssrLoadModule('/src/guide.ts');
  const { CAMERAS } = await server.ssrLoadModule('/src/cameras.ts');
  const { RELEASES, newsStrings } = await server.ssrLoadModule('/src/whatsNew.ts');
  const news = newsStrings('en');
  const pack = buildKnowledge({
    version: version(),
    strings: en,
    guide: GUIDE_STRINGS.en,
    cameras: CAMERAS,
    effects: effects(),
    news: RELEASES.slice(0, 3).map((release) => ({ version: release.version, date: release.date, items: release.items.map((key) => news[key] ?? '') })),
    recovery: readFileSync(join(root, 'resources', 'RECOVERY.md'), 'utf8'),
    terms: readFileSync(join(root, 'resources', 'TERMS.md'), 'utf8'),
    manual: readFileSync(join(root, 'resources', 'INSTALLATION-GR4.md'), 'utf8'),
  });
  mkdirSync(dirname(out), { recursive: true });
  const text = JSON.stringify(pack);
  writeFileSync(out, text);
  const core = pack.sections.filter((s) => s.core).reduce((n, s) => n + s.text.length, 0);
  console.log(`chat knowledge: ${pack.looks.length} looks, ${pack.sections.length} sections, ${(text.length / 1024).toFixed(1)} KB (core ${(core / 1024).toFixed(1)} KB) → ${out}`);
} finally {
  await server.close();
}
