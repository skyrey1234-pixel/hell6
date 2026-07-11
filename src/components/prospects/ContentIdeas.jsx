import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Video, Loader2, Copy, Check, Instagram, RefreshCw } from "lucide-react";

export default function ContentIdeas({ prospect, onUpdated }) {
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(null);

  const generate = async () => {
    setGenerating(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are Skyrey (@Skyrey904), an AI optimization consultant and content creator based in Jacksonville Beach, FL. You run REYTRINIDADco and you make TikTok/Instagram content about your consulting journey.

Generate 3 content ideas based on this prospect: ${prospect.business_name} (${prospect.industry} in ${prospect.location}).
Their gaps: ${(prospect.gaps || []).join(", ")}
AI solutions you'd build: ${(prospect.ai_opportunities || []).join(", ")}

For each content idea provide:
1. A TikTok hook (the first line that stops the scroll — under 15 words, punchy, curiosity-driven)
2. A short script outline (3-4 bullet points of what to say/show in the video, 30-60 seconds)
3. An Instagram caption (2-3 sentences + 5 relevant hashtags)

The content should position you as the AI consultant who actually goes out and helps local businesses — not a guru, but a real practitioner. Make it feel like "day in the life" or "I found this business and here's what I'd fix" content.

Format as JSON with a "content_ideas" array of objects with fields: tiktok_hook, script_outline (array of strings), instagram_caption.`,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          content_ideas: {
            type: "array",
            items: {
              type: "object",
              properties: {
                tiktok_hook: { type: "string" },
                script_outline: { type: "array", items: { type: "string" } },
                instagram_caption: { type: "string" }
              }
            }
          }
        }
      }
    });
    const ideas = result.content_ideas || [];
    await base44.entities.Prospect.update(prospect.id, { content_ideas: JSON.stringify(ideas) });
    await onUpdated();
    setGenerating(false);
  };

  const copyText = async (text, idx) => {
    await navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  let ideas = [];
  try {
    ideas = JSON.parse(prospect.content_ideas || "[]");
  } catch (e) {}

  return (
    <div className="bg-[#131824] border border-slate-800 rounded-2xl p-5 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 font-semibold text-pink-400">
          <Video className="w-4 h-4" /> Content Ideas
        </h2>
        <button
          onClick={generate}
          disabled={generating}
          className="flex items-center gap-1.5 text-xs font-semibold bg-pink-500 hover:bg-pink-400 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 transition-colors"
        >
          {generating ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</> : ideas.length > 0 ? <><RefreshCw className="w-3 h-3" /> Regenerate</> : "Generate Content Ideas"}
        </button>
      </div>

      {ideas.length > 0 ? (
        <div className="space-y-5">
          {ideas.map((idea, i) => (
            <div key={i} className="bg-[#0B0E14] border border-slate-800 rounded-xl p-4">
              {/* TikTok Hook */}
              <div className="mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider">TikTok Hook</span>
                  <button onClick={() => copyText(idea.tiktok_hook, `hook-${i}`)} className="text-xs text-slate-500 hover:text-slate-300">
                    {copied === `hook-${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <p className="text-sm text-slate-200 font-medium mt-1">"{idea.tiktok_hook}"</p>
              </div>

              {/* Script */}
              <div className="mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Script Outline</span>
                <ul className="mt-1 space-y-1">
                  {(idea.script_outline || []).map((line, j) => (
                    <li key={j} className="text-xs text-slate-400 flex gap-2"><span className="text-pink-400/60">•</span>{line}</li>
                  ))}
                </ul>
              </div>

              {/* Instagram Caption */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider flex items-center gap-1"><Instagram className="w-3 h-3" /> Caption</span>
                  <button onClick={() => copyText(idea.instagram_caption, `cap-${i}`)} className="text-xs text-slate-500 hover:text-slate-300">
                    {copied === `cap-${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1 whitespace-pre-line">{idea.instagram_caption}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Generate TikTok hooks, script outlines, and Instagram captions based on this prospect's story.</p>
      )}
    </div>
  );
}
