import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CORRECTION_VALUES,
  EXPOSURE_THIRDS_MAX,
  ISO_MAX,
  ISO_STEPS,
  SHIFT_STEPS,
  TEMPERATURE,
  TYPE_FAMILIES,
  TYPE_MONOCHROME,
  TYPE_NAMES,
  WHITE_BALANCE_MODES,
} from '../generated/recipes';
import type { Language, Strings } from '../i18n';
import type { RecipeStrings } from '../recipeStrings';
import { encodeLibrary, type Family, type Metering, type Nd, type Recipe } from '../recipes';

/** The value of the option that leaves a setting to the camera. */
const UNSET = 'unset';

/** A level as the camera shows it: stored 0 to 8 is -4 to +4. Nine levels, all 0: the type as the camera has it. */
const PLAIN_LEVELS = [4, 4, 4, 4, 4, 4, 4, 4, 4];

/** An exposure compensation in thirds of a stop, such as +1 1/3 EV. */
function compensationText(thirds: number): string {
  const sign = thirds > 0 ? '+' : thirds < 0 ? '-' : '±';
  const whole = Math.floor(Math.abs(thirds) / 3);
  const rest = Math.abs(thirds) % 3;
  const value = [whole || (rest ? '' : '0'), rest ? `${rest}/3` : ''].filter(Boolean).join(' ');
  return `${sign}${value} EV`;
}

/** A white balance shift as the camera shows it: B7 to A7, or G7 to M7, with 0 in the middle. */
const shiftText = (stored: number, minus: string, plus: string) => {
  const middle = (SHIFT_STEPS - 1) / 2;
  return stored === middle ? '0' : stored < middle ? `${minus}${middle - stored}` : `${plus}${stored - middle}`;
};

const METERINGS: readonly Metering[] = ['multi', 'center', 'spot', 'highlight'];
const NDS: readonly Nd[] = ['off', 'on', 'auto'];

/**
 * A form that makes a recipe: the look, Grain, Glow, the white balance, the corrections, and the
 * exposure settings, each one left to the camera when it is not set. The camera tables of the
 * library (`encodeLibrary`) check the recipe before it joins.
 */
export function RecipeEditor({
  strings: t,
  r,
  language,
  family,
  effectNames,
  open,
  onClose,
  onAdd,
}: {
  strings: Strings;
  r: RecipeStrings;
  language: Language;
  family: Family;
  /** The names of the effects of the catalog and of the imports, by their recipe code. */
  effectNames: ReadonlyMap<number, string>;
  open: boolean;
  onClose: () => void;
  onAdd: (recipe: Recipe) => void;
}) {
  const monochrome = family === 'gr4Monochrome';
  const column = family === 'gr3' ? 0 : 1;
  const [name, setName] = useState('');
  const [lookKind, setLookKind] = useState<'kept' | 'off' | 'effect' | 'native'>('kept');
  const [effect, setEffect] = useState<string>(UNSET);
  const [imageType, setImageType] = useState<string>(UNSET);
  const [grain, setGrain] = useState<string>(UNSET);
  const [grainSize, setGrainSize] = useState('0');
  const [glow, setGlow] = useState<string>(UNSET);
  const [bloom, setBloom] = useState('0');
  const [halation, setHalation] = useState('0');
  const [halationColor, setHalationColor] = useState<string>(UNSET);
  const [balance, setBalance] = useState<string>(UNSET);
  const [shiftBa, setShiftBa] = useState(String((SHIFT_STEPS - 1) / 2));
  const [shiftGm, setShiftGm] = useState(String((SHIFT_STEPS - 1) / 2));
  const [kelvin, setKelvin] = useState('5500');
  const [corrections, setCorrections] = useState<string[]>(CORRECTION_VALUES.map(() => UNSET));
  const [compensation, setCompensation] = useState<string>(UNSET);
  const [isoLimit, setIsoLimit] = useState<string>(UNSET);
  const [metering, setMetering] = useState<string>(UNSET);
  const [nd, setNd] = useState<string>(UNSET);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const types = TYPE_NAMES[language] ?? TYPE_NAMES.en ?? [];
  const typeChoices = types
    .map((label, index) => ({ label, index }))
    .filter(({ index }) => TYPE_FAMILIES[index]?.[column] && (TYPE_MONOCHROME[index] ?? false) === monochrome);
  const effects = [...effectNames.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  const modeChoices = WHITE_BALANCE_MODES.map((labels, index) => ({ label: labels[column], index })).filter(
    (mode): mode is { label: string; index: number } => mode.label !== null,
  );
  const modeLabel = balance === UNSET ? null : (WHITE_BALANCE_MODES[Number(balance)]?.[column] ?? null);
  const shiftValues = [...Array(SHIFT_STEPS).keys()];
  const thirds = [...Array(2 * EXPOSURE_THIRDS_MAX + 1).keys()].map((i) => i - EXPOSURE_THIRDS_MAX);
  const isoChoices = ISO_STEPS.filter((iso) => iso <= ISO_MAX[family === 'gr3' ? 'gr3' : 'gr4']);

  function recipe(): Recipe {
    const look: Recipe['look'] =
      lookKind === 'effect'
        ? { kind: 'effect', code: Number(effect), adjustments: PLAIN_LEVELS }
        : lookKind === 'native'
          ? { kind: 'native', imageType: Number(imageType), levels: PLAIN_LEVELS, tone: 0, intensity: 0, filter: 0, grainStrength: 0, grainSize: 0, solarization: 0 }
          : { kind: lookKind };
    return {
      name: name.trim(),
      family,
      look,
      grain: grain === UNSET ? null : { level: Number(grain), size: Number(grain) === 0 ? 0 : Number(grainSize) },
      glow:
        glow === UNSET
          ? null
          : { bloom: Number(bloom), halation: Number(halation), halationColor: monochrome || halationColor === UNSET ? null : Number(halationColor) },
      whiteBalance:
        balance === UNSET
          ? null
          : { mode: Number(balance), shiftBa: Number(shiftBa), shiftGm: Number(shiftGm), kelvin: Math.round(Number(kelvin) / TEMPERATURE.step) * TEMPERATURE.step },
      corrections: corrections.map((value) => (value === UNSET ? null : Number(value))),
      exposure: {
        compensation: compensation === UNSET ? null : Number(compensation),
        isoLimit: isoLimit === UNSET ? null : Number(isoLimit),
        metering: metering === UNSET ? null : (metering as Metering),
        nd: nd === UNSET ? null : (nd as Nd),
      },
      enabled: true,
      hidden: false,
      number: 0,
      id: 0,
    };
  }

  async function add() {
    if (lookKind === 'effect' && effect === UNSET) return setError(r.editEffect);
    if (lookKind === 'native' && imageType === UNSET) return setError(r.editNative);
    setBusy(true);
    setError(null);
    const next = recipe();
    try {
      // The camera tables check each value, as a card write would.
      await encodeLibrary([next], ['keep', 'keep', 'keep']);
      onAdd(next);
      onClose();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setBusy(false);
    }
  }

  const field = 'flex flex-col gap-1.5';
  const unsetItem = <SelectItem value={UNSET}>{r.editNotSet}</SelectItem>;
  const select = (id: string, value: string, onChange: (next: string) => void, items: readonly { value: string; label: string }[], unset = true) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full bg-background">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {unset && unsetItem}
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
  const levelItems = (labels: readonly string[]) => labels.map((label, index) => ({ value: String(index), label }));

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{r.newRecipe}</DialogTitle>
          <DialogDescription>{r.editHint}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className={`${field} sm:col-span-2`}>
            <Label htmlFor="recipe-name">{r.editName}</Label>
            <Input id="recipe-name" value={name} maxLength={16} placeholder={r.editNamePlaceholder} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className={field}>
            <Label htmlFor="recipe-look">{r.editLook}</Label>
            {select(
              'recipe-look',
              lookKind,
              (next) => setLookKind(next as typeof lookKind),
              [
                { value: 'kept', label: r.lookKept },
                { value: 'off', label: r.lookOff },
                { value: 'effect', label: r.editLookEffect },
                { value: 'native', label: r.editLookNative },
              ],
              false,
            )}
          </div>
          {lookKind === 'effect' && (
            <div className={field}>
              <Label htmlFor="recipe-effect">{r.editEffect}</Label>
              {select('recipe-effect', effect, setEffect, effects.map(([code, label]) => ({ value: String(code), label })), false)}
            </div>
          )}
          {lookKind === 'native' && (
            <div className={field}>
              <Label htmlFor="recipe-type">{r.editNative}</Label>
              {select('recipe-type', imageType, setImageType, typeChoices.map(({ label, index }) => ({ value: String(index), label })), false)}
            </div>
          )}
          <div className={field}>
            <Label htmlFor="recipe-grain">{r.grain}</Label>
            {select('recipe-grain', grain, setGrain, levelItems(r.grainLevels))}
          </div>
          {grain !== UNSET && Number(grain) > 0 && (
            <div className={field}>
              <Label htmlFor="recipe-grain-size">{r.editGrainSize}</Label>
              {select('recipe-grain-size', grainSize, setGrainSize, levelItems(r.grainSizes), false)}
            </div>
          )}
          <div className={field}>
            <Label htmlFor="recipe-glow">{r.bloom} · {r.halation}</Label>
            {select('recipe-glow', glow, setGlow, [{ value: 'set', label: r.glowLevels.slice(1).join(' / ') }])}
          </div>
          {glow !== UNSET && (
            <>
              <div className={field}>
                <Label htmlFor="recipe-bloom">{r.bloom}</Label>
                {select('recipe-bloom', bloom, setBloom, levelItems(r.glowLevels), false)}
              </div>
              <div className={field}>
                <Label htmlFor="recipe-halation">{r.halation}</Label>
                {select('recipe-halation', halation, setHalation, levelItems(r.glowLevels), false)}
              </div>
              {!monochrome && Number(halation) > 0 && (
                <div className={field}>
                  <Label htmlFor="recipe-halation-color">{r.editHalationColor}</Label>
                  {select('recipe-halation-color', halationColor, setHalationColor, levelItems(r.halationColors))}
                </div>
              )}
            </>
          )}
          <div className={field}>
            <Label htmlFor="recipe-wb">{r.whiteBalance}</Label>
            {select('recipe-wb', balance, setBalance, modeChoices.map(({ label, index }) => ({ value: String(index), label: r.modes[label] ?? label })))}
          </div>
          {balance !== UNSET && (
            <>
              {modeLabel === 'ColorTemp1' && (
                <div className={field}>
                  <Label htmlFor="recipe-kelvin">{r.editKelvin}</Label>
                  <Input id="recipe-kelvin" type="number" min={TEMPERATURE.min} max={TEMPERATURE.max} step={TEMPERATURE.step} value={kelvin} onChange={(event) => setKelvin(event.target.value)} />
                </div>
              )}
              <div className={field}>
                <Label htmlFor="recipe-shift-ba">{r.editShiftBa}</Label>
                {select('recipe-shift-ba', shiftBa, setShiftBa, shiftValues.map((value) => ({ value: String(value), label: shiftText(value, 'B', 'A') })), false)}
              </div>
              <div className={field}>
                <Label htmlFor="recipe-shift-gm">{r.editShiftGm}</Label>
                {select('recipe-shift-gm', shiftGm, setShiftGm, shiftValues.map((value) => ({ value: String(value), label: shiftText(value, 'G', 'M') })), false)}
              </div>
            </>
          )}
          {CORRECTION_VALUES.map((values, index) => (
            <div key={index} className={field}>
              <Label htmlFor={`recipe-correction-${index}`}>{r.correctionNames[index] ?? ''}</Label>
              {select(
                `recipe-correction-${index}`,
                corrections[index] ?? UNSET,
                (next) => setCorrections(corrections.map((value, other) => (other === index ? next : value))),
                values.map((value, stored) => ({ value: String(stored), label: r.values[value] ?? value })),
              )}
            </div>
          ))}
          <div className={field}>
            <Label htmlFor="recipe-compensation">{r.editCompensation}</Label>
            {select('recipe-compensation', compensation, setCompensation, thirds.map((value) => ({ value: String(value), label: compensationText(value) })))}
          </div>
          <div className={field}>
            <Label htmlFor="recipe-iso">{r.editIsoLimit}</Label>
            {select('recipe-iso', isoLimit, setIsoLimit, isoChoices.map((iso) => ({ value: String(iso), label: `ISO ${iso}` })))}
          </div>
          <div className={field}>
            <Label htmlFor="recipe-metering">{r.metering}</Label>
            {select('recipe-metering', metering, setMetering, METERINGS.map((value, index) => ({ value, label: r.meterings[index] ?? value })))}
          </div>
          <div className={field}>
            <Label htmlFor="recipe-nd">{r.nd}</Label>
            {select('recipe-nd', nd, setNd, NDS.map((value, index) => ({ value, label: r.nds[index] ?? value })))}
          </div>
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {r.editCancel}
          </Button>
          <Button type="button" variant="brand" disabled={busy} onClick={() => void add()}>
            {r.editAdd}
          </Button>
        </DialogFooter>
        <span className="sr-only">{t.close}</span>
      </DialogContent>
    </Dialog>
  );
}
