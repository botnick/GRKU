import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { THEME_COLORS, THEME_KEY, parsePreference, readPreference, resolveTheme, writePreference, type ThemePreference } from './theme';

/** A localStorage of a map, or one that throws, as in a browser that blocks site data. */
function storage(entries: Record<string, string> = {}, blocked = false) {
  const map = new Map(Object.entries(entries));
  const check = () => {
    if (blocked) throw new DOMException('blocked', 'SecurityError');
  };
  return {
    map,
    getItem: (key: string) => (check(), map.get(key) ?? null),
    setItem: (key: string, value: string) => (check(), void map.set(key, value)),
    removeItem: (key: string) => (check(), void map.delete(key)),
  };
}

describe('theme preference', () => {
  it('reads light and dark, and anything else as System', () => {
    expect(parsePreference('light')).toBe('light');
    expect(parsePreference('dark')).toBe('dark');
    for (const value of [null, undefined, '', 'system', 'Light', 'auto']) expect(parsePreference(value)).toBe('system');
  });

  it('follows the device on System and the choice otherwise', () => {
    expect(resolveTheme('system', true)).toBe('light');
    expect(resolveTheme('system', false)).toBe('dark');
    expect(resolveTheme('light', false)).toBe('light');
    expect(resolveTheme('dark', true)).toBe('dark');
  });

  it('keeps a choice, removes the entry for System, and survives blocked storage', () => {
    const store = storage();
    writePreference('light', store);
    expect(store.map.get(THEME_KEY)).toBe('light');
    expect(readPreference(store)).toBe('light');
    writePreference('system', store);
    expect(store.map.has(THEME_KEY)).toBe(false);
    expect(readPreference(store)).toBe('system');
    const blocked = storage({}, true);
    expect(() => writePreference('dark', blocked)).not.toThrow();
    expect(readPreference(blocked)).toBe('system');
    expect(readPreference(undefined)).toBe('system');
  });
});

/** The script in the head of index.html, which the build copies into every page. */
const html = readFileSync(resolve(import.meta.dirname, '../index.html'), 'utf8');
const script = /<script id="theme">([^<]*)<\/script>/.exec(html)?.[1];

/** Runs the head script on a fake page, and returns the page and a way to change the device. */
function runScript(store: ReturnType<typeof storage>, deviceLight: boolean) {
  const attributes = new Map<string, string>();
  const metas = [new Map<string, string>(), new Map<string, string>()];
  const media = { matches: deviceLight, listeners: [] as (() => void)[] };
  const windowListeners: ((event: { key: string | null }) => void)[] = [];
  const document = {
    documentElement: { setAttribute: (name: string, value: string) => attributes.set(name, value) },
    querySelectorAll: (selector: string) => {
      expect(selector).toBe('meta[name="theme-color"]');
      return metas.map((meta) => ({ setAttribute: (name: string, value: string) => meta.set(name, value) }));
    },
  };
  const matchMedia = (query: string) => {
    expect(query).toBe('(prefers-color-scheme: light)');
    return { get matches() { return media.matches; }, addEventListener: (_: string, listener: () => void) => media.listeners.push(listener) };
  };
  const addEventListener = (type: string, listener: (event: { key: string | null }) => void) => {
    expect(type).toBe('storage');
    windowListeners.push(listener);
  };
  new Function('document', 'matchMedia', 'localStorage', 'addEventListener', script!)(document, matchMedia, store, addEventListener);
  return {
    theme: () => attributes.get('data-theme'),
    colors: () => metas.map((meta) => meta.get('content')),
    device: (light: boolean) => {
      media.matches = light;
      for (const listener of media.listeners) listener();
    },
    storageEvent: (key: string | null) => windowListeners.forEach((listener) => listener({ key })),
  };
}

describe('the head script', () => {
  it('is in index.html', () => {
    expect(script).toBeTruthy();
  });

  it('shows the theme that theme.ts resolves, with the color of the browser bar', () => {
    for (const stored of [undefined, 'light', 'dark', 'bogus']) {
      for (const deviceLight of [true, false]) {
        const page = runScript(storage(stored ? { [THEME_KEY]: stored } : {}), deviceLight);
        const expected = resolveTheme(parsePreference(stored), deviceLight);
        expect(page.theme(), `${stored} on a ${deviceLight ? 'light' : 'dark'} device`).toBe(expected);
        expect(page.colors()).toEqual([THEME_COLORS[expected], THEME_COLORS[expected]]);
      }
    }
  });

  it('follows the device while the choice is System, and only then', () => {
    const store = storage();
    const page = runScript(store, false);
    page.device(true);
    expect(page.theme()).toBe('light');
    store.map.set(THEME_KEY, 'dark');
    page.device(false);
    page.device(true);
    expect(page.theme()).toBe('light');
    page.storageEvent(THEME_KEY);
    expect(page.theme()).toBe('dark');
  });

  it('falls back to the device when storage is blocked', () => {
    expect(runScript(storage({}, true), true).theme()).toBe('light');
    expect(runScript(storage({}, true), false).theme()).toBe('dark');
  });

  it('uses the key and the values of theme.ts', () => {
    expect(script).toContain(`'${THEME_KEY}'`);
    for (const [theme, color] of Object.entries(THEME_COLORS)) expect(script).toContain(`${theme}:'${color}'`);
    const preferences: ThemePreference[] = ['light', 'dark'];
    for (const preference of preferences) expect(script).toContain(`'${preference}'`);
  });
});
