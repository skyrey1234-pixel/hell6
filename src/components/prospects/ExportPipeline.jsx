import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Sheet, ExternalLink } from "lucide-react";

export default function ExportPipeline() {
  const [syncing, setSyncing] = useState(false);
  const [sheetUrl, setSheetUrl] = useState(null);

  const sync = async () => {
    setSyncing(true);
    const res = await base44.functions.invoke("exportPipelineToSheet", {});
    setSheetUrl(res.data.sheetUrl);
    setSyncing(false);
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={sync} disabled={syncing} className="flex items-center gap-1.5 text-xs font-semibold border border-amber-500/40 text-amber-400 hover:bg-amber-400/10 disabled:opacity-50 rounded-lg px-3 py-1.5 transition-colors">
        {syncing ? <><Loader2 className="w-3 h-3 animate-spin" /> Syncing…</> : <><Sheet className="w-3 h-3" /> Export to Google Drive</>}
      </button>
      {sheetUrl && (
        <a href={sheetUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300">
          Open sheet <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}