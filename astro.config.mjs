import { defineConfig } from 'astro/config';

// Vite's own default browser list; Astro builds for esnext, which leaves the CSS minifier without the Safari prefixes.
const BROWSERS = ['chrome111', 'edge111', 'firefox114', 'safari16.4', 'ios16.4'];

// Static output to dist/, which Vercel serves. Pages build to /legal.html etc. and are linked without the extension.
export default defineConfig({
  site: 'https://dressyouapp.com',
  output: 'static',
  outDir: 'dist',
  trailingSlash: 'never',
  build: { format: 'file' },
  vite: { build: { cssTarget: BROWSERS } },
});
