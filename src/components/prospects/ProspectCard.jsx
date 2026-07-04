import React from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowUpRight } from "lucide-react";
import StatusBadge from "@/components/prospects/StatusBadge";

export default function ProspectCard({ prospect }) {
  const score = prospect.opportunity_score || 0;
  const scoreColor = score >= 75 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-slate-400";

  return (
    <Link
      to={`/prospect/${prospect.id}`}
      className="group bg-[#131824] border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-100 leading-snug">{prospect.business_name}</h3>
          <p className="text-xs text-slate-500 mt-1">{prospect.industry}</p>
        </div>
        <div className={`text-2xl font-bold ${scoreColor}`}>{score}</div>
      </div>
      <p className="text-sm text-slate-400 line-clamp-2">{prospect.description}</p>
      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="w-3 h-3" /> {prospect.location}
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={prospect.status} />
          <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
        </div>
      </div>
    </Link>
  );
}