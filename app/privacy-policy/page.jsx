import Link from "next/link";
import { SITE_CONFIG } from "@/lib/seo";
import MultilingualNotice from "./MultilingualNotice";

export const metadata = {
  title: "Privacy Policy (DPDP Act 2023 Compliant) — BoringTools",
  description:
    "BoringTools Privacy Policy compliant with India's Digital Personal Data Protection Act, 2023 (DPDP Act). Learn about our 100% client-side zero-storage architecture, Data Principal rights, and Grievance Redressal Mechanism.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/privacy-policy`,
  },
  openGraph: {
    title: "Privacy Policy (DPDP Act 2023 Compliant) | BoringTools",
    description:
      "BoringTools Privacy Policy compliant with India's Digital Personal Data Protection Act, 2023 (DPDP Act). Learn about our 100% client-side zero-storage architecture, Data Principal rights, and Grievance Redressal Mechanism.",
    url: `${SITE_CONFIG.url}/privacy-policy`,
    siteName: SITE_CONFIG.name,
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <main className="mx-auto max-w-4xl bg-white p-6 sm:p-12 rounded-3xl border border-slate-200/80 shadow-sm">
        
        {/* Header Badge & Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Digital Personal Data Protection Act, 2023 (DPDP Act) Compliant
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Last Updated &amp; In Effect: September 2026 • Effective Jurisdiction: India &amp; Worldwide
          </p>
        </div>

        {/* Executive Summary Callout */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl mb-10 shadow-md">
          <h2 className="text-lg sm:text-xl font-bold text-orange-400 mb-2">
            Our Core Privacy Commitment: 100% Client-Side Processing
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            BoringTools operates on a strict <strong>&ldquo;Zero Server Storage&rdquo;</strong> and <strong>&ldquo;Client-First&rdquo;</strong> architecture. Your images, PDFs, videos, calculations, and sensitive files are processed locally inside your web browser using WebAssembly (WASM) and client-side JavaScript. <strong>Your user files never reach our servers, are never logged, and are never saved to any database.</strong>
          </p>
        </div>

        {/* Multilingual Notice Component per DPDP Section 5(3) */}
        <MultilingualNotice />

        {/* Policy Body */}
        <div className="space-y-12 text-slate-700 leading-relaxed text-sm sm:text-base">
          
          {/* Section 1 */}
          <section id="statutory-framework" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-orange-600">1.</span> Statutory Framework &amp; Scope
            </h2>
            <p className="mb-4">
              This Privacy Policy is formulated in strict accordance with the provisions of the <strong>Digital Personal Data Protection Act, 2023 (&ldquo;DPDP Act&rdquo;)</strong> of India and applicable electronic privacy regulations. For the purposes of the DPDP Act:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>
                <strong>Data Fiduciary:</strong> BoringTools (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), accessible at{" "}
                <a href="https://boringtoolsai.com" className="text-orange-600 font-semibold hover:underline">
                  boringtoolsai.com
                </a>
                , determining the purpose and means of personal data processing.
              </li>
              <li>
                <strong>Data Principal:</strong> You, the natural person accessing or utilizing BoringTools to whom personal data relates.
              </li>
              <li>
                <strong>Digital Personal Data:</strong> Any data by or in relation to which you as an individual can be identified, rendered in digital form.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section id="client-side-architecture" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-orange-600">2.</span> 100% Client-Side Architecture (Zero File Retention)
            </h2>
            <p className="mb-4">
              Unlike traditional cloud software platforms that ingest user files onto centralized backend servers, BoringTools is engineered from the ground up for edge execution:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-1">Local Browser Execution</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Image compression, PDF merging, audio extraction, OCR parsing, and mathematical calculations execute within your browser sandbox via WebAssembly (WASM).
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-1">Zero Cloud Uploads</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Your files, documents, and inputs are never transmitted to our backend infrastructure, third-party cloud buckets, or external AI models for storage.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-1">No Keystroke or Screen Replay</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  We strictly refrain from using intrusive tracking suites (such as Hotjar, Clarity, or FullStory). We do not record keystrokes or record screen sessions.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-1">Ephemeral Memory Lifetime</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Any temporary RAM allocated by your browser to process a file is instantly freed when you close or refresh the browser tab.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="categories-of-data" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-orange-600">3.</span> Categories of Personal Data Processed
            </h2>
            <p className="mb-4">
              In accordance with Section 4 and Section 5 of the DPDP Act, personal data is processed solely for lawful purposes where you have given consent or for legitimate uses specified by law:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-900">
                    <th className="p-3 border-b border-slate-200 font-semibold">Category</th>
                    <th className="p-3 border-b border-slate-200 font-semibold">Data Items</th>
                    <th className="p-3 border-b border-slate-200 font-semibold">Purpose &amp; Legal Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-600">
                  <tr>
                    <td className="p-3 font-medium text-slate-800">Authentication &amp; Account</td>
                    <td className="p-3">Email address, encrypted password hash (managed via Supabase Auth)</td>
                    <td className="p-3">User authentication, subscription entitlement, and security. Processed only when an account is registered.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-800">Network &amp; Security Logs</td>
                    <td className="p-3">Transient IP address, user-agent string, timestamp, request URL</td>
                    <td className="p-3">DDoS mitigation, rate-limiting, and web application firewall security via Vercel edge infrastructure.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-800">Local Browser Storage</td>
                    <td className="p-3">localStorage / sessionStorage keys (theme dark/light, recent tool history)</td>
                    <td className="p-3">Convenience and UI persistence. Stored exclusively on your device; never sent to server databases.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-800">Usage Telemetry</td>
                    <td className="p-3">Aggregated page views, performance metrics via Vercel Analytics</td>
                    <td className="p-3">Privacy-friendly, cookieless metrics to identify broken tools and maintain system uptime.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-800">Advertising &amp; Monetization</td>
                    <td className="p-3">Advertising identifiers &amp; non-personalized cookie tags (Google AdSense)</td>
                    <td className="p-3">Ad serving in compliance with user preferences and strict exclusions for children&apos;s data.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4 */}
          <section id="childrens-privacy" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-orange-600">4.</span> Children&apos;s Privacy &amp; 18+ Age Requirement (Section 9)
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-4 text-amber-950">
              <p className="font-semibold mb-1">
                Statutory Mandate under Section 2(f) and Section 9 of the DPDP Act:
              </p>
              <p className="text-xs sm:text-sm">
                Under Indian law, a &ldquo;child&rdquo; is defined as an individual who has not completed 18 years of age. BoringTools is intended exclusively for adults aged 18 and older.
              </p>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>
                <strong>No Account Creation for Minors:</strong> Individuals under the age of 18 are not permitted to register accounts or purchase subscriptions on BoringTools.
              </li>
              <li>
                <strong>Prohibition of Behavioral Tracking:</strong> As mandated by Section 9(2) and Section 9(3) of the DPDP Act, BoringTools does not engage in tracking or behavioral monitoring of children, nor does it serve targeted advertisements directed at minors.
              </li>
              <li>
                <strong>Immediate Data Deletion:</strong> If we obtain actual knowledge that personal data of an individual under 18 has been collected without verifiable parental or guardian consent, we will take immediate steps to permanently delete such information from our authentication stores.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="data-principal-rights" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-orange-600">5.</span> Rights of the Data Principal (Sections 11–14)
            </h2>
            <p className="mb-4">
              Under Chapter III of the DPDP Act, 2023, you enjoy statutory rights regarding your digital personal data:
            </p>
            
            <div className="space-y-4">
              <div className="border border-slate-200 p-4 rounded-xl">
                <h3 className="font-semibold text-slate-900 text-base">
                  A. Right to Access Information (Section 11)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  You have the right to obtain a summary of personal data being processed by us, a description of processing activities, and the identities of all third-party Data Processors with whom personal data has been shared.
                </p>
              </div>

              <div className="border border-slate-200 p-4 rounded-xl">
                <h3 className="font-semibold text-slate-900 text-base">
                  B. Right to Correction and Erasure (Section 12)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  You have the right to request correction of inaccurate or misleading personal data, completion of incomplete data, updating of obsolete data, and total erasure of personal data that is no longer necessary for the purpose for which it was collected.
                </p>
              </div>

              <div className="border border-slate-200 p-4 rounded-xl">
                <h3 className="font-semibold text-slate-900 text-base">
                  C. Right of Grievance Redressal (Section 13)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  You have the right to readily accessible grievance redressal provided by BoringTools in respect of any act or omission regarding personal data rights and fiduciary obligations.
                </p>
              </div>

              <div className="border border-slate-200 p-4 rounded-xl">
                <h3 className="font-semibold text-slate-900 text-base">
                  D. Right to Nominate (Section 14)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  You have the right to nominate, in accordance with applicable rules, any other individual who shall, in the event of your death or incapacity, exercise your rights as a Data Principal.
                </p>
              </div>

              <div className="border border-slate-200 p-4 rounded-xl">
                <h3 className="font-semibold text-slate-900 text-base">
                  E. Right to Withdraw Consent
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Where processing is based on consent, you may withdraw your consent at any time with the same ease as it was given. Following withdrawal, we will cease processing unless otherwise permitted or required by law.
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-600">
              <strong>How to Exercise:</strong> To exercise any of these statutory rights, please send a written request to our Grievance Officer at{" "}
              <a href="mailto:grievance@boringtoolsai.com" className="text-orange-600 font-semibold underline">
                grievance@boringtoolsai.com
              </a>
              . We will verify your identity and process your request within the statutory timeframe.
            </div>
          </section>

          {/* Section 6 */}
          <section id="grievance-redressal-mechanism" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-orange-600">6.</span> Grievance Redressal Mechanism &amp; Officer Details
            </h2>
            <p className="mb-4">
              In compliance with Section 13 of the DPDP Act and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, BoringTools has appointed a dedicated Grievance Officer:
            </p>

            {/* Officer Card */}
            <div className="border-2 border-slate-900/10 rounded-2xl p-6 bg-gradient-to-r from-slate-50 to-orange-50/30 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-500 uppercase tracking-wider text-xs block font-semibold">Name</span>
                  <span className="text-base font-bold text-slate-900">Ayush Sharma</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-wider text-xs block font-semibold">Designation</span>
                  <span className="text-base font-bold text-slate-900">Grievance Officer &amp; Data Protection Lead</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-wider text-xs block font-semibold">Official Email</span>
                  <a href="mailto:grievance@boringtoolsai.com" className="text-orange-600 font-semibold hover:underline">
                    grievance@boringtoolsai.com
                  </a>
                  <span className="block text-slate-500 text-xs mt-0.5">(Fallback: hello@boringtoolsai.com)</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-wider text-xs block font-semibold">Jurisdiction &amp; Location</span>
                  <span className="text-slate-900 font-semibold">India</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">✓</span>
                  <span><strong>Acknowledgement:</strong> Within 48 hours of receipt</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">✓</span>
                  <span><strong>Substantive Resolution:</strong> Within 30 calendar days</span>
                </div>
              </div>
            </div>

            {/* DPBI Escalation */}
            <div className="border border-orange-200 bg-orange-50/50 rounded-xl p-5">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-2 flex items-center gap-2">
                <span>Escalation to Data Protection Board of India (DPBI)</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3">
                If you do not receive an acknowledgement or resolution from our Grievance Officer within 30 days, or if you are unsatisfied with the resolution provided, you have the statutory right under <strong>Section 13(3) and Chapter V of the DPDP Act</strong> to register a complaint directly with the:
              </p>
              <div className="p-3 bg-white rounded-lg border border-orange-200 text-xs sm:text-sm font-medium text-slate-800">
                <strong>Data Protection Board of India (DPBI)</strong><br />
                Established by the Central Government of India under Section 18 of the Digital Personal Data Protection Act, 2023.<br />
                <span className="text-slate-500 text-xs">Official filings can be submitted through the DPBI digital portal once operationalized per official government gazette.</span>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section id="third-party-services" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-orange-600">7.</span> Third-Party Data Processors &amp; Transfers
            </h2>
            <p className="mb-3">
              We work with select enterprise service providers who act as Data Processors under strict confidentiality obligations:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 text-xs sm:text-sm">
              <li>
                <strong>Supabase Inc.</strong> — User authentication and subscription status records. Data is encrypted at rest and in transit.
              </li>
              <li>
                <strong>Vercel Inc.</strong> — Global CDN routing, serverless edge compute, and privacy-preserving aggregated telemetry.
              </li>
              <li>
                <strong>Google AdSense</strong> — Programmatic advertising displayed in accordance with user consent and strict age boundaries.
              </li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Cross-border transfers of personal data are conducted strictly in compliance with Section 16 of the DPDP Act and Central Government blacklists/guidelines.
            </p>
          </section>

          {/* Section 8 */}
          <section id="data-retention-security" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-orange-600">8.</span> Data Security &amp; Retention Standards
            </h2>
            <p className="mb-3">
              Under Section 8(5) of the DPDP Act, BoringTools employs robust reasonable security safeguards to prevent personal data breaches:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-slate-600 text-xs sm:text-sm">
              <li>TLS 1.3 / HTTPS encryption across all browser-to-server traffic.</li>
              <li>Row-Level Security (RLS) on Supabase databases to isolate user profile data.</li>
              <li>Strict minimization: User tool files are never logged, cached, or transferred to disk.</li>
              <li>Zero retention of non-registered visitors&apos; calculation or tool outputs.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section id="updates-modifications" className="scroll-mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-orange-600">9.</span> Policy Modifications
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              We may update this Privacy Policy from time to time to reflect changes in regulatory standards or tool functionality. Material updates will be highlighted on this page with an updated &ldquo;In Effect&rdquo; date. Continued usage of BoringTools constitutes your acknowledgment of the updated policy.
            </p>
          </section>

          {/* Section 10 */}
          <section id="contact-and-inquiries" className="scroll-mt-8 pt-4 border-t border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-orange-600">10.</span> Contact &amp; General Inquiries
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-4">
              For general feedback, feature requests, or queries regarding our client-side tools, visit our{" "}
              <Link href="/contact" className="text-orange-600 font-semibold hover:underline">
                Contact Page
              </Link>
              . For privacy notices and statutory Data Principal rights, email{" "}
              <a href="mailto:grievance@boringtoolsai.com" className="text-orange-600 font-semibold hover:underline">
                grievance@boringtoolsai.com
              </a>
              .
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/terms-of-service"
                className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition"
              >
                View Terms of Service &rarr;
              </Link>
              <Link
                href="/"
                className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition"
              >
                Back to Tools Directory &rarr;
              </Link>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
