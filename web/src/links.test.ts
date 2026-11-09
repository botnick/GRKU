import { describe, expect, it } from 'vitest';
import { guideLanguage, packageLanguage } from './links';

describe('Thai pages', () => {
  it('get the Thai guide and the English camera menus', () => {
    expect(guideLanguage('th')).toBe('th');
    expect(packageLanguage('th')).toBe('en');
    expect(packageLanguage('ja')).toBe('ja');
  });
});
