/**
 * Draws a Studio document on a canvas of 720 by 480: the background (in the window of a frame,
 * when there is one), the frame, and the layers from the bottom up.
 */
import { DESIGNS, drawDesign, drawPixelText, findDesign, pixelBlocks } from '../shutdownDesigns';
import { cssFont } from './fonts';
import {
  fittedSize,
  layerBox,
  LINE_HEIGHT,
  pixelBlock,
  STUDIO_HEIGHT as H,
  STUDIO_WIDTH as W,
  textLines,
  type Background,
  type FrameId,
  type Measure,
  type PatternId,
  type Rect,
  type ImageLayer,
  type StickerLayer,
  type StudioDoc,
  type TextLayer,
} from './model';
import { circle, heart, rect, star } from './shapes';
import { drawSticker, findSticker } from './stickers';

export type Context = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

/** A decoded photo: an `ImageBitmap`, an image, or a canvas. */
export type Photo = CanvasImageSource & { width: number; height: number };

export interface Assets {
  photo: Photo | null;
  /** The pictures of the picture layers, by id. A layer whose picture is missing draws a gray box. */
  images?: ReadonlyMap<string, Photo>;
}

// ---- Measuring ---------------------------------------------------------------------------------------------

function graphemes(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].map((part) => part.segment);
  }
  return Array.from(text);
}

/** A measure of the lines of text layers on `context`, cached for the drags that measure often. */
export function canvasMeasure(context: Context): Measure {
  const cache = new Map<string, number>();
  return (layer, line, size) => {
    if (layer.font === 'pixel') return pixelBlocks(line) * pixelBlock(size);
    const font = cssFont(layer, size);
    const key = `${font}|${layer.spacing}|${line}`;
    let width = cache.get(key);
    if (width === undefined) {
      context.font = font;
      width = layer.spacing ? graphemes(line).reduce((sum, part) => sum + context.measureText(part).width, 0) + layer.spacing * Math.max(0, graphemes(line).length - 1) : context.measureText(line).width;
      if (cache.size > 500) cache.clear();
      cache.set(key, width);
    }
    return width;
  };
}

// ---- Backgrounds -------------------------------------------------------------------------------------------

function patternPath(pattern: PatternId): { d: string; step: number; offset: boolean } | null {
  switch (pattern) {
    case 'dots':
      return { d: circle(0, 0, 6), step: 36, offset: true };
    case 'hearts':
      return { d: heart(0, 0, 11), step: 52, offset: true };
    case 'stars':
      return { d: star(0, 0, 5, 11, 4.6), step: 56, offset: true };
    case 'checker':
      return { d: rect(0, 0, 40, 40), step: 80, offset: true };
    default:
      return null;
  }
}

function drawPattern(context: Context, area: Rect, pattern: PatternId, ink: string) {
  context.fillStyle = ink;
  context.strokeStyle = ink;
  const shape = patternPath(pattern);
  if (shape) {
    const path = new Path2D(shape.d);
    let row = 0;
    for (let y = area.y + shape.step / 4; y < area.y + area.h + shape.step; y += shape.step / (shape.offset ? 2 : 1), row++) {
      const shift = shape.offset && row % 2 ? shape.step / 2 : 0;
      for (let x = area.x + shape.step / 4 + shift - shape.step; x < area.x + area.w + shape.step; x += shape.step) {
        context.save();
        context.translate(x, y);
        context.fill(path);
        context.restore();
      }
    }
    return;
  }
  switch (pattern) {
    case 'stripes':
      context.save();
      context.translate(area.x + area.w / 2, area.y + area.h / 2);
      context.rotate(-Math.PI / 4);
      for (let x = -area.w; x < area.w; x += 40) context.fillRect(x, -area.w, 18, area.w * 2);
      context.restore();
      break;
    case 'grid':
      for (let x = area.x + 16; x < area.x + area.w; x += 32) context.fillRect(x, area.y, 2, area.h);
      for (let y = area.y + 16; y < area.y + area.h; y += 32) context.fillRect(area.x, y, area.w, 2);
      break;
    case 'waves':
      context.lineWidth = 5;
      context.lineCap = 'round';
      for (let y = area.y + 20; y < area.y + area.h + 20; y += 40) {
        context.beginPath();
        for (let x = area.x - 10; x <= area.x + area.w + 10; x += 6) {
          const wy = y + Math.sin(((x - area.x) / 64) * Math.PI * 2) * 7;
          if (x === area.x - 10) context.moveTo(x, wy);
          else context.lineTo(x, wy);
        }
        context.stroke();
      }
      break;
    case 'gingham':
      context.save();
      context.globalAlpha *= 0.45;
      for (let x = area.x; x < area.x + area.w; x += 48) context.fillRect(x, area.y, 24, area.h);
      for (let y = area.y; y < area.y + area.h; y += 48) context.fillRect(area.x, y, area.w, 24);
      context.restore();
      break;
    default:
      break;
  }
}

/** The part of a photo that the background shows: cover-cropped to `area`, `zoom` times closer around `cx`, `cy`. */
export function photoCrop(photo: { width: number; height: number }, area: { w: number; h: number }, zoom: number, cx: number, cy: number) {
  const wide = photo.width * area.h > photo.height * area.w;
  let w = wide ? (photo.height * area.w) / area.h : photo.width;
  let h = wide ? photo.height : (photo.width * area.h) / area.w;
  w /= zoom;
  h /= zoom;
  const x = Math.min(photo.width - w, Math.max(0, cx * photo.width - w / 2));
  const y = Math.min(photo.height - h, Math.max(0, cy * photo.height - h / 2));
  return { x, y, w, h };
}

export function drawBackground(context: Context, background: Background, area: Rect, assets: Assets) {
  context.save();
  try {
    context.beginPath();
    context.rect(area.x, area.y, area.w, area.h);
    context.clip();
    switch (background.kind) {
      case 'solid':
        context.fillStyle = background.color;
        context.fillRect(area.x, area.y, area.w, area.h);
        break;
      case 'gradient': {
        const a = (background.angle * Math.PI) / 180;
        const half = (Math.abs(area.w * Math.cos(a)) + Math.abs(area.h * Math.sin(a))) / 2;
        const cx = area.x + area.w / 2;
        const cy = area.y + area.h / 2;
        const gradient = context.createLinearGradient(cx - Math.cos(a) * half, cy - Math.sin(a) * half, cx + Math.cos(a) * half, cy + Math.sin(a) * half);
        gradient.addColorStop(0, background.from);
        gradient.addColorStop(1, background.to);
        context.fillStyle = gradient;
        context.fillRect(area.x, area.y, area.w, area.h);
        break;
      }
      case 'pattern':
        context.fillStyle = background.color;
        context.fillRect(area.x, area.y, area.w, area.h);
        drawPattern(context, area, background.pattern, background.ink);
        break;
      case 'photo': {
        context.fillStyle = background.color;
        context.fillRect(area.x, area.y, area.w, area.h);
        const photo = assets.photo;
        if (photo && photo.width > 0 && photo.height > 0) {
          const crop = photoCrop(photo, area, background.zoom, background.cx, background.cy);
          context.imageSmoothingQuality = 'high';
          context.drawImage(photo, crop.x, crop.y, crop.w, crop.h, area.x, area.y, area.w, area.h);
        }
        break;
      }
      case 'design': {
        const scale = Math.max(area.w / W, area.h / H);
        context.translate(area.x + (area.w - W * scale) / 2, area.y + (area.h - H * scale) / 2);
        context.scale(scale, scale);
        drawDesign(context, { id: findDesign(background.design)?.id ?? DESIGNS[0].id, theme: background.theme, text: '' });
        break;
      }
    }
  } finally {
    context.restore();
  }
}

// ---- Frames ------------------------------------------------------------------------------------------------------

export interface Frame {
  id: FrameId;
  /** The color that the frame starts with. */
  color: string;
  /** Where the background shows. */
  window: Rect;
  paint: (context: Context, color: string) => void;
}

/** Fills the screen outside `hole` (a path of the shapes builders). */
function around(context: Context, hole: string, color: string, outer = rect(0, 0, W, H)) {
  context.fillStyle = color;
  context.fill(new Path2D(outer + hole), 'evenodd');
}

function edgeText(context: Context, text: string, x: number, y: number, size: number, color: string) {
  context.font = `500 ${size}px "JetBrains Mono", monospace`;
  context.fillStyle = color;
  context.textAlign = 'left';
  context.textBaseline = 'middle';
  context.fillText(text, x, y);
}

export const FRAMES: readonly Frame[] = [
  {
    id: 'instant',
    color: '#F4A6B8',
    window: { x: 92, y: 42, w: 536, h: 336 },
    paint(context, color) {
      around(context, rect(68, 18, 584, 446), color);
      context.save();
      context.globalAlpha = 0.14;
      context.fillStyle = '#000000';
      // Only the edge of the shadow that the card leaves uncovered, never over the window.
      context.fill(new Path2D(rect(72, 26, 584, 446) + rect(68, 18, 584, 446)), 'evenodd');
      context.restore();
      around(context, rect(92, 42, 536, 336), '#FFFDF8', rect(68, 18, 584, 446));
    },
  },
  {
    id: 'film',
    color: '#F4EFE6',
    window: { x: 26, y: 72, w: 668, h: 336 },
    paint(context, color) {
      around(context, rect(26, 72, 668, 336, 6), '#161616');
      context.fillStyle = color;
      for (let x = 18; x < W; x += 34) {
        context.fill(new Path2D(rect(x, 20, 18, 24, 4)));
        context.fill(new Path2D(rect(x, H - 44, 18, 24, 4)));
      }
      edgeText(context, 'GRKU 400', 40, 58, 14, '#F2B134');
      edgeText(context, '24  ▸  24A', 520, 58, 14, '#F2B134');
      edgeText(context, 'GRKU 400', 360, H - 58, 14, '#F2B134');
    },
  },
  {
    id: 'border',
    color: '#FFFFFF',
    window: { x: 28, y: 28, w: 664, h: 424 },
    paint(context, color) {
      around(context, rect(28, 28, 664, 424, 26), color);
    },
  },
  {
    id: 'stamp',
    color: '#D7EAF5',
    window: { x: 58, y: 54, w: 604, h: 372 },
    paint(context, color) {
      // The paper of the stamp, its edge cut in a row of holes.
      around(context, rect(34, 30, 652, 420), color);
      around(context, rect(58, 54, 604, 372), '#FFFDF8', rect(34, 30, 652, 420));
      context.fillStyle = color;
      for (let x = 34; x <= 686; x += 652 / 26) {
        context.fill(new Path2D(circle(x, 30, 7) + circle(x, 450, 7)));
      }
      for (let y = 30; y <= 450; y += 420 / 17) {
        context.fill(new Path2D(circle(34, y, 7) + circle(686, y, 7)));
      }
    },
  },
  {
    id: 'tape',
    color: '#F3E8D2',
    window: { x: 76, y: 56, w: 568, h: 364 },
    paint(context, color) {
      around(context, rect(56, 36, 608, 404), color);
      context.save();
      context.globalAlpha = 0.16;
      context.fillStyle = '#000000';
      context.fill(new Path2D(rect(62, 46, 608, 404) + rect(56, 36, 608, 404)), 'evenodd');
      context.restore();
      around(context, rect(76, 56, 568, 364), '#FFFFFF', rect(56, 36, 608, 404));
      for (const [x, y, angle] of [
        [84, 44, -0.6],
        [636, 44, 0.6],
      ] as const) {
        context.save();
        context.translate(x, y);
        context.rotate(angle);
        context.globalAlpha = 0.82;
        context.fillStyle = '#F6E3A1';
        context.fillRect(-60, -18, 120, 36);
        context.restore();
      }
    },
  },
];

export function findFrame(id: FrameId | null): Frame | null {
  return (id && FRAMES.find((frame) => frame.id === id)) || null;
}

// ---- Layers -------------------------------------------------------------------------------------------------------

export function drawText(context: Context, layer: TextLayer, measure: Measure) {
  if (!layer.text.trim()) return;
  const size = fittedSize(layer, measure);
  const { w, h } = layerBox(layer, measure);
  const lines = textLines(layer);
  context.save();
  context.translate(layer.x, layer.y);
  context.rotate((layer.rotation * Math.PI) / 180);
  const left = (width: number) => (layer.align === 'left' ? -w / 2 : layer.align === 'right' ? w / 2 - width : -width / 2);
  if (layer.font === 'pixel') {
    const block = pixelBlock(size);
    lines.forEach((line, i) => {
      const width = pixelBlocks(line) * block;
      drawPixelText(context, line, Math.round(left(width)), Math.round(-h / 2 + i * 9 * block), block, layer.color);
    });
    context.restore();
    return;
  }
  context.font = cssFont(layer, size);
  context.textAlign = 'left';
  context.textBaseline = 'alphabetic';
  context.lineJoin = 'round';
  const lineHeight = size * LINE_HEIGHT;
  lines.forEach((line, i) => {
    const baseline = -h / 2 + (i + 0.5) * lineHeight + size * 0.35;
    const width = measure(layer, line, size);
    let x = left(width);
    const parts = layer.spacing ? graphemes(line) : [line];
    for (const part of parts) {
      if (layer.outline) {
        context.strokeStyle = layer.outline;
        context.lineWidth = Math.max(2, size * 0.16);
        context.strokeText(part, x, baseline);
      }
      context.fillStyle = layer.color;
      context.fillText(part, x, baseline);
      if (layer.spacing) {
        context.font = cssFont(layer, size);
        x += context.measureText(part).width + layer.spacing;
      }
    }
  });
  context.restore();
}

export function drawStickerLayer(context: Context, layer: StickerLayer) {
  const item = findSticker(layer.sticker);
  if (!item) return;
  context.save();
  context.translate(layer.x, layer.y);
  context.rotate((layer.rotation * Math.PI) / 180);
  const scale = layer.size / 100;
  context.scale(layer.flip ? -scale : scale, scale);
  context.translate(-50, -50);
  drawSticker(context, item, layer.tint);
  context.restore();
}

export function drawImageLayer(context: Context, layer: ImageLayer, image: Photo | undefined) {
  const w = layer.aspect >= 1 ? layer.size : layer.size * layer.aspect;
  const h = layer.aspect >= 1 ? layer.size / layer.aspect : layer.size;
  context.save();
  context.translate(layer.x, layer.y);
  context.rotate((layer.rotation * Math.PI) / 180);
  if (layer.flip) context.scale(-1, 1);
  if (image) {
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, -w / 2, -h / 2, w, h);
  } else {
    context.fillStyle = 'rgba(128, 128, 128, 0.35)';
    context.fillRect(-w / 2, -h / 2, w, h);
  }
  context.restore();
}

/** Draws `doc` over the whole context, in the coordinates of 720 by 480. */
export function renderDoc(context: Context, doc: StudioDoc, assets: Assets, measure: Measure = canvasMeasure(context)) {
  context.save();
  try {
    context.globalAlpha = 1;
    context.fillStyle = '#000000';
    context.fillRect(0, 0, W, H);
    const frame = findFrame(doc.frame);
    drawBackground(context, doc.background, frame ? frame.window : { x: 0, y: 0, w: W, h: H }, assets);
    if (frame) frame.paint(context, doc.frameColor);
    for (const layer of doc.layers) {
      if (layer.type === 'text') drawText(context, layer, measure);
      else if (layer.type === 'image') drawImageLayer(context, layer, assets.images?.get(layer.image));
      else drawStickerLayer(context, layer);
    }
  } finally {
    context.restore();
  }
}
