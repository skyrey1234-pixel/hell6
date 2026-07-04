import React from "react";
import { Filter } from "lucide-react";

export default function ProspectFilters({ industries, industry, onIndustryChange, sortBy, onSortChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Filter className="w-4 h-4 text-slate-500" />
      <select
        value={industry}
        onChange={(e) => onIndustryChange(e.target.value)}
        className="bg-[#131824] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
      >
        <option value="all">All industries</option>
        {industries.map((i) => <option key={i} value={i}>{i}</option>)}
      </select>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="bg-[#131824] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
      >
        <option value="score">Highest AI impact first</option>
        <option value="newest">Newest first</option>
      </select>
    </div>
  );
}