import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { createMimeMessage } from 'npm:mimetext@3.0.24';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { prospectId } = await req.json();
    if (!prospectId) return Response.json({ error: 'prospectId is required' }, { status: 400 });

    const prospect = await base44.entities.Prospect.get(prospectId);
    if (!prospect.proposal) return Response.json({ error: 'No proposal to send' }, { status: 400 });
    if (!prospect.contact_email) return Response.json({ error: 'No contact email' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const profile = await profileRes.json();

    const msg = createMimeMessage();
    msg.setSender(profile.emailAddress);
    msg.setTo(prospect.contact_email);
    msg.setSubject(`AI Optimization Proposal for ${prospect.business_name}`);
    msg.addMessage({ contentType: 'text/plain', data: prospect.proposal });

    const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: msg.asEncoded() })
    });
    if (!sendRes.ok) {
      const err = await sendRes.text();
      return Response.json({ error: `Gmail send failed: ${err}` }, { status: 500 });
    }

    await base44.entities.Prospect.update(prospectId, { status: 'proposal_sent' });
    return Response.json({ success: true, sentFrom: profile.emailAddress });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});