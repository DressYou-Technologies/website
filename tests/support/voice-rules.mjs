import { walk } from './html.mjs';
import { languageOf } from './site.mjs';

// docs/voice.md and AGENTS.md section 7 in the product repository, as far as a pattern can hold them.
// A pattern cannot judge a sentence; it can refuse the words the rules rule out.
const BODY = {
  en: 'body|waist|hips?|thighs?|chest|arms?|legs?|shoulders?|belly|stomach|figure|frame',
  fr: 'corps|taille|hanches?|cuisses?|poitrine|bras|jambes?|[ée]paules?|ventre|silhouette',
};
const NEGATION = { en: "n't|\\bnot\\b|\\bnever\\b|\\btoo\\b|\\bno\\b", fr: "\\bne\\b|n['’]|\\bpas\\b|\\bjamais\\b|\\btrop\\b|\\baucun" };

const EVERY_PAGE = [
  [/!|¡/, 'an exclamation (the voice never exclaims)'],
  [/[\p{Extended_Pictographic}--[©®™]]/v, 'an emoji'],
  [/\b(?:we|our|ours)\b|\bnous\b|\bnotre\b|\bnos\b/i, 'the first person plural (the voice never says we)'],
  [/\bavatars?\b/i, '"avatar" (the generated image is the twin)'],
  [/\bjumelle/i, '"jumelle" (the French noun is a fixed "jumeau")'],
  [/\b(?:oops|sorry|unfortunately)\b|\b(?:oups|désolée?|malheureusement)\b/i, 'an apology'],
];
const AUTHORED_ONLY = [
  [/\binch(?:es)?\b|\blbs?\b|\bpounds?\b/i, 'imperial units'],
  [/\b\d+(?:[.,]\d+)?\s?(?:cm|mm)\b/, 'a measurement figure'],
  [/\bmeasures? (?:you|your body)\b|\bmesure[nt]? (?:vous|votre corps)\b/i, 'a claim to measure the body'],
  [/\b(?:women|woman|men|man|female|male|girls?|boys?)\b|\b(?:femmes?|hommes?|filles?|garçons?)\b/i, 'the user\'s sex (copy never uses it)'],
];

/** A clause whose subject is a body part and whose predicate is negative, in any polarity. */
export function bodySubjectProblem(sentence) {
  for (const language of ['en', 'fr']) {
    const subject = new RegExp(`^\\s*(?:your|my|votre|vos|ma|mon|mes)\\s+(?:${BODY[language]})\\b`, 'i');
    if (subject.test(sentence) && new RegExp(NEGATION[language], 'i').test(sentence)) return sentence.trim();
  }
  return null;
}

/** What a page says: its text and its attribute copy, minus the markers that await a founder or counsel. */
export function copyOf(page, { metadata = true } = {}) {
  const parts = [];
  walk(page.doc, (node) => {
    if (node.type === 'text') {
      if (!['script', 'style'].includes(node.parent.tag)) parts.push(node.text);
    } else if (node.type === 'element') {
      for (const name of ['alt', 'title', 'aria-label']) if (node.attrs[name]) parts.push(node.attrs[name]);
      if (metadata && node.tag === 'meta' && ['description', 'og:description'].includes(node.attrs.name ?? node.attrs.property)) parts.push(node.attrs.content);
    }
  });
  // Only source whitespace collapses: a non-breaking space is a character the French rule reads.
  return parts.join('\n').replace(/\[\[[^\]]*\]\]/g, ' ').replace(/[ \t\n\r\f]+/g, ' ');
}

export function voiceProblems(page, { authored }) {
  const text = copyOf(page);
  const rules = authored ? [...EVERY_PAGE, ...AUTHORED_ONLY] : EVERY_PAGE;
  const problems = rules.filter(([pattern]) => pattern.test(text)).map(([pattern, what]) => `${page.url} says ${what}: "${text.match(pattern)[0]}"`);
  if (authored) {
    for (const sentence of text.split(/(?<=[.;:!?])\s+/)) {
      const found = bodySubjectProblem(sentence);
      if (found) problems.push(`${page.url} makes a body part the subject of a negative: "${found}"`);
    }
  }
  return problems;
}

export const isAuthored = (page) => !/^(?:\/en)?\/(?:legal|dsa)\//.test(page.url);

// French sets a non-breaking space before : ; ! ? » and after «, so a line never breaks between them.
const FRENCH_SPACING = [[/ ([:;!?»])/, 'a plain space before'], [/(«) /, 'a plain space after']];

export function frenchSpacingProblems(page) {
  // English sets no such space, and a marker taken out of an English sentence leaves a plain one before its punctuation.
  if (languageOf(page.url) === 'en') return [];
  // A search snippet shows a description as it likes; the rule is for what the page itself shows.
  const text = copyOf(page, { metadata: false });
  return FRENCH_SPACING.filter(([pattern]) => pattern.test(text))
    .map(([pattern, what]) => `${page.url} has ${what} "${text.match(pattern)[1]}": use a non-breaking space`);
}
