"use client";

import { useMemo, useState } from "react";

const frequencyMap = {
  Daily: 1.0,
  Weekly: 0.8,
  Monthly: 0.5,
  Occasionally: 0.2,
};

function clamp(v, a = 0, b = 100) {
  return Math.min(Math.max(v, a), b);
}

export default function HowReplaceableIsMyJob() {
  const [role, setRole] = useState("");
  const [tasks, setTasks] = useState("");
  const [automatable, setAutomatable] = useState(40);
  const [frequency, setFrequency] = useState("Weekly");
  const [socialSkills, setSocialSkills] = useState(3);
  const [domainComplexity, setDomainComplexity] = useState(3);
  const [years, setYears] = useState(2);

  const score = useMemo(() => {
    // weights
    const wAuto = 0.5; // how much % of automatable tasks affects replaceability
    const wFreq = 0.2; // frequency weight
    const wDomain = 0.15; // domain complexity (higher -> less replaceable)
    const wSocial = 0.1; // social/people skills (higher -> less replaceable)
    const wExp = 0.05; // experience

    const autoContribution = clamp(automatable) * wAuto;

    const freqFactor = frequencyMap[frequency] ?? 0.5; // 0..1
    const freqContribution = 100 * freqFactor * wFreq;

    // Higher domain complexity reduces replaceability
    const domainFactor = 1 - (domainComplexity - 1) / 4; // 1 -> 1, 5 -> 0
    const domainContribution = 100 * domainFactor * wDomain;

    // Higher social skills reduce replaceability
    const socialFactor = 1 - (socialSkills - 1) / 4;
    const socialContribution = 100 * socialFactor * wSocial;

    // Experience reduces replaceability (cap at 20 years)
    const expFactor = 1 - Math.min(years, 20) / 20;
    const expContribution = 100 * expFactor * wExp;

    const raw = autoContribution + freqContribution + domainContribution + socialContribution + expContribution;
    // normalize to 0-100
    const normalized = clamp(raw, 0, 100);
    return normalized;
  }, [automatable, frequency, domainComplexity, socialSkills, years]);

  const category = useMemo(() => {
    if (score >= 75) return "High — Likely Replaceable";
    if (score >= 50) return "Medium-High — Some Risk";
    if (score >= 25) return "Medium-Low — Moderate Security";
    return "Low — Hard to Replace";
  }, [score]);

  const suggestions = useMemo(() => {
    const items = [];
    if (automatable >= 60) items.push("Identify the most automatable tasks and either automate them yourself or re-skill to higher-value work.");
    if (frequency === "Daily") items.push("Automations have greater impact on daily repetitive work — focus on transferable skills.");
    if (domainComplexity <= 2) items.push("Increase domain depth (specialization) to lower replaceability.");
    if (socialSkills >= 4) items.push("Leverage your interpersonal skills to move into customer-facing or leadership tasks.");
    if (years < 3) items.push("Build unique knowledge artifacts: documentation, templates, or mentorship that increase your leverage.");
    if (items.length === 0) items.push("Keep expanding domain expertise and focus on tasks that require judgement, creativity, or people skills.");
    return items;
  }, [automatable, frequency, domainComplexity, socialSkills, years]);

  return (
    <div className="min-h-screen bg-white text-slate-900 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">How Replaceable Is My Job?</h1>
        <p className="text-sm text-slate-600 mb-6">Quick assessment of how automatable or replaceable your current role/tasks are, and practical suggestions.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold mb-1">Role title</label>
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Customer Support Specialist" className="w-full px-3 py-2 rounded border border-slate-200" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Years experience</label>
            <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} min={0} className="w-full px-3 py-2 rounded border border-slate-200" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">Primary tasks (comma separated)</label>
            <textarea value={tasks} onChange={(e) => setTasks(e.target.value)} rows={3} className="w-full px-3 py-2 rounded border border-slate-200" placeholder="List top 3-6 tasks you do regularly" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">% tasks automatable</label>
            <input type="range" min={0} max={100} value={automatable} onChange={(e) => setAutomatable(Number(e.target.value))} className="w-full" />
            <div className="text-xs text-slate-600 mt-1">{automatable}%</div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Task frequency</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full px-3 py-2 rounded border border-slate-200">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Occasionally</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Social / People Skills (1 low - 5 high)</label>
            <input type="range" min={1} max={5} value={socialSkills} onChange={(e) => setSocialSkills(Number(e.target.value))} className="w-full" />
            <div className="text-xs text-slate-600 mt-1">{socialSkills}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Domain complexity (1 simple - 5 complex)</label>
            <input type="range" min={1} max={5} value={domainComplexity} onChange={(e) => setDomainComplexity(Number(e.target.value))} className="w-full" />
            <div className="text-xs text-slate-600 mt-1">{domainComplexity}</div>
          </div>
        </div>

        <div className="mb-6 p-4 rounded border border-slate-200 bg-slate-50">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <div className="text-sm text-slate-600">Replaceability score</div>
              <div className="text-2xl font-bold">{Math.round(score)}%</div>
              <div className="text-sm text-slate-500">{category}</div>
            </div>
            <div className="flex-1">
              <div className="h-3 w-full bg-slate-200 rounded overflow-hidden">
                <div className="h-3 bg-orange-500 rounded" style={{ width: `${clamp(score)}%` }} />
              </div>
              <div className="text-xs text-slate-500 mt-2">Higher score means more replaceable/automatable</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded border border-slate-200">
            <h3 className="font-semibold mb-2">What this means</h3>
            <p className="text-sm text-slate-600">This quick model estimates how likely parts of your role are to be replaced by automation. It's a heuristic — use it to prioritise learning and task changes.</p>
            <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
              <li><strong>Automatable tasks:</strong> {automatable}%</li>
              <li><strong>Frequency:</strong> {frequency}</li>
              <li><strong>Domain complexity:</strong> {domainComplexity}/5</li>
              <li><strong>Social skills:</strong> {socialSkills}/5</li>
            </ul>
          </div>
          <div className="p-4 rounded border border-slate-200">
            <h3 className="font-semibold mb-2">Suggestions</h3>
            <ol className="list-decimal pl-5 text-sm text-slate-700">
              {suggestions.map((s, i) => (
                <li key={i} className="mb-2">{s}</li>
              ))}
            </ol>
            <div className="text-xs text-slate-500 mt-2">Tip: Keep a short log of tasks you perform each week — it's the fastest way to spot automatable work and areas to upskill.</div>
          </div>
        </div>

        <div className="mt-6 text-sm text-slate-600">When you're ready, we can add this as an Upcoming tool on the homepage and then make it Live.</div>
      </div>
    </div>
  );
}
