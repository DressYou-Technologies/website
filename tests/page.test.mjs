import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import { SITE } from '../src/data/site.ts';
import { COPY } from '../src/i18n/copy.ts';
import { LANGS, localize } from '../src/i18n/lang.ts';
import { FULL_MENU_QUERY, SHORT_QUERY, WIDE_QUERY } from '../src/lib/constants.ts';

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
const INDEXED = ['/', '/legal', '/privacy'];
// The pages that had no content yet are gone until they have some (founder, 2026-11-16).
const REMOVED = ['/journal', '/terms'];

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

// The content brief's wording (founder, 2026-11-01), in lowercase with the app's word for a piece (founder, 2026-11-17).
// French is drafted from it and pinned by its shape.
test('the English home page says the wording the brief validated, and none of the longer lines it replaced', () => {
  const page = words(home.en);
  for (const line of ['try it on before it’s yours.', 'your digital twin. your style. your AI stylist.', 'more than virtual try-on.',
    'your wardrobe. more looks.', 'add items once. mix and match them on your digital twin.',
    'looks that match your style.', 'discover items worn by people who share your taste.',
    'get a second opinion.', 'share a look. see what your friends think.', 'ask your friends']) assert.ok(page.includes(line), line);
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
    heads: ['try on from your favorite stores.', 'style your own wardrobe.', 'discover looks that match your style.'],
    steps: [
      ['01 choose an item', '02 try it on', '03 check your size', '04 ask your stylist'],
      ['01 pick an item', '02 try it on', '03 build a look', '04 get styling tips'],
      ['01 find a look', '02 try it on', '03 explore items', '04 get inspired'],
    ],
  });
  const fr = howOf(home.fr);
  assert.equal(fr.heads.length, 3);
  assert.deepEqual(fr.steps.map((list) => list.map((step) => step.slice(0, 2))), Array(3).fill(['01', '02', '03', '04']));
});

// The stylist speaks cleanly: every line it says or ticks off opens with a capital (founder, 2026-10-31).
const stylistLines = (lang) => {
  const { stylist: s, how } = COPY[lang], tabs = [s.opinion, s.day, s.trip, s.find, s.buy];
  return [s.opinion.a, s.day.a, s.trip.head, s.trip.a, s.find.fit, s.buy.a, ...how.scenes.map((scene) => scene.a),
    ...tabs.flatMap((tab) => tab.checks.map(([, line]) => line))];
};
test("the stylist's lines open with a capital letter, in each language", () => {
  for (const lang of LANGS) for (const line of stylistLines(lang)) assert.match(line, /^[\p{Lu}\d€]/u, `${lang}: "${line}"`);
});

// Every string of the copy with its path, and the ones the site does not word itself: shops' and Safari's own screens.
const leaves = (node, path = '') => typeof node === 'string' ? [[path, node]] : Object.entries(node).flatMap(([key, value]) => leaves(value, path ? `${path}.${key}` : key));
const THEIR_WORDS = /^how\.(shops|safari)\b/;

// Everything but the stylist's lines is lowercase like the app, names apart (founder, 2026-11-17). Search titles, size
// letters and the document pages keep their capitals.
const OWN_CASE = /^(meta|doc|notFound|verified)\b|^how\.scenes\.\d+\.(sizes|fit|style)\b/;
const NAMES = /\b(DressYou|AI|IA|Chrome|Les Deux|Benetton|QR|English)\b/g;
test('the site writes in lowercase like the app, apart from what the stylist says', () => {
  for (const lang of LANGS) {
    const said = new Set(stylistLines(lang));
    for (const [path, line] of leaves(COPY[lang])) {
      if (THEIR_WORDS.test(path) || OWN_CASE.test(path) || said.has(line)) continue;
      assert.doesNotMatch(line.replace(NAMES, ''), /\p{Lu}/u, `${lang} ${path}: "${line}"`);
    }
  }
});

// The app's words (founder, 2026-11-16): French says tu, the wardrobe is the dressing, a piece is an item, an article or
// a vêtement. The legal pages keep vous.
const OLD_WORDS = { en: /\b(pieces?|garments?|closet)\b/i, fr: /\b(vous|votre|vos|pièces?|garde-robe|mensurations)\b/i };
test('the site uses the words the app uses', async () => {
  for (const lang of LANGS) {
    for (const [path, line] of leaves(COPY[lang])) if (!THEIR_WORDS.test(path)) assert.doesNotMatch(line, OLD_WORDS[lang], `${lang} ${path}`);
    assert.doesNotMatch(words(await read(fileOf(lang, '/notified'))), OLD_WORDS[lang], `${lang}: the confirmation page`);
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
  for (const lang of LANGS) assert.ok(llms.includes(COPY[lang].meta.description), `llms.txt words the ${lang} pitch its own way`);
  assert.equal(JSON.parse(await read('site.webmanifest')).description, COPY.en.meta.description, 'the manifest words the pitch its own way');
  for (const lang of LANGS) assert.ok(llms.includes(`${SITE.url}${localize(lang, '/')}`), `llms.txt names the ${lang} home`);
  const sitemap = await read('sitemap.xml');
  for (const path of INDEXED) for (const lang of LANGS) {
    assert.ok(sitemap.includes(`<loc>${SITE.url}${localize(lang, path)}</loc>`), `${lang} ${path}`);
    await access(new URL(fileOf(lang, path), DIST)).catch(() => assert.fail(`${lang} ${path} is in the sitemap but not built`));
  }
  assert.doesNotMatch(sitemap, /notified|404|journal|terms/);
  assert.doesNotMatch(llms, /\/(journal|terms)\b/, 'llms.txt lists a page in the works');
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
  // The privacy notice and terms, drafts and the published version 2026-12, are counsel's text, kept word for word (they
  // use semicolons) until counsel and the founder settle them.
  const COUNSEL_TEXT = new Set(['privacy-draft.html', 'fr/privacy-draft.html', 'terms-draft.html', 'fr/terms-draft.html',
    'legal/privacy.html', 'fr/legal/privacy.html', 'legal/terms.html', 'fr/legal/terms.html']);
  for (const [name, body] of sources) for (const [bad, what] of BANNED) {
    if (bad === ';' && COUNSEL_TEXT.has(name)) continue;
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

// Until the app has a store page its button says what it does, and the extension is not offered at all (founder,
// 2026-11-17).
test('without store links the app button offers the waitlist and the extension waits, in each language', async () => {
  const { LINKS } = await import('../src/data/site.ts');
  assert.equal(LINKS.appUrl, null);
  assert.equal(LINKS.extensionUrl, null);
  for (const lang of LANGS) {
    const labelled = (label) => [...home[lang].matchAll(/<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/g)].filter((m) => decode(text(m[3])) === label);
    const waitlist = labelled(COPY[lang].get.waitlist);
    assert.ok(waitlist.length >= 2, `${lang}: the waitlist button appears ${waitlist.length} times`);
    for (const [, tag, attrs] of waitlist) {
      assert.equal(tag, 'button', `${lang}: the waitlist button is a link`);
      assert.match(attrs, /data-get="app"/);
    }
    assert.match(home[lang], /<dialog[^>]*id="get-app"/, `${lang}: no dialog for the app`);
    for (const label of [COPY[lang].get.app, COPY[lang].get.extension]) assert.equal(labelled(label).length, 0, `${lang}: "${label}" is offered before it exists`);
    assert.doesNotMatch(home[lang], /data-get="extension"|id="get-extension"/, `${lang}: the extension still has a button or a dialog`);
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

// Under the heading, one dot per source (stores, wardrobe, feed); the playing one stretches into a pill as its scene runs
// (founder, 2026-11-02), replacing the loading line.
test('the phone demo marks its three sources with a dot each, not a loading line', () => {
  for (const lang of LANGS) {
    const how = home[lang].match(/<section class="how"[\s\S]*?<\/section>/)?.[0] ?? '';
    assert.match(how, /<span class="hpager"[^>]*aria-hidden="true"/, `${lang}: no dots`);
    assert.equal((how.match(/<i class="hpg"/g) ?? []).length, 3, lang);
    assert.doesNotMatch(how, /class="(track|hbar)"/, `${lang}: the loading line is still there`);
  }
});

// One switch pauses every looping demo (WCAG 2.2.2; founder, 2026-11-02). It sits beside the dots, outside the heading
// that skips to the next scene, and says whether it is pressed.
test('a pause button beside the dots stops the demos, in each language', () => {
  for (const [lang, label] of [['en', 'pause the demos'], ['fr', 'mettre les démos en pause']]) {
    const how = home[lang].match(/<section class="how"[\s\S]*?<\/section>/)?.[0] ?? '';
    const button = how.match(/<button class="hpause"[^>]*>/)?.[0] ?? '';
    assert.match(button, /type="button"/, lang);
    assert.match(button, /aria-pressed="false"/, lang);
    assert.equal(decode(button.match(/aria-label="([^"]*)"/)?.[1] ?? ''), label, lang);
    assert.doesNotMatch(how.match(/<span class="hroll"[\s\S]*?<\/h2>/)?.[0] ?? '', /hpause/, `${lang}: the button sits inside the heading that skips scenes`);
  }
});

// The phone browses real shops' phone pages, copied from them with their own packshots (founder, 2026-11-01), then shares
// Zara's coat. Their words are each shop's own, per language.
test('the shop demo browses Uniqlo, Arc\'teryx and Zara in their own words, then shares the Zara coat', () => {
  const want = {
    en: ['Soufflé Yarn Crew Neck Jumper', "BETA SL JACKET WOMEN'S", '€500.00', 'ZW COLLECTION MIDI WOOL BLEND COAT', '149.00 EUR', 'ADD'],
    fr: ['VESTE BETA SL FEMME', '500,00 €', 'MANTEAU MI-LONG AVEC LAINE ZW COLLECTION', '149,00 EUR', 'AJOUTER'],
  };
  for (const lang of LANGS) {
    const shop = home[lang].match(/<div class="hsrc shop[\s\S]*?<div class="toolbar/)?.[0] ?? '';
    assert.deepEqual([...shop.matchAll(/<div class="spage (\w+)/g)].map((m) => m[1]), ['uniqlo', 'arcteryx', 'zara'], lang);
    for (const [k, id] of ['shop-uniqlo-jumper', 'shop-arcteryx-jacket', 'shop-zara-coat'].entries()) {
      assert.ok(shop.split('<div class="spage ')[k + 1].includes(`/${id}.`), `${lang}: page ${k} shows ${id}`);
    }
    const words = decode(text(shop));
    for (const line of want[lang]) assert.ok(words.includes(line), `${lang}: ${line}`);
    const domains = home[lang].match(/<span class="domains"[^>]*>([\s\S]*?)<\/span>\s*<svg/)?.[1] ?? '';
    assert.deepEqual([...domains.matchAll(/>([a-z.']+)</g)].map((m) => m[1]), ['uniqlo.com', 'arcteryx.com', 'zara.com'], lang);
    const sheet = home[lang].match(/<div class="sh-head[\s\S]*?<div class="sh-apps/)?.[0] ?? '';
    const [, title, domain] = sheet.match(/<span class="sh-what"[^>]*><b[^>]*>([^<]*)<\/b><span[^>]*>([^<]*)<\/span>/) ?? [];
    assert.equal(domain, 'zara.com', `${lang}: the sheet shares the Zara page`);
    assert.equal(decode(title ?? ''), COPY[lang].how.shops.zara.title, `${lang}: the sheet names Zara's page`);
    assert.ok(sheet.includes('/shop-zara-coat.'), `${lang}: the sheet shows the Zara coat`);
    assert.doesNotMatch(home[lang], /\.example\b/, `${lang}: a made-up shop is left`);
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

test('the footer lists only working links, the contact address and the rights line, and asks for nothing', () => {
  for (const lang of LANGS) {
    const footer = home[lang].match(/<footer[\s\S]*?<\/footer>/)[0], t = COPY[lang];
    const links = [...footer.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(([, href, label]) => [decode(text(label)), href]);
    const local = (link) => { const [page, hash] = link.split('#'); return localize(lang, page || '/') + (hash ? `#${hash}` : ''); };
    assert.deepEqual(links, [
      ...t.finale.columns.flatMap((column) => column.links.map(([label, link]) => [label, local(link)])),
      ['info@dressyouapp.com', 'mailto:info@dressyouapp.com'],
    ]);
    assert.ok(decode(text(footer)).includes(`© ${new Date().getFullYear()} DressYou Technologies. ${t.finale.rights}`), `${lang}: the rights line`);
    // The name across the footer, without the symbol (founder, 2026-11-16, evening; scripts/brand.mjs).
    assert.match(footer, /<img[^>]*src="[^"]*\/wordmark-white[^"]*\.svg"[^>]*alt="DressYou"|<img[^>]*alt="DressYou"[^>]*src="[^"]*\/wordmark-white[^"]*\.svg/, `${lang}: the footer's name`);
    assert.doesNotMatch(footer, /<form|<input|<button|<h2/, `${lang}: the footer carries a form, a button or a headline`);
    assert.doesNotMatch(footer, /<picture|<img(?![^>]*alt="DressYou")/, `${lang}: the footer shows no picture besides the logo`);
  }
});

// The footer runs from one edge of the screen to the other and down to its end, with no page showing around it (founder,
// 2026-11-17).
test('the footer fills the width of the screen, with no margin, corner or gap under it', async () => {
  const css = await builtCss(), box = css.match(/\.finale\[[^\]]*\]\{([^}]*)\}/)?.[1] ?? '', body = css.match(/(?:^|\})body\{([^}]*)\}/)?.[1] ?? '';
  assert.ok(box && body, 'the footer or the body has no rule');
  assert.doesNotMatch(box, /margin|border-radius/, 'the footer keeps a margin or a corner');
  assert.doesNotMatch(body, /padding-bottom/, 'the page keeps a gap under the footer');
});

// The footer links only what exists (founder, 2026-11-16): every page is built, every section is on the home page, and
// the removed pages are not built. The home page's sections come first, under "product" (founder, 2026-11-17).
test('the footer links the home page sections, then the legal notice and privacy, each to something built', async () => {
  const want = {
    en: [['try-on', '/#how'], ['wardrobe and feed', '/#more'], ['AI stylist', '/#stylist'], ['legal notice', '/legal'], ['privacy', '/privacy']],
    fr: [['essayage', '/fr#how'], ['dressing et fil', '/fr#more'], ['styliste IA', '/fr#stylist'], ['mentions légales', '/fr/legal'], ['confidentialité', '/fr/privacy']],
  };
  for (const lang of LANGS) {
    const nav = home[lang].match(/<nav class="cols"[\s\S]*?<\/nav>/)[0];
    const links = [...nav.matchAll(/<a\b[^>]*href="(\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].map(([, href, label]) => [words(label), href]);
    assert.deepEqual(links.slice(0, want[lang].length), want[lang], lang);
    assert.equal(words(nav.match(/<p[^>]*>([\s\S]*?)<\/p>/)[1]), COPY[lang].finale.columns[0].label, `${lang}: the first column`);
    for (const [, href] of links) {
      const [page, section] = href.split('#'), file = page === '/' ? 'index.html' : `${page.slice(1)}.html`;
      const html = await readFile(new URL(file, DIST), 'utf8').catch(() => assert.fail(`${lang}: ${href} is linked but not built`));
      if (section) assert.match(html, new RegExp(`<section[^>]*\\sid="${section}"`), `${lang}: ${href} names a section the page lacks`);
    }
    for (const path of REMOVED) await assert.rejects(access(new URL(fileOf(lang, path), DIST)), `${lang} ${path} is still built`);
  }
});

// Only finished pages are linked (founder, 2026-10-31): the company pages wait, so the menu keeps the other language.
// Wide screens have no menu: the header shows the two languages itself (founder, 2026-11-17).
test('the header logo goes home, and the header and the menu offer the other language with no page in the works', async () => {
  for (const lang of LANGS) {
    const header = home[lang].match(/<header[\s\S]*?<\/header>/)[0], other = LANGS.find((l) => l !== lang);
    const brand = header.match(/<a class="brand"[\s\S]*?<\/a>/)?.[0] ?? '';
    assert.match(brand, new RegExp(`^<a class="brand"[^>]*href="${localize(lang, '/')}"[^>]*aria-label="DressYou"`), `${lang}: the logo is not a link home`);
    // The wordmark alone, white and black, crossfaded as the menu button changes colour.
    assert.deepEqual([...brand.matchAll(/<img[^>]*src="[^"]*\/(wordmark-(?:white|black))[^"]*"/g)].map((m) => m[1]), ['wordmark-white', 'wordmark-black'], lang);
    assert.match(header, /<button[^>]*popovertarget="menu"/, `${lang}: no menu button`);
    const linksOf = (part, link) => [...part.matchAll(link)].map(([, href, label]) => [decode(text(label)), href]);
    const bar = header.match(/<div class="bar"[\s\S]*?(?=<div id="menu")/)[0], menu = header.slice(header.indexOf('id="menu"'));
    assert.deepEqual(linksOf(bar, /<a\b[^>]*href="([^"]+)"[^>]*hreflang[^>]*>([\s\S]*?)<\/a>/g), [[other.toUpperCase(), localize(other, '/')]], `${lang}: the header`);
    assert.deepEqual(linksOf(menu, /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g), [[other.toUpperCase(), localize(other, '/')]], `${lang}: the menu`);
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

// A first minimal legal notice (founder, 2026-11-01). Privacy keeps its notice: the sign-up links to it.
test('the legal notice names the publisher, its director and the host', async () => {
  for (const lang of LANGS) {
    const legal = await read(fileOf(lang, '/legal')), notice = text(legal.match(/<article class="doc[\s\S]*?<\/article>/)?.[0] ?? '');
    // A first minimal notice (founder, 2026-11-01): the publisher as registered, its president as publication director, the host.
    for (const fact of ['DressYou Technologies', '108 706 037', '47 rue Vivienne, 75002 Paris', 'Tamsir Léopold Ely Debris', 'info@dressyouapp.com',
      'Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723']) assert.ok(notice.includes(fact), `${lang} legal notice: ${fact}`);
    assert.doesNotMatch(notice, /\[|compléter|to be completed/, `${lang} legal notice shows a placeholder`);
    assert.match(legal, /<a href="mailto:info@dressyouapp\.com"/, `${lang} legal notice: the address is a mail link`);
    assert.doesNotMatch(legal, /<meta name="robots" content="noindex"/, `${lang} legal notice is out of search`);
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
      // One icon and one short line per check, so each line plainly belongs to its icon (founder, 2026-11-02).
      const rows = [...card.matchAll(/<span class="ck"[^>]*>([\s\S]*?)<\/span>\s*(?=<span class="ck"|<\/div>)/g)].map((m) => m[1]);
      assert.ok(rows.length >= 3, `${lang} tab ${k} checks ${rows.length} things`);
      for (const row of rows) {
        assert.equal((row.match(/class="ck-ico"/g) ?? []).length, 1, `${lang} tab ${k}: one icon a row`);
        assert.equal((row.match(/class="ck-text"/g) ?? []).length, 1, `${lang} tab ${k}: one line a row`);
      }
      assert.deepEqual(rows.map((row) => decode(row.match(/class="ck-text"[^>]*>([^<]*)</)?.[1] ?? '')), tabs[k].checks.map(([, line]) => line), `${lang} tab ${k}`);
    });
  }
  const find = { en: ['€150 max', 'Size M in stock', 'You like black knits', 'Goes with 3 of your outfits', 'Delivery not guaranteed by Friday'],
    fr: ['150\u00a0€ max', 'Taille M en stock', 'Tu aimes les mailles noires', 'Va avec 3 de tes tenues', 'Livraison non garantie avant vendredi'] };
  for (const lang of LANGS) assert.deepEqual(COPY[lang].stylist.find.checks.map(([, line]) => line), find[lang], lang);
});

test('every dark section says so, for the menu button to take a colour that reads on it', async () => {
  for (const lang of LANGS) {
    for (const marker of ['class="band"', 'class="more"', 'class="finale"']) {
      assert.match(home[lang], new RegExp(`<[a-z]+ ${marker}[^>]*data-tone="dark"`), `${lang}: ${marker}`);
    }
    assert.match(await read(fileOf(lang, '/legal')), /<section class="band"[^>]*data-tone="dark"/, `${lang}: the legal page's band`);
  }
});

// The privacy notice is the counsel draft from the DressYou repository (founder, 2026-11-02, preview first): the app's
// onboarding links its AI section as #ai, and every point still open shows as a marked note, never as plain text.
test('the privacy notice gives its AI section the anchor the app links to, and marks every open point', async () => {
  for (const [lang, title] of [['en', '2.3 AI: OpenAI and TypeSafe'], ['fr', '2.3 IA : OpenAI et TypeSafe']]) {
    const body = await read(fileOf(lang, '/privacy-draft'));
    assert.equal(decode(text(body.match(/<h3 id="ai"[^>]*>([\s\S]*?)<\/h3>/)?.[1] ?? '')), title, lang);
    assert.doesNotMatch(body, /\[\[(FOUNDER|COUNSEL)/, `${lang}: an open point shows as raw text`);
    assert.ok((body.match(/<mark class="open"/g) ?? []).length >= 41, `${lang}: open points not marked`);
  }
});

// DressYou stores data in Stockholm since its move to eu-north-1 (DressYou #490, #504); the notice says so in both
// languages. The organisation's address in the page's JSON-LD is not a storage claim, so only the notice is read.
test('the privacy notice names Stockholm, never Paris or France, as where DressYou stores data', async () => {
  const STORED = {
    en: ['DressYou stores your data in the EU (Sweden)', 'Everything the service stores and logs Stockholm, Sweden Declared',
      'verification and reset links Stockholm, Sweden Declared', 'DressYou stores your data in Stockholm, Sweden.'],
    fr: ['DressYou stocke vos données dans l’UE (Suède)', 'Tout ce que le service conserve et journalise Stockholm, Suède Déclaré',
      'vérification et de réinitialisation Stockholm, Suède Déclaré', 'DressYou conserve vos données à Stockholm, en Suède.'],
  };
  for (const [lang, claims] of Object.entries(STORED)) {
    const notice = decode(text((await read(fileOf(lang, '/privacy-draft'))).match(/<article class="doc"[^>]*>([\s\S]*?)<\/article>/)?.[1] ?? ''));
    assert.doesNotMatch(notice, /\b(Paris|France)\b/, `${lang}: the notice still names Paris or France`);
    for (const claim of claims) assert.ok(notice.includes(claim), `${lang}: missing "${claim}"`);
  }
});

// The drafts are for TestFlight only (founder, 2026-11-05): the app's policy bundle links them and no public page does,
// while /privacy keeps what main shows. The drafts may link each other: the terms cite the draft notice.
test('the draft privacy notice and terms stay out of search, the sitemap and llms.txt, and no other page links them', async () => {
  const { headers } = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  for (const path of ['/privacy-draft', '/terms-draft']) {
    const drafts = LANGS.map((lang) => fileOf(lang, path)), name = new RegExp(path.slice(1));
    for (const file of drafts) {
      const body = await read(file);
      assert.match(body, /<meta name="robots" content="noindex, nofollow">/, file);
      assert.doesNotMatch(body, /rel="canonical"/, file);
    }
    for (const page of pages.filter((page) => !page.endsWith('-draft.html'))) assert.doesNotMatch(await read(page), name, `${page} links ${path}`);
    for (const file of ['sitemap.xml', 'llms.txt']) assert.doesNotMatch(await read(file), name, `${file} lists ${path}`);
    for (const lang of LANGS) {
      const rule = headers.find((h) => h.source === localize(lang, path));
      assert.ok(rule?.headers.some((h) => h.key === 'X-Robots-Tag' && h.value === 'noindex, nofollow'), `${lang}: no X-Robots-Tag on ${path}`);
    }
  }
});

// The draft terms are counsel's text (DressYou repository, docs/legal/terms-{en,fr}-draft.md): every open point shows as a
// marked note, never as raw text, under the draft banner.
test('the draft terms carry their seventeen sections and mark every open point', async () => {
  for (const [lang, founder, counsel] of [['en', 'Founder to decide:', 'Counsel to confirm:'], ['fr', 'À trancher\u00a0:', 'À confirmer par le conseil\u00a0:']]) {
    const article = (await read(fileOf(lang, '/terms-draft'))).match(/<article class="doc"[^>]*>([\s\S]*?)<\/article>/)?.[1] ?? '';
    assert.match(article, /<p class="draft">/, `${lang}: no draft banner`);
    assert.equal((article.match(/<h2[ >]/g) ?? []).length, 17, `${lang}: sections`);
    assert.doesNotMatch(article, /\[\[(FOUNDER|COUNSEL)/, `${lang}: an open point shows as raw text`);
    assert.equal(article.split(`<b>${founder}</b>`).length - 1, 16, `${lang}: founder points`);
    assert.equal(article.split(`<b>${counsel}</b>`).length - 1, 17, `${lang}: counsel points`);
  }
});

// The drafts come from the DressYou repository, whose links name its own files: on the site each must reach a page.
test('no link on a draft page points at a repository file or at a page the site does not have', async () => {
  const built = (pathname) => pathname === '/' ? ['index.html'] : [`${pathname.slice(1)}.html`, pathname.slice(1), `${pathname.slice(1)}/index.html`];
  for (const path of ['/privacy-draft', '/terms-draft']) for (const lang of LANGS) {
    const file = fileOf(lang, path), base = `${SITE.url}${localize(lang, path)}`;
    for (const [, href] of (await read(file)).matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
      assert.doesNotMatch(href, /\.md(#|$)/, `${file} links a repository file: ${href}`);
      const url = new URL(decode(href), base);
      if (url.origin !== SITE.url || href.startsWith('#')) continue;
      const found = await Promise.any(built(decodeURI(url.pathname)).map((name) => access(new URL(name, DIST)))).then(() => true, () => false);
      assert.ok(found, `${file} links ${href}, which the site does not have`);
    }
  }
});

test('the public privacy notice stays the waitlist notice, in search', async () => {
  for (const [lang, opening] of [['en', 'This notice covers this website only.'], ['fr', 'Cette notice couvre uniquement ce site.']]) {
    const body = await read(fileOf(lang, '/privacy'));
    assert.ok(decode(text(body)).includes(opening), `${lang}: /privacy lost the waitlist notice`);
    assert.doesNotMatch(body, /id="ai"|class="draft"|<mark class="open"/, `${lang}: the draft reached /privacy`);
    assert.match(body, /<meta name="robots" content="index, follow/, `${lang}: /privacy left search`);
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

// The account mails link here; the app opens them (iOS AccountAuthURL.swift). Any other path stays a web page.
test('the apple app-site-association opens only the reset and verified links in the app, served as JSON', async () => {
  assert.deepEqual(JSON.parse(await read('.well-known/apple-app-site-association')), {
    applinks: { details: [{ appIDs: ['Y3AYTV4AK8.com.dressyouapp.ios'], components: [{ '/': '/auth/reset' }, { '/': '/auth/verified' }] }] },
  });
  const { headers } = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.deepEqual(headers.find((h) => h.source === '/.well-known/apple-app-site-association')?.headers, [{ key: 'Content-Type', value: 'application/json' }]);
});

test('the demo section carries the scale limit its script reads to size the phone', async () => {
  const css = (await Promise.all((await readdir(new URL('_astro/', DIST))).filter((f) => f.endsWith('.css')).map((f) => read(`_astro/${f}`)))).join('');
  assert.match(css, /--fit-max:\s*\d/, 'fitPhone reads --fit-max from the stage (How.astro)');
});

test('on phones the header bar has no height, so Safari paints no strip behind the status bar', async () => {
  const css = (await Promise.all((await readdir(new URL('_astro/', DIST))).filter((f) => f.endsWith('.css')).map((f) => read(`_astro/${f}`)))).join('');
  const phone = css.match(/\.top\[[^\]]*\],\.top\[[^\]]*\]\.folded\{[^}]*\}/)?.[0] ?? '';
  assert.match(phone, /pointer-events:none/, 'the phone header rule (Header.astro)');
  assert.match(phone, /[{;]height:0[;}]/, 'a fixed box across the top of the screen makes Safari on iOS 26 and later draw a solid strip there');
});

const builtCss = async () => (await Promise.all((await readdir(new URL('_astro/', DIST))).filter((f) => f.endsWith('.css')).map((f) => read(`_astro/${f}`)))).join('');

// Each section once set its own side room, width and title size, so their text started on four different left edges
// (founder, 2026-11-16: "alignment between elements"). They read the shared tokens (tokens.css).
test('the demo, the bento and the stylist share one gutter, one content width and one title scale', async () => {
  const css = await builtCss();
  assert.match(css, /--page-max:\s*1200px/);
  for (const [token, uses] of [['--gutter', 5], ['--page-max', 4], ['--h2-size', 3], ['--h2-leading', 4]]) {
    assert.ok(css.split(`var(${token})`).length - 1 >= uses, `${token} is read fewer than ${uses} times: a section sets its own again`);
  }
});

test('every page lets the keyboard skip the header, in its language', async () => {
  for (const page of pages) {
    const body = await read(page), lang = body.match(/<html lang="(\w+)"/)[1];
    assert.equal(decode(body.match(/<body[^>]*>\s*<a class="skip" href="#main">([^<]*)<\/a>/)?.[1] ?? ''), COPY[lang].skip, `${page}: the skip link comes first`);
    assert.match(body, /<main id="main"/, `${page}: the skip link has nowhere to land`);
  }
});

test('the link to the other language is named by the letters it shows', () => {
  for (const lang of LANGS) {
    const [, name, shown] = home[lang].match(/<a href="[^"]*" hreflang="\w+" lang="\w+" aria-label="([^"]*)"[^>]*>(\w+)<\/a>/) ?? [];
    assert.ok(shown && decode(name).startsWith(shown), `${lang}: "${name}" does not start with "${shown}" (WCAG 2.5.3)`);
  }
});

// On a phone the stylist's chat is set smaller than on a wide screen, so a whole answer fits above the input (founder,
// 2026-11-17: "a bit too big on mobile phone", its end "cropped at the footer").
test('the stylist chat is set smaller on phones', async () => {
  const css = await builtCss(), phone = css.match(/@media \(width<=599\.98px\)\{((?:[^{}]*\{[^{}]*\})*[^{}]*\.sbub\[(?:[^{}]*\{[^{}]*\})*)\}/)?.[1] ?? '';
  const rem = (rules, name) => Number(rules.match(new RegExp(`\\.${name}\\[[^\\]]*\\]\\{[^}]*font-size:([\\d.]+)rem`))?.[1]);
  for (const name of ['sbub', 'sq']) assert.ok(rem(phone, name) < rem(css.replace(phone, ''), name), `${name} is not smaller on phones`);
});

// A phone held sideways: the header leaves as the page scrolls down, the demo keeps one row and the stylist sits beside
// its chat (founder, 2026-11-16). The script and the styles name the same screen, and the same start of "wide".
test('the script and the styles agree on a phone held sideways and on where wide starts', async () => {
  const css = await builtCss(), short = SHORT_QUERY.match(/max-height: ([\d.]+px)/)[1];
  const sideways = `(orientation:landscape) and (height<=${short})`;
  assert.ok(css.replaceAll(' ', '').includes(sideways.replaceAll(' ', '')), `no rule for ${SHORT_QUERY}`);
  assert.match(css, /\.away:not\(:focus-within,:has\(\.menu-pop:popover-open\)\)\{[^}]*opacity:0/, 'the header never leaves (Header.astro)');
  // The menu button and the header's own language links trade places where the phone layout ends. The rule that hides
  // the button comes after the one that lays it out, or it hides nothing.
  const phone = FULL_MENU_QUERY.match(/max-width: ([\d.]+)px/)[1], past = Math.ceil(Number(phone));
  const shown = css.search(/\.hdr-burger\[[^\]]*\]\{/), gone = css.search(new RegExp(`@media \\(width>=${past}px\\)\\{\\.hdr-burger[^{]*\\{display:none`));
  assert.ok(shown >= 0 && gone > shown, 'wide screens still show the menu button');
  assert.match(css, new RegExp(`@media \\(width<=${phone.replace('.', '\\.')}px\\)\\{[^@]*\\.hdr-langs[^{]*\\{display:none`), 'phones show the language links outside the menu');
  const wide = Number(WIDE_QUERY.match(/min-width: (\d+)px/)[1]);
  assert.ok(css.includes(`(width<=${wide - .02}px)`), `the styles' narrow layouts do not end where ${WIDE_QUERY} starts`);
});
