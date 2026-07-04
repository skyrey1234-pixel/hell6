import React from "react";

const styles = {
  new: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  proposal_sent: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  replied: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  demo_created: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  won: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  lost: "bg-slate-500/10 text-slate-400 border-slate-500/20"
};

const labels = {
  new: "New",
  proposal_sent: "Proposal Sent",
  replied: "Replied",
  demo_created: "Demo Ready",
  won: "Won",
  lost: "Lost"
};

export default function StatusBadge({ status }) {
  const s = status || "new";
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${styles[s] || styles.new}`}>
      {labels[s] || s}
    </span>
  );
}