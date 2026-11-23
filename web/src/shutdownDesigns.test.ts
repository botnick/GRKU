import { describe, expect, it } from 'vitest';
import {
  defaultDesigns,
  DESIGN_HEIGHT,
  DESIGN_TEXT_MAX,
  DESIGN_WIDTH,
  designChoice,
  DESIGNS,
  drawDesign,
  FREE_DESIGNS,
  limitText,
  loadDesigns,
  pixelFontHas,
  saveDesigns,
  type DesignContext,
} from './shutdownDesigns';
import { loadAllStrings, STRINGS } from './i18n';
import { captionOf } from './studio/captions';

await loadAllStrings();

/** A 2D context that records the fills and the text, and draws nothing. */
function stubContext() {
  const calls: { name: string; args: unknown[] }[] = [];
  const state: Record<string | symbol, unknown> = { font: '10px sans-serif' };
  const context = new Proxy(state, {
    get(target, name) {
      if (name in target) return target[name];
      if (name === 'measureText') {
        return (text: string) => {
          const size = Number(/(\d+(?:\.\d+)?)px/.exec(String(target.font))?.[1] ?? 10);
          return { width: [...text].length * size * 0.55 };
        };
      }
      return (...args: unknown[]) => void calls.push({ name: String(name), args });
    },
    set(target, name, value) {
      target[name] = value;
      return true;
    },
  });
  return { context: context as unknown as DesignContext, calls };
}

describe('the designs of the shutdown screen', () => {
  it('draws every design in every theme over the whole screen of 720 by 480', () => {
    expect(DESIGNS.length).toBeGreaterThanOrEqual(8);
    expect(new Set(DESIGNS.map((design) => design.id)).size).toBe(DESIGNS.length);
    for (const design of DESIGNS) {
      expect(design.swatches.length).toBeGreaterThanOrEqual(3);
      expect(design.swatches.length).toBeLessThanOrEqual(5);
      expect([...design.text].length).toBeLessThanOrEqual(DESIGN_TEXT_MAX);
      for (const text of [design.text, '', 'สวัสดีตอนเย็นนะทุกคน', 'W'.repeat(DESIGN_TEXT_MAX)]) {
        for (let theme = 0; theme < design.swatches.length; theme++) {
          const { context, calls } = stubContext();
          expect(() => drawDesign(context, { id: design.id, theme, text })).not.toThrow();
          // The first fill covers the screen, so no pixel of the file stays transparent.
          const first = calls.find((call) => call.name === 'fillRect');
          expect(first?.args, design.id).toEqual([0, 0, DESIGN_WIDTH, DESIGN_HEIGHT]);
          // The text of the user stays above the shot counts of the camera.
          for (const call of calls.filter((call) => call.name === 'fillText')) {
            expect(call.args[2] as number, `${design.id}: ${String(call.args[0])}`).toBeLessThanOrEqual(320);
          }
        }
      }
    }
  });

  it('tells the Studio where it draws its text, so the text lifts off as a layer', () => {
    for (const design of DESIGNS) {
      for (let theme = 0; theme < design.swatches.length; theme++) {
        const caption = captionOf(design.id, theme)!;
        expect(caption, design.id).toBeDefined();
        expect(caption.y, design.id).toBeLessThanOrEqual(320);
        expect(caption.color, design.id).toMatch(/^#[0-9A-Fa-f]{6}$/);
        // The pixel font draws blocks, a spaced or turned text draws in parts: the others draw at the caption.
        if (caption.font === 'pixel' || caption.spacing || caption.rotation) continue;
        const { context, calls } = stubContext();
        drawDesign(context, { id: design.id, theme, text: 'QX' });
        const call = calls.find((c) => c.name === 'fillText' && c.args[0] === 'QX');
        expect(call?.args.slice(1, 3), design.id).toEqual([caption.x, caption.y]);
        expect(String((context as unknown as { fillStyle: string }).fillStyle).length).toBeGreaterThan(0);
      }
    }
    expect(FREE_DESIGNS.every((id) => DESIGNS.some((design) => design.id === id))).toBe(true);
  });

  it('names each design in the page text', () => {
    expect(Object.keys(STRINGS.en.shutdown.designs).sort()).toEqual(DESIGNS.map((design) => design.id).sort());
  });

  it('keeps the text of a design short', () => {
    expect(limitText('a'.repeat(30))).toBe('a'.repeat(DESIGN_TEXT_MAX));
    expect(limitText('one\ntwo')).toBe('one two');
    // A Thai letter with its marks counts once.
    expect(limitText('ที่'.repeat(25))).toBe('ที่'.repeat(DESIGN_TEXT_MAX));
    expect(pixelFontHas('Game over!')).toBe(true);
    expect(pixelFontHas('ลาก่อน')).toBe(false);
  });

  it('keeps the chosen design, and the text and the colors of each, in this browser', () => {
    const items = new Map<string, string>();
    const storage = { getItem: (key: string) => items.get(key) ?? null, setItem: (key: string, value: string) => void items.set(key, value) };
    expect(loadDesigns(storage)).toEqual(defaultDesigns());
    expect(designChoice(defaultDesigns())).toEqual({ id: DESIGNS[0].id, theme: 0, text: DESIGNS[0].text });

    saveDesigns(storage, { id: 'cat', themes: { cat: 2, moon: 1 }, texts: { cat: 'Mochi', moon: '' } });
    const state = loadDesigns(storage);
    expect(designChoice(state)).toEqual({ id: 'cat', theme: 2, text: 'Mochi' });
    // An empty text stays empty, and a design never changed keeps its own.
    expect(designChoice(state, 'moon')).toEqual({ id: 'moon', theme: 1, text: '' });
    expect(designChoice(state, 'pixel')).toEqual({ id: 'pixel', theme: 0, text: 'GAME OVER' });

    // What no longer fits is left out.
    items.set('grku.shutdownDesign', JSON.stringify({ id: 'gone', themes: { cat: 99, gone: 1, moon: 1.5 }, texts: { cat: 7, sun: 'x'.repeat(40) } }));
    expect(loadDesigns(storage)).toEqual({ id: DESIGNS[0].id, themes: {}, texts: { sun: 'x'.repeat(DESIGN_TEXT_MAX) } });
    items.set('grku.shutdownDesign', '{not json');
    expect(loadDesigns(storage)).toEqual(defaultDesigns());
    expect(loadDesigns(null)).toEqual(defaultDesigns());
  });
});
