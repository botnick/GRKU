// The Develop page: the film looks and the modules of GRKU on photos that the visitor already has.
// The photos stay in the browser: the workers of src/develop/ develop them with the module code of
// the camera (develop.wasm), and the page downloads the JPEGs that they make.
import { Check, Copy, Download, ImagePlus, Loader2, Lock, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from 'react';
import { Handle, HandleRoot, Item, Provider, Root } from 'react-compare-slider/components';
import { useReactCompareSlider } from 'react-compare-slider/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { PREVIEW_TARGET } from '../cameras';
import { effectUrl, type CatalogEffect } from '../catalog';
import { Developer, previewSide, type Phase } from '../develop/client';
import { canDownload, developPlus, freeLook, limitsOf, FREE_SIDE, PLUS_PHOTOS } from '../develop/gating';
import type { Opened } from '../develop/protocol';
import { photoSeed, type LookUrls } from '../develop/protocol';
import { installQuery } from '../develop/install';
import { childTitle, labelOf, menuOf, recipeLines, recipeText, settingsFromParams, settingsParam, valueNames } from '../develop/recipe';
import { applyPreset, autoGrainSize, isOn, OFF, presetOf, PRESETS, PRESET_IDS, readSettings, type DevelopSettings, type ModuleName, type PresetId } from '../develop/settings';
import { DEVELOP_STRINGS, format, type DevelopText } from '../develop/strings';
import { developedName, uniqueName, zipParts } from '../develop/zip';
import { FILM_KINDS, filmKind, type FilmKind } from '../filmKind';
import type { Language, Strings } from '../i18n';
import { pagePath } from '../languagePage';
import type { ModuleKey } from '../modules';
import { PRICES, type Entitlement } from '../plus';
import { useCatalog } from '../useCatalog';
import { EffectIcon } from './EffectIcon';

const SETTINGS_KEY = 'grku.develop';
const FIRST_LOOK = 'positive-film-grii-v1';
const DEFAULT_SETTINGS: DevelopSettings = { look: FIRST_LOOK, ...structuredClone(PRESETS.natural) };

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
  | { state: 'running'; index: number; total: number; name: string; phase: Phase; fraction: number }
  | { state: 'done'; text: string }
  | { state: 'failed'; text: string };

const PHASES: readonly Phase[] = ['decode', 'colour', 'modules', 'encode'];
/** The share of each phase in the progress of one photo. */
const PHASE_WEIGHT: Readonly<Record<Phase, number>> = { decode: 0.2, colour: 0.25, modules: 0.3, encode: 0.25 };

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
    <label className={cn('flex min-w-0 flex-col gap-1 text-[13px]', disabled && 'opacity-50')}>
      <span className="text-muted-foreground">{label}</span>
      <select
        className="h-9 w-full min-w-0 rounded-md border border-input bg-card px-2.5 text-[14px] text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
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
      {note && <span className="text-[12px] leading-snug text-muted-foreground">{note}</span>}
    </label>
  );
}

/** The site key of each module of the page, for its plain line (t.site.plain). */
const MODULE_KEYS: Readonly<Record<ModuleName, ModuleKey>> = { grain: 'grain', glow: 'glow', leak: 'lightLeak', diffusion: 'diffusion', date: 'dateStamp', border: 'border' };

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
            for (const old of open.slice(0, Math.max(0, open.length - 2))) {
              developer.current?.close(old.id!);
              old.opened?.before.close();
            }
            const closed = new Set(open.slice(0, Math.max(0, open.length - 2)).map((item) => item.key));
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

  // ---- Downloads ----
  async function download(all: boolean) {
    if (!urls || task.state === 'running') return;
    if (!allowed) return onPlus();
    const list = all ? photos.filter((item) => !item.error) : photo ? [photo] : [];
    if (!list.length) return;
    const controller = new AbortController();
    abort.current = controller;
    const results: { name: string; bytes: Uint8Array }[] = [];
    const names = new Set<string>();
    let name = '';
    try {
      for (const [index, item] of list.entries()) {
        name = uniqueName(developedName(item.file.name, lookName), names);
        setTask({ state: 'running', index, total: list.length, name, phase: 'decode', fraction: 0 });
        const result = await getDeveloper().export(
          item.file,
          settings,
          urls,
          { maxSide: limits.maxSide, credit: limits.credit, seed: photoSeed(item.file) },
          (phase, fraction) => setTask({ state: 'running', index, total: list.length, name, phase, fraction }),
          controller.signal,
        );
        if (list.length === 1) {
          save(result.blob, name);
          setTask({ state: 'done', text: format(d.saved, { name }) });
          return;
        }
        results.push({ name, bytes: new Uint8Array(await result.blob.arrayBuffer()) });
      }
      const stamp = new Date().toISOString().slice(0, 10);
      save(new Blob(zipParts(results), { type: 'application/zip' }), `GRKU-${stamp}.zip`);
      setTask({ state: 'done', text: format(d.savedAll, { n: results.length }) });
    } catch (error) {
      if (controller.signal.aborted) return setTask({ state: 'idle' });
      const memory = error instanceof Error && /memory|allocation|range/i.test(error.message);
      setTask({ state: 'failed', text: format(memory ? d.memory : d.failed, { name }) });
    } finally {
      abort.current = null;
    }
  }

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
  const shelf = useRef<HTMLUListElement>(null);
  // The chosen look shows in the grid, also when it came with the address or the last visit.
  useEffect(() => {
    const list = shelf.current;
    const pressed = list?.querySelector<HTMLElement>('[aria-pressed=true]');
    if (!list || !pressed) return;
    const top = pressed.offsetTop - list.offsetTop;
    if (top < list.scrollTop || top + pressed.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = top - 8;
  }, [settings.look, catalog, photos.length > 0]);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<FilmKind | 'all'>('all');
  const kinds = FILM_KINDS.filter((item) => effects.some((effect) => filmKind(effect) === item));
  const needle = query.trim().toLowerCase();
  const visible = effects.filter(
    (effect) =>
      (kind === 'all' || filmKind(effect) === kind) &&
      (!needle || `${effect.name} ${effect.cover?.brand ?? ''} ${effect.cover?.name ?? ''} ${effect.look}`.toLowerCase().includes(needle)),
  );

  const preset = presetOf(settings);
  const presetName: Record<PresetId, string> = { natural: d.presetNatural, snapshot: d.presetSnapshot, dreamy: d.presetDreamy, date: d.presetDate, instant: d.presetInstant };
  const lines = recipeLines(settings, language, t.moduleNames.filmLook, lookName, d.noLook);
  const busy = task.state === 'running';

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
  const comparison = useReactCompareSlider({ clip: 'itemTwo' });

  const fidelity = opened
    ? opened.fidelity === 'exact'
      ? d.fidelityExact
      : opened.fidelity === 'otherControl'
        ? format(d.fidelityOther, { control: opened.imageControl ?? '' })
        : opened.fidelity === 'raw'
          ? d.fidelityRaw
          : d.fidelityApprox
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
  const phaseText: Record<Phase, string> = { decode: d.phaseDecode, colour: d.phaseColour, modules: d.phaseModules, encode: d.phaseEncode };

  const SECTION = 'rounded-xl border bg-card p-4 sm:p-5';
  const H2 = 'text-[15px] font-semibold tracking-[-0.01em]';

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
            <Button type="button" variant="brand" onClick={onPlus}>
              {d.plusCta}
            </Button>
            <span className="text-[13px] text-muted-foreground tabular-nums">{format(d.plusPrice, { price: Math.min(...Object.values(PRICES)) })}</span>
          </div>
        </>
      )}
    </section>
  );

  return (
    <div
      className="relative pt-8 pb-12 lg:pt-10"
      onDragOver={(event) => {
        if (![...event.dataTransfer.types].includes('Files')) return;
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) setDragging(false);
      }}
      onDrop={onDrop}
    >
      <header className="max-w-[68ch]">
        <h1 className="text-[clamp(30px,3.4vw,44px)] leading-[1.1] font-semibold tracking-[-0.02em] text-balance [:root[lang=th]_&]:leading-[1.3] [:root[lang=th]_&]:tracking-normal">{d.heading}</h1>
        <p className="mt-3 text-[16px] leading-relaxed text-muted-foreground">{d.lead}</p>
        <p className="mt-3 flex items-center gap-2 text-[14px] font-medium">
          <ShieldCheck className="size-4 shrink-0 text-brand-text" aria-hidden="true" />
          {d.privacy}
        </p>
      </header>

      <input ref={input} type="file" accept="image/*,.dng,.heic,.heif" multiple hidden onChange={onChoose} />

      {photos.length === 0 ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <button
            type="button"
            onClick={() => input.current?.click()}
            className={cn(
              'flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-card/50 p-8 text-center transition-colors outline-none hover:border-foreground/40 focus-visible:ring-[3px] focus-visible:ring-ring/50',
              dragging && 'border-brand bg-brand/5',
            )}
          >
            <ImagePlus className="size-10 text-muted-foreground" aria-hidden="true" />
            <span className="text-[20px] font-semibold">{d.drop}</span>
            <span className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">{d.choose}</span>
            <span className="max-w-[44ch] text-[13px] text-muted-foreground">{d.formats}</span>
          </button>
          <div className="flex flex-col gap-4">
            <section className={SECTION}>
              <h2 className={H2}>{d.presets}</h2>
              <ul className="mt-3 flex flex-col gap-1.5 text-[14px] text-muted-foreground">
                {PRESET_IDS.map((id) => (
                  <li key={id}>{presetName[id]}</li>
                ))}
              </ul>
            </section>
            {plusCard}
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          {/* The viewer, the photos, the download, and the recipe. */}
          <div className="flex min-w-0 flex-col gap-4">
            <div className="relative overflow-hidden rounded-2xl bg-muted/40 ring-1 ring-border" aria-busy={rendering || undefined}>
              {view && opened ? (
                <div className="relative mx-auto" style={{ aspectRatio: `${view.image.width} / ${view.image.height}`, width: `min(100%, calc(72vh * ${view.image.width / view.image.height}))` }}>
                  <Provider {...comparison}>
                    <Root className="image-comparison h-full">
                      <Item item="itemOne">
                        <BitmapCanvas draw={drawBefore} width={view.image.width} height={view.image.height} className="size-full object-contain" label={`${d.before}: ${photo?.file.name ?? ''}`} />
                      </Item>
                      <Item item="itemTwo" className="comparison-effect">
                        <BitmapCanvas draw={drawAfter} width={view.image.width} height={view.image.height} className="size-full object-contain" label={`${d.after}: ${lookName ?? d.noLook}`} />
                      </Item>
                      <HandleRoot aria-label={d.compare}>
                        <Handle buttonStyle={{ width: 32, height: 32, gap: '0.2rem' }} />
                      </HandleRoot>
                    </Root>
                  </Provider>
                  <span className="pointer-events-none absolute top-3 left-3 z-[2] rounded-md bg-black/60 px-2 py-1 text-xs text-white/85 backdrop-blur-sm">{d.before}</span>
                  <span className="pointer-events-none absolute top-3 right-3 z-[2] rounded-md bg-black/60 px-2.5 py-1 text-sm font-semibold text-white backdrop-blur-sm" aria-live="polite">
                    {lookName ?? d.noLook}
                  </span>
                </div>
              ) : (
                <div className="flex aspect-[3/2] items-center justify-center gap-2 text-[14px] text-muted-foreground">
                  {photo?.error ? (
                    d.openError
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
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
                <span className={cn('rounded-full border px-2.5 py-0.5', opened.fidelity === 'exact' && 'border-brand/50 text-foreground')}>{fidelity}</span>
                {(opened.camera || opened.taken) && (
                  <span className="tabular-nums">
                    {format(d.shotInfo, { camera: opened.camera || '—', date: opened.taken ?? '—', iso: opened.iso ?? '—' })}
                  </span>
                )}
                {view && <span className="ml-auto font-mono text-[11px] tabular-nums">{format(d.time, { ms: view.ms })}</span>}
              </div>
            )}

            {/* The photos. */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1" role="list" aria-label={d.photos}>
              {photos.map((item) => (
                <div key={item.key} role="listitem" className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setCurrent(item.key)}
                    aria-pressed={item.key === current}
                    aria-label={item.file.name}
                    title={item.file.name}
                    className={cn(
                      'block h-16 w-20 overflow-hidden rounded-md border bg-muted outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                      item.key === current && 'ring-2 ring-brand',
                      item.error && 'opacity-50',
                    )}
                  >
                    <Thumbnail file={item.file} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removePhoto(item.key)}
                    aria-label={format(d.remove, { name: item.file.name })}
                    className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm hover:text-foreground"
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </div>
              ))}
              {photos.length < limits.photos && (
                <Button type="button" variant="outline" className="h-16 w-20 shrink-0 flex-col gap-1 text-[11px]" onClick={() => input.current?.click()}>
                  <ImagePlus aria-hidden="true" />
                  {d.addMore}
                </Button>
              )}
            </div>
            {overLimit && (
              <p className="text-[13px] text-muted-foreground">
                {format(d.photoLimit, { n: limits.photos, plus: PLUS_PHOTOS })}{' '}
                {!plus && (
                  <Button type="button" variant="link" className="h-auto p-0 text-[13px]" onClick={onPlus}>
                    {d.plusCta}
                  </Button>
                )}
              </p>
            )}

            {/* Download. */}
            <section className={SECTION} aria-label={d.download}>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant={allowed ? 'default' : 'brand'} disabled={busy || !photo?.opened} onClick={() => download(false)}>
                  {allowed ? <Download aria-hidden="true" /> : <Lock aria-hidden="true" />}
                  {allowed ? d.download : d.downloadPlus}
                </Button>
                {allowed && photos.length > 1 && (
                  <Button type="button" variant="outline" disabled={busy} onClick={() => download(true)}>
                    {format(d.downloadAll, { n: photos.filter((item) => !item.error).length })}
                  </Button>
                )}
                {busy && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => abort.current?.abort()}>
                    {d.cancel}
                  </Button>
                )}
              </div>
              {task.state === 'running' && (
                <div className="mt-3 flex flex-col gap-1.5" aria-live="polite">
                  <Progress value={progress} aria-label={d.download} />
                  <span className="text-[13px] text-muted-foreground tabular-nums">
                    {task.total > 1 ? `${format(d.downloading, { i: task.index + 1, n: task.total })} · ` : ''}
                    {phaseText[task.phase]}
                  </span>
                </div>
              )}
              {(task.state === 'done' || task.state === 'failed') && (
                <p className={cn('mt-3 text-[13px]', task.state === 'failed' ? 'text-destructive' : 'text-muted-foreground')} aria-live="polite">
                  {task.text}
                </p>
              )}
              <p className="mt-3 text-[13px] text-muted-foreground">{plus ? d.plusHave : `${format(d.freeNote, { side: FREE_SIDE })} ${d.plusNote}`}</p>
            </section>

            {/* The recipe. */}
            <section className={SECTION} aria-labelledby="develop-recipe">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 id="develop-recipe" className={H2}>
                    {d.recipe}
                  </h2>
                  <p className="mt-1 text-[13px] text-muted-foreground">{d.recipeLead}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={copyRecipe} aria-live="polite">
                    {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                    {copied ? d.copied : d.copy}
                  </Button>
                  <Button asChild size="sm" variant="brand">
                    <a href={`${pagePath(language, 'install')}${installQuery(settings)}`}>{d.install}</a>
                  </Button>
                </div>
              </div>
              <dl className="mt-4 grid gap-x-4 gap-y-2 text-[14px] sm:grid-cols-[max-content_1fr]">
                {lines.map((line) => (
                  <div key={line.module} className="contents">
                    <dt className="font-medium">{line.title}</dt>
                    <dd className="text-muted-foreground">{line.values.join(' · ')}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <div className="lg:hidden">{plusCard}</div>
          </div>

          {/* The look and the modules. */}
          <div className="flex min-w-0 flex-col gap-4">
            <section className={SECTION} aria-labelledby="develop-look">
              <div className="flex items-baseline justify-between gap-2">
                <h2 id="develop-look" className={H2}>
                  {d.lookTitle}
                </h2>
                {!plus && (
                  <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                    <Lock className="size-3" aria-hidden="true" />
                    {d.plusLooks}
                  </span>
                )}
              </div>
              <Input type="search" className="mt-3 h-9 bg-background text-[14px]" placeholder={t.searchEffects} aria-label={t.searchEffects} value={query} onChange={(event) => setQuery(event.target.value)} />
              <div className="mt-2 -mx-1 flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none]" role="group" aria-label={t.searchEffects}>
                {(['all', ...kinds] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={kind === item}
                    onClick={() => setKind(item)}
                    className="h-7 shrink-0 rounded-full px-2.5 text-[12px] whitespace-nowrap text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-foreground aria-pressed:text-background"
                  >
                    {item === 'all' ? t.filterAll : kindLabel(item, t)}
                  </button>
                ))}
              </div>
              {catalogError && (
                <p className="mt-3 text-[13px] text-destructive">
                  {t.loadError}{' '}
                  <Button type="button" variant="link" className="h-auto p-0" onClick={retry}>
                    {t.retryLoad}
                  </Button>
                </p>
              )}
              <ul ref={shelf} className="relative mt-2 grid max-h-[340px] grid-cols-4 gap-1.5 overflow-y-auto p-0.5 sm:grid-cols-6 lg:grid-cols-4" aria-label={d.lookTitle}>
                {!needle && kind === 'all' && (
                  <li>
                    <button
                      type="button"
                      aria-pressed={settings.look === null}
                      onClick={() => setSettings({ ...settings, look: null })}
                      className="flex h-full w-full flex-col items-center gap-1 rounded-lg border bg-background p-1.5 pt-2 text-center outline-none hover:border-input focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:border-brand aria-pressed:ring-2 aria-pressed:ring-brand/70"
                    >
                      <span className="flex size-11 items-center justify-center rounded-md border border-dashed text-[10px] text-muted-foreground">RAW</span>
                      <span className="line-clamp-2 text-[11px] leading-[1.25] font-medium">{d.noLook}</span>
                    </button>
                  </li>
                )}
                {!catalog &&
                  !catalogError &&
                  Array.from({ length: 12 }, (_, index) => <li key={index} className="aspect-[5/6] animate-pulse rounded-lg border bg-background" aria-hidden="true" />)}
                {visible.map((effect) => {
                  const locked = !plus && !freeLook(effect);
                  return (
                    <li key={effect.id}>
                      <button
                        type="button"
                        aria-pressed={settings.look === effect.id}
                        onClick={() => setSettings({ ...settings, look: effect.id })}
                        title={locked ? `${effect.name} · ${d.lockedLook}` : effect.name}
                        className="relative flex h-full w-full flex-col items-center gap-1 rounded-lg border bg-background p-1.5 pt-2 text-center outline-none hover:border-input focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:border-brand aria-pressed:ring-2 aria-pressed:ring-brand/70"
                      >
                        <EffectIcon effect={effect} className="size-11" />
                        <span className="line-clamp-2 text-[11px] leading-[1.25] font-medium">{effect.name}</span>
                        {locked && (
                          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-foreground/75 text-background" aria-label={d.lockedLook}>
                            <Lock className="size-2.5" aria-hidden="true" />
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {!allowed && <p className="mt-3 text-[13px] text-muted-foreground">{d.lockedLook}</p>}
            </section>

            <section className={SECTION} aria-labelledby="develop-presets">
              <h2 id="develop-presets" className={H2}>
                {d.presets}
              </h2>
              <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-labelledby="develop-presets">
                {PRESET_IDS.map((id) => (
                  <Button key={id} type="button" size="sm" variant={preset === id ? 'default' : 'outline'} aria-pressed={preset === id} onClick={() => setSettings(applyPreset(settings, id))}>
                    {presetName[id]}
                  </Button>
                ))}
                {preset === null && <span className="flex h-8 items-center px-1 text-[13px] text-muted-foreground">{d.custom}</span>}
              </div>
            </section>

            <section className={SECTION} aria-labelledby="develop-effects">
              <div className="flex items-baseline justify-between gap-2">
                <h2 id="develop-effects" className={H2}>
                  {d.effects}
                </h2>
                <Button type="button" variant="ghost" size="xs" onClick={() => setSettings({ ...OFF, look: settings.look })}>
                  {d.off}
                </Button>
              </div>
              <p className="mt-1 text-[13px] text-muted-foreground">{d.effectsLead}</p>
              <div className="mt-2 flex flex-col divide-y">
                {(['glow', 'leak', 'diffusion', 'grain', 'date', 'border'] as const).map((module) => {
                  const menu = menuOf(language, module);
                  const on = isOn(settings, module);
                  const values = (key: string) => valueNames(language, module, key);
                  const rows = valueNames(language, module, 'rows');
                  return (
                    <fieldset key={module} className="flex flex-col gap-3 py-4 first:pt-3 last:pb-1">
                      <legend className="contents">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="text-[14px] font-semibold">{menu.title}</span>
                          <span className={cn('text-[12px]', on ? 'text-brand-text' : 'text-muted-foreground')}>{on ? d.on : d.off}</span>
                        </span>
                      </legend>
                      <p className="-mt-2 text-[12px] leading-snug text-muted-foreground">{t.site.plain[MODULE_KEYS[module]]}</p>
                      <div className="grid grid-cols-2 gap-3">
                        {module === 'grain' && (
                          <>
                            <Field label={labelOf(language, 'grain', 'CORE.GRAIN')} value={settings.grain.level} options={rows} onChange={(level) => update('grain', { level })} />
                            <Field
                              label={labelOf(language, 'grain', 'CORE.GRAIN_SIZE')}
                              value={settings.grain.size}
                              options={values('CORE.GRAIN_SIZE')}
                              onChange={(size) => update('grain', { size })}
                              disabled={!on}
                              note={settings.grain.size === 0 && on ? format(d.autoSize, { size: values('CORE.GRAIN_SIZE')[autoGrainSize(opened?.iso ?? null)] ?? '' }) : undefined}
                            />
                            <p className="col-span-2 -mt-1 text-[12px] text-muted-foreground">{`${labelOf(language, 'grain', 'STYLE')}: ${values('STYLE')[1]}`}</p>
                          </>
                        )}
                        {module === 'glow' && (
                          <>
                            <Field label={childTitle(language, 'glow', 'BLOOM')} value={settings.glow.bloom} options={values('BLOOM')} onChange={(bloom) => update('glow', { bloom })} />
                            <Field label={childTitle(language, 'glow', 'HALATION')} value={settings.glow.halation} options={values('HALATION')} onChange={(halation) => update('glow', { halation })} />
                            {settings.glow.halation > 0 && !lookEffect?.monochrome && (
                              <Field label={labelOf(language, 'glow', 'HALATION_COLOR')} value={settings.glow.color} options={values('HALATION_COLOR')} onChange={(color) => update('glow', { color })} />
                            )}
                          </>
                        )}
                        {module === 'leak' && (
                          <>
                            <Field label={labelOf(language, 'leak', 'LOOK')} value={settings.leak.look} options={rows} onChange={(look) => update('leak', { look })} />
                            {settings.leak.look === 1 &&
                              (['VIGNETTE', 'DUST', 'LEAK', 'SCRATCH'] as const).map((key) => {
                                const field = ({ VIGNETTE: 'vignette', DUST: 'dust', LEAK: 'leak', SCRATCH: 'scratches' } as const)[key];
                                return <Field key={key} label={labelOf(language, 'leak', key)} value={settings.leak[field]} options={values(key)} onChange={(value) => update('leak', { [field]: value })} />;
                              })}
                          </>
                        )}
                        {module === 'diffusion' && (
                          <>
                            <Field label={labelOf(language, 'diffusion', 'STRENGTH')} value={settings.diffusion.strength} options={values('STRENGTH')} onChange={(strength) => update('diffusion', { strength })} />
                            <Field label={labelOf(language, 'diffusion', 'MIST')} value={settings.diffusion.mist} options={values('MIST')} onChange={(mist) => update('diffusion', { mist })} disabled={!settings.diffusion.strength} />
                            <Field label={labelOf(language, 'diffusion', 'STREAK')} value={settings.diffusion.streak} options={values('STREAK')} onChange={(streak) => update('diffusion', { streak })} disabled={!settings.diffusion.strength} />
                            <Field
                              label={labelOf(language, 'diffusion', 'SOFTNESS')}
                              value={settings.diffusion.softness}
                              options={values('SOFTNESS')}
                              onChange={(softness) => update('diffusion', { softness })}
                              note={settings.diffusion.softness ? d.softnessNote : undefined}
                            />
                          </>
                        )}
                        {module === 'date' && (
                          <>
                            <Field label={labelOf(language, 'date', 'STYLE')} value={settings.date.style} options={rows} onChange={(style) => update('date', { style })} />
                            {(
                              [
                                ['LOOK', 'look'],
                                ['COLOR', 'color'],
                                ['SIZE', 'size'],
                                ['CORNER', 'corner'],
                                ['GLOW', 'glow'],
                                ['CAPTION', 'caption'],
                                ['POSITION', 'position'],
                              ] as const
                            ).map(([key, field]) => (
                              <Field key={key} label={labelOf(language, 'date', key)} value={settings.date[field]} options={values(key)} onChange={(value) => update('date', { [field]: value })} disabled={!on} />
                            ))}
                            {on && <p className="col-span-2 -mt-1 text-[12px] text-muted-foreground">{opened && !opened.taken ? d.noDate : d.dateNote}</p>}
                          </>
                        )}
                        {module === 'border' && (
                          <>
                            <Field label={labelOf(language, 'border', 'CORE.BORDER')} value={settings.border.style} options={rows} onChange={(style) => update('border', { style })} />
                            <Field label={labelOf(language, 'border', 'CORE.BORDER_COLOR')} value={settings.border.color} options={values('CORE.BORDER_COLOR')} onChange={(color) => update('border', { color })} disabled={!on} />
                          </>
                        )}
                      </div>
                    </fieldset>
                  );
                })}
              </div>
            </section>
            <div className="hidden lg:block">{plusCard}</div>
          </div>
        </div>
      )}

      {dragging && photos.length > 0 && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-background/80 text-[22px] font-semibold backdrop-blur-sm">{d.dropHere}</div>
      )}
    </div>
  );
}
