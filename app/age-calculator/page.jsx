"use client";
import { useState } from "react";

export default function AgeCalculator() {
  const [dob, setDob] = useState("");
  const [age, setAge] = useState(null);
  const [error, setError] = useState("");

  const calculateAge = () => {
    if (!dob) {
      setError("Please select your date of birth");
      setAge(null);
      return;
    }

    const birthDate = new Date(dob);
    const today = new Date();

    if (birthDate > today) {
      setError("Date of birth cannot be in the future");
      setAge(null);
      return;
    }

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      ).getDate();

      days += prevMonth;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    setError("");
    setAge({ years, months, days });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-xl border border-slate-200 flex flex-col gap-6">
        <div className="flex flex-col gap-1 items-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Age Calculator</h1>
          <p className="text-slate-500 text-base">Calculate exact age in years, months, and days</p>
        </div>

        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full p-4 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition text-base text-slate-900"
        />

        <button
          onClick={calculateAge}
          className="w-full border border-orange-500 text-orange-600 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-orange-500 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          Calculate Age
        </button>

        {error && <p className="text-red-600 text-sm -mt-2">{error}</p>}

        {age ? (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <h2 className="text-2xl font-bold text-slate-900">{age.years}</h2>
              <p className="text-sm text-slate-500">Years</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <h2 className="text-2xl font-bold text-slate-900">{age.months}</h2>
              <p className="text-sm text-slate-500">Months</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <h2 className="text-2xl font-bold text-slate-900">{age.days}</h2>
              <p className="text-sm text-slate-500">Days</p>
            </div>
          </div>
        ) : (
          <div className="w-full p-4 border border-dashed border-slate-100 rounded-xl bg-slate-50 text-slate-300 text-base min-h-[96px] flex items-center justify-center select-none">
            Your age result will appear here
          </div>
        )}
      </div>

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
      `}</style>
    </div>
  );
}


