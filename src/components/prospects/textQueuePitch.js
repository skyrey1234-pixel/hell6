import { base44 } from "@/api/base44Client";
import { appParams } from "@/lib/app-params";

export async function generateSmsPitch(prospect) {
  const demoUrl = prospect.demo_html
    ? `https://base44.app/api/apps/${appParams.appId}/functions/viewDemo?pid=${prospect.id}`
    : null;
  const sms = await base44.integrations.Core.InvokeLLM({
    prompt: `Write a short, confident, curiosity-driven text message (under 300 characters, no emojis) from Skyrey at REYTRINIDADco, an AI optimization consultant in Jacksonville FL who specializes in real estate, to ${prospect.business_name}, a ${prospect.industry || "real estate"} professional in ${prospect.location || "their area"}. Their gaps: ${(prospect.gaps || []).join(", ")}.

Background: I built SellerSignal, a real estate AI, plus AI systems for Blackq Empire University, Liza's Cleaning Co., and local law firms. I speak realtor — leads, listings, follow-up, closings. I'm not a generic marketer — I'm an AI systems builder.

Tone: "I researched your business and found a few places where you may be losing buyer or seller leads online. This is not a generic website pitch — I put together an AI leak audit showing where your current system may be weak and how I'd fix it." Direct and sharp, never desperate or overly polite. Reference ONE specific leak from their gaps. If it fits naturally, mention they can reach me at (904) 330-4789 or Thewayshop222@gmail.com.${demoUrl ? " End by saying you also built them a free demo site they can check out at the link below (do NOT include any URL yourself)." : ' End with "Want me to send it over?"'} Return only the text message.`
  });
  const pitch = String(sms).trim() + (demoUrl ? `\n\n${demoUrl}` : "");
  await base44.entities.Prospect.update(prospect.id, { sms_pitch: pitch });
  return pitch;
}