import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type Ref,
} from 'react';
import { ExternalLink, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MAX_EFFECTS, type ImportedEffect, type NativeImport } from '../catalog';
import type { Strings } from '../i18n';
import { trackNativeLooks } from '../analytics';
import {
  FIRMWARE_PAGES,
  NATIVE_LOOKS,
  nativeProblem,
  unlockNativeLooks,
  type NativeFirmware,
  type NativeLook,
  type NativeProblem,
} from '../import/native';
import { TaskSlot } from '../import/task';
import { CoverIcon } from './EffectIcon';

interface Props {
  strings: Strings;
  baseGamma: Uint16Array;
  /** The native looks that the camera of the page can use (`nativeLooksFor`). */
  looks: readonly NativeLook[];
  /** Adds the looks to the page, in place of earlier copies with the same IDs. Returns true when
   * a look stays unchecked because the package already has `MAX_EFFECTS` checked effects. */
  onImport: (effects: readonly ImportedEffect[]) => boolean;
  ref?: Ref<NativeLookDialogHandle>;
}

/** Opens the dialog from a button elsewhere on the page, for the firmware of one camera. */
export interface NativeLookDialogHandle {
  open: (firmware: NativeFirmware) => void;
}

type Status =
  | { state: 'idle' }
  | { state: 'reading' }
  | { state: 'failed'; problem: NativeProblem }
  | {
      state: 'done';
      /** The firmware that the file was, which can be the other one. */
      firmware: NativeFirmware;
      version: string;
      effects: readonly ImportedEffect<NativeImport>[];
      full: boolean;
    };

/** The File System Access picker, which Chromium browsers have. It opens in Downloads. */
interface PickerHost {
  showOpenFilePicker?: (options: {
    id: string;
    startIn: 'downloads';
    types: { description: string; accept: Record<string, string[]> }[];
  }) => Promise<{ getFile(): Promise<File> }[]>;
}

/** An official ZIP of RICOH, or the firmware file in it: GR IV fwdc248b.bin, GR II rg2_v003.frm. */
const ACCEPT = '.zip,.bin,.frm';

/** The texts of the dialog for the firmware of one camera. */
function firmwareText(t: Strings, firmware: NativeFirmware) {
  const n = t.native;
  return firmware === 'gr2'
    ? { title: n.dialogGr2, download: n.stepDownloadGr2, errors: n.errorsGr2 }
    : { title: n.dialogGr4, download: n.stepDownloadGr4, errors: n.errorsGr4 };
}

/** The line under the name of a native look in the preview: the firmware that it came from. */
export function nativeSource(t: Strings, id: string, version: string): string {
  const firmware = NATIVE_LOOKS.find((look) => look.id === id)?.firmware;
  return firmware === 'gr2' ? t.native.fromGr2(version) : t.native.fromGr4(version);
}

/**
 * The dialog that gets the native looks of one camera's firmware (the GR IV looks, GR II
 * Positive) in three steps: the RICOH download page, a file choice or a drop of the downloaded
 * ZIP, then the read in a worker. The file stays in the browser. A file of the other camera gives
 * that camera's looks. The page keeps only the looks that its camera can use.
 */
export function NativeLookDialog({ strings: t, baseGamma, looks, onImport, ref }: Props) {
  const [open, setOpen] = useState(false);
  const [firmware, setFirmware] = useState<NativeFirmware>('gr4');
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ state: 'idle' });
  const [dragging, setDragging] = useState(false);
  // A new key empties the file input, so the same file can be chosen again.
  const [fileKey, setFileKey] = useState(0);
  // Only the newest read changes the dialog.
  const [task] = useState(() => new TaskSlot());
  // An unmount stops a running read.
  useEffect(() => () => task.cancel(), [task]);
  // Each open and close starts a new session: a file that a picker gives after the dialog closed
  // or changed its firmware is not read.
  const session = useRef(0);
  // The button that opened the dialog, which gets the focus back after it closes.
  const opener = useRef<HTMLElement | null>(null);

  const reading = status.state === 'reading';
  const text = firmwareText(t, firmware);
  const n = t.native;
  // The looks of this firmware for the camera, which the steps show.
  const offered = looks.filter((look) => look.firmware === firmware);

  function openDialog(next: NativeFirmware) {
    session.current += 1;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (status.state === 'reading' && next !== firmware) task.cancel();
    if (status.state !== 'reading' || next !== firmware) setStatus({ state: 'idle' });
    setFirmware(next);
    setOpen(true);
  }

  useImperativeHandle(ref, () => ({ open: openDialog }));

  function cancel() {
    task.cancel();
    setStatus({ state: 'idle' });
  }

  function close() {
    session.current += 1;
    cancel();
    setDragging(false);
    setOpen(false);
  }

  async function read(file: File) {
    setStatus({ state: 'reading' });
    try {
      const result = await task.run((signal) => unlockNativeLooks(file, baseGamma, signal));
      if (!result.current) return;
      const all = result.value;
      const version = all[0]?.imported.version ?? '';
      const found = NATIVE_LOOKS.find((look) => look.id === all[0]?.id)?.firmware ?? firmware;
      trackNativeLooks({ result: 'ok', version });
      // Only the looks that the camera can use: GR IV has the Cinema looks built in, and
      // GR IV Monochrome has its own.
      const effects = all.filter((effect) => looks.some((look) => look.id === effect.id));
      const full = effects.length > 0 && onImport(effects);
      setStatus({ state: 'done', firmware: found, version, effects, full });
    } catch (error) {
      console.error(error);
      const problem = nativeProblem(error);
      trackNativeLooks({ result: 'failed', problem });
      setStatus({ state: 'failed', problem });
    }
  }

  /** Opens the picker in Downloads where the browser has it, or else the file input. */
  async function pick() {
    const started = session.current;
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
            description: text.title,
            accept: { 'application/zip': ['.zip'], 'application/octet-stream': ['.bin', '.frm'] },
          },
        ],
      });
      if (!handle) return;
      file = await handle.getFile();
      if (session.current !== started) return;
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
  // GR II Positive comes as one effect for each camera family; the page shows one of each name.
  const doneLooks = done ? done.effects.filter((effect, i, all) => all.findIndex((e) => e.name === effect.name) === i) : [];
  const step = 'flex flex-col items-start gap-2';
  const number = 'flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-[13px] font-semibold text-background tabular-nums';

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent
        showCloseButton={false}
        onCloseAutoFocus={(event) => {
          // Back to the button that opened the dialog, or to the panel when the looks are in.
          const target = opener.current?.isConnected ? opener.current : document.getElementById('native-looks-title');
          if (target) {
            event.preventDefault();
            target.focus();
          }
        }}
        aria-describedby={undefined}
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto data-[dragging]:ring-2 data-[dragging]:ring-brand sm:max-w-lg"
        data-dragging={dragging || undefined}
        onDragOver={dragOver}
        onDragLeave={dragLeave}
        onDrop={drop}
      >
        <DialogHeader className="flex-row items-center justify-between gap-4 text-left">
          <DialogTitle>{text.title}</DialogTitle>
          <Button type="button" variant="outline" size="sm" onClick={close}>
            {t.close}
          </Button>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {offered.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label={n.count(offered.length)}>
              {offered.map((look) => (
                <li key={look.id} className="flex w-[4.5rem] flex-col items-center gap-1 text-center">
                  <CoverIcon cover={look.cover} />
                  <span className="w-full truncate text-[11px] leading-tight text-muted-foreground">{look.name}</span>
                </li>
              ))}
            </ul>
          )}

          <ol className="flex flex-col gap-5">
            <li className="flex gap-3">
              <span className={number} aria-hidden="true">1</span>
              <div className={step}>
                <p className="text-sm">{text.download}</p>
                <Button asChild variant="outline" size="sm">
                  <a href={FIRMWARE_PAGES[firmware]} target="_blank" rel="noreferrer">
                    {n.openRicoh}
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                </Button>
                <p className="text-[13px] text-muted-foreground">{n.noUpdate}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className={number} aria-hidden="true">2</span>
              <div className={step}>
                <p className="text-sm">{n.stepChoose}</p>
                <Button type="button" variant="brand" disabled={reading} onClick={() => void pick()}>
                  {n.choose}
                </Button>
                <input
                  key={fileKey}
                  ref={input}
                  type="file"
                  accept={ACCEPT}
                  hidden
                  onChange={chooseFile}
                />
              </div>
            </li>
            <li className="flex gap-3">
              <span className={number} aria-hidden="true">3</span>
              <div className={step}>
                <p className="text-sm">{n.stepRead}</p>
                <div className="flex w-full flex-col gap-2" aria-live="polite">
                  {reading && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                      <span>{n.reading}</span>
                      <Button type="button" variant="outline" size="sm" onClick={cancel}>
                        {t.cancel}
                      </Button>
                    </div>
                  )}
                  {status.state === 'failed' && (
                    <p className="text-sm font-medium text-destructive">{text.errors[status.problem]}</p>
                  )}
                  {done && doneLooks.length === 0 && <p className="text-sm font-medium">{n.noneForCamera}</p>}
                  {done && doneLooks.length > 0 && (
                    <>
                      <p className="text-sm font-medium">
                        {done.firmware === 'gr2' ? n.doneGr2 : n.doneGr4(done.version)}
                      </p>
                      <ul className="flex flex-wrap gap-2">
                        {doneLooks.map((effect) => (
                          <li key={effect.id} className="flex w-[4.5rem] flex-col items-center gap-1 text-center">
                            <CoverIcon cover={effect.cover} />
                            <span className="w-full truncate text-[11px] leading-tight">{effect.name}</span>
                          </li>
                        ))}
                      </ul>
                      {done.full && <p className="text-sm text-muted-foreground">{n.unchecked(MAX_EFFECTS)}</p>}
                    </>
                  )}
                </div>
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

          <div className="flex flex-col gap-1.5 border-t border-border pt-4 text-[13px] text-muted-foreground">
            <p>{n.privacy}</p>
            <p>{n.license}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
