import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const email =
    typeof body === 'object' && body !== null && 'email' in body
      ? String((body as { email: unknown }).email).trim()
      : ''

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
  }

  const supabase = await createClient()

  const [{ data: event }, { data: { user } }] = await Promise.all([
    supabase
      .from('events')
      .select('id')
      .eq('slug', slug)
      .eq('is_published', true)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!event) {
    return NextResponse.json({ error: 'Event not found.' }, { status: 404 })
  }

  const { error: dbError } = await supabase.from('event_reminders').insert({
    event_id: event.id,
    email,
    user_id: user?.id ?? null,
    reminder_type: 'registration_opens',
  })

  if (dbError) {
    if (dbError.code === '23505') {
      return NextResponse.json({ success: true, message: 'already_subscribed' })
    }
    console.error('[remind] insert error:', dbError.code, dbError.message)
    return NextResponse.json({ error: 'Failed to save. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
