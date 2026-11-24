/**
 * A ZIP of the developed JPEGs, stored without compression (a JPEG does not compress further), as
 * Blob parts, so the pictures are not copied into one buffer.
 */

let table: Uint32Array | null = null;
export function crc32(bytes: Uint8Array, crc = 0): number {
  if (!table) {
    table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let c = ~crc >>> 0;
  for (let i = 0; i < bytes.length; i++) c = table[(c ^ bytes[i]!) & 255]! ^ (c >>> 8);
  return ~c >>> 0;
}

export interface ZipEntry {
  name: string;
  bytes: Uint8Array;
  date?: Date;
}

/** The DOS time and date of a ZIP entry. */
function dosTime(date: Date): [number, number] {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
  const day = ((Math.max(1980, date.getFullYear()) - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return [time, day];
}

/** The parts of a ZIP of `entries`, names in UTF-8. */
export function zipParts(entries: readonly ZipEntry[]): Uint8Array<ArrayBuffer>[] {
  const parts: Uint8Array<ArrayBuffer>[] = [];
  const central: Uint8Array<ArrayBuffer>[] = [];
  let offset = 0;
  const encoder = new TextEncoder();
  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const crc = crc32(entry.bytes);
    const [time, day] = dosTime(entry.date ?? new Date());
    const local = new Uint8Array(30 + name.length);
    const l = new DataView(local.buffer);
    l.setUint32(0, 0x04034b50, true);
    l.setUint16(4, 20, true);
    l.setUint16(6, 0x0800, true);
    l.setUint16(8, 0, true);
    l.setUint16(10, time, true);
    l.setUint16(12, day, true);
    l.setUint32(14, crc, true);
    l.setUint32(18, entry.bytes.length, true);
    l.setUint32(22, entry.bytes.length, true);
    l.setUint16(26, name.length, true);
    local.set(name, 30);
    const record = new Uint8Array(46 + name.length);
    const c = new DataView(record.buffer);
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint16(8, 0x0800, true);
    c.setUint16(12, time, true);
    c.setUint16(14, day, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, entry.bytes.length, true);
    c.setUint32(24, entry.bytes.length, true);
    c.setUint16(28, name.length, true);
    c.setUint32(42, offset, true);
    record.set(name, 46);
    parts.push(local, entry.bytes as Uint8Array<ArrayBuffer>);
    central.push(record);
    offset += local.length + entry.bytes.length;
  }
  const size = central.reduce((sum, item) => sum + item.length, 0);
  const end = new Uint8Array(22);
  const e = new DataView(end.buffer);
  e.setUint32(0, 0x06054b50, true);
  e.setUint16(8, entries.length, true);
  e.setUint16(10, entries.length, true);
  e.setUint32(12, size, true);
  e.setUint32(16, offset, true);
  return [...parts, ...central, end];
}

/** The file name of a developed photo: its own name, GRKU, and the look. */
export function developedName(source: string, look: string | null): string {
  const base = source.replace(/\.[^.]*$/, '') || 'photo';
  const tag = (look ?? '')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `${base}-GRKU${tag ? `-${tag}` : ''}.jpg`;
}

/** A name that `taken` does not hold yet: name-2.jpg, name-3.jpg, and so on. */
export function uniqueName(name: string, taken: Set<string>): string {
  let out = name;
  for (let n = 2; taken.has(out.toLowerCase()); n++) out = name.replace(/(\.[^.]*)?$/, `-${n}$1`);
  taken.add(out.toLowerCase());
  return out;
}
