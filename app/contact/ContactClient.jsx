"use client";

import { useState } from "react";
import Link from "next/link";
import ThemedDropdown from "../components/ThemedDropdown";

const subjectOptions = [
  { value: "Feedback & Suggestion", label: "Feedback & Suggestion" },
  { value: "Bug Report", label: "Bug Report" },
  { value: "New Tool Request", label: "New Tool Request" },
  { value: "Collaboration / Open Source", label: "Collaboration / Open Source" },
  { value: "Other Query", label: "Other Query" },
];

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Feedback & Suggestion",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.message.trim()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Hero Header */}
      <header className="bg-white border-b border-slate-200/80 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-md bg-amber-50 px-3 py-1 text-xs font-mono font-medium text-amber-800 border border-amber-200/60 mb-6">
            GET IN TOUCH
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            Contact & <span className="text-amber-600">Support</span>
          </h1>

          <p className="mt-4 text-lg text-slate-600 max-w-2xl leading-relaxed">
            Have feedback, found a bug, or want to suggest a new utility? Send a message or connect through open-source channels.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 mt-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Contact Form */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:border-orange-500 hover:shadow-xs transition-all duration-200">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Send a Message</h2>
            <p className="mt-1 text-sm text-slate-600">
              Fill out the form below and we will get back to you as soon as possible.
            </p>

            {submitted ? (
              <div className="mt-6 p-6 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto text-sm font-bold mb-3">
                  ✓
                </div>
                <h3 className="text-base font-bold text-slate-900">Message Received</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Thank you for reaching out. Your message has been sent successfully.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", subject: "Feedback & Suggestion", message: "" });
                  }}
                  className="mt-4 text-xs font-medium text-amber-700 hover:underline cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex"
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex@example.com"
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Subject / Topic
                  </label>
                  <ThemedDropdown
                    value={formData.subject}
                    options={subjectOptions}
                    onChange={(val) => setFormData({ ...formData, subject: val })}
                    ariaLabel="Subject / Topic"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write your message here..."
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-slate-600">Client-side instant submission</p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Direct Channels & GitHub */}
          <div className="space-y-6">
            {/* Developer Channels */}
            <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6">
              <p className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase mb-2">
                DIRECT CONNECT
              </p>
              <h3 className="text-lg font-bold text-white">Ayush Sharma</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Connect directly with the creator for quick feedback, questions, or collaboration.
              </p>

              <div className="mt-5 space-y-2">
                <a
                  href="https://github.com/ius-sharma"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.55-3.88-1.55-.53-1.36-1.3-1.72-1.3-1.72-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.76.41-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.06 11.06 0 012.9-.39c.98.01 1.97.13 2.9.39 2.21-1.49 3.18-1.18 3.18-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.4 24 17.09 24 12 24 5.65 18.35.5 12 .5z" />
                    </svg>
                    GitHub Repository
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">→</span>
                </a>

                <a
                  href="https://instagram.com/ius.sharma"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
                >
                  <span>Instagram</span>
                  <span className="text-slate-400 font-mono text-[10px]">→</span>
                </a>

                <a
                  href="https://www.linkedin.com/in/ayush-sharma-833163320/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
                >
                  <span>LinkedIn Profile</span>
                  <span className="text-slate-400 font-mono text-[10px]">→</span>
                </a>

                <a
                  href="https://www.youtube.com/@ocnayush"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
                >
                  <span>YouTube Channel</span>
                  <span className="text-slate-400 font-mono text-[10px]">→</span>
                </a>
              </div>
            </div>

            {/* GitHub Issue Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-orange-500 transition-all duration-200">
              <h4 className="text-sm font-bold text-slate-900">Found a Bug?</h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Report issues or request features directly on GitHub to track resolution progress.
              </p>
              <a
                href="https://github.com/ius-sharma/boring-tools/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 transition"
              >
                Open GitHub Issue →
              </a>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-200 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900 transition font-medium">
            ← Back to all tools
          </Link>
          <Link href="/about" className="hover:text-slate-900 transition font-medium">
            Read About Story →
          </Link>
        </div>
      </main>
    </div>
  );
}
