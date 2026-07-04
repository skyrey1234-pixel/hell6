import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2, Check } from "lucide-react";

export default function EmailProposalButton({ prospect, onUpdated }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(prospect.contact_email || "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const send = async () => {
    setSending(true);
    setError(null);
    try {
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: `AI Optimization Proposal for ${prospect.business_name}`,
        body: prospect.proposal
      });
      await base44.entities.Prospect.update(prospect.id, { status: "proposal_sent", contact_email: email });
      await onUpdated();
      setSent(true);
      setTimeout(() => { setSent(false); setOpen(false); }, 2000);
    } catch (e) {
      setError("Failed to send — check the email address.");
    }
    setSending(false);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-3 py-1.5 transition-colors">
        <Send className="w-3 h-3" /> Email
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="client@business.com"
        className="bg-[#0B0E14] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 w-48"
      />
      <button
        onClick={send}
        disabled={sending || !email.includes("@")}
        className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 transition-colors"
      >
        {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : sent ? <Check className="w-3 h-3" /> : <Send className="w-3 h-3" />}
        {sent ? "Sent" : "Send"}
      </button>
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  );
}