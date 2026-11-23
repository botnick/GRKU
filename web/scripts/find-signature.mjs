// Looks for the marks of GRKU (HANDOFF.md, Signatures) in a file or a page:
//   node scripts/find-signature.mjs FILE|URL...
// It reports the zero-width text tag (src/signature.ts), the build signature GRKU·BOTNICK
// (scripts, styles, data-grku), the author meta tag, and the rights in picture metadata
// (scripts/image-rights.mjs). A page found at a URL also has its scripts and styles checked.
// Text pasted from a copy works too: save it to a file first. Exit status 0 when a mark is found.
import { readFileSync } from 'node:fs';

const EDGE = '​';

/** The tags of the zero-width marks in `text`: U+200B, then U+200C (0) or U+200D (1) per bit, then U+200B. */
function zeroWidthTags(text) {
  const tags = [];
  for (const match of text.matchAll(new RegExp(`${EDGE}([\\u200c\\u200d]{8,})${EDGE}`, 'g'))) {
    const bits = match[1];
    if (bits.length % 8) continue;
    const bytes = Buffer.alloc(bits.length / 8);
    for (let index = 0; index < bits.length; index += 1) if (bits[index] === '‍') bytes[index >> 3] |= 0x80 >> (index & 7);
    tags.push(bytes.toString('utf8'));
  }
  return tags;
}

/** The marks in `bytes`, as lines of a report. */
function marks(bytes) {
  const text = bytes.toString('utf8');
  const latin = bytes.toString('latin1');
  const found = [];
  const tags = zeroWidthTags(text);
  if (tags.length) found.push(`zero-width text tag ×${tags.length}: ${[...new Set(tags)].join(', ')}`);
  const builds = new Set(text.match(/GRKU·BOTNICK(?:·[\w.-]+)*/g) ?? []);
  if (builds.size) found.push(`build signature: ${[...builds].join(', ')}`);
  if (/<meta name="author" content="BOTNICK"/.test(text)) found.push('meta author: BOTNICK');
  if (/--grku-sig/.test(text)) found.push('CSS custom property --grku-sig');
  if (/data-grku/.test(text)) found.push('data-grku attribute');
  if (/BOTNICK[^\n]{0,40}grku\.app/.test(latin) && /^(\xff\xd8|RIFF|\x89PNG)/.test(latin)) found.push('picture metadata: © BOTNICK · GRKU (grku.app)');
  return found;
}

async function load(source) {
  if (!/^https?:\/\//.test(source)) return { bytes: readFileSync(source), type: '' };
  const response = await fetch(source, { headers: { 'User-Agent': 'grku-find-signature' } });
  if (!response.ok) throw new Error(`${source}: HTTP ${response.status}`);
  return { bytes: Buffer.from(await response.arrayBuffer()), type: response.headers.get('content-type') ?? '' };
}

const sources = process.argv.slice(2);
if (sources.length === 0) {
  console.error('Usage: node scripts/find-signature.mjs FILE|URL...');
  process.exit(2);
}
let any = false;
for (const source of sources) {
  const { bytes, type } = await load(source);
  const report = marks(bytes).map((line) => `  ${line}`);
  // A page: its scripts and styles too, where the build signature lives.
  if (type.includes('html')) {
    const html = bytes.toString('utf8');
    for (const [, path] of html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)) {
      const url = new URL(path, source).href;
      try {
        for (const line of marks((await load(url)).bytes)) report.push(`  ${new URL(url).pathname}: ${line}`);
      } catch {
        // A file that does not load says nothing.
      }
    }
  }
  any ||= report.length > 0;
  console.log(report.length ? `${source}: GRKU marks found\n${report.join('\n')}` : `${source}: no GRKU mark`);
}
process.exit(any ? 0 : 1);
