import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ─── POST /api/submit-event ───────────────────────────────────────────────────
// Public — no auth required. Validates required fields, then inserts a draft
// event with is_published=false and submission_source='organiser_submission'.
// Uses the service-role client because the anon role cannot write to events.

export async function POST(request: Request) {
  const body = await request.json() as Record<string, unknown>

  const title          = typeof body.title         === 'string' ? body.title.trim()          : ''
  const discipline     = typeof body.discipline    === 'string' ? body.discipline.trim()      : ''
  const start_date     = typeof body.start_date    === 'string' ? body.start_date.trim()      : ''
  const country        = typeof body.country       === 'string' ? body.country.trim()         : ''
  const submitter_name  = typeof body.submitter_name  === 'string' ? body.submitter_name.trim()  : ''
  const submitter_email = typeof body.submitter_email === 'string' ? body.submitter_email.trim() : ''

  // ── Required field validation ────────────────────────────────────────────────
  const errors: string[] = []
  if (!title)           errors.push('Event name is required.')
  if (!discipline)      errors.push('Discipline is required.')
  if (!start_date)      errors.push('Start date is required.')
  if (!country)         errors.push('Country is required.')
  if (!submitter_name)  errors.push('Your name or organisation is required.')
  if (!submitter_email) errors.push('Contact email is required.')
  else if (!EMAIL_RE.test(submitter_email)) errors.push('Contact email is not valid.')

  if (start_date && isNaN(Date.parse(start_date))) errors.push('Start date is not a valid date.')

  if (errors.length > 0) {
    return NextResponse.json({ error: errors[0] }, { status: 400 })
  }

  // ── Optional fields ──────────────────────────────────────────────────────────
  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)

  // ── Slug generation with collision handling ──────────────────────────────────
  const year = new Date(start_date).getFullYear()
  const baseSlug = slugify(`${title} ${year}`)
  const admin = createAdminClient()

  let slug = baseSlug
  for (let i = 2; i <= 6; i++) {
    const { data: existing } = await admin
      .from('events')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (!existing) break
    slug = `${baseSlug}-${i}`
  }

  // ── Insert ───────────────────────────────────────────────────────────────────
  const { error } = await admin.from('events').insert({
    title,
    slug,
    discipline,
    event_type:         'race',
    start_date,
    country,
    city:               str(body.city),
    region:             str(body.region),
    organiser:          submitter_name,
    website_url:        str(body.website_url),
    registration_url:   str(body.registration_url),
    description:        str(body.description),
    is_published:       false,
    event_status:       'tbc',
    submission_source:  'organiser_submission',
    submitter_name,
    submitter_email,
  })

  if (error) {
    return NextResponse.json({ error: 'Submission failed. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ submitted: true }, { status: 201 })
}
