import { useId, useImperativeHandle, useState, type FormEvent, type Ref } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ImportedEffect } from '../catalog';
import type { Strings } from '../i18n';
import { coverFields, relabelImport } from '../import/edit';
import { validCover, validName, type CoverFields } from '../import/names';
import { CoverFieldset, useCoverEditor } from './CoverEditor';
import { EffectIcon } from './EffectIcon';

interface Props {
  strings: Strings;
  /** Keeps the changed import in the place of the one before. */
  onSave: (effect: ImportedEffect) => void;
  ref?: Ref<EditDialogHandle>;
}

/** Opens the dialog for an import from a button of its row. */
export interface EditDialogHandle {
  open: (effect: ImportedEffect) => void;
}

const NO_COVER: CoverFields = { brand: '', name: '', number: '', band: false };

/**
 * Changes the name of a LUT import, and the text of its film cover icon when it has one. The
 * effect keeps its ID, so the camera keeps its Fn adjustments.
 */
export function EditDialog({ strings: t, onSave, ref }: Props) {
  const ids = useId();
  const [open, setOpen] = useState(false);
  const [effect, setEffect] = useState<ImportedEffect | null>(null);
  const [name, setName] = useState('');
  // The cover fields of an import with a film box cover, else null: its icon stays.
  const [fields, setFields] = useState<CoverFields | null>(null);
  const coverEditor = useCoverEditor(NO_COVER);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  useImperativeHandle(ref, () => ({
    open(next) {
      const cover = coverFields(next.cover);
      setEffect(next);
      setName(next.name);
      setFields(cover);
      coverEditor.cancel();
      if (cover) void coverEditor.show(cover);
      setSaving(false);
      setFailed(false);
      setOpen(true);
    },
  }));

  const cover = fields && coverEditor.cover;
  const badName = !validName(name);
  const ready = effect !== null && !badName && (!cover || (validCover(cover) && coverEditor.error === null)) && !saving;

  function close() {
    coverEditor.cancel();
    setOpen(false);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready || !effect) return;
    setSaving(true);
    setFailed(false);
    try {
      onSave(await relabelImport(effect, name, cover));
      close();
    } catch (error) {
      console.error(error);
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent aria-describedby={undefined} className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">{t.editTitle}</DialogTitle>
        </DialogHeader>
        {effect && (
          <form className="flex flex-col gap-5" onSubmit={submit}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${ids}-name`}>{t.importName}</Label>
              <Input
                id={`${ids}-name`}
                type="text"
                value={name}
                maxLength={16}
                disabled={saving}
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
            {cover ? (
              <CoverFieldset strings={t} editor={coverEditor} disabled={saving} />
            ) : (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">{t.iconHeading}</span>
                <div className="flex items-center justify-center rounded-lg bg-muted p-4">
                  <EffectIcon effect={effect} className="size-20" />
                </div>
              </div>
            )}
            <div aria-live="polite">{failed && <p className="text-sm text-destructive">{t.editError}</p>}</div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>
                {t.cancel}
              </Button>
              <Button type="submit" variant="brand" disabled={!ready} aria-busy={saving}>
                {t.editSave}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
