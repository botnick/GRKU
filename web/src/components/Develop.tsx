// The Develop page: the film looks and the modules of GRKU on photos that the visitor already has.
// The photos stay in the browser: the workers of src/develop/ develop them with the module code of
// the camera (develop.wasm), and the page saves the JPEGs that they make.
//
// It is made for someone new to all this, on a phone: three steps (a photo, a look, save), the
// popular looks first, the styles as cards with a preview, one big Save button, and the camera's
// own controls folded away under Adjust more.
import { Ban, Check, ChevronRight, Share, ChevronDown, CircleCheck, Copy, Download, ImagePlus, Info, Loader2, Lock, MapPinOff, Plus, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { PREVIEW_TARGET } from '../cameras';
import { effectUrl, type CatalogEffect } from '../catalog';
import { Developer, previewSide, processSide, SMALL_SIDE, type Phase } from '../develop/client';
import { canDownload, developPlus, freeLook, limitsOf, FREE_SIDE, PLUS_PHOTOS } from '../develop/gating';
import { installQuery } from '../develop/install';
import { photoSeed, type LookUrls, type Opened } from '../develop/protocol';
import { childTitle, labelOf, menuOf, recipeLines, recipeText, settingsFromParams, settingsParam, valueNames } from '../develop/recipe';
import { applyPreset, autoGrainSize, isOn, MODULE_NAMES, OFF, presetOf, PRESETS, PRESET_IDS, readSettings, type DevelopSettings, type ModuleName, type PresetId } from '../develop/settings';
import { DEVELOP_STRINGS, format, type DevelopText } from '../develop/strings';
import { faqOf, POPULAR_LOOKS } from '../develop/seo';
import { MODULE_TILES, VALUE_TILES } from '../develop/tiles';
import { developedName, uniqueName, zipParts } from '../develop/zip';
import { FILM_KINDS, filmKind, type FilmKind } from '../filmKind';
import type { Language, Strings } from '../i18n';
import { landingPicture } from '../landing';
import { pagePath } from '../languagePage';
import type { ModuleKey } from '../modules';
import { PRICES, type Entitlement } from '../plus';
import { useCatalog } from '../useCatalog';
import { CompareView } from './CompareView';
import { EffectIcon } from './EffectIcon';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const SETTINGS_KEY = 'grku.develop';
const FIRST_LOOK = 'positive-film-grii-v1';
const DEFAULT_SETTINGS: DevelopSettings = { look: FIRST_LOOK, ...structuredClone(PRESETS.natural) };
/** The looks that most people start from, first on the shelf. */
const POPULAR: readonly string[] = POPULAR_LOOKS.map((look) => look.id);
/** The looks of the first page of All looks; Show more adds two pages. */
const LOOK_PAGE = 12;
/** The long side of the preview on the card of a style. */
const STYLE_THUMB = 240;

/** Whether an export failed for lack of memory (a worker that ends without a message says "memory"). */
const isMemory = (error: unknown) => error instanceof Error && /memory|allocation|range/i.test(error.message);

/** Whether this is a phone or tablet that can share the file: then the share sheet saves it. */
function shareable(file: File): boolean {
  try {
    return matchMedia('(pointer: coarse)').matches && !!navigator.canShare?.({ files: [file] });
  } catch {
    return false;
  }
}

/** The day a file was last changed, for the tooltip of its thumbnail. */
const dateOf = (file: File) => new Date(file.lastModified).toISOString().slice(0, 16).replace('T', ' ');

interface Photo {
  key: number;
  file: File;
  /** The ID of the photo in the preview worker, once it opened. */
  id: number | null;
  opened: Opened | null;
  error: boolean;
}

interface Shown {
  key: number;
  image: ImageBitmap;
  margins: [number, number, number, number];
  ms: number;
}

type Task =
  | { state: 'idle' }
  | { state: 'running'; index: number; total: number; name: string; phase: Phase; fraction: number; start: number }
  | { state: 'done'; text: string }
  | { state: 'failed'; text: string };

/** The share of each phase in the progress of one photo. */
const PHASE_WEIGHT: Readonly<Record<Phase, number>> = { decode: 0.2, colour: 0.25, modules: 0.3, encode: 0.25 };
const PHASES: readonly Phase[] = ['decode', 'colour', 'modules', 'encode'];

function loadSettings(): DevelopSettings {
  if (typeof location === 'undefined') return DEFAULT_SETTINGS;
  const stored = (() => {
    try {
      const value = localStorage.getItem(SETTINGS_KEY);
      return value ? readSettings(JSON.parse(value), DEFAULT_SETTINGS) : null;
    } catch {
      return null;
    }
  })();
  return settingsFromParams(new URLSearchParams(location.search), stored ?? DEFAULT_SETTINGS) ?? stored ?? DEFAULT_SETTINGS;
}

function saveSettings(settings: DevelopSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // A convenience: without storage, the next visit starts from the default.
  }
}

function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

const accepted = (file: File) => /^image\//.test(file.type) || /\.(jpe?g|png|heic|heif|webp|avif|dng)$/i.test(file.name);

/** The name of a kind of film in the filters. */
function kindLabel(kind: FilmKind, t: Strings): string {
  switch (kind) {
    case 'negative':
      return t.kindNegative;
    case 'slide':
      return t.kindSlide;
    case 'mono':
      return t.kindMono;
    case 'cine':
      return t.kindCine;
    case 'instant':
      return t.kindInstant;
    case 'camera':
      return t.kindCamera;
    case 'imported':
      return t.kindImported;
  }
}

/** An ImageBitmap on a canvas of its size, which CSS fits into its box. */
function BitmapCanvas({ draw, width, height, className, label }: { draw: (ctx: CanvasRenderingContext2D) => void; width: number; height: number; className?: string; label?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (ctx) draw(ctx);
  }, [draw]);
  return <canvas ref={ref} width={width} height={height} className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} />;
}

/** A small thumbnail of a photo file, made by the browser at its size. */
function Thumbnail({ file }: { file: File }) {
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  useEffect(() => {
    let live = true;
    let made: ImageBitmap | null = null;
    if (/\.dng$/i.test(file.name)) return;
    createImageBitmap(file, { resizeHeight: 112, resizeQuality: 'medium' }).then(
      (image) => {
        made = image;
        if (live) setBitmap(image);
        else image.close();
      },
      () => undefined,
    );
    return () => {
      live = false;
      made?.close();
    };
  }, [file]);
  const draw = useCallback((ctx: CanvasRenderingContext2D) => bitmap && ctx.drawImage(bitmap, 0, 0), [bitmap]);
  if (!bitmap) return <span className="flex size-full items-center justify-center font-mono text-[10px] text-muted-foreground">{file.name.split('.').pop()?.toUpperCase()}</span>;
  return <BitmapCanvas draw={draw} width={bitmap.width} height={bitmap.height} className="size-full object-cover" />;
}

/** A native select with the look of the site's inputs. */
function Field({ label, value, options, onChange, disabled, note }: { label: string; value: number; options: readonly string[]; onChange: (value: number) => void; disabled?: boolean; note?: ReactNode }) {
  return (
    <label className={cn('flex min-w-0 flex-col gap-1 text-[14px]', disabled && 'opacity-50')}>
      <span className="text-muted-foreground">{label}</span>
      <select
        className="h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-[16px] text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {options.map((option, index) => (
          <option key={index} value={index}>
            {option}
          </option>
        ))}
      </select>
      {note && <span className="text-[14px] leading-snug text-muted-foreground">{note}</span>}
    </label>
  );
}

/** The site key of each module of the page, for its plain line (t.site.plain). */
const MODULE_KEYS: Readonly<Record<ModuleName, ModuleKey>> = { grain: 'grain', glow: 'glow', leak: 'lightLeak', diffusion: 'diffusion', date: 'dateStamp', border: 'border' };

/** The three steps of the page, the current one marked. */
function Steps({ d, step }: { d: DevelopText; step: 1 | 2 | 3 }) {
  return (
    <ol className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-[14px]" aria-label={d.stepsLabel}>
      {[d.step1, d.step2, d.step3].map((text, index) => {
        const n = (index + 1) as 1 | 2 | 3;
        const state = n < step ? 'done' : n === step ? 'now' : 'next';
        return (
          <li key={text} className="flex items-center gap-1.5" aria-current={state === 'now' ? 'step' : undefined}>
            {index > 0 && <span className="h-px w-3 bg-border sm:w-5" aria-hidden="true" />}
            <span
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold tabular-nums',
                state === 'now' ? 'bg-foreground text-background' : state === 'done' ? 'bg-brand/15 text-brand-text' : 'bg-muted text-muted-foreground',
              )}
            >
              {state === 'done' ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : n}
            </span>
            <span className={cn(state === 'now' ? 'font-semibold text-foreground' : 'text-muted-foreground')}>{text}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** The values of a setting as the camera's ADJ tiles, each with its name; the chosen one ringed. */
function TileChoice({ label, value, tiles, names, onChange }: { label: string; value: number; tiles: readonly string[]; names: readonly string[]; onChange: (value: number) => void }) {
  return (
    <div className="col-span-2 flex flex-col gap-1.5">
      <span className="text-[14px] text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {tiles.map((tile, index) => (
          <button
            key={index}
            type="button"
            role="radio"
            aria-checked={value === index}
            onClick={() => onChange(index)}
            title={names[index]}
            className="flex w-[60px] flex-col items-center gap-1 rounded-lg p-1.5 text-center outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring aria-checked:bg-accent aria-checked:ring-2 aria-checked:ring-foreground"
          >
            {/* 40 x 40 camera pixels at 1x or 2x: crisp at every density. */}
            <img src={tile} alt="" width="40" height="40" className="size-10 rounded-[3px] [image-rendering:pixelated]" />
            <span className="line-clamp-2 text-[12px] leading-tight">{names[index]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** The example of the empty page: a GR photo of the home page, before and after Portra 400. */
function Example({ d }: { d: DevelopText }) {
  const [split, setSplit] = useState(50);
  const sizes = '(min-width: 1024px) 480px, calc(100vw - 32px)';
  return (
    <figure className="m-0">
      <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-muted ring-1 ring-border">
        <CompareView
          position={split}
          onPosition={setSplit}
          label={d.compare}
          before={<img {...landingPicture('hero/achensee-standard.jpg', sizes)} alt={d.before} width="1200" height="800" draggable={false} fetchPriority="high" className="size-full object-cover" />}
          after={<img {...landingPicture('hero/achensee-portra-400.jpg', sizes)} alt={`${d.after}: Portra 400`} width="1200" height="800" draggable={false} className="size-full object-cover" />}
        />
        <span className="pointer-events-none absolute top-3 left-3 z-[2] rounded-md bg-black/60 px-2 py-1 text-xs text-white/85 backdrop-blur-sm">{d.before}</span>
        <span className="pointer-events-none absolute top-3 right-3 z-[2] rounded-md bg-black/60 px-2.5 py-1 text-sm font-semibold text-white backdrop-blur-sm">Portra 400</span>
      </div>
      <figcaption className="mt-2 text-[14px] text-muted-foreground">{d.example}</figcaption>
    </figure>
  );
}

/** A box of the shelf: the film box, its name, a lock for a Plus look. */
function LookButton({ effect, chosen, locked, lockText, onChoose, big }: { effect: CatalogEffect; chosen: boolean; locked: boolean; lockText: string; onChoose: () => void; big?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={chosen}
      onClick={onChoose}
      title={locked ? `${effect.name} · ${lockText}` : effect.name}
      className="relative flex h-full min-h-[44px] w-full flex-col items-center gap-1 rounded-lg border bg-background p-1.5 pt-2 text-center outline-none transition-colors hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-foreground aria-pressed:ring-2 aria-pressed:ring-foreground"
    >
      <EffectIcon effect={effect} className={big ? 'size-12' : 'size-11'} />
      <span className="line-clamp-2 text-[12px] leading-[1.2] font-medium">{effect.name}</span>
      {locked && (
        <span className="absolute top-1 right-1 flex size-[18px] items-center justify-center rounded-full bg-foreground/70 text-background" aria-label={lockText}>
          <Lock className="size-2.5" aria-hidden="true" />
        </span>
      )}
    </button>
  );
}

export function Develop({ strings: t, language, owned, onPlus }: { strings: Strings; language: Language; owned: Entitlement; onPlus: () => void }) {
  const d: DevelopText = DEVELOP_STRINGS[language];
  const { catalog, error: catalogError, retry } = useCatalog(PREVIEW_TARGET);
  const [settings, setSettingsState] = useState<DevelopSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setSettingsState(loadSettings());
    setReady(true);
  }, []);
  const setSettings = useCallback((next: DevelopSettings) => {
    setSettingsState(next);
    saveSettings(next);
  }, []);
  const update = <M extends ModuleName>(module: M, patch: Partial<DevelopSettings[M]>) => setSettings({ ...settings, [module]: { ...settings[module], ...patch } });

  const plus = developPlus(owned);
  const limits = limitsOf(owned);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const [shown, setShown] = useState<Shown | null>(null);
  const [rendering, setRendering] = useState(false);
  const [overLimit, setOverLimit] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [task, setTask] = useState<Task>({ state: 'idle' });
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(0);
  const developer = useRef<Developer | null>(null);
  const nextKey = useRef(0);
  const abort = useRef<AbortController | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      developer.current?.dispose();
      abort.current?.abort();
    },
    [],
  );
  const getDeveloper = () => (developer.current ??= new Developer());

  const effects = useMemo(() => catalog?.effects ?? [], [catalog]);
  const lookEffect: CatalogEffect | null = effects.find((effect) => effect.id === settings.look) ?? null;
  const urls: LookUrls | null = catalog
    ? {
        look: lookEffect ? effectUrl(catalog.target, lookEffect.preview) : null,
        standard: effectUrl(catalog.target, catalog.baseline),
        monochrome: !!lookEffect?.monochrome,
      }
    : null;
  const lookName = lookEffect?.name ?? null;
  const allowed = canDownload(lookEffect, owned);

  // ---- Photos ----
  function addFiles(list: Iterable<File>) {
    const files = [...list].filter(accepted);
    if (!files.length) return;
    const room = limits.photos - photos.length;
    setOverLimit(files.length > room);
    const added = files.slice(0, Math.max(0, room)).map((file) => ({ key: ++nextKey.current, file, id: null, opened: null, error: false }));
    if (!added.length) return;
    setPhotos((list) => [...list, ...added]);
    setCurrent((key) => key ?? added[0]!.key);
    setTask({ state: 'idle' });
  }

  function removePhoto(key: number) {
    const photo = photos.find((item) => item.key === key);
    if (photo?.id) developer.current?.close(photo.id);
    const rest = photos.filter((item) => item.key !== key);
    setPhotos(rest);
    setOverLimit(false);
    if (current === key) {
      setCurrent(rest[0]?.key ?? null);
      setShown(null);
    }
  }

  const photo = photos.find((item) => item.key === current) ?? null;
  const viewer = useRef<HTMLDivElement>(null);
  const hadPhotos = useRef(false);
  useEffect(() => {
    if (photos.length > 0 && !hadPhotos.current) viewer.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    hadPhotos.current = photos.length > 0;
  }, [photos.length]);

  // Opens the shown photo in the preview worker; a few stay open, the others close.
  useEffect(() => {
    if (!photo || photo.id !== null || photo.error || !urls) return;
    let live = true;
    const key = photo.key;
    getDeveloper()
      .open(photo.file, previewSide(), urls.standard)
      .then(
        ({ id, photo: opened }) => {
          if (!live) {
            developer.current?.close(id);
            opened.before.close();
            return;
          }
          setPhotos((list) => {
            const open = list.filter((item) => item.id !== null && item.key !== key);
            // Keep three photos open in the worker.
            const closing = open.slice(0, Math.max(0, open.length - 2));
            for (const old of closing) {
              developer.current?.close(old.id!);
              old.opened?.before.close();
            }
            const closed = new Set(closing.map((item) => item.key));
            return list.map((item) => (item.key === key ? { ...item, id, opened } : closed.has(item.key) ? { ...item, id: null, opened: null } : item));
          });
        },
        () => live && setPhotos((list) => list.map((item) => (item.key === key ? { ...item, error: true } : item))),
      );
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo?.key, photo?.id, photo?.error, !!urls]);

  // The preview follows the settings, a moment after the last change.
  const settingsKey = JSON.stringify(settings);
  useEffect(() => {
    if (!photo?.id || !urls || !ready) return;
    let live = true;
    setRendering(true);
    const id = photo.id, key = photo.key;
    const timer = setTimeout(() => {
      getDeveloper()
        .preview(id, settings, urls)
        .then(
          (result) => {
            if (!result) return;
            if (!live) return result.image.close();
            setShown((old) => {
              old?.image.close();
              return { key, image: result.image, margins: result.margins, ms: result.ms };
            });
            setRendering(false);
          },
          () => live && setRendering(false),
        );
    }, 40);
    return () => {
      live = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo?.id, settingsKey, urls?.look, urls?.standard, ready]);

  // The cards of the styles: each style with the chosen look on this photo, small, after the
  // preview, in the same worker queue.
  const [styleThumbs, setStyleThumbs] = useState<Partial<Record<PresetId, ImageBitmap>>>({});
  useEffect(() => {
    if (!photo?.id || !urls || !ready) return;
    let live = true;
    const id = photo.id;
    const timer = setTimeout(() => {
      for (const preset of PRESET_IDS) {
        getDeveloper()
          .preview(id, applyPreset(settings, preset), urls, `style-${preset}`, STYLE_THUMB)
          .then(
            (result) => {
              if (!result) return;
              if (!live) return result.image.close();
              setStyleThumbs((old) => {
                old[preset]?.close();
                return { ...old, [preset]: result.image };
              });
            },
            () => undefined,
          );
      }
    }, 300);
    return () => {
      live = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo?.id, urls?.look, urls?.standard, ready]);

  // ---- Saving ----
  const busy = task.state === 'running';
  // The seconds of a save, counted while it runs.
  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [busy]);

  // The last saved photo of a phone, for the share sheet: a share needs a tap of its own when the
  // save took longer than the browser keeps the first tap.
  const [share, setShare] = useState<File | null>(null);
  useEffect(() => setShare(null), [settingsKey, current]);
  async function shareFile(file: File) {
    try {
      await navigator.share({ files: [file] });
    } catch {
      // Cancelled, or the tap expired: the Save to Photos button stays.
    }
  }

  async function download(all: boolean) {
    if (!urls || busy) return;
    if (!allowed) return onPlus();
    const list = all ? photos.filter((item) => !item.error) : photo ? [photo] : [];
    if (!list.length) return;
    const controller = new AbortController();
    abort.current = controller;
    const results: { name: string; bytes: Uint8Array }[] = [];
    const names = new Set<string>();
    const start = Date.now();
    setNow(start);
    setShare(null);
    let name = '';
    let reduced: number | null = null;
    try {
      for (const [index, item] of list.entries()) {
        name = uniqueName(developedName(item.file.name, lookName), names);
        setTask({ state: 'running', index, total: list.length, name, phase: 'decode', fraction: 0, start });
        const run = (side: number | null) =>
          getDeveloper().export(
            item.file,
            settings,
            urls,
            { maxSide: limits.maxSide, credit: limits.credit, seed: photoSeed(item.file), processSide: side },
            (phase, fraction) => setTask({ state: 'running', index, total: list.length, name, phase, fraction, start }),
            controller.signal,
          );
        // A phone with little memory develops a smaller picture, and any device that runs out of
        // memory tries once more at a smaller size.
        let side = processSide();
        let result;
        try {
          result = await run(side);
        } catch (error) {
          if (controller.signal.aborted || !isMemory(error) || (side !== null && side <= SMALL_SIDE)) throw error;
          side = SMALL_SIDE;
          result = await run(side);
        }
        if (side !== null && limits.maxSide === null) reduced = side;
        if (list.length === 1) {
          const done = reduced ? `${d.saved} · ${format(d.deviceLimit, { side: reduced })}` : d.saved;
          // On a phone, the share sheet saves to the photo library ("Save to Photos" on iPhone).
          const file = new File([result.blob], name, { type: 'image/jpeg' });
          if (shareable(file)) {
            setShare(file);
            setTask({ state: 'done', text: done });
            await shareFile(file);
            return;
          }
          save(result.blob, name);
          setTask({ state: 'done', text: done });
          return;
        }
        results.push({ name, bytes: new Uint8Array(await result.blob.arrayBuffer()) });
      }
      const stamp = new Date().toISOString().slice(0, 10);
      save(new Blob(zipParts(results), { type: 'application/zip' }), `GRKU-${stamp}.zip`);
      const all = format(d.savedAll, { n: results.length });
      setTask({ state: 'done', text: reduced ? `${all} · ${format(d.deviceLimit, { side: reduced })}` : all });
    } catch (error) {
      if (controller.signal.aborted) return setTask({ state: 'idle' });
      setTask({ state: 'failed', text: format(isMemory(error) ? d.memory : d.failed, { name }) });
    } finally {
      abort.current = null;
    }
  }

  const lines = recipeLines(settings, language, t.moduleNames.filmLook, lookName, d.noLook);
  async function copyRecipe() {
    const text = `${recipeText(lines)}\n\n${location.origin}${pagePath(language, 'develop')}?look=${settings.look ?? ''}&m=${settingsParam(settings)}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Without the clipboard, the text stays on the page to copy by hand.
    }
  }

  // ---- The shelf ----
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<FilmKind | 'all'>('all');
  // The grid shows a page of looks, and more on request: no scroll area inside the panel.
  const [shownCount, setShownCount] = useState(LOOK_PAGE);
  const [sheet, setSheet] = useState(false);
  const kinds = FILM_KINDS.filter((item) => effects.some((effect) => filmKind(effect) === item));
  const needle = query.trim().toLowerCase();
  const visible = effects.filter(
    (effect) =>
      (kind === 'all' || filmKind(effect) === kind) &&
      (!needle || `${effect.name} ${effect.cover?.brand ?? ''} ${effect.cover?.name ?? ''} ${effect.look}`.toLowerCase().includes(needle)),
  );
  // A new search or kind starts again at the first page.
  const filterKey = `${needle}\n${kind}`;
  const [lastFilter, setLastFilter] = useState(filterKey);
  if (lastFilter !== filterKey) {
    setLastFilter(filterKey);
    setShownCount(LOOK_PAGE);
  }
  const pageLooks = visible.slice(0, shownCount);
  const moreLooks = visible.length - pageLooks.length;
  const popular = POPULAR.map((id) => effects.find((effect) => effect.id === id)).filter((effect): effect is CatalogEffect => !!effect);
  const locked = (effect: CatalogEffect) => !plus && !freeLook(effect);
  const anyLocked = !plus && effects.some((effect) => !freeLook(effect));

  const preset = presetOf(settings);
  const presetName: Record<PresetId, [string, string]> = {
    natural: [d.presetNatural, d.presetNaturalText],
    snapshot: [d.presetSnapshot, d.presetSnapshotText],
    dreamy: [d.presetDreamy, d.presetDreamyText],
    date: [d.presetDate, d.presetDateText],
    instant: [d.presetInstant, d.presetInstantText],
  };

  // ---- The viewer ----
  const opened = photo?.opened ?? null;
  const view = shown && shown.key === photo?.key && opened ? shown : null;
  const black = settings.border.color === 1;
  const drawAfter = useCallback((ctx: CanvasRenderingContext2D) => view && ctx.drawImage(view.image, 0, 0), [view]);
  const drawBefore = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!view || !opened) return;
      const [l, top, r, b] = view.margins;
      ctx.fillStyle = black ? '#000' : '#fff';
      ctx.fillRect(0, 0, view.image.width, view.image.height);
      ctx.drawImage(opened.before, l, top, view.image.width - l - r, view.image.height - top - b);
    },
    [view, opened, black],
  );
  // The divider of the before-and-after view, in percent from the left.
  const [split, setSplit] = useState(50);

  const note = opened
    ? opened.fidelity === 'exact'
      ? d.noteExact
      : opened.fidelity === 'otherControl'
        ? format(d.noteControl, { control: opened.imageControl ?? '' })
        : opened.fidelity === 'raw'
          ? d.noteRaw
          : d.noteOther
    : null;

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };
  const onChoose = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = '';
  };

  const progress =
    task.state === 'running'
      ? ((task.index + PHASES.slice(0, PHASES.indexOf(task.phase)).reduce((sum, phase) => sum + PHASE_WEIGHT[phase], 0) + PHASE_WEIGHT[task.phase] * task.fraction) / task.total) * 100
      : 0;
  const seconds = task.state === 'running' ? Math.max(0, Math.floor((now - task.start) / 1000)) : 0;
  const status =
    task.state === 'running'
      ? task.total > 1
        ? format(d.savingOf, { i: task.index + 1, n: task.total, s: seconds })
        : format(d.saving, { s: seconds })
      : task.state === 'done' || task.state === 'failed'
        ? task.text
        : null;
  const step: 1 | 2 | 3 = photos.length === 0 ? 1 : task.state === 'idle' ? 2 : 3;

  const SECTION = 'rounded-xl border bg-card p-4';
  const H2 = 'text-[16px] font-semibold tracking-[-0.01em]';

  const saveButton = (wide: boolean) =>
    share && !busy ? (
      <Button type="button" size="lg" className={cn('h-11 rounded-lg text-[15px]', wide && 'w-full')} onClick={() => shareFile(share)}>
        <Share aria-hidden="true" />
        {d.shareSave}
      </Button>
    ) : (
    <Button
      type="button"
      size="lg"
      variant={allowed ? 'default' : 'brand'}
      className={cn('h-11 rounded-lg text-[15px]', wide && 'w-full')}
      disabled={busy || !photo?.opened}
      onClick={() => download(false)}
    >
      {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : allowed ? <Download aria-hidden="true" /> : <Lock aria-hidden="true" />}
      {allowed ? d.save : d.savePlus}
    </Button>
    );

  const plusCard = (
    <section className={cn(SECTION, 'border-brand/40')} aria-labelledby="develop-plus">
      {plus ? (
        <p className="flex items-start gap-2 text-[14px]">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-brand-text" aria-hidden="true" />
          {d.plusHave}
        </p>
      ) : (
        <>
          <h2 id="develop-plus" className={cn(H2, 'flex items-center gap-2')}>
            <Sparkles className="size-4 text-brand-text" aria-hidden="true" />
            {d.plusTitle}
          </h2>
          <ul className="mt-3 flex flex-col gap-1.5 text-[14px]">
            {[d.plusLine1, d.plusLine2, d.plusLine3, format(d.plusLine4, { n: PLUS_PHOTOS })].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-brand-text" aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="button" variant="brand" className="h-11 rounded-lg" onClick={onPlus}>
              {d.plusCta}
            </Button>
            <span className="text-[14px] text-muted-foreground tabular-nums">{format(d.plusPrice, { price: Math.min(...Object.values(PRICES)) })}</span>
          </div>
        </>
      )}
    </section>
  );

  const recipe = (place: string) => (
    <section className={SECTION} aria-labelledby={`develop-recipe-${place}`}>
      <h2 id={`develop-recipe-${place}`} className={H2}>
        {d.recipe}
      </h2>
      <p className="mt-1 text-[14px] text-muted-foreground">{d.recipeLead}</p>
      <dl className="mt-4 grid gap-x-4 gap-y-2 text-[14px] sm:grid-cols-[max-content_1fr]">
        {lines.map((line) => (
          <div key={line.module} className="contents">
            <dt className="font-medium">{line.title}</dt>
            <dd className="text-muted-foreground">{line.values.join(' · ')}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="h-11 rounded-lg" onClick={copyRecipe} aria-live="polite">
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? d.copied : d.copy}
        </Button>
        <Button asChild variant="outline" className="h-11 rounded-lg">
          <a href={`${pagePath(language, 'install')}${installQuery(settings)}`}>{d.install}</a>
        </Button>
      </div>
    </section>
  );

  // Choosing a look in the sheet of a phone closes it: the photo shows the look.
  const chooseLook = (look: string | null) => {
    setSettings({ ...settings, look });
    setSheet(false);
  };
  const allLooks = (
    <>
              <Input type="search" className="mt-2 h-11 rounded-lg bg-background text-[16px]" placeholder={d.search} aria-label={d.search} value={query} onChange={(event) => setQuery(event.target.value)} />
              <div className="mt-2.5 flex flex-wrap gap-1.5" role="group" aria-label={d.allLooks}>
                {(['all', ...kinds] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={kind === item}
                    onClick={() => setKind(item)}
                    className="h-11 rounded-full border px-3.5 text-[14px] whitespace-nowrap text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
                  >
                    {item === 'all' ? t.filterAll : kindLabel(item, t)}
                  </button>
                ))}
              </div>
              {catalogError && (
                <p className="mt-3 text-[14px] text-destructive">
                  {t.loadError}{' '}
                  <Button type="button" variant="link" className="h-auto p-0" onClick={retry}>
                    {t.retryLoad}
                  </Button>
                </p>
              )}
              <ul className="mt-3 grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-4" aria-label={d.allLooks}>
                {!needle && kind === 'all' && (
                  <li>
                    <button
                      type="button"
                      aria-pressed={settings.look === null}
                      onClick={() => chooseLook(null)}
                      className="flex h-full min-h-[44px] w-full flex-col items-center gap-1 rounded-lg border bg-background p-1.5 pt-2 text-center outline-none hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-foreground aria-pressed:ring-2 aria-pressed:ring-foreground"
                    >
                      <span className="flex size-11 items-center justify-center rounded-md border border-dashed text-muted-foreground">
                        <Ban className="size-4" aria-hidden="true" />
                      </span>
                      <span className="line-clamp-2 text-[12px] leading-[1.2] font-medium">{d.noLook}</span>
                    </button>
                  </li>
                )}
                {!catalog && !catalogError && Array.from({ length: 12 }, (_, index) => <li key={index} className="aspect-[5/6] animate-pulse rounded-xl border bg-background" aria-hidden="true" />)}
                {pageLooks.map((effect) => (
                  <li key={effect.id}>
                    <LookButton effect={effect} chosen={settings.look === effect.id} locked={locked(effect)} lockText={d.lockedLook} onChoose={() => chooseLook(effect.id)} />
                  </li>
                ))}
              </ul>
              {moreLooks > 0 && (
                <Button type="button" variant="outline" className="mt-3 h-11 w-full rounded-lg" onClick={() => setShownCount((count) => count + LOOK_PAGE * 2)}>
                  {format(d.showMore, { n: moreLooks })}
                </Button>
              )}
    </>
  );

  /** The popular looks in one row for a phone, with the next box cut at the edge to show that it scrolls. */
  const lookRow = (
    <section className="lg:hidden" aria-labelledby="develop-look-row">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="develop-look-row" className={H2}>
          {d.lookTitle}
        </h2>
        <Button type="button" variant="ghost" className="-mr-2 h-11 px-2 text-[14px]" onClick={() => setSheet(true)}>
          {d.allLooks}
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
      <ul
        className="-mx-gutter mt-1 flex snap-x snap-mandatory scroll-px-gutter gap-2 overflow-x-auto px-gutter pb-1 [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-36px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={d.popular}
      >
        {popular.map((effect) => (
          <li key={effect.id} className="w-[84px] shrink-0 snap-start">
            <LookButton effect={effect} big chosen={settings.look === effect.id} locked={locked(effect)} lockText={d.lockedLook} onChoose={() => setSettings({ ...settings, look: effect.id })} />
          </li>
        ))}
        {/* The chosen look, when it is not one of the popular ones. */}
        {lookEffect && !popular.includes(lookEffect) && (
          <li className="w-[84px] shrink-0 snap-start">
            <LookButton effect={lookEffect} big chosen locked={locked(lookEffect)} lockText={d.lockedLook} onChoose={() => undefined} />
          </li>
        )}
        <li className="w-[84px] shrink-0 snap-start">
          <button
            type="button"
            onClick={() => setSheet(true)}
            className="flex h-full min-h-[44px] w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-[12px] font-medium text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
            {d.allLooks}
          </button>
        </li>
      </ul>
      {anyLocked && (
        <p className="mt-1.5 flex items-start gap-1.5 text-[14px] text-muted-foreground">
          <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {d.lockLine}
        </p>
      )}
      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent side="bottom" className="h-[92dvh] gap-0 rounded-t-xl p-0" onOpenAutoFocus={(event) => event.preventDefault()}>
          <SheetHeader className="border-b pr-12">
            <SheetTitle className="text-[17px]">{d.allLooks}</SheetTitle>
            <SheetDescription className="text-[14px]">{d.lookTitle}</SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto overscroll-contain px-4 pt-1 pb-[max(16px,env(safe-area-inset-bottom))]">{allLooks}</div>
        </SheetContent>
      </Sheet>
    </section>
  );

  const adjust = (
    <details className={cn(SECTION, 'group/adjust p-0 sm:p-0')}>
      <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-5 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-3">
          <span className="flex -space-x-2" aria-hidden="true">
            {(['grain', 'glow', 'date'] as const).map((module) => (
              <img key={module} src={MODULE_TILES[module]} alt="" width="40" height="40" className="size-7 rounded-[4px] ring-2 ring-card [image-rendering:pixelated]" />
            ))}
          </span>
          <span className={H2}>{d.adjust}</span>
        </span>
        <ChevronDown className="size-5 text-muted-foreground transition-transform group-open/adjust:rotate-180" aria-hidden="true" />
      </summary>
      <div className="border-t px-4 pb-4 sm:px-5">
        <div className="flex items-start justify-between gap-3 pt-3">
          <p className="text-[14px] text-muted-foreground">{d.adjustLead}</p>
          <Button type="button" variant="ghost" size="sm" className="shrink-0 text-muted-foreground" disabled={!MODULE_NAMES.some((module) => isOn(settings, module))} onClick={() => setSettings({ ...OFF, look: settings.look })}>
            {d.allOff}
          </Button>
        </div>
        <div className="mt-1 flex flex-col divide-y">
          {(['glow', 'leak', 'diffusion', 'grain', 'date', 'border'] as const).map((module) => {
            const menu = menuOf(language, module);
            const on = isOn(settings, module);
            const values = (key: string) => valueNames(language, module, key);
            const rows = valueNames(language, module, 'rows');
            return (
              <fieldset key={module} className="flex flex-col gap-3 py-4">
                <legend className="contents">
                  <span className="flex items-center gap-2.5">
                    <img src={MODULE_TILES[module]} alt="" width="40" height="40" className="size-8 rounded-[3px] [image-rendering:pixelated]" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-[15px] font-semibold">{menu.title}</span>
                      <span className="text-[14px] leading-snug text-muted-foreground">{t.site.plain[MODULE_KEYS[module]]}</span>
                    </span>
                    <span className={cn('rounded-full px-2 py-0.5 text-[12px] font-medium', on ? 'bg-brand/15 text-brand-text' : 'bg-muted text-muted-foreground')}>{on ? d.on : d.off}</span>
                  </span>
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  {module === 'grain' && (
                    <>
                      <TileChoice label={labelOf(language, 'grain', 'CORE.GRAIN')} value={settings.grain.level} tiles={VALUE_TILES.grainLevel} names={rows} onChange={(level) => update('grain', { level })} />
                      {on && (
                        <Field
                          label={labelOf(language, 'grain', 'CORE.GRAIN_SIZE')}
                          value={settings.grain.size}
                          options={values('CORE.GRAIN_SIZE')}
                          onChange={(size) => update('grain', { size })}
                          note={settings.grain.size === 0 ? format(d.autoSize, { size: values('CORE.GRAIN_SIZE')[autoGrainSize(opened?.iso ?? null)] ?? '' }) : `${labelOf(language, 'grain', 'STYLE')}: ${values('STYLE')[1]}`}
                        />
                      )}
                    </>
                  )}
                  {module === 'glow' && (
                    <>
                      <TileChoice label={childTitle(language, 'glow', 'BLOOM')} value={settings.glow.bloom} tiles={VALUE_TILES.bloom} names={values('BLOOM')} onChange={(bloom) => update('glow', { bloom })} />
                      <TileChoice label={childTitle(language, 'glow', 'HALATION')} value={settings.glow.halation} tiles={VALUE_TILES.halation} names={values('HALATION')} onChange={(halation) => update('glow', { halation })} />
                      {settings.glow.halation > 0 && !lookEffect?.monochrome && (
                        <Field label={labelOf(language, 'glow', 'HALATION_COLOR')} value={settings.glow.color} options={values('HALATION_COLOR')} onChange={(color) => update('glow', { color })} />
                      )}
                    </>
                  )}
                  {module === 'leak' && (
                    <>
                      <TileChoice label={labelOf(language, 'leak', 'LOOK')} value={settings.leak.look} tiles={VALUE_TILES.leakLook} names={rows} onChange={(look) => update('leak', { look })} />
                      {settings.leak.look === 1 &&
                        (['VIGNETTE', 'DUST', 'LEAK', 'SCRATCH'] as const).map((key) => {
                          const field = ({ VIGNETTE: 'vignette', DUST: 'dust', LEAK: 'leak', SCRATCH: 'scratches' } as const)[key];
                          return <Field key={key} label={labelOf(language, 'leak', key)} value={settings.leak[field]} options={values(key)} onChange={(value) => update('leak', { [field]: value })} />;
                        })}
                    </>
                  )}
                  {module === 'diffusion' && (
                    <>
                      <TileChoice label={labelOf(language, 'diffusion', 'STRENGTH')} value={settings.diffusion.strength} tiles={VALUE_TILES.diffusionStrength} names={values('STRENGTH')} onChange={(strength) => update('diffusion', { strength })} />
                      {settings.diffusion.strength > 0 && (
                        <>
                          <Field label={labelOf(language, 'diffusion', 'MIST')} value={settings.diffusion.mist} options={values('MIST')} onChange={(mist) => update('diffusion', { mist })} />
                          <Field label={labelOf(language, 'diffusion', 'STREAK')} value={settings.diffusion.streak} options={values('STREAK')} onChange={(streak) => update('diffusion', { streak })} />
                        </>
                      )}
                      <TileChoice label={labelOf(language, 'diffusion', 'SOFTNESS')} value={settings.diffusion.softness} tiles={VALUE_TILES.softness} names={values('SOFTNESS')} onChange={(softness) => update('diffusion', { softness })} />
                      {settings.diffusion.softness > 0 && <p className="col-span-2 -mt-1 text-[14px] text-muted-foreground">{d.softnessNote}</p>}
                    </>
                  )}
                  {module === 'date' && (
                    <>
                      <TileChoice label={labelOf(language, 'date', 'STYLE')} value={settings.date.style} tiles={VALUE_TILES.dateStyle} names={rows} onChange={(style) => update('date', { style })} />
                      {on &&
                        (
                          [
                            ['LOOK', 'look'],
                            ['COLOR', 'color'],
                            ['SIZE', 'size'],
                            ['CORNER', 'corner'],
                            ['GLOW', 'glow'],
                            ['CAPTION', 'caption'],
                            ['POSITION', 'position'],
                          ] as const
                        ).map(([key, field]) => <Field key={key} label={labelOf(language, 'date', key)} value={settings.date[field]} options={values(key)} onChange={(value) => update('date', { [field]: value })} />)}
                      {on && <p className="col-span-2 -mt-1 text-[14px] text-muted-foreground">{opened && !opened.taken ? d.noDate : d.dateNote}</p>}
                    </>
                  )}
                  {module === 'border' && (
                    <>
                      <TileChoice label={labelOf(language, 'border', 'CORE.BORDER')} value={settings.border.style} tiles={VALUE_TILES.borderStyle} names={rows} onChange={(style) => update('border', { style })} />
                      {on && <Field label={labelOf(language, 'border', 'CORE.BORDER_COLOR')} value={settings.border.color} options={values('CORE.BORDER_COLOR')} onChange={(color) => update('border', { color })} />}
                    </>
                  )}
                </div>
              </fieldset>
            );
          })}
        </div>
      </div>
    </details>
  );

  return (
    <div
      className={cn('relative pt-6 pb-12 lg:pt-10 [&_a]:touch-manipulation [&_button]:touch-manipulation [&_select]:touch-manipulation', photos.length > 0 && 'pb-32 lg:pb-28')}
      onDragOver={(event) => {
        if (![...event.dataTransfer.types].includes('Files')) return;
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false);
      }}
      onDrop={onDrop}
    >
      <header className="max-w-[64ch]">
        <h1 className="text-[clamp(28px,3vw,40px)] leading-[1.15] font-semibold tracking-[-0.02em] text-balance [:root[lang=th]_&]:leading-[1.3] [:root[lang=th]_&]:tracking-normal">{d.heading}</h1>
        <p className="mt-2 max-w-[56ch] text-[15px] leading-relaxed text-muted-foreground sm:text-[16px]">{d.lead}</p>
        <Steps d={d} step={step} />
      </header>

      <input ref={input} type="file" accept="image/*,.dng,.heic,.heif" multiple hidden onChange={onChoose} />

      {photos.length === 0 ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
          <div
            className={cn(
              'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-card/60 px-5 py-8 text-center transition-colors lg:aspect-[3/2]',
              dragging && 'border-brand bg-brand/5',
            )}
          >
            <ImagePlus className="size-8 text-muted-foreground" aria-hidden="true" />
            <Button type="button" size="lg" className="h-12 rounded-lg px-6 text-[16px]" onClick={() => input.current?.click()}>
              <Plus className="size-5" aria-hidden="true" />
              {d.choose}
            </Button>
            <span className="hidden text-[14px] text-muted-foreground lg:block">{d.drop}</span>
            <div className="flex max-w-[40ch] flex-col gap-1.5 text-[14px] text-muted-foreground">
              <span>{d.anyCamera}</span>
              <span className="flex items-center justify-center gap-1.5 font-medium text-foreground">
                <ShieldCheck className="size-4 shrink-0 text-brand-text" aria-hidden="true" />
                {d.privacy}
              </span>
            </div>
          </div>
          <Example d={d} />
          <div className="lg:col-span-2">{plusCard}</div>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(340px,38%)] lg:items-start lg:gap-6">
          {/* The photo, the photos, saving, and the recipe. */}
          <div className="flex min-w-0 flex-col gap-4">
            <div ref={viewer} className="relative scroll-mt-28 overflow-hidden rounded-xl lg:scroll-mt-20 bg-muted/40 ring-1 ring-border" aria-busy={rendering || undefined}>
              {view && opened ? (
                <div className="relative mx-auto" style={{ aspectRatio: `${view.image.width} / ${view.image.height}`, width: `min(100%, calc(62svh * ${view.image.width / view.image.height}))` }}>
                  <CompareView
                    position={split}
                    onPosition={setSplit}
                    label={d.compare}
                    before={<BitmapCanvas draw={drawBefore} width={view.image.width} height={view.image.height} className="size-full object-contain" label={`${d.before}: ${photo?.file.name ?? ''}`} />}
                    after={<BitmapCanvas draw={drawAfter} width={view.image.width} height={view.image.height} className="size-full object-contain" label={`${d.after}: ${lookName ?? d.noLook}`} />}
                  >
                  {/* Before and After: a tap shows the whole photo either way, for a thumb that would rather not drag. */}
                  {(
                    [
                      [d.before, 100, 'left-2'],
                      [lookName ?? d.after, 0, 'right-2'],
                    ] as const
                  ).map(([label, position, side]) => (
                    <button
                      key={side}
                      type="button"
                      data-compare-ignore
                      aria-pressed={split === position}
                      onClick={() => setSplit(split === position ? 50 : position)}
                      className={cn('absolute top-1 z-[2] flex min-h-11 items-start p-1.5 outline-none', side)}
                    >
                      <span className={cn('rounded-md bg-black/60 px-2 py-1 text-white backdrop-blur-sm', position ? 'text-[13px] text-white/85' : 'text-[14px] font-semibold')}>{label}</span>
                    </button>
                  ))}
                  </CompareView>
                </div>
              ) : (
                <div className="flex aspect-[3/2] items-center justify-center gap-2 text-[15px] text-muted-foreground">
                  {photo?.error ? (
                    /\.(heic|heif)$/i.test(photo.file.name) ? d.heicError : d.openError
                  ) : (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      {opened ? d.developing : d.opening}
                    </>
                  )}
                </div>
              )}
              {rendering && view && (
                <span className="absolute right-3 bottom-3 z-[2] flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-xs text-white/85">
                  <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                  {d.developing}
                </span>
              )}
            </div>
            {opened && (
              <div className="-mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1 px-0.5 text-[14px] leading-snug text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  {opened.fidelity === 'exact' ? <CircleCheck className="size-3.5 shrink-0 text-brand-text" aria-hidden="true" /> : <Info className="size-3.5 shrink-0" aria-hidden="true" />}
                  {note}
                </span>
                {(opened.camera || opened.taken) && (
                  <span className="tabular-nums">{format(d.shotInfo, { camera: opened.camera || '—', date: opened.taken ?? '—', iso: opened.iso ?? '—' })}</span>
                )}
              </div>
            )}

            {/* The photos: 3:2 thumbnails that wrap, the shown one with a ring. */}
            <ul className="flex flex-wrap gap-2.5 p-0.5" aria-label={d.photos}>
              {photos.map((item) => (
                <li key={item.key} className="group relative">
                  <button
                    type="button"
                    onClick={() => setCurrent(item.key)}
                    aria-pressed={item.key === current}
                    aria-label={item.file.name}
                    title={`${item.file.name} · ${(item.key === current && opened?.taken) || dateOf(item.file)}`}
                    className={cn(
                      'block aspect-[3/2] w-20 overflow-hidden rounded-lg bg-muted ring-offset-2 ring-offset-background outline-none transition-[box-shadow,opacity] focus-visible:ring-2 focus-visible:ring-ring',
                      item.key === current ? 'ring-2 ring-foreground' : 'opacity-80 hover:opacity-100',
                      item.error && 'opacity-40',
                    )}
                  >
                    <Thumbnail file={item.file} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removePhoto(item.key)}
                    aria-label={format(d.remove, { name: item.file.name })}
                    title={format(d.remove, { name: item.file.name })}
                    className="group/x absolute top-0 right-0 flex size-11 items-start justify-end p-1 opacity-0 transition-opacity outline-none group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
                  >
                    <span className="flex size-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm group-hover/x:bg-black/80 group-focus-visible/x:ring-2 group-focus-visible/x:ring-white">
                      <X className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                    </span>
                  </button>
                </li>
              ))}
              {photos.length < limits.photos && (
                <li>
                  <button
                    type="button"
                    onClick={() => input.current?.click()}
                    className="flex aspect-[3/2] w-20 flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-border text-[12px] leading-tight text-muted-foreground transition-colors outline-none hover:border-foreground/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    {d.addMore}
                  </button>
                </li>
              )}
            </ul>
            {overLimit && (
              <p className="text-[14px] text-muted-foreground">
                {format(d.photoLimit, { n: limits.photos, plus: PLUS_PHOTOS })}{' '}
                {!plus && (
                  <Button type="button" variant="link" className="h-auto p-0 text-[14px]" onClick={onPlus}>
                    {d.plusCta}
                  </Button>
                )}
              </p>
            )}

            {lookRow}
            <SaveNotes d={d} plus={plus} allowed={allowed} />

            {/* The recipe: under the photo on a computer, after the controls on a phone. */}
            <div className="hidden lg:block">{recipe('wide')}</div>
          </div>

          {/* The look, the style, and Adjust more. */}
          <div className="flex min-w-0 flex-col gap-4">
            <section className={cn(SECTION, 'hidden lg:block')} aria-labelledby="develop-look">
              <h2 id="develop-look" className={H2}>
                {d.lookTitle}
              </h2>
              {anyLocked && (
                <p className="mt-1 flex items-start gap-1.5 text-[14px] text-muted-foreground">
                  <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  {d.lockLine}
                </p>
              )}
              {popular.length > 0 && (
                <>
                  <h3 className="mt-4 text-[14px] font-medium text-muted-foreground">{d.popular}</h3>
                  <ul className="mt-2 grid grid-cols-4 gap-1.5" aria-label={d.popular}>
                    {popular.map((effect) => (
                      <li key={effect.id}>
                        <LookButton effect={effect} big chosen={settings.look === effect.id} locked={locked(effect)} lockText={d.lockedLook} onChoose={() => setSettings({ ...settings, look: effect.id })} />
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <h3 className="mt-5 text-[14px] font-medium text-muted-foreground">{d.allLooks}</h3>
              {allLooks}
            </section>

            <section className={SECTION} aria-labelledby="develop-style">
              <h2 id="develop-style" className={H2}>
                {d.styleTitle}
              </h2>
              <p className="mt-1 text-[14px] text-muted-foreground">{d.styleLead}</p>
              <div className="-mx-4 mt-3 flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 pb-1 [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-36px),transparent)] [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0 lg:[mask-image:none] [&::-webkit-scrollbar]:hidden" role="radiogroup" aria-labelledby="develop-style">
                {PRESET_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={preset === id}
                    onClick={() => setSettings(applyPreset(settings, id))}
                    className="flex w-[132px] shrink-0 snap-start flex-col overflow-hidden rounded-lg border bg-background text-left outline-none transition-colors lg:w-auto hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring aria-checked:border-foreground aria-checked:ring-2 aria-checked:ring-foreground"
                  >
                    <span className="block aspect-[3/2] w-full bg-muted">
                      {styleThumbs[id] && (
                        <BitmapCanvas draw={(ctx) => ctx.drawImage(styleThumbs[id]!, 0, 0)} width={styleThumbs[id]!.width} height={styleThumbs[id]!.height} className="size-full object-contain" />
                      )}
                    </span>
                    <span className="flex flex-col gap-0.5 px-2.5 pt-1.5 pb-2">
                      <span className="text-[14px] leading-tight font-semibold">{presetName[id][0]}</span>
                      <span className="hidden text-[14px] leading-snug text-muted-foreground lg:block">{presetName[id][1]}</span>
                    </span>
                  </button>
                ))}
                {preset === null && (
                  <span className="flex w-[132px] shrink-0 items-center justify-center rounded-lg border border-dashed p-3 text-center text-[14px] text-muted-foreground lg:w-auto">{d.custom}</span>
                )}
              </div>
            </section>

            {adjust}
            <div className="lg:hidden">{recipe('narrow')}</div>
            {plusCard}
          </div>
        </div>
      )}

      {/* The Save bar: always in reach, at the bottom of the window. */}
      {photos.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/92 pt-2 pb-[max(8px,env(safe-area-inset-bottom))] backdrop-blur-md">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-gutter lg:flex-row-reverse lg:items-center lg:gap-4">
            <div className="flex items-center gap-2 lg:shrink-0">
              {busy && (
                <Button type="button" variant="ghost" className="h-12" onClick={() => abort.current?.abort()}>
                  {d.cancel}
                </Button>
              )}
              {!busy && allowed && photos.length > 1 && (
                <Button type="button" variant="outline" className="h-11 rounded-lg px-3 text-[14px] lg:px-4" onClick={() => download(true)}>
                  <span className="lg:hidden">ZIP</span>
                  <span className="hidden lg:inline">{format(d.saveAll, { n: photos.filter((item) => !item.error).length })}</span>
                </Button>
              )}
              <div className="flex-1 lg:order-last lg:w-56 lg:flex-none">{saveButton(true)}</div>
            </div>
            <div className="flex min-h-5 flex-1 flex-col gap-1.5">
              {busy && <Progress className="h-1.5" value={progress} aria-label={d.save} />}
              <p className={cn('truncate text-center text-[13px] lg:text-left', task.state === 'failed' ? 'text-destructive' : task.state === 'done' ? 'font-medium text-foreground' : 'text-muted-foreground')} aria-live="polite">
                {status ?? (lookName ? `${lookName}${preset ? ` · ${presetName[preset][0]}` : ''}` : '')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* What the page is, in plain text: the steps, the popular looks, the questions. */}
      <div className="mt-12 grid gap-10 border-t pt-10 lg:grid-cols-2 lg:gap-x-12">
        <section aria-labelledby="develop-how">
          <h2 id="develop-how" className={H2}>
            {d.howTitle}
          </h2>
          <ol className="mt-4 flex flex-col gap-4">
            {[
              [d.step1, d.how1],
              [d.step2, d.how2],
              [d.step3, d.how3],
            ].map(([title, text], index) => (
              <li key={title} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[12px] font-semibold text-muted-foreground tabular-nums">{index + 1}</span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[15px] font-semibold">{title}</span>
                  <span className="text-[14px] leading-relaxed text-muted-foreground">{text}</span>
                </span>
              </li>
            ))}
          </ol>
          <h2 id="develop-looks" className={cn(H2, 'mt-10')}>
            {d.looksTitle}
          </h2>
          <p className="mt-1 text-[14px] text-muted-foreground">{d.looksLead}</p>
          <ul className="mt-4 flex flex-col divide-y">
            {POPULAR_LOOKS.map((look) => (
              <li key={look.id}>
                <a
                  href={`${pagePath(language, 'develop')}?look=${look.id}`}
                  onClick={(event) => {
                    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
                    event.preventDefault();
                    setSettings({ ...settings, look: look.id });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex min-h-14 items-center gap-3 py-2 no-underline outline-none hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <EffectIcon effect={{ id: look.id, icon: '' }} className="size-10 shrink-0" />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[15px] font-medium text-foreground">{look.name}</span>
                    <span className="text-[14px] text-muted-foreground">{d[look.text]}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[14px]">
            <a href={`${pagePath(language, 'install')}${installQuery(settings)}`} className="font-medium underline underline-offset-4">
              {d.install}
            </a>
          </p>
        </section>
        <section aria-labelledby="develop-faq">
          <h2 id="develop-faq" className={H2}>
            {d.faqTitle}
          </h2>
          <div className="mt-4 flex flex-col gap-5">
            {faqOf(d).map((item) => (
              <div key={item.q}>
                <h3 className="text-[15px] font-semibold">{item.q}</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {dragging && (
        <div className="pointer-events-none fixed inset-3 z-40 flex items-center justify-center rounded-xl border-2 border-dashed border-brand bg-background/75 text-[20px] font-semibold backdrop-blur-sm">
          <span className="flex items-center gap-2">
            <ImagePlus className="size-5 text-brand-text" aria-hidden="true" />
            {d.dropHere}
          </span>
        </div>
      )}
    </div>
  );
}

/** The quiet lines under saving: the size and credit of a free save, and the GPS. */
function SaveNotes({ d, plus, allowed }: { d: DevelopText; plus: boolean; allowed: boolean }) {
  return (
    <div className="mt-2 flex flex-col gap-1 text-[14px] text-muted-foreground">
      {!plus && allowed && <p>{format(d.freeNote, { side: FREE_SIDE })}</p>}
      {!allowed && <p className="flex items-start gap-1.5"><Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />{d.lockedLook}</p>}
      <p className="flex items-center gap-1.5 text-[12px] opacity-80">
        <MapPinOff className="size-3.5 shrink-0" aria-hidden="true" />
        {d.gpsRemoved}
      </p>
    </div>
  );
}
