import type { Metadata } from "next";
import type { Tool } from "@/app/tools-data";

export const SITE_CONFIG = {
  name: "BoringTools",
  title: "BoringTools — Micro-Tools for Everyday Tasks",
  description:
    "Micro-tools for everyday tasks. Fast, simple utilities with no signups, no clutter, and no tracking. Just get the job done.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://boringtoolsai.com").replace(/\/$/, ""),
  author: "Ayush Sharma",
  authorUrl: "https://github.com/ius-sharma",
  links: {
    github: "https://github.com/ius-sharma/boring-tools",
    instagram: "https://www.instagram.com/ocn.ayush07/",
    authorGithub: "https://github.com/ius-sharma",
  },
};

/**
 * Generates Root WebSite JSON-LD Schema
 */
export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      logo: `${SITE_CONFIG.url}/boringtools-logo.png`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_CONFIG.url}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generates Organization & Local Business Schema
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/boringtools-logo.png`,
    description: SITE_CONFIG.description,
    founder: {
      "@type": "Person",
      name: SITE_CONFIG.author,
      url: SITE_CONFIG.authorUrl,
    },
    sameAs: [
      SITE_CONFIG.links.github,
      SITE_CONFIG.links.instagram,
      SITE_CONFIG.links.authorGithub,
    ],
  };
}

/**
 * Generates WebApplication Schema for individual micro-tools
 */
export function getWebApplicationSchema(tool: {
  name: string;
  href: string;
  description: string;
  category: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    url: `${SITE_CONFIG.url}${tool.href}`,
    description: tool.description,
    applicationCategory: tool.category,
    operatingSystem: "All (Web Browser)",
    browserRequirements: "Requires JavaScript. Requires modern HTML5 browser.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "128",
      bestRating: "5",
      worstRating: "1",
    },
    author: {
      "@type": "Person",
      name: SITE_CONFIG.author,
      url: SITE_CONFIG.authorUrl,
    },
  };
}

/**
 * Generates BreadcrumbList Schema
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http")
        ? item.url
        : `${SITE_CONFIG.url}${item.url}`,
    })),
  };
}

/**
 * Generates FAQPage Schema
 */
export function getFaqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

/**
 * Generates comprehensive Next.js Metadata for any tool
 */
export function constructToolMetadata(tool: Tool): Metadata {
  const toolUrl = `${SITE_CONFIG.url}${tool.href}`;
  const cleanTitle = tool.seoTitle || `${tool.name} — Free Browser Tool`;
  const cleanDesc =
    tool.seoDescription ||
    `${tool.description} Fast, free, and 100% private in your browser with zero sign-up.`;

  const combinedKeywords = [
    ...(tool.keywords || []),
    tool.name,
    `${tool.name} online`,
    `free ${tool.name.toLowerCase()}`,
    tool.category,
    "browser utility",
    "boring tools",
    "client-side tool",
  ];

  return {
    title: cleanTitle,
    description: cleanDesc,
    keywords: Array.from(new Set(combinedKeywords)),
    alternates: {
      canonical: toolUrl,
    },
    openGraph: {
      title: cleanTitle,
      description: cleanDesc,
      url: toolUrl,
      siteName: SITE_CONFIG.name,
      type: "website",
      images: [
        {
          url: `${SITE_CONFIG.url}/boringtools-logo.png`,
          width: 1200,
          height: 630,
          alt: cleanTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: cleanTitle,
      description: cleanDesc,
      creator: "@ius_sharma",
      images: [`${SITE_CONFIG.url}/boringtools-logo.png`],
    },
  };
}
