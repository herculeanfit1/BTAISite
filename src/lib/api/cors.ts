// CORS origin resolution for the contact API, ported verbatim from the Azure
// Functions handler (api/src/functions/contact.ts). Pure and framework-free so
// it is unit-testable without next/server (which is unavailable under happy-dom).

export const ALLOWED_ORIGINS = [
  "https://bridgingtrust.ai",
  "https://www.bridgingtrust.ai",
];

const SWA_PATTERN = /^https:\/\/[a-z0-9-]+\.azurestaticapps\.net$/;

/** Echo the request origin when allowed, otherwise fall back to the canonical origin. */
export function resolveCorsOrigin(origin: string): string {
  const isAllowed =
    ALLOWED_ORIGINS.includes(origin) || SWA_PATTERN.test(origin);
  return isAllowed ? origin : ALLOWED_ORIGINS[0];
}

/** CORS response headers for a resolved origin. */
export function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}
