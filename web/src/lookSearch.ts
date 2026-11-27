/**
 * The search of the film looks, for the shelf of the install page and the look picker of the
 * Develop page. It ignores case, spaces, and punctuation; it matches the name, the brand, the name
 * and number on the box, the ID, the kind, and the look text; it knows the common other names of
 * the brands and films, in Latin letters and in Thai (ALIASES); and it forgives a typo or two in a
 * long word. The results come best first: the exact name, then a name that starts with the search,
 * then the other direct matches, then the matches through another name, then the near misses.
 */
import type { Cover } from './catalog';
import { brandOf, filmKind } from './filmKind';

/** What the search reads of an effect: the fields of a catalog or an imported effect. */
export interface SearchableLook {
  id: string;
  name: string;
  cover?: Cover;
  monochrome?: boolean;
  look?: string;
  imported?: unknown;
  card?: unknown;
}

/**
 * The other names that people search for: each group lists the words that the looks carry first
 * (the canonical words, in Latin letters), then the other spellings, short names, and Thai
 * transliterations. The Thai words are product names, as people type them.
 */
const ALIASES: readonly (readonly string[])[] = [
  ['fujifilm', 'fuji', 'ฟูจิ', 'ฟูจิฟิล์ม'],
  ['kodak', 'โกดัก', 'โกดักซ์', 'โคดัก'],
  ['portra', 'พอร์ตร้า', 'พอร์ทรา', 'พอร์ตรา', 'พอทร้า', 'พอตร้า'],
  ['gold', 'โกลด์', 'โกล'],
  ['cinestill', 'cine still', 'ซีเนสติล', 'ซีเนสติลล์', 'ซินีสติล'],
  ['classic chrome', 'classicchrome', 'คลาสสิกโครม', 'คลาสสิคโครม'],
  ['classic neg', 'classic negative', 'คลาสสิกเนก', 'คลาสสิคเนก'],
  // GR II Positive (GRKU) was Positive GRII before.
  ['gr ii', 'grii', 'gr2', 'gr 2'],
  ['positive', 'positive film', 'โพสิทีฟ', 'โพสิทิฟ', 'โพสิทีฟฟิล์ม'],
  ['mono', 'bw', 'b w', 'b and w', 'black and white', 'black white', 'monochrome', 'ขาวดำ', 'ขาว ดำ'],
  ['instax', 'อินสแตกซ์', 'อินสตาซ์', 'อินสแต็กซ์', 'อินสแตก'],
  ['finepix', 'fine pix', 'ฟายน์พิกซ์', 'ไฟน์พิกซ์', 'ฟายพิก'],
  ['ricoh', 'ริโก้', 'ริโก', 'ริโคห์'],
  ['agfa', 'อักฟา', 'แอกฟา'],
  ['ilford', 'อิลฟอร์ด', 'อิลฟอด'],
  ['lomography', 'lomo', 'โลโม่', 'โลโม'],
  ['polaroid', 'โพลารอยด์'],
  ['kodachrome', 'โกดาโครม', 'โคดาโครม'],
  ['ektachrome', 'เอ็กตาโครม'],
  ['ektar', 'เอ็กต้า', 'เอกต้า'],
  ['velvia', 'เวลเวีย'],
  ['provia', 'โปรเวีย'],
  ['superia', 'ซูพีเรีย'],
  ['tri x', 'trix', 'ไตรเอ็กซ์'],
  ['hp5', 'hp 5'],
  ['ultramax', 'ultra max', 'อัลตร้าแม็กซ์'],
  ['vision3', 'vision 3', 'วิชั่น'],
  ['cine', 'cinema', 'movie', 'ภาพยนตร์', 'หนัง'],
  ['slide', 'reversal', 'สไลด์'],
  ['negative', 'color negative', 'เนกาทีฟ'],
  ['instant', 'อินสแตนท์', 'อินสแตนต์'],
];

/** Lower case, no accents, and every run of punctuation or space as one space. Thai marks stay. */
export function normalize(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    // A space between letters and digits too, so that "portra400" finds "Portra 400".
    .replace(/([a-z])(?=\d)|(\d)(?=[a-z]{2})/g, '$1$2 ')
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, ' ')
    .trim();
}

const compact = (text: string) => text.replace(/ /g, '');
const isThai = (text: string) => /[฀-๿]/.test(text);

/**
 * The distance between two words, with a swap of two letters as one edit (optimal string
 * alignment), or more than `max` as soon as it is clear.
 */
export function editDistance(a: string, b: string, max = 3): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const width = b.length + 1;
  // The rows of the table one after another: the cell of i, j is at i * width + j.
  const cells = new Uint16Array((a.length + 1) * width);
  const at = (i: number, j: number) => cells[i * width + j] ?? 0;
  for (let j = 0; j <= b.length; j++) cells[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cells[i * width] = i;
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(at(i - 1, j) + 1, at(i, j - 1) + 1, at(i - 1, j - 1) + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) value = Math.min(value, at(i - 2, j - 2) + 1);
      cells[i * width + j] = value;
      best = Math.min(best, value);
    }
    if (best > max) return max + 1;
  }
  return at(a.length, b.length);
}

/** The typos a word may have: none below 5 letters, one up to 7, two from 8. */
const allowedEdits = (word: string) => ([...word].length < 5 || /^\d+$/.test(word) ? 0 : [...word].length < 8 ? 1 : 2);

/** The distance of a word of the search to the closest word of a look, or of the start of one. */
function closestWord(word: string, words: readonly string[], max: number): number {
  let best = max + 1;
  for (const candidate of words) {
    best = Math.min(best, editDistance(word, candidate, max));
    // The start of a longer word: "finepx" is near "finepix" of "finepixccd".
    if (candidate.length > word.length + 1) best = Math.min(best, editDistance(word, candidate.slice(0, word.length), max));
    if (best === 0) break;
  }
  return best;
}

/** The text of a look that the search reads, normalised: its words and the whole as one string. */
interface Haystack {
  name: string;
  /** The look text, which tells the paper and the source too: "on Fujicolor Crystal Archive paper". */
  look: { text: string; flat: string };
  /** The words of the brand and the box, for the closest looks. */
  box: readonly string[];
  words: readonly string[];
  text: string;
  flat: string;
}

/** The haystacks of the looks, made once for each effect object. */
const haystacks = new WeakMap<SearchableLook, Haystack>();

function haystackOf(effect: SearchableLook): Haystack {
  let hay = haystacks.get(effect);
  if (!hay) {
    hay = makeHaystack(effect);
    haystacks.set(effect, hay);
  }
  return hay;
}

function makeHaystack(effect: SearchableLook): Haystack {
  const cover = effect.cover;
  const parts = [
    effect.name,
    brandOf(effect),
    cover?.brand,
    cover?.name,
    cover?.number,
    cover?.number && cover?.name ? `${cover.name}${cover.number}` : '',
    effect.id.replace(/-v\d+$/, ''),
    filmKind(effect),
    effect.monochrome ? 'mono' : '',
  ];
  const text = normalize(parts.filter(Boolean).join(' | '));
  const box = normalize([brandOf(effect), cover?.name, cover?.number].filter(Boolean).join(' ')).split(' ').filter(Boolean);
  const look = normalize(effect.look ?? '');
  return { name: normalize(effect.name), box, words: [...new Set(text.split(' '))], text: ` ${text} `, flat: compact(text), look: { text: ` ${look} `, flat: compact(look) } };
}

/** The words that every look is, which a search may add: "film", "look". */
const FILLER = ['film', 'films', 'look', 'looks', 'ฟิล์ม', 'ลุค'];

/**
 * A part of the search: a word as typed, with the group of ALIASES that it names, if any. A Thai
 * word near an alias but not one is `fuzzy`.
 */
interface Term {
  word: string;
  group?: number;
  fuzzy?: boolean;
}

const ALIAS_NAMES = ALIASES.flatMap((group, index) => group.map((alias) => ({ alias: normalize(alias), index }))).sort((a, b) => b.alias.length - a.alias.length);

/** The search split into words, with the other names that it uses marked with their group. */
function termsOf(query: string): Term[] {
  let text = ` ${normalize(query)} `;
  const found: Term[] = [];
  // The longest names first, so "classic chrome" goes before "chrome" and "ฟูจิฟิล์ม" before "ฟูจิ".
  // A Latin name is a whole word or words; Thai is written without spaces, so anywhere.
  for (const { alias, index } of ALIAS_NAMES) {
    const pattern = isThai(alias) ? alias : ` ${alias} `;
    if (!text.includes(pattern)) continue;
    text = text.split(pattern).join(` \u0001${found.length} `);
    found.push({ word: alias, group: index });
  }
  for (const filler of FILLER) text = text.split(isThai(filler) ? filler : ` ${filler} `).join(' ');
  const terms: Term[] = [];
  for (const word of text.trim().split(/ +/)) {
    if (!word) continue;
    const marker = /^\u0001(\d+)$/.exec(word);
    const marked = marker && found[Number(marker[1])];
    if (marked) {
      terms.push(marked);
      continue;
    }
    // A Thai word close to an alias, such as one with a different mark.
    const max = allowedEdits(word);
    if (isThai(word) && max > 0) {
      let near: { index: number; distance: number } | null = null;
      for (const { alias, index } of ALIAS_NAMES) {
        if (!isThai(alias)) continue;
        const distance = editDistance(word, alias, max);
        if (distance <= max && (!near || distance < near.distance)) near = { index, distance };
      }
      if (near) {
        terms.push({ word, group: near.index, fuzzy: true });
        continue;
      }
    }
    terms.push({ word });
  }
  return terms;
}

/** How well a look matches. Zero is no match; higher is better. */
export const RANK = { exact: 100, start: 90, wordStart: 80, direct: 70, alias: 50, fuzzy: 40, text: 1 } as const;

/** Whether the look has a word that starts with this one, or has it inside its run of letters. */
const hasWord = (hay: Pick<Haystack, 'text' | 'flat'>, word: string) => (/^\d/.test(word) ? hay.text.includes(` ${word}`) : hay.flat.includes(compact(word)));

function scoreOf(terms: readonly Term[], query: string, hay: Haystack): number {
  let tier: number = RANK.direct;
  let typos = 0;
  for (const term of terms) {
    const { word, group } = term;
    // A number matches the start of a word: "400" finds "400" and "400h", not "1400".
    if (!isThai(word) && hasWord(hay, word)) continue;
    if (group !== undefined && ALIASES[group]?.some((alias) => !isThai(alias) && hasWord(hay, normalize(alias)))) {
      tier = Math.min(tier, term.fuzzy ? RANK.fuzzy : RANK.alias);
      continue;
    }
    const max = isThai(word) ? 0 : allowedEdits(word);
    const distance = max ? closestWord(word, hay.words, max) : max + 1;
    if (distance > max) {
      // Only in the look text, which the results show only when nothing else matches.
      if (isThai(word) || !hasWord(hay.look, word)) return 0;
      tier = RANK.text;
      continue;
    }
    tier = Math.min(tier, RANK.fuzzy);
    typos += distance;
    // A near miss of a word of the name goes before one of the look text.
    if (closestWord(word, hay.name.split(' '), max) > distance) typos += 5;
  }
  if (tier === RANK.direct) {
    const name = compact(hay.name);
    const flat = compact(query);
    if (name === flat) return RANK.exact;
    if (name.startsWith(flat)) return RANK.start;
    const words = hay.name.split(' ');
    if (terms.every((term) => words.some((item) => item.startsWith(compact(term.word))))) return RANK.wordStart;
    return RANK.direct;
  }
  return tier === RANK.text ? RANK.text : Math.max(RANK.text + 1, tier - typos);
}

/**
 * The looks that match the search, best first, the order of `looks` among equals. An empty
 * search gives every look, in its order.
 */
export function searchLooks<T extends SearchableLook>(looks: readonly T[], query: string): T[] {
  const normal = normalize(query);
  if (!normal) return [...looks];
  const terms = termsOf(query);
  const scored = looks.map((look, index) => ({ look, index, score: scoreOf(terms, normal, haystackOf(look)) }));
  // A match in the look text alone, such as the paper of a print, only when nothing else matches.
  const floor = scored.some((item) => item.score > RANK.text) ? RANK.text : 0;
  return scored
    .filter((item) => item.score > floor)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((item) => item.look);
}

/**
 * The looks closest to a search that found none, for the empty state: by how near the search is
 * to the name or a word of each look, or else the popular looks, up to `count`.
 */
export function closestLooks<T extends SearchableLook>(looks: readonly T[], query: string, popular: readonly string[], count = 6): { looks: T[]; near: boolean } {
  const flat = compact(normalize(query));
  if (flat) {
    const scored = looks
      .map((look, index) => {
        const hay = haystackOf(look);
        const candidates = [compact(hay.name), ...hay.name.split(' '), ...hay.box];
        const limit = flat.length <= 4 ? 1 : flat.length < 8 ? 2 : 3;
        let best = limit + 1;
        for (const word of candidates) {
          best = Math.min(best, editDistance(flat, word, limit));
          if (word.length > flat.length) best = Math.min(best, editDistance(flat, word.slice(0, flat.length), limit));
        }
        return { look, index, distance: best, limit };
      })
      .filter((item) => item.distance <= item.limit)
      .sort((a, b) => a.distance - b.distance || a.index - b.index)
      .map((item) => item.look);
    if (scored.length) return { looks: scored.slice(0, count), near: true };
  }
  const offered = popular
    .map((id) => looks.find((look) => look.id === id))
    .filter((look): look is T => !!look)
    .slice(0, count);
  return { looks: offered, near: false };
}

/** The looks that the empty state offers when nothing is close: the popular ones of the site. */
export const POPULAR_SEARCH = [
  'portra-400-endura-v1',
  'gold-200-premier-v1',
  'fj-classic-chrome-v1',
  'positive-film-grii-v1',
  'ff-cinestill800t-v1',
  'trix-400-mono-v1',
  'kodachrome-64-v1',
  'fj-classic-neg-v1',
];

/** The address of the mail that asks for a look by name. */
export function lookRequestMail(query: string): string {
  return `mailto:support@grku.app?subject=${encodeURIComponent(`Look request: ${query.trim()}`)}`;
}
