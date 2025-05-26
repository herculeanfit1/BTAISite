import { Metadata } from "next";

type MetadataProps = {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  noIndex?: boolean;
  keywords?: string[];
};

/**
 * Generates consistent metadata for all pages
 */
export function generateMetadata({
  title,
  description = "Advanced AI solutions built on trust and transparency, ensuring data security and ethical use of artificial intelligence.",
  image = "/images/og-image.svg",
  canonical,
  noIndex = false,
  keywords = [],
}: MetadataProps): Metadata {
  // Base metadata that's consistent across all pages
  const baseKeywords = [
    "artificial intelligence",
    "ai security",
    "ethical ai",
    "ai transparency",
    "data security",
    "ai solutions",
  ];

  return {
    title: title,
    description,
    keywords: [...baseKeywords, ...keywords],
    openGraph: {
      title: title || "Bridging Trust AI",
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title || "Bridging Trust AI",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title || "Bridging Trust AI",
      description,
      images: [image],
    },
    alternates: {
      canonical: canonical || undefined,
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}
