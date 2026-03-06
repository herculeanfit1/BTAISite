import "./globals.css";
import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";
import { ThemeProvider } from "next-themes";

export const metadata = {
  title: "Bridging Trust AI - AI Governance & Microsoft AI Enablement",
  description:
    "AI governance, data readiness, and Microsoft AI enablement for security-conscious organizations. We help you govern, secure, and operationalize AI with confidence.",
  keywords:
    "AI governance, Microsoft Copilot readiness, data governance, AI compliance, Microsoft 365 governance, Purview, AI risk management, responsible AI, Copilot deployment, AI enablement",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "Bridging Trust AI - AI Governance & Microsoft AI Enablement",
    description:
      "AI governance, data readiness, and Microsoft AI enablement for security-conscious organizations. We help you govern, secure, and operationalize AI with confidence.",
    url: "https://bridgingtrust.ai",
    siteName: "Bridging Trust AI",
    images: [
      {
        url: "/public/og-image.jpg",
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
    title: "Bridging Trust AI - AI Governance & Microsoft AI Enablement",
    description:
      "AI governance, data readiness, and Microsoft AI enablement for security-conscious organizations. We help you govern, secure, and operationalize AI with confidence.",
    images: ["/public/og-image.jpg"],
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
          <NavBar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
