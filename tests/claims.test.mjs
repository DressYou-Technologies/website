import assert from 'node:assert/strict';
import test from 'node:test';
import { parse } from './support/html.mjs';
import { appClaimProblems, markerProblems, retentionProblems } from './support/claim-rules.mjs';
import { legalUrl, loadSite, policyVersions, withPageHtml } from './support/site.mjs';
import { isAuthored } from './support/voice-rules.mjs';

const site = loadSite();
const page = (text, url = '/support/') => ({ url, doc: parse(`<main><p>${text}</p></main>`).root });

test('no page says in plain words what only the apps can promise: that is a marker until the entry exists on both platforms', () => {
  const problems = [...site.pages.values()].filter(isAuthored).flatMap(appClaimProblems);
  assert.deepEqual(problems, []);
});

test('each claim the reviewers found is refused when it comes back', () => {
  const claims = {
    'an in-app support entry': ['Support is in the app’s menu.', 'L’assistance se trouve dans le menu de l’application.'],
    'a quoted in-app label no app has in French': ['Choose “Forgot password?” to get a new one.', 'Choisissez « Mot de passe oublié ? » pour en recevoir un nouveau.'],
    'an identity check no draft makes': ['DressYou may ask you to confirm that the account is yours before acting.', 'DressYou peut demander de confirmer que le compte vous appartient avant d’agir.'],
    'a new email or link that only the apps can request': ['In the app, request a new email.', 'Dans l’application, demandez un nouvel e-mail.', 'Choose it to get a new link.', 'Demandez un nouveau lien.'],
    'a retention answer that belongs to counsel': ['Purchase records: kept for the period the law sets for accounting records.', 'Enregistrements d’achat : conservés pendant la durée que la loi impose aux écritures comptables.'],
  };
  for (const [name, sentences] of Object.entries(claims)) {
    for (const sentence of sentences) assert.ok(appClaimProblems(page(sentence)).length, `${name}: ${sentence}`);
  }
  assert.deepEqual(appClaimProblems(page('Write to [[FOUNDER: support-entry — the in-app route; “Forgot password?”]] today.')), [], 'inside a marker it is a question, not a claim');
  assert.deepEqual(appClaimProblems(page('On iPhone: open the menu, then “delete account”.')), []);
});

test('a marker an authored page shares with a draft is the draft\'s own, word for word, so one answer fills both', () => {
  assert.deepEqual(markerProblems(site), []);
  // Markers are injected, not taken from the pages, so the test still holds once the real ones are answered.
  const ask = (source, url, key, words) => withPageHtml(source, url, (html) => html.replace('</main>', `<p>[[FOUNDER: ${key} — ${words}]]</p></main>`));
  const [version] = policyVersions(site);
  for (const [authored, draft, key] of [['/account-deletion/', legalUrl(version, 'privacy', 'fr'), 'privacy-contact'], ['/en/support/', '/en/dsa/', 'user-contact']]) {
    const drafted = ask(site, draft, key, 'one question');
    assert.deepEqual(markerProblems(ask(drafted, authored, key, 'one question')), [], `${authored} in the draft's words`);
    assert.match(markerProblems(ask(drafted, authored, key, 'another question')).join('\n'), new RegExp(`${authored} ${key} differs from the draft`), authored);
  }
});

test('a retention period on the deletion page is one the privacy notice states', () => {
  assert.deepEqual(retentionProblems(site), []);
  const changed = withPageHtml(site, '/account-deletion/', (html) => html.replace('35 jours', '40 jours'));
  assert.match(retentionProblems(changed).join('\n'), /\/account-deletion\/ states 40 jours, which the privacy notice does not/);
  const english = withPageHtml(site, '/en/account-deletion/', (html) => html.replace('up to 30 days', 'up to 90 days'));
  assert.match(retentionProblems(english).join('\n'), /90 days/);
});

test('a missing deletion page or privacy notice is left to the required-pages rule, not a crash here', () => {
  const without = (url) => ({ ...site, pages: new Map([...site.pages].filter(([key]) => key !== url)) });
  assert.deepEqual(retentionProblems(without('/account-deletion/')), []);
  assert.deepEqual(retentionProblems(without('/legal/2026-10-13/privacy/')), []);
});
