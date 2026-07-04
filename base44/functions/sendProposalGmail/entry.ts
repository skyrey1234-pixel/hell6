import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { createMimeMessage } from 'npm:mimetext@3.0.24';
import { marked } from 'npm:marked@12.0.2';

const LOGO_URL = 'https://media.base44.com/images/public/6a4874ff15694fac2c53ae2f/568856756_logoooooooooo.png';
const PORTFOLIO_URL = 'https://skyreyport-pgwsqsg8.manus.space/';
const COMPANY_NAME = 'REYTRINIDADco';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { prospectId, templateId } = await req.json();
    if (!prospectId) return Response.json({ error: 'prospectId is required' }, { status: 400 });

    const prospect = await base44.entities.Prospect.get(prospectId);
    if (!prospect.proposal) return Response.json({ error: 'No proposal to send' }, { status: 400 });
    if (!prospect.contact_email) return Response.json({ error: 'No contact email' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const profile = await profileRes.json();

    const sentDate = new Date().toLocaleDateString('en-US', {
      timeZone: 'America/New_York', year: 'numeric', month: 'long', day: 'numeric'
    });

    const demoUrl = prospect.demo_html
      ? `https://base44.app/api/apps/${Deno.env.get('BASE44_APP_ID')}/functions/viewDemo?pid=${prospectId}`
      : null;

    let template = null;
    if (templateId) {
      template = await base44.entities.EmailTemplate.get(templateId);
    }

    const fill = (str) => String(str || '')
      .replaceAll('{{business_name}}', prospect.business_name || '')
      .replaceAll('{{industry}}', prospect.industry || '')
      .replaceAll('{{location}}', prospect.location || '')
      .replaceAll('{{proposal}}', prospect.proposal || '')
      .replaceAll('{{demo_link}}', demoUrl || '')
      .replaceAll('{{portfolio_link}}', PORTFOLIO_URL)
      .replaceAll('{{company_name}}', COMPANY_NAME)
      .replaceAll('{{date}}', sentDate);

    const subject = template
      ? fill(template.subject)
      : `AI Optimization Proposal for ${prospect.business_name}`;
    const bodyMarkdown = template ? fill(template.body) : prospect.proposal;
    const proposalHtml = marked.parse(bodyMarkdown);

    const htmlBody = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;">
    <div style="background:#000000;text-align:center;padding:28px 20px;">
      <img src="${LOGO_URL}" alt="${COMPANY_NAME}" width="110" style="display:block;margin:0 auto 10px;" />
      <div style="color:#d4af37;font-size:20px;font-weight:bold;letter-spacing:3px;">${COMPANY_NAME}</div>
    </div>
    <div style="padding:32px 36px;color:#1f2937;font-size:15px;line-height:1.65;">
      <p style="color:#6b7280;font-size:13px;margin:0 0 20px;">${sentDate}</p>
      ${proposalHtml}
      ${demoUrl ? `
      <div style="text-align:center;margin:32px 0;">
        <a href="${demoUrl}" style="background:#d4af37;color:#000000;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 32px;border-radius:8px;display:inline-block;">View Your Free Demo Website</a>
        <p style="color:#6b7280;font-size:12px;margin-top:12px;">We built a live demo to show what a modern, AI-enhanced website could look like for ${prospect.business_name}.</p>
      </div>` : ''}
    </div>
    <div style="background:#000000;text-align:center;padding:22px 20px;color:#9ca3af;font-size:13px;">
      <div style="color:#d4af37;font-weight:bold;margin-bottom:6px;">${COMPANY_NAME}</div>
      <a href="${PORTFOLIO_URL}" style="color:#d4af37;text-decoration:underline;">View My Portfolio</a>
    </div>
  </div>
</body>
</html>`;

    const plainBody = `${sentDate}\n\n${bodyMarkdown}` +
      (demoUrl ? `\n\nView your free demo website: ${demoUrl}` : '') +
      `\n\n—\n${COMPANY_NAME}\nPortfolio: ${PORTFOLIO_URL}`;

    const msg = createMimeMessage();
    msg.setSender(profile.emailAddress);
    msg.setTo(prospect.contact_email);
    msg.setSubject(subject);
    msg.addMessage({ contentType: 'text/plain', data: plainBody });
    msg.addMessage({ contentType: 'text/html', data: htmlBody });

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

    // Log the send to the Google Sheets proposal log (non-fatal if it fails)
    let logged = false;
    try {
      const sheetsConn = await base44.asServiceRole.connectors.getConnection('googlesheets');
      const sheetsToken = sheetsConn.accessToken;
      const sheetsHeaders = { Authorization: `Bearer ${sheetsToken}`, 'Content-Type': 'application/json' };

      const settings = await base44.asServiceRole.entities.AppSetting.filter({ key: 'proposal_log_sheet_id' });
      let sheetId = settings.length > 0 ? settings[0].value : null;

      if (!sheetId) {
        const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
          method: 'POST',
          headers: sheetsHeaders,
          body: JSON.stringify({ properties: { title: 'REYTRINIDADco Proposal Log' } })
        });
        const created = await createRes.json();
        if (!createRes.ok) throw new Error(JSON.stringify(created));
        sheetId = created.spreadsheetId;
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:append?valueInputOption=USER_ENTERED`, {
          method: 'POST',
          headers: sheetsHeaders,
          body: JSON.stringify({ values: [['Date Sent', 'Company', 'Contact Email', 'Phone', 'Location', 'Industry', 'Template', 'Demo Link']] })
        });
        await base44.asServiceRole.entities.AppSetting.create({ key: 'proposal_log_sheet_id', value: sheetId });
      }

      const appendRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: sheetsHeaders,
        body: JSON.stringify({
          values: [[
            sentDate,
            prospect.business_name || '',
            prospect.contact_email || '',
            prospect.phone || '',
            prospect.location || '',
            prospect.industry || '',
            template ? template.name : 'Full Proposal',
            demoUrl || ''
          ]]
        })
      });
      logged = appendRes.ok;
    } catch (_logError) {
      logged = false;
    }

    return Response.json({ success: true, sentFrom: profile.emailAddress, logged });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});