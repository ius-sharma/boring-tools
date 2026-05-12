import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getWikipediaEvents(month, day) {
  try {
    // Using Wikipedia API to get events on a specific date
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&explaintext=true&titles=${month}_${day}`;
    
    const response = await fetch(url, {
      headers: { "User-Agent": "BoringTools/1.0" },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const pages = data.query?.pages || {};
    const firstPage = Object.values(pages)[0];
    
    if (!firstPage?.extract) {
      return getLocalHistoricalEvents(month, day);
    }

    // Parse Wikipedia extract into events
    const text = firstPage.extract;
    const eventLines = text.split("\n").filter((line) => line.trim().length > 0);
    
    return eventLines.slice(0, 10).map((line, idx) => ({
      year: `${month}/${day}`,
      text: line.substring(0, 150),
      html: null,
    }));
  } catch {
    return getLocalHistoricalEvents(month, day);
  }
}

function getLocalHistoricalEvents(month, day) {
  // Sample historical events database
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
    { year: `${month}/${day}`, text: "Historical events data for this date is not available." },
  ];
}

export async function POST(request) {
  try {
    const body = await request.json();
    const month = Math.max(1, Math.min(12, parseInt(body?.month) || new Date().getMonth() + 1));
    const day = Math.max(1, Math.min(31, parseInt(body?.day) || new Date().getDate()));
    const category = body?.category || "all";

    const events = await getWikipediaEvents(month, day);

    if (!events || events.length === 0) {
      return NextResponse.json(
        {
          events: getLocalHistoricalEvents(month, day),
          error: "Using sample historical data",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ events, error: null }, { status: 200 });
  } catch (error) {
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();
    return NextResponse.json(
      {
        events: getLocalHistoricalEvents(month, day),
        error: "Failed to fetch from Wikipedia, showing sample events",
      },
      { status: 200 }
    );
  }
}
