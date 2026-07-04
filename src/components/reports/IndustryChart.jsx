import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

export default function IndustryChart({ data }) {
  return (
    <div className="bg-[#131824] border border-slate-800 rounded-2xl p-5">
      <h2 className="font-semibold text-slate-200 mb-1">Industry Response</h2>
      <p className="text-xs text-slate-500 mb-5">Proposals sent vs leads engaged, by industry</p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="industry" tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <Tooltip
            contentStyle={{ background: "#0B0E14", border: "1px solid #334155", borderRadius: 8 }}
            labelStyle={{ color: "#e2e8f0" }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="sent" name="Proposals Sent" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="engaged" name="Engaged" fill="#34d399" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-6 space-y-2">
        {data.map((d) => (
          <div key={d.industry} className="flex items-center gap-3 text-sm">
            <span className="w-40 truncate text-slate-300">{d.industry}</span>
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${d.rate}%` }} />
            </div>
            <span className="w-24 text-right text-xs text-slate-400">{d.rate}% response</span>
          </div>
        ))}
      </div>
    </div>
  );
}