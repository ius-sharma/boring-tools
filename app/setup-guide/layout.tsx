import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Setup & Developer Guide — BoringTools",
  description:
    "Developer setup documentation and local execution guide for the BoringTools ecosystem.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/setup-guide`,
  },
  openGraph: {
    title: "Setup & Developer Guide | BoringTools",
    description:
      "Developer setup documentation and local execution guide for the BoringTools ecosystem.",
    url: `${SITE_CONFIG.url}/setup-guide`,
    siteName: SITE_CONFIG.name,
    type: "website",
  },
};

export default function SetupGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
