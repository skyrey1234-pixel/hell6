import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Zap, Loader2, Copy, Check, Send } from "lucide-react";

export default function QuickPitch({ prospect, onUpdated }) {
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const generate = async () => {
    setGenerating(true);
    const pitch = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a short, high-converting cold email (under 150 words) from Skyrey at REYTRINIDADco to ${prospect.business_name} (${prospect.industry} in ${prospect.location}).

Context: I'm an AI optimization consultant in Jacksonville, FL. I've built AI systems for businesses like Blackq Empire University, SellerSignal (real estate AI), Liza's Cleaning Co., and local law firms. I specialize in AI chatbots, voice receptionists, automated follow-up systems, and lead capture automation.

Their known gaps: ${(prospect.gaps || []).join(", ")}

Rules:
- Subject line first (compelling, not clickbait)
- Opening line must reference something specific about their business
- Mention ONE specific gap and the money it's costing them
- Offer a free "AI Business Leak Audit" — no strings attached
- Tone: confident, direct, not desperate. Like a peer who noticed something, not a salesman begging for time.
- Sign off as "Skyrey — REYTRINIDADco"
- Do NOT include pricing or long explanations
- This is a first touch — curiosity only

Return format:
Subject: [subject line]

[email body]`,
      model: "gemini_3_flash"
    });
    await base44.entities.Prospect.update(prospect.id, { quick_pitch: String(pitch).trim() });
    await onUpdated();
    setGenerating(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(prospect.quick_pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendQuick = async () => {
    if (!prospect.contact_email) return;
    setSending(true);
    try {
      await base44.functions.invoke("sendQuickPitch", { prospectId: prospect.id });
      setSent(true);
    } catch (e) {}
    setSending(false);
  };

  return (
    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 font-semibold text-amber-400">
          <Zap className="w-4 h-4" /> Quick Pitch
        </div>
        <div className="flex gap-2">
          {prospect.quick_pitch && (
            <button onClick={copy} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors">
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} {copied ? "Copied" : "Copy"}
            </button>
          )}
          <button
            onClick={generate}
            disabled={generating}
            className="flex items-center gap-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 rounded-lg px-3 py-1.5 transition-colors"
          >
            {generating ? <><Loader2 className="w-3 h-3 animate-spin" /> Writing...</> : prospect.quick_pitch ? "Rewrite" : <><Zap className="w-3 h-3" /> Generate Quick Pitch</>}
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-3">
        A short, no-demo intro email — just enough to start the conversation. No proposal or demo site needed.
      </p>

      {prospect.quick_pitch ? (
        <div className="bg-[#0B0E14] border border-slate-800 rounded-xl p-4">
          <p className="text-sm text-slate-300 whitespace-pre-line font-mono">{prospect.quick_pitch}</p>
          {prospect.contact_email && !sent && (
            <button
              onClick={sendQuick}
              disabled={sending}
              className="flex items-center gap-1.5 text-xs font-semibold mt-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 transition-colors"
            >
              {sending ? <><Loader2 className="w-3 h-3 animate-spin" /> Sending...</> : <><Send className="w-3 h-3" /> Send to {prospect.contact_email}</>}
            </button>
          )}
          {sent && <p className="text-xs text-emerald-400 mt-2">Sent!</p>}
        </div>
      ) : null}
    </div>
  );
}
