import "./globals.css";
import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";
import { ThemeProvider } from "next-themes";
import { TelemetryProvider } from "./components/TelemetryProvider";
import { CookieConsent } from "./components/CookieConsent";

export const metadata = {
  title: {
    default: "Bridging Trust AI | Custom AI Solutions, Built to Ship",
    template: "%s | Bridging Trust AI",
  },
  description:
    "We design and build custom AI systems — agents, automations, and integrations that run in production. Strategy through implementation, secure and governed by default.",
  keywords:
    "custom AI development, AI agents, AI automation, AI consulting, Azure AI, AI implementation, AI integration, workflow automation, secure AI deployment",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://bridgingtrust.ai"
  ),
  openGraph: {
    title: "Bridging Trust AI | Custom AI Solutions, Built to Ship",
    description:
      "We design and build custom AI systems — agents, automations, and integrations that run in production. Strategy through implementation, secure and governed by default.",
    url: "https://bridgingtrust.ai",
    siteName: "Bridging Trust AI",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Bridging Trust AI",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bridging Trust AI | Custom AI Solutions, Built to Ship",
    description:
      "We design and build custom AI systems — agents, automations, and integrations that run in production. Strategy through implementation, secure and governed by default.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="m-0 flex min-h-screen flex-col p-0 bg-white text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-gray-100">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TelemetryProvider>
            <NavBar />
            <main className="flex-grow">{children}</main>
            <Footer />
            <CookieConsent />
          </TelemetryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
