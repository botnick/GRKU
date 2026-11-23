import {
  useEffect,
  useId,
  useImperativeHandle,
  useState,
  type ChangeEvent,
  type FormEvent,
  type Ref,
} from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { MAX_EFFECTS, type ImportedEffect, type LutImport } from '../catalog';
import type { Strings } from '../i18n';
import { trackHaldImage, trackImport } from '../analytics';
import { guessInput, importLut, saveHaldImage } from '../import/lut';
import {
  coverFromFile,
  INPUT_NAMES,
  INPUTS,
  isPreset,
  lutAccept,
  nameFromFile,
  validCover,
  validName,
  type CoverFields,
  type Input as LutInput,
} from '../import/names';
import { presetRecipePlan } from '../import/presetRecipe';
import { TaskSlot } from '../import/task';
import { loadWasm } from '../package';
import { newRecipeId, onCount, type Family, type Recipe } from '../recipes';
import { CoverFieldset, useCoverEditor } from './CoverEditor';
import { CoverIcon } from './EffectIcon';

interface Props {
  strings: Strings;
  baseGamma: Uint16Array;
  /** The IDs of the catalog effects and of the earlier imports. */
  taken: ReadonlySet<string>;
  /** Adds the effect to the page. Returns true when the effect stays unchecked because the
   * package already has `MAX_EFFECTS` checked effects. */
  onImport: (effect: ImportedEffect) => boolean;
  /** The camera line of the page, for a recipe from a Lightroom preset. */
  family: Family;
  /** The recipe library of that camera line. */
  recipes: readonly Recipe[];
  /** Adds a recipe to that library. */
  onAddRecipe: (recipe: Recipe) => void;
  ref?: Ref<ImportDialogHandle>;
}

/** Opens the dialog from a button elsewhere on the page. */
export interface ImportDialogHandle {
  open: () => void;
}

type Status =
  | { state: 'idle' }
  /** `fraction`: the progress of the fit, from 0 to 1. */
  | { state: 'importing'; fraction: number }
  | { state: 'failed'; message: string }
  | {
      state: 'done';
      effect: ImportedEffect<LutImport>;
      full: boolean;
      /** A line about the recipe from the preset, or null when none was made. */
      recipeNote: string | null;
    };

/** `auto` uses the input that the LUT data suggests (`guessInput`). */
type InputChoice = 'auto' | LutInput;

const EMPTY_COVER: CoverFields = { brand: 'LUT', name: 'LUT', number: '', band: false };

/** Any touch pointer, not only the primary one, so an iPad with a trackpad still counts. */
const hasTouch = () =>
  typeof window !== 'undefined' && (window.matchMedia?.('(any-pointer: coarse)').matches ?? false);

/** The ring of a file button whose hidden input has the keyboard focus. */
const FILE_FOCUS =
  '[&:has(+input:focus-visible)]:border-ring [&:has(+input:focus-visible)]:ring-[3px] [&:has(+input:focus-visible)]:ring-ring/50';

/**
 * The LUT import dialog. `ref.open()` opens it, so several buttons on the page can open the
 * same dialog. The dialog fits the chosen file into an effect of the page, with a film cover
 * icon that the user can edit, then describes how closely the effect follows the LUT and shows
 * the warnings.
 */
export function ImportDialog({ strings: t, baseGamma, taken, onImport, family, recipes, onAddRecipe, ref }: Props) {
  const ids = useId();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [choice, setChoice] = useState<InputChoice>('auto');
  // The input that the LUT data suggests, or null while the worker reads the file.
  const [guessed, setGuessed] = useState<LutInput | null>('standard');
  const coverEditor = useCoverEditor(EMPTY_COVER);
  const { cover } = coverEditor;
  const [status, setStatus] = useState<Status>({ state: 'idle' });
  // On by default: a Lightroom preset also adds a recipe with its exposure, grain, and white balance.
  const [addRecipe, setAddRecipe] = useState(true);
  // A new key empties the file input for the next import.
  const [fileKey, setFileKey] = useState(0);
  // Only the newest guess, fit, and cover check change the dialog.
  const [guess] = useState(() => new TaskSlot());
  const [fit] = useState(() => new TaskSlot());
  // An unmount stops a running guess and fit, as a new photo stops a RAW decode.
  useEffect(
    () => () => {
      fit.cancel();
      guess.cancel();
    },
    [fit, guess],
  );

  const importing = status.state === 'importing';
  const preset = file !== null && isPreset(file.name);
  // A preset has no input encoding: the fit always uses Standard.
  const reading = !preset && choice === 'auto' && guessed === null;
  const input: LutInput = preset ? 'standard' : choice === 'auto' ? (guessed ?? 'standard') : choice;
  const badName = file !== null && !validName(name);
  const ready =
    file !== null &&
    validName(name) &&
    validCover(cover) &&
    coverEditor.error === null &&
    !reading &&
    !importing;

  function reset() {
    setFile(null);
    setName('');
    setChoice('auto');
    guess.cancel();
    setGuessed('standard');
    coverEditor.cancel();
    void coverEditor.show(EMPTY_COVER);
    setStatus({ state: 'idle' });
    setAddRecipe(true);
    setFileKey((key) => key + 1);
  }

  function openDialog() {
    if (status.state === 'done' || status.state === 'failed') reset();
    setOpen(true);
  }

  useImperativeHandle(ref, () => ({ open: openDialog }));

  function close() {
    fit.cancel();
    if (importing) setStatus({ state: 'idle' });
    setOpen(false);
  }

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0] ?? null;
    setFile(chosen);
    setStatus({ state: 'idle' });
    if (!chosen) {
      guess.cancel();
      setGuessed('standard');
      return;
    }
    setName(nameFromFile(chosen.name));
    void fillCover(coverFromFile(chosen.name));
    // A preset has no input to guess: it imports over Standard.
    if (isPreset(chosen.name)) {
      guess.cancel();
      setGuessed('standard');
      return;
    }
    setGuessed(null);
    try {
      const found = await guess.run((signal) => guessInput(chosen, baseGamma, signal));
      if (found.current) setGuessed(found.value);
    } catch (error) {
      // A file that cannot be read fails again at the import, with the reason.
      setGuessed('standard');
      console.error(error);
    }
  }

  /**
   * Shows a cover from a file name. A number that the camera cannot draw is left out, or it
   * becomes the film name when the name is only the placeholder.
   */
  async function fillCover(fields: CoverFields) {
    const checked = await coverEditor.show(fields);
    if (fields.number === '' || !checked.current || checked.value === null) return;
    const withoutNumber = { ...fields, number: '' };
    if (fields.name !== EMPTY_COVER.name) {
      void coverEditor.show(withoutNumber);
      return;
    }
    const numberAsName = { ...fields, name: fields.number, number: '' };
    const fits = await coverEditor.probe(numberAsName);
    if (fits.current) void coverEditor.show(fits.value === null ? numberAsName : withoutNumber);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready || !file) return;
    setStatus({ state: 'importing', fraction: 0 });
    try {
      const imported = await fit.run((signal) =>
        importLut(file, name, input, cover, baseGamma, taken, signal, (fraction) => {
          if (!signal.aborted) setStatus({ state: 'importing', fraction });
        }),
      );
      if (!imported.current) return;
      const { grade, warnings } = imported.value.imported;
      trackImport(file.name, input, choice !== 'auto', {
        result: 'ok',
        grade,
        warnings: warnings.length,
      });
      const full = onImport(imported.value);
      const recipeNote = await addPresetRecipe(imported.value, addRecipe);
      setStatus({ state: 'done', effect: imported.value, full, recipeNote });
    } catch (error) {
      console.error(error);
      trackImport(file.name, input, choice !== 'auto', { result: 'failed' });
      setStatus({
        state: 'failed',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Adds a recipe from the hints of a preset when the box is on, and returns the line for the
   * done view. Returns null without hints, with the box off, or when the hints make no recipe.
   */
  async function addPresetRecipe(effect: ImportedEffect<LutImport>, wanted: boolean): Promise<string | null> {
    const hints = effect.imported.hints;
    if (!wanted || !hints || !isPreset(effect.imported.source)) return null;
    try {
      const { recipeFromPreset } = await loadWasm();
      const text = recipeFromPreset(hints, family, effect.name, effect.id);
      if (text == null) return null;
      const recipe = JSON.parse(text) as Recipe;
      const plan = presetRecipePlan(true, true, recipes.length, onCount(recipes));
      if (plan === 'full') return t.importRecipeFull;
      onAddRecipe({
        ...recipe,
        id: newRecipeId(new Set(recipes.map((item) => item.id))),
        enabled: plan === 'add',
        hidden: false,
        name: effect.name,
      });
      return t.importRecipeAdded(effect.name);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  function inputLabel(item: LutInput): string {
    if (item === 'standard') return t.inputStandard;
    if (item === 'srgb') return t.inputSrgb;
    return INPUT_NAMES[item];
  }

  const autoLabel = guessed === null ? t.inputAutoReading : t.inputAuto(INPUT_NAMES[guessed]);
  const choiceLabel = choice === 'auto' ? autoLabel : inputLabel(choice);
  const done = status.state === 'done' ? status : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">{t.importTitle}</DialogTitle>
          <DialogDescription>{t.importNote}</DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <CoverIcon cover={done.effect.cover} className="size-20" />
              <div className="flex min-w-0 flex-col gap-1 text-sm text-muted-foreground">
                <p className="text-base font-semibold text-foreground">{done.effect.name}</p>
                <p>{t.fitText[done.effect.imported.grade]}</p>
                {!isPreset(done.effect.imported.source) && <p>{t.importUsed(INPUT_NAMES[done.effect.imported.input])}</p>}
              </div>
            </div>
            {done.full && <p className="text-sm text-muted-foreground">{t.importUnchecked(MAX_EFFECTS)}</p>}
            {done.recipeNote && <p className="text-sm text-muted-foreground">{done.recipeNote}</p>}
            {done.effect.imported.warnings.length > 0 && (
              <div className="flex flex-col gap-2 rounded-lg border border-border p-4 text-sm">
                <p className="font-medium text-destructive">{t.importWarnings}</p>
                <ul className="flex list-disc flex-col gap-1 pl-5 leading-relaxed">
                  {done.effect.imported.warnings.map((warning) => (
                    <li key={warning} lang="en">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={reset}>
                {t.importAnother}
              </Button>
              <Button type="button" variant="brand" onClick={close}>
                {t.done}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form className="flex flex-col gap-5" onSubmit={submit}>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={`${ids}-file`}
                aria-disabled={importing}
                className={cn(
                  'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-card/60 px-4 py-6 text-center transition-colors hover:border-foreground/40 hover:bg-accent/40',
                  FILE_FOCUS,
                  file && 'border-solid border-foreground/40',
                  importing && 'pointer-events-none opacity-50',
                )}
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-muted text-foreground" aria-hidden="true">
                  <Upload className="size-4" />
                </span>
                <span className="max-w-full truncate text-sm font-medium">{file?.name ?? t.importFile}</span>
                {file && <span className="text-xs text-muted-foreground">{t.importFile}</span>}
              </label>
              <input
                key={fileKey}
                id={`${ids}-file`}
                className="sr-only"
                type="file"
                accept={lutAccept(hasTouch())}
                disabled={importing}
                onChange={chooseFile}
              />
              {preset && <p className="text-sm text-muted-foreground">{t.importPresetNote}</p>}
            </div>

            {preset && (
              <div className="flex items-start gap-2">
                <Checkbox
                  id={`${ids}-recipe`}
                  className="mt-0.5"
                  checked={addRecipe}
                  disabled={importing}
                  onCheckedChange={(value) => setAddRecipe(value === true)}
                />
                <Label htmlFor={`${ids}-recipe`} className="leading-snug font-normal">
                  {t.importPresetRecipe}
                </Label>
              </div>
            )}

            <div className={cn('grid gap-4', !preset && 'sm:grid-cols-2')}>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${ids}-name`}>{t.importName}</Label>
                <Input
                  id={`${ids}-name`}
                  type="text"
                  value={name}
                  maxLength={16}
                  disabled={importing}
                  aria-invalid={badName}
                  aria-describedby={badName ? `${ids}-name-note` : undefined}
                  onChange={(event) => setName(event.target.value)}
                />
                {badName && (
                  <p id={`${ids}-name-note`} className="text-sm text-destructive">
                    {t.importNameNote}
                  </p>
                )}
              </div>
              {!preset && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${ids}-input`}>{t.importInput}</Label>
                <Select
                  value={choice}
                  disabled={importing}
                  onValueChange={(value) => setChoice(value as InputChoice)}
                >
                  <SelectTrigger id={`${ids}-input`} className="w-full">
                    <SelectValue>{choiceLabel}</SelectValue>
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="auto">{autoLabel}</SelectItem>
                    {INPUTS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {inputLabel(item)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {choice === 'auto' && guessed !== null && (
                  <p className="text-sm text-muted-foreground">
                    {guessed === 'standard' ? t.inputAutoStandard : t.inputAutoLog}
                  </p>
                )}
              </div>
              )}
            </div>

            <CoverFieldset strings={t} editor={coverEditor} disabled={importing} />

            <Accordion type="single" collapsible className="rounded-xl border px-4">
              <AccordionItem value="hald" className="border-b-0">
                <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">{t.haldSummary}</AccordionTrigger>
                <AccordionContent className="flex flex-col items-start gap-3 text-sm text-muted-foreground">
                  <p>{t.haldNote}</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => void saveHaldImage().then(trackHaldImage)}>
                    {t.haldDownload}
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div aria-live="polite">
              {status.state === 'importing' && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <p className="shrink-0">{t.importing}</p>
                  <Progress value={status.fraction * 100} className="h-1.5 flex-1" aria-label={t.importing} />
                  <span className="tabular-nums">{Math.round(status.fraction * 100)}%</span>
                </div>
              )}
              {status.state === 'failed' && (
                <p className="text-sm text-destructive">
                  {t.importError} {status.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>
                {t.cancel}
              </Button>
              <Button type="submit" variant="brand" disabled={!ready} aria-busy={importing}>
                {t.importButton}
              </Button>
            </DialogFooter>

            <div className="flex flex-col gap-2 rounded-xl bg-muted/50 p-4 text-[13px] leading-relaxed text-muted-foreground">
              <p>
                <strong className="font-semibold text-foreground">{t.importHowTitle}</strong> {t.importHow}
              </p>
              <p>
                <strong className="font-semibold text-foreground">{t.importLimitsTitle}</strong> {t.importLimits}
              </p>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
