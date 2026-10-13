import assert from 'node:assert/strict';
import test from 'node:test';
import { parse } from './support/html.mjs';
import { bodySubjectProblem, isAuthored, voiceProblems } from './support/voice-rules.mjs';
import { loadSite, withPageHtml } from './support/site.mjs';

const site = loadSite();
const page = (text) => ({ url: '/x/', doc: parse(`<main><p>${text}</p></main>`).root });

test('every page keeps the voice: no exclamation, emoji, we, avatar, jumelle or apology', () => {
  const problems = [...site.pages.values()].flatMap((entry) => voiceProblems(entry, { authored: isAuthored(entry) }));
  assert.deepEqual(problems, []);
});

test('the pages DressYou wrote also keep its hard product rules in words', () => {
  const authored = [...site.pages.values()].filter(isAuthored);
  assert.ok(authored.length >= 8, 'landing, support, deletion and auth pages, in both languages');
  assert.deepEqual(authored.flatMap((entry) => voiceProblems(entry, { authored: true })), []);
});

test('the body is never the subject of a negative sentence, in either language and either polarity', () => {
  for (const sentence of [
    "Your thighs aren't too large.", 'Your waist is too wide for this cut.', 'Your body is not the problem.',
    'Vos cuisses ne sont pas trop larges.', 'Votre corps n’est pas en cause.', 'Vos hanches sont trop larges pour cette coupe.',
  ]) assert.ok(bodySubjectProblem(sentence), sentence);
  for (const sentence of [
    'This cut runs narrow through the thigh.', 'The frame cuts off below the knee.', 'This won’t close at the chest.',
    'Your twin is generated from photographs.', 'La coupe est étroite à la cuisse.', 'Votre jumeau n’est généré qu’après votre accord.',
    'Your body data is private.',
  ]) assert.equal(bodySubjectProblem(sentence), null, sentence);
});

test('each rule refuses what it names', () => {
  const broken = {
    exclamation: 'Looking great!', emoji: 'Nice pick 👗', we: 'We will email you.', nous: 'Nous vous écrivons.',
    avatar: 'Your avatar is ready.', jumelle: 'Votre jumelle est prête.', apology: 'Oops, something went wrong.', oups: 'Oups, une erreur.',
  };
  for (const [name, text] of Object.entries(broken)) assert.ok(voiceProblems(page(text), { authored: false }).length, name);
  const authoredOnly = { inches: 'Cut for 4 inches of ease.', figure: 'Cut for 4 cm of ease.', claim: 'DressYou measures your body.', mesure: 'DressYou mesure votre corps.', sex: 'For women.', sexe: 'Pour les hommes.', negative: 'Votre taille n’est pas trop large.' };
  for (const [name, text] of Object.entries(authoredOnly)) {
    assert.ok(voiceProblems(page(text), { authored: true }).length, name);
    assert.deepEqual(voiceProblems(page(text), { authored: false }), [], `${name} is allowed in a verbatim legal text`);
  }
});

test('markers awaiting a founder are not read as copy, and ordinary copy passes', () => {
  assert.deepEqual(voiceProblems(page('Write to [[FOUNDER: k — What do we say? Oops!]] today.'), { authored: true }), []);
  assert.deepEqual(voiceProblems(page('Size M. Cut for ease at the chest. Le jumeau est une image.'), { authored: true }), []);
});

test('what a page says includes its alternative text, labels, titles and descriptions', () => {
  for (const html of ['<img src="/x.webp" alt="We love it">', '<a href="/" aria-label="We love it">x</a>', '<a href="/" title="We love it">x</a>']) {
    assert.ok(voiceProblems({ url: '/x/', doc: parse(`<main>${html}</main>`).root }, { authored: false }).length, html);
  }
  for (const meta of ['<meta name="description" content="We love it">', '<meta property="og:description" content="We love it">']) {
    assert.ok(voiceProblems({ url: '/x/', doc: parse(`<head>${meta}</head>`).root }, { authored: false }).length, meta);
  }
  assert.deepEqual(voiceProblems({ url: '/x/', doc: parse('<head><meta name="viewport" content="We love it"><script>we()</script><style>.we{}</style></head>').root }, { authored: false }), []);
});

test('the guard bites a real page: one sentence added to the support page is refused', () => {
  const broken = withPageHtml(site, '/support/', (html) => html.replace('<h2>Dans l’application</h2>', '<h2>Dans l’application</h2><p>Nous répondons vite&nbsp;!</p>'));
  assert.match(voiceProblems(broken.pages.get('/support/'), { authored: true }).join('\n'), /exclamation|first person plural/);
});
