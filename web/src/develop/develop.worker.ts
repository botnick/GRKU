/**
 * The worker of the Develop page. One worker keeps the open photos at preview size and renders
 * their previews; each download runs in a worker of its own, which the page ends afterwards, so
 * the memory of a 24-megapixel picture goes back at once.
 *
 * A JPEG (or a PNG, HEIC, or WebP that the browser decodes) develops in its stored orientation, as
 * the camera keeps its planes, and the EXIF Orientation of the source shows it upright. A DNG comes
 * upright from the decoder.
 */
import librawUrl from '@colorhythm/libraw-wasm/libraw.wasm?url';
import { blend, colour, encode, Engine, marginsOf, rgba, runModules, setShot, shrink, type LookTable, type Picture, type Source } from './engine';
import { developedApp1, fidelityOf, readPhotoInfo, shotApp1, turnsOf, type PhotoInfo } from './exif';
import { jpegLookTable, linearIndex, linearWhite, tableWhite } from './look';
import { canvasSizeOf, creditPlacement, storedRect, uprightMargins, uprightToStored } from './placement';
import { photoSeed, type LookUrls, type Opened, type Request, type Response } from './protocol';
import type { DevelopSettings, Margins } from './settings';

/** The longest side that the modules take (Glow reads rows of at most 6400 pixels). */
const MAX_SIDE = 6400;
/** The grid of the look table: coarser for previews, which then build it in a tenth of the time. */
const PREVIEW_GRID = 33;
const EXPORT_GRID = 65;

const post = (message: Response, transfer: Transferable[] = []) => self.postMessage(message, { transfer });
const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error));

let module: WebAssembly.Module | null = null;
let engine: Promise<Engine> | null = null;
const getEngine = () => (engine ??= Engine.create(module!));

// ---- Tables ----------------------------------------------------------------------------------------

const files = new Map<string, Promise<Uint8Array>>();
function fetchTable(url: string): Promise<Uint8Array> {
  let table = files.get(url);
  if (!table) {
    table = fetch(url).then(async (response) => {
      if (!response.ok) throw new Error(`Table request failed: ${response.status}`);
      return new Uint8Array(await response.arrayBuffer());
    });
    table.catch(() => files.delete(url));
    files.set(url, table);
  }
  return table;
}

const jpegTables = new Map<string, Promise<Uint16Array>>();
async function lookTable(kind: 'rgba8' | 'linear16', urls: LookUrls, grid: number): Promise<LookTable> {
  if (kind === 'rgba8') {
    const key = `${urls.look}\n${grid}`;
    let lut = jpegTables.get(key);
    if (!lut) {
      lut = Promise.all([fetchTable(urls.standard), urls.look ? fetchTable(urls.look) : null]).then(([standard, look]) => jpegLookTable(standard, look, grid));
      lut.catch(() => jpegTables.delete(key));
      jpegTables.set(key, lut);
      // A few looks stay ready: going back to one renders at once.
      if (jpegTables.size > 12) jpegTables.delete(jpegTables.keys().next().value!);
    }
    const table = await lut;
    return { kind, lut: table, n: grid, white: tableWhite(table, grid) };
  }
  const table = await fetchTable(urls.look ?? urls.standard);
  const size = Math.round(Math.cbrt(table.length / 3));
  return { kind, table, size, ...linearIndex(size), white: linearWhite(table) };
}

// ---- Decoding ----------------------------------------------------------------------------------------

const isRaw = (file: File) => /\.dng$/i.test(file.name);

/** The first bytes of a JPEG hold its EXIF and XMP; a DNG is read whole. */
async function infoOf(file: File): Promise<PhotoInfo> {
  const bytes = new Uint8Array(await (isRaw(file) ? file : file.slice(0, 512 * 1024)).arrayBuffer());
  return readPhotoInfo(bytes);
}

interface Decoded {
  source: Source;
  /** The upright picture at its decoded size, closed by the caller. */
  bitmap: ImageBitmap | null;
  /** The EXIF Orientation of the developed picture. */
  orientation: number;
  /** The stored width of the picture before it was made smaller. */
  fullWidth: number;
}

/** A picture that the browser decodes, at most `side` on its long side, read in stored strips. */
async function bitmapSource(file: File, info: PhotoInfo, side: number | null): Promise<Decoded> {
  const stored = turnsOf(info.orientation);
  // A mirrored orientation is rare: such a picture develops upright, and its EXIF then says so.
  const turns = stored ?? 0;
  let bitmap = await createImageBitmap(file);
  // Browsers show a picture by its EXIF Orientation; one that does not gives the stored picture.
  const turned = !(turns & 1) || info.width === null || bitmap.width !== info.width || bitmap.width === bitmap.height;
  const draw = turned ? turns : 0;
  const fullWidth = (draw & 1 ? bitmap.height : bitmap.width) & ~1;
  const limit = Math.min(side ?? MAX_SIDE, MAX_SIDE);
  const long = Math.max(bitmap.width, bitmap.height);
  if (long > limit) {
    const scale = limit / long;
    const small = await createImageBitmap(bitmap, {
      resizeWidth: Math.max(2, Math.round(bitmap.width * scale)),
      resizeHeight: Math.max(2, Math.round(bitmap.height * scale)),
      resizeQuality: 'high',
    });
    bitmap.close();
    bitmap = small;
  }
  const storedW = draw & 1 ? bitmap.height : bitmap.width, storedH = draw & 1 ? bitmap.width : bitmap.height;
  const width = storedW & ~1, height = storedH;
  const m = uprightToStored(draw, storedW, storedH);
  let strip: OffscreenCanvas | null = null;
  let context: OffscreenCanvasRenderingContext2D | null = null;
  const picture = bitmap;
  const source: Source = {
    width,
    height,
    turns,
    kind: 'rgba8',
    read(top, rows, into) {
      if (!strip || strip.height !== rows) {
        strip = new OffscreenCanvas(width, rows);
        context = strip.getContext('2d', { willReadFrequently: true });
      }
      if (!context) throw new Error('2D canvas is not available');
      context.setTransform(m[0], m[1], m[2], m[3], m[4], m[5] - top);
      context.drawImage(picture, 0, 0);
      (into as Uint8Array).set(context.getImageData(0, 0, width, rows).data);
    },
  };
  return { source, bitmap, orientation: stored === null ? 1 : info.orientation, fullWidth };
}

/** A DNG, developed by LibRaw into linear light, upright, at most `side` on its long side. */
async function rawSource(file: File, side: number | null): Promise<Source> {
  const [{ decodeRaw }, { resizeLinear }, wasm] = await Promise.all([
    import('../preview/raw-decode'),
    import('../preview/linear'),
    fetch(librawUrl).then((response) => {
      if (!response.ok) throw new Error('Cannot load the RAW decoder');
      return response.arrayBuffer();
    }),
  ]);
  const limit = Math.min(side ?? MAX_SIDE, MAX_SIDE);
  // The half-size development of a GR is 3096 pixels across: enough below that.
  let image = await decodeRaw(new Uint8Array(await file.arrayBuffer()), wasm, limit <= 3096);
  if (Math.max(image.width, image.height) > limit) image = resizeLinear(image, limit);
  const full = image;
  const width = full.width & ~1, height = full.height;
  return {
    width,
    height,
    turns: 0,
    kind: 'linear16',
    read(top, rows, into) {
      const out = into as Uint16Array;
      for (let y = 0; y < rows; y++) out.set(full.data.subarray((top + y) * full.width * 3, ((top + y) * full.width + width) * 3), y * width * 3);
    },
  };
}

/** A copy of a source in memory, so that its strips read without the bitmap or the decoder. */
async function memorySource(source: Source): Promise<Source> {
  const { width, height } = source;
  const channels = source.kind === 'rgba8' ? 4 : 3;
  const data = source.kind === 'rgba8' ? new Uint8Array(width * height * 4) : new Uint16Array(width * height * 3);
  for (let top = 0; top < height; top += 64) {
    const rows = Math.min(64, height - top);
    await source.read(top, rows, data.subarray(top * width * channels, (top + rows) * width * channels));
  }
  return {
    ...source,
    read: (top, rows, into) => (into as Uint8Array).set(data.subarray(top * width * channels, (top + rows) * width * channels) as Uint8Array),
  };
}

// ---- Previews ----------------------------------------------------------------------------------------

interface Open {
  source: Source;
  info: PhotoInfo;
  /** The width of the full picture, for the grain of the preview. */
  fullWidth: number;
  seed: number;
  /** The colour planes of the last look, from which a change of a module starts. */
  planes: { key: string; y: Uint8Array; c: Uint8Array } | null;
}

const open = new Map<number, Open>();

function describe(info: PhotoInfo) {
  const make = info.make.replace(/[.,]/g, ' ').replace(/\b(IMAGING|COMPANY|CORPORATION|CO|LTD|INC)\b/gi, '').replace(/\s+/g, ' ').trim();
  const t = info.taken;
  const two = (n: number) => String(n).padStart(2, '0');
  return {
    camera: info.model.toUpperCase().startsWith(make.toUpperCase()) ? info.model : [make, info.model].filter(Boolean).join(' '),
    imageControl: info.imageControl,
    taken: t ? `${t.year}-${two(t.month)}-${two(t.day)} ${two(t.hour)}:${two(t.minute)}` : null,
    iso: info.iso,
  };
}

const bitmapOf = (pixels: { width: number; height: number; data: Uint8ClampedArray<ArrayBuffer> }) => createImageBitmap(new ImageData(pixels.data, pixels.width, pixels.height));

async function openPhoto(id: number, file: File, side: number, standard: string): Promise<void> {
  const info = await infoOf(file);
  const raw = isRaw(file);
  let source: Source, before: ImageBitmap, fullWidth: number;
  if (raw) {
    source = await memorySource(await rawSource(file, side));
    // A GR DNG is twice the width of its half-size development.
    fullWidth = source.width * 2;
    // The photo as it is: the Standard development of its light.
    const e = await getEngine();
    e.free();
    const table = await lookTable('linear16', { look: null, standard, monochrome: false }, PREVIEW_GRID);
    before = await bitmapOf(rgba(e, await colour(e, source, table), [0, 0, 0, 0], false));
    e.free();
  } else {
    const decoded = await bitmapSource(file, info, side);
    source = await memorySource(decoded.source);
    fullWidth = Math.max(source.width, decoded.fullWidth);
    before = await createImageBitmap(decoded.bitmap!);
    decoded.bitmap!.close();
  }
  open.set(id, { source, info, fullWidth, seed: photoSeed(file), planes: null });
  const photo: Opened = { width: before.width, height: before.height, fidelity: fidelityOf(info, raw), ...describe(info), before };
  post({ type: 'opened', id, photo }, [before]);
}

async function preview(id: number, settings: DevelopSettings, urls: LookUrls, thumb?: number): Promise<{ image: ImageBitmap; margins: Margins }> {
  const photo = open.get(id);
  if (!photo) throw new Error('The photo is closed');
  const e = await getEngine();
  e.free();
  const { source, info } = photo;
  const key = String(urls.look);
  const table = await lookTable(source.kind, urls, PREVIEW_GRID);
  const size = source.width * source.height;
  let picture: Picture;
  if (photo.planes?.key === key) {
    picture = { y: e.put(photo.planes.y), c: e.put(photo.planes.c), width: source.width, height: source.height, turns: source.turns };
  } else {
    picture = await colour(e, source, table);
    photo.planes = { key, y: e.bytes(picture.y, size).slice(), c: e.bytes(picture.c, size).slice() };
  }
  setShot(e, info, table.white);
  runModules(e, picture, settings, info.iso, { mono: urls.monochrome, fullWidth: photo.fullWidth, seed: photo.seed, preview: true });
  const margins = marginsOf(settings, picture);
  const pixels = rgba(e, picture, margins, settings.border.color === 1);
  e.free();
  const image = await bitmapOf(pixels);
  if (!thumb) return { image, margins: uprightMargins(margins, picture.turns) };
  const scale = thumb / Math.max(image.width, image.height);
  const small = await createImageBitmap(image, { resizeWidth: Math.round(image.width * scale), resizeHeight: Math.round(image.height * scale), resizeQuality: 'medium' });
  image.close();
  return { image: small, margins: uprightMargins(margins, picture.turns).map((m) => Math.round(m * scale)) as Margins };
}

// ---- Downloads ----------------------------------------------------------------------------------------

async function exportPhoto(id: number, file: File, settings: DevelopSettings, urls: LookUrls, maxSide: number | null, credit: string | null, seed: number, processSide: number | null) {
  const progress = (phase: 'decode' | 'colour' | 'modules' | 'encode', fraction: number) => post({ type: 'progress', id, phase, fraction });
  progress('decode', 0);
  const info = await infoOf(file);
  const raw = isRaw(file);
  // A smaller download develops at full size too, as the camera does, then shrinks; a DNG needs
  // no more than its half-size development for it.
  let decoded: Decoded;
  // A phone with little memory develops at most `processSide` on the long side.
  const limit = (side: number | null) => (processSide && (!side || side > processSide) ? processSide : side);
  if (raw) decoded = { source: await rawSource(file, limit(maxSide ? Math.max(3096, maxSide) : null)), bitmap: null, orientation: 1, fullWidth: 0 };
  else decoded = await bitmapSource(file, info, limit(null));
  progress('decode', 1);
  const e = await getEngine();
  e.free();
  const table = await lookTable(decoded.source.kind, urls, EXPORT_GRID);
  const picture = await colour(e, decoded.source, table, (f) => progress('colour', f));
  decoded.bitmap?.close();
  setShot(e, info, table.white);
  runModules(e, picture, settings, info.iso, { mono: urls.monochrome, seed, progress: (f) => progress('modules', f) });
  const black = settings.border.color === 1;
  let margins = marginsOf(settings, picture);
  let out = picture;
  if (maxSide !== null) {
    const small = shrink(e, picture, margins, black, maxSide);
    out = small.picture;
    if (credit) drawCredit(e, out, settings, small.margins, credit);
    margins = [0, 0, 0, 0];
  }
  const width = out.width + margins[0] + margins[2], height = out.height + margins[1] + margins[3];
  const app1 = info.app1 && !raw ? developedApp1(info.app1, width, height, decoded.orientation) : shotApp1(info, width, height);
  const parts = encode(e, out, margins, black, 95, app1, (f) => progress('encode', f));
  e.free();
  const upright = out.turns & 1 ? { width: height, height: width } : { width, height };
  return { blob: new Blob(parts as BlobPart[], { type: 'image/jpeg' }), ...upright };
}

/** The credit of a free download (placement.ts), drawn over the stored planes of `picture`. */
function drawCredit(e: Engine, picture: Picture, settings: DevelopSettings, margins: Margins, text: string): void {
  const { width, height } = canvasSizeOf(picture);
  const place = creditPlacement(settings, width, height, uprightMargins(margins, picture.turns));
  const canvas = new OffscreenCanvas(1, 1);
  let ctx = canvas.getContext('2d');
  if (!ctx) return;
  const font = `600 ${place.size}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width + 2 * place.pad), h = Math.ceil(place.size * 1.4 + 2 * place.pad);
  const x = Math.round(place.align === 'right' ? place.x - w : place.align === 'center' ? place.x - w / 2 : place.x - place.pad);
  const y = Math.round(place.y - h / 2);
  const rect = storedRect(picture.turns, width, height, { x, y, w, h });
  canvas.width = rect.w;
  canvas.height = rect.h;
  ctx = canvas.getContext('2d')!;
  const m = uprightToStored(picture.turns, rect.w, rect.h);
  ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
  ctx.font = font;
  ctx.textBaseline = 'middle';
  if (place.shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = Math.max(2, place.size / 4);
  }
  ctx.fillStyle = place.color;
  ctx.fillText(text, place.pad, h / 2);
  blend(e, picture, ctx.getImageData(0, 0, rect.w, rect.h), Math.max(0, rect.x), Math.max(0, rect.y));
}

// ---- Messages ----------------------------------------------------------------------------------------

/** The newest preview of each photo: an older request that has not started is skipped. */
const latest = new Map<string, number>();
let queue: Promise<unknown> = Promise.resolve();
const enqueue = (task: () => Promise<void>) => (queue = queue.then(task));

self.onmessage = ({ data }: MessageEvent<Request>) => {
  switch (data.type) {
    case 'init':
      module = data.module;
      return;
    case 'close':
      open.delete(data.id);
      for (const key of latest.keys()) if (key.startsWith(`${data.id}:`)) latest.delete(key);
      return;
    case 'open':
      enqueue(() => openPhoto(data.id, data.file, data.side, data.standard).catch((error: unknown) => post({ type: 'error', id: data.id, message: messageOf(error) })));
      return;
    case 'preview':
      latest.set(`${data.id}:${data.channel}`, data.seq);
      enqueue(async () => {
        if (latest.get(`${data.id}:${data.channel}`) !== data.seq) return;
        const t0 = performance.now();
        try {
          const { image, margins } = await preview(data.id, data.settings, data.urls, data.thumb);
          post({ type: 'preview', id: data.id, seq: data.seq, channel: data.channel, image, margins, ms: Math.round(performance.now() - t0) }, [image]);
        } catch (error) {
          post({ type: 'error', id: data.id, seq: data.seq, channel: data.channel, message: messageOf(error) });
        }
      });
      return;
    case 'export': {
      const t0 = performance.now();
      exportPhoto(data.id, data.file, data.settings, data.urls, data.maxSide, data.credit, data.seed, data.processSide).then(
        (result) => post({ type: 'exported', id: data.id, ...result, ms: Math.round(performance.now() - t0) }),
        (error: unknown) => post({ type: 'error', id: data.id, message: messageOf(error) }),
      );
      return;
    }
  }
};
