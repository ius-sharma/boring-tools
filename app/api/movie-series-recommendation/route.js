import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

// Helper function to extract JSON from markdown fences if the LLM wraps it
function safeParseJson(content) {
  try {
    return JSON.parse(content);
  } catch (e) {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (innerError) {
        return null;
      }
    }
    
    // Attempt to find the first '{' and last '}'
    const firstBrace = content.indexOf("{");
    const lastBrace = content.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(content.substring(firstBrace, lastBrace + 1));
      } catch (bracesError) {
        return null;
      }
    }
    return null;
  }
}

function buildPrompt({ filters, searchQuery, collection, favorites = [], history = [], likedTitles = [], dislikedTitles = [] }) {
  let promptText = `You are a professional movie, TV show, anime, and documentary recommendation engine.
Your task is to generate exactly 6 to 8 highly accurate, real (non-hallucinated) recommendations based on the user's query.

`;

  if (collection) {
    promptText += `The user clicked the Smart Collection: "${collection}". 
Generate a list of outstanding, critically acclaimed movies or TV series that belong to this theme/collection.
`;
  } else if (searchQuery) {
    promptText += `The user is searching for: "${searchQuery}". 
Find movies, TV series, anime, or directors/actors that match this keyword. Provide recommendations related to this search query.
`;
  } else if (filters) {
    promptText += `The user filled out a recommendation builder with the following details:
- Type: ${filters.type || "Any"}
- Mood: ${filters.mood || "Any"}
- Genres: ${filters.genres && filters.genres.length > 0 ? filters.genres.join(", ") : "Any"}
- Available Time: ${filters.availableTime || "Any"}
- Brain Power Level: ${filters.brainPower || "Any"}
- Energy Level: ${filters.energyLevel || "Any"}
- Language: ${filters.language || "Any"}
- Release Year Range: ${filters.releaseYear || "Any"}
- Minimum IMDb Rating: ${filters.imdbRating || "Any"}
- Streaming Platforms (Preferred): ${filters.platforms && filters.platforms.length > 0 ? filters.platforms.join(", ") : "Any"}
`;
  } else {
    promptText += `Generate a mixed list of top trending and highly rated movies and series across multiple genres.
`;
  }

  // Personalization based on watchlist, favorites, and ratings
  if (favorites && favorites.length > 0) {
    promptText += `\nThe user loves these movies/series: ${favorites.join(", ")}. Use this as taste reference to find similar styles.
`;
  }
  if (history && history.length > 0) {
    promptText += `\nThe user has already watched: ${history.join(", ")}. Avoid recommending these exact titles, choose other titles instead.
`;
  }
  if (likedTitles && likedTitles.length > 0) {
    promptText += `\nThe user highly rated the following titles (they liked them): ${likedTitles.join(", ")}. Recommend similar titles that match the storytelling, theme, director, cast, or pacing of these highly rated items.
`;
  }
  if (dislikedTitles && dislikedTitles.length > 0) {
    promptText += `\nThe user gave low ratings to these titles (they disliked them): ${dislikedTitles.join(", ")}. Make sure NOT to recommend these, and do NOT recommend titles that are similar in tone, theme, or style to these.
`;
  }


  promptText += `
Instructions:
1. Ensure all recommendations are REAL, exist, and have accurate details. Do not make up films.
2. For each recommendation, provide complete metadata.
3. For the "runtime" field:
   - If it's a Movie or Documentary, provide the total duration in minutes (e.g., 148).
   - If it's a TV Series, Anime, or Mini Series, provide the average episode length in minutes (e.g., 50 or 24) and NOT the total season runtime.
4. "whyRecommended" MUST be a formatted string starting with "Because you selected [matching preferences]" followed by a short explanation of why it fits (e.g., "Because you selected Space, Emotional, 2 Hours, and Mind Blowing, this movie perfectly matches your preferences.").
5. "matchScore" MUST be an integer from 85 to 99 representing the calculated fit.
6. "matchReasons" MUST be an array of 3 to 4 short bullet point explanations of why the score matches (e.g., ["Matches your Space mood", "Fits your 2-hour window", "Matches your Brain Power preference"]).
7. "badges" MUST be an array containing 0 to 3 values selected from: "oscar_winner", "trending", "underrated", "cult_classic", "mind_blowing", "hidden_gem".
8. "tmdbRating" MUST be a float from 0 to 10.
9. "tmdbId" MUST be the actual TMDB ID (integer) for the movie/series if known, or 0/null if unknown.
10. "streamingPlatforms" should be an array of platforms where it is available (e.g., ["Netflix", "Prime Video", "Apple TV"]).
11. Return ONLY a valid JSON object. Do not add any conversational text before or after the JSON.

Expected JSON format:
{
  "recommendations": [
    {
      "id": "slug-title-lowercase-no-spaces",
      "title": "Exact Title Name",
      "type": "Movie" | "Series" | "Anime" | "Documentary" | "Mini Series",
      "releaseYear": 2014,
      "runtime": 169,
      "imdbRating": 8.7,
      "tmdbRating": 8.5,
      "tmdbId": 157336,
      "genres": ["Sci-Fi", "Adventure", "Drama"],
      "languages": ["English"],
      "director": "Christopher Nolan",
      "shortDescription": "A brief, punchy one-sentence summary.",
      "longDescription": "A detailed synopsis of the plot, characters, and setup (2-3 sentences).",
      "cast": ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
      "awards": "Won 1 Oscar. 78 wins & 148 nominations total.",
      "country": "United States",
      "posterUrl": "",
      "funFacts": [
        "First fun fact about production or trivia.",
        "Second fun fact about production or trivia."
      ],
      "reasonsToWatch": [
        "Reason 1",
        "Reason 2",
        "Reason 3"
      ],
      "whyRecommended": "Because you selected Space, Emotional, and Mind Blowing, this movie is an absolute match for your preferences.",
      "matchScore": 96,
      "matchReasons": [
        "Matches your Space mood",
        "Fits your 2-hour window",
        "Matches Mind Blowing pref"
      ],
      "badges": ["oscar_winner", "trending", "mind_blowing"],
      "moods": ["Mind Blowing", "Emotional", "Thought Provoking"],
      "contentPreferences": ["Mind Bending", "Slow Burn", "Plot Twist"],
      "popularityScore": 97,
      "streamingPlatforms": ["Netflix", "Prime Video"],
      "collections": ["Greatest Sci-Fi", "Best Space Movies", "Mind Blowing Movies"],
      "similarTitles": ["Inception", "Gravity", "The Martian"]
    }
  ]
}
`;

  return promptText;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key not configured in environment" },
        { status: 503 }
      );
    }

    const prompt = buildPrompt(body);

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.7,
        max_tokens: 4000,
        messages: [
          {
            role: "system",
            content: "You are a professional movie discovery engine. You only return a valid JSON object matching the requested schema.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq request failed:", errorText);
      return NextResponse.json(
        { error: "Groq request failed", details: errorText },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const parsed = safeParseJson(content);

    if (!parsed || !parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      console.error("Failed to parse JSON structure from LLM response:", content);
      return NextResponse.json(
        { error: "Invalid JSON format returned from AI model" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);

  } catch (error) {
    console.error("Error in movie recommendations API:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations due to server error" },
      { status: 500 }
    );
  }
}
