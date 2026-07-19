"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ThemedDropdown from "../components/ThemedDropdown";

const INDUSTRY_OPTIONS = [
  { value: "AI", label: "🤖 Artificial Intelligence (AI)" },
  { value: "Fintech", label: "💳 Financial Technology (Fintech)" },
  { value: "Gaming", label: "🎮 Video Games & Gaming" },
  { value: "Healthcare", label: "🏥 Health & Medical Tech" },
  { value: "Education", label: "🎓 Education Tech (EdTech)" },
  { value: "SaaS", label: "☁️ Software as a Service (SaaS)" },
  { value: "E-commerce", label: "🛒 E-commerce & Retail" },
  { value: "Consumer", label: "📱 Consumer Apps & Social" },
  { value: "Web3", label: "🌐 Web3, Crypto & Blockchain" }
];

const PRESETS = [
  { name: "BrainFlow", industry: "AI" },
  { name: "PayLayer", industry: "Fintech" },
  { name: "QuestRealm", industry: "Gaming" },
  { name: "PulseHealth", industry: "Healthcare" },
  { name: "LearnWise", industry: "Education" },
  { name: "StackSync", industry: "SaaS" },
  { name: "CartSwift", industry: "E-commerce" },
  { name: "VibeLoop", industry: "Consumer" },
  { name: "HashSwap", industry: "Web3" }
];

// Heuristics Engine
function performAnalysis(name, industry) {
  const cleanName = name.trim();
  const lowerName = cleanName.toLowerCase();
  const len = cleanName.length;

  // Syllable Count Heuristic
  let syllableCount = 0;
  const vowelMatches = lowerName.match(/[aeiouy]+/g);
  if (vowelMatches) {
    syllableCount = vowelMatches.length;
    // Adjust for silent 'e' at end
    if (lowerName.endsWith('e') && syllableCount > 1 && !lowerName.endsWith('le')) {
      syllableCount--;
    }
  }
  if (syllableCount === 0) syllableCount = 1;

  // Double Letters Heuristic
  const hasDoubleLetters = /(.)\1/.test(lowerName);

  // Vowels and Consonants
  const vowels = (lowerName.match(/[aeiouy]/g) || []).length;
  const consonants = len - vowels;
  const vowelConsonantRatio = vowels / (consonants || 1);

  // Consonant clusters (e.g. str, sch)
  const hasConsonantClusters = /[^aeiouy]{3,}/.test(lowerName);

  // Classification rules:
  let nameType = "Invented Word";
  let typeReason = "";

  const knownRealWords = [
    "stripe", "slack", "notion", "mint", "scale", "seed", "bloom", "nest", "pitch", "vibe", "match", 
    "box", "square", "loom", "orbit", "spark", "pulse", "core", "apex", "shift", "drift", "grid",
    "vault", "lock", "key", "bolt", "link", "node", "dock", "port", "wave", "tide", "beam", "glow",
    "hub", "path", "loop", "mesh", "hive", "base", "sign", "mark", "flow", "rise", "bold", "rust",
    "gale", "coda", "apex", "form", "flex", "warp", "spin", "echo", "lens", "zinc", "iris"
  ];

  const commonPrefixes = ["go", "get", "we", "my", "our", "re", "co", "pro", "uni", "meta", "hyper", "omni", "pan", "alpha", "nova", "neo", "flex"];
  const commonSuffixes = ["ify", "ly", "io", "ai", "hub", "flow", "base", "grid", "stack", "labs", "hq", "pay", "coin", "chain", "net", "git", "air", "star", "smart", "quick", "health", "care", "mind", "cloud", "data", "snap", "chat", "buzz", "press", "force", "desk", "box", "app", "sync", "byte", "bit", "block", "edge", "nest", "line", "link", "path", "run", "space", "well", "zone", "feed", "mail", "post", "tech", "wave", "work"];

  // Is it acronym?
  if (len <= 4 && (cleanName === cleanName.toUpperCase() || consonants === len)) {
    nameType = "Acronym";
    typeReason = "The name is very short and composed entirely of uppercase letters or consonants, typical of abbreviated letter names like IBM, AWS, or AMD.";
  }
  // Is it misspelled?
  else if (
    (lowerName.includes("y") && !cleanName.includes("i") && knownRealWords.some(w => w.replace("i", "y") === lowerName)) ||
    (lowerName.endsWith("r") && !lowerName.endsWith("er") && vowelMatches && vowelMatches.length >= 2 && !/[aeiouy]r$/.test(lowerName)) ||
    (lowerName.includes("k") && !lowerName.includes("c") && knownRealWords.some(w => w.replace("c", "k") === lowerName))
  ) {
    nameType = "Misspelled Word";
    typeReason = "The name deliberately alters the standard spelling of a real word (like Lyft, Flickr, or Tumblr) to secure trademark and domain availability while keeping phonetic familiarity.";
  }
  // Is it Real Word?
  else if (knownRealWords.includes(lowerName)) {
    nameType = "Real Word";
    typeReason = "The name is a standard English noun or verb (like Apple, Slack, or Stripe), which provides immediate emotional resonance and high brand trust but makes domain names extremely hard to acquire.";
  }
  // Is it Founder Name?
  else if (
    lowerName.endsWith("son") || lowerName.endsWith("berg") || lowerName.endsWith("ford") || 
    lowerName.endsWith("mann") || lowerName.endsWith("cox") || lowerName.startsWith("mc") ||
    lowerName.startsWith("mac")
  ) {
    nameType = "Founder Name";
    typeReason = "The name uses a traditional surname structure (like Tesla, Ford, or McDonald's), signaling legacy, craftsmanship, and a deeply personal commitment to the brand.";
  }
  // Is it Compound?
  else if (
    (cleanName !== lowerName && cleanName !== cleanName.toUpperCase() && /[a-z][A-Z]/.test(cleanName)) ||
    commonSuffixes.some(s => lowerName.endsWith(s) && lowerName.length > s.length + 2)
  ) {
    nameType = "Compound Word";
    typeReason = "The name joins two full words or distinct terms together (like GitHub, Airbnb, or Coinbase) to describe a product's domain or function clearly.";
  }
  // Is it Blended?
  else if (
    commonPrefixes.some(p => lowerName.startsWith(p) && lowerName.length > p.length + 3) ||
    (len > 6 && vowelConsonantRatio > 0.4 && vowelConsonantRatio < 1.0)
  ) {
    nameType = "Blended Word";
    typeReason = "The name blends parts of multiple words together (like Microsoft or Instagram) to form a new, modern hybrid term with rich semantic layers.";
  } else {
    nameType = "Invented Word";
    typeReason = "The name is an entirely fabricated, phonetically balanced word (like Spotify, Kodak, or Zillow), serving as a clean slate for brand positioning and search engine optimization.";
  }

  // Memorability score
  let memorabilityScore = 80;
  if (len <= 3) memorabilityScore -= 15;
  else if (len >= 5 && len <= 8) memorabilityScore += 10;
  else if (len >= 9 && len <= 11) memorabilityScore -= 5;
  else if (len >= 12) memorabilityScore -= 25;

  if (hasDoubleLetters) memorabilityScore += 5;
  if (nameType === "Real Word") memorabilityScore += 8;
  if (nameType === "Acronym") memorabilityScore -= 15;
  memorabilityScore = Math.min(Math.max(memorabilityScore, 35), 98);

  const memDetails = {
    score: memorabilityScore,
    length: len <= 8 ? "Optimal length (shorter names have 30% higher recall)." : "Slightly long (names over 9 letters require more advertising frequency to stick).",
    distinctiveness: nameType === "Invented Word" || nameType === "Misspelled Word" ? "High distinctiveness (unconventional spelling or invented root makes it stand out)." : "Moderate distinctiveness (uses recognizable words, which aids understanding but matches existing noise).",
    repetition: hasDoubleLetters ? "Contains repeated characters or sounds, which creates a subtle rhythmic hook." : "Phonetically flat with no repeating syllables or letters.",
    visualRecall: nameType === "Real Word" || nameType === "Compound Word" ? "Strong visual recall (anchored to physical concepts like objects or actions)." : "Abstract visual recall (requires logo design to establish visual identity)."
  };

  // Pronunciation
  let pronunciationScore = 85;
  if (hasConsonantClusters) pronunciationScore -= 15;
  if (syllableCount > 4) pronunciationScore -= 15;
  if (lowerName.includes("q") || lowerName.includes("x") || lowerName.includes("z")) pronunciationScore -= 5;
  pronunciationScore = Math.min(Math.max(pronunciationScore, 40), 98);

  let pronunciationRec = "";
  if (hasConsonantClusters) {
    pronunciationRec = "The consonant clustering creates phonetic resistance. When saying the name verbally, ensure speakers don't trip over the consonants. Consider adding a vowel sound to ease the transition.";
  } else if (syllableCount >= 4) {
    pronunciationRec = "At " + syllableCount + " syllables, the name is a mouthful. Ensure the primary stress is placed clearly on the first or second syllable to maintain rhythm.";
  } else {
    pronunciationRec = "The alternating vowel-consonant structure gives it a natural cadence. It is very easy to read aloud in English and translates well phonetically.";
  }

  const pronDetails = {
    score: pronunciationScore,
    easyToPronounce: syllableCount <= 2 ? "High (1-2 syllables are universally easy to enunciate)." : syllableCount === 3 ? "Moderate (3 syllables require a clear rhythmic cadence)." : "Low (4+ syllables increase speech fatigue).",
    multiplePronunciations: (lowerName.includes("c") || lowerName.includes("g") || lowerName.includes("ei") || lowerName.includes("ch")) ? "Possible ambiguity (letters like C or G can be hard or soft depending on language background)." : "Low ambiguity (straightforward letter-to-sound translation).",
    globalReadability: lowerName.includes("th") || lowerName.includes("w") || lowerName.includes("r") ? "Medium (sounds like 'th' or 'w' do not exist in many Asian or Romance languages)." : "High (uses basic phonemes common in most global dialects).",
    recommendation: pronunciationRec
  };

  // Spelling difficulty
  let spellingEst = "Easy";
  let confusingLetters = [];
  let spellingScore = 85;

  if (nameType === "Misspelled Word") {
    spellingEst = "Hard";
    spellingScore = 45;
    if (lowerName.includes("y")) confusingLetters.push("y");
    if (lowerName.endsWith("r") && !lowerName.endsWith("er")) confusingLetters.push("r");
    if (lowerName.includes("k")) confusingLetters.push("k");
  } else if (hasConsonantClusters || lowerName.includes("ph") || lowerName.includes("ch") || lowerName.includes("ae") || lowerName.includes("oe") || lowerName.includes("ei") || hasDoubleLetters) {
    spellingEst = "Medium";
    spellingScore = 70;
    if (hasDoubleLetters) confusingLetters.push("double letters");
    if (lowerName.includes("ph")) confusingLetters.push("ph");
    if (lowerName.includes("ei")) confusingLetters.push("ei");
    if (hasConsonantClusters) confusingLetters.push("consonant clusters");
  } else if (len > 10) {
    spellingEst = "Medium";
    spellingScore = 65;
  } else {
    spellingScore = 95;
  }

  const spellingDetails = {
    score: spellingScore,
    estimate: spellingEst,
    confusingLetters: confusingLetters.length > 0 ? confusingLetters : ["None detected"],
    reasoning: spellingEst === "Hard" ? "Deliberately misspelled words require founders to verbally clarify spelling ('with a Y, not an I') which increases cognitive load." : spellingEst === "Medium" ? "Slightly complex character groups (like double letters or silent vowels) mean some people may typo the name on first listen." : "Phonetically transparent spelling. People will spell it correctly 90% of the time on first hearing."
  };

  // Brandability
  let brandDims = {
    modern: 50,
    premium: 50,
    playful: 50,
    luxury: 50,
    professional: 50,
    innovative: 50,
    trustworthy: 50,
    creative: 50
  };

  if (nameType === "Invented Word") {
    brandDims.modern = 90;
    brandDims.innovative = 85;
    brandDims.creative = 80;
    brandDims.professional = 60;
    brandDims.trustworthy = 55;
  } else if (nameType === "Real Word") {
    brandDims.premium = 85;
    brandDims.trustworthy = 85;
    brandDims.professional = 80;
    brandDims.luxury = 75;
    brandDims.playful = 40;
  } else if (nameType === "Compound Word") {
    brandDims.professional = 85;
    brandDims.trustworthy = 75;
    brandDims.modern = 70;
    brandDims.creative = 60;
  } else if (nameType === "Misspelled Word") {
    brandDims.playful = 80;
    brandDims.modern = 85;
    brandDims.innovative = 75;
    brandDims.professional = 45;
    brandDims.trustworthy = 45;
  } else if (nameType === "Acronym") {
    brandDims.professional = 80;
    brandDims.trustworthy = 70;
    brandDims.creative = 30;
    brandDims.playful = 20;
    brandDims.modern = 40;
  } else if (nameType === "Founder Name") {
    brandDims.luxury = 85;
    brandDims.premium = 80;
    brandDims.trustworthy = 90;
    brandDims.professional = 85;
    brandDims.modern = 40;
  }

  // Adjust by industry
  if (industry === "AI") {
    brandDims.innovative = Math.min(brandDims.innovative + 15, 98);
    brandDims.modern = Math.min(brandDims.modern + 10, 98);
  } else if (industry === "Fintech") {
    brandDims.trustworthy = Math.min(brandDims.trustworthy + 15, 98);
    brandDims.professional = Math.min(brandDims.professional + 10, 98);
  } else if (industry === "Gaming") {
    brandDims.playful = Math.min(brandDims.playful + 20, 98);
    brandDims.creative = Math.min(brandDims.creative + 15, 98);
    brandDims.professional = Math.max(brandDims.professional - 10, 30);
  } else if (industry === "Healthcare") {
    brandDims.trustworthy = Math.min(brandDims.trustworthy + 20, 98);
    brandDims.professional = Math.min(brandDims.professional + 10, 98);
    brandDims.playful = Math.max(brandDims.playful - 15, 25);
  }

  // Industry Fit
  const allIndustries = ["AI", "Fintech", "Gaming", "Healthcare", "Education", "SaaS", "E-commerce", "Consumer", "Web3"];
  const fits = allIndustries.map(ind => {
    let score = 50;
    if (ind === "AI") {
      if (lowerName.endsWith("ai") || lowerName.startsWith("neuro") || lowerName.includes("mind") || lowerName.includes("brain") || lowerName.includes("deep") || lowerName.includes("gpt")) score = 95;
      else if (nameType === "Invented Word" || nameType === "Blended Word") score = 85;
      else if (nameType === "Founder Name" || nameType === "Acronym") score = 45;
    } else if (ind === "Fintech") {
      if (lowerName.includes("pay") || lowerName.includes("cash") || lowerName.includes("cap") || lowerName.includes("wealth") || lowerName.includes("trust") || lowerName.includes("ledger") || lowerName.includes("vault")) score = 95;
      else if (nameType === "Real Word" || nameType === "Compound Word") score = 80;
      else if (nameType === "Misspelled Word") score = 40;
    } else if (ind === "Gaming") {
      if (lowerName.includes("play") || lowerName.includes("game") || lowerName.includes("arcade") || lowerName.includes("quest") || lowerName.includes("pixel") || lowerName.includes("verse")) score = 95;
      else if (nameType === "Misspelled Word" || nameType === "Invented Word") score = 85;
      else if (nameType === "Founder Name" || nameType === "Acronym") score = 30;
    } else if (ind === "Healthcare") {
      if (lowerName.includes("med") || lowerName.includes("care") || lowerName.includes("heal") || lowerName.includes("life") || lowerName.includes("well") || lowerName.includes("pulse")) score = 95;
      else if (nameType === "Real Word" || nameType === "Founder Name") score = 80;
      else if (nameType === "Misspelled Word") score = 30;
    } else if (ind === "Web3") {
      if (lowerName.includes("block") || lowerName.includes("chain") || lowerName.includes("coin") || lowerName.includes("hash") || lowerName.includes("meta") || lowerName.includes("swap") || lowerName.includes("ether")) score = 95;
      else if (nameType === "Invented Word" || lowerName.endsWith("io")) score = 85;
      else if (nameType === "Founder Name" || nameType === "Acronym") score = 35;
    } else if (ind === "SaaS") {
      if (lowerName.endsWith("ify") || lowerName.endsWith("ly") || lowerName.endsWith("io") || lowerName.endsWith("hub") || lowerName.endsWith("stack") || lowerName.endsWith("base")) score = 95;
      else score = 75;
    } else if (ind === "E-commerce" || ind === "Consumer") {
      if (nameType === "Real Word" || nameType === "Invented Word" || nameType === "Compound Word") score = 85;
      else score = 60;
    } else if (ind === "Education") {
      if (lowerName.includes("learn") || lowerName.includes("study") || lowerName.includes("edu") || lowerName.includes("mind") || lowerName.includes("wise") || lowerName.includes("class")) score = 95;
      else if (nameType === "Real Word" || nameType === "Compound Word") score = 75;
      else score = 50;
    }
    const offset = (lowerName.charCodeAt(0) + lowerName.charCodeAt(lowerName.length - 1)) % 7;
    score = Math.min(Math.max(score + offset, 25), 98);
    return { name: ind, score };
  });

  const selectedFit = fits.find(f => f.name === (industry || "SaaS")) || { name: "SaaS", score: 75 };
  let industryExplanation = "";
  if (selectedFit.score >= 85) {
    industryExplanation = `Excellent fit! The name structure and phonetic tone align perfectly with ${selectedFit.name} industry norms. Suffixes, syllables, and word weights evoke modern, authoritative tech associations that appeal directly to this sector's user base.`;
  } else if (selectedFit.score >= 65) {
    industryExplanation = `Good fit. The name is highly versatile and fits comfortably within ${selectedFit.name}. It doesn't use overt industry jargon, which is positive for potential future pivots, though it may require extra brand messaging to build immediate association.`;
  } else {
    industryExplanation = `Low direct fit. The tone of the name is somewhat divergent from traditional ${selectedFit.name} naming trends (which often prefer high trust or simple compounding). This can be a double-edged sword: you will stand out dramatically from competitors, but you'll have to work harder to educate users on what you do.`;
  }

  // Global appeal
  let globalScore = 80;
  if (lowerName.includes("th") || lowerName.includes("w") || lowerName.includes("r") || lowerName.includes("v")) globalScore -= 10;
  if (hasConsonantClusters) globalScore -= 15;
  if (len > 10) globalScore -= 10;
  globalScore = Math.min(Math.max(globalScore, 45), 98);

  const globalDetails = {
    score: globalScore,
    easyAcrossLanguages: globalScore >= 80 ? "Yes (uses clean vowels and simple plosives)." : "Moderate (contains sounds that do not exist or are difficult in other dialects).",
    easyInternationally: len < 9 ? "Yes (short length makes spelling translation simple)." : "No (long spelling increases risk of international transcript typing mistakes).",
    culturalNeutrality: "High (neutral abstract sound, unlikely to have negative double meanings in major languages).",
    simplePronunciation: syllableCount <= 3 ? "Yes (rhythm is straightforward)." : "No (multi-syllabic pacing leads to regional variations in stress)."
  };

  // Emotional Impact
  let emotionalImpact = {
    innovation: brandDims.innovative,
    trust: brandDims.trustworthy,
    power: brandDims.luxury >= brandDims.professional ? Math.round((brandDims.luxury + brandDims.professional)/2) : brandDims.professional,
    speed: hasDoubleLetters || lowerName.includes("x") || lowerName.includes("f") || lowerName.includes("t") || lowerName.includes("z") ? 85 : 60,
    luxury: brandDims.luxury,
    fun: brandDims.playful,
    community: nameType === "Compound Word" || lowerName.includes("hub") || lowerName.includes("net") || lowerName.includes("club") || lowerName.includes("co") ? 80 : 50,
    reliability: brandDims.trustworthy
  };

  // Visual Branding Potential
  const visualDetails = {
    logoPotential: len <= 6 ? "High (short strings form tight, clean geometric anchors)." : "Moderate (requires balanced type kern adjustments).",
    iconPotential: nameType === "Real Word" || nameType === "Compound Word" ? "Excellent (can build an icon directly around the literal meaning, e.g. Mailbox -> box icon)." : "Abstract (suggests a geometric/lettermark glyph, similar to Spotify's sound waves or Airbnb's abstract loop).",
    minimalBranding: (vowelConsonantRatio >= 0.6 && vowelConsonantRatio <= 0.9) ? "Highly suitable (phonetic balance looks clean in lowercase sans-serif typography)." : "Medium (heavy consonant density fits better with bold, structured serif styles).",
    wordmarkFriendly: (lowerName.includes("o") || lowerName.includes("i") || lowerName.includes("l") || lowerName.includes("a")) ? "Yes (circular/straight letter geometry matches modern typeface lines)." : "Moderate (heavy diagonal letters like V, W, X, Y require custom kerning).",
    appIconSuitability: len <= 7 ? "High (easy to scale down into a single symbol or lettermark)." : "Medium (too long for a literal icon; needs a simplified visual shorthand).",
    faviconSuitability: "Excellent (a single letter icon drawn from the capital letter will represent the brand clearly)."
  };

  // Domain Friendliness
  const domainShort = len < 9;
  const domainEasyType = !lowerName.includes("-") && !/\d/.test(lowerName) && !hasConsonantClusters;
  const domainLowTypo = !lowerName.includes("1") && !lowerName.includes("l") && !lowerName.includes("i");
  const domainReadable = syllableCount <= 3;

  let domainScore = 60;
  if (domainShort) domainScore += 15;
  if (domainEasyType) domainScore += 10;
  if (domainLowTypo) domainScore += 5;
  if (domainReadable) domainScore += 10;
  domainScore = Math.min(Math.max(domainScore, 30), 98);

  const domainDetails = {
    score: domainScore,
    short: domainShort ? "Short (< 9 chars)" : "Slightly long (>= 9 chars)",
    easyToType: domainEasyType ? "Easy to type (no hyphens/numbers)" : "Higher typing friction",
    lowTypoRisk: domainLowTypo ? "Low risk (clear letter boundaries)" : "Moderate risk (similar characters)",
    readable: domainReadable ? "Highly readable" : "Harder to parse visually"
  };

  // SEO Friendliness
  let seoUnique = 50;
  let seoAmbiguity = 50;
  let seoCompetition = 50;

  if (nameType === "Invented Word" || nameType === "Misspelled Word") {
    seoUnique = 90;
    seoAmbiguity = 90;
    seoCompetition = 85;
  } else if (nameType === "Compound Word" || nameType === "Blended Word") {
    seoUnique = 75;
    seoAmbiguity = 70;
    seoCompetition = 65;
  } else {
    seoUnique = 30;
    seoAmbiguity = 25;
    seoCompetition = 20;
  }

  let seoScore = Math.round((seoUnique + seoAmbiguity + seoCompetition) / 3);
  seoScore = Math.min(Math.max(seoScore, 25), 98);

  const seoDetails = {
    score: seoScore,
    uniqueKeyword: seoUnique >= 80 ? "High (no dictionary collision; search index is wide open)." : "Low (dictionary collision; high search results dilution initially).",
    easyToSearch: seoAmbiguity >= 75 ? "Excellent (voice search assistants like Siri or Alexa will match the phonetic spelling easily)." : "Moderate (voice search may mistake the spelling for the standard dictionary word).",
    potentialAmbiguity: seoAmbiguity <= 40 ? "High (competes with general dictionary phrases and definitions)." : "Low (distinct name creates immediate brand matching).",
    competitionRisk: seoCompetition <= 45 ? "High (competing with established nouns requires substantial backlink authority to overcome)." : "Low (ranking #1 for this term is relatively easy with basic optimization)."
  };

  // Social Media Friendliness
  const smShort = len < 8;
  const smHashtag = !lowerName.includes("-") && len <= 12;
  const smEasyUsername = nameType !== "Acronym" && len <= 10;
  
  let smScore = 65;
  if (smShort) smScore += 10;
  if (smHashtag) smScore += 10;
  if (smEasyUsername) smScore += 10;
  smScore = Math.min(Math.max(smScore, 40), 98);

  const socialDetails = {
    score: smScore,
    easyUsername: smEasyUsername ? "Highly recognizable username" : "Harder to secure clean usernames",
    short: smShort ? "Short handles available" : "Long handle (may exceed limits or wrap)",
    hashtagFriendly: smHashtag ? "Excellent hashtag potential" : "Suboptimal hashtag scaling",
    recognition: nameType === "Invented Word" || nameType === "Real Word" ? "High immediate recognition" : "Moderate recognition factor"
  };

  // Comparable Brands
  let similarBrands = [];
  if (nameType === "Real Word") {
    similarBrands = [
      { name: "Stripe", reason: "Uses a single, clean, active English noun. Stripe conveys action, structure, and direct utility, matching your clean and direct tone." },
      { name: "Slack", reason: "Uses a playful, conversational English noun. Slack reframes a neutral/negative word into a positive team space, showing the power of literal naming." }
    ];
  } else if (nameType === "Invented Word" || lowerName.endsWith("ify")) {
    similarBrands = [
      { name: "Spotify", reason: "Uses an invented word ending in a soft vowel suffix ('-ify'). It establishes a friendly, modern sound that is highly trademarkable." },
      { name: "Canva", reason: "Uses a shortened, stylized invented word ending in 'a'. It feels approachable, global, and highly creative." }
    ];
  } else if (nameType === "Compound Word") {
    similarBrands = [
      { name: "GitHub", reason: "Combines a technical root ('Git') with a general noun ('Hub'). It explains the platform's collaborative purpose immediately." },
      { name: "Airbnb", reason: "Combines two nouns ('Air' + 'Bed'/'Breakfast') into a singular compound brand. It is descriptive yet evokes a lifestyle association." }
    ];
  } else if (nameType === "Misspelled Word") {
    similarBrands = [
      { name: "Flickr", reason: "Drops the trailing vowel ('er') to create a punchy, digitized brand. It retains phonetic familiarity but makes domain acquisition simple." },
      { name: "Lyft", reason: "Replaces 'i' with 'y' in a common verb. Lyft signals speed, modernity, and a younger, consumer-facing brand personality." }
    ];
  } else {
    similarBrands = [
      { name: "Notion", reason: "Uses a standard English word reflecting thought, workspace, and ideas. Conveys intelligence and minimalist design." },
      { name: "Uber", reason: "Uses a powerful, short German loanword. Uber conveys superiority, speed, and premium service." }
    ];
  }

  // Strengths & Weaknesses
  let strengths = [];
  let weaknesses = [];

  if (len <= 7) strengths.push("Shorter length provides excellent memory retention and logo footprint.");
  else weaknesses.push("Length is somewhat long, increasing spelling typo risk and logo complexity.");

  if (pronunciationScore >= 80) strengths.push("Phonetically balanced and easy to pronounce globally.");
  else weaknesses.push("Phonetic structure may cause people to stumble or mispronounce it on first listen.");

  if (nameType === "Invented Word" || nameType === "Misspelled Word") {
    strengths.push("High trademarkability and unique keyword search engine opportunities.");
  } else {
    weaknesses.push("Dictionary collision makes organic SEO ranking and social handle acquisition highly competitive.");
  }

  if (hasDoubleLetters) strengths.push("Repeating letter pattern creates a pleasing visual rhythm and memorability.");
  if (spellingScore >= 80) strengths.push("Spelling is highly intuitive based on English phonetic rules.");
  else weaknesses.push("Spelling is unintuitive (could result in users writing the wrong web address).");

  if (selectedFit.score >= 80) strengths.push(`Strong brand fit for the ${selectedFit.name} industry.`);
  else weaknesses.push(`Tone does not align natively with typical ${selectedFit.name} names.`);

  // Suggestions
  let suggestions = [];
  if (len > 8) suggestions.push("Shorten the name: Try to shave off a syllable or remove filler letters (e.g. drop vowels like Flickr).");
  if (spellingEst === "Hard") suggestions.push("Improve spelling: If you keep the misspelled variant, prepare a spelling-redirect domain (correctly spelled redirecting to yours).");
  if (hasConsonantClusters) suggestions.push("Improve pronunciation: Break up heavy consonant clusters to make the name roll off the tongue.");
  if (nameType === "Real Word") suggestions.push("Use stronger endings: Add a suffix like 'ly', 'io', or 'base' to secure a clear `.com` domain and trademark.");
  if (nameType === "Acronym") suggestions.push("Increase uniqueness: Convert the acronym into a full blended word. Acronyms are expensive to market.");
  if (suggestions.length === 0) {
    suggestions.push("Secure secondary domains: Lock down close typo variants and common extensions (.co, .io).");
    suggestions.push("Create a strong mascot: The name fits well with a visual character that anchors the brand.");
  }

  // Brand Story
  let story = "";
  if (industry === "AI") {
    story = `Born at the intersection of human curiosity and machine intelligence, "${cleanName}" represents a new frontier. It is designed to evoke clarity, algorithmic precision, and the infinite possibilities of cognitive technology, carving a path for a future where technology amplifies human capacity.`;
  } else if (industry === "Fintech") {
    story = `Built to redefine how we transact and grow, "${cleanName}" bridges absolute trust with modern speed. It stands as a beacon of security, representing ledger-grade reliability combined with sleek, frictionless software to empower users on their financial journeys.`;
  } else if (industry === "Gaming") {
    story = `Crafted for players and dreamers alike, "${cleanName}" is a portal into immersive worlds. The name carries an energetic, rhythmic pulse that invites exploration, representing the joy of competition, creativity, and the communities built in virtual spaces.`;
  } else {
    story = `Created to establish a new standard, "${cleanName}" represents exploration, innovation, and long-term ambition. It balances a modern, clean aesthetic with an approachable human touch, making it memorable, scalable, and ready to lead the market.`;
  }

  // Logo Style Recommendation
  let logoStyle = "Wordmark";
  let logoReason = "";
  if (nameType === "Real Word" || nameType === "Compound Word") {
    logoStyle = "Combination Mark";
    logoReason = "Since the name refers to concrete concepts, combining a geometric wordmark with a literal or abstract icon (like Apple's apple or Target's bullseye) will build massive visual memory.";
  } else if (len <= 4) {
    logoStyle = "Lettermark";
    logoReason = "Because the name is extremely short, a stylized monogram of the initials or the first letter (like the Netflix 'N' or Tesla 'T') will work beautifully as a modern, compact mark.";
  } else if (nameType === "Invented Word") {
    logoStyle = "Minimal Icon";
    logoReason = "An abstract, geometric symbol representing the underlying value proposition (like Spotify's soundwave circle) paired with a clean lowercase wordmark fits your innovative persona.";
  } else {
    logoStyle = "Wordmark";
    logoReason = "A custom, typographically tailored wordmark (like Google or Stripe) using customized letter weight or ligature connections will draw maximum focus to the unique brand name.";
  }

  // Taglines
  let taglines = [];
  if (industry === "AI") {
    taglines = [
      `Intelligence, Evolved.`,
      `The Core of Cognitive Innovation.`,
      `Smart Decisions, Automated.`,
      `Next-Gen AI for What's Next.`,
      `Where Data Meets Intuition.`
    ];
  } else if (industry === "Fintech") {
    taglines = [
      `Finance, Simplified.`,
      `The Modern Standard of Trust.`,
      `Your Wealth, In Motion.`,
      `Smart Money Moves.`,
      `Frictionless Capital Flow.`
    ];
  } else if (industry === "Gaming") {
    taglines = [
      `Play Without Limits.`,
      `Your Portal to Next-Gen Worlds.`,
      `Immersion, Amplified.`,
      `Where Players Connect.`,
      `Fueling the Gameplay Era.`
    ];
  } else if (industry === "Healthcare") {
    taglines = [
      `Care, Reimagined.`,
      `The Pulse of Modern Health.`,
      `Better Well-being, Daily.`,
      `Empowering Patient Outcomes.`,
      `Clinical Precision, Human Care.`
    ];
  } else if (industry === "Education") {
    taglines = [
      `Learning, Unlocked.`,
      `Knowledge for a Smarter Tomorrow.`,
      `Study Less, Learn More.`,
      `The Modern Education OS.`,
      `Empowering Mind Growth.`
    ];
  } else if (industry === "SaaS") {
    taglines = [
      `Workflows, Simplified.`,
      `The Modern Stack for Scale.`,
      `Productivity, Unleashed.`,
      `Automate Your Infrastructure.`,
      `Scale Effortlessly.`
    ];
  } else if (industry === "Web3") {
    taglines = [
      `Decentralizing the Future.`,
      `The Ledger of Trust.`,
      `Secure Web3 Infrastructure.`,
      `Frictionless Token Exchange.`,
      `Building the Next Internet.`
    ];
  } else {
    taglines = [
      `Redefining the Standard.`,
      `The Modern Way to Grow.`,
      `Simple. Scalable. Smart.`,
      `Designed for What's Next.`,
      `Unlocking New Potential.`
    ];
  }
  taglines = taglines.map(t => cleanName + " — " + t);

  // Overall Score Calculation
  const overallScore = Math.round(
    memorabilityScore * 0.25 +
    pronunciationScore * 0.15 +
    spellingScore * 0.15 +
    domainScore * 0.15 +
    seoScore * 0.10 +
    selectedFit.score * 0.10 +
    globalScore * 0.10
  );

  let overallCategory = "Weak";
  if (overallScore >= 85) overallCategory = "Excellent";
  else if (overallScore >= 70) overallCategory = "Good";
  else if (overallScore >= 50) overallCategory = "Average";

  return {
    name: cleanName,
    industry: industry || "SaaS",
    overallScore,
    overallCategory,
    memorability: memDetails,
    pronunciation: pronDetails,
    spelling: spellingDetails,
    brandability: brandDims,
    industryFit: {
      score: selectedFit.score,
      explanation: industryExplanation,
      allFits: fits
    },
    globalAppeal: globalDetails,
    nameType: {
      type: nameType,
      reason: typeReason,
      advantages: nameType === "Real Word" ? "Familiarity, immediate emotional association, high trust, easy spelling." : nameType === "Compound Word" ? "Explains what you do immediately, easier to find domains, memorable combination." : nameType === "Invented Word" ? "Easy trademarking, unique brand identity, clean slate for SEO, high .com domain availability." : nameType === "Misspelled Word" ? "Catchy, modern startup vibe, much easier to secure domain names than correctly spelled version." : nameType === "Acronym" ? "Extremely short, easy to put on visual assets, neutral brand association." : "High authenticity, personal brand leverage, classic luxury feel.",
      disadvantages: nameType === "Real Word" ? "Extremely hard to get .com domain, high trademark competition, difficult SEO ranking." : nameType === "Compound Word" ? "Can be slightly long, can sound too descriptive or less 'premium' if overly literal." : nameType === "Invented Word" ? "Requires high marketing spend to build associations, harder to remember at first." : nameType === "Misspelled Word" ? "Constant verbal spelling correction needed, can look unprofessional to conservative buyers." : nameType === "Acronym" ? "Very low emotional impact, hard to remember, sounds overly corporate." : "Hard to scale or exit (tied to a person), trademark conflicts with others sharing surname."
    },
    emotionalImpact,
    visualBranding: visualDetails,
    domainFriendliness: domainDetails,
    seoFriendliness: seoDetails,
    socialMedia: socialDetails,
    comparableBrands: similarBrands,
    strengths,
    weaknesses,
    suggestions,
    story,
    logoStyle: {
      style: logoStyle,
      reason: logoReason
    },
    taglines
  };
}

// Educational principles data
const BRANDING_PRINCIPLES = [
  {
    brand: "Google",
    type: "Invented Word (from Googol)",
    principle: "Syllable Cadence & Visual Symmetries",
    details: "Google is memorable because of its double 'o' letters which create a friendly, rounded visual anchor (like eyes looking at you). Phonetically, it forms a trochaic rhythm (stressed syllable followed by unstressed: GOO-gul), which makes it roll off the tongue and feel conversational yet authoritative."
  },
  {
    brand: "Stripe",
    type: "Real English Word",
    principle: "The Power of Active Monosyllabic Nouns",
    details: "Stripe stands out because it's a single, sharp syllable starting with a strong consonant blend ('str') and ending in a hard stop ('p'). It is highly visual, evoking structure, pathways, and simplicity. This concrete imagery helps it cut through the abstract noise of traditional financial branding."
  },
  {
    brand: "Canva",
    type: "Stylized Invented Word",
    principle: "Approachable Soft Vowel Ending",
    details: "Canva (shortened from canvas) is easy to pronounce because it uses a simple C-V-C-V structure (consonant-vowel-consonant-vowel) ending in a soft open vowel 'a'. Soft vowel endings sound warm, creative, and globally friendly. This makes the brand feel highly accessible to non-designers."
  },
  {
    brand: "Spotify",
    type: "Invented Word (Blend)",
    principle: "Rhythmic Suffix ('-ify')",
    details: "Spotify combines 'spot' and 'identify' with a rhythmic ending. Invented names ending in 'y' or 'ify' are easy to remember because they mimic verbs, indicating an active service or solution. This gives the name a modern, playful tech energy that appeals to consumer demographics."
  },
  {
    brand: "Notion",
    type: "Real English Word",
    principle: "Conceptual Association",
    details: "Notion means a belief or concept. Using a high-level real word that denotes thought, creativity, and organization communicates the product's philosophy immediately without locking it into a narrow functional box. It feels premium, intelligent, and clean."
  },
  {
    brand: "Uber",
    type: "Loanword / Real Word",
    principle: "Short Impact & Translatability",
    details: "Uber is extremely short (4 letters, 2 syllables). Short names are easier to write and put on mobile app icons. The word itself conveys superiority or peak status, giving it a premium, dominant emotional vibe while remaining incredibly simple to type."
  },
  {
    brand: "Airbnb",
    type: "Compound / Visual Concept",
    principle: "Familiarity in Contrast",
    details: "Airbnb is a compound of 'Airbed' and 'Breakfast'. It breaks typical naming rules by stringing together letters that look unusual (nbnb), which actually acts as a pattern disruptor, making the brand stick in memory. It immediately tells a story of travel and cozy utility."
  }
];

export default function StartupNameAnalyzerPage() {
  const [nameInput, setNameInput] = useState("");
  const [industryInput, setIndustryInput] = useState("SaaS");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const [history, setHistory] = useState([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [activeHistoryId, setActiveHistoryId] = useState(null);

  const [activeFaq, setActiveFaq] = useState(null);

  const loadingSteps = [
    "Scanning syllable pacing & phonetic weights...",
    "Assessing dictionary collisions & trademark density...",
    "Computing industry match fits & semantic resonance...",
    "Evaluating international reading friction & spelling typos...",
    "Drawing emotional spectrum coordinates...",
    "Structuring logo styles and tagline models...",
    "Finalizing consultant brand brief report..."
  ];

  // Load history from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("startup_name_history");
      if (stored) {
        try {
          setHistory(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to load history", e);
        }
      }
    }
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  const handleRunAnalysis = (name = nameInput, ind = industryInput) => {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast("Please enter a startup name to analyze.", "error");
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    // Rotate loading text
    let stepIdx = 0;
    setLoadingStep(loadingSteps[0]);
    const stepInterval = setInterval(() => {
      stepIdx = (stepIdx + 1) % loadingSteps.length;
      setLoadingStep(loadingSteps[stepIdx]);
    }, 300);

    setTimeout(() => {
      clearInterval(stepInterval);
      const res = performAnalysis(trimmed, ind);
      setAnalysisResult(res);
      setIsLoading(false);

      // Save to history
      const newEntry = {
        id: Date.now().toString(),
        name: res.name,
        industry: res.industry,
        score: res.overallScore,
        category: res.overallCategory,
        timestamp: new Date().toLocaleString(),
        data: res,
        isFavorite: false
      };

      setHistory(prev => {
        const filtered = prev.filter(x => x.name.toLowerCase() !== res.name.toLowerCase());
        const updated = [newEntry, ...filtered].slice(0, 20); // Keep up to 20
        if (typeof window !== "undefined") {
          localStorage.setItem("startup_name_history", JSON.stringify(updated));
        }
        return updated;
      });

      setActiveHistoryId(newEntry.id);
      showToast("Brand analysis completed successfully!", "success");
    }, 2100);
  };

  const loadPreset = (preset) => {
    setNameInput(preset.name);
    setIndustryInput(preset.industry);
    handleRunAnalysis(preset.name, preset.industry);
  };

  const toggleFavorite = (id) => {
    setHistory(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          const nextFav = !item.isFavorite;
          showToast(nextFav ? "Added to favorites!" : "Removed from favorites", "success");
          return { ...item, isFavorite: nextFav };
        }
        return item;
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("startup_name_history", JSON.stringify(updated));
      }
      return updated;
    });

    // Update active results too if open
    if (analysisResult && activeHistoryId === id) {
      // It will reload favorites dynamically
    }
  };

  const deleteHistoryItem = (id, e) => {
    e.stopPropagation();
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("startup_name_history", JSON.stringify(updated));
      }
      return updated;
    });
    if (activeHistoryId === id) {
      setAnalysisResult(null);
      setActiveHistoryId(null);
    }
    showToast("History entry deleted.", "success");
  };

  const selectHistoryItem = (item) => {
    setAnalysisResult(item.data);
    setNameInput(item.name);
    setIndustryInput(item.industry);
    setActiveHistoryId(item.id);
    showToast(`Loaded ${item.name} analysis report.`, "success");
  };

  const isCurrentFavorite = useMemo(() => {
    if (!activeHistoryId) return false;
    return history.find(x => x.id === activeHistoryId)?.isFavorite ?? false;
  }, [activeHistoryId, history]);

  // SVG Radar Chart coordinates helper
  const radarChartPoints = useMemo(() => {
    if (!analysisResult) return "";
    const dims = [
      analysisResult.emotionalImpact.innovation,
      analysisResult.emotionalImpact.trust,
      analysisResult.emotionalImpact.power,
      analysisResult.emotionalImpact.speed,
      analysisResult.emotionalImpact.luxury,
      analysisResult.emotionalImpact.fun,
      analysisResult.emotionalImpact.community,
      analysisResult.emotionalImpact.reliability
    ];

    const cx = 100;
    const cy = 100;
    const maxVal = 100;
    const radius = 65;

    return dims.map((val, idx) => {
      const angle = (idx * Math.PI) / 4 - Math.PI / 2; // start from top
      const r = (val / maxVal) * radius;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(" ");
  }, [analysisResult]);

  // Export templates
  const markdownText = useMemo(() => {
    if (!analysisResult) return "";
    const res = analysisResult;
    return [
      `# Startup Name Analyzer Report: ${res.name}`,
      `**Industry:** ${res.industry}`,
      `**Overall Brand Score:** ${res.overallScore}/100 (${res.overallCategory})`,
      `**Generated on:** ${new Date().toLocaleDateString()}`,
      `\n---\n`,
      `## 1. Overall Brand Score: ${res.overallScore}/100`,
      `Your brand score is classified as **${res.overallCategory}** branding quality.`,
      `\n## 2. Memorability (Score: ${res.memorability.score}/100)`,
      `- **Length:** ${res.memorability.length}`,
      `- **Distinctiveness:** ${res.memorability.distinctiveness}`,
      `- **Repetition:** ${res.memorability.repetition}`,
      `- **Visual Recall:** ${res.memorability.visualRecall}`,
      `\n## 3. Pronunciation (Score: ${res.pronunciation.score}/100)`,
      `- **Readability:** ${res.pronunciation.easyToPronounce}`,
      `- **Multi-pronunciation Risk:** ${res.pronunciation.multiplePronunciations}`,
      `- **Global Readability:** ${res.pronunciation.globalReadability}`,
      `- **Recommendation:** ${res.pronunciation.recommendation}`,
      `\n## 4. Spelling Difficulty (Score: ${res.spelling.score}/100)`,
      `- **Classification:** ${res.spelling.estimate}`,
      `- **Confusing letters:** ${res.spelling.confusingLetters.join(", ")}`,
      `- **Reasoning:** ${res.spelling.reasoning}`,
      `\n## 5. Brandability Profiles`,
      `- Modern: ${res.brandability.modern}%`,
      `- Premium: ${res.brandability.premium}%`,
      `- Playful: ${res.brandability.playful}%`,
      `- Luxury: ${res.brandability.luxury}%`,
      `- Professional: ${res.brandability.professional}%`,
      `- Innovative: ${res.brandability.innovative}%`,
      `- Trustworthy: ${res.brandability.trustworthy}%`,
      `- Creative: ${res.brandability.creative}%`,
      `\n## 6. Industry Fit: ${res.industryFit.score}%`,
      `${res.industryFit.explanation}`,
      `\n## 7. Global Appeal (Score: ${res.globalAppeal.score}/100)`,
      `- Multi-Language: ${res.globalAppeal.easyAcrossLanguages}`,
      `- International: ${res.globalAppeal.easyInternationally}`,
      `- Cultural Neutrality: ${res.globalAppeal.culturalNeutrality}`,
      `\n## 8. Name Type Classification: ${res.nameType.type}`,
      `*Definition:* ${res.nameType.reason}`,
      `- **Advantages:** ${res.nameType.advantages}`,
      `- **Disadvantages:** ${res.nameType.disadvantages}`,
      `\n## 9. Emotional Impact Spectrum`,
      `- Innovation: ${res.emotionalImpact.innovation}%`,
      `- Trust: ${res.emotionalImpact.trust}%`,
      `- Power: ${res.emotionalImpact.power}%`,
      `- Speed: ${res.emotionalImpact.speed}%`,
      `- Luxury: ${res.emotionalImpact.luxury}%`,
      `- Fun: ${res.emotionalImpact.fun}%`,
      `- Community: ${res.emotionalImpact.community}%`,
      `- Reliability: ${res.emotionalImpact.reliability}%`,
      `\n## 10. Visual Branding Potential`,
      `- Logo Potential: ${res.visualBranding.logoPotential}`,
      `- Icon Potential: ${res.visualBranding.iconPotential}`,
      `- Minimal Design Fit: ${res.visualBranding.minimalBranding}`,
      `- Wordmark Suitability: ${res.visualBranding.wordmarkFriendly}`,
      `- App Icon suitability: ${res.visualBranding.appIconSuitability}`,
      `\n## 11. Domain Friendliness (Score: ${res.domainFriendliness.score}/100)`,
      `- Short: ${res.domainFriendliness.short}`,
      `- Easy typing: ${res.domainFriendliness.easyToType}`,
      `- Low typo risk: ${res.domainFriendliness.lowTypoRisk}`,
      `- Readability: ${res.domainFriendliness.readable}`,
      `\n## 12. SEO Friendliness (Score: ${res.seoFriendliness.score}/100)`,
      `- Unique keyword: ${res.seoFriendliness.uniqueKeyword}`,
      `- Voice search: ${res.seoFriendliness.easyToSearch}`,
      `- Dictionary ambiguity: ${res.seoFriendliness.potentialAmbiguity}`,
      `- Competition level: ${res.seoFriendliness.competitionRisk}`,
      `\n## 13. Social Media Friendliness (Score: ${res.socialMedia.score}/100)`,
      `- Username clean: ${res.socialMedia.easyUsername}`,
      `- Handle length: ${res.socialMedia.short}`,
      `- Hashtag potential: ${res.socialMedia.hashtagFriendly}`,
      `\n## 14. Comparable Brands`,
      res.comparableBrands.map(b => `- **${b.name}**: ${b.reason}`).join("\n"),
      `\n## 15. Key Strengths`,
      res.strengths.map(s => `- ✅ ${s}`).join("\n"),
      `\n## 16. Weaknesses / Risks`,
      res.weaknesses.map(w => `- ⚠️ ${w}`).join("\n"),
      `\n## 17. Actionable Improvement Suggestions`,
      res.suggestions.map(s => `- 💡 ${s}`).join("\n"),
      `\n## 18. Brand Story Vision`,
      `"${res.story}"`,
      `\n## 19. Logo Style Recommendation: ${res.logoStyle.style}`,
      `*Rationale:* ${res.logoStyle.reason}`,
      `\n## 20. Premium Tagline Suggestions`,
      res.taglines.map((t, idx) => `${idx + 1}. ${t}`).join("\n")
    ].join("\n");
  }, [analysisResult]);

  const rawText = useMemo(() => {
    if (!analysisResult) return "";
    const res = analysisResult;
    return [
      `=======================================================`,
      `STARTUP NAME ANALYZER REPORT: ${res.name.toUpperCase()}`,
      `=======================================================`,
      `Industry: ${res.industry}`,
      `Overall Brand Score: ${res.overallScore}/100 (${res.overallCategory})`,
      `Generated: ${new Date().toLocaleString()}`,
      `\n`,
      `1. OVERALL BRAND SCORE: ${res.overallScore} (${res.overallCategory})`,
      `2. MEMORABILITY: ${res.memorability.score}/100`,
      `   - Length: ${res.memorability.length}`,
      `   - Distinctiveness: ${res.memorability.distinctiveness}`,
      `   - Repetition: ${res.memorability.repetition}`,
      `   - Visual Recall: ${res.memorability.visualRecall}`,
      `3. PRONUNCIATION: ${res.pronunciation.score}/100`,
      `   - Readability: ${res.pronunciation.easyToPronounce}`,
      `   - Ambiguity: ${res.pronunciation.multiplePronunciations}`,
      `   - Global scale: ${res.pronunciation.globalReadability}`,
      `   - Recommendation: ${res.pronunciation.recommendation}`,
      `4. SPELLING DIFFICULTY: ${res.spelling.score}/100 (${res.spelling.estimate})`,
      `   - Confusing characters: ${res.spelling.confusingLetters.join(", ")}`,
      `   - Details: ${res.spelling.reasoning}`,
      `5. BRANDING ALIGNMENT:`,
      `   - Modern: ${res.brandability.modern}%`,
      `   - Premium: ${res.brandability.premium}%`,
      `   - Playful: ${res.brandability.playful}%`,
      `   - Luxury: ${res.brandability.luxury}%`,
      `   - Professional: ${res.brandability.professional}%`,
      `   - Innovative: ${res.brandability.innovative}%`,
      `   - Trustworthy: ${res.brandability.trustworthy}%`,
      `   - Creative: ${res.brandability.creative}%`,
      `6. INDUSTRY FIT: ${res.industryFit.score}%`,
      `   - Evaluation: ${res.industryFit.explanation}`,
      `7. GLOBAL APPEAL: ${res.globalAppeal.score}/100`,
      `   - Across Languages: ${res.globalAppeal.easyAcrossLanguages}`,
      `   - International markets: ${res.globalAppeal.easyInternationally}`,
      `   - Cultural: ${res.globalAppeal.culturalNeutrality}`,
      `8. NAME TYPE CLASSIFICATION: ${res.nameType.type}`,
      `   - Explanation: ${res.nameType.reason}`,
      `   - Advantages: ${res.nameType.advantages}`,
      `   - Disadvantages: ${res.nameType.disadvantages}`,
      `9. EMOTIONAL IMPACT COORDINATES:`,
      `   - Innovation: ${res.emotionalImpact.innovation}%`,
      `   - Trust: ${res.emotionalImpact.trust}%`,
      `   - Power: ${res.emotionalImpact.power}%`,
      `   - Speed: ${res.emotionalImpact.speed}%`,
      `   - Luxury: ${res.emotionalImpact.luxury}%`,
      `   - Fun: ${res.emotionalImpact.fun}%`,
      `   - Community: ${res.emotionalImpact.community}%`,
      `   - Reliability: ${res.emotionalImpact.reliability}%`,
      `10. VISUAL BRANDING POTENTIAL:`,
      `    - Logo Fit: ${res.visualBranding.logoPotential}`,
      `    - Icon Fit: ${res.visualBranding.iconPotential}`,
      `    - Typography: ${res.visualBranding.minimalBranding}`,
      `    - App Icon: ${res.visualBranding.appIconSuitability}`,
      `11. DOMAIN FRIENDLINESS: ${res.domainFriendliness.score}/100`,
      `    - Typo risk: ${res.domainFriendliness.lowTypoRisk}`,
      `    - Typing friction: ${res.domainFriendliness.easyToType}`,
      `12. SEO FRIENDLINESS: ${res.seoFriendliness.score}/100`,
      `    - Ambiguity risk: ${res.seoFriendliness.potentialAmbiguity}`,
      `    - Keyword uniqueness: ${res.seoFriendliness.uniqueKeyword}`,
      `13. SOCIAL MEDIA COMPATIBILITY: ${res.socialMedia.score}/100`,
      `    - Handle availability factor: ${res.socialMedia.easyUsername}`,
      `14. COMPARABLE BRANDS STYLE:`,
      res.comparableBrands.map(b => `    - ${b.name}: ${b.reason}`).join("\n"),
      `15. KEY STRENGTHS:`,
      res.strengths.map(s => `    - ${s}`).join("\n"),
      `16. RISKS / WEAKNESSES:`,
      res.weaknesses.map(w => `    - ${w}`).join("\n"),
      `17. CONSULTANT IMPROVEMENTS:`,
      res.suggestions.map(s => `    - ${s}`).join("\n"),
      `18. BRAND STORY VISION:`,
      `    "${res.story}"`,
      `19. LOGO STYLE SUGGESTION: ${res.logoStyle.style}`,
      `    - Rationale: ${res.logoStyle.reason}`,
      `20. PREMIUM TAGLINES:`,
      res.taglines.map((t, idx) => `    ${idx + 1}. ${t}`).join("\n")
    ].join("\n");
  }, [analysisResult]);

  const copyToClipboard = async () => {
    if (!markdownText) return;
    try {
      await navigator.clipboard.writeText(markdownText);
      showToast("Report copied to clipboard in markdown format!", "success");
    } catch (e) {
      showToast("Failed to copy. Try selecting text manually.", "error");
    }
  };

  const downloadTextFile = () => {
    if (!rawText) return;
    const blob = new Blob([rawText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brand-report-${analysisResult.name.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("TXT report downloaded successfully.", "success");
  };

  const downloadMarkdownFile = () => {
    if (!markdownText) return;
    const blob = new Blob([markdownText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brand-report-${analysisResult.name.toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Markdown report downloaded successfully.", "success");
  };

  const handlePrintPdf = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const filteredHistory = useMemo(() => {
    if (favoritesOnly) {
      return history.filter(x => x.isFavorite);
    }
    return history;
  }, [history, favoritesOnly]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start p-4 sm:py-8 font-sans print:bg-white print:p-0">
      {/* Toast Alert */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg transition-all duration-300 transform scale-100 ${
          toast.type === "error" 
            ? "bg-red-50 text-red-800 border-red-200" 
            : "bg-emerald-50 text-emerald-800 border-emerald-200"
        }`}>
          <span>{toast.type === "error" ? "⚠️" : "✅"}</span>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="w-full max-w-6xl flex flex-col gap-6 print:gap-0">
        
        {/* Breadcrumb / Back button (Hidden on print) */}
        <div className="flex items-center justify-between print:hidden">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-orange-600 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Tools
          </Link>
          <span className="text-xs text-slate-400 font-mono">100% Client-Side Audit</span>
        </div>

        {/* Outer Shell Card */}
        <div className="bg-white shadow-xl rounded-3xl p-5 sm:p-8 border border-slate-200 flex flex-col gap-8 print:border-none print:shadow-none print:p-0">
          
          {/* Header Section (Hidden on Print) */}
          <div className="flex flex-col gap-2 items-center text-center print:hidden">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Creator Tools</span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">Startup Name Analyzer</h1>
            <p className="text-slate-500 text-base max-w-2xl mt-1 leading-relaxed">
              Analyze your startup name for branding quality, memorability, spelling difficulty, global appeal, emotional impact, and market readiness.
            </p>
          </div>

          {/* Form and Input Layout (Hidden on Print) */}
          {!analysisResult && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full pt-4 print:hidden">
              <div className="md:col-span-2 flex flex-col gap-2">
                <label htmlFor="name-input" className="text-sm font-bold text-slate-800">Startup Name</label>
                <input
                  id="name-input"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. BrainFlow, Stripe, Canva"
                  maxLength={30}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-lg"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRunAnalysis();
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-800">Target Industry</label>
                <ThemedDropdown
                  ariaLabel="Choose target industry"
                  value={industryInput}
                  options={INDUSTRY_OPTIONS}
                  onChange={(val) => setIndustryInput(val)}
                />
              </div>

              <div className="md:col-span-3 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 items-center justify-center py-2">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mr-1">Try examples:</span>
                  {PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => loadPreset(p)}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-600 rounded-lg transition"
                    >
                      {p.name} ({p.industry})
                    </button>
                  ))}
                </div>

                <div className="flex gap-4 items-center justify-center mt-2">
                  <button
                    onClick={() => handleRunAnalysis()}
                    disabled={!nameInput.trim()}
                    className="px-8 py-4 bg-slate-900 text-white hover:bg-orange-600 font-bold text-base rounded-2xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Analyze Brand Name
                  </button>
                  
                  <button
                    onClick={() => {
                      const randomPreset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
                      setNameInput(randomPreset.name);
                      setIndustryInput(randomPreset.industry);
                      handleRunAnalysis(randomPreset.name, randomPreset.industry);
                    }}
                    className="px-6 py-4 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold text-base rounded-2xl shadow-sm transition"
                  >
                    Load Random
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading Animation State (Hidden on Print) */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-6 print:hidden">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-orange-500 animate-spin" />
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-slate-800 font-semibold text-lg animate-pulse">{loadingStep}</p>
                <p className="text-slate-400 text-sm">Consultant engine is structuring insights...</p>
              </div>
            </div>
          )}

          {/* Analysis Dashboard State */}
          {analysisResult && !isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
              
              {/* Main Analysis Panel */}
              <div className="flex flex-col gap-8 print:w-full">
                
                {/* Dashboard Action Header (Hidden on Print) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4 print:hidden">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                      <span>📊</span>
                      Report: <span className="text-orange-600 font-mono tracking-tight">{analysisResult.name}</span>
                    </h2>
                    <p className="text-sm text-slate-400 font-medium">Industry Focus: {analysisResult.industry} • Generated Client-Side</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 items-center">
                    <button
                      onClick={() => toggleFavorite(activeHistoryId)}
                      className={`p-2.5 rounded-xl border transition ${
                        isCurrentFavorite 
                          ? "bg-amber-50 text-amber-500 border-amber-300 hover:bg-amber-100" 
                          : "bg-white text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-50"
                      }`}
                      title={isCurrentFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => {
                        setAnalysisResult(null);
                        setNameInput("");
                      }}
                      className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition"
                    >
                      New Analysis
                    </button>
                  </div>
                </div>

                {/* Score Section */}
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 rounded-3xl border border-slate-200 bg-slate-50/50 p-6 shadow-sm transition hover:border-slate-300">
                  <div className="flex flex-col items-center justify-center text-center bg-white p-6 rounded-2xl border border-slate-200/60 shadow-inner">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Brand Score</span>
                    
                    {/* Ring score */}
                    <div className="relative w-28 h-28 my-3 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="56"
                          cy="56"
                          r="48"
                          className="stroke-slate-100 fill-none"
                          strokeWidth="8"
                        />
                        <circle
                          cx="56"
                          cy="56"
                          r="48"
                          className="stroke-orange-500 fill-none transition-all duration-1000 ease-out"
                          strokeWidth="8"
                          strokeDasharray={2 * Math.PI * 48}
                          strokeDashoffset={2 * Math.PI * 48 * (1 - analysisResult.overallScore / 100)}
                        />
                      </svg>
                      <span className="absolute text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
                        {analysisResult.overallScore}
                      </span>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                      analysisResult.overallCategory === "Excellent" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                      analysisResult.overallCategory === "Good" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                      analysisResult.overallCategory === "Average" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                      "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {analysisResult.overallCategory}
                    </span>
                  </div>

                  <div className="flex flex-col justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Consultant Grade Summary</span>
                      <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                        How should we evaluate the name <span className="font-mono text-orange-600">{analysisResult.name}</span>?
                      </h3>
                      <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                        Based on grammatical rules, suffix analysis, spelling patterns, and industry indices, 
                        our system grades this name as <strong className="text-slate-800">{analysisResult.overallCategory}</strong> ({analysisResult.overallScore}/100) 
                        for the {analysisResult.industry} sector. It demonstrates {analysisResult.nameType.reason.toLowerCase()}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Memorability</span>
                        <div className="text-sm font-bold text-slate-800 mt-0.5">{analysisResult.memorability.score}%</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Pronounce</span>
                        <div className="text-sm font-bold text-slate-800 mt-0.5">{analysisResult.pronunciation.score}%</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Spelling</span>
                        <div className="text-sm font-bold text-slate-800 mt-0.5">{analysisResult.spelling.score}%</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Domain Fit</span>
                        <div className="text-sm font-bold text-slate-800 mt-0.5">{analysisResult.domainFriendliness.score}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashboard Grid Modules */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Section 2: Memorability */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-50 pb-2">
                      <span>🧠 Memorability</span>
                      <span className="text-orange-600 font-mono">{analysisResult.memorability.score}/100</span>
                    </h4>
                    <div className="mt-3 space-y-2 text-xs">
                      <div>
                        <strong className="text-slate-700">Length Constraint:</strong>
                        <p className="text-slate-500 mt-0.5">{analysisResult.memorability.length}</p>
                      </div>
                      <div>
                        <strong className="text-slate-700">Distinctiveness:</strong>
                        <p className="text-slate-500 mt-0.5">{analysisResult.memorability.distinctiveness}</p>
                      </div>
                      <div>
                        <strong className="text-slate-700">Repetition Hook:</strong>
                        <p className="text-slate-500 mt-0.5">{analysisResult.memorability.repetition}</p>
                      </div>
                      <div>
                        <strong className="text-slate-700">Visual Image Recall:</strong>
                        <p className="text-slate-500 mt-0.5">{analysisResult.memorability.visualRecall}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Pronunciation */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-50 pb-2">
                      <span>🗣️ Pronunciation</span>
                      <span className="text-orange-600 font-mono">{analysisResult.pronunciation.score}/100</span>
                    </h4>
                    <div className="mt-3 space-y-2 text-xs">
                      <div>
                        <strong className="text-slate-700">Reading Comfort:</strong>
                        <p className="text-slate-500 mt-0.5">{analysisResult.pronunciation.easyToPronounce}</p>
                      </div>
                      <div>
                        <strong className="text-slate-700">Pronunciation Ambiguity:</strong>
                        <p className="text-slate-500 mt-0.5">{analysisResult.pronunciation.multiplePronunciations}</p>
                      </div>
                      <div>
                        <strong className="text-slate-700">Global Readability:</strong>
                        <p className="text-slate-500 mt-0.5">{analysisResult.pronunciation.globalReadability}</p>
                      </div>
                      <div className="mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <strong className="text-orange-600">Consultant Tip:</strong>
                        <p className="text-slate-600 mt-0.5 leading-relaxed font-medium">{analysisResult.pronunciation.recommendation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Spelling Difficulty */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-50 pb-2">
                      <span>✏️ Spelling Difficulty</span>
                      <span className="text-orange-600 font-mono">{analysisResult.spelling.score}/100</span>
                    </h4>
                    <div className="mt-3 space-y-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-700">Estimated Grade:</span>
                        <span className={`px-2.5 py-0.5 rounded font-extrabold uppercase ${
                          analysisResult.spelling.estimate === "Easy" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                          analysisResult.spelling.estimate === "Medium" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                          "bg-red-50 text-red-700 border border-red-100"
                        }`}>{analysisResult.spelling.estimate}</span>
                      </div>
                      
                      <div>
                        <strong className="text-slate-700">Risk Letter Clusters:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {analysisResult.spelling.confusingLetters.map((l, i) => (
                            <span key={i} className="px-2 py-1 bg-red-50 text-red-700 font-mono font-bold rounded border border-red-100">
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <strong className="text-slate-700">Technical Rationale:</strong>
                        <p className="text-slate-500 mt-0.5 leading-relaxed">{analysisResult.spelling.reasoning}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Brandability */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-2">
                      🎭 Brandability Personality
                    </h4>
                    <div className="mt-3 space-y-2">
                      {Object.entries(analysisResult.brandability).map(([key, val]) => (
                        <div key={key} className="text-xs">
                          <div className="flex justify-between font-bold text-slate-600 uppercase tracking-wide text-[10px]">
                            <span>{key}</span>
                            <span>{val}%</span>
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div 
                              className="h-full bg-orange-500 rounded-full" 
                              style={{ width: `${val}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 6: Industry Fit */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition md:col-span-2">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-50 pb-2">
                      <span>💼 Industry Adaptation Matrix</span>
                      <span className="text-orange-600 font-mono">Current Sector Fit: {analysisResult.industryFit.score}%</span>
                    </h4>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 text-xs">
                      <div>
                        <strong className="text-slate-700">Detailed Alignment Audit:</strong>
                        <p className="text-slate-500 mt-1.5 leading-relaxed text-sm">{analysisResult.industryFit.explanation}</p>
                      </div>
                      
                      <div className="space-y-1 border-l border-slate-100 pl-4">
                        <strong className="text-slate-400 uppercase tracking-wider text-[10px] block mb-2">Cross-Sector Suitability</strong>
                        {analysisResult.industryFit.allFits.map((f, i) => (
                          <div key={i} className="flex items-center justify-between gap-3 text-[11px]">
                            <span className={`${f.name === analysisResult.industry ? "font-bold text-orange-600" : "text-slate-500"}`}>
                              {f.name === analysisResult.industry ? "👉 " : ""}{f.name}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <div className="w-16 h-1 rounded-full bg-slate-100 overflow-hidden">
                                <div 
                                  className={`h-full ${f.name === analysisResult.industry ? "bg-orange-600" : "bg-slate-400"}`}
                                  style={{ width: `${f.score}%` }}
                                />
                              </div>
                              <span className={`font-mono text-[10px] w-6 text-right ${f.name === analysisResult.industry ? "font-bold text-orange-600" : "text-slate-400"}`}>
                                {f.score}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Section 7: Global Appeal */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-50 pb-2">
                      <span>🌍 Global Readiness</span>
                      <span className="text-orange-600 font-mono">{analysisResult.globalAppeal.score}/100</span>
                    </h4>
                    <div className="mt-3 space-y-2 text-xs">
                      <div>
                        <strong className="text-slate-700">Cross-Linguistic Ease:</strong>
                        <p className="text-slate-500 mt-0.5">{analysisResult.globalAppeal.easyAcrossLanguages}</p>
                      </div>
                      <div>
                        <strong className="text-slate-700">Internationalization:</strong>
                        <p className="text-slate-500 mt-0.5">{analysisResult.globalAppeal.easyInternationally}</p>
                      </div>
                      <div>
                        <strong className="text-slate-700">Cultural Neutrality:</strong>
                        <p className="text-slate-500 mt-0.5">{analysisResult.globalAppeal.culturalNeutrality}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 8: Name Type Classification */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-2">
                      🏷️ Category: <span className="text-orange-600 font-mono">{analysisResult.nameType.type}</span>
                    </h4>
                    <div className="mt-3 space-y-2 text-xs">
                      <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">{analysisResult.nameType.reason}</p>
                      
                      <div className="mt-2">
                        <strong className="text-emerald-700 flex items-center gap-1">➕ Advantages:</strong>
                        <p className="text-slate-500 mt-0.5 leading-relaxed">{analysisResult.nameType.advantages}</p>
                      </div>
                      <div>
                        <strong className="text-red-700 flex items-center gap-1">➖ Disadvantages:</strong>
                        <p className="text-slate-500 mt-0.5 leading-relaxed">{analysisResult.nameType.disadvantages}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 9: Emotional Impact (Radar Chart) */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-2">
                      ❤️ Emotional Vibe Coordinates
                    </h4>
                    
                    <div className="my-4 flex items-center justify-center">
                      <svg viewBox="0 0 200 200" className="w-full max-w-[200px] h-auto overflow-visible">
                        {/* Background Polygons (25%, 50%, 75%, 100%) */}
                        {[0.25, 0.5, 0.75, 1].map((scale, i) => {
                          const r = 65 * scale;
                          const points = Array.from({ length: 8 }).map((_, idx) => {
                            const angle = (idx * Math.PI) / 4 - Math.PI / 2;
                            const x = 100 + r * Math.cos(angle);
                            const y = 100 + r * Math.sin(angle);
                            return `${x},${y}`;
                          }).join(" ");
                          return (
                            <polygon
                              key={i}
                              points={points}
                              className="stroke-slate-200 fill-none"
                              strokeWidth="0.5"
                            />
                          );
                        })}

                        {/* Radial Axes */}
                        {Array.from({ length: 8 }).map((_, idx) => {
                          const angle = (idx * Math.PI) / 4 - Math.PI / 2;
                          const x = 100 + 65 * Math.cos(angle);
                          const y = 100 + 65 * Math.sin(angle);
                          return (
                            <line
                              key={idx}
                              x1="100"
                              y1="100"
                              x2={x}
                              y2={y}
                              className="stroke-slate-200"
                              strokeWidth="0.5"
                            />
                          );
                        })}

                        {/* Actual Vibe coordinates Polygon */}
                        <polygon
                          points={radarChartPoints}
                          className="stroke-orange-500 fill-orange-500/20"
                          strokeWidth="1.5"
                        />

                        {/* Point details */}
                        {radarChartPoints.split(" ").map((pt, idx) => {
                          const [x, y] = pt.split(",");
                          return (
                            <circle
                              key={idx}
                              cx={x}
                              cy={y}
                              r="2"
                              className="fill-orange-600 stroke-white"
                              strokeWidth="0.5"
                            />
                          );
                        })}

                        {/* Text labels */}
                        {["INNOVATION", "TRUST", "POWER", "SPEED", "LUXURY", "FUN", "COMMUNITY", "RELIABILITY"].map((label, idx) => {
                          const angle = (idx * Math.PI) / 4 - Math.PI / 2;
                          const offset = 78;
                          const x = 100 + offset * Math.cos(angle);
                          const y = 100 + offset * Math.sin(angle);
                          
                          let textAnchor = "middle";
                          if (Math.cos(angle) > 0.1) textAnchor = "start";
                          else if (Math.cos(angle) < -0.1) textAnchor = "end";

                          let dy = "3";
                          if (angle === -Math.PI / 2) dy = "-2";
                          else if (angle === Math.PI / 2) dy = "8";

                          return (
                            <text
                              key={idx}
                              x={x}
                              y={y}
                              textAnchor={textAnchor}
                              dy={dy}
                              className="fill-slate-400 font-mono font-bold text-[6px] tracking-tighter"
                            >
                              {label}
                            </text>
                          );
                        })}
                      </svg>
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-[9px] text-center text-slate-500">
                      <div>INNO: {analysisResult.emotionalImpact.innovation}%</div>
                      <div>TRUST: {analysisResult.emotionalImpact.trust}%</div>
                      <div>POWER: {analysisResult.emotionalImpact.power}%</div>
                      <div>SPEED: {analysisResult.emotionalImpact.speed}%</div>
                    </div>
                  </div>

                  {/* Section 10: Visual Branding Potential */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-2">
                      🎨 Visual Branding Canvas
                    </h4>
                    <div className="mt-3 space-y-2 text-xs">
                      <div>
                        <strong className="text-slate-700">Logo Dimension Balance:</strong>
                        <p className="text-slate-500 mt-0.5">{analysisResult.visualBranding.logoPotential}</p>
                      </div>
                      <div>
                        <strong className="text-slate-700">Iconic Anchor Suitability:</strong>
                        <p className="text-slate-500 mt-0.5">{analysisResult.visualBranding.iconPotential}</p>
                      </div>
                      <div>
                        <strong className="text-slate-700">Lowercase Minimal Vibe:</strong>
                        <p className="text-slate-500 mt-0.5">{analysisResult.visualBranding.minimalBranding}</p>
                      </div>
                      <div>
                        <strong className="text-slate-700">Favicon & App Icon scaling:</strong>
                        <p className="text-slate-500 mt-0.5">{analysisResult.visualBranding.faviconSuitability} • {analysisResult.visualBranding.appIconSuitability}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 11: Domain Friendliness */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-50 pb-2">
                      <span>💻 Domain Structuring</span>
                      <span className="text-orange-600 font-mono">{analysisResult.domainFriendliness.score}/100</span>
                    </h4>
                    <div className="mt-3 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Domain Length limit:</span>
                        <span className="font-bold text-slate-700">{analysisResult.domainFriendliness.short}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Keyboard Typing ease:</span>
                        <span className="font-bold text-slate-700">{analysisResult.domainFriendliness.easyToType}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Mistake/Typo vulnerability:</span>
                        <span className="font-bold text-slate-700">{analysisResult.domainFriendliness.lowTypoRisk}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Visual parse speed:</span>
                        <span className="font-bold text-slate-700">{analysisResult.domainFriendliness.readable}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 italic mt-1">(Note: This is structural check. Live domain WHOIS registration availability is not queried.)</p>
                    </div>
                  </div>

                  {/* Section 12: SEO Friendliness */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-50 pb-2">
                      <span>🔍 Search Engine (SEO)</span>
                      <span className="text-orange-600 font-mono">{analysisResult.seoFriendliness.score}/100</span>
                    </h4>
                    <div className="mt-3 space-y-2 text-xs">
                      <div>
                        <strong className="text-slate-700">Keyword Independence:</strong>
                        <p className="text-slate-500 mt-0.5">{analysisResult.seoFriendliness.uniqueKeyword}</p>
                      </div>
                      <div>
                        <strong className="text-slate-700">Voice Assistant Matching:</strong>
                        <p className="text-slate-500 mt-0.5">{analysisResult.seoFriendliness.easyToSearch}</p>
                      </div>
                      <div>
                        <strong className="text-slate-700">Ambiguity risk factor:</strong>
                        <p className="text-slate-500 mt-0.5">{analysisResult.seoFriendliness.potentialAmbiguity}</p>
                      </div>
                      <div>
                        <strong className="text-slate-700">Rank Competition density:</strong>
                        <p className="text-slate-500 mt-0.5">{analysisResult.seoFriendliness.competitionRisk}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 13: Social Media Friendliness */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-50 pb-2">
                      <span>📱 Social Media Profiles</span>
                      <span className="text-orange-600 font-mono">{analysisResult.socialMedia.score}/100</span>
                    </h4>
                    <div className="mt-3 space-y-2 text-xs">
                      <div>
                        <strong className="text-slate-700">Profile Name availability:</strong>
                        <p className="text-slate-500 mt-0.5">{analysisResult.socialMedia.easyUsername}</p>
                      </div>
                      <div>
                        <strong className="text-slate-700">Handle Length limits:</strong>
                        <p className="text-slate-500 mt-0.5">{analysisResult.socialMedia.short}</p>
                      </div>
                      <div>
                        <strong className="text-slate-700">Hashtag Campaigning:</strong>
                        <p className="text-slate-500 mt-0.5">{analysisResult.socialMedia.hashtagFriendly}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 14: Comparable Brands */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition md:col-span-2">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-2">
                      🤝 Comparable Brands & Naming Styles
                    </h4>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {analysisResult.comparableBrands.map((b, i) => (
                        <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-1">
                          <span className="font-extrabold text-orange-600 text-sm font-mono">{b.name}</span>
                          <p className="text-slate-600 leading-relaxed font-medium">{b.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 15 & 16: Strengths & Weaknesses */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 inline-block mb-3">
                        ✅ Brand Strengths
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-600">
                        {analysisResult.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-500 shrink-0">✓</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-red-800 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 inline-block mb-3">
                        ⚠️ Risks & Weaknesses
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-600">
                        {analysisResult.weaknesses.length > 0 ? (
                          analysisResult.weaknesses.map((w, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-red-500 shrink-0">!</span>
                              <span>{w}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-400 italic">No major naming risks detected. Good baseline metrics.</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Section 17: Improvement Suggestions */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition md:col-span-2">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-2">
                      💡 Actionable Naming suggestions
                    </h4>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                      {analysisResult.suggestions.map((s, i) => (
                        <div key={i} className="flex items-start gap-2.5 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                          <span className="text-amber-500">💡</span>
                          <span className="leading-relaxed font-medium">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 18: Brand Story */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition md:col-span-2 bg-gradient-to-r from-orange-50/20 to-amber-50/20">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-2">
                      📖 Autogenerated Brand Story Concept
                    </h4>
                    <p className="mt-3 text-slate-700 italic text-sm leading-relaxed text-center font-medium px-4">
                      "{analysisResult.story}"
                    </p>
                  </div>

                  {/* Section 19: Logo Style Recommendation */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-2">
                      🎨 Logo Architecture Recommendation
                    </h4>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 text-sm">Suggested Style:</span>
                        <span className="px-2.5 py-0.5 bg-orange-50 text-orange-700 font-bold border border-orange-100 rounded">
                          {analysisResult.logoStyle.style}
                        </span>
                      </div>
                      <p className="text-slate-500 leading-relaxed mt-1.5">{analysisResult.logoStyle.reason}</p>
                    </div>
                  </div>

                  {/* Section 20: Taglines */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-2">
                      🚀 5 Premium Tagline Concepts
                    </h4>
                    <div className="mt-3 space-y-2 text-xs">
                      {analysisResult.taglines.map((t, idx) => (
                        <div key={idx} className="flex gap-2 py-1.5 border-b border-slate-50 last:border-0 font-medium">
                          <span className="text-orange-500 font-mono font-bold">{idx + 1}.</span>
                          <span className="text-slate-700">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Section 21: Learning Mode */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition mt-4">
                  <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <span>💡</span> Learning Mode: Branding & Naming Principles
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    Why do some names stick while others fade? Branding consultants use specific design principles (syllables, letter visual shapes, phonetic stress) to engineer memorable brand assets. Let's analyze global startup names:
                  </p>
                  
                  <div className="mt-6 space-y-4">
                    {BRANDING_PRINCIPLES.map((bp, i) => (
                      <div key={i} className="border border-slate-100 rounded-2xl p-4 hover:bg-slate-50/50 transition">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="font-extrabold text-slate-800 text-base font-mono">{bp.brand}</span>
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider">{bp.type}</span>
                        </div>
                        <div className="mt-1 text-xs font-bold text-orange-600 uppercase tracking-wide text-[10px]">{bp.principle}</div>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">{bp.details}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Export Options Bottom Bar (Hidden on print) */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6 mt-6 print:hidden">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Export Brand Assessment:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5"
                    >
                      📋 Copy Markdown
                    </button>
                    <button
                      onClick={downloadMarkdownFile}
                      className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5"
                    >
                      ⬇️ Download .MD
                    </button>
                    <button
                      onClick={downloadTextFile}
                      className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5"
                    >
                      📄 Download .TXT
                    </button>
                    <button
                      onClick={handlePrintPdf}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5"
                    >
                      🖨️ Export PDF Report
                    </button>
                  </div>
                </div>

              </div>

              {/* Sidebar (History & Favorites) (Hidden on print) */}
              <div className="flex flex-col gap-6 print:hidden">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-800 text-sm">Recent Analyses</h3>
                    <button
                      onClick={() => setFavoritesOnly(!favoritesOnly)}
                      className={`text-xs px-2 py-0.5 rounded font-bold transition ${
                        favoritesOnly 
                          ? "bg-amber-500 text-white" 
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {favoritesOnly ? "★ Stars Only" : "Show All"}
                    </button>
                  </div>

                  <div className="mt-3 space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {filteredHistory.length > 0 ? (
                      filteredHistory.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => selectHistoryItem(item)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition flex justify-between items-center group ${
                            activeHistoryId === item.id 
                              ? "bg-orange-50/50 border-orange-300" 
                              : "bg-slate-50 hover:bg-white border-slate-100 hover:border-slate-200"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-800 text-sm truncate font-mono">{item.name}</div>
                            <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                              Score: {item.score} ({item.category}) • {item.industry}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 pl-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(item.id);
                              }}
                              className={`p-1 rounded text-xs transition hover:scale-110 ${
                                item.isFavorite ? "text-amber-500" : "text-slate-300 hover:text-slate-500"
                              }`}
                            >
                              ★
                            </button>
                            <button
                              onClick={(e) => deleteHistoryItem(item.id, e)}
                              className="p-1 rounded text-slate-300 hover:text-red-500 text-xs transition"
                              title="Delete"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-xs italic text-center py-6">
                        {favoritesOnly ? "No starred names yet." : "No recent audits yet."}
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-orange-50/20 p-5 border-dashed">
                  <h4 className="font-bold text-orange-800 text-xs uppercase tracking-wider">💡 Pro Brand Tip</h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
                    Try choosing spelling variants (like replacement of letters) or blending two words together. 
                    Invented or misspelled structures rank significantly higher for domain availability and SEO keywords, 
                    whereas real English words rank higher for immediate consumer trust.
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* FAQ Section (Hidden on Print) */}
        <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md print:hidden">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span>❓</span> Frequently Asked Naming Questions
          </h2>
          
          <div className="mt-4 space-y-3">
            {[
              {
                q: "What is the sweet spot length for a startup name?",
                a: "Between 5 and 8 letters. Names of this size have 30% higher memory recall than longer names and look excellent on app icons and logos."
              },
              {
                q: "Should I buy an expensive .com domain or use a modern extension?",
                a: "A .com extension remains the premium standard, signaling stability. However, SaaS, AI, and Web3 startups routinely scale using .ai, .io, .co, or .xyz. Secure typo-redirects to protect your trademark."
              },
              {
                q: "Why is trademark registration harder for real words?",
                a: "Real words in common dictionaries are heavily contested. Trademark law prevents registering descriptive terms (e.g. you can't trademark 'Fast Delivery' for shipping). Invented words like 'Spotify' have no meaning and are immediately granted protections."
              }
            ].map((faq, idx) => (
              <div key={idx} className="border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-bold text-slate-800 text-sm hover:text-orange-600 transition focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <span className="text-orange-600">{activeFaq === idx ? "−" : "+"}</span>
                </button>
                {activeFaq === idx && (
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium pl-2 border-l border-orange-200">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
