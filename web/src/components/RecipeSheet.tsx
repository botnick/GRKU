import { Aperture, Brush, Contrast, Gauge, Gem, Glasses, Moon, Palette, Sun } from 'lucide-react';
import { CORRECTION_VALUES, LEVEL_KEYS, TYPE_NAMES, TYPE_PARAMETERS, WHITE_BALANCE_MODES } from '../generated/recipes';
import type { Language } from '../i18n';
import { cameraTerms, type RecipeStrings } from '../recipeStrings';
import type { Recipe } from '../recipes';
import { cn } from '@/lib/utils';

/** The nine levels as the camera names them, in the camera's order, with a short label and an icon. */
export const LEVELS: readonly { key: string; name: string; short: string; icon: typeof Brush }[] = [
  { key: 'Saturation', name: 'Saturation', short: 'SAT', icon: Brush },
  { key: 'ColorHue', name: 'Hue', short: 'HUE', icon: Palette },
  { key: 'ImageKey', name: 'High/Low Key', short: 'KEY', icon: Gauge },
  { key: 'Contrast', name: 'Contrast', short: 'CONTRAST', icon: Contrast },
  { key: 'ContrastHighLight', name: 'Contrast (Highlight)', short: 'CTR·H', icon: Sun },
  { key: 'ContrastShadow', name: 'Contrast (Shadow)', short: 'CTR·S', icon: Moon },
  { key: 'Sharpness', name: 'Sharpness', short: 'SHARP', icon: Gem },
  { key: 'Shading', name: 'Shading', short: 'SHADING', icon: Aperture },
  { key: 'ClarityControl', name: 'Clarity', short: 'CLARITY', icon: Glasses },
];

/** The camera's names of the other Image Control parameters. */
export const PARAMETER_NAMES: Readonly<Record<string, string>> = {
  ColorToneMonotone: 'Toning',
  ColorToneBleechBypass: 'Toning',
  ColorToneRetro: 'Toning',
  ColorToneHdrIntense: 'Toning',
  ColorToneCrossProcess: 'Toning',
  ColorToneCinema: 'Toning',
  HdrIntense: 'Intensity',
  FilterEffectCustom: 'Filter Effect',
  Particle: 'Grain Effect',
  ParticleSize: 'Grain Size',
  SolarizationType: 'Solarization Type',
};

/** The camera's names of the four correction settings. */
export const CORRECTION_NAMES = ['Highlight Correction', 'Shadow Correction', 'Peripheral Illumination Correction', 'High-ISO Noise Reduction'] as const;

/** A level as the camera shows it: stored 0 to 8 is -4 to +4. */
export const signed = (stored: number) => (stored === 4 ? '0' : stored > 4 ? `+${stored - 4}` : `${stored - 4}`);

/** A white balance shift as the camera shows it, such as A14 or G2, or nothing for none. */
const shift = (stored: number, minus: string, plus: string) => (stored === 14 ? '' : stored < 14 ? `${minus}${14 - stored}` : `${plus}${stored - 14}`);

/** The camera's name of a white balance mode label. */
export const WB_NAMES: Readonly<Record<string, string>> = {
  Auto: 'Auto WB', AutoStandard: 'Auto WB', Multi: 'Multi Auto WB', AutoWarm: 'AWB (Warm)', AutoWhite: 'AWB (White)', Daylight: 'Daylight', Shade: 'Shade', Cloudiness: 'Cloudy',
  Flu_D: 'Fluorescent D', Flu_N: 'Fluorescent N', Flu_W: 'Fluorescent W', Flu_L: 'Fluorescent L', Tungsten: 'Tungsten', Cte: 'CTE', Manual1: 'Manual', ColorTemp1: 'Color Temperature', Custom1: 'Custom 1', Custom2: 'Custom 2', Custom3: 'Custom 3',
};

/** The white balance of a recipe as the camera writes it: the mode, the kelvin, and the shifts. */
export function whiteBalanceText(recipe: Recipe): string | null {
  const balance = recipe.whiteBalance;
  if (!balance) return null;
  const label = WHITE_BALANCE_MODES[balance.mode]?.[recipe.family === 'gr3' ? 0 : 1] ?? '';
  const shifts = [shift(balance.shiftBa, 'B', 'A'), shift(balance.shiftGm, 'G', 'M')].filter(Boolean).join(' ');
  const kelvin = label === 'ColorTemp1' ? `${balance.kelvin} K` : '';
  return [WB_NAMES[label] ?? label, kelvin, shifts].filter(Boolean).join(' ');
}

/** The name of the look of a recipe: its effect, its Image Control type (as the camera menu of the language shows it), or none. */
export function lookName(recipe: Recipe, r: RecipeStrings, language: Language, effects: ReadonlyMap<number, string>): string {
  const look = recipe.look;
  if (look.kind === 'effect') return effects.get(look.code) ?? r.lookEffect;
  if (look.kind === 'native') return TYPE_NAMES[language]?.[look.imageType] ?? TYPE_NAMES.en?.[look.imageType] ?? r.lookNative;
  return look.kind === 'off' ? r.lookOff : r.lookKept;
}

/** The short chips of a recipe for a card: SAT +3, WB Auto WB A14 G2, Grain Medium. */
export function recipeChips(recipe: Recipe, strings: RecipeStrings, language: Language, effects: ReadonlyMap<number, string>): string[] {
  const r = cameraTerms(strings, language);
  const chips: string[] = [lookName(recipe, r, language, effects)];
  if (recipe.look.kind === 'native') {
    const levels = recipe.look.levels;
    for (const level of LEVELS) {
      const stored = levels[LEVEL_KEYS.indexOf(level.key)] ?? 4;
      if (stored !== 4) chips.push(`${level.short} ${signed(stored)}`);
    }
  }
  const balance = whiteBalanceText(recipe);
  if (balance) chips.push(`WB ${balance}`);
  if (recipe.grain && recipe.grain.level > 0) chips.push(`${r.grain} ${r.grainLevels[recipe.grain.level] ?? ''}`);
  if (recipe.glow?.bloom) chips.push(`${r.bloom} ${r.glowLevels[recipe.glow.bloom] ?? ''}`);
  if (recipe.glow?.halation) chips.push(`${r.halation} ${r.glowLevels[recipe.glow.halation] ?? ''}`);
  return chips;
}

/**
 * A recipe as a camera card: IMAGE CONTROL and the type, the nine levels in the camera's grid
 * with their icons, then the other settings as rows with the camera's own names, as the camera
 * menus and the recipe sites write them. `compact` fits the card under a form.
 */
export function RecipeSheet({ recipe, r: strings, language, effectNames, compact = false }: { recipe: Recipe; r: RecipeStrings; language: Language; effectNames: ReadonlyMap<number, string>; compact?: boolean }) {
  const r = cameraTerms(strings, language);
  const look = recipe.look;
  const column = recipe.family === 'gr3' ? 0 : 1;
  const rows: [string, string][] = [];
  if (look.kind === 'native') {
    // The parameters beyond the nine levels, when the type has them and they are set.
    for (const p of TYPE_PARAMETERS[look.imageType]?.[column] ?? []) {
      if (LEVEL_KEYS.includes(p.key) || p.key === 'ParticleStrength') continue;
      const value = p.key.startsWith('ColorTone') ? look.tone : p.key === 'HdrIntense' ? look.intensity : p.key === 'FilterEffectCustom' ? look.filter : p.key === 'Particle' ? look.grainStrength : p.key === 'ParticleSize' ? look.grainSize : look.solarization;
      const label = p.labels[value - p.first];
      if (label && label.toUpperCase() !== 'OFF' && !(p.key === 'ParticleSize' && !look.grainStrength)) rows.push([PARAMETER_NAMES[p.key] ?? p.key, r.values[label] ?? label]);
    }
  }
  const balance = whiteBalanceText(recipe);
  if (balance) rows.push(['White Balance', balance]);
  if (recipe.grain) rows.push([r.grain, recipe.grain.level ? `${r.grainLevels[recipe.grain.level] ?? ''}${recipe.grain.size ? ` · ${r.grainSizes[recipe.grain.size] ?? ''}` : ''}` : r.grainLevels[0] ?? 'Off']);
  if (recipe.glow) {
    rows.push([r.bloom, r.glowLevels[recipe.glow.bloom] ?? '']);
    rows.push([r.halation, `${r.glowLevels[recipe.glow.halation] ?? ''}${recipe.glow.halation && recipe.glow.halationColor !== null ? ` · ${r.halationColors[recipe.glow.halationColor] ?? ''}` : ''}`]);
  }
  recipe.corrections.forEach((stored, index) => {
    if (stored === null) return;
    const value = CORRECTION_VALUES[index]?.[stored] ?? '';
    rows.push([CORRECTION_NAMES[index] ?? '', r.values[value] ?? value]);
  });
  const e = recipe.exposure;
  if (e.compensation !== null) rows.push(['Exposure Compensation', `${e.compensation > 0 ? '+' : e.compensation < 0 ? '-' : ''}${Math.abs(e.compensation) / 3} EV`]);
  if (e.isoLimit !== null) rows.push(['ISO Auto Upper Limit', `ISO ${e.isoLimit}`]);
  if (e.metering !== null) rows.push(['AE Metering', r.meterings[['multi', 'center', 'spot', 'highlight'].indexOf(e.metering)] ?? e.metering]);
  if (e.nd !== null) rows.push(['ND Filter', r.nds[['off', 'on', 'auto'].indexOf(e.nd)] ?? e.nd]);

  return (
    <div className={cn('overflow-hidden rounded-xl border bg-card', compact ? 'text-sm' : '')}>
      <div className={cn('px-4 pt-3', compact ? 'pb-2' : 'pb-3')}>
        <p className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">{look.kind === 'effect' ? 'Film Look' : 'Image Control'}</p>
        <p className={cn('font-semibold text-brand', compact ? 'text-base' : 'text-xl')}>{lookName(recipe, r, language, effectNames)}</p>
      </div>
      {look.kind === 'native' && (
        <div className={cn('grid grid-cols-3 gap-y-3 border-t px-2', compact ? 'py-3' : 'py-5')}>
          {LEVELS.map((level) => {
            const stored = look.levels[LEVEL_KEYS.indexOf(level.key)] ?? 4;
            const has = (TYPE_PARAMETERS[look.imageType]?.[column] ?? []).some((p) => p.key === level.key);
            const Icon = level.icon;
            return (
              <div key={level.key} className={cn('flex flex-col items-center gap-0.5', !has && 'opacity-30')} title={level.name}>
                <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                <span className={cn('font-mono font-semibold tabular-nums', compact ? 'text-lg' : 'text-2xl')}>{has ? signed(stored) : '–'}</span>
                <span className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground">{level.short}</span>
              </div>
            );
          })}
        </div>
      )}
      {rows.length > 0 && (
        <dl className="divide-y divide-border/60 border-t">
          {rows.map(([label, value]) => (
            <div key={label} className={cn('flex items-baseline justify-between gap-4 px-4', compact ? 'py-1.5' : 'py-2')}>
              <dt className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">{label}</dt>
              <dd className="m-0 text-right font-mono">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
