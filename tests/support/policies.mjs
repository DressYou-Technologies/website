import { LANGUAGES, legalUrl, ORIGIN } from './site.mjs';

const VERSION_MAX_LENGTH = 200;

/**
 * The bundle the API's `ACCOUNT_POLICIES` takes for one version: a version string and, per language,
 * the terms and privacy addresses the apps show at sign-up (`publishedPolicies` in
 * api/src/account/onboarding.ts, which requires English).
 */
export function policyBundle(version) {
  return {
    version,
    documents: Object.fromEntries(LANGUAGES.map((language) => [language, {
      termsUrl: `${ORIGIN}${legalUrl(version, 'terms', language)}`,
      privacyUrl: `${ORIGIN}${legalUrl(version, 'privacy', language)}`,
    }])),
  };
}

/** What the API would refuse in a bundle, and every address in it that is not a page of this site. */
export function bundleProblems(site, bundle) {
  const problems = [];
  if (typeof bundle.version !== 'string' || bundle.version !== bundle.version.trim() || !bundle.version || bundle.version.length > VERSION_MAX_LENGTH) {
    problems.push(`version ${JSON.stringify(bundle.version)} must be a trimmed string of 1 to ${VERSION_MAX_LENGTH} characters`);
  }
  if (!bundle.documents.en) problems.push('the English documents are required');
  for (const [language, documents] of Object.entries(bundle.documents)) {
    for (const [name, address] of Object.entries(documents)) {
      if (!address.startsWith(`${ORIGIN}/`)) problems.push(`${language} ${name} ${address} is not an https address on ${ORIGIN}`);
      else if (!site.pages.has(address.slice(ORIGIN.length))) problems.push(`${language} ${name} ${address} does not resolve to a page`);
    }
  }
  return problems;
}
