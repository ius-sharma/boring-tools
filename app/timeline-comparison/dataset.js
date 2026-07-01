// 100% Client-side structured local dataset for Timeline Comparison tool
// Supports Civilizations, Technology, and Historical Events comparison

export const HISTORICAL_DATASET = {
  // === CIVILIZATIONS ===
  "roman-empire": {
    id: "roman-empire",
    name: "Roman Empire",
    category: "Civilizations",
    icon: "civilization",
    timeline: {
      started: "27 BC (Founding under Augustus)",
      peak: "117 AD (Maximum expansion under Trajan)",
      decline: "395 AD (Split into Western & Eastern Empires)",
      end: "476 AD (Fall of Rome) / 1453 AD (Fall of Constantinople)"
    },
    duration: {
      totalYears: 503, // Western Empire (27 BC to 476 AD)
      totalYearsDisplay: "503 Years (Western) / 1480 Years (with Eastern/Byzantine)",
      peakYearsDisplay: "96 AD – 180 AD (Pax Romana)",
      note: "One of the longest-lasting empires in Western history."
    },
    geography: {
      region: "Mediterranean Basin, Southern Europe, North Africa, Western Asia",
      maxAreaKm: 5000000,
      maxAreaDisplay: "5.0 million km²",
      importantCities: ["Rome", "Constantinople", "Alexandria", "Antioch", "Carthage"]
    },
    population: {
      peakNum: 70000000,
      peakDisplay: "70 Million",
      note: "Represented roughly 20-25% of the world's population at its peak."
    },
    economy: {
      trade: "Vast maritime trade networks across the Mediterranean, Silk Road connections.",
      wealth: "Immense agricultural production, mining of precious metals, tribute from provinces.",
      currency: "Denarius (silver), Aureus (gold), Sestertius (bronze)",
      industries: ["Agriculture (Grain, Olive Oil, Wine)", "Mining", "Slavery-based construction", "Pottery"]
    },
    technology: ["Roman concrete", "Aqueducts", "Paved roads (50,000 miles)", "Arched bridges", "Sewer systems (Cloaca Maxima)"],
    military: {
      strength: "Highly organized, disciplined legions; professional standing army.",
      expansion: "Conquest of Hispania, Gaul, Britannia, Greece, Egypt, and parts of Mesopotamia.",
      importantBattles: ["Battle of Actium (31 BC)", "Teutoburg Forest (9 AD)", "Siege of Jerusalem (70 AD)", "Battle of Adrianople (378 AD)"]
    },
    society: {
      education: "Privately funded tutoring for elites; literacy focused on law, rhetoric, and literature.",
      lifestyle: "Stratified social structure (patricians, plebeians, slaves), public bath houses, gladiatorial games.",
      culture: "Graeco-Roman synthesis, Latin literature, public spectacles, philosophy (Stoicism).",
      religion: "Polytheistic Roman pantheon (Jupiter, Mars, etc.), later adopting Christianity as official state religion.",
      architecture: "Colosseum, Pantheon, Roman forums, triumphal arches, massive aqueducts."
    },
    achievements: [
      "Roman Law (Twelve Tables, Justinian Code) forming the basis of Western legal systems.",
      "Engineering of durable roads, bridges, and architectural concrete structures.",
      "The spread of the Latin language, which evolved into modern Romance languages.",
      "Establishing a resilient bureaucratic and administrative model of governance."
    ],
    declineReason: "Overexpansion, economic inflation, political instability (Crisis of the 3rd Century), constant barbarian invasions, military dependency on mercenaries, and the division of the empire.",
    legacy: "Modern legal systems, Latinate languages, engineering concepts, republican government ideals, and the spread of Christianity all trace direct paths back to Rome.",
    funFacts: [
      "Romans used urine as a cleaning agent for clothes and teeth due to its high ammonia content.",
      "The Colosseum could be flooded to host mock naval battles (naumachiae).",
      "Rome's first paved road, the Appian Way, is still usable today after over 2,300 years."
    ]
  },
  "british-empire": {
    id: "british-empire",
    name: "British Empire",
    category: "Civilizations",
    icon: "civilization",
    timeline: {
      started: "1607 (Establishment of Jamestown, North America)",
      peak: "1921 (Post-WWI territorial acquisitions)",
      decline: "1947 (Independence of India, start of decolonization)",
      end: "1997 (Handover of Hong Kong to China)"
    },
    duration: {
      totalYears: 390,
      totalYearsDisplay: "390 Years",
      peakYearsDisplay: "1815 – 1914 (Pax Britannica)",
      note: "Known as the empire on which the sun never sets."
    },
    geography: {
      region: "Global (territories on all continents)",
      maxAreaKm: 35500000,
      maxAreaDisplay: "35.5 million km²",
      importantCities: ["London", "Calcutta (Kolkata)", "Hong Kong", "Sydney", "Cairo", "Cape Town"]
    },
    population: {
      peakNum: 458000000,
      peakDisplay: "458 Million",
      note: "Encompassed roughly 23% of the world's population in the 1920s."
    },
    economy: {
      trade: "Mercantilist policies, control of global maritime trade routes, free trade advocacy.",
      wealth: "Industrial manufacturing, colonial extraction of resources, global financial domination.",
      currency: "Pound Sterling (Gold Standard)",
      industries: ["Textiles", "Coal & Iron", "Shipping & Shipbuilding", "Banking & Insurance", "Agriculture & Tea Plantation"]
    },
    technology: ["Steam locomotive", "Telegraph networks (All-Red Line)", "Maxim machine gun", "Ironclad warships", "Sanitary reforms"],
    military: {
      strength: "Unrivaled naval supremacy (Royal Navy); small professional army augmented by colonial forces (e.g., British Indian Army).",
      expansion: "Colonization of North America, Australia, India, large parts of Africa, and Southeast Asia.",
      importantBattles: ["Battle of Trafalgar (1805)", "Battle of Waterloo (1815)", "Siege of Delhi (1857)", "Battle of the Somme (1916)"]
    },
    society: {
      education: "Establishment of public schools, universities across colonies; export of English language education.",
      lifestyle: "Victorian morals, class rigidity, urbanization, growth of the working class and domestic service.",
      culture: "Spread of English literature, parliamentary system, sports (cricket, football, rugby), afternoon tea.",
      religion: "Anglicanism/Protestant Christianity, though ruling over massive Hindu, Muslim, and Buddhist populations.",
      architecture: "Victorian Gothic, Neoclassical government buildings across the globe, train terminals."
    },
    achievements: [
      "Spread of the English language as the global lingua franca.",
      "Development and export of parliamentary democracy and Common Law.",
      "Leading role in the global Industrial Revolution and infrastructure building.",
      "Leading global efforts to suppress the transatlantic slave trade (West Africa Squadron)."
    ],
    declineReason: "Economic exhaustion from WWI and WWII, rising nationalist and independence movements in colonies (especially India), pressure from the United States, and the cost of maintaining a global military presence.",
    legacy: "The English language, parliamentary systems, global sports, legal systems, and the Commonwealth of Nations all stem from British colonial rule.",
    funFacts: [
      "At its peak, the British Empire covered more area than the surface of the Moon (about 38 million km²).",
      "The empire was largely run on tea; the British East India Company single-handedly changed global agricultural history to secure tea supplies.",
      "The first public railway in the world, the Stockton and Darlington Railway, opened in Britain in 1825."
    ]
  },
  "ottoman-empire": {
    id: "ottoman-empire",
    name: "Ottoman Empire",
    category: "Civilizations",
    icon: "civilization",
    timeline: {
      started: "1299 (Founded by Osman I in Anatolia)",
      peak: "1520 - 1566 (Reign of Suleiman the Magnificent)",
      decline: "1683 (Failure of the Second Siege of Vienna)",
      end: "1922 (Abolition of the Sultanate by Turkish Republic)"
    },
    duration: {
      totalYears: 623,
      totalYearsDisplay: "623 Years",
      peakYearsDisplay: "1520 – 1683",
      note: "Served as a bridge between the Eastern and Western worlds for six centuries."
    },
    geography: {
      region: "Southeastern Europe (Balkans), Western Asia (Middle East), North Africa",
      maxAreaKm: 5200000,
      maxAreaDisplay: "5.2 million km²",
      importantCities: ["Constantinople (Istanbul)", "Cairo", "Damascus", "Baghdad", "Buda", "Salonica"]
    },
    population: {
      peakNum: 30000000,
      peakDisplay: "30 Million (in 1600s)",
      note: "Multi-ethnic and multi-religious population spanning three continents."
    },
    economy: {
      trade: "Control of the trade routes between Europe and Asia (Silk Road, spice routes).",
      wealth: "Agricultural taxation (Timar system), trade duties, gold/silver mines in Balkans.",
      currency: "Akçe (silver), Sultani (gold)",
      industries: ["Silk and Textile manufacturing", "Spice trade mediation", "Agriculture", "Carpet weaving"]
    },
    technology: ["Advanced heavy gunpowder artillery (super cannons)", "Medical institutions (hospitals)", "Surgical instruments", "Complex aqueduct restoration", "Astronomical observatories"],
    military: {
      strength: "Elite infantry (Janissaries) recruited via devshirme; formidable cavalry (Sipahis); pioneered gunpowder warfare.",
      expansion: "Conquered Byzantine Empire, Balkans, Hungary, Egypt, Levant, Mesopotamia, and coastal North Africa.",
      importantBattles: ["Battle of Kosovo (1389)", "Fall of Constantinople (1453)", "Battle of Mohács (1526)", "Battle of Lepanto (1571)", "Battle of Vienna (1683)"]
    },
    society: {
      education: "Madrasah system for religious/legal education; Enderun School for civil servants and military elites.",
      lifestyle: "Millet system (religious self-governance), coffeehouse culture, public baths (hamams).",
      culture: "Sufism, calligraphy, miniature painting, Turkish-Persian-Arabic literary fusion, carpet design.",
      religion: "Islam (Sunni Caliphate), with protected religious minorities (Christians, Jews) under dhimmi status.",
      architecture: "Süleymaniye Mosque, Blue Mosque, Topkapi Palace, domed structures designed by Chief Architect Mimar Sinan."
    },
    achievements: [
      "Mastery of early gunpowder technology and military logistics.",
      "The Millet system, representing a highly structured model of multi-religious tolerance.",
      "Preservation and expansion of Islamic and Byzantine administrative models.",
      "Creating some of the world's most spectacular Islamic religious and civic architecture."
    ],
    declineReason: "Failure to industrialize, military stagnation, defeat in the Siege of Vienna, loss of trade monopoly due to European discovery of ocean routes, rise of nationalistic rebellions in the Balkans, and disastrous alliance in WWI.",
    legacy: "Modern borders of the Middle East and Balkans, Turkish cuisine, coffeehouse culture, and Islamic architectural monuments throughout Southeastern Europe.",
    funFacts: [
      "Ottoman doctors used music, water sounds, and aromatherapy to treat patients in mental hospitals centuries before modern therapy.",
      "Tulips were originally popularized in the Ottoman Empire (sparking a tulip mania later in Holland) and became a symbol of the Sultans.",
      "The Janissaries were the first standing army in Europe to wear standardized uniforms and march to military band music."
    ]
  },
  "mughal-empire": {
    id: "mughal-empire",
    name: "Mughal Empire",
    category: "Civilizations",
    icon: "civilization",
    timeline: {
      started: "1526 (Babur defeats Ibrahim Lodi at First Battle of Panipat)",
      peak: "1700 (Reign of Aurangzeb, near-total unification of India)",
      decline: "1707 (Death of Aurangzeb, succession disputes, rise of Marathas)",
      end: "1857 (Sepoy Mutiny, British exile of Bahadur Shah Zafar)"
    },
    duration: {
      totalYears: 331,
      totalYearsDisplay: "331 Years",
      peakYearsDisplay: "1556 – 1707 (Akbar to Aurangzeb)",
      note: "Unified the Indian subcontinent and generated massive global wealth."
    },
    geography: {
      region: "Indian subcontinent (Modern India, Pakistan, Bangladesh, Afghanistan)",
      maxAreaKm: 4000000,
      maxAreaDisplay: "4.0 million km²",
      importantCities: ["Agra", "Delhi", "Lahore", "Fatehpur Sikri", "Dhaka"]
    },
    population: {
      peakNum: 150000000,
      peakDisplay: "150 Million (in 1700)",
      note: "Accounted for nearly 25% of the global population in the late 17th century."
    },
    economy: {
      trade: "Global exporter of cotton textiles, spices, silk, and saltpeter. Highly commercialized economy.",
      wealth: "World's largest economy in 1700 (surpassing China and Western Europe), representing 25% of global GDP.",
      currency: "Rupiya (silver), Dam (copper), Mohur (gold)",
      industries: ["Textile manufacturing (Muslin)", "Agriculture (indigo, sugar, grains)", "Shipbuilding", "Metalworking"]
    },
    technology: ["Seamless celestial globes", "Rocket artillery (precursor to Congreve rockets)", "Advanced metallurgy (Wootz steel)", "Detailed surveying techniques"],
    military: {
      strength: "Composite army of cavalry, war elephants, and matchlock infantry; heavy reliance on artillery units.",
      expansion: "Unified Northern India, expanded into the Deccan Plateau, parts of Assam, and Afghanistan.",
      importantBattles: ["First Battle of Panipat (1526)", "Battle of Khanwa (1527)", "Second Battle of Panipat (1556)", "Battle of Haldighati (1576)", "Battle of Saraighat (1671)"]
    },
    society: {
      education: "Patronage of scholars, poets, and libraries; education centered in madrasahs and temples.",
      lifestyle: "Wealthy court lifestyle, complex administrative hierarchy (Mansabdari system), religious tolerance under Akbar.",
      culture: "Indo-Persian synthesis, classical Hindustani music, Ghazal poetry, miniature painting.",
      religion: "Islam (ruling class), with a vast Hindu majority. Akbar attempted a syncretic religion (Din-i Ilahi).",
      architecture: "Taj Mahal, Red Fort, Shalimar Gardens, Humayun's Tomb, Jama Masjid."
    },
    achievements: [
      "Construction of the Taj Mahal, widely considered one of the wonders of the world.",
      "Unification of India's fragmented kingdoms under a centralized administration.",
      "Creation of the silver Rupiya, which became the ancestor of the modern Rupee.",
      "Unmatched global production and export of high-quality cotton textiles."
    ],
    declineReason: "Expensive military campaigns under Aurangzeb, religious conflicts disrupting the social fabric, rise of rival powers (Maratha Empire, Sikhs), decentralization, and the economic encroachment of the British East India Company.",
    legacy: "Modern Indian administrative structure, Hindustani culture, the Rupee currency, Urdu language, and architectural landmarks that draw millions of tourists.",
    funFacts: [
      "The Mughal Emperor Akbar, though illiterate himself, amassed a library of over 24,000 manuscripts and had books read to him daily.",
      "The Taj Mahal changes color depending on the time of day, appearing pinkish in the morning, milky white in the evening, and golden under the moon.",
      "The Peacock Throne, built for Emperor Shah Jahan, was made of solid gold and encrusted with hundreds of gems, including the Koh-i-Noor diamond."
    ]
  },
  "maurya-empire": {
    id: "maurya-empire",
    name: "Maurya Empire",
    category: "Civilizations",
    icon: "civilization",
    timeline: {
      started: "322 BC (Founded by Chandragupta Maurya)",
      peak: "268 - 232 BC (Reign of Ashoka the Great)",
      decline: "232 BC (Death of Ashoka, succession struggles, fragmentation)",
      end: "185 BC (Assassination of Brihadratha by Pushyamitra Shunga)"
    },
    duration: {
      totalYears: 137,
      totalYearsDisplay: "137 Years",
      peakYearsDisplay: "268 BC – 232 BC",
      note: "The first empire to unify the majority of the Indian subcontinent."
    },
    geography: {
      region: "Indian Subcontinent (Modern India, Pakistan, Bangladesh, Afghanistan)",
      maxAreaKm: 5000000,
      maxAreaDisplay: "5.0 million km²",
      importantCities: ["Pataliputra (Patna)", "Taxila", "Ujjain", "Tosali"]
    },
    population: {
      peakNum: 50000000,
      peakDisplay: "50 Million",
      note: "Encompassed around 33% of the world's population at the time."
    },
    economy: {
      trade: "Internal trade routes (Grand Trunk Road precursor), maritime trade with Greece, Hellenistic kingdoms, and Southeast Asia.",
      wealth: "State-controlled mines, forests, and liquor trade. Extensive agricultural taxation.",
      currency: "Pana (silver coins stamped with symbols)",
      industries: ["Agriculture", "Metallurgy", "Weaving", "Woodworking", "Sparsely state-run monopolies"]
    },
    technology: ["Advanced stone carving and polishing", "Stupa construction", "Iron metallurgy", "Irrigation planning", "Arthashastra-derived economic statecraft"],
    military: {
      strength: "Massive standing army: 600,000 infantry, 30,000 cavalry, 9,000 war elephants, and 8,000 chariots.",
      expansion: "Overthrew Nanda Dynasty, defeated Seleucus I Nicator (gaining Afghanistan), conquered Kalinga.",
      importantBattles: ["Mauryan-Seleucid War (305 BC)", "Kalinga War (261 BC)"]
    },
    society: {
      education: "Taxila was a global center of learning (sciences, political theory, medicine).",
      lifestyle: "Rigid caste system described by Megasthenes, state-sponsored welfare, public hospitals for humans and animals.",
      culture: "Buddhist philosophy, rock-cut architecture, Ashokan edicts written in Brahmi script.",
      religion: "Hinduism, Buddhism (highly promoted by Ashoka), and Jainism (adopted by Chandragupta Maurya).",
      architecture: "Great Stupa at Sanchi, Ashoka Pillars, Barabar Caves (earliest rock-cut caves)."
    },
    achievements: [
      "The spread of Buddhism from a local sect into a major global religion.",
      "The Edicts of Ashoka, carved on pillars and cliffs, promoting moral law and religious tolerance.",
      "Unification of India's disparate regions under a single political administration.",
      "Construction of the Royal Highway (precursor to the Grand Trunk Road)."
    ],
    declineReason: "Weak successors after Ashoka, financial drain of maintaining a massive army and bureaucracy, coup by military commander Pushyamitra Shunga, and decentralization leading to provincial defections.",
    legacy: "Ashoka's Lion Capital is the official National Emblem of India, and the Wheel of Law (Ashoka Chakra) sits at the center of the Indian national flag.",
    funFacts: [
      "Chandragupta Maurya voluntarily abdicated his throne, became a Jain monk, and died of self-starvation (Sallekhana) in a cave.",
      "Ashoka established the world's first veterinary hospitals and banned animal sacrifices across his empire.",
      "Pataliputra, the capital, was protected by a wooden wall with 570 towers and 64 gates, surrounded by a 900-foot-wide moat."
    ]
  },
  "gupta-empire": {
    id: "gupta-empire",
    name: "Gupta Empire",
    category: "Civilizations",
    icon: "civilization",
    timeline: {
      started: "319 AD (Founded by Sri Gupta / Chandragupta I)",
      peak: "375 - 415 AD (Reign of Chandragupta II / Vikramaditya)",
      decline: "480 AD (Invasions of Huns / Alchon Huns)",
      end: "543 AD (Death of last ruler Vishnugupta)"
    },
    duration: {
      totalYears: 224,
      totalYearsDisplay: "224 Years",
      peakYearsDisplay: "335 AD – 455 AD",
      note: "Reigned during the 'Golden Age of India', characterized by scientific and cultural explosions."
    },
    geography: {
      region: "Northern, Central, and parts of Western India",
      maxAreaKm: 3500000,
      maxAreaDisplay: "3.5 million km²",
      importantCities: ["Pataliputra", "Ayodhya", "Ujjain", "Prayagraj"]
    },
    population: {
      peakNum: 40000000,
      peakDisplay: "40 Million",
      note: "Strong urban centers with a dense agrarian population."
    },
    economy: {
      trade: "Active trade with the Roman Empire, East Africa, Southeast Asia, and China. Control of western ports.",
      wealth: "High agricultural productivity, gold mine exploitation, export of luxury goods (spices, silks).",
      currency: "Dinara (highly artistic gold coins), silver coins",
      industries: ["Textiles", "Spices", "Ivory carving", "Metallurgy", "Agriculture"]
    },
    technology: ["Decimal numeral system (including zero)", "Iron pillar of Delhi (rust-free metallurgy)", "Calculated length of solar year (Aryabhata)", "Heliocentric theory drafts", "Advanced plastic surgery"],
    military: {
      strength: "Composite army using heavy steel-tipped longbows, cavalry, and armored war elephants; decentralized feudal levies.",
      expansion: "Subjugated northern kingdoms, formed matrimonial alliances in Central India, defeated Western Kshatrapas.",
      importantBattles: ["Campaigns of Samudragupta (chronicled on Allahabad Pillar)", "Defeat of the Shakas by Chandragupta II"]
    },
    society: {
      education: "Nalanda University was established, drawing students from all over Asia for science, philosophy, and logic.",
      lifestyle: "Prosperous urban life, low crime rates, absence of capital punishment (as noted by Chinese pilgrim Faxian).",
      culture: "Golden age of Sanskrit literature (Kalidasa), classical Indian dance, painting (Ajanta caves).",
      religion: "Revival of Hinduism (Vaishnavism), while patronizing Buddhist and Jain monasteries.",
      architecture: "Dashavatara Temple (early stone temple architecture), Ajanta and Ellora rock-cut temples."
    },
    achievements: [
      "Invention of the base-10 positional numeral system and the concept of Zero.",
      "Aryabhata's calculation of Pi (3.1416) and discovery that the Earth rotates on its axis.",
      "Writing of the Kamasutra, Panchatantra fables, and completion of the Mahabharata and Ramayana.",
      "Creation of the Delhi Iron Pillar, which has remained completely rust-free for 1,600 years."
    ],
    declineReason: "Repeated invasions by the Hunas (White Huns/Alchon Huns) exhausting imperial treasury, weak successors, internal rebellions, and the disintegration of central authority into feudal kingdoms.",
    legacy: "The mathematical concepts developed during this era (zero, decimal system) traveled to the Arab world and Western Europe, forming the basis of modern science.",
    funFacts: [
      "Gupta gold coins are considered some of the most beautiful and artistic coins in ancient history, depicting kings playing lutes or fighting lions.",
      "The game of Chess originated during the Gupta Empire under the name Chaturanga (representing four military divisions).",
      "Sushruta's medical texts from this era described rhinoplasty (nose reconstruction surgery) using a flap of skin from the forehead."
    ]
  },
  "mongol-empire": {
    id: "mongol-empire",
    name: "Mongol Empire",
    category: "Civilizations",
    icon: "civilization",
    timeline: {
      started: "1206 (Genghis Khan unifies nomadic tribes)",
      peak: "1279 (Conquest of China under Kublai Khan)",
      decline: "1294 (Division into four independent khanates)",
      end: "1368 (Fall of the Yuan Dynasty in China) / 1502 (Fall of Golden Horde)"
    },
    duration: {
      totalYears: 162,
      totalYearsDisplay: "162 Years (Unified) / 300+ Years (as independent Khanates)",
      peakYearsDisplay: "1259 – 1294 (Pax Mongolica)",
      note: "The largest contiguous land empire in human history."
    },
    geography: {
      region: "Eurasia (From Sea of Japan to Eastern Europe, Siberia to Persian Gulf)",
      maxAreaKm: 24000000,
      maxAreaDisplay: "24.0 million km²",
      importantCities: ["Karakorum", "Khanbaliq (Beijing)", "Sarai", "Tabriz", "Samarkand"]
    },
    population: {
      peakNum: 110000000,
      peakDisplay: "110 Million",
      note: "Ruled over more than a quarter of the Earth's total population."
    },
    economy: {
      trade: "Revival of the Silk Road under unified control, securing caravan routes (Pax Mongolica).",
      wealth: "Tribute collection, taxation of trade routes, distribution of spoils among nomadic elites.",
      currency: "Paper currency (Chao), silver ingots (Sycee)",
      industries: ["Pastoralism (animal husbandry)", "Trade brokerage", "Artisanal workshops in conquered cities"]
    },
    technology: ["Composite recurve bow", "Stirrups and saddle warfare", "Yassa law code", "Örtöö postal relay system (Yam)", "Adopted gunpowder from China"],
    military: {
      strength: "Highly mobile, equestrian archers; master tacticians in psychological warfare and siege engineering.",
      expansion: "Conquered China, Central Asia, Persia, Russia, and Eastern Europe.",
      importantBattles: ["Battle of Kalka River (1223)", "Battle of Mohi (1241)", "Fall of Baghdad (1258)", "Battle of Ain Jalut (1260)"]
    },
    society: {
      education: "Low literacy among Mongols initially; adopted Uighur script. State-sponsored mapping and astronomy.",
      lifestyle: "Nomadic, yurt-dwelling (gers), egalitarian status for Mongol women compared to sedentary societies.",
      culture: "Nomadic customs, oral poetry, synthesis of Persian, Chinese, and Russian bureaucratic techniques.",
      religion: "Tengrism (shamanism) initially; high religious tolerance. Later branches converted to Islam and Buddhism.",
      architecture: "Portable felt tents (yurts), Karakorum stone structures, Chinese palace layouts (Dadu)."
    },
    achievements: [
      "Establishing the first transcontinental postal relay system (the Yam system).",
      "Re-establishing safe, unified trade across the entirety of Eurasia (Pax Mongolica).",
      "Enacting absolute religious tolerance across a massive, diverse population.",
      "Introduction of diplomatic immunity for foreign ambassadors."
    ],
    declineReason: "Overexpansion, fragmentation into four separate khanates (Yuan Dynasty, Ilkhanate, Chagatai Khanate, Golden Horde), civil wars of succession, assimilation into local cultures, and the devastation of the Black Death.",
    legacy: "Unified Russia's disparate principalities, opened European eyes to East Asia (via Marco Polo), and altered global genetics.",
    funFacts: [
      "The Yam postal system was so efficient that a message could travel 200 miles a day using fresh horses at relay stations.",
      "Genghis Khan's DNA is estimated to be present in roughly 1 in 200 men alive today (about 16 million descendants).",
      "A traveler could walk from Europe to China with a golden plate on their head without fear of robbery due to strict Mongol laws."
    ]
  },
  "ancient-egypt": {
    id: "ancient-egypt",
    name: "Ancient Egypt",
    category: "Civilizations",
    icon: "civilization",
    timeline: {
      started: "3100 BC (Unification of Upper and Lower Egypt by Narmer)",
      peak: "1479 - 1425 BC (New Kingdom, conquests of Thutmose III)",
      decline: "1077 BC (Third Intermediate Period, division and foreign rule)",
      end: "30 BC (Death of Cleopatra, annexation by Roman Empire)"
    },
    duration: {
      totalYears: 3070,
      totalYearsDisplay: "3,070 Years",
      peakYearsDisplay: "1550 BC – 1077 BC (New Kingdom)",
      note: "One of the longest-lived continuous civilizations in world history."
    },
    geography: {
      region: "Nile River Valley, Northeast Africa",
      maxAreaKm: 1000000,
      maxAreaDisplay: "1.0 million km² (at peak)",
      importantCities: ["Memphis", "Thebes (Luxor)", "Alexandria", "Giza", "Avaris"]
    },
    population: {
      peakNum: 5000000,
      peakDisplay: "5 Million",
      note: "Highly concentrated along the fertile banks of the Nile River."
    },
    economy: {
      trade: "Imported cedar wood from Levant, gold from Nubia, incense/myrrh from Punt. State-controlled granaries.",
      wealth: "Flooding of the Nile providing highly fertile soil, massive agricultural surplus.",
      currency: "Barter system, copper/silver weights (Deben), late adoption of Greek coins",
      industries: ["Agriculture (Wheat, Barley, Flax)", "Stone quarrying", "Papyrus production", "Beer brewing", "Glassmaking"]
    },
    technology: ["Papyrus paper", "Hieroglyphic writing", "Solar calendar (365 days)", "Ramps and levers", "Embalming/mummification techniques"],
    military: {
      strength: "Conscripted infantry, adoption of light horse-drawn chariots (Hyksos influence), composite bows.",
      expansion: "Expanded south into Nubia, and northeast into the Levant and Syria.",
      importantBattles: ["Battle of Megiddo (1457 BC)", "Battle of Kadesh (1274 BC)"]
    },
    society: {
      education: "Scribal schools for writing, administration, and geometry; restricted to elite classes.",
      lifestyle: "Agrarian cycles governed by Nile flooding, elaborate funerary preparation, relative legal equality for women.",
      culture: "Highly conservative artistic canons, monumental sculpture, obsession with the afterlife.",
      religion: "Polytheistic mythology (Ra, Osiris, Isis, Anubis), king viewed as living god (Horus).",
      architecture: "Giza Pyramids, Great Sphinx, Karnak Temple, Valley of the Kings, obelisks."
    },
    achievements: [
      "Engineering the Great Pyramid of Giza, the tallest man-made structure for over 3,800 years.",
      "Development of a 365-day calendar based on the astronomical rising of the star Sirius.",
      "Invention of papyrus, the direct ancestor of modern paper.",
      "Pioneering complex surgical procedures, splints, and anatomical knowledge through mummification."
    ],
    declineReason: "Invasions by Sea Peoples, costly military conflicts, division of the country between priests and pharaohs, civil wars, and conquest by foreign powers (Assyrians, Persians, Greeks under Alexander, and Romans).",
    legacy: "Influenced Greek architecture, geometry, and religion; pyramids and mummies remain central icons of archaeological fascination and pop culture.",
    funFacts: [
      "Egyptian workers who built the pyramids were paid in beer (about 4-5 liters a day) and were respected paid laborers, not slaves.",
      "Both men and women wore heavy eye makeup (kohl) to protect their skin from the desert sun and prevent infections.",
      "Cleopatra, the last active Pharaoh, lived closer in time to the Moon Landing (1969 AD) than to the building of the Great Pyramid (c. 2560 BC)."
    ]
  },
  "ancient-greece": {
    id: "ancient-greece",
    name: "Ancient Greece",
    category: "Civilizations",
    icon: "civilization",
    timeline: {
      started: "776 BC (First recorded Olympic Games)",
      peak: "480 - 404 BC (Classical Period, Golden Age of Athens)",
      decline: "338 BC (Conquest by Philip II of Macedon)",
      end: "146 BC (Battle of Corinth, annexation by Rome)"
    },
    duration: {
      totalYears: 630,
      totalYearsDisplay: "630 Years (Classical/Hellenistic eras)",
      peakYearsDisplay: "480 BC – 323 BC (Classical Athens to death of Alexander)",
      note: "Not a single empire, but a collection of independent city-states (poleis) sharing a culture."
    },
    geography: {
      region: "Southern Balkan Peninsula, Aegean Sea islands, coastal Asia Minor, Southern Italy (Magna Graecia)",
      maxAreaKm: 1500000,
      maxAreaDisplay: "1.5 million km² (Hellenistic Empire: 5.2 million km²)",
      importantCities: ["Athens", "Sparta", "Corinth", "Thebes", "Syracuse", "Alexandria (Egypt)"]
    },
    population: {
      peakNum: 3500000,
      peakDisplay: "3.5 Million",
      note: "Highly fragmented among mountains and islands; Athens had about 300,000 residents."
    },
    economy: {
      trade: "Extensive maritime trade networks importing grain from Black Sea, exporting olive oil, wine, and pottery.",
      wealth: "Silver mines in Attica (Laurion), trade tariffs, slave labor in agriculture and mining.",
      currency: "Drachma (silver coins, notably the Athenian Tetradrachm/Owl)",
      industries: ["Agriculture (Olives, Grapes)", "Maritime commerce", "Pottery and bronze crafts", "Stone masonry"]
    },
    technology: ["Water mill", "Gear systems (Antikythera mechanism)", "Archimedes' screw", "Early steam engine prototype (Aeolipile)", "Cartography and geometry"],
    military: {
      strength: "Citizen-soldier infantry (Hoplites) fighting in tight phalanx formations; powerful navy (Athenian Triremes).",
      expansion: "Establishment of colonies around Mediterranean/Black Seas; Alexander's conquest of Persian Empire.",
      importantBattles: ["Battle of Marathon (490 BC)", "Battle of Thermopylae (480 BC)", "Battle of Salamis (480 BC)", "Battle of Gaugamela (331 BC)"]
    },
    society: {
      education: "Focused on athletics, music, poetry, mathematics, rhetoric (Athens) vs. harsh military training (Sparta's Agoge).",
      lifestyle: "Democratic participation for free male citizens; heavy reliance on domestic and industrial slavery.",
      culture: "Philosophy (Socrates, Plato, Aristotle), theater (tragedy and comedy), epic poetry (Homer), Olympics.",
      religion: "Polytheistic Olympian pantheon (Zeus, Athena, Poseidon, etc.) and mythological narratives.",
      architecture: "Parthenon, temples using Doric, Ionic, and Corinthian columns, open-air amphitheaters."
    },
    achievements: [
      "Invention of Democracy (direct citizen voting in Athens).",
      "Founding of Western Philosophy, scientific method, and formal logic.",
      "Euclidean geometry, Pythagorean theorem, and early astronomy (heliocentric models).",
      "Creation of enduring literary forms: drama, history writing (Herodotus), and epic poetry."
    ],
    declineReason: "Chronic internecine warfare between city-states (Peloponnesian Wars), exhausting resources; rise of Macedon under Philip II; and ultimate conquest by the Roman Republic.",
    legacy: "Formed the foundational bedrock of Western civilization, defining modern politics, philosophy, science, art, architecture, and theater.",
    funFacts: [
      "The word 'gymnasium' comes from the Greek word 'gymnos,' meaning naked, as athletes exercised completely nude.",
      "The Antikythera Mechanism, salvaged from a shipwreck, is a 2,000-year-old mechanical computer that predicted eclipses and planetary motion.",
      "In Athens, citizens could vote to exile any politician for 10 years by writing their name on broken pottery pieces (ostraka) - the origin of 'ostracize'."
    ]
  },
  "indus-valley": {
    id: "indus-valley",
    name: "Indus Valley Civilization",
    category: "Civilizations",
    icon: "civilization",
    timeline: {
      started: "3300 BC (Early Harappan phase)",
      peak: "2600 - 1900 BC (Mature Harappan phase, urban boom)",
      decline: "1900 - 1300 BC (Late Harappan, urban abandonment, migration)",
      end: "1300 BC (Complete disappearance of urban culture)"
    },
    duration: {
      totalYears: 2000,
      totalYearsDisplay: "2,000 Years (1,000 years of major urban phase)",
      peakYearsDisplay: "2600 BC – 1900 BC",
      note: "One of the three earliest Old World cradles of civilization."
    },
    geography: {
      region: "Indus River Basin (Modern Pakistan, Northwest India, Northeast Afghanistan)",
      maxAreaKm: 1260000,
      maxAreaDisplay: "1.26 million km²",
      importantCities: ["Harappa", "Mohenjo-daro", "Rakhigarhi", "Lothal", "Dholavira"]
    },
    population: {
      peakNum: 5000000,
      peakDisplay: "5 Million",
      note: "Accounted for up to 10% of the world's population during its mature phase."
    },
    economy: {
      trade: "Exchanged goods with Mesopotamia (Meluhha trade), Persian Gulf, and Central Asia via sea and land.",
      wealth: "Highly organized agriculture, cotton exports, bead and jewelry manufacturing.",
      currency: "Barter system, regulated by highly standardized stone weights (binary/decimal system)",
      industries: ["Agriculture (Wheat, Barley, Peas)", "Bead-making (Carnelian)", "Bronze metallurgy", "Pottery", "Shell working"]
    },
    technology: ["Standardized burnt bricks (1:2:4 ratio)", "First urban sanitation and sewer systems", "Dockyards (Lothal)", "Standardized weight system", "Dentistry (drill use)"],
    military: {
      strength: "Extremely little evidence of military fortifications, weapons of war, or army hierarchy.",
      expansion: "Cultural and economic expansion rather than conquest.",
      importantBattles: ["No recorded battles or evidence of warfare found by archaeologists."]
    },
    society: {
      education: "Widespread craft knowledge, uniform measurements, writing system (Indus Script, undeciphered).",
      lifestyle: "Egalitarian housing, high hygiene priority, public baths, complex drainage for every home.",
      culture: "Terracotta figurines (Dancing Girl), clay seals, gaming boards (early dice), cotton clothing.",
      religion: "Uncertain; worship of proto-Shiva figures, mother goddesses, sacred animals (bulls, unicorns), and trees.",
      architecture: "Grid-planned cities, two-story brick houses, public granaries, Great Bath of Mohenjo-daro."
    },
    achievements: [
      "First grid-planned cities with standardized streets and zoning.",
      "The world's first flush toilets and underground sewage systems.",
      "Inventors of precise, standardized weight and measurement systems.",
      "First cultivation and weaving of cotton for clothing."
    ],
    declineReason: "Climate change (weakening of the monsoon, drying of the Ghaggar-Hakra River), tectonic shifts altering river courses leading to catastrophic flooding, and ecological degradation.",
    legacy: "Town planning principles, binary weight concepts, and agricultural practices that persisted in South Asia.",
    funFacts: [
      "Every single house in Mohenjo-daro, no matter how small, had its own private bathroom connected to a street sewer.",
      "The Indus Script, consisting of over 400 signs, remains one of the world's greatest unsolved mysteries.",
      "Despite its massive size and population, archaeologists have found no depictions of kings, soldiers, prisoners, or warfare."
    ]
  },

  // === TECHNOLOGY ===
  "internet": {
    id: "internet",
    name: "Internet",
    category: "Technology",
    icon: "technology",
    timeline: {
      started: "1969 (ARPANET first message sent)",
      peak: "1995 - Present (World Wide Web boom & mobile era)",
      decline: "N/A (Ongoing integration & expansion)",
      end: "Active (Evolving into Web3, decentralized networks, and AI hubs)"
    },
    duration: {
      totalYears: 57,
      totalYearsDisplay: "57+ Years (since ARPANET)",
      peakYearsDisplay: "2010 – Present (Smartphone/Cloud era)",
      note: "Driving the fastest global informational transition in history."
    },
    geography: {
      region: "Global digital coverage",
      maxAreaKm: 510000000,
      maxAreaDisplay: "Global Coverage (510 million km²)",
      importantCities: ["Silicon Valley", "Seattle", "Beijing", "Tokyo", "Geneva (CERN)"]
    },
    population: {
      peakNum: 5400000000,
      peakDisplay: "5.4 Billion users",
      note: "Connects approximately 67% of the global population daily."
    },
    economy: {
      trade: "Foundation of global e-commerce, digital advertising, software-as-a-service (SaaS).",
      wealth: "Generates trillions of dollars in global GDP; powers the world's most valuable tech corporations.",
      currency: "Fiat electronic transfers, Cryptocurrencies (Bitcoin, Ethereum), digital wallets",
      industries: ["Cloud Computing", "E-commerce", "Social Media", "Cybersecurity", "Digital Finance"]
    },
    technology: ["TCP/IP protocols", "HTML/HTTP (World Wide Web)", "Fiber-optic cabling", "Wi-Fi & 5G wireless", "Domain Name System (DNS)"],
    military: {
      strength: "Cybersecurity command units, high-speed military intelligence routing, satellite communications.",
      expansion: "Information networks integrated into every modern nation's defense matrix.",
      importantBattles: ["Stuxnet attack (2010)", "Ongoing global high-frequency cyber espionage campaigns"]
    },
    society: {
      education: "Democratic access to global knowledge, online universities, digital research databases.",
      lifestyle: "Screen-centric, always-connected lifestyle, remote work, smart homes, gig economy.",
      culture: "Social media echo chambers, meme culture, instant global subcultures, digital communities.",
      religion: "Online congregation, digital spreading of faith, discussions on AI and digital ethics.",
      architecture: "Massive server datacenters, fiber-optic routes, satellite constellations (Starlink)."
    },
    achievements: [
      "Unifying global communication to near-zero marginal cost.",
      "Democratization of human knowledge through the World Wide Web.",
      "Enabling instant global collaboration in science, software, and economics.",
      "Creating the foundational structure for the modern digital economy."
    ],
    declineReason: "Challenges: Splinternet fragmentation, government censorship/firewalls, massive cybersecurity vulnerabilities, energy consumption of massive server farms, and data quality degradation.",
    legacy: "Dismantled geographical barriers, redefining commerce, relationships, government, and how humanity records history.",
    funFacts: [
      "The first message sent on the internet was 'LO' - the sender tried to type 'LOGIN' but the system crashed after two letters.",
      "Mount Everest has high-speed Wi-Fi, allowing climbers to post updates directly from the slopes.",
      "The first webcam was created at Cambridge University in 1991 to monitor a coffee pot's level without leaving the room."
    ]
  },
  "smartphones": {
    id: "smartphones",
    name: "Smartphones",
    category: "Technology",
    icon: "technology",
    timeline: {
      started: "1992 (IBM Simon) / 2007 (Apple iPhone)",
      peak: "2015 - Present (Ubiquitous global adoption)",
      decline: "N/A (Ongoing usage)",
      end: "Active (Transitioning towards AR glasses and AI wearables)"
    },
    duration: {
      totalYears: 34,
      totalYearsDisplay: "34+ Years (Modern era: 19+ Years)",
      peakYearsDisplay: "2012 – Present (4G/5G era)",
      note: "Put supercomputers into the pockets of billions of people."
    },
    geography: {
      region: "Global",
      maxAreaKm: 150000000,
      maxAreaDisplay: "Global (150 million km² land coverage)",
      importantCities: ["Cupertino", "Shenzhen", "Seoul", "Tokyo", "Helsinki"]
    },
    population: {
      peakNum: 6900000000,
      peakDisplay: "6.9 Billion users",
      note: "Over 85% of the world's population owns a smartphone."
    },
    economy: {
      trade: "App Store economies, mobile ad networks, mobile payments, supply chain for rare earth metals.",
      wealth: "Drives Apple, Samsung, Google, and TSMC's massive hardware/software valuations.",
      currency: "Apple Pay, Google Wallet, UPI (India), WeChat Pay (China)",
      industries: ["Mobile App Development", "Semiconductor manufacturing", "Lithium battery mining", "Telecommunications"]
    },
    technology: ["Multi-touch capacitive screens", "ARM processors", "Lithium-ion batteries", "Mobile operating systems (iOS, Android)", "GPS/Sensors (Gyroscopes, Accelerometers)"],
    military: {
      strength: "Blue-force trackers, hand-held drone controllers, battleground app management, encryption tools.",
      expansion: "Ubiquitous battlefield sensing, open-source intelligence (OSINT) from civilians.",
      importantBattles: ["Kyiv cyber defense and geolocation targeting via mobile reporting (2022)"]
    },
    society: {
      education: "Bite-sized mobile learning (Duolingo), educational podcasts, instant textbook access.",
      lifestyle: "On-demand services (ride-hailing, food delivery), constant notifications, reduced attention spans.",
      culture: "TikTok/Instagram short-form video culture, selfie phenomenon, mobile gaming supremacy.",
      religion: "Prayer alerts, digital religious texts, live-streaming services on mobile screens.",
      architecture: "Porous office spaces for mobile workers, charging station integration in cities."
    },
    achievements: [
      "Merging phone, camera, computer, and GPS into a single pocket device.",
      "Democratizing mobile banking for unbanked populations in developing regions.",
      "Creating the 'gig economy' (Uber, DoorDash) through real-time location matching.",
      "Enabling instant photography and video recording for the global public."
    ],
    declineReason: "Challenges: Form factor physical limits, screen fatigue, mental health concerns, supply chain bottlenecks for semiconductors, and replacement by voice-AI and neural interfaces.",
    legacy: "Redefined how humans interact, capture moments, navigate physical spaces, and perform daily transactions.",
    funFacts: [
      "The average person unlocks their smartphone 150 times a day.",
      "The computing power of a modern smartphone is millions of times greater than the computers NASA used to send Apollo 11 to the moon.",
      "In Japan, 90% of smartphones are waterproof because users take them into the shower."
    ]
  },
  "electricity": {
    id: "electricity",
    name: "Electricity",
    category: "Technology",
    icon: "technology",
    timeline: {
      started: "1882 (Edison's Pearl Street Station, NYC)",
      peak: "Mid-20th Century - Present (Total industrial reliance)",
      decline: "N/A (Essential foundation)",
      end: "Active (Evolving to smart grids and renewable networks)"
    },
    duration: {
      totalYears: 144,
      totalYearsDisplay: "144+ Years",
      peakYearsDisplay: "1950 – Present",
      note: "The primary energy vector powering modern industrial civilization."
    },
    geography: {
      region: "Global (except remote rural zones)",
      maxAreaKm: 130000000,
      maxAreaDisplay: "Global Grid Network",
      importantCities: ["New York City", "London", "Paris", "Niagara Falls", "Shenzhen"]
    },
    population: {
      peakNum: 7200000000,
      peakDisplay: "7.2 Billion connected",
      note: "Around 90% of the world's population has access to electricity."
    },
    economy: {
      trade: "Electricity market trading, fossil fuel supply chains, manufacturing power input.",
      wealth: "Unlocks 24/7 manufacturing, global banking servers, and refrigerated preservation of trade assets.",
      currency: "Kilowatt-hour billing, carbon credits",
      industries: ["Power Generation (Coal, Nuclear, Solar)", "Copper transmission lines", "Electric motors", "Home appliances"]
    },
    technology: ["Alternating Current (AC) generators", "Transformers", "High-voltage transmission lines", "Silicon solar cells", "Lithium battery storage"],
    military: {
      strength: "Electrified radar, sonar, communications, electric motors in submarines, laser weaponry.",
      expansion: "Heavy vulnerability of national grids to cyber attacks and EMP weapons.",
      importantBattles: ["Grid-targeted air campaigns in the Gulf War (1991)"]
    },
    society: {
      education: "Nighttime study under electric light, computational learning, laboratory heating/power.",
      lifestyle: "24-hour cities, indoor climate control, domestic chores automated by electric appliances.",
      culture: "Nightlife, cinema, television, electronic music, video gaming.",
      religion: "Illuminated shrines, global live-broadcasts of religious events.",
      architecture: "Skyscrapers (requiring electric elevators), artificial climate malls, illuminated skylines."
    },
    achievements: [
      "Liberating humanity from solar/diurnal cycles for work and activity.",
      "Powering the second Industrial Revolution (assembly lines, electric motors).",
      "Enabling refrigeration, radically decreasing food spoilage and food-borne diseases.",
      "The foundational infrastructure required for the computer and internet age."
    ],
    declineReason: "Challenges: Grid vulnerability to extreme weather, reliance on fossil fuels causing climate change, high distribution losses, and high capital costs for upgrading aging infrastructure.",
    legacy: "Transformed human society from muscle and fire power to instant, clean, distributed energy.",
    funFacts: [
      "The dispute between Thomas Edison (promoting DC) and Nikola Tesla/George Westinghouse (promoting AC) was known as the 'War of the Currents.'",
      "One lightning bolt contains enough electricity to power a medium-sized home for up to three months.",
      "Before electric grids, cities relied on coal gas lamps, which regularly caused fires and explosions."
    ]
  },
  "printing-press": {
    id: "printing-press",
    name: "Printing Press",
    category: "Technology",
    icon: "technology",
    timeline: {
      started: "1440 (Gutenberg's moveable type press in Mainz)",
      peak: "16th - 20th Century (Standard medium of information)",
      decline: "Late 20th Century (Rise of digital screen media)",
      end: "Active (Niche/Specific printing, transitioned to digital)"
    },
    duration: {
      totalYears: 586,
      totalYearsDisplay: "586 Years",
      peakYearsDisplay: "1800 – 1990 (Industrialized press & newspaper boom)",
      note: "Caused the first massive democratization of information in history."
    },
    geography: {
      region: "Global (started in Europe, quickly spreading worldwide)",
      maxAreaKm: 148000000,
      maxAreaDisplay: "Global (All populated continents)",
      importantCities: ["Mainz (Germany)", "Venice", "London", "Paris", "Boston"]
    },
    population: {
      peakNum: 2500000000,
      peakDisplay: "2.5 Billion readers (mid-20th century)",
      note: "Dramatically increased global literacy rates from <10% to over 80%."
    },
    economy: {
      trade: "International book fairs, copyright systems, publishing monopolies.",
      wealth: "Fostered intellectual property laws, scientific specialization, and the rise of daily advertisements.",
      currency: "Paper banknotes (printed currency), book sales",
      industries: ["Publishing & Journalism", "Paper manufacturing", "Ink production", "Bookbinding"]
    },
    technology: ["Movable metal type", "Oil-based inks", "Screw-press mechanism", "Linotype machine", "Rotary steam press"],
    military: {
      strength: "Mass print propaganda, standardized training manuals, printed cartography.",
      expansion: "Nationalistic mobilization via newspapers and pamphlets.",
      importantBattles: ["Pamphlet wars of the Protestant Reformation (16th Century)"]
    },
    society: {
      education: "Standardized textbooks, growth of public schools, academic journals.",
      lifestyle: "Quiet individual reading habits, rise of coffeehouse debates over daily newspapers.",
      culture: "Vernacular literature (Shakespeare, Goethe), rise of the novel, scientific revolution.",
      religion: "Democratized bible reading (Gutenberg Bible), undermining Catholic Church monopoly, fueling the Reformation.",
      architecture: "Public libraries, university reading rooms, bookstores."
    },
    achievements: [
      "Triggering the Scientific Revolution by allowing researchers to share and verify data.",
      "Democratizing literacy, paving the way for the modern educated middle class.",
      "Pioneering mass communication and public sphere political debates.",
      "Standardizing European languages into cohesive national dialects."
    ],
    declineReason: "Replaced by electronic media (radio, TV) and ultimately digital screens, blogs, and ebooks which have zero cost of replication and instant distribution.",
    legacy: "Foundational to modern scientific progress, human rights doctrines, standard orthography, and the concept of a free press.",
    funFacts: [
      "Before Gutenberg, a single hand-copied Bible took an experienced monk nearly a year to write, requiring skins from 170 calves.",
      "The first newspapers were weekly publications in Germany (1605) called 'Relation aller Fürnemmen und gedenckwürdigen Historien.'",
      "Gutenberg went bankrupt and lost his press to his financial backer, Johann Fust, before he could profit from his invention."
    ]
  },
  "steam-engine": {
    id: "steam-engine",
    name: "Steam Engine",
    category: "Technology",
    icon: "technology",
    timeline: {
      started: "1712 (Newcomen atmospheric engine) / 1776 (Watt commercial engine)",
      peak: "19th Century (The core of the Industrial Revolution)",
      decline: "Early 20th Century (Replaced by internal combustion and electric motors)",
      end: "Obsolete (Replaced, except in steam turbine power plants)"
    },
    duration: {
      totalYears: 200,
      totalYearsDisplay: "200 Years of dominance (Turbine form still active)",
      peakYearsDisplay: "1830 – 1910 (Railway & Steamship era)",
      note: "The primary driver that transitioned humanity from organic to fossil energy."
    },
    geography: {
      region: "Global (originated in Britain, powered global industrialization)",
      maxAreaKm: 135000000,
      maxAreaDisplay: "Global (Railways and sea lanes)",
      importantCities: ["Birmingham (UK)", "Manchester", "Glasgow", "New York City", "Chicago"]
    },
    population: {
      peakNum: 1500000000,
      peakDisplay: "1.5 Billion (within active steam-powered zones)",
      note: "Enabled the massive population boom of the 19th and early 20th centuries."
    },
    economy: {
      trade: "Transcontinental railways, steamship oceanic trade, factory automation.",
      wealth: "Created the Industrial Gilded Age, massive coal conglomerates, and British imperial wealth.",
      currency: "Gold-backed paper currency, railway shares",
      industries: ["Coal mining", "Railways", "Steam shipping", "Textile factories"]
    },
    technology: ["Separate condenser (James Watt)", "Double-acting engine", "High-pressure boilers (Trevithick)", "Slide valves", "Governor feedback loops"],
    military: {
      strength: "Ironclad steam warships, rapid rail troop deployment, armored trains.",
      expansion: "Enabled rapid colonization of African and Asian interiors via river gunboats.",
      importantBattles: ["Battle of Hampton Roads (Monitor vs. Merrimack, 1862)"]
    },
    society: {
      education: "Mechanic institutes, engineering schools, standardized clock-time schedules.",
      lifestyle: "Factory work shifts, railway travel, massive urbanization, dense smog-filled cities.",
      culture: "Steampunk aesthetic origin, industrial novels (Charles Dickens), travel leisure.",
      religion: "Industrial chaplaincy, Christian missionaries traveling via steamship.",
      architecture: "Gothic railway terminals, factory smokestacks, canal lock networks."
    },
    achievements: [
      "Pioneering mechanical thermodynamic energy translation (heat to work).",
      "Shrinking global travel times from months to days via steamships and trains.",
      "Unlocking mass industrial production of textiles, tools, and consumer goods.",
      "The extraction of coal and iron at an unprecedented scale."
    ],
    declineReason: "Lacked efficiency compared to the internal combustion engine (petrol/diesel) and was far less versatile and clean than distributed electricity.",
    legacy: "Modern steam turbines still generate about 60% of the world's electricity in coal, gas, and nuclear power plants.",
    funFacts: [
      "The first locomotive, built by Richard Trevithick in 1804, traveled at a breakneck speed of 5 mph (8 km/h).",
      "Early steam boilers frequently exploded, leading to the creation of the first safety inspectorates and design standards.",
      "The term 'Horsepower' was invented by James Watt to compare his steam engine's output to the work capacity of draft horses."
    ]
  },
  "ai": {
    id: "ai",
    name: "Artificial Intelligence",
    category: "Technology",
    icon: "technology",
    timeline: {
      started: "1950s (Turing Test & Dartmouth Workshop)",
      peak: "2020s - Present (Generative LLM & Transformer boom)",
      decline: "N/A (Ongoing rapid advancement)",
      end: "Active (Evolving toward Artificial General Intelligence)"
    },
    duration: {
      totalYears: 76,
      totalYearsDisplay: "76+ Years (since Turing's paper)",
      peakYearsDisplay: "2022 – Present (Generative AI era)",
      note: "Represents the shift from mechanical to cognitive automation."
    },
    geography: {
      region: "Global digital space",
      maxAreaKm: 510000000,
      maxAreaDisplay: "Global (Digital server clouds)",
      importantCities: ["San Francisco", "Beijing", "London", "Seattle", "Toronto"]
    },
    population: {
      peakNum: 2000000000,
      peakDisplay: "2.0 Billion active users",
      note: "Growing exponentially via search integration and conversational software."
    },
    economy: {
      trade: "AI chip shortages, software API licensing, automation of knowledge work.",
      wealth: "Adding trillions in projected productivity value; driving massive valuations for chip designers (NVIDIA) and cloud providers.",
      currency: "API token pricing, computing credits, USD",
      industries: ["Generative Software", "AI Accelerators (GPUs)", "Autonomous vehicles", "Robotics"]
    },
    technology: ["Neural networks", "Transformer architecture (Attention mechanism)", "Deep learning", "Reinforcement learning", "Large Language Models"],
    military: {
      strength: "Autonomous combat drones, intelligence analysis, automated target classification.",
      expansion: "Integration into cyber warfare, battle simulation, and strategic forecasting.",
      importantBattles: ["Algorithmic air defense simulations, autonomous swarm tests"]
    },
    society: {
      education: "Personalized AI tutors, automated coding assistants, AI essay grading controversy.",
      lifestyle: "Copilot-assisted daily work, algorithmic content feeds, smart assistants.",
      culture: "AI-generated art (Midjourney), synthetic voice cloning, deepfakes.",
      religion: "Discussions on machine souls, Dataism, AI-generated religious guidance.",
      architecture: "GPU cluster datacenter designs, liquid cooling architectures."
    },
    achievements: [
      "AlphaFold predicting 3D structures of 200 million proteins, solving a 50-year biology challenge.",
      "Passing professional medical, bar, and technical programming exams.",
      "Superhuman performance in complex strategy games (Chess, Go, StarCraft II).",
      "Real-time speech translation and synthesis across dozens of languages."
    ],
    declineReason: "Challenges: Extreme electrical power demand, hallucination errors, model collapse from synthetic training data, copyright litigations, and alignment safety concerns.",
    legacy: "Redefining the relationship between human intelligence and machine capability, automating white-collar work.",
    funFacts: [
      "In 1997, IBM's Deep Blue defeated Garry Kasparov in chess. In 2016, Google's AlphaGo defeated Lee Sedol in Go, a game with more moves than atoms in the universe.",
      "The name 'Artificial Intelligence' was coined by John McCarthy for a 2-month summer workshop at Dartmouth College in 1956.",
      "AI models can determine a patient's self-reported race, cardiovascular health, and biological age from a simple scan of the retina."
    ]
  },

  // === HISTORICAL EVENTS ===
  "world-war-i": {
    id: "world-war-i",
    name: "World War I",
    category: "Historical Events",
    icon: "event",
    timeline: {
      started: "July 28, 1914 (Assassination of Archduke Franz Ferdinand)",
      peak: "1916 - 1918 (Total war mobilization & trench warfare)",
      decline: "Late 1918 (German offensive failure, Allied counter-offensive)",
      end: "November 11, 1918 (Armistice signed)"
    },
    duration: {
      totalYears: 4,
      totalYearsDisplay: "4 Years, 3 Months",
      peakYearsDisplay: "1915 – 1918 (Trench stalemate)",
      note: "The 'War to End All Wars' introduced industrial-scale combat."
    },
    geography: {
      region: "Europe, Middle East, Africa, Atlantic Ocean, East Asia",
      maxAreaKm: 40000000,
      maxAreaDisplay: "40.0 million km² (active fronts/supply lines)",
      importantCities: ["Paris", "Berlin", "St. Petersburg (Petrograd)", "London", "Vienna", "Constantinople"]
    },
    population: {
      peakNum: 1800000000,
      peakDisplay: "1.8 Billion (affected worldwide)",
      note: "Mobilized over 70 million military personnel, resulting in 20 million deaths."
    },
    economy: {
      trade: "Naval blockades (British blockade of Germany), unrestricted submarine warfare.",
      wealth: "Bankruptcy of the Russian, Ottoman, and Austro-Hungarian empires. US shifts to global creditor.",
      currency: "Suspension of Gold Standard, war bonds, heavy hyperinflation post-war",
      industries: ["Munitions manufacturing", "Steel processing", "Chemical weapons production", "Coal mining"]
    },
    technology: ["Chemical weapons (mustard gas)", "Tanks (Landships)", "Fighter aircraft", "Submarines (U-boats)", "Tactical field radio"],
    military: {
      strength: "Massive conscript armies, industrial artillery shell production, trench networks.",
      expansion: "Allied powers vs. Central powers; collapse of eastern fronts.",
      importantBattles: ["Battle of the Marne (1914)", "Battle of Gallipoli (1915)", "Battle of Verdun (1916)", "Battle of the Somme (1916)"]
    },
    society: {
      education: "Propaganda in classrooms, military training for youth, medical advancements in trauma surgery.",
      lifestyle: "Rationing, mobilization of women into factories (Munitionettes), grieving communities.",
      culture: "Lost Generation poetry (Wilfred Owen), shell-shock awareness, anti-war art (Dadaism).",
      religion: "Rise in spiritualism, military chaplaincy, decline in traditional religious trust.",
      architecture: "Military fortifications, barbed-wire lines, war cemeteries."
    },
    achievements: [
      "Creating the League of Nations (precursor to the United Nations).",
      "Pioneering mobile blood transfusions and plastic surgery techniques.",
      "Acceleration of women's suffrage movements through workplace integration.",
      "Establishing the first international conventions on chemical weapons."
    ],
    declineReason: "Economic collapse of Germany, arrival of fresh American troops, naval blockades starving Central Powers, and widespread mutiny and revolution within Austro-Hungarian and Russian borders.",
    legacy: "Redrew the map of Europe and the Middle East, dissolved four massive empires (Russian, German, Ottoman, Austro-Hungarian), and laid the direct political triggers for WWII.",
    funFacts: [
      "On Christmas Day 1914, soldiers along the Western Front declared an unofficial truce, singing carols, sharing food, and playing football in No Man's Land.",
      "The youngest authenticated British soldier in WWI was Sidney Lewis, who joined the army at just 12 years old.",
      "Dogs were used as messengers, carrying instructions to the front lines in capsules attached to their collars."
    ]
  },
  "world-war-ii": {
    id: "world-war-ii",
    name: "World War II",
    category: "Historical Events",
    icon: "event",
    timeline: {
      started: "September 1, 1939 (Invasion of Poland)",
      peak: "1941 - 1944 (Global multi-theater conflicts)",
      decline: "1945 (Fall of Berlin, Soviet and Allied convergence)",
      end: "September 2, 1945 (Surrender of Japan after atomic bombs)"
    },
    duration: {
      totalYears: 6,
      totalYearsDisplay: "6 Years",
      peakYearsDisplay: "1941 – 1944",
      note: "The deadliest conflict in human history, involving over 30 countries."
    },
    geography: {
      region: "Europe, Pacific, East/Southeast Asia, North Africa, Atlantic & Indian Oceans",
      maxAreaKm: 100000000,
      maxAreaDisplay: "100.0 million km² (combat zones & oceans)",
      importantCities: ["Berlin", "Tokyo", "Moscow", "London", "Washington D.C.", "Stalingrad", "Hiroshima"]
    },
    population: {
      peakNum: 2300000000,
      peakDisplay: "2.3 Billion (affected globally)",
      note: "Over 100 million personnel mobilized; resulted in an estimated 70-85 million fatalities."
    },
    economy: {
      trade: "Lend-Lease program, absolute blockade of Japan, German exploitation of conquered territories.",
      wealth: "Destruction of European and Japanese infrastructure; US emerges as dominant economic superpower (50% of world GDP in 1945).",
      currency: "Bretton Woods system (1944) anchoring currencies to USD, war rationing stamps",
      industries: ["Automotive-to-tank conversion", "Aircraft production", "Synthetic rubber manufacturing", "Nuclear research (Manhattan Project)"]
    },
    technology: ["Atomic bomb", "Radar and Sonar", "Jet engine", "Synthetic rubber", "Penicillin mass production", "Electronic digital computer (Colossus/ENIAC)"],
    military: {
      strength: "Blitzkrieg combined-arms tactics, aircraft carrier fleets, strategic heavy bombers, mass armored divisions.",
      expansion: "Axis powers (Germany, Italy, Japan) conquer Europe and Southeast Asia; turned back by Allied coalition (US, UK, USSR, China).",
      importantBattles: ["Battle of Britain (1940)", "Battle of Stalingrad (1942)", "Battle of Midway (1942)", "Normandy Landings (D-Day, 1944)", "Battle of Berlin (1945)"]
    },
    society: {
      education: "Military cryptography training, science research funding, ideological brainwashing in Axis schools.",
      lifestyle: "Blackouts, strict rationing, massive civil displacement, evacuation of children from cities.",
      culture: "Propaganda films, patriotic big-band music, emergence of the superhero genre (Captain America).",
      religion: "Existential crisis of faith following the Holocaust; religious service in military fields.",
      architecture: "Bomb shelters, destroyed cities rebuilt in modernist style, military airstrips."
    },
    achievements: [
      "Founding of the United Nations to maintain international peace.",
      "The development of penicillin mass production, saving millions of lives.",
      "The Marshall Plan, successfully rebuilding post-war Western Europe.",
      "Pioneering digital computing and cryptography (Alan Turing's Enigma codebreaking)."
    ],
    declineReason: "Overextended supply lines of Axis powers, economic and industrial superiority of the Allied coalition, Soviet Union's massive military manpower, and the ultimate development and deployment of the atomic bomb.",
    legacy: "Bipolar Cold War world order (US vs. USSR), division of Germany, rise of nuclear deterrence, decolonization of Africa and Asia, and establishment of international human rights law.",
    funFacts: [
      "The wealthiest country per capita during the war was the US, which saw its economy expand by over 75% during the conflict.",
      "During the war, the Oscar statuettes were made of painted plaster instead of metal due to metal shortages.",
      "Tsutomu Yamaguchi survived both the Hiroshima and Nagasaki atomic bombings, living to the age of 93."
    ]
  },
  "french-revolution": {
    id: "french-revolution",
    name: "French Revolution",
    category: "Historical Events",
    icon: "event",
    timeline: {
      started: "May 5, 1789 (Convocation of the Estates-General)",
      peak: "1793 - 1794 (Reign of Terror under Robespierre)",
      decline: "1795 - 1799 (The Directory, political corruption and exhaustion)",
      end: "November 9, 1799 (Napoleon Bonaparte's Coup of 18 Brumaire)"
    },
    duration: {
      totalYears: 10,
      totalYearsDisplay: "10 Years",
      peakYearsDisplay: "1792 – 1794 (First French Republic)",
      note: "Overthrew the absolute monarchy and reshaped global democracy concepts."
    },
    geography: {
      region: "France (with military impacts spreading across all of Europe)",
      maxAreaKm: 640000,
      maxAreaDisplay: "640,000 km² (French borders)",
      importantCities: ["Paris", "Versailles", "Lyon", "Marseille", "Valmy"]
    },
    population: {
      peakNum: 28000000,
      peakDisplay: "28 Million (Population of France in 1789)",
      note: "France was the most populous country in Western Europe at the time."
    },
    economy: {
      trade: "Disrupted by internal chaos, hyperinflation, and British naval blockades.",
      wealth: "Confiscation of church properties, elimination of feudal dues and tax exemptions for nobility.",
      currency: "Assignats (paper currency backed by church lands)",
      industries: ["Agriculture", "Artisanal workshops", "Early military munitions manufactories"]
    },
    technology: ["Guillotine (standardized execution)", "Chappe semaphore telegraph (first optical telegraph)", "Metric system standardization", "Early hot air balloon military reconnaissance"],
    military: {
      strength: "Levée en masse (mass conscription), creating the first modern nationalist citizen army.",
      expansion: "Defended borders against royalist coalitions, annexed parts of Low Countries and Rhineland.",
      importantBattles: ["Storming of the Bastille (1789)", "Battle of Valmy (1792)", "Battle of Fleurus (1794)"]
    },
    society: {
      education: "Establishment of public schools, secular academies, engineering colleges (École Polytechnique).",
      lifestyle: "Abolition of the feudal estates, rise of radical Jacobin clubs, change of dress code (sans-culottes).",
      culture: "Revolutionary calendar, de-Christianization campaigns, liberty trees, revolutionary songs (La Marseillaise).",
      religion: "Attack on the Catholic Church; establishment of the Cult of Reason and later the Cult of the Supreme Being.",
      architecture: "Destruction of royal statues, conversion of palaces (Louvre) into public museums."
    },
    achievements: [
      "The Declaration of the Rights of Man and of the Citizen.",
      "Abolition of feudalism and aristocratic privileges in France.",
      "The creation and dissemination of the Metric System (meters, kilograms).",
      "Drafting of the Civil Code (later Napoleonic Code) spreading modern civil law."
    ],
    declineReason: "Factional infighting, execution of revolutionary leaders (Danton, Robespierre), financial instability of the Directory, and the rise of Napoleon Bonaparte as a stabilizing military dictator.",
    legacy: "Popularized the values of Liberty, Equality, Fraternity; inspired global anti-colonial and democratic movements (Haitian Revolution), and dismantled feudal structures across Europe.",
    funFacts: [
      "The revolutionaries replaced the traditional 7-day week with a 10-day week in their calendar, trying to eliminate Sunday worship.",
      "The Guillotine was originally proposed as a humane and egalitarian method of execution, ensuring all classes died the same way.",
      "During the de-Christianization phase, the Notre-Dame Cathedral was renamed the 'Temple of Reason.'"
    ]
  },
  "industrial-revolution": {
    id: "industrial-revolution",
    name: "Industrial Revolution",
    category: "Historical Events",
    icon: "event",
    timeline: {
      started: "c. 1760 (Mechanization of British textile industry)",
      peak: "1830 - 1880 (Spread of heavy industry, railways, and iron)",
      decline: "c. 1914 (Transition into the Second Industrial/Electrical era)",
      end: "Ongoing (Transitioned into Digital and Automation phases)"
    },
    duration: {
      totalYears: 150,
      totalYearsDisplay: "150 Years (First & Second phases)",
      peakYearsDisplay: "1840 – 1900 (Coal and Railway expansion)",
      note: "The most fundamental shift in human lifestyle since the invention of agriculture."
    },
    geography: {
      region: "Western Europe (starting in Britain), North America, later global",
      maxAreaKm: 15000000,
      maxAreaDisplay: "Global Industrialized Zones",
      importantCities: ["Manchester", "Birmingham", "Leeds", "Pittsburgh", "Essen", "Osaka"]
    },
    population: {
      peakNum: 1600000000,
      peakDisplay: "1.6 Billion",
      note: "Fueled massive urban migrations; Manchester grew from 10,000 to 300,000 in 70 years."
    },
    economy: {
      trade: "Global supply chains for cotton, coal, iron, and manufactured goods. Free trade treaties.",
      wealth: "Enormous increase in manufacturing capacity; rise of industrial capitalism and corporation models.",
      currency: "Gold Standard currencies, rise of stock exchanges",
      industries: ["Textiles (cotton/wool)", "Coal mining", "Iron and steel refining", "Rail transport", "Machine tools"]
    },
    technology: ["Spinning Jenny", "Watt's Steam Engine", "Puddling process for iron", "Power loom", "Locomotive"],
    military: {
      strength: "Mass-produced steel weapons, railway mobilization logistics, steam-powered navies.",
      expansion: "Industrial nations militarily dominate non-industrial societies (Gatling gun diplomacy).",
      importantBattles: ["American Civil War (first industrialized conflict, 1861-65)"]
    },
    society: {
      education: "Rise of vocational training, basic literacy for factory workers, development of engineering degrees.",
      lifestyle: "Factory clock schedules, severe urban overcrowding, rise of nuclear families, emergence of labor unions.",
      culture: "Consumer culture, rise of standard leisure time, novels detailing working-class struggles (Dickens).",
      religion: "Growth of Methodist and urban churches; challenges to religious authority from scientific materialism.",
      architecture: "Brick factories, tenement housing blocks, iron-and-glass structures (Crystal Palace), canal networks."
    },
    achievements: [
      "Transition of human labor from muscle/draft animal power to mechanical power.",
      "Dramatically reducing the cost of clothing, food transport, and household items.",
      "Invention of railways, opening up national interiors to economic development.",
      "Giving rise to modern labor laws, safety standards, and public health acts."
    ],
    declineReason: "Did not decline, but naturally evolved into the Second Industrial Revolution (oil, electricity, chemicals) and eventually the Third (computing/digital) and Fourth (AI/robotics).",
    legacy: "Created the modern urban world, built the physical transport infrastructure, raised standards of living, but also initiated human-caused climate change.",
    funFacts: [
      "Before the industrial era, up to 90% of the world's population worked in agriculture; today, it is less than 3% in industrialized nations.",
      "The 'Luddites' were English textile workers who smashed machinery in protest of wage cuts, not because they hated technology itself.",
      "The concept of the 'weekend' was popularized during this era as labor unions fought for designated rest days."
    ]
  },
  "green-revolution": {
    id: "green-revolution",
    name: "Green Revolution",
    category: "Historical Events",
    icon: "event",
    timeline: {
      started: "1940s (Norman Borlaug's research in Mexico)",
      peak: "1960s - 1970s (Mass introduction to India, Pakistan, Philippines)",
      decline: "1990s (Growth plateaus, soil degradation concerns)",
      end: "Ongoing (Transitioning to biotechnology and gene editing)"
    },
    duration: {
      totalYears: 50,
      totalYearsDisplay: "50+ Years (Core phase: 1950 - 1980)",
      peakYearsDisplay: "1965 – 1980 (India's food self-sufficiency drive)",
      note: "Saved an estimated one billion people from starvation."
    },
    geography: {
      region: "Developing World (Latin America, South Asia, Southeast Asia)",
      maxAreaKm: 45000000,
      maxAreaDisplay: "45.0 million km² (cropland under modern hybrid seeds)",
      importantCities: ["Mexico City", "New Delhi", "Manila (IRRI)", "Lafayette (Purdue)"]
    },
    population: {
      peakNum: 4000000000,
      peakDisplay: "4.0 Billion (fed by high-yield crops)",
      note: "Allowed developing nations like India to double their grain yields and prevent mass famines."
    },
    economy: {
      trade: "Global chemical fertilizer distribution, seed patenting, grain import reductions in Asia.",
      wealth: "Transformed poor agrarian economies; lifted millions of farmers into commercial markets.",
      currency: "USD for chemical imports, national agricultural subsidies",
      industries: ["Agrochemicals (Fertilizers/Pesticides)", "Seed manufacturing", "Irrigation pump fabrication", "Tractor manufacturing"]
    },
    technology: ["High-Yielding Varieties (HYV) of wheat & rice", "Synthetic nitrogen fertilizers (Haber-Bosch)", "Chemical pesticides", "Large-scale tubewell irrigation", "Combined harvesters"],
    military: {
      strength: "No direct military combat; served as a 'Cold War' geopolitical strategy to prevent communist revolutions.",
      expansion: "Ensured political stability in critical border states (Pakistan, India, Mexico).",
      importantBattles: ["Geopolitical containment of agricultural shortages in the 1960s"]
    },
    society: {
      education: "Agricultural extension programs teaching peasant farmers modern chemical application.",
      lifestyle: "Shift from subsistence farming to commercial farming, urbanization of rural labor.",
      culture: "Decline in traditional seed-saving rituals, adoption of mechanized rural life.",
      religion: "Secularization of harvest concepts; agrarian celebrations centering on machinery.",
      architecture: "Concrete granaries, large canal systems (Indira Gandhi Canal), fertilizer depots."
    },
    achievements: [
      "Averting global food crises predicted by Malthusians in the 1960s.",
      "Developing dwarf varieties of wheat and rice that don't fall over when heavily fertilized.",
      "Norman Borlaug winning the Nobel Peace Prize in 1970 for his agricultural contributions.",
      "Making nations like India, Mexico, and Pakistan food self-sufficient."
    ],
    declineReason: "Ecological side effects (soil salinity, groundwater depletion, pesticide pollution), loss of agricultural biodiversity, and the economic burden of chemical inputs on poor farmers.",
    legacy: "Modern global agriculture relies entirely on the techniques developed in this era, feeding the 8 billion people alive today.",
    funFacts: [
      "Norman Borlaug's 'miracle wheat' had short, stiff stalks so that the heavy grain heads wouldn't break the stem.",
      "India's wheat production doubled in just five years, between 1965 and 1970, an achievement never before seen in agricultural history.",
      "The Haber-Bosch process, which synthesizes ammonia for fertilizers, currently sustains about 50% of the nitrogen in the human body."
    ]
  },
  "cold-war": {
    id: "cold-war",
    name: "Cold War",
    category: "Historical Events",
    icon: "event",
    timeline: {
      started: "1947 (Truman Doctrine announced)",
      peak: "1962 (Cuban Missile Crisis) / 1980s (Euromissile crisis)",
      decline: "1989 (Fall of the Berlin Wall)",
      end: "December 26, 1991 (Dissolution of the Soviet Union)"
    },
    duration: {
      totalYears: 44,
      totalYearsDisplay: "44 Years",
      peakYearsDisplay: "1950 – 1979 (Nuclear arms race & proxy conflicts)",
      note: "A global ideological struggle between capitalism (US) and communism (USSR)."
    },
    geography: {
      region: "Global (divided into Eastern Block, Western Block, and Non-Aligned Movement)",
      maxAreaKm: 148000000,
      maxAreaDisplay: "Global (All continents affected)",
      importantCities: ["Washington D.C.", "Moscow", "Berlin", "Havana", "Saigon (Ho Chi Minh City)", "Geneva"]
    },
    population: {
      peakNum: 5000000000,
      peakDisplay: "5.0 Billion (affected globally)",
      note: "Drovie international politics, dividing families and entire nations (Germany, Korea, Vietnam)."
    },
    economy: {
      trade: "COCOM embargoes against communist states, COMECON trade block vs. Marshall Plan/GATT markets.",
      wealth: "Enormous military-industrial spending on both sides; economic stagnation in the Soviet command economy.",
      currency: "USD (Western dominance) vs. Soviet Ruble (Eastern block transfer currency)",
      industries: ["Aerospace and Rocketry", "Defense manufacture", "Nuclear energy", "Early semiconductor research"]
    },
    technology: ["Nuclear ICBMs", "Space exploration rockets (Apollo, Soyuz)", "Spy satellites", "Early Internet (ARPANET)", "Supercomputing matrices"],
    military: {
      strength: "Massive thermonuclear arsenals (Mutually Assured Destruction), satellite intelligence, huge standing armies in Europe.",
      expansion: "Global alliances (NATO vs. Warsaw Pact); extensive proxy wars in Asia, Africa, and Latin America.",
      importantBattles: ["Korean War (1950-53)", "Cuban Missile Crisis (1962)", "Vietnam War (1955-75)", "Soviet-Afghan War (1979-89)"]
    },
    society: {
      education: "Emphasis on STEM fields, nuclear drills in schools ('Duck and Cover'), ideological competition.",
      lifestyle: "Anti-communist drills in the West, queues and shortages in the East, fear of nuclear holocaust.",
      culture: "Spy novels (James Bond), space race nationalism, state-sponsored chess battles, protest music.",
      religion: "State atheism in the USSR; rise in religious rhetoric ('Under God' added to US pledge).",
      architecture: "Berlin Wall, fallout shelters, brutalist monuments in East Europe, missile silos."
    },
    achievements: [
      "Sending the first humans to the Moon (Apollo 11, 1969).",
      "Avoiding a direct thermonuclear conflict despite extreme geopolitical tensions.",
      "The creation of the internet (ARPANET) as a decentralized military communication network.",
      "Developing advanced global satellite navigation and Earth-imaging systems."
    ],
    declineReason: "Economic stagnation of the Soviet Union, high cost of the military arms race, public demand for democratic reforms in Eastern Europe (Solidarity movement), and Mikhail Gorbachev's policies of Glasnost and Perestroika.",
    legacy: "Nuclear disarmament treaties, ongoing division of Korea, expansion of NATO, and the emergence of the United States as the sole global superpower in the 1990s.",
    funFacts: [
      "The United States spent an estimated $5.5 trillion on nuclear weapons during the Cold War.",
      "During the Space Race, both sides used ex-Nazi rocket scientists, notably Wernher von Braun for the US.",
      "A Soviet military officer, Stanislav Petrov, single-handedly averted a nuclear war in 1983 by correctly identifying an early warning alarm of US missiles as a computer error."
    ]
  }
};
