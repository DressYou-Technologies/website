import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

test('the heading is the lockup and names the brand line for assistive tech', () => {
  assert.match(html, /<h1><img class="lockup" src="\/images\/dressyou-lockup\.webp"[^>]*alt="dressyou"/);
  assert.match(html, /the new way to experience fashion<\/span><\/h1>\s*<p class="soon">coming soon<\/p>/);
});

test('every local asset the page references exists', async () => {
  for (const [, path] of html.matchAll(/(?:src|href)="(\/[^"]+)"/g)) {
    await access(new URL(`../dist${path}`, import.meta.url));
  }
});
