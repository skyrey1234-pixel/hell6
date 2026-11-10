import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Phone, Mail, Globe, MapPin, User, Calendar, Check, Clock,
  Plus, ExternalLink, FileText, Monitor, MessageSquare, AlertCircle, Pencil
} from "lucide-react";
import StatusBadge from "@/components/prospects/StatusBadge";

const STATUS_OPTIONS = [
  { value: "new", label: "New Lead" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "demo_created", label: "Demo Ready" },
  { value: "replied", label: "Replied / In Talks" },
  { value: "won", label: "Active Client (Won)" },
  { value: "lost", label: "Closed / Lost" }
];

export default function RealtorLeadCard({
  lead,
  followUps,
  onStatusChange,
  onUpdateContact,
  onAddFollowUp,
  onCompleteFollowUp,
  onSnoozeFollowUp
}) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [taskDate, setTaskDate] = useState(
    new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0]
  );
  const [taskType, setTaskType] = useState("Day 3 Check-In");
  const [taskNote, setTaskNote] = useState("");
  const [contactForm, setContactForm] = useState({
    owner_name: lead.owner_name || "",
    phone: lead.phone || "",
    contact_email: lead.contact_email || ""
  });

  const today = new Date().toISOString().split("T")[0];
  const cleanPhone = (lead.phone || "").replace(/[^+\d]/g, "");

  const submitTask = async (e) => {
    e.preventDefault();
    await onAddFollowUp(lead, {
      follow_up_date: taskDate,
      follow_up_type: taskType,
      note: taskNote
    });
    setTaskNote("");
    setShowAddTask(false);
  };

  const submitContact = async (e) => {
    e.preventDefault();
    await onUpdateContact(lead.id, contactForm);
    setEditingContact(false);
  };

  return (
    <div className="bg-[#131824] border border-slate-800 hover:border-amber-500/30 rounded-2xl p-5 transition-colors">
      <div className="grid lg:grid-cols-12 gap-5">
        {/* Column 1: Lead & Contact Info (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 pb-4 lg:pb-0 lg:pr-5">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <Link
                  to={`/prospect/${lead.id}`}
                  className="text-lg font-bold text-slate-100 hover:text-amber-400 transition-colors inline-flex items-center gap-1.5"
                >
                  {lead.business_name}
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </Link>
                <div className="text-xs text-amber-400/90 font-medium">
                  {lead.industry || "Real Estate"} {lead.location ? `· ${lead.location}` : ""}
                </div>
              </div>
              <button
                onClick={() => setEditingContact(!editingContact)}
                className="text-xs text-slate-500 hover:text-slate-300 p-1"
                title="Edit contact details"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            {editingContact ? (
              <form onSubmit={submitContact} className="space-y-2 mt-2 bg-[#0B0E14] p-3 rounded-xl border border-slate-800">
                <input
                  value={contactForm.owner_name}
                  onChange={(e) => setContactForm({ ...contactForm, owner_name: e.target.value })}
                  placeholder="Contact / Realtor Name"
                  className="w-full bg-[#131824] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                />
                <input
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  placeholder="Phone number"
                  className="w-full bg-[#131824] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                />
                <input
                  value={contactForm.contact_email}
                  onChange={(e) => setContactForm({ ...contactForm, contact_email: e.target.value })}
                  placeholder="Email address"
                  className="w-full bg-[#131824] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                />
                <div className="flex gap-2">
                  <button type="submit" className="text-xs font-semibold bg-amber-400 text-slate-950 rounded-lg px-3 py-1">
                    Save
                  </button>
                  <button type="button" onClick={() => setEditingContact(false)} className="text-xs text-slate-400 px-2 py-1">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-1.5 mt-3 text-xs text-slate-300">
                {lead.owner_name && (
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{lead.owner_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  {lead.phone ? (
                    <div className="flex items-center gap-2">
                      <a href={`tel:${cleanPhone}`} className="hover:text-amber-400">{lead.phone}</a>
                      <a
                        href={`sms:${cleanPhone}`}
                        className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded px-1.5 py-0.5 hover:bg-sky-500/20"
                      >
                        SMS
                      </a>
                    </div>
                  ) : (
                    <button onClick={() => setEditingContact(true)} className="text-slate-500 hover:text-amber-400">
                      + Add phone
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  {lead.contact_email ? (
                    <a href={`mailto:${lead.contact_email}`} className="hover:text-amber-400 truncate">
                      {lead.contact_email}
                    </a>
                  ) : (
                    <button onClick={() => setEditingContact(true)} className="text-slate-500 hover:text-amber-400">
                      + Add email
                    </button>
                  )}
                </div>
                {lead.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <a href={lead.website} target="_blank" rel="noreferrer" className="text-amber-400/80 hover:text-amber-400 truncate">
                      {lead.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
                {lead.address && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{lead.address}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Current Project Status & Deliverables (3 cols) */}
        <div className="lg:col-span-3 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 pb-4 lg:pb-0 lg:pr-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Project Status</span>
              <span className="text-xs font-bold text-amber-400">Score: {lead.opportunity_score || "—"}</span>
            </div>
            <div className="mb-3">
              <select
                value={lead.status || "new"}
                onChange={(e) => onStatusChange(lead.id, e.target.value)}
                className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-amber-400"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <div className="text-[11px] text-slate-500 mb-1">Deliverables Ready:</div>
              <div className="flex flex-wrap gap-1.5">
                <span className={`inline-flex items-center gap-1 text-[10px] rounded-lg px-2 py-0.5 border ${lead.proposal ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800/50 text-slate-500 border-slate-800"}`}>
                  <FileText className="w-3 h-3" /> Proposal
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] rounded-lg px-2 py-0.5 border ${lead.demo_html ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-slate-800/50 text-slate-500 border-slate-800"}`}>
                  <Monitor className="w-3 h-3" /> Demo Site
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] rounded-lg px-2 py-0.5 border ${lead.sms_pitch ? "bg-sky-500/10 text-sky-400 border-sky-500/20" : "bg-slate-800/50 text-slate-500 border-slate-800"}`}>
                  <MessageSquare className="w-3 h-3" /> SMS Pitch
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between">
            <StatusBadge status={lead.status} />
            <Link
              to={`/prospect/${lead.id}`}
              className="text-xs font-semibold text-amber-400 hover:underline"
            >
              Open Workspace →
            </Link>
          </div>
        </div>

        {/* Column 3: Pending Follow-Up Tasks (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Pending Follow-Ups ({followUps.length})
              </span>
              <button
                onClick={() => setShowAddTask(!showAddTask)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300"
              >
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
            </div>

            {showAddTask && (
              <form onSubmit={submitTask} className="bg-[#0B0E14] border border-sky-500/30 rounded-xl p-3 mb-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="bg-[#131824] border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                  />
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value)}
                    className="bg-[#131824] border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                  >
                    <option>Day 3 Check-In</option>
                    <option>Day 7 Follow-Up</option>
                    <option>Demo Walkthrough</option>
                    <option>Close / Deposit</option>
                    <option>Call Back</option>
                  </select>
                </div>
                <input
                  value={taskNote}
                  onChange={(e) => setTaskNote(e.target.value)}
                  placeholder="Task note (e.g. Ask about Zillow lead response)"
                  className="w-full bg-[#131824] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                />
                <div className="flex gap-2">
                  <button type="submit" className="text-xs font-semibold bg-sky-500 text-white rounded-lg px-3 py-1">
                    Save Task
                  </button>
                  <button type="button" onClick={() => setShowAddTask(false)} className="text-xs text-slate-400 px-2 py-1">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {followUps.length === 0 ? (
              <div className="bg-[#0B0E14]/60 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-500">
                No pending follow-up tasks scheduled.
              </div>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {followUps.map((f) => {
                  const isOverdue = f.follow_up_date < today;
                  const isToday = f.follow_up_date === today;
                  return (
                    <div
                      key={f.id}
                      className={`bg-[#0B0E14] border rounded-xl p-2.5 text-xs flex items-start justify-between gap-2 ${
                        isOverdue
                          ? "border-rose-500/40"
                          : isToday
                          ? "border-amber-500/40"
                          : "border-slate-800"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-200">{f.follow_up_type || "Follow-Up"}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${
                              isOverdue
                                ? "bg-rose-500/15 text-rose-400"
                                : isToday
                                ? "bg-amber-500/15 text-amber-400"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {isOverdue && <AlertCircle className="w-2.5 h-2.5" />}
                            <Calendar className="w-2.5 h-2.5" />
                            {f.follow_up_date}
                          </span>
                        </div>
                        {f.note && <p className="text-slate-400 mt-1 break-words">{f.note}</p>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onSnoozeFollowUp(f.id)}
                          className="text-[10px] text-slate-400 hover:text-sky-400 border border-slate-700 rounded px-1.5 py-1"
                          title="Snooze to tomorrow"
                        >
                          +1d
                        </button>
                        <button
                          onClick={() => onCompleteFollowUp(f.id)}
                          className="text-[10px] font-semibold text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/30 rounded px-1.5 py-1 flex items-center gap-0.5"
                          title="Mark complete"
                        >
                          <Check className="w-3 h-3" /> Done
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}