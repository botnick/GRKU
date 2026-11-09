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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  lutAccept,
  nameFromFile,
  validCover,
  validName,
  type CoverFields,
  type Input as LutInput,
} from '../import/names';
import { TaskSlot } from '../import/task';
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
  | { state: 'done'; effect: ImportedEffect<LutImport>; full: boolean };

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
export function ImportDialog({ strings: t, baseGamma, taken, onImport, ref }: Props) {
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
  const reading = choice === 'auto' && guessed === null;
  const input: LutInput = choice === 'auto' ? (guessed ?? 'standard') : choice;
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
      setStatus({ state: 'done', effect: imported.value, full });
    } catch (error) {
      console.error(error);
      trackImport(file.name, input, choice !== 'auto', { result: 'failed' });
      setStatus({
        state: 'failed',
        message: error instanceof Error ? error.message : String(error),
      });
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
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg"
      >
        <DialogHeader className="flex-row items-center justify-between gap-4 text-left">
          <DialogTitle>{t.importTitle}</DialogTitle>
          <Button type="button" variant="outline" size="sm" onClick={close}>
            {t.close}
          </Button>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <CoverIcon cover={done.effect.cover} className="size-20" />
              <div className="flex min-w-0 flex-col gap-1 text-sm text-muted-foreground">
                <p className="text-base font-semibold text-foreground">{done.effect.name}</p>
                <p>{t.fitText[done.effect.imported.grade]}</p>
                <p>{t.importUsed(INPUT_NAMES[done.effect.imported.input])}</p>
              </div>
            </div>
            {done.full && <p className="text-sm text-muted-foreground">{t.importUnchecked(MAX_EFFECTS)}</p>}
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
            <p className="text-sm text-muted-foreground">{t.importNote}</p>

            <div className="flex flex-col gap-1.5">
              <Button
                asChild
                variant="outline"
                className={cn(
                  'h-auto min-h-11 w-full justify-start font-normal whitespace-normal',
                  FILE_FOCUS,
                  importing && 'pointer-events-none opacity-50',
                )}
              >
                <label htmlFor={`${ids}-file`} aria-disabled={importing}>
                  <Upload aria-hidden="true" />
                  <span className="min-w-0 truncate">{file?.name ?? t.importFile}</span>
                </label>
              </Button>
              <input
                key={fileKey}
                id={`${ids}-file`}
                className="sr-only"
                type="file"
                accept={lutAccept(hasTouch())}
                disabled={importing}
                onChange={chooseFile}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>

            <CoverFieldset strings={t} editor={coverEditor} disabled={importing} />

            <details className="rounded-lg border border-border px-4 py-3 text-sm">
              <summary className="font-medium">{t.haldSummary}</summary>
              <p className="mt-2 text-muted-foreground">{t.haldNote}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => void saveHaldImage().then(trackHaldImage)}
              >
                {t.haldDownload}
              </Button>
            </details>

            <div aria-live="polite">
              {status.state === 'importing' && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <p>{t.importing}</p>
                  <progress
                    className="h-2 min-w-0 flex-1 appearance-none overflow-hidden rounded-full bg-muted [&::-moz-progress-bar]:bg-foreground [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-foreground"
                    max={1}
                    value={status.fraction}
                    aria-label={t.importing}
                  />
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
              <Button type="submit" variant="brand" disabled={!ready} aria-busy={importing}>
                {t.importButton}
              </Button>
            </DialogFooter>

            <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
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
