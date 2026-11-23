import { describe, expect, it } from 'vitest';
import { encodeMark, findMarks, MARK, signed, TAG, unmarked } from './signature';
import { loadAllStrings, STRINGS, LANGUAGES } from './i18n';
import { GUIDE_STRINGS } from './guide';

await loadAllStrings();

describe('the text mark', () => {
  it('writes the tag in zero-width characters only', () => {
    expect(MARK).toBe(encodeMark(TAG));
    expect(MARK).toMatch(/^​[‌‍]+​$/);
    expect(findMarks(`a ${MARK}b`)).toEqual([TAG]);
  });

  it('goes after the first words at a word boundary and leaves the visible text as it was', () => {
    expect(signed('From the SD card, with the firmware untouched.', 'en')).toBe(`From the SD card, ${MARK}with the firmware untouched.`);
    expect(signed('ทำงานจากการ์ด SD โดยไม่แตะต้องเฟิร์มแวร์', 'th')).toBe(`ทำงานจากการ์ด SD ${MARK}โดยไม่แตะต้องเฟิร์มแวร์`);
    expect(signed('Two words', 'en')).toBe(`Two words${MARK}`);
    expect(signed(signed('Once only, at most here.', 'en'), 'en')).toBe(signed('Once only, at most here.', 'en'));
  });

  it('marks the hero line, the module texts, and the guide lead of every language once, between words', () => {
    for (const { code } of LANGUAGES) {
      const t = STRINGS[code];
      const texts = [t.lead[1] ?? '', ...Object.values(t.modulesText), GUIDE_STRINGS[code].lead];
      for (const text of texts) {
        const marked = signed(text, code);
        expect(findMarks(marked)).toEqual([TAG]);
        expect(unmarked(marked)).toBe(text);
        const at = marked.indexOf(MARK);
        // Never inside a word: a word boundary on both sides of the mark.
        const before = text.slice(0, at);
        const words = [...new Intl.Segmenter(code, { granularity: 'word' }).segment(text)].map((part) => part.index);
        expect(at === text.length || words.includes(before.length)).toBe(true);
      }
    }
  });
});
