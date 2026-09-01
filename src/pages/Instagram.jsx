import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft, Instagram as InstagramIcon } from "lucide-react";
import IGSearchForm from "@/components/instagram/IGSearchForm";
import IGLeadCard from "@/components/instagram/IGLeadCard";

export default function Instagram() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    const data = await base44.entities.InstagramLead.list("-created_date", 200);
    setLeads(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const search = async (niche, location) => {
    setSearching(true);
    setError(null);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Find 8 real, currently active Instagram accounts of real estate professionals in the "${niche}" niche${location ? ` based in or around ${location}` : ""} — realtors, real estate agents, brokerages, real estate teams, property managers, investors, or house flippers. Focus on accounts that are clearly working to win listings and buyer/seller leads and would benefit from better marketing, a lead-capture website, or AI tools (lead qualification, follow-up automation, listing content).

For each account provide: the Instagram handle (without @), display name, a short bio summary, approximate follower count as text (e.g. "12K"), what they sell/do (e.g. "residential listings in Jax Beach"), and their location if known. Only include accounts you have real evidence exist — do not invent handles.`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            leads: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  handle: { type: "string" },
                  display_name: { type: "string" },
                  bio: { type: "string" },
                  followers: { type: "string" },
                  what_they_sell: { type: "string" },
                  location: { type: "string" }
                }
              }
            }
          }
        }
      });
      const found = (result.leads || []).filter((l) => l.handle);
      const existing = new Set(leads.map((l) => l.handle.toLowerCase()));
      const fresh = found.filter((l) => !existing.has(l.handle.toLowerCase().replace(/^@/, "")));
      if (fresh.length > 0) {
        await base44.entities.InstagramLead.bulkCreate(fresh.map((l) => ({
          handle: l.handle.replace(/^@/, ""),
          display_name: l.display_name || "",
          bio: l.bio || "",
          followers: l.followers || "",
          what_they_sell: l.what_they_sell || "",
          location: l.location || "",
          niche,
          profile_url: `https://instagram.com/${l.handle.replace(/^@/, "")}`,
          status: "new"
        })));
        await load();
      } else {
        setError("No new accounts found — try a different niche or location.");
      }
    } catch (e) {
      setError("Search failed — please try again.");
    }
    setSearching(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight mb-2">
          <InstagramIcon className="w-7 h-7 text-pink-400" /> Instagram Leads
        </h1>
        <p className="text-sm text-slate-400 mb-8">
          Find realtors and real estate pros on Instagram you can market to, then generate a personalized DM to send them.
        </p>

        <IGSearchForm onSearch={search} searching={searching} />
        {error && <p className="text-sm text-rose-400 mb-4">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-700 border-t-pink-400 rounded-full animate-spin" />
          </div>
        ) : leads.length === 0 ? (
          <p className="text-center py-16 text-slate-500 text-sm">No Instagram leads yet — search a real estate niche above to find agents to reach out to.</p>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => <IGLeadCard key={lead.id} lead={lead} onUpdated={load} />)}
          </div>
        )}
      </div>
    </div>
  );
}