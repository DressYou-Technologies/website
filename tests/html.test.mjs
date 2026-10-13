import assert from 'node:assert/strict';
import test from 'node:test';
import { parse, select, selectAll, textOf } from './support/html.mjs';

test('the parser builds a tree, decodes entities and honours void and raw-text elements', () => {
  const { root, errors } = parse(
    '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>a &amp; b</title>'
    + '<script>if (1 < 2) { "<b>" }</script></head>'
    + '<body><p class="x y" id=main data-k=\'v w\'>un&nbsp;deux <b>trois</b><br>fin</p></body></html>',
  );
  assert.deepEqual(errors, []);
  assert.equal(select(root, 'html').attrs.lang, 'fr');
  assert.equal(textOf(select(root, 'title')), 'a & b');
  assert.equal(select(root, 'script').children.length, 1, 'script content stays one raw text node');
  const p = select(root, '#main');
  assert.deepEqual(p.attrs, { class: 'x y', id: 'main', 'data-k': 'v w' });
  assert.equal(textOf(p), 'un deux troisfin');
  assert.equal(selectAll(root, 'b').length, 1);
});

test('selectors cover tag, id, class, attribute and descendant or child combinators', () => {
  const { root } = parse(
    '<main><nav class="a"><ul><li><a href="/x/" hreflang="en">x</a></li></ul></nav><a href="/y/">y</a></main>',
  );
  assert.equal(selectAll(root, 'main a').length, 2);
  assert.equal(selectAll(root, 'nav a[hreflang=en]').length, 1);
  assert.equal(selectAll(root, 'nav.a > ul > li > a').length, 1);
  assert.equal(selectAll(root, 'main > a').length, 1);
  assert.equal(selectAll(root, 'li > a[href]').length, 1);
  assert.equal(selectAll(root, 'nav > a').length, 0);
  assert.deepEqual(selectAll(root, 'li, nav, main > a').map((node) => node.tag), ['nav', 'li', 'a'], 'a selector list matches in document order');
});

test('malformed markup is reported, never repaired silently', () => {
  assert.match(parse('<div><p>x</div>').errors.join('\n'), /<p> is not closed/);
  assert.match(parse('<div>x</span></div>').errors.join('\n'), /unexpected <\/span>/);
  assert.match(parse('<div>x').errors.join('\n'), /<div> is not closed/);
  assert.match(parse('<p>caf&eacute;</p>').errors.join('\n'), /unknown entity &eacute;/);
  assert.match(parse('<p a="1" a="2">x</p>').errors.join('\n'), /duplicate attribute a on <p>/);
});

test('self-closing syntax is accepted for foreign elements such as the svg icons', () => {
  const { root, errors } = parse('<svg viewBox="0 0 24 24"><path d="M1 1"/><path d="M2 2" /></svg>');
  assert.deepEqual(errors, []);
  assert.equal(selectAll(root, 'svg > path').length, 2);
});
