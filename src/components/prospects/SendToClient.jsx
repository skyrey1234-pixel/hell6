import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Rocket, Loader2, Check } from "lucide-react";

export default function SendToClient({ prospect, onUpdated }) {
  const [email, setEmail] = useState(prospect.contact_email || "");
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.entities.EmailTemplate.list("-updated_date", 100).then(setTemplates);
  }, []);

  if (!prospect.proposal || !prospect.demo_html) return null;

  const send = async () => {
    setSending(true);
    setError(null);
    try {
      if (email !== prospect.contact_email) {
        await base44.entities.Prospect.update(prospect.id, { contact_email: email });
      }
      await base44.functions.invoke("sendProposalGmail", { prospectId: prospect.id, templateId: templateId || null });
      await onUpdated();
      setSent(true);
    } catch (e) {
      setError("Sending failed — check the email address and try again.");
    }
    setSending(false);
  };

  return (
    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 mb-6">
      <div className="flex items-center gap-2 font-semibold text-emerald-400 mb-1">
        <Rocket className="w-4 h-4" /> Ready to send
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Pick a template, confirm the email, and one click sends the branded proposal with the live demo link from your Gmail.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={templateId}
          onChange={(e) => { setTemplateId(e.target.value); setSent(false); }}
          className="bg-[#0B0E14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
        >
          <option value="">Full Proposal (default)</option>
          {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setSent(false); }}
          placeholder="client@business.com"
          className="bg-[#0B0E14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 w-64"
        />
        <button
          onClick={send}
          disabled={sending || sent || !email.includes("@")}
          className="flex items-center gap-1.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg px-4 py-2 transition-colors"
        >
          {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : sent ? <><Check className="w-4 h-4" /> Sent</> : "Send Proposal + Demo"}
        </button>
        {error && <span className="text-xs text-rose-400">{error}</span>}
      </div>
    </div>
  );
}