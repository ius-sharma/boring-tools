"use client";

import { useMemo, useState, useEffect } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const platformOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "x", label: "X (Twitter)" },
  { value: "linkedin", label: "LinkedIn" },
];

const nicheOptions = [
  { value: "Tech & Gadgets", label: "Tech & Gadgets" },
  { value: "Business & Finance", label: "Business & Finance" },
  { value: "Lifestyle & Vlogs", label: "Lifestyle & Vlogs" },
  { value: "Comedy & Entertainment", label: "Comedy & Entertainment" },
  { value: "Education & Learning", label: "Education & Learning" },
  { value: "Fitness & Health", label: "Fitness & Health" },
  { value: "Gaming", label: "Gaming" },
  { value: "Fashion & Beauty", label: "Fashion & Beauty" },
  { value: "Travel & Food", label: "Travel & Food" },
  { value: "Other / General", label: "Other / General" },
];

const theme = {
  instagram: {
    name: "Instagram",
    accent: "from-purple-600 via-pink-500 to-orange-400",
    accentSolid: "bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400",
    btn: "bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 text-white",
    ring: "focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20",
    badge: "bg-gradient-to-r from-purple-500 to-pink-500",
    glow1: "bg-purple-300/20",
    glow2: "bg-orange-300/20",
    label: "text-pink-600",
    section: "border-pink-100 bg-pink-50/50 text-pink-900",
    tag: "text-purple-600",
    textAccent: "text-pink-500",
    borderAccent: "border-pink-500/20",
    glass: "backdrop-blur-md bg-white/80 border-pink-500/10",
  },
  youtube: {
    name: "YouTube",
    accent: "from-red-600 to-rose-500",
    accentSolid: "bg-gradient-to-r from-red-600 to-rose-500",
    btn: "bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white",
    ring: "focus:border-red-400 focus:ring-2 focus:ring-red-500/20",
    badge: "bg-red-600",
    glow1: "bg-red-300/20",
    glow2: "bg-rose-300/20",
    label: "text-red-600",
    section: "border-red-100 bg-red-50/50 text-red-900",
    tag: "text-red-600",
    textAccent: "text-red-600",
    borderAccent: "border-red-500/20",
    glass: "backdrop-blur-md bg-white/80 border-red-500/10",
  },
  tiktok: {
    name: "TikTok",
    accent: "from-cyan-400 via-slate-900 to-pink-500",
    accentSolid: "bg-gradient-to-r from-cyan-400 via-slate-900 to-pink-500",
    btn: "bg-gradient-to-r from-cyan-500 via-slate-800 to-pink-500 hover:brightness-110 text-white",
    ring: "focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20",
    badge: "bg-cyan-500",
    glow1: "bg-cyan-300/15",
    glow2: "bg-pink-300/15",
    label: "text-cyan-600",
    section: "border-cyan-100 bg-cyan-50/50 text-cyan-900",
    tag: "text-cyan-600",
    textAccent: "text-cyan-500",
    borderAccent: "border-cyan-500/20",
    glass: "backdrop-blur-md bg-white/80 border-cyan-500/10",
  },
  x: {
    name: "X (Twitter)",
    accent: "from-slate-950 to-slate-800",
    accentSolid: "bg-slate-950",
    btn: "bg-slate-950 hover:bg-slate-900 text-white border border-slate-800",
    ring: "focus:border-slate-800 focus:ring-2 focus:ring-slate-900/20",
    badge: "bg-slate-950",
    glow1: "bg-slate-300/15",
    glow2: "bg-slate-400/15",
    label: "text-slate-900",
    section: "border-slate-200 bg-slate-100/50 text-slate-900",
    tag: "text-slate-800",
    textAccent: "text-slate-950",
    borderAccent: "border-slate-950/15",
    glass: "backdrop-blur-md bg-white/80 border-slate-950/10",
  },
  linkedin: {
    name: "LinkedIn",
    accent: "from-blue-700 to-indigo-600",
    accentSolid: "bg-gradient-to-r from-blue-700 to-indigo-600",
    btn: "bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white",
    ring: "focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20",
    badge: "bg-blue-700",
    glow1: "bg-blue-300/20",
    glow2: "bg-indigo-300/20",
    label: "text-blue-700",
    section: "border-blue-100 bg-blue-50/50 text-blue-900",
    tag: "text-blue-700",
    textAccent: "text-blue-700",
    borderAccent: "border-blue-700/20",
    glass: "backdrop-blur-md bg-white/80 border-blue-700/10",
  },
};

const sectionMeta = {
  audienceQuality: { title: "Audience Quality" },
  consistency: { title: "Consistency" },
  growth: { title: "Growth Signals" },
};

const verdictStyles = {
  authentic: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "✓", textColor: "text-emerald-700", bgColor: "bg-emerald-600" },
  mixed: { bg: "bg-amber-50", border: "border-amber-200", icon: "!", textColor: "text-amber-700", bgColor: "bg-amber-600" },
  questionable: { bg: "bg-orange-50", border: "border-orange-200", icon: "!", textColor: "text-orange-700", bgColor: "bg-orange-600" },
  spam: { bg: "bg-rose-50", border: "border-rose-200", icon: "✗", textColor: "text-rose-700", bgColor: "bg-rose-600" },
};

function scoreStatusLabel(score) {
  if (score >= 75) return "Strong";
  if (score >= 50) return "Average";
  if (score >= 30) return "Weak";
  return "Poor";
}

function getVerdictStyle(score) {
  if (score >= 75) return verdictStyles.authentic;
  if (score >= 50) return verdictStyles.mixed;
  if (score >= 30) return verdictStyles.questionable;
  return verdictStyles.spam;
}

function getScoreColorClass(score) {
  if (score >= 75) return "stroke-emerald-500 text-emerald-600";
  if (score >= 50) return "stroke-amber-500 text-amber-600";
  if (score >= 30) return "stroke-orange-500 text-orange-600";
  return "stroke-rose-500 text-rose-600";
}

function formatNumber(n) {
  if (n === undefined || n === null) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

// Animated counter component
function AnimatedCounter({ target, duration = 1200 }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (target == null) return;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress >= 1) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [target, duration]);
  
  return <span>{count}</span>;
}

export default function SocialAccountAnalyzerPage() {
  const [platform, setPlatform] = useState("instagram");
  const [username, setUsername] = useState("");
  const [isManual, setIsManual] = useState(false);
  const [userApifyToken, setUserApifyToken] = useState("");
  
  // Manual metrics inputs state
  const [manualData, setManualData] = useState({
    followers: "",
    following: "",
    posts: "",
    totalViews: "",
    averageViews: "",
    bio: "",
    niche: "Tech & Gadgets",
    isVerified: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [checkedRecs, setCheckedRecs] = useState({});
  const [history, setHistory] = useState([]);

  const t = theme[platform];

  const placeholder = useMemo(() => {
    switch (platform) {
      case "instagram": return "@username";
      case "youtube": return "@channelhandle";
      case "tiktok": return "@tiktokhandle";
      case "x": return "@twitterhandle";
      case "linkedin": return "profile-slug";
      default: return "@username";
    }
  }, [platform]);

  // Load history and token from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("social_analyzer_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
    const savedToken = localStorage.getItem("apify_user_token");
    if (savedToken) {
      setUserApifyToken(savedToken);
    }
  }, []);

  const handleTokenChange = (val) => {
    setUserApifyToken(val);
    localStorage.setItem("apify_user_token", val);
  };

  // Save scan to history
  const saveToHistory = (usernameVal, platformVal, scoreVal, dataVal) => {
    const item = {
      id: Date.now(),
      username: usernameVal,
      platform: platformVal,
      score: scoreVal,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      result: dataVal
    };
    const updated = [item, ...history.filter(h => !(h.username.toLowerCase() === usernameVal.toLowerCase() && h.platform === platformVal))].slice(0, 5);
    setHistory(updated);
    localStorage.setItem("social_analyzer_history", JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("social_analyzer_history");
  };

  const handleTweakStats = () => {
    if (!result || !result.profileData) return;
    setManualData({
      followers: String(result.profileData.followers || ""),
      following: String(result.profileData.following || ""),
      posts: String(result.profileData.posts || ""),
      totalViews: String(result.profileData.totalViews || ""),
      averageViews: String(result.profileData.averageViews || ""),
      bio: result.profileData.bio || "",
      niche: result.contentStrategy?.niche || "Other / General",
      isVerified: !!result.profileData.isVerified,
    });
    setIsManual(true);
  };

  const handleManualChange = (field, val) => {
    setManualData(prev => ({ ...prev, [field]: val }));
  };

  const handleAnalyze = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setError("Please enter a username or profile handle.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    setCheckedRecs({});
    setActiveTab("overview");

    try {
      const res = await fetch("/api/social-account-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          username: trimmed,
          isManual,
          manualData: isManual ? manualData : null,
          userApifyToken: userApifyToken.trim() || null
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Analysis failed.");
      
      setResult(data);
      if (data.score != null) {
        saveToHistory(trimmed, platform, data.score, data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (histItem) => {
    setPlatform(histItem.platform);
    setUsername(histItem.username);
    setResult(histItem.result);
    setCheckedRecs({});
    setActiveTab("overview");
  };



  // SVG Gauge calculations
  const score = result?.score ?? 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center p-4 sm:py-8 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-7xl border border-slate-200 flex flex-col gap-6">
        {/* Header Block */}
        <div className="flex flex-col gap-2 items-center text-center no-print">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Creator Tools</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Social Account Analyzer</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Audit any social media profile instantly. Detect fake followers, review content consistency, analyze growth velocity, and receive a customized monetization blueprint.
          </p>
        </div>

        {/* Outer Dashboard Grid */}
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          
          {/* ─── LEFT PANEL: controls & inputs ─── */}
          <div className="flex flex-col gap-6 no-print">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Analyzer Settings</h2>

              <div className="space-y-4">
                {/* Platform select */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Platform</label>
                  <ThemedDropdown
                    ariaLabel="Select platform"
                    value={platform}
                    options={platformOptions}
                    onChange={(v) => { 
                      setPlatform(v); 
                      setResult(null); 
                      setError(""); 
                    }}
                  />
                </div>

                {/* Switch between Auto Scrape and Manual mode */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Analysis Mode</label>
                    <span className="text-xs text-slate-500">
                      {isManual ? "Using custom details" : "Auto-fetch stats"}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsManual(!isManual)}
                    className="flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition"
                  >
                    {isManual ? "Swap to Auto" : "Swap to Custom"}
                  </button>
                </div>

                {/* Handle / Username */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {platform === "instagram" && "Instagram Username"}
                    {platform === "youtube" && "YouTube Channel Handle"}
                    {platform === "tiktok" && "TikTok Handle"}
                    {platform === "x" && "X (Twitter) Handle"}
                    {platform === "linkedin" && "LinkedIn Profile URL / Name"}
                  </label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                    placeholder={placeholder}
                    className={`w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition ${t.ring}`}
                  />
                </div>

                {!isManual && (
                  <div className="mt-3 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold uppercase text-slate-500">
                        Apify API Token (Optional)
                      </label>
                      <span className="text-[9px] text-slate-400 font-semibold italic">Runs your own scraper</span>
                    </div>
                    <input
                      type="password"
                      value={userApifyToken}
                      onChange={(e) => handleTokenChange(e.target.value)}
                      placeholder="e.g. ap_v2_xxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-450 bg-white text-slate-900"
                    />
                    <details className="text-[10px] text-slate-500 font-medium cursor-pointer select-none">
                      <summary className="hover:text-slate-700 transition">Where to find your token?</summary>
                      <ol className="mt-1.5 list-decimal pl-4 space-y-1 text-[9px] leading-relaxed text-slate-600">
                        <li>Create a free account on <a href="https://apify.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">apify.com</a></li>
                        <li>Go to <strong>Console &gt; Settings &gt; Integrations</strong> page.</li>
                        <li>Copy your <strong>Personal API Token</strong> and paste it here.</li>
                        <li>Your token will be saved locally in your browser.</li>
                      </ol>
                    </details>
                  </div>
                )}

                {/* Manual form input block */}
                {isManual && (
                  <div className="mt-3 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3 transition-all duration-300">
                    <p className="text-xs font-bold text-slate-600 border-b border-slate-200/60 pb-1.5">
                      Provide Custom Stats for AI Audit
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Followers/Subs</label>
                        <input
                          type="text"
                          placeholder="e.g. 25K"
                          value={manualData.followers}
                          onChange={(e) => handleManualChange("followers", e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-400 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Following</label>
                        <input
                          type="text"
                          placeholder="e.g. 500"
                          value={manualData.following}
                          onChange={(e) => handleManualChange("following", e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-400 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Total Posts/Vids</label>
                        <input
                          type="text"
                          placeholder="e.g. 150"
                          value={manualData.posts}
                          onChange={(e) => handleManualChange("posts", e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-400 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Avg Views/Post</label>
                        <input
                          type="text"
                          placeholder="e.g. 5K"
                          value={manualData.averageViews}
                          onChange={(e) => handleManualChange("averageViews", e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-400 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Niche Category</label>
                      <select
                        value={manualData.niche}
                        onChange={(e) => handleManualChange("niche", e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white outline-none focus:border-slate-400 text-slate-900"
                      >
                        {nicheOptions.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Bio / Profile Description</label>
                      <textarea
                        rows="2"
                        placeholder="Paste profile bio details here..."
                        value={manualData.bio}
                        onChange={(e) => handleManualChange("bio", e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-400 bg-white resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="verified-checkbox"
                        checked={manualData.isVerified}
                        onChange={(e) => handleManualChange("isVerified", e.target.checked)}
                        className="rounded border-slate-300 text-slate-950 focus:ring-slate-500"
                      />
                      <label htmlFor="verified-checkbox" className="text-[11px] font-semibold text-slate-700 select-none">
                        Profile has blue verification badge
                      </label>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className={`w-full rounded-2xl py-3.5 font-bold transition-all shadow-md active:scale-95 disabled:cursor-not-allowed disabled:brightness-90 ${t.btn}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {isManual ? "AI Auditing..." : "Analyzing Profile..."}
                    </span>
                  ) : (
                    "Generate Audit Report"
                  )}
                </button>
              </div>
            </section>

            {/* Error Message */}
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            {/* Scan History card */}
            {history.length > 0 && (
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">Recent Audits</h3>
                  <button onClick={handleClearHistory} className="text-[10px] text-slate-400 hover:text-slate-600 font-bold uppercase">
                    Clear
                  </button>
                </div>
                <div className="space-y-2">
                  {history.map((hist) => {
                    return (
                      <button
                        key={hist.id}
                        onClick={() => loadFromHistory(hist)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition text-left group"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-950 truncate">@{hist.username}</p>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">
                            {hist.platform}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-extrabold px-1.5 py-0.5 rounded-md ${getScoreColorClass(hist.score)} bg-white border border-slate-200/50`}>
                            {hist.score}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* ─── RIGHT PANEL: Results and details dashboard ─── */}
          <div className="min-w-0">
            {loading && (
              <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-8 shadow-sm flex flex-col items-center justify-center min-h-[450px] backdrop-blur-sm text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-800">AI</div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 animate-pulse">Running Diagnostic Scans</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-sm">
                  Connecting to platform services and analyzing profiles. AI is compiling strategy roadmap...
                </p>
              </div>
            )}

            {!loading && !result && !error && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-8 shadow-sm flex flex-col items-center justify-center min-h-[450px] text-center">
                <h3 className="text-lg font-bold text-slate-900">Awaiting Profile Input</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-md">
                  Enter a platform handle or name on the left to run an automated profile scrape, or switch to Custom Input to review custom statistics.
                </p>
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left max-w-2xl">
                  <div className="p-3 bg-white border border-slate-100 rounded-xl">
                    <p className="text-xs font-bold text-slate-800 mt-1">Growth Audit</p>
                  </div>
                  <div className="p-3 bg-white border border-slate-100 rounded-xl">
                    <p className="text-xs font-bold text-slate-800 mt-1">Spam Check</p>
                  </div>
                  <div className="p-3 bg-white border border-slate-100 rounded-xl">
                    <p className="text-xs font-bold text-slate-800 mt-1">AI Pillars</p>
                  </div>
                  <div className="p-3 bg-white border border-slate-100 rounded-xl">
                    <p className="text-xs font-bold text-slate-800 mt-1">Monetize</p>
                  </div>
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 shadow-sm flex flex-col items-center justify-center min-h-[450px] text-center">
                <h3 className="text-lg font-bold text-rose-900">Live Fetch Unavailable</h3>
                <p className="text-sm text-rose-700 mt-2 max-w-md">
                  {error}
                </p>
                <p className="text-xs text-rose-500 mt-1">
                  You can still audit this profile by switching to Custom Input (Manual Mode) on the left.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setIsManual(true);
                      setError("");
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition"
                  >
                    Swap to Custom Input
                  </button>
                  <button
                    onClick={() => {
                      setError("");
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Dashboard Results Render */}
            {!loading && result && (
              <div className="space-y-6">
                
                {/* Scraping Fallback Warning Banner */}
                {result.usingEstimatedStats ? (
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-xs text-indigo-800 no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                    <div className="flex gap-2">
                      <div>
                        <p className="font-bold">Stats Estimated by AI</p>
                        <p className="mt-0.5 text-indigo-700/90">
                          Auto-fetch was blocked by the platform (highly common). Stats were estimated using AI knowledge base.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleTweakStats}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] whitespace-nowrap self-stretch sm:self-auto text-center"
                    >
                      Tweak Stats
                    </button>
                  </div>
                ) : result.scrapingFailed ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                    <div className="flex gap-2">
                      <div>
                        <p className="font-bold">Auto-Fetch Statistics Limited</p>
                        <p className="mt-0.5 text-amber-700/90">
                          Platform scraping was rate-limited or is unsupported for X, TikTok, and LinkedIn.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleTweakStats}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] whitespace-nowrap self-stretch sm:self-auto text-center"
                    >
                      Fill Stats Manually
                    </button>
                  </div>
                ) : null}

                {/* MAIN PROFILE SCORE BANNER */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden print-card">
                  {/* Print only details */}
                  <div className="hidden print:block text-slate-400 text-xs mb-3 font-semibold uppercase">
                    Social Account Audit Report • Generated via AI Model
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                      {/* circular svg gauge */}
                      <div className="relative flex items-center justify-center flex-shrink-0">
                        <svg className="w-24 h-24 transform -rotate-90">
                          {/* Background Track */}
                          <circle
                            cx="48"
                            cy="48"
                            r={radius}
                            className="stroke-slate-100"
                            strokeWidth="8"
                            fill="transparent"
                          />
                          {/* Colored arc */}
                          <circle
                            cx="48"
                            cy="48"
                            r={radius}
                            className={`transition-all duration-1000 ease-out`}
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            fill="transparent"
                            style={{
                              stroke: score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : score >= 30 ? "#f97316" : "#ef4444"
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-black tracking-tighter text-slate-900">
                            <AnimatedCounter target={score} />
                          </span>
                          <span className="text-[9px] uppercase tracking-widest text-slate-500">Score</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <h2 className="text-2xl font-black text-slate-900">@{username}</h2>
                          <span className="inline-flex rounded-full bg-slate-100 border border-slate-200/85 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            {platform}
                          </span>
                          <span className="inline-flex rounded-full bg-slate-100 border border-slate-200/85 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            Data Source: {result.dataSource === "manual" ? "Manual Input" : "Live Fetch"}
                          </span>
                          {result.fetchedAt && (
                            <span className="inline-flex rounded-full bg-slate-100 border border-slate-200/85 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                              Fetched: {new Date(result.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          {result.usingAI && (
                            <span className="inline-flex rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                              AI Verified
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap justify-center sm:justify-start items-center gap-3 text-xs text-slate-500">
                          <span>Status: <strong className={score >= 75 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-rose-600"}>{scoreStatusLabel(score)}</strong></span>
                          <span className="hidden sm:inline">•</span>
                          <span>Verdict: <strong className="text-slate-800">{result.verdict}</strong></span>
                        </div>

                        <p className="mt-2 text-slate-600 text-xs sm:text-sm font-medium leading-relaxed max-w-xl">
                          {result.summary}
                        </p>
                      </div>
                    </div>

                    {/* Quick export button */}
                    <div className="flex-shrink-0 no-print">
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-bold text-white transition active:scale-95 shadow-sm"
                      >
                        Print / Export PDF
                      </button>
                    </div>
                  </div>

                  {/* Profile quick details cards */}
                  {result.profileData && (
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-slate-200">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-center shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-350 hover:bg-white">
                        <p className="text-xl font-black text-slate-900">{formatNumber(result.profileData.followers)}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">
                          {platform === "linkedin" ? "Connections" : platform === "youtube" ? "Subscribers" : "Followers"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-center shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-350 hover:bg-white">
                        <p className="text-xl font-black text-slate-900">{formatNumber(result.profileData.following)}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">Following</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-center shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-350 hover:bg-white">
                        <p className="text-xl font-black text-slate-900">{formatNumber(result.profileData.posts)}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">
                          {platform === "youtube" ? "Videos" : "Total Posts"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-center shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-350 hover:bg-white">
                        <p className="text-xl font-black text-slate-900">
                          {result.profileData.averageViews ? formatNumber(result.profileData.averageViews) : "N/A"}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">Avg Views</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* TABS SELECTOR (no-print) */}
                <div className="flex overflow-x-auto gap-2 bg-slate-100 p-1.5 rounded-2xl no-print">
                  {[
                    { id: "overview", label: "Dashboard" },
                    { id: "signals", label: "Core Signals" },
                    { id: "strategy", label: "Content Blueprint" },
                    { id: "monetization", label: "Monetization" },
                    { id: "swot", label: "SWOT Audit" },
                    { id: "actionList", label: "Action Plan" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`whitespace-nowrap px-4 py-2 text-xs font-bold rounded-xl transition ${
                        activeTab === tab.id
                          ? `${t.accentSolid} text-white shadow-sm`
                          : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* ─── TAB CONTENT: OVERVIEW / DASHBOARD ─── */}
                {(activeTab === "overview" || typeof window === 'undefined') && (
                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-4">
                      {/* Metric cards */}
                      <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm print-card">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Engagement Rate</p>
                        <p className={`text-2xl font-black mt-1 ${t.textAccent}`}>{result.metrics?.engagementRate || "N/A"}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Est. per post interaction</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm print-card">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Quality Score</p>
                        <p className="text-2xl font-black mt-1 text-slate-950">{result.metrics?.qualityScore || "N/A"}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Audience authenticity</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm print-card">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Activity Level</p>
                        <p className="text-2xl font-black mt-1 text-slate-950">{result.metrics?.activityRate || "N/A"}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Publishing cadence frequency</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm print-card">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Growth Velocity</p>
                        <p className="text-2xl font-black mt-1 text-slate-950">{result.metrics?.growthVelocity || "N/A"}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Estimated growth trend</p>
                      </div>
                    </div>

                    {/* Bio review */}
                    {result.profileData?.bio && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print-card">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Profile Bio Description</h3>
                        <p className="text-sm italic text-slate-700 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                          &ldquo;{result.profileData.bio}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Key recommendations preview */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print-card">
                      <h3 className="text-sm font-bold text-slate-900 mb-3">
                        High-Priority Action Steps
                      </h3>
                      <div className="space-y-2">
                        {result.recommendations?.slice(0, 3).map((rec, i) => (
                          <div key={i} className="flex gap-3 text-xs bg-slate-50/50 border border-slate-150 p-3 rounded-xl">
                            <span className="font-extrabold text-slate-400">0{i+1}.</span>
                            <p className="font-medium text-slate-800">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB CONTENT: CORE SIGNALS ─── */}
                {activeTab === "signals" && (
                  <div className="grid gap-6 md:grid-cols-3">
                    {["audienceQuality", "consistency", "growth"].map((key) => {
                      const sec = result?.sections?.[key];
                      const meta = sectionMeta[key];
                      const sectionScore = sec?.score;
                      const signals = sec?.signals?.length ? sec.signals : ["No detailed signals compiled."];

                      return (
                        <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between print-card">
                          <div>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                              <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-slate-800">
                                {meta.title}
                              </h3>
                              {sectionScore != null && (
                                <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-black text-white ${
                                  sectionScore >= 75 ? "bg-emerald-500" : sectionScore >= 50 ? "bg-amber-500" : "bg-rose-500"
                                }`}>
                                  {sectionScore}/100
                                </span>
                              )}
                            </div>
                            <div className="space-y-2.5">
                              {signals.map((signal, i) => (
                                <div key={i} className="flex gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 leading-normal">
                                  <span className="text-slate-400 flex-shrink-0">•</span>
                                  <p className="font-medium">{signal}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center font-semibold uppercase">
                            Diag Check Complete
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ─── TAB CONTENT: CONTENT BLUEPRINT ─── */}
                {activeTab === "strategy" && (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm print-card">
                      <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Custom Content Strategy Blueprint</h3>
                          <p className="text-xs text-slate-400 uppercase mt-0.5 font-semibold">
                            Niche Focus: {result.contentStrategy?.niche || "General Content Creator"}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Pillars */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Suggested Content Pillars</h4>
                          <div className="space-y-2">
                            {result.contentStrategy?.contentPillars?.map((pillar, i) => (
                              <div key={i} className="p-3 bg-slate-50/50 border border-slate-200/80 rounded-xl flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white ${t.badge}`}>
                                  {i+1}
                                </span>
                                <p className="text-xs font-bold text-slate-800">{pillar}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Format Suggestions */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Ideal Formats & Distribution</h4>
                          <div className="space-y-2">
                            {result.contentStrategy?.formatRecommendations?.map((format, i) => (
                              <div key={i} className="p-3 bg-slate-50/50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 flex items-center gap-2">
                                <span className="text-slate-400">→</span>
                                <p>{format}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Engagement tips */}
                      <div className="mt-6 pt-5 border-t border-slate-150">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Interactive Engagement Tactics</h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {result.contentStrategy?.engagementTips?.map((tip, i) => (
                            <div key={i} className={`p-3.5 rounded-xl border-2 ${t.section} text-xs font-semibold`}>
                              {tip}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB CONTENT: MONETIZATION ROADMAP ─── */}
                {activeTab === "monetization" && (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print-card">
                      <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Monetization & Scaling Roadmap</h3>
                          <p className="text-xs text-slate-400 uppercase mt-0.5 font-semibold">
                            Custom Revenue Channels
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Revenue Streams */}
                        <div className="rounded-2xl border border-slate-150 p-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">High-Converting Income Streams</h4>
                          <div className="space-y-2.5">
                            {result.monetizationRoadmap?.streams?.map((stream, i) => (
                              <div key={i} className="p-3 bg-emerald-50/20 border border-emerald-500/10 rounded-xl flex items-start gap-2.5">
                                <span className="text-emerald-600 font-extrabold mt-0.5">•</span>
                                <p className="text-xs font-semibold text-slate-800">{stream}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Scaling tips */}
                        <div className="rounded-2xl border border-slate-150 p-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Scaling Guidelines</h4>
                          <div className="space-y-2.5">
                            {result.monetizationRoadmap?.scalingTips?.map((tip, i) => (
                              <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5">
                                <span className="text-indigo-600 font-extrabold mt-0.5">•</span>
                                <p className="text-xs font-semibold text-slate-700">{tip}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB CONTENT: SWOT AUDIT ─── */}
                {activeTab === "swot" && (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print-card">
                      <h3 className="text-sm font-bold text-slate-950 mb-4">
                        SWOT Analysis Audit
                      </h3>

                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Strengths */}
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/10 p-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                            Strengths
                          </h4>
                          <ul className="mt-2.5 space-y-2 text-xs text-slate-700 font-medium">
                            {result.swot?.strengths?.map((item, idx) => (
                              <li key={idx} className="flex gap-2">
                                <span>+</span> {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="rounded-2xl border border-rose-500/20 bg-rose-50/10 p-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
                            Weaknesses
                          </h4>
                          <ul className="mt-2.5 space-y-2 text-xs text-slate-700 font-medium">
                            {result.swot?.weaknesses?.map((item, idx) => (
                              <li key={idx} className="flex gap-2">
                                <span>-</span> {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Opportunities */}
                        <div className="rounded-2xl border border-blue-500/20 bg-blue-50/10 p-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800">
                            Opportunities
                          </h4>
                          <ul className="mt-2.5 space-y-2 text-xs text-slate-700 font-medium">
                            {result.swot?.opportunities?.map((item, idx) => (
                              <li key={idx} className="flex gap-2">
                                <span>★</span> {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Threats */}
                        <div className="rounded-2xl border border-amber-500/20 bg-amber-50/10 p-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                            Threats
                          </h4>
                          <ul className="mt-2.5 space-y-2 text-xs text-slate-700 font-medium">
                            {result.swot?.threats?.map((item, idx) => (
                              <li key={idx} className="flex gap-2">
                                <span>!</span> {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB CONTENT: ACTION PLAN CHECKLIST ─── */}
                {activeTab === "actionList" && (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print-card">
                      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Customized Optimization Checklist</h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Check off recommendations as you implement them on your channel.
                          </p>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700">
                          {Object.values(checkedRecs).filter(Boolean).length} / {result.recommendations?.length || 0} Done
                        </span>
                      </div>

                      <div className="space-y-3">
                        {result.recommendations?.map((rec, i) => {
                          const isDone = !!checkedRecs[i];
                          return (
                            <div
                              key={i}
                              onClick={() => setCheckedRecs(p => ({ ...p, [i]: !isDone }))}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none hover:shadow-sm ${
                                isDone 
                                  ? "border-emerald-200 bg-emerald-50/30 text-slate-500" 
                                  : "border-slate-200 bg-slate-50 hover:bg-slate-100/50"
                              }`}
                            >
                              <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                isDone 
                                  ? "border-emerald-600 bg-emerald-600 text-white" 
                                  : "border-slate-300"
                              }`}>
                                {isDone && <span className="text-[10px] font-bold">✓</span>}
                              </div>
                              <span className={`text-xs font-semibold leading-relaxed ${isDone ? "line-through" : "text-slate-800"}`}>
                                {rec}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>

        {/* Commercial Use Disclaimer */}
        <footer className="mt-12 text-center text-[11px] text-slate-450 border-t border-slate-200/60 pt-5 max-w-7xl mx-auto no-print">
          * Disclaimer: This tool uses public API scraping and AI intelligence models to estimate social media statistics. All generated insights, SWOT diagnostic parameters, and strategy recommendations are for educational and growth planning purposes only, and are not certified for official commercial use.
        </footer>
      </div>

      {/* Embedded print styling block */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            font-size: 12px !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card {
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            border-radius: 12px !important;
            padding: 15px !important;
            break-inside: avoid !important;
          }
          /* ensure grid works on print */
          .grid {
            display: grid !important;
          }
          .md\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .md\\:grid-cols-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          }
          .md\\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
          .sm\\:grid-cols-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          }
        }
      `}</style>
    </div>
  );
}
