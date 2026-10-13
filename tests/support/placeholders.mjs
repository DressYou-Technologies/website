import { DIST, distFiles, KNOWN_BINARY, readDist, TEXT } from './site.mjs';

// Reserved by RFC 2606 and RFC 6761: an address under them can never be a real one.
const RESERVED_HOST = /\b(?:[\w-]+\.)*(?:example\.(?:com|net|org)|[\w-]+\.(?:test|example|invalid))\b/;

const KINDS = [
  ['founder marker', /\[\[FOUNDER\b/g],
  ['counsel marker', /\[\[COUNSEL\b/g],
  ['bracket marker', /\[\[(?!FOUNDER\b|COUNSEL\b)[^\]]*\]\]/g],
  ['template marker', /\{\{[^}]*\}\}/g],
  ['to-do marker', /\b(?:TODO|FIXME|TBD|XXX)\b/g],
  ['lorem ipsum', /lorem ipsum/gi],
  ['reserved address', new RegExp(`@${RESERVED_HOST.source}|https?://${RESERVED_HOST.source}`, 'g')],
];

/** Every placeholder in `text`, one hit per occurrence, with its 1-based line. */
export function findPlaceholders(text) {
  return text.split('\n').flatMap((content, index) => KINDS.flatMap(([kind, pattern]) => [...content.matchAll(pattern)]
    .map((match) => ({
      kind,
      line: index + 1,
      excerpt: content.slice(match.index, match.index + 70).trim(),
    }))));
}

/** Placeholders in every text file that `dist` ships. */
export function scanDist(root = DIST) {
  return distFiles(root)
    .filter((file) => TEXT.test(file))
    .flatMap((file) => findPlaceholders(readDist(file, root)).map((hit) => ({ file, ...hit })));
}

/** Files the gate would skip because it can neither read them as text nor knows them as binary. */
export function unscannedFiles(root = DIST) {
  return distFiles(root).filter((file) => !TEXT.test(file) && !KNOWN_BINARY.test(file));
}
