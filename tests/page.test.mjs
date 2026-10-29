import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import { SITE } from '../src/data/site.ts';

// Runs over the built site: `npm run build` first.
const DIST = new URL('../dist/', import.meta.url);
const read = (path) => readFile(new URL(path, DIST), 'utf8');
const pages = (await readdir(DIST, { recursive: true })).filter((f) => f.endsWith('.html'));
const html = await read('index.html');
const meta = (attr, key) => html.match(new RegExp(`<meta[^>]*${attr}="${key}"[^>]*content="([^"]*)"`))?.[1];
const decode = (s) => s.replaceAll('&#39;', "'").replaceAll('&amp;', '&');

test('the head carries the site name, tagline, description and canonical', () => {
  assert.ok(decode(html.match(/<title>([^<]*)<\/title>/)[1]).includes(SITE.tagline));
  assert.equal(decode(meta('name', 'description')), SITE.description);
  assert.match(html, /<link rel="canonical" href="https:\/\/dressyouapp\.com\/"/);
  assert.equal(meta('property', 'og:image'), `${SITE.url}/og-image.jpg`);
});

test('the JSON-LD, llms.txt and sitemap agree with the head', async () => {
  const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  const website = graph.find((node) => node['@type'] === 'WebSite');
  assert.equal(website.url, `${SITE.url}/`);
  assert.equal(website.name, 'DressYou');
  assert.equal(website.description, SITE.description);
  const llms = await read('llms.txt');
  assert.ok(llms.includes(`${SITE.url}/`) && llms.includes(SITE.tagline));
  const sitemap = await read('sitemap.xml');
  for (const path of ['/', '/legal', '/privacy', '/terms']) assert.ok(sitemap.includes(`<loc>${SITE.url}${path === '/' ? '/' : path}</loc>`), path);
});

test('every local reference exists', async () => {
  for (const page of pages) {
    const text = await read(page);
    const refs = [...text.matchAll(/(?:src|href)="(\/[^"#?]*)"/g)].map((m) => m[1]);
    for (const [, set] of text.matchAll(/srcset="([^"]+)"/g)) refs.push(...set.split(',').map((s) => s.trim().split(' ')[0]));
    for (const ref of refs.filter((r) => r.startsWith('/') && r !== '/')) {
      const file = ref.endsWith('.html') || ref.includes('.') ? ref : `${ref}.html`;
      await access(new URL(`.${file}`, DIST)).catch(() => assert.fail(`${page}: ${ref} is missing`));
    }
  }
});

test('no third-party origin is loaded', async () => {
  for (const page of pages) {
    const text = await read(page);
    assert.doesNotMatch(text, /<script[^>]+src="https?:/, page);
    assert.doesNotMatch(text, /<link[^>]+rel="stylesheet"[^>]+href="https?:/, page);
  }
  const css = (await readdir(DIST, { recursive: true })).filter((f) => f.endsWith('.css'));
  for (const file of css) assert.doesNotMatch(await read(file), /@import\s+url\(["']?https?:/, file);
});

test('no link is dead', async () => {
  for (const page of pages) assert.doesNotMatch(await read(page), /href="#"/, page);
});

test('every image states its size and alt', async () => {
  for (const page of pages) {
    for (const [img] of (await read(page)).matchAll(/<img\b[^>]*>/g)) {
      assert.match(img, /\swidth="\d+"/, img);
      assert.match(img, /\sheight="\d+"/, img);
      assert.match(img, /\salt="/, img);
    }
  }
});
