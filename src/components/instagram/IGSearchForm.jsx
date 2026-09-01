import React, { useState } from "react";
import { Search, Loader2 } from "lucide-react";

export default function IGSearchForm({ onSearch, searching }) {
  const [niche, setNiche] = useState("");
  const [location, setLocation] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (niche.trim()) onSearch(niche.trim(), location.trim());
  };

  return (
    <form onSubmit={submit} className="bg-[#131824] border border-slate-800 rounded-2xl p-5 mb-8 flex flex-wrap items-center gap-2">
      <input
        value={niche}
        onChange={(e) => setNiche(e.target.value)}
        placeholder="Niche (e.g. luxury realtors, first-time buyer agents, house flippers)"
        className="flex-1 min-w-[220px] bg-[#0B0E14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-pink-500/50"
      />
      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location (optional)"
        className="w-48 bg-[#0B0E14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-pink-500/50"
      />
      <button
        type="submit"
        disabled={searching || !niche.trim()}
        className="flex items-center gap-1.5 text-sm font-semibold bg-pink-500 hover:bg-pink-400 disabled:opacity-50 text-white rounded-lg px-4 py-2 transition-colors"
      >
        {searching ? <><Loader2 className="w-4 h-4 animate-spin" /> Searching…</> : <><Search className="w-4 h-4" /> Find Accounts</>}
      </button>
      {searching && <span className="w-full text-xs text-slate-500">Searching Instagram for active real estate pros in this niche — takes about 20 seconds.</span>}
    </form>
  );
}