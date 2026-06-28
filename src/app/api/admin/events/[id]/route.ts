import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const DEV_BYPASS = process.env.DEV_ADMIN_BYPASS === 'true'

async function requireAdmin() {
  if (DEV_BYPASS) return true
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return user
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authed = await requireAdmin()
  if (!authed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await request.json() as Record<string, unknown>
  const admin = await createAdminClient()

  const { data, error } = await admin.from('events').update({
    title: body.title as string,
    slug: body.slug as string,
    event_type: body.event_type as string,
    discipline: body.discipline as string,
    start_date: body.start_date as string,
    end_date: (body.end_date as string) || null,
    registration_deadline: (body.registration_deadline as string) || null,
    registration_status: (body.registration_status as 'open' | 'closing_soon' | 'sold_out' | 'coming_soon') || null,
    country: body.country as string,
    region: (body.region as string) || null,
    city: (body.city as string) || null,
    organiser: (body.organiser as string) || null,
    description: (body.description as string) || null,
    website_url: (body.website_url as string) || null,
    image_url: (body.image_url as string) || null,
    is_published: Boolean(body.is_published),
    is_featured: Boolean(body.is_featured),
  }).eq('id', id).select('id, slug').single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'A event with that slug already exists.' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authed = await requireAdmin()
  if (!authed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const admin = await createAdminClient()
  const { error } = await admin.from('events').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
