import type { Cover, ImportedEffect, NativeImport } from '../catalog';
import { provideTable } from '../preview/render';
import type { NativeRequest, NativeResponse } from './native.worker';
import { base64 } from './names';

/** grku-core `gr4_looks::MAX_FILE_SIZE`. An official GR IV ZIP has about 35 MB, a GR II ZIP less. */
export const MAX_FIRMWARE_BYTES = 96 * 1024 * 1024;
/** The read of an official ZIP takes a few seconds. */
const READ_TIMEOUT = 60_000;
/** Makes each preview table key new, so a later unlock with the same ID gets no cached preview. */
let tableCount = 0;

/** The camera whose firmware file holds a native look. */
export type NativeFirmware = 'gr4' | 'gr2';

/** Ricoh's support page of each camera, which shows the firmware with its license. */
export const FIRMWARE_PAGES: Readonly<Record<NativeFirmware, string>> = {
  gr4: 'https://www.ricoh-imaging.co.jp/english/support/digital/gr4_s.html',
  gr2: 'https://www.ricoh-imaging.co.jp/english/support/digital/gr2_s.html',
};

/** Ricoh's GR IV support page (`FIRMWARE_PAGES.gr4`). */
export const FIRMWARE_PAGE = FIRMWARE_PAGES.gr4;

/** A cover of a native look. The icon that grku-wasm draws has the same fields. */
const cinema = (number: string): Cover => ({ template: 'cine', brand: 'RICOH', name: 'CINEMA', number });
const mono = (number: string): Cover => ({ template: 'box', brand: 'RICOH', name: 'MONO', number, band: false });

/** GR IV has the Cinema looks built in, and on it these converted copies would show wrong colors. */
const CINEMA_CAMERAS: readonly string[] = ['gr3', 'gr3x'];
/** GR IV Monochrome has its own looks built in. */
const MONO_CAMERAS: readonly string[] = ['gr3', 'gr3x', 'gr4'];

/** A look that `nativeLooks` of grku-wasm reads from a camera firmware file. */
export interface NativeLook {
  id: string;
  name: string;
  firmware: NativeFirmware;
  cover: Cover;
  monochrome: boolean;
  /** The camera entries (`Camera.key`) that can use the look. */
  cameras: readonly string[];
}

const monoLook = (id: string, name: string, number: string): NativeLook => ({
  id,
  name,
  firmware: 'gr4',
  cover: mono(number),
  monochrome: true,
  cameras: MONO_CAMERAS,
});

const gr2Positive = (id: string, cameras: readonly string[]): NativeLook => ({
  id,
  name: 'GR II Positive',
  firmware: 'gr2',
  cover: { template: 'cine', brand: 'RICOH', name: 'GR II', number: 'POSITIVE' },
  monochrome: false,
  cameras,
});

/**
 * The native looks that `nativeLooks` reads (the offered looks of grku-core
 * `gr4_looks::LOOKS` and `gr2_looks::TARGETS`), in its order for each firmware. GR II Positive has
 * an effect for GR III's Standard and one for GR IV's.
 */
export const NATIVE_LOOKS: readonly NativeLook[] = [
  { id: 'gr4-cinema-yellow', name: 'Cinema Yellow', firmware: 'gr4', cover: cinema('YELLOW'), monochrome: false, cameras: CINEMA_CAMERAS },
  { id: 'gr4-cinema-green', name: 'Cinema Green', firmware: 'gr4', cover: cinema('GREEN'), monochrome: false, cameras: CINEMA_CAMERAS },
  monoLook('gr4-mono-standard', 'Mono Standard', 'STD'),
  monoLook('gr4-mono-solid', 'Mono Solid', 'SOLID'),
  monoLook('gr4-mono-soft', 'Mono Soft', 'SOFT'),
  monoLook('gr4-mono-high-contrast', 'Mono Hi-Contrast', 'HI'),
  monoLook('gr4-mono-grainy', 'Mono Grainy', 'GRAINY'),
  monoLook('gr4-mono-solarized-1', 'Solarized 1', 'SOLAR 1'),
  monoLook('gr4-mono-solarized-2', 'Solarized 2', 'SOLAR 2'),
  monoLook('gr4-mono-solarized-3', 'Solarized 3', 'SOLAR 3'),
  gr2Positive('gr2-positive-film', CINEMA_CAMERAS),
  gr2Positive('gr2-positive-film-gr4', ['gr4']),
];

/** The native looks that the camera entry `camera` (`Camera.key`) can use. */
export const nativeLooksFor = (camera: string): readonly NativeLook[] =>
  NATIVE_LOOKS.filter((look) => look.cameras.includes(camera));

/** True when the camera entry `camera` can use a native look. */
export const takesNativeLooks = (camera: string): boolean => nativeLooksFor(camera).length > 0;

/**
 * The imports that the camera entry `camera` can use: each LUT import, and the native looks of
 * `nativeLooksFor`. The page keeps the others for a later change of camera.
 */
export function importsForCamera<T extends ImportedEffect>(
  imported: readonly T[],
  camera: string,
): readonly T[] {
  const looks = nativeLooksFor(camera);
  return imported.filter(
    (effect) => effect.imported.kind !== 'native' || looks.some((look) => look.id === effect.id),
  );
}

/** The looks of `looks` that `imported` lacks, which the list offers to unlock. */
export const missingNativeLooks = (
  imported: readonly { readonly id: string }[],
  looks: readonly NativeLook[] = NATIVE_LOOKS,
) => looks.filter((look) => !imported.some((effect) => effect.id === look.id));

/** True when `imported` has each native look. */
export const hasNativeLooks = (imported: readonly ImportedEffect[]): boolean =>
  missingNativeLooks(imported).length === 0;

/** Why a firmware file gave no looks, as the dialog explains it. */
export type NativeProblem = 'unsupported' | 'notFirmware' | 'tooLarge' | 'failed';

/** The problem of an error of `unlockNativeLooks`, from the English messages of grku-core. */
export function nativeProblem(error: unknown): NativeProblem {
  const message = error instanceof Error ? error.message : String(error);
  if (/not a supported GR (II|IV) firmware file/.test(message)) return 'unsupported';
  if (message.includes('The ZIP file has no') || message.includes('Invalid ZIP file')) return 'notFirmware';
  if (message.includes('too large')) return 'tooLarge';
  return 'failed';
}

/** Reads one file in a new worker, which it terminates after. */
function run(request: NativeRequest, signal: AbortSignal): Promise<NativeResponse & { kind: 'looks' }> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./native.worker.ts', import.meta.url), { type: 'module' });
    const finish = (response?: NativeResponse, error?: unknown) => {
      clearTimeout(timeout);
      signal.removeEventListener('abort', abort);
      worker.terminate();
      if (response?.kind === 'error') reject(new Error(response.message));
      else if (response?.kind === 'looks') resolve(response);
      else reject(error ?? new Error('Invalid firmware response'));
    };
    const abort = () => finish(undefined, signal.reason);
    const timeout = setTimeout(
      () => finish(undefined, new Error('The firmware read timed out')),
      READ_TIMEOUT,
    );
    signal.addEventListener('abort', abort, { once: true });
    worker.onmessage = ({ data }: MessageEvent<NativeResponse>) => finish(data);
    worker.onerror = () => finish(undefined, new Error('The firmware read failed'));
    worker.onmessageerror = () => finish(undefined, new Error('Invalid firmware response'));
    worker.postMessage(request, [request.bytes]);
  });
}

/**
 * Reads the native looks from an official GR IV or GR II ZIP or its firmware file, in a worker, and returns them as effects of the page. The file stays in the browser. `baseGamma` is
 * the catalog's, for the previews.
 */
export async function unlockNativeLooks(
  file: File,
  baseGamma: Uint16Array,
  signal: AbortSignal,
): Promise<ImportedEffect<NativeImport>[]> {
  if (file.size > MAX_FIRMWARE_BYTES) throw new Error('The file is too large');
  const bytes = await file.arrayBuffer();
  signal.throwIfAborted();
  const { looks } = await run({ bytes, baseGamma }, signal);
  return looks.map((look) => {
    const known = NATIVE_LOOKS.find((item) => item.id === look.id);
    if (!known) throw new Error(`Unexpected native look: ${look.id}`);
    // The preview finds the table under this key instead of fetching a catalog path.
    const table = `native/${look.id}/${++tableCount}`;
    provideTable(table, look.table);
    return {
      id: look.id,
      name: look.name,
      icon: base64(look.icon),
      // The page draws the cover with web fonts, as it draws the catalog covers.
      cover: known.cover,
      monochrome: look.monochrome,
      preview: table,
      imported: {
        kind: 'native',
        blob: look.blob,
        table: look.table,
        version: look.version,
        source: file.name,
        tone: look.tone,
      },
    };
  });
}
