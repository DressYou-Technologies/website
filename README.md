# DressYou — website

The dressyou landing page: a curved wall of people in different outfits, how a try-on works on one
phone, the wardrobe, feed and friends, a stylist that answers from your wardrobe, and the store
links. Built with Astro and GSAP into a static `dist/`, served by Vercel.

```sh
npm ci && npm run dev
```

`npm run build && npm test` before every push. See `AGENTS.md` for the layout and rules.

The people and garments on the page are generated placeholders (gpt-image-2.5-sunburst); their
prompts are in `src/assets/manifest.json`. The twin and the garments are transparent WebP cutouts that
the page pads; the street and feed photos are JPEGs that fill their tiles. Manrope and IBM Plex Mono
are self-hosted under their bundled OFL licences.

The phone frame in `src/assets/device/` is Apple's iPhone 18 Pro product bezel (Apple Design
Resources, licence accepted by the founder on 2026-10-30). Apple's marketing guidelines bind it: use
it as is, with nothing overlapping it, no added shadow, and no motion of the device itself; only the
screen content moves.
