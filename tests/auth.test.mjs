import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { readVerifiedLink } from '../src/lib/auth.ts';
import { COPY } from '../src/i18n/copy.ts';
import { LANGS, localize } from '../src/i18n/lang.ts';

// The API's contract (DressYou repository, docs/architecture/auth.md): verification lands on /auth/verified, with
// ?error=<code> when the link failed.
test('a verification link is verified unless the API added an error', () => {
  assert.equal(readVerifiedLink(''), 'verified');
  for (const code of ['INVALID_TOKEN', 'TOKEN_EXPIRED', 'USER_NOT_FOUND', 'INVALID_USER']) assert.equal(readVerifiedLink(`?error=${code}`), 'failed', code);
  assert.equal(readVerifiedLink('?lang=en'), 'verified');
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
