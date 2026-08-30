import ContactClient from "./ContactClient";
import { SITE_CONFIG } from "@/lib/seo";

export const metadata = {
  title: "Contact — BoringTools",
  description:
    "Contact BoringTools creator Ayush Sharma for feedback, support, bug reports, or open-source collaboration.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/contact`,
  },
  openGraph: {
    title: "Contact | BoringTools",
    description:
      "Contact BoringTools creator Ayush Sharma for feedback, support, bug reports, or open-source collaboration.",
    url: `${SITE_CONFIG.url}/contact`,
    siteName: SITE_CONFIG.name,
    type: "website",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
