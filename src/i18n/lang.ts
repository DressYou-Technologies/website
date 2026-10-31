// French sits at the root, English under /en (founder, 2026-10-30: search plan D2).
export const LANGS = ['fr', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'fr';

// A page's path in a language, from its language-neutral path ("/", "/legal").
export const localize = (lang: Lang, path: string): string => (lang === DEFAULT_LANG ? path : `/en${path === '/' ? '' : path}`);
