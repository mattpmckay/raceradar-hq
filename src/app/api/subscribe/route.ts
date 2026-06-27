import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const email = typeof body === 'object' && body !== null && 'email' in body
    ? String((body as { email: unknown }).email).trim()
    : ''

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
  }

  const apiKey = process.env.BEEHIIV_API_KEY
  const pubId  = process.env.BEEHIIV_PUB_ID

  // Beehiiv not yet configured — log clearly and return a graceful success
  // so the form works in staging/development before credentials are wired.
  if (!apiKey || !pubId) {
    console.warn(
      '[subscribe] Beehiiv not configured. Set BEEHIIV_API_KEY and BEEHIIV_PUB_ID in .env.local and Vercel env vars. Would have subscribed:',
      email,
    )
    return NextResponse.json({ success: true, configured: false })
  }

  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          email,
          reactivate_existing: false,
          send_welcome_email: true,
        }),
      },
    )

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error('[subscribe] Beehiiv API error:', res.status, text)
      return NextResponse.json(
        { error: 'Subscription failed. Please try again later.' },
        { status: 502 },
      )
    }

    return NextResponse.json({ success: true, configured: true })
  } catch (err) {
    console.error('[subscribe] Network error reaching Beehiiv:', err)
    return NextResponse.json(
      { error: 'Network error. Please check your connection and try again.' },
      { status: 503 },
    )
  }
}
