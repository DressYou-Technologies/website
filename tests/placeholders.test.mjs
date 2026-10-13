import assert from 'node:assert/strict';
import test from 'node:test';
import { findPlaceholders, scanDist } from './support/placeholders.mjs';
import { distFiles, KNOWN_BINARY, TEXT } from './support/site.mjs';

test('the detector names every kind of placeholder and its line', () => {
  const samples = {
    'founder marker': 'a\n[[FOUNDER: user-contact — the address]]',
    'counsel marker': '[[COUNSEL: dpo — a question]]',
    'bracket marker': 'x [[SOMETHING else]] y',
    'template marker': 'Bonjour {{ name }}',
    'to-do marker': '<!-- TODO: write -->',
    'lorem ipsum': 'Lorem ipsum dolor',
    'reserved address': 'write to contact@example.com',
  };
  for (const [kind, text] of Object.entries(samples)) {
    const hits = findPlaceholders(text);
    assert.ok(hits.some((hit) => hit.kind === kind), `${kind} must be detected in ${JSON.stringify(text)}`);
  }
  assert.equal(findPlaceholders('a\n[[FOUNDER: k — d]]')[0].line, 2);
  const two = findPlaceholders('[[FOUNDER: a — b]] puis [[COUNSEL: c — d]]');
  assert.deepEqual(two.map((hit) => hit.kind), ['founder marker', 'counsel marker'], 'one hit per marker, none counted twice');
});

test('the detector leaves ordinary copy, real addresses and brackets alone', () => {
  const clean = [
    'Écrivez à privacy@dressyouapp.com avant le 12 mars.',
    'Sizes [S, M, L] and a [link](/x/) are fine.',
    'The latest test of an example is not a placeholder.',
    'Un total de 5 000 € (et non XXL).',
  ];
  for (const text of clean) assert.deepEqual(findPlaceholders(text), [], text);
});

test('every shipped file is either scanned as text or known binary', () => {
  const unknown = distFiles().filter((file) => !TEXT.test(file) && !KNOWN_BINARY.test(file));
  assert.deepEqual(unknown, [], 'a file type the gate cannot read would ship unscanned');
});

test('no placeholder ships', () => {
  const hits = scanDist();
  const summary = hits.map((hit) => `${hit.file}:${hit.line} ${hit.kind} ${hit.excerpt}`);
  assert.deepEqual(summary, [], `${hits.length} placeholder(s) still ship; the founder and counsel must resolve each before merge`);
});
