import assert from 'node:assert/strict';
import test from 'node:test';
import { parse, selectAll, select, textOf } from './support/html.mjs';
import { renderInline, renderLegal } from './support/legal-render.mjs';

const LINKS = { version: '2026-10-13', language: 'en' };
const BANNER = '**Draft for counsel review: not legal advice.** Prepared on 13 October 2026.';
const document = (body, options = {}) => renderLegal({
  markdown: `# DressYou — draft privacy notice\n\n${BANNER}\n\n${body}\n`,
  document: 'privacy',
  ...LINKS,
  ...options,
});
const tree = (html) => {
  const { root, errors } = parse(html);
  assert.deepEqual(errors, [], 'the rendered markup must be well formed');
  return root;
};

test('inline markup: emphasis, code, links and markers survive, and text is escaped', () => {
  assert.equal(renderInline('a **b** *c* `d` & <e>', LINKS), 'a <strong>b</strong> <em>c</em> <code>d</code> &amp; &lt;e&gt;');
  assert.equal(renderInline('[CNIL](https://www.cnil.fr/fr/plaintes)', LINKS), '<a href="https://www.cnil.fr/fr/plaintes">CNIL</a>');
  const marker = "[[FOUNDER: user-contact — l'adresse *x* & <y>]]";
  assert.equal(renderInline(marker, LINKS), "[[FOUNDER: user-contact — l'adresse *x* &amp; &lt;y&gt;]]", 'a marker is kept whole, never formatted');
});

test('links between the drafts become the site addresses of the same language', () => {
  assert.equal(renderInline('[terms](terms-en-draft.md)', LINKS), '<a href="/en/legal/2026-10-13/terms/">terms</a>');
  assert.equal(renderInline('[conditions](terms-fr-draft.md)', { ...LINKS, language: 'fr' }), '<a href="/legal/2026-10-13/terms/">conditions</a>');
  assert.equal(renderInline('[DSA](dsa-en-draft.md)', LINKS), '<a href="/en/dsa/">DSA</a>');
  assert.equal(renderInline('[notice](legal-notice-fr-draft.md)', { ...LINKS, language: 'fr' }), '<a href="/legal/2026-10-13/legal-notice/">notice</a>');
  assert.throws(() => renderInline('[brief](counsel-brief.md)', LINKS), /internal link counsel-brief.md/);
  assert.throws(() => renderInline('[dpia](../dpia.md)', LINKS), /internal link \.\.\/dpia\.md/);
});

test('the draft banner is removed, and a document without one is refused', () => {
  const { main } = document('## 1. Who\n\nText.');
  assert.doesNotMatch(main, /counsel review|Prepared on/);
  assert.throws(() => renderLegal({ markdown: '# T\n\nNot a banner.\n\n## 1. A\n', document: 'privacy', ...LINKS }), /banner/);
});

test('headings carry stable ids from their numbers, and the contents list links them', () => {
  const root = tree(document('## 1. Who\n\nA.\n\n### 1.1 Sub\n\nB.\n\n## 2. What\n\nC.').main);
  assert.deepEqual(selectAll(root, 'h2').map((h) => h.attrs.id), ['s1', 's2']);
  assert.equal(select(root, 'h3').attrs.id, 's1-1');
  assert.deepEqual(selectAll(root, 'nav.contents a').map((a) => a.attrs.href), ['#s1', '#s2']);
  assert.equal(select(root, 'h1').children[0].text, 'Privacy notice');
  assert.equal(textOf(select(root, 'p.version')), 'Version 2026-10-13');
});

test('lists nest, a continuation paragraph stays in its item, and ordered items are not split', () => {
  const root = tree(document([
    '## 1. Form', '',
    '1. **First.** Say it:',
    '   - one',
    '   - two', '',
    '   [[FOUNDER: reasons — confirm]]',
    '2. **Second.** Done.', '',
    '- plain',
    '- bullets',
  ].join('\n')).main);
  const ordered = select(root, 'ol');
  assert.equal(ordered.children.filter((c) => c.tag === 'li').length, 2);
  const [first] = selectAll(ordered, 'li');
  assert.equal(selectAll(first, 'ul > li').length, 2);
  assert.match(textOf(first), /\[\[FOUNDER: reasons — confirm\]\]/);
  const bullets = selectAll(root, 'ul').find((list) => list.parent.type === 'element' && list.parent.tag === '#root');
  assert.equal(selectAll(bullets, 'li').length, 2);
});

test('a table becomes a named, keyboard-reachable region with scoped header cells', () => {
  const root = tree(document('## 6. Keeping\n\n| Data | How long |\n|---|---|\n| Account | Until you delete it |\n| Logs | 30 days |').main);
  const wrap = select(root, '.table-wrap');
  assert.equal(wrap.attrs.role, 'region');
  assert.equal(wrap.attrs.tabindex, '0');
  assert.equal(wrap.attrs['aria-labelledby'], 's6');
  assert.deepEqual(selectAll(wrap, 'th').map((th) => [textOf(th), th.attrs.scope]), [['Data', 'col'], ['How long', 'col']]);
  assert.equal(selectAll(wrap, 'tbody tr').length, 2);
});

test('whole sections can be left out, and nothing of them is rendered', () => {
  const { main } = document('## 1. Kept\n\nKeep me.\n\n## 2. Left out\n\nSecret.\n\n### 2.1 Also out\n\nMore.\n\n## 3. Kept too\n\nBack.', { omitSections: [2] });
  assert.match(main, /Keep me/);
  assert.match(main, /Back/);
  assert.doesNotMatch(main, /Left out|Secret|Also out|More\./);
});

test('every document gets its title and a description in its language', () => {
  const english = renderLegal({ markdown: `# T\n\n${BANNER}\n\n## 1. A\n\nB.`, document: 'terms', ...LINKS });
  assert.equal(english.title, 'Terms of use — dressyou');
  const french = renderLegal({ markdown: '# T\n\n**Projet soumis au conseil de DressYou : x.** Établi.\n\n## 1. A\n\nB.', document: 'legal-notice', version: '2026-10-13', language: 'fr' });
  assert.equal(french.title, 'Mentions légales — dressyou');
  assert.match(french.description, /éditeur/);
});

test('a table with no numbered heading above it, and a draft that does not start with its title, are refused', () => {
  assert.throws(() => document('| A | B |\n|---|---|\n| 1 | 2 |'), /needs a numbered heading above it/);
  assert.throws(() => document('## Unnumbered\n\n| A | B |\n|---|---|\n| 1 | 2 |'), /needs a numbered heading above it/);
  assert.throws(() => renderLegal({ markdown: `${BANNER}\n\n## 1. A\n\nB.`, document: 'privacy', ...LINKS }), /must start with its title/);
  assert.throws(() => renderLegal({ markdown: `## 1. A\n\n${BANNER}`, document: 'privacy', ...LINKS }), /must start with its title/);
});
