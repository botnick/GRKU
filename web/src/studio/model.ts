/**
 * The document of GRKU Studio: the shutdown picture as layers over a background, in the
 * coordinates of the screen of 720 by 480. Everything here is plain data and pure functions, so
 * the editor, the renderer, the browser storage, and the tests share one model.
 *
 * A layer's `x` and `y` are the center of its box; `rotation` is in degrees around that center.
 * A text layer's box is as wide as its longest line and as tall as its lines; a sticker's box is a
 * square of `size`.
 */

export const STUDIO_WIDTH = 720;
export const STUDIO_HEIGHT = 480;

// ---- Fonts, frames, patterns ---------------------------------------------------------------------

export const FONT_IDS = ['sans', 'condensed', 'mono', 'pixel', 'mali', 'itim', 'sriracha', 'chonburi'] as const;
export type FontId = (typeof FONT_IDS)[number];
/** The fonts of the free library. */
export const FREE_FONTS: readonly FontId[] = ['sans', 'condensed'];

export const FRAME_IDS = ['instant', 'film', 'border', 'stamp', 'tape'] as const;
export type FrameId = (typeof FRAME_IDS)[number];

export const PATTERN_IDS = ['dots', 'stripes', 'checker', 'grid', 'waves', 'gingham', 'hearts', 'stars'] as const;
export type PatternId = (typeof PATTERN_IDS)[number];

// ---- The document ---------------------------------------------------------------------------------

export type Align = 'left' | 'center' | 'right';

interface Placed {
  id: string;
  x: number;
  y: number;
  /** Degrees, clockwise. */
  rotation: number;
}

export interface TextLayer extends Placed {
  type: 'text';
  text: string;
  font: FontId;
  /** The font size in pixels of the screen. */
  size: number;
  bold: boolean;
  color: string;
  align: Align;
  /** A line around the letters in this color, or null. */
  outline: string | null;
  /** Extra space between the characters, in pixels. */
  spacing: number;
  /** The widest the text gets: a longer line draws smaller. 0 for no limit. */
  maxWidth: number;
}

export interface StickerLayer extends Placed {
  type: 'sticker';
  sticker: string;
  /** The side of the square box, in pixels of the screen. */
  size: number;
  flip: boolean;
  /** The color of the tinted parts of a sticker that has them, or null for its own. */
  tint: string | null;
}

export type Layer = TextLayer | StickerLayer;

export type Background =
  | { kind: 'solid'; color: string }
  | { kind: 'gradient'; from: string; to: string; angle: number }
  | { kind: 'pattern'; pattern: PatternId; color: string; ink: string }
  /** The photo of the visitor, cover-cropped to 3:2, then `zoom` times larger around `cx`, `cy` (0 to 1 of the photo). */
  | { kind: 'photo'; zoom: number; cx: number; cy: number; color: string }
  /** The art of a ready-made design (`shutdownDesigns`) without its text. */
  | { kind: 'design'; design: string; theme: number };

export interface StudioDoc {
  version: 1;
  background: Background;
  frame: FrameId | null;
  frameColor: string;
  /** Bottom first. */
  layers: Layer[];
  /** The template that the document started from, for the gallery. */
  template: string | null;
}

export const LIMITS = {
  textSize: [10, 220] as const,
  stickerSize: [24, 480] as const,
  textLength: 80,
  zoom: [1, 4] as const,
  /** The most layers of any document. */
  layers: 40,
} as const;

/** The layers that the free library places on one picture. */
export const FREE_LAYERS = 3;

export function emptyDoc(): StudioDoc {
  return { version: 1, background: { kind: 'solid', color: '#F4EFE6' }, frame: null, frameColor: '#FFFFFF', layers: [], template: null };
}

let counter = 0;
/** A new layer id, unique within a session and short. */
export function newId(): string {
  counter += 1;
  return `${Date.now().toString(36).slice(-4)}${counter.toString(36)}${Math.floor(Math.random() * 36 ** 2).toString(36)}`;
}

export function textLayer(patch: Partial<TextLayer> = {}): TextLayer {
  return {
    type: 'text',
    id: newId(),
    x: STUDIO_WIDTH / 2,
    y: 140,
    rotation: 0,
    text: 'Hello',
    font: 'sans',
    size: 56,
    bold: true,
    color: '#2B2B2B',
    align: 'center',
    outline: null,
    spacing: 0,
    maxWidth: 0,
    ...patch,
  };
}

export function stickerLayer(sticker: string, patch: Partial<StickerLayer> = {}): StickerLayer {
  return { type: 'sticker', id: newId(), x: STUDIO_WIDTH / 2, y: 160, rotation: 0, sticker, size: 120, flip: false, tint: null, ...patch };
}

// ---- Geometry ---------------------------------------------------------------------------------------

export interface Box {
  /** Width and height before the rotation. */
  w: number;
  h: number;
}

/** The size of a text layer, from a function that measures a line in the layer's font at `size`. */
export type Measure = (layer: TextLayer, line: string, size: number) => number;

/** A measure without a canvas: a fair width for the fonts of the Studio, for tests and the first paint. */
export const roughMeasure: Measure = (layer, line, size) => {
  const count = [...line].length;
  if (layer.font === 'pixel') return Math.max(0, count * 6 - 1) * pixelBlock(size);
  return count * size * 0.56 + Math.max(0, count - 1) * layer.spacing;
};

/** The block of the pixel font at a font size: seven blocks high. */
export function pixelBlock(size: number): number {
  return Math.max(2, Math.round(size / 7));
}

export const LINE_HEIGHT = 1.2;

export function textLines(layer: Pick<TextLayer, 'text'>): string[] {
  return layer.text.split('\n');
}

/** The size that the text draws at: smaller than `size` where a line would be wider than `maxWidth`. */
export function fittedSize(layer: TextLayer, measure: Measure): number {
  let size = layer.size;
  if (!layer.maxWidth) return size;
  const widest = (at: number) => Math.max(0, ...textLines(layer).map((line) => measure(layer, line, at)));
  while (widest(size) > layer.maxWidth && size > 12) size = Math.max(12, Math.floor(size * 0.94));
  return size;
}

export function layerBox(layer: Layer, measure: Measure = roughMeasure): Box {
  if (layer.type === 'sticker') return { w: layer.size, h: layer.size };
  const size = fittedSize(layer, measure);
  const lines = textLines(layer);
  const w = Math.max(size * 0.5, ...lines.map((line) => measure(layer, line, size)));
  const h = layer.font === 'pixel' ? lines.length * pixelBlock(size) * 9 - pixelBlock(size) * 2 : lines.length * size * LINE_HEIGHT;
  return { w, h };
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The four corners of a layer's box on the screen. */
export function corners(layer: Layer, measure: Measure = roughMeasure): [number, number][] {
  const { w, h } = layerBox(layer, measure);
  const a = (layer.rotation * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return [
    [-w / 2, -h / 2],
    [w / 2, -h / 2],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ].map(([dx = 0, dy = 0]) => [layer.x + dx * cos - dy * sin, layer.y + dx * sin + dy * cos]);
}

/** The upright rectangle around a layer, rotation included. */
export function bounds(layer: Layer, measure: Measure = roughMeasure): Rect {
  const points = corners(layer, measure);
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

/** Whether the point `px`, `py` of the screen is on the layer, with `slop` pixels of room. */
export function hits(layer: Layer, px: number, py: number, measure: Measure = roughMeasure, slop = 6): boolean {
  const { w, h } = layerBox(layer, measure);
  const a = (-layer.rotation * Math.PI) / 180;
  const dx = px - layer.x;
  const dy = py - layer.y;
  const lx = dx * Math.cos(a) - dy * Math.sin(a);
  const ly = dx * Math.sin(a) + dy * Math.cos(a);
  return Math.abs(lx) <= w / 2 + slop && Math.abs(ly) <= h / 2 + slop;
}

/** The top layer at a point, or null. */
export function hitTest(doc: StudioDoc, px: number, py: number, measure: Measure = roughMeasure): Layer | null {
  for (let i = doc.layers.length - 1; i >= 0; i--) {
    const layer = doc.layers[i]!;
    if (hits(layer, px, py, measure)) return layer;
  }
  return null;
}

// ---- The camera's text ------------------------------------------------------------------------------

/**
 * Where the camera draws over the picture while Show Text is on: the bar of the shot counts and
 * the firmware version at the bottom right.
 */
export const SAFE_ZONES: readonly (Rect & { kind: 'counts' | 'firmware' })[] = [
  { kind: 'counts', x: 20, y: 340, w: 680, h: 40 },
  { kind: 'firmware', x: 530, y: 434, w: 184, h: 38 },
];

function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

/** The layers that the camera's text would cover, with the zones each one meets. */
export function underCameraText(doc: StudioDoc, measure: Measure = roughMeasure): { id: string; zones: ('counts' | 'firmware')[] }[] {
  const found: { id: string; zones: ('counts' | 'firmware')[] }[] = [];
  for (const layer of doc.layers) {
    if (layer.type === 'text' && !layer.text.trim()) continue;
    const rect = bounds(layer, measure);
    const zones = SAFE_ZONES.filter((zone) => overlaps(rect, zone)).map((zone) => zone.kind);
    if (zones.length) found.push({ id: layer.id, zones });
  }
  return found;
}

// ---- Edits --------------------------------------------------------------------------------------------

const clamp = (value: number, [min, max]: readonly [number, number]) => Math.min(max, Math.max(min, value));

/** A rotation in -180 (not included) to 180. */
export function normalizeAngle(degrees: number): number {
  let turned = ((degrees % 360) + 360) % 360;
  if (turned > 180) turned -= 360;
  return Object.is(turned, -0) ? 0 : turned;
}

function mapLayer(doc: StudioDoc, id: string, change: (layer: Layer) => Layer): StudioDoc {
  return { ...doc, layers: doc.layers.map((layer) => (layer.id === id ? change(layer) : layer)) };
}

export function findLayer(doc: StudioDoc, id: string | null): Layer | null {
  return (id && doc.layers.find((layer) => layer.id === id)) || null;
}

export function addLayer(doc: StudioDoc, layer: Layer): StudioDoc {
  if (doc.layers.length >= LIMITS.layers) return doc;
  return { ...doc, layers: [...doc.layers, layer] };
}

export function removeLayer(doc: StudioDoc, id: string): StudioDoc {
  return { ...doc, layers: doc.layers.filter((layer) => layer.id !== id) };
}

/** A copy of a layer, a little lower and to the right, above it. */
export function duplicateLayer(doc: StudioDoc, id: string): { doc: StudioDoc; id: string | null } {
  const at = doc.layers.findIndex((layer) => layer.id === id);
  if (at < 0 || doc.layers.length >= LIMITS.layers) return { doc, id: null };
  const copy = { ...doc.layers[at]!, id: newId(), x: doc.layers[at]!.x + 24, y: doc.layers[at]!.y + 24 };
  const layers = [...doc.layers];
  layers.splice(at + 1, 0, copy);
  return { doc: { ...doc, layers }, id: copy.id };
}

/** Moves a layer's center to `x`, `y`, kept on the screen. */
export function moveLayer(doc: StudioDoc, id: string, x: number, y: number): StudioDoc {
  return mapLayer(doc, id, (layer) => ({ ...layer, x: clamp(Math.round(x * 10) / 10, [0, STUDIO_WIDTH]), y: clamp(Math.round(y * 10) / 10, [0, STUDIO_HEIGHT]) }));
}

export function nudgeLayer(doc: StudioDoc, id: string, dx: number, dy: number): StudioDoc {
  const layer = findLayer(doc, id);
  return layer ? moveLayer(doc, id, layer.x + dx, layer.y + dy) : doc;
}

/** Sets the size of a layer: the font size of a text, the side of a sticker. */
export function resizeLayer(doc: StudioDoc, id: string, size: number): StudioDoc {
  return mapLayer(doc, id, (layer) =>
    layer.type === 'text'
      ? { ...layer, size: Math.round(clamp(size, LIMITS.textSize)) }
      : { ...layer, size: Math.round(clamp(size, LIMITS.stickerSize)) },
  );
}

export function rotateLayer(doc: StudioDoc, id: string, degrees: number): StudioDoc {
  return mapLayer(doc, id, (layer) => ({ ...layer, rotation: Math.round(normalizeAngle(degrees) * 10) / 10 }));
}

export function updateLayer(doc: StudioDoc, id: string, patch: Partial<TextLayer> | Partial<StickerLayer>): StudioDoc {
  return mapLayer(doc, id, (layer) => sanitizeLayer({ ...layer, ...patch, id: layer.id, type: layer.type } as Layer) ?? layer);
}

export type Order = 'forward' | 'backward' | 'front' | 'back';

/** Moves a layer up or down the stack. */
export function reorderLayer(doc: StudioDoc, id: string, order: Order): StudioDoc {
  const at = doc.layers.findIndex((layer) => layer.id === id);
  if (at < 0) return doc;
  const last = doc.layers.length - 1;
  const to = order === 'forward' ? Math.min(last, at + 1) : order === 'backward' ? Math.max(0, at - 1) : order === 'front' ? last : 0;
  if (to === at) return doc;
  const layers = [...doc.layers];
  const [layer] = layers.splice(at, 1);
  layers.splice(to, 0, layer!);
  return { ...doc, layers };
}

/** How close, in pixels of the screen, a dragged center snaps to the middle of the screen. */
export const SNAP = 8;

/** A dragged center, snapped to the center lines of the screen, with the lines that it met. */
export function snapCenter(x: number, y: number, threshold = SNAP): { x: number; y: number; vertical: boolean; horizontal: boolean } {
  const vertical = Math.abs(x - STUDIO_WIDTH / 2) <= threshold;
  const horizontal = Math.abs(y - STUDIO_HEIGHT / 2) <= threshold;
  return { x: vertical ? STUDIO_WIDTH / 2 : x, y: horizontal ? STUDIO_HEIGHT / 2 : y, vertical, horizontal };
}

/** A rotation snapped to the nearest quarter turn within `threshold` degrees. */
export function snapAngle(degrees: number, threshold = 4): number {
  const quarter = Math.round(degrees / 90) * 90;
  return Math.abs(degrees - quarter) <= threshold ? normalizeAngle(quarter) : normalizeAngle(degrees);
}

// ---- Undo and redo -------------------------------------------------------------------------------------

export interface History {
  past: StudioDoc[];
  present: StudioDoc;
  future: StudioDoc[];
  /** The kind of the last change, so a run of the same change (typing, a drag) undoes at once. */
  last: string | null;
}

export const HISTORY_LIMIT = 100;

export function history(doc: StudioDoc): History {
  return { past: [], present: doc, future: [], last: null };
}

/**
 * Makes `doc` the present. A change with the same `run` as the change before replaces it, so a
 * drag or a word typed is one step of undo; a change without `run` is always a step of its own.
 */
export function commit(state: History, doc: StudioDoc, run: string | null = null): History {
  if (doc === state.present) return state;
  if (run !== null && run === state.last) return { ...state, present: doc };
  return { past: [...state.past, state.present].slice(-HISTORY_LIMIT), present: doc, future: [], last: run };
}

export const canUndo = (state: History) => state.past.length > 0;
export const canRedo = (state: History) => state.future.length > 0;

export function undo(state: History): History {
  if (!canUndo(state)) return state;
  return { past: state.past.slice(0, -1), present: state.past[state.past.length - 1]!, future: [state.present, ...state.future], last: null };
}

export function redo(state: History): History {
  if (!canRedo(state)) return state;
  return { past: [...state.past, state.present], present: state.future[0]!, future: state.future.slice(1), last: null };
}

// ---- Reading and writing ---------------------------------------------------------------------------------

const COLOR = /^#[0-9a-fA-F]{6}$/;
const color = (value: unknown, fallback: string) => (typeof value === 'string' && COLOR.test(value) ? value.toUpperCase() : fallback);
const number = (value: unknown, fallback: number, range?: readonly [number, number]) => {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return range ? clamp(n, range) : n;
};
const oneOf = <T extends string>(value: unknown, options: readonly T[], fallback: T): T => (options.includes(value as T) ? (value as T) : fallback);

/** A layer as read from storage, with its values in range, or null for what is not a layer. */
export function sanitizeLayer(value: unknown): Layer | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const placed = {
    id: typeof raw.id === 'string' && raw.id.length > 0 && raw.id.length < 40 ? raw.id : newId(),
    x: number(raw.x, STUDIO_WIDTH / 2, [0, STUDIO_WIDTH]),
    y: number(raw.y, STUDIO_HEIGHT / 2, [0, STUDIO_HEIGHT]),
    rotation: normalizeAngle(number(raw.rotation, 0)),
  };
  if (raw.type === 'text') {
    return {
      type: 'text',
      ...placed,
      text: typeof raw.text === 'string' ? raw.text.replace(/\r/g, '').slice(0, LIMITS.textLength) : '',
      font: oneOf(raw.font, FONT_IDS, 'sans'),
      size: number(raw.size, 56, LIMITS.textSize),
      bold: raw.bold !== false,
      color: color(raw.color, '#2B2B2B'),
      align: oneOf(raw.align, ['left', 'center', 'right'] as const, 'center'),
      outline: raw.outline == null ? null : color(raw.outline, '#FFFFFF'),
      spacing: number(raw.spacing, 0, [0, 40]),
      maxWidth: number(raw.maxWidth, 0, [0, STUDIO_WIDTH * 2]),
    };
  }
  if (raw.type === 'sticker' && typeof raw.sticker === 'string' && raw.sticker.length < 40) {
    return {
      type: 'sticker',
      ...placed,
      sticker: raw.sticker,
      size: number(raw.size, 120, LIMITS.stickerSize),
      flip: raw.flip === true,
      tint: raw.tint == null ? null : color(raw.tint, '#D94135'),
    };
  }
  return null;
}

function sanitizeBackground(value: unknown, designs: (id: string) => number): Background {
  const fallback = emptyDoc().background;
  if (!value || typeof value !== 'object') return fallback;
  const raw = value as Record<string, unknown>;
  switch (raw.kind) {
    case 'solid':
      return { kind: 'solid', color: color(raw.color, '#F4EFE6') };
    case 'gradient':
      return { kind: 'gradient', from: color(raw.from, '#FCE3D2'), to: color(raw.to, '#C96B7A'), angle: normalizeAngle(number(raw.angle, 90)) };
    case 'pattern':
      return { kind: 'pattern', pattern: oneOf(raw.pattern, PATTERN_IDS, 'dots'), color: color(raw.color, '#FFF3E2'), ink: color(raw.ink, '#F2A65A') };
    case 'photo':
      return { kind: 'photo', zoom: number(raw.zoom, 1, LIMITS.zoom), cx: number(raw.cx, 0.5, [0, 1]), cy: number(raw.cy, 0.5, [0, 1]), color: color(raw.color, '#000000') };
    case 'design': {
      const themes = typeof raw.design === 'string' ? designs(raw.design) : 0;
      if (!themes) return fallback;
      return { kind: 'design', design: raw.design as string, theme: Number.isInteger(raw.theme) && (raw.theme as number) >= 0 && (raw.theme as number) < themes ? (raw.theme as number) : 0 };
    }
    default:
      return fallback;
  }
}

export function serialize(doc: StudioDoc): string {
  return JSON.stringify(doc);
}

/**
 * A document from its JSON, or null for a text that is not one. `designs` gives the number of
 * themes of a ready-made design, 0 for an unknown one.
 */
export function parse(text: string | null, designs: (id: string) => number): StudioDoc | null {
  if (!text) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (!raw || typeof raw !== 'object' || (raw as { version?: unknown }).version !== 1) return null;
  const value = raw as Record<string, unknown>;
  const layers = Array.isArray(value.layers) ? value.layers.map(sanitizeLayer).filter((layer): layer is Layer => layer !== null).slice(0, LIMITS.layers) : [];
  // Ids stay unique, so a selection names one layer.
  const seen = new Set<string>();
  for (const layer of layers) {
    if (seen.has(layer.id)) layer.id = newId();
    seen.add(layer.id);
  }
  return {
    version: 1,
    background: sanitizeBackground(value.background, designs),
    frame: value.frame == null ? null : oneOf(value.frame, FRAME_IDS, 'instant'),
    frameColor: color(value.frameColor, '#FFFFFF'),
    layers,
    template: typeof value.template === 'string' && value.template.length < 40 ? value.template : null,
  };
}

// ---- Free and Plus ----------------------------------------------------------------------------------------

/** What the free library offers in the Studio; GRKU Plus unlocks the rest. */
export interface Catalog {
  freeTemplates: ReadonlySet<string>;
  freeStickers: ReadonlySet<string>;
}

export type Locked =
  | { kind: 'template'; id: string }
  | { kind: 'sticker'; id: string }
  | { kind: 'font'; id: FontId }
  | { kind: 'frame'; id: FrameId }
  | { kind: 'layers' };

export const fontLocked = (font: FontId, plus: boolean) => !plus && !FREE_FONTS.includes(font);
export const stickerLocked = (id: string, catalog: Catalog, plus: boolean) => !plus && !catalog.freeStickers.has(id);
export const templateLocked = (id: string, catalog: Catalog, plus: boolean) => !plus && !catalog.freeTemplates.has(id);
export const frameLocked = (plus: boolean) => !plus;

/** Whether one more layer fits: the free library places FREE_LAYERS on a picture. */
export function canAddLayer(doc: StudioDoc, plus: boolean): boolean {
  return doc.layers.length < (plus ? LIMITS.layers : FREE_LAYERS);
}

/**
 * What of GRKU Plus a document uses, for a document made with Plus and opened without it. The
 * Studio keeps such a document as it is, and only asks for Plus to add more.
 */
export function plusItems(doc: StudioDoc, catalog: Catalog): Locked[] {
  const found: Locked[] = [];
  if (doc.template && !catalog.freeTemplates.has(doc.template)) found.push({ kind: 'template', id: doc.template });
  if (doc.frame) found.push({ kind: 'frame', id: doc.frame });
  for (const layer of doc.layers) {
    if (layer.type === 'sticker' && !catalog.freeStickers.has(layer.sticker)) found.push({ kind: 'sticker', id: layer.sticker });
    if (layer.type === 'text' && !FREE_FONTS.includes(layer.font)) found.push({ kind: 'font', id: layer.font });
  }
  if (doc.layers.length > FREE_LAYERS) found.push({ kind: 'layers' });
  return found;
}

// ---- Browser storage ----------------------------------------------------------------------------------------

export const DOC_KEY = 'grku.studio';

export function loadDoc(storage: Pick<Storage, 'getItem'> | null, designs: (id: string) => number): StudioDoc | null {
  try {
    return parse(storage?.getItem(DOC_KEY) ?? null, designs);
  } catch {
    return null;
  }
}

export function saveDoc(storage: Pick<Storage, 'setItem'> | null, doc: StudioDoc): void {
  try {
    storage?.setItem(DOC_KEY, serialize(doc));
  } catch {
    // A full storage keeps the document for this visit.
  }
}
