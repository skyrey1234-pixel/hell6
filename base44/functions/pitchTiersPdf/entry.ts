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
      if (y > 260) { doc.addPage(); y = 20; }
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
    doc.text('REYTRINIDADco Pitch & Pricing Sheet', left, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Skyrey · Jacksonville, FL · (904) 330-4789 · Thewayshop222@gmail.com', left, y);
    y += 12;

    heading('Step 1: Ask, Don\'t Pitch');
    body('Start every conversation by asking the owner what THEY need. Ask questions like: "What\'s the most annoying part of running this place?" "Where do you feel like you\'re losing customers?" "What do you wish ran on autopilot?"');
    body('Then explain how AI can solve exactly that — missed calls answered automatically, online booking, review follow-ups, a smarter website, custom tools. Listen first, then match them to one of the three packages below.');

    heading('Package 1 — Starter: $1,000 setup + $300/mo maintenance');
    body('For local places that can\'t afford too much. Covers the essential AI setup to stop losing leads, plus ongoing maintenance.');
    body('ON-THE-SPOT DEAL: If the business or person wants to close the deal on the spot, tell them Skyrey will send the invoice — $500 deposit now, $500 when the work is done.');

    heading('Package 2 — Growth: $1,500-$2,000 setup + $100/mo maintenance');
    body('For businesses that want more — a bigger build with more AI features, with a lower monthly maintenance fee.');
    body('ON-THE-SPOT DEAL: $750 deposit now, the rest when the work is done. Skyrey sends the invoice.');

    heading('Package 3 — Premium: $2,500 setup + $100/mo maintenance');
    body('Our best AI services. For businesses that want a custom app or anything else custom-built. Full AI systems tailored to exactly what they need.');
    body('ON-THE-SPOT DEAL: $1,250 deposit now, $1,250 when the work is done. Skyrey sends the invoice.');

    heading('Closing');
    body('Once they pick a package, Skyrey handles the invoice and the build. But your job is NOT done at the yes.');

    heading('After the Yes: Keep Following Up');
    body('Your job continues after the sale. Once the job is done, keep checking in with the client — ask how everything is running, if they\'re happy, and if there\'s anything else they need.');
    body('Follow up regularly: a week after delivery, then monthly. Happy clients give referrals, leave reviews, and upgrade to bigger packages — which means more money for you. Staying in touch is how one sale turns into many.');

    const pdfBytes = new Uint8Array(doc.output('arraybuffer'));
    const file = new File([pdfBytes], 'REYTRINIDADco-Pitch-Pricing-Sheet.pdf', { type: 'application/pdf' });
    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });
    return Response.json({ file_url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});