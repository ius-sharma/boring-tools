"use client";

import React, { useState, useEffect, useRef } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

function toRad(v) {
  return (v * Math.PI) / 180;
}

function haversine([lat1, lon1], [lat2, lon2]) {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km, unit) {
  if (km == null) return "—";
  const value = unit === "mi" ? km * 0.621371 : km;
  return `${value.toFixed(1)} ${unit}`;
}

// sampleCities removed — using Nominatim suggestions instead

export default function DistanceBetweenCities() {
  const [cityA, setCityA] = useState("New York");
  const [cityB, setCityB] = useState("London");
  const [coordsA, setCoordsA] = useState(null);
  const [coordsB, setCoordsB] = useState(null);
  const [unit, setUnit] = useState("km");
  const [results, setResults] = useState(null);
  
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestA, setSuggestA] = useState([]);
  const [suggestB, setSuggestB] = useState([]);
  const [showSuggestA, setShowSuggestA] = useState(false);
  const [showSuggestB, setShowSuggestB] = useState(false);
  const aRef = useRef(null);
  const bRef = useRef(null);

  const geocode = async (city) => {
    const q = encodeURIComponent(city);
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=jsonv2&limit=1&addressdetails=1`;
    const res = await fetch(url);
    const json = await res.json();
    if (!json || !json[0]) return null;
    return { lat: Number(json[0].lat), lon: Number(json[0].lon) };
  };

  // Suggestions (debounced)
  useEffect(() => {
    if (!cityA || cityA.length < 3) {
      return;
    }
    const id = setTimeout(async () => {
      try {
        const q = encodeURIComponent(cityA);
        const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=jsonv2&limit=6&addressdetails=1`;
        const res = await fetch(url);
        const json = await res.json();
        setSuggestA(json || []);
        setShowSuggestA(true);
      } catch {
        setSuggestA([]);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [cityA]);

  useEffect(() => {
    if (!cityB || cityB.length < 3) {
      return;
    }
    const id = setTimeout(async () => {
      try {
        const q = encodeURIComponent(cityB);
        const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=jsonv2&limit=6&addressdetails=1`;
        const res = await fetch(url);
        const json = await res.json();
        setSuggestB(json || []);
        setShowSuggestB(true);
      } catch {
        setSuggestB([]);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [cityB]);

  // click outside to close suggestions
  useEffect(() => {
    function onDoc(e) {
      if (aRef.current && !aRef.current.contains(e.target)) setShowSuggestA(false);
      if (bRef.current && !bRef.current.contains(e.target)) setShowSuggestB(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const getRoadDistance = async (a, b) => {
    // Use public OSRM demo server for driving distance (meters)
    const url = `https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=false`;
    const res = await fetch(url);
    const json = await res.json();
    if (json && json.routes && json.routes[0] && typeof json.routes[0].distance === 'number') {
      return json.routes[0].distance / 1000; // km
    }
    return null;
  };

  const getTrainDistanceViaGoogle = async (a, b) => {
    const res = await fetch("/api/directions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ a, b }),
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    if (typeof json?.distanceMeters !== "number" || typeof json?.durationSeconds !== "number") {
      return null;
    }

    return {
      km: json.distanceMeters / 1000,
      hours: json.durationSeconds / 3600,
    };
  };

  const compute = async () => {
    setLoading(true);
    setResults(null);
    try {
      const a = coordsA || await geocode(cityA);
      const b = coordsB || await geocode(cityB);
      if (!a || !b) {
        setResults({ error: 'Could not geocode one or both cities' });
        setLoading(false);
        return;
      }
      setCoordsA(a);
      setCoordsB(b);

      const flightKm = haversine([a.lat, a.lon], [b.lat, b.lon]);

      // Road distance via OSRM
      const roadKm = await getRoadDistance(a, b);

      // Train distance: use Google server route when available, otherwise estimate from road
      const trainRoute = await getTrainDistanceViaGoogle(a, b);
      const trainKm = trainRoute?.km ?? (roadKm != null ? roadKm * 0.9 : null);

      // travel time estimates
      const flightTimeHr = flightKm / 900 + 1.5; // includes 1.5h airport overhead
      const roadTimeHr = (roadKm || flightKm) / 80; // avg 80 km/h
      const trainTimeHr = trainRoute?.hours ?? ((trainKm || roadKm || flightKm) / 120 + 0.5); // avg 120 km/h + 0.5h station

      const modes = [
        { mode: 'flight', km: flightKm, hours: flightTimeHr },
        { mode: 'road', km: roadKm, hours: roadTimeHr },
        { mode: 'train', km: trainKm, hours: trainTimeHr },
      ];

      // determine fastest by hours (ignore nulls)
      const fastest = modes.filter((m) => m.km != null).sort((a, b) => a.hours - b.hours)[0];

      setResults({ modes, fastest });
    } catch {
      setResults({ error: 'Failed to compute distances' });
    }
    setLoading(false);
  };

  // sample picker removed; suggestions handle selection

  const copyResult = async () => {
    if (!results || results.error) return;
    const parts = results.modes.map((m) => `${m.mode}: ${formatDistance(m.km, unit)} (${m.hours ? m.hours.toFixed(2) + ' h' : '—'})`);
    const text = `Distances between ${cityA} and ${cityB}: ${parts.join(' | ')}. Fastest: ${results.fastest ? results.fastest.mode : '—'}`;
    await navigator.clipboard.writeText(text);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-3xl border border-slate-200 flex flex-col gap-5">
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Distance Between Cities</h1>
          <p className="text-slate-500">Straight-line distance with a rough travel estimate</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div className="flex flex-col gap-3" ref={aRef}>
            <div className="text-sm text-slate-700">City A</div>
            <input
              className="w-full p-4 border border-slate-200 rounded-xl bg-white focus:outline-none"
              value={cityA}
              onChange={(e) => {
                const value = e.target.value;
                setCityA(value);
                setCoordsA(null);
                if (value.length < 3) {
                  setSuggestA([]);
                  setShowSuggestA(false);
                }
              }}
              placeholder="e.g., New York"
              onFocus={() => { if (suggestA.length) setShowSuggestA(true); }}
            />
            {showSuggestA && suggestA.length > 0 && (
              <ul className="bg-white rounded-lg shadow mt-1 max-h-56 overflow-auto border border-slate-200">
                {suggestA.map((s) => (
                  <li key={s.place_id} className="p-2 hover:bg-slate-100 cursor-pointer" onClick={() => { setCityA(s.display_name); setCoordsA({ lat: Number(s.lat), lon: Number(s.lon) }); setShowSuggestA(false); setSuggestA([]); }}>
                    <div className="text-sm font-medium">{s.name || s.display_name.split(',')[0]}</div>
                    <div className="text-xs text-slate-500">{s.display_name}</div>
                  </li>
                ))}
              </ul>
            )}
            {/* sample picker removed */}
          </div>

          <div className="flex flex-col gap-3" ref={bRef}>
            <div className="text-sm text-slate-700">City B</div>
            <input
              className="w-full p-4 border border-slate-200 rounded-xl bg-white focus:outline-none"
              value={cityB}
              onChange={(e) => {
                const value = e.target.value;
                setCityB(value);
                setCoordsB(null);
                if (value.length < 3) {
                  setSuggestB([]);
                  setShowSuggestB(false);
                }
              }}
              placeholder="e.g., London"
              onFocus={() => { if (suggestB.length) setShowSuggestB(true); }}
            />
            {showSuggestB && suggestB.length > 0 && (
              <ul className="bg-white rounded-lg shadow mt-1 max-h-56 overflow-auto border border-slate-200">
                {suggestB.map((s) => (
                  <li key={s.place_id} className="p-2 hover:bg-slate-100 cursor-pointer" onClick={() => { setCityB(s.display_name); setCoordsB({ lat: Number(s.lat), lon: Number(s.lon) }); setShowSuggestB(false); setSuggestB([]); }}>
                    <div className="text-sm font-medium">{s.name || s.display_name.split(',')[0]}</div>
                    <div className="text-xs text-slate-500">{s.display_name}</div>
                  </li>
                ))}
              </ul>
            )}
            {/* sample picker removed */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ThemedDropdown ariaLabel="Unit" value={unit} options={[{ value: 'km', label: 'Kilometers' }, { value: 'mi', label: 'Miles' }]} onChange={(v) => setUnit(v)} />
            <div />
            <button onClick={compute} disabled={loading} className="flex-1 border border-orange-500 text-orange-600 py-3 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition">{loading ? 'Computing...' : 'Compute Distances'}</button>
          </div>

          <div className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 text-center">
            {!results ? (
              <div className="text-slate-400">Results will appear here</div>
            ) : results.error ? (
              <div className="text-red-600">{results.error}</div>
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {results.modes.map((m) => (
                    <div key={m.mode} className="p-3 border rounded-lg bg-white/5">
                      <div className="text-sm text-slate-500 uppercase">{m.mode}</div>
                      <div className="text-xl font-bold mt-1">{formatDistance(m.km, unit)}</div>
                      <div className="text-sm text-slate-700">{m.hours ? `${(m.hours).toFixed(2)} h` : '—'}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-sm text-slate-700">Fastest: <strong>{results.fastest ? results.fastest.mode : '—'}</strong></div>

                <div className="mt-4 flex gap-3">
                  <button onClick={copyResult} className="flex-1 border rounded-lg py-2">Copy</button>
                  <button onClick={() => { setResults(null); setCoordsA(null); setCoordsB(null); }} className="flex-1 border rounded-lg py-2">Clear</button>
                </div>
              </div>
            )}
          </div>

          {showToast && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50">Result copied!</div>
          )}
        </div>
      </div>
    </div>
  );
}


