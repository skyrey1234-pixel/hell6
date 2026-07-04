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
      prompt: `Write a professional, persuasive AI optimization consulting proposal addressed to ${prospect.business_name}, a ${prospect.industry} business located in ${prospect.location}.

Company background: ${prospect.description}
Their current gaps: ${(prospect.gaps || []).join("; ")}
Recommended AI solutions: ${(prospect.ai_opportunities || []).join("; ")}

The proposal is from REYTRINIDADco, an AI optimization consulting company. Structure it in markdown with: a brief personalized intro showing you understand their business, a "Current Challenges" section, a "Proposed AI Solutions" section with concrete deliverables mapped to each challenge, an "Expected Impact" section with realistic estimates, a simple 3-phase timeline, and a warm closing with next steps signed "REYTRINIDADco". Keep it concise and client-friendly, around 500 words. Do not include pricing, do not include a date, and do not include any contact information (the email adds those automatically).`
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