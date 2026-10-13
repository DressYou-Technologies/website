import { dirname, posix } from 'node:path';
import { selectAll, walk } from './html.mjs';
import { fileOfUrl, isAuth, ORIGIN, TEXT } from './site.mjs';

// Every destination the site may send a visitor to outside itself. A new one is a decision.
export const EXTERNAL_HOSTS = ['www.cnil.fr'];
// Text that only means something inside the product repository or on a developer's machine.
const INTERNAL = [
  [/\/private\/|\/Users\/|scratchpad/, 'a path from a developer machine'],
  [/\bdocs\/(?:design|legal|plans|status|architecture)\b/, 'a path into the product repository'],
  [/counsel[- ]brief|-draft\b|working identifier/i, 'a note to reviewers'],
  [/\blocalhost\b|127\.0\.0\.1/, 'a local address'],
  [/href="[^"]*\.md[#"]/, 'a link to a Markdown file'],
];

const ids = (page) => {
  const found = new Set();
  walk(page.doc, (node) => { if (node.attrs?.id) found.add(node.attrs.id); });
  return found;
};

/** The addresses a page points at, as [what, address] pairs. */
function references(page) {
  const found = [];
  const add = (selector, attribute, what = selector) => {
    for (const node of selectAll(page.doc, selector)) if (node.attrs[attribute] !== undefined) found.push([what, node.attrs[attribute]]);
  };
  add('a[href]', 'href', 'link');
  add('link[href]', 'href', 'link element');
  add('script[src]', 'src', 'script');
  add('img[src]', 'src', 'image');
  for (const node of selectAll(page.doc, 'source[srcset]')) {
    for (const candidate of node.attrs.srcset.split(',')) found.push(['image source', candidate.trim().split(/\s+/)[0]]);
  }
  for (const node of selectAll(page.doc, 'meta[property]')) {
    if (['og:image', 'og:url'].includes(node.attrs.property)) found.push([node.attrs.property, node.attrs.content]);
  }
  for (const node of selectAll(page.doc, 'meta[name=twitter:image]')) found.push(['twitter:image', node.attrs.content]);
  return found;
}

/** What an address on this site points at, or why it points at nothing. */
function check(site, from, reference) {
  if (/^(?:mailto:|tel:)/.test(reference)) return null;
  if (reference.startsWith('#')) return null;
  const [withoutFragment, fragment] = reference.split('#');
  const [address] = withoutFragment.split('?');
  const internal = address.startsWith(`${ORIGIN}/`) ? address.slice(ORIGIN.length) : address.startsWith('/') && !address.startsWith('//') ? address : null;
  if (internal === null) {
    if (!/^https?:\/\//.test(address)) return `is relative (${reference}); every address on this site starts with /`;
    const url = new URL(address);
    if (url.protocol !== 'https:') return `uses ${url.protocol} (${reference})`;
    return EXTERNAL_HOSTS.includes(url.hostname) ? null : `goes to ${url.hostname}, which no one has approved`;
  }
  const file = fileOfUrl(internal);
  if (!/\.[a-z0-9]+$/.test(file) && !internal.endsWith('/')) return `${reference} needs its trailing slash`;
  if (!site.files.has(file)) return `${reference} does not resolve`;
  const target = site.pages.get(internal);
  if (fragment && target && !ids(target).has(fragment)) return `${reference} points at an id that is not on the page`;
  return null;
}

export function linkProblems(site) {
  return [...site.pages.values()].flatMap((page) => references(page)
    .map(([what, reference]) => [what, reference, check(site, page.url, reference)])
    .filter(([, , problem]) => problem)
    .map(([what, , problem]) => `${page.url} ${what} ${problem}`));
}

/** CSS `url()` and module imports, resolved from the file that makes them. */
export function assetProblems(site) {
  const problems = [];
  for (const file of site.files) {
    if (file.endsWith('.css')) {
      for (const [, address] of site.read(file).matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
        if (!address.startsWith('data:') && !site.files.has(address.slice(1))) problems.push(`${file} loads ${address}, which does not exist`);
      }
    }
    if (file.endsWith('.mjs')) {
      for (const [, specifier] of site.read(file).matchAll(/(?:from\s+|import\s*\()\s*['"](\.[^'"]+)['"]/g)) {
        if (!site.files.has(posix.join(dirname(file), specifier))) problems.push(`${file} imports ${specifier}, which does not exist`);
      }
    }
  }
  return problems;
}

const locations = (xml) => [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, block]) => ({
  loc: block.match(/<loc>([^<]+)<\/loc>/)?.[1],
  alternates: Object.fromEntries([...block.matchAll(/<xhtml:link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"\s*\/>/g)].map(([, hreflang, href]) => [hreflang, href])),
}));

/** The sitemap lists every indexable page once, with the alternates the page itself declares. */
export function sitemapProblems(site) {
  const problems = [];
  const entries = locations(site.read('sitemap.xml'));
  const listed = new Map(entries.map((entry) => [entry.loc, entry]));
  if (listed.size !== entries.length) problems.push('sitemap.xml lists an address twice');
  for (const page of site.pages.values()) {
    if (isAuth(page.url)) {
      if (listed.has(`${ORIGIN}${page.url}`)) problems.push(`sitemap.xml lists ${page.url}, which carries a token and is noindex`);
      continue;
    }
    const entry = listed.get(`${ORIGIN}${page.url}`);
    if (!entry) { problems.push(`sitemap.xml does not list ${page.url}`); continue; }
    const declared = Object.fromEntries(selectAll(page.doc, 'link[rel=alternate][hreflang]').map((link) => [link.attrs.hreflang, link.attrs.href]));
    if (JSON.stringify(Object.entries(entry.alternates).sort()) !== JSON.stringify(Object.entries(declared).sort())) {
      problems.push(`sitemap.xml alternates for ${page.url} differ from the page's own`);
    }
  }
  for (const loc of listed.keys()) {
    if (!loc.startsWith(`${ORIGIN}/`) || !site.pages.has(loc.slice(ORIGIN.length))) problems.push(`sitemap.xml lists ${loc}, which is not a page`);
  }
  return problems;
}

/** Crawler and install files point only at things that exist. */
export function metadataProblems(site) {
  const problems = [];
  const manifest = JSON.parse(site.read('site.webmanifest'));
  for (const icon of manifest.icons) if (!site.files.has(icon.src.slice(1))) problems.push(`site.webmanifest icon ${icon.src} does not exist`);
  if (!site.pages.has(manifest.start_url)) problems.push(`site.webmanifest start_url ${manifest.start_url} is not a page`);
  if (manifest.lang !== 'fr') problems.push(`site.webmanifest lang must be fr, the language of ${manifest.start_url}`);
  if ('orientation' in manifest) problems.push('site.webmanifest locks the orientation, which WCAG 1.3.4 forbids unless essential');
  const robots = site.read('robots.txt');
  if (!robots.includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) problems.push('robots.txt does not point at the sitemap');
  for (const [, address] of site.read('llms.txt').matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
    const problem = check(site, 'llms.txt', address);
    if (problem) problems.push(`llms.txt ${problem}`);
  }
  for (const page of site.pages.values()) {
    for (const script of selectAll(page.doc, 'script[type="application/ld+json"]')) {
      const data = JSON.parse(script.children[0].text);
      const urls = [];
      JSON.stringify(data, (key, value) => { if (['url', '@id'].includes(key) && typeof value === 'string') urls.push(value); return value; });
      for (const address of urls) {
        // A fragment in structured data names an entity, not an anchor on a page.
        const problem = address.startsWith(ORIGIN) ? check(site, page.url, address.split('#')[0]) : null;
        if (problem) problems.push(`${page.url} structured data ${problem}`);
      }
    }
  }
  return problems;
}

/** Nothing that only means something inside the repository or on a developer machine ships. */
export function internalProblems(site) {
  // Open markers are the placeholder gate's business; their questions may cite the counsel brief.
  const withoutMarkers = (line) => line.replace(/\[\[[^\]]*\]\]/g, '');
  return [...site.files].filter((file) => TEXT.test(file)).flatMap((file) => site.read(file).split('\n')
    .flatMap((line, index) => INTERNAL.filter(([pattern]) => pattern.test(withoutMarkers(line))).map(([, what]) => `${file}:${index + 1} contains ${what}`)));
}
