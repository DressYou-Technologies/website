// The markup is ours, so a missing element is a build mistake: fail loudly instead of animating nothing.
export function one<T extends Element = HTMLElement>(parent: ParentNode, selector: string): T {
  const el = parent.querySelector<T>(selector);
  if (!el) throw new Error(`Missing ${selector}`);
  return el;
}

export function all<T extends Element = HTMLElement>(parent: ParentNode, selector: string): T[] {
  return Array.from(parent.querySelectorAll<T>(selector));
}
