import { DEFAULT_LANG, LANGS, type Lang } from '../i18n/lang.ts';

// The app opens on its own scheme; the API's browser-link page offers the same way in.
export const APP_URL = 'dressyou://';
// Set by the language switch on its link to the root page, which then stays in the language the person picked.
export const CHOSEN = 'lang';

// Better Auth redirects a failed verification with ?error=<code>, and a verified one with nothing
// (DressYou repository: docs/architecture/auth.md).
export const readVerifiedLink = (search: string): 'verified' | 'failed' => (new URLSearchParams(search).has('error') ? 'failed' : 'verified');

// The first of the browser's languages the site has.
export function browserLang(languages: readonly string[]): Lang | undefined {
  for (const tag of languages) {
    const lang = LANGS.find((l) => l === tag.toLowerCase().split('-')[0]);
    if (lang) return lang;
  }
  return undefined;
}

// The mail links the root page, which is English. A French browser goes to the French page instead, unless the switch
// brought it here. The French page never moves, so the two cannot send each other back and forth.
export const opensInFrench = (pageLang: string, search: string, languages: readonly string[]): boolean =>
  pageLang === DEFAULT_LANG && !new URLSearchParams(search).has(CHOSEN) && browserLang(languages) === 'fr';
