import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, selectAll } from './html.mjs';

export const DIST = fileURLToPath(new URL('../../dist/', import.meta.url));
export const ORIGIN = 'https://dressyouapp.com';
export const TEXT = /\.(?:html|css|mjs|json|webmanifest|xml|txt)$/;
export const KNOWN_BINARY = /\.(?:webp|png|jpg|ico|woff2)$/;

export const LANGUAGES = ['fr', 'en'];
export const DEFAULT_LANGUAGE = 'fr';
export const LEGAL_DOCUMENTS = ['privacy', 'terms', 'legal-notice'];
/** Pages that exist once per language: French at the root, English under /en/. */
export const TWIN_PAGES = ['/', '/support/', '/account-deletion/', '/dsa/'];
/** Pages the API's account mail lands on; one document each, language chosen in the page. */
export const AUTH_PAGES = ['/auth/verified/', '/auth/reset/'];

/** Every file under `root`, as sorted POSIX paths relative to it. */
export function distFiles(root = DIST) {
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(join(root, directory), { withFileTypes: true })) {
      const path = directory ? `${directory}/${entry.name}` : entry.name;
      if (entry.isDirectory()) visit(path);
      else files.push(path);
    }
  };
  visit('');
  return files.sort();
}

export const readDist = (file, root = DIST) => readFileSync(join(root, file), 'utf8');

export const urlOfFile = (file) => (file === 'index.html' ? '/' : `/${file.replace(/index\.html$/, '')}`);
export const fileOfUrl = (url) => (url.endsWith('/') ? `${url.slice(1)}index.html` : url.slice(1));
export const languageOf = (url) => (url.startsWith('/en/') ? 'en' : DEFAULT_LANGUAGE);
export const isAuth = (url) => AUTH_PAGES.includes(url);
export const twinOf = (url) => (languageOf(url) === 'en' ? url.slice('/en'.length) : `/en${url}`);
export const legalUrl = (version, document, language) => `${language === 'en' ? '/en' : ''}/legal/${version}/${document}/`;

function makePage(file, html) {
  const { root, errors } = parse(html);
  return { file, url: urlOfFile(file), html, doc: root, errors };
}

/** Every HTML page under `root`, parsed, keyed by URL, and a `read` for any file's text. */
export function loadSite(root = DIST) {
  const files = distFiles(root);
  const pages = new Map(files.filter((file) => file.endsWith('.html')).map((file) => {
    const page = makePage(file, readDist(file, root));
    return [page.url, page];
  }));
  return { root, files: new Set(files), pages, read: (file) => readDist(file, root) };
}

/** A copy of `site` where one text file reads differently; the files on disk stay as they are. */
export function withFileText(site, file, rewrite) {
  return { ...site, read: (name) => (name === file ? rewrite(site.read(name)) : site.read(name)) };
}

/** A copy of `site` where one page's HTML is rewritten and re-parsed; the files on disk stay as they are. */
export function withPageHtml(site, url, rewrite) {
  const page = site.pages.get(url);
  const html = rewrite(page.html);
  const pages = new Map(site.pages);
  pages.set(url, makePage(page.file, html));
  return { ...site, pages, read: (name) => (name === page.file ? html : site.read(name)) };
}

export function withoutPage(site, url) {
  const pages = new Map(site.pages);
  const page = pages.get(url);
  pages.delete(url);
  const files = new Set(site.files);
  files.delete(page.file);
  return { ...site, pages, files };
}

export function policyVersions(site) {
  return [...new Set([...site.pages.keys()].flatMap((url) => url.match(/^(?:\/en)?\/legal\/([^/]+)\//)?.slice(1) ?? []))].sort();
}

/** The keys of `[[FOUNDER: key — …]]` and `[[COUNSEL: key — …]]` markers, in document order. */
export function placeholderKeys(text) {
  return [...text.matchAll(/\[\[(?:FOUNDER|COUNSEL):\s*([\w-]+)/g)].map((match) => match[1]);
}

const BLOCKS = new Set(['p', 'blockquote', 'form', 'figure', 'details', 'dl', 'pre']);

/**
 * The shape of a document's content: headings, paragraphs, lists with their item counts and tables
 * with their dimensions. Two translations of one page must have the same outline.
 */
export function outline(root) {
  const entries = [];
  const visit = (node) => {
    for (const child of node.children) {
      if (child.type !== 'element') continue;
      if (child.attrs.hidden !== undefined) continue;
      if (/^h[1-6]$/.test(child.tag) || BLOCKS.has(child.tag)) entries.push(child.tag);
      else if (child.tag === 'ul' || child.tag === 'ol') {
        entries.push(`${child.tag}(${child.children.filter((item) => item.tag === 'li').length})`);
        for (const item of child.children) if (item.tag === 'li') visit(item);
        continue;
      } else if (child.tag === 'table') {
        const rows = selectAll(child, 'tr');
        entries.push(`table(${rows.length}x${rows[0] ? rows[0].children.filter((cell) => cell.tag === 'th' || cell.tag === 'td').length : 0})`);
        continue;
      }
      visit(child);
    }
  };
  visit(root);
  return entries;
}

/** Whitespace-insensitive structure of a subtree, for comparing generated markup with what a page ships. */
export function signature(node) {
  if (node.type === 'text') {
    const text = node.text.replace(/\s+/g, ' ').trim();
    return text ? JSON.stringify(text) : '';
  }
  const attrs = Object.entries(node.attrs).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(' ');
  return `<${node.tag}${attrs ? ` ${attrs}` : ''}>${node.children.map(signature).join('')}</${node.tag}>`;
}
