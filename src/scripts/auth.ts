import { CHOSEN, opensInFrench, readVerifiedLink } from '../lib/auth';
import { DEFAULT_LANG, localize } from '../i18n/lang';
import { all } from '../motion/dom';

export function startVerified() {
  if (opensInFrench(document.documentElement.lang, location.search, navigator.languages)) {
    // replace, so Back skips the English page rather than landing on it and moving again.
    location.replace(localize('fr', location.pathname) + location.search);
    return;
  }
  // Every word is in the page, one hidden section per result: this only chooses which shows.
  const result = readVerifiedLink(location.search);
  for (const section of all(document, 'section[data-state]')) section.hidden = section.dataset.state !== result;
  // The language switch keeps the result, and its link to the root page says the language was picked.
  for (const a of all<HTMLAnchorElement>(document, 'a[hreflang]')) {
    const query = new URLSearchParams(location.search);
    query.delete(CHOSEN);
    if (a.hreflang === DEFAULT_LANG) query.set(CHOSEN, DEFAULT_LANG);
    a.search = query.toString();
  }
}
