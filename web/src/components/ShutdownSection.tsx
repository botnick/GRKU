import {
  lazy,
  Suspense,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PRICES } from "../plus";
import {
  Check,
  ImagePlus,
  Info,
  Lock,
  Power,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { Language, Strings } from "../i18n";
import { CameraText } from "./CameraText";
import { save } from "../package";
import {
  makePicture,
  PICTURE_HEIGHT,
  PICTURE_NAME,
  PICTURE_WIDTH,
  prepareDesignFonts,
  type ShutdownKind,
} from "../shutdownPicture";
import {
  designChoice,
  DESIGN_TEXT_MAX,
  DESIGNS,
  drawDesign,
  findDesign,
  FREE_DESIGNS,
  limitText,
  resetContext,
  type Design,
  type DesignChoice,
  type DesignState,
} from "../shutdownDesigns";

/** GRKU Studio, with its fonts, stickers, and templates: loaded only when the visitor opens it. */
const Studio = lazy(() => import("../studio/Studio"));

/**
 * A design drawn on a canvas of `scale` times 720 by 480. It draws at once with the fonts at
 * hand, and again when the fonts of its text have loaded. Each drawing starts from a clean
 * context, and only the latest one runs.
 */
function DesignCanvas({
  choice,
  scale = 1,
  className,
  label,
}: {
  choice: DesignChoice;
  scale?: number;
  className?: string;
  label?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  // The latest drawing: an earlier one that is still to come (after its fonts) does not draw.
  const drawing = useRef(0);
  const { id, theme, text } = choice;
  useEffect(() => {
    const token = ++drawing.current;
    const draw = () => {
      const context = canvas.current?.getContext("2d");
      if (token !== drawing.current || !context) return;
      resetContext(context);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      try {
        drawDesign(context, { id, theme, text });
      } catch (error) {
        console.error(error);
      }
    };
    draw();
    void prepareDesignFonts(text).then(draw, draw);
    return () => {
      if (token === drawing.current) drawing.current++;
    };
  }, [id, theme, text, scale]);
  return (
    <canvas
      ref={canvas}
      width={Math.round(PICTURE_WIDTH * scale)}
      height={Math.round(PICTURE_HEIGHT * scale)}
      className={className}
      role={label ? "img" : undefined}
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
          onChange={(event) =>
            onState({
              ...state,
              texts: {
                ...state.texts,
                [design.id]: limitText(event.target.value),
              },
            })
          }
        />
        <p id={`${id}-hint`} className="m-0 text-xs text-muted-foreground">
          {t.textHint.replace("${max}", String(DESIGN_TEXT_MAX))}
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <span id={`${id}-colors`} className="text-sm font-medium">
          {t.colors}
        </span>
        <RadioGroup
          value={String(choice.theme)}
          onValueChange={(value) =>
            onState({
              ...state,
              themes: { ...state.themes, [design.id]: Number(value) },
            })
          }
          aria-labelledby={`${id}-colors`}
          className="flex flex-wrap gap-2"
        >
          {design.swatches.map((swatch, n) => (
            <RadioGroupItem
              key={n}
              value={String(n)}
              aria-label={`${t.colors} ${n + 1}`}
              className={cn(
                "size-10 overflow-hidden rounded-full border-2 border-border p-0 shadow-none",
                "data-[state=checked]:border-foreground data-[state=checked]:ring-2 data-[state=checked]:ring-foreground/30 [&_svg]:hidden",
              )}
              style={{
                background: `conic-gradient(${swatch.map((color, i) => `${color} ${(i / swatch.length) * 360}deg ${((i + 1) / swatch.length) * 360}deg`).join(", ")})`,
              }}
            />
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}

function dataUrl(bytes: Uint8Array): string {
  let text = "";
  for (const byte of bytes) text += String.fromCharCode(byte);
  return `data:image/jpeg;base64,${btoa(text)}`;
}

/** Downloads the file for the GRKU folder of the card, for a card that the page does not write. */
export function savePicture(bytes: Uint8Array) {
  save(
    new Blob([bytes as Uint8Array<ArrayBuffer>], { type: "image/jpeg" }),
    PICTURE_NAME,
  );
}

/** A choice of the shutdown screen as a wide row: a small picture, a title, and a line under it. */
function ChoiceRow({
  checked,
  onSelect,
  picture,
  title,
  note,
  tag,
  action,
}: {
  checked: boolean;
  onSelect: () => void;
  picture: ReactNode;
  title: string;
  note: string;
  /** A small label after the title, such as the name of a tool. */
  tag?: string;
  /** A button at the end of the row, beside the choice. */
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border p-2 transition-colors @md:flex-row @md:items-center @md:gap-3 @md:pr-3",
        checked
          ? "border-foreground shadow-[inset_0_0_0_1px_var(--foreground)]"
          : "border-border hover:border-input",
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={checked}
        onClick={onSelect}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="relative flex aspect-[3/2] w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-black text-white/70 @md:w-24">
          {picture}
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm font-medium leading-snug">
            {title}
            {tag && (
              <span className="rounded-full border px-1.5 py-px text-[10px] leading-none font-medium text-muted-foreground">
                {tag}
              </span>
            )}
            {checked && <Check className="size-4 shrink-0" aria-hidden="true" />}
          </span>
          <span className="text-xs leading-snug text-muted-foreground">{note}</span>
        </span>
      </button>
      {action && (
        <div className="ml-[5.75rem] @md:ml-0">{action}</div>
      )}
    </div>
  );
}

/** An example of what GRKU Studio makes, drawn once the part that draws it has loaded. */
function StudioExample({ template }: { template: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let live = true;
    void import("../studio/example")
      .then(({ drawExample }) => {
        if (live && canvas.current) return drawExample(canvas.current, template);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [template]);
  return (
    <canvas
      ref={canvas}
      width={PICTURE_WIDTH / 3}
      height={PICTURE_HEIGHT / 3}
      className="size-full"
      aria-hidden="true"
    />
  );
}

/** One of the three groups of choices, with its heading. */
function ChoiceGroup({
  id,
  title,
  note,
  active,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-colors sm:p-4",
        active ? "border-foreground/40 bg-muted/40" : "border-border",
      )}
    >
      <h3 id={id} className="m-0 text-sm font-semibold">
        {title}
      </h3>
      {note && (
        <p className="m-0 mt-0.5 text-xs leading-snug text-muted-foreground">{note}</p>
      )}
      <div className="mt-3">{children}</div>
    </div>
  );
}

/**
 * The picture that the camera shows when it turns off (Shutdown Screen), as an extra of the
 * modules step. A large preview of the chosen picture, with the text that the camera draws over
 * it, beside three groups of choices: ready-made (the GRKU logo or a design), made by the user
 * (in GRKU Studio, a photo cropped to the screen, or the picture that the card already has), or
 * off (the camera's own screen).
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
  // A photo just chosen: the Studio opens with it as the background, to add text or stickers.
  const [startPhoto, setStartPhoto] = useState<{
    file: Blob;
    key: number;
  } | null>(null);
  // The design of Plus that the visitor tapped without Plus.
  const [lockedDesign, setLockedDesign] = useState<string | null>(null);
  const designLocked = (design: string) =>
    !plus && !FREE_DESIGNS.includes(design);
  const designName = (design: string) =>
    t.designs[design as keyof typeof t.designs] ?? design;

  function openStudio() {
    setStudioMounted(true);
    setStudioOpen(true);
  }

  function choosePhoto() {
    input.current?.click();
  }

  async function choose(file: File | undefined) {
    // A new input, so the same file can be selected again.
    setFileKey((key) => key + 1);
    if (!file) return;
    try {
      // The photo as it is is chosen at once; the Studio offers to add to it.
      onOwn(await makePicture(file));
      onKind("own");
      setFailed(false);
      setStartPhoto({ file, key: Date.now() });
      openStudio();
    } catch (error) {
      console.error(error);
      setFailed(true);
    }
  }

  function pickReady(value: string) {
    if (value === "logo") {
      setLockedDesign(null);
      onKind("logo");
    } else if (designLocked(value)) {
      // A design of Plus without Plus says so, and stays unchosen.
      setLockedDesign(value);
    } else {
      setLockedDesign(null);
      onDesigns({ ...designs, id: value });
      onKind("design");
    }
  }

  const chosenDesign = designChoice(designs);
  const design = findDesign(chosenDesign.id) ?? DESIGNS[0];
  const ready = kind === "logo" || kind === "design";
  const made = kind === "studio" || kind === "own" || kind === "keep";
  const shown =
    kind === "logo"
      ? logoUrl
      : kind === "studio"
        ? studioUrl
        : kind === "own"
          ? ownUrl
          : kind === "keep"
            ? cardUrl
            : null;
  // The plain name of what the camera will show.
  const chosen =
    kind === "design"
      ? design.swatches.length > 1
        ? `${designName(design.id)} · ${t.colors} ${chosenDesign.theme + 1}`
        : designName(design.id)
      : t[kind];
  const picture = (url: string | null, empty: ReactNode) =>
    url ? (
      <img
        src={url}
        alt=""
        width={PICTURE_WIDTH}
        height={PICTURE_HEIGHT}
        className="size-full object-cover"
      />
    ) : (
      empty
    );

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="@container mt-4 rounded-xl border bg-card p-4 sm:p-5"
    >
      <h2 id={`${id}-title`} className="text-[15px] font-semibold">
        {t.title}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {t.note}
      </p>

      <div className="mt-4 flex flex-col gap-4">
        {/* What the camera will show. */}
        <figure className="m-0 grid gap-3 @xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] @xl:items-end @xl:gap-5">
          <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-black ring-1 ring-border">
            {kind === "design" ? (
              <DesignCanvas
                choice={chosenDesign}
                label={t.alt}
                className="absolute inset-0 size-full"
              />
            ) : shown ? (
              <img
                src={shown}
                width={PICTURE_WIDTH}
                height={PICTURE_HEIGHT}
                alt={t.alt}
                className="absolute inset-0 size-full"
              />
            ) : (
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/60">
                <Power className="size-8" aria-hidden="true" />
              </span>
            )}
            {kind !== "none" && <CameraText firmware={firmware} />}
          </div>
          <figcaption className="flex flex-col gap-2">
            <span
              className="text-base font-semibold leading-snug"
              aria-live="polite"
            >
              {chosen}
            </span>
            <span className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span>
                {kind === "none" ? t.offCard : t.textNote}
              </span>
            </span>
          </figcaption>
        </figure>

        <div className="flex flex-col gap-3">
          {/* 1. Ready-made: the GRKU logo and the designs. */}
          <ChoiceGroup
            id={`${id}-ready`}
            title={t.readyMade}
            note={t.readyMadeNote}
            active={ready}
          >
            <RadioGroup
              value={kind === "logo" ? "logo" : kind === "design" ? designs.id : ""}
              onValueChange={pickReady}
              aria-labelledby={`${id}-ready`}
              className="grid grid-cols-3 gap-2 @md:grid-cols-4 @xl:grid-cols-6"
            >
              {[{ id: "logo" }, ...DESIGNS].map((item) => {
                const isLogo = item.id === "logo";
                const name = isLogo ? t.logo : designName(item.id);
                const locked = !isLogo && designLocked(item.id);
                const on = isLogo ? kind === "logo" : kind === "design" && designs.id === item.id;
                return (
                  <Label
                    key={item.id}
                    htmlFor={`${id}-ready-${item.id}`}
                    title={name}
                    className={cn(
                      "relative block aspect-[3/2] cursor-pointer overflow-clip rounded-md ring-1 ring-border transition-shadow",
                      "hover:ring-input ring-offset-card has-data-[state=checked]:ring-2 has-data-[state=checked]:ring-foreground has-data-[state=checked]:ring-offset-2 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
                    )}
                  >
                    {isLogo ? (
                      <img
                        src={logoUrl}
                        alt=""
                        width={PICTURE_WIDTH}
                        height={PICTURE_HEIGHT}
                        className="size-full bg-black object-cover"
                      />
                    ) : (
                      <DesignCanvas
                        choice={designChoice(designs, item.id)}
                        scale={1 / 3}
                        className="block size-full"
                      />
                    )}
                    {on && (
                      <span className="pointer-events-none absolute bottom-1 left-1 flex size-5 items-center justify-center rounded-full bg-background text-foreground shadow ring-1 ring-foreground">
                        <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                      </span>
                    )}
                    {locked && (
                      <span className="pointer-events-none absolute top-1 right-1 inline-flex items-center gap-0.5 rounded-full bg-foreground/85 px-1.5 py-0.5 text-[10px] leading-none font-semibold text-background">
                        <Lock className="size-2.5" aria-hidden="true" />
                        {t.plus}
                      </span>
                    )}
                    <RadioGroupItem
                      id={`${id}-ready-${item.id}`}
                      value={item.id}
                      aria-label={locked ? `${name} (GRKU Plus)` : name}
                      className="sr-only top-0 left-0 size-px"
                    />
                  </Label>
                );
              })}
            </RadioGroup>
            {lockedDesign && (
              <div
                role="status"
                className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-brand/40 bg-brand/5 px-3 py-2 text-sm"
              >
                <Lock className="size-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  {t.lockedDesign
                    .replace("${name}", designName(lockedDesign))
                    .replace("${pack}", String(PRICES["pack:kodak"]))}
                </span>
                <Button type="button" variant="brand" size="sm" onClick={onPlus}>
                  <Sparkles aria-hidden="true" />
                  {t.seePlus}
                </Button>
              </div>
            )}
            {kind === "design" && (
              <div className="mt-4 border-t pt-4">
                <DesignControls
                  strings={strings}
                  state={designs}
                  onState={onDesigns}
                />
              </div>
            )}
          </ChoiceGroup>

          {/* 2. Made by the user: in GRKU Studio, from a photo, or the picture on the card. */}
          <ChoiceGroup id={`${id}-own`} title={t.makeOwn} active={made}>
            <div
              role="radiogroup"
              aria-labelledby={`${id}-own`}
              className="flex flex-col gap-2"
            >
              <ChoiceRow
                checked={kind === "studio"}
                onSelect={() => (studio ? onKind("studio") : openStudio())}
                picture={picture(
                  studioUrl,
                  <StudioExample
                    template={language === "th" ? "songkran" : "valentine"}
                  />,
                )}
                title={studio ? t.studio : t.studioOpen}
                tag="GRKU Studio"
                note={t.studioNote}
                action={
                  studio && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={openStudio}
                    >
                      <WandSparkles aria-hidden="true" />
                      {t.studioEdit}
                    </Button>
                  )
                }
              />
              <ChoiceRow
                checked={kind === "own"}
                onSelect={() => (own ? onKind("own") : choosePhoto())}
                picture={picture(
                  ownUrl,
                  <ImagePlus className="size-6" aria-hidden="true" />,
                )}
                title={own ? t.own : t.photo}
                note={t.photoNote}
                action={
                  own && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={choosePhoto}
                    >
                      <ImagePlus aria-hidden="true" />
                      {t.choose}
                    </Button>
                  )
                }
              />
              {cardUrl && (
                <ChoiceRow
                  checked={kind === "keep"}
                  onSelect={() => onKind("keep")}
                  picture={picture(cardUrl, null)}
                  title={t.keep}
                  note={t.keepNote}
                />
              )}
            </div>
            {failed && (
              <p className="m-0 mt-2 text-sm text-destructive">{t.failed}</p>
            )}
          </ChoiceGroup>

          {/* 3. Off: the camera's own screen. */}
          <div role="radiogroup" aria-label={t.off}>
            <ChoiceRow
              checked={kind === "none"}
              onSelect={() => onKind("none")}
              picture={<Power className="size-6" aria-hidden="true" />}
              title={t.off}
              note={t.offNote}
            />
          </div>
        </div>
      </div>
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
      {studioMounted && (
        <Suspense
          fallback={
            <div
              role="status"
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 text-sm font-medium text-white"
            >
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
            startPhoto={startPhoto}
            start={designChoice(designs)}
            onDone={(bytes) => {
              onStudio(bytes);
              onKind("studio");
            }}
          />
        </Suspense>
      )}
    </section>
  );
}

/** The shutdown picture in the ZIP flow: GRKU.zip leaves it out, so it downloads on its own. */
export function ShutdownDownload({
  strings,
  picture,
}: {
  strings: Strings;
  picture: Uint8Array;
}) {
  const t = strings.shutdown;
  return (
    <div className="flex flex-col items-start gap-2 rounded-xl border bg-card p-4">
      <p className="m-0 text-sm font-medium">{t.title}</p>
      <p className="m-0 text-sm text-muted-foreground">{t.zipText}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => savePicture(picture)}
      >
        {t.download}
      </Button>
      <p className="m-0 text-xs text-muted-foreground">{t.downloadNote}</p>
    </div>
  );
}
