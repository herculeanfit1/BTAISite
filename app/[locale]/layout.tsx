import { notFound } from "next/navigation";

// Define supported locales
const supportedLocales = ["en", "es", "fr"];

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
