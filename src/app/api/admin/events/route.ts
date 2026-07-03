import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const DEV_BYPASS = process.env.DEV_ADMIN_BYPASS === 'true'

// ─── Payload builder ──────────────────────────────────────────────────────────
// Shared between POST and PATCH so field coverage stays in sync.
// Converts empty strings → null and parses numeric strings.

function str(v: unknown): string | null {
  const s = v as string
  return s && s.trim() ? s.trim() : null
}

function num(v: unknown): number | null {
  const s = v as string
  if (!s || !String(s).trim()) return null
  const n = Number(s)
  return isNaN(n) ? null : n
}

function bool(v: unknown): boolean {
  return Boolean(v)
}

function nullableBool(v: unknown): boolean | null {
  if (v === null || v === undefined || v === '') return null
  return Boolean(v)
}

function buildEventPayload(body: Record<string, unknown>) {
  return {
    // Core
    title:           str(body.title) ?? '',
    slug:            str(body.slug) ?? '',
    event_type:      str(body.event_type) ?? 'race',
    discipline:      str(body.discipline) ?? 'Other',
    organiser:       str(body.organiser),
    series_slug:     str(body.series_slug),
    first_year_held: num(body.first_year_held),

    // Dates
    start_date: str(body.start_date) ?? '',
    end_date:   str(body.end_date),

    // Location
    country:       str(body.country) ?? '',
    region:        str(body.region),
    city:          str(body.city),
    venue_name:    str(body.venue_name),
    venue_address: str(body.venue_address),
    latitude:      num(body.latitude),
    longitude:     num(body.longitude),

    // Registration
    registration_status:
      (str(body.registration_status) as
        | 'open' | 'closing_soon' | 'sold_out' | 'waitlist_only'
        | 'coming_soon' | 'ballot_open' | 'ballot_closed' | null) ?? null,
    registration_opens_date:  str(body.registration_opens_date),
    registration_deadline:    str(body.registration_deadline),
    registration_url:         str(body.registration_url),
    registration_platform:    str(body.registration_platform),
    total_capacity:           num(body.total_capacity),

    // Pricing
    entry_fee_from:           num(body.entry_fee_from),
    entry_fee_to:             num(body.entry_fee_to),
    entry_fee_currency:       str(body.entry_fee_currency) ?? 'AUD',
    early_bird_opens_date:    str(body.early_bird_opens_date),
    early_bird_closes_date:   str(body.early_bird_closes_date),
    early_bird_price_from:    num(body.early_bird_price_from),
    early_bird_price_to:      num(body.early_bird_price_to),
    next_price_increase_date: str(body.next_price_increase_date),
    late_entry_opens_date:    str(body.late_entry_opens_date),
    late_entry_price_from:    num(body.late_entry_price_from),
    late_entry_price_to:      num(body.late_entry_price_to),

    // Ballot
    ballot_required:     bool(body.ballot_required),
    ballot_opens_date:   str(body.ballot_opens_date),
    ballot_closes_date:  str(body.ballot_closes_date),
    ballot_results_date: str(body.ballot_results_date),
    ballot_apply_url:    str(body.ballot_apply_url),

    // Waitlist
    waitlist_open:        bool(body.waitlist_open),
    waitlist_url:         str(body.waitlist_url),
    waitlist_closes_date: str(body.waitlist_closes_date),

    // Policies
    transfer_available:  nullableBool(body.transfer_available),
    transfer_deadline:   str(body.transfer_deadline),
    deferral_available:  nullableBool(body.deferral_available),
    deferral_deadline:   str(body.deferral_deadline),
    refund_available:    nullableBool(body.refund_available),
    refund_deadline:     str(body.refund_deadline),
    policies_url:        str(body.policies_url),

    // Qualification
    qualification_required: nullableBool(body.qualification_required),
    qualification_notes:    str(body.qualification_notes),
    is_qualifier:           nullableBool(body.is_qualifier),
    qualifier_for:          str(body.qualifier_for),

    // Athlete planning
    min_age:              num(body.min_age),
    max_age:              num(body.max_age),
    difficulty:           num(body.difficulty),
    surface_type:
      (str(body.surface_type) as
        | 'road' | 'trail' | 'track' | 'mixed' | 'indoor' | 'water' | 'other' | null) ?? null,
    elevation_gain_m:     num(body.elevation_gain_m),
    relay_available:      nullableBool(body.relay_available),
    team_available:       nullableBool(body.team_available),
    wheelchair_available: nullableBool(body.wheelchair_available),
    adaptive_available:   nullableBool(body.adaptive_available),

    // Race weekend
    athlete_guide_url: str(body.athlete_guide_url),
    course_map_url:    str(body.course_map_url),
    gpx_file_url:      str(body.gpx_file_url),
    results_url:       str(body.results_url),

    // Content
    description:    str(body.description),
    format_notes:   str(body.format_notes),
    whats_included: body.whats_included
      ? String(body.whats_included).split('\n').map((s) => s.trim()).filter(Boolean)
      : null,

    // Logistics
    transport_notes:     str(body.transport_notes),
    accommodation_notes: str(body.accommodation_notes),

    // Event-specific content
    event_specific_overview: str(body.event_specific_overview),

    // Travel intelligence
    public_transport_url:                str(body.public_transport_url),
    parking_url:                         str(body.parking_url),
    spectator_info_url:                  str(body.spectator_info_url),
    cbd_to_venue_public_transport_time:  str(body.cbd_to_venue_public_transport_time),
    cbd_to_venue_uber_time:              str(body.cbd_to_venue_uber_time),
    cbd_to_venue_uber_price_aud:         str(body.cbd_to_venue_uber_price_aud),
    parking_notes:                       str(body.parking_notes),
    spectator_notes:                     str(body.spectator_notes),
    travel_source_url:                   str(body.travel_source_url),
    travel_last_verified_date:           str(body.travel_last_verified_date),
    travel_data_confidence:              num(body.travel_data_confidence),

    // Media
    hero_image_url: str(body.hero_image_url),
    image_url:      str(body.image_url),
    website_url:    str(body.website_url),

    // Provenance
    data_confidence: num(body.data_confidence),

    // Visibility
    event_status:
      (str(body.event_status) as
        | 'confirmed' | 'postponed' | 'cancelled' | 'completed' | 'tbc' | null) ?? 'confirmed',
    is_published: bool(body.is_published),
    is_featured:  bool(body.is_featured),
  }
}

// ─── POST /api/admin/events ───────────────────────────────────────────────────

export async function POST(request: Request) {
  if (!DEV_BYPASS) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body  = await request.json() as Record<string, unknown>
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('events')
    .insert(buildEventPayload(body))
    .select('id, slug')
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'An event with that slug already exists.' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
