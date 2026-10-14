import { select, selectAll, textOf } from './html.mjs';
import { languageOf, legalUrl, policyVersions } from './site.mjs';
import { copyOf, isAuthored } from './voice-rules.mjs';

// What a page may say about the apps and the law, held to what the apps and the drafts say today. A
// sentence that is not true on the day the page ships is written as a marker, so the placeholder
// gate holds the merge until it is. Answering a marker with words that match a pattern here is the
// evidence that the entry exists: delete the pattern in the same commit.
const CLAIMS = [
  [/app[’']s menu|menu de l[’']application/i, 'an in-app support entry that neither app has yet'],
  [/Forgot password|Mot de passe oublié/i, 'an in-app label that the apps do not have in French yet'],
  [/confirm that the account is yours|le compte vous appartient/i, 'an identity check that no draft promises'],
  [/period the law sets|durée que la loi/i, 'a retention answer that the privacy notice leaves to counsel'],
  [/new (?:verification )?email|nouvel e-mail/i, 'a request for a new email that only the apps can make'],
  [/new (?:reset )?link|nouveau lien/i, 'a request for a new link that only the apps can make'],
];
const MARKER = /\[\[(?:FOUNDER|COUNSEL): ([a-z0-9-]+) — ([^\]]*)\]\]/g;
const DURATION = /\d+\s*(?:jours?|days?|mois|months?|heures?|hours?|ans?|years?)\b/gi;

export function appClaimProblems(page) {
  const text = copyOf(page);
  return CLAIMS.filter(([pattern]) => pattern.test(text))
    .map(([pattern, what]) => `${page.url} says ${what}: "${text.match(pattern)[0]}"; keep it a marker until the apps have it, then delete its pattern from CLAIMS`);
}

const markersOf = (node) => [...textOf(node).matchAll(MARKER)].map(([, key, text]) => [key, text]);
const partsOf = (page) => (selectAll(page.doc, 'main > section[lang]').length
  ? selectAll(page.doc, 'main > section[lang]').map((node) => ({ language: node.attrs.lang, node }))
  : [{ language: languageOf(page.url), node: select(page.doc, 'main') }]);

/** A marker shared with a draft carries the draft's own words, so one answer fills every page. */
export function markerProblems(site) {
  const drafts = new Map();
  for (const page of site.pages.values()) {
    if (isAuthored(page)) continue;
    for (const [key, text] of markersOf(select(page.doc, 'main'))) {
      const id = `${languageOf(page.url)} ${key}`;
      drafts.set(id, (drafts.get(id) ?? new Set()).add(text));
    }
  }
  return [...site.pages.values()].filter(isAuthored).flatMap((page) => partsOf(page).flatMap(({ language, node }) => markersOf(node)
    .filter(([key, text]) => drafts.has(`${language} ${key}`) && !drafts.get(`${language} ${key}`).has(text))
    .map(([key]) => `${page.url} ${key} differs from the draft's own words`)));
}

const normal = (text) => text.replace(/ /g, ' ').toLowerCase();

/** Every period the deletion page names is one the privacy notice names too. */
export function retentionProblems(site) {
  const version = policyVersions(site).at(-1);
  const problems = [];
  for (const url of ['/account-deletion/', '/en/account-deletion/']) {
    const page = site.pages.get(url);
    const privacy = site.pages.get(legalUrl(version, 'privacy', languageOf(url)));
    if (!page || !privacy) continue;
    const stated = normal(copyOf(privacy));
    for (const [period] of copyOf(page).matchAll(DURATION)) {
      if (!stated.includes(normal(period))) problems.push(`${url} states ${period}, which the privacy notice does not`);
    }
  }
  return problems;
}
