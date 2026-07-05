'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/utils'
import type { Tables } from '@/types/supabase'

type EventRow = Tables<'events'>

const DISCIPLINES = [
  'HYROX', 'CrossFit', 'Deka Fit', 'Spartan Race', 'Tough Mudder',
  'Ironman', 'Ironman 70.3', 'Triathlon', 'Marathon', 'Road Racing',
  'Trail Running', 'Cycling', 'Other',
]

const EVENT_TYPES = [
  'race', 'track_day', 'championship_round', 'qualifier', 'festival', 'training_camp', 'other',
]

const REG_STATUSES = [
  { value: '', label: '— Not set —' },
  { value: 'open', label: 'Open' },
  { value: 'closing_soon', label: 'Closing Soon' },
  { value: 'sold_out', label: 'Sold Out' },
  { value: 'waitlist_only', label: 'Waitlist Only' },
  { value: 'coming_soon', label: 'Coming Soon' },
  { value: 'ballot_open', label: 'Ballot Open' },
  { value: 'ballot_closed', label: 'Ballot Closed' },
]

const CURRENCIES = ['AUD', 'NZD', 'SGD', 'JPY', 'USD', 'GBP', 'EUR']

const SURFACE_TYPES = [
  { value: '', label: '— Not set —' },
  { value: 'road', label: 'Road' },
  { value: 'trail', label: 'Trail' },
  { value: 'track', label: 'Track / Stadium' },
  { value: 'mixed', label: 'Mixed (road + trail)' },
  { value: 'indoor', label: 'Indoor' },
  { value: 'water', label: 'Water / Open water' },
  { value: 'other', label: 'Other' },
]

const CONFIDENCE_LEVELS = [
  { value: '', label: '— Not rated —' },
  { value: '1', label: '1 — Uncertain (inferred / social media)' },
  { value: '2', label: '2 — Possible (secondary source)' },
  { value: '3', label: '3 — Likely (consistent with multiple sources)' },
  { value: '4', label: '4 — High (official website, clearly stated)' },
  { value: '5', label: '5 — Verified (confirmed by organiser)' },
]

const EVENT_STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Confirmed — event is on, dates set' },
  { value: 'tbc', label: 'TBC — placeholder, details not yet confirmed' },
  { value: 'postponed', label: 'Postponed — delayed, new date TBC' },
  { value: 'cancelled', label: 'Cancelled — will not happen' },
  { value: 'completed', label: 'Completed — event has occurred' },
]

type Props = { event?: EventRow }

function str(v: string | number | null | undefined): string {
  return v == null ? '' : String(v)
}

export function EventForm({ event }: Props) {
  const router = useRouter()
  const isEdit = Boolean(event)

  const [form, setForm] = useState({
    // ── Core ─────────────────────────────────────────────────
    title:           event?.title ?? '',
    slug:            event?.slug ?? '',
    discipline:      event?.discipline ?? 'HYROX',
    event_type:      event?.event_type ?? 'race',
    series_slug:     event?.series_slug ?? '',
    organiser:       event?.organiser ?? '',
    first_year_held: str(event?.first_year_held),

    // ── Dates ────────────────────────────────────────────────
    start_date: event?.start_date ?? '',
    end_date:   event?.end_date ?? '',

    // ── Location ─────────────────────────────────────────────
    country:       event?.country ?? '',
    region:        event?.region ?? '',
    city:          event?.city ?? '',
    venue_name:    event?.venue_name ?? '',
    venue_address: event?.venue_address ?? '',
    latitude:      str(event?.latitude),
    longitude:     str(event?.longitude),

    // ── Registration ─────────────────────────────────────────
    registration_status:       event?.registration_status ?? '',
    registration_opens_date:   event?.registration_opens_date ?? '',
    registration_deadline:     event?.registration_deadline ?? '',
    registration_url:          event?.registration_url ?? '',
    registration_platform:     event?.registration_platform ?? '',
    total_capacity:            str(event?.total_capacity),

    // ── Pricing ──────────────────────────────────────────────
    entry_fee_from:            str(event?.entry_fee_from),
    entry_fee_to:              str(event?.entry_fee_to),
    entry_fee_currency:        event?.entry_fee_currency ?? 'AUD',
    early_bird_opens_date:     event?.early_bird_opens_date ?? '',
    early_bird_closes_date:    event?.early_bird_closes_date ?? '',
    early_bird_price_from:     str(event?.early_bird_price_from),
    early_bird_price_to:       str(event?.early_bird_price_to),
    next_price_increase_date:  event?.next_price_increase_date ?? '',
    late_entry_opens_date:     event?.late_entry_opens_date ?? '',
    late_entry_price_from:     str(event?.late_entry_price_from),
    late_entry_price_to:       str(event?.late_entry_price_to),

    // ── Ballot ───────────────────────────────────────────────
    ballot_required:      event?.ballot_required ?? false,
    ballot_opens_date:    event?.ballot_opens_date ?? '',
    ballot_closes_date:   event?.ballot_closes_date ?? '',
    ballot_results_date:  event?.ballot_results_date ?? '',
    ballot_apply_url:     event?.ballot_apply_url ?? '',

    // ── Waitlist ─────────────────────────────────────────────
    waitlist_open:        event?.waitlist_open ?? false,
    waitlist_url:         event?.waitlist_url ?? '',
    waitlist_closes_date: event?.waitlist_closes_date ?? '',

    // ── Policies ─────────────────────────────────────────────
    transfer_available:  event?.transfer_available ?? false,
    transfer_deadline:   event?.transfer_deadline ?? '',
    deferral_available:  event?.deferral_available ?? false,
    deferral_deadline:   event?.deferral_deadline ?? '',
    refund_available:    event?.refund_available ?? false,
    refund_deadline:     event?.refund_deadline ?? '',
    policies_url:        event?.policies_url ?? '',

    // ── Qualification ────────────────────────────────────────
    qualification_required: event?.qualification_required ?? false,
    qualification_notes:    event?.qualification_notes ?? '',
    is_qualifier:           event?.is_qualifier ?? false,
    qualifier_for:          event?.qualifier_for ?? '',

    // ── Athlete planning ─────────────────────────────────────
    min_age:              str(event?.min_age),
    max_age:              str(event?.max_age),
    difficulty:           str(event?.difficulty),
    surface_type:         event?.surface_type ?? '',
    elevation_gain_m:     str(event?.elevation_gain_m),
    relay_available:      event?.relay_available ?? false,
    team_available:       event?.team_available ?? false,
    wheelchair_available: event?.wheelchair_available ?? false,
    adaptive_available:   event?.adaptive_available ?? false,

    // ── Race weekend ─────────────────────────────────────────
    athlete_guide_url:   event?.athlete_guide_url ?? '',
    course_map_url:      event?.course_map_url ?? '',
    gpx_file_url:        event?.gpx_file_url ?? '',
    results_url:         event?.results_url ?? '',

    // ── Content ──────────────────────────────────────────────
    description:     event?.description ?? '',
    format_notes:    event?.format_notes ?? '',
    whats_included:  (event?.whats_included ?? []).join('\n'),

    // ── Logistics (free-text notes) ───────────────────────────
    transport_notes:      event?.transport_notes ?? '',
    accommodation_notes:  event?.accommodation_notes ?? '',

    // ── Travel intelligence ───────────────────────────────────
    event_specific_overview:            event?.event_specific_overview ?? '',
    public_transport_url:               event?.public_transport_url ?? '',
    parking_url:                        event?.parking_url ?? '',
    spectator_info_url:                 event?.spectator_info_url ?? '',
    cbd_to_venue_public_transport_time: event?.cbd_to_venue_public_transport_time ?? '',
    cbd_to_venue_uber_time:             event?.cbd_to_venue_uber_time ?? '',
    cbd_to_venue_uber_price_aud:        event?.cbd_to_venue_uber_price_aud ?? '',
    parking_notes:                      event?.parking_notes ?? '',
    spectator_notes:                    event?.spectator_notes ?? '',
    travel_source_url:                  event?.travel_source_url ?? '',
    travel_last_verified_date:          event?.travel_last_verified_date ?? '',
    travel_data_confidence:             str(event?.travel_data_confidence),

    // ── Media ────────────────────────────────────────────────
    hero_image_url: event?.hero_image_url ?? '',
    image_url:      event?.image_url ?? '',
    website_url:    event?.website_url ?? '',

    // ── Provenance ───────────────────────────────────────────
    data_confidence: str(event?.data_confidence),

    // ── Status & visibility ───────────────────────────────────
    event_status: event?.event_status ?? 'confirmed',
    is_published: event?.is_published ?? false,
    is_featured:  event?.is_featured ?? false,
  })

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEdit)
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const set = useCallback(<K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  function handleTitleChange(value: string) {
    set('title', value)
    if (!slugManuallyEdited) set('slug', slugify(value))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const url    = isEdit ? `/api/admin/events/${event!.id}` : '/api/admin/events'
    const method = isEdit ? 'PATCH' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json() as { error: string }
        setError(data.error ?? 'Something went wrong.')
        return
      }
      router.push('/admin/events')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!event) return
    if (!confirm(`Delete "${event.title}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await fetch(`/api/admin/events/${event.id}`, { method: 'DELETE' })
      router.push('/admin/events')
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* ── Core ──────────────────────────────────────────────────────────── */}
      <Section label="Core">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Title *">
            <input required value={form.title} onChange={(e) => handleTitleChange(e.target.value)}
              className="form-input" placeholder="HYROX Melbourne 2026" />
          </FormField>
          <FormField label="Slug *">
            <input required value={form.slug}
              onChange={(e) => { setSlugManuallyEdited(true); set('slug', e.target.value) }}
              className="form-input font-mono text-xs" placeholder="hyrox-melbourne-2026" />
          </FormField>
          <FormField label="Discipline *">
            <select required value={form.discipline} onChange={(e) => set('discipline', e.target.value)} className="form-input">
              {DISCIPLINES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </FormField>
          <FormField label="Event Type *">
            <select required value={form.event_type} onChange={(e) => set('event_type', e.target.value)} className="form-input">
              {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>
          <FormField label="Organiser">
            <input value={form.organiser} onChange={(e) => set('organiser', e.target.value)}
              className="form-input" placeholder="HYROX GmbH" />
          </FormField>
          <FormField label="Series Slug">
            <input value={form.series_slug} onChange={(e) => set('series_slug', e.target.value)}
              className="form-input font-mono text-xs" placeholder="e.g. hyrox-2026" />
          </FormField>
          <FormField label="First Year Held">
            <input type="number" value={form.first_year_held} onChange={(e) => set('first_year_held', e.target.value)}
              className="form-input" placeholder="2019" min="1900" max="2099" />
          </FormField>
        </div>
      </Section>

      {/* ── Dates ─────────────────────────────────────────────────────────── */}
      <Section label="Dates">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Start Date *">
            <input required type="date" value={form.start_date} onChange={(e) => set('start_date', e.target.value)} className="form-input" />
          </FormField>
          <FormField label="End Date">
            <input type="date" value={form.end_date} onChange={(e) => set('end_date', e.target.value)} className={`form-input${form.end_date ? '' : ' date-empty'}`} />
          </FormField>
        </div>
      </Section>

      {/* ── Location ──────────────────────────────────────────────────────── */}
      <Section label="Location">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Country *">
            <input required value={form.country} onChange={(e) => set('country', e.target.value)}
              className="form-input" placeholder="Australia" />
          </FormField>
          <FormField label="Region / State">
            <input value={form.region} onChange={(e) => set('region', e.target.value)}
              className="form-input" placeholder="Victoria" />
          </FormField>
          <FormField label="City">
            <input value={form.city} onChange={(e) => set('city', e.target.value)}
              className="form-input" placeholder="Melbourne" />
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Venue Name">
            <input value={form.venue_name} onChange={(e) => set('venue_name', e.target.value)}
              className="form-input" placeholder="Melbourne Convention Centre" />
          </FormField>
          <FormField label="Venue Address">
            <input value={form.venue_address} onChange={(e) => set('venue_address', e.target.value)}
              className="form-input" placeholder="1 Convention Centre Pl, South Wharf VIC 3006" />
          </FormField>
          <FormField label="Latitude">
            <input type="number" step="any" value={form.latitude} onChange={(e) => set('latitude', e.target.value)}
              className="form-input font-mono text-xs" placeholder="-37.8249" />
          </FormField>
          <FormField label="Longitude">
            <input type="number" step="any" value={form.longitude} onChange={(e) => set('longitude', e.target.value)}
              className="form-input font-mono text-xs" placeholder="144.9529" />
          </FormField>
        </div>
      </Section>

      {/* ── Registration ──────────────────────────────────────────────────── */}
      <Section label="Registration">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Status">
            <select value={form.registration_status} onChange={(e) => set('registration_status', e.target.value)} className="form-input">
              {REG_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </FormField>
          <FormField label="Platform (Humanitix, Race Roster…)">
            <input value={form.registration_platform} onChange={(e) => set('registration_platform', e.target.value)}
              className="form-input" placeholder="Humanitix" />
          </FormField>
          <FormField label="Registration Opens">
            <input type="date" value={form.registration_opens_date} onChange={(e) => set('registration_opens_date', e.target.value)} className="form-input" />
          </FormField>
          <FormField label="Registration Closes">
            <input type="date" value={form.registration_deadline} onChange={(e) => set('registration_deadline', e.target.value)} className="form-input" />
          </FormField>
          <FormField label="Registration URL">
            <input type="url" value={form.registration_url} onChange={(e) => set('registration_url', e.target.value)}
              className="form-input" placeholder="https://humanitix.com/..." />
          </FormField>
          <FormField label="Total Capacity">
            <input type="number" value={form.total_capacity} onChange={(e) => set('total_capacity', e.target.value)}
              className="form-input" placeholder="3000" min="0" />
          </FormField>
        </div>
      </Section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <Section label="Pricing">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Entry Fee From">
            <input type="number" step="0.01" value={form.entry_fee_from} onChange={(e) => set('entry_fee_from', e.target.value)}
              className="form-input" placeholder="175" min="0" />
          </FormField>
          <FormField label="Entry Fee To">
            <input type="number" step="0.01" value={form.entry_fee_to} onChange={(e) => set('entry_fee_to', e.target.value)}
              className="form-input" placeholder="195" min="0" />
          </FormField>
          <FormField label="Currency">
            <select value={form.entry_fee_currency} onChange={(e) => set('entry_fee_currency', e.target.value)} className="form-input">
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>
        </div>
        <div className="mt-4 rounded-lg border border-wire bg-panel/50 p-4 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Early Bird</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField label="Opens">
              <input type="date" value={form.early_bird_opens_date} onChange={(e) => set('early_bird_opens_date', e.target.value)} className="form-input" />
            </FormField>
            <FormField label="Closes">
              <input type="date" value={form.early_bird_closes_date} onChange={(e) => set('early_bird_closes_date', e.target.value)} className="form-input" />
            </FormField>
            <FormField label="Price From">
              <input type="number" step="0.01" value={form.early_bird_price_from} onChange={(e) => set('early_bird_price_from', e.target.value)}
                className="form-input" placeholder="149" min="0" />
            </FormField>
            <FormField label="Price To">
              <input type="number" step="0.01" value={form.early_bird_price_to} onChange={(e) => set('early_bird_price_to', e.target.value)}
                className="form-input" placeholder="169" min="0" />
            </FormField>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-wire bg-panel/50 p-4 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Late Entry</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Opens">
              <input type="date" value={form.late_entry_opens_date} onChange={(e) => set('late_entry_opens_date', e.target.value)} className="form-input" />
            </FormField>
            <FormField label="Price From">
              <input type="number" step="0.01" value={form.late_entry_price_from} onChange={(e) => set('late_entry_price_from', e.target.value)}
                className="form-input" placeholder="215" min="0" />
            </FormField>
            <FormField label="Price To">
              <input type="number" step="0.01" value={form.late_entry_price_to} onChange={(e) => set('late_entry_price_to', e.target.value)}
                className="form-input" placeholder="235" min="0" />
            </FormField>
          </div>
        </div>
        <div className="mt-4 max-w-xs">
          <FormField label="Next Price Increase Date">
            <input type="date" value={form.next_price_increase_date} onChange={(e) => set('next_price_increase_date', e.target.value)} className="form-input" />
          </FormField>
        </div>
      </Section>

      {/* ── Ballot ────────────────────────────────────────────────────────── */}
      <Section label="Ballot">
        <CheckboxField
          label="Ballot required (lottery-based entry — changes CTA to 'Apply for Ballot')"
          checked={form.ballot_required}
          onChange={(v) => set('ballot_required', v)}
        />
        {form.ballot_required && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="Ballot Opens">
              <input type="date" value={form.ballot_opens_date} onChange={(e) => set('ballot_opens_date', e.target.value)} className="form-input" />
            </FormField>
            <FormField label="Ballot Closes">
              <input type="date" value={form.ballot_closes_date} onChange={(e) => set('ballot_closes_date', e.target.value)} className="form-input" />
            </FormField>
            <FormField label="Results Announced">
              <input type="date" value={form.ballot_results_date} onChange={(e) => set('ballot_results_date', e.target.value)} className="form-input" />
            </FormField>
            <FormField label="Application URL">
              <input type="url" value={form.ballot_apply_url} onChange={(e) => set('ballot_apply_url', e.target.value)}
                className="form-input" placeholder="https://..." />
            </FormField>
          </div>
        )}
      </Section>

      {/* ── Waitlist ──────────────────────────────────────────────────────── */}
      <Section label="Waitlist">
        <CheckboxField
          label="Waitlist open (event is sold out but accepting waitlist applications)"
          checked={form.waitlist_open}
          onChange={(v) => set('waitlist_open', v)}
        />
        {form.waitlist_open && (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <FormField label="Waitlist URL">
              <input type="url" value={form.waitlist_url} onChange={(e) => set('waitlist_url', e.target.value)}
                className="form-input" placeholder="https://..." />
            </FormField>
            <FormField label="Waitlist Closes">
              <input type="date" value={form.waitlist_closes_date} onChange={(e) => set('waitlist_closes_date', e.target.value)} className="form-input" />
            </FormField>
          </div>
        )}
      </Section>

      {/* ── Policies ──────────────────────────────────────────────────────── */}
      <Section label="Policies">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-3">
            <CheckboxField label="Transfers available" checked={form.transfer_available} onChange={(v) => set('transfer_available', v)} />
            {form.transfer_available && (
              <FormField label="Transfer Deadline">
                <input type="date" value={form.transfer_deadline} onChange={(e) => set('transfer_deadline', e.target.value)} className="form-input" />
              </FormField>
            )}
          </div>
          <div className="space-y-3">
            <CheckboxField label="Deferrals available" checked={form.deferral_available} onChange={(v) => set('deferral_available', v)} />
            {form.deferral_available && (
              <FormField label="Deferral Deadline">
                <input type="date" value={form.deferral_deadline} onChange={(e) => set('deferral_deadline', e.target.value)} className="form-input" />
              </FormField>
            )}
          </div>
          <div className="space-y-3">
            <CheckboxField label="Refunds available" checked={form.refund_available} onChange={(v) => set('refund_available', v)} />
            {form.refund_available && (
              <FormField label="Refund Deadline">
                <input type="date" value={form.refund_deadline} onChange={(e) => set('refund_deadline', e.target.value)} className="form-input" />
              </FormField>
            )}
          </div>
        </div>
        <div className="mt-4 max-w-lg">
          <FormField label="Policies URL">
            <input type="url" value={form.policies_url} onChange={(e) => set('policies_url', e.target.value)}
              className="form-input" placeholder="https://..." />
          </FormField>
        </div>
      </Section>

      {/* ── Qualification ─────────────────────────────────────────────────── */}
      <Section label="Qualification">
        <div className="space-y-4">
          <CheckboxField label="Qualification required (athletes must meet a prior standard to enter)" checked={form.qualification_required} onChange={(v) => set('qualification_required', v)} />
          {form.qualification_required && (
            <FormField label="Qualification Notes">
              <textarea rows={2} value={form.qualification_notes} onChange={(e) => set('qualification_notes', e.target.value)}
                className="form-input resize-none" placeholder="e.g. HYROX Pro — sub-60 min required at a previous HYROX event" />
            </FormField>
          )}
          <CheckboxField label="This event is a qualifier (finishing earns a spot at a championship)" checked={form.is_qualifier} onChange={(v) => set('is_qualifier', v)} />
          {form.is_qualifier && (
            <FormField label="Qualifies For">
              <input value={form.qualifier_for} onChange={(e) => set('qualifier_for', e.target.value)}
                className="form-input" placeholder="HYROX World Championships" />
            </FormField>
          )}
        </div>
      </Section>

      {/* ── Athlete planning ──────────────────────────────────────────────── */}
      <Section label="Athlete Planning">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Difficulty (1–5)">
            <select value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)} className="form-input">
              <option value="">— Not set —</option>
              <option value="1">1 — Beginner friendly</option>
              <option value="2">2 — Moderate</option>
              <option value="3">3 — Challenging</option>
              <option value="4">4 — Hard</option>
              <option value="5">5 — Elite / extreme</option>
            </select>
          </FormField>
          <FormField label="Surface Type">
            <select value={form.surface_type} onChange={(e) => set('surface_type', e.target.value)} className="form-input">
              {SURFACE_TYPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </FormField>
          <FormField label="Elevation Gain (m)">
            <input type="number" value={form.elevation_gain_m} onChange={(e) => set('elevation_gain_m', e.target.value)}
              className="form-input" placeholder="1250" min="0" />
          </FormField>
          <div className="grid grid-cols-2 gap-4 sm:col-span-2 lg:col-span-1">
            <FormField label="Min Age">
              <input type="number" value={form.min_age} onChange={(e) => set('min_age', e.target.value)}
                className="form-input" placeholder="16" min="0" max="99" />
            </FormField>
            <FormField label="Max Age">
              <input type="number" value={form.max_age} onChange={(e) => set('max_age', e.target.value)}
                className="form-input" placeholder="80" min="0" max="120" />
            </FormField>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-6">
          <CheckboxField label="Relay available" checked={form.relay_available} onChange={(v) => set('relay_available', v)} />
          <CheckboxField label="Team categories" checked={form.team_available} onChange={(v) => set('team_available', v)} />
          <CheckboxField label="Wheelchair division" checked={form.wheelchair_available} onChange={(v) => set('wheelchair_available', v)} />
          <CheckboxField label="Adaptive division" checked={form.adaptive_available} onChange={(v) => set('adaptive_available', v)} />
        </div>
      </Section>

      {/* ── Race weekend ──────────────────────────────────────────────────── */}
      <Section label="Race Weekend">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Athlete Guide URL">
            <input type="url" value={form.athlete_guide_url} onChange={(e) => set('athlete_guide_url', e.target.value)}
              className="form-input" placeholder="https://..." />
          </FormField>
          <FormField label="Course Map URL">
            <input type="url" value={form.course_map_url} onChange={(e) => set('course_map_url', e.target.value)}
              className="form-input" placeholder="https://..." />
          </FormField>
          <FormField label="GPX File URL">
            <input type="url" value={form.gpx_file_url} onChange={(e) => set('gpx_file_url', e.target.value)}
              className="form-input" placeholder="https://..." />
          </FormField>
          <FormField label="Results URL">
            <input type="url" value={form.results_url} onChange={(e) => set('results_url', e.target.value)}
              className="form-input" placeholder="https://..." />
          </FormField>
        </div>
      </Section>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <Section label="Content">
        <div className="space-y-4">
          <FormField label="Event-Specific Overview (replaces generic discipline copy — factual, sourced)">
            <textarea rows={5} value={form.event_specific_overview} onChange={(e) => set('event_specific_overview', e.target.value)}
              className="form-input resize-none" placeholder="What makes this specific event unique? Venue history, course character, cultural significance. Do not invent facts — use only verifiable information from official sources." />
          </FormField>
          <FormField label="Description (legacy — used as fallback when no overview is set)">
            <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)}
              className="form-input resize-none" placeholder="Short editorial description shown on the event detail page." />
          </FormField>
          <FormField label="Format Notes">
            <textarea rows={2} value={form.format_notes} onChange={(e) => set('format_notes', e.target.value)}
              className="form-input resize-none" placeholder="Course details, format overview, or anything specific to this edition." />
          </FormField>
          <FormField label="What's Included (one item per line)">
            <textarea rows={4} value={form.whats_included} onChange={(e) => set('whats_included', e.target.value)}
              className="form-input resize-none font-mono text-xs" placeholder={'Finisher medal\nRace t-shirt\nPost-race protein bar'} />
          </FormField>
        </div>
      </Section>

      {/* ── Logistics notes ───────────────────────────────────────────────── */}
      <Section label="Logistics Notes">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Transport Notes">
            <textarea rows={3} value={form.transport_notes} onChange={(e) => set('transport_notes', e.target.value)}
              className="form-input resize-none" placeholder="Public transport, parking, shuttle buses…" />
          </FormField>
          <FormField label="Accommodation Notes">
            <textarea rows={3} value={form.accommodation_notes} onChange={(e) => set('accommodation_notes', e.target.value)}
              className="form-input resize-none" placeholder="Official hotel partner, athlete block rate, booking deadline…" />
          </FormField>
        </div>
      </Section>

      {/* ── Travel Intelligence ───────────────────────────────────────────── */}
      <Section label="Travel Intelligence">
        <p className="mb-4 text-xs text-ink-muted">
          Structured travel data shown in the Getting There, Parking and Spectators sections on the event page.
          Only populate with verified information. Leave blank rather than guess — the generic city data fills the gap.
        </p>
        <div className="space-y-6">

          {/* Getting there */}
          <div className="rounded-lg border border-wire bg-panel/50 p-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Getting There — Public Transport</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="CBD → Venue (public transport time)">
                <input value={form.cbd_to_venue_public_transport_time} onChange={(e) => set('cbd_to_venue_public_transport_time', e.target.value)}
                  className="form-input" placeholder="35 min by train from Central" />
              </FormField>
              <FormField label="Public Transport Info URL">
                <input type="url" value={form.public_transport_url} onChange={(e) => set('public_transport_url', e.target.value)}
                  className="form-input" placeholder="https://..." />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="CBD → Venue (rideshare time)">
                <input value={form.cbd_to_venue_uber_time} onChange={(e) => set('cbd_to_venue_uber_time', e.target.value)}
                  className="form-input" placeholder="20 min" />
              </FormField>
              <FormField label="Rideshare Price Estimate (AUD)">
                <input value={form.cbd_to_venue_uber_price_aud} onChange={(e) => set('cbd_to_venue_uber_price_aud', e.target.value)}
                  className="form-input" placeholder="$25–$35" />
              </FormField>
            </div>
          </div>

          {/* Parking */}
          <div className="rounded-lg border border-wire bg-panel/50 p-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Parking</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Parking Notes">
                <textarea rows={3} value={form.parking_notes} onChange={(e) => set('parking_notes', e.target.value)}
                  className="form-input resize-none" placeholder="Nearest car park, cost, pre-booking required…" />
              </FormField>
              <FormField label="Parking Info URL">
                <input type="url" value={form.parking_url} onChange={(e) => set('parking_url', e.target.value)}
                  className="form-input" placeholder="https://..." />
              </FormField>
            </div>
          </div>

          {/* Spectators */}
          <div className="rounded-lg border border-wire bg-panel/50 p-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Spectators</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Spectator Notes">
                <textarea rows={3} value={form.spectator_notes} onChange={(e) => set('spectator_notes', e.target.value)}
                  className="form-input resize-none" placeholder="Spectator entry, best viewing spots, ticket requirements…" />
              </FormField>
              <FormField label="Spectator Guide URL">
                <input type="url" value={form.spectator_info_url} onChange={(e) => set('spectator_info_url', e.target.value)}
                  className="form-input" placeholder="https://..." />
              </FormField>
            </div>
          </div>

          {/* Source / verification */}
          <div className="rounded-lg border border-wire bg-panel/50 p-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Travel Data Source &amp; Verification</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Source URL">
                <input type="url" value={form.travel_source_url} onChange={(e) => set('travel_source_url', e.target.value)}
                  className="form-input" placeholder="https://..." />
              </FormField>
              <FormField label="Last Verified Date">
                <input type="date" value={form.travel_last_verified_date} onChange={(e) => set('travel_last_verified_date', e.target.value)}
                  className="form-input" />
              </FormField>
              <FormField label="Travel Confidence (1–5)">
                <select value={form.travel_data_confidence} onChange={(e) => set('travel_data_confidence', e.target.value)} className="form-input">
                  {CONFIDENCE_LEVELS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </FormField>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Media & Links ─────────────────────────────────────────────────── */}
      <Section label="Media &amp; Links">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Website URL">
            <input type="url" value={form.website_url} onChange={(e) => set('website_url', e.target.value)}
              className="form-input" placeholder="https://..." />
          </FormField>
          <FormField label="Hero Image URL (banner)">
            <input type="url" value={form.hero_image_url} onChange={(e) => set('hero_image_url', e.target.value)}
              className="form-input" placeholder="https://..." />
          </FormField>
          <FormField label="Card Image URL (thumbnail)">
            <input type="url" value={form.image_url} onChange={(e) => set('image_url', e.target.value)}
              className="form-input" placeholder="https://..." />
          </FormField>
        </div>
      </Section>

      {/* ── Data Provenance ───────────────────────────────────────────────── */}
      <Section label="Data Provenance">
        <p className="mb-4 text-xs text-ink-muted">
          Track the quality of this event record. Higher confidence = data confirmed directly from the organiser.
          The Event Intelligence Pipeline uses this to prioritise re-verification.
        </p>
        <div className="max-w-xs">
          <FormField label="Confidence Level">
            <select value={form.data_confidence} onChange={(e) => set('data_confidence', e.target.value)} className="form-input">
              {CONFIDENCE_LEVELS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </FormField>
        </div>
        {event?.data_verified_at && (
          <p className="mt-3 text-xs text-ink-muted">
            Last verified: {new Date(event.data_verified_at).toLocaleDateString('en-AU', { dateStyle: 'medium' })}
          </p>
        )}
      </Section>

      {/* ── Visibility ────────────────────────────────────────────────────── */}
      <Section label="Visibility">
        <div className="grid gap-4 sm:grid-cols-2 mb-4">
          <FormField label="Event Status">
            <select value={form.event_status} onChange={(e) => set('event_status', e.target.value as typeof form['event_status'])} className="form-input">
              {EVENT_STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </FormField>
        </div>
        <div className="space-y-3">
          <CheckboxField label="Published (visible on site)" checked={form.is_published} onChange={(v) => set('is_published', v)} />
          <CheckboxField label="Featured (shown in 'Featured Events' on homepage)" checked={form.is_featured} onChange={(v) => set('is_featured', v)} />
        </div>
      </Section>

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t border-wire pt-6">
        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="rounded-lg bg-mint px-5 py-2 text-sm font-semibold text-canvas transition-opacity hover:opacity-90 disabled:opacity-50">
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Event'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="rounded-lg border border-wire px-5 py-2 text-sm text-ink-muted transition-colors hover:border-wire-bright hover:text-ink">
            Cancel
          </button>
        </div>
        {isEdit && (
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 transition-colors hover:border-red-500/60 hover:bg-red-500/10 disabled:opacity-50">
            {deleting ? 'Deleting…' : 'Delete Event'}
          </button>
        )}
      </div>
    </form>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted"
        dangerouslySetInnerHTML={{ __html: label }} />
      {children}
    </section>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-ink-muted">{label}</span>
      {children}
    </label>
  )
}

function CheckboxField({ label, checked, onChange }: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-wire bg-canvas accent-mint" />
      <span className="text-sm text-ink">{label}</span>
    </label>
  )
}
