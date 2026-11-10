import React from "react";
import { Users, Briefcase, Clock, AlertCircle } from "lucide-react";

export default function RealtorStatsBar({ leads, pendingFollowUps }) {
  const today = new Date().toISOString().split("T")[0];
  const activeCount = leads.filter((l) =>
    ["proposal_sent", "replied", "demo_created", "won"].includes(l.status)
  ).length;
  const wonCount = leads.filter((l) => l.status === "won").length;
  const urgentCount = pendingFollowUps.filter((f) => f.follow_up_date <= today).length;

  const cards = [
    {
      label: "Realtor Leads",
      value: leads.length,
      sub: `${leads.filter((l) => l.phone || l.contact_email).length} with direct contact`,
      icon: Users,
      color: "text-amber-400"
    },
    {
      label: "Active Projects & Pipeline",
      value: activeCount,
      sub: `${wonCount} won · ${leads.filter((l) => l.demo_html).length} demos built`,
      icon: Briefcase,
      color: "text-emerald-400"
    },
    {
      label: "Pending Follow-Ups",
      value: pendingFollowUps.length,
      sub: `${urgentCount} due today or overdue`,
      icon: Clock,
      color: "text-sky-400"
    },
    {
      label: "Needs Attention Today",
      value: urgentCount,
      sub: urgentCount > 0 ? "Action required now" : "All caught up",
      icon: AlertCircle,
      color: urgentCount > 0 ? "text-rose-400" : "text-slate-400"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className="bg-[#131824] border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">{c.label}</span>
              <Icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-[11px] text-slate-500 mt-1">{c.sub}</div>
          </div>
        );
      })}
    </div>
  );
}