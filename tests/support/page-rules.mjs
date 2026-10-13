import { footer, header, skipLink } from './chrome.mjs';
import { parse, select, selectAll, textOf, walk } from './html.mjs';
import {
  AUTH_PAGES, isAuth, LANGUAGES, languageOf, LEGAL_DOCUMENTS, legalUrl, ORIGIN,
  outline, placeholderKeys, policyVersions, signature, TWIN_PAGES, twinOf,
} from './site.mjs';

const LOCALES = { fr: 'fr_FR', en: 'en_US' };
const CONTROLS_WITHOUT_LABEL = new Set(['hidden', 'submit', 'button', 'reset', 'image']);
const REFERENCES = ['for', 'aria-labelledby', 'aria-describedby', 'aria-controls'];

const meta = (page, key, value) => select(page.doc, `meta[${key}=${value}]`)?.attrs.content ?? null;
const frenchUrl = (url) => (languageOf(url) === 'en' ? twinOf(url) : url);

/** Pages the brief requires, in both languages, for every policy version shipped. */
export function requiredPages(site) {
  const versions = policyVersions(site);
  const wanted = [
    ...TWIN_PAGES.flatMap((url) => [url, twinOf(url)]),
    ...AUTH_PAGES,
    ...versions.flatMap((version) => LEGAL_DOCUMENTS.flatMap((document) => LANGUAGES.map((language) => legalUrl(version, document, language)))),
  ];
  return [
    ...(versions.length ? [] : ['no policy version is published under /legal/']),
    ...wanted.filter((url) => !site.pages.has(url)).map((url) => `missing page ${url}`),
  ];
}

export function malformed(site) {
  return [...site.pages.values()].flatMap((page) => page.errors.map((error) => `${page.url} ${error}`));
}

/** The document-level requirements of one page: language, metadata, canonical and sharing tags. */
export function documentProblems(page) {
  const problems = [];
  const fail = (message) => problems.push(`${page.url} ${message}`);
  const auth = isAuth(page.url);
  const language = languageOf(page.url);
  if (!/^<!doctype html>/i.test(page.html.trimStart())) fail('has no <!doctype html>');
  if (!page.file.endsWith('index.html')) fail('is not a directory index');
  if (select(page.doc, 'html')?.attrs.lang !== language) fail(`needs <html lang="${language}">`);
  if (!select(page.doc, 'meta[charset=utf-8]')) fail('declares no utf-8 charset');
  const viewport = meta(page, 'name', 'viewport');
  if (viewport !== 'width=device-width, initial-scale=1') fail(`viewport must be "width=device-width, initial-scale=1", found ${JSON.stringify(viewport)}`);
  if (!textOf(select(page.doc, 'title') ?? { type: 'text', text: '' }).trim()) fail('has no <title>');
  const robots = meta(page, 'name', 'robots') ?? '';
  if (auth !== /\bnoindex\b/.test(robots)) fail(auth ? 'must be noindex: its link carries a token' : 'must be indexable');
  if (auth) return problems;
  if (!meta(page, 'name', 'description')) fail('has no meta description');
  const canonical = select(page.doc, 'link[rel=canonical]')?.attrs.href;
  if (canonical !== `${ORIGIN}${page.url}`) fail(`canonical must be ${ORIGIN}${page.url}, found ${canonical}`);
  const expectedShare = {
    'og:url': `${ORIGIN}${page.url}`,
    'og:locale': LOCALES[language],
    'og:type': 'website',
    'og:site_name': 'dressyou',
    'og:image': `${ORIGIN}/og-image.jpg`,
  };
  for (const [property, value] of Object.entries(expectedShare)) {
    const found = meta(page, 'property', property);
    if (found !== value) fail(`${property} must be ${value}, found ${found}`);
  }
  for (const property of ['og:title', 'og:description']) if (!meta(page, 'property', property)) fail(`has no ${property}`);
  const alternates = Object.fromEntries(selectAll(page.doc, 'link[rel=alternate][hreflang]').map((link) => [link.attrs.hreflang, link.attrs.href]));
  const expectedAlternates = { fr: `${ORIGIN}${frenchUrl(page.url)}`, en: `${ORIGIN}${twinOf(frenchUrl(page.url))}`, 'x-default': `${ORIGIN}${frenchUrl(page.url)}` };
  for (const [hreflang, href] of Object.entries(expectedAlternates)) {
    if (alternates[hreflang] !== href) fail(`alternate ${hreflang} must be ${href}, found ${alternates[hreflang]}`);
  }
  return problems;
}

function headingProblems(page, scope, label) {
  const headings = selectAll(scope, 'h1, h2, h3, h4, h5, h6');
  const levels = headings.map((node) => Number(node.tag[1]));
  const problems = [];
  if (levels.filter((level) => level === 1).length !== 1) problems.push(`${page.url} ${label ?? 'page'} needs exactly one h1, found ${levels.filter((level) => level === 1).length}`);
  if (levels[0] !== 1) problems.push(`${page.url} ${label ?? 'page'} must start with its h1`);
  levels.forEach((level, index) => {
    if (index && level > levels[index - 1] + 1) problems.push(`${page.url} ${label ?? 'page'} skips from h${levels[index - 1]} to h${level}`);
  });
  return problems;
}

/** Landmarks, headings, identifiers and their references on one page. */
export function structureProblems(page) {
  const problems = [];
  const fail = (message) => problems.push(`${page.url} ${message}`);
  const auth = isAuth(page.url);
  const mains = selectAll(page.doc, 'main');
  if (mains.length !== 1 || mains[0].attrs.id !== 'main') fail('needs exactly one <main id="main">');
  if (auth) {
    for (const section of selectAll(page.doc, 'main > section[data-state]')) {
      problems.push(...headingProblems(page, section, `${section.attrs['data-state']}/${section.attrs.lang}`));
    }
  } else {
    problems.push(...headingProblems(page, page.doc));
    const body = select(page.doc, 'body');
    const first = body?.children.find((child) => child.type === 'element');
    if (first?.tag !== 'a' || first.attrs.class !== 'skip-link') fail('must open with a skip link');
    else if (!select(page.doc, `[id=${first.attrs.href.replace(/^#/, '')}]`)) fail(`skip link target ${first.attrs.href} does not exist`);
    if (selectAll(page.doc, 'body > footer').length !== 1) fail('needs exactly one footer');
  }
  for (const nav of selectAll(page.doc, 'nav')) if (!nav.attrs['aria-label']) fail('has a <nav> without aria-label');

  const ids = new Map();
  walk(page.doc, (node) => { if (node.attrs?.id) ids.set(node.attrs.id, (ids.get(node.attrs.id) ?? 0) + 1); });
  for (const [id, count] of ids) if (count > 1) fail(`repeats id "${id}"`);
  walk(page.doc, (node) => {
    if (node.type !== 'element') return;
    for (const attribute of REFERENCES) {
      for (const id of (node.attrs[attribute] ?? '').split(/\s+/).filter(Boolean)) {
        if (!ids.has(id)) fail(`${node.tag} ${attribute}="${id}" points at nothing`);
      }
    }
    const href = node.tag === 'a' ? node.attrs.href : null;
    if (href?.startsWith('#') && href.length > 1 && !ids.has(href.slice(1))) fail(`link ${href} points at nothing`);
  });
  return problems;
}

/** Names for links, buttons, images and form controls. */
export function nameProblems(page) {
  const problems = [];
  const fail = (message) => problems.push(`${page.url} ${message}`);
  const labelled = new Set(selectAll(page.doc, 'label[for]').map((label) => label.attrs.for));
  const nameOf = (node) => (node.attrs['aria-label'] || textOf(node).trim() || selectAll(node, 'img').map((img) => img.attrs.alt).join('').trim());
  for (const link of selectAll(page.doc, 'a')) {
    if (link.attrs.href === undefined) fail(`has a link without href near line ${link.line}`);
    else if (!nameOf(link)) fail(`has an unnamed link to ${link.attrs.href}`);
    if (link.attrs.target === '_blank' && !/\bnoopener\b/.test(link.attrs.rel ?? '')) fail(`opens ${link.attrs.href} in a new tab without rel="noopener"`);
    if (link.attrs.hreflang && link.attrs.hreflang !== languageOf(page.url) && link.attrs.lang !== link.attrs.hreflang) {
      fail(`link to ${link.attrs.href} is in ${link.attrs.hreflang} and must say lang="${link.attrs.hreflang}"`);
    }
  }
  for (const button of selectAll(page.doc, 'button')) if (!nameOf(button)) fail(`has an unnamed button near line ${button.line}`);
  for (const image of selectAll(page.doc, 'img')) if (image.attrs.alt === undefined) fail(`has an image without alt: ${image.attrs.src}`);
  for (const control of selectAll(page.doc, 'input, select, textarea')) {
    if (CONTROLS_WITHOUT_LABEL.has(control.attrs.type)) continue;
    const wrapped = (() => { for (let up = control.parent; up; up = up.parent) if (up.tag === 'label') return true; return false; })();
    if (!(labelled.has(control.attrs.id) || wrapped || control.attrs['aria-label'] || control.attrs['aria-labelledby'])) {
      fail(`has a ${control.tag} without a label near line ${control.line}`);
    }
  }
  for (const table of selectAll(page.doc, 'table')) {
    if (!selectAll(table, 'th').every((cell) => cell.attrs.scope)) fail(`has a table header without scope near line ${table.line}`);
    const wrapper = table.parent;
    const reachable = wrapper?.attrs.tabindex === '0' && wrapper.attrs.role === 'region' && (wrapper.attrs['aria-label'] || wrapper.attrs['aria-labelledby']);
    if (!reachable) fail(`has a table that a keyboard cannot scroll or name near line ${table.line}`);
  }
  return problems;
}

const mainOf = (page) => select(page.doc, 'main');
const internalTargets = (page) => selectAll(mainOf(page), 'a[href]')
  .map((link) => link.attrs.href)
  .filter((href) => href.startsWith('/') && !href.startsWith('//'))
  .map((href) => href.replace(/^\/en\//, '/'))
  .sort();

/** Each French page has an English twin with the same outline, links and open markers. */
export function twinProblems(site) {
  const problems = [];
  const versions = policyVersions(site);
  const french = [
    ...TWIN_PAGES,
    ...versions.flatMap((version) => LEGAL_DOCUMENTS.map((document) => legalUrl(version, document, 'fr'))),
  ];
  for (const url of french) {
    const fr = site.pages.get(url);
    const en = site.pages.get(twinOf(url));
    if (!fr || !en) continue;
    const mismatch = (what) => problems.push(`${url} and ${en.url} differ in ${what}`);
    const [a, b] = [outline(mainOf(fr)), outline(mainOf(en))];
    if (a.join() !== b.join()) {
      const at = a.findIndex((entry, index) => entry !== b[index]);
      mismatch(`outline at block ${at}: ${a[at] ?? 'end'} against ${b[at] ?? 'end'}`);
    }
    if (internalTargets(fr).join() !== internalTargets(en).join()) mismatch('internal links');
    if (placeholderKeys(fr.html).join() !== placeholderKeys(en.html).join()) mismatch('open founder or counsel markers');
  }
  return problems;
}

/** Auth pages carry both languages: every state needs a French and an English section of one shape. */
export function bilingualProblems(site) {
  const problems = [];
  for (const url of AUTH_PAGES) {
    const page = site.pages.get(url);
    if (!page) continue;
    const sections = selectAll(page.doc, 'main > section[data-state]');
    const states = [...new Set(sections.map((section) => section.attrs['data-state']))];
    if (!states.length) problems.push(`${url} has no state sections`);
    for (const state of states) {
      const byLanguage = Object.fromEntries(sections.filter((s) => s.attrs['data-state'] === state).map((s) => [s.attrs.lang, s]));
      for (const language of LANGUAGES) {
        if (!byLanguage[language]) problems.push(`${url} state ${state} has no ${language} section`);
        else if (byLanguage[language].attrs.hidden === undefined) problems.push(`${url} state ${state}/${language} must start hidden`);
      }
      if (byLanguage.fr && byLanguage.en && outline(byLanguage.fr).join() !== outline(byLanguage.en).join()) {
        problems.push(`${url} state ${state} differs between languages`);
      }
    }
    if (select(page.doc, 'main')?.attrs['data-page'] === undefined) problems.push(`${url} <main> must name its page in data-page`);
    const fallbacks = selectAll(page.doc, 'main > [data-fallback]');
    if (fallbacks.length !== 1) problems.push(`${url} needs exactly one fallback, found ${fallbacks.length}`);
    else {
      if (!select(fallbacks[0], 'h1')) problems.push(`${url} fallback needs its h1`);
      for (const language of LANGUAGES) if (!select(fallbacks[0], `p[lang=${language}]`)) problems.push(`${url} fallback has no ${language} text`);
    }
  }
  return problems;
}

const shipped = (html) => signature(parse(html).root.children.find((child) => child.type === 'element'));

/** The skip link, header and footer are the shared markup, link for link, on every content page. */
export function chromeProblems(site) {
  const version = policyVersions(site).at(-1);
  const problems = [];
  for (const page of site.pages.values()) {
    if (isAuth(page.url)) continue;
    const language = languageOf(page.url);
    const twin = twinOf(page.url);
    const check = (name, node, expected) => {
      if (!node) problems.push(`${page.url} has no ${name}`);
      else if (signature(node) !== shipped(expected)) problems.push(`${page.url} ${name} differs from the shared markup`);
    };
    const landing = page.url === '/' || page.url === '/en/';
    const skip = select(page.doc, 'body > a.skip-link');
    check('skip link', skip, skipLink(language, skip?.attrs.href));
    check('footer', select(page.doc, 'body > footer'), footer(language, version, twin));
    if (landing) {
      if (select(page.doc, 'body > header')) problems.push(`${page.url} is the hero page and takes no header`);
    } else check('header', select(page.doc, 'body > header'), header(language, twin));
  }
  return problems;
}
