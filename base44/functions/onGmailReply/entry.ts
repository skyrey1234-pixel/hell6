import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const messageIds = body.data?.new_message_ids ?? [];
    if (messageIds.length === 0) return Response.json({ processed: 0 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    const prospects = await base44.asServiceRole.entities.Prospect.filter({ status: 'proposal_sent' }, '-updated_date', 500);
    const byEmail = {};
    for (const p of prospects) {
      if (p.contact_email) byEmail[p.contact_email.toLowerCase()] = p;
    }

    let matched = 0;
    for (const messageId of messageIds) {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata&metadataHeaders=From`,
        { headers: authHeader }
      );
      if (!res.ok) continue;
      const message = await res.json();
      const fromHeader = (message.payload?.headers || []).find((h) => h.name.toLowerCase() === 'from')?.value || '';
      const emailMatch = fromHeader.match(/[\w.+-]+@[\w.-]+\.[\w]+/);
      if (!emailMatch) continue;
      const senderEmail = emailMatch[0].toLowerCase();

      const prospect = byEmail[senderEmail];
      if (!prospect) continue;

      const snippet = message.snippet || '';
      const replyNote = `\n\n--- Reply received ${new Date().toISOString().slice(0, 10)} ---\n${snippet}`;
      await base44.asServiceRole.entities.Prospect.update(prospect.id, {
        status: 'replied',
        last_reply: snippet,
        last_reply_date: new Date().toISOString(),
        notes: (prospect.notes || '') + replyNote
      });
      matched++;
    }

    return Response.json({ processed: messageIds.length, matched });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});