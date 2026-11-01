// English sits at the root, French under /fr (founder, 2026-10-31, replacing search plan D2's French root).
export const LANGS = ['en', 'fr'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'en';

// A page's path in a language, from its language-neutral path ("/", "/legal").
export const localize = (lang: Lang, path: string): string => (lang === DEFAULT_LANG ? path : `/${lang}${path === '/' ? '' : path}`);
