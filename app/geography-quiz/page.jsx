"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ThemedDropdown from "../components/ThemedDropdown";
import geographyDataRaw from "./geography_data.json";

// Cast raw data
const geographyData = geographyDataRaw;

const REGION_OPTIONS = [
  { value: "Entire World", label: "Entire World" },
  { value: "Asia", label: "Asia" },
  { value: "Europe", label: "Europe" },
  { value: "Africa", label: "Africa" },
  { value: "North America", label: "North America" },
  { value: "South America", label: "South America" },
  { value: "Oceania", label: "Oceania" },
];

const DIFFICULTY_OPTIONS = [
  { value: "Easy", label: "Easy" },
  { value: "Medium", label: "Medium" },
  { value: "Hard", label: "Hard" },
  { value: "Expert", label: "Expert" },
];

const TIMER_OPTIONS = [
  { value: "30", label: "30 seconds" },
  { value: "60", label: "60 seconds" },
  { value: "90", label: "90 seconds" },
  { value: "Unlimited", label: "Unlimited" },
];

const QUIZ_MODES = [
  { id: "guess_country", name: "Guess Country", desc: "Given stats and capital, guess the country." },
  { id: "guess_capital", name: "Guess Capital", desc: "Given the country, guess its capital city." },
  { id: "guess_flag", name: "Guess Flag", desc: "Identify the country's flag from multiple options." },
  { id: "guess_continent", name: "Guess Continent", desc: "Name the continent where the country lies." },
  { id: "guess_currency", name: "Guess Currency", desc: "Identify the country's currency." },
  { id: "guess_language", name: "Guess Language", desc: "Identify the primary languages spoken." },
  { id: "guess_neighbor", name: "Guess Neighbor", desc: "Guess which country shares a border." },
  { id: "map_click", name: "Map Click Challenge", desc: "Locate the prompted country directly on the map." },
  { id: "geo_features", name: "Physical Map Challenge", desc: "Locate oceans, mountains, rivers, and deserts." }
];

const GEOGRAPHIC_FEATURES = [
  { id: "pac_oc", name: "Pacific Ocean", type: "ocean", x: 100, y: 325, desc: "The largest and deepest of Earth's oceanic divisions." },
  { id: "atl_oc", name: "Atlantic Ocean", type: "ocean", x: 475, y: 325, desc: "The world's second-largest ocean, separating the Americas from Europe and Africa." },
  { id: "ind_oc", name: "Indian Ocean", type: "ocean", x: 700, y: 450, desc: "The third-largest ocean, bounded by Asia, Africa, and Australia." },
  { id: "art_oc", name: "Arctic Ocean", type: "ocean", x: 500, y: 50, desc: "The smallest and shallowest of the world's five major oceans." },
  { id: "sou_oc", name: "Southern Ocean", type: "ocean", x: 500, y: 600, desc: "Also known as the Antarctic Ocean, encircling Antarctica." },
  
  { id: "himalayas", name: "Himalayas", type: "mountain", x: 750, y: 280, desc: "The highest mountain range in the world, home to Mount Everest." },
  { id: "andes", name: "Andes", type: "mountain", x: 325, y: 480, desc: "The longest continental mountain range, running along South America's west coast." },
  { id: "rockies", name: "Rocky Mountains", type: "mountain", x: 220, y: 200, desc: "A major mountain range stretching across western North America." },
  { id: "alps", name: "Alps", type: "mountain", x: 510, y: 220, desc: "The highest and most extensive mountain range system entirely in Europe." },
  { id: "urals", name: "Ural Mountains", type: "mountain", x: 590, y: 170, desc: "Mountain range forming the boundary between Europe and Asia." },
  
  { id: "nile", name: "Nile River", type: "river", x: 565, y: 310, desc: "Flowing northwards through northeastern Africa, historically the longest river." },
  { id: "amazon", name: "Amazon River", type: "river", x: 390, y: 410, desc: "The largest river by discharge volume in the world, flowing through South America." },
  { id: "yangtze", name: "Yangtze River", type: "river", x: 780, y: 280, desc: "The longest river in Asia and the third-longest in the world." },
  { id: "mississippi", name: "Mississippi River", type: "river", x: 260, y: 230, desc: "The chief river of the largest drainage system on the North American continent." },
  { id: "ganges", name: "Ganges River", type: "river", x: 740, y: 290, desc: "A trans-boundary river of Asia flowing through India and Bangladesh." },
  
  { id: "sahara", name: "Sahara Desert", type: "desert", x: 525, y: 310, desc: "The largest hot desert in the world, covering much of North Africa." },
  { id: "gobi", name: "Gobi Desert", type: "desert", x: 770, y: 220, desc: "A large desert region in East Asia, spanning parts of northern China and southern Mongolia." },
  { id: "arabian", name: "Arabian Desert", type: "desert", x: 625, y: 310, desc: "A vast desert wilderness stretching from Yemen to the Persian Gulf." },
  { id: "kalahari", name: "Kalahari Desert", type: "desert", x: 560, y: 500, desc: "A large semi-arid sandy savanna in Southern Africa." },
  { id: "australian", name: "Great Australian Desert", type: "desert", x: 875, y: 500, desc: "The arid interior region covering most of Western and South Australia." }
];

const ACHIEVEMENTS_LIST = [
  { id: "perfect_asia", title: "Perfect Asia", desc: "Score 100% on any Asia region quiz (min 10 Qs)", badge: "AS", color: "bg-blue-500" },
  { id: "capital_master", title: "Capital Master", desc: "Get 10/10 correct in Guess Capital mode", badge: "CP", color: "bg-amber-500" },
  { id: "flag_expert", title: "Flag Expert", desc: "Get 10/10 correct in Guess Flag mode", badge: "FL", color: "bg-red-500" },
  { id: "score_100", title: "100 Correct", desc: "Correctly answer 100 questions in total", badge: "100", color: "bg-emerald-500" },
  { id: "speed_runner", title: "Speed Runner", desc: "Finish a 10 Q quiz in under 30s with 100% accuracy", badge: "SR", color: "bg-purple-500" },
  { id: "explorer_badge", title: "World Explorer", desc: "Explore at least 30 different countries on the map", badge: "EX", color: "bg-indigo-500" },
];

const getFlagUrl = (code) => {
  if (!code) return "";
  return `https://flagcdn.com/w160/${code.toLowerCase()}.png`;
};

const getSmallFlagUrl = (code) => {
  if (!code) return "";
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
};

export default function GeographyQuizExplorer() {
  // Navigation & Active View Tab
  const [activeTab, setActiveTab] = useState("explore"); // 'explore' | 'quiz' | 'leaderboard' | 'achievements'

  // Map Zoom & Pan State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragDistance, setDragDistance] = useState(0);

  // Explore Mode States
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [exploredList, setExploredList] = useState([]); // Array of ISO codes explored
  const [continentFilter, setContinentFilter] = useState("Entire World");

  // Quiz Engine States
  const [quizActive, setQuizActive] = useState(false);
  const [quizMode, setQuizMode] = useState("guess_country");
  const [difficulty, setDifficulty] = useState("Medium");
  const [timerSetting, setTimerSetting] = useState("60"); // seconds or "Unlimited"
  const [quizRegion, setQuizRegion] = useState("Entire World");
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [fastestTime, setFastestTime] = useState(null); // in ms
  const [totalTimeSpent, setTotalTimeSpent] = useState(0); // in ms
  const [quizOver, setQuizOver] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null); // For MCQ
  const [isAnswered, setIsAnswered] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  const [qTimer, setQTimer] = useState(0); // Timer count for current question
  const [quizTimerActive, setQuizTimerActive] = useState(false);
  const [questionStartTimestamp, setQuestionStartTimestamp] = useState(null);

  // Statistics and Local Storage
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [history, setHistory] = useState([]);
  const [bestScores, setBestScores] = useState({});
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  
  // Daily and Weekly challenge seeds
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [weeklyCompleted, setWeeklyCompleted] = useState(false);

  const mapContainerRef = useRef(null);

  // Fetch local storage records on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedHistory = localStorage.getItem("boring_geo_history");
      if (storedHistory) setHistory(JSON.parse(storedHistory));

      const storedBest = localStorage.getItem("boring_geo_best");
      if (storedBest) setBestScores(JSON.parse(storedBest));

      const storedAchievements = localStorage.getItem("boring_geo_achievements");
      if (storedAchievements) setUnlockedAchievements(JSON.parse(storedAchievements));

      const storedXP = localStorage.getItem("boring_geo_xp");
      if (storedXP) setXp(parseInt(storedXP, 10));

      const storedLevel = localStorage.getItem("boring_geo_level");
      if (storedLevel) setLevel(parseInt(storedLevel, 10));

      const storedExplored = localStorage.getItem("boring_geo_explored");
      if (storedExplored) setExploredList(JSON.parse(storedExplored));

      // Check daily/weekly status
      const today = new Date().toDateString();
      const dailyDone = localStorage.getItem(`boring_geo_daily_${today}`);
      if (dailyDone) setDailyCompleted(true);

      const weekNumber = getWeekNumber(new Date());
      const weeklyDone = localStorage.getItem(`boring_geo_weekly_${weekNumber}`);
      if (weeklyDone) setWeeklyCompleted(true);
    }
  }, []);

  // Show Toast
  const triggerToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "info" });
    }, 3000);
  };

  // Helper: Week Number
  function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo}`;
  }

  // Explore Mode Filtered Countries
  const exploredSet = useMemo(() => new Set(exploredList), [exploredList]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return geographyData.filter(
      c => c.name.toLowerCase().includes(query) || c.capital.toLowerCase().includes(query) || c.id.toLowerCase() === query
    ).slice(0, 5);
  }, [searchQuery]);

  // Quiz Setup Filtering
  const getPoolForQuiz = (mode, diff, region) => {
    let pool = [...geographyData];
    
    // Region Filter
    if (region !== "Entire World") {
      pool = pool.filter(c => c.continent === region);
    }

    // Difficulty Filter
    pool.sort((a, b) => b.population - a.population);
    if (diff === "Easy") {
      pool = pool.slice(0, 45);
    } else if (diff === "Medium") {
      pool = pool.slice(0, 100);
    } else if (diff === "Hard") {
      pool = pool.slice(0, 140);
    }

    if (pool.length === 0) pool = [...geographyData];
    return pool;
  };

  // Setup Quiz Timer
  useEffect(() => {
    let interval = null;
    if (quizActive && quizTimerActive && timerSetting !== "Unlimited" && qTimer > 0 && !quizOver) {
      interval = setInterval(() => {
        setQTimer(prev => {
          if (prev <= 1) {
            handleQuestionTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizActive, quizTimerActive, timerSetting, qTimer, quizOver]);

  // Handle Question Timeout
  const handleQuestionTimeout = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setStreak(0);
    setShowCorrection(true);
    setAnsweredCorrectly(false);
    
    // Next question delay
    setTimeout(() => {
      goToNextQuestion();
    }, 2500);
  };

  // Zoom controls
  const zoomIn = () => setZoom(z => Math.min(z * 1.3, 8));
  const zoomOut = () => setZoom(z => Math.max(z / 1.3, 1));
  const zoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Drag Pan Map Event Handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    setDragDistance(0);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    const dist = Math.sqrt(Math.pow(newX - pan.x, 2) + Math.pow(newY - pan.y, 2));
    setDragDistance(prev => prev + dist);
    setPan({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch controls for mobile dragging
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    setDragDistance(0);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const newX = e.touches[0].clientX - dragStart.x;
    const newY = e.touches[0].clientY - dragStart.y;
    const dist = Math.sqrt(Math.pow(newX - pan.x, 2) + Math.pow(newY - pan.y, 2));
    setDragDistance(prev => prev + dist);
    setPan({ x: newX, y: newY });
  };

  // Click on country path
  const handleCountryClick = (country) => {
    if (dragDistance > 15) {
      return;
    }

    if (activeTab === "explore") {
      setSelectedCountry(country);
      
      // Update explored list
      if (!exploredSet.has(country.id)) {
        const newExplored = [...exploredList, country.id];
        setExploredList(newExplored);
        localStorage.setItem("boring_geo_explored", JSON.stringify(newExplored));
        
        // Trigger Explorer achievement
        if (newExplored.length >= 30 && !unlockedAchievements.includes("explorer_badge")) {
          unlockAchievement("explorer_badge");
        }
      }
    } else if (quizActive && !isAnswered && quizMode === "map_click") {
      // Map Click Challenge
      const currentQuestion = questions[currentQIndex];
      handleQuizAnswer(country.id === currentQuestion.correctAnswer.id, country.id);
    }
  };

  // Click on Geographic Hotspot
  const handleFeatureClick = (feature) => {
    if (dragDistance > 15) return;

    if (quizActive && !isAnswered && quizMode === "geo_features") {
      const currentQuestion = questions[currentQIndex];
      handleQuizAnswer(feature.id === currentQuestion.correctAnswer.id, feature.id);
    }
  };

  // Start Quiz setup
  const startQuiz = (isChallenge = false, challengeType = "") => {
    let modeToUse = quizMode;
    let diffToUse = difficulty;
    let timerToUse = timerSetting;
    let regionToUse = quizRegion;

    if (isChallenge) {
      if (challengeType === "daily") {
        modeToUse = "map_click";
        diffToUse = "Medium";
        timerToUse = "60";
        regionToUse = "Entire World";
      } else if (challengeType === "weekly") {
        modeToUse = "guess_flag";
        diffToUse = "Hard";
        timerToUse = "30";
        regionToUse = "Entire World";
      }
    }

    const pool = getPoolForQuiz(modeToUse, diffToUse, regionToUse);
    if (pool.length < 5) {
      triggerToast("Not enough countries in this continent/filter to build a quiz. Try selecting Entire World or another Region.", "error");
      return;
    }

    // Generate 10 questions
    const generatedQuestions = [];
    const questionsCount = 10;
    
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);

    if (modeToUse === "geo_features") {
      const featuresPool = [...GEOGRAPHIC_FEATURES].sort(() => Math.random() - 0.5);
      for (let i = 0; i < Math.min(questionsCount, featuresPool.length); i++) {
        const correctFeature = featuresPool[i];
        const sameType = GEOGRAPHIC_FEATURES.filter(f => f.type === correctFeature.type && f.id !== correctFeature.id);
        const distractors = sameType.sort(() => Math.random() - 0.5).slice(0, 3);
        const options = [correctFeature, ...distractors].sort(() => Math.random() - 0.5);

        generatedQuestions.push({
          correctAnswer: correctFeature,
          options: options,
          prompt: `Find the ${correctFeature.name} (${correctFeature.type}) on the map!`
        });
      }
    } else {
      for (let i = 0; i < Math.min(questionsCount, shuffledPool.length); i++) {
        const correctAnswer = shuffledPool[i];
        const poolWithoutCorrect = pool.filter(c => c.id !== correctAnswer.id);
        const distCount = diffToUse === "Expert" ? 5 : 3; 
        const distractors = poolWithoutCorrect.sort(() => Math.random() - 0.5).slice(0, distCount);
        const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);

        let prompt = "";
        switch (modeToUse) {
          case "guess_country":
            prompt = `Which country has the capital city of ${correctAnswer.capital} and belongs to ${correctAnswer.continent}?`;
            break;
          case "guess_capital":
            prompt = `What is the capital city of ${correctAnswer.name}?`;
            break;
          case "guess_flag":
            prompt = `Which country owns this flag?`;
            break;
          case "guess_continent":
            prompt = `In which continent is ${correctAnswer.name} located?`;
            break;
          case "guess_currency":
            prompt = `What currency is officially used in ${correctAnswer.name}?`;
            break;
          case "guess_language":
            prompt = `Which primary language(s) are spoken in ${correctAnswer.name}?`;
            break;
          case "guess_neighbor":
            const neighborSet = new Set(correctAnswer.neighbors);
            const actualNeighbors = pool.filter(c => neighborSet.has(c.id));
            
            if (actualNeighbors.length > 0) {
              const correctNeighbor = actualNeighbors[Math.floor(Math.random() * actualNeighbors.length)];
              const nonNeighbors = pool.filter(c => c.id !== correctAnswer.id && !neighborSet.has(c.id));
              const distracts = nonNeighbors.sort(() => Math.random() - 0.5).slice(0, 3);
              const neighborOptions = [correctNeighbor, ...distracts].sort(() => Math.random() - 0.5);
              generatedQuestions.push({
                correctAnswer: correctNeighbor,
                options: neighborOptions,
                prompt: `Which of these countries shares a land border with ${correctAnswer.name}?`,
                countryContext: correctAnswer
              });
              continue;
            } else {
              prompt = `Which of these is the capital city of the island country ${correctAnswer.name}?`;
              break;
            }
          case "map_click":
            prompt = `Find ${correctAnswer.name} on the map!`;
            break;
        }

        generatedQuestions.push({
          correctAnswer,
          options,
          prompt
        });
      }
    }

    setQuestions(generatedQuestions);
    setCurrentQIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectAnswers(0);
    setQuizOver(false);
    setIsAnswered(false);
    setSelectedOption(null);
    setShowCorrection(false);
    setStartTime(Date.now());
    setQuestionStartTimestamp(Date.now());
    setFastestTime(9999999);
    setTotalTimeSpent(0);

    setQuizMode(modeToUse);
    setDifficulty(diffToUse);
    setTimerSetting(timerToUse);
    setQuizRegion(regionToUse);

    if (timerToUse !== "Unlimited") {
      setQTimer(parseInt(timerToUse, 10));
      setQuizTimerActive(true);
    } else {
      setQuizTimerActive(false);
    }

    setQuizActive(true);
    
    if (isChallenge) {
      if (challengeType === "daily") {
        setDailyCompleted(true);
      } else if (challengeType === "weekly") {
        setWeeklyCompleted(true);
      }
    }
  };

  // Submit Answer
  const handleQuizAnswer = (correct, optionId) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(optionId);
    setQuizTimerActive(false);

    const timeSpent = Date.now() - questionStartTimestamp;
    setTotalTimeSpent(prev => prev + timeSpent);

    if (correct) {
      setCorrectAnswers(prev => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      const speedMultiplier = timeSpent < 3000 ? 1.5 : 1.0;
      const streakMultiplier = Math.min(3, 1 + (newStreak - 1) * 0.2); 
      const basePoints = 100;
      
      const addedPoints = Math.round(basePoints * streakMultiplier * speedMultiplier);
      setScore(prev => prev + addedPoints);

      if (timeSpent < fastestTime) {
        setFastestTime(timeSpent);
      }

      setAnsweredCorrectly(true);
    } else {
      setStreak(0);
      setAnsweredCorrectly(false);
      setShowCorrection(true);
    }

    setTimeout(() => {
      goToNextQuestion();
    }, 1800);
  };

  // Go to next question
  const goToNextQuestion = () => {
    const nextIndex = currentQIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQIndex(nextIndex);
      setIsAnswered(false);
      setSelectedOption(null);
      setShowCorrection(false);
      setQuestionStartTimestamp(Date.now());
      if (timerSetting !== "Unlimited") {
        setQTimer(parseInt(timerSetting, 10));
        setQuizTimerActive(true);
      }
    } else {
      endQuiz();
    }
  };

  // End Quiz
  const endQuiz = () => {
    setQuizTimerActive(false);
    setQuizOver(true);

    const timeElapsedSec = (Date.now() - startTime) / 1000;
    const finalAccuracy = Math.round((correctAnswers / questions.length) * 100);
    const accuracyBonus = Math.round(finalAccuracy * 2);
    const totalXP = Math.round(score / 5 + accuracyBonus + 50);

    const newXP = xp + totalXP;
    setXp(newXP);
    localStorage.setItem("boring_geo_xp", newXP.toString());

    const newLevel = Math.floor(newXP / 1000) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      localStorage.setItem("boring_geo_level", newLevel.toString());
      triggerToast(`Level Up! You reached Level ${newLevel}!`, "success");
    }

    const newRecord = {
      date: new Date().toLocaleDateString(),
      mode: quizMode,
      difficulty,
      region: quizRegion,
      score,
      accuracy: finalAccuracy,
      maxStreak,
      xpEarned: totalXP,
      timeTaken: Math.round(timeElapsedSec)
    };

    const newHistory = [newRecord, ...history].slice(0, 30);
    setHistory(newHistory);
    localStorage.setItem("boring_geo_history", JSON.stringify(newHistory));

    const bestKey = `${quizMode}_${difficulty}`;
    const prevBest = bestScores[bestKey] || 0;
    if (score > prevBest) {
      const newBests = { ...bestScores, [bestKey]: score };
      setBestScores(newBests);
      localStorage.setItem("boring_geo_best", JSON.stringify(newBests));
    }

    const newUnlocked = [...unlockedAchievements];

    if (quizRegion === "Asia" && finalAccuracy === 100 && questions.length >= 10 && !newUnlocked.includes("perfect_asia")) {
      newUnlocked.push("perfect_asia");
      unlockAchievement("perfect_asia");
    }

    if (quizMode === "guess_capital" && correctAnswers === 10 && !newUnlocked.includes("capital_master")) {
      newUnlocked.push("capital_master");
      unlockAchievement("capital_master");
    }

    if (quizMode === "guess_flag" && correctAnswers === 10 && !newUnlocked.includes("flag_expert")) {
      newUnlocked.push("flag_expert");
      unlockAchievement("flag_expert");
    }

    if (correctAnswers === 10 && timeElapsedSec < 30 && !newUnlocked.includes("speed_runner")) {
      newUnlocked.push("speed_runner");
      unlockAchievement("speed_runner");
    }

    let totalCorrectAcc = newHistory.reduce((acc, h) => acc + Math.round((h.accuracy / 100) * 10), 0);
    if (totalCorrectAcc >= 100 && !newUnlocked.includes("score_100")) {
      newUnlocked.push("score_100");
      unlockAchievement("score_100");
    }

    setUnlockedAchievements(newUnlocked);
    localStorage.setItem("boring_geo_achievements", JSON.stringify(newUnlocked));

    if (dailyCompleted) {
      const today = new Date().toDateString();
      localStorage.setItem(`boring_geo_daily_${today}`, "done");
    }
    if (weeklyCompleted) {
      const weekNumber = getWeekNumber(new Date());
      localStorage.setItem(`boring_geo_weekly_${weekNumber}`, "done");
    }
  };

  const unlockAchievement = (id) => {
    const ach = ACHIEVEMENTS_LIST.find(a => a.id === id);
    if (ach) {
      triggerToast(`Achievement Unlocked: ${ach.title}!`, "success");
    }
  };

  // Exit Quiz
  const exitQuiz = () => {
    setQuizActive(false);
    setQuizOver(false);
    zoomReset();
  };

  // Calculate overall stats
  const statsOverview = useMemo(() => {
    if (history.length === 0) return { totalGames: 0, averageAccuracy: 0, totalXP: xp, masteredRegion: "None" };

    const totalGames = history.length;
    const averageAccuracy = Math.round(history.reduce((acc, h) => acc + h.accuracy, 0) / totalGames);

    const regionScores = {};
    history.forEach(h => {
      if (!regionScores[h.region]) regionScores[h.region] = { acc: 0, count: 0 };
      regionScores[h.region].acc += h.accuracy;
      regionScores[h.region].count += 1;
    });

    let bestReg = "None";
    let highestRegAcc = 0;
    Object.keys(regionScores).forEach(r => {
      const avg = regionScores[r].acc / regionScores[r].count;
      if (avg > highestRegAcc && r !== "Entire World") {
        highestRegAcc = avg;
        bestReg = r;
      }
    });

    return {
      totalGames,
      averageAccuracy,
      totalXP: xp,
      masteredRegion: bestReg
    };
  }, [history, xp]);

  // Export scorecard PNG
  const exportScorecard = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 450;
    const ctx = canvas.getContext("2d");

    const grad = ctx.createLinearGradient(0, 0, 800, 450);
    grad.addColorStop(0, "#0f172a"); 
    grad.addColorStop(1, "#1e293b"); 
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 450);

    ctx.fillStyle = "rgba(249, 115, 22, 0.15)";
    ctx.beginPath();
    ctx.arc(700, 80, 200, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(249, 115, 22, 0.08)";
    ctx.beginPath();
    ctx.arc(80, 380, 150, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(249, 115, 22, 0.3)";
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 760, 410);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("Geography Quiz & Map Explorer", 50, 70);

    ctx.fillStyle = "#f97316"; 
    ctx.font = "600 16px sans-serif";
    ctx.fillText("BORINGTOOLS CHALLENGE REPORT", 50, 105);

    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(50, 120, 700, 2);

    const drawStat = (label, val, x, y) => {
      ctx.fillStyle = "#94a3b8"; 
      ctx.font = "14px sans-serif";
      ctx.fillText(label.toUpperCase(), x, y);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 30px sans-serif";
      ctx.fillText(val, x, y + 35);
    };

    drawStat("Mode", QUIZ_MODES.find(m => m.id === quizMode)?.name || "Quiz", 50, 160);
    drawStat("Difficulty", difficulty, 280, 160);
    drawStat("Region", quizRegion, 510, 160);

    drawStat("Score", score.toString(), 50, 260);
    const finalAccuracy = Math.round((correctAnswers / questions.length) * 100);
    drawStat("Accuracy", `${finalAccuracy}%`, 280, 260);
    drawStat("Max Streak", `${maxStreak}`, 510, 260);

    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fillRect(50, 340, 700, 60);

    ctx.fillStyle = "#ffffff";
    ctx.font = "600 16px sans-serif";
    ctx.fillText(`Earned: +${score / 5 + 50} XP`, 70, 375);

    const elapsed = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
    ctx.fillText(`Duration: ${elapsed}s`, 300, 375);
    ctx.fillText(`Fastest Correct: ${fastestTime !== 9999999 ? (fastestTime / 1000).toFixed(2) + 's' : 'N/A'}`, 510, 375);

    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `geography_quiz_scorecard_${quizMode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Score card PNG downloaded!", "success");
  };

  // Highlight countries inside SVG
  const getCountryFill = (countryId, isHovered) => {
    const isFilteredOut = continentFilter !== "Entire World" && 
      geographyData.find(c => c.id === countryId)?.continent !== continentFilter;

    if (quizActive && !quizOver) {
      const currentQuestion = questions[currentQIndex];
      if (isAnswered && quizMode === "map_click") {
        if (countryId === currentQuestion.correctAnswer.id) {
          return "#22c55e"; 
        }
        if (selectedOption === countryId && !answeredCorrectly) {
          return "#ef4444"; 
        }
      }
    }

    if (isFilteredOut) return "rgba(148, 163, 184, 0.06)"; 
    if (isHovered) return "#fb923c"; // Lighter orange hover
    if (selectedCountry && selectedCountry.id === countryId) return "#f97316"; 
    
    return "rgba(226, 232, 240, 0.85)"; 
  };

  // Bounding box/centroid calculator for Mercator coordinates
  const getCountryBounds = (shapeString) => {
    const numbers = shapeString.match(/-?[0-9\.]+/g);
    if (!numbers || numbers.length < 2) return { x: 500, y: 300, scale: 2 };
    
    let minX = 99999, minY = 99999, maxX = -99999, maxY = -99999;
    let isX = true;
    for (let i = 0; i < numbers.length; i++) {
      const num = parseFloat(numbers[i]);
      if (isNaN(num)) continue;
      if (isX) {
        if (num < minX) minX = num;
        if (num > maxX) maxX = num;
      } else {
        if (num < minY) minY = num;
        if (num > maxY) maxY = num;
      }
      isX = !isX;
    }
    const width = maxX - minX;
    const height = maxY - minY;
    const centroidX = minX + width / 2;
    const centroidY = minY + height / 2;
    
    const maxDim = Math.max(width, height);
    let scale = 3;
    if (maxDim > 300) scale = 1.3; 
    else if (maxDim > 150) scale = 2.0; 
    else if (maxDim > 55) scale = 3.2; 
    else scale = 5.5; 
    
    return { x: centroidX, y: centroidY, scale };
  };

  const panToCountry = (country) => {
    setSelectedCountry(country);
    
    const coord = getCountryBounds(country.shape);
    const containerWidth = mapContainerRef.current ? mapContainerRef.current.clientWidth : 1000;
    const containerHeight = mapContainerRef.current ? mapContainerRef.current.clientHeight : 500;
    
    const targetScale = coord.scale;
    const targetX = (containerWidth / 2) - (coord.x * (containerWidth / 1000) * targetScale);
    const targetY = (containerHeight / 2) - (coord.y * (containerHeight / 650) * targetScale);

    setZoom(targetScale);
    setPan({ x: targetX, y: targetY });
  };

  const [hoveredCountryId, setHoveredCountryId] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center p-4 sm:py-8 font-sans">
      <div className="bg-white shadow-xl rounded-3xl p-5 sm:p-8 w-full max-w-6xl border border-slate-200 flex flex-col gap-6">
        
        {/* Hero Header */}
        {!quizActive && (
          <div className="flex flex-col gap-2 items-center text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Education & Learning</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Geography Quiz & Map Explorer</h1>
            <p className="text-slate-500 text-base max-w-2xl">
              Explore countries, capitals, flags and world maps through interactive quizzes and challenges. Match colors, borders, and test your knowledge.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => {
                  setActiveTab("quiz");
                }}
                className="rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-black font-sans"
              >
                Start Quiz
              </button>
              <button
                onClick={() => {
                  setActiveTab("explore");
                  zoomReset();
                }}
                className="rounded-xl border border-orange-500 px-6 py-3 font-semibold text-orange-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-50"
              >
                Explore Map
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        {!quizActive && (
          <div className="flex border-b border-slate-200 gap-6 overflow-x-auto select-none">
            <button
              onClick={() => { setActiveTab("explore"); zoomReset(); }}
              className={`py-3 px-1 font-semibold text-sm transition-all relative ${activeTab === "explore" ? "text-orange-600 border-b-2 border-orange-600" : "text-slate-500 hover:text-slate-800"}`}
            >
              Map Explorer
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`py-3 px-1 font-semibold text-sm transition-all relative ${activeTab === "quiz" ? "text-orange-600 border-b-2 border-orange-600" : "text-slate-500 hover:text-slate-800"}`}
            >
              Quiz Challenges
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`py-3 px-1 font-semibold text-sm transition-all relative ${activeTab === "leaderboard" ? "text-orange-600 border-b-2 border-orange-600" : "text-slate-500 hover:text-slate-800"}`}
            >
              Stats & History
            </button>
            <button
              onClick={() => setActiveTab("achievements")}
              className={`py-3 px-1 font-semibold text-sm transition-all relative ${activeTab === "achievements" ? "text-orange-600 border-b-2 border-orange-600" : "text-slate-500 hover:text-slate-800"}`}
            >
              Achievements ({unlockedAchievements.length})
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 gap-6">

          {/* VIEW: MAP EXPLORER (TAB 1) */}
          {activeTab === "explore" && !quizActive && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-6 items-stretch">
              
              {/* Left Column: Interactive Map */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Search Bar */}
                  <div className="relative w-full sm:max-w-xs">
                    <input
                      type="text"
                      placeholder="Search country or capital..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {searchResults.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                        {searchResults.map(c => (
                          <button
                            key={c.id}
                            onClick={() => {
                              panToCountry(c);
                              setSearchQuery("");
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-800 hover:bg-orange-50 flex items-center justify-between transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <img src={getSmallFlagUrl(c.id)} alt="" className="w-5 h-3.5 object-cover rounded shadow-sm border border-slate-200" />
                              <span>{c.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Continent Filter Select */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Region:</span>
                    <ThemedDropdown
                      ariaLabel="Region Filter"
                      value={continentFilter}
                      options={REGION_OPTIONS}
                      onChange={(val) => setContinentFilter(val)}
                    />
                  </div>
                </div>

                {/* SVG Interactive Map Container */}
                <div 
                  ref={mapContainerRef}
                  className="relative w-full h-[350px] sm:h-[420px] md:h-[500px] border border-slate-200 rounded-3xl overflow-hidden bg-[#e2f1ff] shadow-inner select-none cursor-grab active:cursor-grabbing"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                >
                  <svg
                    viewBox="-15 -20 1030 675"
                    className="w-full h-full object-contain pointer-events-auto transition-transform duration-100 ease-out"
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                      transformOrigin: "center center"
                    }}
                  >
                    <g id="world_map_countries">
                      {geographyData.map((country) => (
                        <path
                          key={country.id}
                          d={country.shape}
                          fill={getCountryFill(country.id, hoveredCountryId === country.id)}
                          stroke="#94a3b8"
                          strokeWidth="0.6"
                          className="transition-all duration-150 cursor-pointer"
                          onMouseEnter={() => setHoveredCountryId(country.id)}
                          onMouseLeave={() => setHoveredCountryId(null)}
                          onClick={() => handleCountryClick(country)}
                        />
                      ))}
                    </g>
                  </svg>

                  {/* Tooltip Hover Overlay */}
                  {hoveredCountryId && (
                    <div className="absolute top-4 left-4 pointer-events-none bg-slate-950/90 text-white backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700/50 shadow-md text-xs sm:text-sm flex items-center gap-2 font-medium">
                      <img src={getSmallFlagUrl(hoveredCountryId)} alt="" className="w-5 h-3.5 object-cover rounded border border-slate-700/40 shadow-sm" />
                      <span>{geographyData.find(c => c.id === hoveredCountryId)?.name}</span>
                    </div>
                  )}

                  {/* Zoom controls float button */}
                  <div className="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-none">
                    <button
                      onClick={(e) => { e.stopPropagation(); zoomIn(); }}
                      className="pointer-events-auto w-10 h-10 bg-white border border-slate-200 text-slate-800 rounded-xl shadow-lg flex items-center justify-center font-bold text-lg hover:bg-orange-500 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      +
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); zoomOut(); }}
                      className="pointer-events-auto w-10 h-10 bg-white border border-slate-200 text-slate-800 rounded-xl shadow-lg flex items-center justify-center font-bold text-lg hover:bg-orange-500 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      -
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); zoomReset(); }}
                      className="pointer-events-auto px-2 py-1.5 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl shadow-lg hover:bg-orange-500 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Country Details Side-panel */}
              <div className="flex flex-col">
                {selectedCountry ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 flex flex-col gap-5 h-full animate-fade-in">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
                      <div className="flex items-center gap-3">
                        <img src={getFlagUrl(selectedCountry.id)} alt={`${selectedCountry.name} flag`} className="w-16 h-11 object-cover rounded-lg shadow border border-slate-200" />
                        <div>
                          <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">{selectedCountry.name}</h2>
                          <p className="text-xs text-orange-600 font-semibold tracking-wider uppercase mt-0.5">{selectedCountry.continent}</p>
                        </div>
                      </div>
                      <span className="text-sm font-mono text-slate-400 bg-slate-200/60 px-2 py-1 rounded">
                        {selectedCountry.id}
                      </span>
                    </div>

                    {/* Stats List */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white border border-slate-100 rounded-2xl">
                        <span className="text-[10px] uppercase font-semibold text-slate-400">Capital</span>
                        <p className="text-sm font-bold text-slate-800">{selectedCountry.capital}</p>
                      </div>
                      <div className="p-3 bg-white border border-slate-100 rounded-2xl">
                        <span className="text-[10px] uppercase font-semibold text-slate-400">Currency</span>
                        <p className="text-xs font-bold text-slate-800 truncate" title={selectedCountry.currency}>
                          {selectedCountry.currency}
                        </p>
                      </div>
                      <div className="p-3 bg-white border border-slate-100 rounded-2xl">
                        <span className="text-[10px] uppercase font-semibold text-slate-400">Population</span>
                        <p className="text-sm font-bold text-slate-800">
                          {selectedCountry.population >= 1e6
                            ? `${(selectedCountry.population / 1e6).toFixed(1)}M`
                            : selectedCountry.population.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-white border border-slate-100 rounded-2xl">
                        <span className="text-[10px] uppercase font-semibold text-slate-400">Area</span>
                        <p className="text-sm font-bold text-slate-800">
                          {selectedCountry.area >= 1e6
                            ? `${(selectedCountry.area / 1e6).toFixed(2)}M km²`
                            : `${selectedCountry.area.toLocaleString()} km²`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Languages</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedCountry.languages && selectedCountry.languages.length > 0 ? (
                            selectedCountry.languages.map((lang, i) => (
                              <span key={i} className="text-xs font-medium bg-slate-200/80 text-slate-700 px-2 py-1 rounded-md">
                                {lang}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500">N/A</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Time Zone</span>
                        <p className="text-xs font-bold text-slate-800 mt-1">{selectedCountry.timezone}</p>
                      </div>

                      {/* Borders / Neighbors */}
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Borders ({selectedCountry.neighbors?.length || 0})</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {selectedCountry.neighbors && selectedCountry.neighbors.length > 0 ? (
                            selectedCountry.neighbors.map((nbCode, i) => {
                              const nbCountry = geographyData.find(c => c.id === nbCode);
                              return (
                                <button
                                  key={i}
                                  onClick={() => {
                                    if (nbCountry) panToCountry(nbCountry);
                                  }}
                                  className="text-xs bg-orange-50 hover:bg-orange-100 border border-orange-200/50 text-orange-700 font-semibold px-2 py-1 rounded-md transition-all flex items-center gap-1.5"
                                >
                                  <img src={getSmallFlagUrl(nbCode)} alt="" className="w-4 h-3 object-cover rounded shadow-sm border border-slate-200" />
                                  <span>{nbCode}</span>
                                </button>
                              );
                            })
                          ) : (
                            <span className="text-xs text-slate-500">No bordering countries (Island nation).</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Button */}
                    <div className="mt-auto pt-4 flex gap-2">
                      <button
                        onClick={() => {
                          setQuizRegion(selectedCountry.continent);
                          setActiveTab("quiz");
                        }}
                        className="w-full text-xs font-semibold py-2.5 rounded-xl border border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white transition-all text-center"
                      >
                        Start {selectedCountry.continent} Quiz
                      </button>
                      <button
                        onClick={() => setSelectedCountry(null)}
                        className="text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 text-slate-500 hover:bg-slate-100 transition-all text-center"
                      >
                        Close
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 flex flex-col items-center justify-center text-center gap-2 h-full select-none min-h-[300px]">
                    <h3 className="font-bold text-slate-700 text-base">Select a Country</h3>
                    <p className="text-xs text-slate-400 max-w-[240px]">
                      Click on any country shape in the map or search above to view detailed geographic information.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* VIEW: QUIZ CONFIGURATION / CHALLENGE (TAB 2) */}
          {activeTab === "quiz" && !quizActive && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-stretch">
              
              {/* Left Column: Game Modes Grid */}
              <div className="rounded-3xl border border-slate-200 p-5 sm:p-6 bg-white flex flex-col gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">Game Modes</p>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">Choose your quiz challenge</h2>
                  <p className="text-sm text-slate-500">Pick a game mode that fits what you want to practice.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {QUIZ_MODES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setQuizMode(m.id)}
                      className={`text-left p-4 rounded-2xl border transition-all flex flex-col gap-1 ${quizMode === m.id ? "bg-orange-50 border-orange-500 shadow-sm" : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white"}`}
                    >
                      <span className="font-bold text-sm text-slate-800">
                        {m.name}
                      </span>
                      <span className="text-xs text-slate-500 leading-relaxed">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Quiz Settings & Quick Challenges */}
              <div className="flex flex-col gap-6">
                
                {/* Config Form */}
                <div className="rounded-3xl border border-slate-200 p-5 sm:p-6 bg-slate-50 flex flex-col gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">Configuration</p>
                  <h3 className="text-lg font-bold text-slate-950 -mt-2">Customize quiz options</h3>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Region Select */}
                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-slate-700">Filter Region</span>
                      <ThemedDropdown
                        ariaLabel="Quiz Region"
                        value={quizRegion}
                        options={REGION_OPTIONS}
                        onChange={(val) => setQuizRegion(val)}
                      />
                    </label>

                    {/* Difficulty Select */}
                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-slate-700">Difficulty Level</span>
                      <ThemedDropdown
                        ariaLabel="Quiz Difficulty"
                        value={difficulty}
                        options={DIFFICULTY_OPTIONS}
                        onChange={(val) => setDifficulty(val)}
                      />
                    </label>

                    {/* Timer Select */}
                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-slate-700">Timer Per Question</span>
                      <ThemedDropdown
                        ariaLabel="Quiz Timer"
                        value={timerSetting}
                        options={TIMER_OPTIONS}
                        onChange={(val) => setTimerSetting(val)}
                      />
                    </label>
                  </div>

                  <button
                    onClick={() => startQuiz(false)}
                    className="w-full mt-2 rounded-xl bg-orange-600 py-3 font-semibold text-white shadow-md hover:bg-orange-700 transition-all text-center flex items-center justify-center gap-2"
                  >
                    Start Custom Quiz
                  </button>
                </div>

                {/* Daily / Weekly Competitive Challenges */}
                <div className="rounded-3xl border border-slate-200 p-5 sm:p-6 bg-white flex flex-col gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">Weekly Events</p>
                  <h3 className="text-lg font-bold text-slate-950 -mt-2">Special Challenges</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => startQuiz(true, "daily")}
                      disabled={dailyCompleted}
                      className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${dailyCompleted ? "opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed" : "bg-white border-slate-200 hover:border-orange-500 hover:bg-orange-50"}`}
                    >
                      <span className="font-bold text-sm text-slate-800">Daily Challenge</span>
                      <span className="text-xs text-slate-500">
                        {dailyCompleted ? "Completed today!" : "10 Qs Map Click"}
                      </span>
                    </button>

                    <button
                      onClick={() => startQuiz(true, "weekly")}
                      disabled={weeklyCompleted}
                      className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${weeklyCompleted ? "opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed" : "bg-white border-slate-200 hover:border-orange-500 hover:bg-orange-50"}`}
                    >
                      <span className="font-bold text-sm text-slate-800">Weekly Challenge</span>
                      <span className="text-xs text-slate-500">
                        {weeklyCompleted ? "Completed this week!" : "10 Qs Speed Flags"}
                      </span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* VIEW: QUIZ ACTIVE PLAYING MODE */}
          {quizActive && (
            <div className="flex flex-col gap-6 animate-fade-in">
              
              {/* Top Stats Bar */}
              <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 flex flex-wrap gap-4 items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <button
                    onClick={exitQuiz}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition"
                  >
                    Exit
                  </button>
                  <span className="text-sm font-semibold uppercase tracking-wider text-orange-400">
                    Q: {currentQIndex + 1}/{questions.length}
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 block uppercase">Score</span>
                    <span className="text-lg font-bold text-white font-mono">{score}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 block uppercase">Accuracy</span>
                    <span className="text-lg font-bold text-white font-mono">
                      {currentQIndex > 0 ? Math.round((correctAnswers / currentQIndex) * 100) : 100}%
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 block uppercase">Streak</span>
                    <span className="text-lg font-bold text-orange-500 font-mono">
                      {streak} {streak >= 3 ? <span className="text-xs">{(Math.min(3, 1 + (streak - 1) * 0.2)).toFixed(1)}x</span> : null}
                    </span>
                  </div>
                </div>

                {/* Progress bar timer */}
                {timerSetting !== "Unlimited" && (
                  <div className="w-full sm:w-48 mt-2 sm:mt-0">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Time left</span>
                      <span className="font-mono font-bold text-white">{qTimer}s</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                      <div
                        className="h-full bg-orange-500 transition-all duration-1000"
                        style={{ width: `${(qTimer / parseInt(timerSetting, 10)) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Quiz Body */}
              {!quizOver ? (
                <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-6 items-stretch">
                  
                  {/* Left Side: Map or Large MCQ options */}
                  <div className="flex flex-col gap-4">
                    
                    {/* Prompt Box */}
                    <div className="bg-orange-50 border border-orange-200 rounded-3xl p-5 text-center flex flex-col gap-3 items-center">
                      <span className="text-xs font-semibold uppercase tracking-wider text-orange-600">Challenge Question</span>
                      
                      {/* Redesigned Flag Quiz Prompt */}
                      {quizMode === "guess_flag" && (
                        <div className="mt-1 mb-2">
                          <img
                            src={getFlagUrl(questions[currentQIndex]?.correctAnswer.id)}
                            alt="Guess this flag"
                            className="w-36 h-24 object-cover rounded-2xl shadow-md border-2 border-slate-200 mx-auto transition-transform hover:scale-105"
                          />
                        </div>
                      )}

                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 max-w-2xl leading-relaxed">
                        {questions[currentQIndex]?.prompt}
                      </h3>
                    </div>

                    {/* Render Interactive Map for Map Clicks & Geo Features */}
                    {(quizMode === "map_click" || quizMode === "geo_features") ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-xs text-slate-500 text-center font-medium">
                          Pan and zoom the map. Click directly on the target location.
                        </p>
                        <div 
                          ref={mapContainerRef}
                          className="relative w-full h-[350px] sm:h-[400px] md:h-[480px] border border-slate-200 rounded-3xl overflow-hidden bg-[#e2f1ff] shadow-inner select-none cursor-grab active:cursor-grabbing"
                          onMouseDown={handleMouseDown}
                          onMouseMove={handleMouseMove}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={handleMouseUp}
                          onTouchStart={handleTouchStart}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleMouseUp}
                        >
                          <svg
                            viewBox="-15 -20 1030 675"
                            className="w-full h-full object-contain pointer-events-auto transition-transform duration-100 ease-out"
                            style={{
                              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                              transformOrigin: "center center"
                            }}
                          >
                            <g id="world_map_quiz">
                              {geographyData.map((country) => (
                                <path
                                  key={country.id}
                                  d={country.shape}
                                  fill={getCountryFill(country.id, hoveredCountryId === country.id)}
                                  stroke="#94a3b8"
                                  strokeWidth="0.6"
                                  className="transition-all duration-150 cursor-pointer"
                                  onMouseEnter={() => !isAnswered && setHoveredCountryId(country.id)}
                                  onMouseLeave={() => setHoveredCountryId(null)}
                                  onClick={() => handleCountryClick(country)}
                                />
                              ))}
                            </g>

                            {/* Render Physical Hotspots if Geo Features Mode */}
                            {quizMode === "geo_features" && (
                              <g id="physical_hotspots">
                                {GEOGRAPHIC_FEATURES.map((feat) => {
                                  const currentQuestion = questions[currentQIndex];
                                  const isCorrectHotspot = feat.id === currentQuestion.correctAnswer.id;
                                  
                                  let fillCol = "rgba(59, 130, 246, 0.4)"; 
                                  if (isAnswered) {
                                    if (isCorrectHotspot) fillCol = "rgba(34, 197, 94, 0.75)"; 
                                    else if (selectedOption === feat.id) fillCol = "rgba(239, 68, 68, 0.75)"; 
                                  }
                                  
                                  return (
                                    <circle
                                      key={feat.id}
                                      cx={feat.x}
                                      cy={feat.y}
                                      r={22}
                                      fill={fillCol}
                                      stroke={isAnswered && isCorrectHotspot ? "#22c55e" : "#2563eb"}
                                      strokeWidth="2"
                                      className="cursor-pointer hover:stroke-orange-500 hover:fill-orange-500/20 transition-all animate-pulse"
                                      onClick={() => handleFeatureClick(feat)}
                                    />
                                  );
                                })}
                              </g>
                            )}

                          </svg>

                          {/* Hover Tooltip (Only if not answered yet) */}
                          {hoveredCountryId && !isAnswered && (
                            <div className="absolute top-4 left-4 pointer-events-none bg-slate-950/90 text-white backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700/50 shadow-md text-xs sm:text-sm">
                              <span>{geographyData.find(c => c.id === hoveredCountryId)?.name}</span>
                            </div>
                          )}

                          {/* Map zoom controls */}
                          <div className="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-none">
                            <button
                              onClick={(e) => { e.stopPropagation(); zoomIn(); }}
                              className="pointer-events-auto w-10 h-10 bg-white border border-slate-200 text-slate-800 rounded-xl shadow-lg flex items-center justify-center font-bold text-lg hover:bg-orange-500 hover:text-white transition"
                            >
                              +
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); zoomOut(); }}
                              className="pointer-events-auto w-10 h-10 bg-white border border-slate-200 text-slate-880 rounded-xl shadow-lg flex items-center justify-center font-bold text-lg hover:bg-orange-500 hover:text-white transition"
                            >
                              -
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); zoomReset(); }}
                              className="pointer-events-auto px-2 py-1.5 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl shadow-lg hover:bg-orange-500 hover:text-white transition"
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // MCQ Options Grid (For text-based quiz modes)
                      <div className={`grid grid-cols-1 ${difficulty === "Expert" ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-3 mt-4`}>
                        {questions[currentQIndex]?.options.map((opt, index) => {
                          const currentQuestion = questions[currentQIndex];
                          const isCorrect = opt.id === currentQuestion.correctAnswer.id;
                          const isSelected = selectedOption === opt.id;
                          
                          let btnStyle = "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white";
                          if (isAnswered) {
                            if (isCorrect) {
                              btnStyle = "bg-green-100 border-green-500 text-green-700 shadow-sm";
                            } else if (isSelected) {
                              btnStyle = "bg-red-100 border-red-500 text-red-700 shadow-sm";
                            } else {
                              btnStyle = "opacity-50 bg-slate-50 border-slate-200";
                            }
                          }

                          let optionText = opt.name;
                          if (quizMode === "guess_capital") optionText = opt.capital;
                          if (quizMode === "guess_flag") optionText = opt.name;
                          if (quizMode === "guess_continent") optionText = opt.continent;
                          if (quizMode === "guess_currency") optionText = opt.currency;
                          if (quizMode === "guess_language") optionText = opt.languages ? opt.languages.join(", ") : "";
                          if (quizMode === "guess_neighbor" && currentQuestion.countryContext) {
                            optionText = opt.name;
                          }

                          return (
                            <button
                              key={index}
                              disabled={isAnswered}
                              onClick={() => handleQuizAnswer(isCorrect, opt.id)}
                              className={`w-full text-left p-5 rounded-2xl border text-sm font-bold transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              {/* Left Aligned Content */}
                              <div className="flex items-center gap-3">
                                {/* Embed flag icon in option if NOT Guess Flag mode (where option is name) */}
                                {quizMode !== "guess_flag" && (
                                  <img src={getSmallFlagUrl(opt.id)} alt="" className="w-6 h-4 object-cover rounded shadow-sm border border-slate-200" />
                                )}
                                <span>{optionText}</span>
                              </div>
                              {isAnswered && isCorrect && (
                                <span className="text-green-600 flex items-center justify-center">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </span>
                              )}
                              {isAnswered && isSelected && !isCorrect && (
                                <span className="text-red-600 flex items-center justify-center">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right Side: Quiz Info & Corrections */}
                  <div className="flex flex-col gap-4 justify-between">
                    
                    {/* Instructions panel */}
                    <div className="rounded-3xl border border-slate-200 p-5 sm:p-6 bg-slate-50">
                      <h4 className="font-bold text-slate-800 text-sm mb-2">Quiz Stats</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                          <span>Difficulty:</span>
                          <span className="text-slate-800">{difficulty}</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                          <span>Timer Limit:</span>
                          <span className="text-slate-800">{timerSetting === "Unlimited" ? "No Limit" : `${timerSetting}s`}</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                          <span>Continent:</span>
                          <span className="text-slate-800">{quizRegion}</span>
                        </div>
                      </div>
                    </div>

                    {/* Show Correction Info Card */}
                    {showCorrection && (
                      <div className="rounded-3xl border border-red-200 bg-red-50 p-5 flex flex-col gap-3 animate-fade-in">
                        <h4 className="font-bold text-red-800 text-sm">Correct Explanation</h4>
                        <div className="text-xs text-red-700 leading-relaxed flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <img src={getSmallFlagUrl(questions[currentQIndex]?.correctAnswer.id)} alt="" className="w-6 h-4 object-cover rounded shadow-sm border border-slate-200" />
                            <span><strong>{questions[currentQIndex]?.correctAnswer.name}</strong></span>
                          </div>
                          
                          {quizMode === "geo_features" ? (
                            <span className="block font-medium">{questions[currentQIndex]?.correctAnswer.desc}</span>
                          ) : (
                            <p>
                              Capital: <strong>{questions[currentQIndex]?.correctAnswer.capital}</strong>
                              <br />
                              Region: <strong>{questions[currentQIndex]?.correctAnswer.continent}</strong>
                              <br />
                              Currency: <strong>{questions[currentQIndex]?.correctAnswer.currency}</strong>
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Progress indicators dots */}
                    <div className="mt-auto py-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 text-center">Questions Progress</span>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {questions.map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-2.5 h-2.5 rounded-full ${idx === currentQIndex ? "bg-orange-500 ring-2 ring-orange-200 scale-125" : idx < currentQIndex ? "bg-slate-800" : "bg-slate-200"}`}
                          />
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                // VIEW: QUIZ COMPLETED OVERLAY CARD
                <div className="rounded-3xl border border-slate-200 p-6 sm:p-10 bg-slate-50 flex flex-col items-center text-center gap-6 animate-fade-in">
                  
                  <div className="flex flex-col gap-1 items-center">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">Challenge Completed!</h2>
                    <p className="text-slate-500 text-sm max-w-md">
                      Great job completing the challenge! Check out your stats, level XP gain, and export your scorecard.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Final Score</span>
                      <p className="text-2xl font-black text-slate-800 font-mono mt-1">{score}</p>
                    </div>
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Accuracy</span>
                      <p className="text-2xl font-black text-slate-800 font-mono mt-1">
                        {Math.round((correctAnswers / questions.length) * 100)}%
                      </p>
                    </div>
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Max Streak</span>
                      <p className="text-2xl font-black text-orange-600 font-mono mt-1">{maxStreak}</p>
                    </div>
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">XP Gained</span>
                      <p className="text-2xl font-black text-emerald-600 font-mono mt-1">
                        +{Math.round(score / 5 + Math.round((correctAnswers / questions.length) * 100) * 2 + 50)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-2 justify-center">
                    <button
                      onClick={exportScorecard}
                      className="rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white shadow-md hover:bg-orange-700 transition"
                    >
                      Export PNG Card
                    </button>
                    <button
                      onClick={() => startQuiz(false)}
                      className="rounded-xl border border-slate-900 px-6 py-3 font-semibold text-slate-800 hover:bg-slate-100 transition"
                    >
                      Play Again
                    </button>
                    <button
                      onClick={exitQuiz}
                      className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-600 hover:bg-slate-100 transition"
                    >
                      Back to Explorer
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* VIEW: LEADERBOARD & STATS (TAB 3) */}
          {activeTab === "leaderboard" && !quizActive && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-stretch">
              
              {/* Left Column: Stats & Charts */}
              <div className="rounded-3xl border border-slate-200 p-5 sm:p-6 bg-white flex flex-col gap-5">
                <div className="space-y-1 border-b border-slate-150 pb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">Statistics</p>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">Your Progress Dashboard</h2>
                  <p className="text-sm text-slate-500">Track your levels, correct answers count, and region masteries.</p>
                </div>

                {/* Level Progress */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-bold text-slate-800">Rank: Level {level}</span>
                    <span className="text-slate-500 text-xs font-mono font-bold">{xp % 1000}/1000 XP</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-orange-500"
                      style={{ width: `${(xp % 1000) / 10}%` }}
                    />
                  </div>
                </div>

                {/* Overview stats cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Games</span>
                    <p className="text-lg font-black text-slate-800 mt-1 font-mono">{statsOverview.totalGames}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Accuracy</span>
                    <p className="text-lg font-black text-slate-800 mt-1 font-mono">{statsOverview.averageAccuracy}%</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Explored</span>
                    <p className="text-lg font-black text-slate-800 mt-1 font-mono">{exploredList.length}/175</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Best Region</span>
                    <p className="text-xs font-bold text-orange-600 mt-2.5 truncate" title={statsOverview.masteredRegion}>
                      {statsOverview.masteredRegion}
                    </p>
                  </div>
                </div>

                {/* Visual Continent Progress */}
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">Accuracy by Continent</h4>
                  <div className="space-y-2">
                    {REGION_OPTIONS.filter(o => o.value !== "Entire World").map((opt) => {
                      const regHistory = history.filter(h => h.region === opt.value);
                      const regAcc = regHistory.length > 0
                        ? Math.round(regHistory.reduce((acc, h) => acc + h.accuracy, 0) / regHistory.length)
                        : 0;

                      return (
                        <div key={opt.value} className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-slate-600 w-28 truncate">{opt.value}</span>
                          <div className="flex-1 h-2.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full bg-orange-400"
                              style={{ width: `${regAcc}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-800 w-10 text-right">{regAcc}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: Quiz History Logs */}
              <div className="rounded-3xl border border-slate-200 p-5 sm:p-6 bg-slate-50 flex flex-col gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">History Log</p>
                <h3 className="text-lg font-bold text-slate-950 -mt-2">Recent Quizzes</h3>
                
                {history.length > 0 ? (
                  <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
                    {history.map((h, i) => (
                      <div key={i} className="bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">
                            {QUIZ_MODES.find(m => m.id === h.mode)?.name || "Quiz"} ({h.region})
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{h.date} • {h.difficulty} • {h.timeTaken}s</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-800 font-mono text-sm">{h.score} pts</p>
                          <p className="text-[10px] font-bold text-emerald-600 mt-0.5">{h.accuracy}% Acc</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center select-none my-auto flex flex-col items-center justify-center gap-1.5">
                    <p className="text-sm font-semibold text-slate-600">No history records yet.</p>
                    <p className="text-xs text-slate-400">Your completed quiz matches will appear here.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* VIEW: ACHIEVEMENTS (TAB 4) */}
          {activeTab === "achievements" && !quizActive && (
            <div className="rounded-3xl border border-slate-200 p-5 sm:p-8 bg-white flex flex-col gap-6">
              
              <div className="space-y-1 border-b border-slate-150 pb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">Badges Collection</p>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">National Geographic Honors</h2>
                <p className="text-sm text-slate-500">
                  Earn unique accolades as you learn countries, capitals, flags, and physical features.
                </p>
              </div>

              {/* Achievements Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {ACHIEVEMENTS_LIST.map((ach) => {
                  const isUnlocked = unlockedAchievements.includes(ach.id);
                  return (
                    <div
                      key={ach.id}
                      className={`p-5 rounded-2xl border flex items-start gap-4 transition-all ${isUnlocked ? "bg-orange-50/50 border-orange-200 shadow-sm" : "bg-slate-50/70 border-slate-200/50 grayscale opacity-60"}`}
                    >
                      <span className={`text-sm font-bold w-12 h-12 flex items-center justify-center rounded-2xl shadow-inner border border-slate-200 text-white ${ach.color} select-none`}>
                        {ach.badge}
                      </span>
                      <div className="flex flex-col gap-1">
                        <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                          {ach.title}
                          {isUnlocked && (
                            <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                              Unlocked
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">{ach.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

        {/* Accuracy and General Info Footnote */}
        {!quizActive && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Accuracy & Sources Note</p>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Geographic maps and shape files are adapted from standard low-resolution public vectors (amCharts v3 World India - Low). Country capitals, populations, areas, and borders represent approximations for educational and testing purposes.
            </p>
          </div>
        )}

      </div>

      {/* Floating Action Confetti/Toast alerts */}
      {toast.show && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-4 py-2.5 text-sm shadow-xl font-semibold animate-fade-in border ${toast.type === "success" ? "bg-green-600 text-white border-green-500" : toast.type === "error" ? "bg-red-600 text-white border-red-500" : "bg-slate-900 text-white border-slate-800"}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}

      {/* Simple animations injection */}
      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
        .animate-fade-in {
          animation: fadeIn 0.35s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
