// CORS origin resolution for the contact API. Pure and framework-free so it is
// unit-testable without next/server.

export const ALLOWED_ORIGINS = [
  "https://bridgingtrust.ai",
  "https://www.bridgingtrust.ai",
];

// The wildcard `^https://[a-z0-9-]+\.azurestaticapps\.net$` that used to live
// here was removed (PLAN-009). It was backwards in both directions:
//
//   - It did NOT match this project's own origin. The real hostname is
//     `wonderful-bush-0e888f30f.6.azurestaticapps.net`, and the character class
//     excludes the dot before `6`, so the rule never once admitted the site it
//     was written for.
//   - It DID match every other tenant's Static Web App, so any stranger's
//     `*.azurestaticapps.net` page could make cross-origin calls to this API.
//
// Nothing needs it: the form posts to the relative path `/api/contact`
// (app/components/home/ContactSection.tsx), which is same-origin on production
// and on PR previews alike, and same-origin requests never consult CORS.

/**
 * The origin to echo back, or `null` when the request's origin is not allowed.
 *
 * Returning null matters. This previously answered a disallowed origin with
 * `Access-Control-Allow-Origin: https://bridgingtrust.ai` — a header asserting
 * an origin that was not the caller's. Browsers reject that mismatch anyway, so
 * it bought nothing while making logs and tests read as though the request had
 * been authorised.
 */
export function resolveCorsOrigin(origin: string): string | null {
  return ALLOWED_ORIGINS.includes(origin) ? origin : null;
}

/** CORS response headers. Omits the allow-origin header entirely when null. */
export function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}
