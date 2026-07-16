import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('REYTRINIDADco Pricing Guide', 14, 20);
    doc.setFontSize(10);
    doc.text('Skyrey · Jacksonville, FL · (904) 330-4789 · Thewayshop222@gmail.com', 14, 28);

    const items = [
      ['AI-Enhanced Website Build (one-time)', '$1,500 - $3,500', 'Businesses with no or outdated site'],
      ['Chatbot / Booking Widget (one-time)', '$750 - $1,500', 'Quick win on an existing site'],
      ['Missed-Call Text-Back + AI Receptionist', '$200 - $500/mo', 'Bars, restaurants, salons, cleaners'],
      ['Review Mgmt + Automated Follow-Up', '$150 - $300/mo', 'Under 4.5 stars or few reviews'],
      ['Full AI Operations Package', '$500 - $1,500/mo', '3+ leaks found in the audit'],
      ['Premium (Law / Medical / Real Estate)', '$2,500 - $5,000 setup + $750 - $1,500/mo', 'These industries pay 2-3x'],
      ['Standard Package (default pitch)', '$1,000 setup + $350/mo', 'Typical local business, score 5-7'],
      ['High-Opportunity Package', '$1,500 - $3,500 setup + $400 - $800/mo', 'Opportunity score 8+']
    ];

    let y = 42;
    for (const [name, price, note] of items) {
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(name, 14, y);
      doc.setFont(undefined, 'normal');
      doc.text(price, 14, y + 6);
      doc.setFontSize(10);
      doc.text(note, 14, y + 12);
      y += 22;
      if (y > 270) { doc.addPage(); y = 20; }
    }

    doc.setFontSize(10);
    doc.text('Rules: anchor to what they are losing, lead with setup fee + monthly retainer,', 14, y);
    doc.text('never go below $150/mo for anything ongoing.', 14, y + 5);

    const pdfBytes = new Uint8Array(doc.output('arraybuffer'));
    const file = new File([pdfBytes], 'REYTRINIDADco-Pricing-Guide.pdf', { type: 'application/pdf' });
    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });
    return Response.json({ file_url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});