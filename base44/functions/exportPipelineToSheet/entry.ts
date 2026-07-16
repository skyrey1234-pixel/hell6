import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const prospects = await base44.asServiceRole.entities.Prospect.list('-updated_date', 500);
    const appId = Deno.env.get('BASE44_APP_ID');
    const base = `https://base44.app/api/apps/${appId}/functions`;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlesheets');
    const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    const settings = await base44.asServiceRole.entities.AppSetting.filter({ key: 'pipeline_sheet_id' });
    let sheetId = settings.length > 0 ? settings[0].value : null;

    if (!sheetId) {
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers,
        body: JSON.stringify({ properties: { title: 'REYTRINIDADco Pipeline' } })
      });
      const created = await createRes.json();
      if (!createRes.ok) throw new Error(JSON.stringify(created));
      sheetId = created.spreadsheetId;
      await base44.asServiceRole.entities.AppSetting.create({ key: 'pipeline_sheet_id', value: sheetId });
    }

    const values = [
      ['Business', 'Phone', 'Industry', 'Location', 'Address', 'Website', 'Score', 'Status', 'Demo Site', 'Audit Link', 'SMS Pitch'],
      ...prospects.map((p) => [
        p.business_name || '', p.phone || '', p.industry || '', p.location || '', p.address || '',
        p.website || '', p.opportunity_score || '', p.status || '',
        p.demo_html ? `${base}/viewDemo?pid=${p.id}` : '',
        p.audit_html ? `${base}/viewAudit?pid=${p.id}` : '',
        p.sms_pitch || ''
      ])
    ];

    const clearRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:Z10000:clear`, {
      method: 'POST', headers
    });
    if (!clearRes.ok) throw new Error(await clearRes.text());

    const putRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ values })
    });
    if (!putRes.ok) throw new Error(await putRes.text());

    return Response.json({ synced: prospects.length, sheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});