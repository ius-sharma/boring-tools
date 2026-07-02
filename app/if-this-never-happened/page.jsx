"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ComingSoon from "@/app/components/ComingSoon";

// Set to "live" to deploy and enable routing
const TOOL_STATUS = "live";

// 20 Predefined Historical Events Offline Database
const ALTERNATE_HISTORY_DB = {
  "world-war-i": {
    id: "world-war-i",
    title: "World War I Never Happened",
    category: "War & Politics",
    shortTitle: "World War I",
    icon: "war",
    originalEvent: {
      summary: "World War I (1914–1918) was a global conflict triggered by the assassination of Archduke Franz Ferdinand. It pitted the Allies against the Central Powers.",
      importance: "It led to the collapse of four major empires (German, Austro-Hungarian, Russian, and Ottoman), redrew the global map, catalyzed the Russian Revolution, and created the economic and political conditions that directly caused World War II."
    },
    timeline: {
      tenYears: "European monarchies remain intact. The German, Austro-Hungarian, and Ottoman Empires continue to dominate Central Europe and the Middle East. Economic wealth remains concentrated in Europe, and tensions are managed through delicate diplomatic balance of power.",
      fiftyYears: "Decolonization is heavily delayed. Empires maintain colonial hold over Africa and Asia, though reform movements push for commonwealth-style autonomy. The United States remains relatively isolationist, without the economic boost of war manufacturing.",
      hundredYears: "A slower transition to republican democracies. Monarchy is modernized into constitutional systems. High-altitude air travel and radio systems evolve under imperial monopolies. The Middle East remains under a modernized, federalized Ottoman system, preventing many modern conflicts.",
      present: "Europe is a collection of wealthy, constitutional imperial states. The map of Europe is free of 20th-century border conflicts, but social hierarchies remain rigid. The Cold War never occurred, but civil rights and anti-colonial struggles are the primary global conflicts."
    },
    techImpact: {
      missingTech: ["Radar (delayed by decades)", "Nuclear Energy (no high-stakes wartime Manhattan Project)", "Synthetic Rubber (developed due to blockades)", "Mass-produced penicillin", "Jet engines"],
      description: "Without military funding and urgency, aviation, computing, and nuclear physics develop at a much slower, academic pace."
    },
    societyImpact: {
      description: "Class systems and imperial hierarchies remain strong. The rapid entry of women into the industrial workforce is delayed, slowing the women's suffrage movement in Western nations."
    },
    economyImpact: {
      description: "The US Dollar does not become the undisputed global reserve currency. European currencies (British Pound, French Franc, German Mark) share global financial dominance. Trade is managed within imperial blocks."
    },
    scienceImpact: {
      description: "Scientific collaborations remain global and open, but funding is a fraction of wartime levels. Quantum mechanics and relativity remain academic debates rather than fueling technological leaps."
    },
    politicsImpact: {
      description: "No Rise of Soviet Communism or European Fascism. The Russian Tsarist regime undergoes gradual constitutional reform. Middle Eastern borders remain stable under Ottoman rule."
    },
    cultureImpact: {
      description: "Artistic movements like Dadaism, Surrealism, and modern literary cynicism (born of war trauma) never emerge. Late 19th-century optimism and belief in progress continue to dominate culture."
    },
    rippleEffects: [
      "No Assassination Escalation",
      "European Empires Remain Stable",
      "No Economic Collapse of Germany",
      "No Rise of Fascism or World War II",
      "Decolonization Delayed by Decades"
    ],
    positives: [
      "Over 20 million lives saved from WWI directly, and tens of millions from subsequent conflicts.",
      "Preservation of historic European cities and cultural heritage.",
      "Greater geopolitical stability in the Middle East."
    ],
    negatives: [
      "Prolonged colonial rule and delayed self-determination for millions in Africa and Asia.",
      "Slower social progression toward gender equality and workers' rights.",
      "Slower rate of medical and aviation innovations."
    ],
    comparison: {
      before: "A world devastated by industrialized warfare, leading to total collapse of traditional structures.",
      after: "A world of enduring empires, rigid class lines, and slow, incremental social reforms."
    },
    cards: [
      { title: "Geopolitics", modern: "Independent nations across Africa, Asia, and Middle East; United Nations.", alternate: "Large global empires with autonomous Commonwealth sectors; League of Monarchs." },
      { title: "Social Progress", modern: "Universal suffrage, civil rights movements, fast-paced cultural shifts.", alternate: "Traditional social roles, slow expansion of voting rights, monarchical oversight." },
      { title: "Military Tech", modern: "Nuclear weapons, advanced drones, hypersonic stealth fighters.", alternate: "Advanced dreadnought battleships, steam/diesel armored vehicles, early prop aviation." }
    ],
    finalPerspective: "World War I was the crucible of the modern era. By shattering old empires, it accelerated self-determination, women's rights, and technological pacing, but at the cost of unimaginable bloodshed and a century of ideological warfare."
  },
  "world-war-ii": {
    id: "world-war-ii",
    title: "World War II Never Happened",
    category: "War & Politics",
    shortTitle: "World War II",
    icon: "war",
    originalEvent: {
      summary: "World War II (1939–1945) was a global war involving the vast majority of the world's countries, forming the Allies and the Axis alliances.",
      importance: "It resulted in the fall of Nazi Germany and Imperial Japan, the decline of European colonial empires, the creation of the United Nations, the onset of the Cold War, and the invention of nuclear weapons and modern computers."
    },
    timeline: {
      tenYears: "A tense peace exists in Europe. The League of Nations struggles to maintain order. Germany, under moderate conservative-nationalist leadership (following a hypothetical early internal coup), remains economically dominant in Central Europe but does not launch a full-scale invasion of Western Europe.",
      fiftyYears: "Decolonization takes place gradually over decades, without the sudden post-war exhaustion of European treasuries. The British Empire transition to a Commonwealth is smooth. No partition of India occurs under wartime panic, leading to a unified, massive South Asian state.",
      hundredYears: "A tri-polar world of the United States, democratic British Commonwealth, and a reformed European Alliance. The Soviet Union remains isolated. Nuclear weapons do not exist, leaving conventional military deterrence (large navies and standing armies) as the main strategic leverage.",
      present: "Geopolitical alliances resemble a modernized version of the early 20th century. Major European capitals are intact, never having suffered bombings. The global population is much higher, and the horrors of the Holocaust never occurred, preserving millions of lives and their descendants."
    },
    techImpact: {
      missingTech: ["Nuclear fission reactors", "Modern rocket technology / Space Race", "Penicillin mass-production", "Early digital computers (Colossus/ENIAC)", "Radar-based civilian aviation"],
      description: "Without the Manhattan Project and Allied computing breakthroughs, the transition from mechanical to digital and atomic systems is delayed by 30-40 years."
    },
    societyImpact: {
      description: "The civil rights movement in the US progresses more slowly, as the military integration of minorities and post-war push for equality lack the catalyst of the war."
    },
    economyImpact: {
      description: "No Bretton Woods system. The US dollar is strong but shares influence with the British Pound and German Mark. European nations do not need the Marshall Plan, keeping financial systems highly nationalized."
    },
    scienceImpact: {
      description: "Atomic physics remains a purely theoretical field. Space exploration is delayed; no satellite communication in the 20th century, retaining shortwave radio as the main global link."
    },
    politicsImpact: {
      description: "No Cold War, no division of Germany or Korea. The United Nations is never formed, with the League of Nations undergoing gradual reforms instead. The Soviet Union remains a regional power without an Eastern Bloc."
    },
    cultureImpact: {
      description: "Post-war existentialist philosophy, the baby boomer generation, and pop culture reactions to atomic dread never occur. A more conservative, traditionalist culture persists globally."
    },
    rippleEffects: [
      "Early German Military Coup Against Extremists",
      "Geopolitical Treaties Prevent Invasion of Poland",
      "No Total War Mobilization",
      "No Development of Atomic Weapons",
      "Slower, Peaceful Transition of Colonies"
    ],
    positives: [
      "Over 70 million lives spared from combat, famine, and atrocities.",
      "No threat of global nuclear annihilation.",
      "Preservation of major cultural artifacts and architectural landmarks in Europe and Asia."
    ],
    negatives: [
      "Delayed collapse of European colonial empires, prolonging foreign rule.",
      "Slower medical developments, particularly in antibiotics and trauma care.",
      "Computer revolution and global communication networks are delayed by decades."
    ],
    comparison: {
      before: "A world defined by total war, atomic weapons, and the sudden collapse of empires.",
      after: "A world of persistent imperial networks, conventional military balance, and delayed digital technology."
    },
    cards: [
      { title: "Technology", modern: "Digital smartphones, internet, satellite GPS, nuclear power.", alternate: "Analog communication, wired networks, steam/diesel turbines, delayed computing." },
      { title: "South Asia", modern: "Partitioned states of India, Pakistan, and Bangladesh.", alternate: "A unified South Asian federation with regional autonomy." },
      { title: "Global Order", modern: "US and China dominance, United Nations, NATO.", alternate: "Multipolar balance of US, British Commonwealth, and European Union of States." }
    ],
    finalPerspective: "World War II was the most destructive event in human history. Its absence would have spared millions of lives and prevented atomic dread, but it also would have delayed the digital age and the liberation of colonized peoples."
  },
  "the-internet": {
    id: "the-internet",
    title: "The Internet Never Happened",
    category: "Technology",
    shortTitle: "The Internet",
    icon: "globe",
    originalEvent: {
      summary: "The Internet was created through research funded by the US Department of Defense (ARPANET) in the late 1960s and evolved into the World Wide Web in 1989.",
      importance: "It revolutionized global communication, commerce, and media, giving rise to social media, instant messaging, cloud computing, and the global digital economy."
    },
    timeline: {
      tenYears: "Businesses rely on fax machines, telex, and courier mail. Telephony remains analog and expensive. Local newspaper companies and television networks retain absolute control over information dissemination.",
      fiftyYears: "Personal computers exist but operate as isolated offline tools (similar to word processors). Libraries remain the sole repositories of knowledge. Local shopping malls, physical bank branches, and physical travel agencies thrive.",
      hundredYears: "A highly sophisticated network of cable-based television, satellite broadcasts, and local intranets exists. Pneumatic tube systems and high-speed rail networks are optimized to transport physical documents between major financial centers.",
      present: "The economy is physical and paper-based. Cash and checkbooks dominate transactions. Long-distance communication is done via telephone calls, letters, and telegraphs. Entertainment is broadcast-based (cable TV, movie theaters, radio) or physical (vinyl, CDs)."
    },
    techImpact: {
      missingTech: ["Social Media", "Cloud Computing", "E-commerce (Amazon, eBay)", "Streaming Services (Netflix, Spotify)", "Smartphones as internet devices"],
      description: "Without global networking protocols, smartphones remain simple cellular devices. Software is sold on physical floppy disks or CD-ROMs."
    },
    societyImpact: {
      description: "Communities are highly localized. Social relationships are limited to physical proximity. Global news takes days to spread, and viral internet culture does not exist."
    },
    economyImpact: {
      description: "The global economy is less interconnected. Retail relies on local stores and mail-order catalogs. Work is strictly office-based, as remote work is logistically impossible."
    },
    scienceImpact: {
      description: "Scientific collaboration is slower, relying on physical journals and mail correspondence. Data sharing is limited to magnetic tapes sent via mail, slowing down large research projects."
    },
    politicsImpact: {
      description: "Governments maintain a monopoly on information. Political polarization is slower, as media is governed by broadcast licensing standards. Grassroots movements are harder to coordinate."
    },
    cultureImpact: {
      description: "Attention spans are longer. Reading physical books, writing letters, and outdoor socializing remain the primary pastimes. Mass media (TV/Radio) dictates culture, creating a highly shared cultural experience."
    },
    rippleEffects: [
      "ARPANET Project Canceled in 1969",
      "Computers Remain Offline Calculators",
      "No World Wide Web",
      "Information Remains Decentralized in Libraries",
      "Commerce Remains Strictly Physical"
    ],
    positives: [
      "No social media addiction, cyberbullying, or online disinformation campaigns.",
      "Higher privacy levels; no mass surveillance or corporate data tracking.",
      "Stronger local communities and face-to-face social connections."
    ],
    negatives: [
      "Information access is extremely unequal, limited by local library resources.",
      "Massive friction in global trade, scientific research, and financial transactions.",
      "No instant contact with loved ones across the globe."
    ],
    comparison: {
      before: "A hyper-connected global village with instant data access and digital automation.",
      after: "A physical, paper-based world with localized information systems and analog communication."
    },
    cards: [
      { title: "Daily Work", modern: "Zoom meetings, Slack, email, cloud documents.", alternate: "Typed memos, filing cabinets, landline calls, physical mail." },
      { title: "Shopping", modern: "Amazon prime, instant digital banking, Apple Pay.", alternate: "Cash/Checks, local shopping malls, paper catalogs." },
      { title: "Knowledge", modern: "Wikipedia, Google search, online courses.", alternate: "Multi-volume encyclopedias, physical library cards, local tutors." }
    ],
    finalPerspective: "The Internet democratized information and connected humanity like never before. Its absence would have preserved a calmer, more private, and local lifestyle, but at the cost of freezing scientific, economic, and human collaboration."
  },
  "electricity": {
    id: "electricity",
    title: "Electricity Never Existed",
    category: "Technology",
    shortTitle: "Electricity",
    icon: "lightbulb",
    originalEvent: {
      summary: "The discovery of electromagnetism and development of electrical generators in the 19th century enabled the distribution of power.",
      importance: "It powered lighting, heating, manufacturing, home appliances, global communications, and laid the absolute foundation for the modern industrial and digital worlds."
    },
    timeline: {
      tenYears: "Gas lighting and steam engines remain the sole power sources. Cities remain dark at night, relying on gas lamps. Factories run on complex systems of belts and pulleys connected to a central steam boiler.",
      fiftyYears: "Pneumatic and hydraulic power grids are built under city streets to distribute mechanical power. Homes are lit with kerosene and gas, creating significant fire hazards. Trains remain steam-powered.",
      hundredYears: "A highly sophisticated steam-punk world. Mechanical computers (like Babbage's Difference Engine) powered by steam or compressed air manage basic calculations. Global communication relies on acoustic systems and optical telegraphs.",
      present: "The world is steam-powered and mechanical. Cities are designed around central steam plants. Travel is done by steam train or sailing ships. Lifestyle resembles a clean, highly optimized version of the late Victorian era."
    },
    techImpact: {
      missingTech: ["Computers & Electronics", "Electric Lighting", "Telecommunications (Telephone, TV, Radio)", "Refrigeration", "Modern Medical Scanners"],
      description: "All electronic devices are non-existent. Technologies are purely mechanical, hydraulic, or pneumatic."
    },
    societyImpact: {
      description: "Human schedules are dictated by daylight. Nighttime activity is minimal. Domestic chores are labor-intensive, requiring constant physical effort."
    },
    economyImpact: {
      description: "Manufacturing is concentrated near water or coal sources. Global trade is slower, relying on mechanical shipping. Financial transactions are recorded in physical paper ledgers."
    },
    scienceImpact: {
      description: "Physics focuses entirely on thermodynamics and mechanics. Chemistry is limited, without electrolysis to discover new elements. Space exploration is impossible."
    },
    politicsImpact: {
      description: "Governments are localized. Mass mobilization is slow. Colonial empires persist longer due to the difficulty of coordinating global resistance without instant communication."
    },
    cultureImpact: {
      description: "Theater, books, and acoustic music are the sole forms of entertainment. Social gatherings are focused around fireplaces and gas-lit salons. The pace of life is significantly slower."
    },
    rippleEffects: [
      "Electromagnetism Laws Undiscovered",
      "No Electric Generators or Motors",
      "Gas and Kerosene Remain Primary Lighting",
      "Mechanical and Steam Power Fully Exploited",
      "No Electronic Computing Era"
    ],
    positives: [
      "No electrical grid dependency or vulnerability to solar flares/EMP attacks.",
      "Minimal light pollution, leaving the night sky completely visible.",
      "No electronic waste or toxic battery mining."
    ],
    negatives: [
      "High mortality rates due to lack of medical refrigeration (vaccines) and lighting in surgeries.",
      "High pollution in cities from burning gas, coal, and wood indoors.",
      "Severe limitations in human productivity and global communication."
    ],
    comparison: {
      before: "A world of illuminated cities, digital automation, and instant global communication.",
      after: "A steampunk world of gears, steam pipes, gas lamps, and physical, mechanical labor."
    },
    cards: [
      { title: "Lighting", modern: "LED bulbs, fluorescent lights, illuminated streets.", alternate: "Gas lamps, kerosene lanterns, candles, pitch-black nights." },
      { title: "Computing", modern: "Silicon microchips, quantum computers, cloud servers.", alternate: "Mechanical gears, slide rules, hand-operated adding machines." },
      { title: "Home Life", modern: "Refrigerators, washing machines, smart heaters.", alternate: "Iceboxes, hand-cranked washboards, wood-burning stoves." }
    ],
    finalPerspective: "Electricity is the lifeblood of modern civilization. Without it, humanity would be locked in a mechanical, Victorian-era lifestyle, proving that our digital advancement is entirely dependent on this single physical force."
  },
  "printing-press": {
    id: "printing-press",
    title: "The Printing Press Was Never Invented",
    category: "Technology",
    shortTitle: "Printing Press",
    icon: "book",
    originalEvent: {
      summary: "Johannes Gutenberg invented the movable type printing press in Europe around 1440.",
      importance: "It democratized knowledge, dramatically increased literacy rates, enabled the Scientific Revolution and Protestant Reformation, and laid the groundwork for the modern nation-state."
    },
    timeline: {
      tenYears: "Scribes and monks continue to copy manuscripts by hand. Bibles and academic texts remain incredibly expensive, luxury items owned only by royalty and the high clergy.",
      fiftyYears: "Universities remain tiny, exclusive institutions where students memorize spoken lectures. The Catholic Church maintains an absolute monopoly on religious and intellectual thought.",
      hundredYears: "Scientific breakthroughs are slow to spread, as researchers must travel physically to share handwritten letters. Literacy remains under 10% globally, restricted to the ruling class.",
      present: "Knowledge is preserved through oral traditions and hand-copied scroll libraries. Societies are highly traditional and stratified. The scientific method is a niche philosophy, and nation-states are organized around feudal allegiances rather than shared print languages."
    },
    techImpact: {
      missingTech: ["Newspapers and Mass Media", "Public Education Systems", "Modern Scientific Journals", "Mass Literacy", "Standardized Spelling"],
      description: "Without mass reproduction of text, the spread of technical blueprints is delayed, slowing the Industrial Revolution by centuries."
    },
    societyImpact: {
      description: "Social mobility is virtually non-existent. The vast majority of the population remains illiterate and dependent on authority figures to interpret laws, religion, and science."
    },
    economyImpact: {
      description: "Commerce relies on local custom and oral contracts. The expansion of double-entry bookkeeping and global trade contracts is hindered by the lack of cheap paper records."
    },
    scienceImpact: {
      description: "The Scientific Revolution is delayed. Discoveries are frequently lost when a scientist dies, requiring subsequent generations to rediscover the same principles."
    },
    politicsImpact: {
      description: "No mass political revolutions (French, American) as pamphlet campaigns are impossible. Feudalism and absolute monarchies persist, as mass political consciousness cannot form."
    },
    cultureImpact: {
      description: "Culture remains oral. Storytelling, theater, and folk songs are the primary ways history and values are passed down, creating rich local mythologies."
    },
    rippleEffects: [
      "Gutenberg Abandons Movable Type Project",
      "Books Remain Hand-Copied Luxury Items",
      "Literacy Remains Under 10%",
      "Catholic Church Retains Monopoly on Scripture",
      "Scientific Ideas Fail to Spread Globally"
    ],
    positives: [
      "Preservation of rich oral storytelling and memory techniques.",
      "Minimal paper waste and preservation of forests.",
      "No mass propaganda campaigns or yellow journalism."
    ],
    negatives: [
      "Widespread ignorance and superstition dominate daily life.",
      "Extreme centralization of power in the hands of the literate clergy and nobility.",
      "Scientific and medical progress is severely delayed, keeping life expectancy low."
    ],
    comparison: {
      before: "A literate, educated society with public libraries, newspapers, and global scientific consensus.",
      after: "An oral, traditional society with hand-copied libraries, feudal rule, and localized knowledge."
    },
    cards: [
      { title: "Education", modern: "Universal public schooling, textbooks, open libraries.", alternate: "Apprenticeships, oral instruction, exclusive church schools." },
      { title: "Science", modern: "Peer-reviewed journals, open-source code, global collaboration.", alternate: "Hidden alchemy notebooks, localized master-disciple lines." },
      { title: "Geopolitics", modern: "Nation-states defined by shared written language and newspapers.", alternate: "Feudal territories defined by allegiance to a literate lord." }
    ],
    finalPerspective: "The printing press was the first mass-medium. By allowing thoughts to be replicated instantly, it broke the monopoly on knowledge, creating the modern democratic and scientific world."
  },
  "steam-engine": {
    id: "steam-engine",
    title: "The Steam Engine Was Never Invented",
    category: "Technology",
    shortTitle: "Steam Engine",
    icon: "cog",
    originalEvent: {
      summary: "The steam engine, refined by James Watt in the late 18th century, converted heat energy into mechanical work.",
      importance: "It powered the Industrial Revolution, replacing human/animal muscle power and watermills with coal-driven factories, trains, and steamships, transforming global transport and production."
    },
    timeline: {
      tenYears: "Factories remain built strictly along fast-flowing rivers to utilize waterwheels. Manufacturing stops during winter freezes or summer droughts. Coal mines rely on horses to pump out water.",
      fiftyYears: "Humanity invests heavily in windmills and water power. Canals are expanded to transport goods using horse-drawn barges. Transatlantic shipping is limited by wind currents.",
      hundredYears: "A highly sophisticated bio-mechanical world. Breeding programs create stronger draft animals. Windmills are engineered with metal gears to maximize energy capture.",
      present: "The world is agrarian and decentralized. Cities are smaller, built near water-power sites. Transportation relies on high-speed sailing ships and horse-drawn carriages on paved highways. Air quality is pristine, but the scale of global trade is small."
    },
    techImpact: {
      missingTech: ["Locomotives/Railroads", "Steamships", "Coal-powered factory machinery", "Early heavy steel manufacturing", "Mass-scale electricity generation (which relies on steam turbines)"],
      description: "Without steam power, the transition to fossil fuels is delayed, keeping human technology focused on wood, wind, and water."
    },
    societyImpact: {
      description: "No rapid urbanization. The majority of the population remains in rural areas working in agriculture. The rigid schedules of factory shifts do not dominate daily life."
    },
    economyImpact: {
      description: "Production limits remain local. Global supply chains do not exist. Goods are expensive, hand-crafted, and repaired rather than replaced."
    },
    scienceImpact: {
      description: "Thermodynamics (the science of heat and work) is never developed as a major branch of physics. Material science remains focused on wood and masonry rather than steel alloys."
    },
    politicsImpact: {
      description: "The rise of the industrial working class and trade unions is delayed. Geopolitics is dominated by naval powers with advanced sailing ships rather than coal-depot empires."
    },
    cultureImpact: {
      description: "Lifestyles remain tied to seasonal rhythms. Mass-consumerism does not exist. Hand-craftsmanship is highly valued, and communities are close-knit."
    },
    rippleEffects: [
      "Savery and Newcomen Fail to Build Pumps",
      "Coal Mines Flooded and Unusable",
      "Factories Remain Tied to Rivers",
      "No Railroads or Steamships",
      "Industrialization Postponed Indefinitely"
    ],
    positives: [
      "No man-made climate change or industrial fossil-fuel pollution.",
      "Preservation of rural landscapes and traditional craft cultures.",
      "Slower, less stressful lifestyle connected to nature."
    ],
    negatives: [
      "Severe limits on food distribution, leading to localized famines during crop failures.",
      "High reliance on animal and human physical labor.",
      "Isolated communities with little contact with the outside world."
    ],
    comparison: {
      before: "An industrialized, urban world powered by fossil fuels and global shipping grids.",
      after: "An agrarian, wind-and-water powered world with localized craft economies."
    },
    cards: [
      { title: "Transport", modern: "Trains, container ships, diesel trucks.", alternate: "Sailing clippers, horse-drawn wagons, canal barges." },
      { title: "Workplace", modern: "Centralized industrial factories, automated assembly lines.", alternate: "Rural workshops, water-powered mills, home crafts." },
      { title: "Climate", modern: "Global warming, air pollution, ecological crisis.", alternate: "Pre-industrial carbon levels, clean air, stable ecosystems." }
    ],
    finalPerspective: "The steam engine unlocked the energy of fossil fuels, breaking the limits of human muscle. Without it, humanity would have remained in harmony with nature, but restricted by the biological limits of draft animals and flowing water."
  },
  "the-industrial-revolution": {
    id: "the-industrial-revolution",
    title: "The Industrial Revolution Never Happened",
    category: "War & Politics",
    shortTitle: "Industrial Revolution",
    icon: "cog",
    originalEvent: {
      summary: "The Industrial Revolution was the transition to new manufacturing processes in Europe and the US, starting in the mid-1700s.",
      importance: "It shifted societies from agrarian economies to industrialized, urban ones, creating the middle class, raising living standards, but introducing modern pollution and labor struggles."
    },
    timeline: {
      tenYears: "Traditional guild systems maintain strict control over production. Weavers, blacksmiths, and cobblers produce goods to order. Rural life continues unchanged for 95% of the population.",
      fiftyYears: "European populations remain stable and rural. Major cities are administrative and trade centers rather than smoky factory hubs. Hand-made goods remain high-quality but scarce.",
      hundredYears: "No rapid rise in global carbon emissions. Wealth is still defined by land ownership rather than industrial capital. Sailing technology reaches its absolute peak with complex wooden ships.",
      present: "The world is a collection of agrarian states. Mass production does not exist. People live in self-sustaining villages, buying tools that last a lifetime. Society is highly stable, but material wealth is low."
    },
    techImpact: {
      missingTech: ["Assembly line manufacturing", "Fossil fuel power grids", "Automobiles", "Chemical fertilizers", "Synthetic materials"],
      description: "Without mechanization, technology is limited to refined hand-tools and natural energy (wind, water, muscle)."
    },
    societyImpact: {
      description: "No massive migration to cities. Families remain together in rural areas. The concept of 'working hours' is dictated by daylight rather than factory whistles."
    },
    economyImpact: {
      description: "No consumer economy. Advertising does not exist. Trade is based on barter and local currency, with minimal speculative banking."
    },
    scienceImpact: {
      description: "Scientific progress is slow, remaining a hobby of wealthy aristocrats. Medical science relies on traditional remedies, keeping child mortality high."
    },
    politicsImpact: {
      description: "No rise of capitalism or socialism. Feudal land owners and absolute monarchies retain power, as no industrial middle class emerges to challenge them."
    },
    cultureImpact: {
      description: "Culture is deeply traditional and tied to land. Craftsmanship is a spiritual calling. Folk art, local festivals, and oral histories dominate community life."
    },
    rippleEffects: [
      "No Mechanization of Textiles",
      "Agriculture Remains Main Occupation",
      "No Urban Migration Boom",
      "Feudal Landlords Retain Dominance",
      "Fossil Fuel Era Never Launched"
    ],
    positives: [
      "Prise-clean environment with zero industrial carbon footprint.",
      "Strong sense of community and family cohesion in rural areas.",
      "Higher appreciation for hand-crafted quality and artistry."
    ],
    negatives: [
      "Low life expectancy due to lack of modern medicine and sanitation.",
      "Widespread poverty and lack of industrial development in Asia and Africa.",
      "Lack of educational opportunities for the working class."
    ],
    comparison: {
      before: "An urbanized, consumer-driven society with high material wealth and ecological strain.",
      after: "A rural, craft-based society with low material wealth and a clean natural environment."
    },
    cards: [
      { title: "Daily Life", modern: "Urban apartment living, office jobs, supermarkets.", alternate: "Rural farmsteads, family workshops, local markets." },
      { title: "Products", modern: "Mass-produced, cheap, disposable plastic items.", alternate: "Hand-forged iron, hand-woven wool, heirloom wooden tools." },
      { title: "Social Structure", modern: "Capitalists, middle-class professionals, wage laborers.", alternate: "Landowning nobility, guild masters, peasant farmers." }
    ],
    finalPerspective: "The Industrial Revolution traded environmental purity for material abundance. Its absence would have preserved the natural world and traditional lifestyles, but left humanity vulnerable to the whims of nature and feudal oppression."
  },
  "smartphones": {
    id: "smartphones",
    title: "Smartphones Never Existed",
    category: "Technology",
    shortTitle: "Smartphones",
    icon: "phone",
    originalEvent: {
      summary: "Smartphones emerged in the late 2000s, combining cellular phones with internet access and touchscreens (crystallized by the iPhone in 2007).",
      importance: "They placed the sum of human knowledge in every pocket, creating the app economy, mobile social media, ride-sharing, and constant global connectivity."
    },
    timeline: {
      tenYears: "Mobile phones remain focused on calls and texts (like early Nokia/BlackBerry devices). PDA devices remain a niche tool for corporate executives. People carry standalone cameras, MP3 players, and paper maps.",
      fiftyYears: "Personal computing remains stationary, restricted to home and office desks. Cellular networks are optimized for voice quality. Public payphones remain common in urban centers.",
      hundredYears: "A world of highly refined desktop computing and separate analog utilities. People use cellular pagers to receive short text updates, but long-form reading and media remain paper-based.",
      present: "The digital world is divided. Computers are tools for work, located on desks. When people leave their homes, they disconnect. Strangers in public spaces talk to each other, look at their surroundings, or read physical newspapers."
    },
    techImpact: {
      missingTech: ["Mobile App Economy (Uber, Instagram, TikTok)", "Mobile banking / QR codes", "On-demand gig economy apps", "Selfie cameras", "Mobile push-notification loops"],
      description: "Digital systems remain desktop-first. Web design is complex and detailed, never having been simplified for small vertical screens."
    },
    societyImpact: {
      description: "Public spaces are social. People wait in lines without looking down. Navigation relies on street signs and paper maps, requiring active spatial awareness."
    },
    economyImpact: {
      description: "No gig economy boom. Taxi industries remain traditional. Retail is split between physical stores and desktop e-commerce. Marketing relies on desktop banners and print media."
    },
    scienceImpact: {
      description: "Psychological research on attention span reduction and screen addiction is non-existent. Medical studies on 'tech neck' and blue-light sleep disruption are unnecessary."
    },
    politicsImpact: {
      description: "Political movements rely on website forums and physical fliers. Citizen journalism is slower, as high-quality video capture requires carrying a dedicated video camera."
    },
    cultureImpact: {
      description: "Dinnertime conversations are uninterrupted. Concert crowds watch the stage with their eyes, not through screens. Pop music is distributed via CDs and desktop downloads."
    },
    rippleEffects: [
      "iPhone Project Canceled in 2006",
      "Mobile Phones Remain Call & Text Tools",
      "Computing Restricted to Physical Desks",
      "No Mobile App Economy",
      "Public Spaces Remain Disconnected from Screens"
    ],
    positives: [
      "Longer attention spans and reduced rates of youth anxiety and depression.",
      "Greater presence in physical social situations.",
      "No constant corporate tracking of physical location data."
    ],
    negatives: [
      "No instant navigation in unfamiliar areas, leading to frequent travel delays.",
      "Loss of convenience in calling rides, ordering food, or checking bank balances on the go.",
      "Slower sharing of emergency information and documentation of public events."
    ],
    comparison: {
      before: "A hyper-connected society with constant screen engagement and instant mobile utility.",
      after: "A disconnected mobile society with high situational awareness and stationary computer use."
    },
    cards: [
      { title: "Public Spaces", modern: "People looking down at screens in trains, cafes, and parks.", alternate: "People reading books, newspapers, or observing surroundings." },
      { title: "Travel", modern: "Uber, Google Maps, digital boarding passes.", alternate: "Traditional taxis, paper maps, physical tickets." },
      { title: "Mental Health", modern: "Constant notification anxiety, screen addiction, sleep issues.", alternate: "Calmer mental state, less comparison anxiety, better sleep." }
    ],
    finalPerspective: "Smartphones condensed the digital world into a pocket companion. Without them, we would have retained our connection to physical reality and local community, at the cost of modern mobile convenience."
  },
  "artificial-intelligence": {
    id: "artificial-intelligence",
    title: "Artificial Intelligence Was Never Research-Funded",
    category: "Technology",
    shortTitle: "Artificial Intelligence",
    icon: "cpu",
    originalEvent: {
      summary: "AI research began in the mid-20th century, culminating in deep learning models capable of language processing, image generation, and coding.",
      importance: "It acts as a general-purpose technology automating cognitive tasks, transforming coding, content creation, medical diagnostics, and robotics."
    },
    timeline: {
      tenYears: "Software remains strictly deterministic. Programs do exactly what they are programmed to do via explicit logical rules. Search engines rely on exact keyword matching.",
      fiftyYears: "Robotics remains focused on repetitive factory tasks with rigid programming. Language translation relies on massive, manually written bilingual dictionaries. No deepfakes exist.",
      hundredYears: "Computing is highly advanced but mechanical in logic. Software engineering is a massive profession, as every single automation task requires writing explicit lines of code by hand.",
      present: "Computers are incredibly fast calculators, but have no capacity for pattern recognition or intuition. Art, literature, and code are strictly human creations. Automation is limited to structured database operations."
    },
    techImpact: {
      missingTech: ["Large Language Models (ChatGPT)", "AI-generated art and videos", "Autonomous vehicles", "Facial recognition systems", "Automated coding assistants"],
      description: "Technology remains a tool that requires direct human instruction, never acting as an autonomous collaborator."
    },
    societyImpact: {
      description: "Cognitive professions remain secure and growing. The definition of intelligence remains uniquely human, preserving traditional views on education, writing, and art."
    },
    economyImpact: {
      description: "No 'AI bubble' or rapid valuation of chip companies. Tech companies focus on hardware speed and traditional database services. No automated customer service agents."
    },
    scienceImpact: {
      description: "Scientific breakthroughs (like protein folding prediction) require slow, physical lab experimentation rather than rapid computer simulation, delaying biology advancements."
    },
    politicsImpact: {
      description: "No automated surveillance states or algorithmic election manipulation. Disinformation campaigns require human writers, limiting their scale and speed."
    },
    cultureImpact: {
      description: "Artistic expression is highly valued and verified as human. The internet remains text and image-heavy, but everything is recognized as having been crafted by a human hand."
    },
    rippleEffects: [
      "Dartmouth Workshop on AI Canceled (1956)",
      "Computers Restricted to Pure Logic Systems",
      "No Neural Networks or Pattern Matching",
      "All Software Requires Explicit Manual Code",
      "Cognitive Labor Remains Exclusively Human"
    ],
    positives: [
      "No risk of job displacement for writers, artists, coders, and analysts.",
      "Zero threat of autonomous military weapons or superintelligent alignment risks.",
      "Digital media remains highly trustworthy; no AI fabrications or deepfakes."
    ],
    negatives: [
      "Slower discoveries in medicine (lack of automated drug discovery models).",
      "No automated helpers to sort massive datasets or write routine code.",
      "Worse accessibility tools for translation, speech-to-text, and image description."
    ],
    comparison: {
      before: "A world of autonomous software agents, automated creativity, and cognitive automation.",
      after: "A world where computers are fast calculators and all intelligence is strictly human."
    },
    cards: [
      { title: "Coding", modern: "AI autocomplete, automated code generation, instant debugging.", alternate: "Every line of code written by hand; manual testing and documentation." },
      { title: "Creativity", modern: "AI art generators, synthetic text, algorithmic music.", alternate: "100% human-created media; high value on manual drawing and writing." },
      { title: "Data Analysis", modern: "Predictive neural networks, automated insights.", alternate: "Human statisticians plotting charts and identifying patterns." }
    ],
    finalPerspective: "AI challenged the idea that thinking is unique to humans. Without it, computers would have remained useful tools, keeping human creativity and intellect as the sole drivers of progress."
  },
  "covid-19": {
    id: "covid-19",
    title: "COVID-19 Pandemic Never Occurred",
    category: "War & Politics",
    shortTitle: "COVID-19",
    icon: "virus",
    originalEvent: {
      summary: "The COVID-19 pandemic, beginning in late 2019, led to global lockdowns, economic disruptions, and rapid vaccine development.",
      importance: "It accelerated remote work technology, altered global supply chains, impacted education, caused millions of deaths, and triggered massive government spending."
    },
    timeline: {
      tenYears: "The global economy continues its 2010s trajectory. Traditional office work remains the standard, with commercial real estate in city centers at peak values. Supply chains remain lean and centralized in East Asia.",
      fiftyYears: "Epidemiological surveillance remains a secondary government budget item. The rapid adoption of mRNA vaccine platforms is delayed, keeping traditional vaccine research as the slow default.",
      hundredYears: "A world with traditional workplace structures. Urban designs remain focused on commuting to large corporate towers. Public health is managed through standard quarantine protocols.",
      present: "The global inflation surge of the early 2020s (triggered by supply chain blocks and stimulus) never happened. Remote work is a minor benefit rather than a standard option. City centers are crowded, and public health systems are unchanged."
    },
    techImpact: {
      missingTech: ["Rapid deployment of Zoom/Teams (delayed as a niche)", "QR code menus in restaurants", "Accelerated mRNA platform approval", "Contact-tracing apps"],
      description: "Technology development focus remains on hardware and traditional software, without the sudden push for remote collaboration tools."
    },
    societyImpact: {
      description: "Mental health impacts of prolonged lockdowns are avoided. A generation of students completes school without remote learning disruptions, keeping education metrics stable."
    },
    economyImpact: {
      description: "No massive global inflation surge or interest rate spikes of the 2020s. Commercial office buildings retain their value. Retail stores do not face the sudden bankruptcy wave."
    },
    scienceImpact: {
      description: "mRNA biotechnology remains in academic testing, slowing down cancer vaccine research which benefited from the rapid pandemic funding."
    },
    politicsImpact: {
      description: "Geopolitical tensions between Western nations and China are managed through trade agreements rather than pandemic blame. No major emergency spending packages."
    },
    cultureImpact: {
      description: "Handshaking remains the undisputed global greeting. Public wearing of masks is nonexistent. Travel and tourism sectors remain highly predictable and stable."
    },
    rippleEffects: [
      "Zoonotic Spillover Fails to Occur",
      "No Lockdown Orders or Travel Bans",
      "Offices Remain at 100% Occupancy",
      "No Massive Government Stimulus Printing",
      "Inflation Stays at Stable 2010s Levels"
    ],
    positives: [
      "Over 7 million lives saved from the virus directly, and millions from secondary health impacts.",
      "No loss of learning or isolation trauma for children during lockdowns.",
      "Greater economic stability without the 2022-2024 inflation wave."
    ],
    negatives: [
      "Slower adoption of flexible remote work, keeping employees in long daily commutes.",
      "mRNA medical breakthroughs are delayed by decades, slowing down cancer research.",
      "No global upgrade in pandemic preparedness and hospital ventilation systems."
    ],
    comparison: {
      before: "A world of hybrid remote work, commercial real estate declines, and high inflation.",
      after: "A world of traditional office commutes, stable inflation, and slower biotech progress."
    },
    cards: [
      { title: "Workplace", modern: "Hybrid remote work, virtual meetings, flexible schedules.", alternate: "Strict 5-day office presence, physical conference rooms." },
      { title: "Medicine", modern: "Rapid mRNA vaccines, automated epidemiological warning systems.", alternate: "Traditional vaccine pipelines, slow approval cycles." },
      { title: "Economy", modern: "Post-pandemic inflation, supply chain localization.", alternate: "Stable currency values, lean globalized supply chains." }
    ],
    finalPerspective: "COVID-19 was a global shock that accelerated a decade of digital transformation into a single year. Its absence would have spared millions of lives and stabilized the economy, but kept us bound to the physical office and delayed vital medical technology."
  },
  "gps": {
    id: "gps",
    title: "GPS Technology Was Never Deployed",
    category: "Technology",
    shortTitle: "GPS",
    icon: "satellite",
    originalEvent: {
      summary: "The Global Positioning System (GPS) was developed by the US Department of Defense in the 1970s and opened to civilian use in the 1980s.",
      importance: "It enabled precise global navigation, synchronized financial networks via atomic clocks, and powered modern aviation, logistics, and location-based mobile services."
    },
    timeline: {
      tenYears: "Aviation and naval navigation continue to rely on ground-based radio beacons (LORAN) and celestial tracking. Delivery fleets are routed manually using paper maps and radio dispatch.",
      fiftyYears: "Smartphones (if they exist) do not have blue-dot navigation. Automobile navigation systems use pre-loaded CD-ROM maps that track distance traveled via wheel rotation (dead reckoning), which frequently drifts.",
      hundredYears: "A highly complex system of land-based radio towers grids the globe to provide regional triangulation. Air travel is limited to specific corridors with high-power radio beacons.",
      present: "Logistics is local and manual. Ridesharing (Uber) does not exist; traditional taxi dispatch systems are standard. Fitness trackers record steps but cannot map runs. Geopolitical disputes over maritime borders are frequent due to measurement errors."
    },
    techImpact: {
      missingTech: ["Blue-dot mobile navigation", "Geotagged photos and posts", "Drone delivery systems", "Precision agricultural tractors", "Atomic clock financial synchronization"],
      description: "Without satellites providing passive time and location signals, all location services require active radio communication with local ground towers."
    },
    societyImpact: {
      description: "Human orientation skills remain high. People memorize routes and look at landmarks. Getting lost in a new city is a common, accepted part of travel."
    },
    economyImpact: {
      description: "Logistics companies (FedEx, UPS) operate with larger dispatch teams and slower delivery times. Maritime shipping is more cautious, staying closer to coastlines."
    },
    scienceImpact: {
      description: "Tectonic plate movement monitoring is less precise, relying on physical surveying. Meteorological models are less accurate without satellite atmospheric sounding data."
    },
    politicsImpact: {
      description: "Military operations rely on physical maps and inertial guidance systems, making long-range precision strikes impossible and increasing collateral damage."
    },
    cultureImpact: {
      description: "Travel guidebooks (like Lonely Planet) remain bestsellers. Exploring a city is adventurous, relying on asking locals for directions and following paper map coordinates."
    },
    rippleEffects: [
      "Transit Satellite Program Canceled",
      "No Atomic Clocks in Orbit",
      "Navigation Remains Beacon-Based",
      "No Mobile Location Services",
      "Logistics Relies on Dispatchers & Paper Maps"
    ],
    positives: [
      "No satellite-based mass tracking of civilian movement.",
      "Stronger human spatial awareness and navigation instincts.",
      "Less orbital space debris in Medium Earth Orbit (MEO)."
    ],
    negatives: [
      "Higher rate of aviation and maritime accidents due to navigation errors.",
      "Inefficient shipping and delivery networks, increasing carbon emissions.",
      "No instant emergency vehicle routing, slowing down rescue times."
    ],
    comparison: {
      before: "A world of instant navigation, automated logistics, and location-aware apps.",
      after: "A world of paper maps, radio beacons, human dispatchers, and spatial memory."
    },
    cards: [
      { title: "Navigation", modern: "Turn-by-turn voice navigation on smartphones.", alternate: "Paper street atlases, compasses, asking for directions." },
      { title: "Logistics", modern: "Real-time package tracking, algorithmic route optimization.", alternate: "Estimated delivery days, static routes, dispatch logs." },
      { title: "Aviation", modern: "Automated landing grids, direct polar routes.", alternate: "Beacon-to-beacon flight paths, manual celestial backup." }
    ],
    finalPerspective: "GPS acts as an invisible global utility. Without it, the convenience of the modern mobile economy and the efficiency of global logistics would collapse, forcing humanity to rely on physical orientation and local beacons."
  },
  "the-moon-landing": {
    id: "the-moon-landing",
    title: "Humans Never Reached The Moon",
    category: "Science & Space",
    shortTitle: "Moon Landing",
    icon: "rocket",
    originalEvent: {
      summary: "The Apollo 11 mission in 1969 landed the first humans on the Moon, fulfilling a challenge by President John F. Kennedy.",
      importance: "It marked the peak of the Space Race, catalyzed massive advances in computing and materials science, and provided an iconic moment of global human unity."
    },
    timeline: {
      tenYears: "The Space Race slows down. After multiple robotic probes fail or report barren landscapes, both the US and Soviet Union cut space budgets, shifting funds to domestic issues and the Vietnam War.",
      fiftyYears: "Low Earth Orbit (LEO) remains the boundary of space flight. Space stations (like Skylab or Mir) are built, but the public views space exploration as a costly military project rather than a human adventure.",
      hundredYears: "Satellites dominate communication, but crewed spaceflight is abandoned. The concept of humans leaving Earth's gravity is relegated to science fiction, as the radiation belts and economic costs are deemed insurmountable.",
      present: "Humanity is strictly Earth-bound. We have advanced satellite systems for monitoring climate and communication, but no astronauts have ever looked back at the entire sphere of Earth. Space agencies are small departments focused on weather monitoring."
    },
    techImpact: {
      missingTech: ["Early micro-computer acceleration (Apollo Guidance Computer)", "Water purification tech developed for space", "Advanced heat-shield materials", "High-efficiency solar cells"],
      description: "Without the extreme weight constraints of the Apollo missions, the miniaturization of silicon microchips is delayed by several years."
    },
    societyImpact: {
      description: "The 'Earthrise' photo (showing Earth as a fragile blue marble in black space) is never taken, slowing down the birth of the modern environmental movement in the 1970s."
    },
    economyImpact: {
      description: "No private space industry (SpaceX, Blue Origin). Government aerospace spending is strictly limited to defense satellites, redirecting capital to terrestrial infrastructure."
    },
    scienceImpact: {
      description: "Lunar geology is unknown. Hypotheses about the Moon's origin (like the giant impact hypothesis) cannot be verified without physical rock samples, leaving astronomy incomplete."
    },
    politicsImpact: {
      description: "The Cold War lacks a clear symbolic climax. Geopolitical dominance is projected through terrestrial military displays, without the peaceful competition of the Space Race."
    },
    cultureImpact: {
      description: "A more grounded, less optimistic view of the future. The late-20th-century belief in human expansion to the stars is absent, keeping literature and culture focused on Earth's problems."
    },
    rippleEffects: [
      "Apollo Program Canceled in 1967",
      "Space Budgets Cut Geopolitically",
      "Crewed Spaceflight Restricted to Low Orbit",
      "No Lunar Samples or Geology Data",
      "Future Vision Remains Earth-Bound"
    ],
    positives: [
      "Billions of dollars redirected to social programs and Earth-based research.",
      "Less nationalistic competition in space, preventing early weaponization of orbit.",
      "Fewer lives lost in tragic spaceflight training and launch accidents."
    ],
    negatives: [
      "Loss of a unifying global moment that inspired generations of scientists.",
      "Slower development of microcomputing and material science.",
      "No long-term path or technology developed for planetary defense (asteroid redirection)."
    ],
    comparison: {
      before: "A spacefaring culture aiming for Mars, with private space ports and lunar bases.",
      after: "An Earth-bound culture with satellites in orbit but no vision of human space travel."
    },
    cards: [
      { title: "Human Horizon", modern: "Astronauts on space stations, planning Mars colonies.", alternate: "No human has ever traveled beyond 300 miles from Earth." },
      { title: "Computing Speed", modern: "Rapidly accelerated by the Apollo guidance systems.", alternate: "Gradual commercial acceleration, delayed by 3-5 years." },
      { title: "Global Image", modern: "The iconic 'Blue Marble' photo inspiring environmentalism.", alternate: "Abstract globe models, slower ecological consciousness." }
    ],
    finalPerspective: "The Moon Landing proved that humanity could leave its home planet. Without it, our vision of the future would have remained firmly bound to Earth, limiting our identity to a single planet."
  },
  "the-discovery-of-fire": {
    id: "the-discovery-of-fire",
    title: "Humans Never Discovered Fire",
    category: "Science & Space",
    shortTitle: "Discovery of Fire",
    icon: "flame",
    originalEvent: {
      summary: "Hominids discovered how to control and create fire hundreds of thousands of years ago.",
      importance: "It allowed for cooking (which shrunk gut size and grew brain size), provided warmth to migrate to cold climates, offered protection from predators, and enabled metallurgy."
    },
    timeline: {
      tenYears: "Early hominids remain restricted to tropical climates, unable to migrate north into Europe or Asia due to winter freezing. Raw food consumption is the sole source of energy.",
      fiftyYears: "Predators easily attack hominid camps at night. Evolutionary pathways split; without cooked protein, brain development plateaus, keeping hominids as a clever animal species.",
      hundredYears: "No stone or metal tools are developed, as metallurgy is impossible without heat. Hominids live in small, nomadic family groups in equatorial forests, living in harmony with nature.",
      present: "Homo sapiens as an advanced technological species does not exist. The Earth is dominated by dense forests and megafauna. Hominids exist as a rare, highly specialized primate species living in African canopies."
    },
    techImpact: {
      missingTech: ["Metallurgy (Copper, Bronze, Iron)", "Cooking and Food preservation", "Glassmaking and Ceramics", "Engines and Combustion", "Agriculture (no clearing of land)"],
      description: "All human technology, from the stone age to the space age, is entirely non-existent. Technology is limited to simple wood and unheated stone tools."
    },
    societyImpact: {
      description: "No cities, languages, or civilizations. Human groups live in simple social structures similar to chimpanzee communities, focused on daily foraging."
    },
    economyImpact: {
      description: "No trade, division of labor, or agriculture. The economy is purely ecological, based on natural resource availability and predator-prey dynamics."
    },
    scienceImpact: {
      description: "No science exists. The human brain lacks the metabolic energy (which cooking unlocked) to develop complex abstract reasoning and language."
    },
    politicsImpact: {
      description: "No governments or laws. Social order is maintained through physical dominance within local family groups."
    },
    cultureImpact: {
      description: "No art, religion, or storytelling. Lifestyles are purely instinctual, focused on survival in the immediate present."
    },
    rippleEffects: [
      "Hominids Fail to Control Campfires",
      "Raw Meat Consumption Continues",
      "Brain Sizes Remain Small",
      "No Migration to Cold Regions",
      "Humanity Remains a Wild Primate Species"
    ],
    positives: [
      "Pristine global ecosystems with zero human impact, pollution, or extinctions.",
      "Megafauna (woolly mammoths, sabertooth cats) continue to roam the Earth.",
      "No warfare, industrial exploitation, or human suffering from civilization."
    ],
    negatives: [
      "Homo sapiens never develops consciousness, art, or science.",
      "Human population is extremely low, vulnerable to natural predators.",
      "No capability to survive ice ages or environmental shifts."
    ],
    comparison: {
      before: "A planet reshaped by human technology, cities, and space travel.",
      after: "A wild planet dominated by nature, with humans living as wild primates."
    },
    cards: [
      { title: "Brain Size", modern: "Large human brain capable of language and physics.", alternate: "Smaller hominid brain focused on foraging and survival." },
      { title: "Planet Earth", modern: "Urban landscapes, agricultural fields, global shipping.", alternate: "Endless forests, pristine rivers, roaming megafauna." },
      { title: "Diet", modern: "Cooked, processed, varied global cuisine.", alternate: "Raw fruits, roots, and raw meat sourced locally." }
    ],
    finalPerspective: "Fire was the first technology. By outsourcing digestion to heat, it unlocked the brain power that made us human. Without it, humanity would have remained just another animal in the wild."
  },
  "agriculture": {
    id: "agriculture",
    title: "Agriculture Was Never Developed",
    category: "Science & Space",
    shortTitle: "Agriculture",
    icon: "plant",
    originalEvent: {
      summary: "The agricultural revolution began around 10,000 years ago, with the domestication of plants and animals.",
      importance: "It allowed humans to transition from nomadic hunter-gatherers to settled societies, leading to the creation of cities, writing, laws, and specialized professions."
    },
    timeline: {
      tenYears: "Nomadic tribes continue to follow seasonal migrations of wild game. Human populations are strictly limited by the natural carrying capacity of the land, preventing large gatherings.",
      fiftyYears: "No cities are built. Permanent structures do not exist, as tribes must move constantly to avoid depleting local wild plants. Property ownership is limited to what can be carried.",
      hundredYears: "A world of highly refined ecological tracking. Tribes possess deep botanical knowledge and navigate massive migration routes across continents. Forests remain untouched.",
      present: "The global human population is under 10 million. The Earth is a continuous wilderness. Humans live in small, egalitarian bands, hunting wild animals and gathering seasonal nuts and berries. Language is complex but entirely oral."
    },
    techImpact: {
      missingTech: ["Permanent Cities", "Writing Systems (developed for grain tax tracking)", "Metal Tools (requires settled kilns)", "Domestication of animals", "Mass production"],
      description: "Without grain surpluses, there is no division of labor. Every individual must spend their day securing food, preventing the rise of specialized artisans or scientists."
    },
    societyImpact: {
      description: "Societies are highly egalitarian. Class hierarchies, slavery, and land ownership do not exist, as resources are shared and accumulation is impossible."
    },
    economyImpact: {
      description: "The economy is purely gift-based within tribes. There is no money, interest, or debt. Trade between tribes is limited to rare decorative items."
    },
    scienceImpact: {
      description: "Astronomy is limited to seasonal calendar tracking. Medicine is purely herbal. No mathematics or writing exists, preventing the accumulation of scientific data."
    },
    politicsImpact: {
      description: "No states, kingdoms, or borders. Governance is consensus-based, led by tribal elders. Conflict is limited to small-scale territorial skirmishes."
    },
    cultureImpact: {
      description: "Rich oral histories, complex mythologies, and deep spiritual connections to specific natural landmarks. Cave paintings and woodcarvings are the sole visual arts."
    },
    rippleEffects: [
      "Humans Continue Gathering Wild Grains",
      "No Permanent Settlements Built",
      "No Food Surplus to Feed Specialists",
      "No Writing or Accounting Systems",
      "Humanity Remains Nomadic Hunter-Gatherers"
    ],
    positives: [
      "Zero environmental degradation, soil erosion, or animal exploitation.",
      "Egalitarian social structures with no wealth inequality or class oppression.",
      "Healthier daily lives with diverse diets and no crowd-borne diseases (plagues)."
    ],
    negatives: [
      "Extremely low human population, highly vulnerable to winter famines.",
      "No written history, literature, or advanced scientific knowledge.",
      "No security against natural disasters or climate shifts."
    ],
    comparison: {
      before: "A planet of cities, global shipping, and digital records.",
      after: "A pristine wilderness populated by small, nomadic hunting bands."
    },
    cards: [
      { title: "Daily Food", modern: "Supermarkets, globally sourced packaged meals.", alternate: "Foraged tubers, wild berries, hunted deer." },
      { title: "Shelter", modern: "Concrete skyscrapers, suburban houses.", alternate: "Temporary animal-skin tents, caves, brushwood lean-tos." },
      { title: "Knowledge", modern: "Libraries, websites, universities.", alternate: "Elder oral stories, astronomical songlines." }
    ],
    finalPerspective: "Agriculture created civilization by providing a food surplus. Without it, humanity would have remained nomadic foragers—living in absolute equality and harmony with nature, but without written memory."
  },
  "the-wheel": {
    id: "the-wheel",
    title: "The Wheel Was Never Invented",
    category: "Technology",
    shortTitle: "The Wheel",
    icon: "circle",
    originalEvent: {
      summary: "The wheel was invented in Mesopotamia around 3500 BC, initially for pottery and later for transportation.",
      importance: "It revolutionized transport, enabled long-distance trade, powered mechanical waterwheels and gears, and laid the foundation for all modern transport and machinery."
    },
    timeline: {
      tenYears: "Goods continue to be transported using sleds pulled by humans or draft animals. Land trade is slow and restricted to flat, muddy terrains where sleds can slide.",
      fiftyYears: "Canals and river systems become the absolute focus of civilization. Cities are built strictly along waterways, as overland transport of heavy stones or grain is economically unviable.",
      hundredYears: "A world of highly advanced canal engineering. Domesticated pack animals (donkeys, llamas, camels) are bred in massive numbers to carry loads in baskets over mountain trails.",
      present: "Overland travel is slow, done on foot or riding animals. Cities are designed with narrow, stepped streets unsuitable for carriages. Machinery is driven by levers and pulleys rather than gears and driveshafts. Global trade is entirely maritime."
    },
    techImpact: {
      missingTech: ["Carts and Carriages", "Gears and Clocks", "Watermills and Windmills", "Trains and Automobiles", "Spinning wheels (textiles)"],
      description: "Without circular motion mechanics, all machinery is limited to linear motion (pistons, levers, ropes), preventing the development of engines."
    },
    societyImpact: {
      description: "Human settlement is coastal. Inland regions remain wild and populated only by nomadic tribes, as transporting resources inland is too difficult."
    },
    economyImpact: {
      description: "Trade is slow and local. Heavy manufacturing (like large-scale iron casting) is limited to coastal ports where resources can be shipped by barge."
    },
    scienceImpact: {
      description: "Physics focuses on statics and simple levers. Astronomy models are simple, lacking the gear-based clocks used to predict planetary motion."
    },
    politicsImpact: {
      description: "Empires are small and coastal. Large land empires (like the Roman or Mongol Empires) cannot form, as armies and messages cannot travel rapidly inland."
    },
    cultureImpact: {
      description: "Lifestyles are slow-paced. Travel is a rare, life-changing event. Art and architecture are highly localized, as transporting foreign materials is prohibitively expensive."
    },
    rippleEffects: [
      "Mesopotamian Potters Avoid Circular Turntables",
      "Overland Transport Restricted to Sleds",
      "No Carts or Chariots in Warfare",
      "No Waterwheel or Windmill Power",
      "No Mechanical Gears or Clockwork"
    ],
    positives: [
      "No road building destroying natural habitats and dividing ecosystems.",
      "Localized, sustainable economies that do not rely on global shipping grids.",
      "Less urban sprawl; cities are compact and walkable."
    ],
    negatives: [
      "Extreme difficulty in transporting food to drought-stricken inland areas.",
      "No industrial machinery, keeping production slow and manual.",
      "Slower communication and integration between human cultures."
    ],
    comparison: {
      before: "A world of highways, high-speed trains, and automated factories.",
      after: "A world of coastal canal cities, pack-animal trails, and lever-based mechanics."
    },
    cards: [
      { title: "Travel", modern: "Highways, cars, trucks, trains.", alternate: "Canal boats, pack-animal caravans, walking trails." },
      { title: "Power", modern: "Turbines, rotating generators, electric motors.", alternate: "Piston pumps, hand-operated levers, weights." },
      { title: "City Design", modern: "Wide streets, parking lots, urban sprawl.", alternate: "Narrow, stepped streets, walkable canals, compact layouts." }
    ],
    finalPerspective: "The wheel is the foundation of mechanical rotation. Without it, humanity would have built a canal-based civilization, keeping transport slow and machinery simple, but preserving walkable, human-scale cities."
  },
  "the-american-revolution": {
    id: "the-american-revolution",
    title: "The American Revolution Was Suppressed",
    category: "War & Politics",
    shortTitle: "American Revolution",
    icon: "flag",
    originalEvent: {
      summary: "The American Revolutionary War (1775–1783) resulted in the independence of the United States from Great Britain.",
      importance: "It created the first modern constitutional republic, inspired the French Revolution, and established a democratic superpower that shaped the 20th and 21st centuries."
    },
    timeline: {
      tenYears: "The British Crown tightens control over the 13 colonies. Revolutionary leaders (Washington, Jefferson) are exiled or imprisoned. High taxes and military presence stabilize the territory.",
      fiftyYears: "North America is organized as the British Dominion of America. Slavery is abolished earlier (in the 1830s, matching British Empire policy), preventing the American Civil War but sparking local planter rebellions.",
      hundredYears: "The British Empire remains the dominant global superpower, using North American resources to counter imperial France and Russia. The concept of republican democracy is viewed as a failed radical experiment.",
      present: "North America is a collection of wealthy Commonwealth states under the British monarch. The global spread of democracy is slower, with constitutional monarchies remaining the default global system. No Hollywood or Wall Street exists in their modern forms."
    },
    techImpact: {
      missingTech: ["Silicon Valley (no US federal research funding structure)", "Mass assembly line (Fordism develops differently in Europe)", "American aviation pacing"],
      description: "Technological standards are set in London and Paris, focusing on railway networks and imperial telegraph lines."
    },
    societyImpact: {
      description: "Class systems remain aligned with British nobility. Indigenous territories in the West are preserved longer, as the British Crown restricts westward expansion to avoid costly wars."
    },
    economyImpact: {
      description: "London remains the financial capital of the world. North American trade is directed through British ports under imperial tariffs, preventing the rise of an independent Wall Street."
    },
    scienceImpact: {
      description: "Scientific research is highly centralized in British universities (Oxford, Cambridge). Patent laws are governed by the Crown, favoring established imperial monopolies."
    },
    politicsImpact: {
      description: "No independent United States. The French Revolution is delayed or takes a moderate path without the American debt crisis. Constitutional monarchies dominate Europe."
    },
    cultureImpact: {
      description: "American pop culture (jazz, rock, cinema) does not dominate the globe. English culture remains traditional, class-conscious, and focused on literature and theater."
    },
    rippleEffects: [
      "British Army Wins Battle of Long Island",
      "Revolutionary Leadership Disbands",
      "Colonies Placed Under Direct Military Rule",
      "Slavery Abolished in 1833 by British Decree",
      "North America Remains a British Dominion"
    ],
    positives: [
      "Slavery abolished decades earlier in North America without a bloody Civil War.",
      "Avoidance of westward displacement of Native American tribes under the Royal Proclamation.",
      "Greater geopolitical stability in the Anglosphere."
    ],
    negatives: [
      "Slower global spread of democratic rights and individual liberties.",
      "Higher taxes and imperial control over local resources.",
      "No cultural crucible for the rapid innovation of the 20th century."
    ],
    comparison: {
      before: "A world led by a democratic American superpower, with global republic alliances.",
      after: "A world dominated by the British Empire, with constitutional monarchies as the default."
    },
    cards: [
      { title: "Government", modern: "Independent federal republic, balance of powers.", alternate: "Parliamentary dominion under the British Crown." },
      { title: "Finance", modern: "Wall Street dominance, US Dollar as global reserve.", alternate: "London City dominance, British Pound as global reserve." },
      { title: "Civil Rights", modern: "Slavery ended in 1865 after civil war; segregation struggles.", alternate: "Slavery ended in 1833 by imperial decree; class-based stratification." }
    ],
    finalPerspective: "The American Revolution proved that colonies could self-govern as republics. Its suppression would have preserved the British Empire's global dominance and abolished slavery earlier, but at the cost of global democratic momentum."
  },
  "the-french-revolution": {
    id: "the-french-revolution",
    title: "The French Revolution Was Avoided",
    category: "War & Politics",
    shortTitle: "French Revolution",
    icon: "flag",
    originalEvent: {
      summary: "The French Revolution (1789–1799) overthrew the absolute monarchy, feudal system, and established radical democratic principles.",
      importance: "It introduced the Declaration of the Rights of Man, dismantled feudalism across Europe through the Napoleonic Wars, and birthed modern nationalism and political spectrums."
    },
    timeline: {
      tenYears: "King Louis XVI successfully implements tax reforms, taxing the nobility. The Estates-General is dissolved peacefully. France avoids the Reign of Terror and remains a stable monarchy.",
      fiftyYears: "Feudalism is dismantled slowly through royal decrees rather than violent revolution. Other European monarchies remain stable, without the threat of Napoleonic invasions.",
      hundredYears: "Europe transitions gradually to constitutional systems. The Holy Roman Empire remains intact, preventing the rapid unification of Germany and Italy. Nationalism is a weak, academic concept.",
      present: "Europe is a patchwork of stable, historic kingdoms. The boundaries of countries resemble the 18th-century map. Secularism is less prominent, and traditional religious institutions maintain significant influence in education and law."
    },
    techImpact: {
      missingTech: ["The Metric System (which was created by the revolutionary government)", "Early mass mobilization logistics", "Napoleonic administrative technology"],
      description: "Without the rapid reorganization of French society, scientific standardization is delayed, with regional measurement systems persisting."
    },
    societyImpact: {
      description: "Aristocratic privileges decline slowly over generations. Social mobility is lower, and the Catholic Church remains the dominant social and educational authority in France."
    },
    economyImpact: {
      description: "Wealth remains tied to land and inheritance. The rise of industrial capitalism in Continental Europe is slower, as guild monopolies are not abolished by revolutionary armies."
    },
    scienceImpact: {
      description: "Scientific funding remains dependent on royal patronage. Great scientists (like Lavoisier, who was guillotined in the revolution) live to complete their research, accelerating early chemistry."
    },
    politicsImpact: {
      description: "No Napoleonic Wars. The Holy Roman Empire persists, leaving Central Europe fragmented. The concepts of 'left-wing' and 'right-wing' politics do not exist."
    },
    cultureImpact: {
      description: "Art remains classical and focused on royal themes. The romantic movement, which reacted to the passion and terror of the revolution, is quiet and academic."
    },
    rippleEffects: [
      "Louis XVI Tax Reforms Approved by Nobles",
      "Estates-General Concludes Peacefully",
      "No Storming of the Bastille",
      "No Napoleonic Wars in Europe",
      "Holy Roman Empire Remains Intact"
    ],
    positives: [
      "Avoidance of the Reign of Terror and the deaths of hundreds of thousands in the Napoleonic Wars.",
      "Preservation of historic European political stability.",
      "Continuation of scientific work by scholars who were targeted by radicals."
    ],
    negatives: [
      "Slower dismantling of oppressive feudal laws and class privileges.",
      "No global adoption of the simple Metric System, keeping measurements complex.",
      "Delayed recognition of human and civil rights across Europe."
    ],
    comparison: {
      before: "A secular, democratic Europe with standardized laws and borders.",
      after: "A traditional, monarchical Europe with feudal remnants and complex regional laws."
    },
    cards: [
      { title: "Law", modern: "Napoleonic Code, universal human rights.", alternate: "Royal decrees, regional feudal courts, noble exemptions." },
      { title: "Measurement", modern: "Metric system (meters, kilograms) used globally.", alternate: "Inches, feet, local French measurement units." },
      { title: "Central Europe", modern: "Unified nations of Germany and Italy.", alternate: "Fragile Holy Roman Empire of hundreds of small states." }
    ],
    finalPerspective: "The French Revolution shattered the divine right of kings. Without it, Europe would have transitioned peacefully to modern times, but at the expense of locking generations under feudal privilege and confusing regional laws."
  },
  "the-green-revolution": {
    id: "the-green-revolution",
    title: "The Green Revolution Never Happened",
    category: "Science & Space",
    shortTitle: "Green Revolution",
    icon: "plant",
    originalEvent: {
      summary: "The Green Revolution (1940s–1960s) introduced high-yielding crop varieties, synthetic fertilizers, and irrigation techniques, led by Norman Borlaug.",
      importance: "It dramatically increased global food production, particularly in developing nations like India and Mexico, saving over a billion people from starvation."
    },
    timeline: {
      tenYears: "Developing nations face chronic food shortages. Famines become frequent in South Asia and Latin America as population growth outstrips traditional agricultural yields.",
      fiftyYears: "Massive demographic collapse in Asia. Chronic malnutrition restricts economic development. Geopolitics is dominated by 'food aid diplomacy' from agricultural superpowers (US, Canada).",
      hundredYears: "The global population stabilizes at a much lower level (around 3-4 billion). Major migrations occur from drought-prone regions to fertile river basins, causing geopolitical friction.",
      present: "The global population is small, and food security is the primary concern of every government. Agriculture is labor-intensive, requiring 50% of the workforce. Large-scale industrial cities in the developing world do not exist due to food limits."
    },
    techImpact: {
      missingTech: ["Genetically modified high-yield seeds", "Mass-scale chemical fertilizers (Haber-Bosch exists but is restricted)", "Automated central pivot irrigation", "Industrial chemical pesticides"],
      description: "Agricultural technology remains focused on crop rotation and organic fertilizers, limiting maximum yield per acre."
    },
    societyImpact: {
      description: "Societies remain agrarian. The massive migration of workers from farms to city factories is delayed, keeping urban populations small and rural traditions strong."
    },
    economyImpact: {
      description: "Food prices represent 60% of household income. Discretionary spending on consumer electronics or travel is low, limiting the growth of the service economy."
    },
    scienceImpact: {
      description: "Biology focuses heavily on soil science and ecological balance. Genetic engineering of plants is banned or undeveloped, leaving biotechnology in its infancy."
    },
    politicsImpact: {
      description: "Severe political instability in Asia and Africa. Multiple governments collapse due to food riots. Geopolitical borders are drawn around arable land and water access."
    },
    cultureImpact: {
      description: "Lifestyles are centered around food preservation and seasonal harvests. Feasts are rare and highly celebrated. Food waste is culturally viewed as a severe crime."
    },
    rippleEffects: [
      "Borlaug Fails to Breed Dwarf Wheat",
      "Traditional Crop Yields Fail to Grow",
      "Widespread Starvation in South Asia",
      "Urbanization Levels Decline Rapidly",
      "Global Population Caps at 4 Billion"
    ],
    positives: [
      "No chemical fertilizer runoff creating ocean dead zones.",
      "Less soil depletion and preservation of agricultural biodiversity.",
      "Slower population growth, reducing pressure on global forests."
    ],
    negatives: [
      "Over a billion human deaths due to starvation and malnutrition.",
      "Severe poverty and lack of industrial development in Asia and Africa.",
      "Constant geopolitical conflict over fertile soil and irrigation rivers."
    ],
    comparison: {
      before: "A populated planet of 8 billion, with cheap food and industrial cities.",
      after: "A hunger-limited planet of 4 billion, with agrarian economies and ecological preservation."
    },
    cards: [
      { title: "Population", modern: "8 billion people; rising urban middle class.", alternate: "3-4 billion people; capped by local soil fertility." },
      { title: "Environment", modern: "Chemical runoff, industrial farming, loss of topsoil.", alternate: "Organic farming, topsoil stability, clean river networks." },
      { title: "Labor", modern: "Under 5% of workforce in agriculture in developed nations.", alternate: "Over 40% of population working physically in food production." }
    ],
    finalPerspective: "The Green Revolution fed the modern population boom. Without it, humanity would have faced a massive Malthusian catastrophe, preserving the earth's chemical balance but at the cost of a billion human lives."
  },
  "vaccines": {
    id: "vaccines",
    title: "Vaccine Technology Was Never Discovered",
    category: "Science & Space",
    shortTitle: "Vaccines",
    icon: "needle",
    originalEvent: {
      summary: "Edward Jenner pioneered vaccination in 1796 using cowpox to immunize against smallpox, leading to modern immunology.",
      importance: "It eradicated smallpox, nearly eliminated polio, and dramatically reduced child mortality, allowing the global population to grow and thrive."
    },
    timeline: {
      tenYears: "Smallpox epidemics continue to devastate cities every decade, killing up to 30% of those infected. Quarantine laws are severe, restricting travel between regions.",
      fiftyYears: "Average life expectancy remains under 40 years, dominated by high child mortality. Families routinely lose multiple children to measles, whooping cough, and diphtheria.",
      hundredYears: "A world of high birth rates but stable populations. Urban growth is limited, as high-density cities consistently trigger catastrophic outbreaks of polio and cholera.",
      present: "The global population is low. Public spaces are designed to prevent close contact. Copper and silver surfaces (which are antimicrobial) are used everywhere. Lifestyles are cautious, and the fear of seasonal disease waves dominates society."
    },
    techImpact: {
      missingTech: ["Eradication of Smallpox", "Polio treatments/iron lungs", "Modern immunology frameworks", "Therapeutic antibody treatments"],
      description: "Without the concept of training the immune system, medicine remains reactive, focusing on quarantine and symptom management."
    },
    societyImpact: {
      description: "Family structures are adapted to high child mortality; parents avoid naming children until they survive past age 5. Caregiving is the primary societal focus."
    },
    economyImpact: {
      description: "Labor shortages are frequent due to epidemics. The travel and hospitality industries are small and heavily regulated, requiring strict health checks at every border."
    },
    scienceImpact: {
      description: "Microbiology focuses on sanitation and chemical disinfectants. Virology is a feared, restricted field with minimal funding due to the perceived danger of research."
    },
    politicsImpact: {
      description: "Governments are highly authoritarian during outbreaks, enforcing strict lockdowns and border closures as their primary tools of survival."
    },
    cultureImpact: {
      description: "Greetings are distant (bowing instead of handshakes). Art and literature frequently deal with themes of sudden death and epidemic survival, maintaining a sober cultural tone."
    },
    rippleEffects: [
      "Jenner Fails Cowpox Observation",
      "Smallpox Remains an Active Epidemic",
      "Child Mortality Rates Stay High",
      "Urban Density Restricted by Outbreaks",
      "Geopolitical Travel Heavily Quarantined"
    ],
    positives: [
      "No debates over vaccine safety or mandates.",
      "Less evolutionary pressure on viruses to mutate past vaccine immunity.",
      "A culture with a deep respect for sanitation and natural hygiene."
    ],
    negatives: [
      "Billions of premature deaths throughout the 19th and 20th centuries.",
      "Widespread physical disability from polio and other preventable diseases.",
      "Lower life expectancy and constant fear of close social contact."
    ],
    comparison: {
      before: "A world of high life expectancy, dense cities, and global travel.",
      after: "A world of short lifespans, low-density cities, and perpetual quarantines."
    },
    cards: [
      { title: "Life Expectancy", modern: "70-80 years; low child mortality.", alternate: "35-45 years; 30% child mortality before age 5." },
      { title: "Social Interaction", modern: "Concerts, packed subways, global handshakes.", alternate: "Distant greetings, ventilated spaces, small gatherings." },
      { title: "Medicine", modern: "Preventative immunology, vaccines, gene therapy.", alternate: "Quarantine protocols, antimicrobial herbal sanitizers." }
    ],
    finalPerspective: "Vaccines are the shield of public health. Without them, human history would remain a tragic cycle of plague and quarantine, preventing the density and connectivity that define modern cities."
  },
  "the-telephone": {
    id: "the-telephone",
    title: "The Telephone Was Never Invented",
    category: "Technology",
    shortTitle: "Telephone",
    icon: "phone",
    originalEvent: {
      summary: "Alexander Graham Bell patented the telephone in 1876, enabling the transmission of vocal sounds over electrical wires.",
      importance: "It replaced the telegraph with instant voice communication, breaking the barrier of distance for business, personal relationships, and laying the path for radio and the internet."
    },
    timeline: {
      tenYears: "Telegraph networks expand. Businesses rely on written telegrams and Morse code. A profession of highly skilled telegraph operators dominates communication hubs.",
      fiftyYears: "Written teleprinters (telex machines) are developed, printing messages directly in offices. Voice transmission is deemed an impossible engineering challenge. Lifestyles remain silent.",
      hundredYears: "A highly sophisticated text-only network. Newspaper companies use high-speed teleprinters to transmit print globally. People send personal letters and telegrams for urgent news.",
      present: "The communication network is purely text and paper-based. Businesses run on telex and fax systems. Long-distance personal relationships are maintained via letters. The human voice is never heard over distance, keeping life quiet and focused on the written word."
    },
    techImpact: {
      missingTech: ["Voice calling / cell phones", "Radio broadcasts (developed from voice transmission)", "Voice-assistant software", "Modern call centers", "Modem-based dial-up internet"],
      description: "Without analog voice modulation tech, communication remains digital-binary (dots and dashes) or text-print, delaying the web."
    },
    societyImpact: {
      description: "Communication is thoughtful. People write letters, choosing their words carefully. The home is a quiet sanctuary, never interrupted by a ringing telephone."
    },
    economyImpact: {
      description: "Business transactions are slow and contract-focused. Negotiation requires meeting in person or sending formal written offers, reducing the speed of financial speculation."
    },
    scienceImpact: {
      description: "Acoustics research is limited. Physics focuses on wire-based signaling speed rather than wireless voice modulation, keeping communications wired."
    },
    politicsImpact: {
      description: "Diplomatic crises are managed through written dispatches. No 'Red Telephone' hotlines between leaders, requiring slower, more deliberate treaty writing."
    },
    cultureImpact: {
      description: "Literary culture is strong. Reading and letter-writing are core hobbies. People possess excellent writing skills, and regional accents remain distinct due to lack of vocal exposure."
    },
    rippleEffects: [
      "Bell's Harmonic Telegraph Project Fails",
      "Telegraph Remains Sole Electronic Link",
      "Telex Printing Replaces Voice Goals",
      "Communication Relies on Written Text",
      "No Wireless Vocal Era (Radio/Cellular)"
    ],
    positives: [
      "No telemarketing, spam calls, or constant telephone interruptions.",
      "More thoughtful, written correspondence preserved as historical records.",
      "Greater peace and quiet in domestic and public spaces."
    ],
    negatives: [
      "No ability to hear the voice of a distant loved one in real-time.",
      "Slower response times in emergencies, increasing fire and medical risks.",
      "Friction in business coordination, slowing down financial systems."
    ],
    comparison: {
      before: "A world of constant phone notifications, call centers, and cellular voice links.",
      after: "A world of written teleprinters, personal letters, and silent domestic spaces."
    },
    cards: [
      { title: "Urgent News", modern: "Instant phone calls, voice notes, video calls.", alternate: "Telegrams in Morse code, handwritten express letters." },
      { title: "Office Work", modern: "Cubicles with ringing phones, customer support lines.", alternate: "Quiet typing pools, telex rooms, local messengers." },
      { title: "Language", modern: "Globalized accents, speech-to-text inputs.", alternate: "Distinct local accents, written diary keeping." }
    ],
    finalPerspective: "The telephone brought the human voice across continents. Without it, we would have maintained a world of quiet, literary thoughtfulness, but at the cost of losing the warmth and speed of vocal connection."
  }
};

// Map of topics for search mapping
const TOPIC_MAPPING = {
  "world war 1": "world-war-i",
  "world war i": "world-war-i",
  "ww1": "world-war-i",
  "world war 2": "world-war-ii",
  "world war ii": "world-war-ii",
  "ww2": "world-war-ii",
  "the internet": "the-internet",
  "internet": "the-internet",
  "web": "the-internet",
  "electricity": "electricity",
  "electric": "electricity",
  "printing press": "printing-press",
  "books": "printing-press",
  "steam engine": "steam-engine",
  "steam": "steam-engine",
  "industrial revolution": "the-industrial-revolution",
  "smartphones": "smartphones",
  "smartphone": "smartphones",
  "iphone": "smartphones",
  "artificial intelligence": "artificial-intelligence",
  "ai": "artificial-intelligence",
  "chatgpt": "artificial-intelligence",
  "covid": "covid-19",
  "covid-19": "covid-19",
  "pandemic": "covid-19",
  "gps": "gps",
  "satellite": "gps",
  "navigation": "gps",
  "moon landing": "the-moon-landing",
  "moon": "the-moon-landing",
  "apollo": "the-moon-landing",
  "fire": "the-discovery-of-fire",
  "discovery of fire": "the-discovery-of-fire",
  "agriculture": "agriculture",
  "farming": "agriculture",
  "wheel": "the-wheel",
  "the wheel": "the-wheel",
  "american revolution": "the-american-revolution",
  "french revolution": "the-french-revolution",
  "green revolution": "the-green-revolution",
  "borlaug": "the-green-revolution",
  "vaccines": "vaccines",
  "vaccine": "vaccines",
  "immunization": "vaccines",
  "telephone": "the-telephone",
  "phone": "the-telephone"
};

const POPULAR_SUGGESTIONS = [
  "If Electricity Never Existed",
  "If The Internet Never Existed",
  "If World War II Never Happened",
  "If The Printing Press Was Never Invented",
  "If Humans Never Reached The Moon",
  "If Smartphones Never Existed"
];

// Helper to determine simulation loading steps
const LOADING_STEPS = [
  "Erasing historical event from baseline timeline...",
  "Recalculating geopolitical butterfly effects...",
  "Simulating technology dependency decay...",
  "Mapping cultural and societal adaptations...",
  "Drafting alternate timeline cards...",
  "Finalizing local simulation data..."
];

export default function IfThisNeverHappenedPage() {
  if (TOOL_STATUS === "upcoming") {
    return <ComingSoon toolName="If This Never Happened" />;
  }

  // Inputs & states
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  
  // Interactivity
  const [timelineStep, setTimelineStep] = useState("present"); // 'tenYears', 'fiftyYears', 'hundredYears', 'present'
  const [activeTab, setActiveTab] = useState("tech"); // 'tech', 'society', 'economy', 'science', 'politics', 'culture'

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [toast, setToast] = useState({ type: "", message: "" });

  const loadingTimerRef = useRef(null);
  const toastTimerRef = useRef(null);

  // Initialize recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("bt_recent_searches_if_this");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }

    return () => {
      if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (type, message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ type, message });
    toastTimerRef.current = setTimeout(() => {
      setToast({ type: "", message: "" });
    }, 2500);
  };

  // Filtered suggestions list based on query
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const normalized = query.toLowerCase();
    
    // Find matching keys in DB
    const dbMatches = Object.values(ALTERNATE_HISTORY_DB).filter(
      item => item.title.toLowerCase().includes(normalized) || 
              item.shortTitle.toLowerCase().includes(normalized)
    ).map(item => item.title);

    // Add map matches
    const mapMatches = Object.keys(TOPIC_MAPPING)
      .filter(k => k.includes(normalized))
      .map(k => {
        const id = TOPIC_MAPPING[k];
        return ALTERNATE_HISTORY_DB[id]?.title;
      })
      .filter(Boolean);

    // Merge & deduplicate
    const all = Array.from(new Set([...dbMatches, ...mapMatches])).slice(0, 5);
    return all;
  }, [query]);

  // Save search to local history
  const saveSearch = (title) => {
    const updated = [title, ...recentSearches.filter(s => s !== title)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem("bt_recent_searches_if_this", JSON.stringify(updated));
    } catch (e) {}
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("bt_recent_searches_if_this");
    } catch (e) {}
    showToast("success", "Recent searches cleared.");
  };

  // Smart Procedural Fallback Generator
  const generateProceduralTopic = (rawTopic) => {
    // Clean topic name
    let cleaned = rawTopic.trim();
    // Remove starting 'if', 'what if'
    cleaned = cleaned.replace(/^(if|what if)\s+/i, "");
    // Remove ending 'never existed', 'never happened', 'was never invented'
    cleaned = cleaned.replace(/\s+(never existed|never occurred|never happened|was never invented|was never discovered)$/i, "");
    
    // Capitalize
    const displayTopic = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    const lower = displayTopic.toLowerCase();

    // Geopolitical, Tech, or Science detection
    let category = "Innovation & Technology";
    let icon = "cog";
    if (lower.includes("war") || lower.includes("revolution") || lower.includes("assassination") || lower.includes("treaty") || lower.includes("empire")) {
      category = "War & Politics";
      icon = "war";
    } else if (lower.includes("discovery") || lower.includes("science") || lower.includes("cure") || lower.includes("plague") || lower.includes("vaccine") || lower.includes("mars")) {
      category = "Science & Discovery";
      icon = "plant";
    }

    return {
      id: "procedural",
      title: `If ${displayTopic} Never Happened`,
      category: category,
      shortTitle: displayTopic,
      icon: icon,
      isProcedural: true,
      originalEvent: {
        summary: `${displayTopic} was a fundamental milestone that reshaped human organization, technology, or thinking.`,
        importance: `It altered resource allocations, pushed research down a specific path, and defined the parameters of modern culture and society.`
      },
      timeline: {
        tenYears: `Societies and industries adjust to the absolute absence of ${displayTopic}. Emergency workarounds are deployed, and resources are diverted to alternative solutions.`,
        fiftyYears: `A generation grows up without any direct reference to ${displayTopic}. Institutional systems have fully adapted, locking in a different technological or social trajectory.`,
        hundredYears: `Historical memory of what could have been fades. The absence of ${displayTopic} is now the global default. The world is structurally divergent.`,
        present: `The present day is a blend of retro-fitting and alternative breakthroughs. Life in this sector operates on entirely different rules, with unique limitations and surprising replacements.`
      },
      techImpact: {
        missingTech: [`Direct derivatives of ${displayTopic}`, `Secondary support tools`, `Related automation systems`],
        description: `Without the fundamental breakthrough of ${displayTopic}, engineers optimize parallel technologies, shifting from electronic or mechanical default tracks to alternative solutions.`
      },
      societyImpact: {
        description: `Daily lifestyle adjusts to a different pace. Social relationships and class parameters are structured around alternative resource hubs.`
      },
      economyImpact: {
        description: `Capital markets redirect investments. Industries that would have relied on ${displayTopic} instead invest in traditional or alternative sectors, shifting global wealth layouts.`
      },
      scienceImpact: {
        description: `Scientific inquiry is redirected. The physics, chemistry, or social principles that explain ${displayTopic} are left as minor academic footnotes, and researchers prioritize alternate fields.`
      },
      politicsImpact: {
        description: `Geopolitical alliances adjust. Nations that would have benefited from the leverage of ${displayTopic} operate under different diplomatic weights.`
      },
      cultureImpact: {
        description: `Entertainment, communication styles, and language lack terms and frameworks created by ${displayTopic}, keeping expression more traditional.`
      },
      rippleEffects: [
        `No ${displayTopic} Breakthrough`,
        `Alternative Technology Focus`,
        `Redirected Capital Allocation`,
        `Altered Social Habitation`,
        `Divergent Present Day Ecosystem`
      ],
      positives: [
        `Avoidance of issues, pollution, or conflicts associated with ${displayTopic}.`,
        `Greater investment in alternative, potentially more sustainable paths.`,
        `Opportunity for human organization to develop under different parameters.`
      ],
      negatives: [
        `Slower technological development in this specific domain.`,
        `Loss of convenience and efficiency that ${displayTopic} provided.`,
        `Inability to solve problems that are easily resolved in the baseline timeline.`
      ],
      comparison: {
        before: `A modern world built directly on the capabilities unlocked by ${displayTopic}.`,
        after: `A simulated alternate present running on completely different tools, rules, and structures.`
      },
      cards: [
        { title: "Main Difference", modern: `Fully integrated with ${displayTopic} defaults.`, alternate: `Alternative solutions and specialized habits dominate.` },
        { title: "Infrastructure", modern: `Optimized for high-speed use of ${displayTopic}.`, alternate: `Repurposed layouts emphasizing traditional or retro assets.` }
      ],
      finalPerspective: `${displayTopic} was a defining pivot for humanity. Simulating its absence reveals how contingent our modern systems are, reminding us that other worlds are always possible.`
    };
  };

  // Run the alternate history simulation
  const handleSimulate = async (topicText) => {
    const input = topicText || query;
    if (!input.trim()) {
      showToast("error", "Please input a topic to simulate.");
      return;
    }

    setIsLoading(true);
    setLoadingStepIndex(0);
    setSelectedTopic(null);

    // Start loading step interval
    let currentStep = 0;
    if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);
    loadingTimerRef.current = setInterval(() => {
      currentStep = (currentStep + 1) % LOADING_STEPS.length;
      setLoadingStepIndex(currentStep);
    }, 700);

    try {
      // First try to fetch from API
      const res = await fetch("/api/if-this-never-happened", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: input }),
      });

      if (res.ok) {
        const data = await res.json();
        // Clear loading timer
        if (loadingTimerRef.current) {
          clearInterval(loadingTimerRef.current);
          loadingTimerRef.current = null;
        }
        setSelectedTopic(data);
        saveSearch(data.title);
        setTimelineStep("present");
        setIsLoading(false);
        setShowSuggestions(false);
        showToast("success", "Alternate timeline simulated using AI!");
        return;
      }
      
      // If we got here, API request failed (e.g. 503 or key not configured)
      console.warn("API simulation failed, falling back to local engine:", res.status);
    } catch (e) {
      console.warn("API simulation exception, falling back to local engine:", e);
    }

    // Fallback: Local database or procedural generation
    setTimeout(() => {
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }

      // Try database mapping
      const normalized = input.toLowerCase().trim();
      let targetId = TOPIC_MAPPING[normalized];

      if (!targetId) {
        const match = Object.values(ALTERNATE_HISTORY_DB).find(
          item => normalized.includes(item.shortTitle.toLowerCase()) || 
                  item.title.toLowerCase().includes(normalized)
        );
        if (match) targetId = match.id;
      }

      let resultData = null;
      if (targetId && ALTERNATE_HISTORY_DB[targetId]) {
        resultData = ALTERNATE_HISTORY_DB[targetId];
        saveSearch(resultData.title);
      } else {
        resultData = generateProceduralTopic(input);
        saveSearch(resultData.title);
      }

      setSelectedTopic(resultData);
      setTimelineStep("present");
      setIsLoading(false);
      setShowSuggestions(false);
      showToast("success", "Timeline simulated locally (offline fallback)!");
    }, 1200);
  };

  const handleReset = () => {
    setQuery("");
    setSelectedTopic(null);
    setTimelineStep("present");
    setActiveTab("tech");
    showToast("success", "Simulator reset.");
  };

  // Report generation for Copy/Download
  const reportText = useMemo(() => {
    if (!selectedTopic) return "";
    const timestamp = new Date().toLocaleString();
    const t = selectedTopic;

    return `==================================================
ALTERNATE HISTORY SIMULATION: ${t.title.toUpperCase()}
Generated: ${timestamp}
Category: ${t.category}
==================================================

1. ORIGINAL EVENT / MILESTONE
--------------------------------------------------
* Summary: ${t.originalEvent.summary}
* Why It Mattered: ${t.originalEvent.importance}

2. ALTERNATE TIMELINE PROGRESSION
--------------------------------------------------
* 10 Years Later:
  ${t.timeline.tenYears}

* 50 Years Later:
  ${t.timeline.fiftyYears}

* 100 Years Later:
  ${t.timeline.hundredYears}

* Present Day:
  ${t.timeline.present}

3. DOMAIN-SPECIFIC IMPACTS
--------------------------------------------------
* Technology Impact:
  ${t.techImpact.description}
  (Likely missing: ${t.techImpact.missingTech.join(", ")})

* Society Impact:
  ${t.societyImpact.description}

* Economy Impact:
  ${t.economyImpact.description}

* Science Impact:
  ${t.scienceImpact.description}

* Politics Impact:
  ${t.politicsImpact.description}

* Culture Impact:
  ${t.cultureImpact.description}

4. RIPPLE EFFECTS CHAIN
--------------------------------------------------
${t.rippleEffects.map((node, i) => `[Node ${i + 1}] ${node}`).join("  -->  ")}

5. PROS & CONS OF ALTERNATE TIMELINE
--------------------------------------------------
[Positive Possibilities]
${t.positives.map(p => `+ ${p}`).join("\n")}

[Negative Consequences]
${t.negatives.map(n => `- ${n}`).join("\n")}

6. FINAL PERSPECTIVE
--------------------------------------------------
${t.finalPerspective}

==================================================
Generated 100% client-side via Boring Tools.
Everything runs locally in your browser. No information is uploaded.
==================================================`;
  }, [selectedTopic]);

  const handleCopy = async () => {
    if (!reportText) return;
    try {
      await navigator.clipboard.writeText(reportText);
      showToast("success", "Simulation report copied!");
    } catch (e) {
      showToast("error", "Failed to copy report.");
    }
  };

  const handleDownload = () => {
    if (!selectedTopic) return;
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `if-never-happened-${selectedTopic.shortTitle.toLowerCase().replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("success", "Report file downloaded!");
  };

  // Render correct SVG icon
  const renderIcon = (type) => {
    switch (type) {
      case "war":
        return (
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case "globe":
        return (
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        );
      case "lightbulb":
        return (
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case "book":
        return (
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case "phone":
        return (
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case "satellite":
        return (
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19a8.5 8.5 0 01-8.5-8.5C2.5 5.8 5.8 2.5 9.8 2.5a8.5 8.5 0 018.5 8.5c0 4.7-3.8 8.5-8.3 8.5z M21 21l-4.3-4.3" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      {/* Toast Alert */}
      {toast.message && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm transition-all duration-300 animate-slide-in ${
          toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-orange-50 border-orange-200 text-orange-700"
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-6xl border border-slate-200 flex flex-col gap-6 my-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2 items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Learning Tools</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">If This Never Happened</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Simulate and explore alternate timelines. Examine the technological, cultural, and political butterfly effects of removing major milestones from human history.
          </p>
        </div>

        {/* Popular suggestions list */}
        {!selectedTopic && !isLoading && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Popular Alternate Histories</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {POPULAR_SUGGESTIONS.map((title, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSimulate(title)}
                  className="p-3 text-left bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 rounded-xl transition text-sm group flex items-center justify-between"
                >
                  <span className="font-semibold text-slate-700 group-hover:text-orange-700 block line-clamp-1">{title}</span>
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-orange-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Configuration Screen */}
        {!selectedTopic && !isLoading && (
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all duration-200 hover:border-slate-300">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
            
            <div className="flex flex-col gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Historical Timeline Simulator</p>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">Enter a Milestone, Discovery, or Event</h2>
              </div>

              {/* Search input with suggestions list */}
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="e.g. Electricity, World War II, Smartphones, The Wheel..."
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3.5 text-sm placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSimulate();
                      }}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSimulate()}
                    className="inline-flex items-center justify-center rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3.5 transition duration-200 shadow-md hover:shadow-lg"
                  >
                    Simulate
                  </button>
                </div>

                {/* Autocomplete / Recent Searches overlay dropdown */}
                {showSuggestions && (query.trim() || recentSearches.length > 0) && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                    {/* Matching suggestions */}
                    {suggestions.length > 0 && (
                      <div className="p-2 border-b border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">Matching Milestones</p>
                        {suggestions.map((title, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setQuery(title);
                              handleSimulate(title);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition"
                          >
                            {title}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Local Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div className="p-2">
                        <div className="flex justify-between items-center px-2 py-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recent Simulations</span>
                          <button
                            onClick={clearRecentSearches}
                            className="text-[10px] text-orange-600 hover:underline font-semibold"
                          >
                            Clear
                          </button>
                        </div>
                        {recentSearches.map((title, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setQuery(title);
                              handleSimulate(title);
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-lg transition flex items-center gap-2"
                          >
                            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Click-outside backdrop for suggestions */}
            {showSuggestions && (
              <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)} />
            )}
          </div>
        )}

        {/* Loading / Simulation processing state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 px-4 gap-6 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
              <div className="absolute w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center animate-pulse">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.05 15.05a2 2 0 00-1.022.547l-1 1A2 2 0 004 20h12a2 2 0 001.972-1.657l.036-.216a2 2 0 00-.547-1.022l-1-1z" />
                </svg>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-slate-800 animate-pulse">Rewriting Human Chronology...</h3>
              <p className="text-sm text-slate-500 max-w-sm h-6 transition-all duration-300">
                {LOADING_STEPS[loadingStepIndex]}
              </p>
            </div>
          </div>
        )}

        {/* Results Screen */}
        {selectedTopic && !isLoading && (
          <div className="space-y-8 animate-fade-in">
            {/* Summary Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                  {renderIcon(selectedTopic.icon)}
                </div>
                <div>
                  <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700 mb-1">
                    {selectedTopic.category}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">
                    {selectedTopic.title}
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 shrink-0">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 justify-center rounded-xl border border-slate-200 hover:border-orange-500 px-4 py-2 text-xs font-bold text-slate-600 hover:text-orange-600 bg-white transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy Report
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 justify-center rounded-xl border border-slate-200 hover:border-orange-500 px-4 py-2 text-xs font-bold text-slate-600 hover:text-orange-600 bg-white transition text-left"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Report
                </button>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 justify-center rounded-xl bg-orange-600 hover:bg-orange-700 px-4 py-2 text-xs font-bold text-white transition shadow-sm hover:shadow"
                >
                  New Simulation
                </button>
              </div>
            </div>

            {/* Original Event Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 rounded-2xl p-5 hover:shadow-md transition">
                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-2">The Original Timeline</h3>
                <h4 className="text-lg font-bold text-slate-900 mb-2">What Actually Happened</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{selectedTopic.originalEvent.summary}</p>
              </div>
              <div className="border border-slate-200 rounded-2xl p-5 hover:shadow-md transition">
                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-2">Geopolitical Anchor</h3>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Why It Mattered For Humanity</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{selectedTopic.originalEvent.importance}</p>
              </div>
            </div>

            {/* Cause & Effect Flow Chart */}
            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-center">Geopolitical Path Split (Cause & Effect)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                {/* Center Divider Line */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2" />
                
                {/* Left: Original Path */}
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                    <span className="text-xs font-bold text-emerald-800 uppercase">Baseline Path (Historical)</span>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-white border border-slate-200 rounded-xl p-3 w-full text-center text-xs font-semibold text-slate-700">
                      Milestone Occurs (Baseline Node)
                    </div>
                    <svg className="w-4 h-4 text-emerald-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                    </svg>
                    <div className="bg-white border border-slate-200 rounded-xl p-3 w-full text-center text-xs text-slate-600">
                      Society builds systems relying on this single breakthrough.
                    </div>
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                    </svg>
                    <div className="bg-white border border-emerald-100 rounded-xl p-3.5 w-full text-center text-sm font-semibold text-slate-900 shadow-sm border-l-4 border-l-emerald-500">
                      {selectedTopic.comparison.before}
                    </div>
                  </div>
                </div>

                {/* Right: Alternate Path */}
                <div className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
                    <span className="text-xs font-bold text-orange-800 uppercase">Alternate Path (Simulated)</span>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-white border border-orange-200 rounded-xl p-3 w-full text-center text-xs font-semibold text-orange-700">
                      Milestone Removed (Void Node)
                    </div>
                    <svg className="w-4 h-4 text-orange-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                    </svg>
                    <div className="bg-white border border-slate-200 rounded-xl p-3 w-full text-center text-xs text-slate-600">
                      Humanity adapts using parallel assets and alternative ideas.
                    </div>
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                    </svg>
                    <div className="bg-white border border-orange-100 rounded-xl p-3.5 w-full text-center text-sm font-semibold text-slate-900 shadow-sm border-l-4 border-l-orange-500">
                      {selectedTopic.comparison.after}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Timeline Progression & Slider */}
            <div className="border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600">Dynamic Chronology</h3>
                  <h4 className="text-lg font-bold text-slate-900">Explore Timeline Progression</h4>
                </div>
                <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {["tenYears", "fiftyYears", "hundredYears", "present"].map((step) => {
                    const labelMap = { tenYears: "10 Years", fiftyYears: "50 Years", hundredYears: "100 Years", present: "Present Day" };
                    return (
                      <button
                        key={step}
                        onClick={() => setTimelineStep(step)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          timelineStep === step
                            ? "bg-white text-orange-600 shadow-sm"
                            : "text-slate-600 hover:text-orange-600"
                        }`}
                      >
                        {labelMap[step]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slider Controller */}
              <div className="px-4 py-2">
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="1"
                  value={["tenYears", "fiftyYears", "hundredYears", "present"].indexOf(timelineStep)}
                  onChange={(e) => {
                    const steps = ["tenYears", "fiftyYears", "hundredYears", "present"];
                    setTimelineStep(steps[parseInt(e.target.value)]);
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">
                  <span>10 Years Later</span>
                  <span>50 Years Later</span>
                  <span>100 Years Later</span>
                  <span>Present Day</span>
                </div>
              </div>

              {/* Current Timeline Step Card */}
              <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2 text-orange-700">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-bold text-sm uppercase tracking-wider">
                    {timelineStep === "tenYears" && "10 Years After Void Node"}
                    {timelineStep === "fiftyYears" && "50 Years After Void Node"}
                    {timelineStep === "hundredYears" && "100 Years After Void Node"}
                    {timelineStep === "present" && "Present Day of Alternate Reality"}
                  </span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed font-medium">
                  {selectedTopic.timeline[timelineStep]}
                </p>
              </div>
            </div>

            {/* Domain Impacts Tabs & Content */}
            <div className="border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">Domain Analysis</h3>
                <h4 className="text-lg font-bold text-slate-900">Socio-Economic Impacts</h4>
              </div>

              {/* Tab selectors */}
              <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
                {[
                  { id: "tech", label: "Technology" },
                  { id: "society", label: "Society" },
                  { id: "economy", label: "Economy" },
                  { id: "science", label: "Science" },
                  { id: "politics", label: "Politics" },
                  { id: "culture", label: "Culture" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                      activeTab === tab.id
                        ? "bg-orange-600 border-orange-600 text-white shadow-sm"
                        : "border-slate-200 text-slate-600 hover:border-orange-500 hover:text-orange-600"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab panels */}
              <div className="min-h-[120px] transition-all duration-300">
                {activeTab === "tech" && (
                  <div className="space-y-4">
                    <p className="text-slate-600 text-sm leading-relaxed">{selectedTopic.techImpact.description}</p>
                    {selectedTopic.techImpact.missingTech.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <h5 className="text-xs font-bold uppercase text-red-700 tracking-wider mb-2">Likely Missing/Non-existent Technologies</h5>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedTopic.techImpact.missingTech.map((tech, idx) => (
                            <li key={idx} className="text-xs text-red-600 flex items-center gap-2 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                              {tech}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === "society" && (
                  <p className="text-slate-600 text-sm leading-relaxed">{selectedTopic.societyImpact.description}</p>
                )}
                {activeTab === "economy" && (
                  <p className="text-slate-600 text-sm leading-relaxed">{selectedTopic.economyImpact.description}</p>
                )}
                {activeTab === "science" && (
                  <p className="text-slate-600 text-sm leading-relaxed">{selectedTopic.scienceImpact.description}</p>
                )}
                {activeTab === "politics" && (
                  <p className="text-slate-600 text-sm leading-relaxed">{selectedTopic.politicsImpact.description}</p>
                )}
                {activeTab === "culture" && (
                  <p className="text-slate-600 text-sm leading-relaxed">{selectedTopic.cultureImpact.description}</p>
                )}
              </div>
            </div>

            {/* Ripple Effects Diagram */}
            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 flex flex-col items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-4 text-center">Simulated Butterfly Effect (Ripple Chain)</h3>
              <div className="flex flex-col items-center w-full max-w-lg gap-3">
                {selectedTopic.rippleEffects.map((effect, idx) => (
                  <div key={idx} className="flex flex-col items-center w-full">
                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 w-full shadow-sm text-center flex items-center justify-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{effect}</span>
                    </div>
                    {idx < selectedTopic.rippleEffects.length - 1 && (
                      <svg className="w-5 h-5 text-orange-400 my-1 animate-pulse shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 13l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Positive vs Negative Outcomes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Positive Outcomes */}
              <div className="border border-slate-200 rounded-2xl p-5 shadow-sm border-t-4 border-t-emerald-500">
                <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Positive Possibilities
                </h4>
                <ul className="space-y-2">
                  {selectedTopic.positives.map((item, idx) => (
                    <li key={idx} className="text-slate-600 text-sm flex items-start gap-2">
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Negative Consequences */}
              <div className="border border-slate-200 rounded-2xl p-5 shadow-sm border-t-4 border-t-red-500">
                <h4 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Negative Consequences
                </h4>
                <ul className="space-y-2">
                  {selectedTopic.negatives.map((item, idx) => (
                    <li key={idx} className="text-slate-600 text-sm flex items-start gap-2">
                      <span className="text-red-500 font-bold shrink-0 mt-0.5">✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modern World vs Alternate World Comparison Cards */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Detail Comparison Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {selectedTopic.cards.map((item, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-2xl p-5 hover:shadow-md transition bg-white space-y-3">
                    <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">{item.title}</h4>
                    <div className="space-y-2">
                      <div className="bg-emerald-50/50 rounded-lg p-2.5">
                        <span className="block text-[10px] font-bold text-emerald-800 uppercase">Baseline World</span>
                        <span className="text-xs text-slate-600">{item.modern}</span>
                      </div>
                      <div className="bg-orange-50/50 rounded-lg p-2.5">
                        <span className="block text-[10px] font-bold text-orange-800 uppercase">Alternate World</span>
                        <span className="text-xs text-slate-600">{item.alternate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Perspective summary */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700 mb-2">Final Perspective</h4>
              <p className="text-slate-800 font-semibold text-base max-w-3xl mx-auto leading-relaxed italic">
                "{selectedTopic.finalPerspective}"
              </p>
            </div>

          </div>
        )}

        {/* Privacy Note */}
        <div className="text-center py-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Everything runs locally in your browser. No information is uploaded.
          </p>
        </div>

      </div>
    </main>
  );
}
