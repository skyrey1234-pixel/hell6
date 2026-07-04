import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft, LayoutTemplate, Plus } from "lucide-react";
import TemplateForm from "@/components/templates/TemplateForm";
import TemplateList from "@/components/templates/TemplateList";

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, object = edit

  const load = async () => {
    const data = await base44.entities.EmailTemplate.list("-updated_date", 100);
    setTemplates(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (form) => {
    if (editing?.id) await base44.entities.EmailTemplate.update(editing.id, form);
    else await base44.entities.EmailTemplate.create(form);
    setEditing(null);
    await load();
  };

  const remove = async (id) => {
    await base44.entities.EmailTemplate.delete(id);
    await load();
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <div className="flex items-center justify-between mb-2">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <LayoutTemplate className="w-7 h-7 text-amber-400" /> Email Templates
          </h1>
          <button
            onClick={() => setEditing({})}
            className="flex items-center gap-1.5 text-sm font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl px-4 py-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Template
          </button>
        </div>
        <p className="text-sm text-slate-400 mb-8">
          Reusable proposal emails. Placeholders are filled automatically when you send: {"{{business_name}}"}, {"{{industry}}"}, {"{{location}}"}, {"{{proposal}}"}, {"{{demo_link}}"}, {"{{portfolio_link}}"}, {"{{company_name}}"}, {"{{date}}"}
        </p>

        {editing !== null && (
          <TemplateForm template={editing} onSave={save} onCancel={() => setEditing(null)} />
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-700 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : (
          <TemplateList templates={templates} onEdit={setEditing} onDelete={remove} />
        )}
      </div>
    </div>
  );
}