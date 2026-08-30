import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Pricing & Plans — Free & Lifetime Pro Access",
  description:
    "Explore transparent pricing for BoringTools. Use 70+ utilities 100% free with unlimited local processing, or upgrade for higher AI compute limits.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/pricing`,
  },
  openGraph: {
    title: "Pricing & Plans | BoringTools",
    description:
      "Explore transparent pricing for BoringTools. Use 70+ utilities 100% free with unlimited local processing, or upgrade for higher AI compute limits.",
    url: `${SITE_CONFIG.url}/pricing`,
    siteName: SITE_CONFIG.name,
    type: "website",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
