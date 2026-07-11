import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Target, Loader2, Plus, Zap, Phone, Globe, MapPin } from "lucide-react";

const JAX_HIT_LIST = [
  { business_name: "Harrell & Harrell", industry: "Law Firm (Personal Injury)", location: "Jacksonville, FL", phone: "(904) 251-1111", website: "https://www.harrellandharrell.com/", description: "High-volume personal injury law firm with heavy advertising spend.", gaps: ["No AI client intake", "Manual case documentation", "No automated follow-up system"], ai_opportunities: ["AI-powered client intake chatbot", "Automated case status updates", "AI lead qualification system"], opportunity_score: 88 },
  { business_name: "Nest Finders Property Management", industry: "Real Estate / Property Management", location: "Jacksonville, FL", phone: "(904) 565-9040", website: "https://www.nestfinders.com/", description: "Full-service property management firm — marketing, virtual tours, resident screening, rent collection, 24/7 support.", gaps: ["Manual tenant screening", "No AI maintenance scheduling", "Slow response to tenant inquiries"], ai_opportunities: ["AI-driven tenant screening platform", "Predictive maintenance scheduling", "AI chatbot for tenant/owner FAQs"], opportunity_score: 85 },
  { business_name: "CrossView Realty", industry: "Real Estate", location: "Jacksonville, FL", phone: "(904) 503-0672", website: "https://www.crossviewrealty.com/", description: "Independent brokerage with 31 agents serving Northeast Florida.", gaps: ["No automated lead routing", "Manual market reports", "No personalized follow-up at scale"], ai_opportunities: ["AI lead management with auto follow-up", "AI-powered market report generation", "Personalized email/SMS campaigns"], opportunity_score: 82 },
  { business_name: "The Mussallem Law Firm", industry: "Law Firm (Criminal Defense)", location: "Jacksonville, FL", phone: "(904) 365-5200", website: "https://www.jacksonvillecriminaldefenselawyer.com/", description: "Criminal defense firm needing 24/7 client availability and rapid response.", gaps: ["No 24/7 AI availability", "Manual lead qualification", "No automated client updates"], ai_opportunities: ["AI communication platform for instant support", "Automated lead qualification", "Client portal with AI updates"], opportunity_score: 84 },
  { business_name: "North Florida Medical Center", industry: "Healthcare", location: "Jacksonville, FL", phone: "(904) 269-2437", website: "https://nfmcjax.com/", description: "Comprehensive family care, chiropractic, pain management, physical therapy.", gaps: ["Manual scheduling", "Paper-heavy patient intake", "No insurance verification automation"], ai_opportunities: ["AI chatbot for scheduling", "Digital intake automation", "AI insurance verification"], opportunity_score: 80 },
  { business_name: "Wingard", industry: "Marketing Agency", location: "Jacksonville, FL", phone: "", website: "https://www.wearewingard.com/", description: "Full-service marketing firm — branding, digital, social, video, PR, SEO, web design.", gaps: ["Manual campaign reporting", "No AI content generation", "Slow media planning process"], ai_opportunities: ["AI analytics and reporting", "AI-driven content generation", "Media buying optimization"], opportunity_score: 79 },
  { business_name: "Dockside Seafood Restaurant", industry: "Restaurant", location: "Jacksonville, FL", phone: "", website: "https://docksideseafoodrestaurant.com/", description: "Fresh, locally sourced seafood restaurant with waterfront dining and online ordering.", gaps: ["No AI customer service", "Manual reservation management", "No demand forecasting"], ai_opportunities: ["AI chatbot for reservations/FAQs", "Inventory demand forecasting", "Automated review responses"], opportunity_score: 72 },
  { business_name: "The Bearded Pig", industry: "Restaurant (BBQ)", location: "Jacksonville, FL", phone: "", website: "https://www.thebeardedpigbbq.com/", description: "Southern-style BBQ joint known for slow-smoked meats and house-made sides.", gaps: ["No online order AI support", "Manual social media", "No customer feedback automation"], ai_opportunities: ["AI chatbot for online orders", "Social media content AI", "Automated review management"], opportunity_score: 70 },
  { business_name: "Iron House Gym", industry: "Fitness", location: "Jacksonville, FL", phone: "", website: "https://www.ironhousejax.com/", description: "Premier 24/7 strength training facility with personal training and recovery services.", gaps: ["No churn prediction", "Manual trainer scheduling", "No automated lead nurturing"], ai_opportunities: ["AI churn prediction CRM", "Smart scheduling for trainers", "Automated marketing funnel"], opportunity_score: 76 },
  { business_name: "Leveled Up Sneaker Boutique", industry: "Retail (Streetwear)", location: "Jacksonville, FL", phone: "(904) 673-3652", website: "", description: "Sneaker and streetwear consignment shop with multiple locations, focusing on rare items.", gaps: ["No AI authentication", "Manual consignment tracking", "No drop prediction"], ai_opportunities: ["AI product authentication", "AI inventory management", "Sneaker drop trend forecasting"], opportunity_score: 74 },
  { business_name: "Lilly Grace Boutique", industry: "Retail (Women's Fashion)", location: "Jacksonville, FL", phone: "(904) 789-7474", website: "https://lillygrace.com/", description: "Women's clothing boutique with two locations and an online store.", gaps: ["No personalized recommendations", "Manual inventory across channels", "No AI customer service"], ai_opportunities: ["AI product recommendation engine", "Multi-channel inventory AI", "Chatbot for customer service"], opportunity_score: 73 },
  { business_name: "Green River Property Management", industry: "Property Management", location: "Jacksonville, FL", phone: "(904) 807-8331", website: "https://www.jacksonvillespropertymanagement.com/", description: "Property management focused on maximizing rental earning potential for owners.", gaps: ["No AI market analysis", "Manual tenant communication", "No AI property listings"], ai_opportunities: ["AI rental pricing tool", "Chatbot for tenant FAQs", "AI-assisted listing content"], opportunity_score: 78 },
];

export default function HitList({ onImport }) {
  const [importing, setImporting] = useState(null);
  const [imported, setImported] = useState(new Set());

  const importOne = async (biz) => {
    setImporting(biz.business_name);
    await base44.entities.Prospect.create({ ...biz, status: "new" });
    setImported((prev) => new Set([...prev, biz.business_name]));
    setImporting(null);
    if (onImport) await onImport();
  };

  const importAll = async () => {
    setImporting("all");
    const remaining = JAX_HIT_LIST.filter((b) => !imported.has(b.business_name));
    for (const biz of remaining) {
      await base44.entities.Prospect.create({ ...biz, status: "new" });
      setImported((prev) => new Set([...prev, biz.business_name]));
    }
    setImporting(null);
    if (onImport) await onImport();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-amber-400">
            <Target className="w-5 h-5" /> Jacksonville Hit List
          </h2>
          <p className="text-sm text-slate-400 mt-1">{JAX_HIT_LIST.length} pre-researched local businesses ready to pitch. Import them into your pipeline with one click.</p>
        </div>
        <button
          onClick={importAll}
          disabled={importing || imported.size === JAX_HIT_LIST.length}
          className="flex items-center gap-2 text-sm font-semibold bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 rounded-xl px-5 py-2.5 transition-colors"
        >
          {importing === "all" ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing...</> : <><Plus className="w-4 h-4" /> Import All</>}
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {JAX_HIT_LIST.map((biz) => {
          const done = imported.has(biz.business_name);
          const scoreColor = biz.opportunity_score >= 80 ? "text-emerald-400" : biz.opportunity_score >= 70 ? "text-amber-400" : "text-slate-400";
          return (
            <div key={biz.business_name} className={`bg-[#131824] border rounded-2xl p-5 flex flex-col gap-3 transition-all ${done ? "border-emerald-500/40 opacity-60" : "border-slate-800 hover:border-amber-500/40"}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-100 text-sm leading-snug">{biz.business_name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{biz.industry}</p>
                </div>
                <span className={`text-xl font-bold ${scoreColor}`}>{biz.opportunity_score}</span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{biz.description}</p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                {biz.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{biz.phone}</span>}
                {biz.website && <a href={biz.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-amber-400/70 hover:text-amber-400"><Globe className="w-3 h-3" />Website</a>}
              </div>
              <div className="flex flex-wrap gap-1 mt-auto">
                {biz.gaps.slice(0, 2).map((g, i) => (
                  <span key={i} className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg px-2 py-0.5">{g}</span>
                ))}
              </div>
              <button
                onClick={() => importOne(biz)}
                disabled={done || importing === biz.business_name}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold mt-2 bg-amber-400/10 hover:bg-amber-400/20 disabled:opacity-40 text-amber-400 border border-amber-500/30 rounded-xl px-3 py-2 transition-colors"
              >
                {done ? "Imported" : importing === biz.business_name ? <><Loader2 className="w-3 h-3 animate-spin" /> Importing...</> : <><Zap className="w-3 h-3" /> Import to Pipeline</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
