"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ComingSoon from "@/app/components/ComingSoon";

// Detailed comparisons database
const COMPARISONS = {
  ai: {
    id: "ai",
    title: "AI Revolution",
    icon: "ai",
    category: "Technology",
    historicalEvent: "The First Industrial Revolution",
    historicalPeriod: "Late 18th to mid 19th Century",
    summary: "The shift from manual cognitive labor and decision-making to artificial intelligence mirrors the historic shift from human/animal muscle power to steam engines and mechanized manufacturing.",
    whatHappened: "Beginning in Britain, the Industrial Revolution replaced traditional handloom weavers and artisans with steam-powered factories. While this drastically increased productivity and created the modern middle class, it initially caused widespread job displacement, urban squalor, and social unrest. Workers who resisted (such as the Luddites) smashed machines in protest of lost livelihoods, but eventually, legislative reforms and new economic sectors created a higher quality of life.",
    similarities: [
      "Exponential productivity gains that rewrite the unit economics of core industries.",
      "Intense anxiety over labor displacement, rendering long-held human skills obsolete overnight.",
      "Concentration of wealth in the hands of the individuals and corporations that own the infrastructure/capital.",
      "Scramble for regulatory safety standards and worker protections following an initial period of rapid, unchecked deployment."
    ],
    differences: [
      "Cognitive vs. Physical: The Industrial Revolution replaced physical labor, while the AI Revolution automates cognitive tasks, creative writing, and decision-making.",
      "Global Velocity: Industrialization took nearly a century to spread globally; AI tools are deployed worldwide in seconds via the internet.",
      "Capital Accessibility: Building physical factories requires enormous physical infrastructure; building software applications has much lower capital barriers, though training foundational frontier models remains highly centralized."
    ],
    lessonsLearned: [
      "Banning or resisting technological transition is historically futile; adaptive education and re-skilling are the only viable long-term paths.",
      "Safety and labor standards should be established early. Delaying policy response leads to worker exploitation and social instability.",
      "Reinvestment of technology gains into social safety nets (like education or retraining) is essential to smooth out transitional disruption."
    ],
    takeaways: [
      "Acquire complementary skills: Focus on utilizing AI to amplify your output (e.g., prompting, orchestrating, and editing) rather than competing head-to-head with machine speed.",
      "Emphasize the human element: Build expertise in areas where empathy, physical craftsmanship, physical presence, and strategic leadership are irreplaceable."
    ],
    timeline: [
      {
        stage: "1. Origin",
        historyYear: "1760s",
        historyText: "James Watt refines the steam engine, sparking mechanized manufacturing.",
        modernYear: "2010s",
        modernText: "Deep learning scaling breakthrough; image recognition and language models begin rapid evolution."
      },
      {
        stage: "2. Disruption Peak",
        historyYear: "1811",
        historyText: "Luddite riots break out as weavers smash mechanical looms in fear of wage cuts and starvation.",
        modernYear: "2022",
        modernText: "ChatGPT launches globally; sparks panic over cognitive careers like writing, design, and coding."
      },
      {
        stage: "3. Regulation Struggle",
        historyYear: "1833",
        historyText: "The UK Factory Act regulates child labor and working hours, establishing the first factory safety inspectors.",
        modernYear: "Present",
        modernText: "Global debates on AI copyright infringement, safety guidelines, and executive orders to govern frontier models."
      },
      {
        stage: "4. New Equilibrium",
        historyYear: "1850s+",
        historyText: "Massive growth of the middle class, shorter work weeks, and rise in purchasing power across industrialized nations.",
        modernYear: "Future (2030+)",
        modernText: "Autonomous agents handle routine tasks; human labor pivots to strategic oversight, emotional roles, and physical services."
      }
    ]
  },
  economic: {
    id: "economic",
    title: "Economic Crisis",
    icon: "economic",
    category: "Finance",
    historicalEvent: "The Panic of 1873 & Long Depression",
    historicalPeriod: "1873 – 1879",
    summary: "Modern market cycles and debt-fueled asset corrections bear a striking resemblance to the railroad speculation panic of 1873, which triggered a prolonged global contraction.",
    whatHappened: "Following the American Civil War, investors poured massive capital into speculative railroad stocks, banking on optimistic projections. The bubble burst when the major investment house Jay Cooke & Co. went bankrupt due to unmarketable railroad bonds. This triggered a banking panic, stock market crash, and a six-year stagnation known as the 'Long Depression,' characterized by widespread defaults, bank runs, and high unemployment before industrial recovery.",
    similarities: [
      "A massive investment bubble in a new, transformative infrastructure technology (railroads then; subprime housing, crypto, or AI now).",
      "Easy credit terms and excessive leverage hiding systemic vulnerabilities.",
      "The failure of a single, highly integrated financial institution cascading into a freezing of global credit markets."
    ],
    differences: [
      "Central Bank Interventions: Modern central banks use aggressive monetary policies (QE, bailouts) and deposit insurance (FDIC) to prevent catastrophic runs.",
      "Velocity of Panic: In 1873, news and bank liquidations took weeks to cross the ocean; modern panic spreads instantly via high-frequency trading and digital communications.",
      "Monetary Flexibility: The 1873 economy was locked to the Gold Standard, limiting liquidity injection. Modern fiat currency systems permit massive monetary expansion at the risk of inflation."
    ],
    lessonsLearned: [
      "Speculative bubbles in new technology are normal and often build the infrastructure of the next era (railroad tracks laid in 1870 eventually powered the gilded age economy).",
      "Financial innovations (like complex debt wrappers) consistently outpace regulator comprehension, making periodic systemic updates necessary.",
      "De-leveraging and clearing bad debt is a slow, structural process; attempts to artificially delay the pain often prolong recovery times."
    ],
    takeaways: [
      "Maintain a cash reserve: In market peaks, liquidity is taken for granted. Keep a buffer of highly liquid assets to withstand sudden credit freezes.",
      "Separate technology from stocks: The long-term utility of an innovation is independent of the share price of the companies building it during bubble phases."
    ],
    timeline: [
      {
        stage: "1. Speculation Boom",
        historyYear: "1869",
        historyText: "Transcontinental Railroad is completed, causing massive speculation in railroad company shares.",
        modernYear: "2001-06",
        modernText: "Extremely low interest rates feed a housing boom and complex mortgage-backed securities speculation."
      },
      {
        stage: "2. The Trigger",
        historyYear: "Sept 1873",
        historyText: "Jay Cooke & Co., a major banking house holding unsellable railroad debt, suddenly goes bankrupt.",
        modernYear: "Sept 2008",
        modernText: "Lehman Brothers declares bankruptcy; credit lines freeze instantly, launching the Great Recession."
      },
      {
        stage: "3. Cleanse & Struggle",
        historyYear: "1873-77",
        historyText: "A third of US railroad companies default; unemployment reaches record levels amidst labor strikes.",
        modernYear: "2009-15",
        modernText: "Unprecedented government bailouts, quantitative easing, and a slow, uneven jobs market recovery."
      },
      {
        stage: "4. Stabilization",
        historyYear: "1879+",
        historyText: "Railroad lines are consolidated into highly efficient networks, laying the foundation for Gilded Age manufacturing.",
        modernYear: "Present/Recent",
        modernText: "Post-COVID inflation surges lead to aggressive interest rate hikes and stabilization efforts by central banks."
      }
    ]
  },
  remote: {
    id: "remote",
    title: "Remote Work",
    icon: "remote",
    category: "Labor",
    historicalEvent: "The Pre-Industrial Cottage Industry & Centralization",
    historicalPeriod: "17th to 19th Century",
    summary: "The transition of white-collar workers back to home offices is a technology-driven reversal of the Industrial Revolution's migration from home-based 'Cottage Industry' to centralized factory halls.",
    whatHappened: "Before factories, manufacturing was home-centered. Merchants distributed raw wool or cotton to rural households, where families spun and wove textiles on their own schedules. This was known as the 'putting-out' system. When heavy steam engines were invented, workers had to be concentrated in physical factories to share power. This destroyed home-centric life, introduced rigid work hours, created the daily commute, and established managerial surveillance.",
    similarities: [
      "Reclaiming autonomy over daily schedules and blending domestic chores with professional tasks.",
      "A redistribution of economic activity away from hyper-crowded city centers to suburban/rural regions.",
      "Management shifting focus from 'hours spent under supervision' to 'tangible output delivered' (piece-rate pay then, project deliverables now)."
    ],
    differences: [
      "Technology Scale: Cottage weavers were physically isolated with slow communication. Modern remote workers use instant video and chat networks to coordinate globally.",
      "Work Nature: Cottage industry was physical manufacturing; modern remote work is primarily digital white-collar information processing.",
      "Worker Isolation: Pre-industrial cottages worked as family units; modern remote work can be highly individualistic, leading to feelings of isolation."
    ],
    lessonsLearned: [
      "Physical centralization is a function of non-portable tooling or power. Once tooling becomes portable (computers and internet), labor naturally decentralizes.",
      "The blurring of work and home boundaries can cause severe psychological burnout; strict separation rules must be self-imposed.",
      "Local communities thrive when residents spend both their work hours and disposable income locally, rather than commuting out."
    ],
    takeaways: [
      "Enforce boundary walls: Establish a dedicated workspace and hard stop times to prevent work from colonizing your personal life.",
      "Build proactive networks: Intentionally seek out face-to-face social connections outside of your remote work environment to combat isolation."
    ],
    timeline: [
      {
        stage: "1. Home-Based Labor",
        historyYear: "1700s",
        historyText: "The Putting-Out system dominates; families spin thread and weave cloth inside their cottages.",
        modernYear: "1990s",
        modernText: "The internet and dial-up email make telecommuting technically viable for select white-collar niches."
      },
      {
        stage: "2. The Centralization Shift",
        historyYear: "1790s",
        historyText: "Centralized water-wheels and steam factories require workers to leave home and operate heavy looms.",
        modernYear: "2020",
        modernText: "COVID-19 pandemic forces an overnight global migration from office skyscrapers back to home offices."
      },
      {
        stage: "3. Friction & Battle",
        historyYear: "1840s",
        historyText: "Struggles over working hours, child labor bans, and the establishment of the rigid 10-hour day.",
        modernYear: "2021-23",
        modernText: "Return-to-Office mandates spark major friction between traditional management and flexible workers."
      },
      {
        stage: "4. The New Standard",
        historyYear: "1950s",
        historyText: "White-collar office culture reaches its peak with suburban campuses and standard corporate commutes.",
        modernYear: "Present",
        modernText: "Hybrid setups stabilize as the default; office properties adapt, and suburban/regional towns experience growth."
      }
    ]
  },
  social: {
    id: "social",
    title: "Social Media",
    icon: "social",
    category: "Media",
    historicalEvent: "The Yellow Journalism Era",
    historicalPeriod: "Late 19th Century",
    summary: "The attention-monetizing algorithms and hyper-polarized echo chambers of social media parallel the fierce circulation wars of the 'Yellow Press' that relied on sensationalism, outrage, and fabrication.",
    whatHappened: "In the 1890s, newspaper barons Joseph Pulitzer and William Randolph Hearst engaged in a relentless circulation war. They discovered that sensationalism, exaggerated headlines, emotional crusades, and manufactured gossip sold far more copies than dry facts. This 'Yellow Journalism' stoked intense public outrage and directly whipped up patriotic frenzy, contributing to the US declaration of war in the Spanish-American War of 1898. Public backlash eventually led to the development of modern objective journalism standards.",
    similarities: [
      "Business models driven strictly by capturing and selling human attention to advertisers.",
      "The systemic amplification of outrage, polarization, and conspiracy theories to keep readers engaged.",
      "The decay of a shared consensus of reality and trust in traditional information gatekeepers."
    ],
    differences: [
      "Scale & Personalization: Yellow newspapers printed one or two daily editions for the mass public; social networks use algorithms to serve hyper-personalized feeds in real-time.",
      "Publishing Democratization: The 1890s press was controlled by a few wealthy publishers. Today, any user can publish, though algorithms act as the algorithmic gatekeeper.",
      "Synthetic Content: Modern media suffers from AI deepfakes and automated bot farms, whereas yellow press fabrications were created by human staff writers."
    ],
    lessonsLearned: [
      "Outrage-based business models inevitably destabilize social cohesion and democratic institutions if left completely unchecked.",
      "Information literacy must adapt. Just as readers learned to recognize sensationalist tabloids, modern users must learn to spot algorithmic manipulation.",
      "Backlashes eventually create standard norms. The excesses of the yellow press led to the creation of professional codes of ethics and journalism schools."
    ],
    takeaways: [
      "Audit your attention: If a feed makes you feel sudden anger or self-doubt, recognize that it is designed to elicit that reaction to keep you scrolling.",
      "Diversify your sources: Intentionally seek out long-form, fact-checked, and non-algorithmic writing to anchor your worldview."
    ],
    timeline: [
      {
        stage: "1. Media Expansion",
        historyYear: "1880s",
        historyText: "High-speed printing presses and cheap wood-pulp paper make mass-market newspapers extremely cheap.",
        modernYear: "2004-06",
        modernText: "Web 2.0 social networking platforms (Facebook, Twitter) launch, enabling cheap global publishing."
      },
      {
        stage: "2. Outrage Monetization",
        historyYear: "1895",
        historyText: "Hearst buys the NY Journal, initiating a hyper-sensationalist battle with Pulitzer's World.",
        modernYear: "2012",
        modernText: "Platforms implement engagement-based feeds, introducing likes, shares, and algorithmic outrage amplification."
      },
      {
        stage: "3. Crises of Trust",
        historyYear: "1898",
        historyText: "Exaggerated reports on the USS Maine sinking whip up public fury, accelerating the Spanish-American War.",
        modernYear: "2016-20",
        modernText: "Disinformation networks, clickbait mills, and algorithmic filter bubbles affect major elections worldwide."
      },
      {
        stage: "4. Reforms & Standards",
        historyYear: "1910s",
        historyText: "Public backlash forces newspapers to adopt objective standards, leading to the rise of independent fact-checking and the Pulitzer Prizes.",
        modernYear: "Present",
        modernText: "Short-form algorithmic video (TikTok) and generative AI deepfakes saturate feeds; regulatory pushes for platform accountability begin."
      }
    ]
  },
  crypto: {
    id: "crypto",
    title: "Cryptocurrency Boom",
    icon: "crypto",
    category: "Finance",
    historicalEvent: "The South Sea Bubble",
    historicalPeriod: "1720",
    summary: "The speculative surges, ICO booms, and rapid collapses in decentralized tokens mirror the South Sea Bubble of 1720, where the novelty of joint-stock companies sparked mass retail FOMO and financial ruin.",
    whatHappened: "In the early 1700s, the South Sea Company was granted a monopoly on British trade with South America. Despite completing virtually no trading voyages, the directors pumped up the stock price using insider trading, loans to buyers, and grand promises. Swept up in the novelty of 'joint-stock shares,' the public entered a speculative frenzy. Hundreds of copycat companies sprouted up, promising impossible schemes. When the bubble burst, the stock crashed back to a fraction of its value, bankrupting thousands (including Sir Isaac Newton) and leading to the Bubble Act of 1721.",
    similarities: [
      "Speculative manias powered by a new, poorly understood financial vehicle (joint-stock shares then; tokens and smart contracts now).",
      "The proliferation of copycat schemes, 'rug pulls,' and shell projects built solely to capture speculative capital.",
      "Retail FOMO: Panic buying sweeping through all levels of society, driven by stories of overnight fortunes."
    ],
    differences: [
      "State Shifts: The South Sea Company had deep ties to the British government and took on national debt. Cryptocurrencies are decentralized and exist outside traditional state frameworks.",
      "Technological Ledger: Crypto relies on cryptographically secured block ledgers; 18th-century shares were hand-written ledger entries in London offices.",
      "Borderless Access: Crypto operates 24/7 globally; South Sea trading was physically centralized in London's Exchange Alley."
    ],
    lessonsLearned: [
      "Financial innovation that lacks underlying utility, cash flows, or economic output will eventually crash back to its true value (often zero).",
      "Celebrity and elite endorsements are lagging indicators of an asset's validity and are often funded by insider manipulation.",
      "Markets require clear rules and disclosures to protect participants; clean liquidity will eventually flee unregulated spaces."
    ],
    takeaways: [
      "Beware the 'Hype-Premium': If the core justification for buying an asset is that 'the price will go up,' you are playing a game of greater fools.",
      "Understand the yield source: If you cannot clearly explain where the returns are generated, the returns are coming from your own capital."
    ],
    timeline: [
      {
        stage: "1. Innovation Launch",
        historyYear: "1711",
        historyText: "South Sea Company is chartered to consolidate Britain's war debt in exchange for trading rights.",
        modernYear: "2009",
        modernText: "Satoshi Nakamoto launches Bitcoin, creating the first decentralized ledger system."
      },
      {
        stage: "2. The Mania Peak",
        historyYear: "Jan-Aug 1720",
        historyText: "South Sea stock skyrockets from £128 to £1,000; copycat 'bubble' companies raise capital for absurd projects.",
        modernYear: "2017/2021",
        modernText: "Massive crypto bull runs; ICOs, NFTs, and altcoins explode in valuation, endorsed by global celebrities."
      },
      {
        stage: "3. The Crash",
        historyYear: "Sept 1720",
        historyText: "Directors sell their shares; panic ensues and the stock collapses, wiping out fortunes and causing bank failures.",
        modernYear: "2022",
        modernText: "Stablecoins depeg, major lending platforms freeze funds, and FTX collapses, exposing massive leverage fraud."
      },
      {
        stage: "4. Post-Crash Rules",
        historyYear: "1721",
        historyText: "Parliament prosecutes directors, confiscates their estates to compensate victims, and passes the Bubble Act to ban unauthorized public firms.",
        modernYear: "Present",
        modernText: "Regulators enforce securities laws; mainstream financial firms launch approved Bitcoin and Ethereum ETFs."
      }
    ]
  },
  green: {
    id: "green",
    title: "Green Transition",
    icon: "green",
    category: "Infrastructure",
    historicalEvent: "The Horse-to-Automobile Transition",
    historicalPeriod: "1900 – 1920",
    summary: "The shift from fossil-fuel engines to electric vehicles faces the exact range anxiety, charging infrastructure bottlenecks, and supply chain updates seen during the transition from horse transport to automobiles.",
    whatHappened: "In 1900, cities relied on horse-drawn carriages. This created immense sanitary crises: NY streets were buried in millions of pounds of manure daily. Early gasoline cars were dismissed as loud, unreliable, expensive toys for the wealthy. They had no fueling infrastructure (gasoline had to be purchased in tin cans at pharmacies). However, within two decades, the mass production of the Ford Model T, public infrastructure investments (roads, gas stations), and city sanitization policies drove horses off urban streets entirely.",
    similarities: [
      "Severe infrastructure bottlenecks: early cars had no gas stations; EVs suffer from charging network gaps.",
      "Range and reliability anxiety: early drivers feared breaking down in rural areas; EV drivers worry about battery capacity.",
      "A regulatory push driven by environmental and sanitation emergencies (horse manure diseases then; carbon emissions now)."
    ],
    differences: [
      "Utility Leap: The automobile offered a radical leap in speed, distance, and capability. EVs provide the same basic transport utility as internal combustion engines.",
      "Government Interventions: The horse-to-car shift was largely driven by market efficiency and urban sanitation. The EV transition is heavily accelerated by state mandates and subsidies.",
      "Electrical Grid Impact: Charging fleets of EVs requires enormous upgrades to physical power grids, whereas cars only required petroleum tank storage."
    ],
    lessonsLearned: [
      "Infrastructure is the true gatekeeper of any mobility transition. The vehicle is only as useful as the network supporting it.",
      "Cost parity is the tipping point. Transition rates explode when the new technology becomes cheaper to manufacture and buy than the old.",
      "Supply chains must adapt structurally. The blacksmiths and stable owners who adapted became the auto mechanics and dealerships of the new age."
    ],
    takeaways: [
      "Look at the grid: The success of green energy rests on transmission, storage, and generating capacity. Invest attention in the infrastructure layer rather than just consumer brands.",
      "Expect a messy transition: Hybrid steps (gas/electric) represent a logical bridge while raw grid capacity catches up to demand."
    ],
    timeline: [
      {
        stage: "1. Old Norm Crisis",
        historyYear: "1900",
        historyText: "Horses dominate cities; NYC's 100,000 horses generate massive environmental and health hazards on streets.",
        modernYear: "2008",
        modernText: "Tesla releases the Roadster, demonstrating that electric cars can match luxury sports car performance."
      },
      {
        stage: "2. Mass Production",
        historyYear: "1908",
        historyText: "Henry Ford introduces the Model T, dramatically lowering the cost of cars for middle-class consumers.",
        modernYear: "2017",
        modernText: "Tesla launches the Model 3, starting the race for mass-market electric vehicle adoption."
      },
      {
        stage: "3. Infrastructure Build",
        historyYear: "1913",
        historyText: "Ford deploys the moving assembly line; dedicated gasoline stations begin replacing pharmacies.",
        modernYear: "2021-23",
        modernText: "Governments announce bans on gasoline car sales by 2035; charging network networks receive billions in public funding."
      },
      {
        stage: "4. The New Normal",
        historyYear: "1920",
        historyText: "Horses are phased out of major cities; auto ownership in the United States exceeds 8 million vehicles.",
        modernYear: "Present",
        modernText: "EV adoption hits a capital-intensive plateau; hybrid vehicle sales surge as a practical transitional compromise."
      }
    ]
  }
};

// Premium SVG icon component renderer
const renderPremiumIcon = (iconKey, className = "w-5 h-5") => {
  switch (iconKey) {
    case "ai":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h0zM9 9h6v6H9V9z" />
        </svg>
      );
    case "economic":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    case "remote":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case "social":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    case "crypto":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "green":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    default:
      // Generic history scroll icon fallback
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
  }
};

// Loading steps for animation
const LOADING_STEPS = [
  "Scanning historical archives...",
  "Consulting the Groq Knowledge Base...",
  "Retrieving comparative case studies...",
  "Cross-referencing societal parameters...",
  "Analyzing labor and capital variables...",
  "Synthesizing similarities and differences...",
  "Drafting lessons learned and takeaways...",
  "Structuring comparative timeline..."
];

const TOOL_STATUS = "live"; // Set to "live" to deploy and enable routing

export default function HistoryRepeatsPage() {
  if (TOOL_STATUS === "upcoming") {
    return <ComingSoon toolName="History Repeats" />;
  }

  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [result, setResult] = useState(null);
  
  // LLM states
  const [source, setSource] = useState(""); // "Groq API" or "Local fallback"
  const [error, setError] = useState("");
  
  // Custom topic matched indicator
  const [matchMethod, setMatchMethod] = useState(""); // "exact", "fuzzy", "none"
  const [showSelector, setShowSelector] = useState(false);
  
  // Toast notifications
  const [toast, setToast] = useState({ type: "", message: "" });
  const toastTimerRef = useRef(null);
  const loadingTimerRef = useRef(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "History Repeats | Boring Tools";
    return () => {
      document.title = previousTitle;
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (loadingTimerRef.current) window.clearInterval(loadingTimerRef.current);
    };
  }, []);

  const showToast = (type, message) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast({ type, message });
    toastTimerRef.current = window.setTimeout(() => {
      setToast({ type: "", message: "" });
    }, 2000);
  };

  // Run the search matching logic
  const handleAnalyze = async (inputTopic) => {
    const topicToSearch = inputTopic || query;
    const trimmed = topicToSearch.trim();

    if (!trimmed) {
      showToast("error", "Please enter a topic or select a preset.");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setMatchMethod("");
    setShowSelector(false);
    setError("");
    setSource("");
    setLoadingStepIndex(0);

    // Simulate search loading cycle
    let step = 0;
    if (loadingTimerRef.current) window.clearInterval(loadingTimerRef.current);
    loadingTimerRef.current = window.setInterval(() => {
      step = (step + 1) % LOADING_STEPS.length;
      setLoadingStepIndex(step);
    }, 250);

    try {
      const response = await fetch("/api/history-repeats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: trimmed })
      });

      if (loadingTimerRef.current) {
        window.clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }

      const payload = await response.json();

      if (response.ok && payload.historicalEvent && payload.timeline) {
        setResult(payload);
        setSource("Groq API");
        setMatchMethod("exact");
        setActiveQuery(topicToSearch);
        setIsLoading(false);
        showToast("success", `Matched to: ${payload.historicalEvent} via AI`);
        return;
      }

      // API returned error or incomplete structure, run fallback
      runLocalFallback(topicToSearch, payload?.error || "Invalid response format");
    } catch (err) {
      if (loadingTimerRef.current) {
        window.clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
      runLocalFallback(topicToSearch, "API request failed");
    }
  };

  // Local fallback parsing
  const runLocalFallback = (topicToSearch, reason) => {
    const trimmed = topicToSearch.trim().toLowerCase();
    
    // Keyword maps
    const keywordMap = {
      ai: ["ai", "artificial intelligence", "chatgpt", "llm", "machine learning", "robot", "algorithm", "automation", "openai", "claude", "gemini", "copilot"],
      economic: ["economic", "crisis", "depression", "inflation", "recession", "market", "crash", "bank", "railroad", "finance", "debt", "leverage", "rates", "interest"],
      remote: ["remote", "work", "wfh", "office", "telecommute", "home office", "cottage", "centralization", "commute", "zoom", "hybrid"],
      social: ["social", "media", "facebook", "twitter", "tiktok", "instagram", "youtube", "news", "journalism", "sensationalism", "clickbait", "outrage", "polarization", "hearst", "pulitzer"],
      crypto: ["crypto", "bitcoin", "ethereum", "blockchain", "token", "nft", "speculation", "bubble", "tulip", "south sea", "ftx", "coin"],
      green: ["green", "ev", "electric", "climate", "solar", "wind", "transition", "carbon", "horse", "car", "tesla", "engine", "grid", "infrastructure"]
    };

    // Check exact / key matches
    let matchedKey = null;
    let isExact = false;

    if (COMPARISONS[trimmed]) {
      matchedKey = trimmed;
      isExact = true;
    } else {
      for (const [key, keywords] of Object.entries(keywordMap)) {
        if (keywords.some(kw => trimmed.includes(kw))) {
          matchedKey = key;
          break;
        }
      }
    }

    setActiveQuery(topicToSearch);
    setSource("Local fallback");
    setError(`${reason ? `LLM issue (${reason}). ` : ""}Loaded local offline comparison database.`);
    setIsLoading(false);

    if (matchedKey) {
      setResult(COMPARISONS[matchedKey]);
      setMatchMethod(isExact ? "exact" : "fuzzy");
      showToast("success", `Analysis generated (local fallback): ${COMPARISONS[matchedKey].historicalEvent}`);
    } else {
      setMatchMethod("none");
      setShowSelector(true);
      showToast("warning", "Offline: no direct local match. Select an analogy below.");
    }
  };

  const handleLoadPreset = (key) => {
    setQuery(COMPARISONS[key].title);
    handleAnalyze(COMPARISONS[key].title);
  };

  const handleClear = () => {
    setQuery("");
    setActiveQuery("");
    setResult(null);
    setMatchMethod("");
    setShowSelector(false);
    setSource("");
    setError("");
    showToast("success", "Cleared inputs.");
  };

  // Compile analysis report as a formatted Markdown text block
  const generateReportText = useMemo(() => {
    if (!result) return "";

    const divider = "==================================================";
    return `HISTORY REPEATS REPORT
Topic Analogy: ${activeQuery} vs. ${result.historicalEvent}
Source: ${source}
${divider}

[1] SIMILAR HISTORICAL EVENT
Event Name: ${result.historicalEvent}
Historical Period: ${result.historicalPeriod}
Overview: 
${result.summary}

[2] WHAT HAPPENED THEN
${result.whatHappened}

[3] SIMILARITIES BETWEEN THEN & NOW
${result.similarities.map((item, index) => `${index + 1}. ${item}`).join("\n")}

[4] KEY DIFFERENCES
${result.differences.map((item, index) => `${index + 1}. ${item}`).join("\n")}

[5] LESSONS LEARNED
${result.lessonsLearned.map((item, index) => `• ${item.charAt(0).toUpperCase() + item.slice(1)}`).join("\n")}

[6] KEY TAKEAWAYS (FOR YOU)
${result.takeaways.map((item, index) => `• ${item}`).join("\n")}

${divider}
COMPARATIVE TIMELINE
${result.timeline.map(t => `
Stage: ${t.stage}
- History (${t.historyYear}): ${t.historyText}
- Present (${t.modernYear}): ${t.modernText}
`).join("\n")}
${divider}
`;
  }, [result, activeQuery, source]);

  // Copy report function
  const handleCopyReport = async () => {
    if (!generateReportText) return;
    try {
      await navigator.clipboard.writeText(generateReportText);
      showToast("success", "Analysis report copied to clipboard!");
    } catch (err) {
      showToast("error", "Failed to copy report to clipboard.");
    }
  };

  // Download report function
  const handleDownloadReport = () => {
    if (!generateReportText || typeof window === "undefined") return;
    
    const blob = new Blob([generateReportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const sanitizedTitle = activeQuery.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    link.download = `history-repeats-${sanitizedTitle || "analysis"}-report.txt`;
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("success", "Analysis report downloaded.");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-10 sm:py-14">
      {/* Toast Notification */}
      {toast.message && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 animate-bounce transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : toast.type === "error"
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}
        >
          {toast.type === "success" && (
            <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === "error" && (
            <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {toast.type === "warning" && (
            <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      <div className="mx-auto max-w-6xl">
        {/* Tool Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Tool 76
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
            History Repeats
          </h1>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Understand how modern topics or situations resemble major historical events. Uncover structural patterns, extract timeless lessons, and explore parallel timelines.
          </p>
        </div>

        {/* Dashboard grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Inputs and Search */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-700 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Define Situation</span>
              </h2>
              
              {/* Input Form */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="topic-input" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Modern Topic or Situation
                  </label>
                  <input
                    id="topic-input"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. AI Revolution, Remote Work, Crypto..."
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-amber-400 focus:outline-none transition placeholder-slate-400 text-slate-900"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAnalyze()}
                    disabled={isLoading}
                    className="flex-1 rounded-xl bg-slate-900 hover:bg-black font-semibold text-white text-sm py-3 px-4 shadow transition active:scale-[0.98] disabled:bg-slate-300 cursor-pointer text-center"
                  >
                    Analyze
                  </button>
                  <button
                    onClick={handleClear}
                    className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-600 text-sm py-3 px-4 transition active:scale-[0.98] cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Presets Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">Or Load Preset</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              {/* Preset buttons */}
              <div className="grid grid-cols-2 gap-2">
                {Object.values(COMPARISONS).map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => handleLoadPreset(comp.id)}
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-amber-50 hover:border-amber-200 text-center transition group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-white shadow-sm border border-slate-100 group-hover:bg-amber-100/50 group-hover:border-amber-200 transition mb-2">
                      {renderPremiumIcon(comp.icon, "w-6 h-6 text-slate-600 group-hover:text-amber-800 transition")}
                    </div>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-amber-800">{comp.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Explainer Sidebar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">Why analyze history?</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-2">
                Mark Twain famously noted that while history doesn&apos;t repeat itself, it often rhymes. Throughout time, human responses to technological leaps, financial booms, and labor shifts remain remarkably consistent. Cross-referencing past patterns helps strip away modern hype and panic, revealing the predictable milestones ahead.
              </p>
            </div>
          </div>

          {/* Right Panel: Results and Timelines */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Empty State */}
            {!isLoading && !result && !showSelector && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[420px]">
                <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mb-4 animate-pulse">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Awaiting your query</h3>
                <p className="text-sm text-slate-500 max-w-sm mt-2 leading-relaxed">
                  Enter a modern trend or crisis on the left or select a preset to analyze its historical equivalent.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mt-8 text-left">
                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex items-start gap-2.5">
                    <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <span className="text-slate-700 text-sm font-bold block mb-0.5">Analogous Events</span>
                      <span className="text-slate-500 text-[11px] leading-normal block">Maps modern trends to concrete historical equivalents.</span>
                    </div>
                  </div>
                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex items-start gap-2.5">
                    <svg className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <div>
                      <span className="text-slate-700 text-sm font-bold block mb-0.5">Similarities & Diff</span>
                      <span className="text-slate-500 text-[11px] leading-normal block">Deconstructs key variables, patterns, and divergences.</span>
                    </div>
                  </div>
                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex items-start gap-2.5">
                    <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <span className="text-slate-700 text-sm font-bold block mb-0.5">Comparative Timelines</span>
                      <span className="text-slate-500 text-[11px] leading-normal block">Aligns past milestones side-by-side with modern ones.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Loading State */}
            {isLoading && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[420px]">
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-100 animate-pulse"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Accessing Archives</h3>
                <p className="text-sm text-slate-500 max-w-sm mt-2 animate-pulse h-12">
                  {LOADING_STEPS[loadingStepIndex]}
                </p>
              </div>
            )}

            {/* 3. Selector Panel (When no direct match found) */}
            {!isLoading && showSelector && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                <div className="text-center max-w-md mx-auto space-y-2">
                  <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-955">Select Historical Analogy</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    We couldn&apos;t automatically match &ldquo;{activeQuery}&rdquo; to a single historical parallel. Choose from our curated database to map your topic:
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.values(COMPARISONS).map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => {
                        setResult(comp);
                        setShowSelector(false);
                        setMatchMethod("fuzzy");
                        setSource("Local fallback");
                        showToast("success", `Loaded parallel: ${comp.historicalEvent}`);
                      }}
                      className="p-4 rounded-xl border border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/30 text-left transition space-y-3 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 group-hover:bg-amber-100 rounded-xl transition border border-slate-100 group-hover:border-amber-200">
                          {renderPremiumIcon(comp.icon, "w-6 h-6 text-slate-600 group-hover:text-amber-800 transition")}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-amber-800 text-sm">{comp.title}</h4>
                          <span className="text-[10px] uppercase font-bold text-slate-400">{comp.category}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 leading-normal line-clamp-2">
                        Compare to <span className="font-semibold text-slate-700">{comp.historicalEvent}</span>: {comp.summary}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Results Section */}
            {!isLoading && result && (
              <div className="space-y-6">
                
                {/* Results Header Panel */}
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
                      <span>Historical Analogy Loaded</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        {source === "Groq API" ? (
                          <>
                            <svg className="w-3.5 h-3.5 text-amber-700 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                            </svg>
                            AI Generated
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Local Fallback
                          </>
                        )}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-955 mt-1">
                      Modern Topic: &ldquo;{activeQuery}&rdquo;
                    </h3>
                  </div>
                  <div className="shrink-0 flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleCopyReport}
                      className="flex-1 sm:flex-initial text-center justify-center inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow transition active:scale-[0.98] cursor-pointer"
                    >
                      <svg className="w-4 h-4 mr-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Copy Report
                    </button>
                    <button
                      onClick={handleDownloadReport}
                      className="flex-1 sm:flex-initial text-center justify-center inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-amber-400 bg-white hover:bg-amber-50/50 text-amber-700 text-xs font-bold shadow transition active:scale-[0.98] cursor-pointer"
                    >
                      <svg className="w-4 h-4 mr-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Report
                    </button>
                  </div>
                </div>

                {/* Error Banner if Fallback is Active */}
                {error && (
                  <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200/60 rounded-xl p-3.5 flex flex-col gap-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-amber-700">Offline Fallback Engaged</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Main Event Comparison Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl">
                      {renderPremiumIcon(result.icon || "default", "w-8 h-8 text-amber-600")}
                    </div>
                    <div>
                      <h4 className="text-xs uppercase font-bold text-amber-600 tracking-wider">Similar Historical Event</h4>
                      <h3 className="text-lg font-black text-slate-955">{result.historicalEvent}</h3>
                      <span className="text-xs text-slate-500 font-semibold">{result.historicalPeriod}</span>
                    </div>
                  </div>
                  <hr className="border-slate-100" />
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {result.summary}
                  </p>
                </div>

                {/* Grid for What Happened & Similarities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Card 2: What Happened Then */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3.5">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <svg className="w-4.5 h-4.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      What Happened Then
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {result.whatHappened}
                    </p>
                  </div>

                  {/* Card 3: Similarities */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3.5">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <svg className="w-4.5 h-4.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Similarities
                    </h4>
                    <ul className="space-y-2.5">
                      {result.similarities.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                          <span className="text-amber-500 shrink-0 select-none mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Grid for Differences & Lessons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Card 4: Differences */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3.5">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <svg className="w-4.5 h-4.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3-1M9 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M12 7l3-1m-3 1v12m-9-4h18" />
                      </svg>
                      Differences
                    </h4>
                    <ul className="space-y-2.5">
                      {result.differences.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                          <span className="text-slate-400 shrink-0 select-none mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card 5: Lessons Learned */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3.5">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <svg className="w-4.5 h-4.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                      </svg>
                      Lessons Learned
                    </h4>
                    <ul className="space-y-2.5">
                      {result.lessonsLearned.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                          <span className="text-amber-600 shrink-0 font-bold select-none">!</span>
                          <span>{item.charAt(0).toUpperCase() + item.slice(1)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card 6: Key Takeaways (Individual Level) */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <svg className="w-4.5 h-4.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Personal Takeaways
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {result.takeaways.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed space-y-1">
                        <span className="text-amber-700 font-bold block">Action {idx + 1}</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Timeline Section */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                  <div className="text-center max-w-sm mx-auto">
                    <h4 className="text-xs uppercase font-bold text-amber-600 tracking-wider">Milestones Mapping</h4>
                    <h3 className="text-lg font-black text-slate-905">Comparative Timeline</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Cross-referencing historical epochs against modern counterparts</p>
                  </div>

                  {/* Vertical Timeline Track */}
                  <div className="relative border-l-2 border-dashed border-slate-200 pl-4 sm:pl-8 ml-2 sm:ml-4 space-y-8 py-2">
                    {result.timeline.map((item, idx) => (
                      <div key={idx} className="relative space-y-2">
                        
                        {/* Circle Indicator */}
                        <div className="absolute -left-[23px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 border-amber-500 bg-white flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                        </div>

                        {/* Stage Title */}
                        <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-50 border border-amber-100 rounded px-2.5 py-0.5 inline-block">
                          {item.stage}
                        </h4>

                        {/* Side by side timeline content grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Historical Node */}
                          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                              </svg>
                              <span>Historical Event</span>
                              <span>•</span>
                              <span className="text-slate-500">{item.historyYear}</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                              {item.historyText}
                            </p>
                          </div>

                          {/* Modern Counterpart Node */}
                          <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/10 space-y-1">
                            <div className="text-[10px] uppercase font-bold text-amber-600 flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                              </svg>
                              <span>Modern Counterpart</span>
                              <span>•</span>
                              <span className="text-amber-700">{item.modernYear}</span>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed font-medium">
                              {item.modernText}
                            </p>
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
