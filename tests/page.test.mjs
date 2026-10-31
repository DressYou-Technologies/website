import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import { SITE } from '../src/data/site.ts';
import { COPY } from '../src/i18n/copy.ts';
import { LANGS, localize } from '../src/i18n/lang.ts';

// Runs over the built site: `npm run build` first.
const DIST = new URL('../dist/', import.meta.url);
const read = (path) => readFile(new URL(path, DIST), 'utf8');
const pages = (await readdir(DIST, { recursive: true })).filter((f) => f.endsWith('.html'));
// A page's built file, from its language and language-neutral path: "/" in English is en.html, "/legal" is en/legal.html.
const fileOf = (lang, path) => { const url = localize(lang, path); return url === '/' ? 'index.html' : `${url.slice(1)}.html`; };
const home = Object.fromEntries(await Promise.all(LANGS.map(async (lang) => [lang, await read(fileOf(lang, '/'))])));
const html = home.fr;
const metaIn = (page, attr, key) => page.match(new RegExp(`<meta[^>]*${attr}="${key}"[^>]*content="([^"]*)"`))?.[1];
// &amp; last, so an escaped entity such as &amp;quot; is decoded once, not twice.
const decode = (s) => s.replaceAll('&#39;', "'").replaceAll('&quot;', '"').replaceAll('&amp;', '&');
const INDEXED = ['/', '/legal', '/privacy', '/terms'];

test('each home page carries its language, title, description, canonical and alternates', () => {
  for (const lang of LANGS) {
    const page = home[lang], meta = COPY[lang].meta;
    assert.match(page, new RegExp(`<html lang="${lang}"`));
    assert.equal(decode(page.match(/<title>([^<]*)<\/title>/)[1]), meta.title);
    assert.equal(decode(metaIn(page, 'name', 'description')), meta.description);
    assert.equal(metaIn(page, 'property', 'og:locale'), meta.locale);
    assert.equal(metaIn(page, 'property', 'og:image'), `${SITE.url}/og-image.jpg`);
    assert.ok(page.includes(`<link rel="canonical" href="${SITE.url}${localize(lang, '/')}"`), `${lang} canonical`);
    for (const alt of LANGS) assert.ok(page.includes(`<link rel="alternate" hreflang="${alt}" href="${SITE.url}${localize(alt, '/')}"`), `${lang} → ${alt}`);
    assert.ok(page.includes(`<link rel="alternate" hreflang="x-default" href="${SITE.url}/en"`), `${lang} x-default`);
  }
});

test('the JSON-LD, llms.txt and sitemap agree with the pages', async () => {
  for (const lang of LANGS) {
    const graph = JSON.parse(home[lang].match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
    const website = graph.find((node) => node['@type'] === 'WebSite'), webpage = graph.find((node) => node['@type'] === 'WebPage');
    assert.equal(website.url, `${SITE.url}/`);
    assert.equal(website.name, 'DressYou');
    assert.deepEqual(website.inLanguage, [...LANGS]);
    assert.equal(webpage.inLanguage, lang);
    assert.equal(webpage.description, COPY[lang].meta.description);
  }
  const llms = await read('llms.txt');
  for (const lang of LANGS) assert.ok(llms.includes(`${SITE.url}${localize(lang, '/')}`), `llms.txt names the ${lang} home`);
  const sitemap = await read('sitemap.xml');
  for (const path of INDEXED) for (const lang of LANGS) {
    assert.ok(sitemap.includes(`<loc>${SITE.url}${localize(lang, path)}</loc>`), `${lang} ${path}`);
    await access(new URL(fileOf(lang, path), DIST)).catch(() => assert.fail(`${lang} ${path} is in the sitemap but not built`));
  }
  assert.doesNotMatch(sitemap, /notified|404/);
});

// Founder, 2026-10-30: no semicolons or em dashes in what people read. Plus the search plan's copy rules.
const BANNED = [[';', 'a semicolon'], ['\u2014', 'an em dash'], ['avatar', 'avatar (it is your twin)'], ['see how it fits', 'a fit claim'], ['ça vous va', 'a fit claim'], ['ça me va', 'a fit claim'],
  // A size comes from clothes the person kept, never from habit (§4.5), and the stylist never checks out (§2, §4.9).
  ['usual size', 'a size from habit'], ['taille habituelle', 'a size from habit'], ['true fit', 'not product vocabulary'], ['taille juste', 'not product vocabulary'],
  // The site shows what the stylist knows that answers a question, never how it tracks behaviour (founder, 2026-10-30).
  // No mention that the site's images are generated (founder, 2026-10-30): legal pages call them illustrations.
  ['AI-generated', 'an AI mention'], ['générées par IA', 'an AI mention'], ['générés par IA', 'an AI mention'],
  ['×', 'a wear count'], ['times this', 'a wear count'], ['fois cet', 'a wear count'],
  ['checks out for you', 'a checkout claim'], ['passe commande pour vous', 'a checkout claim'], ['size down', 'fit advice'], ['taille en dessous', 'fit advice']];
const readable = (page) => [
  page.replace(/<script(?![^>]*ld\+json)[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' '),
  ...[...page.matchAll(/<(?:meta|img)\b[^>]*(?:content|alt)="([^"]*)"/g)].map((m) => m[1]),
].map(decode).join('\n');

test('no page, title, description or llms.txt breaks the copy rules', async () => {
  const sources = [...await Promise.all(pages.map(async (page) => [page, readable(await read(page))])), ['llms.txt', await read('llms.txt')]];
  for (const [name, body] of sources) for (const [bad, what] of BANNED) {
    const at = body.toLowerCase().indexOf(bad);
    assert.equal(at, -1, `${name} has ${what}: …${body.slice(Math.max(0, at - 40), at + 20)}…`);
  }
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

// Tags out, then any stray angle bracket a malformed tag could leave.
const text = (s) => s.replace(/<[^>]+>/g, '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();

test('a null store link opens a dialog instead of linking, in each language', async () => {
  const { LINKS } = await import('../src/data/site.ts');
  assert.equal(LINKS.appUrl, null);
  assert.equal(LINKS.extensionUrl, null);
  for (const lang of LANGS) {
    for (const [label, kind] of [[COPY[lang].get.app, 'app'], [COPY[lang].get.extension, 'extension']]) {
      const controls = [...home[lang].matchAll(/<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/g)].filter((m) => decode(text(m[3])) === label);
      assert.ok(controls.length >= 2, `${lang}: ${label} appears ${controls.length} times`);
      for (const [, tag, attrs] of controls) {
        assert.equal(tag, 'button', `${label} is a link`);
        assert.match(attrs, new RegExp(`data-get="${kind}"`));
      }
      assert.ok(home[lang].match(new RegExp(`<dialog[^>]*id="get-${kind}"`)), `no dialog for ${kind}`);
    }
  }
});

const dialogOf = (lang, kind) => home[lang].match(new RegExp(`<dialog[^>]*id="get-${kind}"[^>]*>([\\s\\S]*?)</dialog>`))[1];

test('without a store link the app dialog asks for an email to notify', () => {
  for (const lang of LANGS) {
    const dialog = dialogOf(lang, 'app'), t = COPY[lang].dialog;
    assert.match(dialog, /<input[^>]*type="email"[^>]*name="email"[^>]*required/);
    // The bot trap: out of reach for people and assistive tech, filled by bots.
    assert.match(dialog, /<input[^>]*name="website"[^>]*tabindex="-1"[^>]*aria-hidden="true"/);
    assert.ok(dialog.includes(`>${t.notify.submit}</button>`), `${lang} submit`);
    assert.ok(dialog.includes(`href="${localize(lang, '/privacy')}"`), `${lang} privacy link`);
    assert.ok(dialog.includes(`data-lang="${lang}"`));
  }
});

test('the friends card asks with its button, offers every friend, and each round shows its looks, the friends asked and their pick', async () => {
  const { FRIENDS, FRIEND_ROUNDS } = await import('../src/data/site.ts');
  const names = (html, row) => [...html.matchAll(new RegExp(`<li class="${row}"[\\s\\S]*?<\\/li>`, 'g'))].map((m) => m[0]);
  for (const lang of LANGS) {
    const card = home[lang].match(/<article class="card friend[\s\S]*?<\/article>/)[0];
    assert.ok(decode(text(card.match(/<span class="fsend[\s\S]*?<\/span>/)?.[0] ?? '')).includes(COPY[lang].more.friend.ask), `${lang}: the ask button`);
    const offered = names(card.match(/<ul class="fpicker[\s\S]*?<\/ul>/)?.[0] ?? '', 'fp');
    assert.deepEqual(offered.map((row) => decode(text(row))), FRIENDS.map((f) => f.name), `${lang}: every friend can be picked`);
    for (const row of offered) assert.match(row, /<img[^>]*src="[^"]*friend-/, `${lang}: each friend has a photo`);
    const rounds = card.split('class="fround').slice(1);
    assert.equal(rounds.length, FRIEND_ROUNDS.length, lang);
    FRIEND_ROUNDS.forEach(({ looks, picked, asked, votes }, r) => {
      const who = card.match(new RegExp(`<ul class="fwho[^"]*"[^>]*data-round="${r}"[\\s\\S]*?<\\/ul>`))?.[0] ?? '';
      assert.deepEqual(names(who, 'fw').map((row) => decode(text(row.replace(/<span class="fwait[\s\S]*?<\/span>/, '')))), asked.map((f) => FRIENDS[f].name), `${lang} round ${r}: the friends asked`);
      const round = rounds[r];
      assert.equal((round.match(/class="fthumb/g) ?? []).length, looks.length, `${lang} round ${r}: every look to pick from`);
      const opts = round.split('class="fopt').slice(1);
      assert.equal(opts.length, 2, `${lang} round ${r}: the two picked`);
      const winner = votes.filter((v) => v === 1).length * 2 > votes.length ? 1 : 0;
      assert.match(opts[winner], /class="fimg fwin/, `${lang} round ${r}: the friends' pick`);
      assert.doesNotMatch(opts[1 - winner], /fwin/, `${lang} round ${r}: only one pick`);
      assert.ok(opts[winner].includes(`/${looks[picked[winner]]}.`), `${lang} round ${r}: the pick shows its look`);
    });
  }
});

test('a size card shows the sizes, the one that fits marked with a ruler and the one to taste with a heart, as the app does', () => {
  for (const lang of LANGS) {
    const t = COPY[lang].how, cards = home[lang].match(/<div class="hsz size[\s\S]*?<\/div>/g) ?? [];
    const sized = t.scenes.filter((scene) => scene.kind === 'size');
    assert.ok(sized.length >= 2, `${lang}: the shop and feed scenes give a size`);
    assert.equal(cards.length, sized.length, `${lang}: one card per size scene`);
    cards.forEach((card, k) => {
      const { sizes, fit, style } = sized[k];
      assert.deepEqual([...card.matchAll(/class="szc[^"]*"[^>]*>([^<]+)</g)].map((m) => m[1]), sizes, `${lang} card ${k}: the sizes`);
      assert.match(card, new RegExp(`class="szc fit"[^>]*>${fit}<`), `${lang} card ${k}: ${fit} is the fit`);
      assert.match(card, new RegExp(`class="szc style"[^>]*>${style}<`), `${lang} card ${k}: ${style} is to taste`);
      assert.ok(text(card).includes(`${fit} ${t.sizeCard.fit}`) && text(card).includes(`${style} ${t.sizeCard.style}`), `${lang} card ${k}: the two lines`);
      assert.match(card, /class="sztag fit[\s\S]*?<svg/, `${lang} card ${k}: the ruler`);
      assert.match(card, /class="sztag style[\s\S]*?<svg/, `${lang} card ${k}: the heart`);
    });
  }
});

test('the sign-up answer shows below the email field and its button, never inside them', () => {
  for (const lang of LANGS) {
    for (const form of home[lang].match(/<form class="notify[\s\S]*?<\/form>/g)) {
      const row = form.match(/<div class="row"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';
      assert.match(row, /type="email"/, `${lang}: the field is in the row`);
      assert.match(row, /type="submit"/, `${lang}: the button is in the row`);
      assert.doesNotMatch(row, /class="status/, `${lang}: the answer is inside the row`);
      assert.ok(form.indexOf('class="status') > form.indexOf(row), `${lang}: the answer comes after the row`);
    }
  }
});

test('without a store link the extension dialog shows its demo and no link out', () => {
  for (const lang of LANGS) {
    const dialog = dialogOf(lang, 'extension');
    assert.match(dialog, /class="xdemo"/);
    assert.ok(text(dialog).includes(COPY[lang].dialog.extension.soon));
    assert.doesNotMatch(dialog, /chromewebstore/);
  }
});

test('the footer lists only working links, the other language and the company details', () => {
  for (const lang of LANGS) {
    const footer = home[lang].match(/<footer[\s\S]*?<\/footer>/)[0], t = COPY[lang], other = LANGS.find((l) => l !== lang);
    const links = [...footer.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(([, href, label]) => [decode(text(label)), href]);
    const local = (link) => { const [page, hash] = link.split('#'); return localize(lang, page || '/') + (hash ? `#${hash}` : ''); };
    assert.deepEqual(links, [
      [t.dialog.notify.privacy, localize(lang, '/privacy')],
      ...t.finale.columns.flatMap((column) => column.links.map(([label, link]) => [label, local(link)])),
      [t.lang.switchTo, localize(other, '/')],
      ['hello@dressyouapp.com', 'mailto:hello@dressyouapp.com'],
    ]);
    const words = decode(text(footer));
    for (const fact of [`© ${new Date().getFullYear()} DressYou Technologies`, '47 rue Vivienne, 75002 Paris']) assert.ok(words.includes(fact), `${lang}: ${fact}`);
    assert.match(footer, /<form class="notify[^"]*"[^>]*data-lang="/, `${lang}: the footer asks for an email itself`);
    assert.doesNotMatch(footer, /<picture|<img(?![^>]*alt="DressYou")/, `${lang}: the footer shows no picture besides the logo`);
  }
});

test('the header menu opens the company pages and the other language, and each company page is in the works and out of search', async () => {
  const sitemap = await read('sitemap.xml');
  for (const lang of LANGS) {
    const header = home[lang].match(/<header[\s\S]*?<\/header>/)[0], t = COPY[lang], other = LANGS.find((l) => l !== lang);
    assert.match(header, /<button[^>]*popovertarget="menu"/, `${lang}: no menu button`);
    const menu = header.slice(header.indexOf('id="menu"'));
    assert.match(header, /id="menu"[^>]*popover/, `${lang}: the menu is not a popover`);
    const links = [...menu.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(([, href, label]) => [decode(text(label)), href]);
    assert.deepEqual(links, [...t.menu.links.map(([label, path]) => [label, localize(lang, path)]), [other.toUpperCase(), localize(other, '/')]]);
    for (const [label, path] of t.menu.links) {
      const body = await read(fileOf(lang, path));
      assert.match(body, /<meta name="robots" content="noindex"/, `${lang} ${path}`);
      assert.doesNotMatch(body, /rel="canonical"/, `${lang} ${path}`);
      assert.ok(decode(text(body)).includes(label) && decode(text(body)).includes(t.soon.tag), `${lang} ${path} is not the page in the works`);
      assert.ok(!sitemap.includes(`${SITE.url}${localize(lang, path)}<`), `${lang} ${path} is in the sitemap`);
    }
  }
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

test('the legal pages exist in both languages and name the publisher', async () => {
  for (const lang of LANGS) {
    const legal = text(await read(fileOf(lang, '/legal')));
    for (const fact of ['DressYou Technologies', '47 rue Vivienne, 75002 Paris', 'hello@dressyouapp.com', 'Vercel']) assert.ok(legal.includes(fact), `${lang}: ${fact}`);
    for (const path of ['/privacy', '/terms']) {
      const body = await read(fileOf(lang, path));
      assert.match(body, new RegExp(`<html lang="${lang}"`));
      assert.match(body, /<header class="top/, `${lang} ${path} has no header`);
      assert.match(body, /<footer class="finale/, `${lang} ${path} has no footer`);
      assert.ok(text(body).length > 600, `${lang} ${path} is still a stub`);
    }
  }
});

test('each stylist answer first shows what it checked, in each language', () => {
  for (const lang of LANGS) {
    const t = COPY[lang].stylist, groups = home[lang].split('<div class="sg"').slice(1);
    const tabs = [t.opinion, t.day, t.trip, t.find, t.buy];
    assert.equal(groups.length, tabs.length, lang);
    groups.forEach((group, k) => {
      const card = group.match(/<div class="sck[\s\S]*?<\/div>/)?.[0] ?? '';
      assert.ok(group.indexOf('class="sck') < group.indexOf('class="sin'), `${lang} tab ${k}: the answer comes before the checks`);
      const rows = [...card.matchAll(/class="ck-label"[^>]*>([^<]*)<\/span><span class="ck-value"[^>]*>([^<]*)</g)].map(([, label, value]) => [decode(label), decode(value)]);
      assert.ok(rows.length >= 3, `${lang} tab ${k} checks ${rows.length} things`);
      assert.deepEqual(rows, tabs[k].checks.map(([, label, value]) => [label, value]), `${lang} tab ${k}`);
    });
  }
});

test('every dark section says so, for the menu button to take a colour that reads on it', async () => {
  for (const lang of LANGS) {
    for (const marker of ['class="band"', 'class="more"', 'class="finale"']) {
      assert.match(home[lang], new RegExp(`<[a-z]+ ${marker}[^>]*data-tone="dark"`), `${lang}: ${marker}`);
    }
    assert.match(await read(fileOf(lang, '/legal')), /<section class="band"[^>]*data-tone="dark"/, `${lang}: the legal page's band`);
  }
});

test('the confirmation and 404 pages stay out of search', async () => {
  for (const file of ['notified.html', 'en/notified.html', '404.html']) {
    const body = await read(file);
    assert.match(body, /<meta name="robots" content="noindex"/, file);
    assert.doesNotMatch(body, /rel="canonical"/, file);
  }
});

test('every blur ships unprefixed for Chrome and Firefox and prefixed for Safari before 18', async () => {
  const css = (await Promise.all((await readdir(new URL('_astro/', DIST))).filter((f) => f.endsWith('.css')).map((f) => read(`_astro/${f}`)))).join('');
  const rules = css.match(/[^{}]*\{[^{}]*backdrop-filter[^{}]*\}/g) ?? [];
  assert.ok(rules.length >= 4, 'header, dialog, look card and scan chip blur');
  for (const rule of rules) {
    assert.match(rule, /(?:^|[{;])backdrop-filter:/, rule.slice(0, 80));
    assert.match(rule, /-webkit-backdrop-filter:/, rule.slice(0, 80));
  }
});

test('vercel.json hardens every response and caches the hashed files for good', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  const headersFor = (source) => Object.fromEntries((config.headers.find((h) => h.source === source)?.headers ?? []).map((h) => [h.key.toLowerCase(), h.value]));
  const all = headersFor('/(.*)');
  const csp = all['content-security-policy'] ?? '';
  for (const directive of ["default-src 'self'", "script-src 'self'", "frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'self'"]) assert.ok(csp.includes(directive), directive);
  assert.equal(all['x-content-type-options'], 'nosniff');
  assert.equal(all['referrer-policy'], 'strict-origin-when-cross-origin');
  assert.equal(all['cross-origin-resource-policy'], 'same-site');
  assert.match(all['permissions-policy'] ?? '', /camera=\(\)/);
  assert.match(headersFor('/_astro/(.*)')['cache-control'] ?? '', /max-age=31536000, immutable/);
});
