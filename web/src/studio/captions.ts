/**
 * Where each ready-made design draws its text, so the Studio lifts the text off the picture as a
 * layer of its own: the baseline at `y` (the top of the letters for the pixel font), centered on
 * `x`, in the colors of the design's theme. A test checks them against the drawing of each design.
 */
import { findDesign } from '../shutdownDesigns';

export interface Caption {
  x: number;
  y: number;
  size: number;
  weight: number;
  font: 'sans' | 'condensed' | 'mono' | 'pixel';
  color: string;
  maxWidth: number;
  /** Extra space between the characters, in pixels. */
  spacing?: number;
  /** The turn of the text in radians, around its center. */
  rotation?: number;
}

type Theme = Readonly<Record<string, unknown>> & { ink?: string };

const CAPTIONS: Readonly<Record<string, (theme: Theme) => Caption>> = {
  sunset: (theme: Theme) => ({ x: 360, y: 104, size: 58, weight: 800, font: 'sans', color: String(theme.ink), maxWidth: 620 }),
  film: (theme: Theme) => ({ x: 486, y: 128, size: 52, weight: 700, font: 'condensed', color: String(theme.ink), maxWidth: 380 }),
  moon: (theme: Theme) => ({ x: 360, y: 316, size: 50, weight: 800, font: 'sans', color: String(theme.ink), maxWidth: 600 }),
  cat: (theme: Theme) => ({ x: 360, y: 96, size: 50, weight: 800, font: 'sans', color: String(theme.ink), maxWidth: 400 }),
  flowers: (theme: Theme) => ({ x: 360, y: 108, size: 54, weight: 800, font: 'sans', color: String(theme.ink), maxWidth: 620 }),
  receipt: () => ({ x: 360, y: 162, size: 38, weight: 800, font: 'sans', color: '#2B2B2B', maxWidth: 226 }),
  // The text sits on the frame, which turns by -0.07 around 346, 168; its baseline is 122 below.
  polaroid: (theme: Theme) => ({ x: 346 + 122 * Math.sin(0.07), y: 168 + 122 * Math.cos(0.07), size: 26, weight: 500, font: 'sans', color: String(theme.ink), maxWidth: 224, rotation: -0.07 }),
  wave: (theme: Theme) => ({ x: 360, y: 256, size: 92, weight: 800, font: 'sans', color: String(theme.ink), maxWidth: 640 }),
  sun: (theme: Theme) => ({ x: 360, y: 316, size: 30, weight: 500, font: 'sans', color: String(theme.ink), maxWidth: 560, spacing: 10 }),
  pixel: (theme: Theme) => ({ x: 360, y: 134, size: 70, weight: 400, font: 'pixel', color: String(theme.ink), maxWidth: 640 }),
  clouds: (theme: Theme) => ({ x: 360, y: 96, size: 56, weight: 800, font: 'sans', color: String(theme.ink), maxWidth: 560 }),
};

/** The caption of a design in `theme`, or undefined for a design without one. */
export function captionOf(id: string, theme: number): Caption | undefined {
  const design = findDesign(id);
  const make = CAPTIONS[id];
  if (!design || !make) return undefined;
  return make(design.themes[theme] ?? design.themes[0]!);
}
