import type { Metadata } from "next";
import type { Tool } from "@/app/tools-data";

export const SITE_CONFIG = {
  name: "BoringTools",
  title: "BoringTools — 100 Days. 100 Free Browser-First Tools.",
  description:
    "Fast, private browser-first micro-tools with zero sign-up and 100% client-side privacy. Free image editing, PDF utilities, converters, calculators, and developer tools.",
  url: "https://boringtools.vercel.app",
  author: "Ayush Sharma",
  authorUrl: "https://github.com/ius-sharma",
  links: {
    github: "https://github.com/ius-sharma/boring-tools",
    instagram: "https://www.instagram.com/ius.sharma",
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
  const cleanTitle = `${tool.name} — Free Browser Tool`;
  const cleanDesc = `${tool.description} Fast, free, and 100% private in your browser with zero sign-up.`;

  return {
    title: cleanTitle,
    description: cleanDesc,
    keywords: [
      tool.name,
      `${tool.name} online`,
      `free ${tool.name.toLowerCase()}`,
      tool.category,
      "browser utility",
      "boring tools",
      "client-side tool",
    ],
    alternates: {
      canonical: toolUrl,
    },
    openGraph: {
      title: `${tool.name} | BoringTools`,
      description: cleanDesc,
      url: toolUrl,
      siteName: SITE_CONFIG.name,
      type: "website",
      images: [
        {
          url: `${SITE_CONFIG.url}/boringtools-logo.png`,
          width: 1200,
          height: 630,
          alt: `${tool.name} — BoringTools`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} | BoringTools`,
      description: cleanDesc,
      images: [`${SITE_CONFIG.url}/boringtools-logo.png`],
    },
  };
}
