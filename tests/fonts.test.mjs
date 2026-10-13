import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { brotliCompressSync } from 'node:zlib';
import { fontProblems } from './support/font-rules.mjs';
import { loadSite, withPageHtml } from './support/site.mjs';
import { coveredCodePoints } from './support/woff2.mjs';

const covered = coveredCodePoints(readFileSync(new URL('../dist/fonts/Manrope.woff2', import.meta.url)));
const site = loadSite();
const has = (character) => covered.has(character.codePointAt(0));

test('the reader finds what the shipped font covers, and what it does not', () => {
  for (const character of ['A', 'z', '0', '&', 'é', 'È', 'ç', 'ô', 'œ', 'Œ', '’', '“', '«', '»', '–', '—', '…', '€', ' ', '§']) {
    assert.ok(has(character), `${character} (U+${character.codePointAt(0).toString(16)}) is in the font`);
  }
  for (const character of ['→', '↓', '•', '✓', ' ', ' ', '‑', '≥', '́']) {
    assert.ok(!has(character), `U+${character.codePointAt(0).toString(16)} is not in the font`);
  }
});

test('every character that is shown is composed (NFC) and drawn by the brand font, not a fallback', () => {
  assert.deepEqual(fontProblems(site, covered), []);
});

test('a character the font lacks, and a decomposed accent, are both refused', () => {
  const add = (text) => withPageHtml(site, '/support/', (html) => html.replace('<h2>Dans l’application</h2>', `<h2>Dans l’application ${text}</h2>`));
  assert.match(fontProblems(add('→'), covered).join('\n'), /\/support\/ shows U\+2192 → which Manrope does not draw/);
  assert.match(fontProblems(add(' '), covered).join('\n'), /U\+202f/);
  assert.match(fontProblems(add('é'), covered).join('\n'), /not composed \(NFC\)/);
  assert.deepEqual(fontProblems(add('é œ ’ « » … –'), covered), []);
});

// A font small enough to read by eye: it holds only a cmap, with every case the reader must get right.
const u16 = (value) => [(value >> 8) & 255, value & 255];
const u32 = (value) => [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
const base128 = (value) => { const bytes = [value & 0x7f]; for (let rest = value >> 7; rest; rest >>= 7) bytes.unshift((rest & 0x7f) | 0x80); return bytes; };

function syntheticWoff2() {
  const segments = 4;
  const format4 = [
    ...u16(4), ...u16(16 + segments * 8 + 6), ...u16(0), ...u16(segments * 2), ...u16(0), ...u16(0), ...u16(0),
    ...u16(0x43), ...u16(0x51), ...u16(0x62), ...u16(0xffff), ...u16(0),   // A-C, P-Q, `-b, terminator
    ...u16(0x41), ...u16(0x50), ...u16(0x60), ...u16(0xffff),
    ...u16(0xffc0), ...u16(0xffb0), ...u16(0xfffb), ...u16(1),             // A-C land on glyphs 1-3; P on glyph 0, Q on glyph 1
    ...u16(0), ...u16(0), ...u16(4), ...u16(0),                            // `-b read their glyphs from the array below
    ...u16(0), ...u16(5), ...u16(6),                                       // glyphIdArray: ` is 0, a is 5 and b is 6; with delta -5 only b is drawn
  ];
  const groups = (list) => [...u16(12), ...u16(0), ...u32(16 + list.length * 12), ...u32(0), ...u32(list.length), ...list.flatMap(([a, b, glyph]) => [...u32(a), ...u32(b), ...u32(glyph)])];
  const format12 = groups([[0x1f600, 0x1f601, 7], [0x1f700, 0x1f701, 0]]);   // the second range starts on glyph 0
  const mac = groups([[0x1f800, 0x1f800, 9]]);
  const first = 4 + 3 * 8;
  const cmap = Buffer.from([
    ...u16(0), ...u16(3),
    ...u16(0), ...u16(3), ...u32(first),
    ...u16(3), ...u16(10), ...u32(first + format4.length),
    ...u16(1), ...u16(0), ...u32(first + format4.length + format12.length),     // Macintosh: not Unicode
    ...format4, ...format12, ...mac,
  ]);
  const compressed = brotliCompressSync(cmap);
  const header = [...u32(0x774f4632), ...u32(0x00010000), ...u32(0), ...u16(1), ...u16(0), ...u32(0), ...u32(compressed.length), ...u16(1), ...u16(0), ...u32(0), ...u32(0), ...u32(0), ...u32(0), ...u32(0)];
  return Buffer.concat([Buffer.from(header), Buffer.from([0, ...base128(cmap.length)]), compressed]);
}

test('the reader takes the Unicode subtables of both formats, skips glyph 0 and other platforms, and refuses a file that is not WOFF2', () => {
  const found = [...coveredCodePoints(syntheticWoff2())].sort((a, b) => a - b);
  assert.deepEqual(found, [0x41, 0x42, 0x43, 0x51, 0x62, 0x1f600, 0x1f601, 0x1f701]);
  assert.throws(() => coveredCodePoints(Buffer.from('this is not a font at all, not even close')), /not a WOFF2 file/);
});
