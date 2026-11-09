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
import { ChevronDown, LoaderCircle, Lock, Plus, Search, Upload } from 'lucide-react';
import { Handle, HandleRoot, Item, Provider, Root } from 'react-compare-slider/components';
import { useReactCompareSlider } from 'react-compare-slider/hooks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { PREVIEW_TARGET } from '../cameras';
import {
  effectUrl,
  loadCatalog,
  MAX_EFFECTS,
  previewTable,
  type CardEffect,
  type Effect,
  type ImportedEffect,
} from '../catalog';
import { sentences, type Language, type Strings } from '../i18n';
import { forget, prefetchTable, preview, type PreviewEffect, type Source } from '../preview/render';
import { DEFAULT_SAMPLE } from '../preview/samples';
import { brandOf, FILM_KINDS, filmKind, type FilmKind } from '../filmKind';
import { PhotoLoader } from '../preview/raw';
import { editable } from '../import/edit';
import { missingNativeLooks } from '../import/native';
import { importFit, resolveSelection, selectImport, type Selection } from '../selection';
import { STOCKS } from '../stocks';
import { CoverIcon, EffectIcon } from './EffectIcon';
import { ErrorBoundary } from './ErrorBoundary';
import { EditDialog, type EditDialogHandle } from './EditDialog';
import { ImportDialog, type ImportDialogHandle } from './ImportDialog';
import { NativeLookDialog, type NativeLookDialogHandle } from './NativeLookDialog';

const DEFAULT_PREVIEW = 'portra-400-endura-v1';

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

interface Props {
  strings: Strings;
  language: Language;
  selection: Selection;
  onSelectionChange: (selection: ReadonlySet<string>) => void;
  /** The effects that this page imported for the selected camera, after the catalog effects. */
  imported: readonly ImportedEffect[];
  /** Adds an import, in place of an earlier one with the same ID. */
  onImport: (effect: ImportedEffect) => void;
  /** The selected camera can use the native looks of GR IV, so the list offers to unlock them. */
  nativeLooks: boolean;
  onRemove: (effect: ImportedEffect) => void;
  /** Keeps an import with a new name or icon in its place. */
  onEdit: (effect: ImportedEffect) => void;
  /** The effect files on the connected card that the catalog and the imports do not have. */
  cardEffects: readonly CardEffect[];
  /** The IDs of the effects on the connected card, or null without a card. */
  onCard: ReadonlySet<string> | null;
  /** The IDs of the imports whose file on the card differs, such as after a new name. */
  changedOnCard?: ReadonlySet<string>;
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

/** A film box on the shelf: the icon above the name, in the middle of its card. */
const FILM_BODY =
  'flex w-full flex-1 flex-col items-center gap-2.5 rounded-lg px-0 pt-1.5 pb-1 text-center';
const FILM_CARD =
  'film-card relative flex flex-col rounded-xl border border-border bg-card p-2 pt-3 transition-colors hover:border-input';
/** The ring of a file button whose hidden input has the keyboard focus. */
const FILE_FOCUS =
  '[&:has(+input:focus-visible)]:border-ring [&:has(+input:focus-visible)]:ring-[3px] [&:has(+input:focus-visible)]:ring-ring/50';

export function EffectsSection({
  strings: t,
  selection,
  onSelectionChange,
  imported,
  onImport,
  onRemove,
  onEdit,
  nativeLooks,
  cardEffects,
  onCard,
  changedOnCard,
}: Props) {
  const catalog = use(loadCatalog(PREVIEW_TARGET));
  const effects: readonly Effect[] = [...catalog.effects, ...imported];
  const checked = resolveSelection(
    selection,
    catalog.effects.map((effect) => effect.id),
    [...imported, ...cardEffects].map((effect) => effect.id),
  );
  const taken = new Set([...effects, ...cardEffects].map((effect) => effect.id));
  // The count reads "of" the effects that a package can hold: each listed effect, up to the limit.
  // With more listed effects than the limit, it also gives how many are listed.
  const listed = effects.length + cardEffects.length;
  const selectable = Math.min(listed, MAX_EFFECTS);
  // The effect that the frame shows, which changes in a transition when its preview is ready, and
  // the effect that the user selected last, which the tiles and the text show at once.
  const [previewId, setPreviewId] = useState(DEFAULT_PREVIEW);
  const [requestedId, setRequestedId] = useState(DEFAULT_PREVIEW);
  const [source, setSource] = useState<Source>(DEFAULT_SAMPLE);
  const photo = useRef<Source | null>(null);
  const importer = useRef<ImportDialogHandle>(null);
  const unlocker = useRef<NativeLookDialogHandle>(null);
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
  // The filters of the list: a search, a kind of film, a brand.
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<FilmKind | 'all'>('all');
  const [brand, setBrand] = useState('all');
  const listedEffects = [...effects, ...cardEffects];
  const kinds = FILM_KINDS.filter((item) => listedEffects.some((effect) => filmKind(effect) === item));
  const brands = [...new Set(listedEffects.map(brandOf).filter(Boolean))].sort();
  const needle = query.trim().toLowerCase();
  const visible = listedEffects.filter(
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

  const shown = effects.find((effect) => effect.id === previewId) ?? effects[0];
  const requested = effects.find((effect) => effect.id === requestedId) ?? shown;
  const name = requested?.name ?? '';
  const previewOf = (effect: Effect): PreviewEffect => ({
    id: effect.id,
    table: previewTable(catalog.target, effect),
    size: catalog.lutSize,
    baseline: effectUrl(catalog.target, catalog.baseline),
  });
  const previewed = shown ? previewOf(shown) : null;
  // The target look of the selected effect: the catalog text, the LUT and the fit of an import,
  // or the firmware of a native look.
  const look = !requested
    ? ''
    : requested.imported?.kind === 'native'
      ? t.nativeFrom(requested.imported.version)
      : requested.imported?.kind === 'restored'
        ? t.restoredFrom(requested.imported.source)
        : requested.imported
          ? `${requested.imported.source} · ${t.fitText[requested.imported.grade]}`
          : (t.looks[requested.id] ?? requested.look);
  // The native looks wait behind one locked row until they are on the page. The row opens
  // to list them.
  const locked = nativeLooks && catalog.baseGamma ? missingNativeLooks(imported) : [];
  const [showLocked, setShowLocked] = useState(false);
  // What the frame waits for: a new photo, or the preview of the selected effect.
  const waiting = decoding ? t.decodingPhoto : isPending ? t.previewRendering(name) : null;

  function toggle(effect: Effect | CardEffect) {
    const next = new Set(checked);
    if (next.has(effect.id)) {
      next.delete(effect.id);
    } else if (next.size < MAX_EFFECTS) {
      next.add(effect.id);
    }
    onSelectionChange(next);
  }

  function showEffect(effect: Effect) {
    setRequestedId(effect.id);
    startTransition(() => setPreviewId(effect.id));
  }

  /** Downloads the preview table of an effect that the pointer or the focus reaches. */
  function prefetch(effect: Effect) {
    prefetchTable(previewTable(catalog.target, effect));
  }

  /** Starts the preview at the press, before the click, which comes at the release. */
  function startPreview(effect: Effect) {
    preview(source, previewOf(effect)).catch(() => undefined);
  }

  /** Adds imports of one source and checks them if they follow it closely and the package has
   * room. Returns true when the package had no room for one of them. */
  function importEffects(effects: readonly ImportedEffect[]): boolean {
    const first = effects[0];
    if (!first) return false;
    for (const effect of effects) onImport(effect);
    const { selection: next, full } = selectImport(
      checked,
      effects.map((effect) => effect.id),
      importFit(first.imported),
    );
    if (next !== checked) onSelectionChange(next);
    showEffect(first);
    return full;
  }

  function openImport() {
    importer.current?.open();
  }

  /**
   * Adds the imports of a GRKU.zip. The ones that the ZIP installs are checked again while the
   * package has room, and the others wait for the user.
   */
  function openUnlock() {
    unlocker.current?.open();
  }

  function showSample() {
    loader.cancel();
    setDecoding(false);
    setPhotoError(false);
    startTransition(() => setSource(DEFAULT_SAMPLE));
    if (photo.current) forget(photo.current);
    photo.current = null;
  }

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

  const sourceLabel = source === DEFAULT_SAMPLE ? t.samplePhoto : t.yourPhoto;

  function retryPreview() {
    forget(source);
    setPreviewAttempt((attempt) => attempt + 1);
  }

  return (
    <div className="flex flex-col gap-8" ref={ownPhoto}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-8">
        <div className="min-w-0">
          {shown && previewed && (
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
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">{t.previewing}</span>
            <span className="text-xl font-semibold">{name}</span>
            {requested && STOCKS[requested.id] && (
              <span className="font-mono text-sm text-muted-foreground">{stockText(STOCKS[requested.id]!, t)}</span>
            )}
            {look && <span className="text-sm text-muted-foreground">{look}</span>}
          </div>

          <div className="flex flex-col items-start gap-3">
            <span className="text-sm text-muted-foreground">{t.photoSource(sourceLabel)}</span>
            <Button asChild variant="outline" className={FILE_FOCUS}>
              <label htmlFor="photo-input">
                <Upload aria-hidden="true" />
                <span>{t.upload}</span>
              </label>
            </Button>
            <input
              id="photo-input"
              className="sr-only"
              type="file"
              accept=".dng,image/x-adobe-dng"
              onChange={openPhoto}
            />
            {decoding && (
              <p role="status" className="text-sm text-muted-foreground">
                {t.decodingPhoto}
              </p>
            )}
            {photoError && (
              <p role="alert" className="text-sm text-destructive">
                {t.photoError}
              </p>
            )}
            {source !== DEFAULT_SAMPLE && (
              <Button type="button" variant="ghost" size="sm" onClick={showSample}>
                {t.useSample}
              </Button>
            )}
            <p className="max-w-[60ch] text-sm text-muted-foreground">
              {/* The landing hero credits the sample photo where it first shows. */}
              {sentences(t.uploadNote, t.previewNote)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">
            {t.count(selectable)[0]}
            <span className="font-semibold tabular-nums">{checked.size}</span>
            {t.count(selectable)[1]}
            {listed > MAX_EFFECTS && t.countTotal(listed)}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                onSelectionChange(
                  new Set(
                    [...effects, ...cardEffects].map((effect) => effect.id).slice(0, MAX_EFFECTS),
                  ),
                )
              }
            >
              {t.selectAll}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => onSelectionChange(new Set())}>
              {t.clear}
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <p>{t.countLimit(MAX_EFFECTS)}</p>
          {catalog.baseGamma && (
            <p>
              {t.importHint}{' '}
              <Button type="button" variant="link" size="sm" className="h-auto p-0 text-sm" onClick={openImport}>
                {t.importOpen}
              </Button>
            </p>
          )}
          {onCard && <p>{t.effectsCardNote}</p>}
        </div>

        <div className="flex flex-col gap-3 border-b border-border pb-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              className="h-11 bg-card pl-10 text-base"
              placeholder={t.searchEffects}
              aria-label={t.searchEffects}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              spacing={2}
              className="flex-wrap"
              aria-label={t.searchEffects}
              value={kind}
              onValueChange={(value) => {
                if (value) setKind(value as FilmKind | 'all');
              }}
            >
              <ToggleGroupItem value="all" className="bg-card">
                {t.filterAll}
              </ToggleGroupItem>
              {kinds.map((item) => (
                <ToggleGroupItem key={item} value={item} className="bg-card">
                  {kindLabel(item, t)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger size="sm" className="ml-auto min-w-36 bg-card" aria-label={t.allBrands}>
                <SelectValue>{brand === 'all' ? t.allBrands : brand}</SelectValue>
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectItem value="all">{t.allBrands}</SelectItem>
                {brands.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-[13px] text-muted-foreground tabular-nums">
            {t.shownOf(visible.length, listedEffects.length)}
          </span>
        </div>

        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6" aria-label={t.effects}>
          {visible.length === 0 && (
            <li className="col-span-full py-8 text-center text-muted-foreground">{t.noMatches}</li>
          )}
          {visible.map((effect) => {
            const isChecked = checked.has(effect.id);
            const previewed = effect.id === requested?.id;
            const stock = STOCKS[effect.id];
            const body = (
              <>
                <EffectIcon effect={effect} />
                <span className="flex w-full min-w-0 flex-col items-center gap-0.5">
                  <span className="text-[13px] leading-[1.3] font-semibold sm:text-sm">{effect.name}</span>
                  <span className="max-w-full truncate text-[11px] text-muted-foreground">
                    {effect.card ? t.cardOnlyEffect : effect.monochrome ? t.mono : t.color}
                    {stock && ` · ${stockText(stock, t)}`}
                  </span>
                </span>
              </>
            );
            return (
              <li
                key={effect.id}
                className={cn(
                  FILM_CARD,
                  isChecked && 'border-foreground hover:border-foreground',
                  previewed && 'border-brand ring-2 ring-brand hover:border-brand',
                )}
                data-checked={isChecked || undefined}
                data-previewed={previewed || undefined}
              >
                <Checkbox
                  className="absolute top-2 left-2 z-10 size-[18px] bg-card"
                  checked={isChecked}
                  disabled={!isChecked && checked.size >= MAX_EFFECTS}
                  aria-label={effect.name}
                  onCheckedChange={() => toggle(effect)}
                />
                {effect.card ? (
                  <div className={FILM_BODY}>{body}</div>
                ) : (
                  <button
                    type="button"
                    className={cn(FILM_BODY, 'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50')}
                    aria-pressed={previewed}
                    aria-label={t.previewOf(effect.name)}
                    onPointerEnter={() => prefetch(effect)}
                    onFocus={() => prefetch(effect)}
                    onPointerDown={() => startPreview(effect)}
                    onClick={() => showEffect(effect)}
                  >
                    {body}
                  </button>
                )}
                {onCard && (
                  <span className="absolute top-2 right-2">
                    <ChangeBadge
                      on={onCard.has(effect.id)}
                      checked={isChecked}
                      changed={changedOnCard?.has(effect.id)}
                      strings={t}
                    />
                  </span>
                )}
                {effect.imported && (
                  <span className="flex justify-center gap-1">
                    {editable(effect) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        aria-label={t.editOf(effect.name)}
                        onClick={() => editor.current?.open(effect)}
                      >
                        {t.editEffect}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      aria-label={t.removeOf(effect.name)}
                      onClick={() => onRemove(effect)}
                    >
                      {t.removeEffect}
                    </Button>
                  </span>
                )}
              </li>
            );
          })}
          {locked.length > 0 && (
            <li className={cn(FILM_CARD, 'col-span-full flex-row items-center gap-3 p-3')}>
              <Lock className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                aria-expanded={showLocked}
                onClick={() => setShowLocked(!showLocked)}
              >
                <span className="flex shrink-0 -space-x-6" aria-hidden="true">
                  {locked.slice(0, 3).map((look) => (
                    <span key={look.id} className="rounded-md bg-card shadow-sm">
                      <CoverIcon cover={look.cover} />
                    </span>
                  ))}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-semibold">
                    {t.nativeGroup} · {t.nativeCount(locked.length)}
                  </span>
                  <span className="text-xs text-muted-foreground">{t.nativeNeeds}</span>
                </span>
                <ChevronDown
                  className={cn('ml-auto size-4 shrink-0 text-muted-foreground transition-transform', showLocked && 'rotate-180')}
                  aria-hidden="true"
                />
              </button>
              <Button type="button" variant="outline" size="sm" onClick={openUnlock}>
                {t.nativeUnlock}
              </Button>
            </li>
          )}
          {showLocked &&
            locked.map((look) => (
              <li key={look.id} className={cn(FILM_CARD, 'opacity-80')}>
                <button
                  type="button"
                  className={cn(FILM_BODY, 'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50')}
                  aria-label={t.nativeUnlockOf(look.name)}
                  onClick={openUnlock}
                >
                  <CoverIcon cover={look.cover} />
                  <span className="text-[13px] leading-[1.3] font-semibold sm:text-sm">{look.name}</span>
                </button>
              </li>
            ))}
          {catalog.baseGamma && (
            <li className={cn(FILM_CARD, 'border-dashed bg-transparent')}>
              <button
                type="button"
                className={cn(
                  FILM_BODY,
                  'justify-center text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50',
                )}
                onClick={openImport}
              >
                <span className="flex size-10 items-center justify-center rounded-full border border-border" aria-hidden="true">
                  <Plus className="size-5" />
                </span>
                <span className="text-[13px] leading-[1.3] font-semibold sm:text-sm">{t.importOpen}</span>
              </button>
            </li>
          )}
        </ul>
        {catalog.baseGamma && (
          <ImportDialog
            ref={importer}
            strings={t}
            baseGamma={catalog.baseGamma}
            taken={taken}
            onImport={(effect) => importEffects([effect])}
          />
        )}
        <EditDialog ref={editor} strings={t} onSave={onEdit} />
        {nativeLooks && catalog.baseGamma && (
          <NativeLookDialog
            ref={unlocker}
            strings={t}
            baseGamma={catalog.baseGamma}
            onImport={importEffects}
          />
        )}
      </div>
    </div>
  );
}

/** The preview frame: a 3:2 photograph, which clips what it holds. */
function Frame({ busy = false, children }: { busy?: boolean; children: ReactNode }) {
  return (
    <div className="preview-frame relative aspect-[3/2] overflow-hidden rounded-xl bg-[#c9c4ba]" aria-busy={busy}>
      {children}
    </div>
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

/** The baseline development on the left and the effect on the right. */
function PreviewFrame({
  source,
  effect,
  compareLabel,
  busy,
  status,
  originalLabel,
  originalAlt,
  effectName,
}: FrameProps) {
  const result = use(preview(source, effect));
  const comparison = useReactCompareSlider({ clip: 'itemTwo' });
  return (
    <Frame busy={busy}>
      <Provider {...comparison}>
        <Root className="image-comparison">
          <Item item="itemOne">
            <img
              className="absolute inset-0 size-full object-cover"
              src={result.original}
              alt={`${originalAlt} — ${originalLabel}`}
            />
          </Item>
          <Item item="itemTwo" className="comparison-effect">
            <img
              className="absolute inset-0 size-full object-cover"
              src={result.processed}
              alt={`${originalAlt} — ${effectName}`}
            />
          </Item>
          <HandleRoot aria-label={compareLabel}>
            <Handle buttonStyle={{ width: 32, height: 32, gap: '0.2rem' }} />
          </HandleRoot>
        </Root>
      </Provider>
      <span className="pointer-events-none absolute top-2.5 right-2.5 z-[2] rounded-md bg-black/80 px-2 py-1 text-xs text-[#f7f7f2]">
        {effectName}
      </span>
      {status && (
        <span
          className="pointer-events-none absolute bottom-4 left-1/2 z-[3] inline-flex max-w-[calc(100%-32px)] -translate-x-1/2 items-center gap-2.5 rounded-md bg-black/80 px-3.5 py-2 text-[13px] whitespace-nowrap text-[#f7f7f2]"
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
      <span className="absolute inset-0 flex items-center justify-center gap-2.5 font-mono text-[13px] text-[#2c2c2c]">
        {busy && <LoaderCircle className="size-3.5 shrink-0 animate-spin" aria-hidden="true" />}
        {text}
      </span>
    </Frame>
  );
}
