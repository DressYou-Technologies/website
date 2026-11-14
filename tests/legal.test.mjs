import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import { COPY } from '../src/i18n/copy.ts';
import { LANGS, localize } from '../src/i18n/lang.ts';
import { publish } from '../scripts/legal.mjs';

// Runs over the built site: `npm run build` first.
const DIST = new URL('../dist/', import.meta.url);
const read = (path) => readFile(new URL(path, DIST), 'utf8');
const fileOf = (lang, path) => `${localize(lang, path).slice(1)}.html`;
const decode = (s) => s.replaceAll('&#39;', "'").replaceAll('&quot;', '"').replaceAll('&amp;', '&');
// What a person reads: the markup without its scripts, styles and tags. Only markup whitespace collapses, so French
// narrow no-break spaces stay what they are.
const shown = (html) => decode(html.replace(/<script\b[\s\S]*?<\/script[^>]*>|<style\b[\s\S]*?<\/style[^>]*>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/[ \t\r\n]+/g, ' '));

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

// Reports go to support@dressyouapp.com or an ask page's "Report this page" line (DressYou #782, #784): no page links the
// DSA drafts, which the site does not publish.
test('no built page links a DSA draft', async () => {
  const pages = (await readdir(DIST, { recursive: true })).filter((f) => f.endsWith('.html'));
  for (const page of pages) assert.doesNotMatch(await read(page), /href="[^"]*dsa-[a-z]+-draft/, page);
});

// Counsel's and the founder's notes in the drafts are internal: no page may show one.
test('no built page shows a [[…]] note', async () => {
  const pages = (await readdir(DIST, { recursive: true })).filter((f) => f.endsWith('.html'));
  for (const page of pages) assert.ok(!shown(await read(page)).includes('[['), page);
});

// scripts/legal.mjs turns the DressYou repository's drafts into the published pages' text.
const DRAFT = `# DressYou — draft privacy notice

**Draft for counsel review: not legal advice.** See the [counsel brief](counsel-brief.md).

## 1. Who is responsible

DressYou has no officer [[COUNSEL: dpo — Is one required?]]. The [terms](terms-en-draft.md#3-your-account) apply.

[[COUNSEL: whole-paragraph — A note on its own line.]]

### 2.3 AI: OpenAI and TypeSafe

The [DSA texts](dsa-en-draft.md) and the [CNIL](https://www.cnil.fr/fr/plaintes).

| Data | Kept |
|---|---|
| Purchases | [[COUNSEL: retention — How long?]] |
`;

test('publishing a draft drops its title and banner and every note, and keeps the text', () => {
  const page = publish(DRAFT);
  assert.ok(page.startsWith('## 1. Who is responsible\n'), page.slice(0, 60));
  assert.ok(page.includes('DressYou has no officer. The'), 'the note left a gap');
  assert.doesNotMatch(page, /\[\[|\]\]|counsel|Draft|\n\n\n/i);
  assert.ok(page.includes('| Purchases | |'), 'a table row lost its shape');
});

test('links to the other drafts land on the site, links to other repository files keep only their words', () => {
  const page = publish(DRAFT);
  assert.ok(page.includes('The [terms](/terms#3-your-account) apply.'));
  assert.ok(page.includes('The DSA texts and the [CNIL](https://www.cnil.fr/fr/plaintes).'));
  assert.doesNotMatch(page, /\.md\b/);
  for (const [file, path] of [['privacy-fr-draft.md', '/fr/privacy'], ['terms-fr-draft.md', '/fr/terms'], ['legal-notice-en-draft.md', '/legal'], ['legal-notice-fr-draft.md', '/fr/legal']]) {
    assert.ok(publish(`## 1. A\n\nSee [it](${file}).\n`).includes(`See [it](${path}).`), file);
  }
});

// The app's onboarding links the privacy notice's AI section as #ai.
test('the AI section keeps the anchor the app links to', () => {
  assert.ok(publish(DRAFT).includes('<h3 id="ai">2.3 AI: OpenAI and TypeSafe</h3>'));
});

test('a founder note stops publication', () => {
  assert.throws(() => publish('## 1. A\n\nText [[FOUNDER: x — Decide.]].\n'), /FOUNDER/);
});

// "Last updated" is derived, never typed: scripts/legal.mjs records the date of the last DressYou commit that changed each
// draft (git log -1 --format=%cs), and each page shows its own draft's date in its own language.
test("each published text shows its own draft's commit date as its last update", async () => {
  const LONG = { en: 'en-GB', fr: 'fr-FR' }, LABEL = { en: 'Last updated', fr: 'Mis à jour le' };
  for (const name of ['privacy', 'terms']) for (const lang of LANGS) {
    const source = await readFile(new URL(`../src/legal/${name}-${lang}.md`, import.meta.url), 'utf8');
    const date = source.match(/^updated: (\d{4}-\d{2}-\d{2})$/m)?.[1];
    assert.ok(date && source.match(/^source: DressYou docs\/legal\/[a-z-]+-draft\.md at [0-9a-f]{7,40}$/m), `${name}-${lang}.md names no source or date`);
    const day = new Intl.DateTimeFormat(LONG[lang], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(date));
    assert.ok(shown(await read(fileOf(lang, `/${name}`))).includes(`${LABEL[lang]} ${day}`), `${lang} /${name}: not ${day}`);
  }
});
