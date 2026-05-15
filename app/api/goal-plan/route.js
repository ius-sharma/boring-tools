export async function POST(req) {
  const body = await req.json();
  const { goal, deadline, constraints, focusLevel } = body;

  // Basic validation
  if (!goal || !goal.trim()) {
    return new Response(JSON.stringify({ error: "Missing goal" }), { status: 400 });
  }

  // If OPENAI_API_KEY is not set, return a simple heuristic fallback
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    // simple fallback mirroring client-side logic
    const simple = {
      message: "OPENAI_API_KEY not set. Returning heuristic plan.",
      plan: {
        milestones: [
          { title: "Milestone 1: Start", tasks: ["Research the topic", "Draft a small plan"] },
          { title: "Milestone 2: Progress", tasks: ["Prototype a quick version", "Get feedback"] },
          { title: "Milestone 3: Finalize", tasks: ["Polish and publish", "Share with audience"] },
        ],
        tips: ["Make the goal specific.", "Timebox work.", "Review weekly."],
      },
    };
    return new Response(JSON.stringify(simple), { status: 200 });
  }

  // Call OpenAI Chat Completion API
  try {
    const prompt = `You are a helpful planning assistant. Create a realistic, step-by-step milestone plan for the goal: "${goal}". Deadline: ${deadline || "none"}. Constraints: ${constraints || "none"}. Focus level (1-100): ${focusLevel || 50}.

Return a JSON object with keys: milestones (array of {title,tasks}), tips (array of strings). Keep tasks actionable and small.`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "system", content: "You are a concise planning assistant." }, { role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    const data = await resp.json();
    // Try to parse assistant content as JSON
    const content = data?.choices?.[0]?.message?.content || "";
    let plan = null;
    try {
      plan = JSON.parse(content);
    } catch (e) {
      // If not valid JSON, return as text wrapped
      plan = { raw: content };
    }

    return new Response(JSON.stringify({ plan }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
