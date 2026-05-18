import Link from "next/link";

export default function SetupGuidePage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8 border-b border-slate-200 pb-6">
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900 mb-4 inline-block">
            ← Back to Tools
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-4">Local Setup Guide 🛠️</h1>
          <p className="text-slate-600 text-base mt-2">Get YouTube Downloader running on your machine in 2 minutes</p>
        </div>

        <div className="prose prose-slate max-w-none">
          {/* Prerequisites */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Prerequisites</h2>
            <p className="text-slate-700 mb-3">Make sure you have the following installed:</p>
            <ul className="space-y-2 text-slate-700 mb-4">
              <li>✅ <strong>Node.js</strong> (v18 or higher) — <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download</a></li>
              <li>✅ <strong>npm</strong> (comes with Node.js)</li>
              <li>✅ <strong>Git</strong> (optional, for cloning)</li>
            </ul>
            <div className="bg-slate-100 border border-slate-300 rounded-lg p-4 text-sm text-slate-700 font-mono mb-4">
              node --version<br/>npm --version
            </div>
          </section>

          {/* Setup Steps */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Setup Instructions</h2>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-lg font-bold text-slate-900 mb-2">1. Clone the Repository</h3>
                <div className="bg-slate-100 border border-slate-300 rounded-lg p-4 text-sm text-slate-700 font-mono overflow-x-auto mb-2">
                  git clone https://github.com/your-username/boring-tools.git<br/>cd boring-tools
                </div>
                <p className="text-sm text-slate-600">Or download the ZIP file and extract it.</p>
              </div>

              {/* Step 2 */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-lg font-bold text-slate-900 mb-2">2. Install Dependencies</h3>
                <div className="bg-slate-100 border border-slate-300 rounded-lg p-4 text-sm text-slate-700 font-mono mb-2">
                  npm install
                </div>
                <p className="text-sm text-slate-600">This installs Next.js, React, yt-dlp, and other dependencies.</p>
              </div>

              {/* Step 3 */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-lg font-bold text-slate-900 mb-2">3. Install yt-dlp</h3>
                <p className="text-sm text-slate-600 mb-3">Choose your operating system:</p>
                
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="font-semibold text-sm text-slate-900">Windows (via Chocolatey)</p>
                    <div className="bg-slate-100 border border-slate-300 rounded p-2 text-xs text-slate-700 font-mono mt-2">
                      choco install yt-dlp
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="font-semibold text-sm text-slate-900">Windows (Manual)</p>
                    <ol className="text-xs text-slate-600 list-decimal list-inside mt-2 space-y-1">
                      <li>Download from: <a href="https://github.com/yt-dlp/yt-dlp/releases" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">github.com/yt-dlp</a></li>
                      <li>Extract and add to PATH</li>
                    </ol>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="font-semibold text-sm text-slate-900">macOS</p>
                    <div className="bg-slate-100 border border-slate-300 rounded p-2 text-xs text-slate-700 font-mono mt-2">
                      brew install yt-dlp
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="font-semibold text-sm text-slate-900">Linux</p>
                    <div className="bg-slate-100 border border-slate-300 rounded p-2 text-xs text-slate-700 font-mono mt-2">
                      sudo apt install yt-dlp
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3">Verify installation:</p>
                <div className="bg-slate-100 border border-slate-300 rounded p-2 text-xs text-slate-700 font-mono">
                  yt-dlp --version
                </div>
              </div>

              {/* Step 4 */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-lg font-bold text-slate-900 mb-2">4. Start the App</h3>
                <div className="bg-slate-100 border border-slate-300 rounded-lg p-4 text-sm text-slate-700 font-mono mb-2">
                  npm run dev
                </div>
                <p className="text-sm text-slate-600">Open <a href="http://localhost:3000/youtube-downloader" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">http://localhost:3000/youtube-downloader</a> in your browser.</p>
              </div>
            </div>
          </section>

          {/* Why Local is Better */}
          <section className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">✅ Why YouTube Downloader Works Better Locally</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-slate-900 mb-2">Online Limitations:</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>❌ Server-side bandwidth limits</li>
                  <li>❌ YouTube API rate limits</li>
                  <li>❌ Legal constraints on servers</li>
                  <li>❌ Slow downloads</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-900 mb-2">Local Advantages:</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>✅ Full video quality support</li>
                  <li>✅ Unlimited download speeds</li>
                  <li>✅ No rate limits</li>
                  <li>✅ Complete privacy</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Troubleshooting */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">❓ Troubleshooting</h2>

            <div className="space-y-4">
              <div className="border border-slate-300 rounded-lg p-4">
                <p className="font-semibold text-slate-900 mb-2">"yt-dlp not found" Error</p>
                <p className="text-sm text-slate-700 mb-2">Make sure yt-dlp is installed and in your PATH.</p>
                <div className="bg-slate-100 border border-slate-300 rounded p-2 text-xs text-slate-700 font-mono">
                  yt-dlp --version
                </div>
              </div>

              <div className="border border-slate-300 rounded-lg p-4">
                <p className="font-semibold text-slate-900 mb-2">Dependencies Installation Fails</p>
                <p className="text-sm text-slate-700 mb-2">Clear npm cache and reinstall:</p>
                <div className="bg-slate-100 border border-slate-300 rounded p-2 text-xs text-slate-700 font-mono">
                  npm cache clean --force<br/>rm -rf node_modules package-lock.json<br/>npm install
                </div>
              </div>

              <div className="border border-slate-300 rounded-lg p-4">
                <p className="font-semibold text-slate-900 mb-2">Port 3000 Already in Use</p>
                <p className="text-sm text-slate-700 mb-2">Use a different port:</p>
                <div className="bg-slate-100 border border-slate-300 rounded p-2 text-xs text-slate-700 font-mono">
                  npm run dev -- -p 3001
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">FAQ</h2>

            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-4">
                <p className="font-semibold text-slate-900 mb-2">Can I use the online version instead?</p>
                <p className="text-sm text-slate-700">The online version has limitations. Local setup is recommended for full functionality.</p>
              </div>

              <div className="border-b border-slate-200 pb-4">
                <p className="font-semibold text-slate-900 mb-2">Is downloading from YouTube legal?</p>
                <p className="text-sm text-slate-700">Downloading is only legal for content you have permission to download. Always respect copyright and YouTube's Terms of Service.</p>
              </div>

              <div>
                <p className="font-semibold text-slate-900 mb-2">Will my videos be stored on the server?</p>
                <p className="text-sm text-slate-700">No! With local setup, everything stays on your computer. Nothing is uploaded or stored anywhere.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <Link href="/" className="inline-block bg-slate-900 text-white font-semibold px-6 py-3 rounded-lg hover:bg-slate-800 transition">
              ← Back to Tools
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
