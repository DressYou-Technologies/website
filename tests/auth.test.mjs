import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { browserLang, opensInFrench, readVerifiedLink } from '../src/lib/auth.ts';
import { COPY } from '../src/i18n/copy.ts';
import { LANGS, localize } from '../src/i18n/lang.ts';

// The API's contract (DressYou repository, docs/architecture/auth.md): verification lands on /auth/verified, with
// ?error=<code> when the link failed.
test('a verification link is verified unless the API added an error', () => {
  assert.equal(readVerifiedLink(''), 'verified');
  for (const code of ['INVALID_TOKEN', 'TOKEN_EXPIRED', 'USER_NOT_FOUND', 'INVALID_USER']) assert.equal(readVerifiedLink(`?error=${code}`), 'failed', code);
  assert.equal(readVerifiedLink('?lang=en'), 'verified');
});

test("the browser's language is its first one the site has", () => {
  assert.equal(browserLang(['fr-FR', 'en-US']), 'fr');
  assert.equal(browserLang(['en-GB', 'fr']), 'en');
  assert.equal(browserLang(['de-DE', 'FR-ca']), 'fr');
  assert.equal(browserLang(['de', 'it']), undefined);
  assert.equal(browserLang([]), undefined);
});

// Founder, 2026-11-13: French automatically when the browser's language is French, the /fr page as it is, the switch kept.
test('a French browser on the root page goes to French, and nothing else moves', () => {
  assert.equal(opensInFrench('en', '', ['fr-FR', 'en']), true);
  assert.equal(opensInFrench('en', '?error=TOKEN_EXPIRED', ['fr']), true);
  assert.equal(opensInFrench('en', '', ['en-GB', 'fr']), false);
  assert.equal(opensInFrench('en', '', ['de']), false);
  // The switch brought this browser to English, so it stays.
  assert.equal(opensInFrench('en', '?lang=en', ['fr-FR']), false);
  assert.equal(opensInFrench('en', '?error=INVALID_TOKEN&lang=en', ['fr-FR']), false);
  // The French page never moves, so the two pages cannot loop.
  for (const languages of [['fr'], ['en'], ['de']]) assert.equal(opensInFrench('fr', '', languages), false, languages.join());
});

// Runs over the built site: `npm run build` first.
const DIST = new URL('../dist/', import.meta.url);
const read = (path) => readFile(new URL(path, DIST), 'utf8');
const fileOf = (lang, path) => `${localize(lang, path).slice(1)}.html`;
const decode = (s) => s.replaceAll('&#39;', "'").replaceAll('&quot;', '"').replaceAll('&amp;', '&');

test('each verified page carries both results and a way to open the app, in its language', async () => {
  for (const lang of LANGS) {
    const page = decode(await read(fileOf(lang, '/auth/verified'))), t = COPY[lang].verified;
    assert.match(page, new RegExp(`<html lang="${lang}"`));
    for (const state of ['verified', 'failed']) assert.match(page, new RegExp(`<section[^>]*data-state="${state}"[^>]*hidden`), `${lang}: ${state}`);
    for (const line of [t.title, t.verified, t.failed, t.help, t.noscript]) assert.ok(page.includes(line), `${lang}: ${line}`);
    assert.match(page, new RegExp(`<a[^>]*href="dressyou://"[^>]*>${t.open}</a>`), `${lang}: no link opens the app`);
  }
});

// The founder moved password changes into the app (2026-11-13): the web reset page must not go live.
test('the verified page stays out of search, the sitemap and llms.txt, and no reset page is built', async () => {
  for (const lang of LANGS) {
    const page = await read(fileOf(lang, '/auth/verified'));
    assert.match(page, /<meta name="robots" content="noindex, nofollow">/, lang);
    assert.doesNotMatch(page, /rel="canonical"/, lang);
    await assert.rejects(read(fileOf(lang, '/auth/reset')), `${lang}: a reset page is built`);
  }
  for (const file of ['sitemap.xml', 'llms.txt']) assert.doesNotMatch(await read(file), /\/auth\//, file);
});
