/**
 * The stickers of the Studio: flat drawings in a box of 100 by 100, each a list of SVG paths
 * with their colors. They use no image files, so they draw the same on a canvas (`Path2D`) and in
 * the gallery (inline SVG). A part whose color is `tint` takes the color that the visitor picks.
 */
import { arc, circle, crescent, drop, ellipse, heart, line, petal, poly, rays, rect, ring, star, turn, turnedRect } from './shapes';

export interface Part {
  d: string;
  fill?: string;
  stroke?: string;
  /** The width of the stroke, in the units of the box. */
  width?: number;
  alpha?: number;
  evenodd?: boolean;
}

export type StickerGroup = 'basic' | 'cute' | 'camera' | 'thai' | 'party' | 'nature';
export const STICKER_GROUPS: readonly StickerGroup[] = ['basic', 'cute', 'camera', 'thai', 'party', 'nature'];

export interface Sticker {
  id: string;
  group: StickerGroup;
  /** The color of the `tint` parts until the visitor picks one, for a sticker that has them. */
  tint?: string;
  parts: readonly Part[];
}

const INK = '#3A2E2A';
const OUT = { stroke: INK, width: 3 } as const;
const WHITE = '#FFFFFF';
const PINK = '#F4A6B8';
const BLUSH = '#F48C9A';
const YELLOW = '#FFC857';
const ORANGE = '#F2A65A';
const RED = '#E84A5F';
const BLUE = '#8CC7E8';
const GREEN = '#7DBB72';
const DARK_GREEN = '#4E8C54';
const CREAM = '#FFF3E2';
const BROWN = '#8A5A3B';
const GOLD = '#F2B134';

/** The two eyes of a face and its smile. */
function face(cx: number, cy: number, gap: number, eye = 4): Part[] {
  return [
    { d: circle(cx - gap, cy, eye), fill: INK },
    { d: circle(cx + gap, cy, eye), fill: INK },
    { d: circle(cx - gap - 2 + eye * 0.2, cy - 1.5, eye * 0.35), fill: WHITE },
    { d: circle(cx + gap - 2 + eye * 0.2, cy - 1.5, eye * 0.35), fill: WHITE },
  ];
}

const blush = (cx: number, cy: number, gap: number, r = 5): Part => ({ d: circle(cx - gap, cy, r) + circle(cx + gap, cy, r), fill: BLUSH, alpha: 0.7 });

const sticker = (id: string, group: StickerGroup, parts: Part[], tint?: string): Sticker => ({ id, group, parts, ...(tint ? { tint } : {}) });

// ---- Basic: the free set ----------------------------------------------------------------------------

const basic: Sticker[] = [
  sticker('heart', 'basic', [{ d: heart(50, 52, 44), fill: 'tint' }, { d: ellipse(30, 30, 9, 5, -40), fill: WHITE, alpha: 0.45 }], RED),
  sticker('star', 'basic', [{ d: star(50, 54, 5, 47, 21), fill: 'tint' }, { d: ellipse(40, 40, 5, 3, -30), fill: WHITE, alpha: 0.5 }], YELLOW),
  sticker(
    'sparkle',
    'basic',
    [
      { d: 'M44 10Q49 47 86 52Q49 57 44 94Q39 57 2 52Q39 47 44 10Z', fill: 'tint' },
      { d: 'M82 6Q84 19 96 21Q84 23 82 36Q80 23 68 21Q80 19 82 6Z', fill: 'tint' },
    ],
    YELLOW,
  ),
  sticker('sun', 'basic', [
    { d: rays(50, 50, 34, 46, 12), stroke: '#F7A42C', width: 6 },
    { d: circle(50, 50, 27), fill: YELLOW },
    { d: arc(50, 52, 10, 20, 160), stroke: INK, width: 3 },
    { d: circle(41, 44, 2.6) + circle(59, 44, 2.6), fill: INK },
    blush(50, 52, 14, 3.5),
  ]),
  sticker('moon', 'basic', [{ d: crescent([46, 52, 40], [66, 38, 34]), fill: 'tint' }, { d: circle(28, 58, 4) + circle(36, 76, 2.5), fill: '#000000', alpha: 0.08 }], '#FFE08A'),
  sticker('cloud', 'basic', [
    { d: circle(32, 58, 18) + circle(52, 44, 24) + circle(72, 58, 16) + rect(14, 56, 74, 22, 11), stroke: '#9EC3E0', width: 7 },
    { d: circle(32, 58, 18) + circle(52, 44, 24) + circle(72, 58, 16) + rect(14, 56, 74, 22, 11), fill: WHITE },
  ]),
  sticker('flower', 'basic', [{ d: ring(50, 50, 24, 5, 18), fill: 'tint' }, { d: circle(50, 50, 14), fill: YELLOW }, { d: circle(46, 46, 4), fill: WHITE, alpha: 0.6 }], PINK),
  sticker('smile', 'basic', [
    { d: circle(50, 50, 44), fill: YELLOW },
    { d: ellipse(36, 40, 4.5, 7) + ellipse(64, 40, 4.5, 7), fill: INK },
    { d: arc(50, 52, 22, 20, 160), stroke: INK, width: 5 },
    blush(50, 60, 26, 6),
  ]),
  sticker('bolt', 'basic', [{ d: poly(60, 4, 16, 56, 44, 56, 36, 96, 84, 40, 56, 40, 66, 4), fill: 'tint' }], YELLOW),
  sticker(
    'note',
    'basic',
    [
      { d: ellipse(28, 76, 13, 9.5, -20) + ellipse(72, 68, 13, 9.5, -20), fill: 'tint' },
      { d: line(39, 72, 39, 18) + line(83, 64, 83, 10), stroke: 'tint', width: 5 },
      { d: poly(37, 16, 85, 6, 85, 20, 37, 30), fill: 'tint' },
    ],
    INK,
  ),
];

// ---- Cute ------------------------------------------------------------------------------------------------

const cute: Sticker[] = [
  sticker('cat', 'cute', [
    { d: poly(14, 44, 18, 8, 44, 28) + poly(86, 44, 82, 8, 56, 28), fill: ORANGE, ...OUT },
    { d: ellipse(50, 58, 40, 32), fill: ORANGE, ...OUT },
    { d: poly(20, 34, 22, 16, 36, 28) + poly(80, 34, 78, 16, 64, 28), fill: PINK },
    ...face(50, 54, 15),
    { d: poly(46, 63, 54, 63, 50, 67), fill: BLUSH },
    { d: arc(45, 67, 5, 20, 160) + arc(55, 67, 5, 20, 160), stroke: INK, width: 2.5 },
    { d: line(4, 58, 20, 60) + line(6, 68, 20, 66) + line(96, 58, 80, 60) + line(94, 68, 80, 66), stroke: INK, width: 2 },
    blush(50, 66, 25),
  ]),
  sticker('puppy', 'cute', [
    { d: circle(50, 54, 34), fill: '#E8C39E', ...OUT },
    { d: ellipse(18, 50, 11, 24, 18) + ellipse(82, 50, 11, 24, -18), fill: BROWN, ...OUT },
    { d: ellipse(62, 44, 11, 10), fill: '#C89B72' },
    { d: ellipse(50, 68, 16, 12), fill: CREAM },
    ...face(50, 48, 14),
    { d: ellipse(50, 62, 6, 4.5), fill: INK },
    { d: rect(46, 70, 8, 9, 4), fill: BLUSH },
    { d: arc(45, 66, 5, 20, 160) + arc(55, 66, 5, 20, 160), stroke: INK, width: 2.5 },
  ]),
  sticker('bunny', 'cute', [
    { d: ellipse(34, 28, 10, 25, -8) + ellipse(66, 28, 10, 25, 8), fill: '#F7F4F0', ...OUT },
    { d: ellipse(34, 30, 4.5, 17, -8) + ellipse(66, 30, 4.5, 17, 8), fill: PINK },
    { d: ellipse(50, 66, 34, 28), fill: '#F7F4F0', ...OUT },
    ...face(50, 62, 14),
    { d: ellipse(50, 70, 4, 3), fill: BLUSH },
    { d: arc(46, 73, 4, 20, 160) + arc(54, 73, 4, 20, 160), stroke: INK, width: 2.2 },
    blush(50, 72, 22),
  ]),
  sticker('bear', 'cute', [
    { d: circle(22, 28, 14) + circle(78, 28, 14), fill: '#A0714F', ...OUT },
    { d: circle(22, 28, 7) + circle(78, 28, 7), fill: '#E8C39E' },
    { d: circle(50, 56, 38), fill: '#A0714F', ...OUT },
    { d: ellipse(50, 68, 16, 12), fill: '#E8C39E' },
    ...face(50, 50, 15),
    { d: ellipse(50, 63, 6, 4.5), fill: INK },
    { d: arc(50, 68, 5, 30, 150), stroke: INK, width: 2.5 },
  ]),
  sticker('chick', 'cute', [
    { d: line(44, 12, 48, 22) + line(54, 10, 51, 22), stroke: ORANGE, width: 4 },
    { d: circle(50, 54, 36), fill: '#FFD95A', ...OUT },
    { d: ellipse(24, 64, 9, 14, 30) + ellipse(76, 64, 9, 14, -30), fill: '#F7C33C' },
    ...face(50, 48, 13),
    { d: poly(43, 58, 57, 58, 50, 67), fill: ORANGE },
    blush(50, 60, 22),
    { d: line(40, 90, 40, 96) + line(60, 90, 60, 96), stroke: ORANGE, width: 4 },
  ]),
  sticker('ghost', 'cute', [
    { d: 'M20 92L20 46A30 30 0 0 1 80 46L80 92L70 84L60 92L50 84L40 92L30 84Z', fill: WHITE, ...OUT },
    { d: ellipse(40, 48, 4.5, 6.5) + ellipse(60, 48, 4.5, 6.5), fill: INK },
    { d: ellipse(50, 62, 4.5, 5.5), fill: INK },
    blush(50, 58, 18, 4.5),
  ]),
  sticker('rainbow', 'cute', [
    { d: arc(50, 74, 40, 180, 360), stroke: RED, width: 8 },
    { d: arc(50, 74, 32, 180, 360), stroke: YELLOW, width: 8 },
    { d: arc(50, 74, 24, 180, 360), stroke: GREEN, width: 8 },
    { d: arc(50, 74, 16, 180, 360), stroke: BLUE, width: 8 },
    { d: circle(12, 76, 9) + circle(22, 72, 10) + circle(30, 78, 7) + circle(70, 78, 7) + circle(78, 72, 10) + circle(88, 76, 9), fill: WHITE, stroke: '#B8D4EA', width: 2 },
  ]),
  sticker('strawberry', 'cute', [
    { d: 'M50 94C22 80 10 52 22 36C32 24 68 24 78 36C90 52 78 80 50 94Z', fill: RED, ...OUT },
    {
      d: [
        [36, 44],
        [50, 46],
        [64, 44],
        [30, 58],
        [44, 60],
        [58, 60],
        [70, 58],
        [40, 74],
        [54, 76],
        [48, 86],
      ]
        .map(([x = 0, y = 0]) => ellipse(x, y, 1.8, 3))
        .join(''),
      fill: '#FFE08A',
    },
    { d: star(50, 28, 5, 18, 7), fill: GREEN, ...OUT },
    { d: line(50, 20, 52, 8), stroke: DARK_GREEN, width: 4 },
  ]),
  sticker('icecream', 'cute', [
    { d: poly(30, 50, 70, 50, 50, 96), fill: '#E9B872', ...OUT },
    { d: line(38, 56, 58, 82) + line(50, 52, 64, 70) + line(62, 56, 42, 82) + line(50, 52, 36, 70), stroke: '#C68E4A', width: 2 },
    { d: circle(50, 38, 22) + circle(32, 50, 8) + circle(68, 50, 8) + circle(50, 52, 9), fill: PINK, ...OUT },
    { d: circle(50, 13, 7), fill: RED, ...OUT },
    { d: ellipse(42, 30, 5, 3, -30), fill: WHITE, alpha: 0.6 },
  ]),
  sticker('donut', 'cute', [
    { d: circle(50, 50, 42) + circle(50, 50, 13), fill: '#E9B872', evenodd: true, ...OUT },
    { d: 'M14 46C16 20 40 10 56 12C76 14 90 30 86 52C84 62 76 60 72 66C66 74 58 64 50 68C42 72 36 62 28 64C20 66 13 58 14 46Z' + circle(50, 50, 15), fill: PINK, evenodd: true },
    {
      d: [
        [30, 30, 30],
        [44, 22, -20],
        [64, 24, 60],
        [74, 38, 10],
        [26, 48, -50],
        [70, 54, 40],
        [36, 60, 80],
        [58, 34, -70],
      ]
        .map(([x = 0, y = 0, a = 0]) => turnedRect(x, y, 8, 3, a))
        .join(''),
      fill: WHITE,
    },
  ]),
  sticker('cherry', 'cute', [
    { d: 'M34 70C36 46 46 26 58 16M66 68C64 48 62 30 58 16', stroke: DARK_GREEN, width: 3.5 },
    { d: ellipse(70, 18, 16, 7, -25), fill: GREEN, ...OUT },
    { d: circle(32, 74, 17) + circle(68, 72, 17), fill: RED, ...OUT },
    { d: ellipse(26, 68, 4, 2.5, -40) + ellipse(62, 66, 4, 2.5, -40), fill: WHITE, alpha: 0.7 },
  ]),
  sticker(
    'paw',
    'cute',
    [
      { d: 'M50 52C64 52 76 66 74 78C72 90 60 86 50 86C40 86 28 90 26 78C24 66 36 52 50 52Z', fill: 'tint' },
      { d: ellipse(22, 48, 9, 12, -20) + ellipse(38, 28, 9, 12, -8) + ellipse(62, 28, 9, 12, 8) + ellipse(78, 48, 9, 12, 20), fill: 'tint' },
    ],
    '#6B4B3E',
  ),
  sticker(
    'bow',
    'cute',
    [
      { d: poly(44, 54, 26, 92, 38, 88, 46, 96, 50, 56) + poly(56, 54, 74, 92, 62, 88, 54, 96, 50, 56), fill: 'tint' },
      { d: 'M50 46C36 24 8 24 8 46C8 68 36 68 50 52ZM50 46C64 24 92 24 92 46C92 68 64 68 50 52Z', fill: 'tint' },
      { d: 'M50 46C40 32 22 32 20 44M50 46C60 32 78 32 80 44', stroke: '#000000', width: 2.5, alpha: 0.15 },
      { d: rect(42, 40, 16, 18, 6), fill: 'tint' },
      { d: rect(42, 40, 16, 18, 6), fill: '#000000', alpha: 0.12 },
    ],
    PINK,
  ),
  sticker('crown', 'cute', [
    { d: poly(12, 80, 8, 30, 31, 52, 50, 18, 69, 52, 92, 30, 88, 80), fill: YELLOW, ...OUT },
    { d: rect(12, 70, 76, 14, 2), fill: GOLD, ...OUT },
    { d: circle(30, 77, 4) + circle(70, 77, 4), fill: BLUE },
    { d: circle(50, 77, 5), fill: RED },
    { d: circle(8, 28, 5) + circle(50, 16, 5) + circle(92, 28, 5), fill: YELLOW, ...OUT },
  ]),
  sticker(
    'bubble',
    'cute',
    [
      { d: 'M30 12H70A22 22 0 0 1 92 34V46A22 22 0 0 1 70 68H48L24 90L30 68A22 22 0 0 1 8 46V34A22 22 0 0 1 30 12Z', fill: 'tint', ...OUT },
      { d: circle(34, 40, 4) + circle(50, 40, 4) + circle(66, 40, 4), fill: INK },
    ],
    WHITE,
  ),
  sticker(
    'butterfly',
    'cute',
    [
      { d: ellipse(30, 34, 22, 18, -30) + ellipse(70, 34, 22, 18, 30), fill: 'tint', ...OUT },
      { d: ellipse(34, 66, 14, 12, 30) + ellipse(66, 66, 14, 12, -30), fill: 'tint', ...OUT },
      { d: circle(28, 32, 7) + circle(72, 32, 7) + circle(34, 66, 5) + circle(66, 66, 5), fill: WHITE, alpha: 0.7 },
      { d: ellipse(50, 50, 5, 26), fill: INK },
      { d: 'M48 26C44 16 40 12 34 10M52 26C56 16 60 12 66 10', stroke: INK, width: 2.5 },
    ],
    '#B28DD6',
  ),
];

// ---- Camera and film --------------------------------------------------------------------------------------

const camera: Sticker[] = [
  sticker('camera', 'camera', [
    { d: rect(22, 20, 22, 12, 3), fill: '#3A3A44' },
    { d: rect(6, 28, 88, 54, 9), fill: '#2B2B2B' },
    { d: rect(6, 28, 20, 54, 9), fill: '#1B1A19' },
    { d: circle(58, 55, 22), fill: '#4A4A55' },
    { d: circle(58, 55, 16), fill: '#1B1A19' },
    { d: circle(58, 55, 8), fill: '#2E3F7A' },
    { d: ellipse(53, 50, 4, 2.5, -40), fill: WHITE, alpha: 0.7 },
    { d: rect(76, 22, 12, 6, 2), fill: '#D94135' },
    { d: rect(80, 34, 9, 6, 1.5), fill: '#9AA0A8' },
  ]),
  sticker('canister', 'camera', [
    { d: rect(40, 4, 20, 12, 3), fill: '#1B1A19' },
    { d: rect(16, 12, 68, 12, 5) + rect(16, 80, 68, 12, 5), fill: '#1B1A19' },
    { d: rect(20, 22, 60, 60), fill: '#2B2A29' },
    { d: rect(20, 28, 60, 48), fill: YELLOW },
    { d: rect(20, 52, 60, 14), fill: '#D7263D' },
    { d: poly(30, 34, 46, 34, 40, 46), fill: '#2B2A29' },
    { d: rect(54, 34, 18, 8, 2), fill: '#2B2A29' },
    { d: rect(26, 22, 6, 60), fill: WHITE, alpha: 0.18 },
  ]),
  sticker('filmstrip', 'camera', [
    {
      d:
        rect(2, 24, 96, 52, 3) +
        Array.from({ length: 8 }, (_, i) => rect(6 + i * 12, 28, 6, 6, 1.5) + rect(6 + i * 12, 66, 6, 6, 1.5)).join(''),
      fill: '#2B2B2B',
      evenodd: true,
    },
    { d: rect(6, 38, 26, 24, 2), fill: '#F4A07A' },
    { d: rect(37, 38, 26, 24, 2), fill: '#9ED2E8' },
    { d: rect(68, 38, 26, 24, 2), fill: '#8CC084' },
    { d: circle(14, 46, 4) + poly(38, 62, 48, 46, 58, 62) + circle(85, 46, 5), fill: WHITE, alpha: 0.75 },
  ]),
  sticker('instant', 'camera', [
    { d: poly(...[12, 8, 88, 8, 88, 94, 12, 94].flatMap((v, i, all) => (i % 2 ? [] : turn([v, all[i + 1]!], 50, 50, -6)))), fill: WHITE, stroke: '#D9D2C8', width: 2 },
    { d: poly(...[19, 15, 81, 15, 81, 74, 19, 74].flatMap((v, i, all) => (i % 2 ? [] : turn([v, all[i + 1]!], 50, 50, -6)))), fill: '#9ED2E8' },
    { d: circle(64, 32, 7), fill: YELLOW },
    { d: poly(...[19, 74, 40, 46, 58, 74].flatMap((v, i, all) => (i % 2 ? [] : turn([v, all[i + 1]!], 50, 50, -6)))), fill: '#4E9384' },
    { d: poly(...[44, 74, 64, 54, 81, 74].flatMap((v, i, all) => (i % 2 ? [] : turn([v, all[i + 1]!], 50, 50, -6)))), fill: '#7FB7A8' },
  ]),
  sticker('aperture', 'camera', [
    { d: circle(50, 50, 45), fill: '#2B2B2B' },
    { d: circle(50, 50, 38), fill: '#4A4A55' },
    { d: star(50, 50, 6, 16, 16 * Math.cos(Math.PI / 6), -90).replace(/Z$/, 'Z'), fill: '#9ED2E8' },
    {
      d: Array.from({ length: 6 }, (_, i) => {
        const a = ((-90 + i * 60) * Math.PI) / 180;
        const b = a + Math.PI / 2.3;
        return line(50 + Math.cos(a) * 16, 50 + Math.sin(a) * 16, 50 + Math.cos(a) * 16 + Math.cos(b) * 26, 50 + Math.sin(a) * 16 + Math.sin(b) * 26);
      }).join(''),
      stroke: '#2B2B2B',
      width: 2.5,
    },
  ]),
  sticker('sdcard', 'camera', [
    { d: 'M24 6H66L80 20V94H24Z', fill: '#2B59C3', stroke: '#1F3B73', width: 2.5 },
    { d: Array.from({ length: 5 }, (_, i) => rect(30 + i * 9, 10, 5, 12, 1)).join(''), fill: GOLD },
    { d: rect(32, 44, 40, 40, 3), fill: WHITE },
    { d: rect(36, 50, 24, 5, 2) + rect(36, 60, 32, 3, 1.5) + rect(36, 67, 18, 3, 1.5), fill: '#2B59C3', alpha: 0.6 },
    { d: rect(19, 36, 6, 12, 1.5), fill: '#E4E4E4' },
  ]),
  sticker('lens', 'camera', [
    { d: circle(50, 50, 46), fill: '#2B2B2B' },
    { d: circle(50, 50, 38), fill: '#3A3A44' },
    { d: circle(50, 50, 30), fill: '#1B1A19' },
    { d: circle(50, 50, 20), fill: '#2E3F7A' },
    { d: circle(50, 50, 10), fill: '#14141F' },
    { d: ellipse(40, 38, 8, 4.5, -40), fill: WHITE, alpha: 0.6 },
    { d: circle(60, 60, 3), fill: WHITE, alpha: 0.4 },
    { d: arc(50, 50, 42, 200, 250), stroke: WHITE, width: 2, alpha: 0.35 },
  ]),
  sticker('battery', 'camera', [
    { d: rect(8, 26, 76, 48, 8), fill: WHITE, stroke: INK, width: 5 },
    { d: rect(86, 40, 8, 20, 3), fill: INK },
    { d: rect(16, 34, 18, 32, 3) + rect(37, 34, 18, 32, 3) + rect(58, 34, 18, 32, 3), fill: '#5CC46E' },
  ]),
  sticker(
    'focus',
    'camera',
    [
      { d: line(8, 30, 8, 8, 30, 8) + line(70, 8, 92, 8, 92, 30) + line(92, 70, 92, 92, 70, 92) + line(30, 92, 8, 92, 8, 70), stroke: 'tint', width: 6 },
      { d: line(50, 40, 50, 60) + line(40, 50, 60, 50), stroke: 'tint', width: 3 },
    ],
    '#D94135',
  ),
  sticker('photo', 'camera', [
    { d: rect(6, 14, 88, 72, 8), fill: '#E3EFEA', stroke: INK, width: 4 },
    { d: circle(70, 36, 8), fill: YELLOW },
    { d: poly(10, 82, 36, 44, 60, 82) + poly(44, 82, 64, 58, 90, 82), fill: '#4E9384' },
  ]),
  sticker('tripod', 'camera', [
    { d: line(50, 46, 20, 96) + line(50, 46, 80, 96) + line(50, 46, 50, 94), stroke: '#3A3A44', width: 4.5 },
    { d: rect(40, 40, 20, 10, 2), fill: '#3A3A44' },
    { d: rect(22, 10, 56, 32, 6), fill: '#2B2B2B' },
    { d: circle(54, 26, 11), fill: '#4A4A55' },
    { d: circle(54, 26, 6), fill: '#2E3F7A' },
    { d: rect(28, 6, 12, 6, 2), fill: '#D94135' },
  ]),
];

// ---- Thai festivals ---------------------------------------------------------------------------------------

const WATER = '#4FA3E0';

const thai: Sticker[] = [
  sticker('splash', 'thai', [
    { d: ellipse(50, 80, 42, 12), fill: WATER, alpha: 0.35 },
    { d: 'M18 80C20 60 30 56 34 70C36 46 44 40 50 64C56 40 64 46 66 70C70 56 80 60 82 80Z', fill: WATER },
    { d: drop(18, 40, 8, -40) + drop(36, 22, 7, -15) + drop(64, 22, 7, 15) + drop(82, 40, 8, 40) + drop(50, 12, 6, 0), fill: WATER },
    { d: ellipse(42, 70, 3, 6, 10), fill: WHITE, alpha: 0.6 },
  ]),
  sticker('drops', 'thai', [
    { d: drop(34, 58, 26) + drop(72, 34, 18) + drop(76, 80, 12), fill: WATER },
    { d: ellipse(26, 64, 4, 8, 15) + ellipse(67, 38, 3, 5, 15) + ellipse(73, 83, 2, 3.5, 15), fill: WHITE, alpha: 0.7 },
  ]),
  sticker('watergun', 'thai', [
    { d: drop(8, 30, 5, -90) + drop(4, 44, 4, -100) + drop(14, 18, 4, -70), fill: WATER },
    { d: rect(18, 36, 66, 20, 8), fill: ORANGE, ...OUT },
    { d: rect(10, 40, 12, 10, 3), fill: '#2B59C3', ...OUT },
    { d: 'M58 54L74 54L70 88L54 88Z', fill: ORANGE, ...OUT },
    { d: circle(56, 26, 14), fill: '#8CC7E8', ...OUT },
    { d: rect(53, 34, 6, 6), fill: '#2B59C3' },
    { d: 'M48 56C48 66 54 70 60 68', stroke: INK, width: 3 },
    { d: ellipse(52, 22, 4, 3, -30), fill: WHITE, alpha: 0.7 },
  ]),
  sticker('plumeria', 'thai', [
    {
      d: Array.from({ length: 5 }, (_, i) => petal(50, 50, 44, 34, i * 72 + 12)).join(''),
      fill: WHITE,
      stroke: '#E6C86E',
      width: 2,
    },
    { d: Array.from({ length: 5 }, (_, i) => petal(50, 50, 22, 14, i * 72 + 12)).join(''), fill: '#FFD54F' },
    { d: circle(50, 50, 5), fill: '#F7A42C' },
  ]),
  sticker('garland', 'thai', [
    { d: ring(50, 38, 30, 18, 6.5), fill: WHITE, stroke: '#D9D2C8', width: 1.5 },
    { d: circle(50, 72, 10), fill: RED },
    { d: arc(50, 72, 5, 0, 300), stroke: '#B02E3F', width: 2 },
    { d: line(44, 80, 40, 96) + line(50, 82, 50, 98) + line(56, 80, 60, 96), stroke: GOLD, width: 3 },
    { d: ellipse(38, 70, 7, 3, -30) + ellipse(62, 70, 7, 3, 30), fill: GREEN },
  ]),
  sticker('krathong', 'thai', [
    { d: ellipse(50, 88, 46, 8), fill: WATER, alpha: 0.35 },
    { d: 'M8 66L92 66L80 86L20 86Z', fill: '#5FA36A', stroke: DARK_GREEN, width: 2 },
    { d: Array.from({ length: 7 }, (_, i) => poly(12 + i * 12, 66, 18 + i * 12, 56, 24 + i * 12, 66)).join(''), fill: GREEN, stroke: DARK_GREEN, width: 1.5 },
    { d: petal(50, 64, 30, 18, 0) + petal(50, 64, 28, 16, -32) + petal(50, 64, 28, 16, 32) + petal(50, 64, 24, 14, -62) + petal(50, 64, 24, 14, 62), fill: '#F7B8C8', stroke: '#E0809A', width: 1.5 },
    { d: circle(50, 46, 7), fill: '#FFB627' },
    { d: rect(46.5, 18, 7, 22, 2), fill: CREAM, stroke: '#D9C9A8', width: 1 },
    { d: drop(50, 12, 6), fill: '#FFB627' },
    { d: drop(50, 13, 3), fill: '#FFF2B0' },
    { d: line(36, 46, 30, 22) + line(64, 46, 70, 22), stroke: '#8A5A3B', width: 1.5 },
    { d: circle(30, 21, 1.8) + circle(70, 21, 1.8), fill: RED },
  ]),
  sticker('lantern', 'thai', [
    { d: circle(50, 46, 46), fill: '#FFD58A', alpha: 0.25 },
    { d: 'M22 26C26 8 74 8 78 26L68 78C60 82 40 82 32 78Z', fill: '#F7A42C' },
    { d: 'M32 26C36 16 64 16 68 26L62 72C56 75 44 75 38 72Z', fill: '#FFD58A', alpha: 0.7 },
    { d: line(30, 26, 38, 76) + line(70, 26, 62, 76), stroke: '#E08A1E', width: 1.5, alpha: 0.7 },
    { d: rect(31, 76, 38, 5, 2.5), fill: '#C46A1E' },
    { d: drop(50, 88, 6), fill: '#FF7A1A' },
    { d: drop(50, 89, 3), fill: '#FFF2B0' },
  ]),
  sticker('lotus', 'thai', [
    { d: ellipse(50, 86, 40, 8), fill: GREEN },
    { d: petal(50, 82, 50, 22, -58) + petal(50, 82, 50, 22, 58), fill: '#F7B8C8', stroke: '#E0809A', width: 1.5 },
    { d: petal(50, 82, 60, 24, -28) + petal(50, 82, 60, 24, 28), fill: '#F49AB3', stroke: '#D9708E', width: 1.5 },
    { d: petal(50, 82, 70, 26, 0), fill: '#F7B8C8', stroke: '#D9708E', width: 1.5 },
  ]),
  sticker('elephant', 'thai', [
    { d: rect(26, 62, 11, 28, 4) + rect(42, 62, 11, 28, 4) + rect(60, 62, 11, 28, 4) + rect(74, 60, 10, 28, 4), fill: '#8E96A3' },
    { d: ellipse(56, 52, 34, 24), fill: '#9AA0A8' },
    { d: 'M90 46C96 50 96 60 92 64', stroke: '#8E96A3', width: 3 },
    { d: circle(28, 40, 20), fill: '#9AA0A8' },
    { d: 'M14 44C6 54 6 70 14 80', stroke: '#9AA0A8', width: 10 },
    { d: ellipse(38, 42, 12, 16, 10), fill: '#B4BAC2' },
    { d: rect(46, 30, 26, 14, 3), fill: '#D94135' },
    { d: rect(46, 40, 26, 4), fill: GOLD },
    { d: circle(22, 36, 2.5), fill: INK },
    { d: arc(22, 52, 6, 30, 110), stroke: WHITE, width: 3 },
  ]),
  sticker('fullmoon', 'thai', [
    { d: circle(50, 50, 48), fill: '#FFE8A3', alpha: 0.25 },
    { d: circle(50, 50, 40), fill: '#FFE8A3' },
    { d: circle(36, 40, 7) + circle(60, 62, 9) + circle(64, 34, 4.5) + circle(38, 66, 4), fill: '#F2D27A' },
  ]),
  sticker('chinese', 'thai', [
    { d: line(50, 2, 50, 12), stroke: GOLD, width: 3 },
    { d: rect(36, 10, 28, 8, 2) + rect(36, 80, 28, 8, 2), fill: GOLD },
    { d: ellipse(50, 49, 38, 33), fill: '#D7263D' },
    { d: ellipse(50, 49, 22, 33) + ellipse(50, 49, 8, 33), fill: 'none', stroke: '#A8182C', width: 2.5 },
    { d: line(50, 88, 50, 98) + line(44, 88, 42, 98) + line(56, 88, 58, 98), stroke: GOLD, width: 2.5 },
  ]),
  sticker('coconut', 'thai', [
    { d: 'M62 30L80 4', stroke: '#F4A6B8', width: 5 },
    { d: circle(50, 60, 36), fill: '#7A5230' },
    { d: ellipse(50, 34, 26, 9), fill: '#F7F1E3' },
    { d: ellipse(50, 34, 18, 5), fill: '#E8DCC4' },
    { d: ellipse(36, 64, 8, 14, 20), fill: WHITE, alpha: 0.15 },
    { d: ring(26, 32, 7, 5, 5), fill: PINK },
    { d: circle(26, 32, 3.5), fill: YELLOW },
  ]),
];

// ---- Party and seasons ---------------------------------------------------------------------------------

const party: Sticker[] = [
  sticker(
    'firework',
    'party',
    [
      { d: rays(50, 50, 14, 40, 12), stroke: 'tint', width: 4.5 },
      { d: rays(50, 50, 22, 30, 12, -75), stroke: 'tint', width: 3, alpha: 0.6 },
      { d: ring(50, 50, 46, 12, 3.5), fill: 'tint' },
      { d: circle(50, 50, 6), fill: 'tint' },
    ],
    YELLOW,
  ),
  sticker('confetti', 'party', [
    { d: turnedRect(18, 20, 10, 5, 30) + turnedRect(70, 70, 10, 5, -20) + circle(80, 22, 4), fill: RED },
    { d: turnedRect(48, 14, 10, 5, -40) + turnedRect(28, 76, 10, 5, 60) + circle(56, 48, 3.5), fill: YELLOW },
    { d: turnedRect(84, 46, 10, 5, 75) + turnedRect(14, 50, 10, 5, -10) + circle(46, 86, 4), fill: BLUE },
    { d: 'M30 40Q34 34 38 40Q42 46 46 40M62 28Q66 22 70 28Q74 34 78 28M56 82Q60 76 64 82Q68 88 72 82', stroke: '#5CC46E', width: 3 },
    { d: star(70, 50, 5, 6, 2.5) + star(26, 58, 5, 5, 2), fill: PINK },
  ]),
  sticker(
    'balloon',
    'party',
    [
      { d: 'M50 76C46 84 58 88 52 98', stroke: INK, width: 2 },
      { d: ellipse(50, 40, 30, 36), fill: 'tint' },
      { d: poly(45, 80, 55, 80, 50, 74), fill: 'tint' },
      { d: ellipse(38, 26, 6, 10, 30), fill: WHITE, alpha: 0.45 },
    ],
    RED,
  ),
  sticker(
    'gift',
    'party',
    [
      { d: rect(14, 46, 72, 48, 3), fill: '#2B59C3' },
      { d: rect(8, 32, 84, 16, 3), fill: '#3E7CB1' },
      { d: rect(44, 32, 12, 62), fill: 'tint' },
      { d: 'M50 32C40 10 22 16 30 28C34 32 44 32 50 32ZM50 32C60 10 78 16 70 28C66 32 56 32 50 32Z', fill: 'tint' },
    ],
    YELLOW,
  ),
  sticker('partyhat', 'party', [
    { d: poly(50, 10, 84, 90, 16, 90), fill: '#8CC7E8' },
    { d: poly(43.6, 25, 56.4, 25, 61.5, 37, 38.5, 37) + poly(33.4, 49, 66.6, 49, 71.7, 61, 28.3, 61) + poly(23.2, 73, 76.8, 73, 81.9, 85, 18.1, 85), fill: PINK },
    { d: circle(50, 9, 8), fill: YELLOW },
    { d: rect(12, 86, 76, 8, 4), fill: GOLD },
  ]),
  sticker('popper', 'party', [
    { d: poly(6, 94, 40, 40, 60, 60), fill: GOLD },
    { d: poly(17, 76, 30, 56, 40, 66, 24, 84) + poly(10, 88, 14, 80, 20, 86), fill: RED },
    { d: turnedRect(62, 26, 9, 4, 30) + circle(84, 34, 3.5) + turnedRect(78, 58, 9, 4, -30), fill: RED },
    { d: turnedRect(48, 14, 9, 4, -50) + circle(74, 12, 3.5) + turnedRect(90, 50, 9, 4, 70), fill: BLUE },
    { d: star(66, 42, 5, 6, 2.5) + circle(90, 18, 3), fill: YELLOW },
    { d: 'M52 30Q56 24 60 30Q64 36 68 30', stroke: '#5CC46E', width: 3 },
  ]),
  sticker('cake', 'party', [
    { d: rect(46, 18, 8, 20, 2), fill: '#8CC7E8' },
    { d: drop(50, 10, 6), fill: '#FFB627' },
    { d: rect(12, 38, 76, 54, 6), fill: '#F7D9C4' },
    { d: rect(12, 60, 76, 8), fill: PINK },
    { d: 'M12 44C12 38 16 36 22 36H78C84 36 88 38 88 44V50C84 56 80 50 76 54C72 58 68 50 62 54C56 58 52 50 46 54C40 58 36 50 30 54C24 58 20 50 12 52Z', fill: WHITE },
    { d: circle(24, 78, 2.5) + circle(44, 82, 2.5) + circle(66, 78, 2.5) + circle(80, 84, 2.5), fill: RED },
  ]),
  sticker('rose', 'party', [
    { d: 'M50 54C52 70 48 84 50 98', stroke: DARK_GREEN, width: 4 },
    { d: ellipse(38, 76, 12, 6, -30) + ellipse(62, 70, 12, 6, 30), fill: GREEN },
    { d: 'M24 34C22 14 40 6 50 14C60 6 78 14 76 34C76 50 62 58 50 58C38 58 24 50 24 34Z', fill: '#D7263D' },
    { d: 'M40 24C44 18 58 18 60 28C62 38 48 42 44 34C42 30 48 28 50 30', stroke: '#A8182C', width: 3 },
    { d: 'M28 38C34 48 46 50 54 46M72 36C68 46 60 50 54 46', stroke: '#A8182C', width: 2.5 },
  ]),
  sticker('letter', 'party', [
    { d: rect(6, 22, 88, 60, 5), fill: '#FFF6EA', stroke: '#D9C9A8', width: 2 },
    { d: line(8, 26, 50, 58, 92, 26), stroke: '#D9C9A8', width: 2.5 },
    { d: heart(50, 58, 12), fill: RED },
  ]),
  sticker('hearts', 'party', [
    { d: heart(40, 54, 34, -12), fill: PINK },
    { d: heart(70, 34, 22, 14), fill: RED },
    { d: ellipse(28, 40, 6, 3.5, -50), fill: WHITE, alpha: 0.5 },
  ]),
  sticker(
    'snowflake',
    'party',
    [
      {
        d:
          rays(50, 50, 0, 44, 6) +
          Array.from({ length: 6 }, (_, i) => {
            const a = -90 + i * 60;
            const at = (r: number, da: number) => {
              const t = ((a + da) * Math.PI) / 180;
              return [50 + Math.cos(t) * r, 50 + Math.sin(t) * r] as const;
            };
            const [x1, y1] = at(28, 0);
            const [x2, y2] = at(36, 14);
            const [x3, y3] = at(36, -14);
            return line(x2, y2, x1, y1, x3, y3);
          }).join(''),
        stroke: 'tint',
        width: 5,
      },
    ],
    '#8CC7E8',
  ),
  sticker('tree', 'party', [
    { d: rect(44, 80, 12, 14, 2), fill: BROWN },
    { d: poly(50, 14, 76, 44, 24, 44) + poly(50, 30, 82, 64, 18, 64) + poly(50, 46, 88, 84, 12, 84), fill: '#3F8A57' },
    { d: circle(38, 54, 4) + circle(62, 72, 4) + circle(58, 40, 3.5), fill: RED },
    { d: circle(64, 54, 3.5) + circle(32, 74, 4) + circle(46, 66, 3), fill: YELLOW },
    { d: star(50, 12, 5, 11, 4.5), fill: YELLOW },
  ]),
];

// ---- Nature -------------------------------------------------------------------------------------------------

const nature: Sticker[] = [
  sticker(
    'leaf',
    'nature',
    [
      { d: 'M14 86C10 40 40 10 90 12C92 60 62 92 14 86Z', fill: 'tint' },
      { d: 'M14 86C36 62 56 42 80 22M40 60L36 40M52 48L66 50M60 38L58 26', stroke: '#000000', width: 2.5, alpha: 0.2 },
    ],
    GREEN,
  ),
  sticker('sakura', 'nature', [
    {
      d: Array.from({ length: 5 }, (_, i) => {
        const p = (x: number, y: number) => turn([50 + x, 50 + y], 50, 50, i * 72);
        const pts = [p(0, 0), p(16, -16), p(14, -40), p(4, -44), p(0, -38), p(-4, -44), p(-14, -40), p(-16, -16)];
        const [s, ...rest] = pts;
        return `M${s![0]} ${s![1]}C${rest[0]![0]} ${rest[0]![1]} ${rest[1]![0]} ${rest[1]![1]} ${rest[2]![0]} ${rest[2]![1]}L${rest[3]![0]} ${rest[3]![1]}L${rest[4]![0]} ${rest[4]![1]}C${rest[5]![0]} ${rest[5]![1]} ${rest[6]![0]} ${rest[6]![1]} ${s![0]} ${s![1]}Z`;
      }).join(''),
      fill: '#F9C5D5',
      stroke: '#EE9AB5',
      width: 1.5,
    },
    { d: rays(50, 50, 4, 14, 5, -54), stroke: '#E0607E', width: 2 },
    { d: circle(50, 50, 5), fill: '#FFE08A' },
  ]),
  sticker('mushroom', 'nature', [
    { d: 'M38 56C36 72 34 84 36 92H64C66 84 64 72 62 56Z', fill: CREAM, stroke: '#D9C9A8', width: 2 },
    { d: 'M8 58C8 30 28 12 50 12C72 12 92 30 92 58C80 62 20 62 8 58Z', fill: '#E4572E' },
    { d: circle(30, 34, 7) + circle(54, 26, 6) + circle(72, 42, 7) + circle(48, 48, 4.5), fill: WHITE },
  ]),
  sticker('cactus', 'nature', [
    { d: rect(22, 76, 56, 20, 4), fill: '#D9824B' },
    { d: rect(38, 18, 24, 62, 12), fill: '#5FA36A' },
    { d: 'M38 56H26A8 8 0 0 1 18 48V34', stroke: '#5FA36A', width: 10 },
    { d: 'M62 48H72A8 8 0 0 0 80 40V28', stroke: '#5FA36A', width: 10 },
    { d: line(50, 26, 50, 72), stroke: DARK_GREEN, width: 2, alpha: 0.5 },
    { d: circle(50, 16, 6), fill: PINK },
  ]),
];

/** Every sticker, in the order of the gallery. */
export const STICKERS: readonly Sticker[] = [...basic, ...cute, ...camera, ...thai, ...party, ...nature];

/** The stickers of the free library. */
export const FREE_STICKERS: ReadonlySet<string> = new Set(basic.map((item) => item.id));

export function findSticker(id: string): Sticker | undefined {
  return STICKERS.find((item) => item.id === id);
}

/** A 2D context of a canvas element or of an `OffscreenCanvas`. */
type Context = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

const paths = new Map<string, Path2D>();
function path(d: string): Path2D {
  let found = paths.get(d);
  if (!found) {
    found = new Path2D(d);
    paths.set(d, found);
  }
  return found;
}

/** Draws a sticker in its box of 100 by 100 at the origin of the context; `tint` colors its tint parts. */
export function drawSticker(context: Context, item: Sticker, tint: string | null) {
  const color = tint ?? item.tint ?? INK;
  context.save();
  context.lineCap = 'round';
  context.lineJoin = 'round';
  const base = context.globalAlpha;
  for (const part of item.parts) {
    const shape = path(part.d);
    context.globalAlpha = base * (part.alpha ?? 1);
    if (part.fill && part.fill !== 'none') {
      context.fillStyle = part.fill === 'tint' ? color : part.fill;
      context.fill(shape, part.evenodd ? 'evenodd' : 'nonzero');
    }
    if (part.stroke) {
      context.strokeStyle = part.stroke === 'tint' ? color : part.stroke;
      context.lineWidth = part.width ?? 2;
      context.stroke(shape);
    }
  }
  context.restore();
}
