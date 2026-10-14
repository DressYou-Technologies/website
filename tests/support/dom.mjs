import { parse, select, selectAll, textOf, walk } from './html.mjs';

const kebab = (name) => `data-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;

/**
 * Just enough of the browser's DOM to run a page's module against the page's own markup: the
 * tree comes from the real HTML, so a renamed id or a missing attribute fails the test.
 */
export function createDom(html, { search = '', hash = '', pathname = '/', languages = ['fr'] } = {}) {
  const { root } = parse(html);
  const wrappers = new WeakMap();
  const listeners = new Map();
  const state = { activeElement: null };

  class Element {
    constructor(node) { this.node = node; }
    get tagName() { return this.node.tag.toUpperCase(); }
    get id() { return this.node.attrs.id ?? ''; }
    get lang() { return this.node.attrs.lang ?? ''; }
    set lang(value) { this.node.attrs.lang = value; }
    get hidden() { return 'hidden' in this.node.attrs; }
    set hidden(value) { if (value) this.node.attrs.hidden = ''; else delete this.node.attrs.hidden; }
    get dataset() {
      const node = this.node;
      return new Proxy({}, {
        get: (_, name) => node.attrs[kebab(name)],
        set: (_, name, value) => { node.attrs[kebab(name)] = String(value); return true; },
        has: (_, name) => kebab(name) in node.attrs,
      });
    }
    get textContent() { return textOf(this.node); }
    set textContent(value) { this.node.children = [{ type: 'text', text: String(value), parent: this.node, line: 0 }]; }
    get value() { return this.node.value ?? ''; }
    set value(value) { this.node.value = String(value); }
    get elements() {
      return Object.fromEntries(selectAll(this.node, 'input, button, select, textarea').filter((el) => el.attrs.name).map((el) => [el.attrs.name, wrap(el)]));
    }
    getAttribute(name) { return this.node.attrs[name] ?? null; }
    setAttribute(name, value) { this.node.attrs[name] = String(value); }
    removeAttribute(name) { delete this.node.attrs[name]; }
    hasAttribute(name) { return name in this.node.attrs; }
    querySelector(selector) { const found = select(this.node, selector); return found && wrap(found); }
    querySelectorAll(selector) { return selectAll(this.node, selector).map(wrap); }
    focus() { state.activeElement = this; }
    addEventListener(type, handler) { listeners.set(this.node, [...(listeners.get(this.node) ?? []), [type, handler]]); }
    /** Runs every handler for `type` and waits for the async ones, like a user action would. */
    async dispatch(type) {
      const event = { type, target: this, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
      for (const [name, handler] of listeners.get(this.node) ?? []) if (name === type) await handler(event);
      return event;
    }
  }
  function wrap(node) {
    if (!wrappers.has(node)) wrappers.set(node, new Element(node));
    return wrappers.get(node);
  }

  const location = { search, hash, pathname, reloads: 0, reload() { this.reloads += 1; } };
  const history = {
    replacements: [],
    replaceState(_state, _title, url) {
      this.replacements.push(url);
      const [rest, fragment = ''] = url.split('#');
      const [path, query = ''] = rest.split('?');
      location.pathname = path;
      location.search = query ? `?${query}` : '';
      location.hash = fragment ? `#${fragment}` : '';
    },
  };
  const windowHandlers = new Map();
  const window = {
    addEventListener(type, handler) { windowHandlers.set(type, [...(windowHandlers.get(type) ?? []), handler]); },
    /** Runs the page's handlers for a window event, as the browser would when the visitor navigates. */
    async dispatch(type) { for (const handler of windowHandlers.get(type) ?? []) await handler({ type }); },
  };
  const document = {
    documentElement: wrap(select(root, 'html')),
    querySelector: (selector) => { const found = select(root, selector); return found && wrap(found); },
    querySelectorAll: (selector) => selectAll(root, selector).map(wrap),
    get title() { return textOf(select(root, 'title')); },
    set title(value) { wrap(select(root, 'title')).textContent = value; },
    get activeElement() { return state.activeElement; },
  };
  /** Everything a visitor could read or a script could leak: text and attribute values. */
  const everything = () => {
    const parts = [];
    walk(root, (node) => { if (node.type === 'text') parts.push(node.text); else parts.push(...Object.values(node.attrs ?? {})); });
    return parts.join('\n');
  };
  return { document, location, history, window, navigator: { languages }, everything, wrap };
}
