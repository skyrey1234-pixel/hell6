import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { prospectId } = await req.json();
    if (!prospectId) return Response.json({ error: 'Missing prospectId' }, { status: 400 });

    const prospect = await base44.asServiceRole.entities.Prospect.get(prospectId);
    if (!prospect) return Response.json({ error: 'Prospect not found' }, { status: 404 });

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
        body: JSON.stringify({ values: [['Date Added', 'Company', 'Phone', 'Industry', 'Location', 'Address', 'Website', 'Opportunity Score', 'Top Gaps', 'SMS Pitch']] })
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
          prospect.sms_pitch || ''
        ]]
      })
    });
    if (!appendRes.ok) {
      const err = await appendRes.text();
      throw new Error(`Sheets append failed: ${err}`);
    }

    return Response.json({ logged: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});