import { useId, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Strings } from '../i18n';
import { coverProblem } from '../import/lut';
import { coverIcon, validCover, validCoverText, type CoverFields } from '../import/names';
import { TaskSlot, type TaskResult } from '../import/task';
import { CoverIcon } from './EffectIcon';

/** The cover fields of an effect and why the camera cannot draw them (`coverProblem`). */
export interface CoverEditor {
  cover: CoverFields;
  /** Why the camera cannot draw the cover, or null while it can or while the check runs. */
  error: string | null;
  /** Sets the cover and checks that the camera can draw it. */
  show: (next: CoverFields) => Promise<TaskResult<string | null>>;
  /** Checks other fields without showing them. A later check or edit replaces this one. */
  probe: (fields: CoverFields) => Promise<TaskResult<string | null>>;
  /** Stops the running check. */
  cancel: () => void;
}

/** The state of a cover editor that starts with `initial`. Only the newest check changes it. */
export function useCoverEditor(initial: CoverFields): CoverEditor {
  const [cover, setCover] = useState<CoverFields>(initial);
  const [error, setError] = useState<string | null>(null);
  const [check] = useState(() => new TaskSlot());

  function show(next: CoverFields): Promise<TaskResult<string | null>> {
    setCover(next);
    setError(null);
    if (!validCover(next)) {
      check.cancel();
      return Promise.resolve({ current: false });
    }
    const checked = check.run(() => coverProblem(next));
    void checked.then((result) => {
      if (result.current) setError(result.value);
    });
    return checked;
  }

  return {
    cover,
    error,
    show,
    probe: (fields) => check.run(() => coverProblem(fields)),
    cancel: () => check.cancel(),
  };
}

interface Props {
  strings: Strings;
  editor: CoverEditor;
  disabled?: boolean;
}

/** The film cover icon of an effect, with its brand, film name, number, and band to edit. */
export function CoverFieldset({ strings: t, editor, disabled }: Props) {
  const ids = useId();
  const { cover, error } = editor;
  const edit = <K extends keyof CoverFields>(key: K, value: CoverFields[K]) =>
    void editor.show({ ...cover, [key]: value });
  return (
    <fieldset className="flex flex-col gap-2 disabled:opacity-60" disabled={disabled}>
      <legend className="mb-2 text-sm font-medium">{t.iconHeading}</legend>
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-start">
        <div className="flex shrink-0 items-center justify-center rounded-lg bg-muted p-3">
          <CoverIcon cover={coverIcon(cover)} className="size-20" />
        </div>
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          {(
            [
              ['brand', t.iconBrand, true],
              ['name', t.iconFilm, true],
              ['number', t.iconNumber, false],
            ] as const
          ).map(([key, label, required]) => (
            <div key={key} className="flex flex-col gap-1.5">
              <Label htmlFor={`${ids}-${key}`}>{label}</Label>
              <Input
                id={`${ids}-${key}`}
                type="text"
                value={cover[key]}
                maxLength={12}
                aria-invalid={(required || cover[key] !== '') && !validCoverText(cover[key])}
                onChange={(event) => edit(key, event.target.value)}
              />
            </div>
          ))}
          <div className="flex items-center gap-2 sm:col-span-3">
            <Checkbox
              id={`${ids}-band`}
              checked={cover.band}
              onCheckedChange={(value) => edit('band', value === true)}
            />
            <Label htmlFor={`${ids}-band`}>{t.iconBand}</Label>
          </div>
          {!validCover(cover) && <p className="text-sm text-destructive sm:col-span-3">{t.iconNote}</p>}
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{t.iconTooWide}</p>}
    </fieldset>
  );
}
