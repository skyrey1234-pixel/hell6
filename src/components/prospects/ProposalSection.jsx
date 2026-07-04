import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import { FileText, Loader2, Copy, Check } from "lucide-react";
import EmailProposalButton from "@/components/prospects/EmailProposalButton";

export default function ProposalSection({ prospect, onUpdated }) {
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setGenerating(true);
    const proposal = await base44.integrations.Core.InvokeLLM({
      prompt: `You are Skyrey, an AI optimization consultant, creative strategist, and business automation builder at REYTRINIDADco in Jacksonville, Florida.

Research ${prospect.business_name} (a ${prospect.industry} business in ${prospect.location}${prospect.website ? `, website: ${prospect.website}` : ""}) online, then write a direct, high-converting AI Business Leak Audit proposal addressed to them.

Company background: ${prospect.description}
Known weaknesses: ${(prospect.gaps || []).join("; ")}
Recommended solutions: ${(prospect.ai_opportunities || []).join("; ")}

Do NOT sound desperate, generic, overly polite, or like a normal agency. The tone is confident, sharp, and practical — a consultant who researched them, found the leaks, and knows how to fix them. This is a diagnosis, not a pitch. Never beg ("I would love to work with you").

The proposal must tell the owner:
1. I researched your company.
2. Here are the specific weaknesses and risks in your current digital presence.
3. These weaknesses could cause you to lose leads, repeat customers, revenue, and market share.
4. Even if you already use AI, you can still fall behind if the AI is not connected to a real revenue system — having AI is not the same as having a system that makes you money.
5. Here is the exact AI-powered system I would build to fix the leaks.

Do not insult the business or make fake claims. Never say they will definitely fail — use language like "could cause you to lose leads", "may be leaving money on the table", "creates a gap competitors can take advantage of", "your current system does not appear built to".

Structure in markdown:
1. A strong, direct opening line ("I researched your business and I'm going to be direct.")
2. "What I Noticed" — specific observations about their company
3. "Failure Risk Score" — rate their current digital system X/10 risk level with a one-line reason (base it on their gaps; frame it as the system underperforming, not the business being bad)
4. "The Biggest Risks" — bulleted list of the leaks and why each one costs money
5. "What I Would Build" — the AI-powered lead capture + follow-up + automation system, with concrete deliverables mapped to each risk
6. "Why This Matters Financially" — the money logic
7. A clear call to action, signed "Skyrey — REYTRINIDADco"

Around 500-600 words. Do not include pricing, a date, or contact information (the email adds those automatically).`,
      add_context_from_internet: true,
      model: "gemini_3_flash"
    });
    await base44.entities.Prospect.update(prospect.id, {
      proposal,
      status: prospect.status === "new" ? "proposal_sent" : prospect.status
    });
    await onUpdated();
    setGenerating(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(prospect.proposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#131824] border border-slate-800 rounded-2xl p-5 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 font-semibold text-violet-400">
          <FileText className="w-4 h-4" /> Proposal
        </h2>
        <div className="flex gap-2">
          {prospect.proposal && <EmailProposalButton prospect={prospect} onUpdated={onUpdated} />}
          {prospect.proposal && (
            <button onClick={copy} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors">
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} {copied ? "Copied" : "Copy"}
            </button>
          )}
          <button
            onClick={generate}
            disabled={generating}
            className="flex items-center gap-1.5 text-xs font-semibold bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 transition-colors"
          >
            {generating ? <><Loader2 className="w-3 h-3 animate-spin" /> Writing…</> : prospect.proposal ? "Regenerate" : "Generate Proposal"}
          </button>
        </div>
      </div>
      {prospect.proposal ? (
        <div className="prose prose-invert prose-sm max-w-none prose-headings:text-slate-200 prose-p:text-slate-300 prose-li:text-slate-300">
          <ReactMarkdown>{prospect.proposal}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-sm text-slate-500">No proposal yet. Generate a tailored consulting proposal for this business.</p>
      )}
    </div>
  );
}