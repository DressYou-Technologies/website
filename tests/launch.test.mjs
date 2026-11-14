import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import { LINKS } from '../src/data/site.ts';
import { COPY } from '../src/i18n/copy.ts';
import { LANGS, localize } from '../src/i18n/lang.ts';

// Release day: the waitlist closes, the site links the App Store, and the list gets its one launch email.
const ROOT = new URL('../', import.meta.url), DIST = new URL('dist/', ROOT);
const read = (url) => readFile(url, 'utf8');
const home = (lang) => read(new URL(localize(lang, '/') === '/' ? 'index.html' : `${localize(lang, '/').slice(1)}.html`, DIST));
const escaped = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const decode = (s) => s.replaceAll('&#39;', "'").replaceAll('&quot;', '"').replaceAll('&amp;', '&');

// Red until the App Store record is public: the placeholder must never ship.
test('the App Store link is the published record, not the placeholder', () => {
  assert.match(LINKS.appUrl, /^https:\/\/apps\.apple\.com\//);
  assert.notEqual(LINKS.appUrl, 'https://apps.apple.com/app/id0000000000', 'replace the placeholder in src/data/site.ts with the App Store URL');
});

test('the app dialog and the footer link to the App Store, and no page asks for an email', async () => {
  for (const lang of LANGS) {
    const page = await home(lang), store = COPY[lang].get.store;
    const link = new RegExp(`<a[^>]*href="${escaped(LINKS.appUrl)}"[^>]*>${escaped(store)}</a>`);
    const dialog = page.match(/<dialog[^>]*id="get-app"[\s\S]*?<\/dialog>/)?.[0] ?? '';
    assert.match(decode(dialog), link, `${lang}: the dialog has no App Store link`);
    assert.match(dialog, /class="qr"/, `${lang}: the dialog lost its QR code`);
    assert.match(decode(page.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? ''), link, `${lang}: the footer has no App Store link`);
    assert.doesNotMatch(page, /type="email"|class="notify/, `${lang}: a page still asks for an email`);
  }
});

test('the waitlist function is gone, and the confirmation pages stay for links already sent', async () => {
  await assert.rejects(access(new URL('api/notify.ts', ROOT)), 'api/notify.ts is still deployed');
  for (const file of ['notified.html', 'fr/notified.html']) await access(new URL(file, DIST));
});

// One message, as the live notice promises: English and French together, since the list stores no language. Brevo's
// campaign tool adds the unsubscribe footer. Nothing in it loads from anywhere, so opening it tells no server anything.
test('the launch email says the app is out in both languages, links the App Store and tracks nothing', async () => {
  const email = await read(new URL('emails/launch.html', ROOT));
  const body = email.replace(/<!--[\s\S]*?-->/g, '');
  assert.match(body, /<html lang="en">/);
  assert.match(body, /<[a-z]+[^>]* lang="fr"/, 'no French part');
  const links = [...body.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(links)].sort(), [LINKS.appUrl, 'https://dressyouapp.com'].sort());
  assert.equal(links.filter((href) => href === LINKS.appUrl).length, 2, 'one App Store link per language');
  for (const remote of [/<img\b/i, /<link\b/i, /<script\b/i, /url\(/i, /\{\{/]) assert.doesNotMatch(body, remote, String(remote));
  const words = decode(body.replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '));
  for (const banned of [';', '—', 'unsubscribe', 'désinscri']) assert.ok(!words.toLowerCase().includes(banned), banned);
});
