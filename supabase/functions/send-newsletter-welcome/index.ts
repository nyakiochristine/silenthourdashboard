import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }

serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers })
  try {
    const { email } = await request.json() as { email: string }
    if (!email || !email.includes('@')) throw new Error('A valid email is required.')
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: Deno.env.get('RESEND_FROM_EMAIL'), to: [email], subject: 'Welcome to the Meet & Read Nbo reading list', html: '<div style="font-family:Arial,sans-serif;max-width:560px;padding:28px;color:#1B1B18"><p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#6B1F36;font-weight:bold">Meet & Read Nbo</p><h1 style="font-family:Georgia,serif;font-weight:400">Welcome to the reading list.</h1><p style="color:#6F6C66;line-height:1.6">You will be the first to hear about our quiet reading sessions, craft activities, and little bookish notes from Nairobi.</p><p style="color:#6F6C66">Read what you want, in comfortable silence, together.</p></div>' }) })
    if (!response.ok) throw new Error(await response.text())
    return Response.json({ sent: true }, { headers })
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : 'Unable to send welcome email.' }, { status: 400, headers }) }
})
