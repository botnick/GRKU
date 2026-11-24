/**
 * The ready-made designs of Shutdown Screen: flat pictures that the page draws on a canvas of
 * 720 by 480, each with a line of text and a few color themes. They use no image files and only
 * the fonts that the site serves, so the preview and the file for the card are the same picture.
 * The camera draws its shot counts over y 340 to 380 and the firmware version at the bottom
 * right, so what matters stays above y 320.
 */

export const DESIGN_WIDTH = 720;
export const DESIGN_HEIGHT = 480;
/** The most characters of the text of a design. */
export const DESIGN_TEXT_MAX = 20;

/** A 2D context of a canvas element or of an `OffscreenCanvas`. */
export type DesignContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

/** The fallbacks after the Latin fonts: Thai and the CJK fonts of the site, then the system. */
const OTHER = `"IBM Plex Sans Thai", "Noto Sans JP", "Noto Sans SC", "Noto Sans TC", "Noto Sans KR", system-ui, sans-serif`;
const SANS = `Inter, ${OTHER}`;
const CONDENSED = `"IBM Plex Sans Condensed", ${SANS}`;
const MONO = `"JetBrains Mono", ${OTHER}`;

/** The faces that the designs use, as `FontFace` load specs, so the page loads them before it draws. */
export const DESIGN_FONTS = [
  `800 40px Inter`,
  `700 40px Inter`,
  `500 40px Inter`,
  `700 40px "IBM Plex Sans Condensed"`,
  `500 40px "JetBrains Mono"`,
  `400 40px "JetBrains Mono"`,
] as const;

interface Theme {
  /** Two or three colors that stand for the theme on its swatch. */
  swatch: readonly string[];
}

export interface Design {
  id: string;
  /** The text of the design until the user writes another. */
  text: string;
  /** The swatch colors of each theme; the first theme is the default. */
  swatches: readonly (readonly string[])[];
  draw: (context: DesignContext, theme: number, text: string) => void;
  /** The colors of each theme, by name, for GRKU Studio (`studio/captions.ts`). */
  themes: readonly Readonly<Record<string, unknown>>[];
}

function design<T extends Theme>(spec: {
  id: string;
  text: string;
  themes: readonly T[];
  draw: (context: DesignContext, theme: T, text: string) => void;
}): Design {
  const pick = (theme: number) => spec.themes[theme] ?? spec.themes[0]!;
  return {
    id: spec.id,
    text: spec.text,
    swatches: spec.themes.map((theme) => theme.swatch),
    draw: (context, theme, text) => spec.draw(context, pick(theme), text),
    themes: spec.themes as unknown as readonly Readonly<Record<string, unknown>>[],
  };
}

// Drawing helpers.

function fill(context: DesignContext, color: string) {
  context.fillStyle = color;
  context.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
}

function circle(context: DesignContext, x: number, y: number, r: number, color: string) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, r, 0, Math.PI * 2);
  context.fill();
}

function ellipse(context: DesignContext, x: number, y: number, rx: number, ry: number, color: string, rotation = 0) {
  context.fillStyle = color;
  context.beginPath();
  context.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
  context.fill();
}

function roundRect(context: DesignContext, x: number, y: number, w: number, h: number, r: number, color: string) {
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
  context.fill();
}

function polygon(context: DesignContext, points: readonly number[], color: string) {
  context.fillStyle = color;
  context.beginPath();
  for (let i = 0; i + 1 < points.length; i += 2) {
    const [x = 0, y = 0] = points.slice(i, i + 2);
    if (i === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
  context.fill();
}

function stroke(context: DesignContext, color: string, width: number, path: (context: DesignContext) => void) {
  context.strokeStyle = color;
  context.lineWidth = width;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.beginPath();
  path(context);
  context.stroke();
}

/** A four-pointed sparkle. */
function sparkle(context: DesignContext, x: number, y: number, r: number, color: string) {
  const w = r * 0.28;
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(x, y - r);
  context.quadraticCurveTo(x + w, y - w, x + r, y);
  context.quadraticCurveTo(x + w, y + w, x, y + r);
  context.quadraticCurveTo(x - w, y + w, x - r, y);
  context.quadraticCurveTo(x - w, y - w, x, y - r);
  context.fill();
}

/** A sine wave from `x0` to `x1` around `y`. */
function wave(context: DesignContext, x0: number, x1: number, y: number, amplitude: number, period: number) {
  context.moveTo(x0, y);
  for (let x = x0; x <= x1; x += 4) context.lineTo(x, y + Math.sin(((x - x0) / period) * Math.PI * 2) * amplitude);
}

/** The same numbers on every run, for the stars and the bar code. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The characters of `text` as the reader sees them, so Thai marks stay on their letters. */
function graphemes(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].map((part) => part.segment);
  }
  return Array.from(text);
}

interface TextStyle {
  weight: number;
  size: number;
  family: string;
  color: string;
  /** The widest the text gets; a longer text gets smaller, down to `min`. */
  maxWidth: number;
  min?: number;
  align?: 'left' | 'center' | 'right';
  /** Extra space between the characters, in pixels at `size`. */
  spacing?: number;
}

/** Draws `value` with its baseline at `y`, smaller where it would be wider than `maxWidth`. */
function text(context: DesignContext, value: string, x: number, y: number, style: TextStyle) {
  if (!value) return;
  const { weight, family, color, maxWidth, min = 16, align = 'center', spacing = 0 } = style;
  const parts = spacing ? graphemes(value) : [value];
  let size = style.size;
  const width = () => {
    context.font = `${weight} ${size}px ${family}`;
    const gap = (spacing * size) / style.size;
    return parts.reduce((sum, part) => sum + context.measureText(part).width, 0) + gap * (parts.length - 1);
  };
  let total = width();
  while (total > maxWidth && size > min) {
    size = Math.max(min, Math.floor(size * 0.94));
    total = width();
  }
  context.fillStyle = color;
  context.textBaseline = 'alphabetic';
  if (!spacing) {
    context.textAlign = align;
    context.fillText(value, x, y, maxWidth);
    return;
  }
  const gap = (spacing * size) / style.size;
  let left = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  context.textAlign = 'left';
  for (const part of parts) {
    context.fillText(part, left, y);
    left += context.measureText(part).width + gap;
  }
}

// A pixel font of 5 by 7 for the retro design.

const GLYPHS: Record<string, string> = {
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#',
  B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.',
  D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
  E: '#####|#....|#....|####.|#....|#....|#####',
  F: '#####|#....|#....|####.|#....|#....|#....',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.####',
  H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '.###.|..#..|..#..|..#..|..#..|..#..|.###.',
  J: '..###|...#.|...#.|...#.|...#.|#..#.|.##..',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#',
  L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#',
  N: '#...#|#...#|##..#|#.#.#|#..##|#...#|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
  P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#',
  R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.####|#....|#....|.###.|....#|....#|####.',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.',
  X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
  Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  '0': '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.',
  '1': '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
  '2': '.###.|#...#|....#|...#.|..#..|.#...|#####',
  '3': '####.|....#|....#|.###.|....#|....#|####.',
  '4': '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.',
  '5': '#####|#....|####.|....#|....#|#...#|.###.',
  '6': '.###.|#....|#....|####.|#...#|#...#|.###.',
  '7': '#####|....#|...#.|..#..|.#...|.#...|.#...',
  '8': '.###.|#...#|#...#|.###.|#...#|#...#|.###.',
  '9': '.###.|#...#|#...#|.####|....#|....#|.###.',
  ' ': '.....|.....|.....|.....|.....|.....|.....',
  '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..',
  '?': '.###.|#...#|....#|...#.|..#..|.....|..#..',
  '.': '.....|.....|.....|.....|.....|.....|..#..',
  ',': '.....|.....|.....|.....|.....|..#..|.#...',
  '-': '.....|.....|.....|.###.|.....|.....|.....',
  "'": '..#..|..#..|.#...|.....|.....|.....|.....',
  ':': '.....|..#..|.....|.....|.....|..#..|.....',
  '/': '....#|....#|...#.|..#..|.#...|#....|#....',
  '+': '.....|..#..|..#..|#####|..#..|..#..|.....',
  '>': '.#...|..#..|...#.|....#|...#.|..#..|.#...',
};

/** Whether the pixel font has each character of `value`, in capitals. */
export function pixelFontHas(value: string): boolean {
  return [...value.toUpperCase()].every((char) => char in GLYPHS);
}

/** The width of `value` in the pixel font, in blocks. */
export function pixelBlocks(value: string): number {
  return Math.max(0, [...value].length * 6 - 1);
}

/** Draws `value` in the pixel font, its top left at `x`, `y`, in blocks of `size`; a character the font lacks draws as `?`. */
export function drawPixelText(context: DesignContext, value: string, x: number, y: number, size: number, color: string) {
  let left = x;
  context.fillStyle = color;
  for (const char of value.toUpperCase()) {
    const rows = (GLYPHS[char] ?? GLYPHS['?']!).split('|');
    rows.forEach((row, r) => {
      for (let c = 0; c < 5; c++) if (row[c] === '#') context.fillRect(left + c * size, y + r * size, size, size);
    });
    left += 6 * size;
  }
}

/** Draws `value` in the pixel font, centered on `x`, its top at `y`, in blocks of up to `block`. */
function pixelText(context: DesignContext, value: string, x: number, y: number, block: number, maxWidth: number, color: string) {
  const chars = [...value.toUpperCase()];
  const fit = Math.floor(maxWidth / Math.max(1, chars.length * 6 - 1));
  const size = Math.max(2, Math.min(block, fit));
  const width = (chars.length * 6 - 1) * size;
  let left = Math.round(x - width / 2);
  context.fillStyle = color;
  for (const char of chars) {
    const rows = (GLYPHS[char] ?? GLYPHS['?']!).split('|');
    rows.forEach((row, r) => {
      for (let c = 0; c < 5; c++) if (row[c] === '#') context.fillRect(left + c * size, y + r * size, size, size);
    });
    left += 6 * size;
  }
}

const HEART = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
const HEART_EMPTY = ['.##.##.', '#..#..#', '#.....#', '.#...#.', '..#.#..', '...#...'];

function pixelShape(context: DesignContext, rows: readonly string[], x: number, y: number, block: number, color: string) {
  context.fillStyle = color;
  rows.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) if (row[c] === '#') context.fillRect(x + c * block, y + r * block, block, block);
  });
}

// The designs.

const sunset = design({
  id: 'sunset',
  text: 'See you soon',
  themes: [
    { swatch: ['#FCE3D2', '#F4A07A', '#C96B7A'], sky: '#FCE3D2', sun: '#F7A47C', hills: ['#EE9A86', '#D27A82', '#9A5E7E'], ink: '#8A4F72' },
    { swatch: ['#E8E2F7', '#F6B3C4', '#7D6CC4'], sky: '#E8E2F7', sun: '#F6B3C4', hills: ['#BDB0EA', '#9686D6', '#6458AE'], ink: '#5A4E9C' },
    { swatch: ['#E2F3EA', '#FFD08A', '#4E9C84'], sky: '#E2F3EA', sun: '#FFCF86', hills: ['#A6DCC0', '#6DBA9C', '#3F8573'], ink: '#2F6E5F' },
    { swatch: ['#2A2B4F', '#F4A259', '#5A4A86'], sky: '#2A2B4F', sun: '#F4A259', hills: ['#54467F', '#3D3263', '#251E40'], ink: '#F8E3C4' },
  ],
  draw(context, theme, value) {
    fill(context, theme.sky);
    circle(context, 360, 262, 118, theme.sun);
    // The stripes of a retro sun.
    context.fillStyle = theme.sky;
    for (let i = 0; i < 4; i++) context.fillRect(230, 214 + i * 20, 260, 3 + i * 2.5);
    const hill = (color: string, path: (c: DesignContext) => void) => {
      context.fillStyle = color;
      context.beginPath();
      path(context);
      context.lineTo(DESIGN_WIDTH, DESIGN_HEIGHT);
      context.lineTo(0, DESIGN_HEIGHT);
      context.closePath();
      context.fill();
    };
    hill(theme.hills[0]!, (c) => {
      c.moveTo(0, 278);
      c.quadraticCurveTo(170, 205, 360, 270);
      c.quadraticCurveTo(560, 330, 720, 240);
    });
    hill(theme.hills[1]!, (c) => {
      c.moveTo(0, 330);
      c.quadraticCurveTo(220, 262, 430, 318);
      c.quadraticCurveTo(590, 356, 720, 300);
    });
    hill(theme.hills[2]!, (c) => {
      c.moveTo(0, 392);
      c.quadraticCurveTo(320, 320, 720, 372);
    });
    // Two birds.
    stroke(context, theme.ink, 4, (c) => {
      for (const [x, y, s] of [
        [512, 148, 1],
        [548, 128, 0.8],
      ] as const) {
        c.moveTo(x - 14 * s, y - 6 * s);
        c.quadraticCurveTo(x - 6 * s, y - 8 * s, x, y);
        c.quadraticCurveTo(x + 6 * s, y - 8 * s, x + 14 * s, y - 6 * s);
      }
    });
    text(context, value, 360, 104, { weight: 800, size: 58, family: SANS, color: theme.ink, maxWidth: 620 });
  },
});

const film = design({
  id: 'film',
  text: "That's a wrap",
  themes: [
    { swatch: ['#F4EAD5', '#F2B134', '#D7263D'], bg: '#F4EAD5', can: '#2B2A29', cap: '#1B1A19', label: '#F2B134', band: '#D7263D', labelInk: '#2B2A29', bandInk: '#FFF6E3', strip: '#3A2E26', frame: '#7A5A3A', ink: '#2B2A29' },
    { swatch: ['#E3EFEA', '#2A9D8F', '#F4D35E'], bg: '#E3EFEA', can: '#26302E', cap: '#161D1C', label: '#2A9D8F', band: '#F4D35E', labelInk: '#FFFFFF', bandInk: '#26302E', strip: '#2E3533', frame: '#55706A', ink: '#1F4E47' },
    { swatch: ['#FBE4E0', '#E63946', '#1D3557'], bg: '#FBE4E0', can: '#1D3557', cap: '#122339', label: '#E63946', band: '#F1FAEE', labelInk: '#FFFFFF', bandInk: '#1D3557', strip: '#2B2B33', frame: '#6E4C5A', ink: '#1D3557' },
    { swatch: ['#1E1E24', '#F2B134', '#FFFFFF'], bg: '#1E1E24', can: '#3A3A44', cap: '#2C2C34', label: '#F2B134', band: '#1E1E24', labelInk: '#1E1E24', bandInk: '#F2B134', strip: '#0C0C10', frame: '#4A3A28', ink: '#F7F1E3' },
  ],
  draw(context, theme, value) {
    fill(context, theme.bg);
    // The film that comes out of the canister, with its sprocket holes and frames.
    const top = 178;
    const bottom = 272;
    context.fillStyle = theme.strip;
    context.fillRect(270, top, 380, bottom - top);
    roundRect(context, 600, top, 96, 50, 22, theme.strip);
    context.fillRect(600, top, 40, 50);
    for (let x = 300; x + 92 < 610; x += 108) roundRect(context, x, top + 22, 92, bottom - top - 44, 6, theme.frame);
    for (let x = 290; x < 650; x += 24) {
      roundRect(context, x, top + 7, 12, 10, 2.5, theme.bg);
      roundRect(context, x, bottom - 17, 12, 10, 2.5, theme.bg);
    }
    // The canister.
    roundRect(context, 172, 52, 56, 30, 6, theme.cap);
    roundRect(context, 98, 78, 204, 26, 10, theme.cap);
    roundRect(context, 98, 290, 204, 26, 10, theme.cap);
    context.fillStyle = theme.can;
    context.fillRect(110, 100, 180, 194);
    context.fillStyle = theme.label;
    context.fillRect(110, 116, 180, 162);
    context.fillStyle = theme.band;
    context.fillRect(110, 198, 180, 40);
    text(context, 'GR', 200, 178, { weight: 700, size: 54, family: CONDENSED, color: theme.labelInk, maxWidth: 160 });
    text(context, '36 EXP · 400', 200, 225, { weight: 500, size: 17, family: MONO, color: theme.bandInk, maxWidth: 160 });
    // A shine on the canister, flat.
    context.fillStyle = theme.bg;
    context.globalAlpha = 0.18;
    context.fillRect(128, 100, 14, 194);
    context.globalAlpha = 1;
    text(context, value, 486, 128, { weight: 700, size: 52, family: CONDENSED, color: theme.ink, maxWidth: 380 });
  },
});

const moon = design({
  id: 'moon',
  text: 'Good night',
  themes: [
    { swatch: ['#1C2541', '#FFE8A3', '#F4A7B9'], bg: '#1C2541', moon: '#FFE8A3', cheek: '#F4A7B9', line: '#3A3350', star: '#FFE8A3', ink: '#F6F1E1' },
    { swatch: ['#3B1F4A', '#FFD6A5', '#FF8FAB'], bg: '#3B1F4A', moon: '#FFD6A5', cheek: '#FF8FAB', line: '#5A3550', star: '#FFD6A5', ink: '#FCEFE6' },
    { swatch: ['#0F3D3E', '#F1E4C3', '#E9A6A6'], bg: '#0F3D3E', moon: '#F1E4C3', cheek: '#E9A6A6', line: '#2C4A47', star: '#F1E4C3', ink: '#F1E4C3' },
    { swatch: ['#121212', '#F5F5F5', '#E4572E'], bg: '#121212', moon: '#F5F5F5', cheek: '#E4572E', line: '#2A2A2A', star: '#F5F5F5', ink: '#F5F5F5' },
  ],
  draw(context, theme, value) {
    fill(context, theme.bg);
    const random = seeded(7);
    context.fillStyle = theme.star;
    for (let i = 0; i < 46; i++) {
      const x = random() * DESIGN_WIDTH;
      const y = random() * 330;
      const r = 1 + random() * 1.8;
      // Not over the moon or the text.
      if (Math.hypot(x - 360, y - 150) < 120 || (y > 260 && Math.abs(x - 360) < 200)) continue;
      context.globalAlpha = 0.35 + random() * 0.5;
      circle(context, x, y, r, theme.star);
    }
    context.globalAlpha = 1;
    for (const [x, y, r] of [
      [96, 76, 15],
      [176, 212, 9],
      [612, 84, 13],
      [650, 230, 9],
      [538, 44, 7],
      [214, 56, 7],
      [78, 270, 8],
      [580, 300, 6],
    ] as const) {
      sparkle(context, x, y, r, theme.star);
    }
    // The crescent: the moon without the part that a second circle covers.
    context.save();
    context.beginPath();
    context.arc(360, 152, 98, 0, Math.PI * 2);
    context.clip();
    context.beginPath();
    context.rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    context.arc(414, 112, 86, 0, Math.PI * 2, true);
    context.fillStyle = theme.moon;
    context.fill('evenodd');
    context.restore();
    // A sleeping face.
    stroke(context, theme.line, 5, (c) => c.arc(316, 168, 12, 0.1 * Math.PI, 0.9 * Math.PI));
    circle(context, 300, 196, 11, theme.cheek);
    stroke(context, theme.line, 4, (c) => c.arc(332, 200, 6, 0.15 * Math.PI, 0.85 * Math.PI));
    for (const [x, y, size] of [
      [432, 196, 22],
      [460, 168, 28],
      [494, 132, 36],
    ] as const) {
      text(context, 'z', x, y, { weight: 800, size, family: SANS, color: theme.moon, maxWidth: 60 });
    }
    text(context, value, 360, 316, { weight: 800, size: 50, family: SANS, color: theme.ink, maxWidth: 600 });
  },
});

const cat = design({
  id: 'cat',
  text: 'Nap time',
  themes: [
    { swatch: ['#FFF3E2', '#F2A65A', '#9CC5A1'], bg: '#FFF3E2', cat: '#F2A65A', dark: '#D9843B', ear: '#F7C6B0', rug: '#9CC5A1', line: '#6B3F1F', cheek: '#F48C84', ink: '#7A4E2D' },
    { swatch: ['#F8E5EA', '#9AA0A8', '#E8A0B4'], bg: '#F8E5EA', cat: '#9DA3AC', dark: '#7D838C', ear: '#F2C2CF', rug: '#E8A0B4', line: '#3E4249', cheek: '#F2A0B4', ink: '#6E5560' },
    { swatch: ['#E4F0E8', '#2E2E33', '#F3C969'], bg: '#E4F0E8', cat: '#2E2E33', dark: '#1B1B1F', ear: '#5A4A55', rug: '#F3C969', line: '#F3C969', cheek: '#E07A8A', ink: '#2E2E33' },
    { swatch: ['#DCE8F5', '#FFFFFF', '#7FA7D9'], bg: '#DCE8F5', cat: '#FFFFFF', dark: '#D3DAE4', ear: '#F6C9D2', rug: '#7FA7D9', line: '#4A5568', cheek: '#F6B2C0', ink: '#3E5C86' },
  ],
  draw(context, theme, value) {
    fill(context, theme.bg);
    ellipse(context, 372, 304, 240, 30, theme.rug);
    // The body, with a few stripes.
    ellipse(context, 398, 230, 148, 80, theme.cat);
    context.save();
    context.beginPath();
    context.ellipse(398, 230, 148, 80, 0, 0, Math.PI * 2);
    context.clip();
    context.fillStyle = theme.dark;
    for (const [x, tilt] of [
      [372, -0.12],
      [420, 0],
      [468, 0.14],
    ] as const) {
      context.save();
      context.translate(x, 150);
      context.rotate(tilt);
      roundRect(context, -9, -10, 18, 44, 9, theme.dark);
      context.restore();
    }
    context.restore();
    // The tail, around the front.
    stroke(context, theme.dark, 30, (c) => {
      c.moveTo(532, 250);
      c.bezierCurveTo(566, 316, 450, 322, 336, 300);
    });
    // The head and ears.
    polygon(context, [204, 214, 210, 150, 258, 190], theme.cat);
    polygon(context, [252, 188, 292, 142, 308, 210], theme.cat);
    polygon(context, [214, 198, 217, 170, 238, 190], theme.ear);
    polygon(context, [268, 188, 288, 166, 294, 200], theme.ear);
    circle(context, 256, 240, 64, theme.cat);
    // A sleeping face.
    stroke(context, theme.line, 5, (c) => {
      c.arc(232, 240, 11, 0.12 * Math.PI, 0.88 * Math.PI);
      c.moveTo(291, 243);
      c.arc(280, 240, 11, 0.12 * Math.PI, 0.88 * Math.PI);
    });
    circle(context, 214, 262, 10, theme.cheek);
    circle(context, 298, 262, 10, theme.cheek);
    polygon(context, [250, 254, 262, 254, 256, 261], theme.cheek);
    stroke(context, theme.line, 3.5, (c) => {
      c.arc(251, 264, 5, 0.1 * Math.PI, 0.9 * Math.PI);
      c.moveTo(266, 264);
      c.arc(261, 264, 5, 0.1 * Math.PI, 0.9 * Math.PI);
    });
    // The paws.
    ellipse(context, 292, 298, 26, 13, theme.cat);
    ellipse(context, 334, 300, 22, 12, theme.cat);
    for (const [x, y, size] of [
      [548, 152, 24],
      [578, 122, 30],
      [614, 88, 38],
    ] as const) {
      text(context, 'z', x, y, { weight: 800, size, family: SANS, color: theme.ink, maxWidth: 60 });
    }
    text(context, value, 360, 96, { weight: 800, size: 50, family: SANS, color: theme.ink, maxWidth: 400 });
  },
});

const flowers = design({
  id: 'flowers',
  text: 'Have a nice day',
  themes: [
    { swatch: ['#FFF6EA', '#F7A1B5', '#FFC857'], bg: '#FFF6EA', petals: ['#F7A1B5', '#FFC857', '#9AD0EC'], center: '#FFF6EA', stem: '#6BA368', leaf: '#8CC084', ink: '#5B7F4F' },
    { swatch: ['#E8EFE3', '#FFFFFF', '#F2C14E'], bg: '#E8EFE3', petals: ['#FFFFFF', '#F2C14E', '#FFFFFF'], center: '#F2C14E', stem: '#4F7A55', leaf: '#7FA67F', ink: '#3E5E44' },
    { swatch: ['#FBE1E4', '#E0607E', '#F6B26B'], bg: '#FBE1E4', petals: ['#E0607E', '#F6B26B', '#C38FD9'], center: '#FFF4E8', stem: '#5E8C61', leaf: '#86B38A', ink: '#A13D5A' },
    { swatch: ['#1F2A44', '#F7A1B5', '#FFD166'], bg: '#1F2A44', petals: ['#F7A1B5', '#FFD166', '#8ED1FC'], center: '#1F2A44', stem: '#5FA36A', leaf: '#4C8A58', ink: '#FFF1D6' },
  ],
  draw(context, theme, value) {
    fill(context, theme.bg);
    const heads = [
      [104, 258, 32],
      [222, 214, 40],
      [360, 268, 30],
      [494, 222, 42],
      [616, 262, 32],
    ] as const;
    heads.forEach(([x, y], i) => {
      stroke(context, theme.stem, 8, (c) => {
        c.moveTo(x, DESIGN_HEIGHT);
        c.quadraticCurveTo(x + (i % 2 ? 14 : -14), (y + DESIGN_HEIGHT) / 2, x, y);
      });
      const side = i % 2 ? 1 : -1;
      ellipse(context, x + side * 22, y + 92, 24, 10, theme.leaf, side * -0.5);
    });
    heads.forEach(([x, y, r], i) => {
      const color = theme.petals[i % theme.petals.length]!;
      const count = i % 2 ? 6 : 5;
      for (let p = 0; p < count; p++) {
        const angle = (p / count) * Math.PI * 2 + i;
        circle(context, x + Math.cos(angle) * r * 0.62, y + Math.sin(angle) * r * 0.62, r * 0.52, color);
      }
      circle(context, x, y, r * 0.38, theme.center);
    });
    // Petals in the air.
    const random = seeded(3);
    for (let i = 0; i < 9; i++) {
      const x = 40 + random() * 640;
      const y = 140 + random() * 60;
      ellipse(context, x, y, 6, 3.5, theme.petals[i % theme.petals.length]!, random() * Math.PI);
    }
    text(context, value, 360, 108, { weight: 800, size: 54, family: SANS, color: theme.ink, maxWidth: 620 });
  },
});

const receipt = design({
  id: 'receipt',
  text: 'THANK YOU',
  themes: [
    { swatch: ['#F2B134', '#FBF8F1', '#2B2B2B'], bg: '#F2B134', shade: '#D79A22' },
    { swatch: ['#8CC7E8', '#FBF8F1', '#2B2B2B'], bg: '#8CC7E8', shade: '#6EAFD4' },
    { swatch: ['#F4A6B8', '#FBF8F1', '#2B2B2B'], bg: '#F4A6B8', shade: '#E08AA0' },
    { swatch: ['#232323', '#FBF8F1', '#D94135'], bg: '#232323', shade: '#141414' },
  ],
  draw(context, theme, value) {
    const paper = '#FBF8F1';
    const ink = '#2B2B2B';
    fill(context, theme.bg);
    const left = 226;
    const right = 494;
    const slip = (dx: number, dy: number, color: string) => {
      context.fillStyle = color;
      context.beginPath();
      context.moveTo(left + dx, DESIGN_HEIGHT);
      context.lineTo(left + dx, 30 + dy);
      for (let x = left; x < right; x += 12) {
        context.lineTo(x + 6 + dx, 22 + dy);
        context.lineTo(x + 12 + dx, 30 + dy);
      }
      context.lineTo(right + dx, DESIGN_HEIGHT);
      context.closePath();
      context.fill();
    };
    slip(10, 10, theme.shade);
    slip(0, 0, paper);
    const center = (left + right) / 2;
    const row = (label: string, amount: string, y: number) => {
      text(context, label, left + 24, y, { weight: 400, size: 16, family: MONO, color: ink, maxWidth: 150, align: 'left' });
      text(context, amount, right - 24, y, { weight: 400, size: 16, family: MONO, color: ink, maxWidth: 100, align: 'right' });
    };
    const rule = (y: number) => {
      context.fillStyle = ink;
      for (let x = left + 24; x < right - 24; x += 10) context.fillRect(x, y, 5, 2);
    };
    text(context, 'GR PHOTO CLUB', center, 70, { weight: 500, size: 17, family: MONO, color: ink, maxWidth: 220, spacing: 2 });
    text(context, 'ROLL 001 · 36 EXP', center, 94, { weight: 400, size: 14, family: MONO, color: ink, maxWidth: 220 });
    rule(112);
    text(context, value, center, 162, { weight: 800, size: 38, family: SANS, color: ink, maxWidth: 226, min: 14 });
    rule(184);
    row('SHOTS', '36', 214);
    row('SMILES', 'LOTS', 238);
    row('TOTAL', 'PRICELESS', 262);
    // A bar code.
    const random = seeded(11);
    context.fillStyle = ink;
    for (let x = left + 40; x < right - 40; ) {
      const w = 1.5 + Math.floor(random() * 3) * 1.5;
      context.fillRect(x, 282, w, 34);
      x += w + 2 + Math.floor(random() * 3) * 1.5;
    }
  },
});

const polaroid = design({
  id: 'polaroid',
  text: 'best day ever',
  themes: [
    { swatch: ['#F7D9C4', '#9ED2E8', '#FFC857'], bg: '#F7D9C4', back: '#FBEFE6', sky: '#9ED2E8', sun: '#FFC857', far: '#7FB7A8', near: '#4E9384', sea: '#2F7FA8', tape: '#F4A6B8', ink: '#4A4A4A' },
    { swatch: ['#DDE7D5', '#F6E3C8', '#E76F51'], bg: '#DDE7D5', back: '#EEF3EA', sky: '#F6E3C8', sun: '#E76F51', far: '#8FAE8B', near: '#5C7F5E', sea: '#7FB3C8', tape: '#F2C14E', ink: '#3E4A3E' },
    { swatch: ['#2B2D42', '#3D3F6B', '#F2E9D8'], bg: '#2B2D42', back: '#3B3D58', sky: '#3D3F6B', sun: '#F2E9D8', far: '#2C2E4F', near: '#1E2038', sea: '#4F5D95', tape: '#E4A3B8', ink: '#3B3B3B' },
    { swatch: ['#F3E8F7', '#FFD6E0', '#B28DD6'], bg: '#F3E8F7', back: '#FAF3FC', sky: '#FFD6E0', sun: '#FFFFFF', far: '#C9A7E4', near: '#9C79C9', sea: '#B8C7F0', tape: '#9ED2E8', ink: '#5A4A6A' },
  ],
  draw(context, theme, value) {
    fill(context, theme.bg);
    const frame = (x: number, y: number, angle: number, color: string) => {
      context.save();
      context.translate(x, y);
      context.rotate(angle);
      context.fillStyle = color;
      context.fillRect(-130, -143, 260, 286);
      context.restore();
    };
    frame(392, 170, 0.12, theme.back);
    context.save();
    context.translate(346, 168);
    context.rotate(-0.07);
    context.fillStyle = '#FFFFFF';
    context.fillRect(-130, -143, 260, 286);
    // The photo: a small landscape.
    context.save();
    context.beginPath();
    context.rect(-114, -127, 228, 204);
    context.clip();
    context.fillStyle = theme.sky;
    context.fillRect(-114, -127, 228, 204);
    circle(context, 50, -60, 26, theme.sun);
    polygon(context, [-130, 40, -60, -40, 10, 40], theme.far);
    polygon(context, [-30, 40, 50, -22, 140, 40], theme.near);
    context.fillStyle = theme.sea;
    context.fillRect(-114, 34, 228, 50);
    context.fillStyle = theme.sky;
    context.globalAlpha = 0.5;
    context.fillRect(-60, 50, 50, 3);
    context.fillRect(20, 62, 70, 3);
    context.globalAlpha = 1;
    context.restore();
    text(context, value, 0, 122, { weight: 500, size: 26, family: SANS, color: theme.ink, maxWidth: 224, min: 12 });
    // A strip of tape over the top edge.
    context.rotate(0.1);
    context.globalAlpha = 0.85;
    context.fillStyle = theme.tape;
    context.fillRect(-46, -158, 92, 28);
    context.globalAlpha = 1;
    context.restore();
    sparkle(context, 566, 96, 16, theme.tape);
    sparkle(context, 600, 140, 9, theme.tape);
    sparkle(context, 136, 252, 11, theme.tape);
  },
});

const seeYou = design({
  id: 'wave',
  text: 'See you!',
  themes: [
    { swatch: ['#D94135', '#FFFFFF'], bg: '#D94135', ink: '#FFFFFF', accent: '#F6B0A8' },
    { swatch: ['#F6EFE3', '#D94135'], bg: '#F6EFE3', ink: '#D94135', accent: '#E9B9A6' },
    { swatch: ['#141414', '#D94135'], bg: '#141414', ink: '#F7F7F2', accent: '#D94135' },
    { swatch: ['#2B59C3', '#FFF1D6'], bg: '#2B59C3', ink: '#FFF1D6', accent: '#F2B134' },
  ],
  draw(context, theme, value) {
    fill(context, theme.bg);
    // A hand that waves: a palm and four fingers, with lines of motion.
    context.save();
    context.translate(360, 98);
    context.rotate(-0.22);
    roundRect(context, -34, -10, 68, 64, 24, theme.ink);
    for (const [x, h] of [
      [-30, 48],
      [-14, 58],
      [2, 56],
      [18, 46],
    ] as const) {
      roundRect(context, x, -h + 10, 13, h, 6.5, theme.ink);
    }
    context.save();
    context.translate(-30, 24);
    context.rotate(-0.8);
    roundRect(context, -7, -34, 14, 40, 7, theme.ink);
    context.restore();
    context.restore();
    stroke(context, theme.accent, 6, (c) => {
      c.arc(360, 108, 82, -Math.PI * 0.95, -Math.PI * 0.75);
      c.moveTo(360 + 82 * Math.cos(-Math.PI * 0.25), 108 + 82 * Math.sin(-Math.PI * 0.25));
      c.arc(360, 108, 82, -Math.PI * 0.25, -Math.PI * 0.05);
    });
    text(context, value, 360, 256, { weight: 800, size: 92, family: SANS, color: theme.ink, maxWidth: 640 });
    stroke(context, theme.accent, 8, (c) => wave(c, 250, 470, 296, 7, 44));
  },
});

const sun = design({
  id: 'sun',
  text: 'sayonara',
  themes: [
    { swatch: ['#F4EFE6', '#D7263D'], bg: '#F4EFE6', sun: '#D7263D', ink: '#2B2B2B' },
    { swatch: ['#1D2D50', '#F4EFE6'], bg: '#1D2D50', sun: '#F4EFE6', ink: '#F4EFE6' },
    { swatch: ['#121212', '#E9B44C'], bg: '#121212', sun: '#E9B44C', ink: '#E9E2D0' },
    { swatch: ['#FBE4E8', '#E06C8A'], bg: '#FBE4E8', sun: '#E06C8A', ink: '#6A3A48' },
  ],
  draw(context, theme, value) {
    fill(context, theme.bg);
    circle(context, 360, 158, 104, theme.sun);
    text(context, value, 360, 316, { weight: 500, size: 30, family: SANS, color: theme.ink, maxWidth: 560, spacing: 10 });
  },
});

const pixel = design({
  id: 'pixel',
  text: 'GAME OVER',
  themes: [
    { swatch: ['#9BBC0F', '#0F380F', '#306230'], bg: '#9BBC0F', check: '#8BAC0F', ink: '#0F380F', heart: '#306230' },
    { swatch: ['#FFE3EE', '#6B2D5C', '#F06FA4'], bg: '#FFE3EE', check: '#FFCFE1', ink: '#6B2D5C', heart: '#F06FA4' },
    { swatch: ['#14141F', '#F9F871', '#FF5C8A'], bg: '#14141F', check: '#22223A', ink: '#F9F871', heart: '#FF5C8A' },
    { swatch: ['#DFF3FF', '#1F3B73', '#3E7CB1'], bg: '#DFF3FF', check: '#C6E7FA', ink: '#1F3B73', heart: '#3E7CB1' },
  ],
  draw(context, theme, value) {
    fill(context, theme.bg);
    context.fillStyle = theme.check;
    for (let y = 0; y < DESIGN_HEIGHT; y += 20) {
      if (y >= 40 && y < 440) continue;
      for (let x = (y / 20) % 2 ? 20 : 0; x < DESIGN_WIDTH; x += 40) context.fillRect(x, y, 20, 20);
    }
    const block = 8;
    const hearts = [HEART, HEART, HEART_EMPTY];
    hearts.forEach((shape, i) => pixelShape(context, shape, 360 - 128 + i * 96, 58, block, theme.heart));
    if (pixelFontHas(value)) pixelText(context, value, 360, 134, 10, 640, theme.ink);
    else text(context, value, 360, 196, { weight: 500, size: 60, family: MONO, color: theme.ink, maxWidth: 640 });
    pixelText(context, 'CONTINUE?', 360, 236, 4, 400, theme.ink);
    pixelShape(context, ['#...', '##..', '###.', '##..', '#...'], 290, 287, 3, theme.heart);
    pixelText(context, 'YES   NO', 380, 284, 3, 200, theme.ink);
  },
});

const clouds = design({
  id: 'clouds',
  text: 'Sweet dreams',
  themes: [
    { swatch: ['#BFE1F6', '#FFFFFF', '#F25F5C'], sky: '#BFE1F6', cloud: '#FFFFFF', plane: '#F25F5C', fold: '#C94744', trail: '#FFFFFF', ink: '#2C5D8A' },
    { swatch: ['#FFDCCB', '#FFF6F0', '#5B8DEF'], sky: '#FFDCCB', cloud: '#FFF6F0', plane: '#5B8DEF', fold: '#406FCB', trail: '#FFF6F0', ink: '#9A4E3A' },
    { swatch: ['#24305E', '#3B4A82', '#FFD166'], sky: '#24305E', cloud: '#34437A', plane: '#FFD166', fold: '#D9AB3F', trail: '#8792C2', ink: '#F1F1F1' },
    { swatch: ['#D8F1E6', '#FFFFFF', '#FF9F68'], sky: '#D8F1E6', cloud: '#FFFFFF', plane: '#FF9F68', fold: '#E07E47', trail: '#FFFFFF', ink: '#2F6F5E' },
  ],
  draw(context, theme, value) {
    fill(context, theme.sky);
    const cloud = (x: number, y: number, s: number) => {
      context.fillStyle = theme.cloud;
      context.beginPath();
      for (const [dx, dy, r] of [
        [-52, 0, 30],
        [-18, -22, 40],
        [26, -14, 34],
        [56, 4, 26],
      ] as const) {
        context.moveTo(x + dx * s + r * s, y + dy * s);
        context.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2);
      }
      context.fill();
      roundRect(context, x - 82 * s, y - 4 * s, 164 * s, 34 * s, 17 * s, theme.cloud);
    };
    cloud(150, 262, 1.1);
    cloud(586, 286, 1.25);
    cloud(400, 196, 0.6);
    cloud(612, 70, 0.5);
    cloud(92, 92, 0.45);
    // The trail of the paper plane.
    context.save();
    context.setLineDash([10, 12]);
    stroke(context, theme.trail, 4, (c) => {
      c.moveTo(128, 196);
      c.bezierCurveTo(230, 120, 330, 250, 470, 170);
    });
    context.restore();
    // The paper plane, flying up to the right.
    context.save();
    context.translate(530, 150);
    context.rotate(-0.35);
    polygon(context, [-44, -4, 40, -24, -18, 20], theme.plane);
    polygon(context, [-18, 20, 40, -24, -6, 4], theme.fold);
    polygon(context, [-6, 4, 40, -24, 0, 26], theme.plane);
    context.restore();
    text(context, value, 360, 96, { weight: 800, size: 56, family: SANS, color: theme.ink, maxWidth: 560 });
  },
});

/** The designs, in the order of the gallery. */
export const DESIGNS = [sunset, moon, cat, clouds, flowers, polaroid, film, receipt, seeYou, sun, pixel] as const satisfies readonly Design[];

/**
 * The designs that come with the free library; the others are part of GRKU Plus. A design chosen
 * before stays chosen, as everything else that Plus unlocks.
 */
export const FREE_DESIGNS: readonly string[] = ['sunset', 'moon', 'cat', 'clouds', 'sun'];

export function findDesign(id: string): Design | undefined {
  return DESIGNS.find((design) => design.id === id);
}

/** A design as the user made it: which design, its theme, and its text. */
export interface DesignChoice {
  id: string;
  theme: number;
  text: string;
}

/**
 * Returns `context` to the state of a new canvas: no transform, clip, shadow, filter, or
 * transparency, and nothing drawn. Each drawing of a thumbnail starts here, so nothing that a
 * drawing before it left behind, such as a translation or a clip, moves or cuts the next one.
 */
export function resetContext(context: DesignContext): void {
  const reset = (context as { reset?: () => void }).reset;
  if (typeof reset === 'function') {
    reset.call(context);
    return;
  }
  // Without reset(): a restore on an empty stack does nothing, and a clip goes only by restore.
  for (let i = 0; i < 64; i++) context.restore();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.globalAlpha = 1;
  context.globalCompositeOperation = 'source-over';
  if ('filter' in context) context.filter = 'none';
  context.shadowColor = 'rgba(0, 0, 0, 0)';
  context.shadowBlur = 0;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.setLineDash?.([]);
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

/**
 * Draws `choice` over the whole context, in the coordinates of 720 by 480. The state of the
 * context after it is the state before it, also when the design fails to draw.
 */
export function drawDesign(context: DesignContext, choice: DesignChoice) {
  const design: Design = findDesign(choice.id) ?? DESIGNS[0];
  context.save();
  try {
    context.globalAlpha = 1;
    context.setLineDash?.([]);
    design.draw(context, choice.theme, choice.text.slice(0, DESIGN_TEXT_MAX * 2));
  } finally {
    context.restore();
  }
}

/** Cuts `value` to the most characters of a design text, counting what the reader sees as one. */
export function limitText(value: string): string {
  const parts = graphemes(value.replace(/[\r\n\t]+/g, ' '));
  return parts.length > DESIGN_TEXT_MAX ? parts.slice(0, DESIGN_TEXT_MAX).join('') : parts.join('');
}

/**
 * The designs of this browser: the chosen design, and the theme and the text of each design that
 * the user changed. A design without a saved text has its own.
 */
export interface DesignState {
  id: string;
  themes: Record<string, number>;
  texts: Record<string, string>;
}

const DESIGN_KEY = 'grku.shutdownDesign';

export function defaultDesigns(): DesignState {
  return { id: DESIGNS[0].id, themes: {}, texts: {} };
}

/** The designs of the last visit; what does not read, or no longer fits, is left out. */
export function loadDesigns(storage: Pick<Storage, 'getItem'> | null): DesignState {
  const state = defaultDesigns();
  try {
    const saved: unknown = JSON.parse(storage?.getItem(DESIGN_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return state;
    const { id, themes, texts } = saved as Record<string, unknown>;
    if (typeof id === 'string' && findDesign(id)) state.id = id;
    if (themes && typeof themes === 'object') {
      for (const [key, value] of Object.entries(themes)) {
        const design = findDesign(key);
        if (design && Number.isInteger(value) && (value as number) >= 0 && (value as number) < design.swatches.length) {
          state.themes[key] = value as number;
        }
      }
    }
    if (texts && typeof texts === 'object') {
      for (const [key, value] of Object.entries(texts)) {
        if (findDesign(key) && typeof value === 'string') state.texts[key] = limitText(value);
      }
    }
  } catch {
    // An unreadable value is the same as none.
  }
  return state;
}

export function saveDesigns(storage: Pick<Storage, 'setItem'> | null, state: DesignState) {
  try {
    storage?.setItem(DESIGN_KEY, JSON.stringify(state));
  } catch {
    // A convenience: without storage, the next visit starts from the defaults.
  }
}

/** The choice of a design in `state`: the chosen design by default. */
export function designChoice(state: DesignState, id = state.id): DesignChoice {
  const design = findDesign(id) ?? DESIGNS[0];
  return { id: design.id, theme: state.themes[design.id] ?? 0, text: state.texts[design.id] ?? design.text };
}
