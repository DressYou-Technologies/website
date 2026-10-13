// Renders the product repository's legal drafts (docs/legal/*-draft.md, a small Markdown subset)
// into this site's pages, so the pages carry the drafts' words and markers unchanged.
//
//   node tests/support/render-legal.mjs <path to docs/legal> <policy version>
//
// It lives beside the tests because the site has no build step: the output is committed and served
// as written, and the tests cover this renderer like any other code that decides what ships.
import { legalUrl } from './site.mjs';

const DOCUMENTS = {
  privacy: {
    en: ['Privacy notice', 'How DressYou processes personal data, why, for how long, and how to exercise your rights.'],
    fr: ['Politique de confidentialité', 'Comment DressYou traite les données personnelles, pourquoi, pendant combien de temps, et comment exercer vos droits.'],
  },
  terms: {
    en: ['Terms of use', 'The terms that apply to the DressYou apps, the browser extension and the website.'],
    fr: ['Conditions générales d’utilisation', 'Les conditions qui s’appliquent aux applications DressYou, à l’extension de navigateur et au site.'],
  },
  'legal-notice': {
    en: ['Legal notice', 'Who publishes DressYou, who hosts it, and how to reach the publisher.'],
    fr: ['Mentions légales', 'Qui édite DressYou, qui l’héberge et comment joindre l’éditeur.'],
  },
  dsa: {
    en: ['Report content', 'Contact points, how to report content, and what follows a report, under the Digital Services Act.'],
    fr: ['Signaler un contenu', 'Points de contact, façon de signaler un contenu et suites données à un signalement, au titre du règlement sur les services numériques.'],
  },
};
const LABELS = { en: { contents: 'Contents', version: 'Version' }, fr: { contents: 'Sommaire', version: 'Version' } };
const BANNER = /^\*\*(?:Draft for counsel review|Projet soumis au conseil)/;
const BULLET = /^[-*]\s+(.*)$/;
const NUMBER = /^\d+\.\s+(.*)$/;
const INDENTED = /^ {2,}\S/;

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function addressOf(href, { version }) {
  const draft = href.match(/^(privacy|terms|legal-notice|dsa)-(en|fr)-draft\.md$/);
  if (draft) {
    const [, document, language] = draft;
    return document === 'dsa' ? `${language === 'en' ? '/en' : ''}/dsa/` : legalUrl(version, document, language);
  }
  if (/^https:\/\//.test(href)) return href;
  throw new Error(`internal link ${href} has no address on the site`);
}

const INLINE = /(\[\[[^\]]*\]\])|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)|\*\*(.+?)\*\*|\*([^*\s][^*]*?)\*/g;

export function renderInline(text, context) {
  let html = '';
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    const [whole, marker, code, label, href, bold, italic] = match;
    html += escapeHtml(text.slice(last, match.index));
    if (marker) html += escapeHtml(marker);
    else if (code) html += `<code>${escapeHtml(code)}</code>`;
    else if (label) html += `<a href="${addressOf(href, context)}">${renderInline(label, context)}</a>`;
    else if (bold) html += `<strong>${renderInline(bold, context)}</strong>`;
    else html += `<em>${renderInline(italic, context)}</em>`;
    last = match.index + whole.length;
  }
  return html + escapeHtml(text.slice(last));
}

const cellsOf = (row) => row.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
const startsBlock = (line) => /^#{1,6}\s/.test(line) || line.startsWith('|') || BULLET.test(line) || NUMBER.test(line);

function parseBlocks(lines) {
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i += 1; continue; }
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] });
      i += 1;
    } else if (line.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(cellsOf(lines[i++]));
      blocks.push({ type: 'table', head: rows[0], rows: rows.slice(2) });
    } else if (BULLET.test(line) || NUMBER.test(line)) {
      const ordered = NUMBER.test(line);
      const marker = ordered ? NUMBER : BULLET;
      const items = [];
      for (;;) {
        while (lines[i]?.trim() === '' && marker.test(lines[i + 1] ?? '')) i += 1;
        const item = marker.exec(lines[i] ?? '');
        if (!item) break;
        const body = [item[1]];
        i += 1;
        while (i < lines.length) {
          if (INDENTED.test(lines[i])) body.push(lines[i++].replace(/^ {1,3}/, ''));
          else if (lines[i].trim() === '' && INDENTED.test(lines[i + 1] ?? '')) body.push(lines[i++]);
          else break;
        }
        items.push(parseBlocks(body));
      }
      blocks.push({ type: ordered ? 'ol' : 'ul', items });
    } else {
      const paragraph = [];
      while (i < lines.length && lines[i].trim() && !(paragraph.length && startsBlock(lines[i]))) paragraph.push(lines[i++].trim());
      blocks.push({ type: 'p', text: paragraph.join(' ') });
    }
  }
  return blocks;
}

const numberOf = (text) => text.match(/^(\d+(?:\.\d+)*)\.?\s/)?.[1];
const idOf = (text) => { const number = numberOf(text); return number ? `s${number.replaceAll('.', '-')}` : null; };

function withoutSections(blocks, omitted) {
  let skipping = false;
  return blocks.filter((block) => {
    if (block.type === 'heading' && block.level === 2) skipping = omitted.includes(Number(numberOf(block.text)));
    return !skipping;
  });
}

function renderBlocks(blocks, context, indent) {
  const pad = ' '.repeat(indent);
  let heading = null;
  return blocks.map((block) => {
    if (block.type === 'heading') {
      heading = block;
      const id = idOf(block.text);
      return `${pad}<h${block.level}${id ? ` id="${id}"` : ''}>${renderInline(block.text, context)}</h${block.level}>`;
    }
    if (block.type === 'p') return `${pad}<p>${renderInline(block.text, context)}</p>`;
    if (block.type === 'table') {
      const labelledBy = heading && idOf(heading.text);
      if (!labelledBy) throw new Error('a table needs a numbered heading above it to name it');
      const row = (cells, tag) => `${pad}      <tr>${cells.map((cell) => `<${tag}${tag === 'th' ? ' scope="col"' : ''}>${renderInline(cell, context)}</${tag}>`).join('')}</tr>`;
      return `${pad}<div class="table-wrap" role="region" tabindex="0" aria-labelledby="${labelledBy}">
${pad}  <table>
${pad}    <thead>
${row(block.head, 'th')}
${pad}    </thead>
${pad}    <tbody>
${block.rows.map((cells) => row(cells, 'td')).join('\n')}
${pad}    </tbody>
${pad}  </table>
${pad}</div>`;
    }
    const items = block.items.map((item) => {
      const single = item.length === 1 && item[0].type === 'p';
      return single
        ? `${pad}  <li>${renderInline(item[0].text, context)}</li>`
        : `${pad}  <li>\n${renderBlocks(item, context, indent + 4)}\n${pad}  </li>`;
    });
    return `${pad}<${block.type}>\n${items.join('\n')}\n${pad}</${block.type}>`;
  }).join('\n');
}

/**
 * One draft as the `<main>` content of its page, with the page's URL, title and description.
 * The draft's own title and its review banner are dropped: the title comes from the table above,
 * and the banner is a note to reviewers, not text for visitors.
 */
export function renderLegal({ markdown, document, version, language, omitSections = [] }) {
  const context = { version, language };
  const [title, description] = DOCUMENTS[document][language];
  const [h1, banner, ...rest] = parseBlocks(markdown.split('\n'));
  if (h1?.type !== 'heading' || h1.level !== 1) throw new Error('a draft must start with its title');
  if (banner?.type !== 'p' || !BANNER.test(banner.text)) throw new Error('a draft must follow its title with the reviewers\' banner');
  const blocks = withoutSections(rest, omitSections);
  const contents = blocks.filter((block) => block.type === 'heading' && block.level === 2 && idOf(block.text));
  const intro = [
    `      <h1>${escapeHtml(title)}</h1>`,
    ...(document === 'dsa' ? [] : [`      <p class="version">${LABELS[language].version} ${escapeHtml(version)}</p>`]),
    `      <nav class="contents" aria-label="${LABELS[language].contents}">`,
    '        <ul role="list">',
    ...contents.map((block) => `          <li><a href="#${idOf(block.text)}">${escapeHtml(block.text)}</a></li>`),
    '        </ul>',
    '      </nav>',
  ];
  return {
    url: document === 'dsa' ? `${language === 'en' ? '/en' : ''}/dsa/` : legalUrl(version, document, language),
    title: `${title} — dressyou`,
    description,
    main: `${intro.join('\n')}\n${renderBlocks(blocks, context, 6)}`,
  };
}
