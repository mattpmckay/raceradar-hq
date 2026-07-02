import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { TablesInsert } from '@/types/supabase'

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

function num(v: unknown): number {
  const n = Number(v)
  return isNaN(n) || n < 1 ? 1 : n
}

type RequirementInsert = TablesInsert<'challenge_requirements'> & { challenge_id: string }

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authed = await requireAdmin()
  if (!authed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id: challenge_id } = await params
  const body = await request.json() as Record<string, unknown>
  const admin = await createAdminClient()

  const requirement_type = str(body.requirement_type) as
    'specific_event' | 'discipline' | 'geographic' | 'any_event' | null

  if (!requirement_type) return NextResponse.json({ error: 'requirement_type is required' }, { status: 400 })

  const display_label = str(body.display_label)
  if (!display_label) return NextResponse.json({ error: 'display_label is required' }, { status: 400 })

  const payload: RequirementInsert = {
    challenge_id,
    requirement_type,
    display_label,
    min_count:  num(body.min_count),
    sort_order: num(body.sort_order ?? 0),
    event_id:   null,
    discipline: null,
    country:    null,
    region:     null,
  }

  if (requirement_type === 'specific_event') {
    if (!body.event_id) return NextResponse.json({ error: 'event_id required for specific_event' }, { status: 400 })
    payload.event_id = str(body.event_id)
  } else if (requirement_type === 'discipline') {
    if (!body.discipline) return NextResponse.json({ error: 'discipline required for discipline type' }, { status: 400 })
    payload.discipline = str(body.discipline)
  } else if (requirement_type === 'geographic') {
    payload.country = str(body.country)
    payload.region  = str(body.region)
  }

  const { data, error } = await admin
    .from('challenge_requirements')
    .insert(payload)
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
