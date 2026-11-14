// English sits at the root, French under /fr (founder, 2026-10-31, replacing search plan D2's French root).
export const LANGS = ['en', 'fr'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'en';

// A page's path in a language, from its language-neutral path ("/", "/legal").
export const localize = (lang: Lang, path: string): string => (lang === DEFAULT_LANG ? path : `/${lang}${path === '/' ? '' : path}`);

// Set by the language switch on its link to a root page, which then stays in the language the person picked.
export const CHOSEN = 'lang';

// The first of the browser's languages the site has.
export function browserLang(languages: readonly string[]): Lang | undefined {
  for (const tag of languages) {
    const lang = LANGS.find((l) => l === tag.toLowerCase().split('-')[0]);
    if (lang) return lang;
  }
  return undefined;
}

// A root page is English. A French browser goes to the French page instead, unless the switch brought it here. The French
// page never moves, so the two cannot send each other back and forth (founder, 2026-11-13).
export const opensInFrench = (pageLang: string, search: string, languages: readonly string[]): boolean =>
  pageLang === DEFAULT_LANG && !new URLSearchParams(search).has(CHOSEN) && browserLang(languages) === 'fr';
