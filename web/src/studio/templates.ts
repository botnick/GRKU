/**
 * The starting points of the Studio: a blank picture, the ready-made designs of the shutdown
 * screen (their art as the background, their text lifted off as a text layer), and the seasonal
 * pictures, built of layers from the start.
 */
import { DESIGNS, FREE_DESIGNS, findDesign, type Design } from '../shutdownDesigns';
import { captionOf, type Caption } from './captions';
import { emptyDoc, pixelBlock, stickerLayer, textLayer, type Layer, type StudioDoc, type TextLayer } from './model';

export interface Template {
  id: string;
  free: boolean;
  /** A seasonal picture of GRKU Plus. */
  season: boolean;
  build: () => StudioDoc;
}

/** The text layer of a design's caption, at the place where the design draws it. */
export function captionLayer(caption: Caption, text: string): TextLayer {
  const size = caption.size;
  return textLayer({
    text,
    font: caption.font,
    size,
    bold: caption.weight >= 700,
    color: caption.color.toUpperCase(),
    // The design gives a baseline; a layer is placed by its center.
    x: Math.round(caption.x * 10) / 10,
    y: Math.round((caption.font === 'pixel' ? caption.y + 3.5 * pixelBlock(size) : caption.y - 0.35 * size) * 10) / 10,
    rotation: Math.round((((caption.rotation ?? 0) * 180) / Math.PI) * 10) / 10,
    maxWidth: caption.maxWidth,
    spacing: caption.spacing ?? 0,
  });
}

/** A design as a document: its art in `theme`, and its text as a layer. */
export function designDoc(design: Design, theme = 0, text = design.text): StudioDoc {
  return {
    ...emptyDoc(),
    background: { kind: 'design', design: design.id, theme },
    layers: [captionLayer(captionOf(design.id, theme)!, text)],
    template: design.id,
  };
}

/** The number of themes of a design, 0 for none: what `parse` needs to check a design background. */
export const designThemes = (id: string) => findDesign(id)?.swatches.length ?? 0;

/**
 * The words that the seasonal pictures draw in Thai. They are art, the same on every page, and
 * came through Gemini as the other Thai text of the site.
 */
export const SEASON_WORDS = {
  songkran: 'สุขสันต์วันสงกรานต์',
  loykrathong: 'สุขสันต์วันลอยกระทง',
  newyear: 'สวัสดีปีใหม่',
  christmas: 'สุขสันต์วันคริสต์มาส',
} as const;

const doc = (template: string, background: StudioDoc['background'], layers: Layer[]): StudioDoc => ({ ...emptyDoc(), background, layers, template });

const SEASONS: Template[] = [
  {
    id: 'songkran',
    free: false,
    season: true,
    build: () =>
      doc('songkran', { kind: 'gradient', from: '#C8EEFF', to: '#4FA3E0', angle: 90 }, [
        stickerLayer('splash', { x: 104, y: 262, size: 150 }),
        stickerLayer('splash', { x: 620, y: 262, size: 140, flip: true }),
        stickerLayer('drops', { x: 470, y: 60, size: 64, rotation: 12 }),
        stickerLayer('plumeria', { x: 92, y: 80, size: 110, rotation: -14 }),
        stickerLayer('plumeria', { x: 176, y: 44, size: 64, rotation: 20 }),
        stickerLayer('watergun', { x: 616, y: 84, size: 120, rotation: -12, flip: true }),
        textLayer({ text: SEASON_WORDS.songkran, font: 'mali', bold: true, size: 52, color: '#FFFFFF', outline: '#2B59C3', x: 360, y: 190, maxWidth: 560 }),
        textLayer({ text: 'SONGKRAN', font: 'sans', bold: true, size: 22, color: '#1F3B73', spacing: 8, x: 360, y: 258 }),
      ]),
  },
  {
    id: 'loykrathong',
    free: false,
    season: true,
    build: () =>
      doc('loykrathong', { kind: 'gradient', from: '#0E1530', to: '#2C3E74', angle: 90 }, [
        stickerLayer('fullmoon', { x: 616, y: 76, size: 116 }),
        stickerLayer('lantern', { x: 84, y: 70, size: 64, rotation: -6 }),
        stickerLayer('lantern', { x: 172, y: 40, size: 40, rotation: 8 }),
        stickerLayer('lantern', { x: 120, y: 200, size: 34, rotation: -10 }),
        stickerLayer('lantern', { x: 590, y: 210, size: 40, rotation: 6 }),
        stickerLayer('lantern', { x: 486, y: 42, size: 36, rotation: -4 }),
        stickerLayer('sparkle', { x: 300, y: 50, size: 34, tint: '#FFE8A3' }),
        stickerLayer('sparkle', { x: 430, y: 92, size: 24, tint: '#FFE8A3' }),
        stickerLayer('krathong', { x: 360, y: 250, size: 160 }),
        textLayer({ text: SEASON_WORDS.loykrathong, font: 'chonburi', bold: false, size: 44, color: '#FFE8A3', x: 360, y: 128, maxWidth: 600 }),
      ]),
  },
  {
    id: 'newyear',
    free: false,
    season: true,
    build: () =>
      doc('newyear', { kind: 'solid', color: '#14141F' }, [
        stickerLayer('firework', { x: 110, y: 96, size: 150, tint: '#FFC857' }),
        stickerLayer('firework', { x: 612, y: 84, size: 130, tint: '#FF5C8A' }),
        stickerLayer('firework', { x: 520, y: 250, size: 80, tint: '#8CC7E8' }),
        stickerLayer('confetti', { x: 190, y: 262, size: 96 }),
        textLayer({ text: 'Happy New Year', font: 'sriracha', bold: false, size: 66, color: '#FFE8A3', x: 360, y: 162, maxWidth: 620 }),
        textLayer({ text: SEASON_WORDS.newyear, font: 'mali', bold: true, size: 40, color: '#FFFFFF', x: 360, y: 244 }),
      ]),
  },
  {
    id: 'valentine',
    free: false,
    season: true,
    build: () =>
      doc('valentine', { kind: 'pattern', pattern: 'hearts', color: '#FFE3EE', ink: '#FFCADB' }, [
        stickerLayer('hearts', { x: 118, y: 236, size: 130, rotation: -8 }),
        stickerLayer('rose', { x: 604, y: 220, size: 140, rotation: 14 }),
        stickerLayer('heart', { x: 600, y: 70, size: 56, rotation: 12, tint: '#F06FA4' }),
        stickerLayer('sparkle', { x: 120, y: 74, size: 56, tint: '#F06FA4' }),
        textLayer({ text: 'Love you', font: 'sriracha', bold: false, size: 92, color: '#D7263D', x: 360, y: 150, maxWidth: 560 }),
        textLayer({ text: "Happy Valentine's Day", font: 'sans', bold: false, size: 24, color: '#A13D5A', spacing: 2, x: 360, y: 232 }),
      ]),
  },
];

/**
 * The years that the holiday pictures name, for the season of `date`: the Christmas of this year
 * (of last year in January), and the New Year that comes next (this one in January). The Thai
 * picture adds 543 for the Buddhist year (2027 is 2570).
 */
export function holidayYears(date = new Date()): { christmas: number; newYear: number } {
  const year = date.getFullYear();
  return date.getMonth() === 0 ? { christmas: year - 1, newYear: year } : { christmas: year, newYear: year + 1 };
}

/**
 * The Christmas and New Year pictures: the GRKU mascot painted for the season (`art`) under
 * text in IBM Plex, and two plain ones. Every word sits above the bar of the shot counts.
 */
const HOLIDAYS: Template[] = [
  {
    id: 'xmas-santa',
    free: false,
    season: true,
    build: () =>
      doc('xmas-santa', { kind: 'art', art: 'xmas-santa' }, [
        textLayer({ text: 'Merry', font: 'condensed', size: 60, color: '#FFF6EA', outline: '#A3171D', spacing: 2, x: 162, y: 168 }),
        textLayer({ text: 'Christmas', font: 'condensed', size: 60, color: '#FFF6EA', outline: '#A3171D', spacing: 2, x: 162, y: 230 }),
      ]),
  },
  {
    id: 'xmas-gift',
    free: false,
    season: true,
    build: () =>
      doc('xmas-gift', { kind: 'art', art: 'xmas-gift' }, [
        textLayer({ text: SEASON_WORDS.christmas, font: 'condensed', size: 40, color: '#B3262E', x: 560, y: 150, maxWidth: 300 }),
        textLayer({ text: 'MERRY CHRISTMAS', font: 'condensed', size: 18, color: '#7A5A3A', spacing: 6, x: 560, y: 204 }),
      ]),
  },
  {
    id: 'xmas-snow',
    free: false,
    season: true,
    build: () =>
      doc('xmas-snow', { kind: 'art', art: 'xmas-snow' }, [
        textLayer({ text: "Season's Greetings", font: 'condensed', size: 46, color: '#FFFFFF', spacing: 1, x: 300, y: 72 }),
      ]),
  },
  {
    id: 'xmas-cocoa',
    free: false,
    season: true,
    build: () =>
      doc('xmas-cocoa', { kind: 'art', art: 'xmas-cocoa' }, [
        textLayer({ text: 'Warm wishes', font: 'condensed', size: 44, color: '#7A4E2D', x: 150, y: 150 }),
        textLayer({ text: 'MERRY CHRISTMAS', font: 'condensed', size: 16, color: '#8A5B36', spacing: 5, x: 150, y: 194 }),
      ]),
  },
  {
    id: 'xmas-minimal',
    free: false,
    season: true,
    build: () =>
      doc('xmas-minimal', { kind: 'solid', color: '#123528' }, [
        stickerLayer('snowflake', { x: 360, y: 86, size: 60, tint: '#D9B46A' }),
        stickerLayer('sparkle', { x: 104, y: 126, size: 26, tint: '#D9B46A' }),
        stickerLayer('sparkle', { x: 556, y: 232, size: 24, tint: '#D9B46A' }),
        textLayer({ text: 'Merry Christmas', font: 'condensed', size: 62, color: '#F3E6C8', spacing: 2, x: 360, y: 182 }),
        textLayer({ text: String(holidayYears().christmas), font: 'condensed', size: 18, color: '#D9B46A', spacing: 10, x: 360, y: 250 }),
      ]),
  },
  {
    id: 'ny-party',
    free: false,
    season: true,
    build: () =>
      doc('ny-party', { kind: 'art', art: 'ny-party' }, [
        textLayer({ text: 'Happy New Year', font: 'condensed', size: 44, color: '#FFE8A3', x: 176, y: 84 }),
        textLayer({ text: String(holidayYears().newYear), font: 'condensed', size: 88, color: '#FFFFFF', spacing: 4, x: 176, y: 164 }),
      ]),
  },
  {
    id: 'ny-balloons',
    free: false,
    season: true,
    build: () =>
      doc('ny-balloons', { kind: 'art', art: 'ny-balloons' }, [
        textLayer({ text: `${SEASON_WORDS.newyear} ${holidayYears().newYear + 543}`, font: 'condensed', size: 46, color: '#B4485A', x: 520, y: 150, maxWidth: 360 }),
        textLayer({ text: `HAPPY NEW YEAR ${holidayYears().newYear}`, font: 'condensed', size: 18, color: '#8A5A4A', spacing: 6, x: 520, y: 206 }),
      ]),
  },
  {
    id: 'ny-minimal',
    free: false,
    season: true,
    build: () =>
      doc('ny-minimal', { kind: 'solid', color: '#0F0F14' }, [
        stickerLayer('sparkle', { x: 540, y: 74, size: 34, tint: '#E2C27A' }),
        stickerLayer('sparkle', { x: 140, y: 222, size: 24, tint: '#E2C27A' }),
        textLayer({ text: String(holidayYears().newYear), font: 'condensed', size: 150, color: '#E2C27A', spacing: 12, x: 360, y: 150 }),
        textLayer({ text: 'HAPPY NEW YEAR', font: 'condensed', size: 22, color: '#F3EBDD', spacing: 12, x: 360, y: 262 }),
      ]),
  },
];

/** The templates that come first from November 15 to January 15 (`holidaySeason`). */
export const HOLIDAY_TEMPLATES: ReadonlySet<string> = new Set([...HOLIDAYS.map((template) => template.id), 'newyear']);

/** Whether `date` (local time) is in the season of Christmas and New Year: November 15 to January 15. */
export function holidaySeason(date: Date): boolean {
  const month = date.getMonth();
  const day = date.getDate();
  return (month === 10 && day >= 15) || month === 11 || (month === 0 && day <= 15);
}

export const TEMPLATES: readonly Template[] = [
  { id: 'blank', free: true, season: false, build: () => ({ ...emptyDoc(), template: 'blank' }) },
  ...DESIGNS.map((design) => ({ id: design.id, free: FREE_DESIGNS.includes(design.id), season: false, build: () => designDoc(design) })),
  ...SEASONS,
  ...HOLIDAYS,
];

export const FREE_TEMPLATES: ReadonlySet<string> = new Set(TEMPLATES.filter((template) => template.free).map((template) => template.id));

export function findTemplate(id: string): Template | undefined {
  return TEMPLATES.find((template) => template.id === id);
}
