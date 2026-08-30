import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of Service — BoringTools",
  description:
    "Review the terms of service, usage guidelines, and intellectual property terms for using BoringTools.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/terms-of-service`,
  },
  openGraph: {
    title: "Terms of Service | BoringTools",
    description:
      "Review the terms of service, usage guidelines, and intellectual property terms for using BoringTools.",
    url: `${SITE_CONFIG.url}/terms-of-service`,
    siteName: SITE_CONFIG.name,
    type: "website",
  },
};

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
