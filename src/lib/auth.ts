// The app opens on its own scheme; the API's browser-link page offers the same way in.
export const APP_URL = 'dressyou://';

// Better Auth redirects a failed verification with ?error=<code>, and a verified one with nothing
// (DressYou repository: docs/architecture/auth.md).
export const readVerifiedLink = (search: string): 'verified' | 'failed' => (new URLSearchParams(search).has('error') ? 'failed' : 'verified');
