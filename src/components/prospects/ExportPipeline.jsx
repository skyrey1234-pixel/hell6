import React from "react";
import { Download } from "lucide-react";
import { appParams } from "@/lib/app-params";

export default function ExportPipeline({ prospects }) {
  const exportCsv = () => {
    const headers = ["Business", "Phone", "Industry", "Location", "Address", "Website", "Score", "Status", "Demo Site", "Audit Link", "SMS Pitch"];
    const base = `https://base44.app/api/apps/${appParams.appId}/functions`;
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = prospects.map((p) => [
      p.business_name, p.phone, p.industry, p.location, p.address, p.website,
      p.opportunity_score, p.status,
      p.demo_html ? `${base}/viewDemo?pid=${p.id}` : "",
      p.audit_html ? `${base}/viewAudit?pid=${p.id}` : "",
      p.sms_pitch
    ].map(esc).join(","));
    const csv = [headers.map(esc).join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "pipeline.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <button onClick={exportCsv} className="flex items-center gap-1.5 text-xs font-semibold border border-amber-500/40 text-amber-400 hover:bg-amber-400/10 rounded-lg px-3 py-1.5 transition-colors">
      <Download className="w-3 h-3" /> Export to Excel
    </button>
  );
}