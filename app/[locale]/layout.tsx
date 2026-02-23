// Define supported locales
const supportedLocales = ["en", "es", "fr"];

// Generate static params for all supported locales
export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

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

  // locale available for future i18n integration
  if (process.env.NODE_ENV === "development") {
    console.warn(`[locale layout] locale=${params.locale}`);
  }

  return <>{props.children}</>;
}
