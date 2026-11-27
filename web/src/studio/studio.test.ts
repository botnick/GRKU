import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { DESIGNS, FREE_DESIGNS } from '../shutdownDesigns';
import {
  addLayer,
  canAddLayer,
  canRedo,
  canUndo,
  commit,
  duplicateLayer,
  emptyDoc,
  FONT_IDS,
  fontLocked,
  FRAME_IDS,
  frameLocked,
  FREE_LAYERS,
  hitTest,
  history,
  layerBox,
  LIMITS,
  loadDoc,
  moveLayer,
  nudgeLayer,
  parse,
  PATTERN_IDS,
  plusItems,
  redo,
  removeLayer,
  reorderLayer,
  resizeLayer,
  rotateLayer,
  saveDoc,
  serialize,
  snapAngle,
  snapCenter,
  stickerLayer,
  stickerLocked,
  templateLocked,
  textLayer,
  underCameraText,
  undo,
  updateLayer,
  type Catalog,
  type StudioDoc,
} from './model';
import { FONTS } from './fonts';
import { FRAMES, photoCrop, renderDoc, type Context } from './render';
import { FREE_STICKERS, STICKER_GROUPS, STICKERS } from './stickers';
import { designThemes, findTemplate, FREE_TEMPLATES, HOLIDAY_TEMPLATES, holidaySeason, TEMPLATES } from './templates';
import { ART_IDS, artUrl } from './art';
import { STUDIO_STRINGS } from './strings';

/** A 2D context that records the calls and draws nothing. */
function stubContext() {
  const calls: { name: string; args: unknown[] }[] = [];
  const state: Record<string | symbol, unknown> = { font: '10px sans-serif', globalAlpha: 1 };
  const context = new Proxy(state, {
    get(target, name) {
      if (name in target) return target[name];
      if (name === 'measureText') {
        return (text: string) => {
          const size = Number(/(\d+(?:\.\d+)?)px/.exec(String(target.font))?.[1] ?? 10);
          return { width: [...text].length * size * 0.55 };
        };
      }
      if (name === 'createLinearGradient') return () => ({ addColorStop: () => undefined });
      return (...args: unknown[]) => void calls.push({ name: String(name), args });
    },
    set(target, name, value) {
      target[name] = value;
      return true;
    },
  });
  return { context: context as unknown as Context, calls };
}

beforeAll(() => {
  // Node has no Path2D; the stub keeps the path data, so a bad path still shows in a test.
  (globalThis as { Path2D?: unknown }).Path2D ??= class {
    constructor(public d?: string) {}
  };
});

const catalog: Catalog = { freeTemplates: FREE_TEMPLATES, freeStickers: FREE_STICKERS };

describe('the Studio document', () => {
  it('adds, moves, resizes, turns, and deletes layers', () => {
    const text = textLayer({ text: 'Hi' });
    const star = stickerLayer('star');
    let doc = addLayer(addLayer(emptyDoc(), text), star);
    expect(doc.layers.map((layer) => layer.id)).toEqual([text.id, star.id]);

    doc = moveLayer(doc, text.id, 100, 120);
    expect(doc.layers[0]).toMatchObject({ x: 100, y: 120 });
    // A layer's center stays on the screen.
    doc = moveLayer(doc, text.id, -50, 900);
    expect(doc.layers[0]).toMatchObject({ x: 0, y: 480 });
    doc = nudgeLayer(doc, text.id, 10, -10);
    expect(doc.layers[0]).toMatchObject({ x: 10, y: 470 });

    doc = resizeLayer(doc, star.id, 2000);
    expect(doc.layers[1]).toMatchObject({ size: LIMITS.stickerSize[1] });
    doc = resizeLayer(doc, text.id, 1);
    expect(doc.layers[0]).toMatchObject({ size: LIMITS.textSize[0] });

    doc = rotateLayer(doc, star.id, 370);
    expect(doc.layers[1]?.rotation).toBe(10);
    doc = rotateLayer(doc, star.id, -190);
    expect(doc.layers[1]?.rotation).toBe(170);

    doc = updateLayer(doc, text.id, { text: 'Hello\nthere', color: '#abcdef' });
    expect(doc.layers[0]).toMatchObject({ text: 'Hello\nthere', color: '#ABCDEF' });
    // A patch cannot change what a layer is.
    doc = updateLayer(doc, text.id, { type: 'sticker' } as never);
    expect(doc.layers[0]?.type).toBe('text');

    const copy = duplicateLayer(doc, star.id);
    expect(copy.doc.layers).toHaveLength(3);
    expect(copy.doc.layers[2]).toMatchObject({ id: copy.id, sticker: 'star', x: star.x + 24 });

    doc = removeLayer(copy.doc, star.id);
    expect(doc.layers.map((layer) => layer.id)).toEqual([text.id, copy.id]);
  });

  it('moves a layer up and down the stack', () => {
    const [a, b, c] = [stickerLayer('star'), stickerLayer('heart'), stickerLayer('sun')];
    const doc: StudioDoc = { ...emptyDoc(), layers: [a, b, c] };
    const ids = (d: StudioDoc) => d.layers.map((layer) => layer.id);
    expect(ids(reorderLayer(doc, a.id, 'forward'))).toEqual([b.id, a.id, c.id]);
    expect(ids(reorderLayer(doc, c.id, 'backward'))).toEqual([a.id, c.id, b.id]);
    expect(ids(reorderLayer(doc, a.id, 'front'))).toEqual([b.id, c.id, a.id]);
    expect(ids(reorderLayer(doc, c.id, 'back'))).toEqual([c.id, a.id, b.id]);
    // At the end of the stack nothing changes.
    expect(reorderLayer(doc, c.id, 'forward')).toBe(doc);
    expect(reorderLayer(doc, 'gone', 'back')).toBe(doc);
  });

  it('finds the top layer under a point, turned layers too', () => {
    const below = stickerLayer('star', { x: 200, y: 200, size: 100 });
    const above = stickerLayer('heart', { x: 240, y: 200, size: 100, rotation: 45 });
    const doc: StudioDoc = { ...emptyDoc(), layers: [below, above] };
    expect(hitTest(doc, 240, 200)?.id).toBe(above.id);
    expect(hitTest(doc, 160, 200)?.id).toBe(below.id);
    // The corner of the turned box is empty.
    expect(hitTest(doc, 240 + 49, 200 - 49)?.id).toBeUndefined();
    expect(hitTest(doc, 600, 50)).toBeNull();
  });

  it('snaps a dragged center to the middle of the screen, and a turn to a quarter', () => {
    expect(snapCenter(355, 100)).toEqual({ x: 360, y: 100, vertical: true, horizontal: false });
    expect(snapCenter(300, 236)).toEqual({ x: 300, y: 240, vertical: false, horizontal: true });
    expect(snapCenter(340, 200)).toMatchObject({ x: 340, y: 200, vertical: false, horizontal: false });
    expect(snapAngle(88)).toBe(90);
    expect(snapAngle(-3)).toBe(0);
    expect(snapAngle(30)).toBe(30);
    expect(snapAngle(178)).toBe(180);
  });

  it('undoes and redoes, a drag or a word typed as one step', () => {
    const text = textLayer({ text: '' });
    let state = history(emptyDoc());
    expect(canUndo(state)).toBe(false);
    state = commit(state, addLayer(state.present, text));
    // Each letter of a word replaces the last, as one run.
    for (const word of ['H', 'He', 'Hey']) state = commit(state, updateLayer(state.present, text.id, { text: word }), `text:${text.id}`);
    for (const x of [10, 20, 30]) state = commit(state, moveLayer(state.present, text.id, x, 50), `drag:1`);
    expect(state.past).toHaveLength(3);
    expect(state.present.layers[0]).toMatchObject({ text: 'Hey', x: 30 });

    state = undo(state);
    expect(state.present.layers[0]).toMatchObject({ text: 'Hey', x: 360 });
    state = undo(state);
    expect(state.present.layers[0]).toMatchObject({ text: '' });
    state = undo(state);
    expect(state.present.layers).toHaveLength(0);
    expect(canUndo(state)).toBe(false);
    expect(undo(state)).toBe(state);

    state = redo(redo(state));
    expect(state.present.layers[0]).toMatchObject({ text: 'Hey' });
    // A new change drops the steps to redo.
    state = commit(state, removeLayer(state.present, text.id));
    expect(canRedo(state)).toBe(false);
    // A drag after an undo starts a step of its own, though its run has the same name.
    state = undo(state);
    state = commit(state, moveLayer(state.present, text.id, 5, 5), 'drag:1');
    expect(state.past.length).toBeGreaterThan(0);
    expect(undo(state).present.layers[0]).toMatchObject({ x: 360 });
  });

  it('reads back what it writes, and only that', () => {
    const doc: StudioDoc = {
      version: 1,
      background: { kind: 'photo', zoom: 1.5, cx: 0.4, cy: 0.6, color: '#000000' },
      frame: 'instant',
      frameColor: '#F4A6B8',
      layers: [textLayer({ text: 'สวัสดี\nGR', font: 'mali', outline: '#FFFFFF' }), stickerLayer('cat', { flip: true, tint: '#123456', rotation: -30 })],
      template: 'cat',
    };
    expect(parse(serialize(doc), designThemes)).toEqual(doc);

    expect(parse(null, designThemes)).toBeNull();
    expect(parse('{not json', designThemes)).toBeNull();
    expect(parse('{"version":2}', designThemes)).toBeNull();
    const bad = parse(
      JSON.stringify({
        version: 1,
        background: { kind: 'design', design: 'gone', theme: 1 },
        frame: 'nope',
        frameColor: 'red',
        layers: [
          { type: 'text', id: 'a', x: 9999, y: 'x', text: 'y'.repeat(500), font: 'comic', size: 9999, color: 'blue', align: 'up' },
          { type: 'sticker', id: 'a', sticker: 'star', size: -5 },
          { type: 'image', src: 'http://example.com' },
          null,
        ],
      }),
      designThemes,
    );
    expect(bad).not.toBeNull();
    expect(bad!.background).toEqual(emptyDoc().background);
    expect(bad!.frame).toBe('instant');
    expect(bad!.frameColor).toBe('#FFFFFF');
    expect(bad!.layers).toHaveLength(2);
    expect(bad!.layers[0]).toMatchObject({ x: 720, y: 240, font: 'sans', size: LIMITS.textSize[1], color: '#2B2B2B', align: 'center' });
    expect((bad!.layers[0] as { text: string }).text).toHaveLength(LIMITS.textLength);
    expect(bad!.layers[1]).toMatchObject({ size: LIMITS.stickerSize[0] });
    // Two layers never share an id.
    expect(bad!.layers[0]!.id).not.toBe(bad!.layers[1]!.id);
    // A design background keeps a theme that the design has.
    expect(parse(JSON.stringify({ version: 1, background: { kind: 'design', design: 'cat', theme: 9 } }), designThemes)!.background).toEqual({ kind: 'design', design: 'cat', theme: 0 });
  });

  it('keeps the document in this browser', () => {
    const items = new Map<string, string>();
    const storage = { getItem: (key: string) => items.get(key) ?? null, setItem: (key: string, value: string) => void items.set(key, value) };
    expect(loadDoc(storage, designThemes)).toBeNull();
    const doc = TEMPLATES.find((template) => template.id === 'songkran')!.build();
    saveDoc(storage, doc);
    expect(loadDoc(storage, designThemes)).toEqual(doc);
    expect(loadDoc(null, designThemes)).toBeNull();
    const full = { setItem: () => { throw new Error('QuotaExceededError'); } };
    expect(() => saveDoc(full, doc)).not.toThrow();
  });

  it('tells the layers that the camera text would cover', () => {
    const clear = textLayer({ text: 'Hello', y: 120 });
    const bar = stickerLayer('star', { x: 360, y: 350, size: 60 });
    const corner = textLayer({ text: 'v2', x: 650, y: 455, size: 30 });
    const empty = textLayer({ text: '   ', y: 360 });
    const turned = stickerLayer('heart', { x: 100, y: 300, size: 60, rotation: 45 });
    const doc: StudioDoc = { ...emptyDoc(), layers: [clear, bar, corner, empty, turned] };
    expect(underCameraText(doc)).toEqual([
      { id: bar.id, zones: ['counts'] },
      { id: corner.id, zones: ['firmware'] },
      // Turned by 45°, its corner reaches the bar of the counts: 300 + 60/√2 > 340.
      { id: turned.id, zones: ['counts'] },
    ]);
  });

  it('sizes a text by its lines, and a sticker by its side', () => {
    const one = textLayer({ text: 'abcd', size: 50 });
    const two = textLayer({ text: 'abcd\nab', size: 50 });
    expect(layerBox(two).h).toBeCloseTo(layerBox(one).h * 2);
    expect(layerBox(two).w).toBe(layerBox(one).w);
    // A text wider than its limit draws smaller.
    const limited = textLayer({ text: 'a'.repeat(40), size: 50, maxWidth: 300 });
    expect(layerBox(limited).w).toBeLessThanOrEqual(300);
    expect(layerBox(stickerLayer('sun', { size: 90 }))).toEqual({ w: 90, h: 90 });
  });
});

describe('free and Plus in the Studio', () => {
  it('locks the templates, stickers, fonts, and frames of Plus, and the layers past the free ones', () => {
    expect([...FREE_TEMPLATES].sort()).toEqual(['blank', ...FREE_DESIGNS].sort());
    expect(FREE_DESIGNS).toHaveLength(5);
    expect(FREE_STICKERS.size).toBe(10);
    for (const template of TEMPLATES) {
      expect(templateLocked(template.id, catalog, false)).toBe(!template.free);
      expect(templateLocked(template.id, catalog, true)).toBe(false);
    }
    for (const item of STICKERS) {
      expect(stickerLocked(item.id, catalog, false)).toBe(!FREE_STICKERS.has(item.id));
      expect(stickerLocked(item.id, catalog, true)).toBe(false);
    }
    expect(FONT_IDS.filter((font) => !fontLocked(font, false))).toEqual(['sans', 'condensed']);
    expect(FONT_IDS.every((font) => !fontLocked(font, true))).toBe(true);
    expect(frameLocked(false)).toBe(true);
    expect(frameLocked(true)).toBe(false);

    let doc = emptyDoc();
    for (let i = 0; i < FREE_LAYERS; i++) {
      expect(canAddLayer(doc, false)).toBe(true);
      doc = addLayer(doc, stickerLayer('star'));
    }
    expect(canAddLayer(doc, false)).toBe(false);
    expect(canAddLayer(doc, true)).toBe(true);
    for (let i = FREE_LAYERS; i < LIMITS.layers; i++) doc = addLayer(doc, stickerLayer('star'));
    expect(canAddLayer(doc, true)).toBe(false);
    expect(addLayer(doc, stickerLayer('star'))).toBe(doc);
  });

  it('names what of Plus a document uses', () => {
    expect(plusItems(TEMPLATES[0]!.build(), catalog)).toEqual([]);
    for (const id of FREE_DESIGNS) expect(plusItems(TEMPLATES.find((t) => t.id === id)!.build(), catalog), id).toEqual([]);
    const plus: StudioDoc = {
      ...emptyDoc(),
      frame: 'film',
      template: 'pixel',
      layers: [stickerLayer('cat'), textLayer({ font: 'mali' }), stickerLayer('star'), stickerLayer('heart')],
    };
    expect(plusItems(plus, catalog)).toEqual([
      { kind: 'template', id: 'pixel' },
      { kind: 'frame', id: 'film' },
      { kind: 'sticker', id: 'cat' },
      { kind: 'font', id: 'mali' },
      { kind: 'layers' },
    ]);
    // Every seasonal picture is Plus.
    for (const template of TEMPLATES.filter((t) => t.season)) expect(template.free).toBe(false);
  });
});

const HOLIDAY_IDS = ['xmas-santa', 'xmas-gift', 'xmas-snow', 'xmas-cocoa', 'xmas-minimal', 'ny-party', 'ny-balloons', 'ny-minimal'];

describe('the library of the Studio', () => {
  it('has the templates: a blank, the 11 designs as layers, and the seasons', () => {
    expect(TEMPLATES.map((t) => t.id)).toEqual(['blank', ...DESIGNS.map((d) => d.id), 'songkran', 'loykrathong', 'newyear', 'valentine', ...HOLIDAY_IDS]);
    for (const template of TEMPLATES) {
      const doc = template.build();
      expect(parse(serialize(doc), designThemes), template.id).toEqual(doc);
      expect(doc.template).toBe(template.id);
    }
    // A design keeps its art as the background and its text as a layer that can be edited.
    for (const design of DESIGNS) {
      const doc = TEMPLATES.find((t) => t.id === design.id)!.build();
      expect(doc.background).toEqual({ kind: 'design', design: design.id, theme: 0 });
      expect(doc.layers).toHaveLength(1);
      expect(doc.layers[0]).toMatchObject({ type: 'text', text: design.text });
    }
  });

  it('puts the Christmas and New Year pictures first from November 15 to January 15', () => {
    expect([...HOLIDAY_TEMPLATES].sort()).toEqual([...HOLIDAY_IDS, 'newyear'].sort());
    for (const id of HOLIDAY_TEMPLATES) expect(findTemplate(id), id).toMatchObject({ season: true, free: false });
    const on = ['2026-11-15', '2026-11-27', '2026-12-31', '2027-01-01', '2027-01-15'];
    const off = ['2026-11-14', '2027-01-16', '2027-04-13', '2027-10-31'];
    for (const day of on) expect(holidaySeason(new Date(`${day}T12:00:00`)), day).toBe(true);
    for (const day of off) expect(holidaySeason(new Date(`${day}T12:00:00`)), day).toBe(false);
  });

  it('keeps the painted background of a seasonal picture, and only a known one', () => {
    for (const id of ART_IDS) {
      expect(findTemplate(id)!.build().background, id).toEqual({ kind: 'art', art: id });
      expect(existsSync(fileURLToPath(new URL(`../../public${artUrl(id)}`, import.meta.url))), id).toBe(true);
    }
    const doc = (art: string) => serialize({ ...emptyDoc(), background: { kind: 'art', art } });
    expect(parse(doc('xmas-santa'), designThemes)!.background).toEqual({ kind: 'art', art: 'xmas-santa' });
    expect(parse(doc('../x'), designThemes)!.background).toEqual(emptyDoc().background);
    // A painted background is a part of its template: Plus, even on a document of another template.
    expect(plusItems({ ...emptyDoc(), template: 'blank', background: { kind: 'art', art: 'ny-party' } }, catalog)).toEqual([{ kind: 'template', id: 'ny-party' }]);
    expect(plusItems(findTemplate('ny-party')!.build(), catalog)).toEqual([{ kind: 'template', id: 'ny-party' }]);
  });

  it('keeps the text of every template clear of the camera text', () => {
    for (const template of TEMPLATES) {
      expect(underCameraText(template.build()), template.id).toEqual([]);
    }
  });

  it('has more than 50 stickers with unique ids, in their groups', () => {
    expect(STICKERS.length).toBeGreaterThanOrEqual(50);
    expect(new Set(STICKERS.map((s) => s.id)).size).toBe(STICKERS.length);
    for (const group of STICKER_GROUPS) expect(STICKERS.some((s) => s.group === group), group).toBe(true);
    for (const item of STICKERS) {
      expect(item.parts.length, item.id).toBeGreaterThan(0);
      for (const part of item.parts) {
        expect(part.d, item.id).toMatch(/^M[-\d. ]+/);
        expect(part.d, item.id).not.toMatch(/NaN|undefined|Infinity/);
        if (part.fill === 'tint' || part.stroke === 'tint') expect(item.tint, item.id).toBeDefined();
      }
    }
  });

  it('draws every template, sticker, frame, pattern, and font without throwing', () => {
    const docs: StudioDoc[] = TEMPLATES.map((t) => t.build());
    docs.push({ ...emptyDoc(), layers: STICKERS.map((item, i) => stickerLayer(item.id, { x: (i % 10) * 70 + 40, y: Math.floor(i / 10) * 70 + 40, size: 64, flip: i % 2 === 0, rotation: i * 7 })) });
    for (const frame of FRAME_IDS) docs.push({ ...emptyDoc(), frame, background: { kind: 'gradient', from: '#000000', to: '#FFFFFF', angle: 45 } });
    for (const pattern of PATTERN_IDS) docs.push({ ...emptyDoc(), background: { kind: 'pattern', pattern, color: '#FFFFFF', ink: '#000000' } });
    for (const font of FONT_IDS) {
      docs.push({ ...emptyDoc(), layers: [textLayer({ font, text: 'Hello GR\nสวัสดี', outline: '#FFFFFF', spacing: 4, align: 'left' }), textLayer({ font, align: 'right', bold: false })] });
    }
    docs.push({ ...emptyDoc(), background: { kind: 'photo', zoom: 2, cx: 0, cy: 1, color: '#000000' } });
    for (const doc of docs) {
      const { context, calls } = stubContext();
      expect(() => renderDoc(context, doc, { photo: { width: 1200, height: 900 } as never })).not.toThrow();
      // The first fill covers the screen, so no pixel stays transparent.
      expect(calls.find((call) => call.name === 'fillRect')?.args).toEqual([0, 0, 720, 480]);
    }
    expect(FRAMES.map((frame) => frame.id)).toEqual([...FRAME_IDS]);
    expect(FONTS.map((font) => font.id)).toEqual([...FONT_IDS]);
  });

  it('crops a photo to the screen and keeps the crop inside the photo', () => {
    expect(photoCrop({ width: 3000, height: 2000 }, { w: 720, h: 480 }, 1, 0.5, 0.5)).toEqual({ x: 0, y: 0, w: 3000, h: 2000 });
    const tall = photoCrop({ width: 1000, height: 2000 }, { w: 720, h: 480 }, 1, 0.5, 0.5);
    expect(tall.w).toBe(1000);
    expect(tall.h).toBeCloseTo(666.67, 1);
    expect(tall.y).toBeCloseTo(666.67, 1);
    const zoomed = photoCrop({ width: 3000, height: 2000 }, { w: 720, h: 480 }, 2, 1, 0);
    expect(zoomed).toEqual({ x: 1500, y: 0, w: 1500, h: 1000 });
  });

  it('names every sticker, group, frame, pattern, and template in each language', () => {
    for (const [language, strings] of Object.entries(STUDIO_STRINGS)) {
      for (const item of STICKERS) expect(strings.stickers[item.id as keyof typeof strings.stickers], `${language} ${item.id}`).toBeTruthy();
      for (const group of STICKER_GROUPS) expect(strings.groups[group], language).toBeTruthy();
      for (const frame of FRAME_IDS) expect(strings.frames[frame], language).toBeTruthy();
      for (const pattern of PATTERN_IDS) expect(strings.patterns[pattern], language).toBeTruthy();
      for (const template of TEMPLATES.filter((t) => t.season || t.id === 'blank')) {
        expect(strings.templates[template.id as keyof typeof strings.templates], `${language} ${template.id}`).toBeTruthy();
      }
      expect(Object.keys(strings).sort(), language).toEqual(Object.keys(STUDIO_STRINGS.en).sort());
    }
  });
});
