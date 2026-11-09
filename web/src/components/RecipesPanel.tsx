import { useState } from 'react';
import { Copy, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { RecipePhoto } from './RecipePhoto';
import { RecipeSheet, lookName as sheetLookName, recipeChips } from './RecipeSheet';
import { SAMPLES } from '../preview/samples';
import { RecipeEditor } from './RecipeEditor';
import { Handle, HandleRoot, Item, Provider, Root } from 'react-compare-slider/components';
import { useReactCompareSlider } from 'react-compare-slider/hooks';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { siteUrl } from '../catalog';
import { PRESETS } from '../generated/recipes';
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
  const [editing, setEditing] = useState(false);
  /** The sample photo that the example pictures use. */
  const [sample, setSample] = useState(SAMPLES[0]!);
  /** The recipe that the editor starts from, or null for a new one. */
  const [draft, setDraft] = useState<Recipe | null>(null);
  // Only the recipes that are on apply on the camera.
  const warnings = libraryWarnings(
    library.filter((recipe) => recipe.enabled),
    { grain: grainModule, glow: glowModule },
    packageEffects,
  );
  const nameOf = (recipe: Recipe) => recipe.name || automaticName(sheetLookName(recipe, r, language, effectNames), recipe.number);
  /** Turns a recipe on or off. It moves to the end of the recipes that are on, or to the start of the others. */
  function toggle(index: number) {
    onChange(cameraOrder(library.map((recipe, other) => (other === index ? { ...recipe, enabled: !recipe.enabled } : recipe))));
  }
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-base font-semibold">{r.heading}</h3>
        <div className="flex items-center gap-4">
          {on >= ON_MAX - COUNT_NEAR && (
            <p className="text-sm text-muted-foreground tabular-nums">
              {r.onCount(ON_MAX)[0]}
              <b className="font-semibold text-foreground">{on}</b>
              {r.onCount(ON_MAX)[1]}
            </p>
          )}
          <Button type="button" size="sm" variant="brand" disabled={library.length >= LIBRARY_MAX} onClick={() => { setDraft(null); setEditing(true); }}>
            <Plus aria-hidden="true" />
            {r.newRecipe}
          </Button>
        </div>
      </div>
      {/* What a recipe is, in four lines: new to most people. */}
      <ul className="grid gap-2 rounded-xl border border-dashed bg-card/60 p-4 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
        {[r.introWhat, r.introCamera, r.introSite, r.introDial].map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">{t.samplePhotos}</span>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.samplePhotos}>
          {SAMPLES.map((item) => (
            <button
              key={item.source.key}
              type="button"
              className={cn('relative aspect-[3/2] w-14 shrink-0 overflow-hidden rounded-md ring-1 ring-black/20 transition-opacity hover:opacity-100', sample === item ? 'opacity-100 ring-2 ring-brand' : 'opacity-60')}
              aria-label={`${item.credit.title} · ${item.credit.camera}`}
              aria-pressed={sample === item}
              onClick={() => setSample(item)}
            >
              <img src={item.thumbnail} alt="" width="360" height="240" loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{t.previewNote}</span>
      </div>
      {library.length + presets.length === 0 ? (
        <p className="text-sm text-muted-foreground">{r.empty}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {[...library.map((recipe, index) => ({ recipe, index, preset: presetOf(PRESETS, recipe) })), ...presets.map(({ preset, recipe }) => ({ recipe, index: -1, preset }))].map(({ recipe, index, preset }) => {
            const inLibrary = index >= 0;
            const name = inLibrary ? nameOf(recipe) : recipe.name;
            const chips = recipeChips(recipe, r, language, effectNames);
            return (
              <li
                key={inLibrary ? `${index}-${recipe.name}` : `preset-${preset?.id}`}
                className={cn('flex gap-3 rounded-xl border bg-card p-3 transition-colors', inLibrary && !recipe.enabled && 'opacity-70')}
              >
                <button type="button" className="w-28 shrink-0 self-start overflow-hidden rounded-lg ring-1 ring-black/20" aria-label={name} onClick={() => setShown(recipe)}>
                  <RecipePhoto recipe={recipe} src={sample.thumbnail} />
                </button>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <button type="button" className="min-w-0 text-left transition-colors hover:text-brand" onClick={() => setShown(recipe)}>
                      <span className="block truncate text-[15px] font-semibold">{name}</span>
                      {preset?.author && <span className="block truncate text-xs text-muted-foreground">{r.by(preset.author)}</span>}
                    </button>
                    {inLibrary ? (
                      <Switch checked={recipe.enabled} disabled={!recipe.enabled && on >= ON_MAX} aria-label={name} onCheckedChange={() => toggle(index)} />
                    ) : (
                      <Switch checked={false} disabled={on >= ON_MAX || library.length >= LIBRARY_MAX} aria-label={name} onCheckedChange={() => onAddPreset(recipe, preset!.effect)} />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {chips.slice(0, 5).map((chip) => (
                      <Badge key={chip} variant="secondary" className="rounded-md px-1.5 py-0 font-mono text-[11px] font-medium text-muted-foreground">
                        {chip}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center gap-1 text-muted-foreground">
                    <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => { setDraft(recipe); setEditing(true); }}>
                      <Copy className="size-3.5" aria-hidden="true" />
                      {r.wizCopy}
                    </Button>
                    {inLibrary && !preset && (
                      <Button type="button" variant="ghost" size="icon" className="ml-auto size-7 hover:text-destructive" aria-label={r.remove} onClick={() => onChange(library.filter((_, other) => other !== index))}>
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
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
      <RecipeEditor
        strings={t}
        r={r}
        language={language}
        family={family}
        effectNames={effectNames}
        sample={sample.thumbnail}
        open={editing}
        initial={draft}
        onClose={() => setEditing(false)}
        onAdd={(recipe) => onChange(cameraOrder([...library, recipe]))}
      />
      <Dialog open={shown !== null} onOpenChange={(open) => !open && setShown(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
          {shown && (
            <RecipeDetails
              t={t}
              r={r}
              language={language}
              recipe={shown}
              name={nameOf(shown)}
              preset={presetOf(PRESETS, shown)}
              effectNames={effectNames}
              sample={sample}
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
  sample,
}: {
  t: Strings;
  r: RecipeStrings;
  language: Language;
  recipe: Recipe;
  name: string;
  preset: Preset | undefined;
  effectNames: RecipesPanelProps['effectNames'];
  sample: (typeof SAMPLES)[number];
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
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_320px] md:items-start">
      <div className="flex flex-col gap-3">
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
      {!(picture && photo) && (
        <figure className="m-0">
          <div className="overflow-hidden rounded-lg">
            <RecipePhoto recipe={recipe} src={sample.thumbnail} />
          </div>
          <figcaption className="mt-2 text-xs text-muted-foreground">{t.previewNote}</figcaption>
        </figure>
      )}
      </div>
      <RecipeSheet recipe={recipe} r={r} language={language} effectNames={effectNames} compact />
      </div>
    </>
  );
}
