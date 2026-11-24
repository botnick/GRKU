/**
 * The recipe of a development, as the camera names it: each module that is on, with the values of
 * its settings in the camera menu of the language (English for Thai, as the camera has no Thai
 * menu). And the settings in a page address, and the install link that puts them on a GR.
 */
import type { Language } from '../i18n';
import { MENU } from './menu';
import { isOn, MODULE_NAMES, OFF, readSettings, VALUES, type DevelopSettings, type ModuleName } from './settings';

type MenuLanguage = keyof typeof MENU;
const menuLanguage = (language: Language): MenuLanguage => (language === 'th' ? 'en' : language);

/** The camera menu of a module in a language. */
export const menuOf = (language: Language, module: ModuleName) => MENU[menuLanguage(language)][module];

/** A caption of the camera as it prints it: `<3` is a heart. */
export const heart = (text: string) => text.replaceAll('<3', '♥');

/** The values of a setting of the camera menu, or of its rows. */
export function valueNames(language: Language, module: ModuleName, key: string | 'rows'): readonly string[] {
  const menu = menuOf(language, module) as { rows?: readonly string[]; settings: Record<string, { values?: readonly string[] }> };
  const values = key === 'rows' ? menu.rows : menu.settings[key]?.values;
  return (values ?? []).map(heart);
}

/** The title of a child page of a module (Bloom and Halation of Glow), or the label of the setting. */
export function childTitle(language: Language, module: ModuleName, key: string): string {
  const menu = menuOf(language, module) as { children: Record<string, { title?: string }> };
  return menu.children[key]?.title ?? labelOf(language, module, key);
}

/** The label of a setting in the camera menu. */
export function labelOf(language: Language, module: ModuleName, key: string): string {
  const menu = menuOf(language, module) as { settings: Record<string, { label?: string }>; children: Record<string, { title?: string }> };
  return menu.settings[key]?.label ?? menu.children[key]?.title ?? key;
}

export interface RecipeLine {
  module: ModuleName | 'look';
  title: string;
  /** "Setting value" pairs, in menu order. */
  values: string[];
}

/** The lines of the recipe: the look, then each module that is on, in the order of the camera menu. */
export function recipeLines(settings: DevelopSettings, language: Language, lookTitle: string, lookName: string | null, noLook: string): RecipeLine[] {
  const pair = (module: ModuleName, key: string, value: number, label = labelOf(language, module, key)) => `${label} ${valueNames(language, module, key)[value] ?? value}`;
  const row = (module: ModuleName, value: number) => valueNames(language, module, 'rows')[value] ?? String(value);
  const lines: RecipeLine[] = [{ module: 'look', title: lookTitle, values: [lookName ?? noLook] }];
  const { grain, glow, leak, diffusion, date, border } = settings;
  for (const module of MODULE_NAMES) {
    if (!isOn(settings, module)) continue;
    const title = menuOf(language, module).title;
    const values: string[] = [];
    switch (module) {
      case 'grain':
        values.push(row('grain', grain.level), pair('grain', 'CORE.GRAIN_SIZE', grain.size), pair('grain', 'STYLE', 1));
        break;
      case 'glow': {
        const strength = (key: 'BLOOM' | 'HALATION', value: number) => `${childTitle(language, 'glow', key)} ${valueNames(language, 'glow', key)[value]}`;
        values.push(strength('BLOOM', glow.bloom), strength('HALATION', glow.halation));
        if (glow.halation) values.push(pair('glow', 'HALATION_COLOR', glow.color));
        break;
      }
      case 'leak':
        values.push(row('leak', leak.look));
        if (leak.look === 1) {
          values.push(pair('leak', 'VIGNETTE', leak.vignette), pair('leak', 'DUST', leak.dust), pair('leak', 'LEAK', leak.leak), pair('leak', 'SCRATCH', leak.scratches));
        }
        break;
      case 'diffusion':
        if (diffusion.strength) {
          values.push(pair('diffusion', 'STRENGTH', diffusion.strength), pair('diffusion', 'MIST', diffusion.mist), pair('diffusion', 'STREAK', diffusion.streak));
        }
        if (diffusion.softness) values.push(pair('diffusion', 'SOFTNESS', diffusion.softness));
        break;
      case 'date':
        values.push(
          row('date', date.style),
          pair('date', 'LOOK', date.look),
          pair('date', 'COLOR', date.color),
          pair('date', 'SIZE', date.size),
          pair('date', 'CORNER', date.corner),
          pair('date', 'GLOW', date.glow),
          pair('date', 'CAPTION', date.caption),
          pair('date', 'POSITION', date.position),
        );
        break;
      case 'border':
        values.push(row('border', border.style), pair('border', 'CORE.BORDER_COLOR', border.color));
        break;
    }
    lines.push({ module, title, values });
  }
  return lines;
}

/** The recipe as plain text, one line per module. */
export const recipeText = (lines: readonly RecipeLine[]) => lines.map((line) => `${line.title}: ${line.values.join(', ')}`).join('\n');

// ---- Addresses ---------------------------------------------------------------------------------------

/** The order of the values in the `m` parameter: each module, each setting, one digit each. */
const ORDER = MODULE_NAMES.flatMap((module) => Object.keys(VALUES[module]).map((key) => [module, key] as const));

/** The module settings as a string of digits, for the address of the page. */
export function settingsParam(settings: DevelopSettings): string {
  return ORDER.map(([module, key]) => (settings[module] as unknown as Record<string, number>)[key]).join('');
}

/** Settings from the `look` and `m` parameters of an address, or null without them. */
export function settingsFromParams(params: URLSearchParams, fallback: DevelopSettings): DevelopSettings | null {
  const digits = params.get('m');
  const look = params.get('look');
  if (!digits && !look) return null;
  const input: Record<string, Record<string, number>> = {};
  if (digits && /^\d+$/.test(digits) && digits.length === ORDER.length) {
    ORDER.forEach(([module, key], i) => ((input[module] ??= {})[key] = Number(digits[i])));
  }
  return readSettings({ ...(digits ? input : fallback), look: look ?? fallback.look }, digits ? OFF : fallback);
}
