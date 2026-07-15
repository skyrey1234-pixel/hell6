import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, Check, Loader2, FileSpreadsheet, Link2 } from "lucide-react";
import { ensureAuditPage } from "@/components/prospects/textQueueAudit";

export default function TextQueueActions({ prospect, onUpdated, onRewrite, rewriting }) {
  const [marking, setMarking] = useState(false);
  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const smsHref = `sms:${(prospect.phone || "").replace(/[^+\d]/g, "")}?&body=${encodeURIComponent(prospect.sms_pitch || "")}`;

  const markTexted = async () => {
    setMarking(true);
    await base44.entities.Prospect.update(prospect.id, { status: "proposal_sent" });
    await onUpdated();
    setMarking(false);
  };

  const logToSheet = async () => {
    setLogging(true);
    await base44.functions.invoke("logPitchToSheet", { prospectId: prospect.id });
    setLogging(false);
    setLogged(true);
    setTimeout(() => setLogged(false), 3000);
  };

  const problemLink = async () => {
    setAuditing(true);
    const url = await ensureAuditPage(prospect);
    await navigator.clipboard.writeText(url);
    await onUpdated();
    setAuditing(false);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <a href={smsHref} className="flex items-center gap-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg px-3 py-1.5 transition-colors">
        <MessageSquare className="w-3 h-3" /> Text {prospect.phone}
      </a>
      <button onClick={problemLink} disabled={auditing} className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-amber-400 disabled:opacity-40 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors">
        {auditing ? <><Loader2 className="w-3 h-3 animate-spin" /> Building…</> : copied ? <><Check className="w-3 h-3" /> Link copied!</> : <><Link2 className="w-3 h-3" /> {prospect.audit_html ? "Copy problem link" : "Create problem link"}</>}
      </button>
      <button onClick={logToSheet} disabled={logging} className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-emerald-400 disabled:opacity-40 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors">
        {logging ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</> : logged ? <><Check className="w-3 h-3" /> Saved!</> : <><FileSpreadsheet className="w-3 h-3" /> Log to Sheet</>}
      </button>
      <button onClick={markTexted} disabled={marking || prospect.status !== "new"} className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-emerald-400 disabled:opacity-40 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors">
        <Check className="w-3 h-3" /> {prospect.status !== "new" ? "Sent" : marking ? "Marking…" : "Mark texted"}
      </button>
      <button onClick={onRewrite} disabled={rewriting} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
        {rewriting ? "Rewriting…" : "Rewrite"}
      </button>
    </div>
  );
}