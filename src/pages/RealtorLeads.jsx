import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Building2, Search, Plus } from "lucide-react";
import RealtorStatsBar from "@/components/realtors/RealtorStatsBar";
import RealtorLeadCard from "@/components/realtors/RealtorLeadCard";

const REAL_ESTATE_KEYWORDS = [
  "realtor", "real estate", "realty", "broker", "property", "housing", "homes", "leasing", "agent"
];

function isRealtorLead(prospect) {
  const text = `${prospect.industry || ""} ${prospect.business_name || ""} ${prospect.description || ""}`.toLowerCase();
  return REAL_ESTATE_KEYWORDS.some((kw) => text.includes(kw));
}

export default function RealtorLeads({ embedded = false }) {
  const [prospects, setProspects] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [taskFilter, setTaskFilter] = useState("all");
  const [onlyRealtors, setOnlyRealtors] = useState(true);
  const [showNewLead, setShowNewLead] = useState(false);
  const [newLead, setNewLead] = useState({
    business_name: "",
    owner_name: "",
    industry: "Realtor / Brokerage",
    location: "Jacksonville, FL",
    phone: "",
    contact_email: "",
    website: ""
  });

  const loadData = async () => {
    const [pros, fups] = await Promise.all([
      base44.entities.Prospect.list("-updated_date", 200),
      base44.entities.FollowUp.list("follow_up_date", 200).catch(() => [])
    ]);
    setProspects(pros);
    setFollowUps(fups);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id, status) => {
    setProspects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    await base44.entities.Prospect.update(id, { status });
  };

  const handleUpdateContact = async (id, fields) => {
    setProspects((prev) => prev.map((p) => (p.id === id ? { ...p, ...fields } : p)));
    await base44.entities.Prospect.update(id, fields);
  };

  const handleAddFollowUp = async (lead, taskData) => {
    const created = await base44.entities.FollowUp.create({
      prospect_id: lead.id,
      business_name: lead.business_name,
      follow_up_date: taskData.follow_up_date,
      follow_up_type: taskData.follow_up_type,
      note: taskData.note,
      status: "pending"
    });
    setFollowUps((prev) => [...prev, created]);
  };

  const handleCompleteFollowUp = async (followUpId) => {
    setFollowUps((prev) => prev.map((f) => (f.id === followUpId ? { ...f, status: "done" } : f)));
    await base44.entities.FollowUp.update(followUpId, { status: "done" });
  };

  const handleSnoozeFollowUp = async (followUpId) => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    setFollowUps((prev) =>
      prev.map((f) => (f.id === followUpId ? { ...f, follow_up_date: tomorrow } : f))
    );
    await base44.entities.FollowUp.update(followUpId, { follow_up_date: tomorrow });
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!newLead.business_name.trim()) return;
    await base44.entities.Prospect.create({
      ...newLead,
      status: "new",
      opportunity_score: 80
    });
    setNewLead({
      business_name: "",
      owner_name: "",
      industry: "Realtor / Brokerage",
      location: "Jacksonville, FL",
      phone: "",
      contact_email: "",
      website: ""
    });
    setShowNewLead(false);
    await loadData();
  };

  const pendingFollowUps = followUps.filter((f) => f.status !== "done");
  const today = new Date().toISOString().split("T")[0];

  const baseLeads = onlyRealtors ? prospects.filter(isRealtorLead) : prospects;

  const filteredLeads = baseLeads.filter((lead) => {
    const leadTasks = pendingFollowUps.filter(
      (f) => f.prospect_id === lead.id || f.business_name === lead.business_name
    );
    if (statusFilter !== "all" && (lead.status || "new") !== statusFilter) return false;
    if (taskFilter === "pending" && leadTasks.length === 0) return false;
    if (taskFilter === "urgent" && !leadTasks.some((t) => t.follow_up_date <= today)) return false;
    if (taskFilter === "no_tasks" && leadTasks.length > 0) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const hay = `${lead.business_name || ""} ${lead.owner_name || ""} ${lead.phone || ""} ${lead.contact_email || ""} ${lead.location || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const content = (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl md:text-3xl font-bold tracking-tight">
            <Building2 className="w-7 h-7 text-amber-400" /> Realtor Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Contact details, current project & pipeline status, and pending follow-up tasks for every realtor lead in one view.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlyRealtors(!onlyRealtors)}
            className={`text-xs font-semibold px-3.5 py-2 rounded-xl border transition-colors ${
              onlyRealtors
                ? "bg-amber-400/10 text-amber-400 border-amber-500/30"
                : "bg-[#131824] text-slate-400 border-slate-800"
            }`}
          >
            {onlyRealtors ? "Showing Realtor Leads Only" : "Showing All Industries"}
          </button>
          <button
            onClick={() => setShowNewLead(!showNewLead)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl px-4 py-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Realtor Lead
          </button>
        </div>
      </div>

      {showNewLead && (
        <form onSubmit={handleCreateLead} className="bg-[#131824] border border-amber-500/30 rounded-2xl p-5 mb-6 space-y-3">
          <div className="text-sm font-semibold text-amber-400 mb-1">Add New Realtor Lead</div>
          <div className="grid md:grid-cols-3 gap-3">
            <input
              required
              value={newLead.business_name}
              onChange={(e) => setNewLead({ ...newLead, business_name: e.target.value })}
              placeholder="Brokerage or Team Name *"
              className="bg-[#0B0E14] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100"
            />
            <input
              value={newLead.owner_name}
              onChange={(e) => setNewLead({ ...newLead, owner_name: e.target.value })}
              placeholder="Agent / Owner Name"
              className="bg-[#0B0E14] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100"
            />
            <input
              value={newLead.location}
              onChange={(e) => setNewLead({ ...newLead, location: e.target.value })}
              placeholder="City, State"
              className="bg-[#0B0E14] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100"
            />
            <input
              value={newLead.phone}
              onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
              placeholder="Phone Number"
              className="bg-[#0B0E14] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100"
            />
            <input
              value={newLead.contact_email}
              onChange={(e) => setNewLead({ ...newLead, contact_email: e.target.value })}
              placeholder="Email Address"
              className="bg-[#0B0E14] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100"
            />
            <input
              value={newLead.website}
              onChange={(e) => setNewLead({ ...newLead, website: e.target.value })}
              placeholder="Website URL"
              className="bg-[#0B0E14] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="text-xs font-semibold bg-amber-400 text-slate-950 rounded-xl px-4 py-2">
              Save Realtor Lead
            </button>
            <button type="button" onClick={() => setShowNewLead(false)} className="text-xs text-slate-400 px-3 py-2">
              Cancel
            </button>
          </div>
        </form>
      )}

      <RealtorStatsBar leads={baseLeads} pendingFollowUps={pendingFollowUps} />

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-[#131824] border border-slate-800 rounded-2xl p-3.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by realtor, brokerage, phone, or email..."
            className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#0B0E14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
        >
          <option value="all">All Project Statuses</option>
          <option value="new">New Lead</option>
          <option value="proposal_sent">Proposal Sent</option>
          <option value="demo_created">Demo Ready</option>
          <option value="replied">Replied / In Talks</option>
          <option value="won">Active Client (Won)</option>
          <option value="lost">Closed / Lost</option>
        </select>

        <select
          value={taskFilter}
          onChange={(e) => setTaskFilter(e.target.value)}
          className="bg-[#0B0E14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
        >
          <option value="all">All Follow-Up States</option>
          <option value="pending">Has Pending Tasks</option>
          <option value="urgent">Overdue / Due Today</option>
          <option value="no_tasks">No Scheduled Follow-Up</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-slate-700 border-t-amber-400 rounded-full animate-spin" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-16 bg-[#131824] border border-slate-800 rounded-2xl p-8">
          <p className="text-slate-400 text-sm">No matching realtor leads found.</p>
          {onlyRealtors && prospects.length > 0 && (
            <button
              onClick={() => setOnlyRealtors(false)}
              className="mt-3 text-xs font-semibold text-amber-400 hover:underline"
            >
              Show all {prospects.length} saved leads across all industries
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => {
            const leadFollowUps = pendingFollowUps.filter(
              (f) => f.prospect_id === lead.id || f.business_name === lead.business_name
            );
            return (
              <RealtorLeadCard
                key={lead.id}
                lead={lead}
                followUps={leadFollowUps}
                onStatusChange={handleStatusChange}
                onUpdateContact={handleUpdateContact}
                onAddFollowUp={handleAddFollowUp}
                onCompleteFollowUp={handleCompleteFollowUp}
                onSnoozeFollowUp={handleSnoozeFollowUp}
              />
            );
          })}
        </div>
      )}
    </div>
  );

  if (embedded) return content;

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        {content}
      </div>
    </div>
  );
}