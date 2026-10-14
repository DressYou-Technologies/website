import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { vercelProblems } from './support/vercel-rules.mjs';
import { loadSite } from './support/site.mjs';

const site = loadSite();
const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const copy = () => structuredClone(config);
const problems = (changed) => vercelProblems(changed, site).join('\n');

test('vercel.json serves dist, keeps the mail addresses reachable and hardens the pages that carry a token', () => {
  assert.deepEqual(vercelProblems(config, site), []);
});

test('the two addresses the API mails reach their pages with the query intact, as the directory index or by rewrite', () => {
  assert.deepEqual(config.rewrites, [
    { source: '/auth/verified', destination: '/auth/verified/index.html' },
    { source: '/auth/reset', destination: '/auth/reset/index.html' },
  ]);
  const lost = copy();
  lost.rewrites = lost.rewrites.slice(0, 1);
  assert.match(problems(lost), /no rewrite for \/auth\/reset/);
  const wrong = copy();
  wrong.rewrites[0].destination = '/auth/verified/gone.html';
  assert.match(problems(wrong), /\/auth\/verified rewrites to \/auth\/verified\/gone\.html, which does not exist/);
});

test('a trailing-slash or clean-URL setting would redirect exactly the addresses the API mails, so neither is set', () => {
  for (const key of ['trailingSlash', 'cleanUrls']) {
    for (const value of [true, false]) {
      const changed = copy();
      changed[key] = value;
      assert.match(problems(changed), new RegExp(`${key} must stay unset`), `${key}: ${value}`);
    }
  }
});

test('headers: sniffing is off everywhere, and a token page is never cached, framed or leaked in a referrer', () => {
  const missing = copy();
  missing.headers[0].headers = [];
  assert.match(problems(missing), /\/\(\.\*\) must send X-Content-Type-Options: nosniff/);
  for (const [key, value] of [['Cache-Control', 'no-store'], ['Referrer-Policy', 'no-referrer']]) {
    const changed = copy();
    changed.headers[1].headers = changed.headers[1].headers.filter((header) => header.key !== key);
    assert.match(problems(changed), new RegExp(`/auth/\\(\\.\\*\\) must send ${key}: ${value}`), key);
  }
  const framed = copy();
  framed.headers[1].headers.find((header) => header.key === 'Content-Security-Policy').value = "default-src 'self'";
  assert.match(problems(framed), /frame-ancestors 'none'/);
  const weak = copy();
  weak.headers[1].headers.find((header) => header.key === 'Cache-Control').value = 'public, max-age=3600';
  assert.match(problems(weak), /must send Cache-Control: no-store/);
});

test('headers: no key is set by two rules, because Vercel does not say which would win', () => {
  const doubled = copy();
  doubled.headers[0].headers.push({ key: 'referrer-policy', value: 'strict-origin' });
  assert.match(problems(doubled), /Referrer-Policy is set by more than one rule/i);
});

test('headers: every key and value is a single well-formed line', () => {
  const broken = copy();
  broken.headers[0].headers.push({ key: 'X-Test', value: 'a\r\nSet-Cookie: x=1' });
  assert.match(problems(broken), /X-Test/);
  const empty = copy();
  empty.headers[0].headers.push({ key: '', value: 'x' });
  assert.match(problems(empty), /header with no key/);
});

test('the output directory and the schema are what the site is deployed with', () => {
  const moved = copy();
  moved.outputDirectory = 'public';
  assert.match(problems(moved), /outputDirectory must be dist/);
});
