import {
  Suspense,
  use,
  useCallback,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import { Check, LoaderCircle, Lock, Plus, Search, Sparkles, TriangleAlert, Upload, X } from 'lucide-react';
import { Handle, HandleRoot, Item, Provider, Root } from 'react-compare-slider/components';
import { useReactCompareSlider } from 'react-compare-slider/hooks';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { LaunchOffer } from './LaunchOffer';
import { CAMERAS, PREVIEW_TARGET } from '../cameras';
import { effectUrl, MAX_EFFECTS, previewTable, type CardEffect, type Catalog, type Effect, type ImportedEffect } from '../catalog';
import { brandOf, FILM_KINDS, filmKind, type FilmKind } from '../filmKind';
import { sentences, type Strings } from '../i18n';
import { editable } from '../import/edit';
import { LANDING_HERO, landingImage } from '../landing';
import { inLaunch, ownedLines, packCounts, PRICES, REGULAR_PRICES, slotsOf, takesSlot, unlockedBy, usedSlots, type Entitlement } from '../plus';
import { PhotoLoader } from '../preview/raw';
import { forget, prefetchTable, preview, type PreviewEffect, type Source } from '../preview/render';
import { DEFAULT_SAMPLE, SAMPLES, sampleOf } from '../preview/samples';
import { importFit, resolveSelection, selectImport, type Selection } from '../selection';
import { STOCKS } from '../stocks';
import { useCatalog } from '../useCatalog';
import { EditDialog, type EditDialogHandle } from './EditDialog';
import { BrandSwatch } from './BrandMark';
import { EffectIcon } from './EffectIcon';
import { ErrorBoundary } from './ErrorBoundary';
import { ImportDialog, type ImportDialogHandle } from './ImportDialog';
import { StepHeading } from './Step';

/** GRKU's own look, which the page shows first. */
const FIRST_LOOK = 'positive-film-grii-v1';

/** The headline with each brand name (RICOH GR…) as its own inline box, so the brand stays on one line. */
function Headline({ text }: { text: string }) {
  return text.split(/(RICOH GR[\w ]*?(?= |$))/).map((part, index) =>
    /^RICOH GR/.test(part) ? (
      <span key={index} className="inline-block" lang="en">
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

/** The cameras that GRKU supports, by the names of the installer. */
const SUPPORTED_CAMERAS = CAMERAS.filter((camera) => camera.support)
  .map((camera) => camera.name)
  .join(' · ');

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
  /** Whether this browser writes to a card, which the line under the headline tells. */
  canWrite: boolean;
  /** What the visitor owns of GRKU Plus. */
  owned: Entitlement;
  /** Opens GRKU Plus. */
  onPlus: () => void;
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
  canWrite,
  owned,
  onPlus,
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
      {/* The headline. */}
      <div id={LANDING_HERO} className="min-w-0 pt-[clamp(28px,6vh,72px)] lg:col-start-1 lg:row-start-1">
        <h1 className="text-balance text-[clamp(38px,4.6vw,60px)] leading-[1.06] font-bold tracking-[-0.025em] [:root[lang=th]_&]:leading-[1.22] [:root[lang=th]_&]:tracking-normal">
          <Headline text={t.lead[0] ?? ''} />
        </h1>
        <p className="mt-4 max-w-[30em] text-[clamp(16px,1.3vw,19px)] leading-relaxed text-muted-foreground">{t.lead[1]}</p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Button asChild variant="brand" size="lg" className="h-11 px-6 text-[15px]">
            <a href="#looks">{t.chooseLooks}</a>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11 px-6 text-[15px]">
            <a href="#install">{t.install}</a>
          </Button>
        </div>
        <p className="mt-5 max-w-[40em] text-sm leading-relaxed text-muted-foreground">
          {sentences(t.landing.supports(SUPPORTED_CAMERAS), canWrite ? t.landing.installNote : t.landing.installNoteZip)}
        </p>
        <p className="mt-3 flex items-start gap-2 text-sm font-medium">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
          {t.riskShort}
        </p>
      </div>

      {/* The photograph, which stays in view while the shelf scrolls. */}
      <aside
        className="sticky top-14 z-20 -mx-gutter min-w-0 bg-background px-gutter pt-3 pb-3 lg:top-[72px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:self-start lg:px-0 lg:pt-[clamp(28px,6vh,72px)] lg:pb-0"
        aria-label={t.preview}
      >
        <div className="relative">
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
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] flex items-end justify-between gap-3 rounded-b-2xl bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 lg:hidden">
          <span className="min-w-0 truncate text-[15px] font-semibold text-white drop-shadow">{requested?.name ?? t.original}</span>
          <span className="pointer-events-auto">{addButton('sm')}</span>
        </div>
        </div>
        <div className="mt-5 hidden items-start justify-between gap-4 lg:flex">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t.previewing}</p>
            <h2 className="truncate text-xl font-semibold">{requested?.name ?? t.original}</h2>
            {requested && STOCKS[requested.id] && (
              <p className="font-mono text-[13px] text-muted-foreground">{stockText(STOCKS[requested.id]!, t)}</p>
            )}
            {look && <p className="mt-0.5 text-sm text-muted-foreground">{look}</p>}
          </div>
          {addButton('default')}
        </div>
        <div className="mt-2 hidden flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground lg:flex">
          <Button asChild variant="ghost" size="sm" className={cn('-ml-2.5 text-[13px]', FILE_FOCUS)}>
            <label htmlFor="photo-input">
              <Upload aria-hidden="true" />
              <span>{t.upload}</span>
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
      <div id="looks" className="min-w-0 scroll-mt-20 lg:col-start-1 lg:row-start-2">
        <StepHeading
          id="looks-title"
          number={t.step(1)}
          title={t.effects}
          className="mb-5"
          aside={
            <>
              <div className="flex items-center gap-3">
                <Progress value={Math.min(100, (used / Math.max(slots, 1)) * 100)} className="w-20 [&>div]:bg-brand" aria-hidden="true" />
                <span className="text-sm tabular-nums">
                  <b className="font-semibold">{used}</b>
                  <span className="text-muted-foreground"> / {slots}</span>
                </span>
              </div>
              {!owned.plus && (
                <Button type="button" variant="brand" size="sm" onClick={onPlus}>
                  <Sparkles aria-hidden="true" />
                  {t.plus.getMore}
                </Button>
              )}
            </>
          }
        />
        {(() => {
          const lines = ownedLines(owned, t.plus, catalog ? packCounts(catalog.effects) : null);
          if (lines.length === 0) return null;
          // Bought looks are unlocked, not placed: this puts the ones not yet on the card there, as many as fit.
          const notOnCard = listed.filter((effect) => !effect.card && unlockedBy(effect, owned) && !checked.has(effect.id));
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
                {fits > 0 && <p className="m-0 mt-2 text-[13px] leading-snug text-muted-foreground">{t.plus.ownedHint}</p>}
                {fits > 0 && (
                  <Button type="button" variant="brand" size="sm" className="mt-3" onClick={addOwned}>
                    <Plus aria-hidden="true" />
                    {t.plus.addOwned(fits)}
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
        {!owned.plus && ownedLines(owned, t.plus, null).length === 0 && (
          <div className="mb-4 overflow-hidden rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/[0.16] via-card to-card">
            <div className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground">
                      <Sparkles className="size-4" aria-hidden="true" />
                    </span>
                    {t.plus.title}
                  </p>
                  <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">{t.plus.lead}</p>
                </div>
                <Button type="button" variant="brand" className="hidden shrink-0 sm:inline-flex" onClick={onPlus}>
                  <Sparkles aria-hidden="true" />
                  {t.plus.getMore}
                </Button>
              </div>
              <LaunchOffer strings={t} />
              {/* The three tiers at a glance; each opens GRKU Plus. */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {(() => {
                  const counts = catalog ? packCounts(catalog.effects) : null;
                  const total = catalog ? catalog.effects.length : 135;
                  return [
                    [t.plus.tierAll, PRICES.plus, true, t.plus.outcomeAll(total, MAX_EFFECTS), REGULAR_PRICES.plus],
                    [t.plus.tierSlots, PRICES.slots25, false, t.plus.outcomeSlots(25), REGULAR_PRICES.slots25],
                    [t.plus.tierPack, PRICES['pack:kodak'], false, t.plus.outcomePack(counts?.kodak ?? 16, t.plus.packs.kodak, 10, 10 + (counts?.kodak ?? 16)), REGULAR_PRICES['pack:kodak']],
                  ] as const;
                })().map(([name, price, featured, outcome, regular]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={onPlus}
                    className={cn(
                      'flex flex-col items-start gap-1 rounded-xl border bg-background/60 px-3 py-3 text-left transition-colors hover:border-brand/60 hover:bg-background',
                      featured ? 'border-brand shadow-[0_0_0_1px_var(--brand)]' : 'border-border',
                    )}
                  >
                    <span className="text-xs text-muted-foreground">{name}</span>
                    <span className="flex items-baseline gap-1.5">
                      <span className={cn('text-xl font-semibold tabular-nums tracking-tight', featured && 'text-brand')}>฿{price}</span>
                      {inLaunch() && regular > price && <s className="text-[12px] tabular-nums text-muted-foreground">฿{regular}</s>}
                    </span>
                    <span className="text-[11.5px] leading-snug text-muted-foreground">{outcome}</span>
                  </button>
                ))}
              </div>
              <Button type="button" variant="brand" size="lg" className="sm:hidden" onClick={onPlus}>
                <Sparkles aria-hidden="true" />
                {t.plus.getMore}
              </Button>
            </div>
          </div>
        )}
        <p className="mb-4 text-[13px] text-muted-foreground">{t.freeIncludes(slotsOf({ ...owned, plus: false, slots: owned.slots }))}</p>

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
            <span>{catalog ? t.shownOf(visible.length, listed.length) : error ? t.loadError : t.loading}</span>
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

        {checked.size > 0 && (
          <div className="mt-4 rounded-xl border bg-card/60 p-3">
            <div className="mb-2 flex items-center justify-between gap-3 text-[13px]">
              <span className="font-medium">
                {t.onCard} · <span className="tabular-nums">{checked.size}</span>
              </span>
              <Button type="button" variant="ghost" size="xs" onClick={() => onSelectionChange(new Set())}>
                {t.clear}
              </Button>
            </div>
            <ul className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label={t.onCard}>
              {listed
                .filter((effect) => checked.has(effect.id))
                .map((effect) => (
                  <li key={effect.id} className="relative shrink-0 pt-2 pr-2">
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
        )}

        <ul className="mt-4 grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-6 xl:grid-cols-7" aria-label={t.effects}>
          {!catalog &&
            !error &&
            Array.from({ length: 21 }, (_, index) => (
              <li key={index} className="aspect-[5/6] animate-pulse rounded-lg border bg-card" aria-hidden="true" />
            ))}
          {catalog && visible.length === 0 && (
            <li className="col-span-full py-10 text-center text-muted-foreground">{t.noMatches}</li>
          )}
          {visible.map((effect) => {
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
                    className={cn('flex w-full flex-1 flex-col items-center gap-1.5 rounded-md pt-0.5 text-center', RING)}
                    aria-pressed={isPreviewed}
                    aria-label={isChecked ? `${t.previewOf(effect.name)} · ${t.onCard}` : t.previewOf(effect.name)}
                    onPointerEnter={() => prefetch(effect)}
                    onFocus={() => prefetch(effect)}
                    onPointerDown={() => startPreview(effect)}
                    onClick={() => showEffect(effect)}
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
        <p className="mt-4 text-[13px] text-muted-foreground">
          {t.countLimit(MAX_EFFECTS)}
          {onCard && ` ${t.effectsCardNote}`}
        </p>

        {catalog?.baseGamma && (
          <ImportDialog ref={importer} strings={t} baseGamma={catalog.baseGamma} taken={taken} onImport={(effect) => importEffects([effect])} />
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
      className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-black shadow-[0_30px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.06]"
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
