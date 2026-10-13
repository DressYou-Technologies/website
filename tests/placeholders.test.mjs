import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { findPlaceholders, scanDist, unscannedFiles } from './support/placeholders.mjs';

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

// The gate is only as good as its walk: it is run on a folder built to hold one of each.
function withFolder(files, check) {
  const root = mkdtempSync(join(tmpdir(), 'dressyou-gate-'));
  try {
    for (const [name, content] of Object.entries(files)) {
      mkdirSync(join(root, name, '..'), { recursive: true });
      writeFileSync(join(root, name), content);
    }
    check(root);
  } finally {
    rmSync(root, { recursive: true });
  }
}

test('the scan reaches every text file in every folder and names the file and line', () => {
  withFolder({
    'index.html': '<p>fine</p>\n<p>[[FOUNDER: a — b]]</p>',
    'en/support/index.html': '[[COUNSEL: c — d]]',
    'auth/page.mjs': '// TODO decide',
    'style.css': '.x { content: "{{ x }}" }',
    'llms.txt': 'write to team@example.com',
    'site.webmanifest': '{}',
    'sitemap.xml': '<loc>https://dressyouapp.com/</loc>',
    'icon.png': '[[FOUNDER: never read — binary]]',
  }, (root) => {
    const hits = scanDist(root).map((hit) => `${hit.file}:${hit.line} ${hit.kind}`).sort();
    assert.deepEqual(hits, [
      'auth/page.mjs:1 to-do marker', 'en/support/index.html:1 counsel marker', 'index.html:2 founder marker',
      'llms.txt:1 reserved address', 'style.css:1 template marker',
    ]);
  });
});

test('a file type the gate cannot read is reported rather than shipped unscanned', () => {
  withFolder({ 'index.html': 'x', 'logo.webp': 'x', 'notes.md': '[[FOUNDER: x — y]]', 'data/export.csv': 'x', 'icon.svg': '<svg/>' }, (root) => {
    assert.deepEqual(unscannedFiles(root), ['data/export.csv', 'icon.svg', 'notes.md']);
  });
});

test('every file the site ships is either scanned as text or known binary', () => {
  assert.deepEqual(unscannedFiles(), [], 'a file type the gate cannot read would ship unscanned');
});

test('no placeholder ships', () => {
  const hits = scanDist();
  const summary = hits.map((hit) => `${hit.file}:${hit.line} ${hit.kind} ${hit.excerpt}`);
  assert.deepEqual(summary, [], `${hits.length} placeholder(s) still ship; the founder and counsel must resolve each before merge`);
});
