# AGENTS.md

Static coming-soon page for dressyou (https://dressyouapp.com). No build step, no
dependencies, no backend. `dist/` is served verbatim — what is in it is what ships.

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
```

## Layout

- `dist/index.html` — markup and all SEO metadata (canonical, Open Graph, JSON-LD).
- `dist/light-rays.mjs` — the background rays (React Bits' LightRays).
- `dist/true-focus.mjs` — the tagline's moving focus brackets (React Bits' TrueFocus).
  Both are plain-JS ports under `react-bits.LICENSE.txt`, which must ship beside them.
  React Bits' `npx shadcn add` installs React components and would break the no-dependency rule.
- `dist/app.mjs` — starts the effects and holds their settings.
- `dist/style.css` — layout and type.
- `tests/` — Node's built-in runner. No framework.

## Conventions

- No dependencies and no build step. Both are deliberate; do not add either.
- Do not minify. Vercel serves Brotli, and the sources are a few kilobytes.
- CSS and JS stay unbundled ES modules served as-is.
- Respect `prefers-reduced-motion`: it must show still text over frozen rays.

## Assets

- The logo mark is white on transparency. Anything that may sit on a light
  background (favicons, touch icons) needs the black plate baked in, or it
  disappears. Regenerate icons from the mark; do not hand-edit them.

- `Manrope.woff2` is a variable subset (wght 200–800, Latin-1 + common punctuation).
  Adding copy outside that range means re-subsetting. Keep `Manrope-OFL.txt` beside
  it — the license requires it.

## Metadata

`index.html` metadata, `sitemap.xml`, `llms.txt` and the JSON-LD all repeat the
canonical URL, the name, and the tagline. If one changes, change all of them.
