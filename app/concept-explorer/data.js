const CATEGORY_PROFILES = {
  Science: {
    oneLine: (topic) => `${topic} is a science topic that explains how natural systems work and change over time.`,
    eli10: (topic) => `${topic} is like a simple rulebook for nature. It helps you understand how things happen in the real world without guessing.`,
    keyConcepts: ["Observation", "Cause and effect", "Patterns", "Evidence", "Experiment"],
    whyItMatters: (topic) => `It matters because understanding ${topic.toLowerCase()} helps people solve problems in health, energy, and the environment.`,
    examples: ["School experiments", "Research labs", "Everyday natural processes"],
    learnNext: ["Scientific method", "Systems", "Energy"],
  },
  Technology: {
    oneLine: (topic) => `${topic} is a technology topic about how digital tools, systems, or software solve problems.`,
    eli10: (topic) => `${topic} is like a smart tool kit for computers. People use it to build apps, move data, or make things faster.`,
    keyConcepts: ["Software", "Automation", "Data", "Systems", "Interfaces"],
    whyItMatters: (topic) => `It matters because ${topic.toLowerCase()} helps people work faster, communicate better, and build useful products.`,
    examples: ["Apps", "Online services", "Automated workflows"],
    learnNext: ["Programming", "Cloud computing", "Databases"],
  },
  History: {
    oneLine: (topic) => `${topic} is a history topic that shows how past events shaped the world we live in today.`,
    eli10: (topic) => `${topic} is like a story from the past. It helps us understand what happened, why it happened, and what changed after.`,
    keyConcepts: ["Timeline", "Causes", "Effects", "People", "Change"],
    whyItMatters: (topic) => `It matters because learning about ${topic.toLowerCase()} helps us avoid repeating mistakes and understand current events.`,
    examples: ["Major wars", "Movements", "Turning points"],
    learnNext: ["Primary sources", "World history", "Civics"],
  },
  Geography: {
    oneLine: (topic) => `${topic} is a geography topic about places, environments, and how humans interact with them.`,
    eli10: (topic) => `${topic} is like learning the map and the story of a place at the same time. It explains land, climate, and people.`,
    keyConcepts: ["Location", "Climate", "Landforms", "Resources", "Population"],
    whyItMatters: (topic) => `It matters because ${topic.toLowerCase()} affects travel, weather, trade, and where people live.`,
    examples: ["Maps", "Regions", "Natural resources"],
    learnNext: ["Map reading", "Climate zones", "Urban geography"],
  },
  Finance: {
    oneLine: (topic) => `${topic} is a finance topic that explains how money changes value, moves, or grows.`,
    eli10: (topic) => `${topic} is like a money rule. It helps people understand saving, spending, borrowing, and investing.`,
    keyConcepts: ["Money", "Risk", "Growth", "Rates", "Planning"],
    whyItMatters: (topic) => `It matters because ${topic.toLowerCase()} affects budgets, prices, loans, and long-term financial decisions.`,
    examples: ["Savings", "Loans", "Investments"],
    learnNext: ["Budgeting", "Compound growth", "Personal finance"],
  },
  Mathematics: {
    oneLine: (topic) => `${topic} is a mathematics topic that helps us describe patterns, quantities, and relationships.`,
    eli10: (topic) => `${topic} is like a puzzle with rules. Once you know the rules, you can solve problems step by step.`,
    keyConcepts: ["Pattern", "Formula", "Logic", "Variables", "Reasoning"],
    whyItMatters: (topic) => `It matters because ${topic.toLowerCase()} supports science, engineering, coding, and everyday decision-making.`,
    examples: ["Homework problems", "Calculations", "Data analysis"],
    learnNext: ["Algebra basics", "Statistics", "Geometry"],
  },
  Business: {
    oneLine: (topic) => `${topic} is a business topic about how organizations create value, serve customers, and grow.`,
    eli10: (topic) => `${topic} is like the playbook for running a company or project. It connects people, money, and decisions.`,
    keyConcepts: ["Customers", "Value", "Operations", "Revenue", "Strategy"],
    whyItMatters: (topic) => `It matters because ${topic.toLowerCase()} influences how companies compete, deliver products, and stay profitable.`,
    examples: ["Startups", "Retail", "Operations teams"],
    learnNext: ["Marketing", "Product strategy", "Operations"],
  },
  Internet: {
    oneLine: (topic) => `${topic} is an internet topic that explains how online systems, platforms, or communication tools work.`,
    eli10: (topic) => `${topic} is like the plumbing of the web. It helps websites, apps, and people exchange information quickly.`,
    keyConcepts: ["Networks", "Protocols", "Content", "Search", "Sharing"],
    whyItMatters: (topic) => `It matters because ${topic.toLowerCase()} shapes how people discover information, communicate, and build online products.`,
    examples: ["Websites", "Messaging apps", "Search results"],
    learnNext: ["Web basics", "APIs", "Digital privacy"],
  },
  "General Knowledge": {
    oneLine: (topic) => `${topic} is a general knowledge topic that helps you understand everyday ideas and how they connect.`,
    eli10: (topic) => `${topic} is like a useful idea for real life. It gives you a simple way to think about the world.`,
    keyConcepts: ["Context", "Meaning", "Examples", "Reasoning", "Application"],
    whyItMatters: (topic) => `It matters because ${topic.toLowerCase()} makes it easier to communicate clearly and learn new subjects faster.`,
    examples: ["Daily decisions", "Conversations", "School learning"],
    learnNext: ["Critical thinking", "Communication", "Research skills"],
  },
};

const KNOWLEDGE_BASE = [
  {
    title: "Artificial Intelligence",
    category: "Technology",
    aliases: ["AI", "machine intelligence"],
    keywords: ["computers", "learning", "automation", "models", "data"],
    oneLine: "Artificial Intelligence is the ability of computers to perform tasks that normally require human intelligence.",
    eli10: "AI is like teaching computers to notice patterns and make useful decisions, almost like a very fast helper that learns from examples.",
    keyConcepts: ["Machine Learning", "Neural Networks", "Automation", "Data", "Algorithms"],
    whyItMatters: "Used in search engines, recommendations, healthcare, coding tools, and automation.",
    examples: ["Chatbots", "Self-driving cars", "Voice assistants"],
    learnNext: ["Machine Learning", "Deep Learning", "Data Science"],
  },
  {
    title: "Blockchain",
    category: "Technology",
    aliases: ["distributed ledger"],
    keywords: ["crypto", "ledger", "transaction", "decentralized", "records"],
    oneLine: "Blockchain is a shared digital record system that stores data in linked blocks.",
    eli10: "It is like a notebook that many people can read and agree on, but no single person can quietly change it.",
    keyConcepts: ["Blocks", "Ledger", "Decentralization", "Consensus", "Cryptography"],
    whyItMatters: "It helps people track ownership, verify transactions, and build trust without one central controller.",
    examples: ["Cryptocurrency", "Supply tracking", "Digital contracts"],
    learnNext: ["Cryptography", "Smart contracts", "Web3"],
  },
  {
    title: "Cybersecurity",
    category: "Technology",
    aliases: ["online security"],
    keywords: ["hacker", "protection", "password", "attack", "safe"],
    oneLine: "Cybersecurity is the practice of protecting devices, networks, and data from digital attacks.",
    eli10: "It is like locking the doors and windows of the internet so bad actors cannot easily get in.",
    keyConcepts: ["Threats", "Encryption", "Authentication", "Firewalls", "Phishing"],
    whyItMatters: "It protects money, private data, and systems that people rely on every day.",
    examples: ["Password managers", "Antivirus tools", "Two-factor login"],
    learnNext: ["Encryption", "Ethical hacking", "Digital hygiene"],
  },
  {
    title: "Cloud Computing",
    category: "Technology",
    aliases: ["the cloud"],
    keywords: ["servers", "storage", "remote", "apps", "scalable"],
    oneLine: "Cloud computing is the delivery of computing services over the internet instead of on a local computer.",
    eli10: "It is like renting computer power and storage from a giant online utility whenever you need it.",
    keyConcepts: ["Servers", "Storage", "Scalability", "Networks", "Virtualization"],
    whyItMatters: "It makes apps easier to launch, scale, and access from anywhere.",
    examples: ["File backups", "Streaming platforms", "Web apps"],
    learnNext: ["DevOps", "Containers", "Serverless"],
  },
  {
    title: "Photosynthesis",
    category: "Science",
    aliases: [],
    keywords: ["plants", "sunlight", "chlorophyll", "glucose", "oxygen"],
    oneLine: "Photosynthesis is the process plants use to turn sunlight, water, and carbon dioxide into food.",
    eli10: "Plants use sunlight like a battery charger. They turn light into sugar so they can grow and survive.",
    keyConcepts: ["Sunlight", "Chlorophyll", "Carbon dioxide", "Water", "Glucose"],
    whyItMatters: "It powers plant growth and is the foundation of most food chains on Earth.",
    examples: ["Leaves", "Algae", "Crop growth"],
    learnNext: ["Cell biology", "Ecosystems", "Plant anatomy"],
  },
  {
    title: "Gravity",
    category: "Science",
    aliases: [],
    keywords: ["force", "fall", "orbit", "mass", "planet"],
    oneLine: "Gravity is the force that pulls objects toward each other, especially toward Earth.",
    eli10: "Gravity is the invisible pull that keeps you on the ground and helps planets stay in orbit.",
    keyConcepts: ["Force", "Mass", "Motion", "Orbit", "Weight"],
    whyItMatters: "It shapes how things fall, how planets move, and how buildings and machines are designed.",
    examples: ["Falling objects", "Tides", "Planetary motion"],
    learnNext: ["Motion", "Astrophysics", "Forces"],
  },
  {
    title: "DNA",
    category: "Science",
    aliases: ["deoxyribonucleic acid"],
    keywords: ["genes", "genetics", "cell", "inheritance", "code"],
    oneLine: "DNA is the molecule that stores the instructions living things use to build and run their bodies.",
    eli10: "DNA is like the instruction book for life. It tells cells how to make you and how traits are passed on.",
    keyConcepts: ["Genes", "Chromosomes", "Inheritance", "Cells", "Mutation"],
    whyItMatters: "It helps explain heredity, disease, medicine, and how organisms are related.",
    examples: ["Genetic testing", "Forensics", "Traits passed from parents"],
    learnNext: ["Cell structure", "Genetics", "Evolution"],
  },
  {
    title: "Climate Change",
    category: "Science",
    aliases: ["global warming"],
    keywords: ["weather", "carbon", "temperature", "emissions", "environment"],
    oneLine: "Climate change is the long-term shift in Earth's temperature and weather patterns.",
    eli10: "It is like the planet slowly changing its habits because too much heat is trapped in the atmosphere.",
    keyConcepts: ["Greenhouse gases", "Temperature", "Emissions", "Sea level", "Weather patterns"],
    whyItMatters: "It affects storms, crops, oceans, health, and infrastructure around the world.",
    examples: ["Hotter summers", "Melting ice", "Stronger storms"],
    learnNext: ["Sustainability", "Energy systems", "Environmental science"],
  },
  {
    title: "World War 2",
    category: "History",
    aliases: ["WW2", "Second World War"],
    keywords: ["allies", "axis", "war", "1940s", "global conflict"],
    oneLine: "World War 2 was a global conflict from 1939 to 1945 involving many countries across the world.",
    eli10: "It was a huge worldwide fight that changed borders, governments, technology, and everyday life for millions of people.",
    keyConcepts: ["Allied powers", "Axis powers", "1945", "Holocaust", "Aftermath"],
    whyItMatters: "It shaped modern politics, human rights, and the international order we still live with today.",
    examples: ["D-Day", "Pacific theater", "United Nations"],
    learnNext: ["Cold War", "20th century history", "Human rights"],
  },
  {
    title: "Renaissance",
    category: "History",
    aliases: [],
    keywords: ["art", "Europe", "rebirth", "science", "culture"],
    oneLine: "The Renaissance was a period of renewed art, science, and learning in Europe.",
    eli10: "It was like a big comeback for ideas, where people started exploring art, science, and human creativity again.",
    keyConcepts: ["Humanism", "Art", "Discovery", "Printing", "Science"],
    whyItMatters: "It influenced modern art, science, and the way people think about knowledge.",
    examples: ["Leonardo da Vinci", "Michelangelo", "Printing press"],
    learnNext: ["European history", "Art history", "Scientific revolution"],
  },
  {
    title: "Industrial Revolution",
    category: "History",
    aliases: [],
    keywords: ["factory", "machines", "steam", "industry", "urban"],
    oneLine: "The Industrial Revolution was the shift from hand production to machine-based manufacturing.",
    eli10: "Factories and machines started doing work that people once did by hand, which changed cities and jobs.",
    keyConcepts: ["Factories", "Steam power", "Urbanization", "Labor", "Mechanization"],
    whyItMatters: "It transformed how goods were made, how people worked, and how economies grew.",
    examples: ["Textile mills", "Railways", "Mass production"],
    learnNext: ["Modern economics", "Labor history", "Technology history"],
  },
  {
    title: "Amazon Rainforest",
    category: "Geography",
    aliases: [],
    keywords: ["jungle", "biodiversity", "rainforest", "south america", "ecosystem"],
    oneLine: "The Amazon Rainforest is a vast tropical forest in South America known for extreme biodiversity.",
    eli10: "It is one of the biggest natural home bases for plants, animals, and rain on Earth.",
    keyConcepts: ["Biodiversity", "Rainforest", "Carbon storage", "River basin", "Conservation"],
    whyItMatters: "It helps regulate climate, stores carbon, and supports millions of species.",
    examples: ["Jaguar habitat", "Indigenous communities", "Tropical rainfall"],
    learnNext: ["Biomes", "Conservation", "Climate systems"],
  },
  {
    title: "Monsoon",
    category: "Geography",
    aliases: [],
    keywords: ["rain", "seasonal wind", "weather", "asia", "climate"],
    oneLine: "A monsoon is a seasonal wind pattern that brings heavy rain to some regions.",
    eli10: "It is like a weather switch that turns on a rainy season, which many places rely on for farming and water.",
    keyConcepts: ["Seasonal winds", "Rainfall", "Climate", "Agriculture", "Atmosphere"],
    whyItMatters: "It affects crops, water supply, and daily life for millions of people.",
    examples: ["South Asia rains", "Rice farming", "Flood planning"],
    learnNext: ["Weather systems", "Climate zones", "Hydrology"],
  },
  {
    title: "Inflation",
    category: "Finance",
    aliases: [],
    keywords: ["prices", "money", "cost", "economy", "purchasing power"],
    oneLine: "Inflation is the rise in prices over time that reduces what money can buy.",
    eli10: "Inflation means the same amount of money buys less than it used to, so prices feel higher.",
    keyConcepts: ["Price level", "Purchasing power", "Demand", "Supply", "Central banks"],
    whyItMatters: "It affects wages, savings, loans, and everyday living costs.",
    examples: ["Groceries", "Rent", "Fuel prices"],
    learnNext: ["Interest rates", "Budgeting", "Macroeconomics"],
  },
  {
    title: "Interest Rates",
    category: "Finance",
    aliases: ["rate of interest"],
    keywords: ["loan", "savings", "bank", "borrowing", "percent"],
    oneLine: "Interest rates are the cost of borrowing money or the reward for saving it.",
    eli10: "If you borrow money, interest is the extra you pay back. If you save money, it is the extra you can earn.",
    keyConcepts: ["Loans", "Savings", "Percent", "Risk", "Central bank policy"],
    whyItMatters: "They influence mortgages, credit cards, business loans, and investment choices.",
    examples: ["Home loans", "Savings accounts", "Credit card debt"],
    learnNext: ["Inflation", "Compound interest", "Personal finance"],
  },
  {
    title: "Compound Interest",
    category: "Finance",
    aliases: [],
    keywords: ["growth", "investing", "savings", "interest", "returns"],
    oneLine: "Compound interest is interest earned on both the original money and the interest already added.",
    eli10: "It is money growing on top of money. The longer you leave it alone, the faster it can grow.",
    keyConcepts: ["Principal", "Returns", "Time", "Growth", "Reinvestment"],
    whyItMatters: "It is one of the most important ideas in saving, investing, and debt planning.",
    examples: ["Savings accounts", "Retirement funds", "Loan balances"],
    learnNext: ["Interest rates", "Investing", "Budgeting"],
  },
  {
    title: "Algebra",
    category: "Mathematics",
    aliases: [],
    keywords: ["variables", "equations", "solve", "math", "symbols"],
    oneLine: "Algebra is the branch of math that uses symbols and equations to represent relationships.",
    eli10: "Algebra is like solving a mystery with letters instead of missing pieces. The letters stand for numbers.",
    keyConcepts: ["Variables", "Equations", "Expressions", "Functions", "Rules"],
    whyItMatters: "It is the language behind science, coding, engineering, and many real-world calculations.",
    examples: ["Solving for x", "Budget formulas", "Word problems"],
    learnNext: ["Functions", "Graphs", "Linear equations"],
  },
  {
    title: "Probability",
    category: "Mathematics",
    aliases: [],
    keywords: ["chance", "random", "odds", "likelihood", "statistics"],
    oneLine: "Probability measures how likely something is to happen.",
    eli10: "It is the math of chance. It helps you guess outcomes when you cannot know the future for sure.",
    keyConcepts: ["Outcomes", "Events", "Chance", "Fractions", "Statistics"],
    whyItMatters: "It helps in weather forecasting, games, science, and decision-making under uncertainty.",
    examples: ["Coin flips", "Weather forecasts", "Board games"],
    learnNext: ["Statistics", "Combinatorics", "Data analysis"],
  },
  {
    title: "Prime Numbers",
    category: "Mathematics",
    aliases: [],
    keywords: ["divisible", "factors", "number theory", "math", "counting"],
    oneLine: "Prime numbers are numbers greater than 1 that have exactly two factors: 1 and themselves.",
    eli10: "They are the building blocks of whole numbers because every number can be made from primes in some way.",
    keyConcepts: ["Factors", "Divisibility", "Number theory", "Patterns", "Multiplication"],
    whyItMatters: "They are important in math proofs, coding, and digital security.",
    examples: ["2, 3, 5, 7", "Cryptography", "Factorization"],
    learnNext: ["Number theory", "Multiples", "Cryptography"],
  },
  {
    title: "Supply Chain",
    category: "Business",
    aliases: [],
    keywords: ["logistics", "shipping", "inventory", "delivery", "supplier"],
    oneLine: "A supply chain is the network that moves products from raw materials to the customer.",
    eli10: "It is the journey of a product from where it is made to where someone buys and uses it.",
    keyConcepts: ["Suppliers", "Manufacturing", "Logistics", "Inventory", "Delivery"],
    whyItMatters: "It affects product availability, costs, and how quickly companies can serve customers.",
    examples: ["Shipping goods", "Warehouse storage", "Retail restocking"],
    learnNext: ["Operations", "Procurement", "Inventory management"],
  },
  {
    title: "Branding",
    category: "Business",
    aliases: [],
    keywords: ["identity", "marketing", "logo", "reputation", "positioning"],
    oneLine: "Branding is the process of shaping how people recognize and feel about a business or product.",
    eli10: "Branding is the personality of a company. It is what people remember after they see the product or ad.",
    keyConcepts: ["Identity", "Trust", "Messaging", "Design", "Reputation"],
    whyItMatters: "It helps businesses stand out, build trust, and attract loyal customers.",
    examples: ["Logos", "Taglines", "Product packaging"],
    learnNext: ["Marketing", "Customer experience", "Positioning"],
  },
  {
    title: "Entrepreneurship",
    category: "Business",
    aliases: [],
    keywords: ["startup", "founder", "business", "risk", "opportunity"],
    oneLine: "Entrepreneurship is the act of starting and running a business or new venture.",
    eli10: "It is when someone spots a problem or opportunity and tries to build something useful around it.",
    keyConcepts: ["Risk", "Opportunity", "Innovation", "Customers", "Execution"],
    whyItMatters: "It creates new products, services, jobs, and economic growth.",
    examples: ["Startups", "Side businesses", "New apps"],
    learnNext: ["Business models", "Pitching", "Product-market fit"],
  },
  {
    title: "Search Engines",
    category: "Internet",
    aliases: [],
    keywords: ["google", "search", "web", "ranking", "results"],
    oneLine: "Search engines are tools that help people find information on the web.",
    eli10: "They are like giant library helpers that scan the internet and show you the best answers first.",
    keyConcepts: ["Indexing", "Ranking", "Keywords", "Crawling", "Results"],
    whyItMatters: "They shape how people discover information, products, and answers online.",
    examples: ["Google Search", "Bing", "DuckDuckGo"],
    learnNext: ["SEO", "Web crawling", "Information retrieval"],
  },
  {
    title: "APIs",
    category: "Internet",
    aliases: ["Application Programming Interfaces"],
    keywords: ["connect", "data", "request", "response", "integration"],
    oneLine: "APIs are rules that let different software systems talk to each other.",
    eli10: "An API is like a waiter between two apps. One app asks, the other app replies in a format they both understand.",
    keyConcepts: ["Requests", "Responses", "Endpoints", "Authentication", "Integration"],
    whyItMatters: "They power logins, payments, maps, automation, and many connected products.",
    examples: ["Weather apps", "Payment services", "Social logins"],
    learnNext: ["HTTP", "REST", "Web development"],
  },
  {
    title: "Social Media",
    category: "Internet",
    aliases: [],
    keywords: ["platform", "sharing", "followers", "posts", "engagement"],
    oneLine: "Social media is a set of online platforms where people create, share, and interact with content.",
    eli10: "It is like a giant public notice board where people post ideas, photos, videos, and comments.",
    keyConcepts: ["Content", "Audience", "Engagement", "Algorithms", "Communities"],
    whyItMatters: "It affects communication, marketing, news, and culture.",
    examples: ["Instagram", "YouTube", "X"],
    learnNext: ["Digital literacy", "Community building", "Content strategy"],
  },
  {
    title: "Democracy",
    category: "General Knowledge",
    aliases: [],
    keywords: ["vote", "government", "citizen", "election", "rights"],
    oneLine: "Democracy is a system of government where people choose their leaders through voting.",
    eli10: "It means the people get a say in who makes decisions for the country or community.",
    keyConcepts: ["Voting", "Representation", "Rights", "Laws", "Participation"],
    whyItMatters: "It gives citizens a voice in how society is run and how power is shared.",
    examples: ["Elections", "Parliaments", "Local councils"],
    learnNext: ["Civics", "Constitutions", "Human rights"],
  },
  {
    title: "Critical Thinking",
    category: "General Knowledge",
    aliases: [],
    keywords: ["reasoning", "question", "evidence", "logic", "judgment"],
    oneLine: "Critical thinking is the habit of carefully evaluating information before accepting it.",
    eli10: "It means asking, 'Is this true, and how do I know?' before jumping to conclusions.",
    keyConcepts: ["Evidence", "Logic", "Bias", "Assumptions", "Judgment"],
    whyItMatters: "It helps you make better decisions, avoid mistakes, and spot unreliable claims.",
    examples: ["Fact-checking", "Problem-solving", "Comparing sources"],
    learnNext: ["Argument analysis", "Media literacy", "Research skills"],
  },
];

const POPULAR_TOPICS = [
  "Artificial Intelligence",
  "Blockchain",
  "Photosynthesis",
  "Inflation",
  "World War 2",
  "Probability",
  "Search Engines",
  "Critical Thinking",
];

const EXAMPLE_TOPICS = ["AI", "Blockchain", "Photosynthesis", "Inflation", "Quantum Physics", "World War 2"];

const CATEGORY_KEYWORDS = {
  Science: ["science", "biology", "chemistry", "physics", "nature", "plant", "cell", "planet", "energy", "climate"],
  Technology: ["technology", "tech", "software", "computer", "digital", "app", "code", "internet", "ai", "blockchain"],
  History: ["history", "war", "empire", "revolution", "timeline", "ancient", "modern", "world war"],
  Geography: ["geography", "map", "place", "country", "city", "rainforest", "river", "mountain", "climate", "region"],
  Finance: ["finance", "money", "price", "inflation", "interest", "bank", "saving", "investment", "loan", "budget"],
  Mathematics: ["math", "algebra", "geometry", "probability", "equation", "number", "formula", "statistics"],
  Business: ["business", "company", "market", "brand", "customer", "startup", "supply", "sales", "operations"],
  Internet: ["internet", "web", "online", "api", "search", "social", "website", "platform", "browser"],
  "General Knowledge": ["democracy", "thinking", "communication", "habit", "culture", "general"],
};

function normalize(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  return normalize(value).split(" ").filter(Boolean);
}

function levenshtein(left, right) {
  const a = normalize(left);
  const b = normalize(right);

  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let previousRow = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i += 1) {
    const currentRow = [i];

    for (let j = 1; j <= b.length; j += 1) {
      const insertCost = currentRow[j - 1] + 1;
      const deleteCost = previousRow[j] + 1;
      const replaceCost = previousRow[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      currentRow.push(Math.min(insertCost, deleteCost, replaceCost));
    }

    previousRow = currentRow;
  }

  return previousRow[previousRow.length - 1];
}

function similarity(left, right) {
  const a = normalize(left);
  const b = normalize(right);

  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.94;

  const distance = levenshtein(a, b);
  return Math.max(0, 1 - distance / Math.max(a.length, b.length));
}

function scoreTopic(query, topic) {
  const normalizedQuery = normalize(query);
  const titleScore = similarity(normalizedQuery, topic.title);
  const aliasScore = topic.aliases.reduce((best, alias) => Math.max(best, similarity(normalizedQuery, alias)), 0);
  const queryTokens = tokenize(normalizedQuery);
  const titleTokens = new Set(tokenize(topic.title));
  const overlap = queryTokens.filter((token) => titleTokens.has(token)).length;
  const tokenScore = queryTokens.length > 0 ? overlap / Math.max(queryTokens.length, titleTokens.size) : 0;
  const exactAliasMatch = topic.aliases.some((alias) => normalize(alias) === normalizedQuery) ? 1 : 0;

  return Math.max(titleScore, aliasScore, tokenScore, exactAliasMatch);
}

function inferCategory(query) {
  const normalizedQuery = normalize(query);

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => normalizedQuery.includes(keyword))) {
      return category;
    }
  }

  return "General Knowledge";
}

function buildFallbackTopic(query) {
  const category = inferCategory(query);
  const profile = CATEGORY_PROFILES[category] || CATEGORY_PROFILES["General Knowledge"];
  const topic = query.trim();
  const normalized = normalize(topic);

  const inferredConcepts = Array.from(
    new Set([
      ...profile.keyConcepts,
      ...tokenize(normalized)
        .filter((token) => token.length > 3)
        .map((token) => token.charAt(0).toUpperCase() + token.slice(1)),
    ])
  ).slice(0, 6);

  return {
    title: topic,
    category,
    source: "Local fallback",
    oneLine: profile.oneLine(topic),
    eli10: profile.eli10(topic),
    keyConcepts: inferredConcepts,
    whyItMatters: profile.whyItMatters(topic),
    examples: [topic, ...profile.examples].slice(0, 4),
    learnNext: profile.learnNext.slice(0, 4),
    confidence: 0.35,
    matchedTopic: null,
  };
}

export function searchConcept(query) {
  const trimmed = query.trim();

  if (!trimmed) {
    return null;
  }

  let bestTopic = null;
  let bestScore = 0;

  for (const topic of KNOWLEDGE_BASE) {
    const score = scoreTopic(trimmed, topic);

    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }

  if (bestTopic && bestScore >= 0.34) {
    const title = bestTopic.title;
    const source = normalize(trimmed) === normalize(title) || bestTopic.aliases.some((alias) => normalize(alias) === normalize(trimmed)) ? "Exact/local match" : "Closest local match";

    return {
      title,
      category: bestTopic.category,
      source,
      oneLine: bestTopic.oneLine,
      eli10: bestTopic.eli10,
      keyConcepts: bestTopic.keyConcepts,
      whyItMatters: bestTopic.whyItMatters,
      examples: bestTopic.examples,
      learnNext: bestTopic.learnNext,
      confidence: Number(bestScore.toFixed(2)),
      matchedTopic: bestTopic.title,
    };
  }

  return buildFallbackTopic(trimmed);
}

export function buildShareText(result) {
  return [
    `${result.title} - QuickLearn`,
    `Category: ${result.category}`,
    `One-line explanation: ${result.oneLine}`,
    `Explain like I'm 10: ${result.eli10}`,
    `Key concepts: ${result.keyConcepts.join(", ")}`,
    `Why it matters: ${result.whyItMatters}`,
    `Real-world examples: ${result.examples.join(", ")}`,
    `Learn next: ${result.learnNext.join(", ")}`,
  ].join("\n");
}

export { CATEGORY_PROFILES, KNOWLEDGE_BASE, POPULAR_TOPICS, EXAMPLE_TOPICS };