import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, Loader2, Check } from "lucide-react";
import { generateSmsPitch } from "@/components/prospects/textQueuePitch";
import StatusBadge from "@/components/prospects/StatusBadge";

export default function TextQueueItem({ prospect, onUpdated }) {
  const [generating, setGenerating] = useState(false);
  const [marking, setMarking] = useState(false);

  const generate = async () => {
    setGenerating(true);
    await generateSmsPitch(prospect);
    await onUpdated();
    setGenerating(false);
  };

  const markTexted = async () => {
    setMarking(true);
    await base44.entities.Prospect.update(prospect.id, { status: "proposal_sent" });
    await onUpdated();
    setMarking(false);
  };

  const smsHref = `sms:${(prospect.phone || "").replace(/[^+\d]/g, "")}?&body=${encodeURIComponent(prospect.sms_pitch || "")}`;

  return (
    <div className="bg-[#131824] border border-slate-800 rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div>
          <div className="font-semibold text-slate-100">{prospect.business_name}</div>
          <div className="text-xs text-slate-500">{prospect.industry} · {prospect.phone}</div>
        </div>
        <StatusBadge status={prospect.status} />
      </div>
      {prospect.sms_pitch ? (
        <>
          <p className="text-sm text-slate-300 whitespace-pre-line bg-[#0B0E14] border border-slate-800 rounded-xl p-3 mb-3">{prospect.sms_pitch}</p>
          <div className="flex flex-wrap gap-2">
            <a href={smsHref} className="flex items-center gap-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg px-3 py-1.5 transition-colors">
              <MessageSquare className="w-3 h-3" /> Text {prospect.phone}
            </a>
            <button onClick={markTexted} disabled={marking || prospect.status !== "new"} className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-emerald-400 disabled:opacity-40 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors">
              <Check className="w-3 h-3" /> {prospect.status !== "new" ? "Sent" : marking ? "Marking…" : "Mark texted"}
            </button>
            <button onClick={generate} disabled={generating} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              {generating ? "Rewriting…" : "Rewrite"}
            </button>
          </div>
        </>
      ) : (
        <button onClick={generate} disabled={generating} className="flex items-center gap-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 transition-colors">
          {generating ? <><Loader2 className="w-3 h-3 animate-spin" /> Writing…</> : "Generate Pitch"}
        </button>
      )}
    </div>
  );
}