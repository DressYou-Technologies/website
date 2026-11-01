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
// A page's built file, from its language and language-neutral path: "/" in French is fr.html, "/legal" is fr/legal.html.
const fileOf = (lang, path) => { const url = localize(lang, path); return url === '/' ? 'index.html' : `${url.slice(1)}.html`; };
const home = Object.fromEntries(await Promise.all(LANGS.map(async (lang) => [lang, await read(fileOf(lang, '/'))])));
const html = home.fr;
const metaIn = (page, attr, key) => page.match(new RegExp(`<meta[^>]*${attr}="${key}"[^>]*content="([^"]*)"`))?.[1];
// &amp; last, so an escaped entity such as &amp;quot; is decoded once, not twice.
const decode = (s) => s.replaceAll('&#39;', "'").replaceAll('&quot;', '"').replaceAll('&amp;', '&');
// The pages in the works stay out of search until they have content.
const INDEXED = ['/', '/privacy'];
const SOON = ['/journal', '/legal', '/terms'];

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
    assert.ok(page.includes(`<link rel="alternate" hreflang="x-default" href="${SITE.url}/"`), `${lang} x-default`);
  }
});

// English is the default (founder, 2026-10-31): English at the root, French under /fr, and the old /en links land at the root.
test('the root is English and French lives under /fr', async () => {
  for (const [file, lang] of [['index.html', 'en'], ['legal.html', 'en'], ['fr.html', 'fr'], ['fr/legal.html', 'fr']]) {
    assert.match(await read(file), new RegExp(`<html lang="${lang}"`), file);
  }
  const { redirects = [] } = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.deepEqual(redirects, [{ source: '/en', destination: '/', permanent: true }, { source: '/en/:path*', destination: '/:path*', permanent: true }]);
});

// The public address is info@ (founder, 2026-11-01, from the content brief), never hello@ or contact@.
test('every page and llms.txt give info@dressyouapp.com, never an old address', async () => {
  for (const name of [...pages, 'llms.txt']) assert.doesNotMatch(await read(name), /hello@|contact@/, name);
  assert.ok((await read('index.html')).includes('mailto:info@dressyouapp.com'));
});

// Tags read as spaces, so words in sibling spans stay apart.
const words = (s) => decode(s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());

// The content brief's wording, word for word (founder, 2026-11-01). French is drafted from it and pinned by its shape.
test('the English home page says the wording the brief validated, and none of the longer lines it replaced', () => {
  const page = words(home.en);
  for (const line of ["Try it on before it's yours.", 'Your Digital Twin. Your style. Your AI stylist.', 'More than virtual try-on.',
    'Your wardrobe. More looks.', 'Add pieces once. Mix and match them on your Digital Twin.',
    'Looks that match your style.', 'Discover pieces worn by people who share your taste.',
    'Get a second opinion.', 'Share a look. See what your friends think.', 'Ask your friends',
    'Fashion, made personal.', 'Discover looks, try them on and shop with confidence.']) assert.ok(page.includes(line), line);
  for (const old of ['Tap try on', 'More than a try-on.', 'Fill your wardrobe.', 'A feed of real people.', 'Wear it first.']) {
    assert.ok(!page.includes(old), `still says "${old}"`);
  }
});

const howOf = (page) => ({
  heads: [...page.matchAll(/<span class="hw"[^>]*>([\s\S]*?)<\/span>/g)].map((m) => words(m[1])),
  steps: [...page.matchAll(/<ol class="hsteps[^"]*"[^>]*>([\s\S]*?)<\/ol>/g)].map((m) => [...m[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((li) => words(li[1]))),
});

test('the phone demo gives each source its own heading and four steps', () => {
  assert.deepEqual(howOf(home.en), {
    heads: ['Try on from your favorite stores.', 'Style your own wardrobe.', 'Discover looks that match your style.'],
    steps: [
      ['01 Choose a piece', '02 Try it on', '03 Check your size', '04 Ask your stylist'],
      ['01 Pick a piece', '02 Try it on', '03 Build a look', '04 Get styling tips'],
      ['01 Find a look', '02 Try it on', '03 Explore pieces', '04 Get inspired'],
    ],
  });
  const fr = howOf(home.fr);
  assert.equal(fr.heads.length, 3);
  assert.deepEqual(fr.steps.map((list) => list.map((step) => step.slice(0, 2))), Array(3).fill(['01', '02', '03', '04']));
});

// The stylist speaks cleanly: every line it says or ticks off opens with a capital (founder, 2026-10-31).
test("the stylist's lines open with a capital letter, in each language", () => {
  for (const lang of LANGS) {
    const { stylist: s, how } = COPY[lang], tabs = [s.opinion, s.day, s.trip, s.find, s.buy];
    const lines = [s.opinion.a, s.day.a, s.trip.head, s.trip.a, s.find.fit, s.buy.a, ...how.scenes.map((scene) => scene.a),
      ...tabs.flatMap((tab) => tab.checks.flatMap(([, label, value]) => [label, value]))];
    for (const line of lines) assert.match(line, /^[\p{Lu}\d€]/u, `${lang}: "${line}"`);
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
  assert.doesNotMatch(sitemap, /notified|404|journal|legal|terms/);
  assert.doesNotMatch(llms, /\/(journal|legal|terms)\b/, 'llms.txt lists a page in the works');
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

// Tags out, repeated until none is left, so a tag hidden inside another cannot survive.
const text = (s) => {
  let out = s, previous;
  do { previous = out; out = out.replace(/<[^>]*>/g, ''); } while (out !== previous);
  return out.replace(/\s+/g, ' ').trim();
};

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
      ['info@dressyouapp.com', 'mailto:info@dressyouapp.com'],
    ]);
    const words = decode(text(footer));
    for (const fact of [`© ${new Date().getFullYear()} DressYou Technologies`, '47 rue Vivienne, 75002 Paris']) assert.ok(words.includes(fact), `${lang}: ${fact}`);
    assert.match(footer, /<form class="notify[^"]*"[^>]*data-lang="/, `${lang}: the footer asks for an email itself`);
    assert.doesNotMatch(footer, /<picture|<img(?![^>]*alt="DressYou")/, `${lang}: the footer shows no picture besides the logo`);
  }
});

// The footer keeps the four routes the content brief names (founder, 2026-11-01).
test('the footer links Journal, the legal notice, privacy and terms to their pages', () => {
  const want = {
    en: [['Journal', '/journal'], ['Legal notice', '/legal'], ['Privacy', '/privacy'], ['Terms', '/terms']],
    fr: [['Journal', '/fr/journal'], ['Mentions légales', '/fr/legal'], ['Confidentialité', '/fr/privacy'], ['Conditions', '/fr/terms']],
  };
  for (const lang of LANGS) {
    const nav = home[lang].match(/<nav class="cols"[\s\S]*?<\/nav>/)[0];
    const links = [...nav.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(([, href, label]) => [words(label), href]);
    assert.deepEqual(links.slice(0, 4), want[lang], lang);
  }
});

// Only finished pages are linked (founder, 2026-10-31): the company pages wait, so the menu keeps the other language.
test('the header logo goes home, and the menu offers the other language with no page in the works', async () => {
  for (const lang of LANGS) {
    const header = home[lang].match(/<header[\s\S]*?<\/header>/)[0], other = LANGS.find((l) => l !== lang);
    const brand = header.match(/<a class="brand"[\s\S]*?<\/a>/)?.[0] ?? '';
    assert.match(brand, new RegExp(`^<a class="brand"[^>]*href="${localize(lang, '/')}"[^>]*aria-label="DressYou"`), `${lang}: the logo is not a link home`);
    // The white logo and the black one, crossfaded as the menu button changes colour.
    assert.deepEqual([...brand.matchAll(/<img[^>]*src="[^"]*\/(logo-(?:white|black))[^"]*"/g)].map((m) => m[1]), ['logo-white', 'logo-black'], lang);
    assert.match(header, /<button[^>]*popovertarget="menu"/, `${lang}: no menu button`);
    const menu = header.slice(header.indexOf('id="menu"'));
    const links = [...menu.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(([, href, label]) => [decode(text(label)), href]);
    assert.deepEqual(links, [[other.toUpperCase(), localize(other, '/')]], lang);
    for (const path of ['/about', '/careers', '/press', '/help']) {
      await assert.rejects(access(new URL(fileOf(lang, path), DIST)), `${lang} ${path} is still built`);
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

// Until the final legal texts arrive, Journal, the legal notice and the terms all say the same thing, word for word, and
// show no draft legal text (founder, 2026-11-01). Privacy keeps its notice: the sign-up links to it.
test('Journal, the legal notice and the terms show one coming-soon message, the address and the way home', async () => {
  const want = {
    en: { message: ['In the works', 'This page is coming soon. Write to info@dressyouapp.com.', 'Back to DressYou'], home: '/', titles: ['Journal', 'Legal notice', 'Terms'] },
    fr: { message: ['En préparation', 'Cette page arrive bientôt. Écrivez à info@dressyouapp.com.', 'Retour à DressYou'], home: '/fr', titles: ['Journal', 'Mentions légales', 'Conditions'] },
  };
  for (const lang of LANGS) {
    for (const [k, path] of SOON.entries()) {
      const body = await read(fileOf(lang, path)), article = body.match(/<article class="doc[\s\S]*?<\/article>/)?.[0] ?? '';
      assert.match(body, new RegExp(`<html lang="${lang}"`), `${lang} ${path}`);
      assert.equal(words(body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1]), want[lang].titles[k], `${lang} ${path}: its own title`);
      assert.deepEqual([...article.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => decode(text(m[1]))), want[lang].message, `${lang} ${path}`);
      assert.doesNotMatch(article, /<h2|<ul/, `${lang} ${path} still shows a draft`);
      assert.match(article, /<a href="mailto:info@dressyouapp\.com"[^>]*>info@dressyouapp\.com<\/a>/, `${lang} ${path}: the address is a mail link`);
      assert.match(article, new RegExp(`<a href="${want[lang].home}"[^>]*>${want[lang].message[2]}</a>`), `${lang} ${path}: the way home`);
      assert.match(body, /<meta name="robots" content="noindex"/, `${lang} ${path} is in search`);
    }
    const privacy = await read(fileOf(lang, '/privacy'));
    assert.match(privacy, /<footer class="finale/, `${lang} privacy has no footer`);
    assert.ok(text(privacy).length > 600 && text(privacy).includes('Brevo'), `${lang} privacy lost its notice`);
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
  for (const file of ['notified.html', 'fr/notified.html', '404.html']) {
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
  // Every file stays same-site except the email images, which mail apps load from elsewhere.
  assert.equal(all['cross-origin-resource-policy'], undefined, 'not set on every path, so the email images can differ');
  assert.equal(headersFor('/((?!email/).*)')['cross-origin-resource-policy'], 'same-site');
  assert.equal(headersFor('/email/(.*)')['cross-origin-resource-policy'], 'cross-origin');
  assert.match(all['permissions-policy'] ?? '', /camera=\(\)/);
  assert.match(headersFor('/_astro/(.*)')['cache-control'] ?? '', /max-age=31536000, immutable/);
});
