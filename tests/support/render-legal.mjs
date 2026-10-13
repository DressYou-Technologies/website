// node tests/support/render-legal.mjs <path to docs/legal> <policy version>
//
// Writes the privacy notice, terms and legal notice under /legal/<version>/ and the Digital Services
// Act page, in French and English, from the product repository's drafts. Section 4 of the DSA draft
// is the notification DressYou sends to authorities (Article 18): an internal template, not a page.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { page } from './chrome.mjs';
import { renderLegal } from './legal-render.mjs';
import { DIST, fileOfUrl, LANGUAGES, LEGAL_DOCUMENTS } from './site.mjs';

const OMITTED = { dsa: [4] };
const [directory, version] = process.argv.slice(2);
if (!directory || !/^[\w.-]+$/.test(version ?? '')) {
  console.error('usage: node tests/support/render-legal.mjs <path to docs/legal> <policy version>');
  process.exit(1);
}

for (const document of [...LEGAL_DOCUMENTS, 'dsa']) {
  for (const language of LANGUAGES) {
    const markdown = readFileSync(join(directory, `${document}-${language}-draft.md`), 'utf8');
    const { url, title, description, main } = renderLegal({ markdown, document, version, language, omitSections: OMITTED[document] });
    const file = join(DIST, fileOfUrl(url));
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, page({ url, title, description, main, version }));
    console.log(`wrote ${url}`);
  }
}
