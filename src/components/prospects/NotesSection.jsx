import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { StickyNote, Loader2, Check } from "lucide-react";

export default function NotesSection({ prospect, onUpdated }) {
  const [notes, setNotes] = useState(prospect.notes || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    await base44.entities.Prospect.update(prospect.id, { notes });
    await onUpdated();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-[#131824] border border-slate-800 rounded-2xl p-5 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 font-semibold text-sky-400">
          <StickyNote className="w-4 h-4" /> Notes
        </h2>
        <button
          onClick={save}
          disabled={saving || notes === (prospect.notes || "")}
          className="flex items-center gap-1.5 text-xs font-semibold bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white rounded-lg px-3 py-1.5 transition-colors"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : saved ? <Check className="w-3 h-3" /> : null}
          {saved ? "Saved" : "Save Notes"}
        </button>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Track your interactions — e.g. 'Left voicemail 7/3', 'Meeting scheduled Friday'…"
        rows={4}
        className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/50 resize-y"
      />
    </div>
  );
}