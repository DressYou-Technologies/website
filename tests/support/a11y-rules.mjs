// The parts of WCAG 2.2 AA that live in the stylesheets and can be read without a browser. What needs
// a rendered page (measured target sizes, reflow, a real accessibility audit) is checked in one.
const BACKGROUND = '#000000';
// text needs 4.5:1 (1.4.3); a boundary or a graphic a person must see needs 3:1 (1.4.11)
const TEXT = 4.5;
const GRAPHIC = 3;
export const MIN_TARGET_REM = 2.75;

const channel = (value) => { const c = value / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const expand = (hex) => (hex.length === 4 ? `#${[...hex.slice(1)].map((digit) => digit + digit).join('')}` : hex);

export function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((at) => parseInt(expand(hex).slice(at, at + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a, b) {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

/** The value a rule gives a property, e.g. `.tagline { color: #999 }` -> `#999`. */
export function declared(css, selector, property) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const body = css.match(new RegExp(`(?:^|\\})\\s*${escaped}\\s*\\{([^}]*)\\}`))?.[1];
  return body?.match(new RegExp(`(?:^|[;\\s])${property}\\s*:\\s*([^;]+)`))?.[1].trim() ?? null;
}

const SITE_TOKENS = [['--ink', TEXT], ['--ink-body', TEXT], ['--ink-muted', TEXT], ['--field-border', GRAPHIC], ['--alert', GRAPHIC]];
const HERO = [['.tagline', 'color', TEXT], ['.hero-link', 'color', TEXT], ['.replay', 'color', GRAPHIC], ['.skip', 'color', GRAPHIC]];
const TARGETS = ['.brand', '.language', '.site-footer a', '.links a', '.hero-link'];
// A heading takes programmatic focus only after a state change; it is not a control, so it needs no ring.
const OUTLINE_REMOVED_ALLOWED = ['.auth h1:focus'];

export function stylesheetProblems(site) {
  const problems = [];
  const page = site.read('style.css');
  const content = site.read('site.css');
  for (const [token, needed] of SITE_TOKENS) {
    const value = content.match(new RegExp(`${token}:\\s*(#[0-9a-fA-F]{3,6})`))?.[1];
    if (!value) problems.push(`site.css does not define ${token}`);
    else if (contrastRatio(value, BACKGROUND) < needed) problems.push(`${token} ${value} on black is ${contrastRatio(value, BACKGROUND).toFixed(2)}:1, under ${needed}:1`);
  }
  for (const [selector, property, needed] of HERO) {
    const value = declared(page, selector, property);
    if (!value) problems.push(`style.css gives ${selector} no ${property}`);
    else if (contrastRatio(value, BACKGROUND) < needed) problems.push(`${selector} ${value} on black is ${contrastRatio(value, BACKGROUND).toFixed(2)}:1, under ${needed}:1`);
  }
  for (const pair of [['.skip-link', 'color', 'background'], ['.button', 'color', 'background']]) {
    const [foreground, background] = [declared(content, pair[0], pair[1]), declared(content, pair[0], pair[2])];
    if (!foreground || !background || contrastRatio(foreground, background) < TEXT) problems.push(`${pair[0]} ${foreground} on ${background} is under ${TEXT}:1`);
  }
  for (const selector of TARGETS) {
    const height = `${declared(content, selector, 'min-height') ?? declared(page, selector, 'min-height')}`;
    if (!/var\(--control-size\)/.test(height)) problems.push(`${selector} must be at least --control-size tall (WCAG 2.5.8), found ${height}`);
  }
  if (!(parseFloat(page.match(/--control-size:\s*([\d.]+)rem/)?.[1]) >= MIN_TARGET_REM)) problems.push(`--control-size must be at least ${MIN_TARGET_REM}rem`);
  for (const [, selector] of content.matchAll(/([^{}]+)\{[^}]*outline:\s*(?:none|0)\b[^}]*\}/g)) {
    if (!OUTLINE_REMOVED_ALLOWED.includes(selector.trim())) problems.push(`${selector.trim()} removes the focus ring`);
  }
  if (!/a:focus-visible[^{]*\{[^}]*outline:\s*2px solid/.test(content)) problems.push('site.css must draw a 2px focus ring on links, fields and buttons');
  if (!/@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*animation: none !important[^}]*transition: none !important|@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*transition: none !important[^}]*animation: none !important/.test(page)) {
    problems.push('style.css must switch off every animation and transition under prefers-reduced-motion');
  }
  if (/\b(?:animation|transition|scroll-behavior)\s*:/.test(content)) problems.push('site.css must not add motion of its own');
  return problems;
}
