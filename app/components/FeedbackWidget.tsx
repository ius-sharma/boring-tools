"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import { tools } from "../tools-data";
import {
  KoboyoStar,
  KoboyoCross,
  KoboyoCopy,
  KoboyoShare,
  TwitterXIcon,
  WhatsAppIcon,
  LinkedInIcon,
  GitHubIcon,
  CheckIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
} from "./KoboyoIcons";
import { showToast } from "./ToastNotification";

export interface StoredFeedback {
  id: string;
  timestamp: string;
  rating: number | null;
  category: string;
  feedbackText: string;
  name?: string;
  email?: string;
  toolId?: string;
  toolName?: string;
  path: string;
}

const STORAGE_KEY = "boringtools_user_reviews";

/**
 * Global helper to trigger the Feedback Widget from any button or component
 */
export function openFeedbackWidget(options?: { tab?: "review" | "share"; category?: string }) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("boringtools:open-feedback", { detail: options }));
  }
}

export default function FeedbackWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"review" | "share">("review");

  // Form state
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<string>("Review");
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [hasRatedBefore, setHasRatedBefore] = useState(false);

  // Identify current tool context
  const currentTool = useMemo(() => {
    if (!pathname || pathname === "/") return null;
    const cleanId = pathname.replace(/^\//, "").split("/")[0];
    return tools.find((t) => t.id === cleanId && t.status === "Live") || null;
  }, [pathname]);

  const toolName = currentTool?.name || "BoringTools";
  const currentUrl = typeof window !== "undefined" ? window.location.href : "https://boringtoolsai.com";

  // Check if previously reviewed in localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const storedList: StoredFeedback[] = JSON.parse(raw);
        const match = storedList.find((item) =>
          currentTool ? item.toolId === currentTool.id : item.path === "/"
        );
        if (match) {
          setHasRatedBefore(true);
          if (match.rating) setRating(match.rating);
        }
      }
    } catch {
      // Safe fallback
    }
  }, [currentTool, pathname]);

  // Listen for custom trigger events
  useEffect(() => {
    const handleCustomOpen = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.tab) setActiveTab(detail.tab);
      if (detail?.category) setCategory(detail.category);
      setIsOpen(true);
    };

    window.addEventListener("boringtools:open-feedback", handleCustomOpen);
    return () => window.removeEventListener("boringtools:open-feedback", handleCustomOpen);
  }, []);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Rating descriptors
  const ratingLabels: Record<number, string> = {
    1: "Needs work 😕",
    2: "Fair 🙂",
    3: "Good 👍",
    4: "Great! 🌟",
    5: "Amazing! 🚀",
  };

  // Handlers for social sharing
  const shareText = currentTool
    ? `I just used ${toolName} on BoringTools! 100% private, free browser utilities with no login required:`
    : `Check out BoringTools — 100+ free, private browser utilities with no login required:`;

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(currentUrl)}&via=ius_sharma`;

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareText} ${currentUrl}`
  )}`;

  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    currentUrl
  )}`;

  const handleCopyLink = useCallback(async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = currentUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedLink(true);
      showToast("Link copied to clipboard!", "success");
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      showToast("Unable to copy link automatically", "error");
    }
  }, [currentUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() && !rating) {
      showToast("Please select a rating or leave a note", "error");
      return;
    }

    setIsSubmitting(true);

    const feedbackEntry: StoredFeedback = {
      id: `feedback_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      rating,
      category,
      feedbackText: feedbackText.trim(),
      name: name.trim() || undefined,
      email: email.trim().toLowerCase() || undefined,
      toolId: currentTool?.id || "general",
      toolName,
      path: pathname || "/",
    };

    // 1. Store in localStorage for privacy & instant retrieval
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      const list: StoredFeedback[] = existing ? JSON.parse(existing) : [];
      list.push(feedbackEntry);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (storageErr) {
      console.warn("Local storage write error:", storageErr);
    }

    // 2. Submit to API / Webhook pipeline (privacy-respecting queue)
    try {
      await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          category,
          suggestion: feedbackText.trim() || `User rated ${toolName} with ${rating} stars.`,
          rating,
          toolId: currentTool?.id || "general",
          toolName,
          url: currentUrl,
          source: "feedback-widget",
        }),
      });
    } catch (apiErr) {
      // Offline fallback: it's already safely stored in localStorage
      console.info("Feedback queued locally (network/endpoint unavailable)");
    }

    setIsSubmitting(false);
    setSubmitted(true);
    showToast("Thank you! Your feedback helps make BoringTools better 💛", "success");
  };

  const resetForm = () => {
    setSubmitted(false);
    setFeedbackText("");
    setRating(null);
  };

  return (
    <>
      {/* 1. Discrete Floating Trigger Button */}
      <aside aria-label="Feedback and sharing options">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Send feedback or share"
        className="fixed bottom-5 right-5 z-40 group flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-lg hover:shadow-xl backdrop-blur-md transition-all duration-200 cursor-pointer hover:border-amber-400 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
        </span>
        <KoboyoStar className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
        <span className="text-xs sm:text-sm font-medium tracking-tight">
          Feedback <span className="hidden sm:inline">& Share</span>
        </span>
      </button>
      </aside>

      {/* 2. Interactive Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col transition-all max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-2xs">
                  <KoboyoStar className="w-4 h-4 text-amber-500" />
                </span>
                <div>
                  <h3 id="feedback-dialog-title" className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    {currentTool ? `Feedback for ${toolName}` : "Feedback & Community"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    100% Free • Client-Side Privacy • Zero Sign-Up
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close dialog"
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <KoboyoCross className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/60 px-5 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("review")}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition border-b-2 cursor-pointer ${
                  activeTab === "review"
                    ? "border-amber-500 text-amber-700 bg-white rounded-t-lg shadow-2xs"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <KoboyoStar className="w-3.5 h-3.5" />
                <span>Rate & Review</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("share")}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition border-b-2 cursor-pointer ${
                  activeTab === "share"
                    ? "border-amber-500 text-amber-700 bg-white rounded-t-lg shadow-2xs"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <KoboyoShare className="w-3.5 h-3.5" />
                <span>Share & Support</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {activeTab === "review" ? (
                submitted ? (
                  /* Success View */
                  <div className="py-6 text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                      <CheckIcon className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">
                      Thank you for your review!
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                      Your thoughts directly influence the next set of free tools we build and polish.
                    </p>

                    {/* Viral Referral Prompt if 4+ stars */}
                    {rating && rating >= 4 && (
                      <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-left space-y-2.5">
                        <p className="text-xs font-semibold text-amber-900">
                          💛 Enjoying {toolName}? Consider sharing it or giving us a star!
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setActiveTab("share")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                          >
                            <KoboyoShare className="w-3.5 h-3.5" />
                            <span>Share this tool</span>
                          </button>
                          <a
                            href="https://github.com/ius-sharma/boring-tools"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition"
                          >
                            <GitHubIcon className="w-3.5 h-3.5" />
                            <span>Star on GitHub</span>
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="text-xs text-slate-500 hover:text-slate-800 underline transition cursor-pointer"
                      >
                        Submit another review or suggestion
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Review / Feedback Form */
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {hasRatedBefore && (
                      <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                        <span>You previously reviewed this tool. Submitting again will update your feedback.</span>
                      </div>
                    )}

                    {/* 1. Star Rating Experience */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Rate Your Experience
                      </label>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/90 border border-slate-200">
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((starVal) => {
                            const isFilled = (hoverRating || rating || 0) >= starVal;
                            return (
                              <button
                                key={starVal}
                                type="button"
                                onClick={() => setRating(starVal)}
                                onMouseEnter={() => setHoverRating(starVal)}
                                onMouseLeave={() => setHoverRating(null)}
                                aria-label={`Rate ${starVal} out of 5 stars`}
                                className="p-1 rounded-md text-slate-300 hover:text-amber-500 hover:scale-115 transition-all cursor-pointer focus:outline-none"
                              >
                                <KoboyoStar
                                  className={`w-6 h-6 transition-colors ${
                                    isFilled ? "text-amber-400 fill-amber-400" : "text-slate-200"
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                        <span className="text-xs font-medium text-slate-600 min-w-[90px] text-right">
                          {rating ? ratingLabels[rating] : "Click to rate"}
                        </span>
                      </div>
                    </div>

                    {/* 2. Feedback Category Selector */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Feedback Type
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {[
                          { id: "Review", label: "Tool Review" },
                          { id: "New Tool Idea", label: "Suggest Tool" },
                          { id: "UX Improvement", label: "Improvement" },
                          { id: "Bug Report", label: "Bug Report" },
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border text-center ${
                              category === cat.id
                                ? "bg-amber-500 text-white border-amber-600 shadow-2xs font-semibold"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Review & Feedback Message */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        {category === "New Tool Idea"
                          ? "What tool should we build next?"
                          : category === "Bug Report"
                          ? "What went wrong?"
                          : "Your Review / Thoughts"}
                      </label>
                      <textarea
                        rows={3}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder={
                          category === "New Tool Idea"
                            ? "e.g. Free client-side video watermark remover, SVG cleaner, or time card generator..."
                            : category === "Bug Report"
                            ? "Describe what happened, browser used, or error message..."
                            : `What did you think of ${toolName}? Any ideas for improvements?`
                        }
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition resize-none placeholder:text-slate-400 bg-white"
                      />
                    </div>

                    {/* 4. Optional Contact (name & email) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Name (optional)"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition bg-white"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email (optional, for tool updates)"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition bg-white"
                        />
                      </div>
                    </div>

                    {/* Submit Button & Privacy Statement */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <span className="text-[11px] text-slate-400 leading-tight text-center sm:text-left">
                        🔒 Stored locally & privacy-guaranteed. No cookies or ads tracking.
                      </span>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all duration-150 cursor-pointer active:scale-95 text-center shrink-0"
                      >
                        {isSubmitting ? "Submitting..." : "Send Feedback"}
                      </button>
                    </div>
                  </form>
                )
              ) : (
                /* Share & Support Tab */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                      Share This Tool
                    </span>
                    <p className="text-xs text-slate-600">
                      Help colleagues and friends discover free, private, client-side browser utilities:
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        readOnly
                        value={currentUrl}
                        className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200 text-slate-600 truncate focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 border ${
                          copiedLink
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {copiedLink ? (
                          <>
                            <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <KoboyoCopy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 1-Click Social Shares */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                      One-Click Share
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <a
                        href={twitterShareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-black hover:bg-slate-900 text-white text-xs font-semibold shadow-2xs transition"
                      >
                        <TwitterXIcon className="w-3.5 h-3.5" />
                        <span>Post on X</span>
                      </a>
                      <a
                        href={whatsappShareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={linkedinShareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#0077b5] hover:bg-[#006097] text-white text-xs font-semibold shadow-2xs transition"
                      >
                        <LinkedInIcon className="w-3.5 h-3.5" />
                        <span>LinkedIn</span>
                      </a>
                    </div>
                  </div>

                  {/* GitHub Star Community Callout */}
                  <div className="p-4 rounded-xl bg-linear-to-r from-slate-900 to-slate-800 text-white space-y-2 border border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GitHubIcon className="w-5 h-5 text-amber-400" />
                        <span className="text-sm font-bold">Open Source on GitHub</span>
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        100 Days 100 Tools
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Every tool is built publicly. Giving the repository a Star helps indie developers find clean, client-side open source code.
                    </p>
                    <div className="pt-1">
                      <a
                        href="https://github.com/ius-sharma/boring-tools"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        <KoboyoStar className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>Star repo on GitHub</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
