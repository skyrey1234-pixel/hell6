import React, { useState } from "react";
import { Search, Loader2 } from "lucide-react";

export default function SearchForm({ onSearch, searching }) {
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!location.trim() || searching) return;
    onSearch({ location: location.trim(), industry: industry.trim() });
  };

  return (
    <form onSubmit={submit} className="bg-[#131824] border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row gap-3">
      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="City or area (e.g. Austin, TX)"
        className="flex-1 bg-[#0B0E14] border border-slate-800 rounded-xl px-4 py-3 text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
      />
      <input
        value={industry}
        onChange={(e) => setIndustry(e.target.value)}
        placeholder="Type (optional — e.g. solo realtors, brokerages, property managers)"
        className="flex-1 bg-[#0B0E14] border border-slate-800 rounded-xl px-4 py-3 text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
      />
      <button
        type="submit"
        disabled={searching || !location.trim()}
        className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-semibold rounded-xl px-6 py-3 text-sm transition-colors"
      >
        {searching ? <><Loader2 className="w-4 h-4 animate-spin" /> Scouting realtors…</> : <><Search className="w-4 h-4" /> Find Prospects</>}
      </button>
    </form>
  );
}