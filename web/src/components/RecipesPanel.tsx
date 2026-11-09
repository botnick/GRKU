import { useState } from 'react';
import { ExternalLink, Trash2 } from 'lucide-react';
import { Handle, HandleRoot, Item, Provider, Root } from 'react-compare-slider/components';
import { useReactCompareSlider } from 'react-compare-slider/hooks';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { siteUrl } from '../catalog';
import { CORRECTION_VALUES, LEVEL_KEYS, PRESETS, TYPE_NAMES, WHITE_BALANCE_MODES } from '../generated/recipes';
import type { Language, Strings } from '../i18n';
import { LANDING_PHOTOS } from '../landing-data';
import { RECIPE_STRINGS, type RecipeStrings } from '../recipeStrings';
import {
  automaticName,
  cameraOrder,
  DIAL_FOLLOW,
  DIAL_OFF,
  DIAL_SAVED,
  dialChoices,
  LIBRARY_MAX,
  libraryWarnings,
  ON_MAX,
  onCount,
  presetOf,
  presetRows,
  type DialChoice,
  type Family,
  type Preset,
  type Recipe,
} from '../recipes';

export interface RecipesPanelProps {
  strings: Strings;
  language: Language;
  family: Family;
  library: readonly Recipe[];
  onChange: (library: Recipe[]) => void;
  /** The recipes of the connected card while they differ from `library`, else null. */
  cardRecipes: readonly Recipe[] | null;
  /** The choice between the recipes of the card (true) and those of the site (false). */
  onCardChoice: (useCard: boolean) => void;
  /** The names of the effects of the catalog and of the imports, by their recipe code. */
  effectNames: ReadonlyMap<number, string>;
  /** The recipe codes of the effects of the package. */
  packageEffects: ReadonlySet<number>;
  /** The package has the Grain module. */
  grainModule: boolean;
  /** The package has the Glow module. */
  glowModule: boolean;
  /** Adds the recipe of a preset to the library, and its effect to the package. */
  onAddPreset: (recipe: Recipe, effect: string | null) => void;
  /**
   * What the user modes of the mode dial do, as the camera shows them, and the change of user mode
   * `u` (0 for U1): for a ZIP package, null keeps the camera's value; on a card, each user mode has
   * a value. `saved` tells the user modes of the card that apply settings that the camera saved in
   * them, which the site can keep but not make. Null when the page writes no recipes.
   */
  dial?: {
    shown: DialChoice;
    canKeep: boolean;
    saved?: readonly boolean[];
    onChange: (u: number, value: number | null) => void;
  } | null;
}

/**
 * The pictures of each preset: the camera developed a RAW photo with the recipe and without it
 * (scripts/build-landing.mjs). Presets that share a photo share its picture without a recipe.
 */
const PRESET_PICTURES: Readonly<Record<string, { recipe: string; original: string; photo: keyof typeof LANDING_PHOTOS }>> = {
  'cinestill-800t': { recipe: siteUrl('recipes/cinestill-800t.jpg'), original: siteUrl('recipes/takeaway.jpg'), photo: 'takeaway' },
  'bennet-800': { recipe: siteUrl('recipes/bennet-800.jpg'), original: siteUrl('recipes/dunes.jpg'), photo: 'dunes' },
  'reggie-negative': { recipe: siteUrl('recipes/reggie-negative.jpg'), original: siteUrl('recipes/dunes.jpg'), photo: 'dunes' },
};

/** The count of recipes that are on shows from this many below `ON_MAX`. */
const COUNT_NEAR = 5;

/** The name of the look of a recipe: its effect, its native type, Film Look Off, or the camera's. */
function lookName(recipe: Recipe, r: RecipeStrings, language: Language, effects: RecipesPanelProps['effectNames']): string {
  const look = recipe.look;
  if (look.kind === 'effect') return effects.get(look.code) ?? r.lookEffect;
  if (look.kind === 'native') return TYPE_NAMES[language]?.[look.imageType] ?? r.lookNative;
  return look.kind === 'off' ? r.lookOff : r.lookKept;
}

/** A level as the camera shows it: stored 0 to 8 is -4 to +4. */
const level = (stored: number) => (stored === 4 ? '0' : stored > 4 ? `+${stored - 4}` : `${stored - 4}`);

/** A white balance shift as the camera shows it, such as A14 or G2, or nothing for none. */
const shift = (stored: number, minus: string, plus: string) =>
  stored === 14 ? '' : stored < 14 ? `${minus}${14 - stored}` : `${plus}${stored - 14}`;

/** An exposure compensation in thirds of a stop, such as +1 1/3 EV. */
function compensation(thirds: number): string {
  const sign = thirds > 0 ? '+' : thirds < 0 ? '-' : '±';
  const whole = Math.floor(Math.abs(thirds) / 3);
  const rest = Math.abs(thirds) % 3;
  const value = [whole || (rest ? '' : '0'), rest ? `${rest}/3` : ''].filter(Boolean).join(' ');
  return `${sign}${value} EV`;
}

const ND_INDEX = { off: 0, on: 1, auto: 2 } as const;
const METERING_INDEX = { multi: 0, center: 1, spot: 2, highlight: 3 } as const;

/**
 * The settings that a recipe holds, as a name and a value each, in the order of the camera
 * menus: the look and the levels of a native look that are not 0, Grain, Glow, the white balance
 * with its shifts, each correction, and the exposure settings.
 */
function details(recipe: Recipe, r: RecipeStrings, language: Language, effects: RecipesPanelProps['effectNames']): [string, string][] {
  const rows: [string, string][] = [[r.look, lookName(recipe, r, language, effects)]];
  const look = recipe.look;
  if (look.kind === 'native') {
    look.levels.forEach((stored, index) => {
      const key = LEVEL_KEYS[index];
      if (key && stored !== 4) rows.push([r.levels[key] ?? key, level(stored)]);
    });
  }
  if (recipe.grain) rows.push([r.grain, r.grainLevels[recipe.grain.level] ?? '']);
  const glow = recipe.glow;
  if (glow?.bloom) rows.push([r.bloom, r.glowLevels[glow.bloom] ?? '']);
  if (glow?.halation) {
    const color = glow.halationColor === null ? '' : ` ${r.halationColors[glow.halationColor] ?? ''}`;
    rows.push([r.halation, `${r.glowLevels[glow.halation] ?? ''}${color}`]);
  }
  const balance = recipe.whiteBalance;
  if (balance) {
    const label = WHITE_BALANCE_MODES[balance.mode]?.[recipe.family === 'gr3' ? 0 : 1] ?? '';
    const shifts = [shift(balance.shiftBa, 'B', 'A'), shift(balance.shiftGm, 'G', 'M')].filter(Boolean).join(' ');
    const kelvin = label === 'ColorTemp1' ? `${balance.kelvin} K` : '';
    rows.push([r.whiteBalance, [r.modes[label] ?? label, kelvin, shifts].filter(Boolean).join(' · ')]);
  }
  recipe.corrections.forEach((stored, index) => {
    if (stored === null) return;
    const value = CORRECTION_VALUES[index]?.[stored] ?? '';
    rows.push([r.correctionNames[index] ?? '', r.values[value] ?? value]);
  });
  const exposure = recipe.exposure;
  if (exposure.compensation !== null) rows.push([r.compensation, compensation(exposure.compensation)]);
  if (exposure.isoLimit !== null) rows.push([r.isoLimit, `ISO ${exposure.isoLimit}`]);
  if (exposure.metering !== null) rows.push([r.metering, r.meterings[METERING_INDEX[exposure.metering]] ?? '']);
  if (exposure.nd !== null) rows.push([r.nd, r.nds[ND_INDEX[exposure.nd]] ?? '']);
  return rows;
}

/** The settings of a recipe in one line: the look, Grain, and Glow, then the names of the others. */
function summary(recipe: Recipe, r: RecipeStrings, language: Language, effects: RecipesPanelProps['effectNames']): string {
  const parts = [lookName(recipe, r, language, effects)];
  if (recipe.grain) parts.push(`${r.grain} ${r.grainLevels[recipe.grain.level] ?? ''}`);
  const glow = recipe.glow;
  if (glow?.bloom) parts.push(`${r.bloom} ${r.glowLevels[glow.bloom] ?? ''}`);
  if (glow?.halation) parts.push(`${r.halation} ${r.glowLevels[glow.halation] ?? ''}`);
  if (recipe.whiteBalance) parts.push(r.whiteBalance);
  if (recipe.corrections.some((value) => value !== null)) parts.push(r.corrections);
  if (Object.values(recipe.exposure).some((value) => value !== null)) parts.push(r.exposure);
  return parts.join(' · ');
}

/** The value of the option that keeps the camera's value of a user mode. */
const KEEP_VALUE = 'keep';

/**
 * The recipes of the selected camera line, in the order of the camera, then the presets that the
 * library does not hold, off. The camera makes and edits recipes; the site turns them on and off
 * and deletes them, but not a preset, and a preset joins the library when the person turns it on.
 * As with the film looks, at most `ON_MAX` recipes are on: the camera lists them. The others stay
 * on the card for the site. The name of a recipe opens its settings, with the pictures of a
 * preset. Then the user modes of the mode dial, U1 to U3.
 */
export function RecipesPanel({
  strings: t,
  language,
  family,
  library,
  onChange,
  cardRecipes,
  onCardChoice,
  effectNames,
  packageEffects,
  grainModule,
  glowModule,
  onAddPreset,
  dial = null,
}: RecipesPanelProps) {
  const r = RECIPE_STRINGS[language];
  const on = onCount(library);
  const presets = presetRows(PRESETS, family, library);
  const [shown, setShown] = useState<Recipe | null>(null);
  // Only the recipes that are on apply on the camera.
  const warnings = libraryWarnings(
    library.filter((recipe) => recipe.enabled),
    { grain: grainModule, glow: glowModule },
    packageEffects,
  );
  const nameOf = (recipe: Recipe) => recipe.name || automaticName(lookName(recipe, r, language, effectNames), recipe.number);
  /** Turns a recipe on or off. It moves to the end of the recipes that are on, or to the start of the others. */
  function toggle(index: number) {
    onChange(cameraOrder(library.map((recipe, other) => (other === index ? { ...recipe, enabled: !recipe.enabled } : recipe))));
  }
  const row = 'flex items-center gap-3 px-4 py-3';
  return (
    <div className="flex flex-col gap-5">
      {cardRecipes && (
        <Alert className="border-brand/40 bg-brand/[0.08]" aria-live="polite">
          <AlertDescription className="flex flex-col gap-3 text-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>{r.cardDiffers}</span>
            <span className="flex shrink-0 gap-2">
              <Button type="button" size="sm" variant="brand" onClick={() => onCardChoice(true)}>
                {r.useCard}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => onCardChoice(false)}>
                {r.keepSite}
              </Button>
            </span>
          </AlertDescription>
        </Alert>
      )}
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold">{t.moduleNames.recipes}</h3>
        {on >= ON_MAX - COUNT_NEAR && (
          <p className="text-sm text-muted-foreground tabular-nums">
            {r.onCount(ON_MAX)[0]}
            <b className="font-semibold text-foreground">{on}</b>
            {r.onCount(ON_MAX)[1]}
          </p>
        )}
      </div>
      {library.length + presets.length === 0 ? (
        <p className="text-sm text-muted-foreground">{r.empty}</p>
      ) : (
        <ol className="divide-y divide-border overflow-hidden rounded-xl border bg-card">
          {library.map((recipe, index) => (
            <li key={`${index}-${recipe.name}`} className={cn(row, !recipe.enabled && 'opacity-60')}>
              <Checkbox
                id={`recipe-${index}`}
                checked={recipe.enabled}
                disabled={!recipe.enabled && on >= ON_MAX}
                aria-label={nameOf(recipe)}
                onCheckedChange={() => toggle(index)}
              />
              <div className="min-w-0 flex-1">
                <button type="button" className="block max-w-full truncate text-left text-[15px] font-semibold hover:underline" onClick={() => setShown(recipe)}>
                  {nameOf(recipe)}
                </button>
                <p className="truncate text-sm text-muted-foreground">{summary(recipe, r, language, effectNames)}</p>
              </div>
              {/* A preset of the site stays: turning it off keeps it out of the camera. */}
              {!presetOf(PRESETS, recipe) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label={r.remove}
                  onClick={() => onChange(library.filter((_, other) => other !== index))}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              )}
            </li>
          ))}
          {presets.map(({ preset, recipe }) => (
            <li key={preset.id} className={cn(row, 'opacity-80')}>
              <Checkbox
                id={`preset-${preset.id}`}
                checked={false}
                disabled={on >= ON_MAX || library.length >= LIBRARY_MAX}
                aria-label={recipe.name}
                onCheckedChange={() => onAddPreset(recipe, preset.effect)}
              />
              <div className="min-w-0 flex-1">
                <button type="button" className="flex max-w-full items-center gap-2 text-left text-[15px] font-semibold hover:underline" onClick={() => setShown(recipe)}>
                  <span className="truncate">{recipe.name}</span>
                  <Badge variant="secondary" className="shrink-0 rounded-md px-1.5 py-0 text-[11px] font-medium">
                    {r.presetTag}
                  </Badge>
                </button>
                <p className="truncate text-sm text-muted-foreground">{summary(recipe, r, language, effectNames)}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
      {(warnings.grain.length > 0 || warnings.glow.length > 0 || warnings.missing.length > 0) && (
        <div className="flex flex-col gap-1 text-sm text-destructive">
          {warnings.grain.length > 0 && <p>{r.warnGrain(warnings.grain.join(t.listSeparator))}</p>}
          {warnings.glow.length > 0 && <p>{r.warnGlow(warnings.glow.join(t.listSeparator))}</p>}
          {warnings.missing.length > 0 && <p>{r.warnMissing(warnings.missing.join(t.listSeparator))}</p>}
        </div>
      )}
      <div aria-live="polite">{library.length >= LIBRARY_MAX && <p className="text-sm text-muted-foreground">{r.full(LIBRARY_MAX)}</p>}</div>
      {dial && (
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-base font-semibold">{r.modeDial}</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {dial.shown.map((value, u) => (
              <div key={u} className="flex flex-col gap-1.5">
                <Label htmlFor={`dial-u${u + 1}`} className="font-mono text-xs text-muted-foreground">
                  U{u + 1}
                </Label>
                <Select
                  value={value === null ? KEEP_VALUE : String(value)}
                  onValueChange={(next) => dial.onChange(u, next === KEEP_VALUE ? null : Number(next))}
                >
                  <SelectTrigger id={`dial-u${u + 1}`} className="w-full bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dial.canKeep && <SelectItem value={KEEP_VALUE}>{r.dialKeep}</SelectItem>}
                    <SelectItem value={String(DIAL_FOLLOW)}>{r.dialNone}</SelectItem>
                    <SelectItem value={String(DIAL_OFF)}>{r.dialOff}</SelectItem>
                    {dial.saved?.[u] && <SelectItem value={String(DIAL_SAVED)}>{r.dialSaved}</SelectItem>}
                    {dialChoices(library).map((recipe) => (
                      <SelectItem key={recipe.id} value={String(recipe.id)}>
                        {nameOf(recipe)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}
      <Dialog open={shown !== null} onOpenChange={(open) => !open && setShown(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          {shown && (
            <RecipeDetails
              t={t}
              r={r}
              language={language}
              recipe={shown}
              name={nameOf(shown)}
              preset={presetOf(PRESETS, shown)}
              effectNames={effectNames}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** The settings of a recipe, and for a preset its pictures with the recipe and without it. */
function RecipeDetails({
  t,
  r,
  language,
  recipe,
  name,
  preset,
  effectNames,
}: {
  t: Strings;
  r: RecipeStrings;
  language: Language;
  recipe: Recipe;
  name: string;
  preset: Preset | undefined;
  effectNames: RecipesPanelProps['effectNames'];
}) {
  const comparison = useReactCompareSlider({ clip: 'itemTwo' });
  const picture = preset ? PRESET_PICTURES[preset.id] : undefined;
  const photo = picture ? LANDING_PHOTOS[picture.photo] : undefined;
  return (
    <>
      <DialogHeader>
        <DialogTitle>{name}</DialogTitle>
        {preset && <DialogDescription>{r.presetText[preset.id]}</DialogDescription>}
      </DialogHeader>
      {picture && photo && (
        <figure className="m-0">
          <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-black">
            <Provider {...comparison}>
              <Root className="image-comparison">
                <Item item="itemOne">
                  <img src={picture.original} alt={`${name} — ${r.presetBefore}`} width="1200" height="800" />
                </Item>
                <Item item="itemTwo" className="comparison-effect">
                  <img src={picture.recipe} alt={`${name} — ${r.presetAfter}`} width="1200" height="800" />
                </Item>
                <HandleRoot aria-label={t.compare}>
                  <Handle buttonStyle={{ width: 32, height: 32, gap: '0.2rem' }} />
                </HandleRoot>
              </Root>
            </Provider>
            <Badge className="pointer-events-none absolute top-2 left-2 z-[2] rounded-md bg-black/75 px-2 py-0.5 font-mono text-[11px] text-foreground">
              {r.presetBefore}
            </Badge>
            <Badge className="pointer-events-none absolute top-2 right-2 z-[2] rounded-md bg-black/75 px-2 py-0.5 font-mono text-[11px] text-foreground">
              {r.presetAfter}
            </Badge>
          </div>
          <figcaption className="mt-2 text-xs text-muted-foreground">
            <a className="hover:underline" href={photo.source} target="_blank" rel="noreferrer">
              {r.photo(photo.author, photo.license)}
            </a>
          </figcaption>
        </figure>
      )}
      {preset?.author && preset.source && (
        <p className="text-sm text-muted-foreground">
          {r.by(preset.author)} ·{' '}
          <a className="inline-flex items-center gap-1 hover:underline" href={preset.source} target="_blank" rel="noreferrer">
            {r.original}
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        </p>
      )}
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        {details(recipe, r, language, effectNames).map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="m-0 font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
