import { walk } from './html.mjs';

// Blank in the source, never drawn: HTML collapses them.
const SOURCE_WHITESPACE = /[ \t\n\r\f]/;

/** Characters shown on a page that Manrope has no glyph for, and text that is not composed (NFC). */
export function fontProblems(site, covered) {
  const problems = [];
  for (const page of site.pages.values()) {
    if (page.html !== page.html.normalize('NFC')) problems.push(`${page.url} is not composed (NFC): an accent is a base letter and a combining mark`);
    const missing = new Map();
    walk(page.doc, (node) => {
      if (node.type !== 'text' || ['script', 'style', 'title'].includes(node.parent.tag)) return;
      for (const character of node.text) {
        if (!SOURCE_WHITESPACE.test(character) && !covered.has(character.codePointAt(0))) missing.set(character, true);
      }
    });
    for (const character of missing.keys()) {
      const code = character.codePointAt(0).toString(16).padStart(4, '0');
      problems.push(`${page.url} shows U+${code} ${character} which Manrope does not draw; the browser would fall back to another font`);
    }
  }
  return problems;
}
