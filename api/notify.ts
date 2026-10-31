// "Be notified": one email, kept by Brevo through its double opt-in, so nobody can sign up an address they don't own.
// The function is the only place the Brevo key lives; the page posts here, never to Brevo.

const BREVO_DOI_URL = 'https://api.brevo.com/v3/contacts/doubleOptinConfirmation';
const MAX_BODY_BYTES = 2048;
const MAX_EMAIL_LENGTH = 254;           // RFC 5321 path limit
const MIN_HUMAN_MS = 1500;              // a person takes longer than this to type an address
const BREVO_TIMEOUT_MS = 8000;
// English sits at the root and French under /fr, as on the site. The confirmation email and the page after it are in
// the language the person signed up in; anything else gets English.
type Lang = 'fr' | 'en';
const CONFIRMED_PATHS: Record<Lang, string> = { en: '/notified', fr: '/fr/notified' };
const languageOf = (lang: unknown): Lang => (lang === 'fr' ? 'fr' : 'en');
// Deliberately loose: one @, something before it, and a dotted domain. Brevo's own check is the strict one.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SETTINGS = ['BREVO_API_KEY', 'BREVO_LIST_ID', 'BREVO_DOI_TEMPLATE_ID_FR', 'BREVO_DOI_TEMPLATE_ID_EN'] as const;
type Env = Partial<Record<(typeof SETTINGS)[number], string>>;
type Fetcher = (url: string, init: { method: string; headers: Record<string, string>; body: string; signal: AbortSignal }) => Promise<Response>;

const answer = (status: number, body: Record<string, unknown> = {}) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store' } });

export async function handle(request: Request, env: Env, fetcher: Fetcher): Promise<Response> {
  if (request.method !== 'POST') return answer(405, { error: 'method' });
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') !== origin) return answer(403, { error: 'origin' });
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return answer(413, { error: 'size' });

  let body: unknown;
  try { body = JSON.parse(raw); } catch { return answer(400, { error: 'email' }); }
  const { email, website, elapsed, lang } = (body ?? {}) as Record<string, unknown>;
  // Bots fill every field and submit at once: tell them it worked and send nothing anywhere.
  if (website !== '' || typeof elapsed !== 'number' || elapsed < MIN_HUMAN_MS) return answer(200, { ok: true });
  if (typeof email !== 'string' || email.length > MAX_EMAIL_LENGTH || !EMAIL.test(email.trim())) return answer(400, { error: 'email' });

  const { BREVO_API_KEY: key, BREVO_LIST_ID: list, BREVO_DOI_TEMPLATE_ID_FR: fr, BREVO_DOI_TEMPLATE_ID_EN: en } = env;
  if (!key || !list || !fr || !en) {
    // Names only, never values: the deployment's log says which setting this environment lacks.
    console.error('notify: closed, missing', SETTINGS.filter((name) => !env[name]).join(', '));
    return answer(503, { error: 'closed' });
  }
  const language = languageOf(lang), template = language === 'en' ? en : fr;

  try {
    const res = await fetcher(BREVO_DOI_URL, {
      method: 'POST',
      headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ email: email.trim(), includeListIds: [Number(list)], templateId: Number(template), redirectionUrl: `${origin}${CONFIRMED_PATHS[language]}` }),
      signal: AbortSignal.timeout(BREVO_TIMEOUT_MS),
    });
    if (res.ok) return answer(200, { ok: true });
    const { code, message } = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
    // Already on the list: answer as for a new address, so the form never reveals who signed up.
    if (code === 'duplicate_parameter') return answer(200, { ok: true });
    // Only a refusal about the address itself is the person's to fix; anything else is the setup's, and is logged.
    if (res.status === 400 && /e-?mail/i.test(message ?? '')) return answer(400, { error: 'email' });
    console.error('notify: brevo refused', res.status, code ?? '', message ?? '');
    return answer(502, { error: 'upstream' });
  } catch (error) {
    console.error('notify: brevo unreachable', error instanceof Error ? error.message : String(error));
    return answer(502, { error: 'upstream' });
  }
}

export function POST(request: Request): Promise<Response> {
  return handle(request, process.env, fetch);
}
