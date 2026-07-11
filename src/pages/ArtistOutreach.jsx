import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft, Music, Search, Loader2, ExternalLink, Copy, Check, Trash2 } from "lucide-react";

const SEARCH_TYPES = [
  { value: "venues", label: "Venues & Promoters", prompt: "local music venues, event promoters, and booking agents" },
  { value: "playlists", label: "Playlist Curators", prompt: "independent Spotify/Apple Music playlist curators and music blogs" },
  { value: "brands", label: "Brand Deals", prompt: "local brands, streetwear companies, and businesses that sponsor or collaborate with independent music artists" },
  { value: "collabs", label: "Artist Collabs", prompt: "independent music artists, producers, and creatives open to collaborations" }
];

export default function ArtistOutreach() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchType, setSearchType] = useState("venues");
  const [location, setLocation] = useState("Jacksonville, FL");
  const [genre, setGenre] = useState("alt-pop, hip-hop, experimental");
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const data = await base44.entities.ArtistLead.list("-created_date", 200);
      setLeads(data);
    } catch (e) {
      setLeads([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const search = async (e) => {
    e.preventDefault();
    setSearching(true);
    setError(null);
    const typeObj = SEARCH_TYPES.find((t) => t.value === searchType);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Find 6 real, currently active ${typeObj.prompt} in or around ${location} that would be relevant for an independent music artist making ${genre} music. The artist is Skyrey (@Skyrey904), based in Jacksonville Beach, FL — an alt-pop/hip-hop artist with a dark cinematic aesthetic, faith-driven lyrics, and AI-produced music videos.
For each result provide: name, type (venue/promoter/curator/brand/artist), a short description, their Instagram handle if known, website URL if known, location, and a suggested pitch angle (one sentence explaining why this connection makes sense and what to say).
Only include real entities you have evidence exist.`,
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
                  name: { type: "string" },
                  type: { type: "string" },
                  description: { type: "string" },
                  instagram: { type: "string" },
                  website: { type: "string" },
                  location: { type: "string" },
                  pitch_angle: { type: "string" }
                }
              }
            }
          }
        }
      });
      const found = (result.leads || []).filter((l) => l.name);
      if (found.length > 0) {
        await base44.entities.ArtistLead.bulkCreate(found.map((l) => ({
          name: l.name,
          lead_type: l.type || searchType,
          description: l.description || "",
          instagram: (l.instagram || "").replace(/^@/, ""),
          website: l.website || "",
          location: l.location || "",
          pitch_angle: l.pitch_angle || "",
          status: "new",
          genre
        })));
        await load();
      } else {
        setError("No results found — try a different location or genre.");
      }
    } catch (e) {
      setError("Search failed — please try again.");
    }
    setSearching(false);
  };

  const generatePitch = async (lead) => {
    const pitch = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a short, confident DM or email (under 400 characters) from Skyrey (@Skyrey904), an independent alt-pop/hip-hop artist based in Jacksonville Beach, FL, to ${lead.name} (${lead.lead_type}: ${lead.description}).
Context: ${lead.pitch_angle}
Tone: Direct, creative, not desperate. Like a peer reaching out with a clear value prop. Reference something specific about them. End with a clear next step.
Return only the message text.`,
      model: "gemini_3_flash"
    });
    await base44.entities.ArtistLead.update(lead.id, { pitch: String(pitch).trim() });
    await load();
  };

  const deleteLead = async (id) => {
    await base44.entities.ArtistLead.delete(id);
    await load();
  };

  const grouped = SEARCH_TYPES.map((t) => ({
    ...t,
    leads: leads.filter((l) => l.lead_type === t.value || l.lead_type === t.label.split(" ")[0].toLowerCase())
  }));

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight mb-2">
          <Music className="w-7 h-7 text-purple-400" /> Artist Outreach
        </h1>
        <p className="text-sm text-slate-400 mb-8">
          Find venues, playlist curators, brands, and artists to connect with — then generate personalized pitches in your voice.
        </p>

        {/* Search Form */}
        <form onSubmit={search} className="bg-[#131824] border border-slate-800 rounded-2xl p-5 mb-8">
          <div className="grid md:grid-cols-4 gap-3">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="bg-[#0B0E14] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50"
            >
              {SEARCH_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City (e.g. Jacksonville, FL)"
              className="bg-[#0B0E14] border border-slate-800 rounded-xl px-4 py-3 text-sm placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50"
            />
            <input
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="Genre (e.g. alt-pop, hip-hop)"
              className="bg-[#0B0E14] border border-slate-800 rounded-xl px-4 py-3 text-sm placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50"
            />
            <button
              type="submit"
              disabled={searching}
              className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white font-semibold rounded-xl px-6 py-3 text-sm transition-colors"
            >
              {searching ? <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</> : <><Search className="w-4 h-4" /> Find Leads</>}
            </button>
          </div>
        </form>

        {error && <p className="text-sm text-rose-400 mb-4">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-700 border-t-purple-400 rounded-full animate-spin" />
          </div>
        ) : leads.length === 0 ? (
          <p className="text-center py-16 text-slate-500 text-sm">No artist leads yet — search above to find venues, curators, brands, and collabs.</p>
        ) : (
          <div className="space-y-8">
            {grouped.filter((g) => g.leads.length > 0).map((group) => (
              <div key={group.value}>
                <h3 className="text-lg font-semibold text-purple-400 mb-4">{group.label} ({group.leads.length})</h3>
                <div className="space-y-3">
                  {group.leads.map((lead) => (
                    <ArtistLeadCard key={lead.id} lead={lead} onGeneratePitch={generatePitch} onDelete={deleteLead} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ArtistLeadCard({ lead, onGeneratePitch, onDelete }) {
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const gen = async () => {
    setGenerating(true);
    await onGeneratePitch(lead);
    setGenerating(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(lead.pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#131824] border border-slate-800 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-slate-100">{lead.name}</h4>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg px-2 py-0.5">{lead.lead_type}</span>
            {lead.location && <span>{lead.location}</span>}
          </div>
          <p className="text-sm text-slate-400 mt-2">{lead.description}</p>
          {lead.pitch_angle && <p className="text-xs text-amber-400/70 mt-1 italic">Angle: {lead.pitch_angle}</p>}
        </div>
        <div className="flex gap-2">
          {lead.instagram && (
            <a href={`https://instagram.com/${lead.instagram}`} target="_blank" rel="noreferrer" className="text-pink-400 hover:text-pink-300">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button onClick={() => onDelete(lead.id)} className="text-slate-600 hover:text-rose-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pitch section */}
      <div className="mt-4">
        {lead.pitch ? (
          <div className="bg-[#0B0E14] border border-slate-800 rounded-xl p-3">
            <p className="text-sm text-slate-300 whitespace-pre-line">{lead.pitch}</p>
            <div className="flex gap-2 mt-2">
              <button onClick={copy} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200">
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} {copied ? "Copied" : "Copy"}
              </button>
              <button onClick={gen} disabled={generating} className="text-xs text-slate-500 hover:text-purple-400">
                {generating ? "Rewriting..." : "Rewrite"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={gen}
            disabled={generating}
            className="flex items-center gap-1.5 text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl px-3 py-2 transition-colors"
          >
            {generating ? <><Loader2 className="w-3 h-3 animate-spin" /> Writing...</> : "Generate Pitch"}
          </button>
        )}
      </div>
    </div>
  );
}
