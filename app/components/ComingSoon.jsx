import Link from "next/link";

export default function ComingSoon({ toolName, setupGuideLink = null }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full text-center p-8 rounded-2xl border border-slate-200 bg-white shadow-lg">
        <svg className="w-16 h-16 mx-auto text-orange-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-3xl font-bold mb-3 text-slate-900">Coming Soon!</h1>
        <p className="text-slate-600 text-base mb-6">
          {toolName} is under development and will be available soon.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-slate-700">
            <strong>Tip:</strong> This tool works best when run locally for full functionality.
          </p>
          {setupGuideLink && (
            <Link
              href={setupGuideLink}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
            >
              View Setup Guide
            </Link>
          )}
        </div>

        <Link
          href="/"
          className="inline-block bg-slate-900 text-white font-semibold px-6 py-2 rounded-lg hover:bg-slate-800 transition"
        >
          &larr; Back to Tools
        </Link>
      </div>
    </div>
  );
}
