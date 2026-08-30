import AboutClient from "./AboutClient";
import { SITE_CONFIG } from "@/lib/seo";

export const metadata = {
  title: "About — BoringTools (100 Days, 100 Tools)",
  description:
    "The story behind BoringTools: A 101-tool browser utility ecosystem built open-source by solo developer Ayush Sharma.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/about`,
  },
  openGraph: {
    title: "About | BoringTools",
    description:
      "The story behind BoringTools: A 101-tool browser utility ecosystem built open-source by solo developer Ayush Sharma.",
    url: `${SITE_CONFIG.url}/about`,
    siteName: SITE_CONFIG.name,
    type: "website",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
