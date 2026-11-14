import assert from 'node:assert/strict';
import test from 'node:test';
import { browserLang, opensInFrench } from '../src/i18n/lang.ts';

test("the browser's language is its first one the site has", () => {
  assert.equal(browserLang(['fr-FR', 'en-US']), 'fr');
  assert.equal(browserLang(['en-GB', 'fr']), 'en');
  assert.equal(browserLang(['de-DE', 'FR-ca']), 'fr');
  assert.equal(browserLang(['de', 'it']), undefined);
  assert.equal(browserLang([]), undefined);
});

// Founder, 2026-11-13: French automatically when the browser's language is French, the /fr page as it is, the switch kept.
test('a French browser on the root page goes to French, and nothing else moves', () => {
  assert.equal(opensInFrench('en', '', ['fr-FR', 'en']), true);
  assert.equal(opensInFrench('en', '?error=TOKEN_EXPIRED', ['fr']), true);
  assert.equal(opensInFrench('en', '', ['en-GB', 'fr']), false);
  assert.equal(opensInFrench('en', '', ['de']), false);
  // The switch brought this browser to English, so it stays.
  assert.equal(opensInFrench('en', '?lang=en', ['fr-FR']), false);
  assert.equal(opensInFrench('en', '?error=INVALID_TOKEN&lang=en', ['fr-FR']), false);
  // The French page never moves, so the two pages cannot loop.
  for (const languages of [['fr'], ['en'], ['de']]) assert.equal(opensInFrench('fr', '', languages), false, languages.join());
});
