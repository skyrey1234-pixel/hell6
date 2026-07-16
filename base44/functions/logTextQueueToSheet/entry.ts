import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    let prospect = payload.data;
    if (!prospect && payload.event?.entity_id) {
      prospect = await base44.asServiceRole.entities.Prospect.get(payload.event.entity_id);
    }
    if (!prospect) return Response.json({ skipped: true, reason: 'no data' });

    // Only log prospects with a phone number located in Jacksonville, FL
    const loc = `${prospect.location || ''} ${prospect.address || ''}`.toLowerCase();
    if (!prospect.phone || !loc.includes('jacksonville')) {
      return Response.json({ skipped: true, reason: 'not a Jacksonville text-queue prospect' });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlesheets');
    const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    const settings = await base44.asServiceRole.entities.AppSetting.filter({ key: 'text_queue_sheet_id' });
    let sheetId = settings.length > 0 ? settings[0].value : null;

    if (!sheetId) {
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers,
        body: JSON.stringify({ properties: { title: 'REYTRINIDADco Jacksonville Text Queue' } })
      });
      const created = await createRes.json();
      if (!createRes.ok) throw new Error(JSON.stringify(created));
      sheetId = created.spreadsheetId;
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ values: [['Date Added', 'Company', 'Phone', 'Industry', 'Location', 'Address', 'Website', 'Opportunity Score', 'Top Gaps', 'SMS Pitch', 'Audit Link']] })
      });
      await base44.asServiceRole.entities.AppSetting.create({ key: 'text_queue_sheet_id', value: sheetId });
    }

    const appendRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        values: [[
          new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York' }),
          prospect.business_name || '',
          prospect.phone || '',
          prospect.industry || '',
          prospect.location || '',
          prospect.address || '',
          prospect.website || '',
          prospect.opportunity_score || '',
          (prospect.gaps || []).slice(0, 3).join('; '),
          prospect.sms_pitch || '',
          `https://base44.app/api/apps/${Deno.env.get('BASE44_APP_ID')}/functions/viewAudit?pid=${prospect.id || payload.event?.entity_id}`
        ]]
      })
    });
    if (!appendRes.ok) {
      const err = await appendRes.text();
      throw new Error(`Sheets append failed: ${err}`);
    }

    return Response.json({ logged: true, sheetId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});