import assert from 'node:assert/strict';
import test from 'node:test';
import { assetProblems, internalProblems, linkProblems, metadataProblems, sitemapProblems } from './support/link-rules.mjs';
import { loadSite, withFileText, withPageHtml } from './support/site.mjs';

const site = loadSite();

test('every link, script, image and share address on every page resolves', () => {
  assert.deepEqual(linkProblems(site), []);
});

test('every stylesheet url() and module import resolves', () => {
  assert.deepEqual(assetProblems(site), []);
});

test('the sitemap lists each indexable page once, with the alternates the page declares', () => {
  assert.deepEqual(sitemapProblems(site), []);
});

test('the manifest, robots.txt, llms.txt and structured data point at things that exist', () => {
  assert.deepEqual(metadataProblems(site), []);
});

test('nothing that belongs to the repository or to a developer machine ships', () => {
  assert.deepEqual(internalProblems(site), []);
});

// Each rule is run against a deliberately broken copy: a rule nobody has watched fail guards nothing.
const SUPPORT = '/support/';
const mutate = (url, pattern, replacement) => withPageHtml(site, url, (html) => {
  assert.match(html, pattern, `the mutation target is missing from ${url}`);
  return html.replace(pattern, replacement);
});
const edit = (file, pattern, replacement) => withFileText(site, file, (text) => {
  assert.match(text, pattern, `the mutation target is missing from ${file}`);
  return text.replace(pattern, replacement);
});
const reads = (rule, broken) => rule(broken).join('\n');
const DSA_LINK = /<a href="\/dsa\/">/;

test('link rules: a dead address, a missing slash, a relative address, a lost fragment, a stranger and http are reported', () => {
  assert.match(reads(linkProblems, mutate(SUPPORT, DSA_LINK, '<a href="/dsaa/">')), /\/dsaa\/ does not resolve/);
  assert.match(reads(linkProblems, mutate(SUPPORT, DSA_LINK, '<a href="/dsa">')), /\/dsa needs its trailing slash/);
  assert.match(reads(linkProblems, mutate(SUPPORT, DSA_LINK, '<a href="dsa/">')), /is relative/);
  assert.match(reads(linkProblems, mutate(SUPPORT, DSA_LINK, '<a href="/dsa/#nope">')), /id that is not on the page/);
  assert.match(reads(linkProblems, mutate(SUPPORT, DSA_LINK, '<a href="https://tracker.example.org/">')), /tracker\.example\.org, which no one has approved/);
  assert.match(reads(linkProblems, mutate(SUPPORT, DSA_LINK, '<a href="http://www.cnil.fr/">')), /uses http:/);
  assert.match(reads(linkProblems, mutate(SUPPORT, DSA_LINK, `<a href="https://dressyouapp.com/dsaa/">`)), /does not resolve/);
});

test('link rules: a dead stylesheet, image, source set, script and share image are reported', () => {
  assert.match(reads(linkProblems, mutate(SUPPORT, /<link rel="stylesheet" href="\/site.css">/, '<link rel="stylesheet" href="/gone.css">')), /link element .*gone\.css/);
  assert.match(reads(linkProblems, mutate('/', /src="\/images\/dressyou-logo\.webp" width="256"/, 'src="/images/gone.webp" width="256"')), /image .*gone\.webp/);
  assert.match(reads(linkProblems, mutate('/', /srcset="\/images\/01-noir-stride-portrait\.webp"/, 'srcset="/images/gone-portrait.webp"')), /image source .*gone-portrait/);
  assert.match(reads(linkProblems, mutate('/', /src="\/app\.mjs"/, 'src="/gone.mjs"')), /script .*gone\.mjs/);
  assert.match(reads(linkProblems, mutate(SUPPORT, /content="https:\/\/dressyouapp\.com\/og-image\.jpg"/, 'content="https://dressyouapp.com/gone.jpg"')), /og:image .*gone\.jpg/);
});

test('asset rules: a dead url() and a dead import are reported', () => {
  assert.match(reads(assetProblems, edit('style.css', /$/, "\n.x { background: url('/images/gone.webp'); }")), /style\.css loads \/images\/gone\.webp/);
  assert.match(reads(assetProblems, edit('app.mjs', /'\.\/sequence\.mjs'/, "'./gone.mjs'")), /app\.mjs imports \.\/gone\.mjs/);
  assert.match(reads(assetProblems, edit('auth/page.mjs', /'\.\/link\.mjs'/, "'./gone.mjs'")), /auth\/page\.mjs imports \.\/gone\.mjs/);
});

test('sitemap rules: a missing page, a stranger, a doubled entry, a token page and a wrong alternate are reported', () => {
  const entry = (loc) => new RegExp(`<url>\\s*<loc>${loc.replace(/[./]/g, '\\$&')}</loc>[\\s\\S]*?</url>`);
  assert.match(reads(sitemapProblems, edit('sitemap.xml', entry('https://dressyouapp.com/support/'), '')), /does not list \/support\//);
  assert.match(reads(sitemapProblems, edit('sitemap.xml', /<\/urlset>/, '<url><loc>https://dressyouapp.com/ghost/</loc></url></urlset>')), /ghost\/, which is not a page/);
  assert.match(reads(sitemapProblems, edit('sitemap.xml', /<\/urlset>/, '<url><loc>https://dressyouapp.com/support/</loc></url></urlset>')), /lists an address twice/);
  assert.match(reads(sitemapProblems, edit('sitemap.xml', /<\/urlset>/, '<url><loc>https://dressyouapp.com/auth/reset/</loc></url></urlset>')), /carries a token and is noindex/);
  assert.match(reads(sitemapProblems, edit('sitemap.xml', /hreflang="en" href="https:\/\/dressyouapp\.com\/en\/support\/"/, 'hreflang="en" href="https://dressyouapp.com/en/"')), /alternates for \/(?:en\/)?support\/ differ/);
});

test('metadata rules: a dead icon, a dead start page, a wrong language, a locked orientation, a lost sitemap and a dead structured address are reported', () => {
  assert.match(reads(metadataProblems, edit('site.webmanifest', /"\/icon-192\.png"/, '"/gone.png"')), /icon \/gone\.png does not exist/);
  assert.match(reads(metadataProblems, edit('site.webmanifest', /"start_url": "\/"/, '"start_url": "/ghost/"')), /start_url \/ghost\/ is not a page/);
  assert.match(reads(metadataProblems, edit('site.webmanifest', /"lang": "fr"/, '"lang": "en"')), /lang must be fr/);
  assert.match(reads(metadataProblems, edit('site.webmanifest', /"display"/, '"orientation": "portrait", "display"')), /locks the orientation/);
  assert.match(reads(metadataProblems, edit('robots.txt', /Sitemap: .*/, '')), /does not point at the sitemap/);
  assert.match(reads(metadataProblems, edit('llms.txt', /\(https:\/\/dressyouapp\.com\/en\/support\/\)/, '(https://dressyouapp.com/ghost/)')), /llms\.txt .*ghost/);
  assert.match(reads(metadataProblems, mutate('/', /"url": "https:\/\/dressyouapp\.com\/"/, '"url": "https://dressyouapp.com/ghost/"')), /structured data .*ghost/);
});

test('internal rules: a developer path, a repository path, a reviewers\' note, a local address and a Markdown link are reported', () => {
  const bad = ['/Users/teddyadmin/x', 'docs/legal/privacy', 'Working identifier x', 'http://localhost:3000', '<a href="notes.md">x</a>'];
  for (const text of bad) assert.match(reads(internalProblems, edit('llms.txt', /$/, `\n${text}`)), /llms\.txt:\d+ contains/, text);
});
