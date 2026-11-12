// What the account mails link to and the one call the reset page makes, as the API defines them (DressYou repository:
// docs/architecture/auth.md, api/src/auth/reset-cors.ts). The password bounds are Better Auth 1.7.7's defaults, which the
// API keeps.
export const API_ORIGIN = 'https://api.dressyouapp.com';
const RESET_URL = `${API_ORIGIN}/api/auth/reset-password`;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;
// The app opens on its own scheme; the API's browser-link page offers the same way in.
export const APP_URL = 'dressyou://';

export type ResetLink = { state: 'form'; token: string } | { state: 'invalid' | 'missing' };
export type Outcome = 'done' | 'invalid' | 'short' | 'long' | 'busy' | 'unconfirmed';

// The mail puts the token in the fragment, which never reaches a server. Better Auth's own link redirects with ?token=,
// or ?error=INVALID_TOKEN for a dead one.
export function readResetLink(search: string, hash: string): ResetLink {
  const query = new URLSearchParams(search);
  const token = new URLSearchParams(hash.slice(1)).get('token') ?? query.get('token');
  if (token) return { state: 'form', token };
  return token === '' || query.has('error') ? { state: 'invalid' } : { state: 'missing' };
}

// Better Auth redirects a failed verification with ?error=<code>, and a verified one with nothing.
export const readVerifiedLink = (search: string): 'verified' | 'failed' => (new URLSearchParams(search).has('error') ? 'failed' : 'verified');

export function passwordProblem(password: string): 'short' | 'long' | null {
  if (password.length < PASSWORD_MIN) return 'short';
  return password.length > PASSWORD_MAX ? 'long' : null;
}

const REFUSALS = new Map<unknown, Outcome>([['INVALID_TOKEN', 'invalid'], ['USER_NOT_FOUND', 'invalid'], ['PASSWORD_TOO_SHORT', 'short'], ['PASSWORD_TOO_LONG', 'long']]);

export function resetOutcome(status: number, code: unknown): Outcome {
  if (status === 200) return 'done';
  if (status === 429) return 'busy';
  return (status === 400 && REFUSALS.get(code)) || 'unconfirmed';
}

// A lost answer may hide a change that happened, so every failure short of a refusal is unconfirmed, never refused.
export async function submitReset(send: typeof fetch, token: string, newPassword: string): Promise<Outcome> {
  try {
    const response = await send(RESET_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ newPassword, token }) });
    // A proxy's error page is not JSON; its status alone then decides.
    const body: unknown = await response.json().catch(() => null);
    return resetOutcome(response.status, body && typeof body === 'object' && 'code' in body ? body.code : undefined);
  } catch {
    return 'unconfirmed';
  }
}
