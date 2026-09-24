import { SITE_CONFIG } from "@/lib/seo";

export const metadata = {
  title: "Privacy Policy — BoringTools",
  description:
    "Learn how BoringTools protects your privacy with 100% client-side computing, zero tracking, and local device processing.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/privacy-policy`,
  },
  openGraph: {
    title: "Privacy Policy | BoringTools",
    description:
      "Learn how BoringTools protects your privacy with 100% client-side computing, zero tracking, and local device processing.",
    url: `${SITE_CONFIG.url}/privacy-policy`,
    siteName: SITE_CONFIG.name,
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-12 font-sans">
      <main className="mx-auto max-w-4xl bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
        <p className="text-slate-700 text-base sm:text-lg leading-relaxed mb-6">
          At BoringTools (accessible at <a href="https://boringtoolsai.com" className="text-orange-600 font-semibold hover:underline">boringtoolsai.com</a>), the privacy of our visitors is our primary priority. This Privacy Policy document outlines the types of information we handle and our commitment to client-side data privacy.
        </p>

        <section className="space-y-6 text-slate-700 leading-relaxed">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">1. Client-First Architecture</h2>
            <p>
              BoringTools operates as a client-side utility suite. Your calculations, image compressions, PDF parsing, OCR conversions, and operations are performed directly inside your web browser. We do not store, upload, or transmit your files, credentials, or personal input data to any external servers.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">2. Cookies and Web Storage</h2>
            <p>
              Like many modern web apps, BoringTools uses standard browser storage (such as localStorage and sessionStorage) solely to preserve your tool settings, theme preferences, and locally saved calculations. None of this data is transmitted or sold to third parties.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">3. Third-Party Services & Analytics</h2>
            <p>
              We may utilize privacy-friendly analytics (such as Vercel Analytics) and Google AdSense for service maintenance. These providers may use basic technical signals (such as IP addresses and browser types) in accordance with their respective privacy policies.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">4. Children&apos;s Privacy (COPPA Compliance)</h2>
            <p>
              BoringTools is intended for general audiences aged 13 and older (or 16 in jurisdictions where required by law, such as the EU and UK). We do not knowingly collect, solicit, or maintain personal identifiable information from children under the age of 13. If you believe a child under 13 has registered an account or provided us with personal information, please contact us immediately and we will promptly delete that information from our records.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">5. Zero Keystroke Logging &amp; No Session Replay</h2>
            <p>
              We do not run invasive session replay scripts (such as Hotjar, Clarity, or FullStory) or keystroke loggers. Any text, numbers, or documents entered into our tools, calculators, or converters remain strictly isolated within your browser memory and are never monitored or recorded.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">6. Contact Us</h2>
            <p>
              If you have any questions or suggestions about our Privacy Policy, please reach out through our <a href="/contact" className="text-orange-600 font-semibold hover:underline">Contact Page</a> or via GitHub.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
