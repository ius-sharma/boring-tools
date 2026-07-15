"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  fallbackDataset,
  WATCH_TYPES,
  MOODS,
  GENRES,
  AVAILABLE_TIMES,
  BRAIN_POWER,
  ENERGY_LEVELS,
  CONTENT_PREFERENCES,
  LANGUAGES,
  RELEASE_YEAR_OPTIONS,
  IMDB_RATINGS,
  STREAMING_PLATFORMS,
  SMART_COLLECTIONS
} from "./data";

/* ───────── helpers ───────── */

function getMovieId(movie) {
  return movie.id || movie.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function getPosterGradient(genres) {
  const primary = (genres?.[0] || "").toLowerCase();
  const secondary = (genres?.[1] || "").toLowerCase();
  if (["sci-fi", "space", "time travel"].includes(primary) || secondary === "sci-fi")
    return "bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-950";
  if (["horror", "dark", "apocalypse"].includes(primary) || secondary === "horror")
    return "bg-gradient-to-br from-slate-950 via-zinc-900 to-red-950";
  if (primary === "romance" || secondary === "romance")
    return "bg-gradient-to-br from-rose-950 via-pink-900 to-slate-950";
  if (["action", "superhero", "survival"].includes(primary) || secondary === "action")
    return "bg-gradient-to-br from-red-950 via-orange-950 to-slate-950";
  if (["comedy", "funny", "feel good"].includes(primary) || secondary === "comedy")
    return "bg-gradient-to-br from-amber-950 via-orange-950 to-slate-950";
  if (["documentary", "biography", "history", "true story"].includes(primary))
    return "bg-gradient-to-br from-teal-950 via-emerald-950 to-slate-950";
  if (["drama", "psychological", "emotional"].includes(primary))
    return "bg-gradient-to-br from-blue-950 via-slate-800 to-slate-950";
  if (primary === "animation" || primary === "fantasy")
    return "bg-gradient-to-br from-sky-950 via-indigo-950 to-slate-950";
  return "bg-gradient-to-br from-slate-900 via-zinc-800 to-slate-950";
}

function formatRating(val) {
  if (val === undefined || val === null || val === "") return "N/A";
  const num = Number(val);
  return isNaN(num) ? String(val) : num.toFixed(1);
}

function renderStarIcon(filled, size = "w-6 h-6") {
  return (
    <svg 
      className={`${size} ${filled ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} 
      stroke="currentColor" 
      strokeWidth="1.5" 
      viewBox="0 0 24 24" 
      fill={filled ? "currentColor" : "none"}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.174-.627 1.066-.627 1.24 0l2.28 7.027a1 1 0 00.95.69h7.382c.658 0 .93.842.398 1.248l-5.975 4.341a1 1 0 00-.364 1.118l2.28 7.027c.174.627-.552 1.185-1.1.78l-5.975-4.341a1 1 0 00-1.176 0l-5.975 4.341c-.548.405-1.274-.153-1.1-.78l2.28-7.027a1 1 0 00-.364-1.118L2.05 12.464c-.53-.406-.258-1.248.398-1.248h7.382a1 1 0 00.95-.69l2.28-7.027z" />
    </svg>
  );
}

function renderFlameIcon(className = "w-6 h-6 text-orange-600") {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    </svg>
  );
}

function renderLightbulbIcon(className = "w-5 h-5 text-orange-600") {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function getQuizIcon(name, className = "w-8 h-8") {
  const norm = name.toLowerCase();
  if (norm.includes("happy") || norm.includes("loved")) {
    return (
      <svg className={`${className} text-amber-500`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (norm.includes("emotional")) {
    return (
      <svg className={`${className} text-blue-500`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 110-18 9 9 0 010 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h.01M15 10h.01M9.5 15.5a3.5 3.5 0 015 0" />
      </svg>
    );
  }
  if (norm.includes("mind blowing") || norm.includes("melt")) {
    return (
      <svg className={`${className} text-fuchsia-500`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    );
  }
  if (norm.includes("horror") || norm.includes("disliked")) {
    return (
      <svg className={`${className} text-slate-800`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a5 5 0 00-5 5v3a3 3 0 00-3 3v6a2 2 0 002 2h12a2 2 0 002-2v-6a3 3 0 00-3-3V7a5 5 0 00-5-5zM9 13h.01M15 13h.01M10 17h4" />
      </svg>
    );
  }
  if (norm.includes("romantic")) {
    return (
      <svg className={`${className} text-rose-500`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    );
  }
  if (norm.includes("motivating") || norm.includes("excited")) {
    return (
      <svg className={`${className} text-orange-500`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      </svg>
    );
  }
  if (norm.includes("provoking") || norm.includes("think") || norm.includes("focused")) {
    return (
      <svg className={`${className} text-purple-500`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5" />
      </svg>
    );
  }
  if (norm.includes("sports")) {
    return (
      <svg className={`${className} text-emerald-600`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 22a10 10 0 100-20 10 10 0 000 20z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.2 6.2l11.6 11.6M17.8 6.2L6.2 11.6" />
      </svg>
    );
  }
  if (norm.includes("space")) {
    return (
      <svg className={`${className} text-indigo-500`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 18.5l13-13" />
      </svg>
    );
  }
  if (norm.includes("mystery")) {
    return (
      <svg className={`${className} text-slate-600`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    );
  }
  if (norm.includes("time") || norm.includes("hour") || norm.includes("min")) {
    return (
      <svg className={`${className} text-slate-500`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (norm.includes("popcorn") || norm.includes("turn brain off")) {
    return (
      <svg className={`${className} text-yellow-600`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m-15 0a2.25 2.25 0 00-2.25 2.25v3c0 1.242 1.008 2.25 2.25 2.25h15a2.25 2.25 0 002.25-2.25v-3A2.25 2.25 0 0019.5 12" />
      </svg>
    );
  }
  if (norm.includes("casual") || norm.includes("okay")) {
    return (
      <svg className={`${className} text-sky-500`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1" />
      </svg>
    );
  }
  if (norm.includes("energy") || norm.includes("tired") || norm.includes("relaxed")) {
    return (
      <svg className={`${className} text-amber-500`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  }
  if (norm.includes("format") || norm.includes("movie") || norm.includes("series") || norm.includes("anime") || norm.includes("documentary")) {
    return (
      <svg className={`${className} text-indigo-500`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4h10M5 20h14m-14-4h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg className={`${className} text-slate-500`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function MovieSeriesRecommendationPage() {
  const [activeTab, setActiveTab] = useState("builder");
  const [isMounted, setIsMounted] = useState(false);

  // 5-Step Quiz State
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const [filters, setFilters] = useState({
    type: "Movie", 
    mood: "🤯 Mind Blowing", 
    availableTime: "2 Hours",
    brainPower: "🧠 Think",
    energyLevel: "Relaxed",
    genres: [], 
    language: "Any", 
    releaseYear: "Any",
    imdbRating: "Any", 
    platforms: [],
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeCollection, setActiveCollection] = useState(null);

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultsSource, setResultsSource] = useState("default");
  const [sortBy, setSortBy] = useState("match");

  const [watchlist, setWatchlist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [watchedHistory, setWatchedHistory] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [userNotes, setUserNotes] = useState({});
  const [watchStreak, setWatchStreak] = useState(0);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [failedPosters, setFailedPosters] = useState({});
  const [failedBackdrops, setFailedBackdrops] = useState({});

  // Rating Feedback Loop States
  const [ratingPromptMovie, setRatingPromptMovie] = useState(null);
  const [promptRating, setPromptRating] = useState(8);
  const [promptNote, setPromptNote] = useState("");
  const [promptReaction, setPromptReaction] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const [toast, setToast] = useState({ message: "", type: "info" });
  const toastTimeoutRef = useRef(null);

  /* ── LocalStorage boot ── */

  useEffect(() => {
    setIsMounted(true);
    try {
      const f = localStorage.getItem("movie_rec_filters");
      if (f) setFilters(JSON.parse(f));
      const w = localStorage.getItem("movie_rec_watchlist");
      if (w) setWatchlist(JSON.parse(w));
      const fv = localStorage.getItem("movie_rec_favorites");
      if (fv) setFavorites(JSON.parse(fv));
      const h = localStorage.getItem("movie_rec_history");
      if (h) setWatchedHistory(JSON.parse(h));
      const r = localStorage.getItem("movie_rec_ratings");
      if (r) setUserRatings(JSON.parse(r));
      const n = localStorage.getItem("movie_rec_notes");
      if (n) setUserNotes(JSON.parse(n));
      const rs = localStorage.getItem("movie_rec_recent_searches");
      if (rs) setRecentSearches(JSON.parse(rs));

      // Load watch streak
      const st = localStorage.getItem("movie_rec_streak");
      if (st) {
        const parsed = JSON.parse(st);
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        if (parsed.lastDate === today || parsed.lastDate === yesterday) {
          setWatchStreak(parsed.streak);
        } else {
          setWatchStreak(0);
        }
      }

      setRecommendations([]);
      setHasSearched(false);
    } catch (e) { console.error(e); }
  }, []);

  const save = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {} };

  const showToast = (message, type = "info") => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => setToast({ message: "", type: "info" }), 3000);
  };

  /* ── Filters ── */

  const updateFilters = (patch) => {
    const updated = { ...filters, ...patch };
    setFilters(updated);
    save("movie_rec_filters", updated);
  };

  const toggleGenre = (genre) => {
    const arr = [...filters.genres];
    const idx = arr.indexOf(genre);
    if (idx > -1) arr.splice(idx, 1); else arr.push(genre);
    updateFilters({ genres: arr });
  };

  const togglePlatform = (plat) => {
    const arr = [...filters.platforms];
    const idx = arr.indexOf(plat);
    if (idx > -1) arr.splice(idx, 1); else arr.push(plat);
    updateFilters({ platforms: arr });
  };

  const resetFilters = () => {
    const fresh = {
      type: "Movie", mood: "🤯 Mind Blowing", availableTime: "2 Hours", brainPower: "🧠 Think", energyLevel: "Relaxed",
      genres: [], language: "Any", releaseYear: "Any", imdbRating: "Any", platforms: []
    };
    setFilters(fresh);
    setCurrentStep(1);
    save("movie_rec_filters", fresh);
    showToast("Quiz reset to defaults");
  };

  /* ── Watchlist / Favorites / History ── */

  const saveMovieMeta = (movie) => {
    const id = getMovieId(movie);
    try {
      const raw = localStorage.getItem("movie_rec_metadata_cache");
      const c = raw ? JSON.parse(raw) : {};
      c[id] = movie;
      localStorage.setItem("movie_rec_metadata_cache", JSON.stringify(c));
    } catch (e) {}
  };

  const getCachedMovie = (movieId) => {
    const fb = fallbackDataset.find(m => m.id === movieId);
    if (fb) return fb;
    const rec = recommendations.find(m => getMovieId(m) === movieId);
    if (rec) return rec;
    try {
      const raw = localStorage.getItem("movie_rec_metadata_cache");
      if (raw) { const c = JSON.parse(raw); if (c[movieId]) return c[movieId]; }
    } catch (e) {}
    return null;
  };

  const toggleWatchlist = (movie) => {
    const id = getMovieId(movie);
    let updated;
    if (watchlist.includes(id)) {
      updated = watchlist.filter(x => x !== id);
      showToast(`Removed "${movie.title}" from Watchlist`);
    } else {
      updated = [...watchlist, id];
      showToast(`Added "${movie.title}" to Watchlist`, "success");
      saveMovieMeta(movie);
    }
    setWatchlist(updated);
    save("movie_rec_watchlist", updated);
  };

  const toggleFavorite = (movie) => {
    const id = getMovieId(movie);
    let updated;
    if (favorites.includes(id)) {
      updated = favorites.filter(x => x !== id);
      showToast(`Removed "${movie.title}" from Favorites`);
    } else {
      updated = [...favorites, id];
      showToast(`Added "${movie.title}" to Favorites`, "success");
      saveMovieMeta(movie);
    }
    setFavorites(updated);
    save("movie_rec_favorites", updated);
  };

  const updateStreak = () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const s = localStorage.getItem("movie_rec_streak");
      let currentStreak = 0;
      let lastDate = "";
      if (s) {
        const parsed = JSON.parse(s);
        currentStreak = parsed.streak;
        lastDate = parsed.lastDate;
      }
      
      if (lastDate === today) return; // already watched today
      
      if (lastDate === yesterday) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
      
      const newStreak = { streak: currentStreak, lastDate: today };
      setWatchStreak(currentStreak);
      localStorage.setItem("movie_rec_streak", JSON.stringify(newStreak));
    } catch (e) {}
  };

  const toggleWatched = (movie) => {
    const id = getMovieId(movie);
    let updated;
    if (watchedHistory.includes(id)) {
      updated = watchedHistory.filter(x => x !== id);
      showToast(`Marked "${movie.title}" as Unwatched`);
      setWatchedHistory(updated);
      save("movie_rec_history", updated);

      // Clean rating
      const updatedRatings = { ...userRatings };
      delete updatedRatings[id];
      setUserRatings(updatedRatings);
      save("movie_rec_ratings", updatedRatings);
    } else {
      saveMovieMeta(movie);
      setRatingPromptMovie(movie);
      setPromptReaction("");
      setPromptRating(8);
      setPromptNote("");
    }
  };

  const updateRating = (movieId, rating) => {
    const updated = { ...userRatings, [movieId]: Number(rating) };
    setUserRatings(updated);
    save("movie_rec_ratings", updated);
    showToast("Rating updated!", "success");
  };

  const updateNote = (movieId, note) => {
    const updated = { ...userNotes, [movieId]: note };
    setUserNotes(updated);
    save("movie_rec_notes", updated);
  };

  /* ── API calls (TMDB Proxy & iTunes / Wikipedia) ── */

  const fetchPosterFromWikipedia = async (title) => {
    try {
      const query = encodeURIComponent(title);
      const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${query}&prop=pageimages&format=json&pithumbsize=600&origin=*`;
      const response = await fetch(url);
      const data = await response.json();
      const pages = data?.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        if (pageId && pageId !== "-1") {
          const thumbnail = pages[pageId].thumbnail;
          if (thumbnail && thumbnail.source) {
            return thumbnail.source;
          }
        }
      }
    } catch (e) {
      console.error("Wikipedia search failed:", e);
    }
    return null;
  };

  const fetchPosterFromiTunes = async (title, type, year) => {
    try {
      const cleanTarget = title.toLowerCase().replace(/[^a-z0-9]+/g, "");
      const isMovie = type === "Movie" || type === "Documentary";
      const mediaType = isMovie ? "movie" : "tvShow";
      
      const query = encodeURIComponent(title);
      let url = `https://itunes.apple.com/search?term=${query}&media=${mediaType}&limit=5`;
      let response = await fetch(url);
      let data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        const oppositeMedia = isMovie ? "tvShow" : "movie";
        url = `https://itunes.apple.com/search?term=${query}&media=${oppositeMedia}&limit=5`;
        response = await fetch(url);
        data = await response.json();
      }
      
      if (data.results && data.results.length > 0) {
        let bestMatch = null;
        for (const res of data.results) {
          const resName = res.trackName || res.collectionName || "";
          const cleanRes = resName.toLowerCase().replace(/[^a-z0-9]+/g, "");
          
          if (cleanRes.includes(cleanTarget) || cleanTarget.includes(cleanRes)) {
            bestMatch = res;
            break;
          }
        }
        
        const match = bestMatch || data.results[0];
        const artworkUrl = match.artworkUrl100;
        if (artworkUrl) {
          return artworkUrl.replace("100x100bb.jpg", "600x600bb.jpg");
        }
      }
    } catch (error) {
      console.error("iTunes search failed:", error);
    }
    return await fetchPosterFromWikipedia(title);
  };

  const fetchPosterAndBackdrop = async (movie) => {
    // 1. Try server-side TMDB proxy first
    try {
      const res = await fetch("/api/movie-series-recommendation/tmdb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: movie.title,
          year: movie.releaseYear,
          type: movie.type
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.posterUrl || data.backdropUrl) {
          return {
            posterUrl: data.posterUrl || "",
            backdropUrl: data.backdropUrl || "",
            tmdbId: data.tmdbId || null
          };
        }
      }
    } catch (e) {
      console.warn("TMDB proxy fetch failed, falling back to iTunes/Wikipedia:", e);
    }

    // 2. iTunes/Wikipedia fallback
    const iTunesPoster = await fetchPosterFromiTunes(movie.title, movie.type, movie.releaseYear);
    return {
      posterUrl: iTunesPoster || "",
      backdropUrl: "",
      tmdbId: null
    };
  };

  const loadPostersForRecommendations = async (items) => {
    const updated = await Promise.all(items.map(async (movie) => {
      const images = await fetchPosterAndBackdrop(movie);
      return {
        ...movie,
        posterUrl: images.posterUrl,
        backdropUrl: images.backdropUrl,
        tmdbId: images.tmdbId
      };
    }));
    setRecommendations(updated);
    save("movie_rec_last_results", updated);
    updated.forEach(m => saveMovieMeta(m));
  };

  const fetchRecommendations = async (params) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const favoritesTitles = favorites.map(id => getCachedMovie(id)?.title || id).slice(0, 10);
      const watchedTitles = watchedHistory.map(id => getCachedMovie(id)?.title || id).slice(0, 20);

      const likedTitles = [];
      const dislikedTitles = [];
      Object.entries(userRatings).forEach(([id, rating]) => {
        const movieObj = getCachedMovie(id);
        const title = movieObj ? movieObj.title : id;
        const rNum = Number(rating);
        if (rNum >= 7) likedTitles.push(`${title} (Rated: ${rNum}/10)`);
        else if (rNum <= 5) dislikedTitles.push(`${title} (Rated: ${rNum}/10)`);
      });

      const res = await fetch("/api/movie-series-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...params,
          favorites: favoritesTitles,
          history: watchedTitles,
          likedTitles,
          dislikedTitles
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.recommendations?.length > 0) {
        setRecommendations(data.recommendations);
        save("movie_rec_last_results", data.recommendations);
        data.recommendations.forEach(m => saveMovieMeta(m));
        setResultsSource(params.collection ? "collection" : params.searchQuery ? "search" : "ai");
        showToast("Recommendations loaded successfully!", "success");
        document.getElementById("recommendation-results")?.scrollIntoView({ behavior: "smooth" });
        
        loadPostersForRecommendations(data.recommendations);
      } else throw new Error("No recommendations returned.");
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the recommendation API. Showing local fallback titles.");
      setRecommendations(fallbackDataset);
      setResultsSource("fallback");
      showToast("Offline mode: Using local fallback recommendations", "warning");
      document.getElementById("recommendation-results")?.scrollIntoView({ behavior: "smooth" });
      
      loadPostersForRecommendations(fallbackDataset);
    } finally { setLoading(false); }
  };

  const handleGetRecommendations = () => { setActiveCollection(null); setSearchQuery(""); fetchRecommendations({ filters }); };
  const handleCollectionClick = (col) => { setActiveCollection(col.name); setSearchQuery(""); fetchRecommendations({ collection: col.name }); };
  const handleSearchSubmit = (e) => { e.preventDefault(); if (!searchQuery.trim()) return; setActiveCollection(null); addToRecentSearches(searchQuery); fetchRecommendations({ searchQuery }); };
  const handleSimilarMovieClick = (title) => { setSelectedMovie(null); setSearchQuery(title); addToRecentSearches(title); fetchRecommendations({ searchQuery: title }); };

  const addToRecentSearches = (q) => {
    if (!q.trim()) return;
    const updated = [q, ...recentSearches.filter(x => x !== q)].slice(0, 5);
    setRecentSearches(updated);
    save("movie_rec_recent_searches", updated);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    save("movie_rec_recent_searches", []);
  };

  /* ── Autocomplete / Suggestions ── */

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const suggestions = new Set();

    // Scan fallbacks and recommendation titles
    fallbackDataset.forEach(m => {
      if (m.title.toLowerCase().includes(q)) suggestions.add(m.title);
      if (m.director.toLowerCase().includes(q)) suggestions.add(m.director);
      m.genres.forEach(g => { if (g.toLowerCase().includes(q)) suggestions.add(g); });
      m.cast.forEach(c => { if (c.toLowerCase().includes(q)) suggestions.add(c); });
    });

    return Array.from(suggestions).slice(0, 5);
  }, [searchQuery]);

  /* ── Sorted recommendations ── */

  const sortedRecommendations = useMemo(() => {
    const list = [...recommendations];
    if (sortBy === "match") return list.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    if (sortBy === "rating") return list.sort((a, b) => b.imdbRating - a.imdbRating);
    if (sortBy === "year") return list.sort((a, b) => b.releaseYear - a.releaseYear);
    if (sortBy === "popularity") return list.sort((a, b) => b.popularityScore - a.popularityScore);
    return list;
  }, [recommendations, sortBy]);

  /* ── Statistics Dashboard ── */

  const stats = useMemo(() => {
    const items = watchedHistory.map(id => getCachedMovie(id)).filter(Boolean);
    const moviesCount = items.filter(m => m.type === "Movie" || m.type === "Documentary").length;
    const seriesCount = items.filter(m => m.type === "TV Series" || m.type === "Series" || m.type === "Anime" || m.type === "Mini Series").length;
    
    const totalMin = items.reduce((acc, curr) => acc + (curr.runtime || 0), 0);
    const totalHours = Math.round(totalMin / 60);

    const ratedIds = Object.keys(userRatings);
    const avgRating = ratedIds.length 
      ? (ratedIds.reduce((acc, curr) => acc + userRatings[curr], 0) / ratedIds.length).toFixed(1)
      : "0.0";
      
    const gm = {};
    items.forEach(m => m.genres?.forEach(g => { gm[g] = (gm[g] || 0) + 1; }));
    const favoriteGenre = Object.entries(gm).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

    const dm = {};
    items.forEach(m => { if (m.director) dm[m.director] = (dm[m.director] || 0) + 1; });
    const favoriteDirector = Object.entries(dm).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

    const am = {};
    items.forEach(m => m.cast?.forEach(a => { am[a] = (am[a] || 0) + 1; }));
    const favoriteActor = Object.entries(am).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

    const collectionProgress = SMART_COLLECTIONS.map(col => {
      const cItems = [...fallbackDataset.filter(m => m.collections?.includes(col.name))];
      try {
        const raw = localStorage.getItem("movie_rec_metadata_cache");
        if (raw) Object.values(JSON.parse(raw)).forEach((m) => { if (m && m.collections?.includes(col.name) && !cItems.some(x => x.id === m.id)) cItems.push(m); });
      } catch (e) {}
      const t = Math.max(cItems.length, 1);
      const w = cItems.filter(m => watchedHistory.includes(m.id)).length;
      return { id: col.id, name: col.name, watched: w, total: t, percent: Math.round((w / t) * 100) };
    });

    const insights = [];
    if (favoriteGenre !== "None") {
      insights.push(`You mostly watch ${favoriteGenre} titles.`);
    }
    const slowBurnWatched = items.filter(m => m.contentPreferences?.includes("Slow Burn") || m.shortDescription?.toLowerCase().includes("slow-burn") || m.longDescription?.toLowerCase().includes("slow burn")).length;
    if (slowBurnWatched > 0) {
      insights.push("You enjoy slow-burn movies.");
    }
    const emotionalWatched = items.filter(m => m.moods?.includes("😭 Emotional") || m.moods?.includes("Emotional") || m.genres?.includes("Drama")).length;
    if (emotionalWatched > 1) {
      insights.push("You prefer emotional endings.");
    }
    const avgRuntime = items.length ? totalMin / items.length : 0;
    if (avgRuntime > 120) {
      insights.push("You usually watch movies longer than 2 hours.");
    }

    return { 
      count: items.length, 
      moviesCount, 
      seriesCount, 
      avgRating, 
      timeDays: Math.floor(totalMin / 1440), 
      timeHours: Math.floor((totalMin % 1440) / 60), 
      timeMins: totalMin % 60, 
      genreCounts: Object.entries(gm).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5), 
      collectionProgress,
      favoriteGenre,
      favoriteDirector,
      favoriteActor,
      insights,
      totalHours
    };
  }, [watchedHistory, userRatings, isMounted]);

  /* ── Import / Export ── */

  const handleExportData = () => {
    const blob = JSON.stringify({ watchlist, favorites, watchedHistory, userRatings, userNotes }, null, 2);
    const a = document.createElement("a");
    a.href = "data:application/json;charset=utf-8," + encodeURIComponent(blob);
    a.download = "boringtools_movie_watchlist.json";
    a.click();
    showToast("Watchlist data exported!", "success");
  };

  const handleImportData = (e) => {
    const reader = new FileReader();
    if (!e.target.files?.[0]) return;
    reader.readAsText(e.target.files[0], "UTF-8");
    reader.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target.result);
        if (d.watchlist) { setWatchlist(d.watchlist); save("movie_rec_watchlist", d.watchlist); }
        if (d.favorites) { setFavorites(d.favorites); save("movie_rec_favorites", d.favorites); }
        if (d.watchedHistory) { setWatchedHistory(d.watchedHistory); save("movie_rec_history", d.watchedHistory); }
        if (d.userRatings) { setUserRatings(d.userRatings); save("movie_rec_ratings", d.userRatings); }
        if (d.userNotes) { setUserNotes(d.userNotes); save("movie_rec_notes", d.userNotes); }
        showToast("Data imported successfully!", "success");
      } catch (err) { showToast("Invalid JSON file.", "error"); }
    };
  };

  const handleCopyRecommendations = () => {
    if (!recommendations.length) { showToast("No recommendations to copy", "error"); return; }
    const text = recommendations.map((m, i) => `${i + 1}. ${m.title} (${m.releaseYear}) - ${m.type} | Rating: ${m.imdbRating}/10\n   Genres: ${m.genres.join(", ")}\n   ${m.shortDescription}\n   Why: ${m.whyRecommended || "Fits criteria"}`).join("\n\n");
    navigator.clipboard.writeText(text);
    showToast("Recommendations copied to clipboard!", "success");
  };

  const handleDownloadTxt = () => {
    if (!recommendations.length) { showToast("No recommendations to download", "error"); return; }
    const header = `${"=".repeat(52)}\n   BORINGTOOLS MOVIE & SERIES RECOMMENDATIONS\n   Generated: ${new Date().toLocaleDateString()}\n${"=".repeat(52)}\n\n`;
    const body = recommendations.map((m, i) => `[${i + 1}] ${m.title.toUpperCase()}\nType: ${m.type} | Year: ${m.releaseYear} | Rating: ${m.imdbRating}/10\nDirector: ${m.director} | Runtime: ${m.runtime} mins\nGenres: ${m.genres.join(", ")} | Languages: ${m.languages?.join(", ") || "N/A"}\nSynopsis: ${m.shortDescription}\nWhy: ${m.whyRecommended || "Matches criteria."}\nPlatforms: ${m.streamingPlatforms?.join(", ") || "N/A"}\n${"─".repeat(48)}`).join("\n\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([header + body], { type: "text/plain" }));
    a.download = "movie_recommendations.txt";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showToast("TXT report downloaded!", "success");
  };

  const handlePosterError = (movieId) => {
    setFailedPosters(prev => ({ ...prev, [movieId]: true }));
  };

  const handleBackdropError = (movieId) => {
    setFailedBackdrops(prev => ({ ...prev, [movieId]: true }));
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-semibold tracking-wider uppercase">Loading recommendation engine...</p>
        </div>
      </div>
    );
  }

  /* ────────────────── Render Helpers ────────────────── */

  const renderProgressIndicator = () => (
    <div className="w-full bg-slate-100 rounded-full h-2 mb-6 overflow-hidden">
      <div 
        className="bg-orange-500 h-full transition-all duration-300 rounded-full" 
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      />
    </div>
  );

  const renderSkeletons = () => (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col h-[480px]">
          <div className="h-40 bg-slate-200 relative flex-shrink-0" />
          <div className="p-5 flex-1 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="flex gap-1.5 mt-1">
                <div className="h-4 bg-slate-200 rounded w-12" />
                <div className="h-4 bg-slate-200 rounded w-12" />
              </div>
              <div className="h-3 bg-slate-200 rounded w-full mt-2" />
              <div className="h-3 bg-slate-200 rounded w-5/6" />
              <div className="h-10 bg-slate-100 rounded-xl w-full mt-3" />
            </div>
            <div className="h-8 bg-slate-200 rounded-xl w-full" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center px-4 py-6 sm:py-10 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-10 w-full max-w-7xl border border-slate-200 flex flex-col gap-10">

        {/* ═══════ HERO ═══════ */}
        <div className="flex flex-col gap-3 items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Entertainment Tools</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Movie & Series Recommendation</h1>
          <p className="text-slate-500 text-base max-w-2xl leading-relaxed">
            Find your next watch based on mood, genres, available time, and platforms.
            Powered by live AI internet search, personalized by your watchlist history.
          </p>
        </div>

        {/* ═══════ TABS ═══════ */}
        <div className="flex justify-center border-b border-slate-200">
          <div className="flex gap-2 sm:gap-8">
            {[
              { key: "builder", label: "Recommendation Builder" },
              { key: "collections", label: "Discovery Modes" },
              { key: "watchlist", label: "Watchlist & Dashboard" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`pb-3 px-1 sm:px-3 text-sm font-semibold border-b-2 transition focus:outline-none ${
                  activeTab === key ? "border-orange-500 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ═══════ TAB 1: BUILDER ═══════ */}
        {activeTab === "builder" && (
          <div className="flex flex-col gap-8">
            
            {/* Step Panel Wrapper */}
            <div className="border border-slate-200 rounded-3xl p-6 sm:p-8 bg-slate-50/50">
              
              {renderProgressIndicator()}
              
              {/* Step 1: Mood */}
              {currentStep === 1 && (
                <StepPanel title="What are you in the mood for?">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {MOODS.map(mood => (
                      <button
                        key={mood}
                        onClick={() => { updateFilters({ mood }); setCurrentStep(2); }}
                        className={`p-6 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer ${
                          filters.mood === mood 
                            ? "bg-orange-50 border-orange-500 text-orange-700 shadow-md transform scale-[1.02] font-black"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold"
                        }`}
                      >
                        {getQuizIcon(mood, "w-8 h-8")}
                        <span className="text-xs tracking-tight mt-1.5">{mood.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "").trim()}</span>
                      </button>
                    ))}
                  </div>
                </StepPanel>
              )}

              {/* Step 2: Time */}
              {currentStep === 2 && (
                <StepPanel title="How much time do you have?">
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {AVAILABLE_TIMES.map(t => (
                      <button
                        key={t}
                        onClick={() => { updateFilters({ availableTime: t }); setCurrentStep(3); }}
                        className={`p-6 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer ${
                          filters.availableTime === t 
                            ? "bg-orange-50 border-orange-500 text-orange-700 shadow-md transform scale-[1.02] font-black"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold"
                        }`}
                      >
                        {getQuizIcon("time", "w-8 h-8")}
                        <span className="text-sm mt-1.5">{t}</span>
                      </button>
                    ))}
                  </div>
                </StepPanel>
              )}

              {/* Step 3: Brain Power */}
              {currentStep === 3 && (
                <StepPanel title="How much brain power do you want to use?">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {BRAIN_POWER.map(bp => (
                      <button
                        key={bp}
                        onClick={() => { updateFilters({ brainPower: bp }); setCurrentStep(4); }}
                        className={`p-6 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer ${
                          filters.brainPower === bp 
                            ? "bg-orange-50 border-orange-500 text-orange-700 shadow-md transform scale-[1.02] font-black"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold"
                        }`}
                      >
                        {getQuizIcon(bp, "w-8 h-8")}
                        <span className="text-xs tracking-tight mt-1.5">{bp.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "").trim()}</span>
                      </button>
                    ))}
                  </div>
                </StepPanel>
              )}

              {/* Step 4: Energy Level */}
              {currentStep === 4 && (
                <StepPanel title="What is your current energy level?">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {ENERGY_LEVELS.map(el => (
                      <button
                        key={el}
                        onClick={() => { updateFilters({ energyLevel: el }); setCurrentStep(5); }}
                        className={`p-6 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer ${
                          filters.energyLevel === el 
                            ? "bg-orange-50 border-orange-500 text-orange-700 shadow-md transform scale-[1.02] font-black"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold"
                        }`}
                      >
                        {getQuizIcon("energy", "w-8 h-8")}
                        <span className="text-sm mt-1.5">{el}</span>
                      </button>
                    ))}
                  </div>
                </StepPanel>
              )}

              {/* Step 5: Format */}
              {currentStep === 5 && (
                <StepPanel title="What format would you prefer?">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {WATCH_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => updateFilters({ type })}
                        className={`p-6 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer ${
                          filters.type === type 
                            ? "bg-orange-50 border-orange-500 text-orange-700 shadow-md transform scale-[1.02] font-black"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold"
                        }`}
                      >
                        {getQuizIcon("format", "w-8 h-8")}
                        <span className="text-sm mt-1.5">{type}</span>
                      </button>
                    ))}
                  </div>
                </StepPanel>
              )}

              {/* Advanced Criteria Drawer */}
              <div className="border-t border-slate-200 mt-6 pt-4">
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)} 
                  className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-800 focus:outline-none"
                >
                  <span>{showAdvanced ? "▼ Hide" : "▶ Show"} Advanced Criteria (Optional)</span>
                </button>
                
                {showAdvanced && (
                  <div className="grid gap-6 sm:grid-cols-2 mt-4 text-xs font-bold text-slate-700">
                    <div className="flex flex-col gap-2">
                      <span>Preferred Genres (Select multiple)</span>
                      <div className="flex flex-wrap gap-1.5">
                        {GENRES.map(g => {
                          const hasG = filters.genres.includes(g);
                          return (
                            <button
                              key={g}
                              onClick={() => toggleGenre(g)}
                              className={`px-2.5 py-1.5 rounded-lg border transition ${
                                hasG ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              {g}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <span>Preferred Language</span>
                          <select 
                            value={filters.language}
                            onChange={(e) => updateFilters({ language: e.target.value })}
                            className="border border-slate-200 rounded-xl px-3 py-2 bg-white"
                          >
                            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span>Release Era</span>
                          <select 
                            value={filters.releaseYear}
                            onChange={(e) => updateFilters({ releaseYear: e.target.value })}
                            className="border border-slate-200 rounded-xl px-3 py-2 bg-white"
                          >
                            {RELEASE_YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <span>Min IMDb Rating</span>
                          <select 
                            value={filters.imdbRating}
                            onChange={(e) => updateFilters({ imdbRating: e.target.value })}
                            className="border border-slate-200 rounded-xl px-3 py-2 bg-white"
                          >
                            <option value="Any">Any Rating</option>
                            {IMDB_RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span>Streaming Availability</span>
                          <div className="flex flex-wrap gap-1">
                            {STREAMING_PLATFORMS.filter(p => p !== "Any").map(p => {
                              const hasP = filters.platforms.includes(p);
                              return (
                                <button
                                  key={p}
                                  onClick={() => togglePlatform(p)}
                                  className={`px-2 py-1 rounded-md border text-[10px] transition ${
                                    hasP ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-slate-200 hover:bg-slate-50"
                                  }`}
                                >
                                  {p}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Actions Row */}
              <div className="flex justify-between items-center mt-6 pt-5 border-t border-slate-200/80">
                <div className="flex gap-2">
                  <button 
                    onClick={resetFilters} 
                    className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs transition"
                  >
                    Reset Quiz
                  </button>
                  {currentStep > 1 && (
                    <button 
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition"
                    >
                      ← Back
                    </button>
                  )}
                </div>
                
                {currentStep < totalSteps ? (
                  <button 
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="py-2.5 px-5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs transition"
                  >
                    Next Step →
                  </button>
                ) : (
                  <button 
                    onClick={handleGetRecommendations}
                    className="py-2.5 px-6 rounded-xl bg-orange-600 text-white hover:bg-orange-700 font-black text-xs shadow-md shadow-orange-600/25 transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l5-1.5L19 21l-.813-5.096c.093-.327.131-.67.103-1.02a4.498 4.498 0 00-4.38-3.953h-3.82a4.498 4.498 0 00-4.38 3.953c-.028.35.01.693.103 1.02z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707" />
                    </svg>
                    Get Recommendations
                  </button>
                )}
              </div>

            </div>

            {/* Current selections summary chip deck */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Your Selections:</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">{filters.type}</span>
                <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">{filters.mood}</span>
                <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">{filters.availableTime}</span>
                <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">{filters.brainPower}</span>
                <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">{filters.energyLevel}</span>
                {filters.language !== "Any" && <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">Lang: {filters.language}</span>}
                {filters.releaseYear !== "Any" && <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">Era: {filters.releaseYear}</span>}
                {filters.imdbRating !== "Any" && <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">★ {filters.imdbRating}</span>}
              </div>
            </div>

          </div>
        )}

        {/* ═══════ TAB 2: DISCOVERY MODES ═══════ */}
        {activeTab === "collections" && (
          <div className="flex flex-col gap-6">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Curated Discovery Catalogs</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">Hand-picked collection algorithms designed around key cinematic concepts.</p>
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SMART_COLLECTIONS.map(col => (
                <button
                  key={col.id}
                  onClick={() => handleCollectionClick(col)}
                  className={`p-6 rounded-2xl border text-left flex flex-col gap-2 transition duration-200 cursor-pointer ${
                    activeCollection === col.name
                      ? "bg-orange-50/50 border-orange-500 shadow-md"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <span className="text-sm font-extrabold text-slate-900">{col.name}</span>
                  <span className="text-xs text-slate-500 font-medium leading-relaxed">{col.desc}</span>
                  <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider mt-2 flex items-center gap-1">Browse Catalog →</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══════ TAB 3: WATCHLIST & DASHBOARD ═══════ */}
        {activeTab === "watchlist" && (
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            
            {/* Left Col: Lists */}
            <div className="flex flex-col gap-8">
              
              {/* Watchlist */}
              <div className="border border-slate-200 rounded-2xl p-6 flex flex-col gap-5 bg-white shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900">My Watchlist ({watchlist.length})</h3>
                  <span className="text-xs text-orange-500 font-semibold uppercase">Plan to watch</span>
                </div>

                {watchlist.length === 0 ? (
                  <p className="text-slate-400 text-xs py-6 text-center italic">Your watchlist is currently empty. Bookmark recommendations to plan your watches!</p>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                    {watchlist.map(id => {
                      const movie = getCachedMovie(id);
                      if (!movie) return null;
                      return (
                        <div key={id} className="p-3.5 border border-slate-100 rounded-xl bg-slate-50/30 flex justify-between items-center gap-4">
                          <div onClick={() => setSelectedMovie(movie)} className="flex flex-col gap-0.5 truncate cursor-pointer flex-1">
                            <span className="text-sm font-extrabold text-slate-800 truncate hover:text-orange-600 transition">{movie.title}</span>
                            <span className="text-xs text-slate-500">{movie.type} &middot; {movie.releaseYear}</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => toggleWatched(movie)} className="text-slate-400 hover:text-emerald-600 text-xs font-bold px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Watched
                            </button>
                            <button onClick={() => toggleWatchlist(movie)} className="text-slate-400 hover:text-red-600 text-xs font-bold px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 transition">✕ Remove</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Favorites */}
              <div className="border border-slate-200 rounded-2xl p-6 flex flex-col gap-5 bg-white shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900">My Favorites ({favorites.length})</h3>
                  <span className="text-xs text-rose-500 font-semibold uppercase">Loved list</span>
                </div>

                {favorites.length === 0 ? (
                  <p className="text-slate-400 text-xs py-6 text-center italic">No favorites added yet. Heart recommendations you absolutely love!</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-1">
                    {favorites.map(id => {
                      const movie = getCachedMovie(id);
                      if (!movie) return null;
                      return (
                        <div key={id} className="p-3 border border-slate-100 rounded-xl bg-rose-50/10 flex justify-between items-center gap-2">
                          <div onClick={() => setSelectedMovie(movie)} className="flex flex-col gap-0.5 truncate cursor-pointer flex-1">
                            <span className="text-xs font-extrabold text-slate-800 truncate hover:text-rose-600 transition">{movie.title}</span>
                            <span className="text-[10px] text-slate-500">{movie.releaseYear}</span>
                          </div>
                          <button onClick={() => toggleFavorite(movie)} className="text-rose-500 hover:text-rose-700 text-xs font-bold px-1.5">✕</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Right Col: Stats & Analytics */}
            <div className="flex flex-col gap-8">
              
              {/* Stats Panel */}
              <div className="border border-slate-200 rounded-2xl p-6 flex flex-col gap-5 bg-white shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Watching Analytics</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Titles Watched</span>
                    <span className="text-2xl font-black text-slate-900 block">{stats.count}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">{stats.moviesCount} Movies &middot; {stats.seriesCount} Series</span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Avg Personal Rating</span>
                    <span className="text-2xl font-black text-amber-500 flex items-center gap-1">
                      {renderStarIcon(true, "w-6 h-6 text-amber-500")}
                      {stats.avgRating}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">{Object.keys(userRatings).length} titles rated</span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Watch Streak</span>
                    <span className="text-2xl font-black text-orange-600 flex items-center gap-1">
                      {renderFlameIcon("w-6 h-6 text-orange-600")}
                      {watchStreak} Days
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">Keep watching daily!</span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Total Watch Time</span>
                    <span className="text-2xl font-black text-slate-900 block">{stats.totalHours} hrs</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Est. runtimes cached</span>
                  </div>
                </div>

                {/* Favorite elements */}
                <div className="border-t border-slate-100 pt-4 flex flex-col gap-2.5 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between"><span className="text-slate-500">Favorite Genre:</span><span className="text-slate-900 font-extrabold">{stats.favoriteGenre}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Favorite Director:</span><span className="text-slate-900 font-extrabold truncate max-w-[200px]">{stats.favoriteDirector}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Favorite Actor:</span><span className="text-slate-900 font-extrabold truncate max-w-[200px]">{stats.favoriteActor}</span></div>
                </div>

                {/* Fun Insights */}
                {stats.insights.length > 0 && (
                  <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Fun Insights</span>
                    <div className="flex flex-col gap-2">
                      {stats.insights.map((insight, idx) => (
                        <div key={idx} className="bg-orange-50/40 border border-orange-100/50 rounded-lg p-2.5 text-[11px] text-orange-950 font-bold flex items-center gap-2">
                          {renderLightbulbIcon("w-4 h-4 text-orange-600")}
                          <span>{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Milestones collection progress */}
                {stats.collectionProgress.some(c => c.watched > 0) && (
                  <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Discovery milestones</span>
                    <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1">
                      {stats.collectionProgress.filter(c => c.watched > 0).map(col => (
                        <div key={col.id} className="flex flex-col gap-1 text-[11px]">
                          <div className="flex justify-between text-slate-600 font-bold">
                            <span>{col.name}</span>
                            <span>{col.watched} / {col.total} ({col.percent}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/50">
                            <div className="bg-emerald-500 h-full transition-all rounded-full" style={{ width: `${col.percent}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Backup utilities */}
              <div className="border border-slate-200 rounded-2xl p-6 flex flex-col gap-5 bg-white shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Data Utility & Sync</h3>
                <div className="flex flex-col gap-3">
                  <button onClick={handleExportData} className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer">Export Backup (JSON)</button>
                  <label className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs text-center cursor-pointer transition">
                    Import Backup (JSON)
                    <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                  </label>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ═══════ RESULTS SECTION ═══════ */}
        {hasSearched && (
          <div id="recommendation-results" className="flex flex-col gap-6 border-t border-slate-100 pt-8 mt-4">
            
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  {activeCollection ? `Catalog: ${activeCollection}` : searchQuery ? `Results for "${searchQuery}"` : "Recommendations for You"}
                </h2>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  Showing {recommendations.length} items &middot; Powered by {resultsSource === "ai" || resultsSource === "collection" || resultsSource === "search" ? "Dynamic AI Engine" : "Offline Catalog Fallback"}
                </p>
              </div>

              {/* Instant Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto relative">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search movie, series, actor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <button type="submit" className="absolute right-3 text-slate-400 hover:text-slate-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </button>
                </form>

                {/* Autocomplete Suggestions dropdown */}
                {searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-2 flex flex-col gap-1">
                    {searchSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => { setSearchQuery(suggestion); setActiveCollection(null); addToRecentSearches(suggestion); fetchRecommendations({ searchQuery: suggestion }); }}
                        className="text-left px-3 py-2 text-xs hover:bg-slate-50 rounded-lg text-slate-700 font-bold transition flex items-center gap-2"
                      >
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Sort By controls */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold whitespace-nowrap">Sort By:</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-bold">
                    <option value="match">Match Score</option>
                    <option value="rating">IMDb Rating</option>
                    <option value="year">Release Year</option>
                    <option value="popularity">Popularity</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Recent Searches Chip Deck */}
            {recentSearches.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center text-xs">
                <span className="text-slate-400 font-semibold">Recent Searches:</span>
                {recentSearches.map(q => (
                  <button 
                    key={q} 
                    onClick={() => { setSearchQuery(q); fetchRecommendations({ searchQuery: q }); }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-2.5 py-1 rounded-lg transition"
                  >
                    {q}
                  </button>
                ))}
                <button onClick={clearRecentSearches} className="text-slate-400 hover:text-slate-600 underline font-bold px-1">Clear</button>
              </div>
            )}

            {/* Quick action utility buttons */}
            <div className="flex gap-2.5">
              <button onClick={handleCopyRecommendations} className="py-2 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 transition cursor-pointer">Copy Recommendations</button>
              <button onClick={handleDownloadTxt} className="py-2 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 transition cursor-pointer">Download TXT Summary</button>
            </div>

            {/* Results Display */}
            {loading ? (
              renderSkeletons()
            ) : error && recommendations.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <p className="text-slate-500 text-sm font-semibold">{error}</p>
                <p className="text-slate-400 text-xs mt-2">Check connection or reset search keywords.</p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {sortedRecommendations.map((movie) => {
                  const movieId = getMovieId(movie);
                  const isFav = favorites.includes(movieId);
                  const inWatch = watchlist.includes(movieId);
                  const isWat = watchedHistory.includes(movieId);
                  const rating = userRatings[movieId];
                  const hasBackdrop = movie.backdropUrl && !failedBackdrops[movieId];
                  const hasPoster = movie.posterUrl && !failedPosters[movieId];

                  return (
                    <div key={movieId} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-[2px] flex flex-col transition-all duration-300 group relative">
                      
                      {/* Premium Backdrop Overlay Header */}
                      <div className="h-40 w-full relative overflow-hidden flex-shrink-0 bg-slate-900 border-b border-slate-100">
                        {/* Gradient fallback behind backdrop */}
                        <div className={`absolute inset-0 ${getPosterGradient(movie.genres)} opacity-90`} />

                        {hasBackdrop && (
                          <img
                            src={movie.backdropUrl}
                            alt={movie.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                            onError={() => handleBackdropError(movieId)}
                            loading="lazy"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                        {/* IMDb badge top-left */}
                        <div className="absolute left-3 top-3 z-15 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-lg px-2 py-0.5 text-[11px] font-black text-amber-400 flex items-center gap-1 shadow-sm">
                          ★ {formatRating(movie.imdbRating)}
                        </div>

                        {/* personal watched indicator top-right */}
                        {isWat && (
                          <div className="absolute right-3 top-3 z-15 bg-emerald-600/90 backdrop-blur-sm border border-emerald-500/30 rounded-lg px-2.5 py-0.5 text-[10px] font-black text-white flex items-center gap-1.5 shadow-sm">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>Rated {rating ? `${rating}★` : "Watched"}</span>
                          </div>
                        )}

                        {/* Title and Metadata inside backdrop overlay */}
                        <div className="absolute bottom-3 left-24 right-3 text-white z-15">
                          <h3 
                            onClick={() => setSelectedMovie(movie)} 
                            className="font-extrabold text-base tracking-tight hover:text-orange-400 transition cursor-pointer truncate"
                            title={movie.title}
                          >
                            {movie.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-semibold mt-0.5">
                            <span>{movie.releaseYear}</span>
                            <span>&middot;</span>
                            <span>{movie.runtime ? `${movie.runtime}m` : ""}</span>
                            {movie.genres?.[0] && (
                              <>
                                <span>&middot;</span>
                                <span className="uppercase">{movie.genres[0]}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Float Poster over backdrop bottom-left */}
                        <div 
                          onClick={() => setSelectedMovie(movie)} 
                          className="absolute bottom-2 left-3 w-18 h-26 rounded-lg border-2 border-white/95 overflow-hidden shadow-md cursor-pointer bg-slate-800 z-20 flex-shrink-0"
                        >
                          <div className={`absolute inset-0 ${getPosterGradient(movie.genres)}`} />
                          {hasPoster ? (
                            <img
                              src={movie.posterUrl}
                              alt={movie.title}
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={() => handlePosterError(movieId)}
                              loading="lazy"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/50 font-bold">POSTER</div>
                          )}
                        </div>
                      </div>

                      {/* Card Body content */}
                      <div className="p-5 flex-1 flex flex-col justify-between gap-4 pt-4">
                        
                        <div className="flex flex-col gap-3">
                          {/* Badge elements */}
                          {movie.badges && movie.badges.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {movie.badges.map(b => {
                                if (b === "oscar_winner") return <span key={b} className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">🏆 Oscar Winner</span>;
                                if (b === "trending") return <span key={b} className="bg-orange-50 text-orange-700 border border-orange-200 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">🔥 Trending</span>;
                                if (b === "underrated") return <span key={b} className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">🛡️ Underrated</span>;
                                if (b === "cult_classic") return <span key={b} className="bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">🔮 Cult Classic</span>;
                                if (b === "mind_blowing") return <span key={b} className="bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">🤯 Mind Blowing</span>;
                                if (b === "hidden_gem") return <span key={b} className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">💎 Hidden Gem</span>;
                                return null;
                              })}
                            </div>
                          )}

                          {/* Match score bar */}
                          <div className="flex flex-col gap-1 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 mt-0.5">
                            <div className="flex justify-between items-center text-xs font-black">
                              <span className="text-orange-600 font-extrabold">{movie.matchScore || 90}% Match</span>
                              <span className="text-slate-400 font-semibold">{movie.matchScore >= 95 ? "Perfect Fit" : "High Match"}</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mt-1">
                              <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${movie.matchScore || 90}%` }} />
                            </div>
                            {movie.matchReasons && movie.matchReasons.length > 0 && (
                              <ul className="text-[10px] text-slate-500 font-bold flex flex-col gap-1 mt-2">
                                {movie.matchReasons.slice(0, 3).map((reason, idx) => (
                                  <li key={idx} className="flex items-center gap-1 text-left">
                                    <span className="text-orange-500 font-bold">✓</span> {reason}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>

                          {/* Why Recommended section */}
                          <div className="border-l-2 border-orange-500 bg-orange-50/40 p-3 rounded-r-xl text-[11px] text-orange-950 font-medium leading-relaxed mt-1 text-left">
                            <span className="font-extrabold text-orange-800 block mb-0.5">Why We Recommend It:</span>
                            <p className="line-clamp-2">{movie.whyRecommended || "Matches your profile preferences perfectly."}</p>
                          </div>

                          {/* Cast / Crew brief info */}
                          <div className="flex flex-col gap-1 mt-1 text-left">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cast & crew</span>
                            <div className="text-xs font-semibold text-slate-600">
                              <span className="text-slate-900 font-extrabold">Dir:</span> {movie.director} &middot; <span className="text-slate-900 font-extrabold">Stars:</span> {movie.cast?.slice(0, 3).join(", ")}
                            </div>
                          </div>

                          {/* Streaming Platforms */}
                          {movie.streamingPlatforms && movie.streamingPlatforms.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap mt-1">
                              <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Platforms:</span>
                              {movie.streamingPlatforms.map(p => (
                                <span key={p} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                                  {p}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Card footer action row */}
                        <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs mt-1">
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-50 text-emerald-700 font-extrabold px-2.5 py-1 rounded-full text-[10px]">{movie.moodMatch || `${Math.round(85 + (movie.imdbRating || 7) * 1.5)}%`} Match</span>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">Pop: {movie.popularityScore}%</span>
                          </div>

                          <div className="flex gap-1.5 items-center">
                            {/* Favorite toggle */}
                            <button
                              onClick={() => toggleFavorite(movie)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isFav
                                  ? "bg-rose-50 border-rose-200 text-rose-600"
                                  : "bg-white border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-slate-50"
                              }`}
                              title={isFav ? "Remove Favorite" : "Add Favorite"}
                            >
                              <svg className="w-4 h-4" fill={isFav ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>

                            {/* Watchlist toggle */}
                            <button
                              onClick={() => toggleWatchlist(movie)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                inWatch
                                  ? "bg-orange-50 border-orange-200 text-orange-600"
                                  : "bg-white border-slate-200 text-slate-400 hover:text-orange-600 hover:bg-slate-50"
                              }`}
                              title={inWatch ? "In Watchlist" : "Add to Watchlist"}
                            >
                              <svg className="w-4 h-4" fill={inWatch ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                            </button>

                            {/* Watched toggle */}
                            <button
                              onClick={() => toggleWatched(movie)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isWat
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                  : "bg-white border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-slate-50"
                              }`}
                              title={isWat ? "Mark Unwatched" : "Mark Watched & Rate"}
                            >
                              <svg className="w-4 h-4" fill={isWat ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </div>

      {/* ═══════ DETAIL MODAL ═══════ */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] animate-fade-in">

            {/* Backdrop image header */}
            <div className="relative h-64 sm:h-72 overflow-hidden bg-slate-950 flex-shrink-0">
              <div className={`absolute inset-0 ${getPosterGradient(selectedMovie.genres)} opacity-85`} />
              
              {selectedMovie.backdropUrl && !failedBackdrops[getMovieId(selectedMovie)] && (
                <img
                  src={selectedMovie.backdropUrl}
                  alt={selectedMovie.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-70"
                  onError={() => handleBackdropError(getMovieId(selectedMovie))}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent" />

              <button 
                onClick={() => setSelectedMovie(null)} 
                className="absolute right-4 top-4 z-20 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full w-9 h-9 flex items-center justify-center transition border border-white/10 cursor-pointer"
                title="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 z-10 flex gap-6 items-end">
                {/* Poster floating */}
                <div className="w-20 h-30 rounded-xl border-2 border-white/95 overflow-hidden shadow-lg bg-slate-900 flex-shrink-0 hidden sm:block">
                  {selectedMovie.posterUrl && !failedPosters[getMovieId(selectedMovie)] ? (
                    <img
                      src={selectedMovie.posterUrl}
                      alt={selectedMovie.title}
                      className="w-full h-full object-cover"
                      onError={() => handlePosterError(getMovieId(selectedMovie))}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-white/50 font-bold">POSTER</div>
                  )}
                </div>

                <div className="flex flex-col gap-2 text-white text-left">
                  <span className="bg-orange-500 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md self-start">{selectedMovie.type}</span>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-none mt-1">{selectedMovie.title}</h2>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {selectedMovie.genres?.map(g => (
                      <span key={g} className="bg-white/10 backdrop-blur-md text-white text-[10px] font-extrabold px-2 py-0.5 rounded border border-white/15">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body: 2-Column Split */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-8 bg-slate-50/20">
              
              {/* Left Column: Story, Trivia, Similar */}
              <div className="flex flex-col gap-6 text-left">
                
                {/* Synopsis */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Synopsis</span>
                  <p className="text-slate-700 leading-relaxed font-semibold text-[13px]">{selectedMovie.longDescription || selectedMovie.shortDescription}</p>
                </div>

                {/* Why Recommended */}
                {selectedMovie.whyRecommended && (
                  <div className="border-l-4 border-orange-500 bg-orange-50/60 p-4 rounded-r-2xl border border-orange-100/50">
                    <span className="text-[10px] text-orange-800 font-extrabold uppercase tracking-wider block mb-1">Why We Recommend This</span>
                    <p className="text-orange-950 font-medium leading-relaxed text-xs">{selectedMovie.whyRecommended}</p>
                  </div>
                )}

                {/* Reasons to Watch */}
                {selectedMovie.reasonsToWatch && selectedMovie.reasonsToWatch.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Reasons to Watch</span>
                    <ul className="flex flex-col gap-2">
                      {selectedMovie.reasonsToWatch.map((r, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 font-bold">
                          <span className="text-emerald-500 mt-0.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Trivia & Fun Facts */}
                {selectedMovie.funFacts && selectedMovie.funFacts.length > 0 && (
                  <div className="bg-slate-100/50 border border-slate-200/60 rounded-2xl p-5 flex flex-col gap-3">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                      {renderLightbulbIcon("w-4 h-4 text-slate-500")}
                      Trivia & Fun Facts
                    </span>
                    <ul className="flex flex-col gap-3">
                      {selectedMovie.funFacts.map((f, i) => (
                        <li key={i} className="text-xs text-slate-600 font-bold leading-relaxed relative pl-4">
                          <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-slate-400 rounded-full" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Similar Recommendations */}
                {selectedMovie.similarTitles && selectedMovie.similarTitles.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">You May Also Enjoy</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedMovie.similarTitles.map(title => (
                        <button 
                          key={title} 
                          onClick={() => handleSimilarMovieClick(title)} 
                          className="bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          {title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column: Metadata, User Logs */}
              <div className="flex flex-col gap-6 text-left">
                
                {/* Score & Platform glass card */}
                <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col gap-4 border border-slate-800">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">IMDb Score</span>
                      <span className="text-lg font-black text-amber-400 flex items-center gap-1.5 mt-0.5">
                        {renderStarIcon(true, "w-5 h-5 text-amber-400")}
                        {formatRating(selectedMovie.imdbRating)}
                      </span>
                    </div>

                    {selectedMovie.tmdbRating && (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TMDb Score</span>
                        <span className="text-lg font-black text-white flex items-center gap-1.5 mt-0.5">
                          {renderStarIcon(true, "w-5 h-5 text-white")}
                          {formatRating(selectedMovie.tmdbRating)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Availability</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMovie.streamingPlatforms && selectedMovie.streamingPlatforms.length > 0 ? (
                        selectedMovie.streamingPlatforms.map(p => (
                          <span key={p} className="bg-slate-800 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-slate-700">
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs italic">Unavailable/Not Cached</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personal Log Log */}
                <div className="border border-slate-200 bg-white rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Personal Log</span>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                      <span>My Rating:</span>
                      <span className="text-slate-900 font-extrabold bg-slate-100 px-2.5 py-0.5 rounded">★ {userRatings[getMovieId(selectedMovie)] || "Unrated"}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      step="1" 
                      value={userRatings[getMovieId(selectedMovie)] || 8} 
                      onChange={(e) => updateRating(getMovieId(selectedMovie), e.target.value)} 
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500" 
                    />
                  </div>

                  <textarea
                    placeholder="My private notes about this title..."
                    value={userNotes[getMovieId(selectedMovie)] || ""}
                    onChange={(e) => updateNote(getMovieId(selectedMovie), e.target.value)}
                    rows={2}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none font-medium"
                  />

                  <button 
                    onClick={() => toggleWatched(selectedMovie)} 
                    className={`w-full py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      watchedHistory.includes(getMovieId(selectedMovie)) 
                        ? "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700" 
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {watchedHistory.includes(getMovieId(selectedMovie)) ? "Marked as Watched" : "Mark as Watched"}
                  </button>
                </div>

                {/* Metadata Details Deck */}
                <div className="border border-slate-200 bg-white rounded-2xl p-5 flex flex-col gap-3.5 shadow-sm text-[11px] font-semibold text-slate-600">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">Production Metadata</span>
                  
                  <div className="flex flex-col gap-1.5 pb-2 border-b border-slate-100">
                    <span className="text-slate-900 font-extrabold">Director</span>
                    <span>{selectedMovie.director}</span>
                  </div>

                  <div className="flex flex-col gap-1.5 pb-2 border-b border-slate-100">
                    <span className="text-slate-900 font-extrabold">Cast</span>
                    <span>{selectedMovie.cast?.join(", ") || "N/A"}</span>
                  </div>

                  {selectedMovie.awards && (
                    <div className="flex flex-col gap-1.5 pb-2 border-b border-slate-100">
                      <span className="text-slate-900 font-extrabold">Awards</span>
                      <span className="text-emerald-700 font-bold">{selectedMovie.awards}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-900 font-extrabold">Country</span>
                    <span>{selectedMovie.country}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-900 font-extrabold">Runtime</span>
                    <span>{selectedMovie.runtime}m</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-900 font-extrabold">Year</span>
                    <span>{selectedMovie.releaseYear}</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
              <button 
                onClick={() => toggleFavorite(selectedMovie)} 
                className={`px-4.5 py-2.5 rounded-xl border text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  favorites.includes(getMovieId(selectedMovie)) 
                    ? "bg-rose-50 border-rose-200 text-rose-600" 
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <svg className="w-4 h-4" fill={favorites.includes(getMovieId(selectedMovie)) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {favorites.includes(getMovieId(selectedMovie)) ? "Favorited" : "Favorite"}
              </button>
              
              <button 
                onClick={() => toggleWatchlist(selectedMovie)} 
                className={`px-4.5 py-2.5 rounded-xl border text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  watchlist.includes(getMovieId(selectedMovie)) 
                    ? "bg-orange-600 border-orange-600 text-white" 
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <svg className="w-4 h-4" fill={watchlist.includes(getMovieId(selectedMovie)) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {watchlist.includes(getMovieId(selectedMovie)) ? "In Watchlist" : "Watchlist"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ═══════ FEEDBACK LOOP RATING PROMPT MODAL ═══════ */}
      {ratingPromptMovie && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 p-6 flex flex-col gap-6 animate-fade-in text-left">
            
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-black text-slate-950">Did you enjoy it?</h3>
              <p className="text-slate-800 font-extrabold text-sm">{ratingPromptMovie.title}</p>
              <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                Your rating trains the AI engine. We'll recommend similar matches for ratings of 7+, and filter them out for ratings of 5-.
              </p>
            </div>

            {/* Reaction Selector (Loved It, It Was Okay, Didn't Like It) */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Impression</span>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { key: "loved", label: "Loved It", rate: 9 },
                  { key: "okay", label: "It Was Okay", rate: 6 },
                  { key: "disliked", label: "Didn't Like It", rate: 3 }
                ].map(r => (
                  <button
                    key={r.key}
                    onClick={() => { setPromptReaction(r.key); setPromptRating(r.rate); }}
                    className={`p-4 border rounded-2xl flex flex-col items-center gap-2 font-bold text-xs transition cursor-pointer ${
                      promptReaction === r.key 
                        ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm" 
                        : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
                    }`}
                  >
                    {getQuizIcon(r.key, "w-8 h-8")}
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Visual 5-Star Ratings */}
            <div className="flex flex-col items-center gap-2 border-t border-b border-slate-100 py-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visual Rating Score</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const ratingVal = star * 2;
                  const isGold = promptRating >= ratingVal - 1;
                  return (
                    <button
                      key={star}
                      onClick={() => { setPromptRating(ratingVal); setPromptReaction(""); }}
                      className="focus:outline-none cursor-pointer hover:scale-110 transition p-1"
                    >
                      {renderStarIcon(isGold, "w-7 h-7")}
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-black text-slate-900 bg-slate-100 px-3.5 py-1 rounded-full mt-1.5 flex items-center gap-1">
                ★ {promptRating} / 10
              </span>
            </div>

            {/* Optional Notes */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Private thoughts (optional)</span>
              <textarea
                placeholder="What elements stood out to you? (Pacing, plot twists, direction...)"
                value={promptNote}
                onChange={(e) => setPromptNote(e.target.value)}
                rows={2}
                className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none font-medium"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setRatingPromptMovie(null);
                  setPromptNote("");
                  setPromptRating(8);
                  setPromptReaction("");
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                onClick={() => {
                  const id = getMovieId(ratingPromptMovie);
                  const updatedHistory = [...watchedHistory, id];
                  setWatchedHistory(updatedHistory);
                  save("movie_rec_history", updatedHistory);
                  updateStreak();
                  setRatingPromptMovie(null);
                  setPromptNote("");
                  setPromptReaction("");
                  showToast(`Marked "${ratingPromptMovie.title}" as Watched!`);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Skip Rating
              </button>
              
              <button
                onClick={() => {
                  const id = getMovieId(ratingPromptMovie);
                  const updatedHistory = [...watchedHistory, id];
                  setWatchedHistory(updatedHistory);
                  save("movie_rec_history", updatedHistory);

                  const updatedRatings = { ...userRatings, [id]: promptRating };
                  setUserRatings(updatedRatings);
                  save("movie_rec_ratings", updatedRatings);

                  if (promptNote.trim()) {
                    const updatedNotes = { ...userNotes, [id]: promptNote };
                    setUserNotes(updatedNotes);
                    save("movie_rec_notes", updatedNotes);
                  }

                  updateStreak();
                  setRatingPromptMovie(null);
                  setPromptNote("");
                  setPromptReaction("");
                  showToast(`Rated "${ratingPromptMovie.title}" ${promptRating}/10. Taste synchronized!`, "success");
                }}
                className="px-4 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 text-xs font-bold shadow-sm cursor-pointer"
              >
                Submit Rating
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* ═══════ TOAST ═══════ */}
      {toast.message && (
        <div className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-xs font-bold shadow-lg border text-white ${toast.type === "success" ? "bg-emerald-600 border-emerald-500" : toast.type === "warning" ? "bg-amber-600 border-amber-500" : toast.type === "error" ? "bg-red-600 border-red-500" : "bg-slate-900 border-slate-800"}`}>
          {toast.message}
        </div>
      )}

    </div>
  );
}

/* ═══════ MICRO-COMPONENTS ═══════ */

function StepPanel({ title, children }) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in text-left">
      <h3 className="text-lg font-black text-slate-950">{title}</h3>
      {children}
    </div>
  );
}
