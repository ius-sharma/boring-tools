import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Create Free Account — BoringTools",
  description: "Join BoringTools for free to unlock daily AI credits, saved calculation history, and bookmarks.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/signup`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
