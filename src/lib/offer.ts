import { browserLang } from './auth.ts';
import type { Lang } from '../i18n/lang.ts';

// The language the bar offers: the browser's first one the site has, when the page is in another and the person has not
// declined it. Nothing here knows which language sits at the root.
export function offeredLang(pageLang: string, languages: readonly string[], declined: string | null): Lang | undefined {
  const wanted = browserLang(languages);
  return wanted && wanted !== pageLang && wanted !== declined ? wanted : undefined;
}
