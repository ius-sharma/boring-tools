"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const letterTypes = [
  { value: "formal", label: "Formal" },
  { value: "professional", label: "Professional" },
  { value: "short", label: "Short" },
  { value: "friendly", label: "Friendly" },
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

const generateLetterText = (params) => {
  const {
    employeeName,
    companyName,
    position,
    lastWorkingDay,
    noticePeriod,
    reason,
    recipientName,
    letterType,
  } = params;

  const todayStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedLastDay = formatInputDate(lastWorkingDay);
  const recipient = recipientName || "Manager";

  const formalTemplate = `${todayStr}

To:
${recipient}
${companyName}

Dear ${recipient},

Please accept this letter as formal notification that I am resigning from my position as ${position} at ${companyName}. My last working day will be ${formattedLastDay}, in accordance with my notice period of ${noticePeriod}.

${reason ? `This decision is due to ${reason.trim()}.\n\n` : ""}Thank you for the opportunities that I have been given during my time at ${companyName}. I appreciate the support and guidance from the team.

I will do my best to ensure a smooth transition of my responsibilities before my departure.

Sincerely,

${employeeName}`;

  const professionalTemplate = `${todayStr}

To:
${recipient}
${companyName}

Dear ${recipient},

I am writing to formally resign from my role as ${position} at ${companyName}. As per my contract, my last day of employment will be ${formattedLastDay}, following my ${noticePeriod} notice period.

${reason ? `This decision is due to ${reason.trim()}.\n\n` : ""}I would like to express my sincere gratitude for the professional development and growth opportunities I have had during my tenure. I have thoroughly enjoyed working with the team and appreciate the guidance I've received.

During my remaining time, I will focus on completing outstanding tasks and assisting with the handover to ensure a seamless transition of my responsibilities.

Best regards,

${employeeName}`;

  const shortTemplate = `${todayStr}

To:
${recipient}
${companyName}

Dear ${recipient},

Please accept this letter as notification that I am resigning from my position as ${position} at ${companyName}. My last day of work will be ${formattedLastDay}.

${reason ? `My reason for resigning is ${reason.trim()}.\n\n` : ""}Thank you for the opportunity to work at ${companyName}. I wish the company and team the very best.

Sincerely,

${employeeName}`;

  const friendlyTemplate = `${todayStr}

To:
${recipient}
${companyName}

Hi ${recipient},

I'm writing to let you know that I've decided to move on from my role as ${position} at ${companyName}. My last day will be ${formattedLastDay}, completing my ${noticePeriod} notice period.

${reason ? `I've made this choice because ${reason.trim()}.\n\n` : ""}I want to thank you and everyone on the team for such a wonderful experience. I've really loved working here and will miss the great collaboration and memories we've shared.

I'll make sure everything is wrapped up and handed over properly before my last day. Let's definitely stay in touch!

Warmly,

${employeeName}`;

  switch (letterType) {
    case "formal":
      return formalTemplate;
    case "short":
      return shortTemplate;
    case "friendly":
      return friendlyTemplate;
    case "professional":
    default:
      return professionalTemplate;
  }
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

  const [letterText, setLetterText] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const toastTimerRef = useRef(null);

  // Load from Client check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update letter preview when any inputs change, unless edited by user
  useEffect(() => {
    const text = generateLetterText({
      employeeName,
      companyName,
      position,
      lastWorkingDay,
      noticePeriod,
      reason,
      recipientName,
      letterType,
    });
    setLetterText(text);
  }, [
    employeeName,
    companyName,
    position,
    lastWorkingDay,
    noticePeriod,
    reason,
    recipientName,
    letterType,
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
    showToast("success", "Form reset to default values.");
  };

  const downloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      
      // Using Times-Roman font for professional letter feel
      const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      
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
      showToast("error", "Error building PDF resignation letter.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans print:bg-white print:p-0 print:block">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-6xl border border-slate-200 flex flex-col gap-6 print:border-none print:shadow-none print:p-0 print:max-w-none">
        
        {/* Title Block (Hidden during print) */}
        <div className="flex flex-col gap-2 items-center text-center print:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Career</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Resignation Letter Generator</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Create professional resignation letters client-side instantly. Customize your details, edit the result, and download or print.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-stretch print:block">
          
          {/* Left Panel: Inputs (Hidden during print) */}
          <div className="flex flex-col gap-6 print:hidden">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Details</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Letter Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Employee Name</span>
                  <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Recipient Name / Title</span>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Manager, HR Department"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Company Name</span>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company Name"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Position</span>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Your Role"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Notice Period</span>
                  <input
                    type="text"
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                    placeholder="e.g. 2 weeks, 1 month"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Last Working Day</span>
                  <input
                    type="date"
                    value={lastWorkingDay}
                    onChange={(e) => setLastWorkingDay(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>

                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Letter Style / Type</span>
                  <ThemedDropdown
                    ariaLabel="Select letter type"
                    value={letterType}
                    options={letterTypes}
                    onChange={(value) => setLetterType(value)}
                  />
                </div>

                <label className="sm:col-span-2 flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Reason for Resignation (Optional)</span>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. to pursue a new opportunity, to relocate, for personal reasons"
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Right Panel: Preview and Actions (Editable preview & print container) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm flex flex-col gap-4 print:border-none print:shadow-none print:p-0 print:max-w-none justify-between">
            <div className="flex flex-col gap-4 h-full">
              <div className="flex items-center justify-between print:hidden">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Preview</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Editable Resignation Letter</h2>
                </div>
              </div>

              {/* Editable Text Area (Hidden during print) */}
              <div className="relative flex-grow print:hidden">
                <textarea
                  value={letterText}
                  onChange={(e) => setLetterText(e.target.value)}
                  placeholder="Generated letter text will appear here..."
                  className="w-full h-[400px] lg:h-[450px] p-4 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 transition text-sm text-slate-800 font-mono resize-none"
                />
                <span className="absolute bottom-2 right-3 text-[10px] text-slate-400 bg-white/80 px-2 py-0.5 rounded border border-slate-100 backdrop-blur select-none">
                  ✏️ Edit directly
                </span>
              </div>

              {/* Print Only formatted container (Hidden during web view) */}
              <div className="hidden print:block whitespace-pre-wrap font-serif text-slate-950 text-[12pt] leading-relaxed mx-auto max-w-[6.5in] pt-8 border-t-4 border-amber-500">
                {letterText}
              </div>
            </div>

            {/* Actions Buttons (Hidden during print) */}
            <div className="flex flex-col gap-2 print:hidden mt-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopy}
                  className="border border-slate-900 text-slate-900 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15.75H6A2.25 2.25 0 013.75 13.5v-9A2.25 2.25 0 016 2.25h9A2.25 2.25 0 0117.25 4.5v2.25m-9 9h9A2.25 2.25 0 0019.5 13.5v6A2.25 2.25 0 0117.25 22.5h-9A2.25 2.25 0 016 20.25v-6z" />
                  </svg>
                  Copy Letter
                </button>

                <button
                  onClick={downloadPdf}
                  disabled={isGeneratingPdf}
                  className="border border-slate-900 text-slate-900 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingPdf ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      Download PDF
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handlePrint}
                  className="border border-slate-300 text-slate-700 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Letter
                </button>

                <button
                  onClick={handleReset}
                  className="border border-slate-300 text-slate-700 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Reset Form
                </button>
              </div>
            </div>
          </div>

        </div>
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
          .max-w-6xl {
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
