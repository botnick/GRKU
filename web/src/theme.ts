// The light and the dark page. The visitor chooses System, Light, or Dark in the header; System
// follows the device. The choice is kept in localStorage under THEME_KEY ('light' or 'dark'; no
// entry is System). The script in the head of index.html, which the prerendered and the document
// pages carry too, sets `data-theme` on <html> before the first paint and follows the device while
// the choice is System; theme.test.ts checks that it reads the choice as this module does.
// Without a script, index.css follows the device through prefers-color-scheme.
import { useEffect, useState } from 'react';
import type { Language } from './i18n';

export const THEME_KEY = 'grku.theme';

export type ThemePreference = 'system' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

export const THEME_PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark'];

/** The color of the browser bar on each page: the page background (index.css). */
export const THEME_COLORS: Readonly<Record<Theme, string>> = { light: '#f5f4ef', dark: '#171717' };

/** The event that the page sends when the visitor changes the theme. */
const THEME_EVENT = 'grku-theme';

/** The choice that `stored` (a localStorage value) holds. */
export function parsePreference(stored: string | null | undefined): ThemePreference {
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

/** The theme a page shows for `preference`, on a device that does or does not prefer light. */
export function resolveTheme(preference: ThemePreference, deviceLight: boolean): Theme {
  return preference === 'system' ? (deviceLight ? 'light' : 'dark') : preference;
}

/** The choice of this browser, or System when storage is blocked. */
export function readPreference(storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): ThemePreference {
  try {
    return parsePreference(storage?.getItem(THEME_KEY));
  } catch {
    return 'system';
  }
}

/** Keeps `preference`; System removes the entry. Storage that is blocked keeps nothing. */
export function writePreference(preference: ThemePreference, storage: Pick<Storage, 'setItem' | 'removeItem'> | undefined = globalThis.localStorage): void {
  try {
    if (preference === 'system') storage?.removeItem(THEME_KEY);
    else storage?.setItem(THEME_KEY, preference);
  } catch {
    // Private mode: the page keeps the choice until it closes.
  }
}

const lightQuery = () => (typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: light)') : null);

/** Shows `theme` on the page: `data-theme` on <html> and the color of the browser bar. */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.dataset.theme = theme;
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) meta.content = THEME_COLORS[theme];
}

/** The theme that the page shows now. */
export function currentTheme(): Theme {
  if (typeof document === 'undefined') return 'dark';
  const shown = document.documentElement.dataset.theme;
  if (shown === 'light' || shown === 'dark') return shown;
  return resolveTheme(readPreference(), lightQuery()?.matches ?? false);
}

/** Keeps the choice and shows it at once; the head script follows the device from then on if it is System. */
export function choosePreference(preference: ThemePreference): void {
  writePreference(preference);
  applyTheme(resolveTheme(preference, lightQuery()?.matches ?? false));
  window.dispatchEvent(new Event(THEME_EVENT));
}

/** The choice of the visitor, kept in step with other tabs. */
export function useThemePreference(): [ThemePreference, (preference: ThemePreference) => void] {
  const [preference, setPreference] = useState<ThemePreference>(() => (typeof window === 'undefined' ? 'system' : readPreference()));
  useEffect(() => {
    const update = () => setPreference(readPreference());
    window.addEventListener('storage', update);
    window.addEventListener(THEME_EVENT, update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener(THEME_EVENT, update);
    };
  }, []);
  return [preference, choosePreference];
}

/** The theme the page shows, as it changes with the choice and, on System, with the device. */
export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(currentTheme);
  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(currentTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

export interface ThemeStrings {
  /** The label of the menu in the header. */
  theme: string;
  system: string;
  light: string;
  dark: string;
}

// The other languages come from the Gemini tools (grku-tools/i18n-th.mjs), never by hand.
const THEME_STRINGS: Readonly<Record<Language, ThemeStrings>> = {
  en: { theme: 'Theme', system: 'System', light: 'Light', dark: 'Dark' },
  'zh-Hans': { theme: '主题', system: '跟随系统', light: '浅色', dark: '深色' },
  'zh-Hant': { theme: '主題', system: '系統', light: '淺色', dark: '深色' },
  ja: { theme: 'テーマ', system: 'システム', light: 'ライト', dark: 'ダーク' },
  ko: { theme: '테마', system: '시스템', light: '라이트', dark: '다크' },
  th: { theme: 'ธีม', system: 'ตามระบบ', light: 'สว่าง', dark: 'มืด' },
};

export function themeStrings(language: Language): ThemeStrings {
  return THEME_STRINGS[language] ?? THEME_STRINGS.en;
}
