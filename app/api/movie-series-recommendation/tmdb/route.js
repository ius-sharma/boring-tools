import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { title, year, type } = await request.json();
    const apiKey = process.env.TMDB_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "TMDB API Key is not configured." }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const query = encodeURIComponent(title);
    
    // Select specific search endpoint if type is known, otherwise search multi
    let endpoint = "multi";
    if (type === "Movie" || type === "Documentary") {
      endpoint = "movie";
    } else if (type === "TV Series" || type === "Mini Series" || type === "Anime") {
      endpoint = "tv";
    }

    let url = `https://api.themoviedb.org/3/search/${endpoint}?api_key=${apiKey}&query=${query}&language=en-US&page=1`;
    if (year) {
      if (endpoint === "movie") {
        url += `&primary_release_year=${year}`;
      } else if (endpoint === "tv") {
        url += `&first_air_date_year=${year}`;
      }
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB search API responded with status: ${response.status}`);
    }
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // Find the match
      let bestMatch = data.results[0];
      
      // If we did a multi search, find the item matching our release year
      if (year && endpoint === "multi") {
        const matchingYear = data.results.find((item) => {
          const date = item.release_date || item.first_air_date || "";
          return date.startsWith(String(year));
        });
        if (matchingYear) {
          bestMatch = matchingYear;
        }
      }

      const posterPath = bestMatch.poster_path;
      const backdropPath = bestMatch.backdrop_path;
      const tmdbId = bestMatch.id;

      return NextResponse.json({
        posterUrl: posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null,
        backdropUrl: backdropPath ? `https://image.tmdb.org/t/p/w1280${backdropPath}` : null,
        tmdbId,
        title: bestMatch.title || bestMatch.name,
      });
    }

    return NextResponse.json({ error: "No matching results found." }, { status: 404 });
  } catch (error) {
    console.error("Error in TMDB proxy route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
