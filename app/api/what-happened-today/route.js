import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Fetches historical data from byabbe.se API (which harvests Wikipedia)
 * Supports categories: events, births, deaths
 */
async function fetchHistoricalData(month, day, category) {
  const validCategories = ["events", "births", "deaths"];
  const cat = validCategories.includes(category) ? category : "events";
  
  try {
    const url = `https://byabbe.se/on-this-day/${month}/${day}/${cat}.json`;
    const response = await fetch(url, {
      headers: { "User-Agent": "BoringTools/1.0 (https://github.com/ius-sharma/boring-tools)" },
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Map the response to a consistent format
    // byabbe.se returns { month, day, events: [...] } or { births: [...] } etc.
    const items = data[cat] || [];
    
    return items.map(item => ({
      year: item.year,
      text: item.description,
      wikipedia: item.wikipedia?.[0]?.wikipedia || ""
    }));
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return null;
  }
}

function getLocalHistoricalEvents(month, day) {
  const historicalDB = {
    "1/1": [
      { year: "1970", text: "Unix epoch begins." },
      { year: "1863", text: "Emancipation Proclamation takes effect." },
      { year: "1502", text: "Portuguese navigator Gaspar Corte-Real explores coast of Newfoundland." },
    ],
    "5/12": [
      { year: "2008", text: "Sichuan earthquake in China kills tens of thousands." },
      { year: "1949", text: "Israel joins UN as a member state." },
      { year: "1520", text: "Pope Leo X excommunicates Martin Luther." },
    ],
    "5/14": [
      { year: "1948", text: "Israel declares independence as the British Mandate for Palestine ends." },
      { year: "1804", text: "The Lewis and Clark Expedition departs from Camp Dubois to begin their historic journey to the Pacific Ocean." },
      { year: "1796", text: "Edward Jenner administers the first smallpox vaccination." },
    ],
    "7/4": [
      { year: "1776", text: "United States Declaration of Independence adopted." },
      { year: "1865", text: "Confederate General Robert E. Lee surrenders." },
      { year: "1997", text: "Pathfinder rover lands on Mars." },
    ],
    "12/25": [
      { year: "1991", text: "Soviet Union officially ceases to exist." },
      { year: "1642", text: "Isaac Newton is born." },
      { year: "800", text: "Charlemagne is crowned Holy Roman Emperor." },
    ],
  };

  const key = `${month}/${day}`;
  return historicalDB[key] || [
    { year: `${month}/${day}`, text: "Historical events data for this date is not available in our local database." },
  ];
}

export async function POST(request) {
  try {
    const body = await request.json();
    const now = new Date();
    const month = Math.max(1, Math.min(12, parseInt(body?.month) || now.getMonth() + 1));
    const day = Math.max(1, Math.min(31, parseInt(body?.day) || now.getDate()));
    const category = body?.category || "events";

    let events = null;
    
    if (category === "all") {
      // If "all" is requested, we'll fetch events as default or could fetch all 3 in parallel
      // For performance and simplicity, let's fetch events but we could expand this
      events = await fetchHistoricalData(month, day, "events");
    } else {
      events = await fetchHistoricalData(month, day, category);
    }

    if (!events || events.length === 0) {
      return NextResponse.json(
        {
          events: getLocalHistoricalEvents(month, day),
          source: "local",
          error: "Could not fetch live data, showing sample events",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ 
      events: events.slice(0, 50), // Limit to top 50 for performance
      source: "wikipedia",
      error: null 
    }, { status: 200 });
    
  } catch (error) {
    const now = new Date();
    return NextResponse.json(
      {
        events: getLocalHistoricalEvents(now.getMonth() + 1, now.getDate()),
        source: "local",
        error: "Failed to process request, showing sample events",
      },
      { status: 200 }
    );
  }
}
