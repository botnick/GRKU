import { lazy, Suspense, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { ImagePlus, Info, Lock, Power, Sparkles, WandSparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { Language, Strings } from '../i18n';
import { CameraText } from './CameraText';
import { save } from '../package';
import { makePicture, PICTURE_HEIGHT, PICTURE_NAME, PICTURE_WIDTH, prepareDesignFonts, type ShutdownKind } from '../shutdownPicture';
import {
  designChoice,
  DESIGN_TEXT_MAX,
  DESIGNS,
  drawDesign,
  findDesign,
  FREE_DESIGNS,
  limitText,
  type Design,
  type DesignChoice,
  type DesignState,
} from '../shutdownDesigns';

/** GRKU Studio, with its fonts, stickers, and templates: loaded only when the visitor opens it. */
const Studio = lazy(() => import('../studio/Studio'));

/**
 * A design drawn on a canvas of `scale` times 720 by 480. It draws at once with the fonts at
 * hand, and again when the fonts of its text have loaded.
 */
function DesignCanvas({ choice, scale = 1, className, label }: { choice: DesignChoice; scale?: number; className?: string; label?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const { id, theme, text } = choice;
  useEffect(() => {
    let live = true;
    const draw = () => {
      const context = canvas.current?.getContext('2d');
      if (!live || !context) return;
      context.setTransform(scale, 0, 0, scale, 0, 0);
      drawDesign(context, { id, theme, text });
    };
    draw();
    void prepareDesignFonts(text).then(draw);
    return () => {
      live = false;
    };
  }, [id, theme, text, scale]);
  return (
    <canvas
      ref={canvas}
      width={Math.round(PICTURE_WIDTH * scale)}
      height={Math.round(PICTURE_HEIGHT * scale)}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

/** The two settings of a design: its text and its colors. */
function DesignControls({
  strings,
  state,
  onState,
}: {
  strings: Strings;
  state: DesignState;
  onState: (state: DesignState) => void;
}) {
  const t = strings.shutdown;
  const id = useId();
  const design: Design = findDesign(state.id) ?? DESIGNS[0];
  const choice = designChoice(state);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-text`}>{t.text}</Label>
        <Input
          id={`${id}-text`}
          value={choice.text}
          placeholder={design.text}
          autoComplete="off"
          spellCheck={false}
          aria-describedby={`${id}-hint`}
          onChange={(event) => onState({ ...state, texts: { ...state.texts, [design.id]: limitText(event.target.value) } })}
        />
        <p id={`${id}-hint`} className="m-0 text-xs text-muted-foreground">
          {t.textHint.replace('${max}', String(DESIGN_TEXT_MAX))}
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <span id={`${id}-colors`} className="text-sm font-medium">
          {t.colors}
        </span>
        <RadioGroup
          value={String(choice.theme)}
          onValueChange={(value) => onState({ ...state, themes: { ...state.themes, [design.id]: Number(value) } })}
          aria-labelledby={`${id}-colors`}
          className="flex flex-wrap gap-2"
        >
          {design.swatches.map((swatch, n) => (
            <RadioGroupItem
              key={n}
              value={String(n)}
              aria-label={`${t.colors} ${n + 1}`}
              className={cn(
                'size-10 overflow-hidden rounded-full border-2 border-border p-0 shadow-none',
                'data-[state=checked]:border-foreground data-[state=checked]:ring-2 data-[state=checked]:ring-foreground/30 [&_svg]:hidden',
              )}
              style={{
                background: `conic-gradient(${swatch.map((color, i) => `${color} ${(i / swatch.length) * 360}deg ${((i + 1) / swatch.length) * 360}deg`).join(', ')})`,
              }}
            />
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}

function dataUrl(bytes: Uint8Array): string {
  let text = '';
  for (const byte of bytes) text += String.fromCharCode(byte);
  return `data:image/jpeg;base64,${btoa(text)}`;
}

/** Downloads the file for the GRKU folder of the card, for a card that the page does not write. */
export function savePicture(bytes: Uint8Array) {
  save(new Blob([bytes as Uint8Array<ArrayBuffer>], { type: 'image/jpeg' }), PICTURE_NAME);
}

/**
 * The picture that the camera shows when it turns off (Shutdown Screen), as an extra of the
 * modules step: the GRKU logo, a ready-made design, a picture made in GRKU Studio, a picture of
 * the user cropped to the screen, the camera's own screen, or the picture that the card already has. The chosen picture shows with the text that
 * the camera draws over it.
 */
export function ShutdownSection({
  strings,
  kind,
  onKind,
  own,
  onOwn,
  logoUrl,
  onCard,
  firmware,
  designs,
  onDesigns,
  studio,
  onStudio,
  plus,
  onPlus,
  language,
}: {
  strings: Strings;
  /** The kind that applies (`shutdownKind`). */
  kind: ShutdownKind;
  onKind: (kind: ShutdownKind) => void;
  /** The picture of the user, as the file for the card, or null without one. */
  own: Uint8Array | null;
  onOwn: (bytes: Uint8Array) => void;
  logoUrl: string;
  /** The file of the connected card, or null. */
  onCard: Uint8Array | null;
  /** The firmware versions of the camera, such as `2.21`, for the version text of the preview. */
  firmware: string;
  /** The designs of this browser: the chosen one, and the text and theme of each. */
  designs: DesignState;
  onDesigns: (state: DesignState) => void;
  /** The picture made in the Studio, as the file for the card, or null before the first. */
  studio: Uint8Array | null;
  onStudio: (bytes: Uint8Array) => void;
  /** Whether the visitor has GRKU Plus, which unlocks every design and the whole Studio. */
  plus: boolean;
  /** Opens the sheet of GRKU Plus. */
  onPlus: () => void;
  language: Language;
}) {
  const t = strings.shutdown;
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [failed, setFailed] = useState(false);
  const [fileKey, setFileKey] = useState(0);
  const ownUrl = useMemo(() => (own ? dataUrl(own) : null), [own]);
  const cardUrl = useMemo(() => (onCard ? dataUrl(onCard) : null), [onCard]);
  const studioUrl = useMemo(() => (studio ? dataUrl(studio) : null), [studio]);
  // The Studio mounts at its first opening, and stays, so it opens at once the next time.
  const [studioOpen, setStudioOpen] = useState(false);
  const [studioMounted, setStudioMounted] = useState(false);
  // The design of Plus that the visitor tapped without Plus.
  const [lockedDesign, setLockedDesign] = useState<string | null>(null);
  const designLocked = (design: string) => !plus && !FREE_DESIGNS.includes(design);

  function openStudio() {
    setStudioMounted(true);
    setStudioOpen(true);
  }

  async function choose(file: File | undefined) {
    // A new input, so the same file can be selected again.
    setFileKey((key) => key + 1);
    if (!file) return;
    try {
      onOwn(await makePicture(file));
      onKind('own');
      setFailed(false);
    } catch (error) {
      console.error(error);
      setFailed(true);
    }
  }

  function pick(next: string) {
    // Your picture without a picture yet asks for one first, and stays unchosen until it reads.
    if (next === 'own' && !own) input.current?.click();
    else if (next === 'studio' && !studio) openStudio();
    else onKind(next as ShutdownKind);
  }

  const chosenDesign = designChoice(designs);
  const designThumb = <DesignCanvas choice={chosenDesign} scale={1 / 3} className="absolute inset-0 size-full" />;
  const options: { value: ShutdownKind; label: string; url: string | null; empty: ReactNode }[] = [
    { value: 'logo', label: t.logo, url: logoUrl, empty: null },
    { value: 'design', label: t.design, url: null, empty: designThumb },
    { value: 'studio', label: t.studio, url: studioUrl, empty: <WandSparkles className="size-6" aria-hidden="true" /> },
    { value: 'own', label: t.own, url: ownUrl, empty: <ImagePlus className="size-6" aria-hidden="true" /> },
    ...(cardUrl ? [{ value: 'keep' as const, label: t.keep, url: cardUrl, empty: null }] : []),
    { value: 'none', label: t.none, url: null, empty: <Power className="size-6" aria-hidden="true" /> },
  ];
  const shown = kind === 'design' ? null : (options.find((option) => option.value === kind)?.url ?? null);
  const preview = kind === 'design' || shown !== null;

  return (
    <section aria-labelledby={`${id}-title`} className="mt-4 rounded-xl border bg-card p-4 sm:p-5">
      <h2 id={`${id}-title`} className="text-[15px] font-semibold">
        {t.title}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.note}</p>
      <RadioGroup
        value={kind}
        onValueChange={pick}
        aria-labelledby={`${id}-title`}
        className={cn('mt-4 grid grid-cols-2 gap-2 sm:gap-3', options.length > 6 ? 'sm:grid-cols-4 lg:grid-cols-7' : 'sm:grid-cols-3 lg:grid-cols-6')}
      >
        {options.map((option) => (
          <Label
            key={option.value}
            htmlFor={`${id}-${option.value}`}
            className={cn(
              'flex cursor-pointer flex-col items-stretch gap-2 rounded-lg border border-border p-2 text-sm font-medium transition-colors',
              'hover:border-input has-data-[state=checked]:border-foreground has-data-[state=checked]:shadow-[inset_0_0_0_1px_var(--foreground)]',
            )}
          >
            <span className="relative flex aspect-[3/2] items-center justify-center overflow-hidden rounded-md bg-black text-muted-foreground">
              {option.url ? (
                <img src={option.url} alt="" width={PICTURE_WIDTH} height={PICTURE_HEIGHT} className="size-full object-cover" />
              ) : (
                option.empty
              )}
            </span>
            <span className="flex items-center gap-2 px-0.5 pb-0.5">
              <RadioGroupItem id={`${id}-${option.value}`} value={option.value} />
              <span className="min-w-0 leading-snug">{option.label}</span>
            </span>
          </Label>
        ))}
      </RadioGroup>
      <input
        key={fileKey}
        ref={input}
        id={`${id}-file`}
        className="sr-only"
        type="file"
        accept="image/*"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => void choose(event.target.files?.[0])}
      />
      {(kind === 'own' || failed) && (
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => input.current?.click()}>
          <ImagePlus aria-hidden="true" />
          {t.choose}
        </Button>
      )}
      {failed && <p className="mt-2 text-sm text-destructive">{t.failed}</p>}
      {(kind === 'studio' || kind === 'design') && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <Button type="button" variant={kind === 'studio' ? 'default' : 'outline'} size="sm" onClick={openStudio}>
            <WandSparkles aria-hidden="true" />
            {kind === 'studio' ? t.studioEdit : t.studioOpen}
          </Button>
          <span className="text-xs text-muted-foreground">{t.studioNote}</span>
        </div>
      )}

      {kind === 'design' && (
        <RadioGroup
          value={designs.id}
          onValueChange={(value) => {
            // A design of Plus without Plus says so, and stays unchosen.
            if (designLocked(value)) setLockedDesign(value);
            else {
              setLockedDesign(null);
              onDesigns({ ...designs, id: value });
            }
          }}
          aria-label={t.design}
          className={cn(
            // On a phone, a strip that scrolls across the width of the card (no wider than it), from the tablet up a grid.
            '-mx-4 mt-4 flex w-0 min-w-[calc(100%+2rem)] snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pb-1',
            'sm:mx-0 sm:grid sm:w-auto sm:min-w-0 sm:grid-cols-6 sm:overflow-visible sm:px-0 sm:pb-0',
          )}
        >
          {DESIGNS.map((design) => (
            <Label
              key={design.id}
              htmlFor={`${id}-design-${design.id}`}
              title={t.designs[design.id as keyof typeof t.designs]}
              className={cn(
                'relative w-28 shrink-0 cursor-pointer snap-start overflow-hidden rounded-md border-2 border-transparent sm:w-auto',
                'hover:border-input has-data-[state=checked]:border-foreground has-focus-visible:ring-2 has-focus-visible:ring-ring',
              )}
            >
              <DesignCanvas choice={designChoice(designs, design.id)} scale={1 / 3} className="block aspect-[3/2] w-full" />
              {designLocked(design.id) && (
                <span className="pointer-events-none absolute top-1 right-1 inline-flex items-center gap-0.5 rounded-full bg-foreground/85 px-1.5 py-0.5 text-[10px] leading-none font-semibold text-background">
                  <Lock className="size-2.5" aria-hidden="true" />
                  {t.plus}
                </span>
              )}
              <RadioGroupItem
                id={`${id}-design-${design.id}`}
                value={design.id}
                aria-label={designLocked(design.id) ? `${t.designs[design.id as keyof typeof t.designs]} (GRKU Plus)` : t.designs[design.id as keyof typeof t.designs]}
                className="sr-only"
              />
            </Label>
          ))}
        </RadioGroup>
      )}
      {kind === 'design' && lockedDesign && (
        <div role="status" className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-brand/40 bg-brand/5 px-3 py-2 text-sm">
          <Lock className="size-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1">{t.lockedDesign.replace('${name}', t.designs[lockedDesign as keyof typeof t.designs] ?? lockedDesign)}</span>
          <Button type="button" variant="brand" size="sm" onClick={onPlus}>
            <Sparkles aria-hidden="true" />
            {t.seePlus}
          </Button>
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-start">
        {preview && (
          <figure className="m-0">
            <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-black ring-1 ring-border">
              {shown ? (
                <img src={shown} width={PICTURE_WIDTH} height={PICTURE_HEIGHT} alt={t.alt} className="absolute inset-0 size-full" />
              ) : (
                <DesignCanvas choice={chosenDesign} label={t.alt} className="absolute inset-0 size-full" />
              )}
              <CameraText firmware={firmware} />
            </div>
            <figcaption className="mt-2 text-xs leading-relaxed text-muted-foreground">{t.textNote}</figcaption>
          </figure>
        )}
        <div className={cn('flex flex-col gap-5', !preview && 'sm:col-span-2')}>
          {kind === 'design' && <DesignControls strings={strings} state={designs} onState={onDesigns} />}
          <p className="m-0 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{kind === 'none' ? t.noneNote : t.cameraNote}</span>
          </p>
        </div>
      </div>
      {studioMounted && (
        <Suspense
          fallback={
            <div role="status" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 text-sm font-medium text-white">
              {t.studioLoading}
            </div>
          }
        >
          <Studio
            open={studioOpen}
            onOpenChange={setStudioOpen}
            strings={strings}
            language={language}
            plus={plus}
            onPlus={onPlus}
            firmware={firmware}
            ownPicture={own}
            start={designChoice(designs)}
            onDone={(bytes) => {
              onStudio(bytes);
              onKind('studio');
            }}
          />
        </Suspense>
      )}
    </section>
  );
}

/** The shutdown picture in the ZIP flow: GRKU.zip leaves it out, so it downloads on its own. */
export function ShutdownDownload({ strings, picture }: { strings: Strings; picture: Uint8Array }) {
  const t = strings.shutdown;
  return (
    <div className="flex flex-col items-start gap-2 rounded-xl border bg-card p-4">
      <p className="m-0 text-sm font-medium">{t.title}</p>
      <p className="m-0 text-sm text-muted-foreground">{t.zipText}</p>
      <Button type="button" variant="outline" size="sm" onClick={() => savePicture(picture)}>
        {t.download}
      </Button>
      <p className="m-0 text-xs text-muted-foreground">{t.downloadNote}</p>
    </div>
  );
}
