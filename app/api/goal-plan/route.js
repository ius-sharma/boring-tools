export async function POST(req) {
  const body = await req.json();
  const { goal, deadline, constraints, focusLevel } = body;

  // Basic validation
  if (!goal || !goal.trim()) {
    return new Response(JSON.stringify({ error: "Missing goal" }), { status: 400 });
  }

  // If OPENAI_API_KEY is not set, return a simple heuristic fallback
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // If neither Groq nor OpenAI key is set, return a simple heuristic fallback
  if (!groqKey && !openaiKey) {
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
  // Prefer Groq if available, fallback to OpenAI, then to heuristic
  const prompt = `You are a helpful planning assistant. Create a realistic, step-by-step milestone plan for the goal: "${goal}". Deadline: ${deadline || "none"}. Constraints: ${constraints || "none"}. Focus level (1-100): ${focusLevel || 50}.

Return a JSON object with keys: milestones (array of {title,tasks}), tips (array of strings). Keep tasks actionable and small.`;

  // Try Groq first
  if (groqKey) {
    try {
      const groqUrl = process.env.GROQ_API_URL || "https://api.groq.ai/v1";
      const model = process.env.GROQ_MODEL || "groq-1";
      const resp = await fetch(`${groqUrl}/models/${model}/outputs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: prompt,
          parameters: { max_output_tokens: 800, temperature: 0.7 },
        }),
      });

      const text = await resp.text();
      if (!resp.ok) {
        console.error('Groq API error', resp.status, text);
        throw new Error(`Groq API error ${resp.status}: ${text}`);
      }

      let content = text;
      try {
        const parsed = JSON.parse(text);
        if (parsed.outputs && Array.isArray(parsed.outputs)) {
          content = parsed.outputs.map((o) => {
            if (typeof o === "string") return o;
            if (o?.content) {
              if (Array.isArray(o.content)) return o.content.map((c) => c?.text || c).join("");
              if (typeof o.content === "string") return o.content;
            }
            return JSON.stringify(o);
          }).join("\n");
        } else if (parsed.output_text) content = parsed.output_text;
        else content = JSON.stringify(parsed);
      } catch (e) {
        content = text;
      }

      try {
        const plan = JSON.parse(content);
        return new Response(JSON.stringify({ plan }), { status: 200 });
      } catch (e) {
        return new Response(JSON.stringify({ plan: { raw: content } }), { status: 200 });
      }
    } catch (e) {
      console.error('Groq failed, falling back', e);
    }
  }

  // Try OpenAI next
  if (openaiKey) {
    try {
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [{ role: "system", content: "You are a concise planning assistant." }, { role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 600,
        }),
      });

      const text = await resp.text();
      if (!resp.ok) {
        console.error('OpenAI API error', resp.status, text);
        throw new Error(`OpenAI API error ${resp.status}: ${text}`);
      }

      let content = text;
      try {
        const parsed = JSON.parse(text);
        content = parsed?.choices?.[0]?.message?.content || text;
      } catch (e) {
        content = text;
      }

      try {
        const plan = JSON.parse(content);
        return new Response(JSON.stringify({ plan }), { status: 200 });
      } catch (e) {
        return new Response(JSON.stringify({ plan: { raw: content } }), { status: 200 });
      }
    } catch (e) {
      console.error('OpenAI failed, falling back', e);
    }
  }

  // Final fallback heuristic
  const fallback = {
    message: "LLM providers failed or not configured. Returning heuristic plan.",
    plan: {
      milestones: [
        { title: "Milestone 1: Start", tasks: ["Research the topic", "Draft a small plan"] },
        { title: "Milestone 2: Progress", tasks: ["Prototype a quick version", "Get feedback"] },
        { title: "Milestone 3: Finalize", tasks: ["Polish and publish", "Share with audience"] },
      ],
      tips: ["Make the goal specific.", "Timebox work.", "Review weekly."],
    },
  };
  return new Response(JSON.stringify(fallback), { status: 200 });
}
