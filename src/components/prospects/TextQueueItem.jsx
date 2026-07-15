import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { generateSmsPitch } from "@/components/prospects/textQueuePitch";
import StatusBadge from "@/components/prospects/StatusBadge";
import TextQueueActions from "@/components/prospects/TextQueueActions";

export default function TextQueueItem({ prospect, onUpdated }) {
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);
    await generateSmsPitch(prospect);
    await onUpdated();
    setGenerating(false);
  };

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
          <TextQueueActions prospect={prospect} onUpdated={onUpdated} onRewrite={generate} rewriting={generating} />
        </>
      ) : (
        <button onClick={generate} disabled={generating} className="flex items-center gap-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 transition-colors">
          {generating ? <><Loader2 className="w-3 h-3 animate-spin" /> Writing…</> : "Generate Pitch"}
        </button>
      )}
    </div>
  );
}