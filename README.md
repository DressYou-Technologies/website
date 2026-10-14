# DressYou — launch site

Standalone static site for https://dressyouapp.com, in French (the default, at the root) and English (under `/en/`). No dependencies and no build step: `dist/` is served as written.

Run `python3 -m http.server 4173 --bind 127.0.0.1 --directory dist`. Check `node --test tests/*.test.mjs`; the tests also parse every module with `node --check`.

## Pages

| Page | French | English |
|---|---|---|
| Landing | `/` | `/en/` |
| Support | `/support/` | `/en/support/` |
| Account deletion (the URL Google Play asks for) | `/account-deletion/` | `/en/account-deletion/` |
| Report content, and the Digital Services Act contact points | `/dsa/` | `/en/dsa/` |
| Privacy notice, terms of use, legal notice | `/legal/<version>/{privacy,terms,legal-notice}/` | `/en/legal/<version>/…` |
| Where verification mail lands | `/auth/verified/` (one page, both languages) | |
| Where password reset mail lands | `/auth/reset/` (one page, both languages) | |

Every internal address is a directory with a trailing slash. The API's mail links go to `/auth/verified` and `/auth/reset#token=…` (older ones `/auth/reset?token=…`) without one, so `vercel.json` rewrites those two addresses to their directory index: the visitor's address, and its query or fragment, never change. `trailingSlash` stays unset on purpose. Vercel's documentation says that unset it serves `/about` and `/about/` alike without redirecting; `trailingSlash: true` redirects the paths that lack a slash (308), which is exactly these two (it does not say the query survives that redirect), and `false` redirects every directory address the site links to. `cleanUrls` only touches `.html` addresses, which nothing links to, so it is left out.

The same file sends `X-Content-Type-Options: nosniff` everywhere and, under `/auth/`, `Cache-Control: no-store`, `Referrer-Policy: no-referrer` and `Content-Security-Policy: frame-ancestors 'none'`. Check on the Vercel preview, with `curl -sI`, that `/auth/verified`, `/auth/reset?token=x&lang=en` and `/auth/reset/` each answer 200 with those headers and no redirect (`curl` drops a fragment, so open `/auth/reset#token=x` in a browser: the form shows and the address bar goes bare).

## The landing

The first screen is the identity animation: six photographs as hard cuts, then the mark, the wordmark and the tagline typed at a constant pace. It is unchanged; the French page types its own tagline, read from the page. Reduced-motion preferences skip to the final identity. Timing lives in `dist/sequence.mjs`; layout and the stamp entrance live in `dist/style.css`. Below the hero, `dist/site.css` styles the content and every other page. Photographs are approved brand art: do not re-encode, resize or crop them.

Manrope is self-hosted under its bundled OFL license. It is a variable subset (wght 200–800, Latin-1 plus common punctuation and `œ`, `’`, `«»`, `…`, `€`): a test refuses any shown character the subset cannot draw, such as `→`, `•` or a narrow no-break space. Adding such copy means re-subsetting.

## Auth pages

The API's mail links land here: `/auth/verified` (or `?error=<CODE>`) and `/auth/reset#token=<token>`. The reset token is in the fragment, which a browser never sends, so no server or log sees it. Links mailed before the token moved there carry it in the query, `/auth/reset?token=<token>` (or `?error=INVALID_TOKEN`), and are still read: delete that branch of `readLink` an hour after the API change, when the last of them has expired. A link with a fragment is judged by the fragment alone, and one pasted onto the open page reloads it, because a browser would not. `dist/auth/link.mjs` holds the logic, pure and unit-tested; `dist/auth/page.mjs` wires it to the page. Everything the page may say is in its HTML, in both languages, one hidden section per state; the module only chooses which to show and never writes words of its own. The language comes from `?lang=`, then `navigator.languages`, then French. The reset page has four states: the form, success, an invalid link, and the bare address with no token, which is what a reload shows once the token has left the address bar. A route that exists only inside the apps, such as asking for a new link, waits as a marker until the apps have it.

The reset page calls `POST https://api.dressyouapp.com/api/auth/reset-password` with `{ newPassword, token }`. That is a cross-origin request with a JSON body, so the API must answer its preflight for the origin `https://dressyouapp.com`; until it does, the page can only say the change is not confirmed. The token leaves the address bar and the history entry as soon as it is read, before any request. Each page carries a content policy: the reset page may reach the API origin and nothing else, and the verification page may connect to nothing. A token in the query of an older link still appears in Vercel's request logs until it is used or expires; one in the fragment never leaves the browser.

## Legal pages

The privacy notice, terms, legal notice and reporting page are rendered from the product repository's drafts, unchanged but for the reviewers' banner, the title and the links between documents:

```sh
node tests/support/render-legal.mjs <path to docs/legal> <policy version>
```

The renderer lives beside the tests because it decides what ships and is tested like code. Section 4 of the DSA draft, the notification to authorities, is an internal template and is not published. The version is the directory name, and the `ACCOUNT_POLICIES` bundle the API takes for it comes from `policyBundle` in `tests/support/policies.mjs`:

```json
{"version":"2026-10-13","documents":{"fr":{"termsUrl":"https://dressyouapp.com/legal/2026-10-13/terms/","privacyUrl":"https://dressyouapp.com/legal/2026-10-13/privacy/"},"en":{"termsUrl":"https://dressyouapp.com/en/legal/2026-10-13/terms/","privacyUrl":"https://dressyouapp.com/en/legal/2026-10-13/privacy/"}}}
```

A published version is never edited: a new text is a new directory, and every footer moves to the newest one.

## Before a pull request merges

Merging deploys to production, and a page that still holds `[[FOUNDER: …]]` or `[[COUNSEL: …]]` is not ready. The test `no placeholder ships` fails while any marker, `TODO`, template field, `lorem ipsum` or reserved example address is in `dist/`. List what is open with `grep -rhoE '\[\[(FOUNDER|COUNSEL): [a-z0-9-]+' dist | sort | uniq -c`; one key is one value, repeated across pages and both languages. A sentence about what only the apps can do waits as a marker until the apps have it; `tests/support/claim-rules.mjs` refuses the known ones in plain words, so the commit that fills such a marker also deletes its pattern there.

## Tests

`tests/*.test.mjs` run on Node's built-in runner against the real files. `tests/support/` holds a strict HTML reader (it reports markup it would have to guess at), the site model, the rules each suite applies, and a reader for the font's character map. Each rule is also run against a deliberately broken copy of a page, so a rule that stops biting turns its own test red. Crawler files live beside the pages: `robots.txt`, `sitemap.xml`, `site.webmanifest` and `llms.txt`.
