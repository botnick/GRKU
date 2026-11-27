/**
 * GRKU Studio: an editor of the shutdown picture in layers, as a dialog over the whole screen.
 * The page loads it only when the visitor opens it, with its fonts, stickers, and templates.
 *
 * On a computer the picture sits in the middle, the tools on the left, and the layers on the
 * right; on a phone the picture is on top and the tools in tabs below. The picture takes touch
 * (drag, pinch, the handles of the selection) and the keyboard (arrows, Delete, undo).
 */
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { PRICES } from "../plus";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  FlipHorizontal2,
  ImageIcon,
  ImagePlus,
  Layers,
  LayoutTemplate,
  Lock,
  Plus,
  RotateCw,
  ScanLine,
  Sparkles,
  Sticker as StickerIcon,
  Trash2,
  TriangleAlert,
  Type,
  Undo2,
  Redo2,
  X,
} from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CameraText } from "../components/CameraText";
import type { Language, Strings } from "../i18n";
import { findDesign, resetContext, type DesignChoice } from "../shutdownDesigns";
import { encodePicture } from "../shutdownPicture";
import { FONTS, fontOf, hasBold, loadFontStyles, prepareFonts } from "./fonts";
import {
  addLayer,
  imageLayer,
  canAddLayer,
  canRedo,
  canUndo,
  commit,
  duplicateLayer,
  emptyDoc,
  findLayer,
  fontLocked,
  FRAME_IDS,
  frameLocked,
  FREE_LAYERS,
  history,
  hitTest,
  layerBox,
  LIMITS,
  loadDoc,
  moveLayer,
  nudgeLayer,
  PATTERN_IDS,
  plusItems,
  redo,
  removeLayer,
  reorderLayer,
  resizeLayer,
  rotateLayer,
  roughMeasure,
  SAFE_ZONES,
  saveDoc,
  snapAngle,
  snapCenter,
  stickerLayer,
  stickerLocked,
  STUDIO_HEIGHT as H,
  STUDIO_WIDTH as W,
  templateLocked,
  textLayer,
  underCameraText,
  undo,
  updateLayer,
  type Background,
  type Catalog,
  type FrameId,
  type History,
  type Layer,
  type Locked,
  type Measure,
  type Order,
  type PatternId,
  type StickerLayer,
  type StudioDoc,
  type TextLayer,
} from "./model";
import {
  canvasMeasure,
  FRAMES,
  photoCrop,
  renderDoc,
  type Photo,
} from "./render";
import {
  FREE_STICKERS,
  STICKER_GROUPS,
  STICKERS,
  findSticker,
  type Sticker,
} from "./stickers";
import { STUDIO_STRINGS, type StudioStrings } from "./strings";
import { captionOf } from "./captions";
import {
  designDoc,
  designThemes,
  findTemplate,
  FREE_TEMPLATES,
  HOLIDAY_TEMPLATES,
  holidaySeason,
  TEMPLATES,
  type Template,
} from "./templates";
import { loadPhoto, savePhoto } from "./photo";
import { addImage, loadImages, pruneImages } from "./images";
import { ART_IDS, loadArt, onArtLoaded } from "./art";

const CATALOG: Catalog = {
  freeTemplates: FREE_TEMPLATES,
  freeStickers: FREE_STICKERS,
};

const SWATCHES = [
  "#FFFFFF",
  "#2B2B2B",
  "#D94135",
  "#F4A6B8",
  "#F2A65A",
  "#FFC857",
  "#8CC084",
  "#2A9D8F",
  "#8CC7E8",
  "#2B59C3",
  "#B28DD6",
  "#8A5A3B",
  "#F4EFE6",
  "#1D3557",
];
const GRADIENTS: [string, string][] = [
  ["#FCE3D2", "#C96B7A"],
  ["#C8EEFF", "#4FA3E0"],
  ["#E8E2F7", "#7D6CC4"],
  ["#FFF1C1", "#F2A65A"],
  ["#E2F3EA", "#3F8573"],
  ["#0E1530", "#2C3E74"],
  ["#FFE3EE", "#F06FA4"],
  ["#2B2B2B", "#121212"],
];
const PATTERN_COLORS: [string, string][] = [
  ["#FFF3E2", "#F2A65A"],
  ["#FFE3EE", "#F4A6B8"],
  ["#E3EFEA", "#8CC084"],
  ["#DCE8F5", "#8CC7E8"],
  ["#1E1E24", "#3A3A44"],
];

type Tab = "templates" | "text" | "stickers" | "background" | "layers";

// ---- State -----------------------------------------------------------------------------------------------------

type Action =
  | { type: "commit"; doc: StudioDoc; run?: string | null }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; doc: StudioDoc };

function reducer(state: History, action: Action): History {
  switch (action.type) {
    case "commit":
      return commit(state, action.doc, action.run ?? null);
    case "undo":
      return undo(state);
    case "redo":
      return redo(state);
    case "reset":
      return history(action.doc);
  }
}

function browserStorage(): Storage | null {
  try {
    return localStorage;
  } catch {
    return null;
  }
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof matchMedia !== "undefined" && matchMedia(query).matches,
  );
  useEffect(() => {
    const list = matchMedia(query);
    const change = () => setMatches(list.matches);
    change();
    list.addEventListener("change", change);
    return () => list.removeEventListener("change", change);
  }, [query]);
  return matches;
}

/**
 * Bumps a number whenever a font or the painted background of a template finishes loading, so the
 * canvas draws again with it.
 */
function useFontTick(): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    const stopArt = onArtLoaded(bump);
    if (typeof document === "undefined" || !document.fonts) return stopArt;
    document.fonts.addEventListener("loadingdone", bump);
    return () => {
      stopArt();
      document.fonts.removeEventListener("loadingdone", bump);
    };
  }, []);
  return tick;
}

// ---- Small pieces ----------------------------------------------------------------------------------------------

function PlusBadge({ s }: { s: StudioStrings }) {
  return (
    <span className="pointer-events-none absolute top-1 right-1 inline-flex items-center gap-0.5 rounded-full bg-foreground/85 px-1.5 py-0.5 text-[10px] leading-none font-semibold text-background">
      <Lock className="size-2.5" aria-hidden="true" />
      {s.plusBadge}
    </span>
  );
}

function StickerArt({
  item,
  tint,
  className,
}: {
  item: Sticker;
  tint?: string | null;
  className?: string;
}) {
  const color = tint ?? item.tint ?? "#3A2E2A";
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {item.parts.map((part, i) => (
        <path
          key={i}
          d={part.d}
          fill={
            !part.fill || part.fill === "none"
              ? "none"
              : part.fill === "tint"
                ? color
                : part.fill
          }
          fillRule={part.evenodd ? "evenodd" : "nonzero"}
          stroke={
            part.stroke
              ? part.stroke === "tint"
                ? color
                : part.stroke
              : undefined
          }
          strokeWidth={part.width ?? 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={part.alpha}
        />
      ))}
    </svg>
  );
}

/** A small drawing of a document, for the galleries. */
function DocThumb({
  doc,
  photo,
  tick,
  className,
}: {
  doc: StudioDoc;
  photo: Photo | null;
  tick: number;
  className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const context = canvas.current?.getContext("2d");
    if (!context) return;
    resetContext(context);
    context.setTransform(1 / 3, 0, 0, 1 / 3, 0, 0);
    try {
      renderDoc(context, doc, { photo });
    } catch (error) {
      console.error(error);
    }
  }, [doc, photo, tick]);
  return (
    <canvas
      ref={canvas}
      width={W / 3}
      height={H / 3}
      className={cn("block aspect-[3/2] w-full", className)}
      aria-hidden="true"
    />
  );
}

function Swatches({
  value,
  onChange,
  label,
  colors = SWATCHES,
  allowNone,
  noneLabel,
}: {
  value: string | null;
  onChange: (color: string | null) => void;
  label: string;
  colors?: readonly string[];
  allowNone?: boolean;
  noneLabel?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <span id={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={id}
        className="flex flex-wrap gap-1.5"
      >
        {allowNone && (
          <button
            type="button"
            role="radio"
            aria-checked={value === null}
            aria-label={noneLabel}
            title={noneLabel}
            onClick={() => onChange(null)}
            className={cn(
              "relative size-8 overflow-hidden rounded-full border-2 border-border bg-background",
              value === null && "border-foreground ring-2 ring-foreground/25",
            )}
          >
            <span className="absolute top-1/2 left-1/2 h-0.5 w-9 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-destructive" />
          </button>
        )}
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={value?.toUpperCase() === color}
            aria-label={color}
            onClick={() => onChange(color)}
            className={cn(
              "size-8 rounded-full border-2 border-border",
              value?.toUpperCase() === color &&
                "border-foreground ring-2 ring-foreground/25",
            )}
            style={{ background: color }}
          />
        ))}
        <label
          className="relative flex size-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border"
          title={label}
        >
          <span
            className="size-full"
            style={{
              background:
                "conic-gradient(#D94135, #FFC857, #8CC084, #8CC7E8, #B28DD6, #D94135)",
            }}
          />
          <input
            type="color"
            className="absolute inset-0 cursor-pointer opacity-0"
            value={value ?? "#FFFFFF"}
            onChange={(event) => onChange(event.target.value.toUpperCase())}
            aria-label={`${label}: ${value ?? ""}`}
          />
        </label>
      </div>
    </div>
  );
}

function Range({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <label htmlFor={id}>{label}</label>
        <span className="tabular-nums">
          {format ? format(value) : Math.round(value)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-6 w-full accent-[var(--brand)]"
      />
    </div>
  );
}

function Section({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      {title && <h3 className="text-sm font-semibold">{title}</h3>}
      {children}
    </section>
  );
}

/** A tile of a gallery: a picture, a name, and the lock of Plus. */
function Tile({
  label,
  locked,
  selected,
  onClick,
  children,
  s,
  className,
}: {
  label: string;
  locked: boolean;
  selected?: boolean;
  onClick: () => void;
  children: ReactNode;
  s: StudioStrings;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={locked ? `${label} (${s.plusName})` : label}
      aria-pressed={selected}
      title={label}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-md border-2 border-transparent bg-muted text-left transition-colors hover:border-input focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        selected && "border-foreground",
        className,
      )}
    >
      {children}
      {locked && <PlusBadge s={s} />}
    </button>
  );
}

// ---- The picture ---------------------------------------------------------------------------------------------

type Gesture =
  | {
      kind: "move";
      id: string;
      start: [number, number];
      origin: [number, number];
      run: string;
      moved: boolean;
    }
  | {
      kind: "resize";
      id: string;
      startDistance: number;
      startSize: number;
      run: string;
    }
  | {
      kind: "rotate";
      id: string;
      startAngle: number;
      startRotation: number;
      run: string;
    }
  | {
      kind: "pinch";
      id: string;
      startDistance: number;
      startAngle: number;
      startSize: number;
      startRotation: number;
      run: string;
    }
  | {
      kind: "pan";
      start: [number, number];
      origin: [number, number];
      run: string;
    };

let runs = 0;
const nextRun = (kind: string) => `${kind}:${++runs}`;

function Stage({
  doc,
  photo,
  images,
  selected,
  onSelect,
  onCommit,
  onRemove,
  onEditText,
  measure,
  onMeasure,
  showCamera,
  firmware,
  covered,
  tick,
  s,
}: {
  doc: StudioDoc;
  photo: Photo | null;
  images: ReadonlyMap<string, Photo>;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onCommit: (doc: StudioDoc, run?: string | null) => void;
  onRemove: (id: string) => void;
  onEditText: () => void;
  measure: Measure;
  onMeasure: (measure: Measure) => void;
  showCamera: boolean;
  firmware: string;
  covered: ReadonlySet<string>;
  tick: number;
  s: StudioStrings;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, [number, number]>());
  const gesture = useRef<Gesture | null>(null);
  const [guides, setGuides] = useState({ vertical: false, horizontal: false });
  // The latest document, for the handlers of a gesture that outlive a render.
  const latest = useRef(doc);
  latest.current = doc;

  useEffect(() => {
    const context = canvas.current?.getContext("2d");
    if (context) onMeasure(canvasMeasure(context));
  }, [tick, onMeasure]);

  useEffect(() => {
    const context = canvas.current?.getContext("2d");
    if (!context) return;
    resetContext(context);
    try {
      renderDoc(context, doc, { photo, images }, measure);
    } catch (error) {
      console.error(error);
    }
  }, [doc, photo, images, measure]);

  const toScreen = (event: {
    clientX: number;
    clientY: number;
  }): [number, number] => {
    const rect = stage.current!.getBoundingClientRect();
    return [
      ((event.clientX - rect.left) * W) / rect.width,
      ((event.clientY - rect.top) * H) / rect.height,
    ];
  };

  function startPinch(id: string) {
    const [a, b] = [...pointers.current.values()];
    const layer = findLayer(latest.current, id);
    if (!a || !b || !layer) return;
    gesture.current = {
      kind: "pinch",
      id,
      startDistance: Math.max(1, Math.hypot(b[0] - a[0], b[1] - a[1])),
      startAngle: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI,
      startSize: layer.size,
      startRotation: layer.rotation,
      run: nextRun("pinch"),
    };
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    // Focus for the keys, without the ring of a keyboard focus.
    stage.current?.focus({
      preventScroll: true,
      focusVisible: false,
    } as FocusOptions);
    const point = toScreen(event);
    try {
      stage.current?.setPointerCapture(event.pointerId);
    } catch {
      // A pointer that is already gone moves nothing.
    }
    pointers.current.set(event.pointerId, point);
    const current = latest.current;
    if (pointers.current.size === 2) {
      if (selected) startPinch(selected);
      return;
    }
    if (pointers.current.size > 2) return;
    const handle = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-handle]",
    )?.dataset.handle;
    const layer = findLayer(current, selected);
    if (handle && layer) {
      if (handle === "resize") {
        gesture.current = {
          kind: "resize",
          id: layer.id,
          startDistance: Math.max(
            1,
            Math.hypot(point[0] - layer.x, point[1] - layer.y),
          ),
          startSize: layer.size,
          run: nextRun("resize"),
        };
      } else {
        gesture.current = {
          kind: "rotate",
          id: layer.id,
          startAngle:
            (Math.atan2(point[1] - layer.y, point[0] - layer.x) * 180) /
            Math.PI,
          startRotation: layer.rotation,
          run: nextRun("rotate"),
        };
      }
      return;
    }
    const hit = hitTest(current, point[0], point[1], measure);
    if (hit) {
      onSelect(hit.id);
      gesture.current = {
        kind: "move",
        id: hit.id,
        start: point,
        origin: [hit.x, hit.y],
        run: nextRun("move"),
        moved: false,
      };
      return;
    }
    onSelect(null);
    if (current.background.kind === "photo" && photo) {
      gesture.current = {
        kind: "pan",
        start: point,
        origin: [current.background.cx, current.background.cy],
        run: nextRun("pan"),
      };
    } else {
      gesture.current = null;
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    const point = toScreen(event);
    pointers.current.set(event.pointerId, point);
    const current = latest.current;
    const active = gesture.current;
    if (!active) return;
    if (active.kind === "pinch") {
      const [a, b] = [...pointers.current.values()];
      if (!a || !b) return;
      const ratio = Math.hypot(b[0] - a[0], b[1] - a[1]) / active.startDistance;
      const angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
      const sized = resizeLayer(current, active.id, active.startSize * ratio);
      onCommit(
        rotateLayer(
          sized,
          active.id,
          snapAngle(active.startRotation + angle - active.startAngle),
        ),
        active.run,
      );
      return;
    }
    if (pointers.current.size > 1) return;
    if (active.kind === "move") {
      const dx = point[0] - active.start[0];
      const dy = point[1] - active.start[1];
      if (!active.moved && Math.hypot(dx, dy) < 2) return;
      active.moved = true;
      const snapped = snapCenter(active.origin[0] + dx, active.origin[1] + dy);
      setGuides({ vertical: snapped.vertical, horizontal: snapped.horizontal });
      onCommit(moveLayer(current, active.id, snapped.x, snapped.y), active.run);
    } else if (active.kind === "resize") {
      const layer = findLayer(current, active.id);
      if (!layer) return;
      const ratio =
        Math.hypot(point[0] - layer.x, point[1] - layer.y) /
        active.startDistance;
      onCommit(
        resizeLayer(current, active.id, active.startSize * ratio),
        active.run,
      );
    } else if (active.kind === "rotate") {
      const layer = findLayer(current, active.id);
      if (!layer) return;
      const angle =
        (Math.atan2(point[1] - layer.y, point[0] - layer.x) * 180) / Math.PI;
      onCommit(
        rotateLayer(
          current,
          active.id,
          snapAngle(active.startRotation + angle - active.startAngle),
        ),
        active.run,
      );
    } else if (
      active.kind === "pan" &&
      current.background.kind === "photo" &&
      photo
    ) {
      const crop = photoCrop(
        photo,
        { w: W, h: H },
        current.background.zoom,
        active.origin[0],
        active.origin[1],
      );
      const cx = Math.min(
        1,
        Math.max(
          0,
          active.origin[0] -
            ((point[0] - active.start[0]) * crop.w) / W / photo.width,
        ),
      );
      const cy = Math.min(
        1,
        Math.max(
          0,
          active.origin[1] -
            ((point[1] - active.start[1]) * crop.h) / H / photo.height,
        ),
      );
      onCommit(
        { ...current, background: { ...current.background, cx, cy } },
        active.run,
      );
    }
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    if (stage.current?.hasPointerCapture(event.pointerId))
      stage.current.releasePointerCapture(event.pointerId);
    if (pointers.current.size === 1 && gesture.current?.kind === "pinch") {
      // One finger left after a pinch moves the layer on from where it is.
      const [point] = [...pointers.current.values()];
      const layer = findLayer(latest.current, gesture.current.id);
      if (point && layer)
        gesture.current = {
          kind: "move",
          id: layer.id,
          start: point,
          origin: [layer.x, layer.y],
          run: nextRun("move"),
          moved: true,
        };
      return;
    }
    if (pointers.current.size === 0) {
      gesture.current = null;
      setGuides({ vertical: false, horizontal: false });
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const layer = findLayer(latest.current, selected);
    if (!layer) {
      if (event.key === "Tab" || event.key.startsWith("Arrow")) {
        if (event.key.startsWith("Arrow") && latest.current.layers.length) {
          event.preventDefault();
          onSelect(latest.current.layers[latest.current.layers.length - 1]!.id);
        }
      }
      return;
    }
    const step = event.shiftKey ? 10 : 1;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      onCommit(
        nudgeLayer(latest.current, layer.id, move[0], move[1]),
        `nudge:${layer.id}`,
      );
    } else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      onRemove(layer.id);
    } else if (event.key === "Enter" && layer.type === "text") {
      event.preventDefault();
      onEditText();
    } else if (event.key === "+" || event.key === "=") {
      onCommit(
        resizeLayer(latest.current, layer.id, layer.size * 1.08),
        `size:${layer.id}`,
      );
    } else if (event.key === "-") {
      onCommit(
        resizeLayer(latest.current, layer.id, layer.size / 1.08),
        `size:${layer.id}`,
      );
    } else if (event.key === "r" || event.key === "R") {
      onCommit(
        rotateLayer(
          latest.current,
          layer.id,
          layer.rotation + (event.shiftKey ? -15 : 15),
        ),
        `turn:${layer.id}`,
      );
    } else if (event.key === "]" || event.key === "[") {
      onCommit(
        reorderLayer(
          latest.current,
          layer.id,
          event.key === "]" ? "forward" : "backward",
        ),
      );
    }
  }

  const layer = findLayer(doc, selected);
  const box = layer ? layerBox(layer, measure) : null;
  const pct = (value: number, of: number) => `${(value / of) * 100}%`;
  const handleBelow = !!layer && !!box && layer.y - box.h / 2 < 56;

  return (
    <div
      ref={stage}
      tabIndex={0}
      role="application"
      aria-roledescription={s.canvasRole}
      aria-label={s.canvasLabel}
      aria-describedby="studio-keys"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={(event) => {
        const hit = hitTest(latest.current, ...toScreen(event), measure);
        if (hit?.type === "text") {
          onSelect(hit.id);
          onEditText();
        }
      }}
      onKeyDown={onKeyDown}
      className="relative aspect-[3/2] w-full touch-none rounded-md bg-black shadow-sm ring-1 ring-border outline-none select-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <canvas
        ref={canvas}
        width={W}
        height={H}
        className="absolute inset-0 size-full rounded-md"
      />
      {showCamera && (
        <>
          <CameraText firmware={firmware} />
          <svg
            className="pointer-events-none absolute inset-0 size-full"
            viewBox={`0 0 ${W} ${H}`}
            aria-hidden="true"
          >
            {SAFE_ZONES.map((zone) => (
              <rect
                key={zone.kind}
                x={zone.x}
                y={zone.y}
                width={zone.w}
                height={zone.h}
                fill="none"
                stroke="#FFC857"
                strokeWidth="2"
                strokeDasharray="8 6"
              />
            ))}
          </svg>
        </>
      )}
      {guides.vertical && (
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-[#FF3EA5]" />
      )}
      {guides.horizontal && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-[#FF3EA5]" />
      )}
      {doc.layers
        .filter((item) => covered.has(item.id) && item.id !== selected)
        .map((item) => {
          const b = layerBox(item, measure);
          return (
            <div
              key={item.id}
              className="pointer-events-none absolute border-2 border-dashed border-[#FFC857]"
              style={{
                left: pct(item.x, W),
                top: pct(item.y, H),
                width: pct(b.w, W),
                height: pct(b.h, H),
                transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
              }}
            />
          );
        })}
      {layer && box && (
        <div
          className="pointer-events-none absolute"
          style={{
            left: pct(layer.x, W),
            top: pct(layer.y, H),
            width: pct(box.w, W),
            height: pct(box.h, H),
            transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
          }}
        >
          <div className="absolute -inset-1.5 rounded-sm border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)]" />
          {/* The rotate handle above the box, or below it for a layer at the top of the picture. */}
          <div
            className={cn(
              "absolute left-1/2 h-7 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]",
              handleBelow ? "-bottom-9" : "-top-9",
            )}
          />
          <button
            type="button"
            tabIndex={-1}
            data-handle="rotate"
            aria-label={s.rotate}
            className={cn(
              "pointer-events-auto absolute left-1/2 flex size-8 -translate-x-1/2 cursor-grab items-center justify-center rounded-full border-2 border-foreground bg-white text-black shadow",
              handleBelow ? "-bottom-12" : "-top-12",
            )}
          >
            <RotateCw className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            data-handle="resize"
            aria-label={s.resize}
            className="pointer-events-auto absolute -right-5 -bottom-5 size-7 cursor-nwse-resize rounded-full border-2 border-foreground bg-white shadow"
          />
        </div>
      )}
    </div>
  );
}

// ---- The panels ------------------------------------------------------------------------------------------------

function TemplatesPanel({
  s,
  strings,
  doc,
  plus,
  tick,
  photo,
  onPick,
}: {
  s: StudioStrings;
  strings: Strings;
  doc: StudioDoc;
  plus: boolean;
  tick: number;
  photo: Photo | null;
  onPick: (template: Template) => void;
}) {
  const docs = useMemo(
    () => new Map(TEMPLATES.map((template) => [template.id, template.build()])),
    [],
  );
  // The painted backgrounds of the seasonal templates, for their tiles.
  useEffect(() => {
    for (const id of ART_IDS) void loadArt(id);
  }, []);
  const name = (template: Template) =>
    s.templates[template.id as keyof typeof s.templates] ??
    strings.shutdown.designs[
      template.id as keyof typeof strings.shutdown.designs
    ] ??
    template.id;
  // From November 15 to January 15 the Christmas and New Year pictures come first; the rest of
  // the year they wait with the other seasons.
  const inHoliday = useMemo(() => holidaySeason(new Date()), []);
  const holiday = [...HOLIDAY_TEMPLATES].map((id) => findTemplate(id)!);
  const group = (title: string, list: readonly Template[]) => (
    <Section title={title}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
        {list.map((template) => (
          <Tile
            key={template.id}
            s={s}
            label={name(template)}
            locked={templateLocked(template.id, CATALOG, plus)}
            selected={doc.template === template.id}
            onClick={() => onPick(template)}
          >
            <DocThumb doc={docs.get(template.id)!} photo={photo} tick={tick} />
            <span className="truncate px-2 py-1.5 text-xs font-medium">
              {name(template)}
            </span>
          </Tile>
        ))}
      </div>
    </Section>
  );
  return (
    <div className="flex flex-col gap-6">
      {inHoliday && group(s.holidayTitle, holiday)}
      {group(
        s.templatesTitle,
        TEMPLATES.filter((t) => !t.season),
      )}
      {group(
        s.seasonsTitle,
        TEMPLATES.filter(
          (t) => t.season && !(inHoliday && HOLIDAY_TEMPLATES.has(t.id)),
        ),
      )}
    </div>
  );
}

function TextPanel({
  s,
  layer,
  plus,
  onAdd,
  onChange,
  onLocked,
  focusKey,
}: {
  s: StudioStrings;
  layer: TextLayer | null;
  plus: boolean;
  onAdd: () => void;
  onChange: (patch: Partial<TextLayer>, run?: string) => void;
  onLocked: (locked: Locked) => void;
  focusKey: number;
}) {
  const id = useId();
  const area = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    for (const font of FONTS) void loadFontStyles(font.id);
  }, []);
  useEffect(() => {
    if (focusKey && area.current) {
      area.current.focus();
      area.current.select();
    }
  }, [focusKey]);
  const font = layer ? fontOf(layer.font) : null;
  return (
    <div className="flex flex-col gap-5">
      <Button
        type="button"
        variant="outline"
        onClick={onAdd}
        className="self-start"
      >
        <Plus aria-hidden="true" />
        {s.addText}
      </Button>
      {!layer ? (
        <p className="m-0 text-sm text-muted-foreground">{s.textEmpty}</p>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${id}-text`}>{s.textLabel}</Label>
            <textarea
              ref={area}
              id={`${id}-text`}
              rows={2}
              value={layer.text}
              maxLength={LIMITS.textLength}
              onChange={(event) =>
                onChange({ text: event.target.value }, `text:${layer.id}`)
              }
              className="min-h-16 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
            />
          </div>
          <Section title={s.font}>
            <div className="grid grid-cols-2 gap-2">
              {FONTS.map((item) => {
                const locked = fontLocked(item.id, plus);
                return (
                  <Tile
                    key={item.id}
                    s={s}
                    label={item.name}
                    locked={locked}
                    selected={layer.font === item.id}
                    onClick={() =>
                      locked
                        ? onLocked({ kind: "font", id: item.id })
                        : onChange({ font: item.id })
                    }
                    className="bg-background"
                  >
                    <span
                      className="flex h-14 items-center justify-center px-2 text-xl"
                      style={
                        item.id === "pixel"
                          ? {
                              fontFamily: "monospace",
                              fontWeight: 700,
                              letterSpacing: "0.1em",
                            }
                          : { fontFamily: item.family, fontWeight: item.bold }
                      }
                    >
                      {item.id === "pixel" ? "AB12" : item.thai ? "Aa ก" : "Aa"}
                    </span>
                    <span className="truncate border-t px-2 py-1 text-xs text-muted-foreground">
                      {item.name}
                    </span>
                  </Tile>
                );
              })}
            </div>
          </Section>
          <Range
            label={s.size}
            value={layer.size}
            min={LIMITS.textSize[0]}
            max={160}
            onChange={(size) => onChange({ size }, `size:${layer.id}`)}
          />
          <div className="flex flex-wrap items-center gap-3">
            <div
              role="radiogroup"
              aria-label={s.align}
              className="inline-flex rounded-md border"
            >
              {(
                [
                  ["left", AlignLeft, s.alignLeft],
                  ["center", AlignCenter, s.alignCenter],
                  ["right", AlignRight, s.alignRight],
                ] as const
              ).map(([value, Icon, label]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={layer.align === value}
                  aria-label={label}
                  title={label}
                  onClick={() => onChange({ align: value })}
                  className={cn(
                    "flex size-9 items-center justify-center first:rounded-l-md last:rounded-r-md",
                    layer.align === value && "bg-accent text-accent-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </button>
              ))}
            </div>
            {font && hasBold(font) && (
              <Button
                type="button"
                variant={layer.bold ? "secondary" : "outline"}
                size="sm"
                aria-pressed={layer.bold}
                onClick={() => onChange({ bold: !layer.bold })}
              >
                <span className="font-bold">B</span>
                {s.bold}
              </Button>
            )}
          </div>
          <Swatches
            label={s.color}
            value={layer.color}
            onChange={(color) =>
              color && onChange({ color }, `color:${layer.id}`)
            }
          />
          <Swatches
            label={s.outline}
            value={layer.outline}
            allowNone
            noneLabel={s.none}
            colors={[
              "#FFFFFF",
              "#2B2B2B",
              "#D94135",
              "#2B59C3",
              "#F4A6B8",
              "#FFC857",
            ]}
            onChange={(outline) => onChange({ outline }, `outline:${layer.id}`)}
          />
          {layer.font !== "pixel" && (
            <Range
              label={s.spacing}
              value={layer.spacing}
              min={0}
              max={30}
              onChange={(spacing) =>
                onChange({ spacing }, `spacing:${layer.id}`)
              }
            />
          )}
        </>
      )}
    </div>
  );
}

/** The button that adds a picture of the visitor as a layer, with what it takes. */
function AddPicture({ s, onClick }: { s: StudioStrings; onClick: () => void }) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <Button type="button" variant="outline" onClick={onClick}>
        <ImagePlus aria-hidden="true" />
        {s.addPicture}
      </Button>
      <p className="m-0 text-xs text-muted-foreground">{s.addPictureHint}</p>
    </div>
  );
}

function StickersPanel({
  s,
  plus,
  selected,
  onAdd,
  onTint,
  onLocked,
  onAddPicture,
}: {
  s: StudioStrings;
  plus: boolean;
  selected: StickerLayer | null;
  onAdd: (id: string) => void;
  onTint: (tint: string | null) => void;
  onLocked: (locked: Locked) => void;
  onAddPicture: () => void;
}) {
  const item = selected ? findSticker(selected.sticker) : undefined;
  return (
    <div className="flex flex-col gap-6">
      <AddPicture s={s} onClick={onAddPicture} />
      {item?.tint && (
        <Swatches
          label={s.stickerColor}
          value={selected?.tint ?? item.tint}
          onChange={(tint) => onTint(tint)}
        />
      )}
      {STICKER_GROUPS.map((group) => (
        <Section key={group} title={s.groups[group]}>
          <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 lg:grid-cols-4">
            {STICKERS.filter((sticker) => sticker.group === group).map(
              (sticker) => {
                const locked = stickerLocked(sticker.id, CATALOG, plus);
                const name =
                  s.stickers[sticker.id as keyof typeof s.stickers] ??
                  sticker.id;
                return (
                  <Tile
                    key={sticker.id}
                    s={s}
                    label={name}
                    locked={locked}
                    onClick={() =>
                      locked
                        ? onLocked({ kind: "sticker", id: sticker.id })
                        : onAdd(sticker.id)
                    }
                    className="aspect-square items-center justify-center bg-[#EFEBE4] p-1.5"
                  >
                    <StickerArt item={sticker} className="size-full" />
                  </Tile>
                );
              },
            )}
          </div>
        </Section>
      ))}
    </div>
  );
}

function BackgroundPanel({
  s,
  strings,
  doc,
  plus,
  photo,
  hasOwn,
  tick,
  onChange,
  onFrame,
  onPhotoFile,
  onUseOwn,
  onLocked,
  onAddPicture,
}: {
  s: StudioStrings;
  strings: Strings;
  doc: StudioDoc;
  plus: boolean;
  photo: Photo | null;
  hasOwn: boolean;
  tick: number;
  onChange: (background: Background, run?: string) => void;
  onFrame: (frame: FrameId | null, color?: string, run?: string) => void;
  onPhotoFile: (file: File) => void;
  onUseOwn: () => void;
  onLocked: (locked: Locked) => void;
  onAddPicture: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [fileKey, setFileKey] = useState(0);
  const background = doc.background;
  const kinds: { kind: Background["kind"]; label: string }[] = [
    { kind: "solid", label: s.bgSolid },
    { kind: "gradient", label: s.bgGradient },
    { kind: "pattern", label: s.bgPattern },
    { kind: "photo", label: s.bgPhoto },
    ...(background.kind === "design" || background.kind === "art"
      ? [{ kind: background.kind, label: s.bgDesign }]
      : []),
  ];
  function pick(kind: Background["kind"]) {
    if (kind === background.kind) return;
    if (kind === "solid") onChange({ kind: "solid", color: "#F4EFE6" });
    if (kind === "gradient")
      onChange({
        kind: "gradient",
        from: GRADIENTS[0]![0],
        to: GRADIENTS[0]![1],
        angle: 90,
      });
    if (kind === "pattern")
      onChange({
        kind: "pattern",
        pattern: "dots",
        color: PATTERN_COLORS[0]![0],
        ink: PATTERN_COLORS[0]![1],
      });
    if (kind === "photo") {
      onChange({ kind: "photo", zoom: 1, cx: 0.5, cy: 0.5, color: "#000000" });
      if (!photo) input.current?.click();
    }
  }
  const patternDoc = (pattern: PatternId): StudioDoc => ({
    ...emptyDoc(),
    background: {
      kind: "pattern",
      pattern,
      color:
        background.kind === "pattern"
          ? background.color
          : PATTERN_COLORS[0]![0],
      ink:
        background.kind === "pattern" ? background.ink : PATTERN_COLORS[0]![1],
    },
  });
  const frameDoc = (frame: FrameId): StudioDoc => ({
    ...emptyDoc(),
    background: doc.background,
    frame,
    frameColor: FRAMES.find((f) => f.id === frame)!.color,
  });
  const design =
    background.kind === "design" ? findDesign(background.design) : undefined;
  return (
    <div className="flex flex-col gap-6">
      <div
        role="radiogroup"
        aria-label={s.background}
        className="flex flex-wrap gap-1.5"
      >
        {kinds.map(({ kind, label }) => (
          <Button
            key={kind}
            type="button"
            role="radio"
            aria-checked={background.kind === kind}
            size="sm"
            variant={background.kind === kind ? "default" : "outline"}
            onClick={() => pick(kind)}
          >
            {label}
          </Button>
        ))}
      </div>
      {background.kind === "solid" && (
        <Swatches
          label={s.color}
          value={background.color}
          onChange={(color) =>
            color && onChange({ ...background, color }, "bg-color")
          }
        />
      )}
      {background.kind === "gradient" && (
        <>
          <div className="grid grid-cols-4 gap-2">
            {GRADIENTS.map(([from, to]) => (
              <button
                key={from + to}
                type="button"
                aria-label={`${s.bgGradient} ${from} ${to}`}
                aria-pressed={background.from === from && background.to === to}
                onClick={() => onChange({ ...background, from, to })}
                className={cn(
                  "aspect-[3/2] rounded-md border-2 border-border",
                  background.from === from &&
                    background.to === to &&
                    "border-foreground",
                )}
                style={{
                  background: `linear-gradient(180deg, ${from}, ${to})`,
                }}
              />
            ))}
          </div>
          <Swatches
            label={s.from}
            value={background.from}
            onChange={(from) =>
              from && onChange({ ...background, from }, "bg-from")
            }
          />
          <Swatches
            label={s.to}
            value={background.to}
            onChange={(to) => to && onChange({ ...background, to }, "bg-to")}
          />
          <Range
            label={s.angle}
            value={background.angle}
            min={-180}
            max={180}
            step={15}
            format={(value) => `${value}°`}
            onChange={(angle) => onChange({ ...background, angle }, "bg-angle")}
          />
        </>
      )}
      {background.kind === "pattern" && (
        <>
          <div className="grid grid-cols-4 gap-2">
            {PATTERN_IDS.map((pattern) => (
              <Tile
                key={pattern}
                s={s}
                label={s.patterns[pattern]}
                locked={false}
                selected={background.pattern === pattern}
                onClick={() => onChange({ ...background, pattern })}
              >
                <DocThumb doc={patternDoc(pattern)} photo={null} tick={tick} />
              </Tile>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {PATTERN_COLORS.map(([color, ink]) => (
              <button
                key={color}
                type="button"
                aria-label={`${color} ${ink}`}
                onClick={() => onChange({ ...background, color, ink })}
                className="size-8 rounded-full border-2 border-border"
                style={{
                  background: `linear-gradient(135deg, ${color} 50%, ${ink} 50%)`,
                }}
              />
            ))}
          </div>
          <Swatches
            label={s.paper}
            value={background.color}
            onChange={(color) =>
              color && onChange({ ...background, color }, "bg-paper")
            }
          />
          <Swatches
            label={s.ink}
            value={background.ink}
            onChange={(ink) =>
              ink && onChange({ ...background, ink }, "bg-ink")
            }
          />
        </>
      )}
      {background.kind === "photo" && (
        <>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => input.current?.click()}
            >
              <ImagePlus aria-hidden="true" />
              {photo ? s.photoReplace : s.photoChoose}
            </Button>
            {hasOwn && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onUseOwn}
              >
                <ImageIcon aria-hidden="true" />
                {s.photoUseOwn}
              </Button>
            )}
          </div>
          {photo ? (
            <>
              <Range
                label={s.zoom}
                value={background.zoom}
                min={1}
                max={LIMITS.zoom[1]}
                step={0.05}
                format={(value) => `${value.toFixed(2)}×`}
                onChange={(zoom) =>
                  onChange({ ...background, zoom }, "bg-zoom")
                }
              />
              <p className="m-0 text-xs text-muted-foreground">{s.photoHint}</p>
            </>
          ) : (
            <p className="m-0 text-sm text-muted-foreground">{s.photoNone}</p>
          )}
        </>
      )}
      {background.kind === "design" && design && (
        <Section title={strings.shutdown.colors}>
          <div
            role="radiogroup"
            aria-label={strings.shutdown.colors}
            className="flex flex-wrap gap-2"
          >
            {design.swatches.map((swatch, n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={background.theme === n}
                aria-label={`${strings.shutdown.colors} ${n + 1}`}
                onClick={() => onChange({ ...background, theme: n })}
                className={cn(
                  "size-10 rounded-full border-2 border-border",
                  background.theme === n &&
                    "border-foreground ring-2 ring-foreground/30",
                )}
                style={{
                  background: `conic-gradient(${swatch.map((color, i) => `${color} ${(i / swatch.length) * 360}deg ${((i + 1) / swatch.length) * 360}deg`).join(", ")})`,
                }}
              />
            ))}
          </div>
        </Section>
      )}
      <input
        key={fileKey}
        ref={input}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.target.files?.[0];
          setFileKey((key) => key + 1);
          if (file) onPhotoFile(file);
        }}
      />
      <Section title={s.framesTitle}>
        <div className="grid grid-cols-3 gap-2">
          <Tile
            s={s}
            label={s.none}
            locked={false}
            selected={doc.frame === null}
            onClick={() => onFrame(null)}
          >
            <span className="flex aspect-[3/2] items-center justify-center text-xs text-muted-foreground">
              {s.none}
            </span>
          </Tile>
          {FRAME_IDS.map((frame) => (
            <Tile
              key={frame}
              s={s}
              label={s.frames[frame]}
              locked={frameLocked(plus)}
              selected={doc.frame === frame}
              onClick={() =>
                frameLocked(plus)
                  ? onLocked({ kind: "frame", id: frame })
                  : onFrame(
                      frame,
                      doc.frame
                        ? doc.frameColor
                        : FRAMES.find((f) => f.id === frame)!.color,
                    )
              }
            >
              <DocThumb doc={frameDoc(frame)} photo={photo} tick={tick} />
            </Tile>
          ))}
        </div>
        {doc.frame && (
          <Swatches
            label={s.frameColor}
            value={doc.frameColor}
            colors={[
              "#FFFFFF",
              "#F4EFE6",
              "#F4A6B8",
              "#D7EAF5",
              "#FFC857",
              "#2B2B2B",
              "#D94135",
              "#8CC084",
            ]}
            onChange={(color) =>
              color && onFrame(doc.frame, color, "frame-color")
            }
          />
        )}
      </Section>
      <div className="border-t pt-4">
        <AddPicture s={s} onClick={onAddPicture} />
      </div>
    </div>
  );
}

function layerName(layer: Layer, s: StudioStrings): string {
  if (layer.type === "text")
    return layer.text.trim().split("\n")[0] || s.emptyText;
  if (layer.type === "image") return s.pictureLayer;
  return s.stickers[layer.sticker as keyof typeof s.stickers] ?? layer.sticker;
}

function LayersPanel({
  s,
  doc,
  plus,
  selected,
  covered,
  onSelect,
  onOrder,
  onRemove,
  onPlus,
}: {
  s: StudioStrings;
  doc: StudioDoc;
  plus: boolean;
  selected: string | null;
  covered: ReadonlySet<string>;
  onSelect: (id: string) => void;
  onOrder: (id: string, order: Order) => void;
  onRemove: (id: string) => void;
  onPlus: () => void;
}) {
  const list = [...doc.layers].reverse();
  return (
    <div className="flex flex-col gap-3">
      {list.length === 0 && (
        <p className="m-0 text-sm text-muted-foreground">{s.layersEmpty}</p>
      )}
      <ol className="m-0 flex list-none flex-col gap-1.5 p-0">
        {list.map((layer, i) => {
          const item =
            layer.type === "sticker" ? findSticker(layer.sticker) : undefined;
          return (
            <li
              key={layer.id}
              className={cn(
                "flex items-center gap-2 rounded-md border bg-background p-1.5",
                selected === layer.id && "border-foreground",
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(layer.id)}
                aria-pressed={selected === layer.id}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-sm text-left text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-muted">
                  {item ? (
                    <StickerArt
                      item={item}
                      tint={(layer as StickerLayer).tint}
                      className="size-7"
                    />
                  ) : layer.type === "image" ? (
                    <ImageIcon className="size-4" aria-hidden="true" />
                  ) : (
                    <Type className="size-4" aria-hidden="true" />
                  )}
                </span>
                <span
                  className="min-w-0 truncate"
                  style={
                    layer.type === "text"
                      ? { fontFamily: fontOf(layer.font).family }
                      : undefined
                  }
                >
                  {layerName(layer, s)}
                </span>
                {covered.has(layer.id) && (
                  <TriangleAlert
                    className="size-4 shrink-0 text-amber-300"
                    aria-label={s.coveredShort}
                  />
                )}
              </button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={s.forward}
                disabled={i === 0}
                onClick={() => onOrder(layer.id, "forward")}
              >
                <ArrowUp aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={s.backward}
                disabled={i === list.length - 1}
                onClick={() => onOrder(layer.id, "backward")}
              >
                <ArrowDown aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={s.remove}
                onClick={() => onRemove(layer.id)}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </li>
          );
        })}
      </ol>
      {!plus && (
        <div className="flex flex-col items-start gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground">
          <span>
            {s.layersFree
              .replace("${n}", String(doc.layers.length))
              .replace("${max}", String(FREE_LAYERS))}
          </span>
          <Button type="button" variant="outline" size="xs" onClick={onPlus}>
            <Sparkles aria-hidden="true" />
            {s.seePlus}
          </Button>
        </div>
      )}
    </div>
  );
}

// ---- The editor ----------------------------------------------------------------------------------------------------

export interface StudioProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strings: Strings;
  language: Language;
  /** Whether the visitor has GRKU Plus, which unlocks everything here. */
  plus: boolean;
  /** Opens the sheet of GRKU Plus. */
  onPlus: () => void;
  firmware: string;
  /** The picture of the visitor from the shutdown card, offered as a background photo. */
  ownPicture: Uint8Array | null;
  /**
   * A photo that starts a new picture as its background, from the shutdown card; a new `key`
   * starts again.
   */
  startPhoto?: { file: Blob; key: number } | null;
  /** The design of the card, the first picture of a Studio never opened before. */
  start?: DesignChoice;
  /** The picture as drawn, as the file for the card. */
  onDone: (bytes: Uint8Array) => void;
}

function firstDoc(start: DesignChoice | undefined): StudioDoc {
  const saved = loadDoc(browserStorage(), designThemes);
  if (saved) return saved;
  const design = start && findDesign(start.id);
  return design
    ? designDoc(design, start.theme, start.text)
    : findTemplate("sunset")!.build();
}

export default function Studio({
  open,
  onOpenChange,
  strings,
  language,
  plus,
  onPlus,
  firmware,
  ownPicture,
  startPhoto = null,
  start,
  onDone,
}: StudioProps) {
  const s = STUDIO_STRINGS[language];
  const wide = useMediaQuery("(min-width: 1024px)");
  const tick = useFontTick();
  const [state, dispatch] = useReducer(reducer, start, (first) =>
    history(firstDoc(first)),
  );
  const doc = state.present;
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("templates");
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [images, setImages] = useState<ReadonlyMap<string, Photo>>(
    () => new Map(),
  );
  const pictureInput = useRef<HTMLInputElement>(null);
  const [pictureKey, setPictureKey] = useState(0);
  const [dropping, setDropping] = useState(false);
  // Started from a photo of the shutdown card: the photo is the background, and a line says so.
  const [fromPhoto, setFromPhoto] = useState(false);
  const [showCamera, setShowCamera] = useState(true);
  const [locked, setLocked] = useState<Locked | null>(null);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [focusText, setFocusText] = useState(0);
  const [measure, setMeasure] = useState<Measure>(() => roughMeasure);
  // A measure is a function, so it goes in through an updater.
  const takeMeasure = useCallback(
    (next: Measure) => setMeasure(() => next),
    [],
  );

  const commitDoc = useCallback(
    (next: StudioDoc, run: string | null = null) =>
      dispatch({ type: "commit", doc: next, run }),
    [],
  );
  const selectedLayer = findLayer(doc, selected);
  // A selection that an undo took away is gone.
  useEffect(() => {
    if (selected && !findLayer(doc, selected)) setSelected(null);
  }, [doc, selected]);

  // The fonts and the photo of the document.
  useEffect(() => {
    void prepareFonts(
      doc.layers.filter((layer): layer is TextLayer => layer.type === "text"),
    );
  }, [doc.layers]);
  useEffect(() => {
    let live = true;
    void loadPhoto(browserStorage()).then(
      (bitmap) => live && bitmap && setPhoto(bitmap),
    );
    return () => {
      live = false;
    };
  }, []);
  // The painted background of a seasonal template, read once a visit.
  const art = doc.background.kind === "art" ? doc.background.art : null;
  useEffect(() => {
    if (art) void loadArt(art);
  }, [art]);
  // The pictures of the picture layers, read once each from this browser.
  const imageIds = doc.layers
    .flatMap((layer) => (layer.type === "image" ? [layer.image] : []))
    .join(",");
  useEffect(() => {
    const wanted = imageIds ? imageIds.split(",") : [];
    if (wanted.every((id) => images.has(id))) return;
    let live = true;
    void loadImages(wanted).then(
      (found) =>
        live && setImages((before) => new Map([...before, ...found])),
    );
    return () => {
      live = false;
    };
  }, [imageIds, images]);
  // The pictures that no layer of the saved document names are forgotten, once.
  useEffect(() => {
    void pruneImages(
      state.present.layers.flatMap((layer) =>
        layer.type === "image" ? [layer.image] : [],
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // A photo of the shutdown card starts a new picture with it as the background.
  useEffect(() => {
    if (!startPhoto) return;
    let live = true;
    void savePhoto(browserStorage(), startPhoto.file)
      .then((bitmap) => {
        if (!live) return;
        setPhoto(bitmap);
        dispatch({
          type: "commit",
          doc: {
            ...emptyDoc(),
            background: {
              kind: "photo",
              zoom: 1,
              cx: 0.5,
              cy: 0.5,
              color: "#000000",
            },
          },
          run: null,
        });
        setSelected(null);
        setTab("text");
        setFromPhoto(true);
        setFailed(false);
      })
      .catch((error) => {
        console.error(error);
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, [startPhoto]);
  useEffect(() => {
    if (!open) setFromPhoto(false);
  }, [open]);
  // A picture pasted while the Studio is open becomes a layer.
  useEffect(() => {
    if (!open) return;
    const onPaste = (event: ClipboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest?.("input, textarea")) return;
      const file = [...(event.clipboardData?.files ?? [])].find((item) =>
        item.type.startsWith("image/"),
      );
      if (!file) return;
      event.preventDefault();
      void addPicture(file);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  });

  // The document stays in this browser, a moment after the last change.
  useEffect(() => {
    const timer = setTimeout(() => saveDoc(browserStorage(), doc), 400);
    return () => clearTimeout(timer);
  }, [doc]);

  const covered = useMemo(
    () => new Set(underCameraText(doc, measure).map((item) => item.id)),
    [doc, measure],
  );
  const usesPlus = !plus && plusItems(doc, CATALOG).length > 0;

  function add(layer: Layer) {
    if (!canAddLayer(doc, plus)) {
      setLocked({ kind: "layers" });
      return;
    }
    // Each new layer a little lower than the last, so they never hide one another.
    const offset = (doc.layers.length % 5) * 14;
    commitDoc(
      addLayer(doc, { ...layer, x: layer.x + offset, y: layer.y + offset }),
    );
    setSelected(layer.id);
  }

  function remove(id: string) {
    commitDoc(removeLayer(doc, id));
    setSelected(null);
  }

  function duplicate(id: string) {
    if (!canAddLayer(doc, plus)) {
      setLocked({ kind: "layers" });
      return;
    }
    const copy = duplicateLayer(doc, id);
    commitDoc(copy.doc);
    setSelected(copy.id);
  }

  function pickTemplate(template: Template) {
    if (templateLocked(template.id, CATALOG, plus)) {
      setLocked({ kind: "template", id: template.id });
      return;
    }
    // A template keeps the photo of a picture that has one as its background.
    commitDoc(template.build());
    setSelected(null);
  }

  /** Adds a picture of the visitor as a layer, as large as fits the middle of the screen. */
  async function addPicture(source: Blob) {
    if (!canAddLayer(doc, plus)) {
      setLocked({ kind: "layers" });
      return;
    }
    try {
      const added = await addImage(source);
      setImages((before) => new Map(before).set(added.id, added.image));
      const size =
        added.aspect >= 1
          ? Math.min(W * 0.6, H * 0.55 * added.aspect)
          : Math.min(H * 0.55, (W * 0.6) / added.aspect);
      // Above the bar of the camera text, so the picture shows whole.
      add(
        imageLayer(added.id, added.aspect, { size: Math.round(size), y: 180 }),
      );
      setFailed(false);
    } catch (error) {
      console.error(error);
      setFailed(true);
    }
  }

  function choosePicture() {
    pictureInput.current?.click();
  }

  async function usePhoto(source: Blob) {
    try {
      const bitmap = await savePhoto(browserStorage(), source);
      setPhoto(bitmap);
      commitDoc({
        ...doc,
        background: {
          kind: "photo",
          zoom: 1,
          cx: 0.5,
          cy: 0.5,
          color: "#000000",
        },
      });
      setFailed(false);
    } catch (error) {
      console.error(error);
      setFailed(true);
    }
  }

  async function done() {
    setSaving(true);
    try {
      await prepareFonts(
        doc.layers.filter((layer): layer is TextLayer => layer.type === "text"),
      );
      if (doc.background.kind === "art") await loadArt(doc.background.art);
      const canvas =
        typeof OffscreenCanvas !== "undefined"
          ? new OffscreenCanvas(W, H)
          : Object.assign(document.createElement("canvas"), {
              width: W,
              height: H,
            });
      const context = canvas.getContext("2d") as
        CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
      renderDoc(context, doc, { photo, images });
      const bytes = await encodePicture(context.getImageData(0, 0, W, H).data);
      saveDoc(browserStorage(), doc);
      onDone(bytes);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest("input, textarea, select")) return;
    const mod = event.metaKey || event.ctrlKey;
    if (mod && event.key.toLowerCase() === "z") {
      event.preventDefault();
      dispatch({ type: event.shiftKey ? "redo" : "undo" });
    } else if (mod && event.key.toLowerCase() === "y") {
      event.preventDefault();
      dispatch({ type: "redo" });
    }
  }

  const textSelected = selectedLayer?.type === "text" ? selectedLayer : null;
  const stickerSelected =
    selectedLayer?.type === "sticker" ? selectedLayer : null;
  const flippable =
    selectedLayer?.type === "sticker" || selectedLayer?.type === "image"
      ? selectedLayer
      : null;

  const panels: Record<Tab, ReactNode> = {
    templates: (
      <TemplatesPanel
        s={s}
        strings={strings}
        doc={doc}
        plus={plus}
        tick={tick}
        photo={photo}
        onPick={pickTemplate}
      />
    ),
    text: (
      <TextPanel
        s={s}
        layer={textSelected}
        plus={plus}
        focusKey={focusText}
        onLocked={setLocked}
        onAdd={() =>
          add(
            textLayer({
              text: s.newText,
              y: 120,
              color:
                doc.background.kind === "solid" &&
                /^#(1|2|0)/.test(doc.background.color)
                  ? "#FFFFFF"
                  : "#2B2B2B",
            }),
          )
        }
        onChange={(patch, run) =>
          textSelected &&
          commitDoc(updateLayer(doc, textSelected.id, patch), run ?? null)
        }
      />
    ),
    stickers: (
      <StickersPanel
        s={s}
        plus={plus}
        selected={stickerSelected}
        onLocked={setLocked}
        onAdd={(id) => add(stickerLayer(id, { y: 170 }))}
        onAddPicture={choosePicture}
        onTint={(tint) =>
          stickerSelected &&
          commitDoc(
            updateLayer(doc, stickerSelected.id, { tint }),
            `tint:${stickerSelected.id}`,
          )
        }
      />
    ),
    background: (
      <BackgroundPanel
        s={s}
        strings={strings}
        doc={doc}
        plus={plus}
        photo={photo}
        hasOwn={!!ownPicture}
        tick={tick}
        onLocked={setLocked}
        onChange={(background, run) => {
          // A design whose colors change keeps its text in the colors of the new theme.
          let next: StudioDoc = { ...doc, background };
          if (
            background.kind === "design" &&
            doc.background.kind === "design" &&
            background.theme !== doc.background.theme
          ) {
            const before = captionOf(
              background.design,
              doc.background.theme,
            )?.color.toUpperCase();
            const after = captionOf(
              background.design,
              background.theme,
            )?.color.toUpperCase();
            if (before && after)
              next = {
                ...next,
                layers: next.layers.map((layer) =>
                  layer.type === "text" && layer.color === before
                    ? { ...layer, color: after }
                    : layer,
                ),
              };
          }
          commitDoc(next, run ?? null);
        }}
        onFrame={(frame, color, run) =>
          commitDoc(
            { ...doc, frame, frameColor: color ?? doc.frameColor },
            run ?? null,
          )
        }
        onPhotoFile={(file) => void usePhoto(file)}
        onAddPicture={choosePicture}
        onUseOwn={() =>
          ownPicture &&
          void usePhoto(
            new Blob([ownPicture as Uint8Array<ArrayBuffer>], {
              type: "image/jpeg",
            }),
          )
        }
      />
    ),
    layers: (
      <LayersPanel
        s={s}
        doc={doc}
        plus={plus}
        selected={selected}
        covered={covered}
        onSelect={setSelected}
        onOrder={(id, order) => commitDoc(reorderLayer(doc, id, order))}
        onRemove={remove}
        onPlus={() => setLocked({ kind: "layers" })}
      />
    ),
  };

  const tabs: { value: Tab; label: string; icon: ReactNode }[] = [
    {
      value: "templates",
      label: s.tabTemplates,
      icon: <LayoutTemplate aria-hidden="true" />,
    },
    { value: "text", label: s.tabText, icon: <Type aria-hidden="true" /> },
    {
      value: "stickers",
      label: s.tabStickers,
      icon: <StickerIcon aria-hidden="true" />,
    },
    {
      value: "background",
      label: s.tabBackground,
      icon: <ImageIcon aria-hidden="true" />,
    },
    ...(wide
      ? []
      : [
          {
            value: "layers" as const,
            label: s.tabLayers,
            icon: <Layers aria-hidden="true" />,
          },
        ]),
  ];
  const shownTab = wide && tab === "layers" ? "templates" : tab;

  const toolbar = selectedLayer && (
    <div
      role="toolbar"
      aria-label={s.layerTools}
      className="flex flex-wrap items-center justify-center gap-1"
    >
      {selectedLayer.type === "text" && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setTab("text");
            setFocusText((n) => n + 1);
          }}
        >
          <Type aria-hidden="true" />
          {s.editText}
        </Button>
      )}
      {flippable && (
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={s.flip}
          title={s.flip}
          onClick={() =>
            commitDoc(updateLayer(doc, flippable.id, { flip: !flippable.flip }))
          }
        >
          <FlipHorizontal2 aria-hidden="true" />
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label={s.duplicate}
        title={s.duplicate}
        onClick={() => duplicate(selectedLayer.id)}
      >
        <Copy aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label={s.forward}
        title={s.forward}
        onClick={() =>
          commitDoc(reorderLayer(doc, selectedLayer.id, "forward"))
        }
      >
        <ArrowUp aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label={s.backward}
        title={s.backward}
        onClick={() =>
          commitDoc(reorderLayer(doc, selectedLayer.id, "backward"))
        }
      >
        <ArrowDown aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label={s.remove}
        title={s.remove}
        onClick={() => remove(selectedLayer.id)}
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </div>
  );

  const lockedText = locked
    ? locked.kind === "template"
      ? s.lockedTemplate
      : locked.kind === "sticker"
        ? s.lockedSticker
        : locked.kind === "font"
          ? s.lockedFont
          : locked.kind === "frame"
            ? s.lockedFrame
            : s.lockedLayers.replace("${max}", String(FREE_LAYERS))
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        data-grku={__GRKU_SIG__}
        onKeyDown={onKeyDown}
        onEscapeKeyDown={(event) => {
          if (selected) {
            event.preventDefault();
            setSelected(null);
          }
        }}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="top-0 left-0 flex h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:max-w-none data-[state=open]:zoom-in-100"
      >
        <header className="flex h-14 shrink-0 items-center gap-1 border-b px-2 sm:gap-2 sm:px-3">
          <DialogPrimitive.Close asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={s.close}
            >
              <X aria-hidden="true" />
            </Button>
          </DialogPrimitive.Close>
          <DialogTitle className="flex min-w-0 items-center gap-2 text-base">
            <span className="truncate">{s.title}</span>
            {plus && (
              <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] leading-none font-semibold text-brand-foreground">
                {s.plusBadge}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {s.description}
          </DialogDescription>
          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <Button
              type="button"
              variant="outline"
              size={wide ? "sm" : "icon"}
              aria-label={s.addPicture}
              title={s.addPicture}
              className="mr-1"
              onClick={choosePicture}
            >
              <ImagePlus aria-hidden="true" />
              {wide && s.addPicture}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={s.undo}
              title={s.undo}
              disabled={!canUndo(state)}
              onClick={() => dispatch({ type: "undo" })}
            >
              <Undo2 aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={s.redo}
              title={s.redo}
              disabled={!canRedo(state)}
              onClick={() => dispatch({ type: "redo" })}
            >
              <Redo2 aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant={showCamera ? "secondary" : "ghost"}
              size={wide ? "sm" : "icon"}
              aria-pressed={showCamera}
              aria-label={s.cameraText}
              title={s.cameraText}
              onClick={() => setShowCamera((on) => !on)}
            >
              <ScanLine aria-hidden="true" />
              {wide && s.cameraText}
            </Button>
            <Button
              type="button"
              variant="brand"
              size="sm"
              className="ml-1"
              disabled={saving}
              onClick={() => void done()}
            >
              <Check aria-hidden="true" />
              {s.done}
            </Button>
          </div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {wide && (
            <aside className="flex w-[22rem] shrink-0 flex-col border-r">
              <Tabs
                value={shownTab}
                onValueChange={(value) => setTab(value as Tab)}
                className="min-h-0 flex-1 gap-0"
              >
                <TabsList className="m-3 grid w-auto grid-cols-4">
                  {tabs.map((item) => (
                    <TabsTrigger
                      key={item.value}
                      value={item.value}
                      className="px-1 text-xs"
                    >
                      {item.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {tabs.map((item) => (
                  <TabsContent
                    key={item.value}
                    value={item.value}
                    className="min-h-0 flex-1 overflow-y-auto px-4 pb-6"
                  >
                    {panels[item.value]}
                  </TabsContent>
                ))}
              </Tabs>
            </aside>
          )}
          <main className="flex shrink-0 flex-col items-center gap-3 bg-muted/50 px-3 pt-3 pb-2 lg:min-w-0 lg:flex-1 lg:justify-center lg:overflow-y-auto lg:p-8">
            {fromPhoto && (
              <div
                role="status"
                className="flex w-full max-w-xl flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-md border bg-background px-3 py-2 text-center text-sm"
              >
                <span>{s.fromPhoto}</span>
                <DialogPrimitive.Close asChild>
                  <Button type="button" variant="outline" size="sm">
                    {s.keepPhoto}
                  </Button>
                </DialogPrimitive.Close>
              </div>
            )}
            <div
              className={cn(
                "relative w-full max-w-[min(100%,calc((100dvh-15rem)*1.5))] lg:max-w-[min(100%,calc((100dvh-12rem)*1.5))]",
                dropping && "outline-2 outline-offset-4 outline-brand outline-dashed",
              )}
              onDragOver={(event) => {
                if (![...event.dataTransfer.types].includes("Files")) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
                setDropping(true);
              }}
              onDragLeave={() => setDropping(false)}
              onDrop={(event) => {
                setDropping(false);
                const file = [...event.dataTransfer.files].find((item) =>
                  item.type.startsWith("image/") || /\.(hei[cf]|avif)$/i.test(item.name),
                );
                if (!file) return;
                event.preventDefault();
                void addPicture(file);
              }}
            >
              <Stage
                doc={doc}
                photo={photo}
                images={images}
                selected={selected}
                onSelect={setSelected}
                onCommit={commitDoc}
                onRemove={remove}
                onEditText={() => {
                  setTab("text");
                  setFocusText((n) => n + 1);
                }}
                measure={measure}
                onMeasure={takeMeasure}
                showCamera={showCamera}
                firmware={firmware}
                covered={covered}
                tick={tick}
                s={s}
              />
            </div>
            <div className="flex min-h-8 w-full flex-col items-center gap-2">
              {toolbar}
              {covered.size > 0 && (
                <p
                  role="status"
                  className="m-0 flex items-center gap-1.5 text-xs text-amber-300"
                >
                  <TriangleAlert
                    className="size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  {s.covered}
                </p>
              )}
              {usesPlus && (
                <p className="m-0 text-center text-xs text-muted-foreground">
                  {s.usesPlus}
                </p>
              )}
              {failed && (
                <p className="m-0 text-xs text-destructive">{s.failed}</p>
              )}
              <input
                key={pictureKey}
                ref={pictureInput}
                className="sr-only"
                type="file"
                accept="image/*,.heic,.heif"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setPictureKey((key) => key + 1);
                  if (file) void addPicture(file);
                }}
              />
              <p
                id="studio-keys"
                className="m-0 hidden text-center text-xs text-muted-foreground lg:block"
              >
                {s.keys}
              </p>
            </div>
          </main>
          {wide ? (
            <aside className="flex w-72 shrink-0 flex-col overflow-y-auto border-l p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Layers className="size-4" aria-hidden="true" />
                {s.tabLayers}
              </h3>
              {panels.layers}
            </aside>
          ) : (
            <Tabs
              value={tab}
              onValueChange={(value) => setTab(value as Tab)}
              className="min-h-0 flex-1 gap-0 border-t bg-background"
            >
              <TabsList className="mx-2 mt-2 grid h-auto w-auto grid-cols-5 group-data-[orientation=horizontal]/tabs:h-auto">
                {tabs.map((item) => (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className="flex h-auto flex-col gap-0.5 px-0.5 py-1.5 text-[11px] [&_svg]:size-4"
                  >
                    {item.icon}
                    <span className="max-w-full truncate">{item.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              {tabs.map((item) => (
                <TabsContent
                  key={item.value}
                  value={item.value}
                  className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
                >
                  {panels[item.value]}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
        <Dialog
          open={locked !== null}
          onOpenChange={(next) => !next && setLocked(null)}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-brand" aria-hidden="true" />
                {s.lockedTitle}
              </DialogTitle>
              <DialogDescription>{lockedText}</DialogDescription>
            </DialogHeader>
            <p className="m-0 text-sm text-muted-foreground">
              {s.plusIncludes
                .replace("${pack}", String(PRICES["pack:kodak"]))
                .replace("${slots}", String(PRICES.slots25))
                .replace("${all}", String(PRICES.plus))}
            </p>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocked(null)}
              >
                {s.notNow}
              </Button>
              <Button
                type="button"
                variant="brand"
                onClick={() => {
                  setLocked(null);
                  onPlus();
                }}
              >
                <Sparkles aria-hidden="true" />
                {s.seePlus}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
