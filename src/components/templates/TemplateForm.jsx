import React, { useState } from "react";
import { Loader2 } from "lucide-react";

export default function TemplateForm({ template, onSave, onCancel }) {
  const [name, setName] = useState(template.name || "");
  const [subject, setSubject] = useState(template.subject || "");
  const [body, setBody] = useState(template.body || "");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ name, subject, body });
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="bg-[#131824] border border-amber-500/30 rounded-2xl p-5 mb-8 space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Template name (e.g. Quick Intro)"
        required
        className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
      />
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Email subject (e.g. A free demo website for {{business_name}})"
        required
        className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={"Email body in markdown. Use placeholders like {{business_name}}, {{proposal}}, {{demo_link}}, {{portfolio_link}}..."}
        required
        rows={10}
        className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 font-mono"
      />
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg px-4 py-2 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="flex items-center gap-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 rounded-lg px-4 py-2 transition-colors">
          {saving && <Loader2 className="w-3 h-3 animate-spin" />} Save Template
        </button>
      </div>
    </form>
  );
}