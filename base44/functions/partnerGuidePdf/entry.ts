import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const doc = new jsPDF();
    const left = 14;
    let y = 20;

    const heading = (text) => {
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(text, left, y);
      y += 8;
    };
    const body = (text) => {
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(text, 180);
      for (const line of lines) {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(line, left, y);
        y += 5;
      }
      y += 3;
    };

    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('REYTRINIDADco Partner Guide', left, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Skyrey · Jacksonville, FL · (904) 330-4789 · Thewayshop222@gmail.com', left, y);
    y += 12;

    heading('Your Job: Get the Yes to the Audit');
    body('You are not closing the sale — Skyrey closes. Your only job is getting the business owner to say yes to seeing their free audit. Use this line:');
    body('"My partner Skyrey builds AI systems for local businesses. He ran a free audit on your business and found a few places you\'re losing leads — missed calls going unanswered, no way to book online, reviews sitting unreplied. Can I send you the audit?"');

    heading('Easiest Things to Lead With');
    body('1. Missed-Call Text-Back / AI Receptionist ($200-$500/mo) — easiest yes for bars, salons, cleaners, restaurants. "Every missed call texts them back automatically."');
    body('2. Chatbot or Booking Widget ($750-$1,500 one-time) — quick win if they already have a website.');
    body('3. AI-Enhanced Website Build ($1,500-$3,500 one-time) — for businesses with no site or an outdated one.');

    heading('Pricing (What Skyrey Closes At)');
    body('Standard Package (typical local business): $1,000 setup + $350/mo');
    body('High-Opportunity Package: $1,500-$3,500 setup + $400-$800/mo');
    body('Premium (Law / Medical / Real Estate): $2,500-$5,000 setup + $750-$1,500/mo — these industries pay 2-3x.');
    body('Review Management + Automated Follow-Up: $150-$300/mo');
    body('Full AI Operations Package: $500-$1,500/mo');
    body('Rules: anchor to what they are losing, lead with setup fee + monthly retainer, never below $150/mo for anything ongoing.');

    heading('Your Pay (Commission)');
    body('- 15-20% of the setup fee on every deal you source that closes ($150-$200 on a standard $1,000 setup).');
    body('- 10% of the monthly retainer for the first 6 months the client stays ($35/mo on a $350 retainer).');
    body('- $25-$50 per booked audit call that actually shows up (optional spiff).');
    body('A single standard client is worth roughly $360-$410 to you over 6 months. Commission-only until you consistently bring 2+ closed deals a month, then we revisit.');

    const pdfBytes = new Uint8Array(doc.output('arraybuffer'));
    const file = new File([pdfBytes], 'REYTRINIDADco-Partner-Guide.pdf', { type: 'application/pdf' });
    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });
    return Response.json({ file_url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});