// Adds the rights of the site's own pictures to their metadata, without encoding them again:
//   node scripts/image-rights.mjs PATH...
// Each PATH is a file or a folder (searched in depth). A JPEG gets an EXIF segment (Artist,
// Copyright) and an XMP segment (dc:creator, dc:rights, photoshop:Credit, xmpRights); a WebP gets
// the same EXIF and XMP chunks (a simple WebP becomes an extended one, its image data as it was);
// a PNG gets tEXt chunks (Author, Copyright, Source). The pixels and the compressed data stay the
// same bytes. A file that already has the rights is left as it is, so a second run changes
// nothing. build-webp.mjs, build-hero.mjs, and build-landing.mjs sign what they write; the site
// build signs dist/ (package.json). See HANDOFF.md, Signatures.
//
// Never sign a picture that goes to the camera (public/shutdown/): the camera decodes the shutdown
// picture itself, and segments that it does not expect have stopped its power-off.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ARTIST = 'BOTNICK';
export const RIGHTS = '© BOTNICK · GRKU (grku.app)';
/** EXIF text is ASCII. */
const RIGHTS_ASCII = 'Copyright BOTNICK - GRKU (grku.app)';
const SOURCE = 'https://grku.app';
/** What a signed file holds, in each format: how a second run knows it. */
const MARK = Buffer.from('grku.app');

/** The folders whose pictures go to the camera as they are. */
const CAMERA_FILES = /[\\/]shutdown[\\/]/;

const XMP = `<?xpacket begin="\u{feff}" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/" xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/" xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/"><dc:creator><rdf:Seq><rdf:li>${ARTIST}</rdf:li></rdf:Seq></dc:creator><dc:rights><rdf:Alt><rdf:li xml:lang="x-default">${RIGHTS}</rdf:li></rdf:Alt></dc:rights><photoshop:Credit>GRKU by ${ARTIST} (grku.app)</photoshop:Credit><xmpRights:Marked>True</xmpRights:Marked><xmpRights:WebStatement>${SOURCE}/</xmpRights:WebStatement><Iptc4xmpCore:CreatorContactInfo rdf:parseType="Resource"><Iptc4xmpCore:CiUrlWork>${SOURCE}/</Iptc4xmpCore:CiUrlWork></Iptc4xmpCore:CreatorContactInfo></rdf:Description></rdf:RDF></x:xmpmeta>
<?xpacket end="r"?>`;

/** A TIFF structure (little-endian) with IFD0 Artist and Copyright: the body of an EXIF block. */
function tiff() {
  const entries = [
    [0x013b, Buffer.from(`${ARTIST}\0`, 'latin1')],
    [0x8298, Buffer.from(`${RIGHTS_ASCII}\0`, 'latin1')],
  ];
  const head = 8 + 2 + entries.length * 12 + 4;
  const out = Buffer.alloc(head + entries.reduce((sum, [, value]) => sum + value.length + (value.length & 1), 0));
  out.write('II', 0, 'latin1');
  out.writeUInt16LE(42, 2);
  out.writeUInt32LE(8, 4);
  out.writeUInt16LE(entries.length, 8);
  let data = head;
  entries.forEach(([tag, value], index) => {
    const at = 10 + index * 12;
    out.writeUInt16LE(tag, at);
    out.writeUInt16LE(2, at + 2); // ASCII
    out.writeUInt32LE(value.length, at + 4);
    out.writeUInt32LE(data, at + 8);
    value.copy(out, data);
    data += value.length + (value.length & 1);
  });
  out.writeUInt32LE(0, 10 + entries.length * 12); // no next IFD
  return out;
}

function segment(marker, body) {
  const head = Buffer.alloc(4);
  head.writeUInt16BE(marker, 0);
  head.writeUInt16BE(body.length + 2, 2);
  return Buffer.concat([head, body]);
}

/** The JPEG with the rights after SOI and the JFIF segment, or null when it has them or is no JPEG. */
export function signJpeg(bytes) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let at = 2;
  let exif = false;
  // The application segments at the start: where the new ones go, and whether EXIF is there.
  while (at + 4 <= bytes.length && bytes[at] === 0xff && bytes[at + 1] >= 0xe0 && bytes[at + 1] <= 0xef) {
    const length = bytes.readUInt16BE(at + 2);
    const body = bytes.subarray(at + 4, at + 2 + length);
    if (bytes[at + 1] === 0xe1 && body.subarray(0, 6).toString('latin1') === 'Exif\0\0') exif = true;
    if (bytes[at + 1] === 0xe1 && body.includes(MARK)) return null;
    at += 2 + length;
  }
  const added = [];
  if (!exif) added.push(segment(0xffe1, Buffer.concat([Buffer.from('Exif\0\0', 'latin1'), tiff()])));
  added.push(segment(0xffe1, Buffer.concat([Buffer.from('http://ns.adobe.com/xap/1.0/\0', 'latin1'), Buffer.from(XMP)])));
  return Buffer.concat([bytes.subarray(0, at), ...added, bytes.subarray(at)]);
}

function chunk(type, body) {
  const head = Buffer.alloc(8);
  head.write(type, 0, 'latin1');
  head.writeUInt32LE(body.length, 4);
  return Buffer.concat([head, body, body.length & 1 ? Buffer.alloc(1) : Buffer.alloc(0)]);
}

/** The chunks of a RIFF body: type, start of the chunk, and the body. */
function chunks(bytes) {
  const out = [];
  for (let at = 12; at + 8 <= bytes.length; ) {
    const size = bytes.readUInt32LE(at + 4);
    out.push({ type: bytes.subarray(at, at + 4).toString('latin1'), start: at, body: bytes.subarray(at + 8, at + 8 + size) });
    at += 8 + size + (size & 1);
  }
  return out;
}

/** The canvas of a simple WebP and whether it has alpha, from its VP8 or VP8L header. */
function canvas({ type, body }) {
  if (type === 'VP8 ') {
    if (body[3] !== 0x9d || body[4] !== 0x01 || body[5] !== 0x2a) throw new Error('VP8: no start code');
    return { width: body.readUInt16LE(6) & 0x3fff, height: body.readUInt16LE(8) & 0x3fff, alpha: false };
  }
  if (type === 'VP8L') {
    if (body[0] !== 0x2f) throw new Error('VP8L: no signature');
    const bits = body.readUInt32LE(1);
    return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1, alpha: ((bits >>> 28) & 1) === 1 };
  }
  throw new Error(`WebP: unknown first chunk ${type}`);
}

/** The WebP with EXIF and XMP chunks, or null when it has them or is no WebP. */
export function signWebp(bytes) {
  if (bytes.subarray(0, 4).toString('latin1') !== 'RIFF' || bytes.subarray(8, 12).toString('latin1') !== 'WEBP') return null;
  const list = chunks(bytes);
  if (list.some((item) => (item.type === 'XMP ' || item.type === 'EXIF') && item.body.includes(MARK))) return null;
  let parts;
  if (list[0]?.type === 'VP8X') {
    const vp8x = Buffer.from(list[0].body);
    const hasExif = list.some((item) => item.type === 'EXIF');
    vp8x[0] |= 0x04 | (hasExif ? 0 : 0x08);
    const kept = list.slice(1).filter((item) => item.type !== 'XMP ');
    parts = [chunk('VP8X', vp8x), ...kept.map((item) => bytes.subarray(item.start, item.start + 8 + item.body.length + (item.body.length & 1)))];
    if (!hasExif) parts.push(chunk('EXIF', tiff()));
  } else {
    const { width, height, alpha } = canvas(list[0]);
    const vp8x = Buffer.alloc(10);
    vp8x[0] = 0x08 | 0x04 | (alpha ? 0x10 : 0);
    vp8x.writeUIntLE(width - 1, 4, 3);
    vp8x.writeUIntLE(height - 1, 7, 3);
    parts = [chunk('VP8X', vp8x), bytes.subarray(12), chunk('EXIF', tiff())];
  }
  parts.push(chunk('XMP ', Buffer.from(XMP)));
  const body = Buffer.concat(parts);
  const head = Buffer.alloc(12);
  head.write('RIFF', 0, 'latin1');
  head.writeUInt32LE(body.length + 4, 4);
  head.write('WEBP', 8, 'latin1');
  return Buffer.concat([head, body]);
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(bytes) {
  let c = 0xffffffff;
  for (const byte of bytes) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, body) {
  const out = Buffer.alloc(12 + body.length);
  out.writeUInt32BE(body.length, 0);
  out.write(type, 4, 'latin1');
  body.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + body.length)), 8 + body.length);
  return out;
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** The PNG with tEXt chunks after IHDR, or null when it has them or is no PNG. */
export function signPng(bytes) {
  if (!bytes.subarray(0, 8).equals(PNG_SIGNATURE)) return null;
  for (let at = 8; at + 8 <= bytes.length; ) {
    const length = bytes.readUInt32BE(at);
    const type = bytes.subarray(at + 4, at + 8).toString('latin1');
    if (type === 'tEXt' && bytes.subarray(at + 8, at + 8 + length).includes(MARK)) return null;
    if (type === 'IDAT') break;
    at += 12 + length;
  }
  const ihdrEnd = 8 + 12 + bytes.readUInt32BE(8);
  // tEXt is Latin-1, which has © and ·.
  const text = (key, value) => pngChunk('tEXt', Buffer.from(`${key}\0${value}`, 'latin1'));
  return Buffer.concat([
    bytes.subarray(0, ihdrEnd),
    text('Author', ARTIST),
    text('Copyright', RIGHTS),
    text('Source', SOURCE),
    bytes.subarray(ihdrEnd),
  ]);
}

const SIGNERS = { '.jpg': signJpeg, '.jpeg': signJpeg, '.webp': signWebp, '.png': signPng };

/** Signs one file in place. Returns the bytes added, or 0 when the file is left as it is. */
export function signFile(path) {
  if (CAMERA_FILES.test(path)) return 0;
  const sign = SIGNERS[path.slice(path.lastIndexOf('.')).toLowerCase()];
  if (!sign) return 0;
  const bytes = readFileSync(path);
  const signed = sign(bytes);
  if (!signed) return 0;
  writeFileSync(path, signed);
  return signed.length - bytes.length;
}

/** Signs each picture under `paths`. Returns the files signed and the bytes added. */
export function signPaths(paths) {
  let files = 0;
  let bytes = 0;
  const visit = (path) => {
    if (statSync(path).isDirectory()) {
      for (const name of readdirSync(path)) visit(join(path, name));
      return;
    }
    const added = signFile(path);
    if (added > 0) {
      files += 1;
      bytes += added;
    }
  };
  for (const path of paths) visit(path);
  return { files, bytes };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const paths = process.argv.slice(2);
  if (paths.length === 0) throw new Error('Usage: node scripts/image-rights.mjs PATH...');
  const { files, bytes } = signPaths(paths);
  console.log(`Image rights: ${files} pictures signed, ${bytes} bytes added.`);
}
