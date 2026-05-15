"use client";

import { useState } from "react";

function generatePlan(goal, deadline, constraints, focusLevel) {
  const now = new Date();
  let days = null;
  if (deadline) {
    const d = new Date(deadline);
    const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    days = Math.max(0, diff);
  }

  const complexity = Math.min(6, Math.max(3, focusLevel ? Math.ceil(focusLevel / 20) : 4));
  const milestones = [];
  const milestoneCount = days ? Math.min(6, Math.max(3, Math.ceil(days / 7))) : complexity;

  for (let i = 0; i < milestoneCount; i++) {
    const milestone = {
      title: `Milestone ${i + 1}: ${i === 0 ? "Start" : i === milestoneCount - 1 ? "Finalize" : "Progress"}`,
      tasks: [],
    };

    const taskCount = Math.min(4, 2 + (i % 3));
    for (let t = 0; t < taskCount; t++) {
      milestone.tasks.push(`Task ${t + 1}: ${generateAction(goal, i, t)}`);
    }

    milestones.push(milestone);
  }

  const tips = [
    `Make the goal specific: define exactly what 'done' looks like for "${goal}"`,
    `Break work into the smallest possible steps and timebox them.`,
    `Review progress weekly and adjust the plan based on reality.`,
  ];

  return { milestones, tips, days };
}

function generateAction(goal, milestoneIndex, taskIndex) {
  const verbs = ["Research", "Draft", "Prototype", "Test", "Refine", "Share"];
  const subjects = goal ? goal.split(" ").slice(0, 4).join(" ") : "the goal";
  const verb = verbs[(milestoneIndex + taskIndex) % verbs.length];
  return `${verb} ${subjects} — small, focused work`;
}

export default function RealityBasedGoalPlanner() {
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [constraints, setConstraints] = useState("");
  const [focusLevel, setFocusLevel] = useState(50);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useLLM, setUseLLM] = useState(true);

  const handleGenerate = async () => {
    if (!goal.trim()) {
      setPlan({ error: "Please enter a clear goal." });
      return;
    }

    if (!useLLM) {
      const result = generatePlan(goal.trim(), deadline, constraints.trim(), focusLevel);
      setPlan(result);
      return;
    }

    setLoading(true);
    setPlan(null);
    try {
      const resp = await fetch("/api/goal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, deadline, constraints, focusLevel }),
      });
      const data = await resp.json();
      // If API returned plan.plan when using OpenAI
      if (data?.plan?.plan) {
        setPlan(data.plan.plan);
      } else if (data?.plan) {
        setPlan(data.plan);
      } else if (data?.error) {
        setPlan({ error: data.error });
      } else {
        setPlan({ error: "Unexpected response from plan API" });
      }
    } catch (e) {
      setPlan({ error: String(e) });
    } finally {
      setLoading(false);
    }
  };

  const exportMarkdown = () => {
    if (!plan) return;
    let md = `# Goal Plan: ${goal}\n\n`;
    if (deadline) md += `**Deadline:** ${deadline} \n\n`;
    if (constraints) md += `**Constraints:** ${constraints} \n\n`;
    plan.milestones.forEach((m) => {
      md += `## ${m.title}\n`;
      m.tasks.forEach((t) => (md += `- ${t}\n`));
      md += `\n`;
    });
    md += `## Tips\n`;
    plan.tips.forEach((tip) => (md += `- ${tip}\n`));

    if (navigator.clipboard) navigator.clipboard.writeText(md);
    else alert("Copying not supported in this environment.");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h1 className="text-3xl font-black mb-2">Reality-Based Goal Planner</h1>
          <p className="text-slate-600 mb-6">Enter a clear goal and timeframe — the planner will break it into realistic milestones and tasks.</p>

        <div className="grid grid-cols-1 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Goal</span>
            <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="E.g. Launch my personal website" className="mt-1 block w-full rounded-md border px-3 py-2" />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Deadline (optional)</span>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Constraints / Notes (optional)</span>
            <textarea value={constraints} onChange={(e) => setConstraints(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border px-3 py-2" />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Focus level (determines granularity)</span>
            <input type="range" min="10" max="100" value={focusLevel} onChange={(e) => setFocusLevel(Number(e.target.value))} className="w-full mt-2" />
          </label>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={useLLM} onChange={(e) => setUseLLM(e.target.checked)} />
              Use LLM
            </label>
            <button onClick={handleGenerate} disabled={loading} className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50">{loading ? 'Generating…' : 'Generate Plan'}</button>
            <button onClick={() => { setGoal(""); setDeadline(""); setConstraints(""); setPlan(null); }} className="border border-slate-200 px-4 py-2 rounded-lg">Reset</button>
            <button onClick={exportMarkdown} disabled={!plan} className="ml-auto border border-slate-200 px-4 py-2 rounded-lg disabled:opacity-50">Copy as Markdown</button>
          </div>
        </div>

          {plan && plan.error && (
            <div className="mt-6 text-red-600">{plan.error}</div>
          )}

          {plan && !plan.error && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                {plan.days !== null && <div className="text-sm text-slate-600 mb-3">Estimated days until deadline: {plan.days}</div>}
                {plan.milestones.map((m, i) => (
                  <div key={i} className="mb-4">
                    <h3 className="font-semibold">{m.title}</h3>
                    <ul className="list-disc ml-6 mt-2 text-sm">
                      {m.tasks.map((t, j) => (
                        <li key={j} className="mb-1">{t}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100">
                <h4 className="font-semibold">Tips</h4>
                <ul className="list-disc ml-6 text-sm mt-2">
                  {plan.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
