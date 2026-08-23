"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const letterTypes = [
  { value: "professional", label: "Professional" },
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Friendly" },
  { value: "short", label: "Short" },
  { value: "grateful", label: "Gracious & Grateful" },
  { value: "minimalist", label: "Minimalist" },
];

const pdfFonts = [
  { value: "TimesRoman", label: "Classic Serif (Times)" },
  { value: "Helvetica", label: "Modern Sans (Helvetica)" },
  { value: "Courier", label: "Typewriter (Courier)" },
];

const getDefaultLastDay = () => {
  const date = new Date();
  date.setDate(date.getDate() + 14); // 2 weeks default
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const formatInputDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch (e) {
    return dateStr;
  }
};

const compileLocalTemplate = (params) => {
  const {
    employeeName,
    companyName,
    position,
    lastWorkingDay,
    noticePeriod,
    reason,
    recipientName,
    letterType,
    includeHandover,
    handoverDetails,
  } = params;

  const todayStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const recipient = recipientName || "Manager";
  const formattedLastDay = formatInputDate(lastWorkingDay);

  const handoverBlock = includeHandover && handoverDetails 
    ? `\n\nTo facilitate a smooth departure, I have prepared a handover plan outlining my current responsibilities:\n${handoverDetails.split(/\r?\n/).map(line => `• ${line.trim()}`).filter(Boolean).join("\n")}`
    : "";

  const templates = {
    formal: `Please accept this letter as formal notification that I am resigning from my position as ${position} at ${companyName}. My last working day will be ${formattedLastDay}, in accordance with my notice period of ${noticePeriod}.\n\n${reason ? `This decision is due to ${reason.trim()}.\n\n` : ""}Thank you for the opportunities that I have been given during my time at ${companyName}. I appreciate the support and guidance from the team.${handoverBlock}\n\nI will do my best to ensure a smooth transition of my responsibilities before my departure.`,
    
    short: `Please accept this letter as notification that I am resigning from my position as ${position} at ${companyName}. My last day of work will be ${formattedLastDay}.\n\n${reason ? `My reason for resigning is ${reason.trim()}.\n\n` : ""}Thank you for the opportunity to work at ${companyName}. I wish the company and team the very best.${handoverBlock}`,
    
    friendly: `I'm writing to let you know that I've decided to move on from my role as ${position} at ${companyName}. My last day will be ${formattedLastDay}, completing my ${noticePeriod} notice period.\n\n${reason ? `I've made this choice because ${reason.trim()}.\n\n` : ""}I want to thank you and everyone on the team for such a wonderful experience. I've really loved working here and will miss the great collaboration and memories we've shared.${handoverBlock}\n\nI'll make sure everything is wrapped up and handed over properly before my last day. Let's definitely stay in touch!`,

    grateful: `I am writing to notify you of my resignation from my position as ${position} at ${companyName}, with my final day being ${formattedLastDay}.\n\nI want to express my deepest gratitude for the incredible support, mentorship, and professional growth opportunities I've experienced here. It has been a true privilege working with you and the entire team, and I am proud of what we have achieved together. ${reason ? `This decision is to allow me to ${reason.trim()}.\n\n` : ""}${handoverBlock}\n\nI am fully committed to assisting with the transition to ensure a seamless handoff of my tasks. Thank you again for everything.`,

    minimalist: `Please accept this letter as formal notification of my resignation from the position of ${position} at ${companyName}. As per my contract, my last working day will be ${formattedLastDay}, following my notice period of ${noticePeriod}.\n\n${reason ? `Reason: ${reason.trim()}.\n\n` : ""}${handoverBlock}\n\nI will complete my outstanding duties to ensure a clean transition before my last day.`,
    
    professional: `I am writing to formally resign from my role as ${position} at ${companyName}. As per my contract, my last day of employment will be ${formattedLastDay}, following my ${noticePeriod} notice period.\n\n${reason ? `This decision is due to ${reason.trim()}.\n\n` : ""}I would like to express my sincere gratitude for the professional development and growth opportunities I have had during my tenure. I have thoroughly enjoyed working with the team and appreciate the guidance I've received.${handoverBlock}\n\nDuring my remaining time, I will focus on completing outstanding tasks and assisting with the handover to ensure a seamless transition of my responsibilities.`
  };

  const body = templates[letterType] || templates.professional;

  return `${todayStr}

To:
${recipient}
${companyName}

Dear ${recipient},

${body}

Best regards,

${employeeName}`;
};

export default function ResignationLetterGenerator() {
  const [employeeName, setEmployeeName] = useState("Jane Doe");
  const [companyName, setCompanyName] = useState("InnovateTech Solutions");
  const [position, setPosition] = useState("Senior Software Engineer");
  const [lastWorkingDay, setLastWorkingDay] = useState(getDefaultLastDay());
  const [noticePeriod, setNoticePeriod] = useState("2 weeks");
  const [reason, setReason] = useState("pursuing a new opportunity that aligns with my long-term career goals");
  const [recipientName, setRecipientName] = useState("Manager");
  const [letterType, setLetterType] = useState("professional");
  const [includeHandover, setIncludeHandover] = useState(false);
  const [handoverDetails, setHandoverDetails] = useState("Complete API documentation\nHandover React dashboard tasks");

  const [letterText, setLetterText] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("");
  const [toast, setToast] = useState({ type: "", message: "" });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfFontChoice, setPdfFontChoice] = useState("TimesRoman");
  const [history, setHistory] = useState([]);
  const toastTimerRef = useRef(null);

  // Load from client storage on mount
  useEffect(() => {
    setIsClient(true);
    
    // Load Draft
    const savedDraft = localStorage.getItem("resignation_draft");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setEmployeeName(draft.employeeName || "");
        setCompanyName(draft.companyName || "");
        setPosition(draft.position || "");
        setRecipientName(draft.recipientName || "");
        setNoticePeriod(draft.noticePeriod || "");
        setLastWorkingDay(draft.lastWorkingDay || "");
        setReason(draft.reason || "");
        setLetterType(draft.letterType || "professional");
        setIncludeHandover(Boolean(draft.includeHandover));
        setHandoverDetails(draft.handoverDetails || "");
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }

    // Load History
    const savedHistory = localStorage.getItem("resignation_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Auto-Save Draft to localStorage when inputs change
  useEffect(() => {
    if (!isClient) return;
    const draft = {
      employeeName,
      companyName,
      position,
      recipientName,
      noticePeriod,
      lastWorkingDay,
      reason,
      letterType,
      includeHandover,
      handoverDetails,
    };
    localStorage.setItem("resignation_draft", JSON.stringify(draft));
  }, [
    isClient,
    employeeName,
    companyName,
    position,
    recipientName,
    noticePeriod,
    lastWorkingDay,
    reason,
    letterType,
    includeHandover,
    handoverDetails,
  ]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (type, message) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ type, message });
    toastTimerRef.current = window.setTimeout(() => {
      setToast({ type: "", message: "" });
    }, 2000);
  };

  const handleGenerateAI = async () => {
    setLoading(true);
    setSource("");
    try {
      const response = await fetch("/api/resignation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeName,
          companyName,
          position,
          recipientName,
          lastWorkingDay: formatInputDate(lastWorkingDay),
          noticePeriod,
          reason,
          letterType,
          includeHandover,
          handoverDetails,
        }),
      });

      const data = await response.json();
      if (response.ok && data.letterText) {
        setLetterText(data.letterText);
        const sourceLabel = data.source || "AI Generator";
        setSource(sourceLabel);
        showToast("success", "Letter generated with AI!");

        // Save to history
        const newHistory = {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          letterText: data.letterText,
          source: sourceLabel,
          companyName,
          letterType: letterTypes.find((t) => t.value === letterType)?.label || letterType,
        };
        const updated = [newHistory, ...history.slice(0, 2)];
        setHistory(updated);
        localStorage.setItem("resignation_history", JSON.stringify(updated));
      } else {
        showToast("error", data.message || data.error || "AI Generation failed.");
      }
    } catch {
      showToast("error", "Network request failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTemplate = () => {
    const text = compileLocalTemplate({
      employeeName,
      companyName,
      position,
      lastWorkingDay,
      noticePeriod,
      reason,
      recipientName,
      letterType,
      includeHandover,
      handoverDetails,
    });
    setLetterText(text);
    setSource("Local Template");
    showToast("success", "Letter compiled successfully.");

    // Save to history
    const newHistory = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      letterText: text,
      source: "Local Template",
      companyName,
      letterType: letterTypes.find((t) => t.value === letterType)?.label || letterType,
    };
    const updated = [newHistory, ...history.slice(0, 2)];
    setHistory(updated);
    localStorage.setItem("resignation_history", JSON.stringify(updated));
  };

  const handleCopy = async () => {
    if (!letterText) return;
    try {
      await navigator.clipboard.writeText(letterText);
      showToast("success", "Letter copied to clipboard.");
    } catch (err) {
      showToast("error", "Failed to copy letter.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setEmployeeName("Jane Doe");
    setCompanyName("InnovateTech Solutions");
    setPosition("Senior Software Engineer");
    setLastWorkingDay(getDefaultLastDay());
    setNoticePeriod("2 weeks");
    setReason("pursuing a new opportunity that aligns with my long-term career goals");
    setRecipientName("Manager");
    setLetterType("professional");
    setIncludeHandover(false);
    setHandoverDetails("");
    setLetterText("");
    setSource("");
    localStorage.removeItem("resignation_draft");
    showToast("success", "Form cleared and reset.");
  };

  const downloadPdf = async () => {
    if (!letterText) return;
    setIsGeneratingPdf(true);
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      
      // Determine font
      let fontTypeToEmbed = StandardFonts.TimesRoman;
      let fontBoldTypeToEmbed = StandardFonts.TimesRomanBold;
      
      if (pdfFontChoice === "Helvetica") {
        fontTypeToEmbed = StandardFonts.Helvetica;
        fontBoldTypeToEmbed = StandardFonts.HelveticaBold;
      } else if (pdfFontChoice === "Courier") {
        fontTypeToEmbed = StandardFonts.Courier;
        fontBoldTypeToEmbed = StandardFonts.CourierBold;
      }

      const fontRegular = await pdfDoc.embedFont(fontTypeToEmbed);
      const fontBold = await pdfDoc.embedFont(fontBoldTypeToEmbed);
      
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
      const marginX = 54; // 0.75 in margin
      const marginY = 54;
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const printableWidth = pageWidth - marginX * 2;
      
      let currentY = pageHeight - marginY - 20;
      const fontSize = 11;
      const lineHeight = fontSize * 1.5;
      
      // Draw top accent bar (amber)
      page.drawRectangle({
        x: marginX,
        y: pageHeight - 30,
        width: printableWidth,
        height: 4,
        color: rgb(0.96, 0.62, 0.04), // #f59e0b
      });
      
      const paragraphs = letterText.split("\n");
      let activePage = page;
      
      for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];
        
        if (paragraph.trim() === "") {
          currentY -= lineHeight;
          if (currentY < marginY + 20) {
            activePage = pdfDoc.addPage([595.28, 841.89]);
            currentY = pageHeight - marginY - 20;
            activePage.drawRectangle({
              x: marginX,
              y: pageHeight - 30,
              width: printableWidth,
              height: 4,
              color: rgb(0.96, 0.62, 0.04),
            });
          }
          continue;
        }
        
        const words = paragraph.split(" ");
        let currentLine = "";
        
        for (let w = 0; w < words.length; w++) {
          const testLine = currentLine ? `${currentLine} ${words[w]}` : words[w];
          const testLineWidth = fontRegular.widthOfTextAtSize(testLine, fontSize);
          
          if (testLineWidth > printableWidth && w > 0) {
            if (currentY < marginY + 20) {
              activePage = pdfDoc.addPage([595.28, 841.89]);
              currentY = pageHeight - marginY - 20;
              activePage.drawRectangle({
                x: marginX,
                y: pageHeight - 30,
                width: printableWidth,
                height: 4,
                color: rgb(0.96, 0.62, 0.04),
              });
            }
            activePage.drawText(currentLine, {
              x: marginX,
              y: currentY,
              size: fontSize,
              font: fontRegular,
              color: rgb(0.1, 0.1, 0.1),
            });
            currentLine = words[w];
            currentY -= lineHeight;
          } else {
            currentLine = testLine;
          }
        }
        
        // Draw remaining line of paragraph
        if (currentLine) {
          if (currentY < marginY + 20) {
            activePage = pdfDoc.addPage([595.28, 841.89]);
            currentY = pageHeight - marginY - 20;
            activePage.drawRectangle({
              x: marginX,
              y: pageHeight - 30,
              width: printableWidth,
              height: 4,
              color: rgb(0.96, 0.62, 0.04),
            });
          }
          activePage.drawText(currentLine, {
            x: marginX,
            y: currentY,
            size: fontSize,
            font: fontRegular,
            color: rgb(0.1, 0.1, 0.1),
          });
          currentY -= lineHeight;
        }
      }
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `Resignation_Letter_${employeeName.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      
      showToast("success", "PDF downloaded successfully.");
    } catch (e) {
      console.error(e);
      showToast("error", "Error building PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const loadHistoryItem = (item) => {
    setLetterText(item.letterText);
    setSource(item.source);
    showToast("success", "Restored letter from history.");
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("resignation_history");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4 sm:p-6 font-sans print:bg-white print:p-0 print:block">
      <div className="bg-white shadow-xl shadow-slate-100 rounded-3xl p-6 sm:p-10 w-full max-w-7xl border border-slate-100 flex flex-col gap-8 transition-all print:border-none print:shadow-none print:p-0 print:max-w-none">
        
        {/* Header Block (Hidden during print) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 print:hidden">
          <div className="flex flex-col gap-1.5 text-left">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider self-start">
              Career Upgrade
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Resignation Letter Generator
            </h1>
            <p className="text-slate-500 text-base max-w-2xl">
              Fill in your employment details, select a style, and generate a customized resignation letter locally or via AI.
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 active:scale-[0.98] transition text-sm cursor-pointer"
            >
              Clear Workspace
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch print:block">
          
          {/* Left Panel: Inputs (Hidden during print) */}
          <div className="lg:col-span-6 flex flex-col gap-6 print:hidden">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm shadow-slate-50 flex flex-col gap-5">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-1 border-b border-slate-100">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Employment Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Your Full Name
                  <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Recipient Name / Title
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. John Smith / Manager"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Company Name
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="InnovateTech"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Your Role / Position
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Software Engineer"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Contractual Notice Period
                  <input
                    type="text"
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                    placeholder="e.g. 2 weeks, 1 month"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Last Working Day
                  <input
                    type="date"
                    value={lastWorkingDay}
                    onChange={(e) => setLastWorkingDay(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                  />
                </label>

                <div className="sm:col-span-2 flex flex-col gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Letter Style / Tone
                  <ThemedDropdown
                    ariaLabel="Select letter type"
                    value={letterType}
                    options={letterTypes}
                    onChange={(value) => setLetterType(value)}
                  />
                </div>

                <label className="sm:col-span-2 flex flex-col gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Reason for Leaving (Optional)
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. to pursue a new opportunity, family reasons, career transition..."
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition resize-none"
                  />
                </label>
              </div>

              {/* Handover Plan Section */}
              <div className="mt-2 border-t border-slate-100 pt-4 flex flex-col gap-4">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeHandover}
                    onChange={(e) => setIncludeHandover(e.target.checked)}
                    className="w-4 h-4 text-amber-500 accent-amber-500 rounded border-slate-300 focus:ring-amber-400 cursor-pointer"
                  />
                  Include Transition / Handover Plan
                </label>

                {includeHandover && (
                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider animate-fade-in">
                    Handover Tasks / Responsibilities <span className="text-[10px] text-slate-400 font-normal">(One project/task per line)</span>
                    <textarea
                      value={handoverDetails}
                      onChange={(e) => setHandoverDetails(e.target.value)}
                      placeholder="e.g. Complete outstanding bug fixes&#10;Handover repo credentials to developer team&#10;Prepare transition document..."
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition resize-none"
                    />
                  </label>
                )}
              </div>

              {/* Generation Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={loading}
                  className="py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-bold transition shadow-md hover:shadow-lg hover:shadow-amber-100 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate with AI
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleGenerateTemplate}
                  disabled={loading}
                  className="py-3.5 border border-slate-900 hover:bg-slate-900 hover:text-white text-slate-900 rounded-xl font-semibold transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50 text-sm"
                >
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Quick Draft
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Preview and Actions (Editable preview & print container) */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 sm:p-6 shadow-sm shadow-slate-50 flex flex-col justify-between print:border-none print:shadow-none print:p-0 print:max-w-none print:bg-white min-h-[500px]">
            <div className="flex flex-col gap-4 h-full">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 print:hidden">
                <div className="flex flex-col">
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Letter Preview
                  </h2>
                  {source && (
                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5">Generated using {source}</span>
                  )}
                </div>
              </div>

              {/* Editable Text Area (Hidden during print) */}
              <div className="relative flex-grow print:hidden min-h-[380px] bg-white rounded-xl border border-slate-200 p-4 shadow-inner flex flex-col">
                {!letterText ? (
                  <div className="flex-grow flex flex-col items-center justify-center gap-3 text-slate-400 text-center py-12">
                    <svg className="w-12 h-12 text-slate-300 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <p className="text-sm font-semibold text-slate-500">Your letter will appear here</p>
                    <p className="text-xs text-slate-400 max-w-xs">Fill in your information on the left and click a generate button to begin.</p>
                  </div>
                ) : (
                  <textarea
                    value={letterText}
                    onChange={(e) => setLetterText(e.target.value)}
                    placeholder="Your resignation letter text will render here..."
                    className="w-full flex-grow text-sm leading-relaxed text-slate-800 font-mono resize-none focus:outline-none bg-transparent"
                  />
                )}
                {letterText && (
                  <span className="absolute bottom-2 right-3 text-[9px] text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded select-none">
                    ✏️ Edit draft directly
                  </span>
                )}
              </div>

              {/* Print Only formatted container (Hidden during web view) */}
              <div className="hidden print:block whitespace-pre-wrap font-serif text-slate-950 text-[11pt] leading-relaxed mx-auto max-w-[6.5in] pt-8 border-t-4 border-amber-500">
                {letterText}
              </div>
            </div>

            {/* Actions Buttons (Hidden during print) */}
            {letterText && (
              <div className="flex flex-col gap-3.5 print:hidden mt-5 border-t border-slate-200/50 pt-4">
                
                {/* PDF Customization controls */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full text-[10px] font-bold text-slate-400 uppercase tracking-wider flex flex-col gap-1.5">
                    PDF Font Style
                    <ThemedDropdown
                      ariaLabel="Select PDF font"
                      value={pdfFontChoice}
                      options={pdfFonts}
                      onChange={(val) => setPdfFontChoice(val)}
                      inlineMenu={true}
                    />
                  </label>

                  <button
                    onClick={downloadPdf}
                    disabled={isGeneratingPdf}
                    className="w-full sm:w-auto shrink-0 px-6 py-3.5 mt-5 bg-slate-900 hover:bg-slate-850 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition duration-200 active:scale-[0.98] disabled:opacity-50 text-sm shadow-md"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Building PDF...
                      </>
                    ) : (
                      <>
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download PDF
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    onClick={handleCopy}
                    className="py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 active:scale-[0.98] transition focus:outline-none text-sm cursor-pointer"
                  >
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy Letter
                  </button>

                  <button
                    onClick={handlePrint}
                    className="py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 active:scale-[0.98] transition focus:outline-none text-sm cursor-pointer"
                  >
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Letter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History Log Section */}
        {history.length > 0 && (
          <div className="border-t border-slate-100 pt-6 flex flex-col gap-4 print:hidden">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Resignation Drafts ({history.length})
              </h3>
              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-slate-400 hover:text-red-500 font-semibold transition cursor-pointer"
              >
                Clear History
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {history.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => loadHistoryItem(item)}
                  className="p-4 border border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50/10 cursor-pointer rounded-xl flex flex-col gap-1 text-left transition duration-200 group active:scale-[0.98]"
                >
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-amber-800 transition">
                    {item.timestamp} • {item.letterType} Style
                  </span>
                  <p className="text-xs font-semibold text-slate-700 truncate">
                    {item.companyName} resignation
                  </p>
                  <span className="text-[9px] text-slate-400 mt-1 line-clamp-2">
                    {item.letterText.substring(0, 100).replace(/\r?\n/g, " ")}...
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast.message && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl shadow-xl text-sm font-semibold z-50 animate-fade-in-out transition-all flex items-center gap-2 ${
            toast.type === "success"
              ? "bg-slate-900 text-white border border-slate-800"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-emerald-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      <style jsx global>{`
        html {
          font-family: var(--font-geist-sans), "Helvetica Neue", Arial, "system-ui", sans-serif;
        }
        .animate-fade-in-out {
          animation: fadeInOut 2s ease-in-out;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, 15px); }
          12% { opacity: 1; transform: translate(-50%, 0); }
          88% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -15px); }
        }
        @media print {
          /* Hide global layout elements */
          nav, 
          .tool-float-button,
          header,
          footer {
            display: none !important;
          }
          
          /* Reset backgrounds and layouts for standard printing */
          body, html {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
          }
          
          /* Remove flex layout centering & spacing in print view */
          .min-h-screen {
            display: block !important;
            min-height: 0 !important;
            background: transparent !important;
            padding: 0 !important;
          }
          
          /* Expand main container to full print width */
          .max-w-7xl {
            max-width: none !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          
          /* Remove grid columns when printing */
          .grid {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
