import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import { offeredLang } from '../src/lib/offer.ts';
import { COPY } from '../src/i18n/copy.ts';
import { LANGS, localize } from '../src/i18n/lang.ts';

// Founder, 2026-11-14: when the browser's language differs from the page's, a one-line bar offers the other language in
// one tap. Never a redirect (Google: avoid automatically redirecting users between language versions).
test("the bar offers the browser's language when it differs from the page's, and never once declined", () => {
  assert.equal(offeredLang('en', ['fr-FR', 'en'], null), 'fr');
  assert.equal(offeredLang('fr', ['en-GB', 'fr'], null), 'en');
  assert.equal(offeredLang('en', ['en-US'], null), undefined);
  assert.equal(offeredLang('fr', ['fr-CA', 'en'], null), undefined);
  assert.equal(offeredLang('en', ['de', 'it'], null), undefined);
  assert.equal(offeredLang('en', ['fr'], 'fr'), undefined);
  assert.equal(offeredLang('fr', ['en'], 'fr'), 'en');
});

// Runs over the built site: `npm run build` first.
const DIST = new URL('../dist/', import.meta.url);
const read = (path) => readFile(new URL(path, DIST), 'utf8');

test('every page carries the bar hidden, offering its twin in the other language', async () => {
  const pages = (await readdir(DIST, { recursive: true })).filter((f) => f.endsWith('.html'));
  for (const lang of LANGS) {
    const file = localize(lang, '/legal').slice(1) + '.html', page = await read(file);
    for (const other of LANGS.filter((l) => l !== lang)) {
      const bar = page.match(new RegExp(`<div class="langbar"[^>]*lang="${other}"[^>]*>[\\s\\S]*?</div>`))?.[0] ?? '';
      assert.match(bar, /\shidden[\s>]/, `${file}: the bar shows without a script`);
      assert.ok(bar.includes(`href="${localize(other, '/legal')}"`) && bar.includes(`>${COPY[lang].lang.label}</a>`), `${file}: ${bar}`);
      assert.ok(bar.includes(`aria-label="${COPY[other].dialog.close}"`), `${file}: the close button has no label`);
    }
  }
  for (const page of pages) assert.match(await read(page), /<div class="langbar"/, page);
});
