import { brotliDecompressSync } from 'node:zlib';

// The table tags a WOFF2 directory names by index (W3C WOFF2 section 5.1).
const KNOWN_TAGS = [
  'cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca', 'prep', 'CFF ', 'VORG',
  'EBDT', 'EBLC', 'gasp', 'hdmx', 'kern', 'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB', 'EBSC',
  'JSTF', 'MATH', 'CBDT', 'CBLC', 'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt', 'avar', 'bdat', 'bloc', 'bsln', 'cvar', 'fdsc',
  'feat', 'fmtx', 'fvar', 'gvar', 'hsty', 'just', 'lcar', 'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf', 'Glat',
  'Gloc', 'Feat', 'Sill',
];
const SIGNATURE = 0x774f4632;
const HEADER_BYTES = 48;
const ARBITRARY_TAG = 0x3f;
const NULL_TRANSFORM_FOR_GLYPHS = 3;
const LAST_BMP_CODE = 0xffff;

function readBase128(view, cursor) {
  let value = 0;
  for (let i = 0; i < 5; i++) {
    const byte = view.getUint8(cursor.at++);
    value = value * 128 + (byte & 0x7f);
    if (!(byte & 0x80)) return value;
  }
  throw new Error('bad UIntBase128 in the WOFF2 table directory');
}

/** The `cmap` table's bytes: the only table the test needs, and one WOFF2 never transforms. */
function cmapOf(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(0) !== SIGNATURE) throw new Error('not a WOFF2 file');
  const tableCount = view.getUint16(12);
  const compressedSize = view.getUint32(20);
  const cursor = { at: HEADER_BYTES };
  const tables = [];
  for (let i = 0; i < tableCount; i++) {
    const flags = view.getUint8(cursor.at++);
    const index = flags & 0x3f;
    let tag = KNOWN_TAGS[index];
    if (index === ARBITRARY_TAG) {
      tag = String.fromCharCode(...bytes.subarray(cursor.at, cursor.at + 4));
      cursor.at += 4;
    }
    const version = flags >> 6;
    const length = readBase128(view, cursor);
    const glyphTable = tag === 'glyf' || tag === 'loca';
    const transformed = glyphTable ? version !== NULL_TRANSFORM_FOR_GLYPHS : version !== 0;
    tables.push({ tag, stored: transformed ? readBase128(view, cursor) : length });
  }
  const data = brotliDecompressSync(bytes.subarray(cursor.at, cursor.at + compressedSize));
  let position = 0;
  for (const { tag, stored } of tables) {
    if (tag === 'cmap') return data.subarray(position, position + stored);
    position += stored;
  }
  throw new Error('the font has no cmap table');
}

function readSegments(view, offset, covered) {
  const segments = view.getUint16(offset + 6) / 2;
  const ends = offset + 14;
  const starts = ends + segments * 2 + 2;
  const deltas = starts + segments * 2;
  const rangeOffsets = deltas + segments * 2;
  for (let s = 0; s < segments; s++) {
    const end = view.getUint16(ends + s * 2);
    const start = view.getUint16(starts + s * 2);
    const delta = view.getUint16(deltas + s * 2);
    const rangeOffset = view.getUint16(rangeOffsets + s * 2);
    for (let code = start; code <= end && code < LAST_BMP_CODE; code++) {
      let glyph;
      if (rangeOffset === 0) glyph = (code + delta) & 0xffff;
      else {
        glyph = view.getUint16(rangeOffsets + s * 2 + rangeOffset + (code - start) * 2);
        if (glyph !== 0) glyph = (glyph + delta) & 0xffff;
      }
      if (glyph !== 0) covered.add(code);
    }
  }
}

function readGroups(view, offset, covered) {
  const groups = view.getUint32(offset + 12);
  for (let g = 0; g < groups; g++) {
    const at = offset + 16 + g * 12;
    const [start, end, firstGlyph] = [view.getUint32(at), view.getUint32(at + 4), view.getUint32(at + 8)];
    for (let code = start; code <= end; code++) if (firstGlyph + (code - start) !== 0) covered.add(code);
  }
}

/** Every code point a WOFF2 font draws with a glyph of its own, read from its Unicode cmap. */
export function coveredCodePoints(bytes) {
  const cmap = cmapOf(bytes);
  const view = new DataView(cmap.buffer, cmap.byteOffset, cmap.byteLength);
  const covered = new Set();
  for (let i = 0; i < view.getUint16(2); i++) {
    const [platform, encoding, offset] = [view.getUint16(4 + i * 8), view.getUint16(6 + i * 8), view.getUint32(8 + i * 8)];
    if (platform !== 0 && !(platform === 3 && (encoding === 1 || encoding === 10))) continue;
    const format = view.getUint16(offset);
    if (format === 4) readSegments(view, offset, covered);
    else if (format === 12) readGroups(view, offset, covered);
  }
  return covered;
}
