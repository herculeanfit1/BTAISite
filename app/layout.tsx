import "./globals.css";
import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";
import { ThemeProvider } from "next-themes";
import { TelemetryProvider } from "./components/TelemetryProvider";
import { CookieConsent } from "./components/CookieConsent";

export const metadata = {
  title: "Bridging Trust AI — Better AI Starts With Better Relationships",
  description:
    "We help organizations build the trust infrastructure that makes AI actually work. AI governance, team enablement, and agent architecture for companies ready to lead in the age of AI.",
  keywords:
    "AI consulting, AI trust, AI governance, agent architecture, Microsoft Copilot readiness, AI team training, AI enablement, AI adoption strategy, AI agent communication, responsible AI, AI workshops, AI relationship methodology",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://bridgingtrust.ai"
  ),
  openGraph: {
    title: "Bridging Trust AI — Better AI Starts With Better Relationships",
    description:
      "We help organizations build the trust infrastructure that makes AI actually work. AI governance, team enablement, and agent architecture for companies ready to lead in the age of AI.",
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
    title: "Bridging Trust AI — Better AI Starts With Better Relationships",
    description:
      "We help organizations build the trust infrastructure that makes AI actually work. AI governance, team enablement, and agent architecture for companies ready to lead in the age of AI.",
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
