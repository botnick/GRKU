import { describe, expect, it } from 'vitest';
import { MODESET_TOKEN } from './cameras';
import { FRAMING_RATIOS } from './generated/framing';
import { GUIDE_STRINGS } from './guide';
import { loadAllStrings, matchLanguage, pageText, STRINGS } from './i18n';

// Each language is its own module; the tests read them all.
await loadAllStrings();

describe('matchLanguage', () => {
  it('maps Chinese tags by script and region', () => {
    expect(matchLanguage(['zh-CN'])).toBe('zh-Hans');
    expect(matchLanguage(['zh'])).toBe('zh-Hans');
    expect(matchLanguage(['zh-Hant-TW'])).toBe('zh-Hant');
    expect(matchLanguage(['zh-HK'])).toBe('zh-Hant');
    expect(matchLanguage(['zh-TW'])).toBe('zh-Hant');
  });

  it('maps Japanese and Korean tags', () => {
    expect(matchLanguage(['ja'])).toBe('ja');
    expect(matchLanguage(['ja-JP'])).toBe('ja');
    expect(matchLanguage(['ko'])).toBe('ko');
    expect(matchLanguage(['ko-KR'])).toBe('ko');
  });

  it('uses the first supported tag and falls back to English', () => {
    expect(matchLanguage(['ja-JP', 'zh-TW', 'en'])).toBe('ja');
    expect(matchLanguage(['ko-KR', 'zh-TW', 'ja'])).toBe('ko');
    expect(matchLanguage(['kok', 'zh-TW'])).toBe('zh-Hant');
    expect(matchLanguage(['fr', 'ja', 'en'])).toBe('ja');
    expect(matchLanguage(['fr', 'en-GB'])).toBe('en');
    expect(matchLanguage(['de'])).toBe('en');
    expect(matchLanguage([])).toBe('en');
  });
});

describe('STRINGS', () => {
  it('lists every Framing ratio in menu order in each language', () => {
    for (const language of Object.keys(STRINGS) as (keyof typeof STRINGS)[]) {
      const text = STRINGS[language].modulesText.framing;
      const at = FRAMING_RATIOS.map((ratio) => text.indexOf(ratio.name));
      expect(at.every((i) => i >= 0), language).toBe(true);
      expect(at, language).toEqual([...at].sort((x, y) => x - y));
    }
  });

  it('gives each language the same install steps and effect looks', () => {
    const shape = (language: keyof typeof STRINGS) => ({
      steps: STRINGS[language].steps.map((parts) => parts.filter((p) => p.startsWith('`'))),
      updateSteps: STRINGS[language].updateSteps.map((parts) => parts.filter((p) => p.startsWith('`'))),
      looks: Object.keys(STRINGS[language].looks).sort(),
    });
    expect(shape('zh-Hans')).toEqual(shape('en'));
    expect(shape('zh-Hant')).toEqual(shape('en'));
    expect(shape('ja')).toEqual(shape('en'));
    expect(shape('ko')).toEqual(shape('en'));
  });

  it('names the ModeSet file only through the camera token, as often in each language', () => {
    const tokens = (language: keyof typeof STRINGS) =>
      STRINGS[language].steps.flat().filter((part) => part === MODESET_TOKEN).length;
    expect(tokens('en')).toBeGreaterThan(0);
    for (const language of Object.keys(STRINGS) as (keyof typeof STRINGS)[]) {
      expect(tokens(language)).toBe(tokens('en'));
      const text = [...STRINGS[language].steps, ...STRINGS[language].updateSteps].flat().join('');
      expect(text).not.toMatch(/\d{8}\.\d{3}/);
    }
  });
});


describe('GUIDE_STRINGS', () => {
  it('gives the install guide the same text in each language, none of it empty', () => {
    const keys = Object.keys(GUIDE_STRINGS.en).sort();
    for (const language of Object.keys(STRINGS) as (keyof typeof STRINGS)[]) {
      expect(Object.keys(GUIDE_STRINGS[language]).sort()).toEqual(keys);
      for (const text of Object.values(GUIDE_STRINGS[language])) expect(text.trim()).not.toBe('');
    }
  });

  it('gives the guide page its own title and address', () => {
    expect(pageText('th', 'guide')).toEqual({ title: GUIDE_STRINGS.th.title, description: GUIDE_STRINGS.th.description, path: '/guide/' });
    expect(pageText('en', 'guide').path).toBe('/en/guide/');
    expect(pageText('ja', 'guide').title).not.toBe(pageText('ja', 'home').title);
  });
});

describe('the strings that the install guide repeats', () => {
  it('finds the same questions and install steps in each language', () => {
    for (const language of Object.keys(STRINGS) as (keyof typeof STRINGS)[]) {
      const strings = STRINGS[language];
      expect(strings.faq.filter((item) => item.id === 'adj')).toHaveLength(1);
      expect(strings.faq.filter((item) => item.id === 'format')).toHaveLength(1);
      // The first step turns the camera off, in one sentence; the last names the ModeSet file.
      expect(strings.steps[0]).toHaveLength(1);
      expect(strings.steps[4]).toContain(MODESET_TOKEN);
      expect(strings.removeSteps[0]!.join('')).toContain('SCRIPT');
    }
  });
});
