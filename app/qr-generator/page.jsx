"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import QRCode from "qrcode";
import ThemedDropdown from "../components/ThemedDropdown";
import {
  KoboyoDownload,
  KoboyoShield,
  KoboyoSparkles,
  KoboyoCopy,
  KoboyoCurrency,
  KoboyoCode,
  ThemePaletteIcon,
  LightningIcon,
  CheckIcon,
} from "../components/KoboyoIcons";

// Curated brand color swatches
const COLOR_PRESETS = [
  { name: "Onyx Slate", fg: "#0f172a", bg: "#ffffff" },
  { name: "Boring Amber", fg: "#b45309", bg: "#fffbeb" },
  { name: "Deep Navy", fg: "#1e3a8a", bg: "#eff6ff" },
  { name: "Emerald Forest", fg: "#047857", bg: "#ecfdf5" },
  { name: "Imperial Purple", fg: "#581c87", bg: "#faf5ff" },
  { name: "Crimson Bold", fg: "#991b1b", bg: "#fef2f2" },
  { name: "Midnight Dark", fg: "#f8fafc", bg: "#090d16" },
];

const LOGO_PRESETS = [
  { id: "none", label: "None" },
  { id: "link", label: "Link", svg: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#0f172a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#0f172a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' },
  { id: "wifi", label: "Wi-Fi", svg: '<path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" stroke="#0f172a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' },
  { id: "mail", label: "Mail", svg: '<rect width="20" height="16" x="2" y="4" rx="2" stroke="#0f172a" stroke-width="2" fill="none"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke="#0f172a" stroke-width="2" stroke-linecap="round" fill="none"/>' },
  { id: "user", label: "Contact", svg: '<circle cx="12" cy="7" r="4" stroke="#0f172a" stroke-width="2" fill="none"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="#0f172a" stroke-width="2" stroke-linecap="round" fill="none"/>' },
  { id: "whatsapp", label: "WhatsApp", svg: '<path fill="#25D366" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.12 7.07C8.95 7.07 8.68 7.14 8.44 7.4C8.2 7.66 7.53 8.29 7.53 9.57C7.53 10.85 8.46 12.08 8.6 12.25C8.73 12.43 10.43 15.03 13.04 16.16C13.66 16.43 14.15 16.59 14.53 16.71C15.15 16.91 15.72 16.88 16.16 16.82C16.66 16.74 17.7 16.19 17.92 15.57C18.14 14.95 18.14 14.42 18.07 14.31C18 14.2 17.83 14.13 17.57 14C17.31 13.87 16.03 13.24 15.8 13.15C15.56 13.06 15.39 13.02 15.22 13.28C15.05 13.54 14.56 14.13 14.41 14.3C14.26 14.48 14.12 14.5 13.86 14.37C13.6 14.24 12.76 13.97 11.76 13.08C10.99 12.39 10.46 11.53 10.31 11.28C10.16 11.02 10.29 10.88 10.42 10.75C10.54 10.63 10.69 10.44 10.82 10.29C10.95 10.14 11 10.03 11.09 9.85C11.17 9.68 11.13 9.53 11.07 9.4C11.01 9.27 10.51 8.04 10.3 7.54C10.1 7.05 9.89 7.12 9.73 7.11C9.58 7.1 9.38 7.07 9.12 7.07Z"/>' },
  { id: "star", label: "Star", svg: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="#0f172a" stroke-width="2" fill="#f59e0b"/>' },
];

function calculateLuminance(hex) {
  const c = hex.replace("#", "");
  if (c.length !== 6) return 0.5;
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const a = [r, g, b].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function getContrastRatio(fgHex, bgHex) {
  const l1 = calculateLuminance(fgHex);
  const l2 = calculateLuminance(bgHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export default function QRGenerator() {
  // Input modes
  const [activeTab, setActiveTab] = useState("url");

  // Input states
  const [urlInput, setUrlInput] = useState("https://boringtoolsai.com");
  const [textInput, setTextInput] = useState("Hello from BoringTools! Fast, private, and zero server tracking.");
  const [wifiData, setWifiData] = useState({
    ssid: "BoringWiFi",
    password: "",
    encryption: "WPA",
    hidden: false,
  });
  const [vcardData, setVcardData] = useState({
    firstName: "Alex",
    lastName: "Morgan",
    phone: "+1 555-0199",
    email: "alex@example.com",
    company: "BoringTools Studio",
    title: "Software Architect",
    website: "https://boringtoolsai.com",
  });
  const [emailData, setEmailData] = useState({
    to: "hello@boringtoolsai.com",
    subject: "Inquiry via QR Code",
    body: "Hi BoringTools team,\n\nI scanned your QR code and wanted to connect!",
  });
  const [whatsappData, setWhatsappData] = useState({
    phone: "+15550199",
    message: "Hi! I scanned your QR code.",
  });
  const [upiData, setUpiData] = useState({
    vpa: "merchant@upi",
    name: "BoringTools Merchant",
    amount: "100",
    note: "Payment for services",
  });

  // Appearance & Styling
  const [fgColor, setFgColor] = useState("#0f172a");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [isTransparentBg, setIsTransparentBg] = useState(false);
  const [dotStyle, setDotStyle] = useState("rounded"); // 'square' | 'rounded' | 'dots'
  const [eyeStyle, setEyeStyle] = useState("rounded"); // 'square' | 'rounded' | 'circle'
  const [ecc, setEcc] = useState("Q"); // 'L' | 'M' | 'Q' | 'H'
  const [margin, setMargin] = useState(2); // 0, 1, 2, 4
  const [logoPreset, setLogoPreset] = useState("none");
  const [customLogoUrl, setCustomLogoUrl] = useState(null);
  const [exportScale, setExportScale] = useState(2); // 1 = 512px, 2 = 1024px, 4 = 2048px

  // UI state
  const [toastMessage, setToastMessage] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const [history, setHistory] = useState([]);

  // Canvas ref
  const canvasRef = useRef(null);

  // Derive raw payload string based on active tab
  const rawPayload = useMemo(() => {
    switch (activeTab) {
      case "url": {
        let val = urlInput.trim();
        if (!val) return "";
        if (!/^https?:\/\//i.test(val) && !val.startsWith("mailto:") && !val.startsWith("tel:")) {
          val = "https://" + val;
        }
        return val;
      }
      case "wifi": {
        if (!wifiData.ssid.trim()) return "";
        const enc = wifiData.encryption === "none" ? "nopass" : wifiData.encryption;
        const pass = wifiData.encryption === "none" ? "" : wifiData.password;
        const hidden = wifiData.hidden ? "H:true;" : "";
        return `WIFI:T:${enc};S:${wifiData.ssid};P:${pass};${hidden};`;
      }
      case "vcard": {
        if (!vcardData.firstName.trim() && !vcardData.lastName.trim() && !vcardData.phone.trim()) {
          return "";
        }
        const lines = [
          "BEGIN:VCARD",
          "VERSION:3.0",
          `N:${vcardData.lastName};${vcardData.firstName};;;`,
          `FN:${vcardData.firstName} ${vcardData.lastName}`.trim(),
        ];
        if (vcardData.company) lines.push(`ORG:${vcardData.company}`);
        if (vcardData.title) lines.push(`TITLE:${vcardData.title}`);
        if (vcardData.phone) lines.push(`TEL;TYPE=CELL:${vcardData.phone}`);
        if (vcardData.email) lines.push(`EMAIL:${vcardData.email}`);
        if (vcardData.website) lines.push(`URL:${vcardData.website}`);
        lines.push("END:VCARD");
        return lines.join("\n");
      }
      case "email": {
        if (!emailData.to.trim()) return "";
        const params = new URLSearchParams();
        if (emailData.subject) params.append("subject", emailData.subject);
        if (emailData.body) params.append("body", emailData.body);
        const q = params.toString();
        return `mailto:${emailData.to}${q ? `?${q}` : ""}`;
      }
      case "whatsapp": {
        const cleanPhone = whatsappData.phone.replace(/[^0-9]/g, "");
        if (!cleanPhone) return "";
        const text = encodeURIComponent(whatsappData.message || "");
        return `https://wa.me/${cleanPhone}${text ? `?text=${text}` : ""}`;
      }
      case "upi": {
        if (!upiData.vpa.trim()) return "";
        const params = new URLSearchParams();
        params.append("pa", upiData.vpa.trim());
        if (upiData.name) params.append("pn", upiData.name.trim());
        if (upiData.amount) params.append("am", upiData.amount.trim());
        params.append("cu", "INR");
        if (upiData.note) params.append("tn", upiData.note.trim());
        return `upi://pay?${params.toString()}`;
      }
      case "text":
      default:
        return textInput.trim();
    }
  }, [activeTab, urlInput, textInput, wifiData, vcardData, emailData, whatsappData, upiData]);

  // Calculated Contrast Ratio
  const contrastRatio = useMemo(() => {
    if (isTransparentBg) return 10;
    return getContrastRatio(fgColor, bgColor);
  }, [fgColor, bgColor, isTransparentBg]);

  const scannability = useMemo(() => {
    if (contrastRatio >= 4.5) return { status: "Optimal", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    if (contrastRatio >= 2.8) return { status: "Moderate", color: "text-amber-600 bg-amber-50 border-amber-200" };
    return { status: "Low Contrast Warning", color: "text-rose-600 bg-rose-50 border-rose-200" };
  }, [contrastRatio]);

  // Auto-elevate error correction when logo is present to safeguard readability
  const effectiveEcc = useMemo(() => {
    if (customLogoUrl || logoPreset !== "none") {
      return "H";
    }
    return ecc;
  }, [customLogoUrl, logoPreset, ecc]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("boring_qr_history");
      if (saved) {
        setHistory(JSON.parse(saved).slice(0, 5));
      }
    } catch {
      // Ignore localStorage issues
    }
  }, []);

  // Save successful generated QR to history
  const saveToHistory = useCallback((text, tab) => {
    if (!text || text.length < 3) return;
    try {
      setHistory((prev) => {
        const filtered = prev.filter((item) => item.text !== text);
        const updated = [{ text, tab, timestamp: Date.now() }, ...filtered].slice(0, 5);
        localStorage.setItem("boring_qr_history", JSON.stringify(updated));
        return updated;
      });
    } catch {
      // Ignore
    }
  }, []);

  // Trigger brief toast notification
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2800);
  };

  // Render QR on canvas
  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!rawPayload) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    setIsGenerating(true);

    try {
      // Generate QR matrix using QRCode.create
      const qr = QRCode.create(rawPayload, {
        errorCorrectionLevel: effectiveEcc,
      });

      const moduleCount = qr.modules.size;
      const size = 512;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      // Background
      ctx.clearRect(0, 0, size, size);
      if (!isTransparentBg) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);
      }

      const quietZone = margin;
      const totalModules = moduleCount + quietZone * 2;
      const cellSize = size / totalModules;
      const offset = quietZone * cellSize;

      ctx.fillStyle = fgColor;

      // Helper to check if a module is part of the 3 corner position detection patterns (eyes)
      const isFinderPattern = (r, c) => {
        if (r < 7 && c < 7) return true; // Top-Left
        if (r < 7 && c >= moduleCount - 7) return true; // Top-Right
        if (r >= moduleCount - 7 && c < 7) return true; // Bottom-Left
        return false;
      };

      // Helper to check if module is inside center logo safe exclusion zone
      const hasLogo = customLogoUrl || logoPreset !== "none";
      const logoZoneStart = Math.floor(moduleCount * 0.38);
      const logoZoneEnd = Math.ceil(moduleCount * 0.62);
      const isLogoZone = (r, c) => {
        if (!hasLogo) return false;
        return r >= logoZoneStart && r <= logoZoneEnd && c >= logoZoneStart && c <= logoZoneEnd;
      };

      // Draw modules
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (isFinderPattern(r, c)) continue; // Handled separately for styled eyes
          if (isLogoZone(r, c)) continue; // Keep clear for logo

          if (qr.modules.get(r, c)) {
            const x = offset + c * cellSize;
            const y = offset + r * cellSize;

            if (dotStyle === "dots") {
              const radius = cellSize * 0.44;
              ctx.beginPath();
              ctx.arc(x + cellSize / 2, y + cellSize / 2, radius, 0, Math.PI * 2);
              ctx.fill();
            } else if (dotStyle === "rounded") {
              const radius = cellSize * 0.28;
              const pad = cellSize * 0.05;
              const w = cellSize - pad * 2;
              const h = cellSize - pad * 2;
              ctx.beginPath();
              ctx.roundRect(x + pad, y + pad, w, h, radius);
              ctx.fill();
            } else {
              // Standard sharp square
              ctx.fillRect(x, y, cellSize + 0.3, cellSize + 0.3);
            }
          }
        }
      }

      // Draw Styled Position Detection Patterns (The 3 Corner Finder Eyes)
      const drawEye = (originR, originC) => {
        const eyeX = offset + originC * cellSize;
        const eyeY = offset + originR * cellSize;
        const eyeSize = 7 * cellSize;

        // Outer 7x7 box
        ctx.fillStyle = fgColor;
        if (eyeStyle === "circle") {
          ctx.beginPath();
          ctx.arc(eyeX + eyeSize / 2, eyeY + eyeSize / 2, eyeSize / 2, 0, Math.PI * 2);
          ctx.fill();

          // Outer cutout 5x5
          ctx.fillStyle = isTransparentBg ? "#ffffff" : bgColor;
          ctx.beginPath();
          ctx.arc(eyeX + eyeSize / 2, eyeY + eyeSize / 2, (5 * cellSize) / 2, 0, Math.PI * 2);
          ctx.fill();

          // Center core 3x3
          ctx.fillStyle = fgColor;
          ctx.beginPath();
          ctx.arc(eyeX + eyeSize / 2, eyeY + eyeSize / 2, (3 * cellSize) / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (eyeStyle === "rounded") {
          const outerRadius = cellSize * 1.8;
          ctx.beginPath();
          ctx.roundRect(eyeX, eyeY, eyeSize, eyeSize, outerRadius);
          ctx.fill();

          // Cutout 5x5
          ctx.fillStyle = isTransparentBg ? "#ffffff" : bgColor;
          const innerX = eyeX + cellSize;
          const innerY = eyeY + cellSize;
          const innerSize = 5 * cellSize;
          ctx.beginPath();
          ctx.roundRect(innerX, innerY, innerSize, innerSize, outerRadius * 0.65);
          ctx.fill();

          // Inner Core 3x3
          ctx.fillStyle = fgColor;
          const coreX = eyeX + 2 * cellSize;
          const coreY = eyeY + 2 * cellSize;
          const coreSize = 3 * cellSize;
          ctx.beginPath();
          ctx.roundRect(coreX, coreY, coreSize, coreSize, outerRadius * 0.4);
          ctx.fill();
        } else {
          // Classic square
          ctx.fillRect(eyeX, eyeY, eyeSize, eyeSize);
          ctx.fillStyle = isTransparentBg ? "#ffffff" : bgColor;
          ctx.fillRect(eyeX + cellSize, eyeY + cellSize, 5 * cellSize, 5 * cellSize);
          ctx.fillStyle = fgColor;
          ctx.fillRect(eyeX + 2 * cellSize, eyeY + 2 * cellSize, 3 * cellSize, 3 * cellSize);
        }
      };

      drawEye(0, 0); // Top-Left
      drawEye(0, moduleCount - 7); // Top-Right
      drawEye(moduleCount - 7, 0); // Bottom-Left

      // Draw Center Logo or Icon if present
      if (hasLogo) {
        const center = size / 2;
        const logoBoxSize = size * 0.22;
        const halfBox = logoBoxSize / 2;

        // Draw protective white badge background behind logo
        ctx.save();
        ctx.fillStyle = isTransparentBg ? "#ffffff" : bgColor;
        ctx.shadowColor = "rgba(0,0,0,0.14)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        ctx.beginPath();
        ctx.roundRect(center - halfBox, center - halfBox, logoBoxSize, logoBoxSize, logoBoxSize * 0.25);
        ctx.fill();
        ctx.restore();

        // Outline border for clean definition
        ctx.strokeStyle = fgColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(center - halfBox, center - halfBox, logoBoxSize, logoBoxSize, logoBoxSize * 0.25);
        ctx.stroke();

        if (customLogoUrl) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = customLogoUrl;
          await new Promise((resolve) => {
            img.onload = () => {
              const pad = logoBoxSize * 0.16;
              ctx.drawImage(img, center - halfBox + pad, center - halfBox + pad, logoBoxSize - pad * 2, logoBoxSize - pad * 2);
              resolve();
            };
            img.onerror = () => resolve();
          });
        } else if (logoPreset !== "none") {
          const found = LOGO_PRESETS.find((p) => p.id === logoPreset);
          if (found && found.svg) {
            const svgXml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64">${found.svg}</svg>`;
            const svgBlob = new Blob([svgXml], { type: "image/svg+xml;charset=utf-8" });
            const blobUrl = URL.createObjectURL(svgBlob);
            const img = new Image();
            img.src = blobUrl;
            await new Promise((resolve) => {
              img.onload = () => {
                const pad = logoBoxSize * 0.2;
                ctx.drawImage(img, center - halfBox + pad, center - halfBox + pad, logoBoxSize - pad * 2, logoBoxSize - pad * 2);
                URL.revokeObjectURL(blobUrl);
                resolve();
              };
              img.onerror = () => {
                URL.revokeObjectURL(blobUrl);
                resolve();
              };
            });
          }
        }
      }

      saveToHistory(rawPayload, activeTab);
    } catch (err) {
      console.error("QR render error:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [
    rawPayload,
    fgColor,
    bgColor,
    isTransparentBg,
    dotStyle,
    eyeStyle,
    effectiveEcc,
    margin,
    logoPreset,
    customLogoUrl,
    activeTab,
    saveToHistory,
  ]);

  // Debounced auto-render on input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      renderCanvas();
    }, 120);
    return () => clearTimeout(timer);
  }, [renderCanvas]);

  // Handle custom logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      showToast("Logo file too large (max 3MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomLogoUrl(event.target.result);
      setLogoPreset("none");
      showToast("Custom logo added! (Auto-switched to High Error Correction)");
    };
    reader.readAsDataURL(file);
  };

  // Download PNG at specified resolution scale
  const downloadPNG = (scale = exportScale) => {
    const canvas = canvasRef.current;
    if (!canvas || !rawPayload) return;

    // Create export canvas at requested resolution
    const exportSize = 512 * scale;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = exportSize;
    exportCanvas.height = exportSize;
    const ctx = exportCanvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(canvas, 0, 0, exportSize, exportSize);

    const dataUrl = exportCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `boring-qr-${activeTab}-${exportSize}px.png`;
    link.href = dataUrl;
    link.click();
    showToast(`Downloaded PNG (${exportSize}×${exportSize}px)`);
  };

  // Download crisp Vector SVG with exact custom module & eye styling
  const downloadSVG = async () => {
    if (!rawPayload) return;
    try {
      const qr = QRCode.create(rawPayload, {
        errorCorrectionLevel: effectiveEcc,
      });

      const moduleCount = qr.modules.size;
      const quietZone = margin;
      const totalModules = moduleCount + quietZone * 2;
      const svgSize = 512;
      const cellSize = svgSize / totalModules;
      const offset = quietZone * cellSize;

      const isFinderPattern = (r, c) => {
        if (r < 7 && c < 7) return true;
        if (r < 7 && c >= moduleCount - 7) return true;
        if (r >= moduleCount - 7 && c < 7) return true;
        return false;
      };

      const hasLogo = customLogoUrl || logoPreset !== "none";
      const logoZoneStart = Math.floor(moduleCount * 0.38);
      const logoZoneEnd = Math.ceil(moduleCount * 0.62);
      const isLogoZone = (r, c) => {
        if (!hasLogo) return false;
        return r >= logoZoneStart && r <= logoZoneEnd && c >= logoZoneStart && c <= logoZoneEnd;
      };

      const svgElements = [];

      // Background
      if (!isTransparentBg) {
        svgElements.push(`<rect width="${svgSize}" height="${svgSize}" fill="${bgColor}" />`);
      }

      // Modules
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (isFinderPattern(r, c) || isLogoZone(r, c)) continue;
          if (qr.modules.get(r, c)) {
            const x = offset + c * cellSize;
            const y = offset + r * cellSize;
            if (dotStyle === "dots") {
              const radius = cellSize * 0.44;
              svgElements.push(`<circle cx="${(x + cellSize / 2).toFixed(2)}" cy="${(y + cellSize / 2).toFixed(2)}" r="${radius.toFixed(2)}" fill="${fgColor}" />`);
            } else if (dotStyle === "rounded") {
              const pad = cellSize * 0.05;
              const w = cellSize - pad * 2;
              const radius = cellSize * 0.28;
              svgElements.push(`<rect x="${(x + pad).toFixed(2)}" y="${(y + pad).toFixed(2)}" width="${w.toFixed(2)}" height="${w.toFixed(2)}" rx="${radius.toFixed(2)}" fill="${fgColor}" />`);
            } else {
              svgElements.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(cellSize + 0.3).toFixed(2)}" height="${(cellSize + 0.3).toFixed(2)}" fill="${fgColor}" />`);
            }
          }
        }
      }

      // Styled Finder Eyes (Top-Left, Top-Right, Bottom-Left)
      const renderSvgEye = (originR, originC) => {
        const eyeX = offset + originC * cellSize;
        const eyeY = offset + originR * cellSize;
        const eyeSize = 7 * cellSize;
        const bgFill = isTransparentBg ? "#ffffff" : bgColor;

        if (eyeStyle === "circle") {
          svgElements.push(`<circle cx="${(eyeX + eyeSize / 2).toFixed(2)}" cy="${(eyeY + eyeSize / 2).toFixed(2)}" r="${(eyeSize / 2).toFixed(2)}" fill="${fgColor}" />`);
          svgElements.push(`<circle cx="${(eyeX + eyeSize / 2).toFixed(2)}" cy="${(eyeY + eyeSize / 2).toFixed(2)}" r="${((5 * cellSize) / 2).toFixed(2)}" fill="${bgFill}" />`);
          svgElements.push(`<circle cx="${(eyeX + eyeSize / 2).toFixed(2)}" cy="${(eyeY + eyeSize / 2).toFixed(2)}" r="${((3 * cellSize) / 2).toFixed(2)}" fill="${fgColor}" />`);
        } else if (eyeStyle === "rounded") {
          const outerR = cellSize * 1.8;
          svgElements.push(`<rect x="${eyeX.toFixed(2)}" y="${eyeY.toFixed(2)}" width="${eyeSize.toFixed(2)}" height="${eyeSize.toFixed(2)}" rx="${outerR.toFixed(2)}" fill="${fgColor}" />`);
          svgElements.push(`<rect x="${(eyeX + cellSize).toFixed(2)}" y="${(eyeY + cellSize).toFixed(2)}" width="${(5 * cellSize).toFixed(2)}" height="${(5 * cellSize).toFixed(2)}" rx="${(outerR * 0.65).toFixed(2)}" fill="${bgFill}" />`);
          svgElements.push(`<rect x="${(eyeX + 2 * cellSize).toFixed(2)}" y="${(eyeY + 2 * cellSize).toFixed(2)}" width="${(3 * cellSize).toFixed(2)}" height="${(3 * cellSize).toFixed(2)}" rx="${(outerR * 0.4).toFixed(2)}" fill="${fgColor}" />`);
        } else {
          svgElements.push(`<rect x="${eyeX.toFixed(2)}" y="${eyeY.toFixed(2)}" width="${eyeSize.toFixed(2)}" height="${eyeSize.toFixed(2)}" fill="${fgColor}" />`);
          svgElements.push(`<rect x="${(eyeX + cellSize).toFixed(2)}" y="${(eyeY + cellSize).toFixed(2)}" width="${(5 * cellSize).toFixed(2)}" height="${(5 * cellSize).toFixed(2)}" fill="${bgFill}" />`);
          svgElements.push(`<rect x="${(eyeX + 2 * cellSize).toFixed(2)}" y="${(eyeY + 2 * cellSize).toFixed(2)}" width="${(3 * cellSize).toFixed(2)}" height="${(3 * cellSize).toFixed(2)}" fill="${fgColor}" />`);
        }
      };

      renderSvgEye(0, 0);
      renderSvgEye(0, moduleCount - 7);
      renderSvgEye(moduleCount - 7, 0);

      // Center Logo in SVG
      if (hasLogo) {
        const center = svgSize / 2;
        const logoBoxSize = svgSize * 0.22;
        const halfBox = logoBoxSize / 2;
        const bgFill = isTransparentBg ? "#ffffff" : bgColor;

        svgElements.push(`<rect x="${(center - halfBox).toFixed(2)}" y="${(center - halfBox).toFixed(2)}" width="${logoBoxSize.toFixed(2)}" height="${logoBoxSize.toFixed(2)}" rx="${(logoBoxSize * 0.25).toFixed(2)}" fill="${bgFill}" stroke="${fgColor}" stroke-width="1.5" />`);

        if (customLogoUrl) {
          svgElements.push(`<image href="${customLogoUrl}" x="${(center - halfBox + logoBoxSize * 0.16).toFixed(2)}" y="${(center - halfBox + logoBoxSize * 0.16).toFixed(2)}" width="${(logoBoxSize * 0.68).toFixed(2)}" height="${(logoBoxSize * 0.68).toFixed(2)}" />`);
        } else if (logoPreset !== "none") {
          const found = LOGO_PRESETS.find((p) => p.id === logoPreset);
          if (found && found.svg) {
            const pad = logoBoxSize * 0.2;
            const innerSize = logoBoxSize - pad * 2;
            svgElements.push(`<g transform="translate(${(center - halfBox + pad).toFixed(2)}, ${(center - halfBox + pad).toFixed(2)}) scale(${(innerSize / 24).toFixed(3)})">${found.svg}</g>`);
          }
        }
      }

      const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgSize} ${svgSize}" width="${svgSize}" height="${svgSize}">\n${svgElements.join("\n")}\n</svg>`;

      const blob = new Blob([fullSvg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `boring-qr-${activeTab}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      showToast("Downloaded Styled Vector SVG!");
    } catch (err) {
      console.error(err);
      showToast("Failed to generate SVG");
    }
  };

  // Copy QR Image to Clipboard
  const copyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !rawPayload) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setIsCopied(true);
          showToast("Copied QR Code to clipboard!");
          setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
          console.warn("Direct blob copy failed, copying data URL:", err);
          await navigator.clipboard.writeText(canvas.toDataURL("image/png"));
          setIsCopied(true);
          showToast("Copied QR Data URL!");
          setTimeout(() => setIsCopied(false), 2000);
        }
      });
    } catch (err) {
      console.error(err);
      showToast("Unable to copy to clipboard");
    }
  };

  // Print QR Code
  const printQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - BoringTools</title>
          <style>
            @media print {
              body { margin: 0; padding: 20mm; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #fff;
              color: #0f172a;
            }
            .card {
              border: 2px solid #0f172a;
              border-radius: 20px;
              padding: 32px;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              max-width: 440px;
            }
            .badge {
              display: inline-block;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              background: #f1f5f9;
              padding: 4px 12px;
              border-radius: 9999px;
              margin-bottom: 12px;
            }
            img {
              width: 300px;
              height: 300px;
              display: block;
              margin: 12px 0 16px 0;
            }
            h2 {
              margin: 0 0 6px 0;
              font-size: 22px;
              font-weight: 800;
            }
            p.sub {
              font-size: 13px;
              color: #64748b;
              margin: 0 0 16px 0;
            }
            p.payload {
              font-size: 11px;
              color: #0f172a;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 8px 12px;
              border-radius: 8px;
              max-width: 320px;
              word-break: break-all;
              font-family: monospace;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">Scan to Connect</span>
            <h2>Scan This QR Code</h2>
            <p class="sub">Point your phone's camera at the code below to open.</p>
            <img src="${dataUrl}" alt="QR Code" />
            <p class="payload">${rawPayload}</p>
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 selection:bg-amber-100 selection:text-amber-900">
      {/* Toast banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <KoboyoSparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        {/* Header section */}
        <div className="flex flex-col items-center text-center mb-8 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-2.5">
            QR Code Generator
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Create custom, high-resolution QR codes in seconds. Completely client-side, watermark-free, and private by design.
          </p>
        </div>

        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Controls, Presets & Forms (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Format Selection Bar */}
            <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-1">
              {[
                {
                  id: "url",
                  label: "Link / URL",
                  icon: (
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                  ),
                },
                {
                  id: "wifi",
                  label: "Wi-Fi",
                  icon: (
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>
                    </svg>
                  ),
                },
                {
                  id: "vcard",
                  label: "Contact",
                  icon: (
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="7" r="4"/>
                      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                    </svg>
                  ),
                },
                {
                  id: "text",
                  label: "Plain Text",
                  icon: (
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  ),
                },
                {
                  id: "email",
                  label: "Email",
                  icon: (
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  ),
                },
                {
                  id: "whatsapp",
                  label: "WhatsApp",
                  icon: (
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.12 7.07C8.95 7.07 8.68 7.14 8.44 7.4C8.2 7.66 7.53 8.29 7.53 9.57C7.53 10.85 8.46 12.08 8.6 12.25C8.73 12.43 10.43 15.03 13.04 16.16C13.66 16.43 14.15 16.59 14.53 16.71C15.15 16.91 15.72 16.88 16.16 16.82C16.66 16.74 17.7 16.19 17.92 15.57C18.14 14.95 18.14 14.42 18.07 14.31C18 14.2 17.83 14.13 17.57 14C17.31 13.87 16.03 13.24 15.8 13.15C15.56 13.06 15.39 13.02 15.22 13.28C15.05 13.54 14.56 14.13 14.41 14.3C14.26 14.48 14.12 14.5 13.86 14.37C13.6 14.24 12.76 13.97 11.76 13.08C10.99 12.39 10.46 11.53 10.31 11.28C10.16 11.02 10.29 10.88 10.42 10.75C10.54 10.63 10.69 10.44 10.82 10.29C10.95 10.14 11 10.03 11.09 9.85C11.17 9.68 11.13 9.53 11.07 9.4C11.01 9.27 10.51 8.04 10.3 7.54C10.1 7.05 9.89 7.12 9.73 7.11C9.58 7.1 9.38 7.07 9.12 7.07Z"/>
                    </svg>
                  ),
                },
                {
                  id: "upi",
                  label: "UPI Pay",
                  icon: <KoboyoCurrency className="w-3.5 h-3.5 shrink-0" />,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Input Payload Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  {activeTab === "url" && "Website Link or Landing Page"}
                  {activeTab === "wifi" && "Wi-Fi Network Credentials"}
                  {activeTab === "vcard" && "vCard Digital Contact Card"}
                  {activeTab === "text" && "Plain Text Message"}
                  {activeTab === "email" && "Pre-composed Email Message"}
                  {activeTab === "whatsapp" && "Direct WhatsApp Chat"}
                  {activeTab === "upi" && "UPI Payment QR"}
                </h2>
                <span className="text-xs font-mono text-slate-600">
                  {rawPayload.length} chars
                </span>
              </div>

              {/* Dynamic Field Form */}
              {activeTab === "url" && (
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 text-sm font-medium transition"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>Quick presets:</span>
                    <button
                      type="button"
                      onClick={() => setUrlInput("https://boringtoolsai.com")}
                      className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    >
                      BoringTools
                    </button>
                    <button
                      type="button"
                      onClick={() => setUrlInput("https://github.com")}
                      className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    >
                      GitHub
                    </button>
                    <button
                      type="button"
                      onClick={() => setUrlInput("https://google.com")}
                      className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    >
                      Google
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "wifi" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Network Name (SSID)</label>
                    <input
                      type="text"
                      value={wifiData.ssid}
                      onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                      placeholder="e.g. MyHomeNetwork"
                      className="px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Password</label>
                    <input
                      type="text"
                      value={wifiData.password}
                      onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                      placeholder="Wi-Fi Password"
                      disabled={wifiData.encryption === "none"}
                      className="px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Security Encryption</label>
                    <ThemedDropdown
                      value={wifiData.encryption}
                      onChange={(val) => setWifiData({ ...wifiData, encryption: val })}
                      options={[
                        { value: "WPA", label: "WPA / WPA2 / WPA3 (Standard)" },
                        { value: "WEP", label: "WEP (Legacy)" },
                        { value: "none", label: "Open / No Password" },
                      ]}
                      ariaLabel="Security Encryption"
                      className="w-full"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="hidden-wifi"
                      checked={wifiData.hidden}
                      onChange={(e) => setWifiData({ ...wifiData, hidden: e.target.checked })}
                      className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
                    />
                    <label htmlFor="hidden-wifi" className="text-xs font-medium text-slate-700 cursor-pointer">
                      Hidden Network (SSID is not broadcasted)
                    </label>
                  </div>
                </div>
              )}

              {activeTab === "vcard" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">First Name</label>
                    <input
                      type="text"
                      value={vcardData.firstName}
                      onChange={(e) => setVcardData({ ...vcardData, firstName: e.target.value })}
                      className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Last Name</label>
                    <input
                      type="text"
                      value={vcardData.lastName}
                      onChange={(e) => setVcardData({ ...vcardData, lastName: e.target.value })}
                      className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                    <input
                      type="tel"
                      value={vcardData.phone}
                      onChange={(e) => setVcardData({ ...vcardData, phone: e.target.value })}
                      placeholder="+1 555-0100"
                      className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      value={vcardData.email}
                      onChange={(e) => setVcardData({ ...vcardData, email: e.target.value })}
                      placeholder="alex@domain.com"
                      className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Company / Organization</label>
                    <input
                      type="text"
                      value={vcardData.company}
                      onChange={(e) => setVcardData({ ...vcardData, company: e.target.value })}
                      className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Job Title</label>
                    <input
                      type="text"
                      value={vcardData.title}
                      onChange={(e) => setVcardData({ ...vcardData, title: e.target.value })}
                      className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Website</label>
                    <input
                      type="url"
                      value={vcardData.website}
                      onChange={(e) => setVcardData({ ...vcardData, website: e.target.value })}
                      className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                    />
                  </div>
                </div>
              )}

              {activeTab === "text" && (
                <div className="flex flex-col gap-2">
                  <textarea
                    rows={4}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter any text, instructions, notes or raw code..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 text-sm resize-none font-mono transition"
                  />
                  <span className="text-xs text-slate-600">
                    UTF-8 text will be decoded directly when scanned by camera apps.
                  </span>
                </div>
              )}

              {activeTab === "email" && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Recipient Email</label>
                    <input
                      type="email"
                      value={emailData.to}
                      onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                      placeholder="recipient@example.com"
                      className="px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Subject</label>
                    <input
                      type="text"
                      value={emailData.subject}
                      onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                      placeholder="Subject line"
                      className="px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Message Body</label>
                    <textarea
                      rows={3}
                      value={emailData.body}
                      onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                      placeholder="Pre-composed email body..."
                      className="px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm resize-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === "whatsapp" && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Phone Number (with country code)</label>
                    <input
                      type="tel"
                      value={whatsappData.phone}
                      onChange={(e) => setWhatsappData({ ...whatsappData, phone: e.target.value })}
                      placeholder="+15550199 or 919876543210"
                      className="px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Default Message</label>
                    <textarea
                      rows={3}
                      value={whatsappData.message}
                      onChange={(e) => setWhatsappData({ ...whatsappData, message: e.target.value })}
                      placeholder="Message to start the conversation..."
                      className="px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm resize-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === "upi" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">UPI ID / VPA *</label>
                    <input
                      type="text"
                      value={upiData.vpa}
                      onChange={(e) => setUpiData({ ...upiData, vpa: e.target.value })}
                      placeholder="name@upi or phone@paytm"
                      className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Payee Name</label>
                    <input
                      type="text"
                      value={upiData.name}
                      onChange={(e) => setUpiData({ ...upiData, name: e.target.value })}
                      placeholder="Merchant or Name"
                      className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Amount (INR ₹)</label>
                    <input
                      type="number"
                      value={upiData.amount}
                      onChange={(e) => setUpiData({ ...upiData, amount: e.target.value })}
                      placeholder="Optional, e.g. 500"
                      className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Note / Purpose</label>
                    <input
                      type="text"
                      value={upiData.note}
                      onChange={(e) => setUpiData({ ...upiData, note: e.target.value })}
                      placeholder="Bill payment"
                      className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Visual Customization Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <KoboyoSparkles className="w-4 h-4 text-amber-500" />
                  Visual Styling & Aesthetics
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${scannability.color}`}>
                  {scannability.status} (Contrast: {contrastRatio.toFixed(1)}:1)
                </span>
              </div>

              {/* Color Presets & Custom Pickers */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-slate-700">Color Palette & Brand Swatches</label>
                <div className="flex flex-wrap items-center gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setFgColor(preset.fg);
                        setBgColor(preset.bg);
                        setIsTransparentBg(false);
                      }}
                      title={preset.name}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium hover:border-slate-400 transition cursor-pointer"
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: preset.fg }} />
                      <span className="text-slate-700">{preset.name}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {/* Foreground */}
                  <div className="flex items-center gap-2 border border-slate-200 p-2 rounded-xl bg-slate-50/60">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold uppercase text-slate-500">QR Color</span>
                      <span className="text-xs font-mono font-semibold text-slate-800">{fgColor}</span>
                    </div>
                  </div>

                  {/* Background */}
                  <div className={`flex items-center gap-2 border border-slate-200 p-2 rounded-xl bg-slate-50/60 ${isTransparentBg ? "opacity-40 pointer-events-none" : ""}`}>
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      disabled={isTransparentBg}
                      className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold uppercase text-slate-500">Background</span>
                      <span className="text-xs font-mono font-semibold text-slate-800">{bgColor}</span>
                    </div>
                  </div>

                  {/* Transparent Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsTransparentBg(!isTransparentBg)}
                    className={`flex items-center justify-center gap-1.5 border rounded-xl p-2 text-xs font-semibold transition cursor-pointer ${
                      isTransparentBg
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {isTransparentBg && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                    <span>Transparent BG</span>
                  </button>
                </div>
              </div>

              {/* Module & Eye Shapes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Module Dot Shape */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">QR Pattern / Module Style</label>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
                    {[
                      { id: "rounded", label: "Smooth" },
                      { id: "square", label: "Squares" },
                      { id: "dots", label: "Circles" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDotStyle(opt.id)}
                        className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                          dotStyle === opt.id
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Corner Eye Shape */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Corner Finder Eyes</label>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
                    {[
                      { id: "rounded", label: "Rounded" },
                      { id: "square", label: "Classic" },
                      { id: "circle", label: "Curved" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setEyeStyle(opt.id)}
                        className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                          eyeStyle === opt.id
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center Logo & Icon Integration */}
              <div className="flex flex-col gap-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Center Logo or Badge</label>
                  {(customLogoUrl || logoPreset !== "none") && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomLogoUrl(null);
                        setLogoPreset("none");
                      }}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>

                {/* Preset badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {LOGO_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setLogoPreset(preset.id);
                        setCustomLogoUrl(null);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                        logoPreset === preset.id && !customLogoUrl
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom File Upload */}
                <div className="flex items-center gap-3 pt-1">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 border border-dashed border-slate-300 hover:border-slate-500 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span>Upload Custom Icon / Logo (PNG, SVG, JPG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {customLogoUrl && (
                    <div className="flex items-center gap-2 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold">
                      <img src={customLogoUrl} alt="Logo preview" className="w-5 h-5 object-contain rounded" />
                      <span>Custom Active</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Margin & ECC */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-100">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Error Correction Level (ECC)</label>
                  <ThemedDropdown
                    value={effectiveEcc}
                    onChange={(val) => setEcc(val)}
                    options={[
                      { value: "L", label: "L — Low (7% recovery)" },
                      { value: "M", label: "M — Medium (15% recovery)" },
                      { value: "Q", label: "Q — Quartile (25% recovery)" },
                      { value: "H", label: "H — High (30% recovery - best for logos)" },
                    ]}
                    ariaLabel="Error Correction Level"
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Quiet Zone Margin</label>
                  <ThemedDropdown
                    value={margin}
                    onChange={(val) => setMargin(Number(val))}
                    options={[
                      { value: 0, label: "0 Modules (Border flush)" },
                      { value: 1, label: "1 Module (Compact)" },
                      { value: 2, label: "2 Modules (Balanced)" },
                      { value: 4, label: "4 Modules (Standard QR spec)" },
                    ]}
                    ariaLabel="Quiet Zone Margin"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Preview & Sticky Export Studio (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col gap-5 lg:sticky lg:top-8">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col items-center gap-5">
              <div className="w-full flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                <span className="font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live QR Studio
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  Instant Client Preview
                </span>
              </div>

              {/* Canvas Display Container with Elegant Shadow Framing */}
              <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[300px] bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex items-center justify-center transition">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain rounded-lg"
                />

                {!rawPayload && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/95 rounded-2xl">
                    <p className="text-sm font-semibold text-slate-800">Enter Content</p>
                    <p className="text-xs text-slate-500 mt-1">Type in the left panel to render your QR code.</p>
                  </div>
                )}
              </div>

              {/* Scannability / Contrast Indicator Badge */}
              <div className="w-full flex items-center justify-center">
                <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border font-medium ${scannability.color}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>{scannability.status}</span>
                  <span className="opacity-60 font-mono">({contrastRatio.toFixed(1)}:1)</span>
                </span>
              </div>

              {/* Action Buttons Suite - Symmetrical, Balanced & Sized */}
              <div className="w-full flex flex-col gap-3 pt-1 border-t border-slate-100">
                {/* Resolution Selector Pill Segment */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-0.5">
                    <span>Export Resolution</span>
                    <span className="font-mono text-slate-700">{exportScale === 1 ? "512×512px" : exportScale === 2 ? "1024×1024px" : "2048×2048px"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                    {[
                      { scale: 1, label: "512px" },
                      { scale: 2, label: "1024px HD" },
                      { scale: 4, label: "4K Print" },
                    ].map((opt) => (
                      <button
                        key={opt.scale}
                        type="button"
                        onClick={() => setExportScale(opt.scale)}
                        className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                          exportScale === opt.scale
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Download Button */}
                <button
                  type="button"
                  onClick={() => downloadPNG(exportScale)}
                  disabled={!rawPayload}
                  className="w-full h-11 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-xs disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <KoboyoDownload className="w-4 h-4" />
                  <span>Download PNG ({exportScale === 1 ? "512px" : exportScale === 2 ? "1024px HD" : "4K Print"})</span>
                </button>

                {/* Secondary Actions (Vector SVG & Copy to Clipboard) */}
                <div className="grid grid-cols-2 gap-2.5 w-full">
                  <button
                    type="button"
                    onClick={downloadSVG}
                    disabled={!rawPayload}
                    className="h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer disabled:opacity-40"
                  >
                    <KoboyoCode className="w-4 h-4 text-slate-700" />
                    <span>Vector SVG</span>
                  </button>

                  <button
                    type="button"
                    onClick={copyToClipboard}
                    disabled={!rawPayload}
                    className="h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer disabled:opacity-40"
                  >
                    {isCopied ? (
                      <>
                        <CheckIcon className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <KoboyoCopy className="w-4 h-4 text-slate-700" />
                        <span>Copy Image</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Utility Actions (Print & Inspect) */}
                <div className="grid grid-cols-2 gap-2.5 w-full">
                  <button
                    type="button"
                    onClick={printQR}
                    disabled={!rawPayload}
                    className="h-9 px-3 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-40"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                    <span>Print Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowInspector(true)}
                    disabled={!rawPayload}
                    className="h-9 px-3 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-40"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    <span>Inspect Data</span>
                  </button>
                </div>
              </div>

              {/* Privacy Notice Footnote */}
              <div className="w-full text-center pt-2 border-t border-slate-100">
                <p className="text-[11px] text-slate-600 flex items-center justify-center gap-1.5 font-medium">
                  <KoboyoShield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>100% Client-Side • Never sent to any server</span>
                </p>
              </div>
            </div>

            {/* Local History Section */}
            {history.length > 0 && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Recent In-Browser QRs</span>
                  <button
                    type="button"
                    onClick={() => {
                      setHistory([]);
                      localStorage.removeItem("boring_qr_history");
                    }}
                    className="text-slate-600 hover:text-rose-600 text-[11px] cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-col gap-1.5">
                  {history.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (item.tab === "url") setUrlInput(item.text);
                        else setTextInput(item.text);
                        setActiveTab(item.tab || "text");
                      }}
                      className="text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 border border-slate-100 text-xs text-slate-700 truncate font-mono transition cursor-pointer flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{item.text}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-600 shrink-0">{item.tab}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scan Simulator / Payload Inspector Modal */}
        {showInspector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h3 className="font-bold text-slate-900 text-base">QR Camera Scan Simulator</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInspector(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                When a smartphone camera scans this QR code, it will detect this raw payload:
              </p>

              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono break-all max-h-48 overflow-y-auto select-all leading-relaxed">
                {rawPayload || "No data provided."}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-600 block text-[10px] uppercase font-semibold">Format Detected</span>
                  <span className="font-bold text-slate-800 uppercase">{activeTab}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-600 block text-[10px] uppercase font-semibold">Size in Bytes</span>
                  <span className="font-bold text-slate-800 font-mono">{new Blob([rawPayload]).size} B</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(rawPayload);
                    showToast("Copied raw payload!");
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Copy Payload Text
                </button>
                {rawPayload.startsWith("http") && (
                  <a
                    href={rawPayload}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
                  >
                    Open Link ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Feature Highlights & Content Footer */}
        <div className="mt-16 pt-12 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
                <KoboyoShield className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">100% Client-Side Privacy</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your URLs, Wi-Fi passwords, contact cards, and text are processed strictly inside your web browser via HTML5 Canvas. Zero network requests, zero telemetry.
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
                <ThemePaletteIcon className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Design & Print Ready</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Export infinitely scalable SVG vector files for commercial print, flyers, and merchandise, or crystal-clear 4K PNGs for high-DPI digital displays.
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
                <LightningIcon className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Zero Bullshit Promise</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                No signups, no paywalls, no recurring subscriptions, and no expiration dates on generated codes. What you create is 100% yours forever.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
