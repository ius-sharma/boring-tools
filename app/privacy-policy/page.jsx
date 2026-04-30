export const metadata = {
  title: "Privacy Policy — BoringTools",
  description: "Notes on local storage, feedback, and data handling for BoringTools.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <main className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-neutral-900">Privacy Policy</h1>
        <p className="mt-4 text-neutral-700 text-lg">BoringTools prioritizes local-first behavior. This short policy explains how data is handled.</p>

        <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="text-2xl font-semibold text-neutral-900">Local storage</h2>
          <p className="mt-3 text-neutral-600">Some tools save small preferences or recent activity in your browser's localStorage. This data stays on your device unless you choose to share it.</p>

          <h2 className="mt-6 text-2xl font-semibold text-neutral-900">Feedback</h2>
          <p className="mt-3 text-neutral-600">Feedback submitted via the suggestion flow may be stored and reviewed for product improvements. No personal data is collected unless you provide it explicitly in the form fields.</p>
        </section>

        <div className="mt-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:shadow-md hover:translate-y-0.5 transition"
            aria-label="Back to dashboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12l7.5-7.5" />
            </svg>
            Back to dashboard
          </a>
        </div>
      </main>
    </div>
  );
}
