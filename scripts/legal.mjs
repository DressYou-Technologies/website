// Publishes the privacy notice and the terms from the DressYou repository's drafts.
// node scripts/legal.mjs <DressYou docs/legal directory> <DressYou commit>
// The page text is the draft's from its first section on: the title and the review banner go, and so does every [[…]]
// note, which is for counsel and the founder, never for the reader. A FOUNDER note stops publication.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// The drafts link each other by file name; on the site each is a page.
const PAGES = {
  'privacy-en-draft.md': '/privacy', 'privacy-fr-draft.md': '/fr/privacy',
  'terms-en-draft.md': '/terms', 'terms-fr-draft.md': '/fr/terms',
  'legal-notice-en-draft.md': '/legal', 'legal-notice-fr-draft.md': '/fr/legal',
};
// The app's onboarding links the privacy notice's AI section, 2.3, as #ai.
const ANCHORS = [['2.3', 'ai']];
const DOCUMENTS = ['privacy-en', 'privacy-fr', 'terms-en', 'terms-fr'];

export function publish(draft) {
  if (draft.includes('[[FOUNDER:')) throw new Error('a [[FOUNDER: …]] note remains: the founder decides it before publication');
  let text = draft.slice(draft.search(/^## /m));
  // A note goes with the space before it, so the sentence closes up around it.
  text = text.replace(/[   ]?\[\[[\s\S]*?\]\]/g, '');
  if (text.includes('[[') || text.includes(']]')) throw new Error('a [[ note is not closed');
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (link, label, href) => {
    const [file, hash] = href.split('#');
    if (PAGES[file]) return `[${label}](${PAGES[file]}${hash ? `#${hash}` : ''})`;
    // Another repository file, such as the DSA texts: the site has no page for it, so the words stay without a link.
    return file.endsWith('.md') ? label : link;
  });
  for (const [section, id] of ANCHORS) text = text.replace(new RegExp(`^### ${section.replace('.', '\\.')} (.+)$`, 'm'), `<h3 id="${id}">${section} $1</h3>`);
  return `${text.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [, , dir, commit] = process.argv;
  if (!dir || !commit) throw new Error('usage: node scripts/legal.mjs <DressYou docs/legal directory> <DressYou commit>');
  for (const name of DOCUMENTS) {
    const page = publish(readFileSync(`${dir}/${name}-draft.md`, 'utf8'));
    writeFileSync(new URL(`../src/legal/${name}.md`, import.meta.url), `---\nsource: DressYou docs/legal/${name}-draft.md at ${commit}\n---\n\n${page}`);
  }
}
