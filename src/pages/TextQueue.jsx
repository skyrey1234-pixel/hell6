import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import TextQueueItem from "@/components/prospects/TextQueueItem";
import { generateSmsPitch } from "@/components/prospects/textQueuePitch";
import { researchProspect } from "@/components/prospects/researchProspect";
import { Search } from "lucide-react";

export default function TextQueue() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState("");
  const [researching, setResearching] = useState(false);
  const [researchProgress, setResearchProgress] = useState("");

  const researchAll = async () => {
    setResearching(true);
    const list = prospects;
    for (let i = 0; i < list.length; i++) {
      setResearchProgress(`${i + 1} of ${list.length}`);
      await researchProspect(list[i]);
    }
    await load();
    setResearching(false);
    setResearchProgress("");
  };

  const load = async () => {
    const data = await base44.entities.Prospect.list("-created_date", 200);
    setProspects(data.filter((p) => p.phone));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const missing = prospects.filter((p) => !p.sms_pitch);

  const generateAll = async () => {
    setBulkGenerating(true);
    for (let i = 0; i < missing.length; i++) {
      setBulkProgress(`${i + 1} of ${missing.length}`);
      await generateSmsPitch(missing[i]);
    }
    await load();
    setBulkGenerating(false);
    setBulkProgress("");
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">Text Queue</h1>
          <div className="flex flex-wrap gap-2">
          {prospects.length > 0 && (
            <button onClick={researchAll} disabled={researching} className="flex items-center gap-1.5 text-xs font-semibold border border-amber-500/40 text-amber-400 hover:bg-amber-400/10 disabled:opacity-50 rounded-lg px-3 py-1.5 transition-colors">
              {researching ? <><Loader2 className="w-3 h-3 animate-spin" /> Researching {researchProgress}…</> : <><Search className="w-3 h-3" /> Research all companies</>}
            </button>
          )}
          {missing.length > 0 && (
            <button onClick={generateAll} disabled={bulkGenerating} className="flex items-center gap-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 rounded-lg px-3 py-1.5 transition-colors">
              {bulkGenerating ? <><Loader2 className="w-3 h-3 animate-spin" /> Writing {bulkProgress}…</> : <><Sparkles className="w-3 h-3" /> Generate {missing.length} missing pitches</>}
            </button>
          )}
          </div>
        </div>
        <p className="text-slate-400 text-sm mb-8">Every prospect with a phone number. Tap "Text" to open your messaging app (set Google Voice as your default texting app) with the number and pitch pre-filled — then just hit send.</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-700 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : prospects.length === 0 ? (
          <div className="text-center py-20 text-slate-500">No prospects with phone numbers yet.</div>
        ) : (
          <div className="space-y-4">
            {prospects.map((p) => <TextQueueItem key={p.id} prospect={p} onUpdated={load} />)}
          </div>
        )}
      </div>
    </div>
  );
}