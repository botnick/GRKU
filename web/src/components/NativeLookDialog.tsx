import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type Ref,
} from 'react';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MAX_EFFECTS, type ImportedEffect, type NativeImport } from '../catalog';
import type { Strings } from '../i18n';
import { trackNativeLooks } from '../analytics';
import {
  FIRMWARE_PAGE,
  nativeProblem,
  unlockNativeLooks,
  type NativeProblem,
} from '../import/native';
import { TaskSlot } from '../import/task';
import { CoverIcon } from './EffectIcon';

interface Props {
  strings: Strings;
  baseGamma: Uint16Array;
  /** Adds the looks to the page, in place of earlier copies with the same IDs. Returns true when
   * a look stays unchecked because the package already has `MAX_EFFECTS` checked effects. */
  onImport: (effects: readonly ImportedEffect[]) => boolean;
  ref?: Ref<NativeLookDialogHandle>;
}

/** Opens the dialog from a button elsewhere on the page. */
export interface NativeLookDialogHandle {
  open: () => void;
}

type Status =
  | { state: 'idle' }
  | { state: 'reading' }
  | { state: 'failed'; problem: NativeProblem }
  | { state: 'done'; effects: readonly ImportedEffect<NativeImport>[]; full: boolean };

/** The File System Access picker, which Chromium browsers have. It opens in Downloads. */
interface PickerHost {
  showOpenFilePicker?: (options: {
    id: string;
    startIn: 'downloads';
    types: { description: string; accept: Record<string, string[]> }[];
  }) => Promise<{ getFile(): Promise<File> }[]>;
}

const ACCEPT = '.zip,.bin';

/**
 * The dialog that unlocks the GR IV Cinema looks: a link to Ricoh's firmware page, a file choice
 * or a drop of the downloaded ZIP, then the read in a worker. The file stays in the browser.
 */
export function NativeLookDialog({ strings: t, baseGamma, onImport, ref }: Props) {
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ state: 'idle' });
  const [dragging, setDragging] = useState(false);
  // A new key empties the file input, so the same file can be chosen again.
  const [fileKey, setFileKey] = useState(0);
  // Only the newest read changes the dialog.
  const [task] = useState(() => new TaskSlot());
  // An unmount stops a running read.
  useEffect(() => () => task.cancel(), [task]);

  const reading = status.state === 'reading';

  function openDialog() {
    if (status.state !== 'reading') setStatus({ state: 'idle' });
    setOpen(true);
  }

  useImperativeHandle(ref, () => ({ open: openDialog }));

  function cancel() {
    task.cancel();
    setStatus({ state: 'idle' });
  }

  function close() {
    cancel();
    setDragging(false);
    setOpen(false);
  }

  async function read(file: File) {
    setStatus({ state: 'reading' });
    try {
      const result = await task.run((signal) => unlockNativeLooks(file, baseGamma, signal));
      if (!result.current) return;
      const effects = result.value;
      trackNativeLooks({ result: 'ok', version: effects[0]?.imported.version ?? '' });
      const full = onImport(effects);
      setStatus({ state: 'done', effects, full });
    } catch (error) {
      console.error(error);
      const problem = nativeProblem(error);
      trackNativeLooks({ result: 'failed', problem });
      setStatus({ state: 'failed', problem });
    }
  }

  /** Opens the picker in Downloads where the browser has it, or else the file input. */
  async function pick() {
    const host = window as unknown as PickerHost;
    if (!host.showOpenFilePicker) {
      input.current?.click();
      return;
    }
    let file: File;
    try {
      const [handle] = await host.showOpenFilePicker({
        id: 'grku-firmware',
        startIn: 'downloads',
        types: [
          {
            description: t.nativeFileType,
            accept: { 'application/zip': ['.zip'], 'application/octet-stream': ['.bin'] },
          },
        ],
      });
      if (!handle) return;
      file = await handle.getFile();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      // A picker that the page cannot use, such as in a frame, leaves the file input.
      console.error(error);
      input.current?.click();
      return;
    }
    void read(file);
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileKey((key) => key + 1);
    if (file) void read(file);
  }

  const carriesFile = (event: DragEvent) => event.dataTransfer.types.includes('Files');

  function dragOver(event: DragEvent<HTMLDivElement>) {
    if (!carriesFile(event) || reading) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setDragging(true);
  }

  function dragLeave(event: DragEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
  }

  function drop(event: DragEvent<HTMLDivElement>) {
    if (!carriesFile(event)) return;
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && !reading) void read(file);
  }

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
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto data-[dragging]:ring-2 data-[dragging]:ring-brand sm:max-w-lg"
        data-dragging={dragging || undefined}
        onDragOver={dragOver}
        onDragLeave={dragLeave}
        onDrop={drop}
      >
        <DialogHeader className="flex-row items-center justify-between gap-4 text-left">
          <DialogTitle>{t.nativeTitle}</DialogTitle>
          <Button type="button" variant="outline" size="sm" onClick={close}>
            {t.close}
          </Button>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <p className="text-sm text-muted-foreground">{t.nativeIntro}</p>

          <ol className="flex list-decimal flex-col gap-4 pl-6">
            <li className="flex flex-col items-start gap-2">
              <p className="text-sm">{t.nativeStepDownload}</p>
              <Button asChild variant="outline" size="sm">
                <a href={FIRMWARE_PAGE} target="_blank" rel="noreferrer">
                  {t.nativeOpenRicoh}
                </a>
              </Button>
            </li>
            <li className="flex flex-col items-start gap-2">
              <p className="text-sm">{t.nativeStepChoose}</p>
              <Button type="button" variant="outline" disabled={reading} onClick={() => void pick()}>
                {t.nativeChoose}
              </Button>
              <input
                key={fileKey}
                ref={input}
                type="file"
                accept={ACCEPT}
                hidden
                onChange={chooseFile}
              />
            </li>
            <li className="flex flex-col items-start gap-2">
              <p className="text-sm">{t.nativeStepRead}</p>
              <div className="flex w-full flex-col gap-2" aria-live="polite">
                {reading && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                    <span>{t.nativeReading}</span>
                    <Button type="button" variant="outline" size="sm" onClick={cancel}>
                      {t.cancel}
                    </Button>
                  </div>
                )}
                {status.state === 'failed' && (
                  <p className="text-sm text-destructive">{t.nativeErrors[status.problem]}</p>
                )}
                {done && (
                  <>
                    <ul className="flex flex-col gap-2">
                      {done.effects.map((effect) => (
                        <li key={effect.id} className="flex items-center gap-3">
                          <CoverIcon cover={effect.cover} />
                          <span className="font-medium">{effect.name}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-muted-foreground">
                      {t.nativeDone(done.effects[0]?.imported.version ?? '')}
                    </p>
                    {done.full && <p className="text-sm text-muted-foreground">{t.nativeUnchecked(MAX_EFFECTS)}</p>}
                  </>
                )}
              </div>
            </li>
          </ol>

          {done && (
            <DialogFooter>
              <Button type="button" variant="brand" onClick={close}>
                {t.done}
              </Button>
            </DialogFooter>
          )}

          <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
            <p>{t.nativePrivacy}</p>
            <p>{t.nativeLicense}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
