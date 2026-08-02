"use client";

import ComingSoon from "@/app/components/ComingSoon";
import { useEffect, useState, useMemo, useRef } from "react";

const TOOL_STATUS = "live";

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
  dsa: 80,
  dev: 84,
  projects: 60,
  resume: 60,
  comm: 92,
  apt: 66,
  core: 58
};

const roadmapIcons = {
  "Solve DSA Challenges": (
    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  "Develop Practical Projects": (
    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  "Upgrade Project Details": (
    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  "Improve Resume Bullets": (
    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  "Practice Mock Interviews": (
    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  "Solve Aptitude Quizzes": (
    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h0a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  "Revise CS Core Subjects": (
    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  "Gain Work Experience": (
    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4.67 9.88l-3.32-3.32M12 21v-6m-4 6h8" />
    </svg>
  ),
  "Optimize LinkedIn Page": (
    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 10.742l4.636-2.318M8.684 13.258l4.636 2.318M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  "Enhance GitHub Presence": (
    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  "Solve LeetCode Mediums": (
    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  "Mock Interview Marathons": (
    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  "System Design Basics": (
    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  ),
  "Targeted Networking": (
    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  // Assessment Wizard state
  const [activeInputTab, setActiveInputTab] = useState("profile"); // 'profile', 'tech', 'soft'

  // Results Dashboard state
  const [activeResultsTab, setActiveResultsTab] = useState("insights"); // 'insights', 'mapping', 'roadmap'

  // Interactive Checklist roadmap step progress
  const [completedRoadmapSteps, setCompletedRoadmapSteps] = useState({});

  // AI Profiler nested state (within wizard Tab 1)
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
    const savedRoadmapCompletion = localStorage.getItem("placement_readiness_roadmap_completion");
    
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
    if (savedRoadmapCompletion) {
      try {
        setCompletedRoadmapSteps(JSON.parse(savedRoadmapCompletion));
      } catch (e) {
        console.error("Failed to load completed roadmap steps", e);
      }
    }

    // Set page title and meta description
    const prevTitle = document.title;
    document.title = "Placement Readiness Score Calculator | Boring Tools";
    
    let metaDesc = document.querySelector('meta[name="description"]');
    let prevDesc = metaDesc ? metaDesc.getAttribute("content") : "";
    if (metaDesc) {
      metaDesc.setAttribute("content", "Evaluate your placement preparation with a smart placement readiness assessment including resume scanner, GitHub analyzer, CS core, and communication scoring.");
    } else {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      metaDesc.content = "Evaluate your placement preparation with a smart placement readiness assessment including resume scanner, GitHub analyzer, CS core, and communication scoring.";
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
      showToast("success", `AI Scan complete! Resume Score: ${parsedResults.rating}/10`);

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

      // Sync ratings (GitHub Portfolio + Projects Quality + DSA + Dev) safely
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
    setCompletedRoadmapSteps({});
    if (typeof window !== "undefined") {
      localStorage.setItem("placement_readiness_inputs", JSON.stringify(defaultInputs));
      localStorage.removeItem("placement_readiness_ai_results");
      localStorage.removeItem("placement_readiness_github_results");
      localStorage.removeItem("placement_readiness_github_username");
      localStorage.removeItem("placement_readiness_roadmap_completion");
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
        colorClass: "bg-rose-50 text-rose-700 border-rose-200",
        ringClass: "stroke-rose-500 text-rose-500",
        accentColor: "#f43f5e",
        desc: "You are in the early stages of placement preparation. Focus on laying solid foundations in DSA, writing your first resume, and building core projects."
      };
    } else if (score < 70) {
      return {
        label: "Intermediate",
        colorClass: "bg-amber-50 text-amber-700 border-amber-200",
        ringClass: "stroke-amber-500 text-amber-500",
        accentColor: "#d97706",
        desc: "You have built some core skills but require deeper practice. Optimize your resume, practice mock interviews, and work on higher-quality development projects."
      };
    } else if (score < 85) {
      return {
        label: "Placement Ready",
        colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        ringClass: "stroke-emerald-500 text-emerald-500",
        accentColor: "#10b981",
        desc: "Great job! You satisfy the requirements for most company drives. Start reviewing core CS subjects, polishing your profile, and practicing timing for coding assessments."
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

  // Handle roadmap checkbox state updates
  const handleToggleRoadmapCheckbox = (weekTitle) => {
    const updated = {
      ...completedRoadmapSteps,
      [weekTitle]: !completedRoadmapSteps[weekTitle]
    };
    setCompletedRoadmapSteps(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("placement_readiness_roadmap_completion", JSON.stringify(updated));
    }
  };

  // Calculate Roadmap Completion rate
  const roadmapCompletionPercent = useMemo(() => {
    if (!roadmap.length) return 0;
    const completedCount = roadmap.filter(item => completedRoadmapSteps[item.week]).length;
    return Math.round((completedCount / roadmap.length) * 100);
  }, [roadmap, completedRoadmapSteps]);

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
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full animate-pulse">
          <div className="h-6 w-36 bg-slate-200 rounded mx-auto mb-3" />
          <div className="h-4 w-52 bg-slate-100 rounded mx-auto" />
        </div>
      </div>
    );
  }

  // Circular progress math
  const strokeRadius = 65;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  const strokeOffset = strokeCircumference - (score / 100) * strokeCircumference;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 font-sans pb-16">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Toast Notification */}
        {toast.show && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-xl transition-all duration-300 transform translate-y-0 ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-emerald-500 animate-ping" : "bg-red-500"}`} />
            <span className="text-xs font-semibold">{toast.message}</span>
            <button
              onClick={() => setToast({ show: false, type: "", message: "" })}
              className="text-xs font-bold hover:text-slate-900 cursor-pointer ml-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Hero Section */}
        <div className="flex flex-col gap-2 items-center text-center mb-1 print:mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200/60 text-[10px] font-bold uppercase tracking-wider text-orange-700">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4.67 9.88l-3.32-3.32M12 21v-6m-4 6h8" />
            </svg>
            <span>Career Readiness Assessment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 mt-1">
            Placement Readiness Score
          </h1>
          <p className="text-slate-500 text-sm max-w-2xl mt-1 leading-relaxed">
            Evaluate your preparedness through AI resume scanning, automated GitHub profile analysis, core subject diagnostic scoring, and communication maps.
          </p>
        </div>

        {/* Action Controls for session */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3.5 py-2 text-xs font-bold rounded-xl text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Reset Assessment</span>
            </button>
            {hasBackup && (
              <button
                onClick={handleRestoreSession}
                className="px-3.5 py-2 text-xs font-bold rounded-xl text-orange-700 bg-orange-50 hover:bg-orange-100/75 border border-orange-200/60 transition active:scale-95 cursor-pointer flex items-center gap-1.5 group"
              >
                <svg className="w-3.5 h-3.5 text-orange-600 group-hover:rotate-[-180deg] transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18.75" />
                </svg>
                <span>Undo Reset</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Saved automatically client-side</span>
          </div>
        </div>

        {/* Main Grid: Inputs (Left) and Results Dashboard (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: INPUTS (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col gap-6 print:hidden">
            
            {/* Unified Input Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600">Assessment Wizard</span>
                  <h2 className="text-base font-black text-slate-950 mt-0.5">Input Parameters</h2>
                </div>
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/70 p-1 rounded-xl">
                  {["profile", "tech", "soft"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setActiveInputTab(t)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all duration-150 cursor-pointer ${
                        activeInputTab === t ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:text-slate-950"
                      }`}
                    >
                      {t === "profile" ? "Scan" : t === "tech" ? "Tech" : "Soft"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab 1: AI Scanner & Profile Scanner */}
              {activeInputTab === "profile" && (
                <div className="flex flex-col gap-4">
                  <div className="p-3 bg-orange-50/40 rounded-2xl border border-orange-100/60 mb-1">
                    <p className="text-[11px] text-orange-800 leading-normal">
                      🚀 <strong>Smart Auto-Fill:</strong> Upload your resume PDF or write a GitHub username to automatically analyze and evaluate your scores.
                    </p>
                  </div>

                  {/* Profiler tab toggle: Resume vs GitHub */}
                  <div className="flex bg-slate-50 border border-slate-200/60 p-1 rounded-xl text-xs font-bold text-slate-500">
                    <button
                      type="button"
                      onClick={() => setActiveProfilerTab("resume")}
                      className={`flex-1 py-1.5 rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeProfilerTab === "resume" ? "bg-white text-slate-950 shadow-sm border border-slate-200/40 font-black" : "hover:text-slate-800"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Resume Scanner</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveProfilerTab("github")}
                      className={`flex-1 py-1.5 rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeProfilerTab === "github" ? "bg-white text-slate-950 shadow-sm border border-slate-200/40 font-black" : "hover:text-slate-800"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      <span>GitHub Portfolio</span>
                    </button>
                  </div>

                  {/* Resume scanner options */}
                  {activeProfilerTab === "resume" && (
                    <div className="flex flex-col gap-3">
                      <div className="flex border-b border-slate-100 text-xs font-semibold text-slate-400">
                        <button
                          type="button"
                          onClick={() => setScanMode("pdf")}
                          className={`flex-1 pb-2 border-b-2 transition ${
                            scanMode === "pdf" ? "border-orange-500 text-orange-600 font-extrabold" : "border-transparent hover:text-slate-600"
                          }`}
                        >
                          Upload PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => setScanMode("text")}
                          className={`flex-1 pb-2 border-b-2 transition ${
                            scanMode === "text" ? "border-orange-500 text-orange-600 font-extrabold" : "border-transparent hover:text-slate-600"
                          }`}
                        >
                          Paste Resume Text
                        </button>
                      </div>

                      {scanMode === "pdf" ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center cursor-pointer hover:bg-slate-50/50 hover:border-slate-300 transition-all duration-150 flex flex-col items-center justify-center min-h-[110px] select-none group"
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept=".pdf"
                            onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center group-hover:scale-110 transition duration-150 mb-2">
                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          {uploadedFile ? (
                            <p className="text-xs font-bold text-slate-800 truncate max-w-[240px] bg-slate-100 px-3 py-1 rounded-lg">
                              📄 {uploadedFile.name}
                            </p>
                          ) : (
                            <p className="text-xs text-slate-500">Drag & drop or click to upload PDF resume</p>
                          )}
                        </div>
                      ) : (
                        <textarea
                          placeholder="Paste work experience, skills, projects, education details..."
                          value={manualText}
                          onChange={(e) => setManualText(e.target.value)}
                          className="w-full min-h-[110px] p-3 border border-slate-200 rounded-2xl bg-slate-50/20 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:bg-white placeholder:text-slate-400"
                        />
                      )}

                      <button
                        type="button"
                        onClick={handleScanResume}
                        disabled={isScanning}
                        className="w-full py-2.5 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow disabled:bg-slate-400 cursor-pointer"
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
                        <div className="mt-1 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs shrink-0 select-none">
                            {aiResults.rating}
                          </div>
                          <div className="flex-1 flex flex-col gap-0.5">
                            <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">AI Resume Synchronized</span>
                            <p className="text-[11px] text-emerald-900 leading-tight">
                              Resume evaluated at <strong>{aiResults.rating}/10</strong>. Strengths and action points loaded.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* GitHub scanner options */}
                  {activeProfilerTab === "github" && (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="git-user" className="text-xs font-bold text-slate-700">GitHub Username</label>
                        <input
                          id="git-user"
                          type="text"
                          placeholder="e.g. torvalds"
                          value={githubUsername}
                          onChange={(e) => setGithubUsername(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/20 px-3.5 py-2.5 text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white placeholder:text-slate-400 font-semibold"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleScanGithub}
                        disabled={isScanningGithub}
                        className="w-full py-2.5 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow disabled:bg-slate-400 cursor-pointer"
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
                        <div className="mt-1 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs shrink-0 select-none uppercase">
                            {githubResults.githubRating.slice(0, 3)}
                          </div>
                          <div className="flex-1 flex flex-col gap-0.5">
                            <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">AI Portfolio Synchronized</span>
                            <p className="text-[11px] text-emerald-900 leading-tight">
                              Projects score: <strong>{githubResults.projectRating}/10</strong> | DSA: <strong>{githubResults.dsaRating}/10</strong>.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Technical Competencies */}
              {activeInputTab === "tech" && (
                <div className="flex flex-col gap-4">
                  {[
                    { key: "dsa", label: "DSA Skill Level", desc: "LeetCode solves, graph & tree structures, complexity analysis" },
                    { key: "dev", label: "Development Skill", desc: "APIs, database engines, deployment tools, full-stack frameworks" },
                    { key: "projects", label: "Projects Complexity", desc: "Operational hosted URLs, real-world utility, user bases" },
                    { key: "core", label: "Core CS Knowledge", desc: "OS fundamentals, networking packets, DBMS structures, queries" }
                  ].map((skill) => (
                    <div key={skill.key} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-slate-800">
                        <label htmlFor={skill.key} className="text-xs font-bold">{skill.label}</label>
                        <span className="text-[10px] font-black bg-orange-100/80 text-orange-700 px-2 py-0.5 rounded-full select-none">
                          {inputs[skill.key]}/10
                        </span>
                      </div>
                      <input
                        id={skill.key}
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={inputs[skill.key]}
                        onChange={(e) => handleInputChange(skill.key, parseInt(e.target.value))}
                        className="premium-slider w-full cursor-pointer py-1"
                      />
                      <span className="text-[9.5px] text-slate-400 font-medium leading-none mt-0.5">{skill.desc}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Soft Skills & Experience */}
              {activeInputTab === "soft" && (
                <div className="flex flex-col gap-4">
                  {[
                    { key: "resume", label: "Resume Design", desc: "ATS standard layouts, result verbs, quantitative metrics" },
                    { key: "comm", label: "Communication Skill", desc: "STAR framework responses, structural mock pacing, clarity" },
                    { key: "apt", label: "Aptitude & Speed", desc: "Math sets, quantitative logic tests, timed checks" }
                  ].map((skill) => (
                    <div key={skill.key} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-slate-800">
                        <label htmlFor={skill.key} className="text-xs font-bold">{skill.label}</label>
                        <span className="text-[10px] font-black bg-orange-100/80 text-orange-700 px-2.5 py-0.5 rounded-full select-none">
                          {inputs[skill.key]}/10
                        </span>
                      </div>
                      <input
                        id={skill.key}
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={inputs[skill.key]}
                        onChange={(e) => handleInputChange(skill.key, parseInt(e.target.value))}
                        className="premium-slider w-full cursor-pointer py-1"
                      />
                      <span className="text-[9.5px] text-slate-400 font-medium leading-none mt-0.5">{skill.desc}</span>
                    </div>
                  ))}

                  <div className="border-t border-slate-100 my-1 pt-3 flex flex-col gap-3">
                    {/* Internship Selector */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-slate-700">Internship Experience</span>
                      <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
                        {["none", "small", "good"].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleInputChange("internship", opt)}
                            className={`py-1.5 rounded-lg text-[10px] font-black uppercase transition-all duration-150 cursor-pointer text-center ${
                              inputs.internship === opt
                                ? "bg-orange-600 text-white shadow-sm font-bold"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            {opt === "none" ? "None" : opt === "small" ? "1-3 Months" : "3+ Months"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* LinkedIn Selector */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-slate-700">LinkedIn Status</span>
                      <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
                        {["not_created", "basic", "optimized"].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleInputChange("linkedin", opt)}
                            className={`py-1.5 rounded-lg text-[10px] font-black uppercase transition-all duration-150 cursor-pointer text-center ${
                              inputs.linkedin === opt
                                ? "bg-orange-600 text-white shadow-sm font-bold"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            {opt === "not_created" ? "None" : opt === "basic" ? "Basic" : "Optimized"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* GitHub Selector */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-slate-700">GitHub Presence</span>
                      <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
                        {["empty", "average", "strong"].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleInputChange("github", opt)}
                            className={`py-1.5 rounded-lg text-[10px] font-black uppercase transition-all duration-150 cursor-pointer text-center ${
                              inputs.github === opt
                                ? "bg-orange-600 text-white shadow-sm font-bold"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            {opt === "empty" ? "Empty" : opt === "average" ? "Average" : "Strong"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: RESULTS DASHBOARD (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col gap-6 results-panel">
            
            {/* Unified Results Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600">Evaluation Dashboard</span>
                  <h2 className="text-base font-black text-slate-950 mt-0.5">Diagnostic Report</h2>
                </div>
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/70 p-1 rounded-xl print:hidden">
                  {[
                    { key: "insights", label: "Score" },
                    { key: "mapping", label: "Skills Map" },
                    { key: "roadmap", label: "Action Plan" }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveResultsTab(tab.key)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all duration-150 cursor-pointer ${
                        activeResultsTab === tab.key ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:text-slate-950"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab 1: Score & Insights */}
              {(activeResultsTab === "insights" || typeof window === "undefined") && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col md:flex-row items-center gap-6 justify-center w-full bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                    {/* circular indicator */}
                    <div className="relative flex items-center justify-center shrink-0">
                      <svg className="w-36 h-36 transform -rotate-90">
                        <circle
                          cx="72"
                          cy="72"
                          r="58"
                          className="stroke-slate-100"
                          strokeWidth="10"
                          fill="transparent"
                        />
                        <circle
                          cx="72"
                          cy="72"
                          r="58"
                          className={`transition-all duration-500 ease-out ${tierDetails.ringClass}`}
                          strokeWidth="10"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 58}
                          strokeDashoffset={2 * Math.PI * 58 - (score / 100) * 2 * Math.PI * 58}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-slate-950 tracking-tighter tabular-nums leading-none">
                          {score}%
                        </span>
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                          Ready
                        </span>
                      </div>
                    </div>

                    {/* score info text */}
                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Preparation Tier</span>
                        <div className="flex items-center gap-2 mt-1.5 justify-center md:justify-start">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border select-none ${tierDetails.colorClass}`}>
                            {tierDetails.label}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed max-w-sm mt-1">
                        {tierDetails.desc}
                      </p>
                    </div>
                  </div>

                  {/* Highlights section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="p-4 bg-emerald-50/20 border border-emerald-100/60 rounded-2xl flex flex-col">
                      <h3 className="text-xs font-black text-emerald-800 flex items-center gap-1.5 mb-2.5">
                        <span className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                        Core Strengths
                      </h3>
                      {analysis.strengths.length > 0 ? (
                        <div className="flex flex-col gap-2.5">
                          {analysis.strengths.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex gap-2">
                              <span className="text-[10px] text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
                              <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-slate-800">{item.label}</span>
                                <span className="text-[10px] text-slate-500 leading-normal">{item.desc}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10.5px] text-slate-400 italic">Modify your inputs to display identified strengths.</p>
                      )}
                    </div>

                    {/* Weaknesses */}
                    <div className="p-4 bg-rose-50/20 border border-rose-100/60 rounded-2xl flex flex-col">
                      <h3 className="text-xs font-black text-rose-800 flex items-center gap-1.5 mb-2.5">
                        <span className="w-5 h-5 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-[10px] font-bold">!</span>
                        Focus Areas
                      </h3>
                      {analysis.weaknesses.length > 0 ? (
                        <div className="flex flex-col gap-2.5">
                          {analysis.weaknesses.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex gap-2">
                              <span className="text-[10px] text-rose-500 font-bold shrink-0 mt-0.5">•</span>
                              <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-slate-800">{item.label}</span>
                                <span className="text-[10px] text-slate-500 leading-normal">{item.desc}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10.5px] text-slate-400 italic">Great job! No major weak preparation areas found.</p>
                      )}
                    </div>
                  </div>

                  {/* Highlights key value tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase text-slate-400 block mb-1">Highest Scores</span>
                      <div className="flex flex-wrap gap-1.5">
                        {sortedSkillList.highest.map((item, idx) => (
                          <div key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200/60 font-semibold text-[10px] text-slate-700">
                            <span>{item.name}</span>
                            <span className="font-black text-emerald-600">{item.display}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] font-extrabold uppercase text-slate-400 block mb-1">Room to Improve</span>
                      <div className="flex flex-wrap gap-1.5">
                        {sortedSkillList.lowest.map((item, idx) => (
                          <div key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200/60 font-semibold text-[10px] text-slate-700">
                            <span>{item.name}</span>
                            <span className="font-black text-amber-600">{item.display}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Skill Mapping (Radar Chart + Progress bars) */}
              {activeResultsTab === "mapping" && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* SVG Radar Chart (col-span-5) */}
                    <div className="md:col-span-5 flex justify-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <svg viewBox="0 0 400 400" className="w-full max-w-[210px] h-auto select-none">
                        <defs>
                          <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={tierDetails.accentColor} stopOpacity="0.25" />
                            <stop offset="100%" stopColor={tierDetails.accentColor} stopOpacity="0" />
                          </radialGradient>
                        </defs>

                        {/* Circular radial background */}
                        <circle cx="200" cy="200" r="135" fill="url(#radar-glow)" />

                        {/* concentric grids */}
                        {[2, 4, 6, 8, 10].map((level) => {
                          const points = Array.from({ length: 7 }, (_, idx) => {
                            const coord = getRadarCoords(idx, level);
                            return `${coord.x},${coord.y}`;
                          }).join(" ");
                          return (
                            <g key={level}>
                              <polygon
                                points={points}
                                className="stroke-slate-200/70 fill-none"
                                strokeWidth={level === 10 ? "1.5" : "1"}
                                strokeDasharray={level === 10 ? "none" : "2,2"}
                              />
                            </g>
                          );
                        })}

                        {/* radial axes */}
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

                        {/* score polygon */}
                        {(() => {
                          const points = radarSkills.map((s, idx) => {
                            const val = inputs[s.key];
                            const coord = getRadarCoords(idx, val);
                            return `${coord.x},${coord.y}`;
                          }).join(" ");
                          return (
                            <g>
                              <polygon
                                points={points}
                                fill={`${tierDetails.accentColor}24`}
                                stroke={tierDetails.accentColor}
                                strokeWidth="3"
                                strokeLinejoin="round"
                              />
                              {radarSkills.map((s, idx) => {
                                const val = inputs[s.key];
                                const coord = getRadarCoords(idx, val);
                                return (
                                  <circle
                                    key={s.key}
                                    cx={coord.x}
                                    cy={coord.y}
                                    r="4.5"
                                    fill={tierDetails.accentColor}
                                    stroke="#ffffff"
                                    strokeWidth="1.5"
                                  />
                                );
                              })}
                            </g>
                          );
                        })()}

                        {/* axis label badges */}
                        {radarSkills.map((skill, idx) => {
                          const angle = (idx * 2 * Math.PI) / 7 - Math.PI / 2;
                          const cos = Math.cos(angle);
                          const sin = Math.sin(angle);
                          
                          const labelRadius = 135 + 24;
                          const lx = 200 + labelRadius * cos;
                          const ly = 200 + labelRadius * sin;
                          
                          const w = labelWidths[skill.key] || 60;
                          const h = 18;
                          const rx = lx - w / 2;
                          const ry = ly - h / 2;
                          
                          return (
                            <g key={skill.key}>
                              <rect
                                x={rx}
                                y={ry}
                                width={w}
                                height={h}
                                rx="5"
                                fill="#ffffff"
                                stroke="#e2e8f0"
                                strokeWidth="1"
                                className="shadow-sm"
                              />
                              <text
                                x={lx}
                                y={ly}
                                textAnchor="middle"
                                dy="3px"
                                className="text-[8.5px] font-extrabold fill-slate-500 select-none"
                              >
                                {skill.label}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    {/* Progress score lines (col-span-7) */}
                    <div className="md:col-span-7 flex flex-col gap-3">
                      {[
                        { name: "DSA Solving", val: inputs.dsa, max: 10 },
                        { name: "Development", val: inputs.dev, max: 10 },
                        { name: "Projects Quality", val: inputs.projects, max: 10 },
                        { name: "Core CS Subjects", val: inputs.core, max: 10 },
                        { name: "Resume Score", val: inputs.resume, max: 10 },
                        { name: "Communication", val: inputs.comm, max: 10 },
                        { name: "Aptitude Prep", val: inputs.apt, max: 10 }
                      ].map((item, idx) => (
                        <div key={idx} className="flex flex-col gap-1 text-[11px]">
                          <div className="flex justify-between font-bold text-slate-700 leading-none">
                            <span>{item.name}</span>
                            <span className="font-extrabold text-slate-900">{item.val}/10</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${(item.val / item.max) * 100}%`,
                                backgroundColor: tierDetails.accentColor
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Roadmap Timeline Checklist */}
              {activeResultsTab === "roadmap" && (
                <div className="flex flex-col gap-4">
                  {/* Roadmap Progress bar */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Roadmap Progress</span>
                      <span className="font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100 select-none">
                        {roadmapCompletionPercent}% Complete
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-600 rounded-full transition-all duration-300"
                        style={{ width: `${roadmapCompletionPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Weeks list */}
                  <div className="flex flex-col gap-3">
                    {roadmap.map((step, idx) => {
                      const isCompleted = !!completedRoadmapSteps[step.week];
                      const icon = roadmapIcons[step.title] || (
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      );
                      
                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleRoadmapCheckbox(step.week)}
                          className={`p-4 rounded-2xl border transition-all duration-200 flex gap-3.5 items-start cursor-pointer select-none relative group hover:shadow-sm ${
                            isCompleted
                              ? "bg-slate-50/50 border-slate-200 opacity-70"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-center shrink-0 mt-0.5">
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={() => {}} // handled by parent onClick
                              className="w-4 h-4 rounded text-orange-600 border-slate-300 focus:ring-orange-500 cursor-pointer"
                            />
                          </div>

                          <div
                            className={`flex items-center justify-center w-9 h-9 rounded-xl border shrink-0 transition ${
                              isCompleted 
                                ? "bg-slate-200/50 text-slate-500 border-slate-200" 
                                : "bg-orange-50 text-orange-600 border-orange-100 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900"
                            }`}
                          >
                            {icon}
                          </div>

                          <div className="flex-1 flex flex-col">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider text-orange-600">{step.week} Target</span>
                              {isCompleted && (
                                <span className="text-[8px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded uppercase">Completed</span>
                              )}
                            </div>
                            <h4 className={`text-xs font-black mt-0.5 ${isCompleted ? "text-slate-400 line-through" : "text-slate-800"}`}>
                              {step.title}
                            </h4>
                            <p className={`text-[10.5px] leading-relaxed mt-1 ${isCompleted ? "text-slate-400" : "text-slate-500"}`}>
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Print & Export buttons */}
            <div className="grid grid-cols-3 gap-3 action-buttons print:hidden">
              <button
                type="button"
                onClick={handleCopyReport}
                className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-2xl text-xs font-bold text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 active:scale-98 transition shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>Copy Markdown</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-2xl text-xs font-bold text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 active:scale-98 transition shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download TXT</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-2xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-98 transition shadow-md cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-100 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Styled JSX for range sliders and custom components */}
      <style jsx>{`
        .premium-slider {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
        }

        .premium-slider:focus {
          outline: none;
        }

        /* Webkit sliders track & thumb */
        .premium-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 6px;
          border-radius: 8px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
        }

        .premium-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(234, 88, 12, 0.3);
          margin-top: -6px;
          transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .premium-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 3px 6px rgba(234, 88, 12, 0.45);
        }

        .premium-slider::-webkit-slider-thumb:active {
          transform: scale(0.95);
        }

        /* Firefox sliders track & thumb */
        .premium-slider::-moz-range-track {
          width: 100%;
          height: 6px;
          border-radius: 8px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
        }

        .premium-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(234, 88, 12, 0.3);
          transition: transform 0.15s ease;
        }

        .premium-slider::-moz-range-thumb:hover {
          transform: scale(1.15);
        }

        .premium-slider::-moz-range-progress {
          height: 6px;
          border-radius: 8px;
          background: linear-gradient(90deg, #ea580c 0%, #f97316 100%);
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        .animate-spin-reverse {
          animation: spin-reverse 1s linear infinite;
        }

        @media print {
          body {
            background-color: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          nav, .tool-float-button, .print-hidden, .action-buttons, button, input[type="checkbox"] {
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
