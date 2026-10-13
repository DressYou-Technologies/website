// A small, strict reader for this site's own markup. It exists so the tests can inspect pages
// without a dependency, and it reports every construct it would otherwise have to guess about.
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const RAW_TEXT = new Set(['script', 'style']);
const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

const COMMENT = /<!--[\s\S]*?-->/y;
const DOCTYPE = /<!doctype[^>]*>/iy;
const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s=/>"']+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/y;
const ATTRIBUTE = /([^\s=/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
const ENTITY = /&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]*);/g;

export function parse(html) {
  const root = { type: 'element', tag: '#root', attrs: {}, children: [], parent: null, line: 1 };
  const errors = [];
  const stack = [root];
  const lineAt = (index) => html.slice(0, index).split('\n').length;

  const decode = (text, index) => text.replace(ENTITY, (whole, name) => {
    if (name.startsWith('#x')) return String.fromCodePoint(parseInt(name.slice(2), 16));
    if (name.startsWith('#')) return String.fromCodePoint(Number(name.slice(1)));
    if (name in NAMED_ENTITIES) return NAMED_ENTITIES[name];
    errors.push(`line ${lineAt(index)}: unknown entity &${name};`);
    return whole;
  });
  const addText = (text, index) => {
    if (text) stack.at(-1).children.push({ type: 'text', text, parent: stack.at(-1), line: lineAt(index) });
  };

  let i = 0;
  while (i < html.length) {
    if (html[i] !== '<') {
      const end = html.indexOf('<', i);
      const stop = end === -1 ? html.length : end;
      addText(decode(html.slice(i, stop), i), i);
      i = stop;
      continue;
    }
    COMMENT.lastIndex = i;
    DOCTYPE.lastIndex = i;
    TAG.lastIndex = i;
    const comment = COMMENT.exec(html) ?? DOCTYPE.exec(html);
    if (comment) { i += comment[0].length; continue; }
    const match = TAG.exec(html);
    if (!match) {
      errors.push(`line ${lineAt(i)}: stray "<"`);
      addText('<', i);
      i += 1;
      continue;
    }
    const [whole, closing, rawName, rawAttributes, selfClosing] = match;
    const tag = rawName.toLowerCase();
    const line = lineAt(i);
    i += whole.length;
    if (closing) {
      const depth = stack.findLastIndex((node) => node.tag === tag);
      if (depth < 1) { errors.push(`line ${line}: unexpected </${tag}>`); continue; }
      while (stack.length - 1 > depth) {
        const open = stack.pop();
        errors.push(`line ${open.line}: <${open.tag}> is not closed`);
      }
      stack.pop();
      continue;
    }
    const attrs = {};
    for (const [, name, double, single, bare] of rawAttributes.matchAll(ATTRIBUTE)) {
      if (name in attrs) errors.push(`line ${line}: duplicate attribute ${name} on <${tag}>`);
      attrs[name.toLowerCase()] = decode(double ?? single ?? bare ?? '', i);
    }
    const node = { type: 'element', tag, attrs, children: [], parent: stack.at(-1), line };
    stack.at(-1).children.push(node);
    if (VOID.has(tag) || selfClosing) continue;
    if (RAW_TEXT.has(tag)) {
      const close = html.toLowerCase().indexOf(`</${tag}`, i);
      const stop = close === -1 ? html.length : close;
      if (stop > i) node.children.push({ type: 'text', text: html.slice(i, stop), parent: node, line: lineAt(i) });
      const after = html.indexOf('>', stop);
      i = after === -1 ? html.length : after + 1;
      if (close === -1) errors.push(`line ${line}: <${tag}> is not closed`);
      continue;
    }
    stack.push(node);
  }
  for (const open of stack.slice(1)) errors.push(`line ${open.line}: <${open.tag}> is not closed`);
  return { root, errors };
}

export function walk(node, visit) {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
}

export function textOf(node) {
  if (node.type === 'text') return node.text;
  if (RAW_TEXT.has(node.tag)) return '';
  return node.children.map(textOf).join('');
}

function compound(source) {
  const parts = { tag: null, id: null, classes: [], attributes: [] };
  const token = /^([a-zA-Z][a-zA-Z0-9-]*)|[#.][\w-]+|\[[\w-]+(?:=(?:"[^"]*"|'[^']*'|[^\]]*))?\]/g;
  for (const [piece] of source.matchAll(token)) {
    if (piece[0] === '#') parts.id = piece.slice(1);
    else if (piece[0] === '.') parts.classes.push(piece.slice(1));
    else if (piece[0] === '[') {
      const [, name, value] = piece.match(/^\[([\w-]+)(?:=(.*))?\]$/);
      parts.attributes.push([name, value === undefined ? null : value.replace(/^(["'])(.*)\1$/, '$2')]);
    } else parts.tag = piece.toLowerCase();
  }
  return parts;
}

function matches(node, parts) {
  if (node.type !== 'element') return false;
  if (parts.tag && node.tag !== parts.tag) return false;
  if (parts.id !== null && node.attrs.id !== parts.id) return false;
  const classes = (node.attrs.class ?? '').split(/\s+/);
  if (!parts.classes.every((name) => classes.includes(name))) return false;
  return parts.attributes.every(([name, value]) => name in node.attrs && (value === null || node.attrs[name] === value));
}

function matchesChain(node, chain) {
  const [last, ...rest] = chain.toReversed();
  if (!matches(node, last.parts)) return false;
  let current = node;
  let combinator = last.combinator;
  for (const step of rest) {
    if (combinator === '>') {
      current = current.parent;
      if (!matches(current, step.parts)) return false;
    } else {
      current = current.parent;
      while (current && !matches(current, step.parts)) current = current.parent;
      if (!current) return false;
    }
    combinator = step.combinator;
  }
  return true;
}

function chainOf(selector) {
  const chain = [];
  let combinator = ' ';
  for (const piece of selector.trim().split(/\s+/)) {
    if (piece === '>') { combinator = '>'; continue; }
    chain.push({ parts: compound(piece), combinator });
    combinator = ' ';
  }
  return chain;
}

export function selectAll(root, selector) {
  const chains = selector.split(',').map(chainOf);
  const found = [];
  walk(root, (node) => { if (node !== root && chains.some((chain) => matchesChain(node, chain))) found.push(node); });
  return found;
}

export function select(root, selector) {
  return selectAll(root, selector)[0] ?? null;
}
