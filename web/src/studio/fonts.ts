/**
 * The fonts of the Studio. Inter, IBM Plex Sans Condensed, and JetBrains Mono come with the site;
 * the Thai faces load only here, when a text uses them, so the rest of the site never downloads
 * them. All are under the SIL Open Font License; the pixel font is drawn in code.
 */
import type { FontId, TextLayer } from './model';

const OTHER = `"IBM Plex Sans Thai", "Noto Sans JP", "Noto Sans SC", "Noto Sans TC", "Noto Sans KR", system-ui, sans-serif`;

export interface StudioFont {
  id: FontId;
  /** The name of the face, as its designers wrote it. */
  name: string;
  family: string;
  regular: number;
  bold: number;
  /** Whether the face draws Thai itself, not through the fallback. */
  thai: boolean;
  /** Loads the styles of the face. */
  load?: () => Promise<unknown>;
}

export const FONTS: readonly StudioFont[] = [
  { id: 'sans', name: 'Inter', family: `Inter, ${OTHER}`, regular: 500, bold: 800, thai: false },
  { id: 'condensed', name: 'Plex Condensed', family: `"IBM Plex Sans Condensed", ${OTHER}`, regular: 700, bold: 700, thai: false },
  { id: 'mono', name: 'JetBrains Mono', family: `"JetBrains Mono", ${OTHER}`, regular: 500, bold: 500, thai: false },
  { id: 'pixel', name: 'Pixel', family: 'monospace', regular: 400, bold: 400, thai: false },
  {
    id: 'mali',
    name: 'Mali',
    family: `Mali, ${OTHER}`,
    regular: 500,
    bold: 700,
    thai: true,
    load: () => Promise.all([import('@fontsource/mali/500.css'), import('@fontsource/mali/700.css')]),
  },
  { id: 'itim', name: 'Itim', family: `Itim, ${OTHER}`, regular: 400, bold: 400, thai: true, load: () => import('@fontsource/itim/400.css') },
  { id: 'sriracha', name: 'Sriracha', family: `Sriracha, ${OTHER}`, regular: 400, bold: 400, thai: true, load: () => import('@fontsource/sriracha/400.css') },
  { id: 'chonburi', name: 'Chonburi', family: `Chonburi, ${OTHER}`, regular: 400, bold: 400, thai: true, load: () => import('@fontsource/chonburi/400.css') },
];

export function fontOf(id: FontId): StudioFont {
  return FONTS.find((font) => font.id === id) ?? FONTS[0]!;
}

export const hasBold = (font: StudioFont) => font.bold !== font.regular;

/** The CSS font of a text layer at `size`. */
export function cssFont(layer: Pick<TextLayer, 'font' | 'bold'>, size: number): string {
  const font = fontOf(layer.font);
  return `${layer.bold ? font.bold : font.regular} ${size}px ${font.family}`;
}

const loaded = new Map<FontId | 'thai', Promise<unknown>>();

function once(key: FontId | 'thai', load: () => Promise<unknown>) {
  let found = loaded.get(key);
  if (!found) {
    found = load().catch(() => loaded.delete(key));
    loaded.set(key, found);
  }
  return found;
}

/** Loads the styles of a face, and of the Thai fallback, once. */
export function loadFontStyles(id: FontId): Promise<unknown> {
  const font = fontOf(id);
  const own = font.load ? once(id, font.load) : Promise.resolve();
  const thai = once('thai', () => Promise.all([import('@fontsource/ibm-plex-sans-thai/thai-500.css'), import('@fontsource/ibm-plex-sans-thai/thai-700.css')]));
  return Promise.all([own, thai]);
}

/** Loads the faces that the text layers draw with, so a picture draws the same in the preview and in the file. */
export async function prepareFonts(layers: readonly TextLayer[]): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  await Promise.all(
    layers.map(async (layer) => {
      if (layer.font === 'pixel') return;
      await loadFontStyles(layer.font);
      await document.fonts.load(cssFont(layer, 40), `Aa ${layer.text}`).catch(() => []);
    }),
  );
}
