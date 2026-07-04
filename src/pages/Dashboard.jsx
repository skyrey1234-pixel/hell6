import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SearchForm from "@/components/prospects/SearchForm";
import ProspectCard from "@/components/prospects/ProspectCard";
import { Sparkles, KanbanSquare } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const loadProspects = async () => {
    const data = await base44.entities.Prospect.list("-created_date", 100);
    setProspects(data);
    setLoading(false);
  };

  useEffect(() => { loadProspects(); }, []);

  const handleSearch = async ({ location, industry }) => {
    setSearching(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Find 6 real local small-to-medium businesses in ${location}${industry ? ` in the ${industry} industry` : " across various industries"} that would be strong candidates for AI optimization consulting services. Prefer businesses with weak or no digital presence, outdated websites, or manual processes.

For each business provide: name, industry, full address, phone number if known, website URL if they have one (empty string if not), a 2-3 sentence description of the company, a list of 3-5 specific things they are lacking (e.g. no online booking, outdated website, no chatbot, manual scheduling, no review management), a list of 3-5 specific AI solutions that could help them (be concrete, e.g. "AI chatbot for appointment booking", "automated review response system"), and an opportunity score from 1-100 rating how good a consulting prospect they are.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          businesses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                industry: { type: "string" },
                address: { type: "string" },
                phone: { type: "string" },
                website: { type: "string" },
                description: { type: "string" },
                gaps: { type: "array", items: { type: "string" } },
                ai_opportunities: { type: "array", items: { type: "string" } },
                opportunity_score: { type: "number" }
              }
            }
          }
        }
      }
    });
    const records = (result.businesses || []).map((b) => ({
      business_name: b.name,
      industry: b.industry,
      location,
      address: b.address,
      phone: b.phone,
      website: b.website,
      description: b.description,
      gaps: b.gaps,
      ai_opportunities: b.ai_opportunities,
      opportunity_score: b.opportunity_score,
      status: "new"
    }));
    if (records.length) await base44.entities.Prospect.bulkCreate(records);
    await loadProspects();
    setSearching(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-medium tracking-widest uppercase">
              <Sparkles className="w-4 h-4" /> AI Consulting Prospector
            </div>
            <Link to="/pipeline" className="flex items-center gap-2 text-sm text-slate-300 hover:text-amber-400 border border-slate-700 hover:border-amber-500/40 rounded-xl px-4 py-2 transition-colors">
              <KanbanSquare className="w-4 h-4" /> Pipeline
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Find your next client.</h1>
          <p className="text-slate-400 mt-3 max-w-xl">Discover local businesses that need AI optimization, see exactly what they're lacking, and generate proposals and demos in one click.</p>
        </div>

        <SearchForm onSearch={handleSearch} searching={searching} />

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-700 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : prospects.length === 0 ? (
          <div className="text-center py-20 text-slate-500">No prospects yet — run a search above to find local businesses.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {prospects.map((p) => <ProspectCard key={p.id} prospect={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}