import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { readResetLink, readVerifiedLink, passwordProblem, resetOutcome, submitReset } from '../src/lib/auth.ts';
import { COPY } from '../src/i18n/copy.ts';
import { LANGS, localize } from '../src/i18n/lang.ts';

// The API's contract (DressYou repository, docs/architecture/auth.md and api/src/auth/reset-cors.ts): the reset mail links
// /auth/reset#token=<token>, Better Auth's own link redirects to ?token=<token> or ?error=INVALID_TOKEN, and verification
// lands on /auth/verified, with ?error=<code> when the link failed.
test('a reset link opens the form with its token, from the fragment first, then the query', () => {
  assert.deepEqual(readResetLink('', '#token=abc'), { state: 'form', token: 'abc' });
  assert.deepEqual(readResetLink('?token=abc', ''), { state: 'form', token: 'abc' });
  assert.deepEqual(readResetLink('?token=old', '#token=new'), { state: 'form', token: 'new' });
  assert.deepEqual(readResetLink('', '#token=a%2Bb'), { state: 'form', token: 'a+b' });
});

test('a reset link the API refused, or with an empty token, says it is invalid, and no link says so', () => {
  assert.deepEqual(readResetLink('?error=INVALID_TOKEN', ''), { state: 'invalid' });
  assert.deepEqual(readResetLink('', '#token='), { state: 'invalid' });
  assert.deepEqual(readResetLink('?token=', ''), { state: 'invalid' });
  assert.deepEqual(readResetLink('', ''), { state: 'missing' });
  assert.deepEqual(readResetLink('', '#'), { state: 'missing' });
});

test('a verification link is verified unless the API added an error', () => {
  assert.equal(readVerifiedLink(''), 'verified');
  for (const code of ['INVALID_TOKEN', 'TOKEN_EXPIRED', 'USER_NOT_FOUND', 'INVALID_USER']) assert.equal(readVerifiedLink(`?error=${code}`), 'failed', code);
});

// Better Auth 1.7.7's defaults, which the API keeps: 8 to 128 characters, counted as JavaScript counts a string's length.
test('a new password takes 8 to 128 characters', () => {
  assert.equal(passwordProblem('x'.repeat(7)), 'short');
  assert.equal(passwordProblem('x'.repeat(8)), null);
  assert.equal(passwordProblem('x'.repeat(128)), null);
  assert.equal(passwordProblem('x'.repeat(129)), 'long');
  for (const lang of LANGS) assert.match(COPY[lang].reset.hint, /^8 [^0-9]+ 128 /, lang);
});

test('each answer from the API maps to what the page says', () => {
  assert.equal(resetOutcome(200, undefined), 'done');
  assert.equal(resetOutcome(400, 'INVALID_TOKEN'), 'invalid');
  assert.equal(resetOutcome(400, 'USER_NOT_FOUND'), 'invalid');
  assert.equal(resetOutcome(400, 'PASSWORD_TOO_SHORT'), 'short');
  assert.equal(resetOutcome(400, 'PASSWORD_TOO_LONG'), 'long');
  assert.equal(resetOutcome(429, undefined), 'busy');
  assert.equal(resetOutcome(400, 'SOMETHING_ELSE'), 'unconfirmed');
  assert.equal(resetOutcome(400, 'toString'), 'unconfirmed');
  assert.equal(resetOutcome(500, undefined), 'unconfirmed');
  assert.equal(resetOutcome(503, 'MAIL_UNAVAILABLE'), 'unconfirmed');
});

test('the reset posts the new password and the token as JSON to the API, and nothing else', async () => {
  const calls = [];
  const outcome = await submitReset(async (url, init) => { calls.push({ url, init }); return Response.json({ status: true }); }, 'abc', 'new-password');
  assert.equal(outcome, 'done');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.dressyouapp.com/api/auth/reset-password');
  assert.equal(calls[0].init.method, 'POST');
  // The API's preflight grants content-type and no other request header.
  assert.deepEqual(calls[0].init.headers, { 'content-type': 'application/json' });
  assert.deepEqual(JSON.parse(calls[0].init.body), { newPassword: 'new-password', token: 'abc' });
});

test('a refusal is read from its code, a page that is not JSON from its status, and a failed request is unconfirmed', async () => {
  const answer = (response) => async () => response;
  assert.equal(await submitReset(answer(Response.json({ code: 'INVALID_TOKEN', message: 'Invalid token' }, { status: 400 })), 't', 'p'), 'invalid');
  assert.equal(await submitReset(answer(Response.json({ message: 'Too many requests' }, { status: 429 })), 't', 'p'), 'busy');
  assert.equal(await submitReset(answer(new Response('<html>Bad gateway</html>', { status: 502 })), 't', 'p'), 'unconfirmed');
  assert.equal(await submitReset(async () => { throw new TypeError('Failed to fetch'); }, 't', 'p'), 'unconfirmed');
});

// Runs over the built site: `npm run build` first.
const DIST = new URL('../dist/', import.meta.url);
const read = (path) => readFile(new URL(path, DIST), 'utf8');
const fileOf = (lang, path) => `${localize(lang, path).slice(1)}.html`;
const decode = (s) => s.replaceAll('&#39;', "'").replaceAll('&quot;', '"').replaceAll('&amp;', '&');

test('each reset page carries every state, a labelled password field and its answers, in its language', async () => {
  for (const lang of LANGS) {
    const page = decode(await read(fileOf(lang, '/auth/reset'))), t = COPY[lang].reset;
    assert.match(page, new RegExp(`<html lang="${lang}"`));
    for (const state of ['form', 'done', 'invalid', 'missing']) assert.match(page, new RegExp(`<section[^>]*data-state="${state}"[^>]*hidden`), `${lang}: ${state}`);
    for (const line of [t.title, t.lede, t.label, t.hint, t.save, t.done, t.invalid, t.missing, t.noscript]) assert.ok(page.includes(line), `${lang}: ${line}`);
    for (const key of ['saving', 'short', 'long', 'busy', 'unconfirmed']) assert.ok(page.includes(`data-${key}="${t[key]}"`), `${lang}: ${key}`);
    const input = page.match(/<input[^>]*name="newPassword"[^>]*>/)?.[0] ?? '';
    const id = input.match(/id="([^"]+)"/)?.[1];
    assert.ok(id && page.includes(`<label for="${id}"`), `${lang}: the field has no label`);
    for (const attr of ['type="password"', 'autocomplete="new-password"', 'required']) assert.ok(input.includes(attr), `${lang}: ${attr}`);
    for (const described of input.match(/aria-describedby="([^"]+)"/)?.[1].split(' ') ?? []) assert.match(page, new RegExp(`id="${described}"`), `${lang}: ${described}`);
    assert.match(page, /role="status"/, `${lang}: answers are not announced`);
  }
});

test('each verified page carries both results and a way to open the app, in its language', async () => {
  for (const lang of LANGS) {
    const page = decode(await read(fileOf(lang, '/auth/verified'))), t = COPY[lang].verified;
    assert.match(page, new RegExp(`<html lang="${lang}"`));
    for (const state of ['verified', 'failed']) assert.match(page, new RegExp(`<section[^>]*data-state="${state}"[^>]*hidden`), `${lang}: ${state}`);
    for (const line of [t.title, t.verified, t.failed, t.help, t.noscript]) assert.ok(page.includes(line), `${lang}: ${line}`);
    assert.match(page, new RegExp(`<a[^>]*href="dressyou://"[^>]*>${t.open}</a>`), `${lang}: no link opens the app`);
  }
});

test('the account pages stay out of search, the sitemap and llms.txt', async () => {
  for (const lang of LANGS) for (const path of ['/auth/reset', '/auth/verified']) {
    const page = await read(fileOf(lang, path));
    assert.match(page, /<meta name="robots" content="noindex, nofollow">/, `${lang} ${path}`);
    assert.doesNotMatch(page, /rel="canonical"/, `${lang} ${path}`);
  }
  for (const file of ['sitemap.xml', 'llms.txt']) assert.doesNotMatch(await read(file), /\/auth\//, file);
});

test('the content policy lets the pages reach the API origin and no other', async () => {
  const { headers } = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  const csp = headers.find((h) => h.source === '/(.*)').headers.find((h) => h.key === 'Content-Security-Policy').value;
  assert.equal(csp.match(/connect-src ([^;]*)/)?.[1], "'self' https://api.dressyouapp.com");
});
