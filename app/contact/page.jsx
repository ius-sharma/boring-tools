export const metadata = {
  title: "Contact — BoringTools",
  description: "Contact BoringTools for feedback, support, or collaboration.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <main className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-neutral-900">Contact</h1>
        <p className="mt-4 text-neutral-700 text-lg">Have feedback or a suggestion? Reach out using the form below or open an issue in the repository.</p>

        <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="text-2xl font-semibold text-neutral-900">Send a message</h2>
          <form className="mt-4 grid grid-cols-1 gap-3">
            <label className="flex flex-col">
              <span className="text-sm text-neutral-500">Name</span>
              <input className="mt-1 rounded-lg border border-neutral-200 p-3" placeholder="Optional" />
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-neutral-500">Email</span>
              <input className="mt-1 rounded-lg border border-neutral-200 p-3" placeholder="Optional" />
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-neutral-500">Message</span>
              <textarea className="mt-1 rounded-lg border border-neutral-200 p-3" rows={6} placeholder="Tell us what's up" />
            </label>
            <div>
              <button type="button" disabled className="rounded-lg border border-neutral-900 bg-neutral-900 px-4 py-2 text-white">Send message</button>
            </div>
          </form>
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
