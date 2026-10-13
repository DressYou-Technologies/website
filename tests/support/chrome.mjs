import { languageOf, legalUrl, ORIGIN, twinOf } from './site.mjs';

// The markup every page shares. Pages ship it as plain HTML; the tests hold each page to this
// source, and the legal renderer wraps its output in it.
const LABELS = {
  fr: {
    skip: 'Aller au contenu', home: 'dressyou, accueil', navigation: 'Liens du site', support: 'Assistance',
    deletion: 'Suppression du compte', privacy: 'Confidentialité', terms: 'Conditions d’utilisation',
    legalNotice: 'Mentions légales', report: 'Signaler un contenu', other: 'English',
  },
  en: {
    skip: 'Skip to content', home: 'dressyou, home', navigation: 'Site links', support: 'Support',
    deletion: 'Account deletion', privacy: 'Privacy', terms: 'Terms of use',
    legalNotice: 'Legal notice', report: 'Report content', other: 'Français',
  },
};
const prefix = (language) => (language === 'en' ? '/en' : '');
const otherLanguage = (language) => (language === 'en' ? 'fr' : 'en');
const languageLink = (language, twin) => `<a class="language" href="${twin}" hreflang="${otherLanguage(language)}" lang="${otherLanguage(language)}">${LABELS[language].other}</a>`;

export const skipLink = (language, target = '#main') => `<a class="skip-link" href="${target}">${LABELS[language].skip}</a>`;

export function header(language, twin) {
  return `<header class="site-header">
      <a class="brand" href="${prefix(language)}/" aria-label="${LABELS[language].home}">
        <img src="/images/dressyou-logo.webp" width="32" height="32" alt="">
        <span>dressyou</span>
      </a>
      ${languageLink(language, twin)}
    </header>`;
}

export function footer(language, version, twin) {
  const labels = LABELS[language];
  const links = [
    [`${prefix(language)}/support/`, labels.support],
    [`${prefix(language)}/account-deletion/`, labels.deletion],
    [legalUrl(version, 'privacy', language), labels.privacy],
    [legalUrl(version, 'terms', language), labels.terms],
    [legalUrl(version, 'legal-notice', language), labels.legalNotice],
    [`${prefix(language)}/dsa/`, labels.report],
  ];
  return `<footer class="site-footer">
    <nav aria-label="${labels.navigation}">
      <ul role="list">
${links.map(([href, text]) => `        <li><a href="${href}">${text}</a></li>`).join('\n')}
        <li>${languageLink(language, twin)}</li>
      </ul>
    </nav>
  </footer>`;
}

/** Everything in `<head>` that an indexable page needs, from its URL, title and description. */
export function head({ url, title, description }) {
  const language = languageOf(url);
  const french = language === 'fr' ? url : twinOf(url);
  const english = twinOf(french);
  const locale = language === 'fr' ? 'fr_FR' : 'en_US';
  const escape = (text) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  return `<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#000000">
    <title>${escape(title)}</title>
    <meta name="description" content="${escape(description)}">
    <link rel="canonical" href="${ORIGIN}${url}">
    <link rel="alternate" hreflang="fr" href="${ORIGIN}${french}">
    <link rel="alternate" hreflang="en" href="${ORIGIN}${english}">
    <link rel="alternate" hreflang="x-default" href="${ORIGIN}${french}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <link rel="icon" href="/favicon.ico" sizes="48x48">
    <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="dressyou">
    <meta property="og:locale" content="${locale}">
    <meta property="og:url" content="${ORIGIN}${url}">
    <meta property="og:title" content="${escape(title)}">
    <meta property="og:description" content="${escape(description)}">
    <meta property="og:image" content="${ORIGIN}/og-image.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escape(title)}">
    <meta name="twitter:description" content="${escape(description)}">
    <meta name="twitter:image" content="${ORIGIN}/og-image.jpg">
    <link rel="preload" href="/fonts/Manrope.woff2" as="font" type="font/woff2" crossorigin="anonymous">
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="/site.css">
  </head>`;
}

/** A complete content page: head, skip link, header, `<main>`, footer. */
export function page({ url, title, description, main, version }) {
  const language = languageOf(url);
  return `<!doctype html>
<html lang="${language}">
  ${head({ url, title, description })}
  <body>
    ${skipLink(language)}
    ${header(language, twinOf(url))}
    <main id="main" class="page">
${main}
    </main>
    ${footer(language, version, twinOf(url))}
  </body>
</html>
`;
}
