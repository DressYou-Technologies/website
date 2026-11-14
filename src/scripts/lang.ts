import { CHOSEN, DEFAULT_LANG, localize, opensInFrench } from '../i18n/lang';
import { all } from '../motion/dom';

// For a page that follows the browser's language: true when it is leaving for the French page.
export function followBrowserLang(): boolean {
  if (opensInFrench(document.documentElement.lang, location.search, navigator.languages)) {
    // replace, so Back skips the English page rather than landing on it and moving again.
    location.replace(localize('fr', location.pathname) + location.search);
    return true;
  }
  // The language switch keeps the query, and its link to the root page says the language was picked.
  for (const a of all<HTMLAnchorElement>(document, 'a[hreflang]')) {
    const query = new URLSearchParams(location.search);
    query.delete(CHOSEN);
    if (a.hreflang === DEFAULT_LANG) query.set(CHOSEN, DEFAULT_LANG);
    a.search = query.toString();
  }
  return false;
}
