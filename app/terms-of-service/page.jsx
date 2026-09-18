"use client";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white py-12 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-sm max-w-none text-slate-700 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using BoringTools (&quot;Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Eligibility &amp; Age Restriction (COPPA)</h2>
            <p>You must be at least 13 years of age (or 16 years of age in the European Economic Area or UK where required by local law) to register an account or use account-based features on BoringTools. By creating an account, you represent and warrant that you meet this age requirement.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Client-Side Processing &amp; User Content</h2>
            <p>BoringTools processes files, conversions, and computations directly on the client side inside your web browser. BoringTools does not host, store, or publish your files to any server or public repository. You retain 100% ownership and copyright responsibility of any media, images, or documents you process through the Service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Subscriptions, Automatic Renewal &amp; Cancellation Policy</h2>
            <p>Paid subscriptions (such as BoringTools Starter and BoringTools Pro) renew automatically at the end of each billing period (monthly or annually) using the payment method on file, unless cancelled prior to the renewal date. You may cancel your subscription at any time with 1-click through your Billing Settings or by contacting support. Upon cancellation, you will retain access to your subscription benefits through the end of your prepaid billing period with no further charges.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on BoringTools for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the Service</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Disclaimer</h2>
            <p>The materials on BoringTools are provided on an &apos;as is&apos; basis. BoringTools makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Limitations</h2>
            <p>In no event shall BoringTools or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on BoringTools, even if BoringTools or an authorized representative has been notified orally or in writing of the possibility of such damage.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. Accuracy of Materials</h2>
            <p>The materials appearing on BoringTools could include technical, typographical, or photographic errors. BoringTools does not warrant that any of the materials on the Service are accurate, complete, or current. BoringTools may make changes to the materials contained on its Service at any time without notice.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. Links</h2>
            <p>BoringTools has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by BoringTools of the site. Use of any such linked website is at the user&apos;s own risk.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">10. Modifications &amp; Governing Law</h2>
            <p>BoringTools may revise these terms of service at any time without notice. These terms and conditions are governed by and construed in accordance with the applicable laws of India, and you submit to the exclusive jurisdiction of the courts located therein.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">11. Contact Us</h2>
            <p>If you have any questions about these Terms of Service or billing, please contact us through our website contact page.</p>
          </section>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-600">Last updated: May 8, 2026</p>
          </div>
        </div>

        <div className="mt-12">
          <a href="/" className="inline-block bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
