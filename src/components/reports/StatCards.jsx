import React from "react";
import { Users, Send, MessageSquareReply, Trophy } from "lucide-react";

export default function StatCards({ totalProspects, sent, engaged, won }) {
  const rate = sent > 0 ? Math.round((engaged / sent) * 100) : 0;
  const cards = [
    { label: "Total Prospects", value: totalProspects, icon: Users, color: "text-slate-300" },
    { label: "Proposals Sent", value: sent, icon: Send, color: "text-violet-400" },
    { label: "Leads Engaged", value: `${engaged} (${rate}%)`, icon: MessageSquareReply, color: "text-emerald-400" },
    { label: "Deals Won", value: won, icon: Trophy, color: "text-amber-400" }
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards.map((c) => (
        <div key={c.label} className="bg-[#131824] border border-slate-800 rounded-2xl p-5">
          <c.icon className={`w-4 h-4 mb-3 ${c.color}`} />
          <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
          <div className="text-[11px] text-slate-500 uppercase tracking-wider mt-1">{c.label}</div>
        </div>
      ))}
    </div>
  );
}