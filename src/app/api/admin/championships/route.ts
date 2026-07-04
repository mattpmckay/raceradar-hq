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

function str(v: unknown): string | null {
  const s = v as string
  return s && s.trim() ? s.trim() : null
}

function num(v: unknown): number | null {
  const s = String(v ?? '')
  if (!s.trim()) return null
  const n = Number(s)
  return isNaN(n) ? null : n
}

function buildPayload(body: Record<string, unknown>) {
  return {
    name:        str(body.name) ?? '',
    slug:        str(body.slug) ?? '',
    discipline:  str(body.discipline) ?? '',
    country:     str(body.country),
    season_year: num(body.season_year),
    description: str(body.description),
    website_url: str(body.website_url),
    organiser:   str(body.organiser),
    is_published: Boolean(body.is_published),
  }
}

export async function POST(request: Request) {
  const authed = await requireAdmin()
  if (!authed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body  = await request.json() as Record<string, unknown>
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('championships')
    .insert(buildPayload(body))
    .select('id, slug')
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'A championship with that slug already exists.' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
