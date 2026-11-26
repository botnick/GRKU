// Print the descriptions of the recipe presets of the site as JSON: each language code, with
// each preset ID and its text, from web/src/recipeStrings.ts. node preset-text.mjs FILE
import fs from 'node:fs';

const LANGUAGES = { en: 'en', zhHans: 'zh-Hans', zhHant: 'zh-Hant', ja: 'ja', ko: 'ko', th: 'th' };
const source = fs.readFileSync(process.argv[2], 'utf8');
const result = {};
for (const block of source.matchAll(/^const (\w+)(?:: \w+)? = \{([\s\S]*?)^\};/gm)) {
  const language = LANGUAGES[block[1]];
  const texts = block[2].match(/presetText: \{([\s\S]*?)\n {2}\}/);
  if (!language || !texts) continue;
  result[language] = {};
  for (const entry of texts[1].matchAll(/^\s*'?([a-z0-9-]+)'?: '((?:[^'\\]|\\.)*)',/gm)) {
    result[language][entry[1]] = entry[2].replaceAll("\\'", "'");
  }
}
process.stdout.write(JSON.stringify(result, null, 1));
