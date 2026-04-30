export const metadata = {
  title: "About — BoringTools",
  description: "Why BoringTools exists and how the tool library is growing.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <main className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-neutral-900">About BoringTools</h1>
        <p className="mt-4 text-neutral-700 text-lg">
          BoringTools is a small collection of useful, focused utilities built to solve everyday problems quickly. Tools are designed to run locally in your browser with no login required,
          prioritizing simplicity, privacy, and performance.
        </p>

        <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="text-2xl font-semibold text-neutral-900">Our approach</h2>
          <p className="mt-3 text-neutral-600">
            We build one practical tool at a time and publish them in public. Each tool is intentionally small: predictable UI, minimal dependencies, and clear behavior.
          </p>
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
