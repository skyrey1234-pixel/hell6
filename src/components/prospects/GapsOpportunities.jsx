import React from "react";
import { AlertTriangle, Lightbulb } from "lucide-react";

export default function GapsOpportunities({ prospect }) {
  return (
    <div className="grid md:grid-cols-2 gap-5 mb-8">
      <div className="bg-[#131824] border border-slate-800 rounded-2xl p-5">
        <h2 className="flex items-center gap-2 font-semibold text-rose-400 mb-4">
          <AlertTriangle className="w-4 h-4" /> What they're lacking
        </h2>
        <ul className="space-y-2.5">
          {(prospect.gaps || []).map((g, i) => (
            <li key={i} className="text-sm text-slate-300 flex gap-2">
              <span className="text-rose-400/60 mt-0.5">•</span>{g}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-[#131824] border border-slate-800 rounded-2xl p-5">
        <h2 className="flex items-center gap-2 font-semibold text-emerald-400 mb-4">
          <Lightbulb className="w-4 h-4" /> AI opportunities
        </h2>
        <ul className="space-y-2.5">
          {(prospect.ai_opportunities || []).map((o, i) => (
            <li key={i} className="text-sm text-slate-300 flex gap-2">
              <span className="text-emerald-400/60 mt-0.5">•</span>{o}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}