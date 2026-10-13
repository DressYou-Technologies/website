import assert from 'node:assert/strict';
import test from 'node:test';
import { bundleProblems, policyBundle } from './support/policies.mjs';
import { select, selectAll, textOf } from './support/html.mjs';
import { legalUrl, loadSite, policyVersions, withoutPage, withPageHtml, LEGAL_DOCUMENTS } from './support/site.mjs';

const site = loadSite();
const versions = policyVersions(site);

test('at least one policy version ships', () => {
  assert.ok(versions.length >= 1);
});

test('the bundle the API publishes for each version names pages that exist, in both languages', () => {
  for (const version of versions) assert.deepEqual(bundleProblems(site, policyBundle(version)), [], version);
});

test('the bundle is what the API accepts, and what is missing from it is named', () => {
  const [version] = versions;
  const bundle = policyBundle(version);
  assert.deepEqual(Object.keys(bundle.documents).sort(), ['en', 'fr']);
  assert.match(bundleProblems(withoutPage(site, legalUrl(version, 'terms', 'en')), bundle).join('\n'), /en termsUrl .* does not resolve to a page/);
  assert.match(bundleProblems(withoutPage(site, legalUrl(version, 'privacy', 'fr')), bundle).join('\n'), /fr privacyUrl/);
  for (const bad of ['', ' 2026-10-13', '2026-10-13 ', 'x'.repeat(201)]) {
    assert.match(bundleProblems(site, { ...bundle, version: bad }).join('\n'), /must be a trimmed string of 1 to 200 characters/, JSON.stringify(bad));
  }
  assert.match(bundleProblems(site, { ...bundle, documents: { fr: bundle.documents.fr } }).join('\n'), /English documents are required/);
  assert.match(bundleProblems(site, { ...bundle, documents: { en: { termsUrl: 'http://dressyouapp.com/x/', privacyUrl: bundle.documents.en.privacyUrl } } }).join('\n'), /not an https address/);
});

test('each legal page names its version as its address does', () => {
  for (const version of versions) {
    for (const document of LEGAL_DOCUMENTS) {
      for (const language of ['fr', 'en']) {
        const page = site.pages.get(legalUrl(version, document, language));
        assert.equal(textOf(select(page.doc, 'p.version')), `Version ${version}`, page.url);
      }
    }
  }
  const [version] = versions;
  const url = legalUrl(version, 'terms', 'en');
  const broken = withPageHtml(site, url, (html) => html.replace(`Version ${version}`, 'Version 1999-01-01'));
  assert.notEqual(textOf(select(broken.pages.get(url).doc, 'p.version')), `Version ${version}`);
});

test('the reporting page carries the contact points, the notice and the statements of reasons, and not the notification to authorities', () => {
  for (const url of ['/dsa/', '/en/dsa/']) {
    const page = site.pages.get(url);
    assert.deepEqual(selectAll(page.doc, 'main h2').map((heading) => heading.attrs.id), ['s1', 's2', 's3'], url);
    assert.equal(selectAll(page.doc, 'p.version').length, 0, 'the page is not versioned: nothing is accepted on it');
  }
});
