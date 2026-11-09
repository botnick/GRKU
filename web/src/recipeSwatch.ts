import { LEVEL_KEYS, TYPE_NAMES, WHITE_BALANCE_MODES } from './generated/recipes';
import type { Language } from './i18n';
import type { RecipeStrings } from './recipeStrings';
import type { Recipe } from './recipes';

/**
 * A mood swatch of a recipe: a gradient from its shadows to its highlights, in the colors that
 * its look, saturation, contrast, key, and white balance shift suggest. It stands for the recipe
 * in a list; it is not a rendering of the look.
 */
export function recipeSwatch(recipe: Recipe): string {
  const look = recipe.look;
  // The base of each look: hue in degrees, chroma 0 to 1, and a warmth bias.
  let hue = 36, chroma = 0.35, warmth = 0, mono = false, fade = 0;
  if (look.kind === 'native') {
    const name = TYPE_NAMES.en?.[look.imageType] ?? '';
    if (/Monotone|B&W|Grainy|Solid|Soft|Hi-Contrast|Standard$/.test(name) && /Monotone|B&W|Grainy|Solid/.test(name)) mono = true;
    if (/Negative Film/.test(name)) { hue = 32; chroma = 0.45; warmth = 0.15; }
    else if (/Positive Film/.test(name)) { hue = 200; chroma = 0.6; warmth = -0.05; }
    else if (/Vivid/.test(name)) { hue = 345; chroma = 0.7; }
    else if (/Retro/.test(name)) { hue = 40; chroma = 0.3; warmth = 0.25; fade = 0.25; }
    else if (/Bleach/.test(name)) { hue = 210; chroma = 0.12; fade = 0.1; }
    else if (/Cross/.test(name)) { hue = 160; chroma = 0.55; }
    else if (/Cinema \(Yellow\)/.test(name)) { hue = 48; chroma = 0.45; warmth = 0.2; }
    else if (/Cinema \(Green\)/.test(name)) { hue = 150; chroma = 0.4; }
    else if (/HDR/.test(name)) { hue = 30; chroma = 0.4; }
    else if (/Standard/.test(name)) { hue = 36; chroma = 0.3; }
    const level = (key: string) => (look.levels[LEVEL_KEYS.indexOf(key)] ?? 4) - 4;
    chroma = Math.max(0, Math.min(1, chroma + level('Saturation') * 0.09));
    fade -= level('Contrast') * 0.06;
    hue += level('ColorHue') * 6;
    if (look.tone && mono) {
      // A toned monochrome: sepia, red, green, blue, purple.
      const tones = [0, 35, 0, 120, 220, 280];
      hue = tones[look.tone] ?? 35; chroma = look.tone === 2 ? 0.4 : 0.25; mono = false;
    }
  } else if (look.kind === 'effect') { hue = 30; chroma = 0.5; }
  else if (look.kind === 'off') { hue = 36; chroma = 0.2; }
  const key = look.kind === 'native' ? (look.levels[LEVEL_KEYS.indexOf('ImageKey')] ?? 4) - 4 : 0;
  // The white balance shift: amber warms, blue cools, magenta and green tint.
  const balance = recipe.whiteBalance;
  if (balance) {
    warmth += (balance.shiftBa - 14) / 14 * 0.6;
    const label = WHITE_BALANCE_MODES[balance.mode]?.find((l) => l) ?? '';
    if (/Shade|Cloud/.test(label)) warmth += 0.2; else if (/Tungsten|Flu/.test(label)) warmth -= 0.2;
    if (/ColorTemp/.test(label)) warmth += (balance.kelvin - 5500) / 4500 * 0.6;
    hue += (balance.shiftGm - 14) * 2;
  }
  warmth = Math.max(-1, Math.min(1, warmth));
  const tintHue = warmth >= 0 ? 35 : 215;
  const tint = Math.abs(warmth) * 0.25;
  const sat = mono ? tint * 60 : Math.round((chroma * 0.75 + tint) * 100);
  const h = mono ? tintHue : Math.round(((hue * (1 - tint) + tintHue * tint) % 360 + 360) % 360);
  const light = (base: number) => Math.max(4, Math.min(96, base + key * 5 + fade * 10));
  const stop = (l: number) => `hsl(${h} ${Math.min(100, sat)}% ${light(l)}%)`;
  return `linear-gradient(135deg, ${stop(14 - fade * 20)} 0%, ${stop(46)} 55%, ${stop(82 + fade * 8)} 100%)`;
}

/** The chips of a recipe: the look name, the levels that are not 0, the white balance, Grain, and Glow. */
export function recipeChips(recipe: Recipe, r: RecipeStrings, language: Language, effectNames: ReadonlyMap<number, string>): string[] {
  const chips: string[] = [];
  const look = recipe.look;
  if (look.kind === 'effect') chips.push(effectNames.get(look.code) ?? r.lookEffect);
  else if (look.kind === 'native') {
    chips.push(TYPE_NAMES[language]?.[look.imageType] ?? TYPE_NAMES.en?.[look.imageType] ?? r.lookNative);
    const short: Record<string, string> = { Saturation: r.levels.Saturation ?? 'Saturation', Contrast: r.levels.Contrast ?? 'Contrast', ImageKey: r.levels.ImageKey ?? 'Key', ClarityControl: r.levels.ClarityControl ?? 'Clarity' };
    for (const key of ['Saturation', 'Contrast', 'ImageKey', 'ClarityControl']) {
      const value = (look.levels[LEVEL_KEYS.indexOf(key)] ?? 4) - 4;
      if (value) chips.push(`${short[key]} ${value > 0 ? '+' : ''}${value}`);
    }
  } else chips.push(look.kind === 'off' ? r.lookOff : r.lookKept);
  const balance = recipe.whiteBalance;
  if (balance) {
    const label = WHITE_BALANCE_MODES[balance.mode]?.[recipe.family === 'gr3' ? 0 : 1] ?? '';
    const shifts = [balance.shiftBa === 14 ? '' : balance.shiftBa < 14 ? `B${14 - balance.shiftBa}` : `A${balance.shiftBa - 14}`, balance.shiftGm === 14 ? '' : balance.shiftGm < 14 ? `G${14 - balance.shiftGm}` : `M${balance.shiftGm - 14}`].filter(Boolean).join(' ');
    const kelvin = label === 'ColorTemp1' ? `${balance.kelvin} K` : '';
    chips.push([r.modes[label] ?? label, kelvin, shifts].filter(Boolean).join(' '));
  }
  if (recipe.grain && recipe.grain.level > 0) chips.push(`${r.grain} ${r.grainLevels[recipe.grain.level] ?? ''}`);
  if (recipe.glow?.bloom) chips.push(`${r.bloom} ${r.glowLevels[recipe.glow.bloom] ?? ''}`);
  if (recipe.glow?.halation) chips.push(`${r.halation} ${r.glowLevels[recipe.glow.halation] ?? ''}`);
  return chips;
}
