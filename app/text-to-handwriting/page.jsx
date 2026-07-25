"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

// Dynamically import pdf-lib in functions to avoid bundle issues,
// but since it's standard client-side npm we can import it statically.
import { PDFDocument } from "pdf-lib";

const FONTS = [
  { id: "Caveat", label: "Student Notebook", family: "Caveat", isCursive: true },
  { id: "Architects Daughter", label: "Neat Notes", family: "Architects Daughter", isCursive: false },
  { id: "Reenie Beanie", label: "Messy Student", family: "Reenie Beanie", isCursive: false },
  { id: "Dancing Script", label: "Cursive", family: "Dancing Script", isCursive: true },
  { id: "Sacramento", label: "Elegant Script", family: "Sacramento", isCursive: true },
  { id: "Homemade Apple", label: "Journal Style", family: "Homemade Apple", isCursive: true },
  { id: "Patrick Hand", label: "Exam Style", family: "Patrick Hand", isCursive: false },
  { id: "Indie Flower", label: "Playful Notes", family: "Indie Flower", isCursive: false },
  { id: "Shadows Into Light", label: "Quick Notes", family: "Shadows Into Light", isCursive: false },
  { id: "Gochi Hand", label: "Draft Style", family: "Gochi Hand", isCursive: false },
  { id: "Marck Script", label: "Classic Cursive", family: "Marck Script", isCursive: true },
];

const PAPER_TYPES = [
  { id: "white", label: "White Paper", class: "bg-white border-slate-200" },
  { id: "ruled", label: "Ruled Notebook", class: "bg-white border-slate-200 [background-image:linear-gradient(#c5e1f5_1px,transparent_1px)] [background-size:100%_24px]" },
  { id: "college", label: "College Ruled", class: "bg-white border-slate-200 [background-image:linear-gradient(#c5e1f5_1px,transparent_1px)] [background-size:100%_18px]" },
  { id: "grid", label: "Grid Paper", class: "bg-white border-slate-200 [background-image:linear-gradient(#e2eaf0_1px,transparent_1px),linear-gradient(90deg,#e2eaf0_1px,transparent_1px)] [background-size:16px_16px]" },
  { id: "dot-grid", label: "Dot Grid", class: "bg-white border-slate-200 [background-image:radial-gradient(#b2c2d1_1px,transparent_1px)] [background-size:16px_16px] [background-position:center]" },
  { id: "yellow-legal", label: "Yellow Legal Pad", class: "bg-[#fdf8cd] border-slate-200 [background-image:linear-gradient(#e5c7a0_1px,transparent_1px)] [background-size:100%_20px]" },
  { id: "vintage", label: "Vintage Paper", class: "bg-amber-50 border-amber-200 [background-image:radial-gradient(rgba(139,90,43,0.1)_1px,transparent_1px)]" },
  { id: "blank", label: "Blank Sheet", class: "bg-white border-slate-100" },
];

const INK_COLORS = [
  { id: "blue", label: "Royal Blue", hex: "#1d3c87" },
  { id: "darkblue", label: "Dark Blue", hex: "#0f2b59" },
  { id: "black", label: "Carbon Black", hex: "#1a1a1a" },
  { id: "red", label: "Red Ink", hex: "#bd2626" },
  { id: "green", label: "Green Ink", hex: "#1e7a3c" },
  { id: "purple", label: "Purple Ink", hex: "#6b21a8" },
];

const PAGE_SIZES = [
  { value: "a4", label: "A4 (Standard Document)" },
  { value: "letter", label: "US Letter" },
  { value: "notebook", label: "Compact Notebook" },
];

const QUALITY_LEVELS = [
  { value: "normal", label: "Normal (96 DPI)" },
  { value: "high", label: "High (150 DPI - Standard)" },
  { value: "ultra", label: "Ultra HD (300 DPI - Print Ready)" },
];

const SAMPLE_TEXT = `Dear Friend,

I wanted to reach out and share some exciting news. Over the past few weeks, I've been working on a project called BoringTools. It's a collection of simple, offline-first tools designed to make everyday developer and productivity tasks easier.

Everything runs entirely inside your browser—no databases, no servers, and zero telemetry. It is privacy-first by design.

This handwriting converter is one of the premium additions. It helps you transform dry, typed letters into something with a warm, human touch. You can adjust margins, line spacing, slant, ink thickness, and even simulate writing mistakes to make it look authentic.

I hope you find it useful. Let me know what you think!

Warm regards,
Alex`;

export default function TextToHandwritingPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  // Undo/Redo & Document State
  const [text, setText] = useState(SAMPLE_TEXT);
  const [documentTitle, setDocumentTitle] = useState("Handwritten Document");
  const [history, setHistory] = useState([SAMPLE_TEXT]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Quick Action State
  const [toast, setToast] = useState({ show: false, msg: "" });
  const toastTimerRef = useRef(null);
  
  // Custom background image references
  const [customBgUrl, setCustomBgUrl] = useState(null);
  const [customBgImageElement, setCustomBgImageElement] = useState(null);

  // Settings Object
  const [options, setOptions] = useState({
    fontFamily: "Caveat",
    paperType: "ruled",
    inkColor: "#1d3c87",
    customInkHex: "#1d3c87",
    isCustomInkActive: false,
    
    // Page Layout
    pageSize: "a4",
    quality: "high",
    marginTop: 60,
    marginBottom: 60,
    marginLeft: 70,
    marginRight: 60,
    lineSpacing: 28,
    paragraphSpacing: 22,
    fontSize: 20,

    // Handwriting Feel
    characterSize: 1.0,
    randomCharVariation: true,
    wordSpacing: 8,
    letterSpacing: 1,
    lineAngle: 0.2, // very slight tilt
    slant: 4, // slight slant to the right
    strokeThickness: 0.8,
    penPressureEnabled: true,

    // Realism Controls
    realismEnabled: true,
    randomLetterRotation: true,
    naturalBaselineVariation: true,
    unevenInk: true,
    smallMistakes: true,
    mistakeChance: 0.015,
    naturalCharacterOffset: true,
    randomSpacing: true,

    // Headers / Footers / Bonus
    showHeading: true,
    headingText: "BoringTools Handwriting Simulator",
    headingAlign: "center",
    headingSize: 26,
    
    showDate: true,
    dateText: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    
    showPageNumber: true,
    pageNumberFormat: "- Page {page} of {total} -",
    
    showSignature: true,
    signatureText: "Alex Vance",
    signatureSize: 32,

    showFooter: false,
    footerText: "Created with BoringTools",

    backgroundOption: "notebook", // notebook, assignment, exam, blank
  });

  // UI States
  const [activeTab, setActiveTab] = useState("editor"); // editor, font, layout, realism, header
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [previewZoom, setPreviewZoom] = useState(45);
  const [exporting, setExporting] = useState(false);
  const [rendering, setRendering] = useState(false);

  // Debounced rendering triggers
  const [renderTrigger, setRenderTrigger] = useState(0);

  const previewCanvasRef = useRef(null);

  // Show Toast Toast Notification helper
  const showToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, msg });
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, msg: "" });
    }, 3000);
  };

  // Mount Effect
  useEffect(() => {
    setIsMounted(true);
    
    // Load Fonts dynamically
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Dancing+Script:wght@400;700&family=Homemade+Apple&family=Indie+Flower&family=Just+Me+Again+Down+Here&family=Ms+Madi&family=Nanum+Pen+Script&family=Reenie+Beanie&family=Shadows+Into+Light&family=Architects+Daughter&family=Patrick+Hand&family=Gochi+Hand&family=Sacramento&family=Marck+Script&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    if (document.fonts) {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    } else {
      setTimeout(() => setFontsLoaded(true), 1500);
    }

    // Load Local Storage Settings
    try {
      const saved = localStorage.getItem("boringtools-text-to-handwriting-data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.options) {
          setOptions(prev => ({
            ...prev,
            ...parsed.options,
            // Keep default custom ink state active if Hex is set
            customInkHex: parsed.options.customInkHex || prev.customInkHex,
            isCustomInkActive: parsed.options.isCustomInkActive || prev.isCustomInkActive,
          }));
        }
        if (parsed.text) {
          setText(parsed.text);
          setHistory([parsed.text]);
          setHistoryIndex(0);
        }
        if (parsed.documentTitle) {
          setDocumentTitle(parsed.documentTitle);
        }
      }
    } catch (e) {
      console.error("Localstorage failed to load:", e);
    }

    return () => {
      try {
        document.head.removeChild(link);
      } catch (err) {}
    };
  }, []);

  // Save Settings to Local Storage on Change
  useEffect(() => {
    if (!isMounted) return;
    const timer = setTimeout(() => {
      try {
        const dataToSave = {
          options,
          text,
          documentTitle,
        };
        localStorage.setItem("boringtools-text-to-handwriting-data", JSON.stringify(dataToSave));
      } catch (e) {
        console.error("Localstorage save failed:", e);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [options, text, documentTitle, isMounted]);

  // Set keyboard listeners for undo/redo & download
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        exportPDF();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [history, historyIndex, text, options]);

  // Handle custom background image upload
  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setCustomBgUrl(dataUrl);

      const img = new Image();
      img.onload = () => {
        setCustomBgImageElement(img);
        setOptions(prev => ({ ...prev, paperType: "custom" }));
        showToast("Custom background background loaded!");
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Text state updater for Undo/Redo stack
  const handleTextChange = (val) => {
    setText(val);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(val);
    if (newHistory.length > 30) {
      newHistory.shift();
    }
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setText(history[prevIndex]);
      showToast("Undo action");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setText(history[nextIndex]);
      showToast("Redo action");
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear your current text?")) {
      handleTextChange("");
      showToast("Text cleared");
    }
  };

  const handleLoadSample = () => {
    handleTextChange(SAMPLE_TEXT);
    showToast("Sample text loaded");
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(text);
    showToast("Text copied to clipboard!");
  };

  // Calculations for Page Layout and Word wrapping
  const pageLayout = useMemo(() => {
    // Determine dimensions based on page size and quality scale
    let baseWidth = 794;
    let baseHeight = 1123;
    if (options.pageSize === "letter") {
      baseWidth = 816;
      baseHeight = 1056;
    } else if (options.pageSize === "notebook") {
      baseWidth = 700;
      baseHeight = 900;
    }

    const scale = options.quality === "normal" ? 1 : options.quality === "high" ? 2 : 3;
    const width = baseWidth * scale;
    const height = baseHeight * scale;

    const fontSize = options.fontSize * scale;
    const margins = {
      top: options.marginTop * scale,
      bottom: options.marginBottom * scale,
      left: options.marginLeft * scale,
      right: options.marginRight * scale,
    };
    
    const lineSpacing = options.lineSpacing * scale;
    const paragraphSpacing = options.paragraphSpacing * scale;
    
    // Scale word spacing relative to settings and letter spacing
    const wordSpacingVal = options.wordSpacing * scale;

    const pages = [];
    let currentPage = { elements: [] };
    pages.push(currentPage);

    // Create measurement offscreen canvas
    // Needs to run inside clients
    if (typeof window === "undefined") {
      return { pages: [], width, height, scale };
    }

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return { pages: [], width, height, scale };

    tempCtx.font = `${fontSize}px "${options.fontFamily}"`;

    let currentX = margins.left;
    let currentY = margins.top;

    // Add Heading
    if (options.showHeading && options.headingText) {
      const headingSize = options.headingSize * scale;
      tempCtx.font = `bold ${headingSize}px "${options.fontFamily}"`;
      
      currentPage.elements.push({
        type: "heading",
        text: options.headingText,
        x: margins.left,
        y: currentY + headingSize,
        width: width - margins.left - margins.right,
        height: headingSize,
      });

      currentY += headingSize + (paragraphSpacing * 1.5);
      tempCtx.font = `${fontSize}px "${options.fontFamily}"`;
    } else {
      currentY += fontSize;
    }

    const paragraphs = text.split("\n");

    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
      const paragraph = paragraphs[pIdx];

      if (paragraph.trim() === "") {
        currentY += paragraphSpacing;
        if (currentY + fontSize > height - margins.bottom) {
          currentY = margins.top + fontSize;
          currentPage = { elements: [] };
          pages.push(currentPage);
        }
        continue;
      }

      // Split while retaining spacing
      const words = paragraph.split(" ");
      for (let wIdx = 0; wIdx < words.length; wIdx++) {
        const word = words[wIdx];
        if (word === "") {
          currentX += wordSpacingVal;
          continue;
        }

        // Mistake simulator check
        const isMistake = options.realismEnabled && options.smallMistakes && (Math.random() < options.mistakeChance);

        // Measure word width
        let wordWidth = tempCtx.measureText(word).width;
        
        // Compensate for custom letter spacing inside calculations
        if (options.letterSpacing !== 0) {
          wordWidth += word.length * (options.letterSpacing * scale);
        }

        if (isMistake) {
          // If mistake, render crossed out word, then correct word
          // First check line overflow for crossed out word
          if (currentX + wordWidth > width - margins.right) {
            currentX = margins.left;
            currentY += lineSpacing;

            if (currentY + fontSize > height - margins.bottom) {
              currentY = margins.top + fontSize;
              currentPage = { elements: [] };
              pages.push(currentPage);
            }
          }

          currentPage.elements.push({
            type: "word",
            text: word,
            x: currentX,
            y: currentY,
            width: wordWidth,
            fontSize: fontSize,
            isMistake: true,
          });

          currentX += wordWidth + wordSpacingVal;

          // Check line overflow for the duplicate corrected word
          if (currentX + wordWidth > width - margins.right) {
            currentX = margins.left;
            currentY += lineSpacing;

            if (currentY + fontSize > height - margins.bottom) {
              currentY = margins.top + fontSize;
              currentPage = { elements: [] };
              pages.push(currentPage);
            }
          }

          currentPage.elements.push({
            type: "word",
            text: word,
            x: currentX,
            y: currentY,
            width: wordWidth,
            fontSize: fontSize,
            isMistake: false,
          });

          currentX += wordWidth + wordSpacingVal;
        } else {
          // Regular word wrapping
          if (currentX + wordWidth > width - margins.right) {
            currentX = margins.left;
            currentY += lineSpacing;

            if (currentY + fontSize > height - margins.bottom) {
              currentY = margins.top + fontSize;
              currentPage = { elements: [] };
              pages.push(currentPage);
            }
          }

          currentPage.elements.push({
            type: "word",
            text: word,
            x: currentX,
            y: currentY,
            width: wordWidth,
            fontSize: fontSize,
            isMistake: false,
          });

          currentX += wordWidth + wordSpacingVal;
        }
      }

      // Paragraph break
      currentX = margins.left;
      currentY += paragraphSpacing;

      if (currentY + fontSize > height - margins.bottom && pIdx < paragraphs.length - 1) {
        currentY = margins.top + fontSize;
        currentPage = { elements: [] };
        pages.push(currentPage);
      }
    }

    // Add Signature to last page if enabled
    if (options.showSignature && options.signatureText) {
      const sigHeight = options.signatureSize * scale;
      if (currentY + sigHeight + (30 * scale) > height - margins.bottom) {
        currentPage = { elements: [] };
        pages.push(currentPage);
        currentY = margins.top + sigHeight;
      } else {
        currentY += paragraphSpacing + (15 * scale);
      }

      currentPage.elements.push({
        type: "signature",
        y: currentY + sigHeight,
        height: sigHeight,
      });
    }

    return { pages, width, height, scale };
  }, [text, options, renderTrigger]);

  // Handle active page boundary check
  useEffect(() => {
    if (activePageIndex >= pageLayout.pages.length) {
      setActivePageIndex(Math.max(0, pageLayout.pages.length - 1));
    }
  }, [pageLayout, activePageIndex]);

  // Effect to draw on the preview canvas
  useEffect(() => {
    if (!isMounted || !fontsLoaded) return;

    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const activePage = pageLayout.pages[activePageIndex];
    if (!activePage) return;

    setRendering(true);
    
    // Draw in a short timeout to prevent UI thread blocking
    const timer = setTimeout(() => {
      drawPage(canvas, activePage, options, activePageIndex, pageLayout.pages.length);
      setRendering(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [pageLayout, activePageIndex, options, fontsLoaded, isMounted, customBgImageElement]);

  // Reset rendering trigger on custom changes
  const triggerReRender = () => {
    setRenderTrigger(prev => prev + 1);
  };

  // Programmatic drawing function
  const drawPage = (canvas, pageData, opt, pageIdx, totalPages) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = opt.quality === "normal" ? 1 : opt.quality === "high" ? 2 : 3;
    const w = canvas.width;
    const h = canvas.height;

    // Draw background
    if (opt.paperType === "custom" && customBgImageElement) {
      ctx.drawImage(customBgImageElement, 0, 0, w, h);
    } else {
      drawPaperBackground(ctx, w, h, opt, scale);
    }

    // Common Settings
    const inkColorToUse = opt.isCustomInkActive ? opt.customInkHex : opt.inkColor;
    ctx.fillStyle = inkColorToUse;
    ctx.textBaseline = "baseline";

    const baseLineSpacing = opt.lineSpacing * scale;
    const baseFontSize = opt.fontSize * scale;
    const margins = {
      top: opt.marginTop * scale,
      bottom: opt.marginBottom * scale,
      left: opt.marginLeft * scale,
      right: opt.marginRight * scale,
    };

    // Draw Date
    if (opt.showDate && opt.dateText) {
      ctx.save();
      ctx.font = `${baseFontSize * 0.85}px "${opt.fontFamily}"`;
      ctx.fillStyle = inkColorToUse;
      ctx.textAlign = "right";
      
      // Top right coordinate inside margins
      const dateX = w - margins.right;
      const dateY = margins.top - (baseFontSize * 0.6);
      
      // Draw date with slight slant/angle
      ctx.translate(dateX, dateY);
      if (opt.realismEnabled && opt.randomLineAngleVariation) {
        ctx.rotate((Math.random() - 0.5) * 0.015);
      }
      ctx.fillText(opt.dateText, 0, 0);
      ctx.restore();
    }

    // Draw Page Number
    if (opt.showPageNumber) {
      ctx.save();
      ctx.font = `${baseFontSize * 0.75}px "${opt.fontFamily}"`;
      ctx.fillStyle = inkColorToUse;
      ctx.textAlign = "center";
      
      const pageText = opt.pageNumberFormat
        .replace("{page}", pageIdx + 1)
        .replace("{total}", totalPages);
        
      const pNumX = w / 2;
      const pNumY = h - (margins.bottom * 0.4);
      
      ctx.fillText(pageText, pNumX, pNumY);
      ctx.restore();
    }

    // Draw Footer Text
    if (opt.showFooter && opt.footerText) {
      ctx.save();
      ctx.font = `${baseFontSize * 0.75}px "${opt.fontFamily}"`;
      ctx.fillStyle = inkColorToUse;
      ctx.textAlign = "center";
      
      const fX = w / 2;
      const fY = h - (margins.bottom * 0.6);
      
      ctx.fillText(opt.footerText, fX, fY);
      ctx.restore();
    }

    // Draw elements
    const isFontCursive = FONTS.find(f => f.family === opt.fontFamily)?.isCursive ?? true;

    pageData.elements.forEach(element => {
      if (element.type === "heading") {
        ctx.save();
        ctx.font = `bold ${element.height}px "${opt.fontFamily}"`;
        ctx.fillStyle = inkColorToUse;
        ctx.textAlign = opt.headingAlign;
        
        const headingX = opt.headingAlign === "left" 
          ? margins.left 
          : opt.headingAlign === "right" 
            ? w - margins.right 
            : w / 2;
            
        ctx.fillText(element.text, headingX, element.y);
        ctx.restore();
        return;
      }

      if (element.type === "signature") {
        ctx.save();
        // Signature Line
        ctx.strokeStyle = inkColorToUse;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        const lineLeft = w - margins.right - (140 * scale);
        const lineRight = w - margins.right;
        ctx.moveTo(lineLeft, element.y);
        ctx.lineTo(lineRight, element.y);
        ctx.stroke();

        // Signature cursive text
        ctx.font = `italic ${element.height}px "Sacramento"`;
        ctx.fillStyle = inkColorToUse;
        ctx.textAlign = "center";
        ctx.fillText(opt.signatureText, (lineLeft + lineRight) / 2, element.y - (6 * scale));
        ctx.restore();
        return;
      }

      // Normal Word drawing
      ctx.save();

      // Slant skew
      let slantAngle = (opt.slant || 0) * (Math.PI / 180);
      if (opt.realismEnabled && opt.randomCharVariation) {
        slantAngle += (Math.random() - 0.5) * 0.03;
      }

      ctx.font = `${element.fontSize}px "${opt.fontFamily}"`;
      ctx.fillStyle = inkColorToUse;

      // Uneven Ink simulation
      let opacity = 1.0;
      if (opt.realismEnabled && opt.unevenInk) {
        opacity = 0.82 + Math.random() * 0.18;
      }
      ctx.globalAlpha = opacity;

      // Baseline shift
      let baselineShift = 0;
      if (opt.realismEnabled && opt.naturalBaselineVariation) {
        baselineShift = (Math.random() - 0.5) * (2 * scale);
      }

      // Line angles
      let lineRotAngle = (opt.lineAngle || 0) * (Math.PI / 180);
      if (opt.realismEnabled && opt.naturalBaselineVariation) {
        // very subtle line shift
        lineRotAngle += (Math.random() - 0.5) * 0.008;
      }

      // Render Cursive vs Print
      if (isFontCursive) {
        // Word-by-Word
        ctx.save();
        ctx.translate(element.x, element.y + baselineShift);
        
        if (slantAngle !== 0) {
          ctx.transform(1, 0, Math.tan(slantAngle), 1, 0, 0);
        }
        if (lineRotAngle !== 0) {
          ctx.rotate(lineRotAngle);
        }

        // Draw shadow/ink bleeding for custom pressure thickness
        if (opt.strokeThickness > 0) {
          ctx.strokeStyle = inkColorToUse;
          ctx.lineWidth = (opt.strokeThickness * 0.35) * scale;
          ctx.strokeText(element.text, 0, 0);
        }

        ctx.fillText(element.text, 0, 0);
        ctx.restore();

        // Draw scribble mistake
        if (element.isMistake) {
          drawScribbleMistake(ctx, element.x, element.y + baselineShift, element.width, baseFontSize, inkColorToUse, scale);
        }
      } else {
        // Character-by-Character
        let charX = element.x;
        const chars = element.text.split("");

        chars.forEach((char) => {
          ctx.save();
          const charWidth = ctx.measureText(char).width;

          // Individual character rotation
          let charRot = 0;
          if (opt.realismEnabled && opt.randomLetterRotation) {
            charRot = (Math.random() - 0.5) * 0.08;
          }

          let charYOffset = baselineShift;
          if (opt.realismEnabled && opt.naturalBaselineVariation) {
            charYOffset += (Math.random() - 0.5) * (1 * scale);
          }

          let charXOffset = 0;
          if (opt.realismEnabled && opt.naturalCharacterOffset) {
            charXOffset += (Math.random() - 0.5) * (0.8 * scale);
          }

          ctx.translate(charX + charXOffset + charWidth / 2, element.y + charYOffset);
          
          if (slantAngle !== 0) {
            ctx.transform(1, 0, Math.tan(slantAngle), 1, 0, 0);
          }
          if (charRot !== 0) {
            ctx.rotate(charRot);
          }

          // Stroke Thickness
          if (opt.strokeThickness > 0) {
            ctx.strokeStyle = inkColorToUse;
            ctx.lineWidth = (opt.strokeThickness * 0.35) * scale;
            ctx.strokeText(char, -charWidth / 2, 0);
          }

          ctx.fillText(char, -charWidth / 2, 0);
          ctx.restore();

          let charAdvance = charWidth + (opt.letterSpacing * scale);
          if (opt.realismEnabled && opt.randomSpacing) {
            charAdvance += (Math.random() - 0.5) * (0.8 * scale);
          }
          charX += charAdvance;
        });

        // Draw scribble mistake
        if (element.isMistake) {
          drawScribbleMistake(ctx, element.x, element.y + baselineShift, element.width, baseFontSize, inkColorToUse, scale);
        }
      }

      ctx.restore();
    });
  };

  // Draw paper guidelines programmatically
  const drawPaperBackground = (ctx, w, h, opt, scale) => {
    const paper = opt.paperType;

    // Fill Page Color
    if (paper === "yellow-legal") {
      ctx.fillStyle = "#fdf8cd";
    } else if (paper === "vintage") {
      const g = ctx.createRadialGradient(w/2, h/2, 10, w/2, h/2, Math.max(w, h));
      g.addColorStop(0, "#fbf7ec");
      g.addColorStop(0.5, "#f5edd9");
      g.addColorStop(1, "#eadbba");
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = "#ffffff";
    }
    ctx.fillRect(0, 0, w, h);

    // Vintage Speckles
    if (paper === "vintage") {
      ctx.fillStyle = "rgba(120, 80, 40, 0.035)";
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 35 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const baseLineSpacing = opt.lineSpacing * scale;
    const topMargin = opt.marginTop * scale;
    const bottomMargin = opt.marginBottom * scale;
    const leftMargin = opt.marginLeft * scale;
    const rightMargin = opt.marginRight * scale;

    ctx.save();

    // Check if background requires lined guides
    if (paper === "ruled" || paper === "college" || paper === "yellow-legal" || opt.backgroundOption === "notebook" || opt.backgroundOption === "assignment" || opt.backgroundOption === "exam") {
      ctx.strokeStyle = "#c5e1f5";
      ctx.lineWidth = 1 * scale;

      // Draw horizontal lined pages
      for (let y = topMargin; y < h - bottomMargin; y += baseLineSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Vertical Margin rule (Red line)
      ctx.strokeStyle = "#ff9999";
      ctx.lineWidth = 1.5 * scale;
      const redX = leftMargin > 0 ? leftMargin : 80 * scale;

      ctx.beginPath();
      ctx.moveTo(redX, 0);
      ctx.lineTo(redX, h);
      ctx.stroke();

      // Legal Pad Double Line
      if (paper === "yellow-legal") {
        ctx.beginPath();
        ctx.moveTo(redX - 4 * scale, 0);
        ctx.lineTo(redX - 4 * scale, h);
        ctx.stroke();
      }

      // Special sheets margins
      if (opt.backgroundOption === "assignment") {
        ctx.strokeStyle = "#ff9999";
        ctx.lineWidth = 1.5 * scale;
        // Top separator border
        ctx.beginPath();
        ctx.moveTo(0, topMargin - 8 * scale);
        ctx.lineTo(w, topMargin - 8 * scale);
        ctx.stroke();
      } else if (opt.backgroundOption === "exam") {
        // Draw right vertical red line
        ctx.strokeStyle = "#ff9999";
        ctx.lineWidth = 1.5 * scale;
        const rightRedX = w - rightMargin;
        ctx.beginPath();
        ctx.moveTo(rightRedX, 0);
        ctx.lineTo(rightRedX, h);
        ctx.stroke();

        // Top double borders
        ctx.beginPath();
        ctx.moveTo(0, topMargin - 10 * scale);
        ctx.lineTo(w, topMargin - 10 * scale);
        ctx.stroke();
      }
    } else if (paper === "grid") {
      ctx.strokeStyle = "#e2eaf0";
      ctx.lineWidth = 1 * scale;
      const gridGap = 20 * scale;

      for (let y = 0; y < h; y += gridGap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      for (let x = 0; x < w; x += gridGap) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
    } else if (paper === "dot-grid") {
      ctx.fillStyle = "#a8b9cc";
      const dotSpacing = 20 * scale;

      for (let y = dotSpacing; y < h - dotSpacing; y += dotSpacing) {
        for (let x = dotSpacing; x < w - dotSpacing; x += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  };

  // Draw strike-out scribble mistakes
  const drawScribbleMistake = (ctx, x, y, width, height, color, scale) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();

    const midY = y - height * 0.35;
    const waveCount = Math.max(3, Math.floor(width / (10 * scale)));

    ctx.moveTo(x - 2 * scale, midY + (Math.random() - 0.5) * 2 * scale);
    for (let i = 0; i <= waveCount; i++) {
      const stepX = x + (width * i) / waveCount;
      const stepY = midY + (Math.random() - 0.5) * 4 * scale;
      ctx.lineTo(stepX, stepY);
    }

    // Second crossing-out wave slightly offset
    ctx.moveTo(x - 1 * scale, midY + 2 * scale + (Math.random() - 0.5) * 2 * scale);
    for (let i = 0; i <= waveCount; i++) {
      const stepX = x + (width * i) / waveCount;
      const stepY = midY + 2 * scale + (Math.random() - 0.5) * 4 * scale;
      ctx.lineTo(stepX, stepY);
    }

    ctx.stroke();
    ctx.restore();
  };

  // Download Page Canvas as PNG/JPG
  const downloadImage = (format) => {
    try {
      const layout = pageLayout;
      const activePage = layout.pages[activePageIndex];
      if (!activePage) return;

      const canvas = document.createElement("canvas");
      canvas.width = layout.width;
      canvas.height = layout.height;

      drawPage(canvas, activePage, options, activePageIndex, layout.pages.length);

      const dataUrl = canvas.toDataURL(format === "png" ? "image/png" : "image/jpeg", 0.95);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${documentTitle.replace(/\s+/g, "_")}_page_${activePageIndex + 1}.${format}`;
      link.click();
      showToast(`${format.toUpperCase()} Image Downloaded!`);
    } catch (err) {
      console.error(err);
      showToast("Download failed. Make sure your browser has canvas permissions.");
    }
  };

  // Download document compile in PDF
  const exportPDF = async () => {
    setExporting(true);
    showToast("Generating PDF pages...");

    try {
      const layout = pageLayout;
      const pdfDoc = await PDFDocument.create();

      // Points calculation (72 DPI standard PDF points)
      let pdfPageWidth = 595; // A4 standard
      let pdfPageHeight = 842;
      if (options.pageSize === "letter") {
        pdfPageWidth = 612;
        pdfPageHeight = 792;
      } else if (options.pageSize === "notebook") {
        pdfPageWidth = 500;
        pdfPageHeight = 650;
      }

      for (let i = 0; i < layout.pages.length; i++) {
        const pageData = layout.pages[i];

        // Create temporary canvas
        const canvas = document.createElement("canvas");
        canvas.width = layout.width;
        canvas.height = layout.height;

        // Draw page layout
        drawPage(canvas, pageData, options, i, layout.pages.length);

        const imgData = canvas.toDataURL("image/png");
        const pngImage = await pdfDoc.embedPng(imgData);

        const page = pdfDoc.addPage([pdfPageWidth, pdfPageHeight]);
        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: pdfPageWidth,
          height: pdfPageHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${documentTitle.replace(/\s+/g, "_")}.pdf`;
      link.click();

      showToast("PDF compilation complete!");
    } catch (err) {
      console.error(err);
      showToast("Failed to compile PDF. Check console logs.");
    } finally {
      setExporting(false);
    }
  };

  // Reset settings
  const handleResetSettings = () => {
    if (window.confirm("Restore handwriting and layout settings to default?")) {
      setOptions(prev => ({
        ...prev,
        fontFamily: "Caveat",
        paperType: "ruled",
        inkColor: "#1d3c87",
        customInkHex: "#1d3c87",
        isCustomInkActive: false,
        pageSize: "a4",
        quality: "high",
        marginTop: 60,
        marginBottom: 60,
        marginLeft: 70,
        marginRight: 60,
        lineSpacing: 28,
        paragraphSpacing: 22,
        fontSize: 20,
        characterSize: 1.0,
        randomCharVariation: true,
        wordSpacing: 8,
        letterSpacing: 1,
        lineAngle: 0.2,
        slant: 4,
        strokeThickness: 0.8,
        penPressureEnabled: true,
        realismEnabled: true,
        randomLetterRotation: true,
        naturalBaselineVariation: true,
        unevenInk: true,
        smallMistakes: true,
        mistakeChance: 0.015,
        naturalCharacterOffset: true,
        randomSpacing: true,
        showHeading: true,
        headingAlign: "center",
        headingSize: 26,
        showDate: true,
        showPageNumber: true,
        showSignature: true,
        showFooter: false,
        backgroundOption: "notebook",
      }));
      showToast("Settings reset successfully!");
    }
  };

  // Form Word/Char Counters
  const wordCount = useMemo(() => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  }, [text]);

  const charCount = useMemo(() => {
    return text ? text.length : 0;
  }, [text]);

  // Mount Guard
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium">Initializing BoringTools Handwriting Engine...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 animate-slide-in text-sm font-medium">
          <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Hidden preloader span block for browser webfonts trigger */}
      <div style={{ opacity: 0, position: "absolute", pointerEvents: "none", height: 0, width: 0, overflow: "hidden" }}>
        {FONTS.map(f => (
          <span key={f.id} style={{ fontFamily: f.family }}>preload font {f.label}</span>
        ))}
      </div>

      {/* Hero Banner Section */}
      <header className="bg-white border-b border-slate-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center md:text-left flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Text to Handwriting Image Converter
            </h1>
            <p className="text-slate-600 text-base sm:text-lg mt-2 max-w-2xl">
              Convert typed text into beautiful, natural handwritten pages instantly. Custom inks, papers, slants, and page layouts run directly inside your browser.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 shrink-0">
            <button
              onClick={() => {
                const el = document.getElementById("editor-panel");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition"
            >
              Start Writing
            </button>
            <button
              onClick={handleLoadSample}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-sm sm:text-base rounded-xl border border-slate-200 transition"
            >
              Load Sample
            </button>
          </div>
        </div>
      </header>

      {/* Main Panel grid */}
      <main id="editor-panel" className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-16 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Editor & Settings Config Panels */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[680px]">
            
            {/* Custom Tab Bar Selector */}
            <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto scrollbar-none">
              {[
                { id: "editor", label: "Text Editor", icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                )},
                { id: "font", label: "Font & Ink", icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                )},
                { id: "layout", label: "Page Settings", icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                )},
                { id: "realism", label: "Realism Controls", icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                )},
                { id: "header", label: "Format Elements", icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )},
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition whitespace-nowrap focus:outline-none ${
                    activeTab === t.id
                      ? "border-amber-500 text-amber-700 bg-white"
                      : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENTS */}
            <div className="p-6 flex-grow flex flex-col justify-between overflow-y-auto">
              
              {/* TAB 1: TEXT EDITOR */}
              {activeTab === "editor" && (
                <div className="flex-grow flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="w-full sm:w-72">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Document Title</label>
                      <input
                        type="text"
                        value={documentTitle}
                        onChange={(e) => setDocumentTitle(e.target.value)}
                        placeholder="Untitled Document"
                        className="w-full px-3 py-2 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={handleUndo}
                        disabled={historyIndex <= 0}
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition"
                        title="Undo (Ctrl+Z)"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={handleRedo}
                        disabled={historyIndex >= history.length - 1}
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition"
                        title="Redo (Ctrl+Y)"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.934 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 005 8v8a1 1 0 001.6.8l5.334-4z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.934 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.334-4z" />
                        </svg>
                      </button>
                      <div className="w-px h-6 bg-slate-200 mx-1"></div>
                      <button
                        onClick={handleCopyText}
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                        title="Copy Text"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      </button>
                      <button
                        onClick={handleReset}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                        title="Clear Text"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex-grow relative mt-2">
                    <textarea
                      value={text}
                      onChange={(e) => handleTextChange(e.target.value)}
                      placeholder="Start typing your text here..."
                      className="w-full h-80 min-h-[300px] p-5 text-slate-800 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all leading-relaxed font-mono text-sm resize-none"
                    />
                    {charCount > 30000 && (
                      <div className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-semibold px-2 py-1 rounded-md">
                        Large Document Warning (Slower rendering)
                      </div>
                    )}
                  </div>

                  {/* Document Counters Bar */}
                  <div className="flex flex-wrap justify-between items-center bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-medium text-slate-500 gap-4">
                    <div className="flex gap-4">
                      <span>Words: <strong className="text-slate-800 font-bold">{wordCount.toLocaleString()}</strong></span>
                      <span>Characters: <strong className="text-slate-800 font-bold">{charCount.toLocaleString()}</strong></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Estimated Pages: <strong className="text-slate-800 font-bold">{pageLayout.pages.length}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FONT & INK */}
              {activeTab === "font" && (
                <div className="space-y-6">
                  {/* Handwriting Font Grid */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Handwriting Style</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {FONTS.map((font) => (
                        <button
                          key={font.id}
                          onClick={() => {
                            setOptions(prev => ({ ...prev, fontFamily: font.family }));
                            triggerReRender();
                          }}
                          className={`flex flex-col text-left p-3 rounded-xl border transition ${
                            options.fontFamily === font.family
                              ? "border-amber-500 bg-amber-50/20 text-amber-900 ring-2 ring-amber-500/20"
                              : "border-slate-200 hover:border-slate-400 bg-white text-slate-700"
                          }`}
                        >
                          <span className="text-xs text-slate-400 font-medium">{font.label}</span>
                          <span className="text-lg mt-0.5 truncate" style={{ fontFamily: font.family }}>
                            Aa Bb Cc
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ink Color Picker */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Ink Color</label>
                    <div className="flex flex-wrap items-center gap-3">
                      {INK_COLORS.map((ink) => (
                        <button
                          key={ink.id}
                          onClick={() => {
                            setOptions(prev => ({ ...prev, inkColor: ink.hex, isCustomInkActive: false }));
                            triggerReRender();
                          }}
                          className={`w-10 h-10 rounded-full border-2 relative transition transform hover:scale-105 active:scale-95 ${
                            !options.isCustomInkActive && options.inkColor === ink.hex
                              ? "border-amber-500 scale-105 shadow-md"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: ink.hex }}
                          title={ink.label}
                        >
                          {!options.isCustomInkActive && options.inkColor === ink.hex && (
                            <span className="absolute inset-0 flex items-center justify-center text-white">
                              <svg className="w-5 h-5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          )}
                        </button>
                      ))}
                      
                      {/* Custom Color Input Wrapper */}
                      <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                        <button
                          onClick={() => {
                            setOptions(prev => ({ ...prev, isCustomInkActive: true }));
                            triggerReRender();
                          }}
                          className={`w-10 h-10 rounded-full border-2 relative overflow-hidden transition transform hover:scale-105 active:scale-95 ${
                            options.isCustomInkActive
                              ? "border-amber-500 scale-105 shadow-md"
                              : "border-slate-300"
                          }`}
                          title="Custom Ink Color"
                        >
                          <input
                            type="color"
                            value={options.customInkHex}
                            onChange={(e) => {
                              setOptions(prev => ({
                                ...prev,
                                customInkHex: e.target.value,
                                isCustomInkActive: true
                              }));
                              triggerReRender();
                            }}
                            className="absolute -inset-2 w-14 h-14 cursor-pointer"
                          />
                          {options.isCustomInkActive && (
                            <span className="absolute inset-0 flex items-center justify-center text-white pointer-events-none">
                              <svg className="w-5 h-5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          )}
                        </button>
                        <span className="text-xs font-semibold text-slate-500">Custom Color</span>
                      </div>
                    </div>
                  </div>

                  {/* Handwriting style details: slant, spacing, stroke size */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-bold text-slate-600">Stroke Thickness (Pen Weight)</label>
                        <span className="text-xs font-semibold text-slate-500">{options.strokeThickness} px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2.5"
                        step="0.1"
                        value={options.strokeThickness}
                        onChange={(e) => {
                          setOptions(prev => ({ ...prev, strokeThickness: parseFloat(e.target.value) }));
                        }}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-bold text-slate-600">Letter Slant (Tilt)</label>
                        <span className="text-xs font-semibold text-slate-500">{options.slant}°</span>
                      </div>
                      <input
                        type="range"
                        min="-20"
                        max="20"
                        step="1"
                        value={options.slant}
                        onChange={(e) => {
                          setOptions(prev => ({ ...prev, slant: parseInt(e.target.value) }));
                        }}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-bold text-slate-600">Line Angle (Straightness)</label>
                        <span className="text-xs font-semibold text-slate-500">{options.lineAngle}°</span>
                      </div>
                      <input
                        type="range"
                        min="-3"
                        max="3"
                        step="0.1"
                        value={options.lineAngle}
                        onChange={(e) => {
                          setOptions(prev => ({ ...prev, lineAngle: parseFloat(e.target.value) }));
                        }}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-bold text-slate-600">Letter Spacing</label>
                        <span className="text-xs font-semibold text-slate-500">{options.letterSpacing} px</span>
                      </div>
                      <input
                        type="range"
                        min="-3"
                        max="12"
                        step="0.5"
                        value={options.letterSpacing}
                        onChange={(e) => {
                          setOptions(prev => ({ ...prev, letterSpacing: parseFloat(e.target.value) }));
                        }}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PAGE LAYOUT */}
              {activeTab === "layout" && (
                <div className="space-y-6">
                  {/* Size & Quality selectors */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Page Size</label>
                      <ThemedDropdown
                        options={PAGE_SIZES}
                        value={options.pageSize}
                        onChange={(val) => {
                          setOptions(prev => ({ ...prev, pageSize: val }));
                          triggerReRender();
                        }}
                        ariaLabel="Select Page Size"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Image Quality</label>
                      <ThemedDropdown
                        options={QUALITY_LEVELS}
                        value={options.quality}
                        onChange={(val) => {
                          setOptions(prev => ({ ...prev, quality: val }));
                          triggerReRender();
                        }}
                        ariaLabel="Select Export Quality"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Paper Style Layout</label>
                      <ThemedDropdown
                        options={PAPER_TYPES.map(p => ({ value: p.id, label: p.label }))}
                        value={options.paperType}
                        onChange={(val) => {
                          setOptions(prev => ({ ...prev, paperType: val }));
                          triggerReRender();
                        }}
                        ariaLabel="Select Paper Layout"
                      />
                    </div>
                  </div>

                  {/* Margins Panel */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Page Margins (px)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Top Margin</label>
                        <input
                          type="number"
                          value={options.marginTop}
                          onChange={(e) => setOptions(prev => ({ ...prev, marginTop: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Bottom Margin</label>
                        <input
                          type="number"
                          value={options.marginBottom}
                          onChange={(e) => setOptions(prev => ({ ...prev, marginBottom: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Left Margin</label>
                        <input
                          type="number"
                          value={options.marginLeft}
                          onChange={(e) => setOptions(prev => ({ ...prev, marginLeft: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Right Margin</label>
                        <input
                          type="number"
                          value={options.marginRight}
                          onChange={(e) => setOptions(prev => ({ ...prev, marginRight: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Font Sizes & Spacings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-600">Text Font Size</label>
                        <span className="text-xs font-semibold text-slate-500">{options.fontSize} px</span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="40"
                        step="1"
                        value={options.fontSize}
                        onChange={(e) => {
                          setOptions(prev => ({ ...prev, fontSize: parseInt(e.target.value) }));
                        }}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-600">Line Spacing</label>
                        <span className="text-xs font-semibold text-slate-500">{options.lineSpacing} px</span>
                      </div>
                      <input
                        type="range"
                        min="16"
                        max="70"
                        step="1"
                        value={options.lineSpacing}
                        onChange={(e) => {
                          setOptions(prev => ({ ...prev, lineSpacing: parseInt(e.target.value) }));
                        }}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-600">Paragraph Spacing</label>
                        <span className="text-xs font-semibold text-slate-500">{options.paragraphSpacing} px</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="80"
                        step="1"
                        value={options.paragraphSpacing}
                        onChange={(e) => {
                          setOptions(prev => ({ ...prev, paragraphSpacing: parseInt(e.target.value) }));
                        }}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                  </div>

                  {/* Paper Backgrounds Visual Selector */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Paper Background Option</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {PAPER_TYPES.map((paper) => (
                        <button
                          key={paper.id}
                          onClick={() => {
                            setOptions(prev => ({ ...prev, paperType: paper.id }));
                            triggerReRender();
                          }}
                          className={`h-16 flex flex-col items-center justify-center rounded-xl border relative transition ${
                            options.paperType === paper.id
                              ? "border-amber-500 ring-2 ring-amber-500/20 font-bold"
                              : "border-slate-200 hover:border-slate-300"
                          } overflow-hidden`}
                        >
                          <div className={`absolute inset-0 opacity-40 ${paper.class}`}></div>
                          <span className="text-[11px] text-slate-700 relative z-10 font-semibold px-2 text-center leading-none">
                            {paper.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: REALISM CONTROLS */}
              {activeTab === "realism" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Master Realism Controls</h4>
                      <p className="text-xs text-slate-500">Inject subtle imperfections to make text look truly hand-written</p>
                    </div>
                    <button
                      onClick={() => setOptions(prev => ({ ...prev, realismEnabled: !prev.realismEnabled }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        options.realismEnabled ? "bg-amber-500" : "bg-slate-300"
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        options.realismEnabled ? "translate-x-6" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  {options.realismEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {[
                        { id: "randomLetterRotation", title: "Random Character Rotation", desc: "Slightly rotates characters individually" },
                        { id: "naturalBaselineVariation", title: "Baseline Wander", desc: "Characters fluctuate off the line height" },
                        { id: "unevenInk", title: "Pressure / Ink Variations", desc: "Varies ink darkness across writing" },
                        { id: "naturalCharacterOffset", title: "Organic Letter Spacing", desc: "Irregular character offset coordinates" },
                        { id: "randomSpacing", title: "Random Word Spacing", desc: "Adds offset gaps in spaces" },
                        { id: "smallMistakes", title: "Scribble Mistakes", desc: "Randomly crosses out words and rewrites them" },
                      ].map((ctl) => (
                        <div
                          key={ctl.id}
                          className="flex items-start justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/50 hover:bg-slate-50/80 transition"
                        >
                          <div className="pr-4">
                            <label className="block text-xs font-bold text-slate-700">{ctl.title}</label>
                            <span className="text-[11px] text-slate-500 leading-none">{ctl.desc}</span>
                          </div>
                          <button
                            onClick={() => {
                              setOptions(prev => ({ ...prev, [ctl.id]: !prev[ctl.id] }));
                              triggerReRender();
                            }}
                            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                              options[ctl.id] ? "bg-amber-500" : "bg-slate-300"
                            }`}
                          >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              options[ctl.id] ? "translate-x-4.5" : "translate-x-1"
                            }`} />
                          </button>
                        </div>
                      ))}

                    </div>
                  )}

                  {options.realismEnabled && options.smallMistakes && (
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-bold text-slate-600">Mistake Probability Intensity</label>
                        <span className="text-xs font-semibold text-slate-500">{Math.round(options.mistakeChance * 1000) / 10}% chance/word</span>
                      </div>
                      <input
                        type="range"
                        min="0.005"
                        max="0.06"
                        step="0.005"
                        value={options.mistakeChance}
                        onChange={(e) => {
                          setOptions(prev => ({ ...prev, mistakeChance: parseFloat(e.target.value) }));
                          triggerReRender();
                        }}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: FORMAT ELEMENTS */}
              {activeTab === "header" && (
                <div className="space-y-6">
                  {/* Page Title Heading Option */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Page Heading Header (Page 1)</label>
                      <button
                        onClick={() => {
                          setOptions(prev => ({ ...prev, showHeading: !prev.showHeading }));
                          triggerReRender();
                        }}
                        className={`text-xs font-semibold ${options.showHeading ? "text-amber-600" : "text-slate-400"}`}
                      >
                        {options.showHeading ? "Enabled" : "Disabled"}
                      </button>
                    </div>
                    {options.showHeading && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={options.headingText}
                          onChange={(e) => {
                            setOptions(prev => ({ ...prev, headingText: e.target.value }));
                            triggerReRender();
                          }}
                          className="sm:col-span-2 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="Heading text"
                        />
                        <select
                          value={options.headingAlign}
                          onChange={(e) => {
                            setOptions(prev => ({ ...prev, headingAlign: e.target.value }));
                            triggerReRender();
                          }}
                          className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none"
                        >
                          <option value="left">Left Align</option>
                          <option value="center">Center Align</option>
                          <option value="right">Right Align</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Date & Page Number Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Date Stamp (Top Right)</label>
                        <button
                          onClick={() => setOptions(prev => ({ ...prev, showDate: !prev.showDate }))}
                          className={`text-xs font-semibold ${options.showDate ? "text-amber-600" : "text-slate-400"}`}
                        >
                          {options.showDate ? "Enabled" : "Disabled"}
                        </button>
                      </div>
                      {options.showDate && (
                        <input
                          type="text"
                          value={options.dateText}
                          onChange={(e) => setOptions(prev => ({ ...prev, dateText: e.target.value }))}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none"
                          placeholder="Date String"
                        />
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Page Numbering (Footer)</label>
                        <button
                          onClick={() => setOptions(prev => ({ ...prev, showPageNumber: !prev.showPageNumber }))}
                          className={`text-xs font-semibold ${options.showPageNumber ? "text-amber-600" : "text-slate-400"}`}
                        >
                          {options.showPageNumber ? "Enabled" : "Disabled"}
                        </button>
                      </div>
                      {options.showPageNumber && (
                        <input
                          type="text"
                          value={options.pageNumberFormat}
                          onChange={(e) => setOptions(prev => ({ ...prev, pageNumberFormat: e.target.value }))}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none"
                          placeholder="Format e.g. Page {page} of {total}"
                        />
                      )}
                    </div>
                  </div>

                  {/* Signature Area */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cursive Signature (Last Page)</label>
                      <button
                        onClick={() => {
                          setOptions(prev => ({ ...prev, showSignature: !prev.showSignature }));
                          triggerReRender();
                        }}
                        className={`text-xs font-semibold ${options.showSignature ? "text-amber-600" : "text-slate-400"}`}
                      >
                        {options.showSignature ? "Enabled" : "Disabled"}
                      </button>
                    </div>
                    {options.showSignature && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={options.signatureText}
                          onChange={(e) => {
                            setOptions(prev => ({ ...prev, signatureText: e.target.value }));
                            triggerReRender();
                          }}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none"
                          placeholder="Sign name"
                        />
                        <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg px-3">
                          <span className="text-xs text-slate-500">Sign Size: {options.signatureSize}px</span>
                          <input
                            type="range"
                            min="24"
                            max="48"
                            value={options.signatureSize}
                            onChange={(e) => {
                              setOptions(prev => ({ ...prev, signatureSize: parseInt(e.target.value) }));
                              triggerReRender();
                            }}
                            className="w-24 accent-amber-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* QUICK ACTIONS BAR */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-4">
              <button
                onClick={handleResetSettings}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
              >
                Reset Settings
              </button>

              <div className="flex flex-wrap gap-2.5">
                {/* Background Image Upload */}
                <label className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>Upload BG</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBgUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

          </div>
        </section>

        {/* Right Side: Interactive Page Live Preview */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4 sticky top-20">
            
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Live Preview
              </h3>

              <div className="flex items-center gap-3">
                {/* Zoom sliders */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewZoom(Math.max(20, previewZoom - 10))}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                    title="Zoom Out"
                  >
                    －
                  </button>
                  <span className="text-xs font-semibold text-slate-500 w-9 text-center">{previewZoom}%</span>
                  <button
                    onClick={() => setPreviewZoom(Math.min(150, previewZoom + 10))}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                    title="Zoom In"
                  >
                    ＋
                  </button>
                </div>
              </div>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="flex-grow bg-slate-100/70 border border-slate-200/60 rounded-xl p-6 flex overflow-auto min-h-[420px] max-h-[560px] relative">
              {rendering && (
                <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-2xs flex items-center justify-center">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md border border-slate-100">
                    <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-slate-600">Drawing...</span>
                  </div>
                </div>
              )}

              {/* Output Page Preview canvas */}
              <canvas
                ref={previewCanvasRef}
                width={pageLayout.width}
                height={pageLayout.height}
                className="shadow-xl rounded-md bg-white border border-slate-200/50 transition-all duration-150 m-auto"
                style={{
                  width: `${(pageLayout.width / pageLayout.scale) * (previewZoom / 100)}px`,
                  height: `${(pageLayout.height / pageLayout.scale) * (previewZoom / 100)}px`,
                }}
              />
            </div>

            {/* PAGE CONTROL FOOTER */}
            <div className="flex justify-between items-center bg-slate-50 rounded-xl p-3 border border-slate-100">
              <button
                onClick={() => setActivePageIndex(prev => Math.max(0, prev - 1))}
                disabled={activePageIndex === 0}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white transition flex items-center gap-1"
              >
                ◀ Prev
              </button>
              
              <span className="text-xs font-bold text-slate-600">
                Page {activePageIndex + 1} of {pageLayout.pages.length}
              </span>

              <button
                onClick={() => setActivePageIndex(prev => Math.min(pageLayout.pages.length - 1, prev + 1))}
                disabled={activePageIndex === pageLayout.pages.length - 1}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white transition flex items-center gap-1"
              >
                Next ▶
              </button>
            </div>

            {/* Thumbnail Navigator bar */}
            {pageLayout.pages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1.5 pt-1 border-t border-slate-100">
                {pageLayout.pages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePageIndex(idx)}
                    className={`px-3 py-2 text-xs font-bold shrink-0 rounded-lg border transition ${
                      activePageIndex === idx
                        ? "border-amber-500 bg-amber-500 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    Page {idx + 1}
                  </button>
                ))}
              </div>
            )}

            {/* EXPORT OPTIONS CARDS */}
            <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Download Handwritten Output</label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => downloadImage("png")}
                  className="px-4 py-3 bg-white hover:bg-amber-500 hover:text-white text-slate-700 font-bold text-xs border border-slate-200 hover:border-amber-500 rounded-xl shadow-xs transition transform hover:-translate-y-0.5 active:translate-y-0 flex flex-col items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Download PNG</span>
                </button>

                <button
                  onClick={() => downloadImage("jpg")}
                  className="px-4 py-3 bg-white hover:bg-amber-500 hover:text-white text-slate-700 font-bold text-xs border border-slate-200 hover:border-amber-500 rounded-xl shadow-xs transition transform hover:-translate-y-0.5 active:translate-y-0 flex flex-col items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Download JPG</span>
                </button>

                <button
                  onClick={exportPDF}
                  disabled={exporting}
                  className="px-4 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 active:translate-y-0 flex flex-col items-center justify-center gap-1 disabled:opacity-60 disabled:hover:-translate-y-0"
                >
                  {exporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"></div>
                      <span>Compiling...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}
