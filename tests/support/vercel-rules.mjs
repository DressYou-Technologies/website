import { AUTH_PAGES } from './site.mjs';

const SITE = '/(.*)';
const TOKEN_PAGES = '/auth/(.*)';
// What each rule must send. A page whose address carries a single-use token is never cached, never
// shown in a frame and never named in a referrer.
const REQUIRED = {
  [SITE]: [['X-Content-Type-Options', 'nosniff']],
  [TOKEN_PAGES]: [['Cache-Control', 'no-store'], ['Referrer-Policy', 'no-referrer']],
};

// The API mails /auth/verified and /auth/reset?token=… with no trailing slash. Unset, Vercel serves both
// forms of a path without redirecting, which is what the mail needs.
const UNSET = {
  trailingSlash: 'true would redirect /auth/verified and /auth/reset, the addresses the API mails (its documentation does not say the query survives), and false every page the site links to',
  cleanUrls: 'it only touches .html addresses, which nothing links to, so it adds redirects and no benefit',
};

export function vercelProblems(config, site) {
  const problems = [];
  if (config.outputDirectory !== 'dist') problems.push('outputDirectory must be dist: the site is served as written from there');
  for (const [key, why] of Object.entries(UNSET)) {
    if (key in config) problems.push(`${key} must stay unset: ${why}`);
  }
  // The rewrite is the fallback if the directory index were not served: the visitor's address, and so
  // its query, never changes.
  for (const page of AUTH_PAGES) {
    const path = page.slice(0, -1);
    const rule = config.rewrites?.find((rewrite) => rewrite.source === path);
    if (!rule) problems.push(`no rewrite for ${path}, an address the API mails`);
    else if (!site.files.has(rule.destination.slice(1))) problems.push(`${path} rewrites to ${rule.destination}, which does not exist`);
  }
  const rules = config.headers ?? [];
  for (const [source, wanted] of Object.entries(REQUIRED)) {
    const rule = rules.find((candidate) => candidate.source === source);
    for (const [key, value] of wanted) {
      if (!rule?.headers.some((header) => header.key.toLowerCase() === key.toLowerCase() && header.value === value)) problems.push(`${source} must send ${key}: ${value}`);
    }
  }
  const policy = rules.find((rule) => rule.source === TOKEN_PAGES)?.headers.find((header) => header.key === 'Content-Security-Policy');
  if (!policy?.value.includes("frame-ancestors 'none'")) problems.push(`${TOKEN_PAGES} must send Content-Security-Policy with frame-ancestors 'none'`);
  // Which of two rules sets a header both match is not documented, so none is set twice.
  const owner = new Map();
  for (const rule of rules) {
    for (const { key, value } of rule.headers) {
      if (!key) problems.push(`${rule.source} has a header with no key`);
      else if (/[\r\n]/.test(key + value)) problems.push(`${rule.source} header ${key} is not a single line`);
      const id = key.toLowerCase();
      if (owner.has(id) && owner.get(id) !== rule) problems.push(`${key} is set by more than one rule`);
      owner.set(id, rule);
    }
  }
  return problems;
}
