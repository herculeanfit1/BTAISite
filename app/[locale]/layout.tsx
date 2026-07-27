import { notFound } from "next/navigation";

// Define supported locales
// Only locales the site can actually serve. "fr" was listed here with no
// French content anywhere — it prerendered a page of English at a French URL.
// Removing it is invisible to users: every /{locale} path 301s to a canonical
// top-level path at the edge (staticwebapp.config.json) before routing reaches
// this segment.
const supportedLocales = ["en", "es"];

// Generate static params for all supported locales
export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

/**
 * Only pre-rendered locales are valid. Without this, the dynamic [locale]
 * segment matches ANY single path segment, so /banana, /about and /solutions
 * all rendered the full homepage with a 200 — unbounded duplicate content.
 */
export const dynamicParams = false;

/**
 * Locale layout — pass-through only.
 *
 * The root app/layout.tsx already provides <html>, <body>, ThemeProvider,
 * NavBar, and Footer.  This layout must NOT duplicate those elements;
 * doing so creates nested <html>/<body> tags that break hydration.
 */
export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;

  // Anything outside the supported set is not a locale — 404 rather than
  // silently serving the homepage at an arbitrary URL.
  if (!supportedLocales.includes(params.locale)) {
    notFound();
  }

  return <>{props.children}</>;
}
