import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  API_ORIGIN, chooseLanguage, DEFAULT_LANGUAGE, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, passwordProblem,
  readLink, resetOutcome, resetRequest, RESET_PATH, submitReset,
} from '../dist/auth/link.mjs';
import { createDom } from './support/dom.mjs';
import { parse, select, selectAll, textOf, walk } from './support/html.mjs';

const respond = (status, body) => async () => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status });

// What the API sends, read from Better Auth 1.7.7 (api/src/auth.ts configures it with its defaults):
// POST /api/auth/reset-password takes { newPassword, token }; passwords run from 8 to 128 characters;
// the emailed link redirects to /auth/reset?token=… or ?error=INVALID_TOKEN, and /auth/verified or ?error=….
test('the contract with the API is pinned', () => {
  assert.equal(API_ORIGIN, 'https://api.dressyouapp.com');
  assert.equal(RESET_PATH, '/api/auth/reset-password');
  assert.equal(PASSWORD_MIN_LENGTH, 8);
  assert.equal(PASSWORD_MAX_LENGTH, 128);
  assert.equal(DEFAULT_LANGUAGE, 'fr');
});

test('the language comes from the link first, then the browser, then the site default', () => {
  assert.equal(chooseLanguage('?lang=en', ['fr-FR']), 'en');
  assert.equal(chooseLanguage('?token=x&lang=fr', ['en-GB']), 'fr');
  assert.equal(chooseLanguage('?lang=de', ['en-GB']), 'en', 'an unsupported link language is ignored');
  assert.equal(chooseLanguage('', ['de-DE', 'FR-ca', 'en']), 'fr', 'the first supported language of the browser wins');
  assert.equal(chooseLanguage('', ['en-US']), 'en');
  assert.equal(chooseLanguage('', ['de', 'es']), 'fr');
  assert.equal(chooseLanguage('', []), 'fr');
});

test('a verification link means done only when it arrives bare', () => {
  assert.deepEqual(readLink('verified', ''), { state: 'verified' });
  assert.deepEqual(readLink('verified', '?lang=en'), { state: 'verified' });
  assert.deepEqual(readLink('verified', '?error=INVALID_TOKEN'), { state: 'failed' });
  assert.deepEqual(readLink('verified', '?error=TOKEN_EXPIRED&lang=en'), { state: 'failed' });
  assert.deepEqual(readLink('verified', '?error='), { state: 'failed' });
  assert.deepEqual(readLink('verified', '?utm=x'), { state: 'failed' }, 'anything the API does not send is not a confirmation');
});

test('a reset link opens the form only with exactly one non-empty token', () => {
  assert.deepEqual(readLink('reset', '?token=abc123'), { state: 'form', token: 'abc123' });
  assert.deepEqual(readLink('reset', '?token=abc123&lang=fr'), { state: 'form', token: 'abc123' });
  assert.deepEqual(readLink('reset', '?token=a%2Bb'), { state: 'form', token: 'a+b' });
  for (const search of ['', '?token=', '?error=INVALID_TOKEN', '?token=a&token=b', '?token=a&x=1', '?x=1']) {
    assert.deepEqual(readLink('reset', search), { state: 'invalid' }, search);
  }
});

test('a password is judged by the API\'s own bounds', () => {
  assert.equal(passwordProblem(''), 'too-short');
  assert.equal(passwordProblem('a'.repeat(PASSWORD_MIN_LENGTH - 1)), 'too-short');
  assert.equal(passwordProblem('a'.repeat(PASSWORD_MIN_LENGTH)), null);
  assert.equal(passwordProblem('a'.repeat(PASSWORD_MAX_LENGTH)), null);
  assert.equal(passwordProblem('a'.repeat(PASSWORD_MAX_LENGTH + 1)), 'too-long');
});

test('the request is the one Better Auth takes, with the token in the body and nothing ambient', () => {
  const [url, init] = resetRequest('tok123', 'a password');
  assert.equal(url, 'https://api.dressyouapp.com/api/auth/reset-password');
  assert.doesNotMatch(url, /tok123/, 'the token never travels in the address');
  assert.equal(init.method, 'POST');
  assert.equal(init.headers['content-type'], 'application/json');
  assert.deepEqual(JSON.parse(init.body), { newPassword: 'a password', token: 'tok123' });
  assert.equal(init.credentials, 'omit');
  assert.equal(init.referrerPolicy, 'no-referrer');
  assert.ok(init.signal instanceof AbortSignal, 'a hung connection must end');
});

test('the API\'s answers map to one outcome each', () => {
  assert.equal(resetOutcome(200, undefined), 'success');
  assert.equal(resetOutcome(400, 'INVALID_TOKEN'), 'invalid');
  assert.equal(resetOutcome(400, 'USER_NOT_FOUND'), 'invalid');
  assert.equal(resetOutcome(400, 'PASSWORD_TOO_SHORT'), 'too-short');
  assert.equal(resetOutcome(400, 'PASSWORD_TOO_LONG'), 'too-long');
  assert.equal(resetOutcome(429, undefined), 'rate-limited');
  assert.equal(resetOutcome(400, 'SOMETHING_NEW'), 'unavailable');
  assert.equal(resetOutcome(403, undefined), 'unavailable');
  assert.equal(resetOutcome(500, 'INVALID_TOKEN'), 'unavailable', 'a server error is never read as an answer about the token');
});

test('submitting reports an outcome, whatever the network does', async () => {
  const submit = (fetch) => submitReset({ fetch, token: 't', newPassword: 'long enough' });
  assert.equal(await submit(respond(200, { status: true })), 'success');
  assert.equal(await submit(respond(400, { code: 'INVALID_TOKEN', message: 'Invalid token' })), 'invalid');
  assert.equal(await submit(respond(400, { code: 'PASSWORD_TOO_SHORT', message: 'Password too short' })), 'too-short');
  assert.equal(await submit(respond(429, { message: 'Too many requests' })), 'rate-limited');
  assert.equal(await submit(respond(502, '<html>Bad gateway</html>')), 'unavailable');
  assert.equal(await submit(respond(400, '')), 'unavailable');
  assert.equal(await submit(async () => { throw new TypeError('Failed to fetch'); }), 'unavailable', 'a blocked cross-origin call is not an exception to the visitor');
});

// The page module runs against the page's own markup.
let runs = 0;
async function open(url, { search = '', languages = ['fr'], fetch } = {}) {
  const html = readFileSync(new URL(`../dist${url}index.html`, import.meta.url), 'utf8');
  const dom = createDom(html, { search, pathname: url, languages });
  const calls = [];
  Object.assign(globalThis, {
    document: dom.document,
    location: dom.location,
    history: dom.history,
    fetch: async (...args) => { calls.push(args); return (fetch ?? respond(200, { status: true }))(...args); },
  });
  Object.defineProperty(globalThis, 'navigator', { value: dom.navigator, configurable: true });
  await import(`../dist/auth/page.mjs?run=${++runs}`);
  return { dom, calls };
}
const visible = ({ document }) => document.querySelectorAll('main > section[data-state]').filter((section) => !section.hidden).map((section) => `${section.dataset.state}/${section.lang}`);
const sectionOf = ({ document }, state, language) => document.querySelector(`main > section[data-state="${state}"][lang="${language}"]`);
const formOf = (dom, language) => sectionOf(dom, 'form', language).querySelector('form');
const submitWith = async (dom, language, password) => {
  const form = formOf(dom, language);
  form.elements.newPassword.value = password;
  await form.dispatch('submit');
  return form;
};

test('the verification page confirms in the browser\'s language and titles itself to match', async () => {
  const { dom, calls } = await open('/auth/verified/', { languages: ['fr-FR'] });
  assert.deepEqual(visible(dom), ['verified/fr']);
  assert.equal(dom.document.documentElement.lang, 'fr');
  assert.equal(dom.document.title, sectionOf(dom, 'verified', 'fr').dataset.title);
  assert.deepEqual(calls, [], 'the page makes no request');
});

test('a failed or foreign verification link says so, in English when the browser asks', async () => {
  const failed = await open('/auth/verified/', { search: '?error=INVALID_TOKEN', languages: ['en-GB'] });
  assert.deepEqual(visible(failed.dom), ['failed/en']);
  assert.equal(failed.dom.document.documentElement.lang, 'en');
  assert.equal(failed.dom.document.title, sectionOf(failed.dom, 'failed', 'en').dataset.title);
  const linked = await open('/auth/verified/', { search: '?lang=en', languages: ['fr'] });
  assert.deepEqual(visible(linked.dom), ['verified/en']);
});

test('a reset link opens the form and takes the token out of the address bar', async () => {
  const { dom, calls } = await open('/auth/reset/', { search: '?token=abc123', languages: ['en-US'] });
  assert.deepEqual(visible(dom), ['form/en']);
  assert.deepEqual(dom.history.replacements, ['/auth/reset/']);
  assert.equal(dom.location.search, '');
  assert.deepEqual(calls, []);
  assert.doesNotMatch(dom.everything(), /abc123/, 'the token is never written into the page');
});

test('a reset link without a usable token shows the dead-link state and no form', async () => {
  for (const search of ['', '?error=INVALID_TOKEN', '?token=']) {
    const { dom } = await open('/auth/reset/', { search, languages: ['fr'] });
    assert.deepEqual(visible(dom), ['invalid/fr'], search);
    assert.deepEqual(dom.history.replacements, []);
  }
});

test('a good password is sent once with the token, then the page confirms and clears the field', async () => {
  const { dom, calls } = await open('/auth/reset/', { search: '?token=abc123', languages: ['en-US'] });
  const form = await submitWith(dom, 'en', 'correct horse battery');
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'https://api.dressyouapp.com/api/auth/reset-password');
  assert.deepEqual(JSON.parse(calls[0][1].body), { newPassword: 'correct horse battery', token: 'abc123' });
  assert.deepEqual(visible(dom), ['success/en']);
  assert.equal(dom.document.activeElement, sectionOf(dom, 'success', 'en').querySelector('h1'), 'focus moves to the new state\'s heading');
  assert.equal(form.elements.newPassword.value, '', 'the password does not outlive the form');
  assert.equal(dom.document.title, sectionOf(dom, 'success', 'en').dataset.title);
  assert.doesNotMatch(dom.everything(), /abc123|correct horse/);
});

test('the French form works the same', async () => {
  const { dom, calls } = await open('/auth/reset/', { search: '?token=zzz', languages: ['fr'] });
  await submitWith(dom, 'fr', 'un mot de passe long');
  assert.equal(calls.length, 1);
  assert.deepEqual(visible(dom), ['success/fr']);
});

test('a password outside the bounds is refused on the page, in words, without a request', async () => {
  const { dom, calls } = await open('/auth/reset/', { search: '?token=abc123', languages: ['en-US'] });
  for (const [password, key] of [['short', 'too-short'], ['x'.repeat(PASSWORD_MAX_LENGTH + 1), 'too-long']]) {
    const form = await submitWith(dom, 'en', password);
    assert.equal(form.querySelector('.message').textContent, form.querySelector(`[data-message="${key}"]`).textContent);
    assert.equal(form.elements.newPassword.getAttribute('aria-invalid'), 'true');
    assert.equal(dom.document.activeElement, form.elements.newPassword, 'focus goes to the field to fix');
  }
  assert.deepEqual(calls, []);
  assert.deepEqual(visible(dom), ['form/en']);
});

test('a second press while the first is in flight sends nothing', async () => {
  let release;
  const held = new Promise((resolve) => { release = resolve; });
  const { dom, calls } = await open('/auth/reset/', { search: '?token=abc123', languages: ['en-US'], fetch: () => held });
  const form = formOf(dom, 'en');
  form.elements.newPassword.value = 'correct horse battery';
  const first = form.dispatch('submit');
  const second = form.dispatch('submit');
  assert.equal(form.querySelector('button').getAttribute('aria-disabled'), 'true');
  assert.equal(form.querySelector('.message').textContent, form.querySelector('[data-message="saving"]').textContent);
  release(new Response(JSON.stringify({ status: true }), { status: 200 }));
  await Promise.all([first, second]);
  assert.equal(calls.length, 1);
});

test('a dead token from the API ends in the dead-link state', async () => {
  const { dom } = await open('/auth/reset/', { search: '?token=old', languages: ['en-US'], fetch: respond(400, { code: 'INVALID_TOKEN', message: 'Invalid token' }) });
  await submitWith(dom, 'en', 'correct horse battery');
  assert.deepEqual(visible(dom), ['invalid/en']);
  assert.equal(dom.document.activeElement, sectionOf(dom, 'invalid', 'en').querySelector('h1'));
});

test('a rate limit or a lost connection leaves the form usable, with the message and nothing disabled', async () => {
  for (const [fetch, key] of [[respond(429, { message: 'Too many requests' }), 'rate-limited'], [async () => { throw new TypeError('Failed to fetch'); }, 'unavailable']]) {
    const { dom, calls } = await open('/auth/reset/', { search: '?token=abc123', languages: ['en-US'], fetch });
    const form = await submitWith(dom, 'en', 'correct horse battery');
    assert.deepEqual(visible(dom), ['form/en'], key);
    assert.equal(form.querySelector('.message').textContent, form.querySelector(`[data-message="${key}"]`).textContent);
    assert.notEqual(form.querySelector('button').getAttribute('aria-disabled'), 'true', 'the visitor can try again');
    assert.equal(form.hasAttribute('aria-busy'), false);
    await form.dispatch('submit');
    assert.equal(calls.length, 2, `${key}: a retry goes out`);
  }
});

// What the pages ship, read as markup.
const shipped = (url) => parse(readFileSync(new URL(`../dist${url}index.html`, import.meta.url), 'utf8')).root;

test('the auth pages declare a content policy that lets the page reach the API and nothing else', () => {
  for (const url of ['/auth/verified/', '/auth/reset/']) {
    const root = shipped(url);
    const policy = select(root, 'meta[http-equiv="Content-Security-Policy"]')?.attrs.content ?? '';
    assert.match(policy, /default-src 'none'/, url);
    assert.match(policy, /script-src 'self'/, url);
    assert.match(policy, /form-action 'none'/, url);
    assert.match(policy, /base-uri 'none'/, url);
    assert.match(policy, new RegExp(`connect-src ${API_ORIGIN.replace(/\./g, '\\.')}(?:;|$)`), url);
    assert.doesNotMatch(policy, /unsafe-/, url);
    assert.equal(select(root, 'meta[name=referrer]')?.attrs.content, 'no-referrer', url);
    const inline = [];
    walk(root, (node) => {
      if (node.type !== 'element') return;
      if (node.tag === 'style' || (node.tag === 'script' && !node.attrs.src)) inline.push(node.tag);
      for (const name of Object.keys(node.attrs)) if (/^on/.test(name) || name === 'style') inline.push(`${node.tag}[${name}]`);
    });
    assert.deepEqual(inline, [], `${url} must work under a policy that forbids inline script and style`);
  }
});

test('the reset form cannot send the password anywhere but through the module', () => {
  const root = shipped('/auth/reset/');
  const forms = selectAll(root, 'form');
  assert.equal(forms.length, 2);
  for (const form of forms) {
    assert.equal(form.attrs.action, undefined, 'no action: a form that submits natively would put the password in an address');
    assert.equal(form.attrs.novalidate, '', 'the page words its own errors');
    const input = select(form, 'input');
    assert.deepEqual([input.attrs.type, input.attrs.name, input.attrs.autocomplete, input.attrs.required], ['password', 'newPassword', 'new-password', '']);
    assert.equal(input.attrs.maxlength, undefined, 'a limit the browser applies would silently cut a pasted password');
    assert.equal(select(form, 'button').attrs.type, 'submit');
  }
});

test('the words on the form state the same bounds as the code, in both languages', () => {
  const root = shipped('/auth/reset/');
  for (const form of selectAll(root, 'form')) {
    const message = (key) => textOf(select(form, `[data-message="${key}"]`));
    assert.deepEqual(
      selectAll(form, '[data-message]').map((node) => node.attrs['data-message']).sort(),
      ['rate-limited', 'saving', 'too-long', 'too-short', 'unavailable'],
    );
    assert.match(message('too-short'), new RegExp(String(PASSWORD_MIN_LENGTH)));
    assert.match(message('too-long'), new RegExp(String(PASSWORD_MAX_LENGTH)));
    assert.match(textOf(select(form, '.hint')), new RegExp(`${PASSWORD_MIN_LENGTH}\\D+${PASSWORD_MAX_LENGTH}`));
  }
});
