import assert from 'node:assert/strict';
import test from 'node:test';
import {
  bilingualProblems, chromeProblems, documentProblems, malformed, nameProblems, requiredPages, structureProblems, twinProblems,
} from './support/page-rules.mjs';
import { legalUrl, loadSite, policyVersions, withoutPage, withPageHtml } from './support/site.mjs';

const site = loadSite();
const [version] = policyVersions(site);
const pageRule = (rule, source = site) => [...source.pages.values()].flatMap(rule);

test('every page the brief names ships, in both languages and for every policy version', () => {
  assert.deepEqual(requiredPages(site), []);
});

test('every page is well formed', () => {
  assert.deepEqual(malformed(site), []);
});

test('every page declares its language, metadata, canonical address and alternates', () => {
  assert.deepEqual(pageRule(documentProblems), []);
});

test('every page has its landmarks, one heading outline and references that resolve', () => {
  assert.deepEqual(pageRule(structureProblems), []);
});

test('every link, button, image, control and table has a name', () => {
  assert.deepEqual(pageRule(nameProblems), []);
});

test('each French page has an English twin of the same shape', () => {
  assert.deepEqual(twinProblems(site), []);
});

test('the auth pages carry both languages, one shape per state', () => {
  assert.deepEqual(bilingualProblems(site), []);
});

test('the skip link, header and footer are the shared markup on every content page', () => {
  assert.deepEqual(chromeProblems(site), []);
});

// A guard nobody has watched fail is not a guard: each rule is run against a deliberately broken copy.
const mutate = (url, pattern, replacement, source = site) => withPageHtml(source, url, (html) => {
  assert.match(html, pattern, `the mutation target is missing from ${url}`);
  return html.replace(pattern, replacement);
});
const found = (rule, url, broken) => rule(broken.pages.get(url)).join('\n');
const intoMain = (url, html, source = site) => mutate(url, /<main id="main"[^>]*>/, (open) => `${open}${html}`, source);
const SUPPORT = '/support/';
const SUPPORT_EN = '/en/support/';
const PRIVACY = legalUrl(version, 'privacy', 'fr');
const PRIVACY_EN = legalUrl(version, 'privacy', 'en');
const RESET = '/auth/reset/';

test('required pages: a missing twin, a missing legal text and a missing version are all reported', () => {
  assert.match(requiredPages(withoutPage(site, SUPPORT_EN)).join('\n'), /missing page \/en\/support\//);
  assert.match(requiredPages(withoutPage(site, PRIVACY_EN)).join('\n'), new RegExp(`missing page ${PRIVACY_EN}`));
  assert.match(requiredPages({ ...site, pages: new Map() }).join('\n'), /no policy version/);
});

test('well-formedness: an unclosed element is reported', () => {
  assert.match(malformed(mutate(SUPPORT, /<\/main>/, '')).join('\n'), /is not closed/);
});

test('document rules: language, viewport, metadata, canonical, share tags and alternates', () => {
  assert.match(found(documentProblems, SUPPORT, mutate(SUPPORT, /<html lang="fr">/, '<html>')), /needs <html lang="fr">/);
  assert.match(found(documentProblems, SUPPORT_EN, mutate(SUPPORT_EN, /<html lang="en">/, '<html lang="fr">')), /needs <html lang="en">/);
  assert.match(found(documentProblems, SUPPORT, mutate(SUPPORT, /(<meta name="viewport" content=")[^"]*/, '$1width=device-width, maximum-scale=1')), /viewport must be/);
  assert.match(found(documentProblems, SUPPORT, mutate(SUPPORT, /<meta name="description"[^>]*>/, '')), /no meta description/);
  assert.match(found(documentProblems, SUPPORT, mutate(SUPPORT, /(<link rel="canonical" href=")[^"]*/, '$1https://dressyouapp.com/other/')), /canonical must be/);
  assert.match(found(documentProblems, SUPPORT, mutate(SUPPORT, /<meta property="og:image"[^>]*>/, '')), /og:image must be/);
  assert.match(found(documentProblems, SUPPORT, mutate(SUPPORT, /<link rel="alternate" hreflang="x-default"[^>]*>/, '')), /alternate x-default must be/);
  assert.match(found(documentProblems, RESET, mutate(RESET, /noindex/, 'index')), /must be noindex/);
  assert.match(found(documentProblems, SUPPORT, mutate(SUPPORT, /(<meta name="robots" content=")[^"]*/, '$1noindex')), /must be indexable/);
  assert.match(found(documentProblems, SUPPORT, mutate(SUPPORT, /<!doctype html>/, '')), /no <!doctype html>/);
  assert.match(found(documentProblems, SUPPORT, mutate(SUPPORT, /<meta charset="utf-8">/, '')), /no utf-8 charset/);
  assert.match(found(documentProblems, SUPPORT, mutate(SUPPORT, /<title>[^<]*<\/title>/, '')), /has no <title>/);
  assert.match(found(documentProblems, SUPPORT, mutate(SUPPORT, /<meta property="og:title"[^>]*>/, '')), /no og:title/);
  assert.match(found(documentProblems, SUPPORT, mutate(SUPPORT, /<meta property="og:description"[^>]*>/, '')), /no og:description/);
  assert.match(found(documentProblems, SUPPORT, mutate(SUPPORT, /(<meta property="og:locale" content=")[^"]*/, '$1en_US')), /og:locale must be fr_FR/);
  assert.match(found(documentProblems, SUPPORT, mutate(SUPPORT, /(<meta property="og:url" content=")[^"]*/, '$1https://dressyouapp.com/x/')), /og:url must be/);
  assert.match(found(documentProblems, SUPPORT, mutate(SUPPORT, /(<meta property="og:type" content=")[^"]*/, '$1article')), /og:type must be website/);
  assert.match(found(documentProblems, SUPPORT, mutate(SUPPORT, /(<meta property="og:site_name" content=")[^"]*/, '$1other')), /og:site_name must be dressyou/);
  assert.match(found(documentProblems, SUPPORT, mutate(SUPPORT, /(<link rel="alternate" hreflang="fr" href=")[^"]*/, '$1https://dressyouapp.com/other/')), /alternate fr must be/);
  assert.match(found(documentProblems, SUPPORT, mutate(SUPPORT, /(<link rel="alternate" hreflang="en" href=")[^"]*/, '$1https://dressyouapp.com/other/')), /alternate en must be/);
  assert.match(documentProblems({ ...site.pages.get(SUPPORT), file: 'support.html' }).join('\n'), /is not a directory index/);
});

test('structure rules: one main, one h1, no skipped level, unique ids, resolving references', () => {
  assert.match(found(structureProblems, SUPPORT, intoMain(SUPPORT, '<h1>again</h1>')), /exactly one h1/);
  assert.match(found(structureProblems, SUPPORT, intoMain(SUPPORT, '<h4>x</h4>')), /must start with its h1|skips/);
  assert.match(found(structureProblems, SUPPORT, intoMain(SUPPORT, '<p id="main">x</p>')), /repeats id "main"/);
  assert.match(found(structureProblems, SUPPORT, intoMain(SUPPORT, '<p aria-labelledby="nowhere">x</p>')), /points at nothing/);
  assert.match(found(structureProblems, SUPPORT, intoMain(SUPPORT, '<a href="#nowhere">x</a>')), /link #nowhere points at nothing/);
  assert.match(found(structureProblems, SUPPORT, mutate(SUPPORT, /<a class="skip-link"[^>]*>[^<]*<\/a>/, '')), /skip link/);
  assert.match(found(structureProblems, SUPPORT, intoMain(SUPPORT, '<nav><a href="/">x</a></nav>')), /nav. without aria-label/);
  assert.match(found(structureProblems, SUPPORT, mutate(SUPPORT, /<main id="main"/, '<main id="other"')), /exactly one <main id="main">/);
  assert.match(found(structureProblems, RESET, mutate(RESET, /(<section[^>]*data-state="form"[^>]*lang="fr"[^>]*>)/, '$1<h1>second</h1>')), /needs exactly one h1/);
  assert.match(found(structureProblems, SUPPORT, mutate(SUPPORT, /<h2>([^<]*)<\/h2>/, '<h4>$1</h4>')), /skips from h1 to h4/);
  assert.match(found(structureProblems, SUPPORT, mutate(SUPPORT, /(<a class="skip-link" href=")#main/, '$1#nowhere')), /skip link target #nowhere does not exist/);
  assert.match(found(structureProblems, SUPPORT, mutate(SUPPORT, /<footer[\s\S]*<\/footer>/, '')), /needs exactly one footer/);
  assert.match(found(structureProblems, SUPPORT, intoMain(SUPPORT, '<label for="ghost">x</label>')), /label for="ghost" points at nothing/);
  assert.match(found(structureProblems, SUPPORT, intoMain(SUPPORT, '<p aria-describedby="ghost">x</p>')), /aria-describedby="ghost" points at nothing/);
  assert.match(found(structureProblems, SUPPORT, intoMain(SUPPORT, '<p aria-controls="ghost">x</p>')), /aria-controls="ghost" points at nothing/);
  assert.match(found(structureProblems, SUPPORT, mutate(SUPPORT, /(<body>\s*)<a class="skip-link"/, '$1<p>first</p><a class="skip-link"')), /must open with a skip link/);
});

test('name rules: links, buttons, images, controls, language links and tables', () => {
  const inject = (html) => intoMain(SUPPORT, html);
  assert.match(found(nameProblems, SUPPORT, inject('<a href="/support/"></a>')), /unnamed link/);
  assert.match(found(nameProblems, SUPPORT, inject('<a>text</a>')), /link without href/);
  assert.match(found(nameProblems, SUPPORT, inject('<button></button>')), /unnamed button/);
  assert.match(found(nameProblems, SUPPORT, inject('<img src="/x.webp">')), /image without alt/);
  assert.match(found(nameProblems, SUPPORT, inject('<input type="text" id="z">')), /input without a label/);
  assert.match(found(nameProblems, SUPPORT, inject('<a href="https://example.org/" target="_blank">x</a>')), /without rel="noopener"/);
  assert.match(found(nameProblems, SUPPORT, inject('<a href="/en/" hreflang="en">English</a>')), /must say lang="en"/);
  assert.match(found(nameProblems, PRIVACY, mutate(PRIVACY, /<div class="table-wrap"[^>]*>/, '<div>')), /table that a keyboard cannot scroll or name/);
  assert.match(found(nameProblems, PRIVACY, mutate(PRIVACY, /<th scope="col">/, '<th>')), /table header without scope/);
});

test('name rules: controls that need no label, and a label that wraps its field, are accepted', () => {
  const inject = (html) => intoMain(SUPPORT, html);
  assert.equal(found(nameProblems, SUPPORT, inject('<input type="hidden" name="x" value="y"><input type="submit" value="Send">')), '');
  assert.equal(found(nameProblems, SUPPORT, inject('<label>Name <input type="text" name="n"></label>')), '');
  assert.equal(found(nameProblems, SUPPORT, inject('<input type="text" aria-label="Name"><input type="text" aria-labelledby="main">')), '');
});

test('twin rules: a page whose twin is missing is left to the required-pages rule, and a changed link is its own finding', () => {
  assert.deepEqual(twinProblems(withoutPage(site, SUPPORT_EN)), []);
  assert.match(twinProblems(mutate(SUPPORT, /<a href="\/dsa\/">/, '<a href="/account-deletion/">')).join('\n'), /\/support\/ and \/en\/support\/ differ in internal links/);
  assert.doesNotMatch(twinProblems(mutate(SUPPORT, /<a href="\/dsa\/">/, '<a href="/account-deletion/">')).join('\n'), /outline/);
});

test('twin rules: a missing block, a missing link and a one-sided marker are reported', () => {
  assert.match(twinProblems(mutate(PRIVACY_EN, /<p>/, '<p>x</p><p>')).join('\n'), /differ in outline/);
  assert.match(twinProblems(intoMain(SUPPORT, '<p><a href="/dsa/">x</a></p>')).join('\n'), /differ in/);
  assert.match(twinProblems(intoMain(SUPPORT, '<!-- [[FOUNDER: extra-key — x]] -->')).join('\n'), /open founder or counsel markers/);
});

test('bilingual rules: a missing language, a visible start state and a nameless page are reported', () => {
  const english = /<section[^>]*data-state="form"[^>]*lang="en"[^>]*>[\s\S]*?<\/section>/;
  assert.match(bilingualProblems(mutate(RESET, english, '')).join('\n'), /state form has no en section/);
  assert.match(bilingualProblems(mutate(RESET, /(<section[^>]*data-state="form"[^>]*lang="en"[^>]*?) hidden/, '$1')).join('\n'), /must start hidden/);
  assert.match(bilingualProblems(mutate(RESET, / data-page="[^"]*"/, '')).join('\n'), /data-page/);
  assert.match(bilingualProblems(mutate(RESET, /(<section[^>]*data-state="form"[^>]*lang="en"[^>]*>)/, '$1<p>extra</p>')).join('\n'), /differs between languages/);
});

test('bilingual rules: a missing auth page is left to the required-pages rule, and a page with no states is reported', () => {
  assert.deepEqual(bilingualProblems(withoutPage(site, RESET)), []);
  const stateless = withPageHtml(site, RESET, (html) => html.replace(/ data-state="[^"]*"/g, ''));
  assert.match(bilingualProblems(stateless).join('\n'), /\/auth\/reset\/ has no state sections/);
});

test('bilingual rules: a state that waits on an app route waits on it in both languages', () => {
  // Injected, not taken from the page, so the test still holds once the real marker is answered.
  const ask = (language, source = site) => mutate(RESET, new RegExp(`(<section[^>]*data-state="invalid"[^>]*lang="${language}"[^>]*>[\\s\\S]*?)</section>`), '$1<p>[[FOUNDER: route-key — the route]]</p></section>', source);
  assert.match(bilingualProblems(ask('en')).join('\n'), /state invalid differs between languages in open markers/);
  assert.deepEqual(bilingualProblems(ask('fr', ask('en'))), []);
});

test('bilingual rules: the page keeps a readable fallback in both languages for when its script cannot run', () => {
  assert.match(bilingualProblems(mutate(RESET, /<div data-fallback>[\s\S]*?<\/div>/, '')).join('\n'), /exactly one fallback/);
  assert.match(bilingualProblems(mutate(RESET, /<p lang="en">[^<]*<\/p>/, '')).join('\n'), /fallback has no en text/);
  assert.match(bilingualProblems(mutate(RESET, /(<div data-fallback>\s*)<h1>dressyou<\/h1>/, '$1')).join('\n'), /fallback needs its h1/);
});

test('shared markup: a changed footer link, a missing header and a header on the hero are reported', () => {
  assert.match(chromeProblems(mutate(SUPPORT, /(<footer[\s\S]*?<a href=")\/support\//, '$1/elsewhere/')).join('\n'), /\/support\/ footer differs/);
  assert.match(chromeProblems(mutate(SUPPORT, /<header[\s\S]*?<\/header>/, '')).join('\n'), /\/support\/ has no header/);
  assert.match(chromeProblems(mutate(SUPPORT_EN, /(<a class="skip-link" href="#main">)[^<]*/, '$1Skip')).join('\n'), /skip link differs/);
  assert.match(chromeProblems(mutate('/', /<body>/, '<body><header><p>x</p></header>')).join('\n'), /hero page and takes no header/);
});
