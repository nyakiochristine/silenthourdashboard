import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type RsvpStatus = 'confirmed' | 'waitlisted'

type RsvpRequest = {
  sessionId: number
  status: RsvpStatus
}

serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authorization = request.headers.get('Authorization')
    if (!authorization) throw new Error('You must be signed in.')

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authorization } } },
    )
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user?.email) throw new Error('Unable to identify the signed-in member.')

    const { sessionId, status } = await request.json() as RsvpRequest
    if (!sessionId || !['confirmed', 'waitlisted'].includes(status)) throw new Error('Invalid RSVP request.')

    const { data: session, error: sessionError } = await userClient
      .from('meetup_sessions')
      .select('session_date, time, location, activity, description')
      .eq('id', sessionId)
      .single()
    if (sessionError || !session) throw new Error('Meetup not found.')

    const isWaitlisted = status === 'waitlisted'
    const subject = isWaitlisted ? 'You are on the Meet & Read Nbo waitlist' : 'Your Meet & Read Nbo RSVP is confirmed'
    const heading = isWaitlisted ? 'You are on the waitlist' : 'Your place is saved'
    const copy = isWaitlisted
      ? 'This gathering is currently full. We will contact you if a seat becomes available.'
      : 'Bring any book and settle in for a quiet hour of reading together.'
    const html = `
      <div style="font-family:Arial,sans-serif;color:#1B1B18;max-width:560px;margin:auto;padding:28px">
        <p style="letter-spacing:2px;text-transform:uppercase;color:#2B593F;font-size:11px;font-weight:700">Meet & Read Nbo</p>
        <h1 style="font-family:Georgia,serif;font-size:32px;font-weight:400">${heading}</h1>
        <p style="font-size:16px;line-height:1.6;color:#6F6C66">${copy}</p>
        <div style="background:#F1F4ED;border-radius:14px;padding:20px;margin:24px 0">
          <p style="margin:0 0 8px;font-size:12px;color:#2B593F;font-weight:700;letter-spacing:1px;text-transform:uppercase">${session.session_date}${session.time ? ` · ${session.time}` : ''}</p>
          <p style="margin:0;font-family:Georgia,serif;font-size:23px">${session.location}</p>
          ${session.activity ? `<p style="margin:8px 0 0;color:#6F6C66">${session.activity}</p>` : ''}
        </div>
        <p style="font-size:13px;color:#A09D97">Read what you want, in comfortable silence, together.</p>
      </div>`

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: Deno.env.get('RESEND_FROM_EMAIL'), to: [user.email], subject, html }),
    })
    if (!resendResponse.ok) throw new Error(`Resend rejected the email: ${await resendResponse.text()}`)

    return Response.json({ sent: true }, { headers: corsHeaders })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to send RSVP confirmation.'
    return Response.json({ error: message }, { status: 400, headers: corsHeaders })
  }
})
