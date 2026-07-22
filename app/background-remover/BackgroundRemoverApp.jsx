"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { tools } from "../tools-data";
import ThemedDropdown from "../components/ThemedDropdown";

const GRADIENTS = [
  { name: "Sunset Glow", colors: ["#ff7e5f", "#feb47b"] },
  { name: "Ocean Breeze", colors: ["#2b5876", "#4e4376"] },
  { name: "Cosmic Purple", colors: ["#f80759", "#bc4e9c"] },
  { name: "Neon Teal", colors: ["#11998e", "#38ef7d"] },
  { name: "Lemon Sun", colors: ["#f9d423", "#ff4e50"] },
  { name: "Pink Dream", colors: ["#eecda3", "#ef629f"] }
];

const MAGIC_BACKDROPS = [
  { id: "studio", name: "White Studio", desc: "Professional studio lighting backdrop" },
  { id: "office", name: "Modern Office", desc: "Blurred corporate office interior" },
  { id: "abstract", name: "Abstract Bokeh", desc: "Artistic neon light bubbles" }
];

export default function BackgroundRemoverApp() {
  const removeBackgroundRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Core Image States
  const [imageFile, setImageFile] = useState(null);
  const [originalSrc, setOriginalSrc] = useState("");
  const [foregroundSrc, setForegroundSrc] = useState("");
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [originalSize, setOriginalSize] = useState(0);

  // Status & Progress States
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState(null);
  const [processingTime, setProcessingTime] = useState(0);

  // Background Settings
  const [bgType, setBgType] = useState("transparent"); // 'transparent' | 'solid' | 'gradient' | 'blur' | 'magic'
  const [solidColor, setSolidColor] = useState("#ffffff");
  const [gradientIndex, setGradientIndex] = useState(0);
  const [magicType, setMagicType] = useState("studio");

  // Edge & Effect Controls
  const [edgeSmoothness, setEdgeSmoothness] = useState(0); // range 0 - 10
  const [shadowSoftness, setShadowSoftness] = useState(0); // range 0 - 40
  const [shadowColor, setShadowColor] = useState("#000000");

  // Transform Controls
  const [zoom, setZoom] = useState(1.0); // range 0.5 - 2.0
  const [rotate, setRotate] = useState(0); // range -180 - 180
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Export Settings
  const [exportFormat, setExportFormat] = useState("png"); // 'png' | 'jpeg' | 'webp'
  const [exportScale, setExportScale] = useState(1.0); // 1.0 (original), 0.75 (medium), 0.5 (small)
  const [estimatedSize, setEstimatedSize] = useState(0);

  // UI States
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [loadedImages, setLoadedImages] = useState({ original: null, foreground: null });

  // Pre-load the client-side background removal library
  useEffect(() => {
    import("@imgly/background-removal")
      .then((module) => {
        removeBackgroundRef.current = module.removeBackground;
      })
      .catch((err) => {
        console.error("Failed to load background removal library", err);
      });
  }, []);

  // Handle Toast Notifications
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  // Reset all states
  const handleReset = () => {
    setImageFile(null);
    setOriginalSrc("");
    setForegroundSrc("");
    setOriginalWidth(0);
    setOriginalHeight(0);
    setOriginalSize(0);
    setIsProcessing(false);
    setProgressStep("");
    setProgressPercent(0);
    setError(null);
    setProcessingTime(0);
    setBgType("transparent");
    setSolidColor("#ffffff");
    setGradientIndex(0);
    setMagicType("studio");
    setEdgeSmoothness(0);
    setShadowSoftness(0);
    setShadowColor("#000000");
    setZoom(1.0);
    setRotate(0);
    setFlipH(false);
    setFlipV(false);
    setExportFormat("png");
    setExportScale(1.0);
    setEstimatedSize(0);
    setSliderPos(50);
    setLoadedImages({ original: null, foreground: null });
  };

  // Load files
  const processImageFile = async (file) => {
    if (!file) return;

    // Validate type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Unsupported file format. Please upload PNG, JPG, JPEG, or WEBP.");
      return;
    }

    // Validate size (limit to 12MB for browser memory safety)
    if (file.size > 12 * 1024 * 1024) {
      setError("File is too large. Please upload an image under 12MB to prevent browser memory issues.");
      return;
    }

    handleReset();
    setImageFile(file);
    setOriginalSize(file.size);
    setError(null);

    const originalUrl = URL.createObjectURL(file);
    setOriginalSrc(originalUrl);

    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      setOriginalWidth(img.width);
      setOriginalHeight(img.height);
      setLoadedImages((prev) => ({ ...prev, original: img }));
    };
    img.src = originalUrl;

    // Run Background Removal
    await removeBackgroundInBrowser(file);
  };

  const removeBackgroundInBrowser = async (fileOrUrl) => {
    setIsProcessing(true);
    setProgressPercent(0);
    setProgressStep("Initializing AI model...");
    const startTime = performance.now();

    try {
      // Ensure library is loaded
      let removeBgFn = removeBackgroundRef.current;
      if (!removeBgFn) {
        setProgressStep("Loading secure model package...");
        const module = await import("@imgly/background-removal");
        removeBgFn = module.removeBackground;
        removeBackgroundRef.current = removeBgFn;
      }

      setProgressStep("Analyzing image subject...");
      setProgressPercent(15);

      const config = {
        progress: (key, current, total) => {
          const pct = Math.round((current / total) * 100);
          if (key === "fetch") {
            setProgressStep(`Downloading model components (${pct}%)`);
            setProgressPercent(Math.round(15 + pct * 0.25)); // Cap at 40%
          } else if (key === "compute") {
            setProgressStep(`Segmenting background pixels (${pct}%)`);
            setProgressPercent(Math.round(40 + pct * 0.55)); // Cap at 95%
          }
        }
      };

      const resultBlob = await removeBgFn(fileOrUrl, config);
      
      setProgressStep("Refining edge boundaries...");
      setProgressPercent(98);

      const foregroundUrl = URL.createObjectURL(resultBlob);
      setForegroundSrc(foregroundUrl);

      const fgImg = new Image();
      fgImg.onload = () => {
        setLoadedImages((prev) => ({ ...prev, foreground: fgImg }));
        setProgressStep("Done!");
        setProgressPercent(100);
        setIsProcessing(false);
        const endTime = performance.now();
        setProcessingTime(((endTime - startTime) / 1000).toFixed(2));
        showToast("Background removed successfully!");
      };
      fgImg.src = foregroundUrl;

    } catch (err) {
      console.error(err);
      setError("Background removal failed. Please check your network connection and try again. Large images may require more memory.");
      setIsProcessing(false);
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Paste Event Handler (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files[0]) {
        processImageFile(e.clipboardData.files[0]);
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // Try Demo Image
  const handleTryDemo = () => {
    // Standard high-quality portrait from Unsplash
    const demoUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800";
    handleReset();
    setIsProcessing(true);
    setProgressPercent(10);
    setProgressStep("Fetching demo image...");

    // Create a file mock or download it
    fetch(demoUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "demo-portrait.jpg", { type: "image/jpeg" });
        processImageFile(file);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch demo image. Please check your internet connection.");
        setIsProcessing(false);
      });
  };

  // Canvas Drawing Logic
  const drawComposition = (canvas, isExport = false, scaleFactor = 1.0) => {
    const originalImg = loadedImages.original;
    const fgImg = loadedImages.foreground;

    if (!originalImg || !fgImg) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions based on original image size and scale factor
    const canvasWidth = originalImg.width * scaleFactor;
    const canvasHeight = originalImg.height * scaleFactor;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 1. Draw Background Layer
    if (bgType === "transparent") {
      if (!isExport) {
        // Draw grid check patterns for preview
        const gridSize = 16 * scaleFactor;
        for (let y = 0; y < canvasHeight; y += gridSize) {
          for (let x = 0; x < canvasWidth; x += gridSize) {
            ctx.fillStyle = (Math.floor(x / gridSize) + Math.floor(y / gridSize)) % 2 === 0 ? "#f8fafc" : "#cbd5e1";
            ctx.fillRect(x, y, gridSize, gridSize);
          }
        }
      }
    } else if (bgType === "solid") {
      ctx.fillStyle = solidColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else if (bgType === "gradient") {
      const gradientColors = GRADIENTS[gradientIndex]?.colors || ["#ff7e5f", "#feb47b"];
      const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      grad.addColorStop(0, gradientColors[0]);
      grad.addColorStop(1, gradientColors[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else if (bgType === "blur") {
      // Draw original image blurry as background
      ctx.save();
      ctx.filter = `blur(${20 * scaleFactor}px) brightness(0.95)`;
      // Draw with slight overflow to cover edges
      ctx.drawImage(originalImg, -20 * scaleFactor, -20 * scaleFactor, canvasWidth + 40 * scaleFactor, canvasHeight + 40 * scaleFactor);
      ctx.restore();
    } else if (bgType === "magic") {
      if (magicType === "studio") {
        const grad = ctx.createRadialGradient(canvasWidth / 2, canvasHeight / 2, 0, canvasWidth / 2, canvasHeight / 2, Math.max(canvasWidth, canvasHeight) * 0.7);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.5, "#f1f5f9");
        grad.addColorStop(1, "#cbd5e1");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      } else if (magicType === "office") {
        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw soft shapes to simulate blurry office ambient
        ctx.save();
        ctx.filter = `blur(${canvasWidth * 0.1}px)`;
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.beginPath();
        ctx.moveTo(canvasWidth * 0.1, 0);
        ctx.lineTo(canvasWidth * 0.4, 0);
        ctx.lineTo(canvasWidth * 0.35, canvasHeight);
        ctx.lineTo(canvasWidth * 0.05, canvasHeight);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "rgba(251, 146, 60, 0.15)"; // Warm orange light
        ctx.beginPath();
        ctx.arc(canvasWidth * 0.8, canvasHeight * 0.2, canvasWidth * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(96, 165, 250, 0.15)"; // Cool window light
        ctx.beginPath();
        ctx.arc(canvasWidth * 0.15, canvasHeight * 0.7, canvasWidth * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        
        // Desk bar
        ctx.fillStyle = "#475569";
        ctx.fillRect(0, canvasHeight * 0.88, canvasWidth, canvasHeight * 0.12);
      } else if (magicType === "abstract") {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.save();
        ctx.filter = `blur(${canvasWidth * 0.12}px)`;

        // Neon blobs
        ctx.fillStyle = "rgba(236, 72, 153, 0.25)"; // Pink
        ctx.beginPath();
        ctx.arc(canvasWidth * 0.25, canvasHeight * 0.3, canvasWidth * 0.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(99, 102, 241, 0.25)"; // Blue Indigo
        ctx.beginPath();
        ctx.arc(canvasWidth * 0.75, canvasHeight * 0.7, canvasWidth * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(234, 179, 8, 0.18)"; // Yellow
        ctx.beginPath();
        ctx.arc(canvasWidth * 0.5, canvasHeight * 0.55, canvasWidth * 0.25, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    // 2. Draw Foreground Subject Layer with transformations
    ctx.save();
    
    // Position/Transformation setups
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale(zoom * (flipH ? -1 : 1), zoom * (flipV ? -1 : 1));
    ctx.translate(-canvasWidth / 2, -canvasHeight / 2);

    // Apply drop shadow effects
    if (shadowSoftness > 0) {
      ctx.shadowColor = shadowColor + "66"; // Adding transparency (approx 40%)
      ctx.shadowBlur = shadowSoftness * scaleFactor;
      ctx.shadowOffsetX = 5 * scaleFactor;
      ctx.shadowOffsetY = 5 * scaleFactor;
    }

    // Apply edge smoothness (subtle edge blur)
    if (edgeSmoothness > 0) {
      ctx.filter = `blur(${edgeSmoothness * 0.2 * scaleFactor}px)`;
    }

    // Draw the subject
    ctx.drawImage(fgImg, 0, 0, canvasWidth, canvasHeight);
    
    ctx.restore();
  };

  // Trigger preview draw whenever controls change
  useEffect(() => {
    if (loadedImages.original && loadedImages.foreground && canvasRef.current) {
      drawComposition(canvasRef.current, false, 1.0);
    }
  }, [
    loadedImages,
    bgType,
    solidColor,
    gradientIndex,
    magicType,
    edgeSmoothness,
    shadowSoftness,
    shadowColor,
    zoom,
    rotate,
    flipH,
    flipV
  ]);

  // Estimate Download Size
  useEffect(() => {
    if (!canvasRef.current || !loadedImages.foreground) return;
    const tempCanvas = document.createElement("canvas");
    drawComposition(tempCanvas, true, exportScale);
    
    const mimeMap = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" };
    const mime = mimeMap[exportFormat] || "image/png";
    const quality = exportFormat === "png" ? undefined : 0.88;

    tempCanvas.toBlob((blob) => {
      if (blob) {
        setEstimatedSize(blob.size);
      }
    }, mime, quality);
  }, [
    loadedImages,
    bgType,
    solidColor,
    gradientIndex,
    magicType,
    edgeSmoothness,
    shadowSoftness,
    shadowColor,
    zoom,
    rotate,
    flipH,
    flipV,
    exportFormat,
    exportScale
  ]);

  // Handle Dragging Slider
  const handleSliderMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleMouseMove = (e) => {
    if (isDraggingSlider) {
      handleSliderMove(e.clientX);
    }
  };

  const handleTouchMove = (e) => {
    if (isDraggingSlider && e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingSlider(false);
  };

  useEffect(() => {
    if (isDraggingSlider) {
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDraggingSlider]);

  // Copy Image to Clipboard
  const handleCopy = () => {
    if (!canvasRef.current || !loadedImages.foreground) return;
    
    // Create export copy
    const tempCanvas = document.createElement("canvas");
    drawComposition(tempCanvas, true, 1.0);

    tempCanvas.toBlob(async (blob) => {
      if (!blob) {
        showToast("Failed to copy image.", "error");
        return;
      }
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob
          })
        ]);
        showToast("Image copied to clipboard!");
      } catch (err) {
        console.error(err);
        showToast("Copy to clipboard is only supported in secure environments (HTTPS) with PNG.", "error");
      }
    }, "image/png");
  };

  // Download Output File
  const handleDownload = () => {
    if (!canvasRef.current || !loadedImages.foreground) return;

    const tempCanvas = document.createElement("canvas");
    drawComposition(tempCanvas, true, exportScale);

    const mimeMap = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" };
    const mime = mimeMap[exportFormat] || "image/png";
    const quality = exportFormat === "png" ? undefined : 0.90;

    tempCanvas.toBlob((blob) => {
      if (!blob) {
        showToast("Failed to export image.", "error");
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `background-removed-${Date.now()}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("Image downloaded successfully!");
    }, mime, quality);
  };

  // Helpers to Format bytes
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Reset transformations only
  const handleResetTransforms = () => {
    setZoom(1.0);
    setRotate(0);
    setFlipH(false);
    setFlipV(false);
    showToast("Image adjustments reset.");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center p-4 sm:py-8 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-6xl border border-slate-200 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col gap-2 items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Media & AI Tools</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Browser-Based Background Remover</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Remove image backgrounds instantly. 100% private. Everything happens inside your browser.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm flex justify-between items-center">
            <div>
              <span className="font-semibold">Error:</span> {error}
            </div>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900 font-bold ml-2">
              &times;
            </button>
          </div>
        )}

        {/* Toast Toast Alert */}
        {toast.message && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-sm shadow-xl flex items-center gap-2 animate-fade-in-out">
            {toast.type === "error" ? (
              <span className="w-2 h-2 rounded-full bg-red-500" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-green-500" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        {!imageFile && !isProcessing && (
          /* Empty State / Upload Area */
          <div className="flex flex-col gap-6">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-300 hover:border-orange-500 hover:bg-slate-50/50 rounded-2xl p-8 sm:p-16 flex flex-col items-center justify-center text-center transition cursor-pointer group"
              onClick={() => document.getElementById("file-input").click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    processImageFile(e.target.files[0]);
                  }
                }}
              />
              <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-4 transition group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Drag and drop your image here</h2>
              <p className="text-slate-500 text-sm max-w-sm mb-6">
                Supports PNG, JPG, JPEG, or WEBP formats up to 12MB. Or copy and paste an image directly with Ctrl + V.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  type="button"
                  className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-600 shadow-sm transition"
                >
                  Upload Image
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTryDemo();
                  }}
                  className="bg-white border border-slate-300 text-slate-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition"
                >
                  Try Demo Image
                </button>
              </div>
            </div>

            {/* Trust badge */}
            <div className="mx-auto flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4 max-w-lg text-center justify-center">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                </svg>
              </span>
              <div className="text-left text-xs sm:text-sm text-orange-800 font-medium">
                <p className="font-bold">100% Private & Browser-Based</p>
                <p className="text-orange-700/80 font-normal">Your files never leave your device. All AI model segmentation is executed offline in your browser memory.</p>
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          /* Loading State */
          <div className="flex flex-col items-center justify-center p-12 sm:p-24 border border-slate-200 rounded-2xl bg-slate-50">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
              <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{progressStep}</h3>
            <div className="w-full max-w-xs bg-slate-200 h-2 rounded-full overflow-hidden mb-4">
              <div className="bg-orange-500 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="text-slate-500 text-xs text-center max-w-sm leading-relaxed">
              {progressPercent < 40
                ? "First use takes a few seconds to securely fetch the ~30MB local segmenting model. Thank you for your patience!"
                : "Calculating boundaries and analyzing image foreground subjects. Do not close this tab."}
            </p>
          </div>
        )}

        {imageFile && !isProcessing && (
          /* Workspace (After Upload) */
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-stretch">
            
            {/* Left Panel: Preview Workspace */}
            <div className="flex flex-col gap-4">
              <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                className="relative border border-slate-200 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden aspect-[4/3] max-h-[500px]"
              >
                {/* Original Image (Left Layer) */}
                <img
                  src={originalSrc}
                  alt="Original Backdrop"
                  className="absolute max-w-full max-h-full object-contain pointer-events-none select-none"
                />

                {/* Background Removed Image (Right Layer) */}
                <div
                  className="absolute inset-0 flex items-center justify-center overflow-hidden"
                  style={{ clipPath: `polygon(${sliderPos}% 0%, 100% 0%, 100% 100%, ${sliderPos}% 100%)` }}
                >
                  <canvas ref={canvasRef} className="max-w-full max-h-full object-contain pointer-events-none select-none" />
                </div>

                {/* Slider bar */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize select-none flex items-center justify-center"
                  style={{ left: `${sliderPos}%` }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsDraggingSlider(true);
                  }}
                  onTouchStart={(e) => {
                    setIsDraggingSlider(true);
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-300 shadow-md flex items-center justify-center cursor-ew-resize select-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-slate-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" className="rotate-90 origin-center" />
                    </svg>
                  </div>
                </div>

                {/* Sliders labels */}
                <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-md select-none pointer-events-none">
                  Original
                </div>
                <div className="absolute top-3 right-3 bg-orange-600 text-white text-xs font-semibold px-2.5 py-1 rounded-md select-none pointer-events-none">
                  Result
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={handleCopy}
                  className="bg-white border border-slate-300 hover:border-slate-400 text-slate-700 p-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition text-sm shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-600">
                    <path d="M 2 13 V 5 a 3 3 0 0 1 3-3 h 8 a 3 3 0 0 1 3 3 v 1" />
                    <rect x="6" y="6" width="13" height="15" rx="3" ry="3" />
                    <path d="M 10 10.5 h 5" />
                    <path d="M 10 13.5 h 5" />
                    <path d="M 10 16.5 h 5" />
                    <path d="M 10 19.5 h 5" />
                  </svg>
                  Copy PNG
                </button>
                <button
                  onClick={handleDownload}
                  className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition text-sm shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={() => document.getElementById("file-input-remover").click()}
                  className="bg-white border border-slate-300 hover:border-slate-400 text-slate-700 p-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition text-sm shadow-sm"
                >
                  <input
                    id="file-input-remover"
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        processImageFile(e.target.files[0]);
                      }
                    }}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Upload New
                </button>
                <button
                  onClick={handleReset}
                  className="bg-white border border-slate-300 hover:border-slate-400 text-red-600 p-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition text-sm shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Clear All
                </button>
              </div>

              {/* Performance & Privacy Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs select-none">⚡</span>
                  <div className="text-xs">
                    <p className="font-semibold text-slate-700">Client Processing Metrics</p>
                    <p className="text-slate-500">Removed in {processingTime}s ({originalWidth} x {originalHeight})</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs select-none">🔒</span>
                  <div className="text-xs">
                    <p className="font-semibold text-slate-700">100% Private Offline Run</p>
                    <p className="text-slate-500">Zero server uploads. Protected by client-side sandbox.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Controls */}
            <div className="flex flex-col gap-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 h-full justify-between">
              <div className="space-y-5">
                {/* 1. Background Settings */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600 mb-3">Background Option</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {["transparent", "solid", "gradient", "blur", "magic"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setBgType(type)}
                        className={`py-2 px-1 text-xs font-semibold border rounded-lg transition capitalize ${
                          bgType === type
                            ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {/* Contextual Sub-options */}
                  {bgType === "solid" && (
                    <div className="mt-4 p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                      <div className="flex-1 flex gap-2">
                        {["#ffffff", "#000000", "#3b82f6", "#22c55e", "#ef4444", "#eab308"].map((c) => (
                          <button
                            key={c}
                            onClick={() => setSolidColor(c)}
                            className={`w-6 h-6 rounded-full border transition-all ${
                              solidColor === c ? "scale-110 ring-2 ring-orange-500" : "border-slate-300"
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                        <span className="text-xs text-slate-500">Custom:</span>
                        <input
                          type="color"
                          value={solidColor}
                          onChange={(e) => setSolidColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                        />
                      </div>
                    </div>
                  )}

                  {bgType === "gradient" && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {GRADIENTS.map((g, idx) => (
                        <button
                          key={idx}
                          onClick={() => setGradientIndex(idx)}
                          className={`p-2 rounded-lg border flex flex-col items-center gap-1.5 bg-white transition ${
                            gradientIndex === idx ? "border-orange-500 ring-1 ring-orange-500" : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div
                            className="w-full h-8 rounded-md"
                            style={{ background: `linear-gradient(135deg, ${g.colors[0]}, ${g.colors[1]})` }}
                          />
                          <span className="text-[10px] font-medium text-slate-600 truncate max-w-full">{g.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {bgType === "magic" && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {MAGIC_BACKDROPS.map((mb) => (
                        <button
                          key={mb.id}
                          onClick={() => setMagicType(mb.id)}
                          className={`p-2 rounded-lg border flex flex-col items-start text-left bg-white transition ${
                            magicType === mb.id ? "border-orange-500 ring-1 ring-orange-500" : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-800">{mb.name}</span>
                          <span className="text-[9px] text-slate-500 mt-0.5 leading-tight">{mb.desc}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Edge & Effect Sliders */}
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600 mb-3">Edge & Shadows</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                        <span>Edge Smoothness</span>
                        <span className="text-slate-900 font-bold">{edgeSmoothness} px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={edgeSmoothness}
                        onChange={(e) => setEdgeSmoothness(parseInt(e.target.value))}
                        className="w-full accent-orange-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                        <span>Shadow Softness</span>
                        <span className="text-slate-900 font-bold">{shadowSoftness} px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        step="1"
                        value={shadowSoftness}
                        onChange={(e) => setShadowSoftness(parseInt(e.target.value))}
                        className="w-full accent-orange-500"
                      />
                    </div>

                    {shadowSoftness > 0 && (
                      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-2.5 text-xs">
                        <span className="font-medium text-slate-600">Shadow Color</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={shadowColor}
                            onChange={(e) => setShadowColor(e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                          />
                          <span className="font-mono text-slate-500 uppercase">{shadowColor}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Image Transform Adjustments */}
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">Subject Adjustments</h3>
                    <button
                      onClick={handleResetTransforms}
                      className="text-[10px] text-orange-600 hover:text-orange-700 font-semibold"
                    >
                      Reset Adjustments
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                        <span>Zoom / Scale</span>
                        <span className="text-slate-900 font-bold">{zoom.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.05"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full accent-orange-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                        <span>Rotate</span>
                        <span className="text-slate-900 font-bold">{rotate}°</span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="5"
                        value={rotate}
                        onChange={(e) => setRotate(parseInt(e.target.value))}
                        className="w-full accent-orange-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setFlipH(!flipH)}
                        className={`py-2 px-3 border rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition ${
                          flipH ? "bg-orange-50 border-orange-500 text-orange-600" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                        </svg>
                        Flip Horizontal
                      </button>
                      <button
                        onClick={() => setFlipV(!flipV)}
                        className={`py-2 px-3 border rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition ${
                          flipV ? "bg-orange-50 border-orange-500 text-orange-600" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                        </svg>
                        Flip Vertical
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Export & Info panel */}
              <div className="border-t border-slate-200 pt-4 mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500">
                    <p className="font-semibold text-slate-700">Dimensions</p>
                    <p className="font-mono text-slate-600 mt-0.5">
                      {Math.round(originalWidth * exportScale)} x {Math.round(originalHeight * exportScale)}
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <p className="font-semibold text-slate-700">Estimated Size</p>
                    <p className="font-mono text-slate-600 mt-0.5">{formatBytes(estimatedSize)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Format</label>
                    <ThemedDropdown
                      value={exportFormat}
                      onChange={(val) => setExportFormat(val)}
                      options={[
                        { value: "png", label: "PNG (Lossless)" },
                        { value: "jpeg", label: "JPEG (Solid Bg)" },
                        { value: "webp", label: "WEBP (Optimized)" }
                      ]}
                      ariaLabel="Select export format"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Resolution</label>
                    <ThemedDropdown
                      value={exportScale}
                      onChange={(val) => setExportScale(Number(val))}
                      options={[
                        { value: 1.0, label: "Original (100%)" },
                        { value: 0.75, label: "Medium (75%)" },
                        { value: 0.5, label: "Small (50%)" }
                      ]}
                      ariaLabel="Select export resolution"
                    />
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Export & Download Image
                </button>
              </div>
            </div>
            
          </div>
        )}
        
      </div>
    </div>
  );
}
