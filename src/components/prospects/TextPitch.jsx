import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, Loader2, Copy, Check, Phone } from "lucide-react";

export default function TextPitch({ prospect, onUpdated }) {
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!prospect.phone) return null;

  const generate = async () => {
    setGenerating(true);
    const sms = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a short, friendly text message (under 320 characters, no emojis) from Rey at REYTRINIDADco, an AI optimization consulting company, to ${prospect.business_name}, a ${prospect.industry || "local"} business in ${prospect.location || "their area"}. Their gaps: ${(prospect.gaps || []).join(", ")}. Mention one specific way AI or a modern website could help them, and end with a low-pressure question. Return only the text message.`
    });
    await base44.entities.Prospect.update(prospect.id, { sms_pitch: String(sms).trim() });
    await onUpdated();
    setGenerating(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(prospect.sms_pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const smsHref = `sms:${prospect.phone.replace(/[^+\d]/g, "")}?&body=${encodeURIComponent(prospect.sms_pitch || "")}`;

  return (
    <div className="bg-sky-500/5 border border-sky-500/20 rounded-2xl p-5 mb-6">
      <div className="flex items-center gap-2 font-semibold text-sky-400 mb-1">
        <MessageSquare className="w-4 h-4" /> Text their number
      </div>
      <p className="text-xs text-slate-400 mb-4">
        No email? Generate a short text pitch and send it to {prospect.phone} straight from your phone.
      </p>
      {prospect.sms_pitch ? (
        <div className="bg-[#0B0E14] border border-slate-800 rounded-xl p-4">
          <p className="text-sm text-slate-300 whitespace-pre-line">{prospect.sms_pitch}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <a href={smsHref} className="flex items-center gap-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg px-3 py-1.5 transition-colors">
              <MessageSquare className="w-3 h-3" /> Text {prospect.phone}
            </a>
            <a href={`tel:${prospect.phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-sky-400 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors">
              <Phone className="w-3 h-3" /> Call
            </a>
            <button onClick={copy} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors">
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} {copied ? "Copied" : "Copy"}
            </button>
            <button onClick={generate} disabled={generating} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              {generating ? "Rewriting…" : "Rewrite"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={generate}
          disabled={generating}
          className="flex items-center gap-1.5 text-sm font-semibold bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg px-4 py-2 transition-colors"
        >
          {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Writing…</> : "Generate Text Pitch"}
        </button>
      )}
    </div>
  );
}