"use client";

import { useMemo, useState, useEffect } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const platformOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
];

const theme = {
  instagram: {
    accent: "from-purple-600 via-pink-500 to-orange-400",
    accentSolid: "bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400",
    btn: "bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500",
    ring: "focus:border-pink-400 focus:ring-pink-500",
    badge: "bg-gradient-to-r from-purple-500 to-pink-500",
    glow1: "bg-purple-200/25",
    glow2: "bg-orange-200/25",
    label: "text-pink-600",
    section: "border-pink-100 bg-pink-50 text-pink-900",
    tag: "text-purple-600",
  },
  youtube: {
    accent: "from-red-600 to-red-500",
    accentSolid: "bg-gradient-to-r from-red-600 to-red-500",
    btn: "bg-red-600 hover:bg-red-700",
    ring: "focus:border-red-400 focus:ring-red-500",
    badge: "bg-red-600",
    glow1: "bg-red-200/25",
    glow2: "bg-rose-200/25",
    label: "text-red-600",
    section: "border-red-100 bg-red-50 text-red-900",
    tag: "text-red-600",
  },
};

const sectionMeta = {
  audienceQuality: { icon: "👥", title: "Audience Quality" },
  consistency: { icon: "📅", title: "Consistency" },
  growth: { icon: "📈", title: "Growth Signals" },
};

const verdictStyles = {
  authentic: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "✓", textColor: "text-emerald-700", bgColor: "bg-emerald-600" },
  mixed: { bg: "bg-amber-50", border: "border-amber-200", icon: "⚠", textColor: "text-amber-700", bgColor: "bg-amber-600" },
  questionable: { bg: "bg-orange-50", border: "border-orange-200", icon: "!", textColor: "text-orange-700", bgColor: "bg-orange-600" },
  spam: { bg: "bg-rose-50", border: "border-rose-200", icon: "✗", textColor: "text-rose-700", bgColor: "bg-rose-600" },
};

function scoreGradient(score) {
  if (score >= 75) return "from-emerald-500 to-green-500";
  if (score >= 50) return "from-amber-500 to-orange-500";
  return "from-rose-500 to-red-500";
}

function scoreLabel(score) {
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

function formatNumber(n) {
  if (!n) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

// Animated counter component
function AnimatedCounter({ target, duration = 1500 }) {
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

// Get last active info
function getLastActiveText(joinDate) {
  if (!joinDate) return null;
  try {
    const dateStr = joinDate.replace(/^Joined\s*/i, "").trim();
    const joined = new Date(dateStr);
    if (isNaN(joined.getTime())) return null;
    
    const now = new Date();
    const days = Math.floor((now - joined) / (1000 * 60 * 60 * 24));
    
    if (days < 1) return "Just joined";
    if (days < 30) return `Active for ${days} day${days > 1 ? 's' : ''}`;
    if (days < 365) {
      const months = Math.floor(days / 30);
      return `Active for ${months} month${months > 1 ? 's' : ''}`;
    }
    const years = Math.floor(days / 365);
    return `Active for ${years} year${years > 1 ? 's' : ''}`;
  } catch {
    return null;
  }
}

// Get percentile
function getPercentile(score) {
  if (score >= 85) return 92;
  if (score >= 75) return 78;
  if (score >= 65) return 65;
  if (score >= 50) return 45;
  if (score >= 35) return 25;
  return 12;
}

export default function SocialAccountAnalyzerPage() {
  const [platform, setPlatform] = useState("instagram");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const t = theme[platform];

  const placeholder = useMemo(() => {
    return platform === "instagram" ? "@username" : "@channelhandle";
  }, [platform]);

  const handleAnalyze = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setError("Please enter a username or handle.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/social-account-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, username: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Analysis failed.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const verdictStyle = result?.score != null ? getVerdictStyle(result.score) : null;
  const percentile = result?.score != null ? getPercentile(result.score) : null;
  const lastActive = result?.profileData?.joinDate ? getLastActiveText(result.profileData.joinDate) : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          {/* Glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className={`absolute -top-24 -right-24 h-72 w-72 rounded-full ${t.glow1} blur-3xl transition-colors duration-500`} />
            <div className={`absolute -bottom-24 -left-24 h-72 w-72 rounded-full ${t.glow2} blur-3xl transition-colors duration-500`} />
          </div>

          <div className="relative grid gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-10">
            {/* ─── LEFT: Input ─── */}
            <section>
              <p className={`text-xs font-semibold uppercase tracking-[0.25em] ${t.tag} transition-colors duration-300`}>Creator Tools</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Social Account Analyzer</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                Check the health of any Instagram or YouTube account — get a rough estimate of audience quality, posting consistency, and growth signals.
              </p>

              {/* Info cards */}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">What it checks</p>
                  <p className="mt-2 text-sm text-slate-700">Spam followers, engagement, posting frequency, and growth.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">What it returns</p>
                  <p className="mt-2 text-sm text-slate-700">Health score, detailed signals, and actionable tips.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Best for</p>
                  <p className="mt-2 text-sm text-slate-700">Creators, brands, and anyone vetting social accounts.</p>
                </div>
              </div>

              {/* Form */}
              <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <div className="grid gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Platform</label>
                    <ThemedDropdown
                      ariaLabel="Select platform"
                      value={platform}
                      options={platformOptions}
                      onChange={(v) => { setPlatform(v); setResult(null); setError(""); }}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      {platform === "instagram" ? "Instagram Username" : "YouTube Channel Handle"}
                    </label>
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                      placeholder={placeholder}
                      className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition ${t.ring}`}
                    />
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className={`w-full rounded-2xl px-5 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300 ${t.btn}`}
                  >
                    {loading ? "Analyzing..." : "Analyze Account"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
              )}
            </section>

            {/* ─── RIGHT: Results ─── */}
            <section className="flex flex-col gap-4">
              {/* Score card */}
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-lg shadow-slate-950/10">
                <div className={`inline-flex rounded-full bg-gradient-to-r ${result?.score != null ? scoreGradient(result.score) : t.accent} px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white`}>
                  {result?.score != null ? scoreLabel(result.score) : "Awaiting scan"}
                </div>

                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Health Score</p>
                    <p className="text-6xl font-black tracking-tight">
                      {result?.score != null ? (
                        <AnimatedCounter target={result.score} duration={1200} />
                      ) : (
                        "--"
                      )}
                    </p>
                  </div>
                  <div className={`h-24 w-24 rounded-full bg-gradient-to-br ${result?.score != null ? scoreGradient(result.score) : t.accent} p-[3px]`}>
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950 text-center">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                        {result?.score != null ? scoreLabel(result.score) : "Health"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Prominent verdict */}
                {result?.score != null && verdictStyle && (
                  <div className={`mt-6 rounded-2xl border-2 ${verdictStyle.border} ${verdictStyle.bg} p-4`}>
                    <div className="flex items-start gap-3">
                      <div className={`${verdictStyle.bgColor} rounded-full w-8 h-8 flex items-center justify-center text-white text-lg font-bold flex-shrink-0 mt-0.5`}>
                        {verdictStyle.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg ${verdictStyle.textColor}`}>{result.verdict}</h3>
                        <p className={`text-sm ${verdictStyle.textColor} mt-1 opacity-90`}>{result.summary}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Percentile & Last Active */}
                {result?.score != null && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {percentile && (
                      <div className="rounded-xl bg-white/5 p-3 text-center">
                        <p className="text-xs uppercase tracking-widest text-slate-400">Percentile</p>
                        <p className="mt-1 text-lg font-bold">Top {percentile}%</p>
                      </div>
                    )}
                    {lastActive && (
                      <div className="rounded-xl bg-white/5 p-3 text-center">
                        <p className="text-xs uppercase tracking-widest text-slate-400">Status</p>
                        <p className="mt-1 text-lg font-bold">{lastActive}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Profile quick stats */}
                {result?.profileData && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {platform === "instagram" ? (
                      <>
                        <div className="rounded-xl bg-white/5 p-3 text-center">
                          <p className="text-lg font-bold">{formatNumber(result.profileData.followers)}</p>
                          <p className="text-[10px] uppercase tracking-widest text-slate-400">Followers</p>
                        </div>
                        <div className="rounded-xl bg-white/5 p-3 text-center">
                          <p className="text-lg font-bold">{formatNumber(result.profileData.following)}</p>
                          <p className="text-[10px] uppercase tracking-widest text-slate-400">Following</p>
                        </div>
                        <div className="rounded-xl bg-white/5 p-3 text-center">
                          <p className="text-lg font-bold">{formatNumber(result.profileData.posts)}</p>
                          <p className="text-[10px] uppercase tracking-widest text-slate-400">Posts</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="rounded-xl bg-white/5 p-3 text-center">
                          <p className="text-lg font-bold">{formatNumber(result.profileData.subscribers)}</p>
                          <p className="text-[10px] uppercase tracking-widest text-slate-400">Subs</p>
                        </div>
                        <div className="rounded-xl bg-white/5 p-3 text-center">
                          <p className="text-lg font-bold">{formatNumber(result.profileData.videos)}</p>
                          <p className="text-[10px] uppercase tracking-widest text-slate-400">Videos</p>
                        </div>
                        <div className="rounded-xl bg-white/5 p-3 text-center">
                          <p className="text-lg font-bold">{formatNumber(result.profileData.totalViews)}</p>
                          <p className="text-[10px] uppercase tracking-widest text-slate-400">Views</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Section cards */}
              {["audienceQuality", "consistency", "growth"].map((key) => {
                const sec = result?.sections?.[key];
                const meta = sectionMeta[key];
                const sectionScore = sec?.score;
                const signals = sec?.signals?.length ? sec.signals : ["Your analysis will appear here."];

                return (
                  <div key={key} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                        {meta.icon} {meta.title}
                      </h3>
                      {sectionScore != null && (
                        <span className={`inline-flex rounded-full bg-gradient-to-r ${scoreGradient(sectionScore)} px-2.5 py-0.5 text-xs font-bold text-white`}>
                          {sectionScore}/100
                        </span>
                      )}
                    </div>
                    <div className="mt-4 space-y-3">
                      {signals.map((signal, i) => (
                        <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                          {signal}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Recommendations */}
              {result && (
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                    💡 Actionable Recommendations
                  </h3>
                  <div className="mt-4 space-y-2">
                    {(result?.recommendations?.length ? result.recommendations : ["Run an analysis to get tailored tips."]).map((item, i) => (
                      <div key={i} className={`rounded-xl border-2 ${t.section} px-4 py-3 text-sm font-medium transition hover:shadow-sm`}>
                        <span className="inline-block">→</span> {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
