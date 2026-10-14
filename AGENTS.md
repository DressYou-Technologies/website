# AGENTS.md

Static launch site for dressyou (https://dressyouapp.com), in French (the default, at the
root) and English (under `/en/`). No build step, no dependencies, no backend. `dist/` is
served verbatim — what is in it is what ships.

## Workflow

- `main` is production: Vercel deploys every merge. Each pull request gets a Vercel preview, which is staging.
- Short-lived branches `<type>/<slug>` from `main`; squash-merged, so the PR title is the commit:
  `type(scope): subject`, lowercase, no trailing period, ≤ 72 characters. CI checks it.
- Comments only for the non-obvious why.

## Commands

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist   # serve
node --test tests/*.test.mjs                                    # test
node --check dist/app.mjs                                       # syntax
node tests/support/render-legal.mjs <docs/legal> <version>      # legal pages, from the product drafts
```

## Layout

- `dist/index.html`, `dist/en/index.html` — the two landings: markup and all SEO metadata (canonical, alternates, Open Graph, JSON-LD).
- `dist/sequence.mjs` — the timeline: phase boundaries, tagline pacing. Pure, unit-tested.
- `dist/app.mjs` — DOM wiring and the rAF loop. Imports `sequence.mjs`.
- `dist/style.css` — the hero: layout, the stamp entrance, and the phase-driven visibility rules.
- `dist/site.css` — everything below the hero, and every other page.
- `dist/<page>/index.html`, `dist/en/<page>/index.html` — support, account deletion, reporting (`dsa`) and the versioned legal pages under `legal/<version>/`. Every internal address is a directory with a trailing slash.
- `dist/auth/` — the two pages the API's account mail lands on (`verified`, `reset`), one document each for both languages. `link.mjs` is the pure logic, `page.mjs` the wiring.
- `vercel.json` — serves `dist`, rewrites the two mail addresses that carry no trailing slash, and sets the response headers. `trailingSlash` stays unset: `true` would redirect exactly those two addresses and `false` every page the site links to. `cleanUrls` only touches `.html` addresses and is left out.
- `tests/` — Node's built-in runner against the real files and a hand-rolled DOM stub. `tests/support/` holds the HTML reader, the site model and the rules each suite applies, every one also run against a deliberately broken copy. No framework.

Phases (`loading → spawn → shift → write → tagline → rest`) are driven by
`data-phase` on `.experience`; CSS reacts to that attribute. Change timing in
`sequence.mjs`, never by hardcoding durations in CSS — `app.mjs` pushes
`--spawn-duration` and `--shift-duration` into custom properties so the two stay
in sync.

## Conventions

- No dependencies and no build step. Both are deliberate; do not add either.
- Do not minify. Vercel serves Brotli, and the sources are a few kilobytes.
- CSS and JS stay unbundled ES modules served as-is.
- Respect `prefers-reduced-motion`: it must skip straight to the final identity.
- An open value is a marker, `[[FOUNDER: key — question]]` or `[[COUNSEL: key — question]]`. `no placeholder ships` stays red while one is in `dist/`, and it must be green before a pull request merges.
- A sentence about the apps or the law is true on the day the page ships. When it needs a screen, route or answer that does not exist yet, write it as a FOUNDER marker naming what delivers it; `tests/support/claim-rules.mjs` refuses the known ones in plain words, and the commit that fills such a marker deletes its pattern there. A marker a page shares with a legal draft carries the draft's own words, so one answer fills both.
- Legal pages are rendered from the product drafts, never hand-edited. A published version directory is never changed: a new text is a new directory.

## Assets

- Photographs in `dist/images/` are approved brand art with intentional film grain.
  Do not re-encode, resize, or crop them without being asked.
- The logo mark is white on transparency. Anything that may sit on a light
  background (favicons, touch icons) needs the black plate baked in, or it
  disappears. Regenerate icons from the mark; do not hand-edit them.
- `Manrope.woff2` is a variable subset (wght 200–800, Latin-1 + common punctuation).
  Adding copy outside that range means re-subsetting. Keep `Manrope-OFL.txt` beside
  it — the license requires it.

## Metadata

Each landing's metadata, `sitemap.xml`, `llms.txt` and the JSON-LD all repeat the
canonical URL, the name, and the tagline (French on `/`, English on `/en/`). If one
changes, change all of them.
