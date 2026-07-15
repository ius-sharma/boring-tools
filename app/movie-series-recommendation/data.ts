export interface MovieOrSeries {
  id: string;
  title: string;
  type: string; // Movie, TV Series, Anime, Documentary, Mini Series
  releaseYear: number;
  runtime: number; // in minutes (average episode length for TV Series)
  imdbRating: number;
  genres: string[];
  languages: string[];
  director: string;
  shortDescription: string;
  longDescription: string;
  cast: string[];
  awards: string;
  country: string;
  funFacts: string[];
  reasonsToWatch: string[];
  whyRecommended?: string;
  posterUrl?: string; // Direct URL to movie poster image from the internet
  moodMatch?: string; // e.g. "95%"
  moods: string[];
  contentPreferences: string[];
  popularityScore: number; // 0-100
  streamingPlatforms: string[];
  collections: string[];
  similarTitles: string[]; // List of title titles or IDs
}

export const WATCH_TYPES = [
  "Movie",
  "Series",
  "Anime",
  "Documentary",
  "Mini Series"
];

export const MOODS = [
  "😄 Happy",
  "😭 Emotional",
  "🤯 Mind Blowing",
  "😱 Horror",
  "❤️ Romantic",
  "🔥 Motivating",
  "🧠 Thought Provoking",
  "⚽ Sports",
  "🌌 Space",
  "🕵️ Mystery"
];

export const GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Sports",
  "History",
  "Biography",
  "War",
  "Animation",
  "Psychological",
  "Space",
  "Survival",
  "Musical",
  "Thriller"
];

export const AVAILABLE_TIMES = [
  "30 min",
  "90 min",
  "2 Hours",
  "Whole Night",
  "Weekend"
];

export const BRAIN_POWER = [
  "🍿 Turn Brain Off",
  "🙂 Casual",
  "🧠 Think",
  "🤯 Melt My Brain"
];

export const ENERGY_LEVELS = [
  "Tired",
  "Relaxed",
  "Focused",
  "Excited"
];

export const CONTENT_PREFERENCES = [
  "Fast Paced",
  "Slow Burn",
  "Plot Twist",
  "Character Driven",
  "Emotional",
  "Mind Bending",
  "True Story",
  "Feel Good",
  "Dark Ending",
  "Happy Ending",
  "Open Ending"
];

export const LANGUAGES = [
  "English",
  "Hindi",
  "Japanese",
  "Korean",
  "Spanish",
  "French",
  "German",
  "Any"
];

export const RELEASE_YEAR_OPTIONS = [
  "Classic",
  "1980+",
  "1990+",
  "2000+",
  "2010+",
  "2020+",
  "Latest"
];

export const IMDB_RATINGS = [
  "7+",
  "8+",
  "8.5+",
  "9+"
];

export const STREAMING_PLATFORMS = [
  "Netflix",
  "Prime Video",
  "Disney+",
  "Apple TV",
  "JioHotstar",
  "Any"
];

export const SMART_COLLECTIONS = [
  { id: "dont-know", name: "I Don't Know What To Watch", desc: "Hand-picked universally acclaimed masterpiece recommendations." },
  { id: "masterpiece", name: "Random Masterpiece", desc: "A curated cinematic triumph selected at random." },
  { id: "hidden-gems", name: "Hidden Gems", desc: "Lesser-known high-quality movies that flew under the radar." },
  { id: "underrated", name: "Underrated Movies", desc: "Films that deserve way higher ratings and recognition." },
  { id: "weekend-binge", name: "Weekend Binge", desc: "Captivating and long-form watch profiles designed to consume a weekend." },
  { id: "change-life", name: "Movies That Change Your Life", desc: "Philosophically profound and perspective-shifting films." },
  { id: "will-break-you", name: "Movies That Will Break You", desc: "Heart-wrenching, emotionally intense, and gut-punching dramas." },
  { id: "true-stories", name: "Movies Based On True Stories", desc: "Biographies, historical milestones, and dramatized real events." },
  { id: "plot-twists", name: "Greatest Plot Twists", desc: "Mind-bending films that pull the rug right out from under you." },
  { id: "cinematography", name: "Best Cinematography", desc: "Visually spectacular masterpieces with jaw-dropping camera work." },
  { id: "music", name: "Best Background Music", desc: "Iconic scores and original soundtracks that define the experience." },
  { id: "sci-fi", name: "Best Sci-Fi", desc: "High-concept speculative fiction, advanced tech, and future systems." },
  { id: "space", name: "Best Space Movies", desc: "Stellar exploration, black holes, and the grand cosmic void." },
  { id: "survival", name: "Best Survival Movies", desc: "Man vs. nature, stranded, and raw human perseverance." },
  { id: "thrillers", name: "Best Psychological Thrillers", desc: "Mind games, psychological tension, and intellectual suspense." },
  { id: "feel-good", name: "Feel Good Movies", desc: "Uplifting, warm, and guaranteed to put a smile on your face." },
  { id: "rainy-days", name: "Movies For Rainy Days", desc: "Cozy, slow-burn, atmospheric, and nostalgic watches." },
  { id: "friends", name: "Movies To Watch With Friends", desc: "Fun, engaging, and highly discussable films for group viewings." },
  { id: "alone", name: "Movies To Watch Alone", desc: "Intimate, deep, and quiet introspective cinematic journeys." },
  { id: "before-die", name: "Movies To Watch Before You Die", desc: "Essential cultural landmarks and cinematic bucket-list items." }
];

export const fallbackDataset: MovieOrSeries[] = [
  {
    id: "inception",
    title: "Inception",
    type: "Movie",
    releaseYear: 2010,
    runtime: 148,
    imdbRating: 8.8,
    genres: ["Action", "Sci-Fi", "Adventure"],
    languages: ["English"],
    director: "Christopher Nolan",
    shortDescription: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    longDescription: "Dom Cobb is a skilled thief, the absolute best in the dangerous art of extraction, stealing valuable secrets from deep within the subconscious during the dream state, when the mind is at its most vulnerable. Cobb's rare ability has made him a coveted player in this treacherous new world of corporate espionage, but it has also made him an international fugitive and cost him everything he has ever loved. Now Cobb is being offered a chance at redemption. One last job could give him his life back but only if he can accomplish the impossible, inception.",
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page", "Tom Hardy", "Ken Watanabe"],
    awards: "Won 4 Oscars (Best Cinematography, Sound Mixing, Sound Editing, Visual Effects)",
    country: "United States",
    funFacts: [
      "If you take the first letters of the main characters' names (Dom, Robert, Eames, Arthur, Mal, Saito), they spell 'DREAMS'.",
      "Christopher Nolan spent 10 years writing the screenplay for Inception."
    ],
    reasonsToWatch: [
      "Mind-bending dream-within-a-dream concept.",
      "Outstanding practical effects and rotating hallway fight sequence.",
      "Hans Zimmer's iconic, powerful musical score."
    ],
    whyRecommended: "It matches your love for mind-bending plots, fast-paced action, and sci-fi perfectly.",
    posterUrl: "https://image.tmdb.org/t/p/w780/o01wJy9SKk5zD4a011lVw9v58R.jpg",
    moods: ["Mind Blowing", "Action", "Thought Provoking", "Late Night"],
    contentPreferences: ["Plot Twist", "Mind Bending", "Fast Paced"],
    popularityScore: 98,
    streamingPlatforms: ["Netflix", "Prime Video"],
    collections: ["Mind Blowing Movies", "Best Plot Twists", "Greatest Sci-Fi", "Movies With Incredible Endings"],
    similarTitles: ["Interstellar", "Tenet", "Memento", "The Prestige"]
  },
  {
    id: "breaking-bad",
    title: "Breaking Bad",
    type: "TV Series",
    releaseYear: 2008,
    runtime: 49,
    imdbRating: 9.5,
    genres: ["Crime", "Drama", "Thriller"],
    languages: ["English", "Spanish"],
    director: "Vince Gilligan (Creator)",
    shortDescription: "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student in order to secure his family's future.",
    longDescription: "Walter White, a struggling high school chemistry teacher, is diagnosed with Stage III lung cancer. To secure his family's financial future before he dies, Walter teams up with his former student Jesse Pinkman to manufacture and sell high-quality crystal meth. As the duo climbs the ranks of the local drug trade, Walter transforms from a mild-mannered family man to a ruthless kingpin known as 'Heisenberg'.",
    cast: ["Bryan Cranston", "Aaron Paul", "Anna Gunn", "Bob Odenkirk", "Dean Norris"],
    awards: "Won 16 Primetime Emmy Awards, including Outstanding Drama Series.",
    country: "United States",
    funFacts: [
      "The real-life DEA actually showed the show's crew how to synthesize methamphetamine to ensure accuracy.",
      "Aaron Paul never took any acting lessons in his life."
    ],
    reasonsToWatch: [
      "Arguably the greatest character development in television history.",
      "Masterful tension building and crime suspense.",
      "Perfect blending of dark humor and emotional tragedy."
    ],
    whyRecommended: "Highly recommended for weekend bingeing, crime drama fans, and slow-burn suspense seekers.",
    posterUrl: "https://image.tmdb.org/t/p/w780/ztkUQnJCO16r4v2netHYax366qc.jpg",
    moods: ["Dark", "Thriller", "Weekend Binge", "Late Night"],
    contentPreferences: ["Slow Burn", "Character Driven", "Dark Ending"],
    popularityScore: 99,
    streamingPlatforms: ["Netflix"],
    collections: ["Perfect Weekend Binge", "Movies That Will Change Your Life"],
    similarTitles: ["Better Call Saul", "Chernobyl", "Succession"]
  },
  {
    id: "spirited-away",
    title: "Spirited Away",
    type: "Anime",
    releaseYear: 2001,
    runtime: 125,
    imdbRating: 8.6,
    genres: ["Animation", "Fantasy", "Adventure"],
    languages: ["Japanese", "English"],
    director: "Hayao Miyazaki",
    shortDescription: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
    longDescription: "Chihiro and her parents are moving to a new town when her father takes a shortcut and gets lost, ending up in a mysterious, abandoned amusement park. When her parents are turned into giant pigs after eating strange food, Chihiro meets the enigmatic Haku, who explains that the park is actually a resort for supernatural beings who need a break from the human realm. To save her parents and escape, she must take a job at the giant bathhouse run by the witch Yubaba.",
    cast: ["Rumi Hiiragi", "Miyu Irino", "Mari Natsuki", "Yasuko Sawaguchi"],
    awards: "Won Academy Award for Best Animated Feature (only non-English language film to do so).",
    country: "Japan",
    funFacts: [
      "Hayao Miyazaki did not use a script; the movie was story-boarded and animated as the plot came to him.",
      "The characters' names are symbolic: 'Chihiro' means a thousand searches, while 'Sen' means a thousand."
    ],
    reasonsToWatch: [
      "Visually stunning hand-drawn animation from Studio Ghibli.",
      "Rich representation of Japanese folklore and spirituality.",
      "Heartwarming story of maturity, courage, and friendship."
    ],
    whyRecommended: "A perfect recommendation for family viewing, anime enthusiasts, and feel-good fantasy lovers.",
    posterUrl: "https://image.tmdb.org/t/p/w780/393mh1jIA12mJDwcew4n5aJWfih.jpg",
    moods: ["Happy", "Emotional", "Relaxing", "Family Time"],
    contentPreferences: ["Feel Good", "Character Driven", "Happy Ending"],
    popularityScore: 95,
    streamingPlatforms: ["Netflix"],
    collections: ["Movies For Family", "Oscar Winners"],
    similarTitles: ["My Neighbor Totoro", "Howl's Moving Castle", "Your Name"]
  },
  {
    id: "free-solo",
    title: "Free Solo",
    type: "Documentary",
    releaseYear: 2018,
    runtime: 100,
    imdbRating: 8.1,
    genres: ["Documentary", "Sports", "Adventure"],
    languages: ["English"],
    director: "Elizabeth Chai Vasarhelyi, Jimmy Chin",
    shortDescription: "Alex Honnold attempts to conquer the first free solo climb of the famed 3,000-foot El Capitan's wall in Yosemite National Park, without any ropes or safety equipment.",
    longDescription: "This documentary is an intimate, unflinching portrait of the free soloist climber Alex Honnold, as he prepares to achieve his lifelong dream: climbing the face of the world's most famous rock... the 3,200-foot El Capitan in Yosemite National Park... without a rope. Celebrated as one of the greatest athletic feats of any kind, Honnold's climb redefined what is humanly possible, keeping viewers at the edge of their seats.",
    cast: ["Alex Honnold", "Tommy Caldwell", "Jimmy Chin", "Sanni McCandless"],
    awards: "Won Oscar for Best Documentary Feature.",
    country: "United States",
    funFacts: [
      "The camera crew was often terrified to look, fearing they would capture Alex falling to his death.",
      "Alex Honnold lived in a converted van for over a decade to focus entirely on climbing."
    ],
    reasonsToWatch: [
      "Unparalleled real-life suspense and breathtaking camerawork.",
      "Deep psychological insight into what drives extreme human focus.",
      "Extremely motivational story about conquering fear."
    ],
    whyRecommended: "For users looking for motivated, real-life survival stories and breathtaking outdoor feats.",
    posterUrl: "https://image.tmdb.org/t/p/w780/8Z8dPt3K4sL5kUe5G9J6rO18S6D.jpg",
    moods: ["Motivated", "Inspirational", "Thriller"],
    contentPreferences: ["True Story", "Feel Good", "Happy Ending"],
    popularityScore: 90,
    streamingPlatforms: ["Disney+"],
    collections: ["Greatest Sports Movies", "Based On True Story", "Oscar Winners"],
    similarTitles: ["The Alpinist", "The Dawn Wall", "14 Peaks"]
  },
  {
    id: "chernobyl",
    title: "Chernobyl",
    type: "Mini Series",
    releaseYear: 2019,
    runtime: 60,
    imdbRating: 9.4,
    genres: ["Drama", "History", "Thriller"],
    languages: ["English"],
    director: "Craig Mazin (Creator)",
    shortDescription: "In April 1986, an explosion at the Chernobyl nuclear power plant in the Union of Soviet Socialist Republics becomes one of the world's worst man-made catastrophes.",
    longDescription: "Dramatizing the true story of the 1986 nuclear accident, this mini-series focuses on the brave men and women who sacrificed themselves to save Europe from unimaginable disaster. It exposes the web of lies, political cover-ups, and structural failures that led to the reactor core explosion, while highlighting the human cost of scientific truth.",
    cast: ["Jared Harris", "Stellan Skarsgård", "Emily Watson", "Paul Ritter"],
    awards: "Won 10 Primetime Emmys, including Outstanding Limited Series.",
    country: "United Kingdom / United States",
    funFacts: [
      "Many of the dialogues and characters are direct transcripts from Svetlana Alexievich's book 'Voices from Chernobyl'.",
      "The reactor control room was reconstructed with absolute historical accuracy using soviet blueprints."
    ],
    reasonsToWatch: [
      "Incredible scientific explanation of a complex nuclear event.",
      "Brilliant, haunting performances and chilling atmospheric score.",
      "A powerful, relevant commentary on truth vs. political propaganda."
    ],
    whyRecommended: "Matches your preference for thought-provoking, true-story-based mini-series.",
    posterUrl: "https://image.tmdb.org/t/p/w780/hlLXt2t76zx0g7zSptJkVMNsx5R.jpg",
    moods: ["Dark", "Thought Provoking", "Emotional", "Weekend Binge"],
    contentPreferences: ["True Story", "Slow Burn", "Dark Ending"],
    popularityScore: 97,
    streamingPlatforms: ["JioHotstar"],
    collections: ["Best Mini Series", "Based On True Story"],
    similarTitles: ["Band of Brothers", "Mindhunter", "Breaking Bad"]
  },
  {
    id: "la-la-land",
    title: "La La Land",
    type: "Movie",
    releaseYear: 2016,
    runtime: 128,
    imdbRating: 8.0,
    genres: ["Comedy", "Drama", "Romance"],
    languages: ["English"],
    director: "Damien Chazelle",
    shortDescription: "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.",
    longDescription: "Mia, an aspiring actress, serves lattes to movie stars in between auditions and Sebastian, a dedicated jazz musician, scrapes by playing cocktail party gigs in dingy bars, but as success mounts they are faced with decisions that begin to fray the fragile fabric of their love affair, and the dreams they worked so hard to maintain in each other threaten to rip them apart.",
    cast: ["Ryan Gosling", "Emma Stone", "John Legend", "J.K. Simmons"],
    awards: "Won 6 Academy Awards, including Best Director and Best Actress.",
    country: "United States",
    funFacts: [
      "Ryan Gosling spent two hours a day, six days a week, learning to play the piano for the film without a double.",
      "The opening musical number, 'Another Day of Sun', was filmed on a real Los Angeles freeway ramp in 110-degree heat."
    ],
    reasonsToWatch: [
      "Visually gorgeous cinematography and vibrant color palettes.",
      "Incredible musical performances and choreography.",
      "A bittersweet, realistic portrayal of love, ambition, and sacrifice."
    ],
    whyRecommended: "A perfect recommendation for couples, musical lovers, and romantic dreamers.",
    posterUrl: "https://image.tmdb.org/t/p/w780/uDO8zWDhfNs1jN4vHfhXZD53n7l.jpg",
    moods: ["Romantic", "Happy", "Emotional", "Relaxing"],
    contentPreferences: ["Feel Good", "Character Driven", "Open Ending"],
    popularityScore: 94,
    streamingPlatforms: ["Prime Video", "Netflix"],
    collections: ["Movies For Couples", "Oscar Winners", "Movies With Incredible Endings"],
    similarTitles: ["Whiplash", "Before Sunrise", "La La Land"]
  },
  {
    id: "the-shawshank-redemption",
    title: "The Shawshank Redemption",
    type: "Movie",
    releaseYear: 1994,
    runtime: 142,
    imdbRating: 9.3,
    genres: ["Drama"],
    languages: ["English"],
    director: "Frank Darabont",
    shortDescription: "Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.",
    longDescription: "Andy Dufresne is a young, successful banker whose life changes drastically when he is convicted and sentenced to life imprisonment for the murder of his wife and her lover. Set in the 1940s, the film shows how Andy, with the help of his friend Red, uses his financial knowledge to help the warden and guards, earning respect and maintaining his inner hope and dignity in the harsh prison environment.",
    cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton", "William Sadler"],
    awards: "Nominated for 7 Academy Awards. Ranked #1 on IMDb's Top 250.",
    country: "United States",
    funFacts: [
      "Morgan Freeman's favorite movie of his own is The Shawshank Redemption.",
      "The film did poorly at the box office originally but became a massive hit via home video rental."
    ],
    reasonsToWatch: [
      "An incredibly moving testament to the resilience of the human spirit.",
      "The legendary voiceover and chemistry of Morgan Freeman and Tim Robbins.",
      "One of the most satisfying and celebrated endings in cinema history."
    ],
    whyRecommended: "Matches your request for an emotional, life-changing, character-driven masterpiece.",
    posterUrl: "https://image.tmdb.org/t/p/w780/q6y0v55x2mR79jTS3rXHGJcK1wU.jpg",
    moods: ["Inspirational", "Motivated", "Emotional", "Family Time"],
    contentPreferences: ["Character Driven", "Feel Good", "Happy Ending"],
    popularityScore: 99,
    streamingPlatforms: ["Prime Video"],
    collections: ["Movies That Will Change Your Life", "Movies With Incredible Endings"],
    similarTitles: ["Forrest Gump", "The Green Mile", "Good Will Hunting"]
  },
  {
    id: "interstellar",
    title: "Interstellar",
    type: "Movie",
    releaseYear: 2014,
    runtime: 169,
    imdbRating: 8.7,
    genres: ["Sci-Fi", "Adventure", "Drama"],
    languages: ["English"],
    director: "Christopher Nolan",
    shortDescription: "When Earth becomes uninhabitable, a team of explorers travels through a wormhole in space in an attempt to ensure humanity's survival.",
    longDescription: "In Earth's future, a global crop blight and second Dust Bowl are slowly rendering the planet uninhabitable. Professor Brand, a brilliant NASA physicist, is working on plans to save mankind by transporting Earth's population to a new home via a wormhole. But first, he must send former NASA pilot Cooper and a team of researchers through the wormhole to find which of three planets is habitable.",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine", "Matt Damon"],
    awards: "Won Oscar for Best Achievement in Visual Effects.",
    country: "United States / United Kingdom",
    funFacts: [
      "Theoretical physicist Kip Thorne wrote a scientific paper on the wormhole and black hole visual simulations generated for the film.",
      "To create the giant dust storms, food-additives based synthetic dust was blown around the set."
    ],
    reasonsToWatch: [
      "Scientifically accurate, visually spectacular black hole (Gargantua).",
      "Deeply emotional father-daughter bond core storyline.",
      "Hypnotic organ-centric score composed by Hans Zimmer."
    ],
    whyRecommended: "Perfect match for space travel fans, mind-bending concepts, and epic sci-fi adventures.",
    posterUrl: "https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    moods: ["Mind Blowing", "Thought Provoking", "Emotional", "Late Night"],
    contentPreferences: ["Mind Bending", "Plot Twist", "Slow Burn"],
    popularityScore: 97,
    streamingPlatforms: ["Netflix", "Prime Video"],
    collections: ["Best Space Movies", "Greatest Sci-Fi", "Mind Blowing Movies"],
    similarTitles: ["Inception", "Gravity", "The Martian", "Contact"]
  },
  {
    id: "dark",
    title: "Dark",
    type: "TV Series",
    releaseYear: 2017,
    runtime: 60,
    imdbRating: 8.7,
    genres: ["Sci-Fi", "Mystery", "Drama"],
    languages: ["German", "English"],
    director: "Baran bo Odar, Jantje Friese (Creators)",
    shortDescription: "A family saga with a supernatural twist, set in a German town where the disappearance of two young children exposes the relationships among four families.",
    longDescription: "When two children go missing in a small German town located near a nuclear power plant, its sinful past is exposed along with the double lives and fractured relationships that exist among four families as they search for the kids. The mystery turns into a mind-bending time-travel conspiracy spanning three generations.",
    cast: ["Louis Hofmann", "Maja Schöne", "Lisa Vicari", "Oliver Masucci"],
    awards: "Won Grimme-Preis (Germany's prestigious TV award).",
    country: "Germany",
    funFacts: [
      "The eerie forest cave was constructed inside a studio, but the forest roads are real locations outside Berlin.",
      "The series is famous for having three different actors cast for the same character at different ages, looking incredibly alike."
    ],
    reasonsToWatch: [
      "The most complex, bulletproof time-travel plot ever written.",
      "Hauntingly beautiful cinematography and German indie soundtrack.",
      "Extremely satisfying closure that ties up all loose ends."
    ],
    whyRecommended: "Recommended for fans of time-travel, mind-bending mysteries, and multi-season marathons.",
    posterUrl: "https://image.tmdb.org/t/p/w780/apbrvmWgRPnrc571JZ6yw3mZ4eB.jpg",
    moods: ["Mind Blowing", "Dark", "Weekend Binge", "Late Night"],
    contentPreferences: ["Mind Bending", "Plot Twist", "Slow Burn"],
    popularityScore: 96,
    streamingPlatforms: ["Netflix"],
    collections: ["Hidden Netflix Gems", "Mind Blowing Movies", "Best Plot Twists", "Perfect Weekend Binge"],
    similarTitles: ["Stranger Things", "12 Monkeys", "Steins;Gate"]
  },
  {
    id: "whiplash",
    title: "Whiplash",
    type: "Movie",
    releaseYear: 2014,
    runtime: 106,
    imdbRating: 8.5,
    genres: ["Drama", "Music"],
    languages: ["English"],
    director: "Damien Chazelle",
    shortDescription: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
    longDescription: "Andrew Neiman is an ambitious young jazz drummer, single-minded in his pursuit to rise to the top of his elite East Coast music conservatory. Terence Fletcher, an instructor known equally for his teaching talents and his terrifying methods, discovers Andrew and transfers the aspiring drummer into his band. Andrew's passion to achieve perfection quickly spirals into an obsession, as his ruthless teacher pushes him to the brink of both his sanity and his physical limits.",
    cast: ["Miles Teller", "J.K. Simmons", "Paul Reiser", "Melissa Benoist"],
    awards: "Won 3 Academy Awards, including Best Supporting Actor (J.K. Simmons).",
    country: "United States",
    funFacts: [
      "Miles Teller actually drummed until his hands bled; some of the blood on the drum kit in the film was real.",
      "Damien Chazelle could not get funding for the movie, so he turned it into a short film first, which won at Sundance."
    ],
    reasonsToWatch: [
      "One of the most intense, thriller-like dramas ever made about artistic dedication.",
      "J.K. Simmons' legendary, terrifying performance.",
      "An explosive, unforgettable final 10-minute drum solo ending."
    ],
    whyRecommended: "A perfect recommendation for fast-paced, intense drama, and incredible musical performances.",
    posterUrl: "https://image.tmdb.org/t/p/w780/7u1265vU6w3b6Uv7yXyK4b3y0uX.jpg",
    moods: ["Motivated", "Thriller", "Action", "Inspirational"],
    contentPreferences: ["Fast Paced", "Character Driven", "Movies With Incredible Endings"],
    popularityScore: 95,
    streamingPlatforms: ["Netflix"],
    collections: ["Movies With Incredible Endings", "Underrated Gems", "Oscar Winners"],
    similarTitles: ["Black Swan", "The Prestige", "La La Land"]
  },
  {
    id: "knives-out",
    title: "Knives Out",
    type: "Movie",
    releaseYear: 2019,
    runtime: 130,
    imdbRating: 7.9,
    genres: ["Comedy", "Mystery", "Crime"],
    languages: ["English"],
    director: "Rian Johnson",
    shortDescription: "A detective investigates the death of a patriarch of an eccentric, combative family.",
    longDescription: "When renowned crime novelist Harlan Thrombey is found dead at his estate just after his 85th birthday, the inquisitive and debonair Detective Benoit Blanc is mysteriously enlisted to investigate. From Harlan's dysfunctional family to his devoted staff, Blanc sifts through a web of red herrings and self-serving lies to uncover the truth behind the writer's untimely death.",
    cast: ["Daniel Craig", "Ana de Armas", "Chris Evans", "Jamie Lee Curtis", "Christopher Plummer"],
    awards: "Nominated for Oscar (Best Original Screenplay).",
    country: "United States",
    funFacts: [
      "The title comes from a 2001 Radiohead song of the same name.",
      "The portrait of Harlan Thrombey changes slightly at the very end of the movie, showing him with a subtle smile."
    ],
    reasonsToWatch: [
      "A modern, hilarious spin on the classic whodunit murder mystery.",
      "Incredible ensemble cast having absolute fun with their characters.",
      "Genius screenplay filled with smart twists and visual jokes."
    ],
    whyRecommended: "For users seeking a fun, lighthearted yet twist-filled mystery to watch with friends.",
    posterUrl: "https://image.tmdb.org/t/p/w780/pGx648jJeoqiS7650Rlh8dGIo2j.jpg",
    moods: ["Funny", "Happy", "Thriller", "Family Time"],
    contentPreferences: ["Plot Twist", "Feel Good", "Happy Ending"],
    popularityScore: 95,
    streamingPlatforms: ["Netflix", "Prime Video"],
    collections: ["Best Plot Twists", "Movies To Watch With Friends", "Movies For Family"],
    similarTitles: ["Glass Onion", "Sherlock Holmes", "Murder on the Orient Express"]
  },
  {
    id: "coco",
    title: "Coco",
    type: "Movie",
    releaseYear: 2017,
    runtime: 105,
    imdbRating: 8.4,
    genres: ["Animation", "Family", "Fantasy"],
    languages: ["English", "Spanish"],
    director: "Lee Unkrich",
    shortDescription: "Aspiring musician Miguel, confronted with his family's ancestral ban on music, enters the Land of the Dead to find his great-great-grandfather, a legendary singer.",
    longDescription: "Despite his family's baffling generations-old ban on music, Miguel dreams of becoming an accomplished musician like his idol, Ernesto de la Cruz. Desperate to prove his talent, Miguel finds himself in the stunning and colorful Land of the Dead following a mysterious chain of events. Along the way, he meets charming trickster Hector, and together, they set off on an extraordinary journey to unlock the real story behind Miguel's family history.",
    cast: ["Anthony Gonzalez", "Gael García Bernal", "Benjamin Bratt", "Alanna Ubach"],
    awards: "Won 2 Oscars (Best Animated Feature, Best Original Song 'Remember Me').",
    country: "United States",
    funFacts: [
      "All the guitar playing in the movie is technically accurate; the animators tracked the musicians' finger placements.",
      "The Land of the Dead was inspired by the colorful Mexican city of Guanajuato."
    ],
    reasonsToWatch: [
      "Visually gorgeous, vibrant, and culturally rich representation of Dia de los Muertos.",
      "Extremely emotional storyline that deals with family memory and love.",
      "Memorable, beautiful songs like 'Remember Me' and 'Un Poco Loco'."
    ],
    whyRecommended: "An emotional, family-friendly fantasy with beautiful visuals and music.",
    posterUrl: "https://image.tmdb.org/t/p/w780/gGEgtqSptc5WzOmu2ki4ov4JjZs.jpg",
    moods: ["Happy", "Emotional", "Relaxing", "Family Time"],
    contentPreferences: ["Feel Good", "Emotional", "Happy Ending"],
    popularityScore: 96,
    streamingPlatforms: ["Disney+"],
    collections: ["Movies For Family", "Oscar Winners"],
    similarTitles: ["Toy Story", "Spirited Away", "Up", "Soul"]
  }
];
