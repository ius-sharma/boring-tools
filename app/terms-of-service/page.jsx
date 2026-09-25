"use client";

import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 sm:py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-4xl bg-white p-6 sm:p-12 rounded-3xl border border-slate-200/80 shadow-sm">
        
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold uppercase tracking-wider mb-4">
            <span>Governed by the Laws of India &amp; DPDP Act 2023</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Last updated: September 2026 • Effective for all users
          </p>
        </div>

        {/* Executive Summary Card */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl mb-10 shadow-md">
          <h2 className="text-lg sm:text-xl font-bold text-orange-400 mb-2">
            Summary of Key Terms &amp; 18+ Age Eligibility
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            By accessing BoringTools, you confirm that you are at least <strong>18 years of age</strong> in accordance with India&apos;s <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>. All tool calculations, media compression, and file operations execute directly within your local browser with zero server file storage.
          </p>
        </div>
        
        <div className="space-y-10 text-slate-700 leading-relaxed text-sm sm:text-base">
          
          {/* Section 1 */}
          <section id="acceptance">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-orange-600">1.</span> Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or using BoringTools (accessible at{" "}
              <a href="https://boringtoolsai.com" className="text-orange-600 font-semibold hover:underline">
                boringtoolsai.com
              </a>{" "}
              and referred to as &ldquo;Service&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), you accept and agree to be bound by these Terms of Service and our{" "}
              <Link href="/privacy-policy" className="text-orange-600 font-semibold hover:underline">
                Privacy Policy
              </Link>
              . If you do not agree to these terms, you must discontinue using BoringTools immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section id="eligibility-age-restriction">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-orange-600">2.</span> Eligibility &amp; Age Restriction (DPDP Act 2023 Sections 2(f) &amp; 9)
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-4 text-amber-950">
              <p className="font-semibold mb-1">
                Strict 18+ Requirement:
              </p>
              <p className="text-xs sm:text-sm">
                Under Section 2(f) of India&apos;s Digital Personal Data Protection Act, 2023, a &ldquo;child&rdquo; is defined as an individual who has not completed 18 years of age. Section 9 strictly restricts processing and prohibits tracking of minors.
              </p>
            </div>
            <p className="mb-3">
              You must be at least <strong>18 years of age</strong> (or the age of legal majority in your country of residence) to register an account, utilize account-based features, or purchase subscriptions on BoringTools. By accessing our platform or creating an account, you represent and warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 text-xs sm:text-sm">
              <li>You are at least 18 years of age and possess the legal capacity to enter into a binding contract.</li>
              <li>You will not permit any individual under the age of 18 to access or use account-based features of BoringTools under your credentials.</li>
              <li>You acknowledge that BoringTools does not engage in behavioral monitoring, tracking, or targeted advertising directed at children, in compliance with Section 9(2) and Section 9(3) of the DPDP Act.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="client-side-processing">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-orange-600">3.</span> Client-Side Processing &amp; User Content Ownership
            </h2>
            <p className="mb-3">
              BoringTools is architected around 100% client-side compute. All file compressions, format conversions, PDF operations, media parsing, and computational algorithms execute locally inside your web browser sandbox using WebAssembly and client-side JavaScript.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 text-xs sm:text-sm">
              <li>
                <strong>No Server Storage:</strong> BoringTools does not upload, host, log, or maintain copies of your files, source media, or calculation inputs on external servers.
              </li>
              <li>
                <strong>Complete Intellectual Property Ownership:</strong> You retain 100% ownership, copyright, and intellectual property rights in and to any text, images, audio, video, or documents processed through our tools.
              </li>
              <li>
                <strong>User Responsibility:</strong> You are solely responsible for ensuring that you have all necessary legal rights, licenses, and permissions for any content you process using the Service.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="data-principal-duties">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-orange-600">4.</span> Duties of the Data Principal (DPDP Act Section 15)
            </h2>
            <p className="mb-3">
              In accordance with Section 15 of the Digital Personal Data Protection Act, 2023, while availing services and exercising your statutory rights as a Data Principal, you agree to comply with the following statutory duties:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/60">
                <h3 className="font-semibold text-slate-900 text-sm mb-1">No Impersonation</h3>
                <p className="text-xs text-slate-600">
                  You shall not impersonate another person while providing your personal data to BoringTools for account creation or verification (Section 15(a)).
                </p>
              </div>
              <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/60">
                <h3 className="font-semibold text-slate-900 text-sm mb-1">No Suppression of Facts</h3>
                <p className="text-xs text-slate-600">
                  You shall not suppress any material information when providing personal data for any document or service provided by BoringTools (Section 15(b)).
                </p>
              </div>
              <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/60">
                <h3 className="font-semibold text-slate-900 text-sm mb-1">Authentic Information</h3>
                <p className="text-xs text-slate-600">
                  You shall furnish only verifiably authentic and accurate information when exercising the right to data correction or erasure (Section 15(d)).
                </p>
              </div>
              <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/60">
                <h3 className="font-semibold text-slate-900 text-sm mb-1">No Frivolous Complaints</h3>
                <p className="text-xs text-slate-600">
                  You shall not register a false, frivolous, or malicious grievance with our Grievance Officer or the Data Protection Board of India (Section 15(c)).
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="subscriptions-billing">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-orange-600">5.</span> Subscriptions, Automatic Renewal &amp; Cancellation
            </h2>
            <p className="mb-3">
              While the majority of BoringTools utilities are free and require no account registration, select premium tiers (such as Starter or Pro) may provide extended batch processing and increased rate limits.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 text-xs sm:text-sm">
              <li>
                <strong>Billing Cycles:</strong> Paid plans renew automatically at the end of each recurring billing period (monthly or annually) using your authorized payment method on file, unless cancelled before the renewal date.
              </li>
              <li>
                <strong>1-Click Cancellation:</strong> You can cancel your subscription at any time with one click through your Billing Settings or by contacting support. Your access will remain active until the conclusion of your prepaid billing period with no subsequent charges.
              </li>
              <li>
                <strong>Refunds:</strong> Unless required by mandatory Indian consumer law or statutory directives, subscription payments are non-refundable for partial billing cycles.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section id="license-use">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-orange-600">6.</span> Acceptable Use License &amp; Restrictions
            </h2>
            <p className="mb-3">
              We grant you a personal, non-exclusive, non-transferable, revocable license to access and use BoringTools solely for lawful purposes. You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 text-xs sm:text-sm">
              <li>Use the Service to process unlawful, defamatory, infringing, or malicious content.</li>
              <li>Attempt to reverse engineer, decompile, disable, or circumvent any security or authentication mechanism of the platform.</li>
              <li>Conduct automated scraping, denial-of-service (DoS) attacks, or excessive bandwidth abuse that disrupts service stability for other users.</li>
              <li>Mirror, re-sell, or sublicense the BoringTools application interface without our prior written consent.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section id="disclaimer-limitations">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-orange-600">7.</span> Disclaimers &amp; Limitation of Liability
            </h2>
            <p className="mb-3">
              The services, tools, converters, and information on BoringTools are provided on an <strong>&ldquo;AS IS&rdquo;</strong> and <strong>&ldquo;AS AVAILABLE&rdquo;</strong> basis without warranties of any kind, whether express, implied, or statutory, including warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>
            <p className="text-xs sm:text-sm text-slate-600">
              To the maximum extent permitted by applicable law, BoringTools and its operators, affiliates, and licensors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data corruption, or operational interruption arising out of your access or inability to access our services.
            </p>
          </section>

          {/* Section 8 */}
          <section id="governing-law">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-orange-600">8.</span> Governing Law &amp; Dispute Resolution
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-3">
              These Terms of Service and any contractual or non-contractual disputes arising hereunder shall be governed by and construed in accordance with the substantive laws of <strong>India</strong>, including the Digital Personal Data Protection Act, 2023 and the Information Technology Act, 2000.
            </p>
            <p className="text-xs sm:text-sm text-slate-600">
              Subject to statutory dispute escalation provisions before the Data Protection Board of India (DPBI) for data protection grievances, any legal proceedings or actions shall be subject to the exclusive jurisdiction of the competent courts located in <strong>India</strong>.
            </p>
          </section>

          {/* Section 9 */}
          <section id="grievance-contact" className="pt-4 border-t border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-orange-600">9.</span> Grievance Redressal &amp; Inquiries
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-4">
              For any questions regarding these Terms, billing, or to report a violation, please contact our team:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm">
              <p><strong>Contact Person:</strong> Ayush Sharma</p>
              <p><strong>Designation:</strong> Founder &amp; Maintainer</p>
              <p>
                <strong>Email:</strong>{" "}
                <a href="mailto:grievance@boringtoolsai.com" className="text-orange-600 font-semibold underline">
                  grievance@boringtoolsai.com
                </a>{" "}
                (Fallback: hello@boringtoolsai.com)
              </p>
              <p><strong>Response Time:</strong> Acknowledged within 48 hours; resolved within 30 days.</p>
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <Link
                href="/privacy-policy"
                className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition"
              >
                Read Privacy Policy &rarr;
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
      </div>
    </div>
  );
}
