"use client";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white/80 backdrop-blur shadow-xl rounded-2xl p-8 w-full max-w-xl border border-neutral-200 flex flex-col gap-6 items-center">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mb-1">BoringTools <span className="align-middle">🚀</span></h1>
        <p className="text-neutral-500 text-lg mb-2">100 Days. 100 Boring Tools.</p>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="/text-formatter"
            className="border border-neutral-900 text-neutral-900 py-2 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-neutral-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L21 12m0 0l-3.75 5.25M21 12H3" />
            </svg>
            Text Formatter
          </a>

          <a
            href="/json-formatter"
            className="border border-neutral-900 text-neutral-900 py-2 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-neutral-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 6h16.5m-16.5 6h16.5" />
            </svg>
            JSON Formatter
          </a>
        </div>
      </div>
      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
      `}</style>
    </div>
  );
}