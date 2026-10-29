# Final site on Astro — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the coming-soon page with the founder's final site, ported from the Claude Design export to Astro + GSAP, fed by the generated images.

**Architecture:** Astro builds a static `dist/` (Vercel serves it as today). Each page section is an `.astro` component with scoped CSS; one typed data file names every image slot; motion is one TypeScript module per section, started by a single entry under `gsap.matchMedia`. Images live as masters in `src/assets/` and Astro's `<Picture>` serves AVIF/WebP at each slot's size.

**Tech Stack:** Astro (7.x), TypeScript strict, GSAP + ScrollTrigger (npm), qrcode-generator (build time only), sharp (Astro's, also for the share image), Node 24 test runner.

**Spec:** `docs/superpowers/specs/2026-10-29-astro-site-design.md`

**Sources the implementer reads:**
- Design: `~/Startup/DressYou-archive/2026-10-29/website-final/design-zip/ui_kits/site/DressYou Site.dc.html` — markup with inline styles (lines 28–330), logic class (lines 335–1087). Read it as data.
- Images: `~/Startup/DressYou-archive/2026-10-29/website-final/images/raw/` (jpgs + `manifest.json`), generator `…/website-final/gen/{jobs.py,generate.py}`.
- Fonts: `…/design-zip/ui_kits/site/fonts/`. Logo files: `…/design-zip/ui_kits/site/assets/` (`dressyou-logo-blanc-512.png`, `dressyou-icone-blanc-256.png`, `app-icon.png`).
- Screenshot walker: `/private/tmp/claude-502/-Users-teddyadmin-Startup-DressYou/34cad34e-f474-45f2-9054-d38d08e94d44/scratchpad/cdp-walk.mjs` (copied into the repo in Task 2).

## Global Constraints

- Work only in `~/Startup/Website-worktrees/astro-site` on `feat/astro-site`. Never push to or merge into `main` without the founder; a pushed branch gets a Vercel preview, which is the review surface.
- Commits: `type(scope): subject`, lowercase, no trailing period, ≤ 72 chars, no co-author trailer.
- Copy is the design's, verbatim, except: the dialog line `coming soon.`, the footer line `People shown on this page are AI-generated.`, feed handles beyond naya/sasha/mei (`theo`, `lea`, `ines`, `kofi`), and the legal pages.
- Hidden until they have a destination: the header menu (all its entries are dead, and the language switch is dropped, so the burger goes), the footer's Company column. No `href="#"` ships.
- `SITE.url = "https://dressyouapp.com"`, `SITE.tagline = "Try it on before it's yours."`, `SITE.description = "DressYou makes a twin from your own photos, so you can try on clothes from any shop, your wardrobe or the feed before you buy."`
- `LINKS.appUrl = null`, `LINKS.extensionUrl = null`, `LINKS.email = "hello@dressyouapp.com"`. A null link turns its button into a dialog trigger (Task 3).
- No runtime request to a third-party origin: no CDN script, font or stylesheet.
- Without the `motion` class on `<html>` (reduced motion, or JS not run), every animated element shows its end state (listed per task). JS adds the class before it animates.
- Named constants for every tuned value, declared once: `STORY_LENGTH_PX = 3600`, `DRIFT_SECONDS = 8`, `HEADER_FOLD_AT = 80`, `WIDE_QUERY = "(min-width: 901px)"`, `MOTION_QUERY = "(prefers-reduced-motion: no-preference)"`; others as the port meets them.
- Inline styles become class rules in the component's `<style>`, values copied verbatim; `style-hover` becomes `:hover`, `style-active` becomes `:active`.
- Not ported (dead in the export: no markup uses them): `LOOKS`, `pickLook`, `startAuto`, `stopAuto`, `tryOn`, `fitApp`, `toggleLang`, the `componentDidUpdate` tweak handling, `email`/`joined` state.

## Review Focus

1. **Reduced motion and no-JS** — a visitor with reduced motion, or whose JS fails, should see every section complete and still. Each section task ends with a `reduce` and a `noscript` walk.
2. **Phone width (390 px)** — no sideways scroll, the pinned stylist story still snaps, the phone mock fits. Each section task checks `scrollWidth <= innerWidth` at 390.
3. **Fast scroll and anchor jumps into the pinned stylist** — a flick or the footer's "Stylist" link lands on a whole question, never between two (`labelsDirectional`, `inertia: false`). Task 6 tests it.
4. **Resize and rotation** — the hero cylinder and the wardrobe rows re-measure; nothing stays placed for the old width. Tasks 4 and 5 resize from 1440 to 390 mid-page and screenshot.
5. **Offscreen loops** — the wardrobe spin, feed tracks and how-it-works cycle pause when offscreen and resume cleanly when scrolled back (no doubled timelines). Task 5 scrolls away and back twice.

---

### Task 1: Image masters and the slot data

**Files:**
- Modify: `~/Startup/DressYou-archive/2026-10-29/website-final/gen/jobs.py` (outside the repo)
- Create: `src/assets/people/*.jpg`, `src/assets/feed/*.jpg`, `src/assets/garments/*.jpg`, `src/assets/manifest.json`, `src/data/site.ts`
- Test: `tests/data.test.mjs`

**Interfaces:**
- Produces (`src/data/site.ts`):
  ```ts
  export type ImageId = string; // file stem, unique across src/assets/{people,feed,garments}
  export interface Post { handle: string; age: string; image: ImageId }
  export interface Outfit { pieces: [ImageId, ImageId, ImageId, ImageId]; render: ImageId } // piece i comes from WARDROBE_ROWS[i]
  export const SITE: { name: string; url: string; tagline: string; description: string };
  export const LINKS: { appUrl: string | null; extensionUrl: string | null; email: string };
  export const WALL: ImageId[][];            // 9 columns × 3 tiles, column-major
  export const HOW: { shop: { image: ImageId; render: ImageId }; wardrobe: { grid: ImageId[]; picks: ImageId[]; render: ImageId }; feed: { post: Post; render: ImageId } };
  export const WARDROBE_ROWS: ImageId[][];   // tops, bottoms, shoes, layers
  export const OUTFITS: Outfit[];            // the wardrobe spin cycles these in order
  export const FEED_TRACKS: [Post[], Post[]];
  export const LOOK_PIECES: ImageId[];       // "in this look" over the feed tile
  export const FRIEND_LOOKS: { image: ImageId; label: string; pick: boolean }[];
  export const STYLIST: { dinner: ImageId[]; trip: ImageId[]; find: ImageId };
  ```

- [ ] **Step 1: Generate the five missing images.** Add to `jobs.py` and run `python3 -I jobs.py && python3 -I generate.py jobs.json ../images/raw`:
  - `g-black-wide-trousers` (garment): "a pair of black wool wide-leg trousers with front pleats, laid flat".
  - `twin-cap-trench` (TRY_ON, refs `twin, g-black-cap, g-trench, g-white-tank, g-barrel-jeans, g-brown-boots`), note "The trench coat is worn open over the tank top; the cap faces forward."
  - `twin-knit-cap` (TRY_ON, refs `twin, g-taupe-sweater, g-grey-trousers, g-ballet-flats, g-black-cap`).
  - `twin-tee-trench` (TRY_ON, refs `twin, g-black-tee, g-pinstripe-trousers, g-chelsea-boots, g-trench`), note "The trench coat is worn open."
  - `feed-w-trench` (FEED style, `FEED_SIZE`, refs `g-black-cap, g-trench, g-white-tank, g-barrel-jeans, g-brown-boots`): an original woman in her mid-twenties, slim, long dark hair under the cap, wearing exactly these garments, the trench open, leaning on a stone doorway on a Paris street, glancing at her phone.
  Expected: `ok` for each, 47 jpgs. Look at all five next to `twin.jpg` and the garments; regenerate any whose face or garments drift.
- [ ] **Step 2: Copy masters into the repo.** `twin*`, `wall-*`, `shop-trench` → `src/assets/people/`; `feed-*` → `src/assets/feed/`; `g-*` → `src/assets/garments/`; re-encode each with `sips -s format jpeg -s formatOptions 85` (no resize: the largest slot shows 864 px). Copy `manifest.json` to `src/assets/manifest.json`.
- [ ] **Step 3: Write the failing test** `tests/data.test.mjs` (imports `../src/data/site.ts`; Node 24 strips types):
  - `every image id in the data exists as a master` — walk all ids in every export; each has exactly one `src/assets/*/<id>.jpg`.
  - `every master has a manifest entry with its model` — `manifest[id].model === "gpt-image-2.5-sunburst"`.
  - `the wall is 9 columns of 3 with no repeat close by` — `WALL.length === 9`, each length 3; no id twice in a column; equal ids are ≥ 3 columns apart; all 16 `wall-*` ids appear.
  - `each outfit piece comes from its row` — `OUTFITS.every(o => o.pieces.every((p, i) => WARDROBE_ROWS[i].includes(p)))`; row lengths `[4, 4, 4, 3]`, no duplicates within a row.
  - `the feed story's render wears the post's look` — `HOW.feed.post.image === "feed-w-trench"`, `HOW.feed.render === "twin-cap-trench"`, `LOOK_PIECES` equals `["g-black-cap", "g-trench", "g-white-tank", "g-barrel-jeans", "g-brown-boots"]`.
- [ ] **Step 4: Run it:** `node --test tests/data.test.mjs` — FAIL (module not found).
- [ ] **Step 5: Write `src/data/site.ts`** with these values:
  - `WALL`: the 16 `wall-*` ids once each, `twin-trench`, `twin-knitdress`, `twin-knitset`, `twin-office` once each, seven `wall-*` repeats, arranged to pass the test; keep the centre tile (column 5, row 2) a `wall-*` id.
  - `HOW`: shop `{ image: "shop-trench", render: "twin-trench" }`; wardrobe grid `["g-cream-top", "g-black-knit-dress", "g-barrel-jeans", "g-slingbacks", "g-taupe-sweater", "g-chelsea-boots"]`, picks `["g-black-knit-dress", "g-slingbacks"]`, render `"twin-knitdress"`; feed post `{ handle: "naya", age: "2h", image: "feed-w-trench" }`, render `"twin-cap-trench"`.
  - `WARDROBE_ROWS`: `["g-cream-top", "g-black-tee", "g-taupe-sweater", "g-white-tank"]`, `["g-barrel-jeans", "g-grey-trousers", "g-pinstripe-trousers", "g-black-wide-trousers"]`, `["g-chelsea-boots", "g-ballet-flats", "g-slingbacks", "g-brown-boots"]`, `["g-trench", "g-black-cap", "g-black-knit-dress"]`.
  - `OUTFITS`: `[g-white-tank, g-barrel-jeans, g-brown-boots, g-trench] → twin-trench`, `[g-taupe-sweater, g-grey-trousers, g-ballet-flats, g-black-cap] → twin-knit-cap`, `[g-black-tee, g-pinstripe-trousers, g-chelsea-boots, g-trench] → twin-tee-trench`.
  - `FEED_TRACKS`: `[naya 2h feed-w-trench, sasha 1d feed-w-mirror, theo 3d feed-m-coffee]`, `[mei 5h feed-w-bench, lea 4h feed-w-bakery, ines 2d feed-w-canal, kofi 1d feed-m-lounge]`.
  - `FRIEND_LOOKS`: `look 1` twin-office, `look 3` twin-knitset, `look 2` twin-trench `pick: true` (that order, as the design fans them).
  - `STYLIST`: dinner `["g-cream-top", "g-black-wide-trousers", "g-ballet-flats", "g-trench"]`, trip `["g-cream-top", "g-barrel-jeans", "g-black-tee", "g-taupe-sweater", "g-chelsea-boots", "g-slingbacks"]`, find `"g-black-knit-dress"`.
- [ ] **Step 6: Run it:** `node --test tests/data.test.mjs` — PASS. Break one wall column (same id twice) and watch it go red, then restore.
- [ ] **Step 7: Commit** `feat(site): image masters and slot data`.

### Task 2: Astro scaffold, layout, metadata and CI

**Files:**
- Create: `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`, `src/layouts/Base.astro`, `src/pages/index.astro` (sections stubbed), `src/lib/image.ts`, `src/styles/{tokens,base}.css`, `public/` (fonts + licences, favicons, `robots.txt`, `sitemap.xml`, `site.webmanifest`, `llms.txt`, `og-image.jpg`), `scripts/og-image.mjs`, `scripts/shots.mjs`
- Delete: `dist/` from git (now build output), `dist/app.mjs`, `dist/light-rays.mjs`, `dist/true-focus.mjs`, `dist/react-bits.LICENSE.txt`, `dist/style.css`
- Modify: `.gitignore` (`dist/`, `node_modules/`, `.astro/`), `vercel.json`, `.github/workflows/ci.yml`, `AGENTS.md`, `README.md`
- Test: `tests/page.test.mjs` (rewritten over the built `dist/`)

**Interfaces:**
- Consumes: `SITE`, `LINKS` from Task 1.
- Produces: `Base.astro` props `{ title?: string; description?: string; path: string }`; `src/lib/image.ts` `export function image(id: ImageId): ImageMetadata` (via `import.meta.glob("../assets/*/*.jpg", { eager: true })`, throws on an unknown id at build); `npm run build`, `npm test` (`node --test tests/*.test.mjs`, run after build), `node scripts/shots.mjs <url> <outDir> <desktop|mobile> [reduce|noscript]`.

- [ ] **Step 1: Write the failing test** `tests/page.test.mjs` over `dist/index.html`:
  - `the head carries the site name, tagline, description and canonical` — `<title>` contains `SITE.tagline`; `meta[name=description]` equals `SITE.description`; `link[rel=canonical]` is `https://dressyouapp.com/`; `og:image` is an absolute URL to `/og-image.jpg`.
  - `the JSON-LD, llms.txt and sitemap agree with the head` — parsed JSON-LD `url`, `name`, `description` equal `SITE`; `dist/llms.txt` contains the URL and tagline; `dist/sitemap.xml` lists `/`, `/legal`, `/privacy`, `/terms`.
  - `every local reference exists` — every `src`, `href` and each `srcset` URL starting with `/` resolves under `dist/`.
  - `no third-party origin is loaded` — no `<script src="http`, no `<link rel=stylesheet href="http`, no `@import url(http` in emitted CSS.
  - `no link is dead` — no `href="#"` in any `dist/**/*.html`.
  - `every image states its size and alt` — each `<img>` has `width`, `height` and an `alt` attribute.
- [ ] **Step 2: Run** `npm run build && npm test` — FAIL (no Astro yet).
- [ ] **Step 3: Scaffold.** `npm install astro gsap qrcode-generator` and `npm install -D typescript @astrojs/check`; pin exact versions (`--save-exact`). Before using `<Picture>`, `import.meta.glob` and `astro:assets` options, read their types in `node_modules/astro` for the installed version. `astro.config.mjs`: `site: SITE.url`, `output: "static"`, `outDir: "dist"`, `trailingSlash: "never"`, `build.format: "file"` (so `/legal` serves `legal.html`). `vercel.json`: `"framework": "astro", "buildCommand": "npm run build", "outputDirectory": "dist"`. CI: `npm ci`, `npm run build`, `npx astro check`, `npm test`.
- [ ] **Step 4: Base layout and tokens.** `tokens.css` from the design system's `tokens/*.css` (colours, type, spacing, motion; only what the site uses). `@font-face` for Manrope (latin, latin-ext) and IBM Plex Mono 500 latin from `/fonts/`, with `Manrope-OFL.txt` and IBM Plex Mono's `OFL.txt` (from github.com/google/fonts `ofl/ibmplexmono/OFL.txt`) beside them. Base layout carries the metadata set, JSON-LD (`Organization` + `WebSite`), favicons from the current `dist/`. `scripts/og-image.mjs` composes a 1200×630 JPEG with sharp from five `WALL` tiles on `#0a0a0b` with the white logo; write `public/og-image.jpg`.
- [ ] **Step 5: Copy** `cdp-walk.mjs` to `scripts/shots.mjs`, adding `noscript` (`Emulation.setScriptExecutionDisabled`) and printing `scrollWidth > innerWidth` as `overflow: yes|no`.
- [ ] **Step 6: Run** `npm run build && npm test` — PASS; break the description in `llms.txt` and watch it fail, restore.
- [ ] **Step 7: Rewrite `AGENTS.md` and `README.md`** for the new stack: commands, layout (`src/components`, `src/motion`, `src/data/site.ts`, `src/assets`), the metadata rule, reduced motion rule, logo plate rule, image provenance (`src/assets/manifest.json`, generator path). Drop the no-dependency and no-minify rules.
- [ ] **Step 8: Commit** `build(site): astro scaffold, metadata and ci`.

### Task 3: Header, dialogs and footer

**Files:**
- Create: `src/components/Header.astro`, `src/components/GetDialog.astro`, `src/components/Finale.astro`, `src/scripts/chrome.ts`, `src/lib/qr.ts`
- Test: `tests/page.test.mjs` (add)

**Interfaces:**
- Consumes: `LINKS`, `image()`.
- Produces: elements `[data-get="app"]`, `[data-get="extension"]` (any button that opens the dialog); `src/lib/qr.ts` `export function qrSvg(url: string): string` (qrcode-generator, error level `M`, used at build only); `chrome.ts` `export function startChrome(): void` (header fold at `HEADER_FOLD_AT`, hide on scroll down past 160 px, the export's `hideHeader`/`fold`/`scrollToY` and anchor handling; dialog open/close, Escape, focus return).

- [ ] **Step 1: Failing tests:**
  - `a null store link opens a dialog instead of linking` — with `LINKS.appUrl === null`, the header, hero and finale "Get the app" are `<button data-get="app">`; same for the extension; `dist/index.html` has `<dialog id="get-app">` containing `coming soon.`.
  - `the footer lists only working links and the AI line` — footer has `How it works`, `Wardrobe`, `Stylist`, `Legal notice`, `Privacy`, `Terms` with hrefs `#how`, `#more`, `#stylist`, `/legal`, `/privacy`, `/terms`, a `mailto:hello@dressyouapp.com`, and the text `People shown on this page are AI-generated.`
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Port** `header.top` (brand, "Get the extension", "Get the app" with the hover QR popover only when `LINKS.appUrl` is set), the `.qr-modal` as a native `<dialog>` (title from the design: `Get the app.` / `Get the extension.`; QR when the link is set, else `coming soon.`), and `footer.finale` (mega words, CTAs, logo, email, Product and Legal columns, AI line). Logic from the export's `boot` (scroll and anchor parts), `hideHeader`, `fold`, `scrollToY`, `qrHoverOn/Off`, `openApp/closeApp/showApp`, `closing` (finale words, moved to Task 7's motion module).
- [ ] **Step 4: Run** — PASS. Walk desktop and mobile: the header pill folds after 80 px and stays dark at the page bottom; the dialog opens from all three buttons, closes on Escape and on the scrim, returns focus.
- [ ] **Step 5: Commit** `feat(site): header, get dialog and footer`.

### Task 4: Hero wall

**Files:**
- Create: `src/components/Hero.astro`, `src/motion/hero.ts`, `src/motion/index.ts`
- Test: walk only (layout)

**Interfaces:**
- Consumes: `WALL`, `image()`.
- Produces: `src/motion/index.ts` — registers ScrollTrigger, `gsap.matchMedia()` with `{ motion: MOTION_QUERY, wide: WIDE_QUERY }`, adds `motion` to `<html>` when motion is allowed, calls each section's `start` and returns their cleanups. Section contract: `export type Section = (root: HTMLElement, wide: boolean) => void | (() => void)`. `hero.ts` exports `hero: Section`.

- [ ] **Step 1: Port** `section.hero`: 9 `.col > .track` of 3 `<Picture>` tiles from `WALL` (formats `avif, webp`, widths `[220, 320]`, `sizes="160px"`, first column row eager, the rest lazy), headline lines, dock buttons. Columns are placed by the export's `place()` formula (cylinder, `r = w * 5`) on load and on resize; the static markup positions are only the no-JS fallback. Motion from the export's `hero()`: entrance, blur-in lines, idle drift (`DRIFT_SECONDS`), alternate-column scroll parallax ±160.
- [ ] **Step 2: Walk** `node scripts/shots.mjs http://127.0.0.1:4321/ /tmp/hero desktop` and `mobile`, `reduce`, `noscript`: the wall fills the band, the headline sits centred over it, columns alternate drift; reduce and noscript show a still wall and the headline; `overflow: no`. Resize 1440 → 390 mid-page (CDP `setDeviceMetricsOverride`) and screenshot: the cylinder re-fits.
- [ ] **Step 3: Commit** `feat(site): hero wall of bodies`.

### Task 5: How it works and "More than a try-on"

**Files:**
- Create: `src/components/How.astro`, `src/components/More.astro`, `src/motion/how.ts`, `src/motion/more.ts`, `src/motion/wardrobe.ts`
- Test: `tests/page.test.mjs` (add), walks

**Interfaces:**
- Consumes: `HOW`, `WARDROBE_ROWS`, `OUTFITS`, `FEED_TRACKS`, `LOOK_PIECES`, `FRIEND_LOOKS`, `image()`, `Section`.
- Produces: `how: Section`, `more: Section` (calls `wardrobe(root)`).

- [ ] **Step 1: Failing test** `the outfit result shows the outfit's render` — `.wout` contains one `<picture>` per `OUTFITS` entry, each with `data-outfit` index; without motion the first is visible.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Port** `section.how` (phone mock, the three sources from `HOW`, their renders, size popups and chat lines verbatim, the rolling word `any shop. / your wardrobe. / the feed.`, steps list) with motion from `anyPiece()`. No-motion end state: source 1 and its render visible with its size popup and answer.
- [ ] **Step 4: Port** `section.more` (bento: wardrobe card, feed tile with `FEED_TRACKS` repeated twice per track for a seamless loop, initials from `handle[0].toUpperCase()`, "in this look" from `LOOK_PIECES`, friend card from `FRIEND_LOOKS`) with motion from `more()` and `wardrobeSpin()`. One change to the spin: instead of `shuffle` landing on any piece, spin *n* lands each row on `OUTFITS[n % OUTFITS.length].pieces[row]` (nearest occurrence past the current index in the spin direction, keeping the export's gap guard), and `.wout` shows that outfit's render. Laps, durations and eases stay random as in the export. No-motion end state: rows full, outfit 1's pieces ticked, its render shown; feed tile first card; friend card all three looks, the pick ringed, votes shown.
- [ ] **Step 5: Run** — PASS. Walk desktop, mobile, reduce, noscript. Scroll past `section.more` and back twice: one spin running, feed tracks moving once, no stacked timelines (`gsap.globalTimeline.getChildren().length` printed before and after is equal). `overflow: no` at 390.
- [ ] **Step 6: Commit** `feat(site): how it works and more than a try-on`.

### Task 6: Stylist story

**Files:**
- Create: `src/components/Stylist.astro`, `src/motion/stylist.ts`
- Test: walk

**Interfaces:**
- Consumes: `STYLIST`, `image()`, `Section`, `STORY_LENGTH_PX`.
- Produces: `stylist: Section`.

- [ ] **Step 1: Port** `section.stylist` (tabs, five question groups verbatim, piece tiles from `STYLIST`, the input bar) with motion from `stylistStory()`: pinned, `end: "+=" + STORY_LENGTH_PX`, snap `labelsDirectional`, `inertia: false`. No-motion end state: all five groups shown in order, every tab active-looking.
- [ ] **Step 2: Walk** at each label (extend `shots.mjs` spots with the pinned trigger's labels, as the v2 spike's `cdp-shots.mjs` did): each lands on one whole group, desktop and mobile. Flick test: `window.scrollBy(0, 1500)` in one call from the first label, wait 1.5 s, the active tab is the next one. Footer "Stylist" link lands on the first group.
- [ ] **Step 3: Commit** `feat(site): stylist story`.

### Task 7: Finale motion and legal pages

**Files:**
- Create: `src/motion/finale.ts`, `src/pages/legal.astro`, `src/pages/privacy.astro`, `src/pages/terms.astro`
- Test: `tests/page.test.mjs` (add)

**Interfaces:**
- Consumes: `Base.astro`, `SITE`, `LINKS`, `Section`.
- Produces: `finale: Section`.

- [ ] **Step 1: Failing test** `the legal pages exist and name the publisher` — `dist/legal.html` contains `DressYou Technologies`, `47 rue Vivienne, 75002 Paris`, `hello@dressyouapp.com`, `Vercel`; `dist/privacy.html` and `dist/terms.html` exist with the site's header and footer.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Write the pages** in the design's type and spacing. Legal notice: publisher, address, email, host (Vercel Inc., address taken from vercel.com/legal, not memory), and the founder's fields as visible `[to be completed]` markers: legal form and share capital, RCS and SIREN, publication director. Privacy: the site sets no cookies, runs no analytics and has no forms (check that each is true in the build); Vercel processes request logs as host; contact email. Terms: use of the site, intellectual property of the brand, no account on the site, French law. Finale motion from `closing()`.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** `feat(site): finale motion and legal pages`.

### Task 8: Whole-site verification and preview

- [ ] **Step 1:** `npm run build && npx astro check && npm test` — all green.
- [ ] **Step 2:** Walk the whole page desktop, mobile, reduce, noscript with `scripts/shots.mjs`; compare section by section with the export's walk (`node scripts/shots.mjs "http://127.0.0.1:4175/DressYou%20Site.dc.html" …` against the served export). Differences other than images and the hidden links are bugs.
- [ ] **Step 3:** Lighthouse CLI on `npm run preview` (mobile): performance ≥ 90, accessibility ≥ 95. Record both scores.
- [ ] **Step 4:** Push `feat/astro-site` only after the founder agrees, open the PR (`feat(site): final site on astro`), and send the founder the Vercel preview link. The production merge waits for the founder's legal fields and their go.
