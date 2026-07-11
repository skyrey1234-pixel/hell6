import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Bell, Check, AlertCircle, Calendar, MessageSquare, Loader2, Plus } from "lucide-react";

export default function FollowUps() {
  const [followups, setFollowups] = useState([]);
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    try {
      const fups = await base44.entities.FollowUp.list("-follow_up_date", 200);
      const pros = await base44.entities.Prospect.list("-created_date", 200);
      setFollowups(fups);
      setProspects(pros);
    } catch (e) {
      setFollowups([]);
      setProspects([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markDone = async (id) => {
    await base44.entities.FollowUp.update(id, { status: "done" });
    await load();
  };

  const snooze = async (id) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await base44.entities.FollowUp.update(id, { follow_up_date: tomorrow.toISOString().split("T")[0] });
    await load();
  };

  const today = new Date().toISOString().split("T")[0];
  const overdue = followups.filter((f) => f.status !== "done" && f.follow_up_date < today);
  const dueToday = followups.filter((f) => f.status !== "done" && f.follow_up_date === today);
  const upcoming = followups.filter((f) => f.status !== "done" && f.follow_up_date > today);
  const completed = followups.filter((f) => f.status === "done").slice(0, 10);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <div className="flex items-center justify-between mb-2">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Clock className="w-7 h-7 text-sky-400" /> Follow-Ups
          </h1>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-white rounded-xl px-4 py-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Follow-Up
          </button>
        </div>
        <p className="text-sm text-slate-400 mb-8">
          Never let a lead go cold. Track your follow-ups, set intentions, and stay disciplined.
        </p>

        {showAdd && <AddFollowUp prospects={prospects} onSave={() => { setShowAdd(false); load(); }} onCancel={() => setShowAdd(false)} />}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-700 border-t-sky-400 rounded-full animate-spin" />
          </div>
        ) : followups.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p>No follow-ups scheduled yet.</p>
            <p className="text-xs mt-2">When you send proposals, follow-ups will be auto-created for Day 3 and Day 7.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overdue */}
            {overdue.length > 0 && (
              <Section title="Overdue" icon={<AlertCircle className="w-5 h-5 text-rose-400" />} color="rose">
                {overdue.map((f) => <FollowUpCard key={f.id} followup={f} prospects={prospects} onDone={markDone} onSnooze={snooze} />)}
              </Section>
            )}

            {/* Due Today */}
            {dueToday.length > 0 && (
              <Section title="Due Today" icon={<Bell className="w-5 h-5 text-amber-400" />} color="amber">
                {dueToday.map((f) => <FollowUpCard key={f.id} followup={f} prospects={prospects} onDone={markDone} onSnooze={snooze} />)}
              </Section>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <Section title="Upcoming" icon={<Calendar className="w-5 h-5 text-sky-400" />} color="sky">
                {upcoming.map((f) => <FollowUpCard key={f.id} followup={f} prospects={prospects} onDone={markDone} onSnooze={snooze} />)}
              </Section>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <Section title="Completed" icon={<Check className="w-5 h-5 text-emerald-400" />} color="emerald">
                {completed.map((f) => <FollowUpCard key={f.id} followup={f} prospects={prospects} onDone={markDone} onSnooze={snooze} done />)}
              </Section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon, color, children }) {
  return (
    <div>
      <h3 className={`flex items-center gap-2 text-lg font-semibold text-${color}-400 mb-4`}>{icon} {title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FollowUpCard({ followup, prospects, onDone, onSnooze, done }) {
  const prospect = prospects.find((p) => p.id === followup.prospect_id);
  return (
    <div className={`bg-[#131824] border rounded-2xl p-5 ${done ? "border-slate-800 opacity-60" : "border-slate-800 hover:border-sky-500/30"} transition-colors`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-slate-100">{prospect?.business_name || followup.business_name || "Unknown"}</h4>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{followup.follow_up_date}</span>
            <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-lg px-2 py-0.5">{followup.follow_up_type || "General"}</span>
          </div>
          {followup.note && <p className="text-sm text-slate-400 mt-2">{followup.note}</p>}
          {followup.intention && (
            <p className="text-xs text-amber-400/70 mt-2 italic flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> {followup.intention}
            </p>
          )}
        </div>
        {!done && (
          <div className="flex gap-2">
            <button onClick={() => onSnooze(followup.id)} className="text-xs text-slate-400 hover:text-sky-400 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors">
              Tomorrow
            </button>
            <button onClick={() => onDone(followup.id)} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded-lg px-3 py-1.5 transition-colors">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AddFollowUp({ prospects, onSave, onCancel }) {
  const [prospectId, setProspectId] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [date, setDate] = useState(new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0]);
  const [type, setType] = useState("Day 3 Check-In");
  const [note, setNote] = useState("");
  const [intention, setIntention] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.FollowUp.create({
      prospect_id: prospectId || null,
      business_name: businessName || (prospects.find((p) => p.id === prospectId)?.business_name) || "",
      follow_up_date: date,
      follow_up_type: type,
      note,
      intention,
      status: "pending"
    });
    setSaving(false);
    onSave();
  };

  return (
    <form onSubmit={save} className="bg-[#131824] border border-sky-500/30 rounded-2xl p-5 mb-8 space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Prospect (optional)</label>
          <select value={prospectId} onChange={(e) => setProspectId(e.target.value)} className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500/50">
            <option value="">— Select or type below —</option>
            {prospects.map((p) => <option key={p.id} value={p.id}>{p.business_name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Or business name</label>
          <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Business name" className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50" />
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Follow-up date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500/50" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500/50">
            <option>Day 3 Check-In</option>
            <option>Day 7 Follow-Up</option>
            <option>Demo Reminder</option>
            <option>Close Attempt</option>
            <option>General</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Intention (faith/purpose)</label>
          <input value={intention} onChange={(e) => setIntention(e.target.value)} placeholder="Why does this client matter?" className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50" />
        </div>
      </div>
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Note</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What to say, context, etc." rows={2} className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 resize-none" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="flex items-center gap-1.5 text-sm font-semibold bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-xl px-5 py-2.5 transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Save Follow-Up
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-slate-400 hover:text-slate-200 px-4 py-2.5">Cancel</button>
      </div>
    </form>
  );
}
