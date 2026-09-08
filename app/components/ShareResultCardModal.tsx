"use client";

import React, { useState, useEffect } from "react";
import {
  ShareCardData,
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

export default function ShareResultCardModal({
  isOpen,
  onClose,
  data,
  filename = "boringtools-result.png",
  tweetText = "Check out my score on BoringTools!",
  shareUrl = "https://www.boringtoolsai.com",
}: ShareResultCardModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen && data) {
      setIsGenerating(true);
      generateShareCard(data)
        .then((url) => {
          setImageUrl(url);
          setIsGenerating(false);
        })
        .catch((err) => {
          console.error("Failed to generate card:", err);
          setIsGenerating(false);
          showToast("Failed to generate share card", "error");
        });
    } else {
      setImageUrl(null);
    }
  }, [isOpen, data]);

  if (!isOpen || !data) return null;

  const handleDownload = () => {
    if (imageUrl) {
      downloadCardImage(imageUrl, filename);
      showToast("Card image downloaded!", "success");
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
        // user cancelled or share failed, fallback to copy link
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[3px] animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900">Shareable Result Card</span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
              HD Image
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Preview Area */}
        <div className="p-5 bg-slate-950/95 flex items-center justify-center min-h-[260px] sm:min-h-[340px]">
          {isGenerating || !imageUrl ? (
            <div className="text-slate-400 text-sm flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              Generating high-res card...
            </div>
          ) : (
            <img
              src={imageUrl}
              alt="Shareable result card"
              className="w-full max-h-[360px] object-contain rounded-xl border border-slate-800 shadow-2xl"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-50 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            100% Client-Side generated
          </div>
          <div className="flex items-center gap-2">
            {typeof window !== "undefined" && typeof navigator !== "undefined" && "share" in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition cursor-pointer"
              >
                Share
              </button>
            )}
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
