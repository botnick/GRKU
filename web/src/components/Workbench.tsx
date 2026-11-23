import {
  Suspense,
  use,
  useCallback,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import { Check, KeyRound, LoaderCircle, Lock, Maximize, Minimize, Plus, Search, Sparkles, Upload, X } from 'lucide-react';
import { Handle, HandleRoot, Item, Provider, Root } from 'react-compare-slider/components';
import { useReactCompareSlider } from 'react-compare-slider/hooks';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { PREVIEW_TARGET } from '../cameras';
import { effectUrl, MAX_EFFECTS, previewTable, type CardEffect, type Catalog, type Effect, type ImportedEffect } from '../catalog';
import { brandOf, FILM_KINDS, filmKind, type FilmKind } from '../filmKind';
import type { Strings } from '../i18n';
import { editable } from '../import/edit';
import { LANDING_HERO, landingImage } from '../landing';
import { ownedLines, packCounts, slotsOf, takesSlot, unlockedBy, usedSlots, type Entitlement } from '../plus';
import { PhotoLoader } from '../preview/raw';
import { forget, prefetchTable, preview, type PreviewEffect, type Source } from '../preview/render';
import { DEFAULT_SAMPLE, SAMPLES, sampleOf } from '../preview/samples';
import { importFit, resolveSelection, selectImport, type Selection } from '../selection';
import type { Family, Recipe } from '../recipes';
import { gridLooks } from '../gridPage';
import { STOCKS } from '../stocks';
import { useCatalog } from '../useCatalog';
import { EditDialog, type EditDialogHandle } from './EditDialog';
import { BrandSwatch } from './BrandMark';
import { EffectIcon } from './EffectIcon';
import { ErrorBoundary } from './ErrorBoundary';
import { ImportDialog, type ImportDialogHandle } from './ImportDialog';

function subscribeFullscreen(change: () => void): () => void {
  document.addEventListener('fullscreenchange', change);
  return () => document.removeEventListener('fullscreenchange', change);
}

/** The browser can show an element in full screen. iPhone Safari cannot. */
const fullscreenEnabled = () => document.fullscreenEnabled === true;
const neverChanges = () => () => undefined;

/** Whether two sets hold the same IDs. */
const sameSet = (a: ReadonlySet<string>, b: ReadonlySet<string>) => a.size === b.size && [...a].every((id) => b.has(id));

/** GRKU's own look, which the page shows first. */
const FIRST_LOOK = 'positive-film-grii-v1';

/** The name of a kind of film in the filters. */
function kindLabel(kind: FilmKind, t: Strings): string {
  switch (kind) {
    case 'negative': return t.kindNegative;
    case 'slide': return t.kindSlide;
    case 'mono': return t.kindMono;
    case 'cine': return t.kindCine;
    case 'instant': return t.kindInstant;
    case 'camera': return t.kindCamera;
    case 'imported': return t.kindImported;
  }
}

/** The film number, then the print film of a cine look: "5219 · 2393 print". */
function stockText(stock: (typeof STOCKS)[string] & {}, t: Strings): string {
  return stock.print ? `${stock.film} · ${t.printFilm(stock.print)}` : stock.film;
}

/** The change badge of an effect or a module: what a write to the card does with it. */
export function ChangeBadge({
  on,
  checked,
  changed = false,
  strings: t,
}: {
  on: boolean;
  checked: boolean;
  /** The file on the card differs from the effect of the page. */
  changed?: boolean;
  strings: Strings;
}) {
  if (checked && !on) return <Badge variant="outline">{t.changeAdds}</Badge>;
  if (!checked && on)
    return (
      <Badge variant="outline" className="border-destructive text-destructive">
        {t.changeRemoves}
      </Badge>
    );
  if (checked && changed) return <Badge variant="outline">{t.changeUpdates}</Badge>;
  return null;
}

interface Props {
  strings: Strings;
  selection: Selection;
  onSelectionChange: (selection: ReadonlySet<string>) => void;
  /** The effects that this page imported for the selected camera, after the catalog effects. */
  imported: readonly ImportedEffect[];
  /** Adds an import, in place of an earlier one with the same ID. */
  onImport: (effect: ImportedEffect) => void;
  onRemove: (effect: ImportedEffect) => void;
  /** Keeps an import with a new name or icon in its place. */
  onEdit: (effect: ImportedEffect) => void;
  /** The effect files on the connected card that the catalog and the imports do not have. */
  cardEffects: readonly CardEffect[];
  /** The IDs of the effects on the connected card, or null without a card. */
  onCard: ReadonlySet<string> | null;
  /** The IDs of the imports whose file on the card differs, such as after a new name. */
  changedOnCard?: ReadonlySet<string>;
  /** The camera line of the page, for a recipe from a Lightroom preset import. */
  family: Family;
  /** The recipe library of that camera line. */
  recipes: readonly Recipe[];
  /** Adds a recipe from a Lightroom preset import. */
  onAddRecipe: (recipe: Recipe) => void;
  /** What the visitor owns of GRKU Plus. */
  owned: Entitlement;
  /** Opens GRKU Plus. */
  onPlus: () => void;
  /** The GRKU Plus key of this browser, or null. */
  plusKey?: string | null;
  /** Opens GRKU Plus on its key tab. */
  onOtherKey?: () => void;
  /** Forgets the key on this device. */
  onForgetKey?: () => void;
  /** A line above the grid when the package takes no film looks: Film Look is off, or the camera has none. */
  notice?: string | null;
}

const RING = 'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';
/** The ring of a file button whose hidden input has the keyboard focus. */
const FILE_FOCUS =
  '[&:has(+input:focus-visible)]:border-ring [&:has(+input:focus-visible)]:ring-[3px] [&:has(+input:focus-visible)]:ring-ring/50';

/**
 * The first screen and the first step in one: the headline, the photograph that renders the
 * picked look live (it stays in view while the shelf scrolls), and the shelf of every look with
 * its search and filters. A press on a box shows the look; the checkbox puts it on the card.
 */
/** The mark of a look the buyer owns through GRKU Plus: a sparkle, not a price tag. */
function PlusMark() {
  return (
    <span className="flex size-4 items-center justify-center rounded-full bg-background text-brand ring-1 ring-brand/60" aria-hidden="true">
      <Sparkles className="size-2.5" strokeWidth={2.5} />
    </span>
  );
}

export function Workbench({
  strings: t,
  selection,
  onSelectionChange,
  imported,
  onImport,
  onRemove,
  onEdit,
  cardEffects,
  onCard,
  changedOnCard,
  family,
  recipes,
  onAddRecipe,
  owned,
  onPlus,
  plusKey = null,
  onOtherKey,
  onForgetKey,
  notice,
}: Props) {
  const { catalog, error, retry } = useCatalog(PREVIEW_TARGET);
  const effects: readonly Effect[] = catalog ? [...catalog.effects, ...imported] : imported;
  const checked = resolveSelection(
    selection,
    catalog?.effects.map((effect) => effect.id) ?? [],
    [...imported, ...cardEffects].map((effect) => effect.id),
  );
  const taken = new Set([...effects, ...cardEffects].map((effect) => effect.id));
  const listed = [...effects, ...cardEffects];
  const used = usedSlots(listed, checked, owned);
  const slots = slotsOf(owned);
  const full = used >= slots;
  // The viewer, not the frame, goes to full screen (as on GRKit): an error replaces the frame, and
  // the removal of the full-screen element would end full screen. The photo keeps its render size.
  const [viewer, setViewer] = useState<HTMLDivElement | null>(null);
  const canFullscreen = useSyncExternalStore(neverChanges, fullscreenEnabled, () => false);
  const fullscreenElement = useSyncExternalStore(subscribeFullscreen, () => document.fullscreenElement, () => null);
  const fullscreen = viewer !== null && fullscreenElement === viewer;
  // The effect that the frame shows, which changes in a transition when its preview is ready, and
  // the effect that the user pressed last, which the boxes and the text show at once.
  const [previewId, setPreviewId] = useState(FIRST_LOOK);
  const [requestedId, setRequestedId] = useState(FIRST_LOOK);
  const [source, setSource] = useState<Source>(DEFAULT_SAMPLE);
  const photo = useRef<Source | null>(null);
  const importer = useRef<ImportDialogHandle>(null);
  const editor = useRef<EditDialogHandle>(null);
  const [loader] = useState(() => new PhotoLoader());
  const [decoding, setDecoding] = useState(false);
  const ownPhoto = useCallback(
    () => () => {
      loader.cancel();
      if (photo.current) forget(photo.current);
      photo.current = null;
    },
    [loader],
  );
  const [photoError, setPhotoError] = useState(false);
  const [previewAttempt, setPreviewAttempt] = useState(0);
  const [isPending, startTransition] = useTransition();
  const photoCount = useRef(0);
  // The filters of the shelf: a search, a kind of film, a brand.
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<FilmKind | 'all'>('all');
  const [brand, setBrand] = useState('all');
  // The pages of the grid that show. A new search or filter starts again at the first page.
  const [pages, setPages] = useState(1);
  const [filterKey, setFilterKey] = useState('');
  const nextFilterKey = `${query}\n${kind}\n${brand}`;
  if (filterKey !== nextFilterKey) {
    setFilterKey(nextFilterKey);
    setPages(1);
  }
  const kinds = FILM_KINDS.filter((item) => listed.some((effect) => filmKind(effect) === item));
  const brands = [...new Set(listed.map(brandOf).filter(Boolean))].sort();
  const needle = query.trim().toLowerCase();
  const visible = listed.filter(
    (effect) =>
      (kind === 'all' || filmKind(effect) === kind) &&
      (brand === 'all' || brandOf(effect) === brand) &&
      (!needle ||
        [effect.name, brandOf(effect), effect.cover?.name, effect.cover?.number, 'look' in effect ? effect.look : '']
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(needle)),
  );
  // The grid shows whole pages of the matching looks (gridPage.ts), and always the previewed look.
  const importTile = !!catalog?.baseGamma;
  const shownLooks = gridLooks(visible, pages, importTile, visible.findIndex((effect) => effect.id === requestedId));


  const shown = effects.find((effect) => effect.id === previewId) ?? effects[0] ?? null;
  const requested = effects.find((effect) => effect.id === requestedId) ?? shown;
  const previewOf = (effect: Effect, loaded: Catalog): PreviewEffect => ({
    id: effect.id,
    table: previewTable(loaded.target, effect),
    size: loaded.lutSize,
    baseline: effectUrl(loaded.target, loaded.baseline),
  });
  const previewed = shown && catalog ? previewOf(shown, catalog) : null;
  // The target look of the pressed effect: the catalog text, the LUT and the fit of an import.
  const look = !requested
    ? ''
    : requested.imported?.kind === 'native'
      ? t.nativeFrom(requested.imported.version)
      : requested.imported?.kind === 'restored'
        ? t.restoredFrom(requested.imported.source)
        : requested.imported
          ? `${requested.imported.source} · ${t.fitText[requested.imported.grade]}`
          : (t.looks[requested.id] ?? requested.look);
  const waiting = decoding ? t.decodingPhoto : isPending && requested ? t.previewRendering(requested.name) : null;

  function toggle(effect: Effect | CardEffect) {
    const next = new Set(checked);
    if (next.has(effect.id)) {
      next.delete(effect.id);
    } else if (next.size < MAX_EFFECTS) {
      next.add(effect.id);
    }
    onSelectionChange(next);
  }

  /** Whether one more look may go on the card: room on the card, and a slot if the look takes one. */
  function canAdd(effect: Effect | CardEffect): boolean {
    if (checked.has(effect.id)) return true;
    if (checked.size >= MAX_EFFECTS) return false;
    return !(takesSlot(effect, owned) && full);
  }

  function showEffect(effect: Effect) {
    setRequestedId(effect.id);
    startTransition(() => setPreviewId(effect.id));
  }

  /** Downloads the preview table of an effect that the pointer or the focus reaches. */
  function prefetch(effect: Effect) {
    if (catalog) prefetchTable(previewTable(catalog.target, effect));
  }

  /** Starts the preview at the press, before the click, which comes at the release. */
  function startPreview(effect: Effect) {
    if (catalog) preview(source, previewOf(effect, catalog)).catch(() => undefined);
  }

  /** Adds imports of one source and checks them if they follow it closely and the package has
   * room. Returns true when the package had no room for one of them. */
  function importEffects(added: readonly ImportedEffect[]): boolean {
    const first = added[0];
    if (!first) return false;
    for (const effect of added) onImport(effect);
    const { selection: next, full: noRoom } = selectImport(
      checked,
      added.map((effect) => effect.id),
      importFit(first.imported),
    );
    if (next !== checked) onSelectionChange(next);
    showEffect(first);
    return noRoom;
  }

  /** Shows a sample photo: the one picked, else the last sample. */
  function showSample(next: Source = lastSample.current) {
    loader.cancel();
    setDecoding(false);
    setPhotoError(false);
    lastSample.current = next;
    startTransition(() => setSource(next));
    if (photo.current) forget(photo.current);
    photo.current = null;
  }
  const lastSample = useRef<Source>(DEFAULT_SAMPLE);

  async function openPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setPhotoError(false);
    setDecoding(true);
    try {
      const image = await loader.open(file);
      // A replacement, sample selection, or unmount cancelled this request.
      if (!image) return;
      const next: Source = { key: `photo-${++photoCount.current}`, load: async () => image };
      const previous = photo.current;
      photo.current = next;
      startTransition(() => setSource(next));
      if (previous) forget(previous);
      setDecoding(false);
    } catch {
      setPhotoError(true);
      setDecoding(false);
    }
  }

  const sample = sampleOf(source);
  const sourceLabel = sample ? t.samplePhoto : t.yourPhoto;
  const requestedOn = !!requested && checked.has(requested.id);
  const credit = sample?.credit ?? SAMPLES[0]!.credit;

  function toggleFullscreen() {
    // A refusal, such as without a user gesture, leaves the page as it is.
    if (fullscreen) document.exitFullscreen().catch(() => undefined);
    else viewer?.requestFullscreen().catch(() => undefined);
  }

  /**
   * Puts the shown looks on the card, as many as fit: room on the card, and a free slot for each
   * look that takes one.
   */
  function addShown() {
    const next = new Set(checked);
    for (const effect of visible) {
      if (next.size >= MAX_EFFECTS) break;
      if (next.has(effect.id) || effect.card) continue;
      if (takesSlot(effect, owned) && usedSlots(listed, next, owned) >= slots) continue;
      next.add(effect.id);
    }
    if (next.size !== checked.size) onSelectionChange(next);
  }
  // The starter set: the looks that a new visitor finds on the card.
  const starter = resolveSelection(null, catalog?.effects.map((effect) => effect.id) ?? []);
  const canAddShown =
    checked.size < MAX_EFFECTS && visible.some((effect) => !checked.has(effect.id) && !effect.card && canAdd(effect));

  function retryPreview() {
    forget(source);
    setPreviewAttempt((attempt) => attempt + 1);
  }

  const addButton = (size: 'sm' | 'default') =>
    requested && (
      <Button
        type="button"
        variant={requestedOn ? 'secondary' : 'brand'}
        size={size}
        className="shrink-0"
        aria-pressed={requestedOn}
        disabled={!requestedOn && checked.size >= MAX_EFFECTS}
        onClick={() => (requestedOn || canAdd(requested) ? toggle(requested) : onPlus())}
      >
        {requestedOn ? <Check aria-hidden="true" /> : canAdd(requested) ? <Plus aria-hidden="true" /> : <Lock aria-hidden="true" />}
        {requestedOn ? t.onCard : t.addToCard}
      </Button>
    );

  const still = (
    <Frame>
      <img src={landingImage('looks/standard.jpg')} alt={`${t.samplePhoto} — ${t.original}`} className="absolute inset-0 size-full object-cover" />
      <LookName>{t.original}</LookName>
    </Frame>
  );

  return (
    <section
      className="grid gap-x-10 gap-y-6 lg:grid-cols-2 lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-x-14"
      aria-labelledby="looks-title"
      ref={ownPhoto}
    >
      {/* The heading of the looks page. */}
      <div id={LANDING_HERO} className="min-w-0 pt-[clamp(24px,5vh,56px)] lg:col-start-1 lg:row-start-1">
        <h1
          id="looks-title"
          className="text-balance text-[clamp(30px,3.4vw,44px)] leading-[1.1] font-semibold tracking-[-0.02em] [:root[lang=th]_&]:leading-[1.3] [:root[lang=th]_&]:tracking-normal"
        >
          {t.site.toolHeading}
        </h1>
        <p className="mt-4 max-w-[40em] text-[15px] leading-relaxed text-muted-foreground">{t.site.looksLead}</p>
      </div>

      {/* The photograph, which stays in view while the shelf scrolls. */}
      <aside
        className="sticky top-24 z-20 -mx-gutter min-w-0 bg-background px-gutter pt-3 pb-3 lg:top-[72px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:self-start lg:px-0 lg:pt-[clamp(28px,6vh,72px)] lg:pb-0"
        aria-label={t.preview}
      >
        <div
          ref={setViewer}
          className="relative [&:fullscreen]:flex [&:fullscreen]:items-center [&:fullscreen]:justify-center [&:fullscreen]:bg-black"
        >
        {shown && previewed ? (
          <ErrorBoundary
            resetKey={`${source.key}\n${shown.id}\n${previewAttempt}`}
            fallback={
              <Frame>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center text-sm">
                  <p>{t.previewError}</p>
                  <Button type="button" variant="outline" size="sm" onClick={retryPreview}>
                    {t.retryPreview}
                  </Button>
                </div>
              </Frame>
            }
          >
            <Suspense fallback={<Placeholder text={sourceLabel} busy />}>
              <PreviewFrame
                source={source}
                effect={previewed}
                compareLabel={t.compare}
                busy={isPending || decoding}
                status={waiting}
                originalLabel={t.original}
                originalAlt={sourceLabel}
                effectName={shown.name}
              />
            </Suspense>
          </ErrorBoundary>
        ) : (
          still
        )}
        {/* On a phone the name and the button lie over the photo, so the sticky block stays short. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] flex items-end justify-between gap-3 rounded-b-2xl bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 lg:hidden [:fullscreen>&]:flex [:fullscreen>&]:rounded-none [:fullscreen>&]:p-5">
          <span className="min-w-0 truncate text-[15px] font-semibold text-white drop-shadow">{requested?.name ?? t.original}</span>
          <span className="pointer-events-auto">{addButton('sm')}</span>
        </div>
        {canFullscreen && shown && (
          <Button
            type="button"
            size="icon"
            className="absolute top-3 left-3 z-[4] size-9 rounded-md bg-black/75 text-white hover:bg-black [:fullscreen>&]:top-5 [:fullscreen>&]:left-5"
            aria-label={fullscreen ? t.exitFullScreen : t.fullScreen}
            title={fullscreen ? t.exitFullScreen : t.fullScreen}
            onClick={toggleFullscreen}
          >
            {fullscreen ? <Minimize aria-hidden="true" /> : <Maximize aria-hidden="true" />}
          </Button>
        )}
        </div>
        <div className="mt-5 hidden items-start justify-between gap-4 lg:flex">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t.previewing}</p>
            <h2 className="truncate text-xl font-semibold">{requested?.name ?? t.original}</h2>
            {requested && STOCKS[requested.id] && (
              <p className="font-mono text-[13px] text-muted-foreground">{stockText(STOCKS[requested.id]!, t)}</p>
            )}
            {look && <p className="mt-0.5 text-sm text-muted-foreground">{look}</p>}
            {requested && !requested.imported && t.lookHints[requested.id] && (
              <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">{t.lookHints[requested.id]}</p>
            )}
            {requested && onCard && (
              <span className="mt-2 inline-flex">
                <ChangeBadge on={onCard.has(requested.id)} checked={checked.has(requested.id)} changed={changedOnCard?.has(requested.id)} strings={t} />
              </span>
            )}
          </div>
          {addButton('default')}
        </div>
        <div className="mt-2 hidden flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground lg:flex">
          <Button asChild variant="ghost" size="sm" className={cn('-ml-2.5 text-[13px]', FILE_FOCUS)}>
            <label htmlFor="photo-input">
              <Upload aria-hidden="true" />
              <span>{t.site.ownPhoto}</span>
            </label>
          </Button>
          <input id="photo-input" className="sr-only" type="file" accept=".dng,image/x-adobe-dng" onChange={openPhoto} />
          {!sample && (
            <Button type="button" variant="ghost" size="sm" className="text-[13px]" onClick={() => showSample()}>
              {t.useSample}
            </Button>
          )}
          {photoError ? (
            <span role="alert" className="text-destructive">
              {t.photoError}
            </span>
          ) : sample ? (
            <a href={credit.source} target="_blank" rel="noreferrer" className="hover:text-foreground">
              {credit.author} · {credit.license} · {credit.camera}
            </a>
          ) : (
            <span>{t.uploadNote}</span>
          )}
        </div>
        {/* The sample photos: a street, a tram, a neon night, a lake, a temple, a beach. */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label={t.samplePhotos}>
          {SAMPLES.map((item) => (
            <button
              key={item.source.key}
              type="button"
              className={cn(
                'relative aspect-[3/2] w-16 shrink-0 overflow-hidden rounded-md ring-1 ring-black/20 transition-opacity hover:opacity-100 sm:w-20',
                source === item.source ? 'opacity-100 ring-2 ring-brand' : 'opacity-60',
              )}
              aria-label={`${item.credit.title} · ${item.credit.camera}`}
              aria-pressed={source === item.source}
              onClick={() => showSample(item.source)}
            >
              <img src={item.thumbnail} alt="" width="360" height="240" loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>
        <p className="mt-1 hidden text-[13px] text-muted-foreground/80 lg:block">{t.previewNote}</p>
      </aside>

      {/* The shelf. */}
      <div id="looks" className="min-w-0 scroll-mt-28 md:scroll-mt-20 lg:col-start-1 lg:row-start-2">
        {/* The looks on the card: the count of the free places, the looks, and the way back to the starter set. */}
        <section aria-labelledby="card-looks" className="mb-6 rounded-2xl border bg-card p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <h2 id="card-looks" className="flex min-w-0 flex-col gap-x-2 text-base font-semibold sm:flex-row sm:items-baseline">
              {t.onCard}
              <span className="text-sm font-normal text-muted-foreground tabular-nums">
                {owned.plus ? t.slotsUsed(checked.size, MAX_EFFECTS) : t.site.freeUsed(used, slots)}
              </span>
            </h2>
            <div className="flex shrink-0 items-center gap-1">
              {catalog && !sameSet(checked, starter) && (
                <Button type="button" variant="ghost" size="xs" onClick={() => onSelectionChange(starter)}>
                  {t.site.starterSet}
                </Button>
              )}
              {checked.size > 0 && (
                <Button type="button" variant="ghost" size="xs" onClick={() => onSelectionChange(new Set())}>
                  {t.clear}
                </Button>
              )}
            </div>
          </div>
          {checked.size > 0 ? (
            <div className="mt-2">
              <ul className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label={t.onCard}>
                {listed
                  .filter((effect) => checked.has(effect.id))
                  .map((effect) => (
                    <li key={effect.id} className="relative shrink-0 pt-2 pr-2 motion-safe:animate-[box-in_220ms_ease-out]">
                      <button
                        type="button"
                        className={cn('block rounded-md p-0.5', effect.id === requested?.id && 'ring-2 ring-brand/70', RING)}
                        aria-label={t.previewOf(effect.name)}
                        title={effect.name}
                        onClick={() => {
                          if (!effect.card) showEffect(effect);
                        }}
                      >
                        <EffectIcon effect={effect} className="size-11" />
                      </button>
                      <button
                        type="button"
                        className={cn('absolute top-0 right-0 flex size-4 items-center justify-center rounded-full bg-muted text-foreground ring-2 ring-card hover:bg-brand hover:text-white', RING)}
                        aria-label={t.removeOf(effect.name)}
                        onClick={() => toggle(effect)}
                      >
                        <X className="size-2.5" strokeWidth={3} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">{t.filmLookEmpty}</p>
          )}
          {!owned.plus && (
            <p className="mt-2 text-[13px] text-muted-foreground">
              {t.plus.title} ·{' '}
              <button type="button" className="font-medium text-foreground underline-offset-4 hover:underline" onClick={onPlus}>
                {t.plus.getMore}
              </button>
            </p>
          )}
        </section>
        {(() => {
          const lines = ownedLines(owned, t.plus, catalog ? packCounts(catalog.effects) : null);
          if (lines.length === 0) return null;
          // Bought looks are unlocked, not placed: this puts the ones not yet on the card there, as many as fit.
          const bought = listed.filter((effect) => !effect.card && unlockedBy(effect, owned));
          const notOnCard = bought.filter((effect) => !checked.has(effect.id));
          const fits = Math.min(notOnCard.length, Math.max(0, MAX_EFFECTS - checked.size));
          const addOwned = () => {
            const next = new Set(checked);
            for (const effect of notOnCard.slice(0, fits)) next.add(effect.id);
            onSelectionChange(next);
          };
          return (
            <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-brand/40 bg-brand/[0.08] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="m-0 flex items-center gap-2 text-lg font-semibold tracking-tight">
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground">
                    <Check className="size-4" aria-hidden="true" />
                  </span>
                  {t.plus.yoursTitle}
                </p>
                <ul className="m-0 mt-2 flex list-none flex-col gap-0.5 p-0 text-sm">
                  {lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                {plusKey && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {/* The key in use, as a chip; the actions are buttons, so they read apart. */}
                    <span
                      className="inline-flex h-7 items-center gap-1.5 rounded-md border bg-background/60 px-2 font-mono text-xs tabular-nums text-muted-foreground"
                      title={t.plus.keyInUse(plusKey)}
                      aria-label={t.plus.keyInUse(`${plusKey.slice(0, 4)}-•••-${plusKey.slice(-4)}`)}
                    >
                      <KeyRound className="size-3.5" aria-hidden="true" />
                      {`${plusKey.slice(0, 4)}-•••-${plusKey.slice(-4)}`}
                    </span>
                    {onOtherKey && (
                      <Button type="button" variant="outline" size="xs" className="h-7" onClick={onOtherKey}>
                        {t.plus.useOtherKey}
                      </Button>
                    )}
                    {onForgetKey && (
                      <Button type="button" variant="ghost" size="xs" className="h-7 text-muted-foreground hover:text-destructive" onClick={onForgetKey}>
                        {t.plus.forget}
                      </Button>
                    )}
                  </div>
                )}
                {fits > 0 && <p className="m-0 mt-2 text-[13px] leading-snug text-muted-foreground">{t.plus.ownedHint}</p>}
                {fits > 0 && (
                  <Button type="button" variant="brand" size="sm" className="mt-3" onClick={addOwned}>
                    <Plus aria-hidden="true" />
                    {notOnCard.length === bought.length ? t.plus.addOwned(fits) : t.plus.addOwnedRest(fits)}
                  </Button>
                )}
              </div>
              {!owned.plus && (
                <Button type="button" variant="outline" className="shrink-0" onClick={onPlus}>
                  <Sparkles aria-hidden="true" />
                  {t.plus.addMore}
                </Button>
              )}
            </div>
          );
        })()}
        {notice && (
          <Alert className="mb-4">
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        )}
        {full && !owned.plus && (
          <Alert className="mb-4 border-brand/40">
            <Lock aria-hidden="true" />
            <AlertTitle>{t.plus.lockedTitle}</AlertTitle>
            <AlertDescription className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span>{t.plus.lockedText(slots)}</span>
              <Button type="button" variant="brand" size="sm" onClick={onPlus}>
                <Sparkles aria-hidden="true" />
                {t.plus.getMore}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                className="h-10 bg-card pl-10 text-[15px]"
                placeholder={t.searchEffects}
                aria-label={t.searchEffects}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger className="h-10 w-40 shrink-0 bg-card data-[size=default]:h-10" aria-label={t.allBrands}>
                <SelectValue>
                  {brand === 'all' ? (
                    t.allBrands
                  ) : (
                    <span className="flex items-center gap-2">
                      <BrandSwatch brand={brand} />
                      <span className="truncate">{brand}</span>
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent position="popper" align="end" className="min-w-44">
                <SelectItem value="all">
                  <span className="size-4 shrink-0" aria-hidden="true" />
                  {t.allBrands}
                </SelectItem>
                {brands.map((item) => (
                  <SelectItem key={item} value={item} textValue={item}>
                    <BrandSwatch brand={item} />
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* The kinds of film on one line, the chosen one underlined; the line scrolls on a phone. */}
          <Tabs value={kind} onValueChange={(value) => setKind(value as FilmKind | 'all')} className="-mx-gutter min-w-0 px-gutter lg:mx-0 lg:px-0">
            <TabsList
              variant="line"
              className="h-auto w-full max-w-full justify-start gap-0 overflow-x-auto border-b border-border p-0 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label={t.searchEffects}
            >
              <TabsTrigger value="all" className="h-8 flex-none px-3 text-[13px]">
                {t.filterAll}
              </TabsTrigger>
              {kinds.map((item) => (
                <TabsTrigger key={item} value={item} className="h-8 flex-none px-3 text-[13px]">
                  {kindLabel(item, t)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted-foreground tabular-nums">
            <span className="flex items-center gap-2">
              {catalog ? t.shownOf(visible.length, listed.length) : error ? t.loadError : t.loading}
              {catalog && (needle || kind !== 'all' || brand !== 'all') && (
                <Button type="button" variant="ghost" size="xs" disabled={!canAddShown} onClick={addShown}>
                  {t.selectAll}
                </Button>
              )}
            </span>
            {/* The key to the marks on the boxes. */}
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1.5">
                <span className="flex size-4 items-center justify-center rounded-full bg-foreground text-background" aria-hidden="true">
                  <Check className="size-2.5" strokeWidth={3} />
                </span>
                {t.onCard}
              </span>
              {owned.plus || owned.packs.length > 0 ? (
                <span className="flex items-center gap-1.5">
                  <PlusMark />
                  {t.plus.legendPlus}
                </span>
              ) : (
                <span>{t.previewFree}</span>
              )}
            </span>
          </div>
          {error && (
            <Button type="button" variant="outline" size="sm" className="self-start" onClick={retry}>
              {t.retryLoad}
            </Button>
          )}
        </div>


        <ul className="mt-4 grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-6 " aria-label={t.effects}>
          {!catalog &&
            !error &&
            Array.from({ length: 21 }, (_, index) => (
              <li key={index} className="aspect-[5/6] animate-pulse rounded-lg border bg-card" aria-hidden="true" />
            ))}
          {catalog && visible.length === 0 && (
            <li className="col-span-full py-10 text-center text-muted-foreground">{t.noMatches}</li>
          )}
          {shownLooks.map((effect) => {
            const isChecked = checked.has(effect.id);
            const isPreviewed = effect.id === requested?.id;
            const stock = STOCKS[effect.id];
            // The box and one line of name: the preview pane tells the rest. The stock and the
            // kind are in the tooltip of the card.
            const detail = [effect.card ? t.cardOnlyEffect : effect.monochrome ? t.mono : t.color, stock ? stockText(stock, t) : null]
              .filter(Boolean)
              .join(' · ');
            const body = (
              <>
                {/* A look on the card shows faded with a check over the box: it is taken, the
                    row above lists it, and a press still previews it. */}
                <span className="relative">
                  <EffectIcon effect={effect} className={cn('size-14 transition-opacity sm:size-16', isChecked && 'opacity-35 grayscale-[60%]')} />
                  {isChecked && (
                    <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                      <span className="flex size-7 items-center justify-center rounded-full bg-foreground text-background shadow-sm">
                        <Check className="size-4" strokeWidth={3} />
                      </span>
                    </span>
                  )}
                </span>
                <span className="line-clamp-2 w-full text-center text-[11px] leading-[1.25] font-medium">{effect.name}</span>
              </>
            );
            return (
              <li
                key={effect.id}
                title={`${effect.name} · ${detail}`}
                className={cn(
                  'relative flex flex-col rounded-lg border bg-card p-1.5 pt-2 transition-colors hover:border-input',
                  isChecked && 'bg-card/40 text-muted-foreground',
                  isPreviewed && 'border-brand ring-2 ring-brand/70 hover:border-brand',
                )}
                data-checked={isChecked || undefined}
                data-previewed={isPreviewed || undefined}
              >
                {unlockedBy(effect, owned) && (
                  <span className="absolute top-1 left-1 z-10" title={t.plus.legendPlus}>
                    <PlusMark />
                  </span>
                )}
                {effect.card ? (
                  <div className="flex w-full flex-1 flex-col items-center gap-1.5 pt-0.5 text-center">{body}</div>
                ) : (
                  <button
                    type="button"
                    className={cn('flex w-full flex-1 flex-col items-center gap-1.5 rounded-md pt-0.5 text-center select-none', RING)}
                    aria-pressed={isPreviewed}
                    aria-label={isChecked ? `${t.previewOf(effect.name)} · ${t.onCard}` : t.previewOf(effect.name)}
                    onPointerEnter={() => prefetch(effect)}
                    onFocus={() => prefetch(effect)}
                    onPointerDown={() => startPreview(effect)}
                    onClick={() => showEffect(effect)}
                    // A double click puts the look on the card, or takes it off, as the add button does.
                    onDoubleClick={() => (isChecked || canAdd(effect) ? toggle(effect) : onPlus())}
                  >
                    {body}
                  </button>
                )}
                {onCard && (
                  <span className="absolute -top-1.5 -left-1.5 scale-90">
                    <ChangeBadge on={onCard.has(effect.id)} checked={isChecked} changed={changedOnCard?.has(effect.id)} strings={t} />
                  </span>
                )}
                {effect.imported && (
                  <span className="mt-1 flex justify-center gap-0.5">
                    {editable(effect) && (
                      <Button type="button" variant="ghost" size="xs" aria-label={t.editOf(effect.name)} onClick={() => editor.current?.open(effect)}>
                        {t.editEffect}
                      </Button>
                    )}
                    <Button type="button" variant="ghost" size="xs" aria-label={t.removeOf(effect.name)} onClick={() => onRemove(effect)}>
                      {t.removeEffect}
                    </Button>
                  </span>
                )}
              </li>
            );
          })}
          {catalog?.baseGamma && (
            <li className="flex flex-col rounded-lg border border-dashed p-1.5 pt-2">
              <button
                type="button"
                className={cn('flex w-full flex-1 flex-col items-center justify-center gap-1.5 rounded-md pt-0.5 text-center text-muted-foreground hover:text-foreground', RING)}
                onClick={() => importer.current?.open()}
              >
                <span className="flex size-9 items-center justify-center rounded-full border" aria-hidden="true">
                  <Plus className="size-4" />
                </span>
                <span className="w-full truncate text-[11px] leading-tight font-medium">{t.importOpen}</span>
              </button>
            </li>
          )}
        </ul>
        {shownLooks.length < visible.length && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto sm:min-w-48"
              onClick={() => setPages((current) => current + 1)}
            >
              {t.loadMore}
            </Button>
            <span className="text-[13px] text-muted-foreground tabular-nums">{t.shownOf(shownLooks.length, visible.length)}</span>
          </div>
        )}
        <p className="mt-4 text-[13px] text-muted-foreground">
          {t.countLimit(MAX_EFFECTS)}
          {onCard && ` ${t.effectsCardNote}`}
        </p>

        {catalog?.baseGamma && (
          <ImportDialog ref={importer} strings={t} baseGamma={catalog.baseGamma} taken={taken} onImport={(effect) => importEffects([effect])} family={family} recipes={recipes} onAddRecipe={onAddRecipe} />
        )}
        <EditDialog ref={editor} strings={t} onSave={onEdit} />
      </div>
    </section>
  );
}

/** The frame of the photograph: a 3:2 picture over the dark, which clips what it holds. */
function Frame({ busy = false, children }: { busy?: boolean; children: ReactNode }) {
  return (
    <div
      className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-black shadow-[0_30px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.06] [:fullscreen>&]:w-[min(100%,calc(100vh*3/2))] [:fullscreen>&]:rounded-none [:fullscreen>&]:shadow-none [:fullscreen>&]:ring-0"
      aria-busy={busy}
    >
      {children}
    </div>
  );
}

/** The name of the look over the frame. */
function LookName({ children }: { children: ReactNode }) {
  return (
    <Badge className="pointer-events-none absolute top-3 right-3 z-[2] rounded-md bg-black/75 px-2 py-1 font-mono text-xs font-medium text-foreground">
      {children}
    </Badge>
  );
}

interface FrameProps {
  source: Source;
  effect: PreviewEffect;
  compareLabel: string;
  busy: boolean;
  /** The text over the frame while a new preview is on its way. */
  status: string | null;
  originalLabel: string;
  originalAlt: string;
  effectName: string;
}

/** The baseline development on the left and the effect on the right, under a handle. */
function PreviewFrame({ source, effect, compareLabel, busy, status, originalLabel, originalAlt, effectName }: FrameProps) {
  const result = use(preview(source, effect));
  const comparison = useReactCompareSlider({ clip: 'itemTwo' });
  return (
    <Frame busy={busy}>
      <Provider {...comparison}>
        <Root className="image-comparison">
          <Item item="itemOne">
            <img src={result.original} alt={`${originalAlt} — ${originalLabel}`} />
          </Item>
          <Item item="itemTwo" className="comparison-effect">
            <img src={result.processed} alt={`${originalAlt} — ${effectName}`} />
          </Item>
          <HandleRoot aria-label={compareLabel}>
            <Handle buttonStyle={{ width: 32, height: 32, gap: '0.2rem' }} />
          </HandleRoot>
        </Root>
      </Provider>
      <LookName>{effectName}</LookName>
      {status && (
        <span
          className="pointer-events-none absolute bottom-4 left-1/2 z-[3] inline-flex max-w-[calc(100%-32px)] -translate-x-1/2 items-center gap-2.5 rounded-md bg-black/80 px-3.5 py-2 text-[13px] whitespace-nowrap text-foreground"
          role="status"
        >
          <LoaderCircle className="size-3.5 shrink-0 animate-spin" aria-hidden="true" />
          <span className="truncate">{status}</span>
        </span>
      )}
    </Frame>
  );
}

function Placeholder({ text, busy = false }: { text: string; busy?: boolean }) {
  return (
    <Frame busy={busy}>
      <span className="absolute inset-0 flex items-center justify-center gap-2.5 font-mono text-[13px] text-muted-foreground">
        {busy && <LoaderCircle className="size-3.5 shrink-0 animate-spin" aria-hidden="true" />}
        {text}
      </span>
    </Frame>
  );
}
