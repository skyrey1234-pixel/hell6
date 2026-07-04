import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2 } from "lucide-react";

export default function SendAllProposals({ prospects, onDone }) {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const ready = prospects.filter((p) => p.proposal && p.contact_email && p.status !== "proposal_sent" && p.status !== "won" && p.status !== "lost");

  const sendAll = async () => {
    setSending(true);
    setResult(null);
    let sent = 0;
    for (const p of ready) {
      await base44.integrations.Core.SendEmail({
        to: p.contact_email,
        subject: `AI Optimization Proposal for ${p.business_name}`,
        body: p.proposal
      });
      await base44.entities.Prospect.update(p.id, { status: "proposal_sent" });
      sent++;
    }
    await onDone();
    setSending(false);
    setResult(`Sent ${sent} proposal${sent === 1 ? "" : "s"}. ${prospects.length - ready.length} skipped (missing proposal or contact email, or already sent/closed).`);
  };

  return (
    <div className="flex items-center gap-3">
      {result && <span className="text-xs text-slate-400">{result}</span>}
      <button
        onClick={sendAll}
        disabled={sending || ready.length === 0}
        className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl px-4 py-2 transition-colors"
      >
        {sending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…</> : <><Send className="w-3.5 h-3.5" /> Send All Proposals ({ready.length})</>}
      </button>
    </div>
  );
}