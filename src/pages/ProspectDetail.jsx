import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Globe, Phone, MapPin } from "lucide-react";
import StatusBadge from "@/components/prospects/StatusBadge";
import GapsOpportunities from "@/components/prospects/GapsOpportunities";
import ProposalSection from "@/components/prospects/ProposalSection";
import DemoSection from "@/components/prospects/DemoSection";
import EnrichContact from "@/components/prospects/EnrichContact";
import NotesSection from "@/components/prospects/NotesSection";
import SendToClient from "@/components/prospects/SendToClient";
import TextPitch from "@/components/prospects/TextPitch";
import QuickPitch from "@/components/prospects/QuickPitch";
import ContentIdeas from "@/components/prospects/ContentIdeas";

export default function ProspectDetail() {
  const { id } = useParams();
  const [prospect, setProspect] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const p = await base44.entities.Prospect.get(id);
    setProspect(p);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }
  if (!prospect) {
    return <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center text-slate-400">Prospect not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> All prospects
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{prospect.business_name}</h1>
            <p className="text-slate-400 mt-1">{prospect.industry}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={prospect.status} />
            <div className="text-right">
              <div className="text-3xl font-bold text-amber-400">{prospect.opportunity_score || 0}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Opportunity</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-6">
          {prospect.address && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{prospect.address}</span>}
          {prospect.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{prospect.phone}</span>}
          {prospect.website && (
            <a href={prospect.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-amber-400 hover:underline">
              <Globe className="w-3.5 h-3.5" />{prospect.website}
            </a>
          )}
        </div>

        {prospect.description && <p className="text-slate-300 leading-relaxed mb-8">{prospect.description}</p>}

        <QuickPitch prospect={prospect} onUpdated={load} />
        <SendToClient prospect={prospect} onUpdated={load} />
        <TextPitch prospect={prospect} onUpdated={load} />
        <EnrichContact prospect={prospect} onUpdated={load} />
        <GapsOpportunities prospect={prospect} />
        <ProposalSection prospect={prospect} onUpdated={load} />
        <ContentIdeas prospect={prospect} onUpdated={load} />
        <DemoSection prospect={prospect} onUpdated={load} />
        <NotesSection key={prospect.notes || "notes"} prospect={prospect} onUpdated={load} />
      </div>
    </div>
  );
}