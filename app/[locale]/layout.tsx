import "../globals.css";
import { Inter } from "next/font/google";
import GoogleAnalytics from "../GoogleAnalytics";
import ClientLayout from "../components/ClientLayout";

// Load Inter font
const inter = Inter({ subsets: ["latin"] });

// Define supported locales
const supportedLocales = ["en", "es", "fr"];

// Generate static params for all supported locales
export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

export const metadata = {
  title: {
    default: "Bridging Trust AI | Secure & Ethical AI Solutions",
    template: "%s | Bridging Trust AI",
  },
  description:
    "Advanced AI solutions built on trust and transparency, ensuring data security and ethical use of artificial intelligence.",
  keywords: [
    "artificial intelligence",
    "ai security",
    "ethical ai",
    "ai transparency",
    "data security",
    "ai solutions",
  ],
  authors: [{ name: "Bridging Trust AI Team" }],
  creator: "Bridging Trust AI",
  publisher: "Bridging Trust AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/images/logo/symbol.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Bridging Trust AI | Secure & Ethical AI Solutions",
    description:
      "Advanced AI solutions built on trust and transparency, ensuring data security and ethical use of artificial intelligence.",
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
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;

  const { children } = props;

  const { locale } = params;
  const GA_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID || "";

  return (
    <html lang={locale} suppressHydrationWarning>
      <head />
      <body
        className={`${inter.className} flex min-h-screen flex-col bg-white text-gray-900 antialiased dark:bg-gray-900 dark:text-gray-100`}
      >
        {/* Google Analytics */}
        <GoogleAnalytics GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />

        {/* Client components wrapped in a client boundary */}
        <ClientLayout locale={locale}>{children}</ClientLayout>
      </body>
    </html>
  );
}
