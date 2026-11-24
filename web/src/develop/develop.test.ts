import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FREE, type Entitlement } from '../plus';
import { colour, encode, Engine, marginsOf, rgba, runModules, setShot, shrink } from './engine';
import { apex, developedApp1, fidelityOf, imageControlOf, readDate, readPhotoInfo, shotApp1, turnsOf, type PhotoInfo } from './exif';
import { canDownload, CREDIT, FREE_PHOTOS, FREE_SIDE, freeLook, limitsOf, PLUS_PHOTOS } from './gating';
import { cameraModules, installQuery, readInstallQuery } from './install';
import { jpegLookTable, tableWhite } from './look';
import { MENU } from './menu';
import { canvasSizeOf, creditPlacement, storedRect, uprightMargins, uprightToStored } from './placement';
import { photoSeed } from './protocol';
import { childTitle, labelOf, recipeLines, recipeText, settingsFromParams, settingsParam, valueNames } from './recipe';
import { applyPreset, autoGrainSize, borderMargins, isOn, OFF, presetOf, PRESETS, PRESET_IDS, readSettings, scaleMargins, steps, type DevelopSettings } from './settings';
import { DEVELOP_STRINGS, format } from './strings';
import { en } from './text.en';
import { crc32, developedName, uniqueName, zipParts } from './zip';
import { menuSource } from '../../scripts/develop-menu.mjs';

const settings = (patch: Partial<DevelopSettings> = {}): DevelopSettings => ({ ...structuredClone(OFF), look: 'portra-400-endura-v1', ...patch });

describe('settings and the module calls', () => {
  it('calls the modules in the order of the camera', () => {
    const s = settings({
      grain: { level: 2, size: 0 },
      glow: { bloom: 1, halation: 2, color: 3 },
      leak: { look: 2, vignette: 0, dust: 0, leak: 0, scratches: 0 },
      diffusion: { strength: 1, mist: 2, streak: 1, softness: 3 },
      date: { ...OFF.date, style: 1, caption: 8 },
    });
    expect(steps(s, 640).map((step) => step.module)).toEqual(['glow', 'leak', 'diffusion', 'softness', 'grain', 'date']);
    expect(steps(s, 640).find((step) => step.module === 'glow')).toEqual({ module: 'glow', bloom: 1, halation: 2, color: 3 });
    expect(steps(s, 640).find((step) => step.module === 'diffusion')).toEqual({ module: 'diffusion', strength: 1, mist: 2, streak: 1 });
    expect(steps(s, 640).find((step) => step.module === 'date')).toMatchObject({ style: 1, caption: 8, size: 1 });
  });

  it('gives Grain Auto the size of the ISO, as grain.c', () => {
    expect([null, 100, 400, 401, 800, 801, 6400].map(autoGrainSize)).toEqual([1, 1, 1, 2, 2, 3, 3]);
    const grain = (iso: number | null) => steps(settings({ grain: { level: 1, size: 0 } }), iso)[0];
    expect(grain(3200)).toEqual({ module: 'grain', level: 1, size: 3 });
    expect(steps(settings({ grain: { level: 1, size: 2 } }), 3200)[0]).toEqual({ module: 'grain', level: 1, size: 2 });
  });

  it('runs Film Softness without a Diffusion filter, and nothing that is off', () => {
    expect(steps(settings({ diffusion: { strength: 0, mist: 2, streak: 2, softness: 1 } }), null)).toEqual([{ module: 'softness', level: 1 }]);
    expect(steps(settings(), null)).toEqual([]);
    expect(isOn(settings({ border: { style: 1, color: 1 } }), 'border')).toBe(true);
  });

  it('makes the border of runtime/canvas.h', () => {
    // GR IV: 4128 short side. Thin 3% = 123.84 -> 128; Wide 6% -> 240; Instant 4% -> 160, bottom x3.
    expect(borderMargins(1, 6192, 4128, 0)).toEqual([128, 128, 128, 128]);
    expect(borderMargins(2, 6192, 4128, 0)).toEqual([240, 240, 240, 240]);
    expect(borderMargins(3, 6192, 4128, 0)).toEqual([160, 160, 160, 480]);
    // The bottom of the upright picture: the stored right side at a quarter turn.
    expect(borderMargins(3, 6192, 4128, 1)).toEqual([160, 160, 480, 160]);
    expect(borderMargins(3, 6192, 4128, 3)).toEqual([480, 160, 160, 160]);
    expect(borderMargins(0, 6192, 4128, 0)).toEqual([0, 0, 0, 0]);
    expect(scaleMargins([160, 160, 160, 480], 2048 / 6512)).toEqual([50, 50, 50, 150]);
  });

  it('keeps the look with a preset, and knows the preset of settings', () => {
    for (const id of PRESET_IDS) {
      const s = applyPreset(settings(), id);
      expect(s.look).toBe('portra-400-endura-v1');
      expect(presetOf(s)).toBe(id);
    }
    expect(presetOf(settings({ grain: { level: 4, size: 3 } }))).toBeNull();
    expect(PRESETS.instant.border).toEqual({ style: 3, color: 0 });
    expect(PRESETS.instant.date.caption).toBe(8);
  });

  it('reads settings from untrusted input with values in range', () => {
    const s = readSettings({ look: 'kodachrome-64-v1', grain: { level: 9, size: 2 }, date: { style: 3, caption: 'x' }, border: null }, settings());
    expect(s.look).toBe('kodachrome-64-v1');
    expect(s.grain).toEqual({ level: 0, size: 2 });
    expect(s.date.style).toBe(3);
    expect(s.date.caption).toBe(0);
    expect(readSettings({ look: '../../etc' }, settings()).look).toBe('portra-400-endura-v1');
  });
});

describe('the recipe', () => {
  const s = settings({
    grain: { level: 1, size: 1 },
    glow: { bloom: 1, halation: 0, color: 1 },
    date: { style: 1, look: 0, position: 0, color: 0, size: 1, corner: 0, glow: 1, caption: 8 },
    border: { style: 3, color: 0 },
  });

  it('names each setting as the camera menu does', () => {
    const text = recipeText(recipeLines(s, 'en', 'Film Look', 'Portra 400', 'No film look'));
    expect(text).toBe(
      [
        'Film Look: Portra 400',
        'Glow: Bloom Weak, Halation Off',
        'Grain: Weak, Size Small, Style Film-like',
        "Date Imprint: 'YY M D, Date Font Classic, Date Color Standard, Date Size M, Date Corner Bottom Right, Date Glow On, Caption GRKU ♥, Date Position Film",
        'Border: Instant, Color White',
      ].join('\n'),
    );
  });

  it('uses the camera menu of the language, and English for Thai', () => {
    expect(recipeLines(s, 'ja', 'フィルムルック', null, 'なし')[0]!.values).toEqual(['なし']);
    expect(recipeLines(s, 'ja', '', null, '').find((line) => line.module === 'date')!.title).toBe('日付入れ撮影');
    expect(recipeLines(s, 'th', '', null, '').find((line) => line.module === 'date')!.title).toBe('Date Imprint');
    expect(childTitle('en', 'glow', 'BLOOM')).toBe('Bloom');
    expect(labelOf('en', 'diffusion', 'SOFTNESS')).toBe('Film Softness');
    expect(valueNames('en', 'date', 'CAPTION')[8]).toBe('GRKU ♥');
  });

  it('keeps the settings in the address', () => {
    const param = settingsParam(s);
    expect(param).toMatch(/^\d{24}$/);
    const back = settingsFromParams(new URLSearchParams(`look=portra-400-endura-v1&m=${param}`), settings());
    expect(back).toEqual(s);
    expect(settingsFromParams(new URLSearchParams(''), s)).toBeNull();
    // A look alone keeps the other settings.
    expect(settingsFromParams(new URLSearchParams('look=trix-400-mono-v1'), s)).toEqual({ ...s, look: 'trix-400-mono-v1' });
  });

  it('links to the install page with the look and the modules', () => {
    expect(cameraModules(s)).toEqual(['filmLook', 'glow', 'grain', 'dateStamp', 'border']);
    expect(installQuery(s)).toBe('?look=portra-400-endura-v1&modules=filmLook%2Cglow%2Cgrain%2CdateStamp%2Cborder');
    const known = new Set(['filmLook', 'glow', 'grain', 'dateStamp', 'border'] as const);
    expect(readInstallQuery('?look=portra-400-endura-v1&modules=glow,nope,glow,border', known)).toEqual({ look: 'portra-400-endura-v1', modules: ['glow', 'border'] });
    expect(readInstallQuery('?look=<script>', known).look).toBeNull();
  });

  it('matches the module text of the camera (scripts/develop-menu.mjs)', () => {
    expect(readFileSync(new URL('./menu.ts', import.meta.url), 'utf8')).toBe(menuSource());
    expect(Object.keys(MENU)).toEqual(['en', 'zh-Hans', 'zh-Hant', 'ja', 'ko']);
  });
});

describe('free and Plus', () => {
  const pack: Entitlement = { packs: ['kodak'], slots: 10, plus: false, paid: 49 };
  const kodak = { id: 'ektar-100-edge-v1', cover: { template: 'box' as const, brand: 'Kodak', name: 'EKTAR', number: '100' } };
  const camera = { id: 'positive-film-grii-v1', cover: { template: 'box' as const, brand: 'RICOH', name: 'POSITIVE' } };
  const starter = { id: 'portra-400-endura-v1', cover: { template: 'box' as const, brand: 'Kodak', name: 'PORTRA', number: '400' } };

  it('downloads the camera looks and the starter looks for free, the others with Plus', () => {
    expect(freeLook(camera)).toBe(true);
    expect(freeLook(starter)).toBe(true);
    expect(freeLook(kodak)).toBe(false);
    expect(canDownload(kodak, FREE)).toBe(false);
    expect(canDownload(null, FREE)).toBe(true);
    // Plus is any purchase: a pack opens every look here.
    expect(canDownload(kodak, pack)).toBe(true);
    expect(canDownload({ ...kodak, id: 'velvia-50-v1', cover: { template: 'box', brand: 'FUJIFILM', name: 'VELVIA', number: '50' } }, pack)).toBe(true);
  });

  it('limits free downloads to 2048 pixels with the credit, and a few photos', () => {
    expect(limitsOf(FREE)).toEqual({ maxSide: FREE_SIDE, credit: CREDIT, photos: FREE_PHOTOS });
    expect(limitsOf(pack)).toEqual({ maxSide: null, credit: null, photos: PLUS_PHOTOS });
    expect(limitsOf({ ...FREE, slots: 25 }).maxSide).toBeNull();
  });
});

describe('EXIF', () => {
  const info: PhotoInfo = {
    width: null,
    height: null,
    orientation: 1,
    make: 'RICOH IMAGING COMPANY, LTD.',
    model: 'RICOH GR IV',
    taken: { year: 2026, month: 11, day: 15, hour: 15, minute: 26, second: 39 },
    iso: 100,
    fNumber: 2.8,
    exposure: 1 / 160,
    imageControl: null,
    app1: null,
  };
  /** A JPEG header with `app1`, an XMP of a GR, and a frame header of 6192 x 4128. */
  function jpeg(app1: Uint8Array, xmp = '<x:xmpmeta><rdf:RDF><rdf:Description><dc:subject><rdf:Bag><rdf:li>Standard</rdf:li></rdf:Bag></dc:subject></rdf:Description></rdf:RDF></x:xmpmeta>') {
    const ns = new TextEncoder().encode(`http://ns.adobe.com/xap/1.0/\0${xmp}`);
    const xmpSegment = new Uint8Array([0xff, 0xe1, (ns.length + 2) >> 8, (ns.length + 2) & 255, ...ns]);
    const sof = new Uint8Array([0xff, 0xc0, 0, 17, 8, 4128 >> 8, 4128 & 255, 6192 >> 8, 6192 & 255, 3, 1, 0x21, 0, 2, 0x11, 1, 3, 0x11, 1]);
    return new Uint8Array([0xff, 0xd8, ...app1, ...xmpSegment, ...sof, 0xff, 0xda, 0, 2]);
  }

  it('reads the shot, the date, and the Image Control of a GR JPEG', () => {
    const read = readPhotoInfo(jpeg(shotApp1(info, 6192, 4128)));
    expect(read.make).toBe('RICOH IMAGING COMPANY, LTD.');
    expect(read.model).toBe('RICOH GR IV');
    expect(read.taken).toEqual(info.taken);
    expect(read.iso).toBe(100);
    expect(read.fNumber).toBeCloseTo(2.8);
    expect(read.exposure).toBeCloseTo(1 / 160);
    expect(read.imageControl).toBe('Standard');
    expect([read.width, read.height]).toEqual([6192, 4128]);
    expect(fidelityOf(read, false)).toBe('exact');
    expect(fidelityOf({ ...read, imageControl: 'Positive Film' }, false)).toBe('otherControl');
    expect(fidelityOf({ ...read, make: 'Apple', model: 'iPhone 15' }, false)).toBe('approximate');
    expect(fidelityOf(read, true)).toBe('raw');
  });

  it('writes the size and the orientation of the developed picture and drops the thumbnail', () => {
    const app1 = developedApp1(shotApp1(info, 6192, 4128), 6512, 4768, 1);
    const read = readPhotoInfo(jpeg(app1));
    expect(read.orientation).toBe(1);
    expect(read.iso).toBe(100);
    // PixelXDimension and PixelYDimension, read back from the EXIF IFD.
    const text = Array.from(app1, (b) => b.toString(16).padStart(2, '0')).join('');
    expect(text).toContain((6512).toString(16).padStart(8, '0'));
    expect(text).toContain((4768).toString(16).padStart(8, '0'));
  });

  it('never throws on a damaged file', () => {
    expect(readPhotoInfo(new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0, 20, 0x45, 0x78, 0x69, 0x66, 0, 0, 1, 2]))).toMatchObject({ orientation: 1, taken: null });
    expect(readPhotoInfo(new Uint8Array(10)).make).toBe('');
  });

  it('reads EXIF dates, orientations, and APEX values', () => {
    expect(readDate('2026:11:15 15:26:39')).toEqual(info.taken);
    expect(readDate('0000:00:00 00:00:00')).toBeNull();
    expect([1, 6, 3, 8, 2, 5].map(turnsOf)).toEqual([0, 1, 2, 3, null, null]);
    expect(imageControlOf('<dc:subject><rdf:Bag><rdf:li>Negative Film</rdf:li></rdf:Bag></dc:subject>')).toBe('Negative Film');
    // f/2.8, 1/160 s, ISO 100: EV about 10.3.
    expect(apex(100, 2.8, 1 / 160).sceneEv / 256).toBeCloseTo(10.29, 1);
  });
});

describe('placement', () => {
  it('maps the upright picture to the stored planes', () => {
    // A 6 x 4 stored picture turned once is 4 x 6 upright; its upright top left is the stored bottom left.
    expect(storedRect(1, 4, 6, { x: 0, y: 0, w: 1, h: 1 })).toEqual({ x: 0, y: 3, w: 1, h: 1 });
    expect(storedRect(2, 6, 4, { x: 0, y: 0, w: 2, h: 1 })).toEqual({ x: 4, y: 3, w: 2, h: 1 });
    expect(storedRect(3, 4, 6, { x: 0, y: 0, w: 1, h: 1 })).toEqual({ x: 5, y: 0, w: 1, h: 1 });
    expect(uprightToStored(0, 6, 4)).toEqual([1, 0, 0, 1, 0, 0]);
    expect(uprightMargins([1, 2, 3, 4], 1)).toEqual([4, 1, 2, 3]);
    expect(canvasSizeOf({ width: 6, height: 4, turns: 3 })).toEqual({ width: 4, height: 6 });
  });

  it('puts the credit in the border, or away from the date', () => {
    const border = creditPlacement(settings({ border: { style: 3, color: 0 } }), 1366, 2048, [42, 42, 42, 126]);
    expect(border).toMatchObject({ align: 'center', x: 683, y: 2048 - 63, shadow: false });
    const corner = creditPlacement(settings(), 2048, 1365, [0, 0, 0, 0]);
    expect(corner.align).toBe('left');
    expect(corner.y).toBeGreaterThan(1300);
    const dateLeft = creditPlacement(settings({ date: { ...OFF.date, style: 1, corner: 1 } }), 2048, 1365, [0, 0, 0, 0]);
    expect(dateLeft.y).toBeLessThan(100);
  });
});

describe('files', () => {
  it('names the developed photos', () => {
    expect(developedName('R0000285.JPG', 'Portra 400')).toBe('R0000285-GRKU-Portra-400.jpg');
    expect(developedName('photo.heic', null)).toBe('photo-GRKU.jpg');
    const taken = new Set<string>();
    expect(['a.jpg', 'a.jpg', 'A.jpg'].map((name) => uniqueName(name, taken))).toEqual(['a.jpg', 'a-2.jpg', 'A-3.jpg']);
  });

  it('writes a stored ZIP', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
    const parts = zipParts([{ name: 'a.jpg', bytes: new Uint8Array([1, 2, 3]), date: new Date(2026, 10, 24) }]);
    const zip = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
    parts.reduce((at, p) => (zip.set(p, at), at + p.length), 0);
    const view = new DataView(zip.buffer);
    expect(view.getUint32(0, true)).toBe(0x04034b50);
    expect(view.getUint32(zip.length - 22, true)).toBe(0x06054b50);
    expect(view.getUint16(zip.length - 12, true)).toBe(1);
  });

  it('seeds each photo the same at each size', () => {
    const file = { name: 'R0000285.JPG', size: 13_000_000, lastModified: 1 };
    expect(photoSeed(file)).toBe(photoSeed({ ...file }));
    expect(photoSeed(file)).not.toBe(photoSeed({ ...file, name: 'R0000286.JPG' }));
  });
});

describe('text', () => {
  it('has every text in each language, with its values', () => {
    for (const [language, text] of Object.entries(DEVELOP_STRINGS)) {
      for (const [key, source] of Object.entries(en)) {
        const value = text[key as keyof typeof en];
        expect(value, `${language} ${key}`).toBeTruthy();
        for (const name of source.match(/\$\{\w+\}/g) ?? []) expect(value, `${language} ${key}`).toContain(name);
      }
    }
    expect(format('${a} of ${b}', { a: 1, b: 2 })).toBe('1 of 2');
  });
});

describe('develop.wasm', () => {
  const wasm = new URL('../wasm/develop.wasm', import.meta.url);
  const module = (() => {
    try {
      return new WebAssembly.Module(readFileSync(wasm));
    } catch {
      return null;
    }
  })();

  /** A 3:2 picture: a gradient with a light in it. */
  function source(width = 600, height = 400) {
    const data = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const at = (y * width + x) * 4;
        const light = (x - 450) ** 2 + (y - 120) ** 2 < 400;
        data[at] = light ? 255 : (x * 255) / width;
        data[at + 1] = light ? 255 : (y * 255) / height;
        data[at + 2] = light ? 255 : 128;
        data[at + 3] = 255;
      }
    return {
      width,
      height,
      turns: 0,
      kind: 'rgba8' as const,
      read: (top: number, rows: number, into: Uint8Array | Uint16Array) => (into as Uint8Array).set(data.subarray(top * width * 4, (top + rows) * width * 4)),
      data,
    };
  }
  const standard = new Uint8Array(17 ** 3 * 3);
  for (let b = 0, at = 0; b < 17; b++) for (let g = 0; g < 17; g++) for (let r = 0; r < 17; r++) standard.set([r * 15.9375, g * 15.9375, b * 15.9375], (at++) * 3);
  const noLook = { kind: 'rgba8' as const, lut: jpegLookTable(standard, null, 33), n: 33, white: [255, 255, 255] as [number, number, number] };

  it.skipIf(!module)('keeps the photo as it is without a look or a module', async () => {
    const engine = await Engine.create(module!);
    const src = source();
    const picture = await colour(engine, src, noLook);
    const out = rgba(engine, picture, [0, 0, 0, 0], false);
    let diff = 0;
    for (let i = 0; i < out.data.length; i++) if (i % 4 !== 3) diff += Math.abs(out.data[i]! - src.data[i]!);
    // 4:2:2 and back: within a level or two on a smooth gradient.
    expect(diff / (src.width * src.height * 3)).toBeLessThan(2);
    expect(tableWhite(noLook.lut, 33)).toEqual([255, 255, 255]);
  });

  it.skipIf(!module)('runs the modules, the border, and makes a JPEG', async () => {
    const engine = await Engine.create(module!);
    const picture = await colour(engine, source(), noLook);
    const before = engine.bytes(picture.y, 600 * 400).slice();
    const s = settings({ grain: { level: 3, size: 2 }, glow: { bloom: 2, halation: 0, color: 1 }, date: { ...OFF.date, style: 1 }, border: { style: 1, color: 1 } });
    setShot(engine, { taken: { year: 2026, month: 11, day: 24, hour: 9, minute: 5, second: 0 }, iso: 200, fNumber: 2.8, exposure: 1 / 60 }, [255, 255, 255]);
    runModules(engine, picture, s, 200, { mono: false, seed: 7 });
    const after = engine.bytes(picture.y, 600 * 400);
    let changed = 0;
    for (let i = 0; i < before.length; i++) if (before[i] !== after[i]) changed++;
    expect(changed).toBeGreaterThan(before.length / 4);
    const margins = marginsOf(s, picture);
    expect(margins).toEqual([16, 16, 16, 16]);
    const parts = encode(engine, picture, margins, true, 90, shotApp1({ ...({} as PhotoInfo), make: 'RICOH', model: 'GR IV', orientation: 1, taken: null, iso: 200, fNumber: 2.8, exposure: 1 / 60, imageControl: null, app1: null, width: null, height: null }, 632, 432));
    const file = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
    parts.reduce((at, p) => (file.set(p, at), at + p.length), 0);
    expect([file[0], file[1], file[2], file[3]]).toEqual([0xff, 0xd8, 0xff, 0xe1]);
    expect([file[file.length - 2], file[file.length - 1]]).toEqual([0xff, 0xd9]);
    const read = readPhotoInfo(file);
    expect([read.width, read.height, read.iso]).toEqual([632, 432, 200]);
    // A smaller copy with its border drawn in.
    const small = shrink(engine, picture, margins, true, 316);
    expect([small.picture.width, small.picture.height]).toEqual([316, 216]);
    expect(engine.bytes(small.picture.y, 4)[0]).toBe(0);
  });
});
