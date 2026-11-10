import { base44 } from "@/api/base44Client";
import { appParams } from "@/lib/app-params";

export function auditUrl(prospect) {
  return `https://base44.app/api/apps/${appParams.appId}/functions/viewAudit?pid=${prospect.id}`;
}

export async function ensureAuditPage(prospect) {
  if (prospect.audit_html) return auditUrl(prospect);
  const score = prospect.opportunity_score || 5;
  const premium = /law|attorney|legal|medical|dental|real estate/i.test(prospect.industry || "");
  const setup = premium ? "$2,500–$5,000" : score >= 8 ? "$1,500–$3,500" : "$1,000–$2,500";
  const monthly = premium ? "$750–$1,500/mo" : score >= 8 ? "$400–$800/mo" : "$250–$500/mo";
  const html = await base44.integrations.Core.InvokeLLM({
    prompt: `Create a complete standalone HTML page (inline CSS, no external resources) titled "AI Business Leak Audit — ${prospect.business_name}". It's a personalized audit report from Skyrey (Skyler Rey Trinidad) at The Finnese Group LLC (https://skyreyport.com), an AI optimization consultant & product systems builder in Jacksonville FL, for ${prospect.business_name}, a ${prospect.industry || "local"} business in ${prospect.location || "Jacksonville, FL"}.

Business description: ${prospect.description || "n/a"}
Their specific problems (the "leaks"): ${(prospect.gaps || []).join("; ") || "weak digital presence"}
AI solutions that would fix them: ${(prospect.ai_opportunities || []).join("; ") || "AI chatbot, automated follow-up, review management"}

The page must clearly explain, section by section: 1) each specific problem and exactly how it's costing them leads or money, 2) the exact AI fix Skyrey at The Finnese Group would build for it, 3) a "Verified Proof & Systems Built" credibility section highlighting Skyrey's 24 documented case files at https://skyreyport.com (including Real Estate Wealth Engine, Business Operator Dashboard, Property Discovery & Underwriting Prototype, Ghost Listing Predictor, TacticalEdge Soccer AI, LiveEdge AI, and CraveMatch AI) with a clickable link to https://skyreyport.com, 4) an "Investment" section presenting the recommended package — one-time setup of ${setup} plus a ${monthly} retainer — framed against what the leaks are likely costing them each month so it feels like an obvious win, 5) a closing call-to-action to get started — text or call Skyrey at (904) 330-4789, email Thewayshop222@gmail.com, or explore verified work at https://skyreyport.com. Display the phone number, email, and portfolio link prominently in the call-to-action section, with the phone as a tap-to-text link (sms:9043304789) and the email as a mailto link.

Style: dark professional theme (deep navy background, amber/gold accents), clean modern typography, mobile-friendly, feels like a premium consulting report. Return ONLY the raw HTML, no markdown fences.`
  });
  const clean = String(html).replace(/^```html?\s*/i, "").replace(/```\s*$/, "").trim();
  await base44.entities.Prospect.update(prospect.id, { audit_html: clean });
  return auditUrl(prospect);
}