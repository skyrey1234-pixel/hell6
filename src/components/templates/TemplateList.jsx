import React from "react";
import { Pencil, Trash2 } from "lucide-react";

export default function TemplateList({ templates, onEdit, onDelete }) {
  if (templates.length === 0) {
    return <p className="text-center py-16 text-slate-500 text-sm">No templates yet — create your first one.</p>;
  }
  return (
    <div className="space-y-3">
      {templates.map((t) => (
        <div key={t.id} className="bg-[#131824] border border-slate-800 rounded-2xl p-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="font-semibold text-slate-200">{t.name}</div>
            <div className="text-xs text-amber-400/80 mt-0.5">{t.subject}</div>
            <p className="text-xs text-slate-500 mt-2 line-clamp-2 whitespace-pre-line">{t.body}</p>
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => onEdit(t)} className="p-2 text-slate-400 hover:text-amber-400 transition-colors" title="Edit">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(t.id)} className="p-2 text-slate-500 hover:text-rose-400 transition-colors" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}