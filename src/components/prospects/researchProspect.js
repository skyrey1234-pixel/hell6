import { base44 } from "@/api/base44Client";

export async function researchProspect(prospect) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Research the real real-estate professional or business "${prospect.business_name}" (${prospect.industry || "realtor/brokerage"}) in ${prospect.location || "Jacksonville, FL"}${prospect.website ? `, website: ${prospect.website}` : ""}. Look at their real online presence: their listings, Zillow/Realtor.com profiles, reviews, website, social media, and how they capture and follow up with buyer and seller leads.

Then, acting as an AI optimization consultant (REYTRINIDADco, Jacksonville FL) who specializes in real estate (built SellerSignal, a real estate AI), identify how AI could help THIS SPECIFIC agent or brokerage — the recommendations must be tailored to their actual market and pain points, not generic. Think: buyer-lead qualification, instant follow-up on inquiries, missed calls during showings, home-valuation lead magnets, open-house follow-up, listing content, review generation, transaction coordination.

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