import { offeredLang } from '../lib/offer';
import { all, one } from '../motion/dom';

// The person's own choice, and the only thing kept: the language they declined. Storage can be off or blocked (private
// modes, strict settings). Then nothing is remembered and the bar shows again on the next page, which is the safe side.
const DECLINED = 'dressyou-declined-lang';
function readDeclined(): string | null {
  try { return localStorage.getItem(DECLINED); } catch { return null; }
}
function remember(lang: string) {
  try { localStorage.setItem(DECLINED, lang); } catch { /* not kept: see above */ }
}

export function offerLang() {
  const lang = offeredLang(document.documentElement.lang, navigator.languages, readDeclined());
  const bar = all(document, '.langbar').find((b) => b.lang === lang);
  if (!lang || !bar) return;
  // The other page keeps this one's query, so a result such as ?error= survives the switch.
  one<HTMLAnchorElement>(bar, 'a').search = location.search;
  bar.hidden = false;
  document.documentElement.classList.add('langbar-shown');
  one(bar, 'button').addEventListener('click', () => {
    bar.hidden = true;
    document.documentElement.classList.remove('langbar-shown');
    remember(lang);
  });
}
