"use client";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white py-12 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-sm max-w-none text-slate-700 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using BoringTools ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on BoringTools for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the Service</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Disclaimer</h2>
            <p>The materials on BoringTools are provided on an 'as is' basis. BoringTools makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Limitations</h2>
            <p>In no event shall BoringTools or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on BoringTools, even if BoringTools or an authorized representative has been notified orally or in writing of the possibility of such damage.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Accuracy of Materials</h2>
            <p>The materials appearing on BoringTools could include technical, typographical, or photographic errors. BoringTools does not warrant that any of the materials on the Service are accurate, complete, or current. BoringTools may make changes to the materials contained on its Service at any time without notice.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Links</h2>
            <p>BoringTools has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by BoringTools of the site. Use of any such linked website is at the user's own risk.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Modifications</h2>
            <p>BoringTools may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. Governing Law</h2>
            <p>These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. Contact Us</h2>
            <p>If you have any questions about these Terms of Service, please contact us through our website.</p>
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
