import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const pid = url.searchParams.get('pid');
    if (!pid) return new Response('Missing demo id', { status: 400 });

    const prospect = await base44.asServiceRole.entities.Prospect.get(pid);
    if (!prospect || !prospect.demo_html) return new Response('Demo not found', { status: 404 });

    return new Response(prospect.demo_html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (error) {
    return new Response('Demo not found', { status: 404 });
  }
});