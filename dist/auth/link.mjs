// What the account mail sends people back to, and the one call the reset page makes:
//   verification link  ->  /auth/verified            or  /auth/verified?error=<CODE>
//   reset link         ->  /auth/reset#token=<token>  (a fragment never reaches a server or a log)
//                          /auth/reset?token=<token>  (mailed before the token moved there)
//                          /auth/reset?error=INVALID_TOKEN
//   POST /api/auth/reset-password { newPassword, token }  ->  200, 400 { code }, or 429
// The password bounds are the API's.
export const API_ORIGIN = 'https://api.dressyouapp.com';
export const RESET_PATH = '/api/auth/reset-password';
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
const REQUEST_TIMEOUT_MS = 15_000;
export const LANGUAGES = ['fr', 'en'];
export const DEFAULT_LANGUAGE = 'fr';

/** The language in the link, else the browser's first supported one, else the site's default. */
export function chooseLanguage(search, preferred) {
  const linked = new URLSearchParams(search).get('lang');
  if (LANGUAGES.includes(linked)) return linked;
  for (const tag of preferred) {
    const language = tag.toLowerCase().split('-')[0];
    if (LANGUAGES.includes(language)) return language;
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Which state a link opens. Only what the API sends counts: a bare verification link, or a reset
 * link with exactly one non-empty token, in the fragment or, for links mailed before it moved
 * there, in the query. A fragment, when there is one, is the link and the query is not read. A
 * bare reset address is the page reopened after it took its token out of the address bar;
 * anything else fails closed.
 */
export function readLink(page, search, hash = '') {
  const params = new URLSearchParams(search);
  params.delete('lang');
  const queried = [...params];
  if (page === 'verified') return { state: queried.length === 0 ? 'verified' : 'failed' };
  const fragment = [...new URLSearchParams(hash.slice(1))];
  // shortcut: the query is still read, for links mailed before the move; delete it an hour after the API change.
  const entries = fragment.length ? fragment : queried;
  if (entries.length === 0) return { state: 'reopen' };
  const [name, value] = entries[0];
  return entries.length === 1 && name === 'token' && value ? { state: 'form', token: value } : { state: 'invalid' };
}

export function passwordProblem(password) {
  if (password.length < PASSWORD_MIN_LENGTH) return 'too-short';
  return password.length > PASSWORD_MAX_LENGTH ? 'too-long' : null;
}

export function resetRequest(token, newPassword) {
  return [`${API_ORIGIN}${RESET_PATH}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ newPassword, token }),
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  }];
}

const REFUSALS = { INVALID_TOKEN: 'invalid', USER_NOT_FOUND: 'invalid', PASSWORD_TOO_SHORT: 'too-short', PASSWORD_TOO_LONG: 'too-long' };

export function resetOutcome(status, code) {
  if (status === 200) return 'success';
  if (status === 429) return 'rate-limited';
  return (status === 400 && REFUSALS[code]) || 'unavailable';
}

/** One of success, invalid, too-short, too-long, rate-limited, unavailable; it never throws. */
export async function submitReset({ fetch, token, newPassword }) {
  try {
    const response = await fetch(...resetRequest(token, newPassword));
    // A proxy's error page is not JSON; the status alone then decides.
    const body = await response.json().catch(() => null);
    return resetOutcome(response.status, body?.code);
  } catch {
    return 'unavailable';
  }
}
