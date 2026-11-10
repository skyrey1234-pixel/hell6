import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Copy, Check, ShieldCheck, Layers, Sparkles } from "lucide-react";
import { PORTFOLIO_META, PORTFOLIO_PROJECTS, EARLIER_FOUNDATION } from "@/data/skyreyPortfolio";

const CATEGORIES = ["All", "Real Estate Systems", "AI Products & Web Apps", "Client Systems", "Creative IP & Media"];

export default function Portfolio() {
  const [category, setCategory] = useState("All");
  const [copiedId, setCopiedId] = useState(null);

  const filtered = category === "All"
    ? PORTFOLIO_PROJECTS
    : PORTFOLIO_PROJECTS.filter((p) => p.category === category);

  const copyText = async (text, id) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyText(PORTFOLIO_META.portfolioUrl, "main-url")}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-amber-400 border border-slate-700 rounded-xl px-3.5 py-2 transition-colors"
            >
              {copiedId === "main-url" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedId === "main-url" ? "Copied skyreyport.com" : "Copy Portfolio Link"}
            </button>
            <a
              href={PORTFOLIO_META.portfolioUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl px-4 py-2 transition-colors"
            >
              Open skyreyport.com <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-[#131824] via-[#0F1420] to-[#1A1412] p-8 mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <img src={PORTFOLIO_META.markUrl} alt="Skyrey evidence mark" className="w-8 h-8 rounded-lg object-contain" />
            <span className="text-xs font-semibold tracking-widest uppercase text-amber-400">
              {PORTFOLIO_META.legalName} · SKYREY / EVIDENCE SYSTEM
            </span>
          </div>
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">{PORTFOLIO_META.role}</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-3">
            {PORTFOLIO_META.headline}
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm md:text-base leading-relaxed mb-6">
            AI products, real-estate & client workflows, and visual worlds built by {PORTFOLIO_META.founder}.{" "}
            <span className="text-amber-400/90">{PORTFOLIO_META.philosophy}</span>
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PORTFOLIO_META.stats.map((s) => (
              <div key={s.label} className="bg-[#0B0E14]/80 border border-slate-800 rounded-2xl p-4">
                <div className="text-2xl font-bold text-amber-400">{s.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-colors ${
                category === cat
                  ? "bg-amber-400 text-slate-950"
                  : "bg-[#131824] border border-slate-800 text-slate-300 hover:text-amber-400"
              }`}
            >
              {cat} ({cat === "All" ? PORTFOLIO_PROJECTS.length : PORTFOLIO_PROJECTS.filter((p) => p.category === cat).length})
            </button>
          ))}
        </div>

        {/* Case Files Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {filtered.map((item) => {
            const pitchSnippet = `${item.name} (${item.classification}): ${item.summary} — See it in my portfolio at ${PORTFOLIO_META.portfolioUrl}`;
            return (
              <div
                key={item.id}
                className="bg-[#131824] border border-slate-800 hover:border-amber-500/40 rounded-2xl overflow-hidden flex flex-col transition-colors"
              >
                {item.thumbnail && (
                  <div className="h-44 bg-[#0B0E14] overflow-hidden relative border-b border-slate-800/80">
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider bg-slate-950/85 text-amber-400 border border-amber-500/30 rounded-lg px-2.5 py-1">
                      {item.status}
                    </span>
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                    {item.category} · {item.classification}
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-2">{item.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 flex-1">{item.summary}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.stack.map((t) => (
                      <span key={t} className="text-[10px] bg-[#0B0E14] text-slate-300 border border-slate-800 rounded-lg px-2 py-0.5">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => copyText(pitchSnippet, item.id)}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === item.id ? "Copied blurb" : "Copy for pitch"}
                    </button>
                    {item.liveUrl ? (
                      <a
                        href={item.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:underline"
                      >
                        Live App <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <a
                        href={PORTFOLIO_META.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
                      >
                        Case File <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Earlier Foundation */}
        <div className="bg-[#131824] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
            <Layers className="w-4 h-4" /> Selected Earlier Work & Foundation
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Earlier portfolio builds and multidisciplinary projects from {PORTFOLIO_META.legalName}.
          </p>
          <div className="flex flex-wrap gap-2">
            {EARLIER_FOUNDATION.map((name, idx) => (
              <span
                key={name}
                className="text-xs bg-[#0B0E14] border border-slate-800 text-slate-300 rounded-xl px-3 py-1.5"
              >
                <span className="text-amber-400/70 font-mono mr-1.5">{String(idx + 1).padStart(2, "0")}</span>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}