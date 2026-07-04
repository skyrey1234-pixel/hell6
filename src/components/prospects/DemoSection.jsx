import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { MonitorSmartphone, Loader2, ExternalLink, Download } from "lucide-react";

export default function DemoSection({ prospect, onUpdated }) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const html = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a complete, modern, single-file demo website for ${prospect.business_name}, a ${prospect.industry} business in ${prospect.location}. Description: ${prospect.description}

This is a demo to show the business owner what a modern AI-enhanced web presence could look like. Requirements:
- One complete HTML file with embedded CSS in a <style> tag and any JS in a <script> tag. No external dependencies except Google Fonts.
- Beautiful, modern, mobile-responsive design with a hero section, services section, an "AI-powered features" section that showcases solutions like: ${(prospect.ai_opportunities || []).slice(0, 3).join("; ")}, a testimonials section, and a contact/booking section.
- Include a simple mock AI chat widget in the bottom-right corner that opens on click and shows canned responses.
- Use a color palette appropriate for a ${prospect.industry} business.
- Keep the total output under 500 lines.

Return ONLY the raw HTML starting with <!DOCTYPE html>. No markdown, no code fences, no explanation.`,
        model: "gemini_3_flash"
      });
      const cleaned = String(html).replace(/^```html?\s*/i, "").replace(/```\s*$/, "").trim();
      await base44.entities.Prospect.update(prospect.id, { demo_html: cleaned, status: "demo_created" });
      await onUpdated();
    } catch (e) {
      setError("Demo generation failed — please try again.");
    }
    setGenerating(false);
  };

  const openFullscreen = () => {
    const blob = new Blob([prospect.demo_html], { type: "text/html" });
    window.open(URL.createObjectURL(blob), "_blank");
  };

  const download = () => {
    const blob = new Blob([prospect.demo_html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${prospect.business_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-demo.html`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="bg-[#131824] border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 font-semibold text-amber-400">
          <MonitorSmartphone className="w-4 h-4" /> Demo Website
        </h2>
        <div className="flex gap-2">
          {prospect.demo_html && (
            <button onClick={download} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors">
              <Download className="w-3 h-3" /> Download
            </button>
          )}
          {prospect.demo_html && (
            <button onClick={openFullscreen} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors">
              <ExternalLink className="w-3 h-3" /> Open full screen
            </button>
          )}
          <button
            onClick={generate}
            disabled={generating}
            className="flex items-center gap-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 rounded-lg px-3 py-1.5 transition-colors"
          >
            {generating ? <><Loader2 className="w-3 h-3 animate-spin" /> Building demo…</> : prospect.demo_html ? "Regenerate" : "Generate Demo Site"}
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-rose-400 mb-3">{error}</p>}
      {generating && (
        <p className="text-xs text-slate-500 mb-3">This takes about 30 seconds — a full custom demo site is being designed.</p>
      )}
      {prospect.demo_html ? (
        <iframe
          srcDoc={prospect.demo_html}
          title="Demo website preview"
          className="w-full h-[600px] rounded-xl border border-slate-800 bg-white"
          sandbox="allow-scripts"
        />
      ) : !generating && (
        <p className="text-sm text-slate-500">No demo yet. Generate a custom demo website to show this business what you can build for them.</p>
      )}
    </div>
  );
}