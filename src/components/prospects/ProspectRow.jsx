import React from "react";
import { Link } from "react-router-dom";
import { Trash2, ExternalLink } from "lucide-react";

const STATUSES = [
  { value: "new", label: "New" },
  { value: "proposal_sent", label: "Proposal Ready" },
  { value: "demo_created", label: "Demo Ready" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" }
];

export default function ProspectRow({ prospect, onStatusChange, onDelete }) {
  const score = prospect.opportunity_score || 0;
  const scoreColor = score >= 75 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-slate-400";

  return (
    <tr className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/20 transition-colors">
      <td className="px-5 py-3.5">
        <div className="font-medium text-slate-200">{prospect.business_name}</div>
        <div className="text-xs text-slate-500">{prospect.industry}</div>
      </td>
      <td className="px-5 py-3.5 text-slate-400">{prospect.location}</td>
      <td className={`px-5 py-3.5 font-bold ${scoreColor}`}>{score}</td>
      <td className="px-5 py-3.5">
        <select
          value={prospect.status || "new"}
          onChange={(e) => onStatusChange(prospect.id, e.target.value)}
          className="bg-[#0B0E14] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
        >
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-2">
          <Link to={`/prospect/${prospect.id}`} className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors" title="Open">
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button onClick={() => onDelete(prospect.id)} className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}