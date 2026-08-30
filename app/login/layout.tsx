import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Sign In — BoringTools",
  description: "Sign in to your BoringTools account to sync your preferences and daily AI credits.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/login`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
