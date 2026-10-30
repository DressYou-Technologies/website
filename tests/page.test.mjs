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
      assert.match(img, /\salt(="|[\s>])/, img); // Astro writes an empty alt as a bare attribute
    }
  }
});

const text = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

test('a null store link opens a dialog instead of linking', async () => {
  const { LINKS } = await import('../src/data/site.ts');
  assert.equal(LINKS.appUrl, null);
  assert.equal(LINKS.extensionUrl, null);
  for (const [label, kind] of [['Get the app', 'app'], ['Get the extension', 'extension']]) {
    const controls = [...html.matchAll(/<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/g)].filter((m) => text(m[3]) === label);
    assert.ok(controls.length >= 2, `${label} appears ${controls.length} times`);
    for (const [, tag, attrs] of controls) {
      assert.equal(tag, 'button', `${label} is a link`);
      assert.match(attrs, new RegExp(`data-get="${kind}"`));
    }
    const dialog = html.match(new RegExp(`<dialog[^>]*id="get-${kind}"[^>]*>([\\s\\S]*?)</dialog>`));
    assert.ok(dialog, `no dialog for ${kind}`);
    assert.ok(text(dialog[1]).includes('coming soon.'));
  }
});

test('the footer lists only working links and the AI line', () => {
  const footer = html.match(/<footer[\s\S]*?<\/footer>/)[0];
  const links = [...footer.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(([, href, label]) => [text(label), href]);
  assert.deepEqual(links, [
    ['hello@dressyouapp.com', 'mailto:hello@dressyouapp.com'],
    ['How it works', '/#how'], ['Wardrobe', '/#more'], ['Stylist', '/#stylist'],
    ['Legal notice', '/legal'], ['Privacy', '/privacy'], ['Terms', '/terms'],
  ]);
  assert.ok(text(footer).includes('People shown on this page are AI-generated.'));
});

test("the outfit result shows the outfit's render", async () => {
  const { OUTFITS } = await import('../src/data/site.ts');
  const out = html.match(/<div class="wout[^"]*"[\s\S]*?<\/div>\s*<\/div>/)?.[0] ?? '';
  const pictures = [...out.matchAll(/<picture([^>]*)>[\s\S]*?<img[^>]*src="([^"]+)"/g)].map(([, attrs, src]) => ({ attrs, src }));
  assert.deepEqual(pictures.map(({ attrs }) => Number(attrs.match(/data-outfit="(\d+)"/)?.[1])), OUTFITS.map((_, i) => i));
  pictures.forEach(({ src }, i) => assert.ok(src.includes(`/${OUTFITS[i].render}.`), `outfit ${i} shows ${src}`));
  assert.match(pictures[0].attrs, /class="[^"]*\bshown\b/, 'the first outfit is the one shown without motion');
  assert.doesNotMatch(pictures.slice(1).map(({ attrs }) => attrs).join(' '), /\bshown\b/);
});

test('every in-page link has its target on the same page', async () => {
  for (const page of pages) {
    const body = await read(page);
    const ids = new Set([...body.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    for (const [, id] of body.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(id), `${page}: #${id} has no target`);
  }
});

test('the legal pages exist and name the publisher', async () => {
  const legal = text(await read('legal.html'));
  for (const fact of ['DressYou Technologies', '47 rue Vivienne, 75002 Paris', 'hello@dressyouapp.com', 'Vercel']) assert.ok(legal.includes(fact), fact);
  for (const page of ['privacy.html', 'terms.html']) {
    const body = await read(page);
    assert.match(body, /<header class="top/, `${page} has no header`);
    assert.match(body, /<footer class="finale/, `${page} has no footer`);
    assert.ok(text(body).length > 600, `${page} is still a stub`);
  }
});
