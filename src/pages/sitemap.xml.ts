import { SITE } from '../data/site';
import { LANGS, localize } from '../i18n/lang';

// Every indexable page, in both languages, each listing its alternates (Google's hreflang sitemap form).
export const PAGES = ['/', '/privacy'];

export function GET(): Response {
  const href = (lang: (typeof LANGS)[number], path: string) => `${SITE.url}${localize(lang, path)}`;
  const urls = PAGES.flatMap((path) => LANGS.map((lang) => [
    '  <url>',
    `    <loc>${href(lang, path)}</loc>`,
    ...LANGS.map((alt) => `    <xhtml:link rel="alternate" hreflang="${alt}" href="${href(alt, path)}"/>`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${href('en', path)}"/>`,
    '  </url>',
  ].join('\n')));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
