import assert from 'node:assert/strict';
import test from 'node:test';
import { handle } from '../api/notify.ts';

const ORIGIN = 'https://dressyouapp.com';
const ENV = { BREVO_API_KEY: 'test-key', BREVO_LIST_ID: '7', BREVO_DOI_TEMPLATE_ID: '12' };
// Brevo's double opt-in endpoint, recorded instead of called.
const brevo = (status = 201, body = '') => {
  const calls = [];
  const fetcher = async (url, init) => { calls.push({ url, init }); return new Response(body, { status }); };
  return { calls, fetcher };
};
const post = (body, { origin = ORIGIN, method = 'POST' } = {}) => new Request(`${ORIGIN}/api/notify`, {
  method, headers: { 'content-type': 'application/json', origin }, body: method === 'POST' ? JSON.stringify(body) : undefined,
});
const human = (email, lang = 'fr') => ({ email, website: '', elapsed: 4000, lang });

test('a valid email starts Brevo\'s double opt-in on the list', async () => {
  const { calls, fetcher } = brevo();
  const res = await handle(post(human('ana@example.com')), ENV, fetcher);
  assert.equal(res.status, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.brevo.com/v3/contacts/doubleOptinConfirmation');
  assert.equal(calls[0].init.headers['api-key'], 'test-key');
  assert.deepEqual(JSON.parse(calls[0].init.body), { email: 'ana@example.com', includeListIds: [7], templateId: 12, redirectionUrl: `${ORIGIN}/notified` });
});

test('the confirmation link lands on the page in the language the person signed up in', async () => {
  const { calls, fetcher } = brevo();
  await handle(post(human('ana@example.com', 'en')), ENV, fetcher);
  await handle(post(human('ana@example.com', 'xx')), ENV, fetcher);
  await handle(post(human('ana@example.com', 'toString')), ENV, fetcher);
  assert.deepEqual(calls.map((c) => JSON.parse(c.init.body).redirectionUrl), [`${ORIGIN}/en/notified`, `${ORIGIN}/notified`, `${ORIGIN}/notified`]);
});

test('only a same-origin POST is accepted', async () => {
  const { calls, fetcher } = brevo();
  assert.equal((await handle(post(human('ana@example.com'), { method: 'GET' }), ENV, fetcher)).status, 405);
  assert.equal((await handle(post(human('ana@example.com'), { origin: 'https://elsewhere.example' }), ENV, fetcher)).status, 403);
  assert.equal(calls.length, 0);
});

test('a malformed email is refused before Brevo is called', async () => {
  const { calls, fetcher } = brevo();
  for (const email of ['', 'ana', 'ana@', '@example.com', 'ana@example', `${'a'.repeat(250)}@example.com`, 42]) {
    assert.equal((await handle(post({ ...human('x'), email }), ENV, fetcher)).status, 400, String(email));
  }
  assert.equal(calls.length, 0);
});

test('a filled bot trap or an instant submit looks accepted but reaches no one', async () => {
  const { calls, fetcher } = brevo();
  assert.equal((await handle(post({ ...human('ana@example.com'), website: 'spam.example' }), ENV, fetcher)).status, 200);
  assert.equal((await handle(post({ ...human('ana@example.com'), elapsed: 200 }), ENV, fetcher)).status, 200);
  assert.equal(calls.length, 0);
});

test('an oversized body is refused', async () => {
  const { calls, fetcher } = brevo();
  const res = await handle(post({ ...human('ana@example.com'), padding: 'x'.repeat(5000) }), ENV, fetcher);
  assert.equal(res.status, 413);
  assert.equal(calls.length, 0);
});

test('an email already on the list answers like a new one', async () => {
  const { fetcher } = brevo(400, JSON.stringify({ code: 'duplicate_parameter', message: 'Contact already exist' }));
  assert.equal((await handle(post(human('ana@example.com')), ENV, fetcher)).status, 200);
});

test('without its Brevo settings the list is closed, and a Brevo failure is reported as one', async () => {
  const { calls, fetcher } = brevo();
  assert.equal((await handle(post(human('ana@example.com')), {}, fetcher)).status, 503);
  assert.equal(calls.length, 0);
  assert.equal((await handle(post(human('ana@example.com')), ENV, brevo(500).fetcher)).status, 502);
  assert.equal((await handle(post(human('ana@example.com')), ENV, async () => { throw new Error('timeout'); })).status, 502);
});

test('no answer is cached', async () => {
  const res = await handle(post(human('ana@example.com')), ENV, brevo().fetcher);
  assert.equal(res.headers.get('cache-control'), 'no-store');
});
