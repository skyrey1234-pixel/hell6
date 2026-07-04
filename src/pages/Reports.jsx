import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft, BarChart3 } from "lucide-react";
import StatCards from "@/components/reports/StatCards";
import IndustryChart from "@/components/reports/IndustryChart";

const SENT_STATUSES = ["proposal_sent", "replied", "won", "lost"];
const ENGAGED_STATUSES = ["replied", "won"];

export default function Reports() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Prospect.list("-created_date", 500).then((data) => {
      setProspects(data);
      setLoading(false);
    });
  }, []);

  const isSent = (p) => SENT_STATUSES.includes(p.status);
  const isEngaged = (p) => ENGAGED_STATUSES.includes(p.status) || !!p.last_reply;

  const sent = prospects.filter(isSent);
  const engaged = prospects.filter((p) => isSent(p) && isEngaged(p));
  const won = prospects.filter((p) => p.status === "won");

  const byIndustry = {};
  for (const p of sent) {
    const key = p.industry || "Unknown";
    if (!byIndustry[key]) byIndustry[key] = { industry: key, sent: 0, engaged: 0 };
    byIndustry[key].sent += 1;
    if (isEngaged(p)) byIndustry[key].engaged += 1;
  }
  const industryData = Object.values(byIndustry)
    .map((d) => ({ ...d, rate: d.sent > 0 ? Math.round((d.engaged / d.sent) * 100) : 0 }))
    .sort((a, b) => b.engaged - a.engaged || b.sent - a.sent);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight mb-8">
          <BarChart3 className="w-7 h-7 text-amber-400" /> Outreach Reports
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-700 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : sent.length === 0 ? (
          <p className="text-center py-16 text-slate-500 text-sm">No proposals sent yet — reports will appear once you start your outreach.</p>
        ) : (
          <>
            <StatCards
              totalProspects={prospects.length}
              sent={sent.length}
              engaged={engaged.length}
              won={won.length}
            />
            <IndustryChart data={industryData} />
          </>
        )}
      </div>
    </div>
  );
}