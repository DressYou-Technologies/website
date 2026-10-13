import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
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
