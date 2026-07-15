import { base44 } from "@/api/base44Client";

export async function researchProspect(prospect) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Research the real local business "${prospect.business_name}" (${prospect.industry || "unknown industry"}) in ${prospect.location || "Jacksonville, FL"}${prospect.website ? `, website: ${prospect.website}` : ""}. Look at their online presence, reviews, website, and how they operate.

Then, acting as an AI optimization consultant (REYTRINIDADco, Jacksonville FL), identify how AI could help THIS SPECIFIC business — the recommendations must be tailored to what this company actually does and struggles with, not generic. Any area counts: lead capture, booking, missed calls, reviews, follow-up, content, internal operations, customer service, etc.

Provide: a short summary of what you found about them, 3-5 specific problems/leaks unique to them, 3-5 specific AI solutions matched to those problems, and an opportunity score 1-100.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        summary: { type: "string" },
        gaps: { type: "array", items: { type: "string" } },
        ai_opportunities: { type: "array", items: { type: "string" } },
        opportunity_score: { type: "number" }
      }
    }
  });
  await base44.entities.Prospect.update(prospect.id, {
    description: result.summary || prospect.description,
    gaps: result.gaps || prospect.gaps,
    ai_opportunities: result.ai_opportunities || prospect.ai_opportunities,
    opportunity_score: result.opportunity_score || prospect.opportunity_score
  });
  return result;
}