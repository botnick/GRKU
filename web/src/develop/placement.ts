/**
 * Orientation and placement on a developed picture: the planes keep the stored (sensor)
 * orientation, and `turns` quarter turns clockwise show them upright, as EXIF Orientation does.
 */
import type { DevelopSettings, Margins } from './settings';

/** A canvas transform (a, b, c, d, e, f). */
export type Matrix = [number, number, number, number, number, number];

/** The transform that draws an upright picture onto a stored canvas of `width` x `height`. */
export function uprightToStored(turns: number, width: number, height: number): Matrix {
  switch (turns & 3) {
    case 1:
      return [0, -1, 1, 0, 0, height];
    case 2:
      return [-1, 0, 0, -1, width, height];
    case 3:
      return [0, 1, -1, 0, width, 0];
    default:
      return [1, 0, 0, 1, 0, 0];
  }
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A rectangle of the upright picture (`width` x `height`, upright) in stored coordinates. */
export function storedRect(turns: number, width: number, height: number, r: Rect): Rect {
  const point = (u: number, v: number): [number, number] => {
    switch (turns & 3) {
      case 1:
        return [v, width - u];
      case 2:
        return [width - u, height - v];
      case 3:
        return [height - v, u];
      default:
        return [u, v];
    }
  };
  const [x0, y0] = point(r.x, r.y), [x1, y1] = point(r.x + r.w, r.y + r.h);
  return { x: Math.min(x0, x1), y: Math.min(y0, y1), w: Math.abs(x1 - x0), h: Math.abs(y1 - y0) };
}

/** The margins of the upright picture (left, top, right, bottom) from the stored ones. */
export function uprightMargins(stored: Margins, turns: number): Margins {
  return [0, 1, 2, 3].map((side) => stored[(side - (turns & 3) + 4) % 4]!) as Margins;
}

/** The upright size of a stored picture. */
export function canvasSizeOf(picture: { width: number; height: number; turns: number }): { width: number; height: number } {
  return picture.turns & 1 ? { width: picture.height, height: picture.width } : { width: picture.width, height: picture.height };
}

export interface CreditPlace {
  /** The font size in pixels. */
  size: number;
  /** The room around the text, for its shadow. */
  pad: number;
  /** The anchor: the left, middle, or right of the text at x; the middle of its line at y. */
  x: number;
  y: number;
  align: 'left' | 'center' | 'right';
  color: string;
  shadow: boolean;
}

/**
 * Where the credit of a free download goes on the upright picture (`width` x `height` with its
 * border of `margins`, upright): small, in the border under the picture when it has one (centred
 * on Instant), else at a bottom corner of the picture away from the date.
 */
export function creditPlacement(settings: DevelopSettings, width: number, height: number, margins: Margins): CreditPlace {
  const short = Math.min(width, height);
  const [left, , right, bottom] = margins;
  if (settings.border.style > 0 && bottom > 0) {
    const size = Math.max(10, Math.min(Math.round(bottom * 0.34), Math.round(short * 0.018)));
    const black = settings.border.color === 1;
    const instant = settings.border.style === 3;
    return {
      size,
      pad: Math.round(size * 0.4),
      x: instant ? width / 2 : width - right,
      y: height - bottom / 2,
      align: instant ? 'center' : 'right',
      color: black ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.5)',
      shadow: false,
    };
  }
  const size = Math.max(11, Math.round(short * 0.016));
  const edge = Math.round(short * 0.025);
  // The date takes the bottom left at Bottom Left and Bottom Split: the credit goes to the top.
  const dateLeft = settings.date.style > 0 && (settings.date.corner === 1 || settings.date.corner === 3);
  return {
    size,
    pad: Math.round(size * 0.6),
    x: edge + left,
    y: dateLeft ? edge + size / 2 : height - bottom - edge - size / 2,
    align: 'left',
    color: 'rgba(255,255,255,0.82)',
    shadow: true,
  };
}
