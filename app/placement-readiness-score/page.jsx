"use client";

import ComingSoon from "@/app/components/ComingSoon";
import { useEffect, useState, useMemo, useRef } from "react";

const TOOL_STATUS = "upcoming";

// Default input values representing a balanced intermediate student
const defaultInputs = {
  dsa: 5,
  dev: 5,
  resume: 5,
  projects: 5,
  comm: 5,
  apt: 5,
  core: 5,
  internship: "none",
  linkedin: "basic",
  github: "average"
};

const radarSkills = [
  { key: "dsa", label: "DSA Solving" },
  { key: "dev", label: "Development" },
  { key: "projects", label: "Projects" },
  { key: "resume", label: "Resume" },
  { key: "comm", label: "Communication" },
  { key: "apt", label: "Aptitude" },
  { key: "core", label: "Core CS" }
];

const labelWidths = {
  dsa: 76,
  dev: 80,
  projects: 56,
  resume: 56,
  comm: 88,
  apt: 62,
  core: 54
};

const roadmapIcons = {
  "Solve DSA Challenges": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  "Develop Practical Projects": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  "Upgrade Project Details": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  "Improve Resume Bullets": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  "Practice Mock Interviews": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  "Solve Aptitude Quizzes": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h0a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  "Revise CS Core Subjects": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  "Gain Work Experience": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4.67 9.88l-3.32-3.32M12 21v-6m-4 6h8" />
    </svg>
  ),
  "Optimize LinkedIn Page": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 10.742l4.636-2.318M8.684 13.258l4.636 2.318M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  "Enhance GitHub Presence": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  "Solve LeetCode Mediums": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  "Mock Interview Marathons": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  "System Design Basics": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  ),
  "Targeted Networking": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  )
};

// Global config state to load pdfjs worker once
let pdfWorkerConfigured = false;
async function loadPdfJs() {
  const pdfjsLib = await import("pdfjs-dist");
  if (!pdfWorkerConfigured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
    pdfWorkerConfigured = true;
  }
  return pdfjsLib;
}

export default function PlacementReadinessScorePage() {
  if (TOOL_STATUS === "upcoming") {
    return <ComingSoon toolName="Placement Readiness Score" />;
  }

  const [inputs, setInputs] = useState(defaultInputs);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const [hasBackup, setHasBackup] = useState(false);
  const toastTimeoutRef = useRef(null);

  // Tab Manager for AI Profiler
  const [activeProfilerTab, setActiveProfilerTab] = useState("resume"); // 'resume' or 'github'

  // AI Resume Scanner State
  const [aiResults, setAiResults] = useState(null);
  const [scanMode, setScanMode] = useState("pdf"); // 'pdf' or 'text'
  const [manualText, setManualText] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const fileInputRef = useRef(null);

  // AI GitHub Scanner State
  const [githubUsername, setGithubUsername] = useState("");
  const [githubResults, setGithubResults] = useState(null);
  const [isScanningGithub, setIsScanningGithub] = useState(false);
  const [scanGithubStatus, setScanGithubStatus] = useState("");

  // Load from local storage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("placement_readiness_inputs");
    const savedBackup = localStorage.getItem("placement_readiness_inputs_backup");
    const savedAi = localStorage.getItem("placement_readiness_ai_results");
    const savedGithub = localStorage.getItem("placement_readiness_github_results");
    const savedUsername = localStorage.getItem("placement_readiness_github_username");
    
    if (saved) {
      try {
        setInputs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved inputs", e);
      }
    }
    if (savedBackup) {
      setHasBackup(true);
    }
    if (savedAi) {
      try {
        setAiResults(JSON.parse(savedAi));
      } catch (e) {
        console.error("Failed to load AI results", e);
      }
    }
    if (savedGithub) {
      try {
        setGithubResults(JSON.parse(savedGithub));
      } catch (e) {
        console.error("Failed to load GitHub results", e);
      }
    }
    if (savedUsername) {
      setGithubUsername(savedUsername);
    }

    // Set page title and meta description
    const prevTitle = document.title;
    document.title = "Placement Readiness Score Calculator | Boring Tools";
    
    let metaDesc = document.querySelector('meta[name="description"]');
    let prevDesc = metaDesc ? metaDesc.getAttribute("content") : "";
    if (metaDesc) {
      metaDesc.setAttribute("content", "Evaluate your placement preparation with an offline placement readiness assessment including resume, DSA, projects, aptitude and communication skills.");
    } else {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      metaDesc.content = "Evaluate your placement preparation with an offline placement readiness assessment including resume, DSA, projects, aptitude and communication skills.";
      document.head.appendChild(metaDesc);
    }
    
    return () => {
      document.title = prevTitle;
      if (metaDesc && prevDesc) {
        metaDesc.setAttribute("content", prevDesc);
      }
    };
  }, []);

  // Save automatically when inputs change (handles multiple updates safely)
  const handleInputChanges = (updates) => {
    setInputs((prev) => {
      const updated = { ...prev, ...updates };
      if (typeof window !== "undefined") {
        localStorage.setItem("placement_readiness_inputs", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleInputChange = (key, value) => {
    handleInputChanges({ [key]: value });
  };

  // Helper to show a simple fade-out toast
  const showToast = (type, message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, type, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ show: false, type: "", message: "" });
    }, 3000);
  };

  // PDF Extraction Helper
  const extractTextFromPdf = async (file, onProgress) => {
    const pdfjsLib = await loadPdfJs();
    const data = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data,
      useWorkerFetch: false,
      isEvalSupported: false,
      stopAtErrors: false,
    });

    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;
    const pageTexts = [];

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => (typeof item.str === "string" ? item.str : ""))
        .join(" ");

      pageTexts.push(pageText);
      if (onProgress) {
        onProgress(pageNumber, totalPages);
      }
      
      // yield thread control to keep browser interface responsive
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
    }

    return pageTexts.join("\n\n").replace(/\s+/g, " ").trim();
  };

  // Scan Resume with AI using backend API route
  const handleScanResume = async () => {
    let textToAnalyze = "";
    setIsScanning(true);

    try {
      if (scanMode === "pdf") {
        if (!uploadedFile) {
          throw new Error("Please upload a PDF resume file first.");
        }
        setScanStatus("Parsing PDF file client-side...");
        textToAnalyze = await extractTextFromPdf(uploadedFile, (curr, tot) => {
          setScanStatus(`Reading page ${curr} of ${tot}...`);
        });
      } else {
        textToAnalyze = manualText.trim();
        if (!textToAnalyze) {
          throw new Error("Please enter or paste your resume text.");
        }
      }

      if (textToAnalyze.length < 50) {
        throw new Error("Resume content seems too short to analyze.");
      }

      setScanStatus("Analyzing with server-side Groq AI...");

      const response = await fetch("/api/placement-readiness-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeText: textToAnalyze })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || `API returned HTTP status ${response.status}`);
      }

      const parsedResults = await response.json();
      if (typeof parsedResults.rating !== "number") {
        throw new Error("Failed to parse resume score from server.");
      }

      // Update AI results
      setAiResults(parsedResults);
      if (typeof window !== "undefined") {
        localStorage.setItem("placement_readiness_ai_results", JSON.stringify(parsedResults));
      }

      // Sync rating slider
      handleInputChange("resume", Number(parsedResults.rating));
      showToast("success", `AI Scan complete! Score: ${parsedResults.rating}/10`);

    } catch (e) {
      console.error(e);
      showToast("error", e.message || "Failed to analyze resume.");
    } finally {
      setIsScanning(false);
      setScanStatus("");
    }
  };

  // Scan GitHub Portfolio Client-side and dispatch to API
  const handleScanGithub = async () => {
    const username = githubUsername.trim();
    if (!username) {
      showToast("error", "Please enter a valid GitHub username.");
      return;
    }

    setIsScanningGithub(true);
    setScanGithubStatus("Reaching GitHub profile...");

    try {
      // 1. Fetch GitHub User details
      const userRes = await fetch(`https://api.github.com/users/${username}`);
      if (!userRes.ok) {
        if (userRes.status === 404) {
          throw new Error("GitHub username not found. Double check typing.");
        }
        throw new Error("GitHub API rate limit exceeded or connection refused.");
      }
      const userData = await userRes.json();

      setScanGithubStatus("Crawling repositories...");

      // 2. Fetch Repositories
      const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=60`);
      if (!reposRes.ok) {
        throw new Error("Failed to fetch repositories list from GitHub.");
      }
      const reposData = await reposRes.json();

      // 3. Compile GitHub Stats
      let totalStars = 0;
      const languagesMap = {};
      const repos = [];

      reposData.forEach(repo => {
        if (repo.fork) return; // skip forks
        totalStars += repo.stargazers_count || 0;
        
        if (repo.language) {
          languagesMap[repo.language] = (languagesMap[repo.language] || 0) + 1;
        }

        repos.push({
          name: repo.name,
          description: repo.description || "No description provided.",
          stars: repo.stargazers_count || 0,
          language: repo.language || "Unknown",
          updated_at: repo.updated_at
        });
      });

      // Sort languages by frequency
      const sortedLanguages = Object.entries(languagesMap)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);

      // Get top 8 repositories sorted by star count, then updated date
      const sortedRepos = [...repos]
        .sort((a, b) => {
          if (b.stars !== a.stars) return b.stars - a.stars;
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        })
        .slice(0, 8);

      const githubPayload = {
        username: userData.login,
        public_repos: userData.public_repos,
        followers: userData.followers,
        totalStars,
        languages: sortedLanguages,
        repos: sortedRepos
      };

      setScanGithubStatus("Evaluating portfolio with Groq LLM...");

      // 4. Send payload to our backend route
      const response = await fetch("/api/placement-readiness-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ githubData: githubPayload })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || `API returned status ${response.status}`);
      }

      const parsedResults = await response.json();
      if (!parsedResults.githubRating) {
        throw new Error("Failed to parse GitHub rating values from API.");
      }

      // 5. Save results to local storage
      setGithubResults(parsedResults);
      if (typeof window !== "undefined") {
        localStorage.setItem("placement_readiness_github_username", username);
        localStorage.setItem("placement_readiness_github_results", JSON.stringify(parsedResults));
      }

      // Sync ratings (GitHub Portfolio + Projects Quality + DSA + Dev) safely without stale state overwriting
      const cleanGitRating = String(parsedResults.githubRating || "average").toLowerCase();
      handleInputChanges({
        github: cleanGitRating,
        projects: Number(parsedResults.projectRating || 5),
        dsa: Number(parsedResults.dsaRating || inputs.dsa),
        dev: Number(parsedResults.devRating || inputs.dev)
      });
      showToast("success", `GitHub Scan complete! Projects rated: ${parsedResults.projectRating || 5}/10`);

    } catch (e) {
      console.error(e);
      showToast("error", e.message || "Failed to analyze GitHub portfolio.");
    } finally {
      setIsScanningGithub(false);
      setScanGithubStatus("");
    }
  };

  // Reset inputs
  const handleReset = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("placement_readiness_inputs_backup", JSON.stringify(inputs));
      if (aiResults) {
        localStorage.setItem("placement_readiness_ai_backup", JSON.stringify(aiResults));
      }
      if (githubResults) {
        localStorage.setItem("placement_readiness_github_backup", JSON.stringify(githubResults));
      }
    }
    setHasBackup(true);
    setInputs(defaultInputs);
    setAiResults(null);
    setGithubResults(null);
    setGithubUsername("");
    if (typeof window !== "undefined") {
      localStorage.setItem("placement_readiness_inputs", JSON.stringify(defaultInputs));
      localStorage.removeItem("placement_readiness_ai_results");
      localStorage.removeItem("placement_readiness_github_results");
      localStorage.removeItem("placement_readiness_github_username");
    }
    showToast("success", "Values reset to defaults. You can undo this.");
  };

  // Restore previous backup session
  const handleRestoreSession = () => {
    if (typeof window !== "undefined") {
      const backup = localStorage.getItem("placement_readiness_inputs_backup");
      const aiBackup = localStorage.getItem("placement_readiness_ai_backup");
      const gitBackup = localStorage.getItem("placement_readiness_github_backup");
      const gitUsername = localStorage.getItem("placement_readiness_github_username");
      
      if (backup) {
        try {
          const parsed = JSON.parse(backup);
          setInputs(parsed);
          localStorage.setItem("placement_readiness_inputs", backup);
          
          if (aiBackup) {
            const parsedAi = JSON.parse(aiBackup);
            setAiResults(parsedAi);
            localStorage.setItem("placement_readiness_ai_results", aiBackup);
          } else {
            setAiResults(null);
            localStorage.removeItem("placement_readiness_ai_results");
          }

          if (gitBackup) {
            const parsedGit = JSON.parse(gitBackup);
            setGithubResults(parsedGit);
            localStorage.setItem("placement_readiness_github_results", gitBackup);
          } else {
            setGithubResults(null);
            localStorage.removeItem("placement_readiness_github_results");
          }

          if (gitUsername) {
            setGithubUsername(gitUsername);
          }
          
          showToast("success", "Previous session restored successfully.");
        } catch (e) {
          showToast("error", "Failed to restore previous session.");
        }
      } else {
        showToast("error", "No backup session found.");
      }
    }
  };

  // Score Calculation
  const score = useMemo(() => {
    const dsaVal = Number(inputs.dsa) || 0;
    const devVal = Number(inputs.dev) || 0;
    const resumeVal = Number(inputs.resume) || 0;
    const projectsVal = Number(inputs.projects) || 0;
    const commVal = Number(inputs.comm) || 0;
    const aptVal = Number(inputs.apt) || 0;
    const coreVal = Number(inputs.core) || 0;
    
    let internshipScore = 0;
    if (inputs.internship === "good") internshipScore = 5;
    else if (inputs.internship === "small") internshipScore = 2.5;

    let linkedinScore = 0;
    if (inputs.linkedin === "optimized") linkedinScore = 2.5;
    else if (inputs.linkedin === "basic") linkedinScore = 1.25;

    let githubScore = 0;
    if (inputs.github === "strong") githubScore = 2.5;
    else if (inputs.github === "average") githubScore = 1.25;

    const total = (dsaVal * 2) + 
                  (devVal * 1.5) + 
                  (projectsVal * 1.5) + 
                  (resumeVal * 1) + 
                  (commVal * 1) + 
                  (aptVal * 1) + 
                  (coreVal * 1) + 
                  internshipScore + 
                  linkedinScore + 
                  githubScore;
                  
    return Math.min(100, Math.max(0, Math.round(total * 10) / 10));
  }, [inputs]);

  // Determine readiness tier details
  const tierDetails = useMemo(() => {
    if (score < 40) {
      return {
        label: "Beginner",
        colorClass: "bg-red-50 text-red-700 border-red-200",
        ringClass: "stroke-red-500 text-red-500",
        accentColor: "#ef4444",
        desc: "You are in the early stages of placement preparation. Focus on laying solid foundations in DSA, writing your first resume, and building core projects."
      };
    } else if (score < 70) {
      return {
        label: "Intermediate",
        colorClass: "bg-amber-50 text-amber-700 border-amber-200",
        ringClass: "stroke-amber-500 text-amber-500",
        accentColor: "#f59e0b",
        desc: "You have built some core skills but require deeper practice. Optimize your resume, practice mock interviews, and work on higher-quality development projects."
      };
    } else if (score < 85) {
      return {
        label: "Placement Ready",
        colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        ringClass: "stroke-emerald-500 text-emerald-500",
        accentColor: "#10b981",
        desc: "Great job! You satisfy the requirements for most company drives. Start reviewing core CS subjects, polishing your profile, and practice timing for coding assessments."
      };
    } else {
      return {
        label: "Excellent Candidate",
        colorClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
        ringClass: "stroke-indigo-600 text-indigo-600",
        accentColor: "#4f46e5",
        desc: "Outstanding profile! You have excellent readiness across almost all areas. Focus on seeking referrals at premium product companies, and refine system design basics."
      };
    }
  }, [score]);

  // Skill analysis (Strengths & Weaknesses)
  const analysis = useMemo(() => {
    const strengths = [];
    const weaknesses = [];
    
    const skillNames = {
      dsa: "DSA Problem Solving",
      dev: "Development Skills",
      resume: "Resume Quality",
      projects: "Projects Quality",
      comm: "Communication Skills",
      apt: "Aptitude Preparation",
      core: "Core CS Knowledge"
    };

    // Numeric
    Object.keys(skillNames).forEach((key) => {
      const val = Number(inputs[key]) || 0;
      if (val >= 7) {
        strengths.push({
          label: skillNames[key],
          value: `${val}/10`,
          desc: `Solid readiness in ${skillNames[key].toLowerCase()}.`
        });
      } else if (val < 5) {
        weaknesses.push({
          label: skillNames[key],
          value: `${val}/10`,
          desc: `Needs attention. Review resources to improve ${skillNames[key].toLowerCase()}.`
        });
      }
    });

    // Internship
    if (inputs.internship === "good") {
      strengths.push({ label: "Internship Experience", value: "Good", desc: "Hands-on work experience gives you a practical edge." });
    } else if (inputs.internship === "none") {
      weaknesses.push({ label: "Internship Experience", value: "None", desc: "Consider completing Virtual Internships or launching open-source contributions." });
    }

    // LinkedIn
    if (inputs.linkedin === "optimized") {
      strengths.push({ label: "LinkedIn Profile", value: "Optimized", desc: "Professional identity is optimized to attract recruiters." });
    } else if (inputs.linkedin === "not_created") {
      weaknesses.push({ label: "LinkedIn Profile", value: "Not Created", desc: "Setting up a LinkedIn profile is crucial for networking and discovery." });
    }

    // GitHub
    if (inputs.github === "strong") {
      strengths.push({ label: "GitHub Portfolio", value: "Strong", desc: "Solid code repository signals active development and clean habits." });
    } else if (inputs.github === "empty") {
      weaknesses.push({ label: "GitHub Portfolio", value: "Empty", desc: "Fill up your GitHub with clean projects and descriptive documentation." });
    }

    // Inject AI Resume results if scanned
    if (aiResults) {
      if (aiResults.strengths) {
        aiResults.strengths.forEach((strText) => {
          strengths.push({
            label: "AI Resume Insight",
            value: "AI",
            desc: strText
          });
        });
      }
      if (aiResults.improvements) {
        aiResults.improvements.forEach((impText) => {
          weaknesses.push({
            label: "AI Resume Scanner Suggestion",
            value: "AI",
            desc: impText
          });
        });
      }
    }

    // Inject AI GitHub results if scanned
    if (githubResults) {
      if (githubResults.githubStrengths) {
        githubResults.githubStrengths.forEach((strText) => {
          strengths.push({
            label: "AI GitHub Insight",
            value: "AI",
            desc: strText
          });
        });
      }
      if (githubResults.githubImprovements) {
        githubResults.githubImprovements.forEach((impText) => {
          weaknesses.push({
            label: "AI GitHub Scanner Suggestion",
            value: "AI",
            desc: impText
          });
        });
      }
    }

    return { strengths, weaknesses };
  }, [inputs, aiResults, githubResults]);

  // Sorted list of skills to show Highest/Lowest scoring items
  const sortedSkillList = useMemo(() => {
    const list = [
      { name: "DSA Solving", score: Number(inputs.dsa) || 0, display: `${inputs.dsa}/10` },
      { name: "Development", score: Number(inputs.dev) || 0, display: `${inputs.dev}/10` },
      { name: "Projects", score: Number(inputs.projects) || 0, display: `${inputs.projects}/10` },
      { name: "Resume", score: Number(inputs.resume) || 0, display: `${inputs.resume}/10` },
      { name: "Communication", score: Number(inputs.comm) || 0, display: `${inputs.comm}/10` },
      { name: "Aptitude Prep", score: Number(inputs.apt) || 0, display: `${inputs.apt}/10` },
      { name: "Core CS", score: Number(inputs.core) || 0, display: `${inputs.core}/10` },
      { 
        name: "Internship", 
        score: inputs.internship === "good" ? 10 : (inputs.internship === "small" ? 5 : 0), 
        display: inputs.internship === "good" ? "Good" : (inputs.internship === "small" ? "Small" : "None")
      },
      { 
        name: "LinkedIn", 
        score: inputs.linkedin === "optimized" ? 10 : (inputs.linkedin === "basic" ? 5 : 0), 
        display: inputs.linkedin === "optimized" ? "Optimized" : (inputs.linkedin === "basic" ? "Basic" : "Not Created")
      },
      { 
        name: "GitHub", 
        score: inputs.github === "strong" ? 10 : (inputs.github === "average" ? 5 : 0), 
        display: inputs.github === "strong" ? "Strong" : (inputs.github === "average" ? "Average" : "Empty")
      }
    ];

    const sorted = [...list].sort((a, b) => a.score - b.score);
    return {
      lowest: sorted.slice(0, 2),
      highest: [...sorted].reverse().slice(0, 2)
    };
  }, [inputs]);

  // Roadmap calculation
  const roadmap = useMemo(() => {
    const recommendations = {
      dsa: { title: "Solve DSA Challenges", desc: "Solve 20+ DSA questions focusing on Arrays, Hashes, and Stack. Review complex time complexities." },
      dev: { title: "Develop Practical Projects", desc: "Create a complete, responsive application using React/Next.js and publish it live." },
      projects: { title: "Upgrade Project Details", desc: "Clean up project code, create documentation in README.md, and include operational host links." },
      resume: { title: "Improve Resume Bullets", desc: "Revise experience bullets using standard result-driven metrics (STAR/XYZ methodology)." },
      comm: { title: "Practice Mock Interviews", desc: "Record yourself answering behavioral prompts. Check speech rate, structuring, and clarity." },
      apt: { title: "Solve Aptitude Quizzes", desc: "Spend time doing online logic, quant, and reasoning sets under strict clock constraints." },
      core: { title: "Revise CS Core Subjects", desc: "Read database topics (SQL, indexing), OS scheduling patterns, and networking layers." },
      internship: { title: "Acquire Industry Credits", desc: "Seek virtual projects, freelancing tasks, or contribute actively to reputable open source portals." },
      linkedin: { title: "Optimize LinkedIn Page", desc: "Add a crisp profile banner, update headline, write an objective summary, and tag relevant skills." },
      github: { title: "Enhance GitHub Presence", desc: "Push your project repos, write installation guidelines, and pin your best three works." }
    };

    const scores = [
      { key: "dsa", score: Number(inputs.dsa) || 0 },
      { key: "dev", score: Number(inputs.dev) || 0 },
      { key: "projects", score: Number(inputs.projects) || 0 },
      { key: "resume", score: Number(inputs.resume) || 0 },
      { key: "comm", score: Number(inputs.comm) || 0 },
      { key: "apt", score: Number(inputs.apt) || 0 },
      { key: "core", score: Number(inputs.core) || 0 },
      { key: "internship", score: inputs.internship === "good" ? 10 : (inputs.internship === "small" ? 5 : 0) },
      { key: "linkedin", score: inputs.linkedin === "optimized" ? 10 : (inputs.linkedin === "basic" ? 5 : 0) },
      { key: "github", score: inputs.github === "strong" ? 10 : (inputs.github === "average" ? 5 : 0) }
    ];

    const weakItems = scores
      .filter(s => s.score < 7)
      .sort((a, b) => a.score - b.score);

    const steps = [];
    weakItems.forEach(item => {
      if (steps.length < 4) {
        let rec = { ...recommendations[item.key] };
        
        // Inject specific AI recommendation into resume week if available
        if (item.key === "resume" && aiResults?.roadmapItem) {
          rec.desc = aiResults.roadmapItem;
        }
        
        // Inject specific AI recommendation into github/projects week if available
        if ((item.key === "github" || item.key === "projects") && githubResults?.githubRoadmapItem) {
          rec.desc = githubResults.githubRoadmapItem;
        }
        
        steps.push(rec);
      }
    });

    const standardBackups = [
      { title: "Solve LeetCode Mediums", desc: "Practice dynamic programming, tree traversal, and graph algorithms." },
      { title: "Mock Interview Marathons", desc: "Engage in simulated interviews with peers. Focus on explaining coding out loud." },
      { title: "System Design Basics", desc: "Study key system design topics like caching, scaling databases, and load balancers." },
      { title: "Targeted Networking", desc: "Identify 10 potential companies and approach professionals for advice or referrals." }
    ];

    let backupIdx = 0;
    while (steps.length < 4 && backupIdx < standardBackups.length) {
      if (!steps.some(s => s.title === standardBackups[backupIdx].title)) {
        steps.push(standardBackups[backupIdx]);
      }
      backupIdx++;
    }

    return steps.map((item, idx) => ({
      week: `Week ${idx + 1}`,
      ...item
    }));
  }, [inputs, aiResults, githubResults]);

  // Coordinate math for radar chart
  const getRadarCoords = (index, value) => {
    const maxVal = 10;
    const radius = 135;
    const cx = 200;
    const cy = 200;
    const angle = (index * 2 * Math.PI) / 7 - Math.PI / 2;
    const r = (value / maxVal) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    };
  };

  // Tapered Gauge needle coordinates
  const gaugeNeedlePoints = useMemo(() => {
    const angle = Math.PI - (score / 100) * Math.PI;
    const length = 94;
    const baseWidth = 5.5;

    const tipX = 150 + length * Math.cos(angle);
    const tipY = 130 - length * Math.sin(angle);

    const baseLeftX = 150 + baseWidth * Math.cos(angle - Math.PI / 2);
    const baseLeftY = 130 - baseWidth * Math.sin(angle - Math.PI / 2);

    const baseRightX = 150 + baseWidth * Math.cos(angle + Math.PI / 2);
    const baseRightY = 130 - baseWidth * Math.sin(angle + Math.PI / 2);

    return {
      points: `${baseLeftX},${baseLeftY} ${tipX},${tipY} ${baseRightX},${baseRightY}`,
      tipX,
      tipY
    };
  }, [score]);

  // Export actions
  const getReportString = () => {
    return [
      "==================================================",
      "PLACEMENT READINESS REPORT",
      "Generated offline via BoringTools",
      `Date: ${new Date().toLocaleDateString()}`,
      "==================================================",
      "",
      `OVERALL SCORE: ${score}/100`,
      `PREPARATION LEVEL: ${tierDetails.label}`,
      "",
      "--- SCORE BREAKDOWN ---",
      `- DSA Skills: ${inputs.dsa}/10`,
      `- Development Skills: ${inputs.dev}/10`,
      `- Projects Quality: ${inputs.projects}/10`,
      `- Resume Quality: ${inputs.resume}/10`,
      `- Communication: ${inputs.comm}/10`,
      `- Aptitude Preparation: ${inputs.apt}/10`,
      `- Core Subject Knowledge: ${inputs.core}/10`,
      `- Internship Experience: ${inputs.internship.toUpperCase()}`,
      `- LinkedIn Profile: ${inputs.linkedin.toUpperCase()}`,
      `- GitHub Portfolio: ${inputs.github.toUpperCase()}`,
      "",
      "--- ANALYSIS ---",
      "STRENGTHS:",
      analysis.strengths.length > 0
        ? analysis.strengths.map(s => `  • ${s.label}: ${s.desc}`).join("\n")
        : "  • None identified yet. Work on boosting skills to 7+.",
      "",
      "WEAK AREAS:",
      analysis.weaknesses.length > 0
        ? analysis.weaknesses.map(w => `  • ${w.label}: ${w.desc}`).join("\n")
        : "  • No major weak areas found! Great job maintaining balanced prep.",
      "",
      "--- 4-WEEK ROADMAP ---",
      roadmap.map(r => `${r.week} - ${r.title}\n  Action: ${r.desc}`).join("\n\n"),
      "",
      "==================================================",
      "Visit BoringTools to evaluate more skills.",
      "=================================================="
    ].join("\n");
  };

  const handleCopyReport = () => {
    try {
      navigator.clipboard.writeText(getReportString());
      showToast("success", "Markdown report copied to clipboard!");
    } catch (e) {
      showToast("error", "Failed to copy report to clipboard.");
    }
  };

  const handleDownloadTxt = () => {
    try {
      const element = document.createElement("a");
      const file = new Blob([getReportString()], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = "placement_readiness_report.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showToast("success", "Report downloaded successfully!");
    } catch (e) {
      showToast("error", "Failed to trigger download.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-sm w-full animate-pulse">
          <div className="h-6 w-32 bg-slate-200 rounded mx-auto mb-3" />
          <div className="h-4 w-48 bg-slate-100 rounded mx-auto" />
        </div>
      </div>
    );
  }

  // Circular progress math
  const strokeRadius = 65;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  const strokeOffset = strokeCircumference - (score / 100) * strokeCircumference;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Toast Notification */}
        {toast.show && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl transition-all duration-300 transform translate-y-0 ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <span className="text-sm font-semibold">{toast.message}</span>
            <button
              onClick={() => setToast({ show: false, type: "", message: "" })}
              className="text-xs font-bold hover:underline cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Hero Section */}
        <div className="flex flex-col gap-2 items-center text-center mb-2 print:mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-600">Career tool</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Placement Readiness Score
          </h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Evaluate your placement preparation with an offline placement readiness assessment including resume, DSA, projects, aptitude and communication skills.
          </p>
        </div>

        {/* Action Controls for session */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 shadow-sm transition hover:-translate-y-px cursor-pointer"
            >
              Reset Session
            </button>
            {hasBackup && (
              <button
                onClick={handleRestoreSession}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 shadow-sm transition hover:-translate-y-px cursor-pointer"
              >
                Restore Previous Session
              </button>
            )}
          </div>
          <div className="text-xs text-slate-400 font-medium italic">
            Saved automatically in local browser storage
          </div>
        </div>

        {/* Main Grid: Inputs (Left) and Results Dashboard (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: INPUTS (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col gap-6 print:hidden">
            
            {/* Unified AI Profile Analyzer Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-600">AI Profile Analyzer</span>
                  <h2 className="text-base font-bold text-slate-950 mt-0.5">Resume & Portfolio Scan</h2>
                </div>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-black uppercase rounded-full">Groq AI</span>
              </div>

              {/* Tab Selector: Resume vs GitHub */}
              <div className="flex bg-slate-50 p-1.5 rounded-xl text-xs font-bold text-slate-500 mb-4 border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setActiveProfilerTab("resume")}
                  className={`flex-1 py-1.5 rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeProfilerTab === "resume" ? "bg-white text-slate-950 shadow-sm" : "hover:text-slate-800"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Resume Scanner</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveProfilerTab("github")}
                  className={`flex-1 py-1.5 rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeProfilerTab === "github" ? "bg-white text-slate-950 shadow-sm" : "hover:text-slate-800"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span>GitHub Analyzer</span>
                </button>
              </div>

              {/* Resume Scanner Content */}
              {activeProfilerTab === "resume" && (
                <div className="flex flex-col gap-3">
                  <div className="flex border-b border-slate-200 text-xs font-semibold text-slate-500 mb-2">
                    <button
                      onClick={() => setScanMode("pdf")}
                      className={`flex-1 pb-2 border-b-2 transition ${
                        scanMode === "pdf" ? "border-orange-500 text-orange-600" : "border-transparent hover:text-slate-800"
                      }`}
                    >
                      PDF Upload
                    </button>
                    <button
                      onClick={() => setScanMode("text")}
                      className={`flex-1 pb-2 border-b-2 transition ${
                        scanMode === "text" ? "border-orange-500 text-orange-600" : "border-transparent hover:text-slate-800"
                      }`}
                    >
                      Paste Text
                    </button>
                  </div>

                  {scanMode === "pdf" ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-all duration-150 flex flex-col items-center justify-center min-h-[100px] select-none"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".pdf"
                        onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {uploadedFile ? (
                        <p className="text-xs font-bold text-slate-800 truncate max-w-xs">{uploadedFile.name}</p>
                      ) : (
                        <p className="text-xs text-slate-500">Drag & drop or click to upload your PDF resume</p>
                      )}
                    </div>
                  ) : (
                    <textarea
                      placeholder="Paste your resume content (work history, skills, projects) here..."
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)}
                      className="w-full min-h-[100px] p-3 border border-slate-300 rounded-xl bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400"
                    />
                  )}

                  <button
                    onClick={handleScanResume}
                    disabled={isScanning}
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow disabled:bg-slate-400 cursor-pointer"
                  >
                    {isScanning ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                        <span>{scanStatus}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-slate-100 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <span>Analyze Resume with Groq AI</span>
                      </>
                    )}
                  </button>

                  {aiResults && (
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-black text-xs shrink-0 select-none">
                        {aiResults.rating}
                      </div>
                      <div className="flex-1 flex flex-col gap-0.5">
                        <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">AI Evaluation Sync</span>
                        <p className="text-[11px] text-emerald-900 leading-tight">
                          Resume rated <strong>{aiResults.rating}/10</strong>. Insights mapped into report.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* GitHub Analyzer Content */}
              {activeProfilerTab === "github" && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="git-user" className="text-xs font-semibold text-slate-700">GitHub Profile Username</label>
                    <input
                      id="git-user"
                      type="text"
                      placeholder="e.g. torvalds"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    onClick={handleScanGithub}
                    disabled={isScanningGithub}
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow disabled:bg-slate-400 cursor-pointer"
                  >
                    {isScanningGithub ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                        <span>{scanGithubStatus}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-slate-100 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <span>Analyze GitHub Portfolio</span>
                      </>
                    )}
                  </button>

                  {githubResults && (
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-black text-xs shrink-0 select-none uppercase">
                        {githubResults.githubRating.slice(0, 3)}
                      </div>
                      <div className="flex-1 flex flex-col gap-0.5">
                        <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">AI Portfolio Sync</span>
                        <p className="text-[11px] text-emerald-900 leading-tight">
                          Portfolio: <strong className="capitalize">{githubResults.githubRating}</strong> | Projects: <strong>{githubResults.projectRating}/10</strong>
                        </p>
                        <p className="text-[10px] text-emerald-800 leading-normal mt-0.5">
                          Synced: DSA: <strong>{githubResults.dsaRating || inputs.dsa}/10</strong> | Dev: <strong>{githubResults.devRating || inputs.dev}/10</strong>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Core Tech Skills Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">01 / Technical Foundations</span>
                <h2 className="text-lg font-bold text-slate-950 mt-0.5">Core Technical Skills</h2>
              </div>
              
              <div className="flex flex-col gap-5">
                {/* DSA Skill */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="dsa" className="text-sm font-semibold text-slate-800">DSA Skill</label>
                    <span className="text-xs font-black bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">{inputs.dsa}/10</span>
                  </div>
                  <input
                    id="dsa"
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={inputs.dsa}
                    onChange={(e) => handleInputChange("dsa", parseInt(e.target.value))}
                    className="premium-slider w-full"
                  />
                  <span className="text-[10.5px] text-slate-400 font-medium">LeetCode problems solved, patterns, graphs, trees</span>
                </div>

                {/* Dev Skill */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="dev" className="text-sm font-semibold text-slate-800">Development Skill</label>
                    <span className="text-xs font-black bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">{inputs.dev}/10</span>
                  </div>
                  <input
                    id="dev"
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={inputs.dev}
                    onChange={(e) => handleInputChange("dev", parseInt(e.target.value))}
                    className="premium-slider w-full"
                  />
                  <span className="text-[10.5px] text-slate-400 font-medium">Frontend, Backend, APIs, databases, hosting, git</span>
                </div>

                {/* Projects Quality */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="projects" className="text-sm font-semibold text-slate-800">Projects Quality</label>
                    <span className="text-xs font-black bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">{inputs.projects}/10</span>
                  </div>
                  <input
                    id="projects"
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={inputs.projects}
                    onChange={(e) => handleInputChange("projects", parseInt(e.target.value))}
                    className="premium-slider w-full"
                  />
                  <span className="text-[10.5px] text-slate-400 font-medium">Complexity, live links, README docs, real users</span>
                </div>

                {/* Core CS Subjects */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="core" className="text-sm font-semibold text-slate-800">Core CS Knowledge</label>
                    <span className="text-xs font-black bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">{inputs.core}/10</span>
                  </div>
                  <input
                    id="core"
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={inputs.core}
                    onChange={(e) => handleInputChange("core", parseInt(e.target.value))}
                    className="premium-slider w-full"
                  />
                  <span className="text-[10.5px] text-slate-400 font-medium">Operating Systems, DBMS, SQL, Computer Networks</span>
                </div>
              </div>
            </div>

            {/* Professional & Soft Skills Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">02 / Profile & Soft Skills</span>
                <h2 className="text-lg font-bold text-slate-950 mt-0.5">Professional & Communication</h2>
              </div>
              
              <div className="flex flex-col gap-5">
                {/* Resume Quality */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="resume" className="text-sm font-semibold text-slate-800">Resume Quality</label>
                    <span className="text-xs font-black bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">{inputs.resume}/10</span>
                  </div>
                  <input
                    id="resume"
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={inputs.resume}
                    onChange={(e) => handleInputChange("resume", parseInt(e.target.value))}
                    className="premium-slider w-full"
                  />
                  <span className="text-[10.5px] text-slate-400 font-medium">
                    Structure, metric-driven bullet points, ATS formatting
                  </span>
                </div>

                {/* Communication Skill */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="comm" className="text-sm font-semibold text-slate-800">Communication Skill</label>
                    <span className="text-xs font-black bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">{inputs.comm}/10</span>
                  </div>
                  <input
                    id="comm"
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={inputs.comm}
                    onChange={(e) => handleInputChange("comm", parseInt(e.target.value))}
                    className="premium-slider w-full"
                  />
                  <span className="text-[10.5px] text-slate-400 font-medium">Clarity, structuring (STAR), behavioral checks</span>
                </div>

                {/* Aptitude Prep */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="apt" className="text-sm font-semibold text-slate-800">Aptitude Preparation</label>
                    <span className="text-xs font-black bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">{inputs.apt}/10</span>
                  </div>
                  <input
                    id="apt"
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={inputs.apt}
                    onChange={(e) => handleInputChange("apt", parseInt(e.target.value))}
                    className="premium-slider w-full"
                  />
                  <span className="text-[10.5px] text-slate-400 font-medium">Quantitative logic, math, reasoning speed</span>
                </div>
              </div>
            </div>

            {/* Experience & Presence Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">03 / Experience & Presence</span>
                <h2 className="text-lg font-bold text-slate-950 mt-0.5">Online Profile & Internships</h2>
              </div>
              
              <div className="flex flex-col gap-4">
                {/* Internship Experience */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-800">Internship Experience</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["none", "small", "good"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleInputChange("internship", opt)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all duration-150 cursor-pointer ${
                          inputs.internship === opt
                            ? "bg-orange-600 border-orange-600 text-white shadow-sm shadow-orange-200"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-orange-50 hover:border-orange-200"
                        }`}
                      >
                        {opt === "none" ? "None" : opt === "small" ? "Small (1-3m)" : "Good (3m+)"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* LinkedIn Profile */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-800">LinkedIn Profile</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["not_created", "basic", "optimized"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleInputChange("linkedin", opt)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all duration-150 cursor-pointer ${
                          inputs.linkedin === opt
                            ? "bg-orange-600 border-orange-600 text-white shadow-sm shadow-orange-200"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-orange-50 hover:border-orange-200"
                        }`}
                      >
                        {opt === "not_created" ? "Not Created" : opt === "basic" ? "Basic" : "Optimized"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* GitHub Portfolio */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-800">GitHub Portfolio</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["empty", "average", "strong"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleInputChange("github", opt)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all duration-150 cursor-pointer ${
                          inputs.github === opt
                            ? "bg-orange-600 border-orange-600 text-white shadow-sm shadow-orange-200"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-orange-50 hover:border-orange-200"
                        }`}
                      >
                        {opt === "empty" ? "Empty" : opt === "average" ? "Average" : "Strong"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: RESULTS DASHBOARD (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col gap-6 results-panel">
            
            {/* Main Score Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
              
              {/* Header inside printing mode */}
              <div className="hidden print:block mb-4 text-center">
                <h1 className="text-2xl font-bold text-slate-900">Placement Readiness Report</h1>
                <p className="text-xs text-slate-500">Generated on {new Date().toLocaleDateString()} via BoringTools</p>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6 justify-center w-full">
                
                {/* Circular indicator */}
                <div className="relative flex items-center justify-center">
                  <svg className="w-40 h-40 transform -rotate-90">
                    {/* Background track circle */}
                    <circle
                      cx="80"
                      cy="80"
                      r={strokeRadius}
                      className="stroke-slate-100"
                      strokeWidth="12"
                      fill="transparent"
                    />
                    {/* Colored overlay circle */}
                    <circle
                      cx="80"
                      cy="80"
                      r={strokeRadius}
                      className={`transition-all duration-500 ease-out ${tierDetails.ringClass}`}
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={strokeCircumference}
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tighter tabular-nums">
                      {score}%
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-0.5">
                      Ready
                    </span>
                  </div>
                </div>

                {/* Score Status info */}
                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-2.5">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block">Readiness Tier</span>
                    <div className="flex items-center gap-2 mt-1 justify-center md:justify-start">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${tierDetails.colorClass}`}>
                        {tierDetails.label}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
                    {tierDetails.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Visuals: Radar Chart + Readiness Gauge Meter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Skill Map (Radar Chart) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col">
                <div className="border-b border-slate-100 pb-2.5 mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">Skill Map (Radar Chart)</h3>
                  <span className="text-[10.5px] font-bold text-slate-400">Scale: 0 - 10</span>
                </div>
                
                <div className="flex-1 flex justify-center items-center py-2 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden min-h-[300px]">
                  <svg viewBox="0 0 400 400" className="w-full max-w-[280px] h-auto select-none">
                    <defs>
                      <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={tierDetails.accentColor} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={tierDetails.accentColor} stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Circular radial glow background */}
                    <circle cx="200" cy="200" r="135" fill="url(#radar-glow)" />

                    {/* Concentric grid lines (Polygons) */}
                    {[2, 4, 6, 8, 10].map((level) => {
                      const points = Array.from({ length: 7 }, (_, idx) => {
                        const coord = getRadarCoords(idx, level);
                        return `${coord.x},${coord.y}`;
                      }).join(" ");
                      return (
                        <g key={level}>
                          <polygon
                            points={points}
                            className="stroke-slate-200/90 fill-none"
                            strokeWidth={level === 10 ? "1.5" : "1"}
                            strokeDasharray={level === 10 ? "none" : "3,3"}
                          />
                          {/* Scale numbers along the vertical axis */}
                          <text
                            x="200"
                            y={200 - (level / 10) * 135 - 3}
                            textAnchor="middle"
                            className="text-[9px] font-bold fill-slate-400/90"
                          >
                            {level}
                          </text>
                        </g>
                      );
                    })}

                    {/* Radial axis lines */}
                    {Array.from({ length: 7 }).map((_, idx) => {
                      const outer = getRadarCoords(idx, 10);
                      return (
                        <line
                          key={idx}
                          x1="200"
                          y1="200"
                          x2={outer.x}
                          y2={outer.y}
                          className="stroke-slate-200"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Polygon mapping user's actual scores */}
                    {(() => {
                      const points = radarSkills.map((s, idx) => {
                        const val = inputs[s.key];
                        const coord = getRadarCoords(idx, val);
                        return `${coord.x},${coord.y}`;
                      }).join(" ");
                      return (
                        <g>
                          {/* Main area fill */}
                          <polygon
                            points={points}
                            fill={`${tierDetails.accentColor}28`}
                            stroke={tierDetails.accentColor}
                            strokeWidth="3.5"
                            strokeLinejoin="round"
                          />
                          {/* Outer glowing vertices */}
                          {radarSkills.map((s, idx) => {
                            const val = inputs[s.key];
                            const coord = getRadarCoords(idx, val);
                            return (
                              <g key={s.key}>
                                <circle
                                  cx={coord.x}
                                  cy={coord.y}
                                  r="5"
                                  fill={tierDetails.accentColor}
                                />
                                <circle
                                  cx={coord.x}
                                  cy={coord.y}
                                  r="2"
                                  fill="#ffffff"
                                />
                              </g>
                            );
                          })}
                        </g>
                      );
                    })()}

                    {/* Premium Label Badges */}
                    {radarSkills.map((skill, idx) => {
                      const angle = (idx * 2 * Math.PI) / 7 - Math.PI / 2;
                      const cos = Math.cos(angle);
                      const sin = Math.sin(angle);
                      
                      const labelRadius = 135 + 24;
                      const lx = 200 + labelRadius * cos;
                      const ly = 200 + labelRadius * sin;
                      
                      const w = labelWidths[skill.key] || 60;
                      const h = 20;
                      const rx = lx - w / 2;
                      const ry = ly - h / 2;
                      
                      return (
                        <g key={skill.key} className="transition-all duration-300">
                          {/* Connecting dashed anchor line */}
                          <line
                            x1={200 + 135 * cos}
                            y1={200 + 135 * sin}
                            x2={lx}
                            y2={ly}
                            stroke="#cbd5e1"
                            strokeWidth="1"
                            strokeDasharray="2,2"
                          />
                          {/* Badge container rect */}
                          <rect
                            x={rx}
                            y={ry}
                            width={w}
                            height={h}
                            rx="6"
                            fill="#ffffff"
                            stroke="#e2e8f0"
                            strokeWidth="1.5"
                            className="shadow-sm filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                          />
                          {/* Text label */}
                          <text
                            x={lx}
                            y={ly}
                            textAnchor="middle"
                            dy="3.5px"
                            className="text-[9.2px] font-extrabold fill-slate-600 select-none"
                          >
                            {skill.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Readiness Gauge Meter */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div className="border-b border-slate-100 pb-2.5 mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">Readiness Meter</h3>
                  <span className="text-[10.5px] font-bold text-slate-400">Total Gauge</span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center py-2 bg-slate-50 rounded-xl border border-slate-100 min-h-[300px]">
                  <svg viewBox="0 0 300 160" className="w-full max-w-[240px] h-auto select-none">
                    <defs>
                      <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="40%" stopColor="#f59e0b" />
                        <stop offset="75%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                    </defs>
                    
                    {/* Inactive background track */}
                    <path
                      d="M 40 130 A 110 110 0 0 1 260 130"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="16"
                      strokeLinecap="round"
                    />
                    
                    {/* Zone indicators color stroke */}
                    <path
                      d="M 40 130 A 110 110 0 0 1 260 130"
                      fill="none"
                      stroke="url(#gauge-gradient)"
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeDasharray="345.57"
                    />

                    {/* Scale marker annotations */}
                    <text x="35" y="152" className="text-[9px] font-extrabold fill-slate-400" textAnchor="middle">0</text>
                    <text x="110" y="44" className="text-[9px] font-extrabold fill-slate-400" textAnchor="middle">40</text>
                    <text x="190" y="44" className="text-[9px] font-extrabold fill-slate-400" textAnchor="middle">70</text>
                    <text x="265" y="152" className="text-[9px] font-extrabold fill-slate-400" textAnchor="middle">100</text>

                    {/* Elegant tapered speedometer needle pointer */}
                    <polygon
                      points={gaugeNeedlePoints.points}
                      fill="#1e293b"
                      stroke="#1e293b"
                      strokeWidth="1"
                      strokeLinejoin="round"
                    />
                    {/* Glowing needle pointer tip */}
                    <circle cx={gaugeNeedlePoints.tipX} cy={gaugeNeedlePoints.tipY} r="4" fill={tierDetails.accentColor} stroke="#ffffff" strokeWidth="1.5" />

                    {/* Large stylish glassmorphic center hub */}
                    <circle cx="150" cy="130" r="14" fill="#ffffff" stroke="#1e293b" strokeWidth="3.2" />
                    <circle cx="150" cy="130" r="6" fill="#1e293b" />
                  </svg>
                  
                  {/* Interactive Reactive Tier Badges */}
                  <div className="flex justify-between w-full px-4 text-[9px] font-black -mt-1.5 transition-all duration-300">
                    <span className={`uppercase transition-all duration-300 ${score < 40 ? "text-red-600 scale-105 font-black filter drop-shadow-[0_1px_3px_rgba(239,68,68,0.15)]" : "text-slate-400"}`}>
                      Beginner
                    </span>
                    <span className={`uppercase transition-all duration-300 ${score >= 40 && score < 70 ? "text-amber-600 scale-105 font-black filter drop-shadow-[0_1px_3px_rgba(245,158,11,0.15)]" : "text-slate-400"}`}>
                      Intermediate
                    </span>
                    <span className={`uppercase transition-all duration-300 ${score >= 70 && score < 85 ? "text-emerald-600 scale-105 font-black filter drop-shadow-[0_1px_3px_rgba(16,185,129,0.15)]" : "text-slate-400"}`}>
                      Ready
                    </span>
                    <span className={`uppercase transition-all duration-300 ${score >= 85 ? "text-indigo-600 scale-105 font-black filter drop-shadow-[0_1px_3px_rgba(79,70,229,0.15)]" : "text-slate-400"}`}>
                      Excellent
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visuals: Skills Detail Progress Bars */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2 mb-3">
                Skill Score Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "DSA Solving", value: inputs.dsa, max: 10, display: `${inputs.dsa}/10` },
                  { name: "Development", value: inputs.dev, max: 10, display: `${inputs.dev}/10` },
                  { name: "Projects Quality", value: inputs.projects, max: 10, display: `${inputs.projects}/10` },
                  { name: "Core CS Knowledge", value: inputs.core, max: 10, display: `${inputs.core}/10` },
                  { name: "Resume Quality", value: inputs.resume, max: 10, display: `${inputs.resume}/10` },
                  { name: "Communication", value: inputs.comm, max: 10, display: `${inputs.comm}/10` },
                  { name: "Aptitude Prep", value: inputs.apt, max: 10, display: `${inputs.apt}/10` }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1 text-xs">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>{item.name}</span>
                      <span className="tabular-nums">{item.display}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${(item.value / item.max) * 100}%`,
                          backgroundColor: tierDetails.accentColor
                        }}
                      />
                    </div>
                  </div>
                ))}
                {[
                  { 
                    name: "Internship", 
                    value: inputs.internship === "good" ? 10 : (inputs.internship === "small" ? 5 : 0), 
                    display: inputs.internship === "good" ? "Good" : (inputs.internship === "small" ? "Small" : "None")
                  },
                  { 
                    name: "LinkedIn Profile", 
                    value: inputs.linkedin === "optimized" ? 10 : (inputs.linkedin === "basic" ? 5 : 0), 
                    display: inputs.linkedin === "optimized" ? "Optimized" : (inputs.linkedin === "basic" ? "Basic" : "Not Created")
                  },
                  { 
                    name: "GitHub Portfolio", 
                    value: inputs.github === "strong" ? 10 : (inputs.github === "average" ? 5 : 0), 
                    display: inputs.github === "strong" ? "Strong" : (inputs.github === "average" ? "Average" : "Empty")
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1 text-xs">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>{item.name}</span>
                      <span>{item.display}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${(item.value / 10) * 100}%`,
                          backgroundColor: tierDetails.accentColor
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis Section: Strengths and Weak Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Strengths Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2.5 mb-3.5 flex items-center gap-2">
                  <span className="flex items-center justify-center w-5.5 h-5.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">✓</span>
                  Strengths
                </h3>
                {analysis.strengths.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {analysis.strengths.map((str, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-3 p-3 bg-emerald-50/20 border border-emerald-100/50 rounded-xl hover:bg-emerald-50/50 transition duration-150 group"
                      >
                        <div className="flex gap-2.5 items-start">
                          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 shrink-0 mt-0.5 group-hover:bg-emerald-500 group-hover:text-white transition duration-200">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">{str.label}</span>
                            <span className="text-[10.5px] text-slate-500 leading-tight mt-0.5">{str.desc}</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 text-[10px] font-black tracking-wider uppercase shrink-0">
                          {str.value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No skills scored at 7+ yet. Adjust inputs to identify strengths.</p>
                )}
              </div>

              {/* Weak Areas Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2.5 mb-3.5 flex items-center gap-2">
                  <span className="flex items-center justify-center w-5.5 h-5.5 rounded-lg bg-rose-100 text-rose-700 text-xs font-bold">!</span>
                  Weak Areas
                </h3>
                {analysis.weaknesses.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {analysis.weaknesses.map((weak, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-3 p-3 bg-rose-50/20 border border-rose-100/50 rounded-xl hover:bg-rose-50/50 transition duration-150 group"
                      >
                        <div className="flex gap-2.5 items-start">
                          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-rose-100 text-rose-600 shrink-0 mt-0.5 group-hover:bg-rose-500 group-hover:text-white transition duration-200">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </span>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">{weak.label}</span>
                            <span className="text-[10.5px] text-slate-500 leading-tight mt-0.5">{weak.desc}</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-rose-100/70 text-rose-800 text-[10px] font-black tracking-wider uppercase shrink-0">
                          {weak.value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-600 font-semibold italic">No weak areas! Excellent job keeping your skills balanced.</p>
                )}
              </div>
            </div>

            {/* Highest/Lowest Scoring Skills Overview */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-2">Highest Scoring Areas</span>
                <div className="flex flex-wrap gap-2">
                  {sortedSkillList.highest.map((item, idx) => (
                    <div key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-semibold">
                      <span>{item.name}</span>
                      <span className="px-1.5 py-0.2 bg-emerald-100 rounded-full text-[10px] font-black">{item.display}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block mb-2">Lowest Scoring Areas</span>
                <div className="flex flex-wrap gap-2">
                  {sortedSkillList.lowest.map((item, idx) => (
                    <div key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-100 text-xs font-semibold">
                      <span>{item.name}</span>
                      <span className="px-1.5 py-0.2 bg-amber-100 rounded-full text-[10px] font-black">{item.display}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Improvement Plan (Roadmap) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="border-b border-slate-100 pb-2.5 mb-4 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">4-Week Improvement Plan</h3>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">Personalized Roadmap</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roadmap.map((step, idx) => {
                  const icon = roadmapIcons[step.title] || (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  );
                  return (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex gap-3.5 hover:border-slate-300 transition-all duration-200 group hover:shadow-sm"
                      style={{
                        hoverBorderColor: tierDetails.accentColor
                      }}
                    >
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-250 shrink-0 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 border"
                        style={{
                          color: tierDetails.accentColor,
                          backgroundColor: `${tierDetails.accentColor}12`,
                          borderColor: `${tierDetails.accentColor}25`
                        }}
                      >
                        {icon}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: tierDetails.accentColor }}>{step.week}</h4>
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Target</span>
                        </div>
                        <h5 className="text-sm font-extrabold text-slate-800 mt-1">{step.title}</h5>
                        <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons: Export Report */}
            <div className="grid grid-cols-3 gap-3 action-buttons print:hidden mt-2">
              <button
                type="button"
                onClick={handleCopyReport}
                className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold text-slate-800 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-all duration-200 hover:-translate-y-px cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy Report
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold text-slate-800 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-all duration-200 hover:-translate-y-px cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download TXT
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold text-white bg-slate-900 shadow-md hover:bg-slate-800 transition-all duration-200 hover:-translate-y-px cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-100 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Friendly
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Styled JSX for the beautiful slider and print modifications */}
      <style jsx>{`
        .premium-slider {
          width: 100%;
          height: 8px;
          border-radius: 8px;
          background: linear-gradient(90deg, #ea580c 0%, #fb923c 50%, #fed7aa 100%);
          outline: none;
          -webkit-appearance: none;
          appearance: none;
          cursor: pointer;
          position: relative;
        }

        .premium-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 8px;
          border-radius: 8px;
          background: linear-gradient(90deg, #ea580c 0%, #fb923c 50%, #fed7aa 100%);
          box-shadow: 0 0 10px rgba(234, 88, 12, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.1);
        }

        .premium-slider::-webkit-slider-thumb {
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%);
          cursor: pointer;
          box-shadow: 
            0 0 0 3px rgba(234, 88, 12, 0.1),
            0 4px 8px rgba(234, 88, 12, 0.25),
            inset -1px -1px 2px rgba(0, 0, 0, 0.1),
            inset 1px 1px 2px rgba(255, 255, 255, 0.2);
          border: 1.5px solid white;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          z-index: 5;
          margin-top: -7px;
        }

        .premium-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 
            0 0 0 5px rgba(234, 88, 12, 0.15),
            0 6px 12px rgba(234, 88, 12, 0.35),
            inset -1px -1px 2px rgba(0, 0, 0, 0.1),
            inset 1px 1px 2px rgba(255, 255, 255, 0.25);
        }

        .premium-slider::-webkit-slider-thumb:active {
          transform: scale(0.95);
        }

        .premium-slider::-moz-range-track {
          width: 100%;
          height: 8px;
          border-radius: 8px;
          background: #fed7aa;
        }

        .premium-slider::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%);
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(234, 88, 12, 0.25);
          border: 1.5px solid white;
          transition: all 0.2s ease;
        }

        .premium-slider::-moz-range-progress {
          height: 8px;
          border-radius: 8px;
          background: linear-gradient(90deg, #ea580c 0%, #fb923c 100%);
        }

        @media print {
          body {
            background-color: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          nav, .tool-float-button, .print-hidden, .action-buttons, button {
            display: none !important;
          }
          .results-panel {
            grid-column: span 12 / span 12 !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
