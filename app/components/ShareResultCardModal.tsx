"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShareCardData,
  CardTheme,
  generateShareCard,
  downloadCardImage,
  getTwitterShareUrl,
} from "@/lib/shareCardGenerator";
import { showToast } from "./ToastNotification";

interface ShareResultCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareCardData | null;
  filename?: string;
  tweetText?: string;
  shareUrl?: string;
}

const THEME_OPTIONS: { id: CardTheme; label: string; dot: string }[] = [
  { id: "white", label: "Core White", dot: "bg-white border-2 border-orange-500 shadow-xs" },
  { id: "dark", label: "Dark Slate", dot: "bg-slate-900 border-2 border-slate-700" },
  { id: "sunset", label: "Warm Sunset", dot: "bg-amber-400 border-2 border-orange-300" },
  { id: "mint", label: "Fresh Mint", dot: "bg-emerald-400 border-2 border-emerald-300" },
];

export default function ShareResultCardModal({
  isOpen,
  onClose,
  data,
  filename = "boringtools-result.png",
  tweetText = "Check out my score on BoringTools!",
  shareUrl = "https://www.boringtoolsai.com",
}: ShareResultCardModalProps) {
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>("white");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  // Reset theme to white when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTheme("white");
    }
  }, [isOpen]);

  // Generate card when data, open status, or selectedTheme changes
  const renderCard = useCallback(async () => {
    if (!isOpen || !data) return;
    setIsGenerating(true);
    try {
      const url = await generateShareCard(data, selectedTheme);
      setImageUrl(url);
    } catch (err) {
      console.error("Failed to generate share card:", err);
      showToast("Failed to render card", "error");
    } finally {
      setIsGenerating(false);
    }
  }, [isOpen, data, selectedTheme]);

  useEffect(() => {
    renderCard();
  }, [renderCard]);

  if (!isOpen || !data) return null;

  const handleDownload = () => {
    if (imageUrl) {
      downloadCardImage(imageUrl, filename);
      showToast("Card downloaded in HD!", "success");
    }
  };

  const handleCopyImage = async () => {
    if (!imageUrl) return;
    setIsCopying(true);
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      if (typeof navigator !== "undefined" && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        showToast("Image copied to clipboard! Ready to paste 📋", "success");
      } else {
        downloadCardImage(imageUrl, filename);
        showToast("Clipboard not supported. Downloaded PNG instead!", "info");
      }
    } catch (err) {
      console.warn("Copy image failed:", err);
      downloadCardImage(imageUrl, filename);
      showToast("Downloaded PNG instead!", "info");
    } finally {
      setIsCopying(false);
    }
  };

  const handleShareToTwitter = () => {
    const url = getTwitterShareUrl(tweetText, shareUrl);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    if (typeof window !== "undefined" && navigator.share && imageUrl) {
      try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const file = new File([blob], filename, { type: "image/png" });
        await navigator.share({
          title: "BoringTools Result",
          text: tweetText,
          files: [file],
        });
        showToast("Shared successfully!", "success");
      } catch (err) {
        // user cancelled or share failed
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/65 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5">
            <span className="text-sm sm:text-base font-semibold text-slate-900">
              Share Result Card
            </span>
            <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              1200×630 HD
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Color Theme Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-slate-50/80 border-b border-slate-200/70">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span>Theme:</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {THEME_OPTIONS.map((th) => {
              const isActive = selectedTheme === th.id;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setSelectedTheme(th.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition cursor-pointer border ${
                    isActive
                      ? "bg-white text-slate-900 border-slate-300 shadow-xs ring-1 ring-orange-500/50"
                      : "bg-transparent text-slate-600 border-transparent hover:bg-slate-200/60"
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${th.dot}`} />
                  <span className="hidden xs:inline sm:inline">{th.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* High-Res Preview Area */}
        <div className="p-4 sm:p-6 bg-slate-100/70 border-b border-slate-200/60 flex items-center justify-center min-h-[260px] sm:min-h-[340px]">
          {isGenerating || !imageUrl ? (
            <div className="text-slate-500 text-xs sm:text-sm flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span>Rendering {THEME_OPTIONS.find((t) => t.id === selectedTheme)?.label}...</span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <img
                src={imageUrl}
                alt="Shareable result card preview"
                className="w-full max-h-[340px] object-contain rounded-xl border border-slate-200/80 shadow-lg transition-all duration-200"
              />
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-white">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>100% in-browser Canvas generation</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {typeof window !== "undefined" && typeof navigator !== "undefined" && "share" in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition cursor-pointer"
              >
                Share
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyImage}
              disabled={isCopying}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{isCopying ? "Copying..." : "Copy Image"}</span>
            </button>

            <button
              type="button"
              onClick={handleShareToTwitter}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-black hover:bg-slate-800 text-white transition cursor-pointer shadow-xs"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white transition cursor-pointer shadow-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
