import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ProspectRow from "@/components/prospects/ProspectRow";
import { ArrowLeft, KanbanSquare } from "lucide-react";

export default function Pipeline() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await base44.entities.Prospect.list("-updated_date", 200);
    setProspects(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => {
    await base44.entities.Prospect.update(id, { status });
    await load();
  };

  const handleDelete = async (id) => {
    await base44.entities.Prospect.delete(id);
    await load();
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to search
        </Link>
        <div className="flex items-center gap-2 mb-8">
          <KanbanSquare className="w-6 h-6 text-amber-400" />
          <h1 className="text-3xl font-bold tracking-tight">Prospect Pipeline</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-700 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : prospects.length === 0 ? (
          <div className="text-center py-20 text-slate-500">No saved prospects yet.</div>
        ) : (
          <div className="bg-[#131824] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
                    <th className="px-5 py-3 font-medium">Business</th>
                    <th className="px-5 py-3 font-medium">Location</th>
                    <th className="px-5 py-3 font-medium">Score</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prospects.map((p) => (
                    <ProspectRow key={p.id} prospect={p} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}