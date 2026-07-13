const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

/**
 * Strips markdown code fences, intro/outro labels, and stray quotes
 * that LLMs sometimes wrap around their output despite instructions.
 */
function cleanLLMResponse(text) {
  let cleaned = text.trim();

  // Remove markdown code fences (```text ... ```, ```prompt ... ```, ``` ... ```)
  cleaned = cleaned.replace(/^```[\w]*\s*\n?/i, "").replace(/\n?```\s*$/i, "");

  // Remove common intro patterns like "Here is your prompt:", "Prompt:", "Output:"
  cleaned = cleaned.replace(/^(here\s+(is|are)\s+(your\s+)?(the\s+)?(cinematic\s+)?(final\s+)?prompt\s*[:.\-]\s*)/i, "");
  cleaned = cleaned.replace(/^(prompt\s*[:.\-]\s*)/i, "");
  cleaned = cleaned.replace(/^(output\s*[:.\-]\s*)/i, "");

  // Remove wrapping double-quotes if the entire string is quoted
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }

  return cleaned.trim();
}


function buildPrompt({ subject, scene, camera, lighting, style, colorGrading, mood, details, platform, aspectRatio }) {
  const detailsStr = details && details.length > 0 ? details.join(", ") : "N/A";
  
  return `You are a professional cinematic AI prompt architect. Your task is to write a highly detailed, immersive, production-quality prompt for AI image/video generation models based on the structured details provided.
  
  Optimize the formatting strictly for the target platform: "${platform}".
  
  Format instructions for platforms:
  - Midjourney: Output a comma-separated list of visual elements and ALWAYS append Midjourney parameters: --ar ${aspectRatio || "16:9"} --style raw --v 6.0.
  - Stable Diffusion: Output a highly detailed, comma-separated list of descriptive tags.
  - ChatGPT/DALL-E 3/Imagen/Flux: Output a highly descriptive, vivid, and coherent paragraph.
  - Kling/Runway/Pika/Veo/Hailuo: Output video-centric descriptions prioritizing camera movement, panning speed, dynamic actions, and spatial layout.
  
  User Inputs:
  Subject Details:
  - Main Subject: ${subject.mainSubject}
  - Character Name: ${subject.characterName || "N/A"}
  - Age & Gender: ${subject.age || ""} ${subject.gender || ""}
  - Appearance: ${subject.appearance || "N/A"}
  - Clothing: ${subject.clothing || "N/A"}
  - Accessories: ${subject.accessories || "N/A"}
  - Expression: ${subject.expression || "N/A"}
  - Pose/Action: ${subject.pose || "N/A"}

  Scene Details:
  - Location/Environment: ${scene.location || ""} ${scene.environment || ""}
  - Weather/Season/Time: ${scene.weather || ""} ${scene.season || ""} ${scene.timeOfDay || ""}
  - Background features: ${scene.background || "N/A"}
  - Architecture: ${scene.architecture || "N/A"}
  - Props: ${scene.props || "N/A"}

  Camera Details:
  - Camera Model/Type: ${camera.cameraType || "N/A"}
  - Lens: ${camera.lens || "N/A"}
  - Shot Type: ${camera.shotType || "N/A"}
  - Camera Movement: ${camera.movement || "N/A"}

  Lighting Setup: ${lighting || "N/A"}
  Cinematic Style: ${style || "N/A"}
  Color Grade: ${colorGrading || "N/A"}
  Mood: ${mood || "N/A"}
  Visual Details: ${detailsStr}
  
  CRITICAL: ONLY return the final prompt text itself. Do not write explanations, introduction, markdown blocks (do not wrap in \`\`\`), or prefix with labels like 'Prompt:'.`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { subject, scene, camera, lighting, style, colorGrading, mood, details, platform, aspectRatio, model } = body;

    if (!subject || !subject.mainSubject || !subject.mainSubject.trim()) {
      return Response.json({ error: "Main subject is required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Groq API key not configured on server" }, { status: 503 });
    }

    const systemInstructions = "You are a professional cinematic AI prompt architect. You generate outstanding, vivid prompts for image and video diffusion models. You follow formatting constraints exactly and return ONLY the raw prompt.";

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        temperature: 0.7,
        max_tokens: 800,
        messages: [
          { role: "system", content: systemInstructions },
          { role: "user", content: buildPrompt({ subject, scene, camera, lighting, style, colorGrading, mood, details, platform, aspectRatio }) },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ error: "Groq request failed", details: errorText }, { status: 502 });
    }

    const data = await response.json();
    let prompt = data?.choices?.[0]?.message?.content;
    
    if (!prompt) {
      return Response.json({ error: "Empty completion returned from LLM" }, { status: 502 });
    }

    // Clean up common LLM artifacts
    prompt = cleanLLMResponse(prompt);

    return Response.json({ prompt });

  } catch (error) {
    console.error("Error in cinematic prompt architect API:", error);
    return Response.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
