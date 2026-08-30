import type { Metadata, Viewport } from "next";
import HomeButton from "./components/HomeButton";
import NavBar from "./components/NavBar";
import ToolContentFooter from "./components/ToolContentFooter";
import StructuredData from "./components/StructuredData";
import { getWebSiteSchema, getOrganizationSchema, SITE_CONFIG } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = { variable: "font-sans" };
const geistMono = { variable: "font-mono" };

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: "BoringTools — 100 Days 100 Tools (Free & Browser-First)",
    template: "%s | BoringTools",
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  authors: [{ name: SITE_CONFIG.author, url: SITE_CONFIG.authorUrl }],
  creator: SITE_CONFIG.author,
  publisher: SITE_CONFIG.name,
  keywords: [
    "BoringTools",
    "browser tools",
    "free online tools",
    "developer utilities",
    "pdf tools",
    "image compressor",
    "background remover",
    "client-side privacy",
    "100 days 100 tools",
  ],
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/boringtools-logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/boringtools-logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icon.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "BoringTools — 100 Free Browser-First Micro-Tools",
    description:
      "Fast, private browser utilities with zero sign-up and 100% client-side privacy. Video editing, PDF intelligence, converters, and calculators in your browser.",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_CONFIG.url}/boringtools-logo.png`,
        width: 1200,
        height: 630,
        alt: "BoringTools — 100 Days 100 Browser Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BoringTools — 100 Free Browser-First Micro-Tools",
    description:
      "100% client-side privacy. Fast, free micro-tools for media, PDFs, documents, developer utilities, and calculations.",
    creator: "@ius_sharma",
    images: [`${SITE_CONFIG.url}/boringtools-logo.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "google-adsense-account": "ca-pub-7528581776456991",
  },
};

import { AuthProvider } from "./components/AuthProvider";
import AuthModal from "./components/AuthModal";
import UpgradeModal from "./components/UpgradeModal";
import PaymentSuccessModal from "./components/PaymentSuccessModal";
import ToastNotification from "./components/ToastNotification";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = getWebSiteSchema();
  const orgSchema = getOrganizationSchema();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <StructuredData data={[websiteSchema, orgSchema]} />
        <meta name="google-adsense-account" content="ca-pub-7528581776456991" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7528581776456991"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <NavBar />
          <div className="fixed inset-x-0 top-0 z-50 flex items-start justify-end gap-3 p-3 sm:p-4 pointer-events-none">
            <HomeButton />
          </div>
          <Analytics />
          {children}
          <ToolContentFooter />
          <AuthModal />
          <UpgradeModal />
          <PaymentSuccessModal />
          <ToastNotification />
        </AuthProvider>
      </body>
    </html>
  );
}
