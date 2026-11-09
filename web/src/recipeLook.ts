import { LEVEL_KEYS, TYPE_NAMES, WHITE_BALANCE_MODES } from './generated/recipes';
import type { Recipe } from './recipes';

/**
 * A rough rendering of a recipe on a photo, with CSS: the saturation, contrast, key and hue of its
 * Image Control, a monochrome type in gray with its toning, a white balance shift as a warm or
 * cool cast, and the GRKU Grain as a noise overlay. It gives the direction of the look, not the
 * camera's rendering: the site says so under the pictures.
 */
export interface RecipeLook {
  /** The CSS filter of the photo. */
  filter: string;
  /** A color cast laid over the photo in soft light, or null. */
  cast: string | null;
  /** The opacity of the grain overlay, 0 for none. */
  grain: number;
}

export function recipeLook(recipe: Recipe): RecipeLook {
  let saturate = 1, contrast = 1, brightness = 1, hue = 0, sepia = 0, gray = 0;
  let cast: { h: number; s: number; a: number } | null = null;
  const look = recipe.look;
  if (look.kind === 'native') {
    const name = TYPE_NAMES.en?.[look.imageType] ?? '';
    const level = (key: string) => (look.levels[LEVEL_KEYS.indexOf(key)] ?? 4) - 4;
    if (/Monotone|B&W|Grainy|Solid/.test(name) || (/Standard|Soft|Hi-Contrast|HDR Tone|Solarized/.test(name) && recipe.family === 'gr4Monochrome')) gray = 1;
    if (/Negative Film/.test(name)) { saturate = 1.05; contrast = 0.95; cast = { h: 32, s: 60, a: 0.14 }; }
    else if (/Positive Film/.test(name)) { saturate = 1.25; contrast = 1.12; }
    else if (/Vivid/.test(name)) { saturate = 1.35; contrast = 1.05; }
    else if (/Retro/.test(name)) { saturate = 0.8; contrast = 0.9; sepia = 0.25; }
    else if (/Bleach/.test(name)) { saturate = 0.45; contrast = 1.25; }
    else if (/Cross/.test(name)) { saturate = 1.3; hue = 12; contrast = 1.1; }
    else if (/Cinema \(Yellow\)/.test(name)) { saturate = 0.95; cast = { h: 48, s: 70, a: 0.2 }; }
    else if (/Cinema \(Green\)/.test(name)) { saturate = 0.95; cast = { h: 150, s: 45, a: 0.2 }; }
    else if (/HDR/.test(name)) { contrast = 0.85; saturate = 1.1; }
    else if (/Hi-Contrast/.test(name)) { contrast = 1.5; }
    saturate *= 1 + level('Saturation') * 0.14;
    contrast *= 1 + level('Contrast') * 0.08;
    brightness *= 1 + level('ImageKey') * 0.06;
    hue += level('ColorHue') * 5;
    if (gray && look.tone) {
      const tones: Record<number, { h: number; s: number }> = { 1: { h: 35, s: 60 }, 2: { h: 0, s: 60 }, 3: { h: 120, s: 40 }, 4: { h: 220, s: 50 }, 5: { h: 280, s: 50 } };
      const tone = tones[look.tone];
      if (tone) cast = { ...tone, a: 0.35 };
    }
  } else if (look.kind === 'effect') { saturate = 1.1; contrast = 1.05; cast = { h: 30, s: 50, a: 0.1 }; }
  // The white balance: an amber shift warms, a blue shift cools, green and magenta tint.
  const balance = recipe.whiteBalance;
  if (balance && !gray) {
    let warmth = (balance.shiftBa - 14) / 14;
    const label = WHITE_BALANCE_MODES[balance.mode]?.find((l) => l) ?? '';
    if (/Shade|Cloud/.test(label)) warmth += 0.3; else if (/Tungsten|Flu/.test(label)) warmth -= 0.3;
    if (/ColorTemp/.test(label)) warmth += (balance.kelvin - 5500) / 4500;
    warmth = Math.max(-1, Math.min(1, warmth));
    const tint = (balance.shiftGm - 14) / 14;
    if (Math.abs(warmth) > 0.05 || Math.abs(tint) > 0.05) {
      const h = warmth >= 0 ? 35 : 215;
      cast = { h: Math.abs(tint) > Math.abs(warmth) ? (tint > 0 ? 300 : 120) : h, s: 70, a: Math.min(0.45, Math.max(Math.abs(warmth), Math.abs(tint)) * 0.45) };
    }
  }
  const filter = [
    gray ? 'grayscale(1)' : '',
    `saturate(${saturate.toFixed(2)})`,
    `contrast(${contrast.toFixed(2)})`,
    `brightness(${brightness.toFixed(2)})`,
    hue ? `hue-rotate(${hue}deg)` : '',
    sepia ? `sepia(${sepia})` : '',
  ].filter(Boolean).join(' ');
  return {
    filter,
    cast: cast ? `hsl(${cast.h} ${cast.s}% 50% / ${cast.a})` : null,
    grain: recipe.grain ? recipe.grain.level * 0.09 : 0,
  };
}
