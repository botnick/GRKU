import { useMemo, useState, type ReactNode } from 'react';
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
import { encodeLibrary, type Family, type Metering, type Nd, type Recipe } from '../recipes';

/** The value of the option that leaves a setting to the camera. */
const UNSET = 'unset';

/** The nine levels at 0: the type as the camera has it. */
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

/** A level label of the camera (M4 to P4) as the camera menu shows it (-4 to +4); other labels as they are. */
function labelText(label: string, r: RecipeStrings): string {
  const level = /^([MP])(\d)$/.exec(label);
  if (level) return `${level[1] === 'M' ? '-' : '+'}${level[2]}`;
  if (label === 'OFF') return r.values.Off ?? label;
  return r.values[label] ?? r.values[label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()] ?? label;
}

const METERINGS: readonly Metering[] = ['multi', 'center', 'spot', 'highlight'];
const NDS: readonly Nd[] = ['off', 'on', 'auto'];

/** The parameters of a type that the editor does not show: the camera sets them with the grain. */
const HIDDEN_PARAMETERS = new Set(['ParticleStrength']);

/**
 * A form that makes a recipe, laid out as the camera menu is: Image Control with the parameters
 * of the chosen type, White Balance, then the GRKU Grain and Glow, the corrections, and the
 * exposure settings. Each setting stays with the camera until it is set. The camera tables of the
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
  const middle = String((SHIFT_STEPS - 1) / 2);
  const [name, setName] = useState('');
  const [lookKind, setLookKind] = useState<'kept' | 'off' | 'effect' | 'native'>('native');
  const [effect, setEffect] = useState<string>(UNSET);
  const [imageType, setImageType] = useState<string>(UNSET);
  /** The stored value of each parameter of the type, by key. */
  const [parameters, setParameters] = useState<Record<string, number>>({});
  const [grain, setGrain] = useState<string>(UNSET);
  const [grainSize, setGrainSize] = useState('0');
  const [bloom, setBloom] = useState<string>(UNSET);
  const [halation, setHalation] = useState<string>(UNSET);
  const [halationColor, setHalationColor] = useState<string>(UNSET);
  const [balance, setBalance] = useState<string>(UNSET);
  const [shiftBa, setShiftBa] = useState(middle);
  const [shiftGm, setShiftGm] = useState(middle);
  const [kelvin, setKelvin] = useState('5500');
  const [corrections, setCorrections] = useState<string[]>(CORRECTION_VALUES.map(() => UNSET));
  const [compensation, setCompensation] = useState<string>(UNSET);
  const [isoLimit, setIsoLimit] = useState<string>(UNSET);
  const [metering, setMetering] = useState<string>(UNSET);
  const [nd, setNd] = useState<string>(UNSET);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const typeNames = TYPE_NAMES[language] ?? TYPE_NAMES.en ?? [];
  const typeChoices = typeNames
    .map((label, index) => ({ label, index }))
    .filter(({ index }) => TYPE_FAMILIES[index]?.[column] && (TYPE_MONOCHROME[index] ?? false) === monochrome);
  const typeParameters = useMemo(
    () => (imageType === UNSET ? [] : (TYPE_PARAMETERS[Number(imageType)]?.[column] ?? [])).filter((p) => !HIDDEN_PARAMETERS.has(p.key)),
    [imageType, column],
  );
  const effects = [...effectNames.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  const modeChoices = WHITE_BALANCE_MODES.map((labels, index) => ({ label: labels[column], index })).filter(
    (mode): mode is { label: string; index: number } => mode.label !== null,
  );
  const modeLabel = balance === UNSET ? null : (WHITE_BALANCE_MODES[Number(balance)]?.[column] ?? null);
  const shiftValues = [...Array(SHIFT_STEPS).keys()];
  const thirds = [...Array(2 * EXPOSURE_THIRDS_MAX + 1).keys()].map((i) => i - EXPOSURE_THIRDS_MAX);
  const isoChoices = ISO_STEPS.filter((iso) => iso <= ISO_MAX[family === 'gr3' ? 'gr3' : 'gr4']);

  /** The stored value of a parameter: the one set, else the first label ("0" of a level, or the first choice). */
  const parameterValue = (key: string, first: number, labels: readonly string[]) => {
    if (key in parameters) return parameters[key]!;
    const zero = labels.indexOf('OFF');
    return key.startsWith('ColorTone') || key === 'FilterEffectCustom' || key === 'SolarizationType' ? first : zero >= 0 && /^M\d$/.test(labels[0] ?? '') ? first + zero : first;
  };

  function recipe(): Recipe {
    let look: Recipe['look'];
    if (lookKind === 'effect') look = { kind: 'effect', code: Number(effect), adjustments: PLAIN_LEVELS };
    else if (lookKind === 'native') {
      const value = (key: string) => {
        const p = typeParameters.find((item) => item.key === key);
        return p ? parameterValue(key, p.first, p.labels) : 0;
      };
      const levels = LEVEL_KEYS.map((key) => (typeParameters.some((p) => p.key === key) ? value(key) : 4));
      const toneKey = typeParameters.find((p) => p.key.startsWith('ColorTone'))?.key;
      look = {
        kind: 'native',
        imageType: Number(imageType),
        levels,
        tone: toneKey ? value(toneKey) : 0,
        intensity: value('HdrIntense'),
        filter: value('FilterEffectCustom'),
        grainStrength: value('Particle'),
        grainSize: value('Particle') ? value('ParticleSize') : 0,
        solarization: value('SolarizationType'),
      };
    } else look = { kind: lookKind };
    const glowSet = bloom !== UNSET || halation !== UNSET;
    return {
      name: name.trim(),
      family,
      look,
      grain: grain === UNSET ? null : { level: Number(grain), size: Number(grain) === 0 ? 0 : Number(grainSize) },
      glow: glowSet
        ? {
            bloom: bloom === UNSET ? 0 : Number(bloom),
            halation: halation === UNSET ? 0 : Number(halation),
            halationColor: monochrome || halationColor === UNSET ? null : Number(halationColor),
          }
        : null,
      whiteBalance:
        balance === UNSET
          ? null
          : {
              mode: Number(balance),
              shiftBa: Number(shiftBa),
              shiftGm: Number(shiftGm),
              kelvin: Math.min(TEMPERATURE.max, Math.max(TEMPERATURE.min, Math.round(Number(kelvin) / TEMPERATURE.step) * TEMPERATURE.step)),
            },
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
      await encodeLibrary([next], ['keep', 'keep', 'keep']);
      onAdd(next);
      onClose();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setBusy(false);
    }
  }

  /** A row of the menu: the name left, the value right, as the camera draws its settings. */
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
  const levelItems = (labels: readonly string[]) => labels.map((label, index) => ({ value: String(index), label }));

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{r.newRecipe}</DialogTitle>
          <DialogDescription>{r.editHint}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="recipe-name" className="text-sm font-medium">
              {r.editName}
            </label>
            <Input id="recipe-name" value={name} maxLength={16} placeholder={r.editNamePlaceholder} onChange={(event) => setName(event.target.value)} />
          </div>

          <Group title={r.lookNative}>
            <Row label={r.look}>
              <Pick
                id="recipe-look"
                value={lookKind}
                onChange={(next) => setLookKind(next as typeof lookKind)}
                unset={false}
                items={[
                  { value: 'native', label: r.editLookNative },
                  { value: 'effect', label: r.editLookEffect },
                  { value: 'off', label: r.lookOff },
                  { value: 'kept', label: r.lookKept },
                ]}
              />
            </Row>
            {lookKind === 'effect' && (
              <Row label={r.editEffect}>
                <Pick id="recipe-effect" value={effect} onChange={setEffect} unset={false} items={effects.map(([code, label]) => ({ value: String(code), label }))} />
              </Row>
            )}
            {lookKind === 'native' && (
              <>
                <Row label={r.editNative}>
                  <Pick
                    id="recipe-type"
                    value={imageType}
                    unset={false}
                    onChange={(next) => {
                      setImageType(next);
                      setParameters({});
                    }}
                    items={typeChoices.map(({ label, index }) => ({ value: String(index), label }))}
                  />
                </Row>
                {typeParameters.map((p) => (
                  <Row key={p.key} label={r.levels[p.key] ?? r.parameters[p.key] ?? p.key} indent>
                    <Pick
                      id={`recipe-${p.key}`}
                      unset={false}
                      value={String(parameterValue(p.key, p.first, p.labels))}
                      onChange={(next) => setParameters({ ...parameters, [p.key]: Number(next) })}
                      items={p.labels.map((label, i) => ({ value: String(p.first + i), label: labelText(label, r) }))}
                    />
                  </Row>
                ))}
              </>
            )}
          </Group>

          <Group title={r.whiteBalance}>
            <Row label={r.whiteBalance}>
              <Pick id="recipe-wb" value={balance} onChange={setBalance} items={modeChoices.map(({ label, index }) => ({ value: String(index), label: r.modes[label] ?? label }))} />
            </Row>
            {balance !== UNSET && (
              <>
                {modeLabel === 'ColorTemp1' && (
                  <Row label={r.editKelvin} indent>
                    <Input
                      id="recipe-kelvin"
                      type="number"
                      min={TEMPERATURE.min}
                      max={TEMPERATURE.max}
                      step={TEMPERATURE.step}
                      value={kelvin}
                      onChange={(event) => setKelvin(event.target.value)}
                      className="h-8 text-right font-mono text-[14px]"
                    />
                  </Row>
                )}
                <Row label={r.editShiftBa} indent>
                  <Pick id="recipe-shift-ba" value={shiftBa} onChange={setShiftBa} unset={false} items={shiftValues.map((value) => ({ value: String(value), label: shiftText(value, 'B', 'A') }))} />
                </Row>
                <Row label={r.editShiftGm} indent>
                  <Pick id="recipe-shift-gm" value={shiftGm} onChange={setShiftGm} unset={false} items={shiftValues.map((value) => ({ value: String(value), label: shiftText(value, 'G', 'M') }))} />
                </Row>
              </>
            )}
          </Group>

          <Group title="GRKU">
            <Row label={r.grain}>
              <Pick id="recipe-grain" value={grain} onChange={setGrain} items={levelItems(r.grainLevels)} />
            </Row>
            {grain !== UNSET && Number(grain) > 0 && (
              <Row label={r.editGrainSize} indent>
                <Pick id="recipe-grain-size" value={grainSize} onChange={setGrainSize} unset={false} items={levelItems(r.grainSizes)} />
              </Row>
            )}
            <Row label={r.bloom}>
              <Pick id="recipe-bloom" value={bloom} onChange={setBloom} items={levelItems(r.glowLevels)} />
            </Row>
            <Row label={r.halation}>
              <Pick id="recipe-halation" value={halation} onChange={setHalation} items={levelItems(r.glowLevels)} />
            </Row>
            {!monochrome && halation !== UNSET && Number(halation) > 0 && (
              <Row label={r.editHalationColor} indent>
                <Pick id="recipe-halation-color" value={halationColor} onChange={setHalationColor} items={levelItems(r.halationColors)} />
              </Row>
            )}
          </Group>

          <Group title={r.corrections}>
            {CORRECTION_VALUES.map((values, index) => (
              <Row key={index} label={r.correctionNames[index] ?? ''}>
                <Pick
                  id={`recipe-correction-${index}`}
                  value={corrections[index] ?? UNSET}
                  onChange={(next) => setCorrections(corrections.map((value, other) => (other === index ? next : value)))}
                  items={values.map((value, stored) => ({ value: String(stored), label: r.values[value] ?? value }))}
                />
              </Row>
            ))}
          </Group>

          <Group title={r.exposure}>
            <Row label={r.editCompensation}>
              <Pick id="recipe-compensation" value={compensation} onChange={setCompensation} items={thirds.map((value) => ({ value: String(value), label: compensationText(value) }))} />
            </Row>
            <Row label={r.editIsoLimit}>
              <Pick id="recipe-iso" value={isoLimit} onChange={setIsoLimit} items={isoChoices.map((iso) => ({ value: String(iso), label: `ISO ${iso}` }))} />
            </Row>
            <Row label={r.metering}>
              <Pick id="recipe-metering" value={metering} onChange={setMetering} items={METERINGS.map((value, index) => ({ value, label: r.meterings[index] ?? value }))} />
            </Row>
            <Row label={r.nd}>
              <Pick id="recipe-nd" value={nd} onChange={setNd} items={NDS.map((value, index) => ({ value, label: r.nds[index] ?? value }))} />
            </Row>
          </Group>
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
