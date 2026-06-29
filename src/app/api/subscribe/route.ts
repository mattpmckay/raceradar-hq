import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  const rawCategories =
    typeof body === 'object' && body !== null && 'categories' in body
      ? (body as { categories: unknown }).categories
      : undefined

  const categories: string[] = Array.isArray(rawCategories)
    ? rawCategories.filter((c): c is string => typeof c === 'string')
    : []

  // ── Save to Supabase ────────────────────────────────────────────────────
  // Uses anon key + "anyone can subscribe" RLS policy — no auth required.
  const supabase = await createClient()
  const { error: dbError } = await supabase
    .from('calendar_subscriptions')
    .insert({ email, categories, source: 'calendar_page' })

  if (dbError) {
    console.error('[subscribe] Supabase insert error:', dbError.code, dbError.message)
    // Don't fail the whole request if DB is unavailable — still try Beehiiv
  }

  // ── Send to Beehiiv ─────────────────────────────────────────────────────
  const apiKey = process.env.BEEHIIV_API_KEY
  const pubId  = process.env.BEEHIIV_PUB_ID

  if (!apiKey || !pubId) {
    console.warn(
      '[subscribe] Beehiiv not configured — would have subscribed:',
      email,
      categories,
    )
    return NextResponse.json({ success: true, configured: false })
  }

  // Note: the "calendar_categories" custom field must be created in your
  // Beehiiv dashboard before this will attach to subscribers.
  const beehiivBody: Record<string, unknown> = {
    email,
    reactivate_existing: false,
    send_welcome_email: true,
  }

  if (categories.length > 0) {
    beehiivBody.custom_fields = [
      { name: 'calendar_categories', value: categories.join(',') },
    ]
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
        body: JSON.stringify(beehiivBody),
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
