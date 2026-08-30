import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Billing & Subscription Management — BoringTools",
  description:
    "Manage your BoringTools account subscription, invoices, and credit balance.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/billing`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
