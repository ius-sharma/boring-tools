"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ComingSoon from "@/app/components/ComingSoon";

// Curated database containing structured educational historical comparison data
const DATASET = {
  "artificial-intelligence": {
    id: "artificial-intelligence",
    title: "Artificial Intelligence & Job Automation",
    modernSituation: "The rise of Large Language Models (LLMs) and advanced robotics is transforming both cognitive and manual labor, automating creative roles, software engineering, decision-making, and physical tasks.",
    similarHistoricalEvents: [
      {
        name: "The First Industrial Revolution",
        period: "Late 18th to mid-19th Century",
        description: "The transition from handloom weaving and artisan crafting to steam-powered factories and mechanized manufacturing."
      },
      {
        name: "The Computer Revolution",
        period: "Mid to late 20th Century",
        description: "The introduction of mainframes and personal computers, automating manual bookkeeping, calculations, and typesetting."
      },
      {
        name: "The Printing Press",
        period: "15th Century",
        description: "Gutenberg's mechanical printing press replaced hand-copied manuscripts by scribes, democratizing information distribution."
      },
      {
        name: "The Internet Boom",
        period: "1990s to 2000s",
        description: "Global web networks automated retail channels, travel agencies, directory services, and publishing."
      }
    ],
    whySimilar: "Both involve a fundamental transition in the primary engine of productivity (physical muscle to steam engines; cognitive decision-making to digital algorithms), creating massive anxiety over widespread structural unemployment.",
    whatHappenedThen: "Initial displacement caused severe wage stagnation and social unrest. However, the efficiency gains lowered costs, boosted consumer demand, and created entirely new industries (engineering, services, transport) that ultimately hired more workers than were displaced.",
    whatChanged: "Society adapted by outlawing child labor, implementing the 8-hour workday, establishing public education systems to re-skill populations, and forming labor unions to secure a share of productivity gains.",
    lessonsLearned: [
      "Technology shifts are historically irreversible; policies that focus on re-training and safety nets succeed, while banning automation fails.",
      "Regulatory frameworks (like safety standards and labor codes) must be implemented early to buffer the transition.",
      "Equitable distribution of productivity gains is essential to prevent severe political and wealth polarization."
    ],
    commonReactions: [
      {
        type: "Fear",
        historicalExample: "Artisans feared they would become obsolete and starve as machines outproduced them 10-fold.",
        modernCounterpart: "Writers, coders, and designers worrying that generative models will render their years of study useless."
      },
      {
        type: "Resistance",
        historicalExample: "The Luddites organized secret societies to smash mechanical textile frames in Northern England (1811-1816).",
        modernCounterpart: "Creative unions striking over AI training sets, copyright lawsuits, and demands to ban AI tools from projects."
      },
      {
        type: "Innovation",
        historicalExample: "Artisans adapted by inventing auxiliary systems, like patterns for Jacquard looms, creating early programming.",
        modernCounterpart: "Developers building prompt interfaces, AI-integrations, and customized fine-tuned models."
      },
      {
        type: "Adaptation",
        historicalExample: "Hand-weavers shifted to factory supervisors, machine maintenance technicians, and logistics managers.",
        modernCounterpart: "Professionals shifting to 'AI-assisted' workflows, acting as editors and directors rather than manual creators."
      }
    ],
    timeline: [
      {
        stage: "Historical Event",
        detail: "James Watt refines the steam engine (1776), paving the way for factory mechanization."
      },
      {
        stage: "Public Reaction",
        detail: "Luddite groups smash mechanical looms in England (1811) in fear of starvation and wage cuts."
      },
      {
        stage: "Major Change",
        detail: "The Factory Act of 1833 establishes the first limits on child labor and mandates safety inspections."
      },
      {
        stage: "Long-Term Outcome",
        detail: "Massive expansion of the middle class, public schools, and a transition to high-productivity office and service careers."
      }
    ],
    similarities: [
      "Concentration of massive infrastructure capital in a few corporate/industrial owners.",
      "An initial wave of jobs being hollowed out, creating transition pain for older workers.",
      "Rapid reduction in the unit cost of delivering products and services."
    ],
    differences: [
      "Physical vs. Cognitive: The Industrial Revolution automated muscle power, whereas AI automates cognitive reasoning and creative work.",
      "Deployment Speed: Steam engines took decades to diffuse globally; software tools deploy worldwide in seconds.",
      "Marginal Costs: Building a physical factory requires massive constant capital; software replication has near-zero marginal cost."
    ],
    historicalInsight: "History suggests that fighting the speed of automation is futile. Instead, focus should be placed on creating robust re-skilling channels and adjusting tax structures to distribute productivity dividends.",
    perspectiveScore: {
      economicImpact: 95,
      socialImpact: 88,
      technologicalChange: 98,
      humanAdaptation: 80,
      longTermSignificance: 95
    }
  },
  "remote-work": {
    id: "remote-work",
    title: "Remote Work & Workplace Decentralization",
    modernSituation: "Portable computers and high-speed internet allow white-collar employees to decouple their physical residence from their employer's headquarters, decentralizing the workplace.",
    similarHistoricalEvents: [
      {
        name: "The Cottage Industry (Putting-Out System)",
        period: "17th to 18th Century",
        description: "Before factories, merchants distributed raw materials to rural families who spun wool and wove textiles inside their own homes on their own schedules."
      },
      {
        name: "The Industrial Centralization Shift",
        period: "19th Century",
        description: "The invention of heavy steam engines forced workers to leave their homes and gather in centralized factory halls to share power."
      },
      {
        name: "The Suburban Commute Boom",
        period: "1950s",
        description: "Highway systems and passenger cars created the daily commute, dividing life into strict suburban residential zones and urban commercial cores."
      }
    ],
    whySimilar: "This involves shifts in where labor is performed, battles between schedule autonomy and managerial surveillance, and the redistribution of commerce from urban centers to surrounding neighborhoods.",
    whatHappenedThen: "The transition from the home-centric cottage industry to centralized factories destroyed worker control over their daily schedules, introduced rigid work shifts, and established clock-in tracking.",
    whatChanged: "Society structured standard workdays, built transit systems, and commercial real estate focused on central skyscrapers. Modern remote work is a technological reversal, shifting work back to domestic spaces.",
    lessonsLearned: [
      "Workplace location is dictated by the portability of tools. When tools become fully digital, centralization becomes a choice rather than a necessity.",
      "Blurring home and office boundaries triggers psychological burnout, requiring self-imposed boundary systems.",
      "Decentralized labor sparks local economic growth in smaller suburbs and regional towns, reducing urban crowding."
    ],
    commonReactions: [
      {
        type: "Fear",
        historicalExample: "Early factory managers feared that unsupervised cottage workers would steel materials or slack off.",
        modernCounterpart: "Executives fearing that remote workers are multi-tasking or slacking, leading to calls for surveillance."
      },
      {
        type: "Resistance",
        historicalExample: "Cottage weavers resisted moving to cities, forcing early mill owners to use strict contracts and company housing.",
        modernCounterpart: "Strict Return-to-Office (RTO) mandates and badges-tracked attendance policies."
      },
      {
        type: "Innovation",
        historicalExample: "Merchants created decentralized coordination routes and standard textile specifications.",
        modernCounterpart: "Development of Zoom, Slack, asynchronous planning software, and cloud infrastructure."
      },
      {
        type: "Adaptation",
        historicalExample: "Weavers learned to utilize specialized domestic looms and balance agricultural seasons with texturing.",
        modernCounterpart: "Employees establishing dedicated home offices, working flexible hours, and co-working."
      }
    ],
    timeline: [
      {
        stage: "Historical Event",
        detail: "Steam engines require shared energy, forcing cottage workers into centralized factory halls (1800)."
      },
      {
        stage: "Public Reaction",
        detail: "Workers protest the loss of personal autonomy, long commutes, and rigid clock-in systems (1830s)."
      },
      {
        stage: "Major Change",
        detail: "Cities invest in mass public transit (subways, streetcars) and establish commercial office zoning."
      },
      {
        stage: "Long-Term Outcome",
        detail: "The creation of the 9-to-5 desk job, suburban bedroom communities, and office-dominated city centers."
      }
    ],
    similarities: [
      "Conflicts between workers requesting autonomy and management demanding direct surveillance.",
      "The blurring of home/domestic life and professional output.",
      "Redistribution of local economic spend away from corporate zones to neighborhood businesses."
    ],
    differences: [
      "Real-time Coordination: Pre-industrial cottage workers were isolated; modern remote workers use instant video and chat networks.",
      "Work Nature: Cottage industry was physical manufacturing; remote work is digital information processing.",
      "Scale: Modern remote work spans global networks, allowing borderless hiring."
    ],
    historicalInsight: "History suggests that as tooling becomes decentralized, rigid office requirements face irreversible pressure. Businesses that adapt their metrics to output-oriented evaluation outperform those relying on physical presence.",
    perspectiveScore: {
      economicImpact: 75,
      socialImpact: 85,
      technologicalChange: 78,
      humanAdaptation: 85,
      longTermSignificance: 80
    }
  },
  "inflation": {
    id: "inflation",
    title: "Inflation & Rising Prices",
    modernSituation: "Supply chain disruptions, monetary expansions, and geopolitical conflicts trigger sudden spikes in the cost of consumer goods, eroding buying power.",
    similarHistoricalEvents: [
      {
        name: "The 1970s Great Inflation",
        period: "1973 to 1982",
        description: "Oil embargoes combined with loose monetary policies caused persistent double-digit price increases."
      },
      {
        name: "Weimar Hyperinflation",
        period: "1921 to 1923",
        description: "The German government printed massive quantities of paper marks to pay war reparations, rendering currency worthless."
      },
      {
        name: "The Spanish Price Revolution",
        period: "16th Century",
        description: "Floods of silver and gold from the Americas debased the value of specie across Europe, driving up commodity prices."
      },
      {
        name: "Roman Currency Debasement",
        period: "3rd Century CE",
        description: "Emperors gradually reduced the silver content of denarius coins to fund military campaigns, triggering empire-wide price hikes."
      }
    ],
    whySimilar: "Both represent a mismatch between the supply of circulating currency and the availability of tangible goods, often exacerbated by resource shocks.",
    whatHappenedThen: "Savings were decimated, wages struggled to keep pace, and hoarding began. In extreme cases, hyperinflation caused complete societal breakdowns and political extremism.",
    whatChanged: "Governments established independent central banks, adopted formal inflation targets, indexed wages to price indices, and created fiat frameworks to regulate liquidity.",
    lessonsLearned: [
      "Inflation acts as a hidden tax, disproportionately punishing savers and low-income demographics.",
      "Curing stubborn inflation requires painful policies (such as raising interest rates) which initially trigger recessions.",
      "Sustained inflation erodes trust in public institutions, often driving populist and radical political swings."
    ],
    commonReactions: [
      {
        type: "Fear",
        historicalExample: "German citizens rushed to buy groceries in 1923, knowing their money would lose half its value by evening.",
        modernCounterpart: "Consumers panic-buying durable goods, cars, or real estate to lock in prices."
      },
      {
        type: "Resistance",
        historicalExample: "Citizens organizing boycotts of high-priced merchants and rioting over bread prices.",
        modernCounterpart: "Demands for government price controls, strikes for cost-of-living salary hikes, and public anger at corporations."
      },
      {
        type: "Innovation",
        historicalExample: "Merchants turning to foreign currencies, bartering, or using tobacco/sugar as commodity money.",
        modernCounterpart: "Spikes in interest in decentralized digital currencies (Bitcoin) and inflation-hedging financial products."
      },
      {
        type: "Adaptation",
        historicalExample: "French citizens adapting to the Assignats currency by shifting away from cash to land holdings.",
        modernCounterpart: "Families adjusting budgets, opting for private-label goods, and cutting discretionary spending."
      }
    ],
    timeline: [
      {
        stage: "Historical Event",
        detail: "OPEC cuts oil supplies (1973), triggering a global energy shortage and rising manufacturing costs."
      },
      {
        stage: "Public Reaction",
        detail: "Lines form at gas stations, strikes emerge, and workers demand indexed cost-of-living adjustments."
      },
      {
        stage: "Major Change",
        detail: "Fed Chairman Paul Volcker raises interest rates to 20% (1980), breaking the wage-price spiral by inducing a recession."
      },
      {
        stage: "Long-Term Outcome",
        detail: "Decades of stable inflation targeting (around 2%), supply-chain optimization, and central bank independence."
      }
    ],
    similarities: [
      "Sparks coming from supply-side bottlenecks (energy, grains, chips).",
      "Expansion of monetary aggregates preceding the price increases.",
      "Public frustration focused on retailers and government leadership."
    ],
    differences: [
      "Data Velocity: Modern central banks track price adjustments in real-time, unlike the delayed ledgers of the past.",
      "Global Integration: Modern supply chains are highly globalized, meaning local inflation can be imported from abroad.",
      "Safety Nets: Deposit insurance and electronic transfers prevent the physical currency panics seen in Weimar or Rome."
    ],
    historicalInsight: "History indicates that inflation rarely resolves on its own without monetary policy tightening or the clearing of supply-side bottlenecks. Attempting to suppress it via price caps usually results in shortages.",
    perspectiveScore: {
      economicImpact: 90,
      socialImpact: 82,
      technologicalChange: 40,
      humanAdaptation: 75,
      longTermSignificance: 80
    }
  },
  "economic-recession": {
    id: "economic-recession",
    title: "Economic Recession & Market Crashes",
    modernSituation: "Periodic declines in GDP, rising unemployment, and credit freezes as speculative asset bubbles burst and consumer confidence drops.",
    similarHistoricalEvents: [
      {
        name: "The Panic of 1873 (Long Depression)",
        period: "1873 to 1879",
        description: "A collapse in railroad stock speculation triggered a banking freeze, closing the NY stock exchange for ten days."
      },
      {
        name: "The Great Depression",
        period: "1929 to 1939",
        description: "The Wall Street stock crash of 1929 triggered systemic bank runs, causing global economic contraction."
      },
      {
        name: "The 2008 Global Financial Crisis",
        period: "2007 to 2009",
        description: "The burst of the US subprime housing bubble cascaded through leveraged investment banks, freezing global credit."
      }
    ],
    whySimilar: "Both are driven by debt-fueled speculative bubbles in a novel sector (railroads in 1873, mortgages in 2008), leading to credit freezes when trust is lost.",
    whatHappenedThen: "Widespread defaults, high unemployment, business closures, and liquidation of bad debts. Deflationary spirals made debts harder to pay, dragging out recovery.",
    whatChanged: "Creation of the Federal Reserve (1913) as a lender of last resort, deposit insurance (FDIC) to stop bank runs, and active Keynesian deficit spending.",
    lessonsLearned: [
      "Financial engineering always outpaces regulator understanding, making periodic systemic updates necessary.",
      "Delaying credit system stabilization prolongs recessions; banks must be recapitalized quickly.",
      "Private debt bubbles are far more damaging than public debt surges, as they lead to debt-deflation spirals."
    ],
    commonReactions: [
      {
        type: "Fear",
        historicalExample: "Depositors standing in long lines to withdraw cash before their local bank went bankrupt.",
        modernCounterpart: "Investors panic-selling equities and moving funds to short-term government bonds or cash."
      },
      {
        type: "Resistance",
        historicalExample: "Unemployed workers organizing hunger marches and protesting farm foreclosure auctions.",
        modernCounterpart: "Protests against bank bailouts ('Occupy Wall Street'), and populist backlash against austerity policies."
      },
      {
        type: "Innovation",
        historicalExample: "FDR implementing the New Deal, introducing mortgage relief, social security, and public works programs.",
        modernCounterpart: "Central banks deploying Quantitative Easing (QE), and emergency liquidity funds."
      },
      {
        type: "Adaptation",
        historicalExample: "Companies restructuring debts, cutting dividends, and shifting focus to high-efficiency operations.",
        modernCounterpart: "Businesses trimming workforces, focusing on core revenues, and reducing leverage."
      }
    ],
    timeline: [
      {
        stage: "Historical Event",
        detail: "Speculation in railroad construction collapses, causing the bankruptcy of major bank Jay Cooke & Co. (Sept 1873)."
      },
      {
        stage: "Public Reaction",
        detail: "Stock market crashes, banks run out of reserves, and credit freezes, causing a 6-year depression."
      },
      {
        stage: "Major Change",
        detail: "Creation of clearinghouse associations, followed eventually by the Federal Reserve System to provide emergency liquidity."
      },
      {
        stage: "Long-Term Outcome",
        detail: "Consolidation of the banking system and the establishment of federal monetary buffers."
      }
    ],
    similarities: [
      "High leverage and speculative debt preceding the crash.",
      "The initial failure of a single large institution cascading into a wider freeze.",
      "A sharp contraction in consumer demand as people prioritize saving."
    ],
    differences: [
      "Fiat Flexibility: Modern central banks print money to buy toxic assets, which was impossible under the gold standard.",
      "Social Safety Nets: Unemployment benefits and food stamps buffer the drop in consumer demand.",
      "Global Interconnection: Modern crises cross borders instantly via high-frequency electronic trading."
    ],
    historicalInsight: "History suggests that recessions are necessary corrections to speculative excess. The depth of the crash is directly proportional to the amount of debt built up in the system prior to the crash.",
    perspectiveScore: {
      economicImpact: 92,
      socialImpact: 85,
      technologicalChange: 35,
      humanAdaptation: 80,
      longTermSignificance: 88
    }
  },
  "social-media": {
    id: "social-media",
    title: "Social Media & Democratized Media",
    modernSituation: "Algorithmic social networks enable instant, borderless publishing, driving polarization, spreading fake news, and bypassing traditional editors.",
    similarHistoricalEvents: [
      {
        name: "The Printing Press Expansion",
        period: "16th Century",
        description: "Gutenberg's invention enabled anyone to print pamphlets. This democratized reading but also fueled religious wars and conspiracy pamphlets."
      },
      {
        name: "The Yellow Journalism Era",
        period: "1890s",
        description: "Hearst and Pulitzer engaged in circulation battles, discovering that sensationalism and manufactured outrage sold far more copies than facts."
      },
      {
        name: "The Radio Broadcast Boom",
        period: "1920s to 1930s",
        description: "Direct-to-home audio broadcast bypassed traditional newspapers, allowing political demagogues to mobilize mass audiences directly."
      }
    ],
    whySimilar: "Both involve the collapse of traditional information gatekeepers (priests/editors then; news networks now) and business models that monetize human outrage.",
    whatHappenedThen: "Fierce circulation wars stoked public hysteria, contributing to events like the Spanish-American War. Religious pamphlets fueled the Thirty Years' War.",
    whatChanged: "Society developed legal frameworks (libel laws), professional codes of journalistic ethics, public broadcasting models (like the BBC), and school literacy courses.",
    lessonsLearned: [
      "Democratized media increases diversity of voice but destroys the shared societal consensus of reality.",
      "Attention-based monetization models will always amplify sensationalism over accuracy.",
      "Societies eventually build cognitive immune systems to filter media excess, but the transition phase is highly chaotic."
    ],
    commonReactions: [
      {
        type: "Fear",
        historicalExample: "Monarchs feared that printed books would spread heresy, rebellion, and destroy moral orders.",
        modernCounterpart: "Concerns that online echo chambers will destroy democracy, disrupt elections, and erode objective truth."
      },
      {
        type: "Resistance",
        historicalExample: "States establishing licensing boards to review and censor all books before they could be printed.",
        modernCounterpart: "Demands for tech platforms to censor disinformation, shadowban accounts, and pass digital safety laws."
      },
      {
        type: "Innovation",
        historicalExample: "Printers developing pamphlets with illustrations to reach illiterate populations, driving early visual literacy.",
        modernCounterpart: "Independent fact-checking websites, trust ratings, and decentralized community note systems."
      },
      {
        type: "Adaptation",
        historicalExample: "Readers learning to recognize sensationalist tabloids and moving to reputable subscription newspapers.",
        modernCounterpart: "Users choosing curated newsletters, ad-free platforms, and leaving public feeds."
      }
    ],
    timeline: [
      {
        stage: "Historical Event",
        detail: "Gutenberg's printing press spreads across Europe (1450s), lowering the cost of printing pamphlets 100-fold."
      },
      {
        stage: "Public Reaction",
        detail: "Floods of pamphlets accuse opponents of witchcraft and heresy, fueling the Protestant Reformation."
      },
      {
        stage: "Major Change",
        detail: "Nations institute strict licensing systems, copyright laws, and the concept of editorial liability."
      },
      {
        stage: "Long-Term Outcome",
        detail: "The Scientific Revolution, widespread literacy, and the creation of the modern public sphere."
      }
    ],
    similarities: [
      "The business model relies strictly on capturing and selling human attention.",
      "Erosion of trust in traditional authority figures and institutions.",
      "Amplification of emotional, polarized opinions over moderate viewpoints."
    ],
    differences: [
      "Hyper-Personalization: Past media printed one newspaper for everyone; modern algorithms customize feeds for individuals.",
      "Instant feedback: Social media users can immediately like, share, and comment, creating viral loops.",
      "Synthetic Content: Modern media faces deepfakes and AI bots, whereas past fabrications were human-written."
    ],
    historicalInsight: "History suggests that top-down censorship rarely solves media polarization. Stabilization only occurs when the public learns media literacy and platforms shift away from outrage-maximizing algorithms.",
    perspectiveScore: {
      economicImpact: 78,
      socialImpact: 95,
      technologicalChange: 90,
      humanAdaptation: 70,
      longTermSignificance: 92
    }
  },
  "climate-change": {
    id: "climate-change",
    title: "Climate Change & Ecological Adaptation",
    modernSituation: "Human greenhouse gas emissions drive global warming, rising sea levels, and extreme weather events, threatening food security and coastal cities.",
    similarHistoricalEvents: [
      {
        name: "The Dust Bowl",
        period: "1930s",
        description: "Intensive farming combined with severe drought turned the American Great Plains into a desert, displacing 2.5 million people."
      },
      {
        name: "The Little Ice Age",
        period: "14th to 19th Century",
        description: "A period of cooling caused crop failures, famines, plague spreads, and political unrest across Europe and Asia."
      },
      {
        name: "The Neolithic Agricultural Transition",
        period: "10,000 BCE",
        description: "Changing global climates at the end of the last Ice Age forced hunter-gatherers to domesticate crops and settle in river valleys."
      }
    ],
    whySimilar: "Both involve ecological carrying-capacity strains on human societies, requiring mass migrations and a structural redesign of agriculture.",
    whatHappenedThen: "Climatic changes caused famines and conflicts, but they also acted as catalysts for massive technological innovations (like crop rotation, irrigation, and crop domestication).",
    whatChanged: "Governments established soil conservation services, agricultural crop insurance, and built irrigation infrastructure to buffer weather variations.",
    lessonsLearned: [
      "Civilizations that adapt their resource consumption survive; rigid societies that deplete their ecological buffers collapse.",
      "Climatic crises act as accelerators, pushing societies to invent new resource management systems.",
      "Proactive adaptation (infrastructure, crop diversity) is far cheaper than reacting to displacement crises."
    ],
    commonReactions: [
      {
        type: "Fear",
        historicalExample: "Citizens during the Little Ice Age feared that the cooling was divine punishment, leading to witch trials.",
        modernCounterpart: "Eco-anxiety and dread that the planet will become uninhabitable, leading to birth rate drops."
      },
      {
        type: "Resistance",
        historicalExample: "Farmers during the 1930s ignored soil erosion warnings, continuing deep plowing in search of short-term yields.",
        modernCounterpart: "Lobbying to protect fossil fuel subsidies, and dismissal of scientific climate consensus."
      },
      {
        type: "Innovation",
        historicalExample: "Invention of crop rotation, deep wells, and new seed varieties to withstand temperature drops.",
        modernCounterpart: "Solar power scaling, electric vehicles, carbon capture tech, and drought-resistant GMO seeds."
      },
      {
        type: "Adaptation",
        historicalExample: "Mass migration of 'Okies' to California, and European farmers shifting from wheat to cold-hardy potatoes.",
        modernCounterpart: "Building seawalls, migrating inland, and transitioning power grids to renewable energy."
      }
    ],
    timeline: [
      {
        stage: "Historical Event",
        detail: "Decades of over-farming followed by severe drought hits the US Great Plains (1930)."
      },
      {
        stage: "Public Reaction",
        detail: "Mass dust storms choke cities; millions of farming families migrate west in search of work."
      },
      {
        stage: "Major Change",
        detail: "The US government establishes the Soil Conservation Service, planting millions of trees as windbreaks."
      },
      {
        stage: "Long-Term Outcome",
        detail: "Development of modern sustainable farming methods, crop insurance, and soil science."
      }
    ],
    similarities: [
      "Farming regions experiencing desertification and crop failure.",
      "Forced migration of populations away from devastated ecological zones.",
      "The necessity of government-coordinated infrastructure programs to adapt."
    ],
    differences: [
      "Cause: Modern climate change is human-induced, whereas past events were mostly natural variations.",
      "Scale: Modern warming is global and rapid, whereas the Little Ice Age was regional and slow.",
      "Scientific Knowledge: We possess global climate models and engineering tools that past societies lacked."
    ],
    historicalInsight: "History suggests that ecological shifts test the resilience of social institutions. Societies succeed not by trying to preserve the old climate, but by structurally adapting their food and energy infrastructure to the new reality.",
    perspectiveScore: {
      economicImpact: 85,
      socialImpact: 90,
      technologicalChange: 75,
      humanAdaptation: 78,
      longTermSignificance: 98
    }
  },
  "cryptocurrency": {
    id: "cryptocurrency",
    title: "Cryptocurrency & Decentralized Finance",
    modernSituation: "Decentralized digital tokens and blockchain smart contracts compete with state-issued currencies, driving speculative investment waves.",
    similarHistoricalEvents: [
      {
        name: "The California Gold Rush",
        period: "1848 to 1855",
        description: "The sudden discovery of gold sparked mass global migration, wild speculation, and the creation of hundreds of private mining towns."
      },
      {
        name: "The South Sea Bubble",
        period: "1720",
        description: "The novelty of joint-stock shares led the British public into a speculative buying frenzy of speculative shell companies."
      },
      {
        name: "The Free Banking Era",
        period: "1837 to 1863",
        description: "Unregulated private US banks issued their own paper currencies (wildcat notes), which frequently went bankrupt."
      }
    ],
    whySimilar: "Both represent euphoria surrounding a new financial asset class (joint-stock shares in 1720, digital tokens today), combined with retail FOMO and a lack of regulation.",
    whatHappenedThen: "Speculative bubbles burst, wiping out fortunes and causing bank runs. Governments eventually banned unauthorized private currencies to establish uniform state money.",
    whatChanged: "Nations established central currency controls (like greenbacks), passed security disclosure laws (the Bubble Act), and created regulatory oversight commissions.",
    lessonsLearned: [
      "Financial innovations that lack underlying economic output or dividend cash flows eventually correct to speculative utility.",
      "Celebrity endorsements and overnight fortunes are indicators of peak bubble phases, often followed by liquidity dumps.",
      "Markets require clear rules to prevent insider manipulation; clean capital eventually demands regulation."
    ],
    commonReactions: [
      {
        type: "Fear",
        historicalExample: "Traditional bankers warning that private wildcat notes were fraudulent and would destroy commerce.",
        modernCounterpart: "Central banks warning that crypto facilitates money laundering, ransomware, and tax evasion."
      },
      {
        type: "Resistance",
        historicalExample: "The UK Parliament passing the Bubble Act of 1720 to ban joint-stock companies without royal charters.",
        modernCounterpart: "SEC lawsuits against exchanges, bans on mining, and strict tax-reporting requirements."
      },
      {
        type: "Innovation",
        historicalExample: "The development of stock exchanges, corporate clearinghouses, and bank networks to track transactions.",
        modernCounterpart: "Smart contracts, decentralized finance protocols, stablecoins, and Layer-2 scaling layers."
      },
      {
        type: "Adaptation",
        historicalExample: "Gold miners trading physical gold dust for paper bank drafts to secure their wealth.",
        modernCounterpart: "Traditional Wall Street firms launching Bitcoin ETFs and offering digital asset custody."
      }
    ],
    timeline: [
      {
        stage: "Historical Event",
        detail: "US President Jackson vetoes the Second Bank of the US, allowing private banks to issue unregulated notes (1836)."
      },
      {
        stage: "Public Reaction",
        detail: "Hundreds of 'wildcat banks' issue paper notes backed by questionable reserves; bank runs and defaults emerge."
      },
      {
        stage: "Major Change",
        detail: "The National Bank Act of 1863 taxes private bank notes out of existence, creating a single national greenback currency."
      },
      {
        stage: "Long-Term Outcome",
        detail: "Establishment of a standardized sovereign currency and centralized credit regulation."
      }
    ],
    similarities: [
      "The proliferation of copycat projects and outright fraud (rug pulls).",
      "Mass retail participation driven by stories of sudden wealth.",
      "Friction between state currency monopoly and decentralized alternatives."
    ],
    differences: [
      "Digital Portability: Crypto can be transferred globally in seconds via code, unlike physical gold or paper notes.",
      "Decentralized Ledger: Blockchain database nodes are distributed worldwide, making it difficult for states to shut down.",
      "Programmable Value: Tokens can execute automated functions (smart contracts), which past currencies could not do."
    ],
    historicalInsight: "History suggests that private currencies struggle to survive over the long term without state backing or clearing integrations. Cryptocurrency is likely to follow the path of joint-stock shares: shifting from speculative wildcards to regulated infrastructural assets.",
    perspectiveScore: {
      economicImpact: 82,
      socialImpact: 70,
      technologicalChange: 85,
      humanAdaptation: 72,
      longTermSignificance: 78
    }
  },
  "globalization": {
    id: "globalization",
    title: "Globalization & Supply Chain Integration",
    modernSituation: "Interconnected global supply chains, international trade treaties, and borderless manufacturing hubs integrate economies while causing domestic industrial declines.",
    similarHistoricalEvents: [
      {
        name: "The Silk Road Trade Networks",
        period: "130 BCE to 1450s CE",
        description: "Transcontinental trade connected Europe, the Middle East, and Asia, exchanging silks, spices, technologies, and pathogens."
      },
      {
        name: "The Age of Discovery",
        period: "15th to 17th Century",
        description: "European maritime routes connected the Americas, Europe, and Asia, establishing the first global mercantile supply networks."
      },
      {
        name: "The British East India Company Era",
        period: "18th Century",
        description: "A private joint-stock corporation dominated global trade, restructuring textile manufacturing between India and Britain."
      }
    ],
    whySimilar: "Both involve the lowering of transit barriers, specialization of regional manufacturing, friction in domestic labor markets, and vulnerability to distant systemic shocks.",
    whatHappenedThen: "Global trade generated immense wealth for mercantile cities but also led to colonization, resource exploitation, and domestic job losses (e.g. British machine-made yarn destroying Indian weavers). Plagues also spread quickly.",
    whatChanged: "Nations established international tariff systems, maritime protection navies, global commercial courts, and trade treaties to manage disputes and protect critical home industries.",
    lessonsLearned: [
      "Global efficiency boosts prosperity but increases vulnerability to single-point-of-failure supply shocks.",
      "Deglobalization sentiment spikes when the domestic winners of trade fail to compensate the displaced workers.",
      "Interdependent trade reduces the likelihood of direct military conflicts between major partners, but shifts conflict to trade wars."
    ],
    commonReactions: [
      {
        type: "Fear",
        historicalExample: "Local merchant guilds fearing that cheap foreign imports (like Chinese silks or Indian calicos) would bankrupt them.",
        modernCounterpart: "Fear of factory closures, outsourcing of white-collar work, and reliance on foreign semiconductor fabs."
      },
      {
        type: "Resistance",
        historicalExample: "Britain passing the Calico Acts of 1721 to ban imports of printed cotton goods to protect wool weavers.",
        modernCounterpart: "Imposition of protective tariffs, reshoring laws, and populists demanding border walls."
      },
      {
        type: "Innovation",
        historicalExample: "European weavers inventing high-speed automated weaving looms to compete with cheap Asian manual labor.",
        modernCounterpart: "Advanced automated factories (robotics) designed to make domestic assembly competitive."
      },
      {
        type: "Adaptation",
        historicalExample: "Merchants building complex insurance schemes and joint-stock corporations to hedge shipping risks.",
        modernCounterpart: "Multinational companies building 'China+1' supply chains and nearshoring logistics."
      }
    ],
    timeline: [
      {
        stage: "Historical Event",
        detail: "Vasco da Gama establishes direct maritime trade to India (1497), bypassing land-based Silk Road fees."
      },
      {
        stage: "Public Reaction",
        detail: "European nations enact mercantilist laws to hoard silver and gold, capping foreign finished imports."
      },
      {
        stage: "Major Change",
        detail: "The emergence of global naval patrols, custom houses, and joint-stock charters to secure supply routes."
      },
      {
        stage: "Long-Term Outcome",
        detail: "The creation of modern global commercial law, industrial specialization, and international trade bodies."
      }
    ],
    similarities: [
      "Concentration of specific manufacturing segments in lower-cost geographic regions.",
      "Domestic political backlashes from workers in displaced industrial regions.",
      "The rapid spread of economic crises and inflation across trade partners."
    ],
    differences: [
      "Service Transfer: Modern globalization shifts cognitive services (coding, call centers) instantly over fiber optic cables, not just physical freight.",
      "Supply Just-in-Time: Modern shipping uses standardized intermodal containers and real-time tracking, leaving no buffers for disruption.",
      "Financialization: Modern capital flows move electronically in milliseconds, outpacing physical goods."
    ],
    historicalInsight: "History suggests that trade integration is cyclical: periods of rapid globalization usually trigger backlashes of isolationism and tariff wars, forcing supply chains to transition from absolute efficiency (just-in-time) to resilience (just-in-case).",
    perspectiveScore: {
      economicImpact: 90,
      socialImpact: 80,
      technologicalChange: 75,
      humanAdaptation: 82,
      longTermSignificance: 95
    }
  },
  "population-growth": {
    id: "population-growth",
    title: "Population Growth & Demographics",
    modernSituation: "Global birth rates decline, leading to aging populations in developed nations, while demographic booms continue in developing regions.",
    similarHistoricalEvents: [
      {
        name: "Malthusian Trap Concerns",
        period: "19th Century",
        description: "Thomas Malthus predicted that because population grows exponentially while food production grows arithmetically, starvation was inevitable."
      },
      {
        name: "Black Death Demographic Scarcity",
        period: "14th Century",
        description: "The bubonic plague wiped out 30-60% of Europe's population, causing severe labor shortages and changing feudal relationships."
      },
      {
        name: "The Fritz Haber Nitrogen Breakthrough",
        period: "1900s to 1910s",
        description: "The development of synthetic nitrogen fertilizer broke natural agricultural limits, enabling the global population to explode."
      }
    ],
    whySimilar: "Both involve anxieties over whether the carrying capacity of resources can sustain population levels, and how shifts in labor supply change economic dynamics.",
    whatHappenedThen: "Malthus's food prediction failed because technological innovations boosted crop yields. The Black Death labor shortage boosted peasant bargaining power and raised wages.",
    whatChanged: "Nations established public pension architectures (Social Security), developed mechanized agriculture, and set up immigration pathways to balance labor needs.",
    lessonsLearned: [
      "Human technological breakthroughs repeatedly push resource ceilings, defying collapse predictions.",
      "Abrupt drops or gains in labor supply rewrite the balance of power between capital owners and workers.",
      "Demographic contraction requires societies to boost productivity-per-worker rather than relying on growing workforce numbers."
    ],
    commonReactions: [
      {
        type: "Fear",
        historicalExample: "Fears in the 1960s (e.g. 'The Population Bomb') that the earth would run out of resources by the 1980s, causing global famine.",
        modernCounterpart: "Panic over 'demographic collapse' leading to bankrupt pension systems and hollowed-out ghost towns."
      },
      {
        type: "Resistance",
        historicalExample: "Nations attempting to control demographics using coercive laws (like China's One-Child Policy).",
        modernCounterpart: "Lobbying against immigration in aging nations, and cutbacks to public services for elderly demographics."
      },
      {
        type: "Innovation",
        historicalExample: "Developing mechanized seed drills and steam tractors to farm larger acreage with fewer laborers.",
        modernCounterpart: "Elder-care robotics, factory automation, and AI tools to maintain output with fewer workers."
      },
      {
        type: "Adaptation",
        historicalExample: "Feudal lords raising wages and offering land tenancy rights to retain scarce workers after the plague.",
        modernCounterpart: "Raising retirement ages, offering childcare tax credits, and automating administrative workflows."
      }
    ],
    timeline: [
      {
        stage: "Historical Event",
        detail: "Thomas Malthus publishes his Essay on Population (1798), warning of imminent food shortages."
      },
      {
        stage: "Public Reaction",
        detail: "Nations curb welfare systems, fearing that support encourages unsustainable family sizes."
      },
      {
        stage: "Major Change",
        detail: "The Haber-Bosch process synthesizes nitrogen fertilizer (1909), exponentially increasing global food capacity."
      },
      {
        stage: "Long-Term Outcome",
        detail: "Global population climbs from 1.6 to 8 billion while child mortality drops, averting systemic Malthusian collapses."
      }
    ],
    similarities: [
      "Concern over the fiscal stability of state welfare and support systems.",
      "Debates over whether technology can offset workforce shifts.",
      "Anxieties regarding resource consumption and environmental carrying capacities."
    ],
    differences: [
      "Voluntary Declines: For the first time, birth rate declines are voluntary and driven by education and urbanization, not famine.",
      "Global Scale: Aging is synchronized across all major industrial nations simultaneously.",
      "Lifespan: Modern seniors live decades past retirement, unlike the brief post-work lifespans of the past."
    ],
    historicalInsight: "History suggests that labor shortages stimulate technological investment. The demographic squeeze in aging nations is likely to accelerate the deployment of automation and robotics in services and health care.",
    perspectiveScore: {
      economicImpact: 80,
      socialImpact: 88,
      technologicalChange: 65,
      humanAdaptation: 80,
      longTermSignificance: 90
    }
  },
  "political-polarization": {
    id: "political-polarization",
    title: "Political Polarization & Factionalism",
    modernSituation: "Ideological gridlock, declining institutional trust, and partisan hostility divide democratic societies, complicating collective governance.",
    similarHistoricalEvents: [
      {
        name: "The Late Roman Republic",
        period: "133 to 27 BCE",
        description: "Rome's political class split into two hostile factions—the Optimates (conservatives) and Populares (populists)—gridlocking the Senate."
      },
      {
        name: "The US Gilded Age Divide",
        period: "1870s to 1890s",
        description: "Massive wealth gaps, industrialization, and regional divides created intense partisan stalemates and gridlock in Congress."
      },
      {
        name: "The French Revolutionary Assemblies",
        period: "1789 to 1799",
        description: "The National Assembly split into radical Jacobins (left) and moderate Girondins (right), collapsing into the Reign of Terror."
      }
    ],
    whySimilar: "Both are driven by widening wealth inequality, changing media ecosystems (pamphlets then; social algorithms now), and the zero-sum framing of political elections.",
    whatHappenedThen: "Political stalemates ended in constitutional crises, violence, or autocracy, as one faction eventually broke the rules to defeat the other.",
    whatChanged: "Democratic societies adapted by introducing voter registration reforms, anti-trust laws to balance wealth, and civic broadcasting models to align public facts.",
    lessonsLearned: [
      "Polarization is a symptom of underlying wealth inequality and institutional decay, not just partisan disagreement.",
      "When democratic compromise is framed as weakness, constitutional systems rapidly destabilize.",
      "De-escalating polarization requires restoring broad economic security and creating trusted, non-partisan media sources."
    ],
    commonReactions: [
      {
        type: "Fear",
        historicalExample: "Roman senators fearing that populist land reforms would lead to mob rule and the confiscation of property.",
        modernCounterpart: "Dread that elections will lead to democratic backsliding, authoritarian takeovers, or civil conflict."
      },
      {
        type: "Resistance",
        historicalExample: "Optimates blocking all votes in the Roman Senate, using vetoes and religious delays to paralyze legislation.",
        modernCounterpart: "Gerrymandering, partisan voting laws, filibustering, and refusing to confirm judicial appointments."
      },
      {
        type: "Innovation",
        historicalExample: "Developing printing agreements and independent parliamentary rules to prevent gridlock.",
        modernCounterpart: "Reforms like ranked-choice voting, non-partisan primary systems, and citizen-led assembly councils."
      },
      {
        type: "Adaptation",
        historicalExample: "Citizens organizing parallel civic institutions, charities, and localized trade guilds.",
        modernCounterpart: "Individuals moving to politically aligned states, and consuming partisan media channels."
      }
    ],
    timeline: [
      {
        stage: "Historical Event",
        detail: "The Gracchi brothers attempt agrarian reforms (133 BCE), bypassing Senate approval to address farmer inequality."
      },
      {
        stage: "Public Reaction",
        detail: "Senatorial elites assassinate the Gracchi; street mobs split into armed political factions."
      },
      {
        stage: "Major Change",
        detail: "Generals (Marius, Sulla) recruit loyal private armies, leading to civil wars and dictatorships."
      },
      {
        stage: "Long-Term Outcome",
        detail: "Julius Caesar crosses the Rubicon, ending the Republic's gridlock by establishing the autocratic Roman Empire."
      }
    ],
    similarities: [
      "Populist leaders mobilizing lower-income classes against established elites.",
      "The breakdown of unwritten political norms of compromise.",
      "Extreme concentration of wealth fueling political resentment."
    ],
    differences: [
      "Electoral Frameworks: Modern democracies have deep constitutional buffers, independent judiciaries, and institutional histories.",
      "Media Speed: Outrage spreads instantly online, whereas Roman factionalism relied on physical assemblies.",
      "Lack of Private Armies: Modern factions do not possess private standing military forces, unlike late Roman generals."
    ],
    historicalInsight: "History warns that polarization is solved either by structural economic reforms that reduce wealth gaps, or by autocratic collapse. Paralysis of democratic compromise is the primary indicator of constitutional vulnerability.",
    perspectiveScore: {
      economicImpact: 70,
      socialImpact: 98,
      technologicalChange: 30,
      humanAdaptation: 65,
      longTermSignificance: 95
    }
  },
  "pandemics": {
    id: "pandemics",
    title: "Pandemics & Public Health Crises",
    modernSituation: "Global aviation networks enable new pathogens to spread worldwide in hours, requiring rapid quarantine protocols, testing, and vaccine rollouts.",
    similarHistoricalEvents: [
      {
        name: "The Black Death",
        period: "1347 to 1351",
        description: "Bubonic plague killed 30-60% of Europe's population, completely restructuring medieval agricultural labor."
      },
      {
        name: "The Spanish Flu",
        period: "1918 to 1920",
        description: "An H1N1 influenza strain infected one-third of the global population, spreading through troop movements in WWI."
      },
      {
        name: "The Antonine Plague",
        period: "165 to 180 CE",
        description: "A smallpox or measles outbreak brought back by Roman soldiers killed one-third of the empire's population, weakening the army."
      }
    ],
    whySimilar: "Both feature state struggles with quarantines, scapegoating of specific demographics, massive economic lockdowns, and search for cures.",
    whatHappenedThen: "Massive population loss caused agricultural labor shortages. Feudalism collapsed as peasants demanded wages instead of bonded service. Public health rules were born.",
    whatChanged: "Nations established official quarantine systems (Venice's 'quarantena'), built municipal sewers, formed public health departments, and funded vaccines.",
    lessonsLearned: [
      "Pandemics accelerate existing societal trends (e.g. collapse of serfdom in 1350, transition to digital work in 2020).",
      "Public trust in health authorities is as critical as the medical treatment itself.",
      "Highly efficient global trade hubs are highly vulnerable to pathogen vectors."
    ],
    commonReactions: [
      {
        type: "Fear",
        historicalExample: "Citizens fleeing plague-infested cities for rural estates, abandoning sick family members.",
        modernCounterpart: "Panic-buying groceries, hoarding masks, and avoiding public transit."
      },
      {
        type: "Resistance",
        historicalExample: "Anti-Mask Leagues protesting San Francisco regulations during the 1918 flu.",
        modernCounterpart: "Lockdown protests, refusal to accept vaccine requirements, and defiance of gathering bans."
      },
      {
        type: "Innovation",
        historicalExample: "Venice inventing quarantine islands (lazarettos) and health passes to track sailors.",
        modernCounterpart: "Rapid mRNA vaccine engineering, telehealth services, and remote diagnostics."
      },
      {
        type: "Adaptation",
        historicalExample: "Landlords reducing peasant rents and offering paid wages to secure scarce agricultural workers.",
        modernCounterpart: "Companies adopting permanent hybrid working models and automating warehouse operations."
      }
    ],
    timeline: [
      {
        stage: "Historical Event",
        detail: "The Spanish Flu emerges in military camps and spreads globally via troop ships (1918)."
      },
      {
        stage: "Public Reaction",
        detail: "Cities close schools; anti-regulation leagues form, and public gatherings are banned."
      },
      {
        stage: "Major Change",
        detail: "Governments establish unified national health ministries and coordinate international disease tracking."
      },
      {
        stage: "Long-Term Outcome",
        detail: "Expansion of public sanitation, school health programs, and employee sick leave benefits."
      }
    ],
    similarities: [
      "Economic stagnation during peak quarantine waves.",
      "Socio-political friction surrounding government restrictions.",
      "Labor shortages immediately following the pandemic peak."
    ],
    differences: [
      "Medical Capability: We can sequence viral genomes in hours and engineer vaccines in days, unlike past bloodletting.",
      "Information Speed: Outbreak data and preventative advice spread instantly, alongside misinformation.",
      "Global Safety Nets: Modern states offset locking down economies via stimulus checks and business loans."
    ],
    historicalInsight: "History shows that pandemics are historical accelerators. They do not invent new trends but fast-forward existing ones, such as remote coordination and digital services.",
    perspectiveScore: {
      economicImpact: 88,
      socialImpact: 92,
      technologicalChange: 80,
      humanAdaptation: 85,
      longTermSignificance: 90
    }
  },
  "digital-privacy": {
    id: "digital-privacy",
    title: "Digital Privacy & Mass Surveillance",
    modernSituation: "Corporations and governments collect and analyze massive amounts of personal behavioral data via cookies, smartphones, and tracking databases.",
    similarHistoricalEvents: [
      {
        name: "Telegraph Interception & Wiretapping",
        period: "Late 19th Century",
        description: "The invention of the telegraph allowed operators and civil war spies to intercept and read commercial and military messages."
      },
      {
        name: "The Cold War Stasi Network",
        period: "1950s to 1989",
        description: "East Germany's secret police built a network of 180,000 informants to document the daily private conversations of citizens."
      },
      {
        name: "The Sealed Envelope Revolution",
        period: "17th to 18th Century",
        description: "The transition of postal services from open postcards to wax-sealed letters to prevent postal carriers from reading correspondence."
      }
    ],
    whySimilar: "Both involve technological advancements that render private communications interceptable, triggering debate over national security vs. personal liberty.",
    whatHappenedThen: "Intercepted telegraphs altered battlefield plans. Stasi files destroyed civic trust. Governments eventually passed laws stating that sealed mail was constitutionally protected.",
    whatChanged: "Societies passed wiretap warrant requirements, established postal secrecy laws, and created consumer protections like the GDPR.",
    lessonsLearned: [
      "If a communication channel is technically interceptable, it will eventually be monitored by commercial or state actors.",
      "Surveillance systems destroy the social trust required for democratic public square debates.",
      "Privacy is not about having 'nothing to hide' but maintaining personal autonomy against manipulation."
    ],
    commonReactions: [
      {
        type: "Fear",
        historicalExample: "Citizens fearing that writing critical letters would result in imprisonment by royal postmasters.",
        modernCounterpart: "Concern that browser search profiles and locations will trigger credit score drops or target profiling."
      },
      {
        type: "Resistance",
        historicalExample: "Developing private cryptography and cypher keys to encrypt telegraph messages.",
        modernCounterpart: "Using ad-blockers, virtual private networks (VPNs), and encrypted chat tools like Signal."
      },
      {
        type: "Innovation",
        historicalExample: "The manufacture of folding letters and specialized adhesive wafers to secure papers.",
        modernCounterpart: "Zero-knowledge proofs, privacy-oriented browsers, and decentralized web protocols."
      },
      {
        type: "Adaptation",
        historicalExample: "Accepting that postal correspondence was inspected, using self-censored language in letters.",
        modernCounterpart: "Accepting cookie tracking policies in exchange for convenience and free services."
      }
    ],
    timeline: [
      {
        stage: "Historical Event",
        detail: "National postal routes emerge, carrying open letters that postmasters inspect for treasonous text (1660s)."
      },
      {
        stage: "Public Reaction",
        detail: "Citizens use wax seals and cyphers to hide contents; merchants complain of stolen trade secrets."
      },
      {
        stage: "Major Change",
        detail: "Nations pass postal secrecy acts, making it a felony for post office employees to open sealed mail without a warrant."
      },
      {
        stage: "Long-Term Outcome",
        detail: "Constitutional protections for the privacy of correspondence, laying the groundwork for digital rights."
      }
    ],
    similarities: [
      "National security claims being used to justify mass communications logging.",
      "Commercial firms exploiting private data for competitive advantages.",
      "The use of encryption technologies by citizens seeking to bypass surveillance."
    ],
    differences: [
      "Automation Scale: Modern surveillance is performed automatically by AI algorithms on billions of files, not manually.",
      "Voluntary tracking: Modern users carry their tracking devices (smartphones) voluntarily for convenience.",
      "Predictive Profiling: AI doesn't just log past behavior; it builds predictive models of future purchases and actions."
    ],
    historicalInsight: "History suggests that privacy rights are rarely granted voluntarily; they must be fought for through legal battles that define data as personal property and through tech tools that make surveillance expensive.",
    perspectiveScore: {
      economicImpact: 78,
      socialImpact: 88,
      technologicalChange: 90,
      humanAdaptation: 75,
      longTermSignificance: 85
    }
  },
  "space-exploration": {
    id: "space-exploration",
    title: "Space Exploration & New Frontiers",
    modernSituation: "Private aerospace firms and national space agencies launch lunar and Martian missions, aiming to colonize other planets and mine resources.",
    similarHistoricalEvents: [
      {
        name: "The Age of Sail Global Voyages",
        period: "15th to 17th Century",
        description: "European caravels crossed uncharted oceans to map new continents, secure spices, and establish trade routes."
      },
      {
        name: "The Cold War Space Race",
        period: "1957 to 1975",
        description: "The US and USSR competed to launch satellites and land humans on the Moon as ideological proofs of superiority."
      },
      {
        name: "Pacific Islander Maritime Migrations",
        period: "3000 BCE to 1000 CE",
        description: "Polynesian navigators crossed the vast Pacific in double-hulled canoes, settling isolated islands using star maps."
      }
    ],
    whySimilar: "Both require enormous upfront capital, carry high risks of death, are driven by national prestige, and hope to secure resource wealth.",
    whatHappenedThen: "Global voyages led to trade integration, scientific navigation advances, and colonial conflicts. The Cold War space race yielded spin-off technologies (computers, solar cells).",
    whatChanged: "Nations established international maritime codes (Law of the Sea) and space treaties (Outer Space Treaty of 1967) to govern territorial claims.",
    lessonsLearned: [
      "Frontier exploration booms require a sustainable commercial driver once state prestige funding fades.",
      "New frontiers require international legal codes early to prevent militarization and resource wars.",
      "Technologies developed to survive extreme frontier environments ultimately improve standard of living at home."
    ],
    commonReactions: [
      {
        type: "Fear",
        historicalExample: "Fear that oceanic voyages would provoke war with rival empires or release foreign plagues.",
        modernCounterpart: "Anxiety that space will become militarized, leading to kinetic satellite warfare or orbital debris hazards."
      },
      {
        type: "Resistance",
        historicalExample: "Critics arguing that Royal treasuries should focus on domestic poverty and agricultural crises rather than ships.",
        modernCounterpart: "Protests that space budgets should be spent solving climate change and homelessness on Earth."
      },
      {
        type: "Innovation",
        historicalExample: "Invention of the marine chronometer, astrolabe, and scurvy prevention methods.",
        modernCounterpart: "Reusable rockets, closed-loop water systems, and advanced solar arrays."
      },
      {
        type: "Adaptation",
        historicalExample: "Sailors migrating to shipyards, adjusting to years at sea, and establishing trade networks.",
        modernCounterpart: "Engineers and technicians migrating to aerospace hubs and training for long-duration spaceflight."
      }
    ],
    timeline: [
      {
        stage: "Historical Event",
        detail: "Spain finances Columbus's voyage across the Atlantic (1492) to secure a direct trade route."
      },
      {
        stage: "Public Reaction",
        detail: "Rival European powers rush to launch voyages; debate over territorial rights explodes."
      },
      {
        stage: "Major Change",
        detail: "Nations sign the Treaty of Tordesillas (1494), dividing global exploration zones between Spain and Portugal."
      },
      {
        stage: "Long-Term Outcome",
        detail: "Global trade integration, colonization, and the emergence of modern international maritime law."
      }
    ],
    similarities: [
      "High capital costs requiring state backing or wealthy venture capital.",
      "Deep geopolitical rivalries acting as the primary trigger for funding.",
      "The promise of securing rare raw materials."
    ],
    differences: [
      "Environment: Space is completely hostile to human biology (no oxygen, extreme radiation), unlike terrestrial frontiers.",
      "Commercial players: Private corporations (SpaceX, Blue Origin) lead launches, unlike strictly royal fleets of the past.",
      "Life Support: Survival depends completely on constant technological life support systems."
    ],
    historicalInsight: "History suggests that the space frontier will remain limited to scientists and military outposts until a high-value resource or transportation cost drop makes orbital manufacturing economically self-sustaining.",
    perspectiveScore: {
      economicImpact: 60,
      socialImpact: 65,
      technologicalChange: 98,
      humanAdaptation: 70,
      longTermSignificance: 95
    }
  }
};

// Helper keyword mapping for search input fuzzy-matching
const KEYWORD_MAP = {
  "artificial-intelligence": ["ai", "artificial intelligence", "chatgpt", "llm", "machine learning", "robot", "algorithm", "automation", "openai", "claude", "gemini", "copilot", "job automation", "job"],
  "remote-work": ["remote", "work", "wfh", "office", "telecommute", "home office", "cottage", "centralization", "commute", "zoom", "hybrid", "remote work", "workplace"],
  "inflation": ["inflation", "rising prices", "prices", "hyperinflation", "silver", "gold", "debasement", "weimar", "volcker", "cpi"],
  "economic-recession": ["recession", "economic recession", "depression", "panic", "crash", "bank", "leverage", "credit", "market crash", "1873", "1929", "2008"],
  "social-media": ["social", "media", "facebook", "twitter", "tiktok", "instagram", "youtube", "news", "fake news", "misinformation", "press", "printing press", "outrage", "yellow journalism"],
  "climate-change": ["climate", "climate change", "environment", "global warming", "dust bowl", "little ice age", "weather", "agricultural", "farming"],
  "cryptocurrency": ["crypto", "cryptocurrency", "bitcoin", "blockchain", "gold rush", "bubble", "tulip", "south sea", "token", "wildcat"],
  "globalization": ["globalization", "trade", "world economy", "supply chain", "outsourcing", "tariff", "silk road", "imports"],
  "population-growth": ["population", "population growth", "malthusian", "demographics", "birth rate", "aging", "birth", "labor shortage"],
  "political-polarization": ["polarization", "political polarization", "division", "factions", "republic", "french revolution", "gilded age", "gridlock", "partisanship"],
  "pandemics": ["pandemic", "pandemics", "disease", "black death", "plague", "influenza", "spanish flu", "health", "quarantine"],
  "digital-privacy": ["privacy", "digital privacy", "surveillance", "security", "wiretapping", "post", "stasi", "cookies", "tracking"],
  "space-exploration": ["space", "space exploration", "mars", "moon", "nasa", "rocket", "exploration", "age of sail"]
};

// Popular presets for clickable suggestions
const PRESETS = [
  { label: "AI vs Industrial Revolution", query: "Artificial Intelligence" },
  { label: "Inflation vs Great Depression", query: "Inflation" },
  { label: "Social Media vs Printing Press", query: "Social Media" },
  { label: "Remote Work vs Industrial Era", query: "Remote Work" },
  { label: "Climate Change vs Dust Bowl", query: "Climate Change" },
  { label: "Cryptocurrency vs Gold Rush", query: "Cryptocurrency" },
  { label: "Automation vs Machine Revolution", query: "Artificial Intelligence" },
  { label: "Pandemics vs Black Death", query: "Pandemics" }
];

const TOOL_STATUS = "live"; // Set to "live" to deploy and enable routing

export default function HistoricalPerspectivePage() {
  if (TOOL_STATUS === "upcoming") {
    return <ComingSoon toolName="Historical Perspective" />;
  }

  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Custom loader simulation steps
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const loadingSteps = [
    "Consulting historical ledgers...",
    "Tracing technological diffusion curves...",
    "Analyzing societal adaptation lag...",
    "Correlating perspective metrics...",
    "Synthesizing similarities and differences...",
    "Formulating lessons from the past..."
  ];

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const loadingTimerRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Initialize: load recents and page title
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Historical Perspective Tool | Boring Tools";

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bt_recent_searches_historical_perspective");
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Click outside listener for suggestions
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.title = prevTitle;
      if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const showToastMsg = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  // Fuzzy matching search logic
  const handleAnalyze = (searchQuery) => {
    const targetQuery = searchQuery !== undefined ? searchQuery : query;
    const cleanQuery = targetQuery.trim().toLowerCase();

    if (!cleanQuery) {
      showToastMsg("Please enter a topic or select a preset.", "error");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setLoadingStepIndex(0);
    setShowSuggestions(false);

    // Simulate search load animation
    let step = 0;
    if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);
    loadingTimerRef.current = setInterval(() => {
      step = (step + 1) % loadingSteps.length;
      setLoadingStepIndex(step);
    }, 350);

    setTimeout(() => {
      clearInterval(loadingTimerRef.current);
      
      // Matching attempt
      let matchedKey = null;

      // 1. Direct key match
      if (DATASET[cleanQuery]) {
        matchedKey = cleanQuery;
      } else {
        // 2. Fuzzy mapping check
        for (const [key, keywords] of Object.entries(KEYWORD_MAP)) {
          if (keywords.some(kw => cleanQuery.includes(kw) || kw.includes(cleanQuery))) {
            matchedKey = key;
            break;
          }
        }
      }

      if (matchedKey) {
        const data = DATASET[matchedKey];
        setResult(data);
        setActiveQuery(targetQuery);
        setQuery(data.title);
        
        // Save query to localStorage
        const filtered = recentSearches.filter(item => item.toLowerCase() !== targetQuery.toLowerCase());
        const updated = [targetQuery, ...filtered].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem("bt_recent_searches_historical_perspective", JSON.stringify(updated));

        showToastMsg(`Comparison loaded: ${data.title}`);
      } else {
        // If no match found, default to first topic or suggest a selection
        showToastMsg("No direct historical match found. Showing AI & Automation as fallback.", "warning");
        setResult(DATASET["artificial-intelligence"]);
        setActiveQuery(targetQuery);
      }
      setIsLoading(false);
    }, 1200);
  };

  const handleClearRecent = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem("bt_recent_searches_historical_perspective");
    showToastMsg("Recent searches cleared");
  };

  const handleReset = () => {
    setQuery("");
    setActiveQuery("");
    setResult(null);
    showToastMsg("Inputs cleared.");
  };

  // Compile full report text for download/copy
  const reportText = useMemo(() => {
    if (!result) return "";
    const divider = "==================================================";
    return `HISTORICAL PERSPECTIVE ANALYSIS REPORT
Topic Analyzed: ${activeQuery}
Equivalent: ${result.title}

${divider}
1. MODERN SITUATION
${result.modernSituation}

${divider}
2. SIMILAR HISTORICAL EVENTS
${result.similarHistoricalEvents.map((e, i) => `${i + 1}. ${e.name} (${e.period})\n   ${e.description}`).join("\n\n")}

${divider}
3. WHY THEY ARE SIMILAR
${result.whySimilar}

${divider}
4. WHAT HAPPENED THEN
${result.whatHappenedThen}

${divider}
5. WHAT CHANGED (ADAPTATION)
${result.whatChanged}

${divider}
6. LESSONS LEARNED
${result.lessonsLearned.map(l => `* ${l}`).join("\n")}

${divider}
7. COMMON HUMAN REACTIONS
${result.commonReactions.map(r => `* [${r.type}]\n  Then: ${r.historicalExample}\n  Now: ${r.modernCounterpart}`).join("\n\n")}

${divider}
8. TIMELINE PARALLEL
${result.timeline.map((t, i) => `${i + 1}. ${t.stage}\n   Details: ${t.detail}`).join("\n")}

${divider}
9. SIMILARITIES
${result.similarities.map(s => `* ${s}`).join("\n")}

${divider}
10. DIFFERENCES
${result.differences.map(d => `* ${d}`).join("\n")}

${divider}
11. HISTORICAL INSIGHT
${result.historicalInsight}

${divider}
12. PERSPECTIVE SCORES
- Economic Impact: ${result.perspectiveScore.economicImpact}%
- Social Impact: ${result.perspectiveScore.socialImpact}%
- Technological Change: ${result.perspectiveScore.technologicalChange}%
- Human Adaptation: ${result.perspectiveScore.humanAdaptation}%
- Long-Term Significance: ${result.perspectiveScore.longTermSignificance}%

${divider}
Privacy statement: Everything runs locally inside your browser. No information is uploaded.
`;
  }, [result, activeQuery]);

  const handleCopy = async () => {
    if (!reportText) return;
    try {
      await navigator.clipboard.writeText(reportText);
      showToastMsg("Analysis copied to clipboard!");
    } catch (e) {
      showToastMsg("Failed to copy results.", "error");
    }
  };

  const handleDownload = () => {
    if (!reportText) return;
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const sanitizedTitle = activeQuery.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    link.download = `historical-perspective-${sanitizedTitle || "analysis"}-report.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToastMsg("Report downloaded successfully.");
  };

  // Suggestions for autocomplete filtering as the user types
  const autoSuggestions = useMemo(() => {
    if (!query.trim()) return [];
    const normalized = query.toLowerCase().trim();
    const suggestions = [];

    // Find any keywords that match the typing
    for (const [key, keywords] of Object.entries(KEYWORD_MAP)) {
      if (keywords.some(kw => kw.includes(normalized) || key.includes(normalized))) {
        // Add name/title of this key to suggestions
        const title = DATASET[key].title;
        if (!suggestions.includes(title)) {
          suggestions.push(title);
        }
      }
    }
    return suggestions;
  }, [query]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-10 sm:py-14">
      {/* Toast popup */}
      {toast.show && (
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
        {/* Header section */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Tool 84
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
            Historical Perspective Tool
          </h1>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Analyze modern situations through the lens of history. Find when similar trends happened before, what happened then, and what lessons apply today.
          </p>
        </div>

        {/* Dashboard layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel (Inputs & search suggestions) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-700 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search Situation</span>
              </h2>

              <div className="space-y-4" ref={searchContainerRef}>
                <div className="relative">
                  <label htmlFor="topic-search" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Modern Trend / Issue
                  </label>
                  <input
                    id="topic-search"
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="e.g. Artificial Intelligence, Climate Change..."
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-amber-400 focus:outline-none transition placeholder-slate-400 text-slate-900"
                  />

                  {/* Suggestions Autocomplete Dropdown */}
                  {showSuggestions && autoSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-60 overflow-y-auto">
                      {autoSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setQuery(suggestion);
                            setShowSuggestions(false);
                            handleAnalyze(suggestion);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition cursor-pointer"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAnalyze()}
                    disabled={isLoading}
                    className="flex-1 rounded-xl bg-slate-900 hover:bg-black font-semibold text-white text-sm py-3 px-4 shadow transition active:scale-[0.98] disabled:bg-slate-300 cursor-pointer text-center"
                  >
                    {isLoading ? "Analyzing..." : "Analyze"}
                  </button>
                  <button
                    onClick={handleReset}
                    className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-600 text-sm py-3 px-4 transition active:scale-[0.98] cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Popular examples */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Popular Comparisons</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuery(preset.query);
                        handleAnalyze(preset.query);
                      }}
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-100 bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recent Searches</span>
                    <button
                      onClick={handleClearRecent}
                      className="text-[10px] font-bold text-amber-700 hover:text-amber-900 transition cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuery(item);
                          handleAnalyze(item);
                        }}
                        className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 transition cursor-pointer"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Privacy notice banner */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-sm text-emerald-800 flex items-start gap-3">
              <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">Privacy Statement</h4>
                <p className="text-xs mt-1 leading-relaxed">
                  Everything runs locally inside your browser. No information is uploaded.
                </p>
              </div>
            </div>
          </div>

          {/* Right panel (Results dashboard display) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Loading state simulation */}
            {isLoading && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[460px]">
                <div className="relative w-14 h-14 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-100 animate-pulse"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Comparing Archives</h3>
                <p className="text-sm text-slate-500 max-w-sm mt-2 animate-pulse h-10">
                  {loadingSteps[loadingStepIndex]}
                </p>
              </div>
            )}

            {/* Empty landing state */}
            {!isLoading && !result && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[460px]">
                <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mb-5 animate-pulse">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Search a topic to view its historical parallel</h3>
                <p className="text-sm text-slate-500 max-w-md mt-2 leading-relaxed">
                  Learn how modern shifts in remote labor, artificial intelligence, climate, inflation, and currency mirror events from centuries past.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mt-8 text-left">
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                    <span className="text-amber-700 text-sm font-bold block mb-1">1. Educational Context</span>
                    <span className="text-slate-500 text-xs leading-normal block">Cross-reference modern parameters against established historical periods.</span>
                  </div>
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                    <span className="text-indigo-700 text-sm font-bold block mb-1">2. Pattern Flow</span>
                    <span className="text-slate-500 text-xs leading-normal block">Deconstruct patterns of why events resemble each other, reactions, and long-term societal solutions.</span>
                  </div>
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                    <span className="text-emerald-700 text-sm font-bold block mb-1">3. Timelines & Scores</span>
                    <span className="text-slate-500 text-xs leading-normal block">Review chronological progress tracks and perspective impact indices.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Results sections */}
            {!isLoading && result && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* Header Action Bar */}
                <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Analysis Complete</span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      Comparing: {activeQuery}
                    </h3>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleCopy}
                      className="flex-1 sm:flex-initial text-center justify-center inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow transition active:scale-[0.98] cursor-pointer"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Copy Results
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex-1 sm:flex-initial text-center justify-center inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-800 text-xs font-bold shadow transition active:scale-[0.98] cursor-pointer"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Report
                    </button>
                  </div>
                </div>

                {/* 1. Modern Situation */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-slate-800">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold uppercase">Section 1</span>
                    <h3 className="text-md font-bold uppercase tracking-wide">Modern Situation</h3>
                  </div>
                  <hr className="border-slate-100" />
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {result.modernSituation}
                  </p>
                </div>

                {/* 2. Similar Historical Events */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-800">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold uppercase">Section 2</span>
                    <h3 className="text-md font-bold uppercase tracking-wide">Similar Historical Events</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.similarHistoricalEvents.map((event, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2 hover:border-amber-200 transition">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-extrabold text-slate-900 text-sm">{event.name}</h4>
                          <span className="px-2 py-0.5 bg-amber-50 text-[10px] font-bold text-amber-700 border border-amber-200/50 rounded-full shrink-0">
                            {event.period}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3, 4, 5, 6. Pattern Flow Diagram */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                  <div className="flex items-center gap-2 text-slate-800 mb-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold uppercase">Flow</span>
                    <h3 className="text-md font-bold uppercase tracking-wide">Comparative Pattern Flow</h3>
                  </div>
                  
                  {/* Pattern Steps path */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                    {/* step 1 */}
                    <div className="bg-slate-50/80 border border-slate-100 p-4 rounded-xl space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center shrink-0">3</span>
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Why Similar</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{result.whySimilar}</p>
                      </div>
                    </div>

                    {/* step 2 */}
                    <div className="bg-slate-50/80 border border-slate-100 p-4 rounded-xl space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center shrink-0">4</span>
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">What Happened Then</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{result.whatHappenedThen}</p>
                      </div>
                    </div>

                    {/* step 3 */}
                    <div className="bg-slate-50/80 border border-slate-100 p-4 rounded-xl space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center shrink-0">5</span>
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">What Changed</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{result.whatChanged}</p>
                      </div>
                    </div>

                    {/* step 4 */}
                    <div className="bg-amber-50/40 border border-amber-100 p-4 rounded-xl space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-extrabold text-xs flex items-center justify-center shrink-0">6</span>
                          <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">Lessons Learned</span>
                        </div>
                        <ul className="space-y-1.5">
                          {result.lessonsLearned.map((lesson, idx) => (
                            <li key={idx} className="text-xs text-slate-600 leading-relaxed flex items-start gap-1">
                              <span className="text-amber-500 mt-0.5">•</span>
                              <span>{lesson}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7. Common Human Reactions */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-800">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold uppercase">Section 7</span>
                    <h3 className="text-md font-bold uppercase tracking-wide">Common Human Reactions</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {result.commonReactions.map((reaction, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3.5 hover:border-amber-300 transition">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                            reaction.type === "Fear" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                            reaction.type === "Resistance" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                            reaction.type === "Innovation" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                            "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          }`}>
                            {reaction.type}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Historical Example</span>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">{reaction.historicalExample}</p>
                          </div>
                          <hr className="border-slate-50" />
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block">Modern Counterpart</span>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">{reaction.modernCounterpart}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 8. Timeline Parallel */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                  <div className="text-center max-w-sm mx-auto">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold uppercase">Section 8</span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">Parallel Timeline Path</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Sequential stages mapping past events to long term solutions</p>
                  </div>

                  {/* Timeline Cards Flow */}
                  <div className="relative border-l-2 border-dashed border-slate-200 pl-6 ml-4 space-y-8 py-2">
                    {result.timeline.map((t, idx) => (
                      <div key={idx} className="relative space-y-2">
                        
                        {/* Bullet Circle */}
                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-amber-500 bg-white flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                        </div>

                        {/* Title step */}
                        <h4 className="text-xs font-extrabold text-amber-800 uppercase tracking-wider bg-amber-50 border border-amber-200/50 rounded px-2 py-0.5 inline-block">
                          {t.stage}
                        </h4>

                        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            {t.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 9, 10. Comparison Cards (Similarities vs Differences) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Similarities Card */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-slate-800">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold uppercase">Section 9</span>
                      <h3 className="text-md font-bold uppercase tracking-wide flex items-center gap-1.5">
                        <svg className="w-4.5 h-4.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Similarities</span>
                      </h3>
                    </div>
                    <hr className="border-slate-100" />
                    <ul className="space-y-3">
                      {result.similarities.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                          <span className="text-emerald-500 font-extrabold shrink-0 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Differences Card */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-slate-800">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold uppercase">Section 10</span>
                      <h3 className="text-md font-bold uppercase tracking-wide flex items-center gap-1.5">
                        <svg className="w-4.5 h-4.5 text-amber-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>Differences</span>
                      </h3>
                    </div>
                    <hr className="border-slate-100" />
                    <ul className="space-y-3">
                      {result.differences.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                          <span className="text-amber-500 font-extrabold shrink-0 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 11, 12. Insight Dashboard (Historical Insight + Perspective Score) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Historical Insight (Col Span 7) */}
                  <div className="md:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-slate-800 mb-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold uppercase">Section 11</span>
                        <h3 className="text-md font-bold uppercase tracking-wide">Historical Insight</h3>
                      </div>
                      <hr className="border-slate-100 mb-4" />
                      <div className="bg-amber-50/30 border border-dashed border-amber-200 rounded-xl p-5 relative">
                        <svg className="w-10 h-10 text-amber-200/50 absolute top-2 right-2 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.77 10.055-10.852v2.868c-4.006.818-5.837 3.168-5.51 7.353h5.455v8.022H14.017zm-14.017 0v-7.391c0-5.704 3.748-9.77 10.055-10.852v2.868c-4.006.818-5.793 3.168-5.51 7.353h5.472v8.022H0z" />
                        </svg>
                        <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-semibold italic relative z-10">
                          {result.historicalInsight}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-2">What history suggests we should pay attention to.</span>
                  </div>

                  {/* Perspective Score (Col Span 5) */}
                  <div className="md:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-slate-800">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold uppercase">Section 12</span>
                      <h3 className="text-md font-bold uppercase tracking-wide">Perspective Score</h3>
                    </div>
                    <hr className="border-slate-100" />
                    
                    <div className="space-y-4 pt-1">
                      {/* Economic Impact */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700">Economic Impact</span>
                          <span className="text-amber-800">{result.perspectiveScore.economicImpact}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-amber-505 h-2 rounded-full transition-all duration-1000 bg-amber-500"
                            style={{ width: `${result.perspectiveScore.economicImpact}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Social Impact */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700">Social Impact</span>
                          <span className="text-amber-800">{result.perspectiveScore.socialImpact}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-amber-505 h-2 rounded-full transition-all duration-1000 bg-amber-500"
                            style={{ width: `${result.perspectiveScore.socialImpact}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Technological Change */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700">Technological Change</span>
                          <span className="text-amber-800">{result.perspectiveScore.technologicalChange}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-amber-505 h-2 rounded-full transition-all duration-1000 bg-amber-500"
                            style={{ width: `${result.perspectiveScore.technologicalChange}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Human Adaptation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700">Human Adaptation</span>
                          <span className="text-amber-800">{result.perspectiveScore.humanAdaptation}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-amber-505 h-2 rounded-full transition-all duration-1000 bg-amber-500"
                            style={{ width: `${result.perspectiveScore.humanAdaptation}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Long-Term Significance */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700">Long-Term Significance</span>
                          <span className="text-amber-800">{result.perspectiveScore.longTermSignificance}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-amber-505 h-2 rounded-full transition-all duration-1000 bg-amber-500"
                            style={{ width: `${result.perspectiveScore.longTermSignificance}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
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
