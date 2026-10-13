import assert from 'node:assert/strict';
import test from 'node:test';
import { contrastRatio, declared, stylesheetProblems } from './support/a11y-rules.mjs';
import { loadSite, withFileText } from './support/site.mjs';

const site = loadSite();

test('contrast is computed the way WCAG defines it', () => {
  assert.equal(contrastRatio('#ffffff', '#000000').toFixed(2), '21.00');
  assert.equal(contrastRatio('#767676', '#ffffff').toFixed(2), '4.54');
  assert.equal(contrastRatio('#777', '#fff').toFixed(2), '4.48');
  assert.ok(contrastRatio('#808080', '#000000') > contrastRatio('#404040', '#000000'));
});

test('a declaration is read from its rule and nowhere else', () => {
  const css = '.a { color: #111; }\n.b .a { color: #222; margin: 0 }\n.a:hover { color: #333 }';
  assert.equal(declared(css, '.a', 'color'), '#111');
  assert.equal(declared(css, '.b .a', 'color'), '#222');
  assert.equal(declared(css, '.a:hover', 'color'), '#333');
  assert.equal(declared(css, '.a', 'margin'), null);
  assert.equal(declared('.x .a { color: #999 }', '.a', 'color'), null, 'a descendant rule is not the rule for .a');
});

test('the stylesheets keep contrast, target size, a visible focus ring and reduced motion', () => {
  assert.deepEqual(stylesheetProblems(site), []);
});

const edit = (file, pattern, replacement) => withFileText(site, file, (css) => {
  assert.match(css, pattern, `the mutation target is missing from ${file}`);
  return css.replace(pattern, replacement);
});

test('each stylesheet rule is refused when broken', () => {
  const found = (broken) => stylesheetProblems(broken).join('\n');
  assert.match(found(edit('site.css', /--ink-muted: #a6a6a6/, '--ink-muted: #595959')), /--ink-muted #595959 on black is \d\.\d+:1, under 4\.5:1/);
  assert.match(found(edit('site.css', /--field-border: #8c8c8c/, '--field-border: #222222')), /--field-border/);
  assert.match(found(edit('site.css', /--alert: #ff8a80;/, '')), /does not define --alert/);
  assert.match(found(edit('style.css', /(\.tagline \{[^}]*color: )#999/, '$1#444')), /\.tagline #444 on black/);
  assert.match(found(edit('site.css', /(\.button \{[^}]*)color: #000/, '$1color: #777')), /\.button #777 on #fff is under 4\.5:1/);
  assert.match(found(edit('site.css', /(\.language \{[^}]*)min-height: var\(--control-size\)/, '$1min-height: 1rem')), /\.language must be at least --control-size tall/);
  assert.match(found(edit('style.css', /--control-size: 2\.75rem/, '--control-size: 1rem')), /--control-size must be at least 2\.75rem/);
  assert.match(found(edit('site.css', /(a:focus-visible, input:focus-visible[^{]*\{ )outline: 2px solid var\(--ink\);/, '$1outline: none;')), /removes the focus ring|2px focus ring/);
  assert.match(found(edit('site.css', /a:focus-visible, input:focus-visible/, 'input:focus-visible')), /2px focus ring on links/);
  assert.match(found(edit('style.css', /animation: none !important/, 'animation: none')), /switch off every animation/);
  assert.match(found(edit('site.css', /$/, '\n.x { transition: opacity .2s }')), /must not add motion of its own/);
  assert.match(found(edit('site.css', /$/, '\nbody { color: #d9d9d9; }')), /sets color on body/);
  assert.match(found(edit('site.css', /$/, '\nhtml { line-height: 2; }')), /sets line-height on html/);
});
