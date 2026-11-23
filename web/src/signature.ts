// The marks of authorship of the site, which show that a copy of the site or of its text comes from
// GRKU by BOTNICK. See HANDOFF.md, Signatures; scripts/find-signature.mjs finds them.
//
// The text mark: a short tag written in zero-width characters, U+200B at each end and U+200C (0)
// or U+200D (1) for each bit of the tag. It goes into a few sentences of the page body, at a
// word boundary after the first words, so it never splits a word or a search term, adds no break
// inside a word (the line breaker treats it as one unbreakable piece between two breaks, also in
// Thai), and copies with the text. The head of the page (title, description, structured data)
// never takes it: the components add it, the strings stay clean.

/** The build signature: `GRKU·BOTNICK`, the version, and the commit (vite.config.ts). */
export const SIGNATURE: string = __GRKU_SIG__;

/** The tag that the text mark writes. */
export const TAG = 'GRKU-BN';

const EDGE = '​';
const ZERO = '‌';
const ONE = '‍';

/** `tag` in zero-width characters. */
export function encodeMark(tag: string = TAG): string {
  let bits = '';
  for (const byte of new TextEncoder().encode(tag)) {
    for (let bit = 7; bit >= 0; bit -= 1) bits += (byte >> bit) & 1 ? ONE : ZERO;
  }
  return EDGE + bits + EDGE;
}

/** The tags of the marks in `text`. */
export function findMarks(text: string): string[] {
  const found: string[] = [];
  for (const match of text.matchAll(/​([‌‍]{8,})​/g)) {
    const bits = match[1]!;
    if (bits.length % 8 !== 0) continue;
    const bytes = new Uint8Array(bits.length / 8);
    for (let index = 0; index < bits.length; index += 1) {
      if (bits[index] === ONE) bytes[index >> 3]! |= 0x80 >> (index & 7);
    }
    found.push(new TextDecoder().decode(bytes));
  }
  return found;
}

/** `text` without the zero-width characters of a mark. */
export function unmarked(text: string): string {
  return text.replace(/​[‌‍]*​/g, '');
}

/** The mark of `TAG`. */
export const MARK = encodeMark();

/** The words of `text` before `end`, by Intl.Segmenter, which also splits Thai and Japanese. */
function wordsBefore(text: string, end: number, language: string): number {
  const before = text.slice(0, end);
  if (typeof Intl.Segmenter !== 'function') return before.split(/\s+/).filter(Boolean).length;
  let count = 0;
  for (const part of new Intl.Segmenter(language, { granularity: 'word' }).segment(before)) if (part.isWordLike) count += 1;
  return count;
}

/** The end of a clause (a comma or a stop, and the space after it), then a space. */
const PLACES = [/[,，、。;；:：!?！？]\s*/g, /\s+/g];

/**
 * `text` with the mark where a reader pauses: after the first comma or stop that follows at
 * least `words` words, else after the first such space, else at the end. Not before a name in
 * capitals (SD, GRKU), so a term like "การ์ด SD" stays whole, and never inside a word: Thai,
 * Chinese, and Japanese, which write no spaces between words, take it after their punctuation.
 */
export function signed(text: string, language: string, words = 3): string {
  if (!text || text.includes(MARK)) return text;
  for (const place of PLACES) {
    for (const match of text.matchAll(place)) {
      const at = match.index + match[0].length;
      if (at >= text.length || /^[A-Z0-9]{2,}\b/.test(text.slice(at))) continue;
      if (wordsBefore(text, match.index, language) < words) continue;
      return text.slice(0, at) + MARK + text.slice(at);
    }
  }
  return text + MARK;
}
