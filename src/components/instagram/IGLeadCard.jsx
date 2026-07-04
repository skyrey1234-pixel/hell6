import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ExternalLink, Loader2, Copy, Check, Trash2, MessageCircle } from "lucide-react";

const STATUSES = [
  { value: "new", label: "New" },
  { value: "dm_sent", label: "DM Sent" },
  { value: "replied", label: "Replied" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" }
];

export default function IGLeadCard({ lead, onUpdated }) {
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateDM = async () => {
    setGenerating(true);
    const dm = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a short, casual, friendly Instagram DM (under 500 characters, no hashtags, no emojis overload — max 1 emoji) from REYTRINIDADco, an AI optimization consulting company, to the Instagram account @${lead.handle} (${lead.display_name}). They sell: ${lead.what_they_sell}. Bio: ${lead.bio}

The goal is to open a conversation about helping them grow with a modern website and AI tools (like an AI chat assistant, automated booking, or better online presence). Mention something specific about what they sell so it feels personal, and end with a low-pressure question. Return only the DM text.`
    });
    await base44.entities.InstagramLead.update(lead.id, { dm_pitch: String(dm).trim() });
    await onUpdated();
    setGenerating(false);
  };

  const copyDM = async () => {
    await navigator.clipboard.writeText(lead.dm_pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const setStatus = async (status) => {
    await base44.entities.InstagramLead.update(lead.id, { status });
    await onUpdated();
  };

  const remove = async () => {
    await base44.entities.InstagramLead.delete(lead.id);
    await onUpdated();
  };

  return (
    <div className="bg-[#131824] border border-slate-800 rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <a href={lead.profile_url} target="_blank" rel="noreferrer" className="font-semibold text-pink-400 hover:underline inline-flex items-center gap-1.5">
            @{lead.handle} <ExternalLink className="w-3 h-3" />
          </a>
          <div className="text-sm text-slate-300">{lead.display_name}</div>
          <div className="text-xs text-slate-500 mt-1">
            {[lead.niche, lead.location, lead.followers && `${lead.followers} followers`].filter(Boolean).join(" · ")}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={lead.status || "new"}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-[#0B0E14] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button onClick={remove} className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {lead.what_they_sell && <p className="text-sm text-slate-400 mt-3">Sells: {lead.what_they_sell}</p>}
      {lead.bio && <p className="text-xs text-slate-500 mt-1">{lead.bio}</p>}

      <div className="mt-4">
        {lead.dm_pitch ? (
          <div className="bg-[#0B0E14] border border-slate-800 rounded-xl p-4">
            <p className="text-sm text-slate-300 whitespace-pre-line">{lead.dm_pitch}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={copyDM} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors">
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} {copied ? "Copied" : "Copy DM"}
              </button>
              <a href={lead.profile_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold bg-pink-500 hover:bg-pink-400 text-white rounded-lg px-3 py-1.5 transition-colors">
                <ExternalLink className="w-3 h-3" /> Open Instagram
              </a>
              <button onClick={generateDM} disabled={generating} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                {generating ? "Rewriting…" : "Rewrite"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={generateDM}
            disabled={generating}
            className="flex items-center gap-1.5 text-xs font-semibold bg-pink-500 hover:bg-pink-400 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 transition-colors"
          >
            {generating ? <><Loader2 className="w-3 h-3 animate-spin" /> Writing…</> : <><MessageCircle className="w-3 h-3" /> Generate DM Pitch</>}
          </button>
        )}
      </div>
    </div>
  );
}