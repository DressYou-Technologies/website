# AGENTS.md

The dressyou site (https://dressyouapp.com), built with Astro into a static `dist/`. No backend.

## Workflow

- `main` is production: Vercel builds and deploys every merge. Each pull request gets a Vercel preview, which is staging.
- Short-lived branches `<type>/<slug>` from `main`; squash-merged, so the PR title is the commit:
  `type(scope): subject`, lowercase, no trailing period, ≤ 72 characters. CI checks it.
- Comments only for the non-obvious why.

## Commands

```sh
npm ci                     # install (exact versions, lockfile)
npm run dev                # http://127.0.0.1:4321
npm run build              # dist/
npm run check              # astro check (TypeScript strict)
npm test                   # node:test over src/data and the built dist/ — build first
node scripts/shots.mjs <url> <outDir> <desktop|mobile> [reduce|noscript]   # real-time screenshots over CDP
node scripts/og-image.mjs  # regenerate public/og-image.jpg from the wall
```

## Layout

- `src/data/site.ts` — every image slot on the page, the site's name, tagline, description and store links.
- `src/components/` — one component per section, scoped CSS.
- `src/motion/` — one GSAP module per section, started from `index.ts` under `gsap.matchMedia`.
- `src/assets/{people,feed,garments}/` — image masters; Astro serves AVIF/WebP at each slot's size.
- `src/assets/manifest.json` — provenance of every master (model, prompt). They are generated, temporary placeholders.
- `public/` — served as-is: fonts with their OFL licences, icons, crawler files, the share image.
- `tests/` — Node's built-in runner. No framework.

## Conventions

- Versions are exact in `package.json`; the lockfile is committed.
- No runtime request to a third-party origin: no CDN script, font or stylesheet.
- Without the `motion` class on `<html>` (reduced motion, or no JS) every section shows its end state, still.
- No `href="#"`: a link without a destination is not rendered.

## Assets

- The logo mark is white on transparency. Anything that may sit on a light background (favicons,
  touch icons) needs the black plate baked in, or it disappears.
- Fonts are latin and latin-ext subsets. Keep each OFL licence beside its font.

## Metadata

`src/layouts/Base.astro` (head and JSON-LD), `public/sitemap.xml`, `public/llms.txt` and
`public/site.webmanifest` repeat the canonical URL, the name, the tagline and the description from
`src/data/site.ts`. If one changes, change all of them; `tests/page.test.mjs` checks they agree.
