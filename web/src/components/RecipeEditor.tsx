import { Brush, Film, Thermometer } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  CORRECTION_VALUES,
  EXPOSURE_THIRDS_MAX,
  ISO_MAX,
  ISO_STEPS,
  LEVEL_KEYS,
  PRESETS,
  SHIFT_STEPS,
  TEMPERATURE,
  TYPE_FAMILIES,
  TYPE_MONOCHROME,
  TYPE_NAMES,
  TYPE_PARAMETERS,
  WHITE_BALANCE_MODES,
} from '../generated/recipes';
import type { Language, Strings } from '../i18n';
import type { RecipeStrings } from '../recipeStrings';
import { cameraTerms } from '../recipeStrings';
import { RecipePhoto } from './RecipePhoto';
import { CORRECTION_NAMES, LEVELS, PARAMETER_NAMES, RecipeSheet, WB_NAMES, recipeChips } from './RecipeSheet';
import { encodeLibrary, type Family, type Metering, type Nd, type Recipe } from '../recipes';

/** The value of the option that leaves a setting to the camera. */
const UNSET = 'unset';
const MIDDLE = (SHIFT_STEPS - 1) / 2;

/** An exposure compensation in thirds of a stop, such as +1 1/3 EV. */
function compensationText(thirds: number): string {
  const sign = thirds > 0 ? '+' : thirds < 0 ? '-' : '±';
  const whole = Math.floor(Math.abs(thirds) / 3);
  const rest = Math.abs(thirds) % 3;
  const value = [whole || (rest ? '' : '0'), rest ? `${rest}/3` : ''].filter(Boolean).join(' ');
  return `${sign}${value} EV`;
}

/** A white balance shift as the camera shows it: B7 to A7, or G7 to M7, with 0 in the middle. */
const shiftText = (stored: number, minus: string, plus: string) => (stored === MIDDLE ? '0' : stored < MIDDLE ? `${minus}${MIDDLE - stored}` : `${plus}${stored - MIDDLE}`);

/** A level label of the camera (M4 to P4) as the camera menu shows it (-4 to +4); other labels as they are. */
function labelText(label: string, r: RecipeStrings): string {
  const level = /^([MP])(\d)$/.exec(label);
  if (level) return `${level[1] === 'M' ? '-' : '+'}${level[2]}`;
  if (label === 'OFF') return r.values.Off ?? label;
  return r.values[label] ?? label;
}

const METERINGS: readonly Metering[] = ['multi', 'center', 'spot', 'highlight'];
const NDS: readonly Nd[] = ['off', 'on', 'auto'];
const HIDDEN_PARAMETERS = new Set(['ParticleStrength']);

/** What the form starts from. */
type Start = 'preset' | 'effect' | 'native' | 'kept';

/** The whole state of the form, as the camera stores it. */
interface Draft {
  name: string;
  lookKind: 'kept' | 'off' | 'effect' | 'native';
  effect: string;
  imageType: string;
  parameters: Record<string, number>;
  grain: string;
  grainSize: string;
  bloom: string;
  halation: string;
  halationColor: string;
  balance: string;
  shiftBa: string;
  shiftGm: string;
  kelvin: string;
  corrections: string[];
  compensation: string;
  isoLimit: string;
  metering: string;
  nd: string;
}

const EMPTY: Draft = {
  name: '',
  lookKind: 'kept',
  effect: UNSET,
  imageType: UNSET,
  parameters: {},
  grain: UNSET,
  grainSize: '0',
  bloom: UNSET,
  halation: UNSET,
  halationColor: UNSET,
  balance: UNSET,
  shiftBa: String(MIDDLE),
  shiftGm: String(MIDDLE),
  kelvin: '5500',
  corrections: CORRECTION_VALUES.map(() => UNSET),
  compensation: UNSET,
  isoLimit: UNSET,
  metering: UNSET,
  nd: UNSET,
};

/** The form state of an existing recipe, for a copy. */
function draftOf(recipe: Recipe, column: 0 | 1): Draft {
  const draft: Draft = { ...EMPTY, corrections: recipe.corrections.map((v) => (v === null ? UNSET : String(v))), name: recipe.name };
  const look = recipe.look;
  draft.lookKind = look.kind;
  if (look.kind === 'effect') draft.effect = String(look.code);
  if (look.kind === 'native') {
    draft.imageType = String(look.imageType);
    const params: Record<string, number> = {};
    for (const p of TYPE_PARAMETERS[look.imageType]?.[column] ?? []) {
      const index = LEVEL_KEYS.indexOf(p.key);
      if (index >= 0) params[p.key] = look.levels[index] ?? 4;
      else if (p.key.startsWith('ColorTone')) params[p.key] = look.tone;
      else if (p.key === 'HdrIntense') params[p.key] = look.intensity;
      else if (p.key === 'FilterEffectCustom') params[p.key] = look.filter;
      else if (p.key === 'Particle') params[p.key] = look.grainStrength;
      else if (p.key === 'ParticleSize') params[p.key] = look.grainSize;
      else if (p.key === 'SolarizationType') params[p.key] = look.solarization;
    }
    draft.parameters = params;
  }
  if (recipe.grain) { draft.grain = String(recipe.grain.level); draft.grainSize = String(recipe.grain.size); }
  if (recipe.glow) { draft.bloom = String(recipe.glow.bloom); draft.halation = String(recipe.glow.halation); draft.halationColor = recipe.glow.halationColor === null ? UNSET : String(recipe.glow.halationColor); }
  if (recipe.whiteBalance) { draft.balance = String(recipe.whiteBalance.mode); draft.shiftBa = String(recipe.whiteBalance.shiftBa); draft.shiftGm = String(recipe.whiteBalance.shiftGm); draft.kelvin = String(recipe.whiteBalance.kelvin); }
  const e = recipe.exposure;
  draft.compensation = e.compensation === null ? UNSET : String(e.compensation);
  draft.isoLimit = e.isoLimit === null ? UNSET : String(e.isoLimit);
  draft.metering = e.metering ?? UNSET;
  draft.nd = e.nd ?? UNSET;
  return draft;
}

/**
 * The form that makes a recipe, in three steps for people new to recipes: a starting point (a
 * popular recipe, a film look, an Image Control, or the camera's own look), five plain sliders
 * (color, contrast, brightness, grain, warmth) with the whole camera menu under "All camera
 * settings", then a name. The camera tables of the library (`encodeLibrary`) check the recipe
 * before it joins. With `initial`, the form starts filled from that recipe (a copy).
 */
export function RecipeEditor({
  strings: t,
  r: strings,
  language,
  family,
  effectNames,
  sample,
  open,
  initial = null,
  onClose,
  onAdd,
}: {
  strings: Strings;
  r: RecipeStrings;
  language: Language;
  family: Family;
  /** The names of the effects of the catalog and of the imports, by their recipe code. */
  effectNames: ReadonlyMap<number, string>;
  /** The sample photo of the example pictures. */
  sample: string;
  open: boolean;
  /** A recipe to start from, or null for an empty form. */
  initial?: Recipe | null;
  onClose: () => void;
  onAdd: (recipe: Recipe) => void;
}) {
  // The camera's own terms: English in a language the camera has no menu in.
  const r = cameraTerms(strings, language);
  const monochrome = family === 'gr4Monochrome';
  const column: 0 | 1 = family === 'gr3' ? 0 : 1;
  const [step, setStep] = useState(1);
  const [start, setStart] = useState<Start>('preset');
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Each opening starts over: empty, or from the recipe to copy, at the adjust step.
  useEffect(() => {
    if (!open) return;
    setError(null);
    if (initial) {
      setDraft({ ...draftOf(initial, column), name: '' });
      setStart(initial.look.kind === 'effect' ? 'effect' : initial.look.kind === 'native' ? 'native' : 'kept');
      setStep(2);
    } else {
      setDraft(EMPTY);
      setStart('preset');
      setStep(1);
    }
  }, [open, initial, column]);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const typeNames = TYPE_NAMES[language] ?? TYPE_NAMES.en ?? [];
  const typeChoices = typeNames.map((label, index) => ({ label, index })).filter(({ index }) => TYPE_FAMILIES[index]?.[column] && (TYPE_MONOCHROME[index] ?? false) === monochrome);
  const typeParameters = useMemo(
    () => (draft.imageType === UNSET ? [] : (TYPE_PARAMETERS[Number(draft.imageType)]?.[column] ?? [])).filter((p) => !HIDDEN_PARAMETERS.has(p.key)),
    [draft.imageType, column],
  );
  const effects = [...effectNames.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  const modeChoices = WHITE_BALANCE_MODES.map((labels, index) => ({ label: labels[column], index })).filter((mode): mode is { label: string; index: number } => mode.label !== null);
  const modeLabel = draft.balance === UNSET ? null : (WHITE_BALANCE_MODES[Number(draft.balance)]?.[column] ?? null);
  const shiftValues = [...Array(SHIFT_STEPS).keys()];
  const thirds = [...Array(2 * EXPOSURE_THIRDS_MAX + 1).keys()].map((i) => i - EXPOSURE_THIRDS_MAX);
  const isoChoices = ISO_STEPS.filter((iso) => iso <= ISO_MAX[family === 'gr3' ? 'gr3' : 'gr4']);
  const presetChoices = PRESETS.flatMap((preset) => { const recipe = preset.recipes.find((item) => item.family === family); return recipe ? [{ preset, recipe }] : []; });
  const hasParameter = (key: string) => typeParameters.some((p) => p.key === key);
  const parameterValue = (key: string, first: number, labels: readonly string[]) => {
    if (key in draft.parameters) return draft.parameters[key]!;
    const zero = labels.indexOf('OFF');
    return /^M\d$/.test(labels[0] ?? '') && zero >= 0 ? first + zero : first;
  };

  function recipe(): Recipe {
    let look: Recipe['look'];
    if (draft.lookKind === 'effect') look = { kind: 'effect', code: Number(draft.effect), adjustments: [0, 0, 0, 0, 0, 0, 0, 0, 0] };
    else if (draft.lookKind === 'native') {
      const value = (key: string) => { const p = typeParameters.find((item) => item.key === key); return p ? parameterValue(key, p.first, p.labels) : 0; };
      const levels = LEVEL_KEYS.map((key) => (hasParameter(key) ? value(key) : 4));
      const toneKey = typeParameters.find((p) => p.key.startsWith('ColorTone'))?.key;
      look = { kind: 'native', imageType: Number(draft.imageType), levels, tone: toneKey ? value(toneKey) : 0, intensity: value('HdrIntense'), filter: value('FilterEffectCustom'), grainStrength: value('Particle'), grainSize: value('Particle') ? value('ParticleSize') : 0, solarization: value('SolarizationType') };
    } else look = { kind: draft.lookKind };
    const glowSet = draft.bloom !== UNSET || draft.halation !== UNSET;
    return {
      name: draft.name.trim(),
      family,
      look,
      grain: draft.grain === UNSET ? null : { level: Number(draft.grain), size: Number(draft.grain) === 0 ? 0 : Number(draft.grainSize) },
      glow: glowSet ? { bloom: draft.bloom === UNSET ? 0 : Number(draft.bloom), halation: draft.halation === UNSET ? 0 : Number(draft.halation), halationColor: monochrome || draft.halationColor === UNSET ? null : Number(draft.halationColor) } : null,
      whiteBalance: draft.balance === UNSET ? null : { mode: Number(draft.balance), shiftBa: Number(draft.shiftBa), shiftGm: Number(draft.shiftGm), kelvin: Math.min(TEMPERATURE.max, Math.max(TEMPERATURE.min, Math.round(Number(draft.kelvin) / TEMPERATURE.step) * TEMPERATURE.step)) },
      corrections: draft.corrections.map((value) => (value === UNSET ? null : Number(value))),
      exposure: { compensation: draft.compensation === UNSET ? null : Number(draft.compensation), isoLimit: draft.isoLimit === UNSET ? null : Number(draft.isoLimit), metering: draft.metering === UNSET ? null : (draft.metering as Metering), nd: draft.nd === UNSET ? null : (draft.nd as Nd) },
      enabled: true,
      hidden: false,
      number: 0,
      id: 0,
    };
  }

  async function add() {
    setBusy(true);
    setError(null);
    const next = recipe();
    try {
      await encodeLibrary([next], ['keep', 'keep', 'keep']);
      onAdd(next);
      onClose();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setBusy(false);
    }
  }

  /** Step 1: a starting point. A preset or a native type fills the draft at once. */
  function begin(next: Start) {
    setStart(next);
    if (next === 'kept') setDraft({ ...EMPTY, lookKind: 'kept' });
    if (next === 'effect') setDraft({ ...EMPTY, lookKind: 'effect', effect: effects[0] ? String(effects[0][0]) : UNSET });
    if (next === 'native') setDraft({ ...EMPTY, lookKind: 'native', imageType: String(typeChoices[0]?.index ?? 0) });
    if (next === 'preset' && presetChoices[0]) setDraft({ ...draftOf(presetChoices[0].recipe, column), name: '' });
    setStep(2);
  }
  const canContinue = step !== 2 || (draft.lookKind !== 'effect' || draft.effect !== UNSET) && (draft.lookKind !== 'native' || draft.imageType !== UNSET);

  // The plain sliders of step 2 write the camera's own values.
  const levelOf = (key: string) => (key in draft.parameters ? draft.parameters[key]! - 4 : 0);
  const setLevel = (key: string, value: number) => set('parameters', { ...draft.parameters, [key]: value + 4 });
  const warmth = Number(draft.shiftBa) - MIDDLE;
  const setWarmth = (value: number) => setDraft((d) => ({ ...d, balance: d.balance === UNSET ? String(modeChoices[0]?.index ?? 0) : d.balance, shiftBa: String(value + MIDDLE) }));

  const Pick = ({ id, value, onChange, items, unset = true }: { id: string; value: string; onChange: (next: string) => void; items: readonly { value: string; label: string }[]; unset?: boolean }) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} aria-label={id} className="h-8 w-full justify-end gap-2 border-0 bg-transparent px-2 text-right font-mono text-[14px] shadow-none hover:bg-muted/60 data-[size=default]:h-8">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {unset && <SelectItem value={UNSET}>{r.editNotSet}</SelectItem>}
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
  const Row = ({ label, children, indent = false }: { label: string; children: ReactNode; indent?: boolean }) => (
    <div className={cn('grid grid-cols-[minmax(0,1fr)_minmax(0,11rem)] items-center gap-3 px-4 py-2', indent && 'pl-8')}>
      <span className={cn('truncate text-[15px]', indent && 'text-sm text-muted-foreground')}>{label}</span>
      {children}
    </div>
  );
  const Group = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="overflow-hidden rounded-xl border bg-card">
      <h4 className="border-b bg-muted/40 px-4 py-2 font-mono text-[12px] tracking-[0.04em] text-muted-foreground uppercase">{title}</h4>
      <div className="divide-y divide-border/60">{children}</div>
    </section>
  );
  const levelItems = (labels: readonly string[]) => labels.map((label, index) => ({ value: String(index), label }));
  /** A slider with the camera's steps and its value shown as the camera shows it. */
  const Slider = ({ id, label, icon: Icon, value, min, max, onChange, text, disabled = false, ends }: { id: string; label: string; icon?: typeof Brush; value: number; min: number; max: number; onChange: (next: number) => void; text: string; disabled?: boolean; ends?: [string, string] }) => (
    <div className={cn('flex flex-col gap-1.5', disabled && 'opacity-50')}>
      <div className="flex items-center justify-between text-sm">
        <label htmlFor={id} className="flex items-center gap-1.5 font-medium">{Icon && <Icon className="size-4 text-muted-foreground" aria-hidden="true" />}{label}</label>
        <span className="font-mono text-muted-foreground">{text}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={1} value={value} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} className="h-2 w-full cursor-pointer accent-brand" />
      {ends && (
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>{ends[0]}</span>
          <span>{ends[1]}</span>
        </div>
      )}
    </div>
  );
  const signed = (n: number) => (n > 0 ? `+${n}` : String(n));
  const preview = recipe();
  const colorControls = draft.lookKind === 'native' ? hasParameter('Saturation') : draft.lookKind !== 'off';

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {r.newRecipe}
            <Badge variant="secondary" className="rounded-md font-mono text-[11px] font-medium">{r.wizStep(step)}</Badge>
          </DialogTitle>
          <DialogDescription>{step === 1 ? r.wizStartTitle : step === 2 ? r.wizAdjustText : r.editHint}</DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ['preset', r.wizStartPreset, r.wizStartPresetText],
                ['effect', r.wizStartEffect, r.wizStartEffectText],
                ['native', r.wizStartNative, r.wizStartNativeText],
                ['kept', r.wizStartKept, r.wizStartKeptText],
              ] as const
            ).map(([kind, title, text]) => (
              <button key={kind} type="button" className="flex flex-col gap-1 rounded-xl border bg-card p-4 text-left transition-colors hover:border-brand/60 hover:bg-muted/40" onClick={() => begin(kind)}>
                <span className="text-[15px] font-semibold">{title}</span>
                <span className="text-sm leading-relaxed text-muted-foreground">{text}</span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-3 rounded-xl border bg-card p-3">
              <span className="w-28 shrink-0 self-start overflow-hidden rounded-lg ring-1 ring-black/20"><RecipePhoto recipe={preview} src={sample} /></span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                {start === 'preset' && (
                  <Pick id="recipe-preset" unset={false} value={presetChoices.findIndex(({ recipe: item }) => JSON.stringify({ ...draftOf(item, column), name: '' }) === JSON.stringify({ ...draft, name: '' })) >= 0 ? String(presetChoices.findIndex(({ recipe: item }) => JSON.stringify({ ...draftOf(item, column), name: '' }) === JSON.stringify({ ...draft, name: '' }))) : 'custom'} onChange={(next) => { const chosen = presetChoices[Number(next)]; if (chosen) setDraft({ ...draftOf(chosen.recipe, column), name: '' }); }} items={presetChoices.map(({ recipe: item }, index) => ({ value: String(index), label: item.name }))} />
                )}
                {start === 'effect' && <Pick id="recipe-effect" unset={false} value={draft.effect} onChange={(next) => set('effect', next)} items={effects.map(([code, label]) => ({ value: String(code), label }))} />}
                {start === 'native' && (
                  <Pick id="recipe-type" unset={false} value={draft.imageType} onChange={(next) => setDraft((d) => ({ ...d, imageType: next, parameters: {} }))} items={typeChoices.map(({ label, index }) => ({ value: String(index), label }))} />
                )}
                {start === 'kept' && <span className="px-2 text-sm text-muted-foreground">{r.lookKept}</span>}
                <div className="flex flex-wrap gap-1 px-2">
                  {recipeChips(preview, r, language, effectNames).slice(0, 5).map((chip) => (
                    <Badge key={chip} variant="secondary" className="rounded-md px-1.5 py-0 font-mono text-[11px] font-medium text-muted-foreground">{chip}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {draft.lookKind === 'native' ? (
                <>
                  <Slider id="s-color" label={LEVELS[0]!.name} icon={LEVELS[0]!.icon} value={levelOf('Saturation')} min={-4} max={4} disabled={!hasParameter('Saturation')} onChange={(v) => setLevel('Saturation', v)} text={hasParameter('Saturation') ? signed(levelOf('Saturation')) : r.wizNoColor} />
                  <Slider id="s-contrast" label={LEVELS[3]!.name} icon={LEVELS[3]!.icon} value={levelOf('Contrast')} min={-4} max={4} disabled={!hasParameter('Contrast')} onChange={(v) => setLevel('Contrast', v)} text={signed(levelOf('Contrast'))} />
                  <Slider id="s-key" label={LEVELS[2]!.name} icon={LEVELS[2]!.icon} value={levelOf('ImageKey')} min={-4} max={4} disabled={!hasParameter('ImageKey')} onChange={(v) => setLevel('ImageKey', v)} text={signed(levelOf('ImageKey'))} />
                </>
              ) : (
                <p className="text-sm text-muted-foreground sm:col-span-2">{draft.lookKind === 'effect' ? r.wizStartEffectText : r.wizStartKeptText}</p>
              )}
              <Slider id="s-grain" label={r.grain} icon={Film} value={draft.grain === UNSET ? 0 : Number(draft.grain)} min={0} max={4} onChange={(v) => set('grain', v === 0 ? UNSET : String(v))} text={r.grainLevels[draft.grain === UNSET ? 0 : Number(draft.grain)] ?? ''} />
              <Slider id="s-warmth" label="WB Compensation" icon={Thermometer} value={warmth} min={-7} max={7} disabled={!colorControls || monochrome} onChange={setWarmth} text={shiftText(warmth + MIDDLE, 'B', 'A')} ends={[`B ${r.wizCool}`, `A ${r.wizWarm}`]} />
            </div>

            <Accordion type="single" collapsible>
              <AccordionItem value="advanced" className="border-0">
                <AccordionTrigger className="text-sm">{r.wizAdvanced}</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 pt-2">
                  <Group title={r.lookNative}>
                    <Row label={r.look}>
                      <Pick id="recipe-look" value={draft.lookKind} unset={false} onChange={(next) => set('lookKind', next as Draft['lookKind'])} items={[{ value: 'native', label: r.editLookNative }, { value: 'effect', label: r.editLookEffect }, { value: 'off', label: r.lookOff }, { value: 'kept', label: r.lookKept }]} />
                    </Row>
                    {draft.lookKind === 'effect' && <Row label={r.editEffect}><Pick id="recipe-effect-2" unset={false} value={draft.effect} onChange={(next) => set('effect', next)} items={effects.map(([code, label]) => ({ value: String(code), label }))} /></Row>}
                    {draft.lookKind === 'native' && (
                      <>
                        <Row label={r.editNative}><Pick id="recipe-type-2" unset={false} value={draft.imageType} onChange={(next) => setDraft((d) => ({ ...d, imageType: next, parameters: {} }))} items={typeChoices.map(({ label, index }) => ({ value: String(index), label }))} /></Row>
                        {typeParameters.map((p) => (
                          <Row key={p.key} label={LEVELS.find((level) => level.key === p.key)?.name ?? PARAMETER_NAMES[p.key] ?? p.key} indent>
                            <Pick id={`recipe-${p.key}`} unset={false} value={String(parameterValue(p.key, p.first, p.labels))} onChange={(next) => set('parameters', { ...draft.parameters, [p.key]: Number(next) })} items={p.labels.map((label, i) => ({ value: String(p.first + i), label: labelText(label, r) }))} />
                          </Row>
                        ))}
                      </>
                    )}
                  </Group>
                  <Group title={r.whiteBalance}>
                    <Row label={r.whiteBalance}><Pick id="recipe-wb" value={draft.balance} onChange={(next) => set('balance', next)} items={modeChoices.map(({ label, index }) => ({ value: String(index), label: WB_NAMES[label] ?? label }))} /></Row>
                    {draft.balance !== UNSET && (
                      <>
                        {modeLabel === 'ColorTemp1' && (
                          <Row label={r.editKelvin} indent>
                            <Input id="recipe-kelvin" type="number" min={TEMPERATURE.min} max={TEMPERATURE.max} step={TEMPERATURE.step} value={draft.kelvin} onChange={(event) => set('kelvin', event.target.value)} className="h-8 text-right font-mono text-[14px]" />
                          </Row>
                        )}
                        <Row label={r.editShiftBa} indent><Pick id="recipe-shift-ba" unset={false} value={draft.shiftBa} onChange={(next) => set('shiftBa', next)} items={shiftValues.map((value) => ({ value: String(value), label: shiftText(value, 'B', 'A') }))} /></Row>
                        <Row label={r.editShiftGm} indent><Pick id="recipe-shift-gm" unset={false} value={draft.shiftGm} onChange={(next) => set('shiftGm', next)} items={shiftValues.map((value) => ({ value: String(value), label: shiftText(value, 'G', 'M') }))} /></Row>
                      </>
                    )}
                  </Group>
                  <Group title="GRKU">
                    <Row label={r.grain}><Pick id="recipe-grain" value={draft.grain} onChange={(next) => set('grain', next)} items={levelItems(r.grainLevels)} /></Row>
                    {draft.grain !== UNSET && Number(draft.grain) > 0 && <Row label={r.editGrainSize} indent><Pick id="recipe-grain-size" unset={false} value={draft.grainSize} onChange={(next) => set('grainSize', next)} items={levelItems(r.grainSizes)} /></Row>}
                    <Row label={r.bloom}><Pick id="recipe-bloom" value={draft.bloom} onChange={(next) => set('bloom', next)} items={levelItems(r.glowLevels)} /></Row>
                    <Row label={r.halation}><Pick id="recipe-halation" value={draft.halation} onChange={(next) => set('halation', next)} items={levelItems(r.glowLevels)} /></Row>
                    {!monochrome && draft.halation !== UNSET && Number(draft.halation) > 0 && <Row label={r.editHalationColor} indent><Pick id="recipe-halation-color" value={draft.halationColor} onChange={(next) => set('halationColor', next)} items={levelItems(r.halationColors)} /></Row>}
                  </Group>
                  <Group title={r.corrections}>
                    {CORRECTION_VALUES.map((values, index) => (
                      <Row key={index} label={CORRECTION_NAMES[index] ?? ''}>
                        <Pick id={`recipe-correction-${index}`} value={draft.corrections[index] ?? UNSET} onChange={(next) => set('corrections', draft.corrections.map((value, other) => (other === index ? next : value)))} items={values.map((value, stored) => ({ value: String(stored), label: r.values[value] ?? value }))} />
                      </Row>
                    ))}
                  </Group>
                  <Group title={r.exposure}>
                    <Row label={r.editCompensation}><Pick id="recipe-compensation" value={draft.compensation} onChange={(next) => set('compensation', next)} items={thirds.map((value) => ({ value: String(value), label: compensationText(value) }))} /></Row>
                    <Row label={r.editIsoLimit}><Pick id="recipe-iso" value={draft.isoLimit} onChange={(next) => set('isoLimit', next)} items={isoChoices.map((iso) => ({ value: String(iso), label: `ISO ${iso}` }))} /></Row>
                    <Row label={r.metering}><Pick id="recipe-metering" value={draft.metering} onChange={(next) => set('metering', next)} items={METERINGS.map((value, index) => ({ value, label: r.meterings[index] ?? value }))} /></Row>
                    <Row label={r.nd}><Pick id="recipe-nd" value={draft.nd} onChange={(next) => set('nd', next)} items={NDS.map((value, index) => ({ value, label: r.nds[index] ?? value }))} /></Row>
                  </Group>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-xl border bg-card p-3">
              <span className="w-28 shrink-0 self-start overflow-hidden rounded-lg ring-1 ring-black/20"><RecipePhoto recipe={preview} src={sample} /></span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <label htmlFor="recipe-name" className="text-sm font-medium">{r.editName}</label>
                <Input id="recipe-name" value={draft.name} maxLength={16} placeholder={r.editNamePlaceholder} onChange={(event) => set('name', event.target.value)} autoFocus />
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium text-muted-foreground">{r.wizSummary}</h4>
              <RecipeSheet recipe={preview} r={r} language={language} effectNames={effectNames} compact />
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="ghost" onClick={() => (step === 1 ? onClose() : setStep(step - 1))}>
            {step === 1 ? r.editCancel : r.wizBack}
          </Button>
          {step === 2 && (
            <Button type="button" variant="brand" disabled={!canContinue} onClick={() => setStep(3)}>
              {r.wizNext}
            </Button>
          )}
          {step === 3 && (
            <Button type="button" variant="brand" disabled={busy} onClick={() => void add()}>
              {r.editAdd}
            </Button>
          )}
        </DialogFooter>
        <span className="sr-only">{t.close}</span>
      </DialogContent>
    </Dialog>
  );
}
