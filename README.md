# DressYou — Coming soon

Standalone static site. Light rays fall from the top of the page and lean toward the pointer. Under them, the dressyou mark and name lead the page. Beneath it, smaller, brackets frame “the new way to experience”, then “fashion”, blurring the other part. A small, tilted “coming soon” strip drifts slowly near the bottom and can be grabbed and flung. Reduced-motion preferences show all of it still.

Run `python3 -m http.server 4173 --bind 127.0.0.1 --directory dist`.

Check `node --test tests/*.test.mjs` and `node --check dist/app.mjs`.

The effects live in `dist/light-rays.mjs`, `dist/true-focus.mjs` and `dist/scroll-velocity.mjs`, dependency-free ports of React Bits components under their bundled license; its tuning lives in `dist/app.mjs`. No dependencies or build step. Manrope is self-hosted under its bundled OFL license. The white logo is a transparent WebP. Because the mark is white, every favicon carries a black plate so it stays visible in light-theme tabs and in search results; `icon-*.png`, `favicon.ico`, `apple-touch-icon.png` and `og-image.jpg` are generated from that mark. Crawler files live beside the page: `robots.txt`, `sitemap.xml`, `site.webmanifest` and `llms.txt`.
