"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import ComingSoon from "../components/ComingSoon";

// Feature Release Toggle
const IS_RELEASED = false;

// File Category Mapping Rules
const CATEGORIES = [
  {
    name: "Images",
    color: "bg-amber-500",
    textColor: "text-amber-500",
    borderColor: "border-amber-200",
    bgLight: "bg-amber-50",
    exts: new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "tiff", "ico", "heic", "heif", "avif"]),
  },
  {
    name: "Documents",
    color: "bg-blue-500",
    textColor: "text-blue-500",
    borderColor: "border-blue-200",
    bgLight: "bg-blue-50",
    exts: new Set(["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "rtf", "csv", "md", "json", "xml", "html", "htm", "css", "js", "jsx", "ts", "tsx", "py", "java", "c", "cpp", "h", "cs", "sh", "bat", "yaml", "yml", "ini", "log"]),
  },
  {
    name: "Videos",
    color: "bg-rose-500",
    textColor: "text-rose-500",
    borderColor: "border-rose-200",
    bgLight: "bg-rose-50",
    exts: new Set(["mp4", "mkv", "avi", "mov", "wmv", "flv", "webm", "mpeg", "mpg", "3gp", "m4v", "ts"]),
  },
  {
    name: "Archives",
    color: "bg-purple-500",
    textColor: "text-purple-500",
    borderColor: "border-purple-200",
    bgLight: "bg-purple-50",
    exts: new Set(["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "zipx", "iso", "dmg", "pkg", "deb", "rpm"]),
  },
  {
    name: "Others",
    color: "bg-slate-400",
    textColor: "text-slate-500",
    borderColor: "border-slate-200",
    bgLight: "bg-slate-50",
    exts: new Set([]), // Fallback category
  },
];

// Helper to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Dice coefficient for filename similarity checks
function getBigrams(str) {
  const bigrams = new Set();
  for (let i = 0; i < str.length - 1; i++) {
    bigrams.add(str.slice(i, i + 2));
  }
  return bigrams;
}

function diceCoefficient(str1, str2) {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  if (s1 === s2) return 1;
  if (s1.length < 2 || s2.length < 2) return 0;
  const b1 = getBigrams(s1);
  const b2 = getBigrams(s2);
  let intersection = 0;
  for (const val of b1) {
    if (b2.has(val)) intersection++;
  }
  return (2 * intersection) / (b1.size + b2.size);
}

// Clean file copies/revisions naming patterns (e.g., "report - Copy.pdf", "doc (1).txt" -> "report", "doc")
function getCleanedBaseName(fileName) {
  const lastDot = fileName.lastIndexOf(".");
  const base = lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
  return base
    .replace(/(\s*-\s*copy|\s*_copy|^copy\s+of\s*|\(\d+\)|_\d+|\s+v\d+|\s+final)/i, "")
    .trim()
    .toLowerCase();
}

export default function DigitalDeclutterAssistant() {
  if (!IS_RELEASED) {
    return <ComingSoon toolName="Digital Declutter Assistant" />;
  }

  const [scannedFiles, setScannedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  
  // Custom Filters
  const [sizeThreshold, setSizeThreshold] = useState(20); // Default > 20MB is large
  const [ageThreshold, setAgeThreshold] = useState(12); // Default > 12 months is old

  // Navigation tab
  const [activeTab, setActiveTab] = useState("summary");

  // DOM refs
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  // Pagination bounds to keep lists fast
  const [visibleItemsCount, setVisibleItemsCount] = useState(30);

  // Reset list view limit when tab changes
  useEffect(() => {
    setVisibleItemsCount(30);
  }, [activeTab]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 3000);
  };

  // Traversal of file entries (Drag & Drop)
  const traverseEntry = async (entry, path = "") => {
    const files = [];
    if (entry.isFile) {
      const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
      const ext = entry.name.includes(".") ? entry.name.split(".").pop().toLowerCase() : "";
      files.push({
        id: Math.random().toString(36).substring(2, 9) + Date.now(),
        name: entry.name,
        size: file.size,
        type: file.type,
        path: path + entry.name,
        lastModified: file.lastModified || Date.now(),
        extension: ext,
      });
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      const readAllEntries = async () => {
        const result = [];
        let chunk = await new Promise((resolve) => reader.readEntries(resolve));
        while (chunk.length > 0) {
          result.push(...chunk);
          chunk = await new Promise((resolve) => reader.readEntries(resolve));
        }
        return result;
      };
      try {
        const dirEntries = await readAllEntries();
        for (const subEntry of dirEntries) {
          const subFiles = await traverseEntry(subEntry, path + entry.name + "/");
          files.push(...subFiles);
        }
      } catch (err) {
        console.error("Error reading directory: ", err);
      }
    }
    return files;
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    setIsAnalyzing(true);
    setError("");

    const items = e.dataTransfer?.items;
    if (!items) {
      setIsAnalyzing(false);
      return;
    }

    try {
      const entryPromises = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file") {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            entryPromises.push(traverseEntry(entry));
          }
        }
      }

      const results = await Promise.all(entryPromises);
      const combined = results.flat();

      if (combined.length > 0) {
        setScannedFiles((prev) => {
          const existingPaths = new Set(prev.map((f) => f.path + f.size));
          const uniqueNew = combined.filter((f) => !existingPaths.has(f.path + f.size));
          return [...prev, ...uniqueNew];
        });
        showNotification(`Scanned ${combined.length} files successfully.`);
      } else {
        setError("No readable files or folders were dropped.");
      }
    } catch (err) {
      setError("An error occurred while reading dropped folders.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e, isDirectoryInput = false) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsAnalyzing(true);
    const filesArray = Array.from(fileList).map((file) => {
      const name = file.name;
      // In folder selection, webkitRelativePath contains the full relative path
      const path = file.webkitRelativePath || file.name;
      const ext = name.includes(".") ? name.split(".").pop().toLowerCase() : "";
      return {
        id: Math.random().toString(36).substring(2, 9) + Date.now(),
        name,
        size: file.size,
        type: file.type,
        path,
        lastModified: file.lastModified || Date.now(),
        extension: ext,
      };
    });

    setScannedFiles((prev) => {
      const existingPaths = new Set(prev.map((f) => f.path + f.size));
      const uniqueNew = filesArray.filter((f) => !existingPaths.has(f.path + f.size));
      return [...prev, ...uniqueNew];
    });

    showNotification(`Scanned ${filesArray.length} files successfully.`);
    setIsAnalyzing(false);

    // Reset inputs so the same folders can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (folderInputRef.current) folderInputRef.current.value = "";
  };

  const handleClearSession = () => {
    setScannedFiles([]);
    setError("");
    setActiveTab("summary");
    showNotification("Session cleared.");
  };

  // Classification & stats
  const stats = useMemo(() => {
    let totalSize = 0;
    const categoryCounts = CATEGORIES.reduce((acc, cat) => {
      acc[cat.name] = { count: 0, size: 0 };
      return acc;
    }, {});

    scannedFiles.forEach((file) => {
      totalSize += file.size;
      let matchedCatName = "Others";
      
      for (const cat of CATEGORIES) {
        if (cat.name !== "Others" && cat.exts.has(file.extension)) {
          matchedCatName = cat.name;
          break;
        }
      }
      
      categoryCounts[matchedCatName].count += 1;
      categoryCounts[matchedCatName].size += file.size;
    });

    return {
      totalCount: scannedFiles.length,
      totalSize,
      categories: CATEGORIES.map((cat) => {
        const cStats = categoryCounts[cat.name];
        const percent = scannedFiles.length > 0 ? (cStats.count / scannedFiles.length) * 100 : 0;
        return {
          ...cat,
          count: cStats.count,
          size: cStats.size,
          percent,
        };
      }),
    };
  }, [scannedFiles]);

  // DUPLICATES ALGORITHM
  // Group by lowercase filename.
  // Flag those that are duplicate filename.
  // Flag those that are likely exact duplicates (same name and size).
  const duplicateGroups = useMemo(() => {
    const groups = {};
    scannedFiles.forEach((file) => {
      const key = file.name.toLowerCase();
      if (!groups[key]) groups[key] = [];
      groups[key].push(file);
    });

    const duplicateGroupsList = [];
    Object.values(groups).forEach((group) => {
      if (group.length > 1) {
        // Group further by size to flag exact matches
        const sizeGroups = {};
        group.forEach((f) => {
          if (!sizeGroups[f.size]) sizeGroups[f.size] = [];
          sizeGroups[f.size].push(f);
        });

        const subgroups = Object.values(sizeGroups).map((subg) => ({
          size: subg[0].size,
          isExactMatch: subg.length > 1,
          files: subg,
        }));

        duplicateGroupsList.push({
          name: group[0].name,
          extension: group[0].extension,
          subgroups,
          totalDuplicates: group.length,
        });
      }
    });

    // Sort by largest duplicates or size
    return duplicateGroupsList.sort((a, b) => b.totalDuplicates - a.totalDuplicates);
  }, [scannedFiles]);

  const duplicateCount = useMemo(() => {
    return duplicateGroups.reduce((acc, g) => acc + (g.totalDuplicates - 1), 0);
  }, [duplicateGroups]);

  // SIMILAR FILENAMES ALGORITHM
  // 1. Files containing Copy tags: e.g. "report.docx" vs "report - Copy.docx" vs "report (1).docx"
  // 2. Pairwise dice similarity score checks within same categories to keep computational time low
  const similarityGroups = useMemo(() => {
    if (scannedFiles.length < 2) return [];

    // Group by cleaned base name
    const cleanedGroups = {};
    scannedFiles.forEach((file) => {
      const cleanName = getCleanedBaseName(file.name);
      if (!cleanedGroups[cleanName]) cleanedGroups[cleanName] = [];
      cleanedGroups[cleanName].push(file);
    });

    const groupsList = [];

    // Process cleaned base name groupings (groups with diff extensions or copy tags)
    Object.entries(cleanedGroups).forEach(([cleanedName, files]) => {
      if (files.length > 1) {
        // Check if there are distinct filenames inside this group
        const distinctNames = new Set(files.map((f) => f.name));
        if (distinctNames.size > 1) {
          groupsList.push({
            reason: "Revision / Copy suffix or Shared basename",
            key: cleanedName,
            files: files.sort((a, b) => a.name.localeCompare(b.name)),
          });
        }
      }
    });

    // Add string distance similarity pairs for files in the same category
    // To prevent O(N^2) lag on thousands of files, we only check up to 300 files per category
    const categoriesList = CATEGORIES.map((c) => c.name);
    const categoryFiles = {};
    categoriesList.forEach((c) => {
      categoryFiles[c] = [];
    });

    scannedFiles.forEach((file) => {
      let matchedCat = "Others";
      for (const cat of CATEGORIES) {
        if (cat.name !== "Others" && cat.exts.has(file.extension)) {
          matchedCat = cat.name;
          break;
        }
      }
      if (categoryFiles[matchedCat].length < 300) {
        categoryFiles[matchedCat].push(file);
      }
    });

    const checkedPairs = new Set();

    Object.values(categoryFiles).forEach((files) => {
      for (let i = 0; i < files.length; i++) {
        const fileA = files[i];
        for (let j = i + 1; j < files.length; j++) {
          const fileB = files[j];
          
          // Skip if already in base name group or identical name
          if (fileA.name.toLowerCase() === fileB.name.toLowerCase()) continue;
          const cleanA = getCleanedBaseName(fileA.name);
          const cleanB = getCleanedBaseName(fileB.name);
          if (cleanA === cleanB) continue;

          // Dice coefficient score
          const score = diceCoefficient(fileA.name, fileB.name);
          if (score >= 0.72) {
            const pairKey = [fileA.id, fileB.id].sort().join("-");
            if (!checkedPairs.has(pairKey)) {
              checkedPairs.add(pairKey);
              groupsList.push({
                reason: `Name Similarity (${Math.round(score * 100)}%)`,
                key: `${fileA.name} ≈ ${fileB.name}`,
                files: [fileA, fileB],
              });
            }
          }
        }
      }
    });

    return groupsList;
  }, [scannedFiles]);

  // LARGE FILES ALGORITHM
  const largeFiles = useMemo(() => {
    return scannedFiles
      .filter((file) => file.size >= sizeThreshold * 1024 * 1024)
      .sort((a, b) => b.size - a.size);
  }, [scannedFiles, sizeThreshold]);

  // OLD FILES ALGORITHM
  const oldFiles = useMemo(() => {
    const thresholdMs = Date.now() - ageThreshold * 30 * 24 * 60 * 60 * 1000;
    return scannedFiles
      .filter((file) => file.lastModified < thresholdMs)
      .sort((a, b) => a.lastModified - b.lastModified);
  }, [scannedFiles, ageThreshold]);

  // UNORGANIZED FILES ALGORITHM
  const unorganizedFiles = useMemo(() => {
    const unorganizedList = [];

    // Helper regex patterns
    const genericNamePattern = /^(untitled|new\s+folder|new\s+document|temp|tmp|draft|test|dummy|untitled\s+document|download|screenshot|screen\s+shot|copy\s+of)/i;
    const doubleExtPattern = /\.[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;

    scannedFiles.forEach((file) => {
      const reasons = [];

      // 1. Generic names
      if (genericNamePattern.test(file.name)) {
        reasons.push("Generic placeholder name");
      }

      // 2. Double extensions
      if (doubleExtPattern.test(file.name)) {
        reasons.push("Double extension");
      }

      // 3. No extension
      if (!file.extension && file.size > 0) {
        reasons.push("Missing file extension");
      }

      // 4. File depth (nested deeply in directories)
      const pathDepth = file.path.split("/").length - 1;
      if (pathDepth >= 5) {
        reasons.push(`Nested too deep (${pathDepth} levels)`);
      }

      if (reasons.length > 0) {
        unorganizedList.push({
          ...file,
          reasons: reasons.join(", "),
        });
      }
    });

    return unorganizedList.sort((a, b) => b.size - a.size);
  }, [scannedFiles]);

  // EXPORT SUMMARY MARKDOWN REPORT
  const generateMarkdownReport = () => {
    const timeStr = new Date().toLocaleString();
    let md = `# Digital Declutter Summary Report\n`;
    md += `*Generated: ${timeStr} | boring-tools/digital-declutter-assistant*\n`;
    md += `*Privacy Notice: Processed 100% locally on your machine.*\n\n`;

    md += `## 📊 Statistics Dashboard\n`;
    md += `- **Total Files Scanned**: ${stats.totalCount}\n`;
    md += `- **Total Size**: ${formatFileSize(stats.totalSize)}\n`;
    md += `- **File Duplicate Count**: ${duplicateCount} instances\n`;
    md += `- **Large Files (> ${sizeThreshold}MB)**: ${largeFiles.length} files\n`;
    md += `- **Old Files (> ${ageThreshold} months)**: ${oldFiles.length} files\n`;
    md += `- **Unorganized Files**: ${unorganizedFiles.length} flagged files\n\n`;

    md += `## 🗂️ Category Breakdown\n`;
    stats.categories.forEach((cat) => {
      md += `- **${cat.name}**: ${cat.count} files | ${formatFileSize(cat.size)} (${cat.percent.toFixed(1)}%)\n`;
    });
    md += `\n`;

    md += `## 👥 Duplicate Filenames (Top 15 groups)\n`;
    if (duplicateGroups.length === 0) {
      md += `*No duplicates found!*\n\n`;
    } else {
      duplicateGroups.slice(0, 15).forEach((group, idx) => {
        md += `### ${idx + 1}. "${group.name}" (${group.totalDuplicates} duplicates)\n`;
        group.subgroups.forEach((subg) => {
          const matchLabel = subg.isExactMatch ? " [Exact Size Match]" : "";
          md += `- Size: ${formatFileSize(subg.size)}${matchLabel}\n`;
          subg.files.forEach((f) => {
            md += `  - Path: \`${f.path}\` | Last Modified: ${new Date(f.lastModified).toLocaleDateString()}\n`;
          });
        });
        md += `\n`;
      });
      if (duplicateGroups.length > 15) {
        md += `*(and ${duplicateGroups.length - 15} more groups)*\n\n`;
      }
    }

    md += `## 📄 Similar / Revised Filenames (Top 15)\n`;
    if (similarityGroups.length === 0) {
      md += `*No similar files found!*\n\n`;
    } else {
      similarityGroups.slice(0, 15).forEach((group, idx) => {
        md += `### ${idx + 1}. Basename: "${group.key}" (${group.reason})\n`;
        group.files.forEach((f) => {
          md += `- Name: \`${f.name}\` | Size: ${formatFileSize(f.size)} | Path: \`${f.path}\`\n`;
        });
        md += `\n`;
      });
      if (similarityGroups.length > 15) {
        md += `*(and ${similarityGroups.length - 15} more groups)*\n\n`;
      }
    }

    md += `## 💾 Large Files (Top 20)\n`;
    if (largeFiles.length === 0) {
      md += `*No files found matching size threshold (> ${sizeThreshold}MB).*\n\n`;
    } else {
      largeFiles.slice(0, 20).forEach((f, idx) => {
        md += `${idx + 1}. **${f.name}** | Size: ${formatFileSize(f.size)} | Path: \`${f.path}\` | Date: ${new Date(f.lastModified).toLocaleDateString()}\n`;
      });
      if (largeFiles.length > 20) {
        md += `*(and ${largeFiles.length - 20} more)*\n\n`;
      }
    }

    md += `## 📅 Old / Archive-Ready Files (Top 20)\n`;
    if (oldFiles.length === 0) {
      md += `*No files found older than ${ageThreshold} months.*\n\n`;
    } else {
      oldFiles.slice(0, 20).forEach((f, idx) => {
        const ageInMonths = Math.round((Date.now() - f.lastModified) / (30 * 24 * 60 * 60 * 1000));
        md += `${idx + 1}. **${f.name}** | Age: ~${ageInMonths} months | Path: \`${f.path}\` | Last Modified: ${new Date(f.lastModified).toLocaleDateString()}\n`;
      });
      if (oldFiles.length > 20) {
        md += `*(and ${oldFiles.length - 20} more)*\n\n`;
      }
    }

    md += `## 🧹 Unorganized / Generic Flagged Files (Top 20)\n`;
    if (unorganizedFiles.length === 0) {
      md += `*No files match cleanup heuristics.*\n\n`;
    } else {
      unorganizedFiles.slice(0, 20).forEach((f, idx) => {
        md += `${idx + 1}. **${f.name}** | Reason: *${f.reasons}* | Path: \`${f.path}\` | Size: ${formatFileSize(f.size)}\n`;
      });
      if (unorganizedFiles.length > 20) {
        md += `*(and ${unorganizedFiles.length - 20} more)*\n\n`;
      }
    }

    return md;
  };

  const handleExportReport = () => {
    if (scannedFiles.length === 0) {
      showNotification("No scanned files to export.", "error");
      return;
    }
    const reportStr = generateMarkdownReport();
    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(reportStr);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Digital_Declutter_Report_${Date.now()}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification("Markdown report downloaded successfully.");
  };

  const handleCopyReport = async () => {
    if (scannedFiles.length === 0) {
      showNotification("No scanned files to copy.", "error");
      return;
    }
    try {
      const reportStr = generateMarkdownReport();
      await navigator.clipboard.writeText(reportStr);
      showNotification("Report summary copied to clipboard!");
    } catch (err) {
      showNotification("Failed to copy report to clipboard.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans pb-16">
      <div className="bg-white shadow-xl rounded-3xl p-6 sm:p-8 w-full max-w-6xl border border-slate-100 flex flex-col gap-6 relative overflow-hidden">
        
        {/* Floating Notification */}
        {notification && (
          <div
            className={`fixed top-20 right-4 z-50 p-4 rounded-xl shadow-lg border text-sm font-semibold transition-all duration-300 max-w-md ${
              notification.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "error" ? (
                <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              Digital Declutter Assistant
            </h1>
            <p className="text-slate-500 text-sm sm:text-base">
              Analyze your directories 100% locally to identify duplicate, old, massive, or chaotic files.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {scannedFiles.length > 0 && (
              <>
                <button
                  onClick={handleCopyReport}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer shadow-sm w-full sm:w-auto"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Copy Summary
                </button>
                <button
                  onClick={handleExportReport}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition cursor-pointer shadow-sm w-full sm:w-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Report
                </button>
                <button
                  onClick={handleClearSession}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition cursor-pointer shadow-sm w-full sm:w-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Session
                </button>
              </>
            )}
          </div>
        </div>

        {/* Local Storage Privacy Banner */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-sm font-bold text-emerald-800">Your files never leave your device.</h3>
            <p className="text-xs text-emerald-600 mt-0.5">
              All scans, directory traversals, name similarity calculations, and duplicate detections are performed 100% locally in your web browser. No files or metadata are uploaded anywhere.
            </p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 items-start">
          
          {/* Left Column: Dropzone & Settings */}
          <div className="flex flex-col gap-6 sticky top-20">
            
            {/* File Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-6 text-center flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
                isDragging
                  ? "border-amber-400 bg-amber-50/50 scale-[1.01] shadow-md"
                  : "border-slate-200 bg-white hover:border-slate-350 shadow-sm"
              } ${isAnalyzing ? "pointer-events-none opacity-80" : ""}`}
            >
              {isAnalyzing ? (
                <div className="py-6 flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-500 text-sm font-semibold">Traversing files recursively...</p>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-full text-slate-400">
                    <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Drag and drop folder or files here</h3>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-xs">
                      Drop folders to parse directory hierarchies recursively, or select files/directories manually.
                    </p>
                  </div>
                  
                  {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}

                  <div className="flex flex-col sm:flex-row gap-2 w-full mt-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Select Files
                    </button>
                    <button
                      onClick={() => folderInputRef.current?.click()}
                      className="flex-1 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                      </svg>
                      Select Folder
                    </button>
                  </div>

                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={(e) => handleFileChange(e, false)}
                    className="hidden"
                  />
                  <input
                    type="file"
                    webkitdirectory=""
                    directory=""
                    multiple
                    ref={folderInputRef}
                    onChange={(e) => handleFileChange(e, true)}
                    className="hidden"
                  />
                </>
              )}
            </div>

            {/* Threshold Settings Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4 shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">Analysis Settings</h2>
              
              <div className="flex flex-col gap-4">
                {/* Size slider */}
                <label className="text-xs font-bold text-slate-600 flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span>Large File Threshold</span>
                    <span className="text-amber-600 font-extrabold">{sizeThreshold} MB</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="200"
                    value={sizeThreshold}
                    onChange={(e) => setSizeThreshold(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                  />
                </label>

                {/* Age slider */}
                <label className="text-xs font-bold text-slate-600 flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span>Old File Threshold</span>
                    <span className="text-amber-600 font-extrabold">{ageThreshold} Months</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={ageThreshold}
                    onChange={(e) => setAgeThreshold(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                  />
                </label>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                Adjust thresholds to filter the large and old file sections in real-time.
              </p>
            </div>
          </div>

          {/* Right Column: Results & Interactive Tab UI */}
          <div className="flex flex-col gap-5">
            {scannedFiles.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center flex flex-col items-center justify-center gap-5 shadow-sm min-h-[360px]">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-full text-slate-400">
                  <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">No scanned files analyzed</h3>
                  <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
                    Drag and drop folders/files or select them to analyze digital clutter indicators.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                
                {/* Stats Grid Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                  <div className="rounded-2xl border border-slate-150 bg-slate-50/50 p-4.5 text-center flex flex-col justify-center shadow-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Files</p>
                    <p className="text-xl font-extrabold text-slate-900 mt-1">{stats.totalCount}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-150 bg-slate-50/50 p-4.5 text-center flex flex-col justify-center shadow-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Size</p>
                    <p className="text-xl font-extrabold text-slate-900 mt-1 truncate" title={formatFileSize(stats.totalSize)}>
                      {formatFileSize(stats.totalSize)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-150 bg-slate-50/50 p-4.5 text-center flex flex-col justify-center shadow-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duplicates</p>
                    <p className="text-xl font-extrabold text-rose-500 mt-1">{duplicateCount}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-150 bg-slate-50/50 p-4.5 text-center flex flex-col justify-center shadow-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Large Files</p>
                    <p className="text-xl font-extrabold text-slate-900 mt-1">{largeFiles.length}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-150 bg-slate-50/50 p-4.5 text-center flex flex-col justify-center shadow-xs col-span-2 sm:col-span-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Old Files</p>
                    <p className="text-xl font-extrabold text-slate-900 mt-1">{oldFiles.length}</p>
                  </div>
                </div>

                {/* Category Bar and Legends */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4.5 shadow-sm">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">File Category Breakdown</h3>
                  
                  {/* Stacked Progress Bar */}
                  <div className="w-full bg-slate-100 h-5 rounded-full overflow-hidden flex shadow-inner">
                    {stats.categories.map((cat) => (
                      <div
                        key={cat.name}
                        style={{ width: `${cat.percent}%` }}
                        className={`${cat.color} h-full transition-all duration-500 border-r border-white/10 last:border-0`}
                        title={`${cat.name}: ${cat.count} files | ${formatFileSize(cat.size)} (${cat.percent.toFixed(1)}%)`}
                      />
                    ))}
                  </div>

                  {/* Legends */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mt-1.5">
                    {stats.categories.map((cat) => (
                      <div key={cat.name} className="flex flex-col gap-1 p-2 rounded-xl border border-slate-50 bg-slate-50/20">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                          <span className="text-xs font-bold text-slate-700">{cat.name}</span>
                        </div>
                        <p className="text-sm font-extrabold text-slate-900 ml-4.5">{cat.count}</p>
                        <p className="text-[10px] text-slate-400 ml-4.5 font-medium truncate">{formatFileSize(cat.size)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Results Tabs Control */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-3">
                  <div className="flex flex-wrap gap-1">
                    {[
                      { value: "summary", label: "Dashboard Summary" },
                      { value: "duplicates", label: `Duplicates (${duplicateGroups.length})` },
                      { value: "similarity", label: `Similar Names (${similarityGroups.length})` },
                      { value: "large", label: `Large Files (${largeFiles.length})` },
                      { value: "old", label: `Old Files (${oldFiles.length})` },
                      { value: "unorganized", label: `Unorganized (${unorganizedFiles.length})` },
                    ].map((tab) => (
                      <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all focus:outline-none cursor-pointer ${
                          activeTab === tab.value
                            ? "bg-slate-900 text-white shadow-xs"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Display Area */}
                <div className="flex flex-col gap-4">

                  {/* SUMMARY TAB */}
                  {activeTab === "summary" && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-6">
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Local Digital Health Diagnostics</h2>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                          Key observations and statistics based on current scanned directories.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Summary Left: Duplicates Info */}
                        <div className="border border-slate-100 rounded-xl p-4 flex flex-col gap-3">
                          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                            Redundant & Duplicate Data
                          </h3>
                          <div className="text-xs text-slate-500 leading-relaxed flex flex-col gap-2">
                            <p>
                              We found <strong className="text-slate-800">{duplicateGroups.length}</strong> unique filenames with duplicate instances, accounting for <strong className="text-slate-800">{duplicateCount}</strong> duplicate copies.
                            </p>
                            <p>
                              Files with identical name and exact matching size in bytes are flagged as <strong className="text-slate-800">Highly Likely Duplicates</strong>.
                            </p>
                            {duplicateGroups.length > 0 && (
                              <button
                                onClick={() => setActiveTab("duplicates")}
                                className="text-amber-600 hover:text-amber-700 font-bold self-start mt-1 cursor-pointer"
                              >
                                View duplicates →
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Summary Right: Similarity Info */}
                        <div className="border border-slate-100 rounded-xl p-4 flex flex-col gap-3">
                          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            Similar Names / Copy Suffixes
                          </h3>
                          <div className="text-xs text-slate-500 leading-relaxed flex flex-col gap-2">
                            <p>
                              We detected <strong className="text-slate-800">{similarityGroups.length}</strong> file pairs or groups with closely related names (e.g. containing copy suffix keywords like <code className="bg-slate-100 px-1 rounded">Copy</code>, <code className="bg-slate-100 px-1 rounded">(1)</code>, or high textual similarity index).
                            </p>
                            <p>
                              These are common when making local backups, working on draft iterations, or exporting multiple revisions.
                            </p>
                            {similarityGroups.length > 0 && (
                              <button
                                onClick={() => setActiveTab("similarity")}
                                className="text-amber-600 hover:text-amber-700 font-bold self-start mt-1 cursor-pointer"
                              >
                                View similar files →
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Summary Left Bot: Large Files */}
                        <div className="border border-slate-100 rounded-xl p-4 flex flex-col gap-3">
                          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                            Disk Space Blockers
                          </h3>
                          <div className="text-xs text-slate-500 leading-relaxed flex flex-col gap-2">
                            <p>
                              There are <strong className="text-slate-800">{largeFiles.length}</strong> files larger than the <strong className="text-slate-800">{sizeThreshold} MB</strong> threshold.
                            </p>
                            <p>
                              Clean up large video file exports, raw designer assets, or unneeded zip archives to reclaim local drive capacity.
                            </p>
                            {largeFiles.length > 0 && (
                              <button
                                onClick={() => setActiveTab("large")}
                                className="text-amber-600 hover:text-amber-700 font-bold self-start mt-1 cursor-pointer"
                              >
                                View large files →
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Summary Right Bot: Old / Unorganized Files */}
                        <div className="border border-slate-100 rounded-xl p-4 flex flex-col gap-3">
                          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                            Orphaned & Unorganized Folders
                          </h3>
                          <div className="text-xs text-slate-500 leading-relaxed flex flex-col gap-2">
                            <p>
                              We flagged <strong className="text-slate-800">{oldFiles.length}</strong> files unmodified for over <strong className="text-slate-800">{ageThreshold} months</strong>, and <strong className="text-slate-800">{unorganizedFiles.length}</strong> files with generic names or double extensions.
                            </p>
                            <p>
                              Organizing generic screenshots, temp files, or ancient archives helps prevent directory clutter.
                            </p>
                            <div className="flex gap-4 mt-1">
                              {oldFiles.length > 0 && (
                                <button
                                  onClick={() => setActiveTab("old")}
                                  className="text-amber-600 hover:text-amber-700 font-bold cursor-pointer"
                                >
                                  View old files →
                                </button>
                              )}
                              {unorganizedFiles.length > 0 && (
                                <button
                                  onClick={() => setActiveTab("unorganized")}
                                  className="text-amber-600 hover:text-amber-700 font-bold cursor-pointer"
                                >
                                  View unorganized →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* DUPLICATES TAB */}
                  {activeTab === "duplicates" && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-4">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">Duplicate Filenames ({duplicateGroups.length})</h2>
                        <p className="text-xs text-slate-400 mt-1">
                          Files sharing the exact same name. Files of identical byte sizes are marked as highly likely duplicates.
                        </p>
                      </div>

                      {duplicateGroups.length === 0 ? (
                        <p className="text-sm text-slate-400 py-6 text-center italic">No duplicate filenames found!</p>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {duplicateGroups.slice(0, visibleItemsCount).map((group, gIdx) => (
                            <div key={gIdx} className="rounded-xl border border-slate-150 p-4 bg-slate-50/30 flex flex-col gap-3">
                              
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
                                <h3 className="text-sm font-extrabold text-slate-900 font-mono break-all">{group.name}</h3>
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 shrink-0">
                                  {group.totalDuplicates} duplicates
                                </span>
                              </div>

                              <div className="flex flex-col gap-3">
                                {group.subgroups.map((subg, sIdx) => (
                                  <div key={sIdx} className="pl-3 border-l-2 border-slate-200 flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-extrabold text-slate-700">{formatFileSize(subg.size)}</span>
                                      {subg.isExactMatch && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                                          Highly Likely Duplicate (Same Size)
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex flex-col gap-1.5 pl-2">
                                      {subg.files.map((file, fIdx) => (
                                        <div key={fIdx} className="text-xs text-slate-500 font-mono break-all bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                                          <p className="font-semibold text-slate-700">{file.path}</p>
                                          <p className="text-[10px] text-slate-400 mt-0.5">
                                            Last modified: {new Date(file.lastModified).toLocaleDateString()}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>

                            </div>
                          ))}

                          {duplicateGroups.length > visibleItemsCount && (
                            <button
                              onClick={() => setVisibleItemsCount((prev) => prev + 30)}
                              className="py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer self-center px-6"
                            >
                              Load more duplicates ({duplicateGroups.length - visibleItemsCount} remaining)
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SIMILARITY TAB */}
                  {activeTab === "similarity" && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-4">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">Similar / Revised Filenames ({similarityGroups.length})</h2>
                        <p className="text-xs text-slate-400 mt-1">
                          Files identified as potential copy instances, iteration drafts, or near-matching text structures.
                        </p>
                      </div>

                      {similarityGroups.length === 0 ? (
                        <p className="text-sm text-slate-400 py-6 text-center italic">No similar filenames found!</p>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {similarityGroups.slice(0, visibleItemsCount).map((group, idx) => (
                            <div key={idx} className="rounded-xl border border-slate-150 p-4 bg-slate-50/30 flex flex-col gap-3">
                              
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                  Group: <span className="text-slate-800 font-mono font-extrabold normal-case">{group.key}</span>
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 shrink-0">
                                  {group.reason}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {group.files.map((file, fIdx) => (
                                  <div key={fIdx} className="bg-white p-3 rounded-lg border border-slate-100 shadow-2xs text-xs font-mono flex flex-col justify-between gap-2">
                                    <div>
                                      <p className="font-extrabold text-slate-800 break-all">{file.name}</p>
                                      <p className="text-[10px] text-slate-400 mt-1 break-all">Path: {file.path}</p>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-50 pt-1.5 mt-1 shrink-0">
                                      <span>Size: {formatFileSize(file.size)}</span>
                                      <span>Mod: {new Date(file.lastModified).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                            </div>
                          ))}

                          {similarityGroups.length > visibleItemsCount && (
                            <button
                              onClick={() => setVisibleItemsCount((prev) => prev + 30)}
                              className="py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer self-center px-6"
                            >
                              Load more groups ({similarityGroups.length - visibleItemsCount} remaining)
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* LARGE FILES TAB */}
                  {activeTab === "large" && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-4">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">Large Files ({largeFiles.length})</h2>
                        <p className="text-xs text-slate-400 mt-1">
                          Files larger than <strong className="text-slate-600">{sizeThreshold} MB</strong> sorted by size descending.
                        </p>
                      </div>

                      {largeFiles.length === 0 ? (
                        <p className="text-sm text-slate-400 py-6 text-center italic">
                          No files exceed the {sizeThreshold} MB size threshold.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {largeFiles.slice(0, visibleItemsCount).map((file) => (
                            <div key={file.id} className="rounded-xl border border-slate-100 bg-white p-3 flex justify-between items-center gap-4 text-xs font-mono shadow-2xs hover:border-amber-200 transition">
                              <div className="min-w-0">
                                <p className="font-extrabold text-slate-800 break-all truncate">{file.name}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5 break-all truncate">{file.path}</p>
                              </div>
                              <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                <span className="font-extrabold text-slate-900">{formatFileSize(file.size)}</span>
                                <span className="text-[9px] text-slate-400 font-sans">
                                  {new Date(file.lastModified).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}

                          {largeFiles.length > visibleItemsCount && (
                            <button
                              onClick={() => setVisibleItemsCount((prev) => prev + 30)}
                              className="py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer self-center px-6 mt-2"
                            >
                              Load more large files ({largeFiles.length - visibleItemsCount} remaining)
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* OLD FILES TAB */}
                  {activeTab === "old" && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-4">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">Old / Inactive Files ({oldFiles.length})</h2>
                        <p className="text-xs text-slate-400 mt-1">
                          Files that have not been modified for more than <strong className="text-slate-600">{ageThreshold} months</strong>.
                        </p>
                      </div>

                      {oldFiles.length === 0 ? (
                        <p className="text-sm text-slate-400 py-6 text-center italic">
                          No files found older than {ageThreshold} months.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {oldFiles.slice(0, visibleItemsCount).map((file) => {
                            const monthsOld = Math.round((Date.now() - file.lastModified) / (30 * 24 * 60 * 60 * 1000));
                            return (
                              <div key={file.id} className="rounded-xl border border-slate-100 bg-white p-3 flex justify-between items-center gap-4 text-xs font-mono shadow-2xs hover:border-amber-200 transition">
                                <div className="min-w-0">
                                  <p className="font-extrabold text-slate-800 break-all truncate">{file.name}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5 break-all truncate">{file.path}</p>
                                </div>
                                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                  <span className="font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-sans text-[10px]">
                                    ~{monthsOld} months old
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                                    Mod: {new Date(file.lastModified).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            );
                          })}

                          {oldFiles.length > visibleItemsCount && (
                            <button
                              onClick={() => setVisibleItemsCount((prev) => prev + 30)}
                              className="py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer self-center px-6 mt-2"
                            >
                              Load more old files ({oldFiles.length - visibleItemsCount} remaining)
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* UNORGANIZED TAB */}
                  {activeTab === "unorganized" && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-4">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">Unorganized Flags ({unorganizedFiles.length})</h2>
                        <p className="text-xs text-slate-400 mt-1">
                          Files matching cleanup criteria: generic names, double extensions, deep directory nesting, or missing file extensions.
                        </p>
                      </div>

                      {unorganizedFiles.length === 0 ? (
                        <p className="text-sm text-slate-400 py-6 text-center italic">
                          All scanned files pass naming cleanliness and organization criteria.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {unorganizedFiles.slice(0, visibleItemsCount).map((file) => (
                            <div key={file.id} className="rounded-xl border border-slate-100 bg-white p-3 flex justify-between items-center gap-4 text-xs font-mono shadow-2xs hover:border-rose-200 transition">
                              <div className="min-w-0">
                                <p className="font-extrabold text-slate-800 break-all truncate">{file.name}</p>
                                <p className="text-[10px] text-rose-700 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded font-sans text-[10px] mt-1.5 self-start w-fit">
                                  Heuristic: {file.reasons}
                                </p>
                              </div>
                              <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                <span className="font-extrabold text-slate-900">{formatFileSize(file.size)}</span>
                                <span className="text-[9px] text-slate-400 font-sans break-all truncate max-w-[150px]" title={file.path}>
                                  {file.path.split("/").slice(0, -1).join("/") || "/"}
                                </span>
                              </div>
                            </div>
                          ))}

                          {unorganizedFiles.length > visibleItemsCount && (
                            <button
                              onClick={() => setVisibleItemsCount((prev) => prev + 30)}
                              className="py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer self-center px-6 mt-2"
                            >
                              Load more unorganized files ({unorganizedFiles.length - visibleItemsCount} remaining)
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
