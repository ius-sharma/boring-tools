const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

function normalize(text) {
  return String(text ?? "").trim();
}

function buildPrompt(resumeText, githubData) {
  const prompt = [
    "You are an expert technical recruiter and resume/portfolio reviewer.",
    "Evaluate the user's details and return a single, valid JSON object.",
    "You MUST respond with a single, valid JSON object containing exactly the following shape:"
  ];

  const responseFormat = {
    // ONLY include if resumeText is provided
    rating: "number // an integer from 1 to 10 indicating the resume quality",
    strengths: "string[] // array of exactly 2 specific strengths of the resume (concise, 1 sentence each)",
    improvements: "string[] // array of exactly 2 specific improvements for the resume (concise, 1 sentence each)",
    roadmapItem: "string // a specific task for the resume",
    
    // ONLY include if githubData is provided
    githubRating: "string // 'empty', 'average', or 'strong' indicating github quality",
    projectRating: "number // an integer from 1 to 10 indicating project quality based on github",
    dsaRating: "number // an integer from 1 to 10 indicating DSA skill level based on leetcode/dsa/algo repositories",
    devRating: "number // an integer from 1 to 10 indicating Development skill level based on project framework complexity",
    githubStrengths: "string[] // array of exactly 2 specific strengths of the github profile (concise, 1 sentence each)",
    githubImprovements: "string[] // array of exactly 2 specific improvements for the github profile (concise, 1 sentence each)",
    githubRoadmapItem: "string // a specific task for the github profile"
  };

  prompt.push(JSON.stringify(responseFormat, null, 2));
  prompt.push("Do NOT include keys that are not requested. If only resume text is provided, do NOT include the github keys. If only github data is provided, do NOT include the resume keys.");
  prompt.push("Do NOT include any markdown formatting, backticks, or text before or after the JSON.");
  
  prompt.push(`
GRADING CRITERIA FOR GITHUB PORTFOLIO ('githubRating'):
- 'strong': Has multiple public repositories (5+), clear project descriptions, detailed README.md files, active commits, community engagement (any stars/forks), or complex technical projects (like compilers, custom tools, full-stack apps, system integrations). If the user has high star count (5+) or active followers, they should definitely be graded 'strong'.
- 'average': Has 1-4 active repositories, mostly simple academic projects (like calculator, basic HTML/CSS pages, or basic CRUD) with few/no stars, and minimal README documentation.
- 'empty': No public repositories, or repositories are entirely empty/placeholder with no code.

GRADING CRITERIA FOR PROJECTS QUALITY ('projectRating' 1 to 10):
- 1-3 (Beginner): Very basic projects (static HTML page, simple print scripts, basic syntax exercises).
- 4-6 (Intermediate): Good academic/personal projects (basic CRUD app, calculator, todo list, simple games) with basic descriptions.
- 7-8 (Placement Ready): Advanced developer projects (full-stack web applications, mobile apps, database integrations, API services, clean README documentation).
- 9-10 (Excellent): Exceptional engineering projects (custom compiler, operating system components, libraries/frameworks, highly starred open-source tools with active users).

GRADING CRITERIA FOR DSA SKILL ('dsaRating' 1 to 10):
- 1-3: No DSA or algorithms repositories found, or very minimal code.
- 4-6: Has a repository containing basic DSA practice, solutions to simple coding problems, or basic algorithms.
- 7-8: Active DSA repositories containing solutions to a large number of problems (e.g. LeetCode solutions, competitive programming sets, data structures implementation).
- 9-10: Advanced algorithms implementations, highly optimized competitive programming setups (Codeforces, etc.), or complex graph/tree frameworks.

GRADING CRITERIA FOR DEVELOPMENT SKILL ('devRating' 1 to 10):
- 1-3: Basic static HTML/CSS files or simple script repositories.
- 4-6: Basic backend (Express, Flask) or frontend (React) projects, CRUD applications.
- 7-8: Complex full-stack applications with databases (SQL/NoSQL), authentication, deployment setup, or utility tooling.
- 9-10: Multi-service systems, cloud integrations (AWS/GCP), microservices, containerization (Docker), or package maintenance.
`);

  if (resumeText) {
    prompt.push("\nResume text:\n" + resumeText);
  }
  if (githubData) {
    prompt.push("\nGitHub Portfolio Data:\n" + JSON.stringify(githubData, null, 2));
  }

  return prompt.join("\n");
}

function safeParseJson(content) {
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    const firstObject = content.match(/\{[\s\S]*\}/)?.[0];
    if (firstObject) {
      try {
        return JSON.parse(firstObject);
      } catch {}
    }
    const fenced = content.match(/```json\s*([\s\S]*?)\s*```/i)?.[1] || content.match(/```\s*([\s\S]*?)\s*```/)?.[1];
    if (!fenced) return null;
    try {
      return JSON.parse(fenced);
    } catch {
      return null;
    }
  }
}

// Local evaluation fallback if no API key is available (made highly intelligent)
function buildLocalFallbackResults(resumeText, githubData) {
  const results = {};
  
  if (resumeText) {
    const normalized = resumeText.toLowerCase();
    const hasMetrics = /\d+%|\$\d+|\bpercent\b/i.test(normalized);
    const hasLinks = /github\.com|linkedin\.com|http|www/i.test(normalized);
    const wordCount = resumeText.split(/\s+/).length;

    let rating = 5;
    const strengths = [];
    const improvements = [];

    if (hasMetrics) {
      rating += 1;
      strengths.push("Good use of metrics and impact figures to describe accomplishments.");
    } else {
      improvements.push("Add quantitative metrics (e.g. percentage improvements, cost savings) to experience bullet points.");
    }

    if (hasLinks) {
      rating += 1;
      strengths.push("Includes professional portfolio links (LinkedIn, GitHub, etc.).");
    } else {
      improvements.push("Incorporate links to your GitHub profile and LinkedIn page in the contact header.");
    }

    if (wordCount > 300) {
      rating += 1;
      strengths.push("Substantial details provided showing project descriptions and tech stack.");
    } else {
      improvements.push("Expand on project details and elaborate on key academic/work contributions.");
    }

    if (strengths.length === 0) {
      strengths.push("Standard, clean structure with clear section layouts.", "Lists core programming languages and tools clearly.");
    } else if (strengths.length === 1) {
      strengths.push("Well-organized layout dividing technical skills and work details.");
    }
    
    if (improvements.length === 0) {
      improvements.push("Consider refactoring experience bullets using strong action verbs.", "Ensure formatting is clean and consistent throughout.");
    } else if (improvements.length === 1) {
      improvements.push("Proofread to ensure grammar is perfect and format is clean.");
    }

    const ratingClamped = Math.min(10, Math.max(1, rating));

    results.rating = ratingClamped;
    results.strengths = strengths.slice(0, 2);
    results.improvements = improvements.slice(0, 2);
    results.roadmapItem = ratingClamped < 8 
      ? "Format resume using the STAR method (Situation, Task, Action, Result) to make bullet points impact-oriented."
      : "Fine-tune your resume bullet points for specific job roles you are targeting.";
  }

  if (githubData) {
    const repoCount = githubData.public_repos || 0;
    const starCount = githubData.totalStars || 0;
    const followerCount = githubData.followers || 0;
    const topRepos = githubData.repos || [];
    
    let score = 5;
    let dsaRating = 4;
    let devRating = 5;
    let githubRating = "average";
    const strengths = [];
    const improvements = [];

    // Smart classification for "strong" profile
    if (starCount >= 5 || followerCount >= 5 || repoCount >= 10) {
      githubRating = "strong";
      score = 7;
      strengths.push("Active portfolio with established code repositories and public presence.");
    } else if (repoCount > 0) {
      strengths.push("Active GitHub presence showing public project history.");
    }

    // Inspect repository names and descriptions for complex engineering projects
    const complexKeywords = /compiler|interpreter|database|engine|framework|api|full-stack|react|next|node|spring|django|flask|docker|kubernetes|aws|cloud|microservice/i;
    let hasComplexProjects = false;
    topRepos.forEach(r => {
      if (complexKeywords.test(r.name) || complexKeywords.test(r.description)) {
        hasComplexProjects = true;
      }
    });

    if (hasComplexProjects) {
      score += 1;
      devRating = 7;
      strengths.push("Showcases complex technical project work (databases, APIs, or frameworks).");
    }

    // Check for DSA repositories specifically
    const dsaKeywords = /leetcode|dsa|algo|data-structure|competitive-programming|codeforces|hackerrank|interview-prep/i;
    let hasDsaRepos = false;
    topRepos.forEach(r => {
      if (dsaKeywords.test(r.name) || dsaKeywords.test(r.description)) {
        hasDsaRepos = true;
      }
    });

    if (hasDsaRepos) {
      dsaRating = 7;
      if (starCount > 2) {
        dsaRating = 8;
      }
      strengths.push("Maintains dedicated repositories for DSA practice and problem solving.");
    } else {
      improvements.push("Create a public repository to track your DSA solutions and algorithms practice.");
    }

    if (starCount > 15) {
      score += 1;
      devRating = Math.min(10, devRating + 1);
      strengths.push("Receives community validation with multiple stargazers.");
    }
    
    if (followerCount > 10) {
      strengths.push("Established personal developer brand with active followers.");
    }

    const hasReadmes = topRepos.some(r => r.description && r.description.length > 10);
    if (!hasReadmes && repoCount > 0) {
      improvements.push("Write detailed README.md files for your top repositories describing features and setup instructions.");
    }
    
    if (repoCount > 0 && githubData.languages && githubData.languages.length < 2) {
      improvements.push("Diversify your portfolio by building projects in more than one language/framework.");
    }

    if (strengths.length === 0) {
      strengths.push("Has a public profile created.");
    }
    if (strengths.length === 1) {
      strengths.push("Includes basic language classifications.");
    }
    if (improvements.length === 0) {
      improvements.push("Add repository descriptions to all your public repositories.");
    }
    if (improvements.length === 1) {
      improvements.push("Pin your top 3 repositories on your GitHub homepage.");
    }

    // If no repos exist at all
    if (repoCount === 0) {
      githubRating = "empty";
      score = 1;
      dsaRating = 1;
      devRating = 1;
    }

    results.githubRating = githubRating;
    results.projectRating = Math.min(10, Math.max(1, score));
    results.dsaRating = dsaRating;
    results.devRating = devRating;
    results.githubStrengths = strengths.slice(0, 2);
    results.githubImprovements = improvements.slice(0, 2);
    results.githubRoadmapItem = score < 8
      ? "Pin your best projects on GitHub, add descriptive READMEs with screenshots, and clean up repository descriptions."
      : "Contribute to open-source repositories to show collaborative coding skills.";
  }

  return results;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const resumeText = normalize(body?.resumeText);
    const githubData = body?.githubData;

    if (!resumeText && !githubData) {
      return Response.json({ error: "Resume text or GitHub data is required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json({ 
        ...buildLocalFallbackResults(resumeText, githubData), 
        source: "Local Fallback (API Key not set on server)" 
      });
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: "You are a resume and portfolio evaluation assistant. Return ONLY valid JSON in your response.",
          },
          {
            role: "user",
            content: buildPrompt(resumeText, githubData),
          },
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ error: "Groq request failed", details: errorText }, { status: 502 });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const parsed = safeParseJson(content);

    if (!parsed || (resumeText && typeof parsed.rating !== "number") || (githubData && !parsed.githubRating)) {
      return Response.json({ 
        ...buildLocalFallbackResults(resumeText, githubData), 
        source: "Local Fallback (AI output parsing error)" 
      });
    }

    return Response.json({ ...parsed, source: "Groq API" });
  } catch (error) {
    return Response.json(
      { error: "Unexpected resume scanner failure", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
