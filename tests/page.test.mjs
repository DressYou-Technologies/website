import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

test('the heading is the mark and the name, followed by the tagline and coming soon', () => {
  assert.match(html, /<h1 class="brand"><img class="mark" src="\/images\/dressyou-logo\.webp"[^>]*alt=""[^>]*>dressyou<\/h1>/);
  assert.match(html, /<p class="focus">The new way to experience fashion<\/p>/);
  assert.match(html, /<section class="marquee" aria-label="coming soon">/);
});

test('every local asset the page references exists', async () => {
  for (const [, path] of html.matchAll(/(?:src|href)="(\/[^"]+)"/g)) {
    await access(new URL(`../dist${path}`, import.meta.url));
  }
});
