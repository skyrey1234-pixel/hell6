import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { UserSearch, Loader2, Mail, Linkedin, User } from "lucide-react";

export default function EnrichContact({ prospect, onUpdated }) {
  const [enriching, setEnriching] = useState(false);
  const hasContact = prospect.owner_name || prospect.contact_email || prospect.linkedin_url;

  const enrich = async () => {
    setEnriching(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Find contact details for the owner or key decision-maker of "${prospect.business_name}", a ${prospect.industry} business located at ${prospect.address || prospect.location}. Website: ${prospect.website || "unknown"}.

Search for: the owner's or manager's full name, a contact email address (business or personal), and their LinkedIn profile URL. Return empty strings for anything you cannot find with confidence — do not guess or fabricate.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          owner_name: { type: "string" },
          contact_email: { type: "string" },
          linkedin_url: { type: "string" }
        }
      }
    });
    await base44.entities.Prospect.update(prospect.id, {
      owner_name: result.owner_name || prospect.owner_name || "",
      contact_email: result.contact_email || prospect.contact_email || "",
      linkedin_url: result.linkedin_url || prospect.linkedin_url || ""
    });
    await onUpdated();
    setEnriching(false);
  };

  return (
    <div className="bg-[#131824] border border-slate-800 rounded-2xl p-5 mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 font-semibold text-teal-400">
          <UserSearch className="w-4 h-4" /> Contact Person
        </h2>
        <button
          onClick={enrich}
          disabled={enriching}
          className="flex items-center gap-1.5 text-xs font-semibold bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 transition-colors"
        >
          {enriching ? <><Loader2 className="w-3 h-3 animate-spin" /> Searching…</> : hasContact ? "Re-enrich" : "Find Contact"}
        </button>
      </div>
      {hasContact ? (
        <div className="flex flex-wrap gap-4 text-sm">
          {prospect.owner_name && (
            <span className="flex items-center gap-1.5 text-slate-300"><User className="w-3.5 h-3.5 text-teal-400" />{prospect.owner_name}</span>
          )}
          {prospect.contact_email && (
            <a href={`mailto:${prospect.contact_email}`} className="flex items-center gap-1.5 text-teal-400 hover:underline"><Mail className="w-3.5 h-3.5" />{prospect.contact_email}</a>
          )}
          {prospect.linkedin_url && (
            <a href={prospect.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-teal-400 hover:underline"><Linkedin className="w-3.5 h-3.5" />LinkedIn</a>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No contact person yet. Search the web for the owner's name, email, and LinkedIn.</p>
      )}
    </div>
  );
}