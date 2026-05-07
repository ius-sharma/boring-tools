export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function parseCoords(input) {
  if (!input || typeof input !== "object") return null;

  const lat = toNumber(input.lat);
  const lon = toNumber(input.lon);

  if (lat === null || lon === null) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;

  return { lat, lon };
}

export async function POST(request) {
  const apiKey = process.env.GOOGLE_DIRECTIONS_KEY;

  if (!apiKey) {
    return Response.json({ error: "GOOGLE_DIRECTIONS_KEY is not configured" }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const origin = parseCoords(body?.a);
  const destination = parseCoords(body?.b);

  if (!origin || !destination) {
    return Response.json({ error: "Missing or invalid coordinates" }, { status: 400 });
  }

  const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
  url.searchParams.set("origin", `${origin.lat},${origin.lon}`);
  url.searchParams.set("destination", `${destination.lat},${destination.lon}`);
  url.searchParams.set("mode", "transit");
  url.searchParams.set("transit_mode", "train");
  url.searchParams.set("units", "metric");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());

  if (!response.ok) {
    return Response.json({ error: "Google Directions request failed" }, { status: 502 });
  }

  const data = await response.json();
  const route = data?.routes?.[0];
  const leg = route?.legs?.[0];
  const distanceMeters = leg?.distance?.value;
  const durationSeconds = leg?.duration?.value;

  if (typeof distanceMeters !== "number" || typeof durationSeconds !== "number") {
    return Response.json({
      error: "No train route returned by Google Directions",
      status: data?.status || "UNKNOWN",
      distanceMeters: null,
      durationSeconds: null,
    });
  }

  return Response.json({
    distanceMeters,
    durationSeconds,
    status: data.status || "OK",
  });
}