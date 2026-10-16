# DressYou — Coming soon

Standalone static site. Light rays fall from the top of the page and lean toward the pointer. The dressyou lockup (symbol and name) sits in them as a 1-bit dither above a small “coming soon”; the pointer burns through it to the smooth original, which knits back cell by cell, and a click sends a ring outward. On touch screens the reveal drifts on its own. Reduced-motion preferences show the plain lockup under frozen rays; browsers without WebGL2 show it on black.

Run `python3 -m http.server 4173 --bind 127.0.0.1 --directory dist`.

Check `node --test tests/*.test.mjs` and `node --check dist/app.mjs`.

The effects live in `dist/dither-veil.mjs` and `dist/light-rays.mjs`, dependency-free ports of React Bits' DitherVeil and LightRays under their bundled license; its tuning lives in `dist/app.mjs`. No dependencies or build step. Manrope, for “coming soon”, is self-hosted under its bundled OFL license. The white logo is a transparent WebP. Because the mark is white, every favicon carries a black plate so it stays visible in light-theme tabs and in search results; `icon-*.png`, `favicon.ico`, `apple-touch-icon.png` and `og-image.jpg` are generated from that mark. Crawler files live beside the page: `robots.txt`, `sitemap.xml`, `site.webmanifest` and `llms.txt`.
