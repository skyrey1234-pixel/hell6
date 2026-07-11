import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SearchForm from "@/components/prospects/SearchForm";
import ProspectCard from "@/components/prospects/ProspectCard";
import KanbanBoard from "@/components/prospects/KanbanBoard";
import ProspectFilters from "@/components/prospects/ProspectFilters";
import HitList from "@/components/prospects/HitList";
import { Sparkles, KanbanSquare, LayoutGrid, Columns3, LayoutTemplate, BarChart3, Instagram as InstagramIcon, Music, Target, Clock, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const FAITH_QUOTES = [
  "For I know the plans I have for you — plans to prosper you. — Jeremiah 29:11",
  "Commit to the Lord whatever you do, and He will establish your plans. — Proverbs 16:3",
  "The blessing of the Lord brings wealth, without painful toil for it. — Proverbs 10:22",
  "Whatever you do, work at it with all your heart, as working for the Lord. — Colossians 3:23",
  "Be strong and courageous. Do not be afraid; do not be discouraged. — Joshua 1:9",
  "Trust in the Lord with all your heart and lean not on your own understanding. — Proverbs 3:5",
  "The Lord will make you the head, not the tail. — Deuteronomy 28:13"
];

export default function Dashboard() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [view, setView] = useState("cards");
  const [tab, setTab] = useState("search");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score");

  const dailyQuote = FAITH_QUOTES[new Date().getDay()];
  const industries = [...new Set(prospects.map((p) => p.industry).filter(Boolean))].sort();
  const visibleProspects = prospects
    .filter((p) => industryFilter === "all" || p.industry === industryFilter)
    .sort((a, b) => sortBy === "score" ? (b.opportunity_score || 0) - (a.opportunity_score || 0) : 0);

  const handleStatusChange = async (id, status) => {
    setProspects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    await base44.entities.Prospect.update(id, { status });
  };

  const loadProspects = async () => {
    const data = await base44.entities.Prospect.list("-created_date", 100);
    setProspects(data);
    setLoading(false);
  };

  useEffect(() => { loadProspects(); }, []);

  const handleSearch = async ({ location, industry }) => {
    setSearching(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Find 6 real local small-to-medium businesses in ${location}${industry ? ` in the ${industry} industry` : " across various industries"} that would be strong candidates for AI optimization consulting services from REYTRINIDADco. Prefer businesses with weak or no digital presence, outdated websites, or manual processes that are clearly losing leads or money.
For each business provide: name, industry, full address, phone number if known, website URL if they have one (empty string if not), a 2-3 sentence description of the company, a list of 3-5 specific things they are lacking (e.g. no online booking, outdated website, no chatbot, manual scheduling, no review management, no follow-up system), a list of 3-5 specific AI solutions that could help them (be concrete, e.g. "AI chatbot for appointment booking", "automated review response system", "AI voice receptionist for missed calls"), and an opportunity score from 1-100 rating how good a consulting prospect they are.`,
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
        {/* Header with REYTRINIDADco branding */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-bold tracking-widest uppercase">
                <Sparkles className="w-4 h-4" /> REYTRINIDADco
              </div>
              <span className="text-slate-600 text-xs">|</span>
              <span className="text-slate-500 text-xs">AI Optimization Consulting — Jacksonville, FL</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link to="/artist" className="flex items-center gap-2 text-sm text-slate-300 hover:text-purple-400 border border-slate-700 hover:border-purple-500/40 rounded-xl px-4 py-2 transition-colors">
                <Music className="w-4 h-4" /> Artist
              </Link>
              <Link to="/instagram" className="flex items-center gap-2 text-sm text-slate-300 hover:text-pink-400 border border-slate-700 hover:border-pink-500/40 rounded-xl px-4 py-2 transition-colors">
                <InstagramIcon className="w-4 h-4" /> Instagram
              </Link>
              <Link to="/followups" className="flex items-center gap-2 text-sm text-slate-300 hover:text-sky-400 border border-slate-700 hover:border-sky-500/40 rounded-xl px-4 py-2 transition-colors">
                <Clock className="w-4 h-4" /> Follow-Ups
              </Link>
              <Link to="/reports" className="flex items-center gap-2 text-sm text-slate-300 hover:text-amber-400 border border-slate-700 hover:border-amber-500/40 rounded-xl px-4 py-2 transition-colors">
                <BarChart3 className="w-4 h-4" /> Reports
              </Link>
              <Link to="/templates" className="flex items-center gap-2 text-sm text-slate-300 hover:text-amber-400 border border-slate-700 hover:border-amber-500/40 rounded-xl px-4 py-2 transition-colors">
                <LayoutTemplate className="w-4 h-4" /> Templates
              </Link>
              <Link to="/pipeline" className="flex items-center gap-2 text-sm text-slate-300 hover:text-amber-400 border border-slate-700 hover:border-amber-500/40 rounded-xl px-4 py-2 transition-colors">
                <KanbanSquare className="w-4 h-4" /> Pipeline
              </Link>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Find your next client.</h1>
          <p className="text-slate-400 mt-3 max-w-xl">Discover local businesses that need AI optimization, see exactly what they're lacking, and generate proposals and demos in one click.</p>

          {/* Daily faith quote */}
          <div className="mt-4 bg-amber-400/5 border border-amber-500/20 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-400/80 italic">{dailyQuote}</p>
          </div>
        </div>

        {/* Tab switcher: Search vs Hit List */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("search")}
            className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors ${tab === "search" ? "bg-amber-400 text-slate-950" : "bg-[#131824] border border-slate-800 text-slate-300 hover:text-amber-400"}`}
          >
            <Zap className="w-4 h-4" /> AI Search
          </button>
          <button
            onClick={() => setTab("hitlist")}
            className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors ${tab === "hitlist" ? "bg-amber-400 text-slate-950" : "bg-[#131824] border border-slate-800 text-slate-300 hover:text-amber-400"}`}
          >
            <Target className="w-4 h-4" /> My Hit List
          </button>
        </div>

        {tab === "hitlist" ? (
          <HitList onImport={loadProspects} />
        ) : (
          <>
            <SearchForm onSearch={handleSearch} searching={searching} />
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-slate-700 border-t-amber-400 rounded-full animate-spin" />
              </div>
            ) : prospects.length === 0 ? (
              <div className="text-center py-20 text-slate-500">No prospects yet — run a search above to find local businesses.</div>
            ) : (
              <div className="mt-10">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <ProspectFilters
                    industries={industries}
                    industry={industryFilter}
                    onIndustryChange={setIndustryFilter}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                  />
                  <div className="inline-flex border border-slate-700 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setView("cards")}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 transition-colors ${view === "cards" ? "bg-amber-400 text-slate-950 font-semibold" : "text-slate-400 hover:text-slate-200"}`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" /> Cards
                    </button>
                    <button
                      onClick={() => setView("board")}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 transition-colors ${view === "board" ? "bg-amber-400 text-slate-950 font-semibold" : "text-slate-400 hover:text-slate-200"}`}
                    >
                      <Columns3 className="w-3.5 h-3.5" /> Board
                    </button>
                  </div>
                </div>
                {view === "cards" ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {visibleProspects.map((p) => <ProspectCard key={p.id} prospect={p} />)}
                  </div>
                ) : (
                  <KanbanBoard prospects={visibleProspects} onStatusChange={handleStatusChange} />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
