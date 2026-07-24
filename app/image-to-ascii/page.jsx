"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

// Preset character sequences
const CHARACTER_PRESETS = {
  Classic: "@#%*+=-:. ",
  Dense: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
  Light: " .:-=+*#%@",
  Unicode: " ░▒▓█",
  Blocks: " ▖▗▘▙▚▛▜▝▞▟█",
  Terminal: "_.-:+=*%@#",
  Minimal: " .+-*",
};

const DEFAULT_SETTINGS = {
  charDensity: "Classic",
  customChars: "@#%*+=-:. ",
  charWidthScale: 1.0,
  charHeightScale: 1.0,
  brightness: 0,
  contrast: 0,
  gamma: 1.0,
  sharpness: 0,
  invert: false,
  edgeDetection: false,
  sketchMode: false,
  highContrast: false,
  pixelArt: false,
  colorOption: "original",
  customColor: "#39ff14",
  bgOption: "terminal",
  customBg: "#121212",
  outputSize: "medium",
  customWidth: 100,
  customHeight: 60,
  showLineNumbers: false,
  layoutMode: "side-by-side",
  searchQuery: "",
  lockAspectRatio: true,
  charStretch: 0.55,
};

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "0 B";
  const units = ["B", "KB", "MB"];
  let size = bytes;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

const getAspectRatioStr = (w, h) => {
  if (!w || !h) return "0:0";
  const divisor = gcd(w, h);
  const aspectX = w / divisor;
  const aspectY = h / divisor;
  if (aspectX > 20 || aspectY > 20) {
    return `${(w / h).toFixed(2)}:1`;
  }
  return `${aspectX}:${aspectY}`;
};

export default function ImageToAscii() {
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);

  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [asciiText, setAsciiText] = useState("");
  const [colorsGrid, setColorsGrid] = useState([]);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imgStats, setImgStats] = useState({ width: 0, height: 0, aspect: "1:1" });
  const [favorites, setFavorites] = useState(["@#%*+=-:. "]);
  const [lastExportFormat, setLastExportFormat] = useState("txt");
  
  // Custom font size slider for adjusting the terminal character rendering
  const [fontSize, setFontSize] = useState(8);

  // Tabs for the control sidebar: "filters", "grid", "styling", "export"
  const [activeTab, setActiveTab] = useState("filters");

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Initialize and load local storage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("bt_ascii_settings");
      if (savedSettings) {
        setSettings((prev) => ({ ...prev, ...JSON.parse(savedSettings) }));
      }
      const savedFavorites = localStorage.getItem("bt_ascii_favorites");
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
      const savedFormat = localStorage.getItem("bt_ascii_last_format");
      if (savedFormat) {
        setLastExportFormat(savedFormat);
      }
      const savedSize = localStorage.getItem("bt_ascii_font_size");
      if (savedSize) {
        setFontSize(parseInt(savedSize));
      }
    } catch (e) {
      console.error("Local storage load failed", e);
    }
  }, []);

  // Sync settings to local storage helper
  const updateSettings = (updates) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem("bt_ascii_settings", JSON.stringify(next));
      } catch (e) {
        console.error("Local storage save failed", e);
      }
      return next;
    });
  };

  // Keyboard navigation & Esc to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Handle image load stats
  const onImageLoad = () => {
    if (imgRef.current) {
      const w = imgRef.current.naturalWidth;
      const h = imgRef.current.naturalHeight;
      setImgStats({
        width: w,
        height: h,
        aspect: getAspectRatioStr(w, h),
      });
      runLoadingSequence();
    }
  };

  // Drag & drop file loaders
  const loadFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Unsupported image type. Please upload a PNG, JPG, JPEG, or WEBP file.");
      return;
    }

    if (selectedFile.size > 25 * 1024 * 1024) {
      setError("Image file is too large (max 25MB).");
      return;
    }

    setError("");
    setFile(selectedFile);

    if (originalUrl && !originalUrl.startsWith("data:")) {
      URL.revokeObjectURL(originalUrl);
    }

    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setAsciiText("");
    setColorsGrid([]);
  };

  // Upload selectors
  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    loadFile(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files?.[0];
    loadFile(droppedFile);
  };

  // Clipboard paste listener (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            loadFile(blob);
            e.preventDefault();
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // Demo Image generator (Sunset retro grid drawn on canvas)
  const loadDemoImage = () => {
    setIsProcessing(true);
    setError("");
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Canvas context failed.");
      setIsProcessing(false);
      return;
    }

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 400);
    grad.addColorStop(0, "#ff4b2b");
    grad.addColorStop(0.5, "#ff416c");
    grad.addColorStop(1, "#1a0826");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 500, 400);

    // Glowing sun
    ctx.fillStyle = "#ffde43";
    ctx.shadowColor = "#ffde43";
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(250, 200, 75, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Grid lines for ground
    ctx.strokeStyle = "#00e5ff";
    ctx.lineWidth = 2;
    for (let i = 0; i <= 500; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 300);
      ctx.lineTo(250 + (i - 250) * 2, 400);
      ctx.stroke();
    }
    for (let i = 300; i <= 400; i += 15) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(500, i);
      ctx.stroke();
    }

    // Terminal logo overlay
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(100, 40, 300, 80);
    ctx.strokeStyle = "#39ff14";
    ctx.strokeRect(100, 40, 300, 80);
    ctx.fillStyle = "#39ff14";
    ctx.font = "bold 20px monospace";
    ctx.fillText("BORING TOOLS", 180, 80);
    ctx.font = "14px monospace";
    ctx.fillText("> image_to_ascii.exe --run", 120, 105);

    const demoUrl = canvas.toDataURL("image/png");
    setOriginalUrl(demoUrl);
    setFile({
      name: "demo_sunset_grid.png",
      size: 32000,
      type: "image/png",
    });
    setAsciiText("");
    setColorsGrid([]);
  };

  const clearAll = () => {
    setFile(null);
    if (originalUrl && !originalUrl.startsWith("data:")) {
      URL.revokeObjectURL(originalUrl);
    }
    setOriginalUrl("");
    setAsciiText("");
    setColorsGrid([]);
    setError("");
    setLoadingStage("");
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Dimensions of target grid based on settings
  const targetDimensions = useMemo(() => {
    if (!imgStats.width || !imgStats.height) return { w: 100, h: 60 };

    let w = 100;
    if (settings.outputSize === "small") w = 60;
    else if (settings.outputSize === "medium") w = 100;
    else if (settings.outputSize === "large") w = 150;
    else w = settings.customWidth;

    let h = 60;
    if (settings.lockAspectRatio) {
      const aspect = imgStats.height / imgStats.width;
      h = Math.round(w * aspect * settings.charStretch * (settings.charHeightScale / settings.charWidthScale));
      h = Math.max(5, h);
    } else {
      h = settings.customHeight;
    }

    return { w, h };
  }, [
    imgStats,
    settings.outputSize,
    settings.customWidth,
    settings.customHeight,
    settings.lockAspectRatio,
    settings.charStretch,
    settings.charWidthScale,
    settings.charHeightScale,
  ]);

  // Loading animation phases
  const runLoadingSequence = () => {
    setIsProcessing(true);
    setLoadingStage("analyzing");
    setTimeout(() => {
      setLoadingStage("mapping");
      setTimeout(() => {
        setLoadingStage("generating");
        setTimeout(() => {
          setLoadingStage("rendering");
          setTimeout(() => {
            setLoadingStage("");
            setIsProcessing(false);
            processAndGenerate();
          }, 120);
        }, 120);
      }, 120);
    }, 120);
  };

  // Pixel operations (Contrast, Brightness, Gamma, Sharpness, Edge detection, Sketch, HighContrast)
  const processPixels = (ctx, w, h) => {
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const len = data.length;

    const { brightness, contrast, gamma, invert, edgeDetection, sketchMode, highContrast, sharpness } = settings;

    // Contrast scaling factor
    const cFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    const gExp = 1 / gamma;

    for (let i = 0; i < len; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Brightness
      if (brightness !== 0) {
        r += brightness;
        g += brightness;
        b += brightness;
      }

      // Contrast
      if (contrast !== 0) {
        r = cFactor * (r - 128) + 128;
        g = cFactor * (g - 128) + 128;
        b = cFactor * (g - 128) + 128;
      }

      // Gamma
      if (gamma !== 1) {
        r = 255 * Math.pow(Math.max(0, r) / 255, gExp);
        g = 255 * Math.pow(Math.max(0, g) / 255, gExp);
        b = 255 * Math.pow(Math.max(0, b) / 255, gExp);
      }

      // High Contrast
      if (highContrast) {
        const avg = (r + g + b) / 3;
        const thresh = avg > 127 ? 255 : 0;
        r = thresh;
        g = thresh;
        b = thresh;
      }

      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
    }

    // Convolution Sharpness Filter
    if (sharpness > 0) {
      const temp = new Uint8ClampedArray(data);
      const str = sharpness / 100;
      const getPixelVal = (cx, cy, c) => {
        const px = Math.min(w - 1, Math.max(0, cx));
        const py = Math.min(h - 1, Math.max(0, cy));
        return temp[(py * w + px) * 4 + c];
      };

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          for (let c = 0; c < 3; c++) {
            const center = getPixelVal(x, y, c);
            const top = getPixelVal(x, y - 1, c);
            const bottom = getPixelVal(x, y + 1, c);
            const left = getPixelVal(x - 1, y, c);
            const right = getPixelVal(x + 1, y, c);
            const sharpVal = 5 * center - (top + bottom + left + right);
            data[idx + c] = Math.min(255, Math.max(0, center + (sharpVal - center) * str));
          }
        }
      }
    }

    // Invert pixels
    if (invert) {
      for (let i = 0; i < len; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
    }

    // Sobel Edge Detection
    if (edgeDetection) {
      const temp = new Uint8ClampedArray(data);
      const getGray = (cx, cy) => {
        const px = Math.min(w - 1, Math.max(0, cx));
        const py = Math.min(h - 1, Math.max(0, cy));
        const idx = (py * w + px) * 4;
        return 0.299 * temp[idx] + 0.587 * temp[idx + 1] + 0.114 * temp[idx + 2];
      };

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const g00 = getGray(x - 1, y - 1);
          const g01 = getGray(x, y - 1);
          const g02 = getGray(x + 1, y - 1);
          const g10 = getGray(x - 1, y);
          const g12 = getGray(x + 1, y);
          const g20 = getGray(x - 1, y + 1);
          const g21 = getGray(x, y + 1);
          const g22 = getGray(x + 1, y + 1);

          const gx = (g02 + 2 * g12 + g22) - (g00 + 2 * g10 + g20);
          const gy = (g20 + 2 * g21 + g22) - (g00 + 2 * g01 + g02);
          const mag = Math.sqrt(gx * gx + gy * gy);
          const val = Math.min(255, Math.max(0, mag));
          data[idx] = val;
          data[idx + 1] = val;
          data[idx + 2] = val;
        }
      }
    }

    // Sketch filter (dark outline on light bg)
    if (sketchMode) {
      const temp = new Uint8ClampedArray(data);
      const getGray = (cx, cy) => {
        const px = Math.min(w - 1, Math.max(0, cx));
        const py = Math.min(h - 1, Math.max(0, cy));
        const idx = (py * w + px) * 4;
        return 0.299 * temp[idx] + 0.587 * temp[idx + 1] + 0.114 * temp[idx + 2];
      };

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const g00 = getGray(x - 1, y - 1);
          const g01 = getGray(x, y - 1);
          const g02 = getGray(x + 1, y - 1);
          const g10 = getGray(x - 1, y);
          const g12 = getGray(x + 1, y);
          const g20 = getGray(x - 1, y + 1);
          const g21 = getGray(x, y + 1);
          const g22 = getGray(x + 1, y + 1);

          const gx = (g02 + 2 * g12 + g22) - (g00 + 2 * g10 + g20);
          const gy = (g20 + 2 * g21 + g22) - (g00 + 2 * g01 + g02);
          const mag = Math.sqrt(gx * gx + gy * gy);
          const val = Math.min(255, Math.max(0, 255 - mag));
          data[idx] = val;
          data[idx + 1] = val;
          data[idx + 2] = val;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  };

  // Perform scale, filter modifications, and character mapping
  const processAndGenerate = () => {
    if (!imgRef.current) return;
    try {
      const { w, h } = targetDimensions;
      if (w <= 0 || h <= 0) return;

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw image
      ctx.drawImage(imgRef.current, 0, 0, w, h);

      // Perform adjustments
      processPixels(ctx, w, h);

      // Color mapping source (from scaled canvas but before monochrome filters if original colors are desired)
      const colorCanvas = document.createElement("canvas");
      colorCanvas.width = w;
      colorCanvas.height = h;
      const colorCtx = colorCanvas.getContext("2d");
      if (colorCtx) {
        colorCtx.drawImage(imgRef.current, 0, 0, w, h);
      }

      const imgData = ctx.getImageData(0, 0, w, h);
      const colorData = colorCtx ? colorCtx.getImageData(0, 0, w, h).data : imgData.data;
      const pixels = imgData.data;

      // Define character maps
      let chars = CHARACTER_PRESETS[settings.charDensity];
      if (settings.charDensity === "Custom") {
        chars = settings.customChars || "@#%*+=-:. ";
      }
      if (settings.pixelArt) {
        chars = "█";
      }

      let output = "";
      const colors = [];

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];

          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
          const charIndex = Math.min(
            chars.length - 1,
            Math.max(0, Math.floor((brightness / 255) * chars.length))
          );
          output += chars[charIndex];

          const cr = colorData[idx];
          const cg = colorData[idx + 1];
          const cb = colorData[idx + 2];
          colors.push(`rgb(${cr},${cg},${cb})`);
        }
        output += "\n";
      }

      setAsciiText(output);
      setColorsGrid(colors);
    } catch (e) {
      console.error(e);
      setError("Processing failed. Please check browser memory limits.");
    }
  };

  // Re-run instantly on settings changes (no animation) if the image is already loaded
  useEffect(() => {
    if (originalUrl && !isProcessing && !loadingStage) {
      processAndGenerate();
    }
  }, [originalUrl, settings, targetDimensions]);

  // Terminal background logic
  const colorsTheme = useMemo(() => {
    let text = "#ffffff";
    let bg = "#121212";

    if (settings.colorOption === "green") text = "#39ff14";
    else if (settings.colorOption === "amber") text = "#ffb000";
    else if (settings.colorOption === "blue") text = "#00e5ff";
    else if (settings.colorOption === "custom") text = settings.customColor;
    else if (settings.colorOption === "bw") text = settings.bgOption === "white" ? "#000000" : "#ffffff";

    if (settings.bgOption === "black") bg = "#000000";
    else if (settings.bgOption === "white") bg = "#ffffff";
    else if (settings.bgOption === "transparent") bg = "transparent";
    else if (settings.bgOption === "custom") bg = settings.customBg;
    else if (settings.bgOption === "terminal") {
      if (settings.colorOption === "green") bg = "#081408";
      else if (settings.colorOption === "amber") bg = "#140c02";
      else if (settings.colorOption === "blue") bg = "#020b14";
      else bg = "#121212";
    }

    return { text, bg };
  }, [settings.colorOption, settings.bgOption, settings.customColor, settings.customBg]);

  // Favorite character preset managers
  const handleAddFavorite = () => {
    if (settings.customChars && !favorites.includes(settings.customChars)) {
      const next = [...favorites, settings.customChars];
      setFavorites(next);
      localStorage.setItem("bt_ascii_favorites", JSON.stringify(next));
    }
  };

  const handleSelectFavorite = (fav) => {
    updateSettings({ charDensity: "Custom", customChars: fav });
  };

  const handleRemoveFavorite = (fav) => {
    const next = favorites.filter((item) => item !== fav);
    setFavorites(next);
    localStorage.setItem("bt_ascii_favorites", JSON.stringify(next));
  };

  const updateFontSize = (size) => {
    setFontSize(size);
    try {
      localStorage.setItem("bt_ascii_font_size", size.toString());
    } catch (e) {}
  };

  // Search details
  const matchCount = useMemo(() => {
    if (!settings.searchQuery || !asciiText) return 0;
    let count = 0;
    let pos = asciiText.indexOf(settings.searchQuery);
    while (pos !== -1) {
      count++;
      pos = asciiText.indexOf(settings.searchQuery, pos + settings.searchQuery.length);
    }
    return count;
  }, [asciiText, settings.searchQuery]);

  // Copy controllers
  const copyToClipboard = (type) => {
    if (!asciiText) return;
    let text = "";
    if (type === "txt") {
      text = asciiText;
    } else if (type === "markdown") {
      text = `\`\`\`\n${asciiText}\`\`\``;
    } else if (type === "html") {
      const { w, h } = targetDimensions;
      text = exportToHTML(asciiText, colorsGrid, w, h, settings);
    }
    navigator.clipboard.writeText(text);
  };

  // File downloads
  const handleDownload = (format) => {
    if (!asciiText) return;
    setLastExportFormat(format);
    localStorage.setItem("bt_ascii_last_format", format);

    const { w, h } = targetDimensions;
    let mimeType = "text/plain";
    let fileExtension = "txt";
    let content = "";

    if (format === "txt") {
      content = asciiText;
    } else if (format === "markdown") {
      content = `\`\`\`\n${asciiText}\`\`\``;
      fileExtension = "md";
    } else if (format === "html") {
      content = exportToHTML(asciiText, colorsGrid, w, h, settings);
      mimeType = "text/html";
      fileExtension = "html";
    } else if (format === "svg") {
      content = exportToSVG(asciiText, colorsGrid, w, h, settings);
      mimeType = "image/svg+xml";
      fileExtension = "svg";
    } else if (format === "png") {
      downloadPNG();
      return;
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ascii-art-${Date.now()}.${fileExtension}`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const downloadPNG = () => {
    const { w, h } = targetDimensions;
    const fontHeight = 14;
    const fontWidth = 8.4;
    const canvas = document.createElement("canvas");
    canvas.width = w * fontWidth + 20;
    canvas.height = h * fontHeight + 20;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = colorsTheme.bg === "transparent" ? "#000000" : colorsTheme.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${fontHeight}px Courier New, monospace`;
    ctx.textBaseline = "top";

    const lines = asciiText.split("\n");
    for (let r = 0; r < h; r++) {
      const line = lines[r] || "";
      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (settings.colorOption === "original") {
          const colorIdx = r * w + c;
          ctx.fillStyle = colorsGrid[colorIdx] || colorsTheme.text;
        } else {
          ctx.fillStyle = colorsTheme.text;
        }
        ctx.fillText(char, 10 + c * fontWidth, 10 + r * fontHeight);
      }
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `ascii-art-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
    }, "image/png");
  };

  // Generate SVG code helper
  const exportToSVG = (ascii, colors, width, height, settings) => {
    const charWidth = 8.5;
    const charHeight = 14;
    const svgWidth = width * charWidth + 20;
    const svgHeight = height * charHeight + 20;
    let bg = colorsTheme.bg;
    if (bg === "transparent") bg = "none";

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">`;
    if (bg !== "none") {
      svgContent += `<rect width="100%" height="100%" fill="${bg}" />`;
    }
    svgContent += `<g font-family="Courier New, monospace" font-size="14" xml:space="preserve">`;

    const lines = ascii.split("\n");
    for (let r = 0; r < height; r++) {
      const line = lines[r] || "";
      const yPos = 10 + (r + 0.8) * charHeight;

      if (settings.colorOption === "original") {
        let currentSpan = "";
        let currentColor = "";

        for (let c = 0; c < line.length; c++) {
          const colorIdx = r * width + c;
          const color = colors[colorIdx] || colorsTheme.text;

          if (color !== currentColor) {
            if (currentSpan) {
              svgContent += `<text x="${10 + (c - currentSpan.length) * charWidth}" y="${yPos}" fill="${currentColor}">${escapeXML(currentSpan)}</text>`;
            }
            currentSpan = line[c];
            currentColor = color;
          } else {
            currentSpan += line[c];
          }
        }
        if (currentSpan) {
          svgContent += `<text x="${10 + (line.length - currentSpan.length) * charWidth}" y="${yPos}" fill="${currentColor}">${escapeXML(currentSpan)}</text>`;
        }
      } else {
        svgContent += `<text x="10" y="${yPos}" fill="${colorsTheme.text}">${escapeXML(line)}</text>`;
      }
    }
    svgContent += `</g></svg>`;
    return svgContent;
  };

  const escapeXML = (str) => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  // Generate HTML code helper
  const exportToHTML = (ascii, colors, width, height, settings) => {
    let bg = colorsTheme.bg;
    if (bg === "transparent") bg = "#121212";

    let textFill = colorsTheme.text;

    let bodyStyle = `background-color: ${bg}; color: ${textFill}; font-family: 'Courier New', Courier, monospace; font-size: 12px; line-height: 1.1; letter-spacing: -0.05em; padding: 20px; margin: 0; overflow: auto; white-space: pre;`;

    let htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Image to ASCII Art</title>
  <style>
    body { ${bodyStyle} }
  </style>
</head>
<body>
<pre>`;

    const lines = ascii.split("\n");
    for (let r = 0; r < height; r++) {
      const line = lines[r] || "";
      if (settings.colorOption === "original") {
        let currentSpan = "";
        let currentColor = "";

        for (let c = 0; c < line.length; c++) {
          const colorIdx = r * width + c;
          const color = colors[colorIdx] || textFill;

          if (color !== currentColor) {
            if (currentSpan) {
              htmlContent += `<span style="color: ${currentColor}">${escapeHTML(currentSpan)}</span>`;
            }
            currentSpan = line[c];
            currentColor = color;
          } else {
            currentSpan += line[c];
          }
        }
        if (currentSpan) {
          htmlContent += `<span style="color: ${currentColor}">${escapeHTML(currentSpan)}</span>`;
        }
        htmlContent += "\n";
      } else {
        htmlContent += escapeHTML(line) + "\n";
      }
    }

    htmlContent += `</pre>
</body>
</html>`;
    return htmlContent;
  };

  const escapeHTML = (str) => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  };

  // Live render split preview line highlighter helper
  const renderASCIIWithHighlights = () => {
    if (!asciiText) return null;
    const lines = asciiText.split("\n");
    const { w, h } = targetDimensions;

    return lines.map((line, rIndex) => {
      if (rIndex >= h) return null;

      const lineElements = [];
      const query = settings.searchQuery.toLowerCase();
      const hasQuery = query && line.toLowerCase().includes(query);

      if (settings.colorOption === "original" && colorsGrid.length > 0) {
        if (hasQuery) {
          for (let cIndex = 0; cIndex < line.length; cIndex++) {
            const char = line[cIndex];
            const colorIdx = rIndex * w + cIndex;
            const color = colorsGrid[colorIdx] || colorsTheme.text;
            const isMatch = query && line.substring(cIndex, cIndex + query.length).toLowerCase() === query;

            if (isMatch) {
              for (let k = 0; k < query.length; k++) {
                const innerChar = line[cIndex + k];
                const innerColorIdx = rIndex * w + (cIndex + k);
                const innerColor = colorsGrid[innerColorIdx] || colorsTheme.text;
                lineElements.push(
                  <mark
                    key={`${cIndex + k}`}
                    className="bg-yellow-300 text-black font-bold outline outline-1 outline-yellow-600 px-[0.5px] select-all"
                  >
                    {innerChar}
                  </mark>
                );
              }
              cIndex += query.length - 1;
            } else {
              lineElements.push(
                <span key={cIndex} style={{ color }}>
                  {char}
                </span>
              );
            }
          }
        } else {
          for (let cIndex = 0; cIndex < line.length; cIndex++) {
            const char = line[cIndex];
            const colorIdx = rIndex * w + cIndex;
            const color = colorsGrid[colorIdx] || colorsTheme.text;
            lineElements.push(
              <span key={cIndex} style={{ color }}>
                {char}
              </span>
            );
          }
        }
      } else {
        if (hasQuery) {
          let pos = 0;
          let idx = line.toLowerCase().indexOf(query);
          while (idx !== -1) {
            lineElements.push(<span key={`pre-${pos}`}>{line.substring(pos, idx)}</span>);
            lineElements.push(
              <mark
                key={`match-${idx}`}
                className="bg-yellow-300 text-black font-bold outline outline-1 outline-yellow-600 px-[0.5px] select-all"
              >
                {line.substring(idx, idx + query.length)}
              </mark>
            );
            pos = idx + query.length;
            idx = line.toLowerCase().indexOf(query, pos);
          }
          if (pos < line.length) {
            lineElements.push(<span key={`post-${pos}`}>{line.substring(pos)}</span>);
          }
        } else {
          lineElements.push(<span key="full">{line}</span>);
        }
      }

      return (
        <div key={rIndex} className="flex leading-none tracking-normal whitespace-pre min-w-max">
          {settings.showLineNumbers && (
            <span className="text-[10px] text-slate-500 pr-3 border-r border-slate-800 select-none text-right w-12 shrink-0 font-mono">
              {rIndex + 1}
            </span>
          )}
          <span style={{ color: settings.colorOption === "original" ? undefined : colorsTheme.text }} className={settings.showLineNumbers ? "pl-3" : ""}>
            {lineElements.length > 0 ? lineElements : " "}
          </span>
        </div>
      );
    });
  };

  const triggerFilePicker = () => fileInputRef.current?.click();

  // Preset definitions
  const presetOptions = Object.keys(CHARACTER_PRESETS).map((key) => ({
    value: key,
    label: key,
  }));
  presetOptions.push({ value: "Custom", label: "Custom Characters" });

  const colorOptions = [
    { value: "original", label: "Original Colors" },
    { value: "bw", label: "Black & White" },
    { value: "green", label: "Neon Green Terminal" },
    { value: "amber", label: "Amber Monitor" },
    { value: "blue", label: "Cyan Terminal" },
    { value: "custom", label: "Custom Text Color..." },
  ];

  const bgOptions = [
    { value: "terminal", label: "Terminal Theme" },
    { value: "black", label: "Solid Black" },
    { value: "white", label: "Solid White" },
    { value: "transparent", label: "Transparent Grid" },
    { value: "custom", label: "Custom BG Color..." },
  ];

  const sizeOptions = [
    { value: "small", label: "Small (60 columns)" },
    { value: "medium", label: "Medium (100 columns)" },
    { value: "large", label: "Large (150 columns)" },
    { value: "custom", label: "Custom Grid..." },
  ];

  const renderTerminal = (containerClass) => {
    return (
      <div className={`flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm ${containerClass}`}>
        {/* Terminal Header */}
        <div className="flex items-center justify-between bg-slate-50 px-4 py-3 border-b border-slate-200 select-none shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] hover:opacity-85 cursor-pointer" onClick={() => setIsFullscreen(false)} />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] hover:opacity-85 cursor-pointer" onClick={() => setIsFullscreen(true)} />
          </div>
          <span className="text-[11px] font-sans font-bold text-slate-600">terminal-art.txt</span>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Open Fullscreen"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3.5 w-3.5">
              {isFullscreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3 3m12 6V4.5m0 4.5h4.5m-4.5 0l6-6m-6 15v4.5m0-4.5h4.5m-4.5 0l6 6m-9-6v4.5M9 15H4.5m4.5 0l-6 6" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m-11.25 11.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 5.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
              )}
            </svg>
          </button>
        </div>

        {/* Search Bar Widget */}
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200/80 flex items-center justify-between gap-3 select-none">
          <div className="relative flex-1 max-w-xs flex items-center">
            <input
              type="text"
              value={settings.searchQuery}
              onChange={(e) => updateSettings({ searchQuery: e.target.value })}
              placeholder="Search characters..."
              className="bg-white border border-slate-200 text-[10px] font-mono text-slate-700 pl-7 pr-8 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 w-full transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="absolute left-2.5 h-3 w-3 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
            {settings.searchQuery && (
              <button
                type="button"
                onClick={() => updateSettings({ searchQuery: "" })}
                className="absolute right-2 text-slate-400 hover:text-slate-600 text-[10px] font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
          {settings.searchQuery && (
            <span className="text-[9px] font-mono font-bold text-orange-700 bg-orange-50 border border-orange-200/80 px-2 py-0.5 rounded-full shadow-sm shrink-0">
              {matchCount} matches
            </span>
          )}
        </div>

        {/* Monospace Output Pre container */}
        <div
          className={`p-4 font-mono overflow-auto flex-1 select-all relative ${
            colorsTheme.bg === "transparent" ? "bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:12px_12px] bg-slate-50" : ""
          }`}
          style={{
            backgroundColor: colorsTheme.bg !== "transparent" ? colorsTheme.bg : undefined,
            fontSize: `${fontSize}px`,
            lineHeight: "1.1",
            letterSpacing: "-0.05em",
          }}
        >
          {/* Terminal neon glow overlay */}
          {settings.colorOption !== "original" && settings.colorOption !== "bw" && (
            <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-color-dodge bg-gradient-to-b from-transparent to-black" />
          )}
          {renderASCIIWithHighlights()}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-white shadow-xl rounded-3xl p-5 sm:p-8 w-full max-w-7xl border border-slate-200/80 flex flex-col gap-6">
        
        {/* Header Hero Section */}
        <div className="flex flex-col gap-2 items-center text-center max-w-2xl mx-auto pb-4 border-b border-slate-100 w-full">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Image to ASCII / Terminal Art
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Convert images into beautiful ASCII and terminal art instantly. Everything runs locally in your browser for 100% privacy-first processing.
          </p>
          {!originalUrl && (
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <button
                type="button"
                onClick={triggerFilePicker}
                className="bg-slate-900 border border-slate-900 text-white py-2.5 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-md"
              >
                Upload Image
              </button>
              <button
                type="button"
                onClick={loadDemoImage}
                className="bg-white border border-slate-300 text-slate-700 py-2.5 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm"
              >
                Try Demo Image
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpg, image/jpeg, image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-500 shrink-0">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* WORKSPACE AREA */}
        {!originalUrl ? (
          <div
            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={triggerFilePicker}
            className={`rounded-2xl border-2 border-dashed p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 min-h-[300px] ${
              isDragging ? "border-orange-500 bg-orange-50/50 scale-[0.99]" : "border-slate-300 bg-slate-50 hover:bg-slate-100/50 hover:border-slate-400"
            }`}
          >
            <div className="h-16 w-16 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7 text-slate-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">Drag & drop your image here</p>
              <p className="text-sm text-slate-500 mt-1">or click to browse from device, or paste (Ctrl+V)</p>
            </div>
            <div className="text-xs text-slate-400 font-semibold px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm mt-2">
              PNG, JPG, JPEG, WEBP up to 25MB
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Top Workspace Header (Actions and Info Stats) */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Active Image</span>
                  <span className="font-bold text-slate-700 truncate max-w-[200px]" title={file?.name}>{file?.name || "image_file.png"}</span>
                </div>
                <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                <div className="flex flex-col">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Resolution</span>
                  <span className="font-bold text-slate-700">{imgStats.width} × {imgStats.height}px ({imgStats.aspect})</span>
                </div>
                <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                <div className="flex flex-col">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Grid Output</span>
                  <span className="font-bold text-slate-700">{targetDimensions.w} × {targetDimensions.h} ({targetDimensions.w * targetDimensions.h} chars)</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={triggerFilePicker}
                  className="flex-1 md:flex-none border border-slate-300 text-slate-700 bg-white py-2 px-4 rounded-xl font-semibold text-xs hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-slate-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  New Image
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="flex-1 md:flex-none border border-red-200 text-red-600 bg-white py-2 px-4 rounded-xl font-semibold text-xs hover:bg-red-50/50 hover:text-red-700 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Reset
                </button>
              </div>
            </div>

            {/* Hidden image hook for loading and analytics */}
            <img
              ref={imgRef}
              src={originalUrl}
              alt="Workspace load element"
              className="hidden"
              onLoad={onImageLoad}
            />

            {/* LOADING SEQUENCE ANIMATION */}
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center p-12 border border-slate-200 rounded-2xl bg-slate-50 gap-6 min-h-[400px] w-full">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-orange-500 rounded-full animate-spin"></div>
                </div>
                
                <div className="w-full max-w-sm flex flex-col gap-3">
                  {[
                    { id: "analyzing", label: "Analyzing Image..." },
                    { id: "mapping", label: "Building Character Map..." },
                    { id: "generating", label: "Generating ASCII..." },
                    { id: "rendering", label: "Rendering Preview..." },
                  ].map((stage, i) => {
                    const stages = ["analyzing", "mapping", "generating", "rendering"];
                    const currentIdx = stages.indexOf(loadingStage);
                    const isDone = i < currentIdx;
                    const isActive = stages[i] === loadingStage;

                    return (
                      <div key={stage.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <span className={`text-xs font-bold font-mono ${isActive ? "text-orange-600" : isDone ? "text-slate-800" : "text-slate-400"}`}>
                          {stage.label}
                        </span>
                        <span className="flex items-center justify-center w-5 h-5">
                          {isDone ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" className="w-4 h-4 text-green-500">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          ) : isActive ? (
                            <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-orange-500 rounded-full animate-spin"></div>
                          ) : (
                            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* PREVIEW CONTAINER (lg:col-span-8) */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                  
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-sm">
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200/50">
                      <button
                        type="button"
                        onClick={() => updateSettings({ layoutMode: "side-by-side" })}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          settings.layoutMode === "side-by-side"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Side by Side
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSettings({ layoutMode: "top-bottom" })}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          settings.layoutMode === "top-bottom"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Top / Bottom
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSettings({ layoutMode: "ascii-only" })}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          settings.layoutMode === "ascii-only"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        ASCII Only
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600">
                      {/* Character Font Size adjustment */}
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase select-none">Font Size</span>
                        <input
                          type="range"
                          min="4"
                          max="16"
                          value={fontSize}
                          onChange={(e) => updateFontSize(parseInt(e.target.value))}
                          className="w-16 sm:w-24 accent-slate-900 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                        <span className="font-mono text-[10px] text-slate-700 w-6 text-right select-none">{fontSize}px</span>
                      </div>

                      <label className="flex items-center gap-2 select-none cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-all">
                        <input
                          type="checkbox"
                          checked={settings.showLineNumbers}
                          onChange={(e) => updateSettings({ showLineNumbers: e.target.checked })}
                          className="rounded text-orange-500 focus:ring-orange-500 cursor-pointer h-4 w-4 border-slate-300"
                        />
                        Line Numbers
                      </label>
                    </div>
                  </div>

                  {/* Dynamic Split Screen View Layouts */}
                  {settings.layoutMode === "side-by-side" && (
                    <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4">
                      
                      {/* Left: Original Preview Card */}
                      <div className="flex-1 w-full flex flex-col gap-2 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 select-none">
                          <span>Original Preview</span>
                          <span>Image Source</span>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 min-h-[350px] flex items-center justify-center border border-slate-100 overflow-hidden">
                          <img
                            src={originalUrl}
                            alt="Original preview source"
                            className="max-h-[380px] w-full object-contain rounded"
                          />
                        </div>
                      </div>
                      
                      {/* Flow Arrow */}
                      <div className="flex flex-col items-center justify-center text-slate-300 font-bold shrink-0 py-2 lg:py-0 select-none">
                        <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-full shadow-sm hover:text-slate-400 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="h-5 w-5 rotate-90 lg:rotate-0 text-orange-500 animate-pulse">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </div>
                      </div>

                      {/* Right: ASCII Result Card */}
                      {renderTerminal("flex-1 w-full min-h-[350px]")}

                    </div>
                  )}

                  {settings.layoutMode === "top-bottom" && (
                    <div className="flex flex-col items-center gap-4">
                      
                      {/* Top: Original Image */}
                      <div className="w-full flex flex-col gap-2 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 select-none">
                          <span>Original Preview</span>
                          <span>Image Source</span>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 min-h-[220px] flex items-center justify-center border border-slate-100 overflow-hidden">
                          <img
                            src={originalUrl}
                            alt="Original preview source"
                            className="max-h-[260px] w-full object-contain rounded"
                          />
                        </div>
                      </div>

                      {/* Flow Arrow */}
                      <div className="flex items-center justify-center text-slate-300 font-bold shrink-0 select-none">
                        <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-full shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="h-5 w-5 text-orange-500 animate-pulse">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                          </svg>
                        </div>
                      </div>

                      {/* Bottom: ASCII Terminal */}
                      {renderTerminal("w-full min-h-[350px]")}

                    </div>
                  )}

                  {settings.layoutMode === "ascii-only" && renderTerminal("w-full min-h-[420px]")}

                  {/* FULLSCREEN PREVIEW OVERLAY */}
                  {isFullscreen && (
                    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col font-sans p-4 sm:p-6 md:p-8 animate-fadeIn">
                      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden max-w-7xl mx-auto w-full">
                        {/* Fullscreen Header */}
                        <div className="flex items-center justify-between bg-slate-50 px-4 py-3.5 border-b border-slate-200 select-none shrink-0">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsFullscreen(false)}
                              className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] flex items-center justify-center hover:opacity-85 cursor-pointer"
                              title="Close [Esc]"
                            />
                            <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e]" />
                            <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f]" />
                          </div>
                          <span className="text-[11px] font-sans font-bold text-slate-600 tracking-wider uppercase">terminal-art.txt (Fullscreen Preview)</span>
                          <button
                            type="button"
                            onClick={() => setIsFullscreen(false)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold px-3 py-1.5 rounded-lg text-[10px] transition-colors cursor-pointer select-none"
                          >
                            Close [Esc]
                          </button>
                        </div>

                        {/* Fullscreen search bar widget */}
                        <div className="bg-slate-50/50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between gap-3 select-none">
                          <div className="relative flex-1 max-w-sm flex items-center">
                            <input
                              type="text"
                              value={settings.searchQuery}
                              onChange={(e) => updateSettings({ searchQuery: e.target.value })}
                              placeholder="Type query to filter matching characters..."
                              className="bg-white border border-slate-200 text-xs font-mono text-slate-700 pl-8 pr-8 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 w-full"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="absolute left-2.5 h-3.5 w-3.5 text-slate-400">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                            </svg>
                          </div>
                          {settings.searchQuery && (
                            <span className="text-[10px] font-mono font-bold text-orange-700 bg-orange-50 border border-orange-200/80 px-2.5 py-1 rounded-full shadow-sm">
                              {matchCount} matches found
                            </span>
                          )}
                        </div>

                        {/* Fullscreen Output Pre */}
                        <div
                          className={`p-6 overflow-auto flex-1 select-all relative font-mono ${
                            colorsTheme.bg === "transparent" ? "bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:12px_12px] bg-slate-50" : ""
                          }`}
                          style={{
                            backgroundColor: colorsTheme.bg !== "transparent" ? colorsTheme.bg : undefined,
                            fontSize: "12px",
                            lineHeight: "1.1",
                            letterSpacing: "-0.05em",
                          }}
                        >
                          {/* Scan line neon glow effect */}
                          {settings.colorOption !== "original" && settings.colorOption !== "bw" && (
                            <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-color-dodge bg-gradient-to-b from-transparent to-black" />
                          )}
                          {renderASCIIWithHighlights()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Favorite custom character sequences panel */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 pb-2 border-b border-slate-100 select-none">
                      Favorite Character Sets
                    </h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={settings.customChars}
                          onChange={(e) => updateSettings({ charDensity: "Custom", customChars: e.target.value })}
                          placeholder="e.g. @#%*+=-:. "
                          className="flex-1 p-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono bg-slate-50"
                        />
                        <button
                          type="button"
                          onClick={handleAddFavorite}
                          className="bg-slate-900 border border-slate-900 text-white text-xs font-bold py-2 px-5 rounded-xl hover:bg-slate-800 transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        >
                          Save
                        </button>
                      </div>

                      {favorites.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {favorites.map((fav, i) => (
                            <div key={i} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 pl-3 pr-1 py-1 rounded-full text-xs font-mono shadow-sm">
                              <span
                                onClick={() => handleSelectFavorite(fav)}
                                className="cursor-pointer font-bold text-slate-600 hover:text-orange-600 truncate max-w-[150px]"
                                title="Click to use this sequence"
                              >
                                {fav}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFavorite(fav)}
                                className="p-0.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-red-500 transition cursor-pointer"
                                aria-label="Remove favorite"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="h-3 w-3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 select-none">Save custom character sets to access them quickly here.</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* CONTROLS TABBED SIDEBAR (lg:col-span-4) */}
                <div className="lg:col-span-4 flex flex-col gap-4 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
                  
                  {/* Tabs Selector Navigation */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 select-none shrink-0 overflow-x-auto gap-2">
                    {[
                      { id: "filters", label: "Filters" },
                      { id: "grid", label: "Grid Size" },
                      { id: "styling", label: "Theme" },
                      { id: "export", label: "Export" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-2 text-xs font-bold transition-all relative cursor-pointer px-1 shrink-0 ${
                          activeTab === tab.id
                            ? "text-slate-900 border-b-2 border-orange-500"
                            : "text-slate-400 hover:text-slate-700"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Active Panel Content */}
                  <div className="flex flex-col gap-4 min-h-[380px]">
                    
                    {/* TAB 1: FILTERS & ADJUSTMENTS */}
                    {activeTab === "filters" && (
                      <div className="flex flex-col gap-4 animate-fadeIn">
                        
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-xs font-bold text-slate-600">
                            <span>Brightness</span>
                            <span className="font-mono text-slate-500">{settings.brightness > 0 ? `+${settings.brightness}` : settings.brightness}</span>
                          </div>
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            value={settings.brightness}
                            onChange={(e) => updateSettings({ brightness: parseInt(e.target.value) })}
                            className="w-full accent-slate-900 cursor-pointer"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-xs font-bold text-slate-600">
                            <span>Contrast</span>
                            <span className="font-mono text-slate-500">{settings.contrast > 0 ? `+${settings.contrast}` : settings.contrast}</span>
                          </div>
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            value={settings.contrast}
                            onChange={(e) => updateSettings({ contrast: parseInt(e.target.value) })}
                            className="w-full accent-slate-900 cursor-pointer"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-xs font-bold text-slate-600">
                            <span>Gamma Correction</span>
                            <span className="font-mono text-slate-500">{settings.gamma.toFixed(2)}x</span>
                          </div>
                          <input
                            type="range"
                            min="0.2"
                            max="3.0"
                            step="0.05"
                            value={settings.gamma}
                            onChange={(e) => updateSettings({ gamma: parseFloat(e.target.value) })}
                            className="w-full accent-slate-900 cursor-pointer"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-xs font-bold text-slate-600">
                            <span>Sharpness Filter</span>
                            <span className="font-mono text-slate-500">{settings.sharpness}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={settings.sharpness}
                            onChange={(e) => updateSettings({ sharpness: parseInt(e.target.value) })}
                            className="w-full accent-slate-900 cursor-pointer"
                          />
                        </div>

                        {/* Adjustments checkboxes */}
                        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                          <label className="flex items-center gap-2.5 text-xs font-bold text-slate-600 select-none cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.invert}
                              onChange={(e) => updateSettings({ invert: e.target.checked })}
                              className="rounded text-orange-500 focus:ring-orange-500 cursor-pointer h-4 w-4 border-slate-300"
                            />
                            Invert Colors
                          </label>
                          <label className="flex items-center gap-2.5 text-xs font-bold text-slate-600 select-none cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.highContrast}
                              onChange={(e) => updateSettings({ highContrast: e.target.checked })}
                              className="rounded text-orange-500 focus:ring-orange-500 cursor-pointer h-4 w-4 border-slate-300"
                            />
                            High Contrast
                          </label>
                          <label className="flex items-center gap-2.5 text-xs font-bold text-slate-600 select-none cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.edgeDetection}
                              onChange={(e) => updateSettings({ edgeDetection: e.target.checked })}
                              className="rounded text-orange-500 focus:ring-orange-500 cursor-pointer h-4 w-4 border-slate-300"
                            />
                            Edge Detection
                          </label>
                          <label className="flex items-center gap-2.5 text-xs font-bold text-slate-600 select-none cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.sketchMode}
                              onChange={(e) => updateSettings({ sketchMode: e.target.checked })}
                              className="rounded text-orange-500 focus:ring-orange-500 cursor-pointer h-4 w-4 border-slate-300"
                            />
                            Sketch Mode
                          </label>
                        </div>

                        <div className="border-t border-slate-100 pt-3">
                          <label className="flex items-center gap-2.5 text-xs font-bold text-slate-600 select-none cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.pixelArt}
                              onChange={(e) => updateSettings({ pixelArt: e.target.checked })}
                              className="rounded text-orange-500 focus:ring-orange-500 cursor-pointer h-4 w-4 border-slate-300"
                            />
                            Pixel Block Mode
                          </label>
                          <p className="text-[10px] text-slate-400 mt-1 select-none font-medium">Overrides character mappings to construct art with solid grid blocks.</p>
                        </div>

                      </div>
                    )}

                    {/* TAB 2: GRID & SIZING */}
                    {activeTab === "grid" && (
                      <div className="flex flex-col gap-4 animate-fadeIn">
                        
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Output Size Preset</label>
                          <ThemedDropdown
                            ariaLabel="Grid output size selection"
                            value={settings.outputSize}
                            options={sizeOptions}
                            onChange={(val) => updateSettings({ outputSize: val })}
                          />
                        </div>

                        {settings.outputSize === "custom" && (
                          <div className="flex flex-col gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                            
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between text-xs font-bold text-slate-600">
                                <span>Custom Width</span>
                                <span className="font-mono text-slate-500">{settings.customWidth} cols</span>
                              </div>
                              <input
                                type="range"
                                min="20"
                                max="300"
                                value={settings.customWidth}
                                onChange={(e) => updateSettings({ customWidth: parseInt(e.target.value) })}
                                className="w-full accent-slate-900 cursor-pointer"
                              />
                            </div>

                            {!settings.lockAspectRatio && (
                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-xs font-bold text-slate-600">
                                  <span>Custom Height</span>
                                  <span className="font-mono text-slate-500">{settings.customHeight} rows</span>
                                </div>
                                <input
                                  type="range"
                                  min="20"
                                  max="300"
                                  value={settings.customHeight}
                                  onChange={(e) => updateSettings({ customHeight: parseInt(e.target.value) })}
                                  className="w-full accent-slate-900 cursor-pointer"
                                />
                              </div>
                            )}

                            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 select-none cursor-pointer mt-1">
                              <input
                                type="checkbox"
                                checked={settings.lockAspectRatio}
                                onChange={(e) => updateSettings({ lockAspectRatio: e.target.checked })}
                                className="rounded text-orange-500 focus:ring-orange-500 cursor-pointer h-4 w-4 border-slate-300"
                              />
                              Lock Aspect Ratio
                            </label>
                          </div>
                        )}

                        <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Character Presets Map</label>
                          <ThemedDropdown
                            ariaLabel="Character Presets Mapping options"
                            value={settings.charDensity}
                            options={presetOptions}
                            onChange={(val) => updateSettings({ charDensity: val })}
                          />
                        </div>

                        {settings.charDensity === "Custom" && (
                          <div className="flex flex-col gap-1 bg-slate-50 p-3 rounded-xl border border-slate-200/60 animate-fadeIn">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Custom Characters Sequence</label>
                            <input
                              type="text"
                              value={settings.customChars}
                              onChange={(e) => updateSettings({ customChars: e.target.value })}
                              className="p-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                              placeholder="dense to light, e.g. @#%*+=-:. "
                            />
                          </div>
                        )}

                        <div className="flex flex-col gap-3 border-t border-slate-100 pt-3">
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs font-bold text-slate-600">
                              <span>Character Width scale</span>
                              <span className="font-mono text-slate-500">{settings.charWidthScale.toFixed(2)}x</span>
                            </div>
                            <input
                              type="range"
                              min="0.5"
                              max="2.0"
                              step="0.05"
                              value={settings.charWidthScale}
                              onChange={(e) => updateSettings({ charWidthScale: parseFloat(e.target.value) })}
                              className="w-full accent-slate-900 cursor-pointer"
                            />
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs font-bold text-slate-600">
                              <span>Character Height scale</span>
                              <span className="font-mono text-slate-500">{settings.charHeightScale.toFixed(2)}x</span>
                            </div>
                            <input
                              type="range"
                              min="0.5"
                              max="2.0"
                              step="0.05"
                              value={settings.charHeightScale}
                              onChange={(e) => updateSettings({ charHeightScale: parseFloat(e.target.value) })}
                              className="w-full accent-slate-900 cursor-pointer"
                            />
                          </div>
                        </div>

                      </div>
                    )}

                    {/* TAB 3: STYLING & COLORS */}
                    {activeTab === "styling" && (
                      <div className="flex flex-col gap-4 animate-fadeIn">
                        
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Text Color Style</label>
                          <ThemedDropdown
                            ariaLabel="Text color option selectors"
                            value={settings.colorOption}
                            options={colorOptions}
                            onChange={(val) => updateSettings({ colorOption: val })}
                          />
                        </div>

                        {settings.colorOption === "custom" && (
                          <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 animate-fadeIn">
                            <span className="text-xs font-bold text-slate-600">Select Custom Color</span>
                            <input
                              type="color"
                              value={settings.customColor}
                              onChange={(e) => updateSettings({ customColor: e.target.value })}
                              className="w-10 h-7 rounded border border-slate-300 cursor-pointer shadow-sm"
                            />
                          </div>
                        )}

                        <div className="flex flex-col gap-1 border-t border-slate-100 pt-3">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Background Style</label>
                          <ThemedDropdown
                            ariaLabel="Background color selection list"
                            value={settings.bgOption}
                            options={bgOptions}
                            onChange={(val) => updateSettings({ bgOption: val })}
                          />
                        </div>

                        {settings.bgOption === "custom" && (
                          <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 animate-fadeIn">
                            <span className="text-xs font-bold text-slate-600">Select Custom Color</span>
                            <input
                              type="color"
                              value={settings.customBg}
                              onChange={(e) => updateSettings({ customBg: e.target.value })}
                              className="w-10 h-7 rounded border border-slate-300 cursor-pointer shadow-sm"
                            />
                          </div>
                        )}

                        <div className="border-t border-slate-100 pt-3 flex flex-col gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60 select-none">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Swatch Preview</span>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full border border-slate-300 shadow-sm"
                              style={{ backgroundColor: colorsTheme.bg === "transparent" ? "#000" : colorsTheme.bg }}
                              title="Background swatch"
                            />
                            <span className="text-slate-400 text-xs">➔</span>
                            <span
                              className="font-mono text-xs font-bold px-2 py-0.5 rounded"
                              style={{
                                color: settings.colorOption === "original" ? "#ff416c" : colorsTheme.text,
                                backgroundColor: colorsTheme.bg === "transparent" ? "#000" : colorsTheme.bg
                              }}
                            >
                              {settings.colorOption === "original" ? "RGB Colors" : "Terminal Text"}
                            </span>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* TAB 4: COPY & EXPORT */}
                    {activeTab === "export" && (
                      <div className="flex flex-col gap-4 animate-fadeIn">
                        
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider select-none">Copy Options</label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => copyToClipboard("txt")}
                              className="border border-slate-200 text-slate-700 bg-white py-3 px-1 text-[10px] font-bold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer flex flex-col items-center gap-1.5 shadow-sm"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4 text-slate-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-3a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.375c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125v3.375m0 0h-.008v-.008H12m-.375 0a.375 0 11-.75 0 .375 0 01.75 0zm0 0v5.25" />
                              </svg>
                              Copy Plain
                            </button>
                            <button
                              type="button"
                              onClick={() => copyToClipboard("html")}
                              className="border border-slate-200 text-slate-700 bg-white py-3 px-1 text-[10px] font-bold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer flex flex-col items-center gap-1.5 shadow-sm"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4 text-slate-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                              </svg>
                              Copy HTML
                            </button>
                            <button
                              type="button"
                              onClick={() => copyToClipboard("markdown")}
                              className="border border-slate-200 text-slate-700 bg-white py-3 px-1 text-[10px] font-bold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer flex flex-col items-center gap-1.5 shadow-sm"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4 text-slate-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                              </svg>
                              Copy MD
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider select-none">Download Art File</label>
                          <div className="grid grid-cols-2 gap-2">
                            {["txt", "html", "svg", "png"].map((fmt) => (
                              <button
                                key={fmt}
                                type="button"
                                onClick={() => handleDownload(fmt)}
                                className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all border flex items-center justify-center gap-1.5 cursor-pointer uppercase shadow-sm ${
                                  lastExportFormat === fmt
                                    ? "bg-slate-900 border-slate-900 text-white"
                                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="h-3.5 w-3.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                                {fmt}
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}

                  </div>

                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
