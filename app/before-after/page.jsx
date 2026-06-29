"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

// 100% Client-side dataset of 12 major inventions/events
const DATASET = {
  internet: {
    id: "internet",
    title: "The Internet",
    category: "Technology",
    icon: "internet",
    summary: "The global network of computers dismantled barriers of space and time, turning localized societies into a hyper-connected global community.",
    stats: [
      { label: "Global Users", beforeValue: "< 0.05% (1990)", afterValue: "67% (~5.4 Billion)" },
      { label: "Comm. Speed", beforeValue: "Days to Weeks (Post)", afterValue: "Instant (Milliseconds)" },
      { label: "Data Volume", beforeValue: "Terabytes globally", afterValue: "Zettabytes annually" }
    ],
    comparisons: {
      dailyLife: {
        before: "People relied on paper maps, printed directories (Yellow Pages), local banking hours, and physical mailboxes. Information was scarce and took effort to find.",
        after: "Instant access to home shopping, mobile banking, turn-by-turn navigation, and on-demand streaming. Life is highly digital, interconnected, and screen-centric."
      },
      communication: {
        before: "Long-distance communication was expensive and rare, relying on hand-written letters, telegrams, and high-tariff trunk calls.",
        after: "Instant, zero-marginal-cost video calls, global chat groups, and instant emails across services like Zoom, WhatsApp, and Gmail."
      },
      education: {
        before: "Students were restricted to physical classrooms, local library cards, paper encyclopedias, and local teacher availability.",
        after: "Unlimited access to online video lectures, digital research papers, interactive courses, and global knowledge sharing hubs."
      },
      business: {
        before: "Commerce was heavily localized. Marketing was restricted to print, TV, and billboard ads. Inventory records were manual.",
        after: "Global e-commerce, digital advertising, remote workforces, SaaS platforms, and automated real-time supply chain databases."
      },
      transportation: {
        before: "Logistics tracking relied on radio dispatches and paper ledgers. Travel ticketing required physically visiting agencies.",
        after: "GPS-integrated fleet routing, mobile boarding passes, ridesharing apps, and real-time transit and traffic predictions."
      },
      technology: {
        before: "Stand-alone computing machines using floppy disks or CD-ROMs with no external network dependencies.",
        after: "Cloud computing infrastructures, connected smart sensors (IoT), massive global server farms, and real-time database syncing."
      },
      society: {
        before: "Shared cultural experiences via national TV channels and regional papers, anchoring strongly localized communities.",
        after: "Fragmented attention, digital subcultures, algorithmic echo chambers, online privacy issues, and instant global movements."
      }
    },
    winners: [
      "E-commerce corporations and cloud providers.",
      "Remote software engineers, digital creators, and freelancers.",
      "Global consumers seeking product choices and price transparency."
    ],
    losers: [
      "Traditional print newspapers and directories.",
      "Brick-and-mortar travel agencies and local retail shops.",
      "Postal departments and telegram carriers."
    ],
    consequences: {
      positive: [
        "Democratized access to historical, scientific, and cultural knowledge.",
        "Unprecedented global collaboration on science, software, and human rights.",
        "Significant reductions in transactional costs for businesses of all sizes."
      ],
      negative: [
        "Emergence of high-frequency cyber warfare and digital espionage.",
        "Amplification of online disinformation, digital scams, and cyberbullying.",
        "Severe loss of personal privacy through pervasive behavioral tracking."
      ]
    },
    timeline: [
      { stage: "Before", text: "ARPANET is established in 1969, linking academic mainframes with a crude protocol." },
      { stage: "Major Event", text: "Tim Berners-Lee designs HTML, HTTP, and the World Wide Web project at CERN in 1989." },
      { stage: "Immediate Impact", text: "Browser Netscape Navigator launches in 1994, triggering the speculative dot-com boom." },
      { stage: "Long-Term Impact", text: "Broadband, cloud computing, and mobile networks turn the internet into the foundational nervous system of modern humanity." }
    ],
    funFacts: [
      "The first email was sent in 1971 by Ray Tomlinson. It was sent to another machine sitting right next to it, containing random test characters.",
      "Symbolics.com was the very first registered domain name, created on March 15, 1985.",
      "The first webcam was invented at Cambridge University in 1991 to monitor a coffee pot's fill level without getting up."
    ]
  },
  ai: {
    id: "ai",
    title: "Artificial Intelligence",
    category: "Technology",
    icon: "ai",
    summary: "The shift of labor from mechanical automation to cognitive automation, allowing machines to perform tasks once thought uniquely human.",
    stats: [
      { label: "Drafting Speed", beforeValue: "Hours to Days", afterValue: "Seconds (Generative)" },
      { label: "Compute Scale", beforeValue: "Kiloflops (isolated)", afterValue: "Exaflops (cloud clusters)" },
      { label: "Task Cost", beforeValue: "High expert labor rates", afterValue: "Near-zero API marginal cost" }
    ],
    comparisons: {
      dailyLife: {
        before: "Drafting emails, summarizing text, organizing files, and planning complex schedules required manual cognitive effort.",
        after: "Voice-activated smart assistants, personalized search engines, instant code writing, and AI-aided drafts simplify tasks."
      },
      communication: {
        before: "Language translation was static. Modifying writing tones required manual editing and structural rewriting.",
        after: "Real-time speech-to-speech translation, automated text refinement, and conversational voice synthesis."
      },
      education: {
        before: "Students studied standardized textbooks with general advice, lacking accessible 1-on-1 tutoring.",
        after: "Personalized AI tutors explaining complex equations step-by-step, generating code explanations, and adapting speed."
      },
      business: {
        before: "Data analytics relied on manual SQL queries and spreadsheets. Support desks were fully human-staffed.",
        after: "Predictive algorithms, natural language data interfaces, automated customer agents, and rapid content scaling."
      },
      transportation: {
        before: "Autopilot was restricted to maintaining pre-set headings. Route optimization was static.",
        after: "Self-driving navigation systems (Tesla/Waymo) reacting to traffic hazards, and smart drone distribution fleets."
      },
      technology: {
        before: "Programs were written step-by-step using rigid logical rules (if-else statements).",
        after: "Neural networks training on internet-scale data to discover patterns and generate computer code autonomously."
      },
      society: {
        before: "Creative writing, art generation, and strategic thinking were considered immune to machine automation.",
        after: "Debates over artistic ownership, copyright, deepfakes, cognitive skill erosion, and future labor shifts."
      }
    },
    winners: [
      "Semiconductor manufacturers designing GPU chips.",
      "Tech conglomerates owning large server grids and data lakes.",
      "Creative directors and developers leveraging AI to amplify output."
    ],
    losers: [
      "Junior copywriters and stock illustration artists.",
      "Manual transcriptionists and entry-level data processing clerks.",
      "Traditional text-based customer support centers."
    ],
    consequences: {
      positive: [
        "Unprecedented speed in drug discovery and molecular simulation (e.g. AlphaFold).",
        "Dramatic coding productivity gains and rapid prototyping capabilities.",
        "Instant accessibility to personalized educational explanations for students."
      ],
      negative: [
        "Widespread creation of highly convincing deepfakes and fake news.",
        "Major intellectual property disputes over AI scraping copyrighted works.",
        "Vulnerability to automated hacking and social engineering attacks."
      ]
    },
    timeline: [
      { stage: "Before", text: "Computer algorithms are restricted to rule-based programs and simple pattern classification (1950-2010)." },
      { stage: "Major Event", text: "OpenAI launches ChatGPT in November 2022, proving large language models can handle open conversational text." },
      { stage: "Immediate Impact", text: "Global investment surges into GPUs; companies build copilots for office suites and IDEs." },
      { stage: "Long-Term Impact", text: "Autonomous software agents manage complex multi-step workflows, rewriting white-collar economics." }
    ],
    funFacts: [
      "The phrase 'Artificial Intelligence' was first introduced in 1956 at a workshop at Dartmouth College.",
      "AlphaFold predicted the structures of 200 million proteins, solving a biological mystery that would have taken researchers millions of years."
    ]
  },
  smartphones: {
    id: "smartphones",
    title: "Smartphones",
    category: "Technology",
    icon: "smartphones",
    summary: "The consolidation of personal computing, photography, and navigation into a pocket-sized touchscreen device changed daily human habits.",
    stats: [
      { label: "Mobile Web Traffic", beforeValue: "< 0.1% (2006)", afterValue: "55%+ of global web traffic" },
      { label: "Active Handsets", beforeValue: "0 (smartphones)", afterValue: "6.9 Billion worldwide" },
      { label: "Average Screen Time", beforeValue: "0 hours on phones", afterValue: "4.5 to 5.5 hours daily" }
    ],
    comparisons: {
      dailyLife: {
        before: "Carried distinct items: alarm clocks, paper roadmaps, MP3 players, compact cameras, and paper checks.",
        after: "A single pocket device replaces them all. Digital payment wallets and high-resolution cameras are standard.",
      },
      communication: {
        before: "Restricted to voice calls and text messages (SMS) on physical keypads. Emails required a computer.",
        after: "Rich messaging, voice notes, stickers, social media apps, and video calling on the go.",
      },
      education: {
        before: "Studying required paper booklets, note cards, desktop PCs, and physical dictionary lookups.",
        after: "Learning apps (Duolingo), e-books, and educational videos are available anywhere.",
      },
      business: {
        before: "Work stopped when leaving the desk. Transactions required cash, physical cards, or bank checks.",
        after: "Mobile work apps, push notification tasks, digital instant transfers, and the rise of mobile gig work (Uber/delivery).",
      },
      transportation: {
        before: "Navigated with paper maps, landmarks, and street signs. Hailed yellow cabs by waving arms.",
        after: "Real-time GPS navigation, live speed-trap alerts, and app-based ride-hailing services.",
      },
      technology: {
        before: "Cell phones were basic devices with small screens and physical keys, running simple tasks.",
        after: "Powerful multi-core mobile processors, high-res OLED touchscreens, and advanced app stores.",
      },
      society: {
        before: "Waiting rooms and commutes were times of observation, paper reading, or quiet thoughts.",
        after: "Constant alerts, decreased attention spans, social media feeds, and persistent digital documentation of daily life."
      }
    },
    winners: [
      "App developers and mobile game companies.",
      "Gig workers (delivery drivers, rideshare drivers).",
      "Retailers with integrated mobile applications."
    ],
    losers: [
      "Point-and-shoot camera manufacturers.",
      "Printed map publishers and street atlas makers.",
      "Dashboard GPS developers and traditional taxi networks."
    ],
    consequences: {
      positive: [
        "Unprecedented convenience and emergency contact accessibility.",
        "Unlocking banking for millions of unbanked citizens in developing nations.",
        "Immediate capture and recording of historic events in real-time."
      ],
      negative: [
        "Pervasive screen addiction and reduced focus capabilities.",
        "Severe sleep cycle disruption due to nighttime blue light exposure.",
        "Distracted driving leading to increased auto accident rates."
      ]
    },
    timeline: [
      { stage: "Before", text: "Mobile phones are simple devices used for calls and basic texting on physical number pads." },
      { stage: "Major Event", text: "Apple introduces the original iPhone in 2007, showing a capacitive multi-touch screen and clean mobile browser." },
      { stage: "Immediate Impact", text: "App stores launch in 2008, starting an era of mobile-first services like Uber and Instagram." },
      { stage: "Long-Term Impact", text: "Smartphones become the primary screen for digital services, commerce, and global social networking." }
    ],
    funFacts: [
      "The first mobile phone call was made in 1973 by a Motorola engineer who called his chief competitor at Bell Labs.",
      "Nomophobia is the actual psychological term for the fear of being without or unable to use your smartphone."
    ]
  },
  electricity: {
    id: "electricity",
    title: "Electricity",
    category: "Infrastructure",
    icon: "electricity",
    summary: "The harnessing of electrical currents created the modern 24-hour society, replacing fire and steam with clean, instant energy.",
    stats: [
      { label: "Global Access", beforeValue: "< 1% (1880)", afterValue: "91% of global population" },
      { label: "Housework Time", beforeValue: "30+ hours/week", afterValue: "< 5 hours/week" },
      { label: "Productive Hours", beforeValue: "~12 hours (daylight)", afterValue: "24 hours (constant)" }
    ],
    comparisons: {
      dailyLife: {
        before: "Illumination relied on candles, kerosene, or gas. Food preservation required block ice or salting. Chores were manual.",
        after: "Bright electric lights, food stays fresh in refrigerators, and washing machines automate cleanups.",
      },
      communication: {
        before: "Limited to hand-written letters, physical postal couriers, and early mechanical printing methods.",
        after: "Telegraphs, telephones, radios, televisions, and global computer networks communicate instantly.",
      },
      education: {
        before: "Students read by candlelight, risking fires. Schools shut down early during dark winter months.",
        after: "Well-lit classrooms, evening schools, computers, projectors, and digital study tools.",
      },
      business: {
        before: "Factories had to cluster around rivers (waterwheels) or use massive coal-fired steam belt shafts.",
        after: "Independent electric motors power specific machines, and offices run on computers and lighting 24/7.",
      },
      transportation: {
        before: "Horse-drawn streetcars and coal-locomotive passenger trains. Urban streets were filled with animal waste.",
        after: "Electric subway trains, streetcars, electric vehicles, and automated traffic light grids.",
      },
      technology: {
        before: "Mechanical gears, levers, clockworks, and steam pressure pipes dominated technology design.",
        after: "Vacuum tubes, silicon computer chips, generators, and complex national power grids.",
      },
      society: {
        before: "Human life was aligned with natural seasonal daylight. Urban buildings were short to preserve light access.",
        after: "Vertical skylines with electric elevators, standardized time zones, and round-the-clock shift-work economies."
      }
    },
    winners: [
      "Industrial manufacturing companies.",
      "Urban citizens enjoying safer, illuminated streets.",
      "Household appliance makers (refrigerators, washers)."
    ],
    losers: [
      "Kerosene lamp manufacturers.",
      "Whale oil harvesters and merchants.",
      "Commercial ice harvesting operations."
    ],
    consequences: {
      positive: [
        "Drastic drop in foodborne illnesses via electric refrigeration.",
        "Development of life-saving medical devices like ventilators and ECGs.",
        "Dramatically reduced fire hazards in home lighting."
      ],
      negative: [
        "Massive carbon emissions from coal/gas burning power plants.",
        "Ecosystem disruption from light pollution and river dams.",
        "Complete societal vulnerability to power grid failures."
      ]
    },
    timeline: [
      { stage: "Before", text: "Human civilization relies on wood, coal, animal muscle, and fire for light and heat." },
      { stage: "Major Event", text: "Thomas Edison opens Pearl Street Station in NYC (1882), establishing the first commercial electric power grid." },
      { stage: "Immediate Impact", text: "Factories convert to electric motors, cities install bright streetlights, and subways replace streetcars." },
      { stage: "Long-Term Impact", text: "Electrical grids become the mandatory backbone of global communications, computing, and life support." }
    ],
    funFacts: [
      "The 'War of the Currents' was a fierce public relations battle in the 1880s between Edison (DC) and Westinghouse/Tesla (AC).",
      "Electric refrigerators did not become common in average homes until the late 1920s, after safer coolant gases were discovered."
    ]
  },
  printing_press: {
    id: "printing_press",
    title: "The Printing Press",
    category: "Learning",
    icon: "printing",
    summary: "The mechanization of text copying broke the information monopoly of the elite, accelerating science, literacy, and democracy.",
    stats: [
      { label: "Book Production", beforeValue: "5 Months (by hand)", afterValue: "Thousands of pages/hour" },
      { label: "Literacy (Europe)", beforeValue: "~10% (1440)", afterValue: "80%+ (by 1800)" },
      { label: "Cost of a Book", beforeValue: "Equivalent to 1 year of wages", afterValue: "Minutes of average work" }
    ],
    comparisons: {
      dailyLife: {
        before: "Local oral culture. News was passed by word of mouth. Superstition was common due to lack of records.",
        after: "People read newspapers, books, and flyers. Citizens formed independent opinions from printed text.",
      },
      communication: {
        before: "Scribes hand-copied books. Typing errors accumulated over generations, making copies inconsistent.",
        after: "Identical printed pages distributed to thousands, standardizing maps, laws, and texts.",
      },
      education: {
        before: "Learning was highly exclusive, restricted to monks, royals, and wealthy scholars in selective libraries.",
        after: "Textbooks became cheap, libraries expanded, and public schools and scientific journals emerged.",
      },
      business: {
        before: "Contracts, business ledgers, and laws were written by hand, limiting the scope of trade networks.",
        after: "Standardized printed invoices, stock certificates, bank drafts, and printed commodity price sheets.",
      },
      transportation: {
        before: "Travelers navigated by stars, oral advice, and unique hand-drawn maps of inconsistent accuracy.",
        after: "Mass production of navigational charts, maps, and travel booklets made expeditions safer.",
      },
      technology: {
        before: "Technical skills were guarded in secret guilds, passed solely by word of mouth.",
        after: "Printed engineering guides, patent registries, and scientific papers allowed technology ideas to spread.",
      },
      society: {
        before: "High centralization of authority; the masses had to trust elite translations of religious and legal texts.",
        after: "Shattered religious monoculture (Protestant Reformation) and the foundation for modern secular democracies."
      }
    },
    winners: [
      "Scientists, reformers, and universities.",
      "General public gaining access to affordable reading material.",
      "Independent authors, bookbinders, and publishers."
    ],
    losers: [
      "Professional monastery scribes.",
      "Establishment churches losing control over text interpretation.",
      "Feudal lords relying on uneducated populations."
    ],
    consequences: {
      positive: [
        "Preservation of scientific discoveries across generations.",
        "Unification of regional dialects into standard national languages.",
        "Rapid rise in global literacy and public education systems."
      ],
      negative: [
        "Rapid spread of printed propaganda and political pamphlets.",
        "Fueling of religious conflicts through printed pamphlets (e.g. Thirty Years' War).",
        "Introduction of strict state censorship laws and blacklisted books."
      ]
    },
    timeline: [
      { stage: "Before", text: "Monks in quiet libraries manually write bibles and classical manuscripts on animal skin parchment." },
      { stage: "Major Event", text: "Johannes Gutenberg invents the movable type printing press in Mainz, Germany (circa 1440)." },
      { stage: "Immediate Impact", text: "Gutenberg bibles are printed; hundreds of print shops open across Europe within decades." },
      { stage: "Long-Term Impact", text: "The flood of books triggers the Scientific Revolution, the Enlightenment, and modern national public education." }
    ],
    funFacts: [
      "Gutenberg did not get rich. His investor Johann Fust sued him for unpaid debts and seized the print workshop.",
      "Early bibles were printed on vellum (scraped calfskin). A single copy required skins from up to 170 calves."
    ]
  },
  steam_engine: {
    id: "steam_engine",
    title: "The Steam Engine",
    category: "Infrastructure",
    icon: "steam",
    summary: "By converting heat energy into mechanical power, the steam engine freed humanity from the limits of muscle and wind power.",
    stats: [
      { label: "Travel Speed", beforeValue: "4 mph (Horse/Walk)", afterValue: "30+ mph (Train)" },
      { label: "Power Output", beforeValue: "1 HP (draft animal)", afterValue: "Hundreds of HP per engine" },
      { label: "Ocean Transit", beforeValue: "6+ weeks (Sailboat)", afterValue: "10-12 days (Steamship)" }
    ],
    comparisons: {
      dailyLife: {
        before: "Farming routines were tied to seasons and muscle power. Products were made by hand in small cottage setups.",
        after: "People lived by clocks, commuted to factories, and purchased mass-produced items.",
      },
      communication: {
        before: "Letters moved by horse rider or sailing ship, taking weeks to cross continents.",
        after: "Steam trains carried postal bags across land, and steamships ran on set schedules across oceans.",
      },
      education: {
        before: "Apprenticeships focused on traditional manual crafts. Learning was local and family-centered.",
        after: "Engineering and mechanical schools opened. School schedules were adjusted to match factory models.",
      },
      business: {
        before: "Small cottage workshops. Trade was limited to local sales or luxury items that wouldn't spoil.",
        after: "Mass production in centralized urban factories, global commodity markets, and massive industrial firms.",
      },
      transportation: {
        before: "Wooden wagons on dirt tracks, canal barges, and wind-dependent sailing ships.",
        after: "Iron railroads with steam trains, and steel-hull steamships crossing oceans regardless of wind.",
      },
      technology: {
        before: "Wooden waterwheels, windmills, hand-looms, and manual blacksmith bellows.",
        after: "Heavy metal castings, high-pressure steam boilers, mechanical weaving looms, and steel tracks.",
      },
      society: {
        before: "Farming families living in quiet rural villages; land ownership determined social status.",
        after: "Rapid growth of industrial cities, emergence of the working class, labor unions, and a wealthy industrial class."
      }
    },
    winners: [
      "Factory owners, railway barons, and coal operators.",
      "Urban buyers finding cheaper food and clothing.",
      "Global steel manufacturers supplying rails and boilers."
    ],
    losers: [
      "Traditional handloom weavers and artisans.",
      "Canal boat companies and horse breeders.",
      "Peasant farmers displaced by industrial farms."
    ],
    consequences: {
      positive: [
        "Dramatic reduction in the cost of clothing, tools, and consumer goods.",
        "Preventing localized famines by shipping grain quickly across lands.",
        "Opening landlocked regions to global trade."
      ],
      negative: [
        "Heavy air and water pollution in early industrial cities.",
        "Extremely long hours and hazardous conditions for factory workers.",
        "Rise of crowded, disease-prone urban slums."
      ]
    },
    timeline: [
      { stage: "Before", text: "Deep mines flood constantly; water removal is limited to what horse teams can pull up." },
      { stage: "Major Event", text: "James Watt refines the steam engine (1776) by adding a separate condenser, greatly saving fuel." },
      { stage: "Immediate Impact", text: "Steam-powered textile mills grow. Factories move from rural rivers to coal-adjacent cities." },
      { stage: "Long-Term Impact", text: "Railways and steamships connect continents, laying the foundation of global industrial capitalism." }
    ],
    funFacts: [
      "The earliest steam engines (Newcomen, 1712) were so inefficient they were only used at coal mines, where fuel was free.",
      "The speed of steam trains led to the creation of 'Railway Time' in Britain, standardizing clocks across the nation for the first time."
    ]
  },
  ww2: {
    id: "ww2",
    title: "World War II",
    category: "History",
    icon: "ww2",
    summary: "The most destructive conflict in human history reshaped the geopolitical landscape, establishing a new global economic and technological order.",
    stats: [
      { label: "Global Order", beforeValue: "Multipower balance", afterValue: "Bipolar Cold War (US/USSR)" },
      { label: "Flight Tech", beforeValue: "Propeller biplanes", afterValue: "Pressurized jet aircraft" },
      { label: "Decolonization", beforeValue: "European empires rule 40%", afterValue: "Rapid rise of independent nations" }
    ],
    comparisons: {
      dailyLife: {
        before: "Recovering from the Great Depression, characterized by high unemployment and manual farming practices.",
        after: "Post-war baby boom, expansion of suburbs, credit cards, consumer appliances, and high employment.",
      },
      communication: {
        before: "Relied on mechanical printing presses, standard telephone wires, and shortwave AM radio broadcasts.",
        after: "Radar networks, early computers, microwave communication towers, and the rapid rise of TV.",
      },
      education: {
        before: "Higher education was a luxury. Curricula focused on classical arts, literature, and standard trades.",
        after: "GI Bill brings millions of veterans to college; major government funding for university science departments.",
      },
      business: {
        before: "High protectionist trade barriers, gold-backed currencies, and volatile national economies.",
        after: "Bretton Woods system (IMF/World Bank), US dollar as reserve currency, and rising multinational firms.",
      },
      transportation: {
        before: "Propeller-engine passenger planes, steam trains, coal-burning cargo ships, and gravel highways.",
        after: "Commercial jet airplanes, modern highway systems (Interstates), and diesel container ships.",
      },
      technology: {
        before: "Analog calculators, vacuum tube radios, natural materials (wood, steel, rubber), and basic chemistry.",
        after: "Nuclear power, synthetic plastics, penicillin, computing (ENIAC), radar, and jet engines.",
      },
      society: {
        before: "Traditional gender roles (women at home) and dominant European colonial rule.",
        after: "Women entering the workforce permanently, civil rights movements, decolonization, and the United Nations."
      }
    },
    winners: [
      "The United States (emerging with an intact economy and infrastructure).",
      "The Soviet Union (expanding its sphere of influence in Eastern Europe).",
      "Newly independent colonies in Asia and Africa."
    ],
    losers: [
      "European colonial powers (Britain and France faced bankruptcy).",
      "Axis nations (Germany and Japan occupied and destroyed).",
      "Millions of civilian casualties and displaced populations."
    ],
    consequences: {
      positive: [
        "Establishment of the United Nations to prevent future world wars.",
        "Rapid development of life-saving penicillin and radar safety tech.",
        "GI Bill democratizing higher education for working classes."
      ],
      negative: [
        "The nuclear arms race and decades of Cold War dread.",
        "The division of Europe and the installation of the Iron Curtain.",
        "Proliferation of military-grade rockets and ballistic missiles."
      ]
    },
    timeline: [
      { stage: "Before", text: "Rise of aggressive regimes in Germany, Japan, and Italy during global economic depression (1930s)." },
      { stage: "Major Event", text: "Global conflict breaks out (1939-1945), ending with the deployment of atomic bombs in August 1945." },
      { stage: "Immediate Impact", text: "Devastated European and Asian cities, establishment of the UN, and start of the US-Soviet rivalry." },
      { stage: "Long-Term Impact", text: "Decades of post-war economic growth, rapid decolonization, and technological revolution under nuclear deterrence." }
    ],
    funFacts: [
      "Fanta was created in Germany during the war because Coca-Cola syrup could not be imported due to trade embargoes.",
      "The war prompted the invention of silly putty, synthetic rubber, and super glue due to material shortages."
    ]
  },
  covid19: {
    id: "covid19",
    title: "COVID-19 Pandemic",
    category: "History",
    icon: "covid",
    summary: "A global health crisis that accelerated digital transitions, remote work models, and biotechnology development overnight.",
    stats: [
      { label: "Remote Work Rate", beforeValue: "< 5% of white-collar days", afterValue: "30% - 40% of white-collar days" },
      { label: "E-Commerce", beforeValue: "11% of retail sales", afterValue: "20%+ of retail sales" },
      { label: "Vaccine Dev Time", beforeValue: "Typically 10-15 years", afterValue: "326 days (mRNA breakthrough)" }
    ],
    comparisons: {
      dailyLife: {
        before: "Daily physical commutes to offices, face-to-face grocery shopping, and handshakes as default greetings.",
        after: "Zoom meetings, home delivery services (Instacart), contactless checkouts, and QR code menus.",
      },
      communication: {
        before: "In-person meetings and desktop emails. Slack/Teams were secondary communication logs.",
        after: "Video conferencing (Zoom/Teams) as default, online whiteboard tools, and home video setups.",
      },
      education: {
        before: "Classrooms were strictly in-person. Digital portals were used solely for homework uploads.",
        after: "Google Classroom, Canvas, tablets, remote tutoring, and recorded lectures are standard tools.",
      },
      business: {
        before: "Commercial real estate was highly priced. Supply chains operated on single-source, just-in-time delivery.",
        after: "Office space downsizing, diversified supply chains (just-in-case), and rapid cloud migration.",
      },
      transportation: {
        before: "Packed transit trains, high-volume corporate travel, and cheap international flights.",
        after: "Suburban car usage increased, permanent drop in business travel, and higher airline pricing.",
      },
      technology: {
        before: "Slow adoption of telehealth, digital signatures, online banking, and collaborative cloud tools.",
        after: "Telehealth as a standard option, DocuSign ubiquity, contactless NFC payments, and mRNA platforms.",
      },
      society: {
        before: "High trust in supply chains. Handshakes, unmasked public spaces, and standard flu habits.",
        after: "Awareness of public health, mask acceptance, social polarization, and work-life balance focus."
      }
    },
    winners: [
      "Streaming services (Netflix) and delivery platforms.",
      "Cloud software companies (Zoom, Microsoft, Slack).",
      "Pharmaceutical firms developing mRNA platforms."
    ],
    losers: [
      "Commercial real estate owners.",
      "Business-class hotels and corporate travel providers.",
      "Traditional sit-down dining restaurants."
    ],
    consequences: {
      positive: [
        "Unlocking mRNA technology for cancers and future viruses.",
        "Increased flexibility for workers through hybrid/remote office hours.",
        "Rapid adoption of digital tools in traditional fields."
      ],
      negative: [
        "Severe mental health challenges and isolation during lock-downs.",
        "Learning loss for school children due to remote learning gaps.",
        "Global inflation surges from supply chain breakdowns."
      ]
    },
    timeline: [
      { stage: "Before", text: "People gather in crowded offices and events worldwide without thinking about virus transmission." },
      { stage: "Major Event", text: "WHO declares COVID-19 a global pandemic in March 2020, triggering lock-downs." },
      { stage: "Immediate Impact", text: "Shift to remote work, toilet paper shortages, mask mandates, and financial stimulus." },
      { stage: "Long-Term Impact", text: "Hybrid work setups stabilize, inflation increases, and supply chains move closer to home ports." }
    ],
    funFacts: [
      "Zoom's daily meeting participants grew from 10 million in December 2019 to over 300 million in April 2020.",
      "The pandemic sparked a massive baking craze, causing a global shortage of yeast and flour in 2020."
    ]
  },
  gps: {
    id: "gps",
    title: "GPS Navigation",
    category: "Technology",
    icon: "gps",
    summary: "The opening of satellite positioning to the public revolutionized logistics, transit, and location-based software.",
    stats: [
      { label: "Navigational Error", beforeValue: "1 - 5 kilometers", afterValue: "3 - 10 meters" },
      { label: "Routing Speed", beforeValue: "15 minutes (paper map)", afterValue: "Instant (Turn-by-turn)" },
      { label: "Location Economy", beforeValue: "Negligible market size", afterValue: "$1.4 Trillion+ annually" }
    ],
    comparisons: {
      dailyLife: {
        before: "Carried paper street atlases, stopped at gas stations for directions, and got lost frequently.",
        after: "Drive anywhere confidently with real-time ETA, traffic rerouting, and nearby search pins.",
      },
      communication: {
        before: "Describing routes over the phone with instructions like 'turn left at the red barn'.",
        after: "Sharing live locations, pin drops, and sending ETA links to friends via messaging apps.",
      },
      education: {
        before: "Students memorized capitals, topography, and map-reading coordinates. Geography was paper-bound.",
        after: "Interactive maps (Google Earth), digital spatial analysis, and geocaching projects are used in schools.",
      },
      business: {
        before: "Logistics relied on radio dispatch, scheduled checkpoints, paper maps, and local route knowledge.",
        after: "Just-in-time delivery fleets, asset tracking, geo-targeted mobile advertising, and autonomous agriculture.",
      },
      transportation: {
        before: "Aviation/marine transit used radio beacons, stars, and lighthouses. Getting lost in fog was dangerous.",
        after: "Autopilot flight routing, precision marine navigation, container ship tracking, and app-based ride-hailing.",
      },
      technology: {
        before: "Navigation required specialized, expensive compasses, sextants, and line-of-sight radio towers.",
        after: "A constellation of 31 active atomic-clock-equipped satellites broadcasting precise time signals to tiny receiver chips.",
      },
      society: {
        before: "Local knowledge of streets was highly valued (e.g., London taxi driver exams). Travel required planning.",
        after: "The erosion of map-reading skills, reliance on algorithms, rise of the gig economy, and outdoor recreation safety."
      }
    },
    winners: [
      "Ride-hailing apps (Uber, Lyft) and delivery drivers.",
      "Logistics companies optimizing routes.",
      "Smartphone users navigating unfamiliar cities."
    ],
    losers: [
      "Paper map publishers.",
      "Dashboard GPS device makers.",
      "Traditional dispatch taxi networks."
    ],
    consequences: {
      positive: [
        "Dramatic reduction in search-and-rescue response times.",
        "Reduced fuel consumption in global commercial shipping.",
        "Precise time-syncing for cellular networks and power grids."
      ],
      negative: [
        "Pervasive location tracking and surveillance privacy concerns.",
        "Geopolitical reliance on a satellite network run by the US military.",
        "Occasional accidents due to drivers blindly following faulty routing."
      ]
    },
    timeline: [
      { stage: "Before", text: "Ships and aircraft navigate using stars, beacons, and estimation, risking missing landfalls." },
      { stage: "Major Event", text: "US military launches first GPS satellite (1978); system becomes fully operational in 1995." },
      { stage: "Immediate Impact", text: "Selective Availability is turned off (2000), improving civilian accuracy from 100m to 10m." },
      { stage: "Long-Term Impact", text: "Integration of GPS chips in phones enables ridesharing, geotagged apps, and autonomous deliveries." }
    ],
    funFacts: [
      "GPS satellites carry atomic clocks that must be adjusted for relativity (they run 38 microseconds fast per day).",
      "GPS is operated and funded entirely by the US Space Force, but is free for anyone globally to use."
    ]
  },
  social_media: {
    id: "social_media",
    title: "Social Media",
    category: "Technology",
    icon: "social",
    summary: "The transition from static webpages to algorithmically curated social feeds redefined human attention, marketing, and public discourse.",
    stats: [
      { label: "Active Users", beforeValue: "0 (2000)", afterValue: "5.07 Billion active users" },
      { label: "News Source", beforeValue: "Daily printed papers/TV", afterValue: "Real-time viral feeds" },
      { label: "Daily Time Spent", beforeValue: "0 minutes", afterValue: "Average 2.5 hours per user" }
    ],
    comparisons: {
      dailyLife: {
        before: "Checked on friends via landlines or in-person visits. Sharing photos required printing rolls of film.",
        after: "Scrolling feeds, posting stories, reacting to posts, and maintaining digital public profiles.",
      },
      communication: {
        before: "One-to-one (phone/letters) or one-to-many via traditional broadcast media curated by editors.",
        after: "Many-to-many interactive communication. Viral posts reach millions without gatekeepers.",
      },
      education: {
        before: "Learning was structured through classrooms, textbooks, and vetted educational documentaries.",
        after: "Educational channels, study groups on Discord, and video tutorials, alongside high distraction risks.",
      },
      business: {
        before: "Advertising relied on expensive print, TV, radio, and billboards. Customer support was via phone.",
        after: "Micro-targeted ads, influencer partnerships, social commerce, and direct brand messaging on feeds.",
      },
      transportation: {
        before: "Travel spots were discovered via guidebooks or word of mouth. Photos were kept in home albums.",
        after: "Instagram-driven tourism spikes, geo-tagged travel trends, and travel vlogging influence.",
      },
      technology: {
        before: "Websites were static directories (Web 1.0) with guestbooks. Content generation required coding.",
        after: "Web 2.0 dynamic feeds, cloud-hosted media uploads, and recommendation algorithms.",
      },
      society: {
        before: "People shared a centralized consensus of reality based on national broadcasts.",
        after: "Polarized online echo chambers, cancel culture, and validation based on likes."
      }
    },
    winners: [
      "Tech platforms selling ad space.",
      "Content creators and digital influencers.",
      "Direct-to-consumer micro-brands."
    ],
    losers: [
      "Traditional print and broadcast advertisers.",
      "Local community clubs and physical leagues.",
      "Adolescent mental health."
    ],
    consequences: {
      positive: [
        "Rapid mobilization for social causes (e.g. ice bucket challenge).",
        "Global connectivity for niche interest groups and families.",
        "Democratization of content creation and self-publishing."
      ],
      negative: [
        "Erosion of public trust in shared factual news.",
        "Increased rates of anxiety and depression in teenagers.",
        "Shorter attention spans due to rapid video feeds."
      ]
    },
    timeline: [
      { stage: "Before", text: "Internet users browse static websites and coordinate in basic chat rooms." },
      { stage: "Major Event", text: "Facebook (2004) and Twitter (2006) launch, changing the web from static directories to social feeds." },
      { stage: "Immediate Impact", text: "Mass migration of users online, decline of blogging, and the rise of the like button." },
      { stage: "Long-Term Impact", text: "Algorithmic feed recommendation (TikTok) dominates global attention, shaping politics and habits." }
    ],
    funFacts: [
      "The hashtag (#) was proposed by a user in 2007; Twitter initially rejected it as 'too nerdy'.",
      "The 'like' button on Facebook was originally going to be called the 'awesome' button."
    ]
  },
  railways: {
    id: "railways",
    title: "Railways",
    category: "Infrastructure",
    icon: "railways",
    summary: "The expansion of iron tracks and steam locomotives integrated remote regions, establishing national markets and standard time.",
    stats: [
      { label: "Freight Cost", beforeValue: "$0.25 / ton-mile (wagon)", afterValue: "$0.01 / ton-mile (rail)" },
      { label: "NY to Chicago", beforeValue: "3 - 4 weeks (Horse coach)", afterValue: "Under 24 hours (Steam train)" },
      { label: "Urban Sprawl", beforeValue: "Port cities only", afterValue: "Landlocked inland hubs flourish" }
    ],
    comparisons: {
      dailyLife: {
        before: "Diets were strictly local. Travel beyond one's village was rare, and life was slow-paced.",
        after: "Access to fresh out-of-season food, affordable travel, commuter habits, and a faster daily pace.",
      },
      communication: {
        before: "Letters took weeks to cross land. Mail coaches were frequently delayed by mud or robbery.",
        after: "Railway post offices sorted mail on the move, delivering letters in days instead of weeks.",
      },
      education: {
        before: "Schools were small local schoolhouses. Advanced colleges were concentrated in coastal capitals.",
        after: "Universities drew students from nationwide. Traveling scholars easily shared books.",
      },
      business: {
        before: "Small local markets. High shipping costs prevented landlocked industrial growth.",
        after: "National markets emerged. Wheat, cattle, and coal shipped cheaply, creating large firms.",
      },
      transportation: {
        before: "Horse-drawn carriages, oxen wagons, mud roads, and slow river canal barges.",
        after: "Scheduled passenger and cargo trains running on steel tracks independent of weather.",
      },
      technology: {
        before: "Manual metal forging, wooden vehicles, and dirt roads. Heavy industry was restricted.",
        after: "Bessemer steel rails, steam locomotives, telegraph coordination, and air brakes.",
      },
      society: {
        before: "Regional identities were dominant. Dialects varied widely. Local solar time ruled.",
        after: "Creation of standardized time zones, national cultural identity, and suburban expansion."
      }
    },
    winners: [
      "Industrialists and coal mine operators.",
      "Agricultural exporters shipping crops.",
      "General travelers and land speculators."
    ],
    losers: [
      "Canal boat companies and stagecoach operators.",
      "Tavern owners along old turnpike roads.",
      "Native American tribes displaced by tracks."
    ],
    consequences: {
      positive: [
        "Prevented local famines by moving grain rapidly.",
        "Created standardized time zones across nations.",
        "Fueled the initial growth of the Industrial Revolution."
      ],
      negative: [
        "Massive displacement of indigenous populations.",
        "High financial speculation leading to railway market bubbles.",
        "Air pollution from coal-burning locomotives."
      ]
    },
    timeline: [
      { stage: "Before", text: "Goods are moved slowly by pack horses and canal boats, blocked by winter freezing." },
      { stage: "Major Event", text: "George Stephenson opens the Liverpool & Manchester Railway (1830), the first scheduled inter-city line." },
      { stage: "Immediate Impact", text: "Railway mania sweeps nations; thousands of miles of tracks are laid in a speculative boom." },
      { stage: "Long-Term Impact", text: "Transcontinental lines link coasts, inland cities boom, and national markets establish corporate capitalism." }
    ],
    funFacts: [
      "Before railways, every town set its own clock based on the sun. Noon in New York was 11:48 AM in Philadelphia.",
      "The first commercial railways used wooden rails faced with thin strips of iron, which sometimes peeled up and pierced the train floor."
    ]
  },
  space_exploration: {
    id: "space_exploration",
    title: "Space Exploration",
    category: "History",
    icon: "space",
    summary: "Humanity's expansion into orbit enabled global weather modeling, telecommunications, and a new perspective of our home planet.",
    stats: [
      { label: "Active Satellites", beforeValue: "0 satellites", afterValue: "9,500+ active satellites" },
      { label: "Space Economy", beforeValue: "$0", afterValue: "$546 Billion global economy" },
      { label: "Cosmic Vision", beforeValue: "Blurry Earth telescopes", afterValue: "Space observatories (JWST/Hubble)" }
    ],
    comparisons: {
      dailyLife: {
        before: "Weather forecasting was local and inaccurate. Long-distance communication was strictly wired.",
        after: "Accurate hurricane warnings, live satellite TV, and satellite internet in remote regions.",
      },
      communication: {
        before: "Undersea copper cables and shortwave radio. Capacity was limited and fragile.",
        after: "High-capacity communication satellites, global TV broadcasts, and space-based internet (Starlink).",
      },
      education: {
        before: "Science textbooks taught that humans were locked to Earth. Astronomy was limited by atmosphere distortion.",
        after: "Stunning images of distant galaxies in schools, space camps, and astrophysics studies.",
      },
      business: {
        before: "No satellite telemetry. Shipping logistics and agriculture relied on guesswork.",
        after: "Satellite crop monitoring, global logistics tracking, and private space launch companies (SpaceX).",
      },
      transportation: {
        before: "Aircraft navigated by visual contact and ground beacons. Ships relied on compasses.",
        after: "Precision satellite-guided aviation and trans-oceanic flight routing.",
      },
      technology: {
        before: "Bulky analog computers and primitive vacuum tube components.",
        after: "Microprocessors, solar cells, memory foam, scratch-resistant lenses, and advanced alloys.",
      },
      society: {
        before: "Earth was viewed as endless and indestructible. Geopolitical boundaries were the limit of ambition.",
        after: "The 'Overview Effect' (Earth viewed as a fragile blue marble), and global environmental movements."
      }
    },
    winners: [
      "Telecom providers and satellite operators.",
      "Meteorologists and climate researchers.",
      "Defense and global logistics industries."
    ],
    losers: [
      "Traditional landline monopolies.",
      "Analog maritime charting services.",
      "Astronomers affected by satellite streaks in night skies."
    ],
    consequences: {
      positive: [
        "Global environmental monitoring (ozone layer recovery, deforestation).",
        "Extreme technological spinoffs like LEDs, water filters, and GPS.",
        "Inspiration for generations to pursue STEM careers."
      ],
      negative: [
        "Accumulation of orbital space debris threatening future launches.",
        "Increased militarization and satellite warfare systems development.",
        "High public funding cost during early space race periods."
      ]
    },
    timeline: [
      { stage: "Before", text: "Humans look at the moon and stars, limited to science fiction stories and earth-bound telescopes." },
      { stage: "Major Event", text: "The Soviet Union launches Sputnik 1 into orbit in October 1957, starting the space race." },
      { stage: "Immediate Impact", text: "US-Soviet space race culminates in Apollo 11 moon landing (1969); creation of NASA and early satellites." },
      { stage: "Long-Term Impact", text: "Establishment of the International Space Station, private spaceflight, planetary rovers, and constellation networks." }
    ],
    funFacts: [
      "Sputnik 1 was only the size of a beach ball, took 98 minutes to orbit Earth, and did nothing but emit a simple 'beep' radio signal.",
      "Many everyday consumer products are NASA spinoffs, including memory foam, scratch-resistant lenses, and cordless vacuum cleaners."
    ]
  }
};

// Premium SVG icon component renderer
const renderPremiumIcon = (iconKey, className = "w-5 h-5") => {
  switch (iconKey) {
    case "internet":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      );
    case "ai":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case "smartphones":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    case "electricity":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "printing":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case "steam":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "ww2":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case "covid":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "gps":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "social":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l4.632-2.316m0 0a3 3 0 102.267-4.914 3 3 0 00-2.267 4.914zm-4.632 2.316A3 3 0 1111 8a3 3 0 01-2.268 2.742zm4.632 2.316l-4.632 2.316m0 0a3 3 0 102.267 4.914 3 3 0 00-2.267-4.914z" />
        </svg>
      );
    case "railways":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 012-2h10a2 2 0 012 2m-14 0a2 2 0 002 2h10a2 2 0 002-2M7 8l-2 8m14-8l2 8M9 4v16m6-16v16" />
        </svg>
      );
    case "space":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84-5.84M21 3L11.5 12.5M21 3v5m0-5h-5m-9 9a6 6 0 00-5.84-5.84M3 21l9.5-9.5M3 21v-5m0 5h5" />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
  }
};

const CATEGORIES = [
  { key: "dailyLife", label: "Daily Life", iconPath: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { key: "communication", label: "Communication", iconPath: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { key: "education", label: "Education", iconPath: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" },
  { key: "business", label: "Business & Economy", iconPath: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "transportation", label: "Transportation & Travel", iconPath: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
  { key: "technology", label: "Technology & Tools", iconPath: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h0z" },
  { key: "society", label: "Society & Culture", iconPath: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" }
];

const LOADING_STEPS = [
  "Connecting to Groq API...",
  "Scanning historic archives...",
  "Retrieving socio-economic parameters...",
  "Synthesizing before and after metrics...",
  "Structuring chronological timeline...",
  "Extracting unexpected consequences...",
  "Formatting report details..."
];

export default function BeforeAfterPage() {
  const IS_RELEASED = false;

  useEffect(() => {
    if (!IS_RELEASED && typeof window !== "undefined") {
      window.location.replace("/?focus=tools");
    }
  }, []);

  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const [showSelector, setShowSelector] = useState(false);

  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const loadingTimerRef = useRef(null);

  // Close search suggestions when clicking outside the container
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Initialize page title and load recent searches from localStorage
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Before & After | Boring Tools";

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("before_after_recent_searches");
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }

    return () => {
      document.title = previousTitle;
      if (loadingTimerRef.current) window.clearInterval(loadingTimerRef.current);
    };
  }, []);

  // Show auto-fading toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  // Save recent searches to state & localStorage
  const saveSearchQuery = (term) => {
    if (!term || term.trim() === "") return;
    const cleanTerm = term.trim();
    const filtered = recentSearches.filter((item) => item.toLowerCase() !== cleanTerm.toLowerCase());
    const updated = [cleanTerm, ...filtered].slice(0, 5); // store up to 5 items
    setRecentSearches(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("before_after_recent_searches", JSON.stringify(updated));
    }
  };

  // Clear recent searches
  const handleClearRecent = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("before_after_recent_searches");
    }
    showToast("Recent searches cleared", "success");
  };

  // Dynamic search suggestions
  const searchSuggestions = useMemo(() => {
    if (!query.trim()) return [];
    const normalized = query.toLowerCase().trim();
    return Object.values(DATASET).filter((topic) => {
      // match title, category, or summary keywords
      return (
        topic.title.toLowerCase().includes(normalized) ||
        topic.category.toLowerCase().includes(normalized) ||
        topic.id.toLowerCase().includes(normalized)
      );
    });
  }, [query]);

  // Execute matching selection
  const handleSelectTopic = (topicKey) => {
    const topic = DATASET[topicKey];
    if (topic) {
      setSelectedTopic(topic);
      setQuery(topic.title);
      setShowSuggestions(false);
      setSource("Local Preset");
      setError("");
      setShowSelector(false);
      saveSearchQuery(topic.title);
      showToast(`Loaded comparison for ${topic.title}`, "success");
    }
  };

  // Local fallback parsing
  const runLocalFallback = (topicToSearch, reason) => {
    const trimmed = topicToSearch.toLowerCase().trim();
    
    // Look for keyword synonyms mappings
    const keywordsMap = {
      internet: ["web", "network", "online", "email", "www", "broadband", "ethernet", "website"],
      ai: ["artificial intelligence", "chatgpt", "llm", "machine learning", "neural network", "automation", "robot", "copilot", "brain"],
      smartphones: ["iphone", "android", "cellphone", "phone", "mobile", "app", "touchscreen", "cellular"],
      electricity: ["power", "bulb", "light", "grid", "alternating current", "voltage", "current", "edison", "tesla"],
      printing_press: ["book", "bible", "printing", "gutenberg", "read", "literacy", "scribe", "manuscript"],
      steam_engine: ["locomotive", "train", "coal", "industrial revolution", "steamship", "factory", "watt"],
      ww2: ["world war", "second world war", "war", "atomic", "nazis", "superpowers", "united nations", "conflict"],
      covid19: ["covid", "pandemic", "virus", "lockdown", "corona", "vaccine", "mask", "telehealth", "zoom"],
      gps: ["navigation", "satellite", "directions", "map", "uber", "coordinate", "positioning", "location"],
      social_media: ["facebook", "twitter", "tiktok", "instagram", "feed", "likes", "influencer", "hashtag"],
      railways: ["rail", "train", "locomotive", "tracks", "commute", "station", "gauge", "stephenson"],
      space_exploration: ["nasa", "moon", "sputnik", "space", "satellite", "starlink", "apollo", "orbit", "rocket"]
    };

    let matchedKey = null;

    // Check title substring matches
    for (const [key, topic] of Object.entries(DATASET)) {
      if (topic.title.toLowerCase().includes(trimmed)) {
        matchedKey = key;
        break;
      }
    }

    // Check custom keywords if no substring matches
    if (!matchedKey) {
      for (const [key, keywords] of Object.entries(keywordsMap)) {
        if (keywords.some((kw) => trimmed.includes(kw) || kw.includes(trimmed))) {
          matchedKey = key;
          break;
        }
      }
    }

    setSource("Local Fallback");
    setError(`Groq API issue (${reason}). Loaded local offline database.`);
    setIsLoading(false);

    if (matchedKey) {
      setSelectedTopic(DATASET[matchedKey]);
      setQuery(DATASET[matchedKey].title);
      saveSearchQuery(DATASET[matchedKey].title);
      showToast(`Loaded offline match: ${DATASET[matchedKey].title}`, "warning");
    } else {
      setShowSelector(true);
      showToast("Offline: no direct local match. Select an option below.", "warning");
    }
  };

  // Keyword lookup mapping client input to presets (for custom search entry)
  const handleSearchSubmit = async (inputTopic) => {
    const topicToSearch = inputTopic !== undefined ? inputTopic : query;
    const normalized = topicToSearch.toLowerCase().trim();
    setShowSuggestions(false);
    
    if (!normalized) {
      showToast("Please enter a topic", "error");
      return;
    }

    // 1. Exact match check against local presets to save API requests and load instantly
    const exactLocalKey = Object.keys(DATASET).find(
      key => key === normalized || DATASET[key].title.toLowerCase() === normalized
    );

    if (exactLocalKey) {
      setSelectedTopic(DATASET[exactLocalKey]);
      setQuery(DATASET[exactLocalKey].title);
      setSource("Local Preset");
      setError("");
      setShowSelector(false);
      saveSearchQuery(DATASET[exactLocalKey].title);
      showToast(`Loaded comparison for ${DATASET[exactLocalKey].title}`, "success");
      return;
    }

    // 2. Custom query - Call Groq LLM API
    setIsLoading(true);
    setSelectedTopic(null);
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
    }, 300);

    try {
      const response = await fetch("/api/before-after", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicToSearch.trim() })
      });

      if (loadingTimerRef.current) {
        window.clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }

      const payload = await response.json();

      if (response.ok && payload.title && payload.comparisons) {
        setSelectedTopic(payload);
        setSource("Groq AI");
        saveSearchQuery(payload.title);
        setQuery(payload.title);
        setIsLoading(false);
        showToast(`AI Analysis generated for ${payload.title}`, "success");
        return;
      }

      // API returned error or incomplete structure, run fallback
      runLocalFallback(topicToSearch.trim(), payload?.error || "Invalid response format");
    } catch (err) {
      if (loadingTimerRef.current) {
        window.clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
      runLocalFallback(topicToSearch.trim(), "Network or server failure");
    }
  };

  // Compile comparison results into a copyable Markdown string
  const copyableReportText = useMemo(() => {
    if (!selectedTopic) return "";

    const divider = "==================================================";
    let text = `BEFORE & AFTER REPORT: ${selectedTopic.title.toUpperCase()}\n`;
    text += `Category: ${selectedTopic.category}\n`;
    text += `${selectedTopic.summary}\n`;
    text += `${divider}\n\n`;

    text += `KEY QUANTITATIVE TRANSITIONS:\n`;
    selectedTopic.stats.forEach((s) => {
      text += `- ${s.label}: ${s.beforeValue}  ==>  ${s.afterValue}\n`;
    });
    text += `\n${divider}\n\n`;

    text += `BEFORE vs AFTER COMPARISONS:\n\n`;
    CATEGORIES.forEach((cat) => {
      const comp = selectedTopic.comparisons[cat.key];
      text += `[${cat.label.toUpperCase()}]\n`;
      text += `BEFORE: ${comp.before}\n`;
      text += `AFTER:  ${comp.after}\n\n`;
    });
    text += `${divider}\n\n`;

    text += `IMPACT PROFILE:\n`;
    text += `- Biggest Winners: ${selectedTopic.winners.join(" ")}\n`;
    text += `- Biggest Losers: ${selectedTopic.losers.join(" ")}\n\n`;

    text += `Unexpected Consequences:\n`;
    text += `• Positive: ${selectedTopic.consequences.positive.join(" | ")}\n`;
    text += `• Negative: ${selectedTopic.consequences.negative.join(" | ")}\n\n`;
    text += `${divider}\n\n`;

    text += `TIMELINE TRANSITION:\n`;
    selectedTopic.timeline.forEach((step) => {
      text += `- ${step.stage}: ${step.text}\n`;
    });
    text += `\n${divider}\n\n`;

    text += `FUN FACTS:\n`;
    selectedTopic.funFacts.forEach((fact) => {
      text += `• ${fact}\n`;
    });

    return text;
  }, [selectedTopic]);

  // Copy report to clipboard
  const handleCopyReport = async () => {
    if (!copyableReportText) return;
    try {
      await navigator.clipboard.writeText(copyableReportText);
      showToast("Report copied to clipboard!", "success");
    } catch (e) {
      showToast("Failed to copy report", "error");
    }
  };

  // Download report as a .txt file
  const handleDownloadReport = () => {
    if (!copyableReportText || typeof window === "undefined") return;

    const blob = new Blob([copyableReportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const fileNameTopic = selectedTopic.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    link.download = `before-after-${fileNameTopic}-report.txt`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Report download started!", "success");
  };

  // Reset page state to allow another comparison
  const handleClear = () => {
    setQuery("");
    setSelectedTopic(null);
    setError("");
    setSource("");
    setShowSelector(false);
    setIsLoading(false);
    showToast("Cleared inputs", "success");
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);
  };

  // Action button: Scroll back up to compare another topic
  const handleCompareAnother = () => {
    setSelectedTopic(null);
    setQuery("");
    setError("");
    setSource("");
    setShowSelector(false);
    setIsLoading(false);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);
  };

  if (!IS_RELEASED) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-orange-100 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm font-semibold text-slate-600">Redirecting to Boring Tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-10 sm:py-14">
      
      {/* Toast Alert Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 animate-bounce transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {toast.type === "success" ? (
            <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      <div className="mx-auto max-w-6xl">
        
        {/* Tool Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
            Before & After
          </h1>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Understand how major inventions, historical events, scientific discoveries, or technological breakthroughs changed the world by comparing life BEFORE and AFTER they happened.
          </p>
        </div>

        {/* Dashboard grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Inputs, Preset Grid, Search History */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-700 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search Breakthroughs</span>
              </h2>

              {/* Search input with custom autocomplete suggestions */}
              <div ref={searchContainerRef} className="relative">
                <label htmlFor="topic-input" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Enter Inventions or Events
                </label>
                <div className="flex gap-2">
                  <input
                    ref={searchInputRef}
                    id="topic-input"
                    type="text"
                    value={query}
                    onFocus={() => setShowSuggestions(true)}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    placeholder="e.g. Internet, Electricity, Space..."
                    onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none transition placeholder-slate-400 text-slate-900"
                    autoComplete="off"
                  />
                  <button
                    onClick={handleSearchSubmit}
                    className="rounded-xl bg-slate-900 hover:bg-black font-semibold text-white text-sm px-4 py-3 shadow transition active:scale-[0.98] cursor-pointer"
                  >
                    Compare
                  </button>
                </div>

                {/* Autocomplete Dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 z-10 rounded-xl border border-slate-200 bg-white shadow-xl max-h-60 overflow-y-auto p-1">
                    {searchSuggestions.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectTopic(item.id)}
                        className="w-full text-left rounded-lg px-4 py-3 text-sm transition hover:bg-orange-50 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="text-orange-500 shrink-0">
                            {renderPremiumIcon(item.icon, "w-4 h-4")}
                          </div>
                          <span className="font-bold text-slate-800">{item.title}</span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Searches</span>
                    <button
                      onClick={handleClearRecent}
                      className="text-[10px] font-bold text-rose-600 hover:text-rose-700 transition cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuery(term);
                          handleSearchSubmit(term);
                        }}
                        className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-200 text-slate-600 hover:text-orange-700 font-semibold transition cursor-pointer text-left truncate max-w-[150px]"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">Popular presets</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              {/* Popular Presets Grid */}
              <div className="grid grid-cols-2 gap-2">
                {Object.values(DATASET).map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleSelectTopic(topic.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition group cursor-pointer text-center ${
                      selectedTopic?.id === topic.id
                        ? "border-orange-400 bg-orange-50/50 text-orange-800"
                        : "border-slate-100 bg-slate-50/50 hover:bg-orange-50 hover:border-orange-200 text-slate-700"
                    }`}
                  >
                    <div className={`p-2 rounded-lg shadow-sm border transition mb-1.5 ${
                      selectedTopic?.id === topic.id
                        ? "bg-white border-orange-200 text-orange-600"
                        : "bg-white border-slate-100 group-hover:bg-orange-100/50 group-hover:border-orange-200 text-slate-500 group-hover:text-orange-700"
                    }`}>
                      {renderPremiumIcon(topic.icon, "w-5 h-5")}
                    </div>
                    <span className="text-[11px] font-bold tracking-tight">{topic.title}</span>
                  </button>
                ))}
              </div>

            </div>

            {/* Privacy Shield Info */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Privacy Statement</span>
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Before & After queries a secure, private API to dynamically generate comparisons for custom topics. Preset selections are processed 100% offline, and your search history remains entirely on your computer via local storage.
              </p>
            </div>

          </div>

          {/* Right Panel: Results, Timelines, Statistics */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Empty State */}
            {!isLoading && !selectedTopic && !showSelector && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[460px]">
                <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 mb-5 animate-pulse">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Awaiting Selection</h3>
                <p className="text-sm text-slate-500 max-w-sm mt-2 leading-relaxed">
                  Enter a historical breakthrough or select one of the popular presets on the left to map life before and after it occurred.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mt-10 text-left">
                  <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 flex items-start gap-2.5">
                    <div className="text-orange-600 shrink-0 mt-0.5">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-slate-800 text-xs font-bold block mb-0.5">7 Comparison Categories</span>
                      <span className="text-slate-500 text-[10px] leading-normal block">Contrasts Daily Life, Travel, Tech, and Society side-by-side.</span>
                    </div>
                  </div>
                  <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 flex items-start gap-2.5">
                    <div className="text-orange-600 shrink-0 mt-0.5">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-slate-800 text-xs font-bold block mb-0.5">Metrics & Timelines</span>
                      <span className="text-slate-500 text-[10px] leading-normal block">Quantifies transition stats and documents chronological event steps.</span>
                    </div>
                  </div>
                  <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 flex items-start gap-2.5">
                    <div className="text-orange-600 shrink-0 mt-0.5">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-slate-800 text-xs font-bold block mb-0.5">Winners & Facts</span>
                      <span className="text-slate-500 text-[10px] leading-normal block">Highlights biggest winners/losers and curious historical trivia.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[460px]">
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-orange-100 animate-pulse"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Generating Comparison</h3>
                <p className="text-sm text-slate-500 max-w-sm mt-2 animate-pulse h-12">
                  {LOADING_STEPS[loadingStepIndex]}
                </p>
              </div>
            )}

            {/* Selector Panel (When dynamic API fails and no local match) */}
            {!isLoading && showSelector && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                <div className="text-center max-w-md mx-auto space-y-2">
                  <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto text-orange-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Select Preset Analogy</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    We couldn&apos;t connect to the AI model or match &ldquo;{query}&rdquo; to a local key. Please choose a related option from our offline library:
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.values(DATASET).map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => {
                        setSelectedTopic(comp);
                        setShowSelector(false);
                        setSource("Local Preset");
                        setError("");
                        showToast(`Loaded parallel: ${comp.title}`);
                      }}
                      className="p-4 rounded-xl border border-slate-200 hover:border-orange-400 bg-white hover:bg-orange-50/30 text-left transition space-y-3 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 group-hover:bg-orange-100 rounded-xl transition border border-slate-100 group-hover:border-orange-200">
                          {renderPremiumIcon(comp.icon, "w-6 h-6 text-slate-600 group-hover:text-orange-850 transition")}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-orange-800 text-sm">{comp.title}</h4>
                          <span className="text-[10px] uppercase font-bold text-slate-400">{comp.category}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 leading-normal line-clamp-2">
                        {comp.summary}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results Active Panel */}
            {!isLoading && selectedTopic && (
              <div className="space-y-6">
                
                {/* Active Result Top Control Bar */}
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-700">
                      <span>Breakthrough Map Engaged</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        {source === "Groq AI" ? (
                          <>
                            <svg className="w-3.5 h-3.5 text-orange-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Groq AI Generated
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {source}
                          </>
                        )}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      Active: {selectedTopic.title}
                    </h3>
                  </div>
                  <div className="shrink-0 flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleCopyReport}
                      className="flex-1 sm:flex-initial text-center justify-center inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow transition active:scale-[0.98] cursor-pointer"
                    >
                      <svg className="w-4 h-4 mr-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                      </svg>
                      Copy Results
                    </button>
                    <button
                      onClick={handleDownloadReport}
                      className="flex-1 sm:flex-initial text-center justify-center inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-orange-400 bg-white hover:bg-orange-50/50 text-orange-700 text-xs font-bold shadow transition active:scale-[0.98] cursor-pointer"
                    >
                      <svg className="w-4 h-4 mr-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4" />
                      </svg>
                      Download Report
                    </button>
                  </div>
                </div>

                {/* Error Banner if Fallback is Active */}
                {error && (
                  <div className="text-xs text-orange-850 bg-orange-50/50 border border-orange-200 rounded-xl p-3.5 flex flex-col gap-1.5">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-orange-700">Offline Fallback Engaged</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Summary Intro Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-50 border border-orange-100 rounded-2xl text-orange-600">
                      {renderPremiumIcon(selectedTopic.icon, "w-7 h-7")}
                    </div>
                    <div>
                      <span className="text-xs uppercase font-bold text-orange-600 tracking-wider">Breakthrough Profile</span>
                      <h3 className="text-xl font-black text-slate-900 leading-tight">{selectedTopic.title}</h3>
                      <span className="text-xs text-slate-500 font-semibold">{selectedTopic.category} Category</span>
                    </div>
                  </div>
                  <hr className="border-slate-100" />
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {selectedTopic.summary}
                  </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedTopic.stats.map((stat, idx) => (
                    <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between space-y-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                      <div className="grid grid-cols-2 gap-2 text-center relative divide-x divide-slate-100">
                        <div className="pr-1.5">
                          <span className="block text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1">Before</span>
                          <span className="text-xs font-bold text-slate-700 leading-snug block">{stat.beforeValue}</span>
                        </div>
                        <div className="pl-1.5">
                          <span className="block text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">After</span>
                          <span className="text-xs font-bold text-slate-900 leading-snug block">{stat.afterValue}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Column Headers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="hidden md:flex items-center justify-center p-3 rounded-xl border border-rose-100 bg-rose-50/40 text-rose-800 font-bold text-sm tracking-widest uppercase">
                    ← BEFORE BREAKTHROUGH
                  </div>
                  <div className="hidden md:flex items-center justify-center p-3 rounded-xl border border-emerald-100 bg-emerald-50/40 text-emerald-800 font-bold text-sm tracking-widest uppercase">
                    AFTER BREAKTHROUGH →
                  </div>
                </div>

                {/* Comparisons Rows */}
                <div className="space-y-6">
                  {CATEGORIES.map((cat) => {
                    const comparison = selectedTopic.comparisons[cat.key];
                    return (
                      <div key={cat.key} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        
                        {/* Section Bar Title */}
                        <div className="bg-slate-50 border-b border-slate-200/60 px-5 py-3.5 flex items-center gap-2">
                          <div className="p-1 bg-white border border-slate-200 rounded-lg text-slate-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d={cat.iconPath} />
                            </svg>
                          </div>
                          <span className="font-extrabold text-sm text-slate-800 tracking-tight">{cat.label}</span>
                        </div>

                        {/* Side-by-side Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                          
                          {/* Before box */}
                          <div className="p-5 bg-rose-50/10 space-y-2">
                            <div className="flex items-center gap-1.5 md:hidden mb-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                              <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider">Before</span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                              {comparison.before}
                            </p>
                          </div>

                          {/* After box */}
                          <div className="p-5 bg-emerald-50/10 space-y-2">
                            <div className="flex items-center gap-1.5 md:hidden mb-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">After</span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                              {comparison.after}
                            </p>
                          </div>

                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Impact Profile: Winners vs Losers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Winners Card */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <span>Biggest Winners</span>
                    </h4>
                    <ul className="space-y-3">
                      {selectedTopic.winners.map((winner, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                          <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold shrink-0 mt-0.5 text-[10px]">
                            {idx + 1}
                          </span>
                          <span>{winner}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Losers Card */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                      </div>
                      <span>Biggest Losers</span>
                    </h4>
                    <ul className="space-y-3">
                      {selectedTopic.losers.map((loser, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                          <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 flex items-center justify-center font-bold shrink-0 mt-0.5 text-[10px]">
                            {idx + 1}
                          </span>
                          <span>{loser}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Unexpected Consequences Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <span>Unexpected Consequences</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Positive side-effects */}
                    <div className="p-4 rounded-xl bg-emerald-50/30 border border-emerald-100/50 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Positive Side Effects
                      </span>
                      <ul className="space-y-1.5 list-disc pl-4 text-xs text-slate-600 leading-relaxed">
                        {selectedTopic.consequences.positive.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Negative side-effects */}
                    <div className="p-4 rounded-xl bg-rose-50/30 border border-rose-100/50 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        Negative Side Effects
                      </span>
                      <ul className="space-y-1.5 list-disc pl-4 text-xs text-slate-600 leading-relaxed">
                        {selectedTopic.consequences.negative.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>

                  </div>
                </div>

                {/* Timeline flow */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                  <div className="text-center max-w-sm mx-auto space-y-1">
                    <span className="text-xs uppercase font-extrabold text-orange-600 tracking-wider">Historical Progression</span>
                    <h3 className="text-xl font-black text-slate-900">Comparative Timeline</h3>
                  </div>

                  {/* Vertical Timeline timeline track */}
                  <div className="relative border-l-2 border-dashed border-slate-200 pl-6 sm:pl-8 ml-3 sm:ml-6 space-y-8 py-2">
                    {selectedTopic.timeline.map((step, idx) => (
                      <div key={idx} className="relative space-y-1">
                        
                        {/* Bullet Circle Indicator */}
                        <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 border-orange-500 bg-white flex items-center justify-center z-10">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                        </div>

                        {/* Title of Stage */}
                        <h4 className="text-xs font-black text-orange-700 uppercase tracking-widest bg-orange-50 border border-orange-100 rounded px-2 py-0.5 inline-block">
                          {step.stage}
                        </h4>
                        
                        {/* Text explanation */}
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold">
                          {step.text}
                        </p>

                      </div>
                    ))}
                  </div>
                </div>

                {/* Fun Facts Trivia Card */}
                <div className="rounded-2xl border border-slate-200 bg-orange-50/40 p-6 shadow-sm space-y-4 border-dashed">
                  <h4 className="text-sm font-extrabold text-orange-900 flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-orange-100 text-orange-700 border border-orange-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <span>Interesting Fun Facts</span>
                  </h4>
                  <ul className="space-y-3">
                    {selectedTopic.funFacts.map((fact, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                        <span className="text-orange-500 shrink-0 font-extrabold mt-0.5 select-none">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom navigation action triggers */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-200/60 justify-between">
                  <button
                    onClick={handleCompareAnother}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-black font-semibold text-white text-sm shadow transition active:scale-[0.98] cursor-pointer"
                  >
                    Compare Another Topic
                  </button>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleClear}
                      className="flex-grow sm:flex-grow-0 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-600 text-sm py-3 px-4 transition active:scale-[0.98] cursor-pointer"
                    >
                      Clear Results
                    </button>
                    <button
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        showToast("Scrolled to search input", "success");
                      }}
                      className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-600 text-sm p-3 transition active:scale-[0.98] cursor-pointer flex items-center justify-center"
                      title="Back to Top"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    </button>
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
