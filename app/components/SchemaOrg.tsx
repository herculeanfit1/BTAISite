"use client";

import React from "react";

interface WebsiteSchema {
  name: string;
  url: string;
  description?: string;
  logo?: string;
}

interface OrganizationSchema {
  name: string;
  url: string;
  logo: string;
  description?: string;
  contactPoint?: {
    telephone: string;
    contactType: string;
    email?: string;
  };
  socialProfiles?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
  };
}

interface BlogPostSchema {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  authorUrl?: string;
  image?: string;
  category?: string;
}

interface FAQSchema {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

interface ServiceSchema {
  name: string;
  description: string;
  url: string;
  provider: {
    name: string;
    url: string;
  };
  areaServed?: string;
  image?: string;
}

interface ProductSchema {
  name: string;
  description: string;
  url: string;
  image?: string;
  brand?: string;
  price?: string;
  currency?: string;
}

interface SchemaOrgProps {
  website?: WebsiteSchema;
  organization?: OrganizationSchema;
  blogPost?: BlogPostSchema;
  faq?: FAQSchema;
  service?: ServiceSchema;
  product?: ProductSchema;
}

export const SchemaOrg = ({
  website,
  organization,
  blogPost,
  faq,
  service,
  product,
}: SchemaOrgProps = {}) => {
  try {
    // Create a simplified schema array
    const schemas = [];

    // Website Schema
    if (website) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: website.name,
        url: website.url,
        description: website.description || "",
      });
    }

    // Organization Schema
    if (organization) {
      // Use a properly typed object
      interface OrgSchema {
        "@context": string;
        "@type": string;
        name: string;
        url: string;
        logo: string;
        description: string;
        sameAs?: string[];
      }

      const orgSchema: OrgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: organization.name,
        url: organization.url,
        logo: organization.logo,
        description: organization.description || "",
      };

      // Add social profiles if available
      if (organization.socialProfiles) {
        const sameAs: string[] = [];
        if (organization.socialProfiles.twitter)
          sameAs.push(organization.socialProfiles.twitter);
        if (organization.socialProfiles.linkedin)
          sameAs.push(organization.socialProfiles.linkedin);
        if (organization.socialProfiles.facebook)
          sameAs.push(organization.socialProfiles.facebook);

        if (sameAs.length > 0) {
          orgSchema.sameAs = sameAs;
        }
      }

      schemas.push(orgSchema);
    }

    // Blog Post Schema
    if (blogPost) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: blogPost.title,
        description: blogPost.description,
        url: blogPost.url,
        datePublished: blogPost.datePublished,
        dateModified: blogPost.dateModified || blogPost.datePublished,
        image: blogPost.image,
        author: {
          "@type": "Person",
          name: blogPost.authorName,
          url: blogPost.authorUrl,
        },
        publisher: organization
          ? {
              "@type": "Organization",
              name: organization.name,
              logo: {
                "@type": "ImageObject",
                url: organization.logo,
              },
            }
          : undefined,
        articleSection: blogPost.category,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": blogPost.url,
        },
      });
    }

    // FAQ Schema
    if (faq && faq.questions.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.questions.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      });
    }

    // Service Schema
    if (service) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Service",
        name: service.name,
        description: service.description,
        url: service.url,
        provider: {
          "@type": "Organization",
          name: service.provider.name,
          url: service.provider.url,
        },
        areaServed: service.areaServed,
        image: service.image,
      });
    }

    // Product Schema
    if (product) {
      interface ProductSchemaType {
        "@context": string;
        "@type": string;
        name: string;
        description: string;
        url: string;
        image?: string;
        brand?: {
          "@type": string;
          name: string;
        };
        offers?: {
          "@type": string;
          price: string;
          priceCurrency: string;
          availability: string;
        };
      }

      const productSchema: ProductSchemaType = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        url: product.url,
        image: product.image,
      };

      if (product.brand) {
        productSchema.brand = {
          "@type": "Brand",
          name: product.brand,
        };
      }

      if (product.price) {
        productSchema.offers = {
          "@type": "Offer",
          price: product.price,
          priceCurrency: product.currency || "USD",
          availability: "https://schema.org/InStock",
        };
      }

      schemas.push(productSchema);
    }

    // Default minimal schema if no props provided
    if (schemas.length === 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Bridging Trust AI",
        url: "https://bridgingtrustai.com",
      });
    }

    // Serialize as a single schema or array depending on number of items
    const jsonData = schemas.length === 1 ? schemas[0] : schemas;

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonData),
        }}
      />
    );
  } catch (error) {
    console.error("Error rendering SchemaOrg component:", error);
    return null;
  }
};
