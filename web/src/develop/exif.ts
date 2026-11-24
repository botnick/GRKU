/**
 * What the Develop page reads from a photo file: the EXIF of a JPEG (APP1) or of a DNG (TIFF),
 * and the XMP of a RICOH GR JPEG, which names its Image Control. And the EXIF of a developed
 * picture: the source's own, with the size of the new picture, or a small one of the shot data.
 */

export interface PhotoInfo {
  /** The stored size from the JPEG frame header, or null. */
  width: number | null;
  height: number | null;
  /** EXIF Orientation 1 to 8 (1 without one). */
  orientation: number;
  make: string;
  model: string;
  /** DateTimeOriginal, or DateTime, as numbers; null without one. */
  taken: { year: number; month: number; day: number; hour: number; minute: number; second: number } | null;
  iso: number | null;
  /** The f-number, such as 2.8. */
  fNumber: number | null;
  /** The exposure time in seconds. */
  exposure: number | null;
  /** The Image Control of a GR JPEG (XMP dc:subject), such as "Standard"; null when unknown. */
  imageControl: string | null;
  /** The APP1 EXIF segment of a JPEG from its marker, or null. */
  app1: Uint8Array | null;
}

export type Fidelity = 'exact' | 'otherControl' | 'approximate' | 'raw';

/** Whether the photo comes from a RICOH GR. */
export const isGr = (info: Pick<PhotoInfo, 'make' | 'model'>) => /ricoh/i.test(info.make) && /\bGR\b/i.test(info.model);

/**
 * How closely the result follows the camera: a GR JPEG in Standard is what GRKU starts from on the
 * camera; another Image Control or another camera starts from different colour.
 */
export function fidelityOf(info: PhotoInfo, raw: boolean): Fidelity {
  if (raw) return 'raw';
  if (!isGr(info)) return 'approximate';
  if (info.imageControl === null || /^standard$/i.test(info.imageControl)) return info.imageControl === null ? 'approximate' : 'exact';
  return 'otherControl';
}

const TYPE_SIZES: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };

interface Entry {
  tag: number;
  type: number;
  count: number;
  /** The offset of the entry in the TIFF data. */
  at: number;
  /** The offset of the value in the TIFF data. */
  value: number;
}

class Tiff {
  readonly view: DataView;
  readonly little: boolean;
  constructor(readonly bytes: Uint8Array) {
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const order = this.u16(0);
    if (order !== 0x4949 && order !== 0x4d4d) throw new Error('Not TIFF data');
    this.little = order === 0x4949;
  }
  u16(at: number) {
    return this.view.getUint16(at, this.little);
  }
  u32(at: number) {
    return this.view.getUint32(at, this.little);
  }
  ifd(at: number): { entries: Entry[]; next: number; at: number } {
    const count = this.u16(at);
    if (count > 1000 || at + 2 + count * 12 + 4 > this.bytes.length) throw new Error('Damaged IFD');
    const entries: Entry[] = [];
    for (let i = 0; i < count; i++) {
      const e = at + 2 + i * 12;
      const type = this.u16(e + 2), n = this.u32(e + 4);
      const size = (TYPE_SIZES[type] ?? 1) * n;
      entries.push({ tag: this.u16(e), type, count: n, at: e, value: size <= 4 ? e + 8 : this.u32(e + 8) });
    }
    return { entries, next: this.u32(at + 2 + count * 12), at };
  }
  number(entry: Entry | undefined): number | null {
    if (!entry || entry.value + (TYPE_SIZES[entry.type] ?? 1) > this.bytes.length) return null;
    switch (entry.type) {
      case 3:
        return this.u16(entry.value);
      case 4:
        return this.u32(entry.value);
      case 5:
      case 10: {
        const d = this.u32(entry.value + 4);
        const n = entry.type === 10 ? this.view.getInt32(entry.value, this.little) : this.u32(entry.value);
        return d ? n / d : null;
      }
      default:
        return null;
    }
  }
  text(entry: Entry | undefined): string {
    if (!entry || entry.type !== 2 || entry.value + entry.count > this.bytes.length) return '';
    let s = '';
    for (let i = 0; i < entry.count; i++) {
      const c = this.bytes[entry.value + i]!;
      if (!c) break;
      s += String.fromCharCode(c);
    }
    return s.trim();
  }
}

const find = (entries: Entry[], tag: number) => entries.find((entry) => entry.tag === tag);

/** The date of an EXIF date text, `YYYY:MM:DD HH:MM:SS`. */
export function readDate(text: string): PhotoInfo['taken'] {
  const m = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(text);
  if (!m) return null;
  const [year, month, day, hour, minute, second] = m.slice(1).map(Number) as [number, number, number, number, number, number];
  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 60) return null;
  return { year, month, day, hour, minute, second };
}

function readTiff(tiff: Tiff, info: PhotoInfo): void {
  const ifd0 = tiff.ifd(tiff.u32(4));
  info.make = tiff.text(find(ifd0.entries, 0x10f));
  info.model = tiff.text(find(ifd0.entries, 0x110));
  const orientation = tiff.number(find(ifd0.entries, 0x112));
  info.orientation = orientation && orientation >= 1 && orientation <= 8 ? orientation : 1;
  let taken = readDate(tiff.text(find(ifd0.entries, 0x132)));
  const exifAt = tiff.number(find(ifd0.entries, 0x8769));
  if (exifAt) {
    const exif = tiff.ifd(exifAt);
    taken = readDate(tiff.text(find(exif.entries, 0x9003))) ?? taken;
    info.exposure = tiff.number(find(exif.entries, 0x829a));
    info.fNumber = tiff.number(find(exif.entries, 0x829d));
    info.iso = tiff.number(find(exif.entries, 0x8827));
  }
  info.taken = taken;
}

/** The segments of a JPEG before its scan: marker and the offset and length of the data. */
function segments(bytes: Uint8Array): { marker: number; at: number; length: number }[] {
  const out: { marker: number; at: number; length: number }[] = [];
  let at = 2;
  while (at + 4 <= bytes.length && bytes[at] === 0xff) {
    const marker = bytes[at + 1]!;
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7)) {
      at += 2;
      continue;
    }
    const length = (bytes[at + 2]! << 8) | bytes[at + 3]!;
    out.push({ marker, at, length });
    if (marker === 0xda) break;
    at += 2 + length;
  }
  return out;
}

const ascii = (bytes: Uint8Array, at: number, n: number) => String.fromCharCode(...bytes.subarray(at, at + n));

/** The information of a JPEG (its first 256 KB are enough) or of a DNG. Never throws. */
export function readPhotoInfo(bytes: Uint8Array): PhotoInfo {
  const info: PhotoInfo = {
    width: null,
    height: null,
    orientation: 1,
    make: '',
    model: '',
    taken: null,
    iso: null,
    fNumber: null,
    exposure: null,
    imageControl: null,
    app1: null,
  };
  try {
    if (bytes[0] === 0xff && bytes[1] === 0xd8) {
      for (const s of segments(bytes)) {
        if (s.marker === 0xe1 && ascii(bytes, s.at + 4, 6) === 'Exif\0\0' && !info.app1) {
          info.app1 = bytes.slice(s.at, s.at + 2 + s.length);
          readTiff(new Tiff(bytes.subarray(s.at + 10, s.at + 2 + s.length)), info);
        } else if (s.marker === 0xe1 && ascii(bytes, s.at + 4, 28) === 'http://ns.adobe.com/xap/1.0/') {
          const xmp = new TextDecoder().decode(bytes.subarray(s.at + 4, s.at + 2 + s.length));
          info.imageControl = imageControlOf(xmp);
        } else if (s.marker >= 0xc0 && s.marker <= 0xc3) {
          info.height = (bytes[s.at + 5]! << 8) | bytes[s.at + 6]!;
          info.width = (bytes[s.at + 7]! << 8) | bytes[s.at + 8]!;
        }
      }
    } else if ((bytes[0] === 0x49 && bytes[1] === 0x49) || (bytes[0] === 0x4d && bytes[1] === 0x4d)) {
      readTiff(new Tiff(bytes), info);
      // A DNG holds the developed picture upright: the decoder turns it.
    }
  } catch {
    // A damaged EXIF leaves the fields it did not reach.
  }
  return info;
}

/** The Image Control that a GR writes into the XMP of a JPEG: the first dc:subject. */
export function imageControlOf(xmp: string): string | null {
  const m = /<dc:subject>\s*<rdf:Bag>\s*<rdf:li>([^<]{1,40})<\/rdf:li>/.exec(xmp);
  return m ? m[1]!.trim() : null;
}

/** The quarter turns clockwise that show a picture of EXIF orientation upright, or null for a mirrored one. */
export function turnsOf(orientation: number): number | null {
  return ({ 1: 0, 6: 1, 3: 2, 8: 3 } as Record<number, number>)[orientation] ?? null;
}

/** The APEX values of a shot for the modules (GrkuShot), in 1/256 EV. */
export function apex(iso: number, fNumber: number, exposure: number) {
  const av = Math.round(2 * Math.log2(fNumber) * 256);
  const tv = Math.round(-Math.log2(exposure) * 256);
  const sv = Math.round(Math.log2(iso / 3.125) * 256);
  return { av, tv, sv, sceneEv: Math.round((Math.log2((fNumber * fNumber) / exposure) - Math.log2(iso / 100)) * 256) };
}

/**
 * The APP1 of a developed picture from the source's: the same EXIF, with the new pixel size,
 * without the thumbnail of the source (it shows the picture before), without the GPS position
 * (the camera, the time, and the exposure stay), and with `orientation` when given.
 */
export function developedApp1(app1: Uint8Array, width: number, height: number, orientation?: number): Uint8Array {
  const out = app1.slice();
  try {
    const tiff = new Tiff(out.subarray(10));
    const set16 = (at: number, v: number) => tiff.view.setUint16(at, v, tiff.little);
    const set32 = (at: number, v: number) => tiff.view.setUint32(at, v, tiff.little);
    let ifd0 = tiff.ifd(tiff.u32(4));
    // No GPS: its IFD is cleared, and its entry leaves IFD0 (the entries after it move up).
    const gps = find(ifd0.entries, 0x8825);
    if (gps) {
      const at = tiff.number(gps);
      if (at && at + 2 <= out.length - 10) {
        const ifd = tiff.ifd(at);
        for (const entry of ifd.entries) {
          const size = (TYPE_SIZES[entry.type] ?? 1) * entry.count;
          if (size > 4 && entry.value + size <= out.length - 10) out.fill(0, 10 + entry.value, 10 + entry.value + size);
        }
        out.fill(0, 10 + at + 2, 10 + at + 2 + ifd.entries.length * 12);
      }
      const index = ifd0.entries.indexOf(gps);
      const start = 10 + ifd0.at + 2;
      out.copyWithin(start + index * 12, start + (index + 1) * 12, start + ifd0.entries.length * 12);
      set16(ifd0.at, ifd0.entries.length - 1);
      ifd0 = tiff.ifd(ifd0.at);
    }
    // No IFD1: its thumbnail is of the source.
    set32(ifd0.at + 2 + ifd0.entries.length * 12, 0);
    const o = find(ifd0.entries, 0x112);
    if (orientation !== undefined && o?.type === 3) set16(o.value, orientation);
    const exifAt = tiff.number(find(ifd0.entries, 0x8769));
    if (exifAt) {
      for (const entry of tiff.ifd(exifAt).entries) {
        const v = entry.tag === 0xa002 ? width : entry.tag === 0xa003 ? height : null;
        if (v === null) continue;
        if (entry.type === 4) set32(entry.value, v);
        else if (entry.type === 3 && v < 65536) set16(entry.value, v);
      }
    }
  } catch {
    // An EXIF that cannot be read stays as it was.
  }
  return out;
}

/**
 * A small APP1 for a picture without EXIF of its own (a DNG): the camera, Orientation 1, the
 * software, and the shot data of `info`.
 */
export function shotApp1(info: PhotoInfo, width: number, height: number): Uint8Array {
  type Field = { tag: number; type: number; count: number; data: Uint8Array };
  const text = (s: string) => new TextEncoder().encode(`${s}\0`);
  const u16 = (v: number) => new Uint8Array([v >> 8, v & 255]);
  const u32 = (v: number) => new Uint8Array([v >>> 24, (v >> 16) & 255, (v >> 8) & 255, v & 255]);
  const rational = (n: number, d: number) => new Uint8Array([...u32(n), ...u32(d)]);
  const date = info.taken
    ? `${info.taken.year}:${String(info.taken.month).padStart(2, '0')}:${String(info.taken.day).padStart(2, '0')} ${String(info.taken.hour).padStart(2, '0')}:${String(info.taken.minute).padStart(2, '0')}:${String(info.taken.second).padStart(2, '0')}`
    : null;
  const ifd0: Field[] = [];
  if (info.make) ifd0.push({ tag: 0x10f, type: 2, count: info.make.length + 1, data: text(info.make) });
  if (info.model) ifd0.push({ tag: 0x110, type: 2, count: info.model.length + 1, data: text(info.model) });
  ifd0.push({ tag: 0x112, type: 3, count: 1, data: u16(1) });
  ifd0.push({ tag: 0x131, type: 2, count: 14, data: text('GRKU Develop') });
  const exif: Field[] = [];
  if (info.exposure) {
    const d = info.exposure >= 1 ? 10 : Math.round(1 / info.exposure);
    exif.push({ tag: 0x829a, type: 5, count: 1, data: info.exposure >= 1 ? rational(Math.round(info.exposure * 10), 10) : rational(1, d) });
  }
  if (info.fNumber) exif.push({ tag: 0x829d, type: 5, count: 1, data: rational(Math.round(info.fNumber * 10), 10) });
  if (info.iso) exif.push({ tag: 0x8827, type: 3, count: 1, data: u16(Math.min(65535, info.iso)) });
  if (date) exif.push({ tag: 0x9003, type: 2, count: 20, data: text(date) });
  exif.push({ tag: 0xa002, type: 4, count: 1, data: u32(width) });
  exif.push({ tag: 0xa003, type: 4, count: 1, data: u32(height) });
  ifd0.push({ tag: 0x8769, type: 4, count: 1, data: u32(0) });
  // Big-endian TIFF: header, IFD0, its data, the EXIF IFD, its data.
  const ifdSize = (fields: Field[]) => 2 + fields.length * 12 + 4;
  const dataSize = (fields: Field[]) => fields.reduce((sum, f) => sum + (f.data.length > 4 ? f.data.length + (f.data.length & 1) : 0), 0);
  const ifd0At = 8, exifAt = ifd0At + ifdSize(ifd0) + dataSize(ifd0);
  ifd0[ifd0.length - 1]!.data = u32(exifAt);
  const total = exifAt + ifdSize(exif) + dataSize(exif);
  const tiff = new Uint8Array(total);
  tiff.set([0x4d, 0x4d, 0, 42, 0, 0, 0, 8]);
  const write = (fields: Field[], at: number) => {
    const view = new DataView(tiff.buffer);
    view.setUint16(at, fields.length);
    let data = at + ifdSize(fields);
    fields.forEach((f, i) => {
      const e = at + 2 + i * 12;
      view.setUint16(e, f.tag);
      view.setUint16(e + 2, f.type);
      view.setUint32(e + 4, f.count);
      if (f.data.length <= 4) tiff.set(f.data, e + 8);
      else {
        view.setUint32(e + 8, data);
        tiff.set(f.data, data);
        data += f.data.length + (f.data.length & 1);
      }
    });
    view.setUint32(at + 2 + fields.length * 12, 0);
  };
  write(ifd0, ifd0At);
  write(exif, exifAt);
  const length = 2 + 6 + tiff.length;
  const app1 = new Uint8Array(2 + length);
  app1.set([0xff, 0xe1, length >> 8, length & 255, 0x45, 0x78, 0x69, 0x66, 0, 0]);
  app1.set(tiff, 10);
  return app1;
}
