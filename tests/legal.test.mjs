import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import { COPY } from '../src/i18n/copy.ts';
import { LANGS, localize } from '../src/i18n/lang.ts';

// Runs over the built site: `npm run build` first.
const DIST = new URL('../dist/', import.meta.url);
const read = (path) => readFile(new URL(path, DIST), 'utf8');
const fileOf = (lang, path) => `${localize(lang, path).slice(1)}.html`;
const decode = (s) => s.replaceAll('&#39;', "'").replaceAll('&quot;', '"').replaceAll('&amp;', '&');
// What a person reads: the markup without its scripts, styles and tags. Only markup whitespace collapses, so French
// narrow no-break spaces stay what they are.
const shown = (html) => decode(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[ \t\r\n]+/g, ' '));

test('the support page gives the support address and the in-app report, in each language', async () => {
  for (const lang of LANGS) {
    const page = await read(fileOf(lang, '/support')), t = COPY[lang].support, words = shown(page);
    assert.match(page, new RegExp(`<html lang="${lang}"`));
    assert.match(page, /<a href="mailto:support@dressyouapp\.com"[^>]*>support@dressyouapp\.com<\/a>/, `${lang}: the address is a mail link`);
    for (const line of [t.title, `${t.help} support@dressyouapp.com`, t.report]) assert.ok(words.includes(line), `${lang}: ${line}`);
    assert.match(page, /<meta name="robots" content="index, follow/, `${lang}: support is out of search`);
  }
  const [sitemap, llms] = await Promise.all([read('sitemap.xml'), read('llms.txt')]);
  for (const lang of LANGS) {
    assert.ok(sitemap.includes(`<loc>https://dressyouapp.com${localize(lang, '/support')}</loc>`), `${lang}: not in the sitemap`);
    assert.ok(llms.includes(`https://dressyouapp.com${localize(lang, '/support')}`), `${lang}: not in llms.txt`);
  }
});

// The app's policy bundle linked the drafts during TestFlight; they now land on the published texts.
test('the draft privacy notice and terms redirect to the published ones, in each language', async () => {
  const { redirects } = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  for (const lang of LANGS) for (const path of ['/privacy', '/terms']) {
    assert.ok(redirects.some((r) => r.source === localize(lang, `${path}-draft`) && r.destination === localize(lang, path) && r.permanent === true), `${lang} ${path}-draft`);
  }
});

// Counsel's and the founder's notes in the drafts are internal: no page may show one.
test('no built page shows a [[…]] note', async () => {
  const pages = (await readdir(DIST, { recursive: true })).filter((f) => f.endsWith('.html'));
  for (const page of pages) assert.ok(!shown(await read(page)).includes('[['), page);
});
