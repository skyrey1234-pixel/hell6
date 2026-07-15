import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const prospectId = payload?.event?.entity_id || payload?.prospectId;
    if (!prospectId) return Response.json({ error: 'No prospect id' }, { status: 400 });

    let prospect = payload?.data;
    if (!prospect) {
      prospect = await base44.asServiceRole.entities.Prospect.get(prospectId);
    }

    const conn = await base44.asServiceRole.connectors.getConnection('googlesheets');
    const headers = { Authorization: `Bearer ${conn.accessToken}`, 'Content-Type': 'application/json' };

    const settings = await base44.asServiceRole.entities.AppSetting.filter({ key: 'business_search_log_sheet_id' });
    let sheetId = settings.length > 0 ? settings[0].value : null;

    if (!sheetId) {
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers,
        body: JSON.stringify({ properties: { title: 'REYTRINIDADco Business Search Log' } })
      });
      const created = await createRes.json();
      if (!createRes.ok) throw new Error(JSON.stringify(created));
      sheetId = created.spreadsheetId;
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ values: [['Date Added', 'Business Name', 'Industry', 'Location', 'Address', 'Phone', 'Website', 'Opportunity Score', 'Gaps', 'AI Opportunities', 'Description']] })
      });
      await base44.asServiceRole.entities.AppSetting.create({ key: 'business_search_log_sheet_id', value: sheetId });
    }

    const dateAdded = new Date().toLocaleDateString('en-US', {
      timeZone: 'America/New_York', year: 'numeric', month: 'long', day: 'numeric'
    });

    const appendRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        values: [[
          dateAdded,
          prospect.business_name || '',
          prospect.industry || '',
          prospect.location || '',
          prospect.address || '',
          prospect.phone || '',
          prospect.website || '',
          prospect.opportunity_score ?? '',
          (prospect.gaps || []).join('; '),
          (prospect.ai_opportunities || []).join('; '),
          prospect.description || ''
        ]]
      })
    });
    if (!appendRes.ok) {
      const err = await appendRes.text();
      return Response.json({ error: `Sheets append failed: ${err}` }, { status: 500 });
    }

    return Response.json({ success: true, sheetId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});