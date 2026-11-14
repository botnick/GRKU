import { describe, expect, it } from 'vitest';
import { MODESET_TOKEN } from './cameras';
import { matchLanguage, STRINGS } from './i18n';

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
  it('lists the Framing ratios in menu order, as each language writes a list', () => {
    expect(STRINGS.en.modulesText.framing).toBe('XPan, 2.35:1, 16:9, 4:3, 5:4, 7:6, 1:1, or 3:4 photos. The view dims the rest.');
    expect(STRINGS['zh-Hans'].modulesText.framing).toBe('XPan、2.35:1、16:9、4:3、5:4、7:6、1:1 或 3:4 照片，画幅外变暗。');
    expect(STRINGS.ja.modulesText.framing).toBe('XPan、2.35:1、16:9、4:3、5:4、7:6、1:1、3:4 の写真。範囲外は暗く表示します。');
    expect(STRINGS.ko.modulesText.framing).toBe('XPan, 2.35:1, 16:9, 4:3, 5:4, 7:6, 1:1, 3:4 사진. 범위 밖은 어둡게 표시합니다.');
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

