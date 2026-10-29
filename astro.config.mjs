import { defineConfig } from 'astro/config';

// Static output to dist/, which Vercel serves. Pages build to /legal.html etc. and are linked without the extension.
export default defineConfig({
  site: 'https://dressyouapp.com',
  output: 'static',
  outDir: 'dist',
  trailingSlash: 'never',
  build: { format: 'file' },
});
