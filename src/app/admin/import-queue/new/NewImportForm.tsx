'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/utils'

// Fallback list used if the DB fetch fails or returns nothing
const FALLBACK_DISCIPLINES = [
  'HYROX', 'CrossFit', 'Deka Fit', 'Spartan Race', 'Obstacle Race', 'Tough Mudder',
  'Ironman', 'Ironman 70.3', 'Triathlon', 'Marathon', 'Road Running', 'Fun Run',
  'Trail Running', 'Open Water Swimming', 'Cycling', 'Fitness Race', 'Other',
]

const CONFIDENCE_OPTIONS = [
  { value: '4', label: '4 — High (from official website)' },
  { value: '3', label: '3 — Likely (based on historical pattern)' },
  { value: '5', label: '5 — Verified (confirmed by organiser)' },
  { value: '2', label: '2 — Possible (secondary source)' },
  { value: '1', label: '1 — Uncertain' },
]

interface Props {
  disciplineValues: string[]
  seriesOptions: { slug: string; name: string }[]
}

export function NewImportForm({ disciplineValues, seriesOptions }: Props) {
  const router = useRouter()
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [slugEdited, setSlugEdited] = useState(false)
  const [seriesFilter, setSeriesFilter] = useState('')

  const disciplines = disciplineValues.length > 0 ? disciplineValues : FALLBACK_DISCIPLINES

  const [form, setForm] = useState({
    title:             '',
    slug:              '',
    discipline:        disciplines[0] ?? 'Marathon',
    event_type:        'race',
    organiser:         '',
    series_slug:       '',
    start_date:        '',
    end_date:          '',
    country:           'Australia',
    region:            '',
    city:              '',
    venue_name:        '',
    website_url:       '',
    registration_url:  '',
    entry_fee_from:    '',
    entry_fee_currency:'AUD',
    surface_type:      '',
    description:       '',
    source_url:        '',
    confidence:        '4',
    notes:             '',
  })

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleTitleChange(value: string) {
    set('title', value)
    if (!slugEdited) set('slug', slugify(value))
  }

  const filteredSeries = seriesOptions.filter(
    (s) =>
      seriesFilter === '' ||
      s.name.toLowerCase().includes(seriesFilter.toLowerCase()) ||
      s.slug.toLowerCase().includes(seriesFilter.toLowerCase()),
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload: Record<string, unknown> = {
      title:            form.title.trim(),
      slug:             form.slug.trim(),
      discipline:       form.discipline,
      event_type:       form.event_type,
      organiser:        form.organiser.trim()        || null,
      series_slug:      form.series_slug.trim()      || null,
      start_date:       form.start_date,
      end_date:         form.end_date                || null,
      country:          form.country.trim(),
      region:           form.region.trim()           || null,
      city:             form.city.trim()             || null,
      venue_name:       form.venue_name.trim()       || null,
      website_url:      form.website_url.trim()      || null,
      registration_url: form.registration_url.trim() || null,
      entry_fee_from:   form.entry_fee_from ? Number(form.entry_fee_from) : null,
      entry_fee_currency: form.entry_fee_currency,
      surface_type:     form.surface_type            || null,
      description:      form.description.trim()      || null,
      event_status:     'confirmed',
      is_published:     false,
      is_featured:      false,
    }

    try {
      const res = await fetch('/api/admin/import-queue', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          payload,
          source_url: form.source_url.trim() || null,
          confidence: Number(form.confidence),
          notes:      form.notes.trim()      || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json() as { error: string }
        setError(data.error ?? 'Something went wrong.')
        return
      }
      router.push('/admin/import-queue')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Source provenance */}
      <section className="card space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Source</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-xs font-medium text-ink-muted">Official Source URL *</span>
            <input
              required type="url" value={form.source_url}
              onChange={(e) => set('source_url', e.target.value)}
              className="form-input" placeholder="https://www.goldcoastmarathon.com.au"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">Confidence Level</span>
            <select value={form.confidence} onChange={(e) => set('confidence', e.target.value)} className="form-input">
              {CONFIDENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">Batch Notes</span>
            <input value={form.notes} onChange={(e) => set('notes', e.target.value)}
              className="form-input" placeholder="Imported from GCM official calendar 2026" />
          </label>
        </div>
      </section>

      {/* Event data */}
      <section className="card space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Event Data</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">Title *</span>
            <input required value={form.title} onChange={(e) => handleTitleChange(e.target.value)}
              className="form-input" placeholder="Gold Coast Marathon 2026" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">Slug *</span>
            <input required value={form.slug}
              onChange={(e) => { setSlugEdited(true); set('slug', e.target.value) }}
              className="form-input font-mono text-xs" placeholder="gold-coast-marathon-2026" />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">
              Discipline
              {disciplineValues.length > 0 && (
                <span className="ml-1 text-mint/70">({disciplineValues.length} from DB)</span>
              )}
            </span>
            <select value={form.discipline} onChange={(e) => set('discipline', e.target.value)} className="form-input">
              {disciplines.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">Organiser</span>
            <input value={form.organiser} onChange={(e) => set('organiser', e.target.value)}
              className="form-input" placeholder="Gold Coast Marathon" />
          </label>

          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-xs font-medium text-ink-muted">
              Series Slug
              {seriesOptions.length > 0 && (
                <span className="ml-1 text-mint/70">({seriesOptions.length} series in DB)</span>
              )}
            </span>
            <div className="flex gap-2">
              <input
                list="series-datalist"
                value={form.series_slug}
                onChange={(e) => { set('series_slug', e.target.value); setSeriesFilter(e.target.value) }}
                className="form-input flex-1 font-mono text-xs"
                placeholder="gold-coast-marathon (type to search or leave blank)"
              />
              {form.series_slug && (
                <button type="button" onClick={() => { set('series_slug', ''); setSeriesFilter('') }}
                  className="rounded-lg border border-wire px-3 text-xs text-ink-muted hover:border-wire-bright hover:text-ink transition-colors">
                  Clear
                </button>
              )}
            </div>
            <datalist id="series-datalist">
              {filteredSeries.map((s) => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </datalist>
            {form.series_slug && seriesOptions.length > 0 && (
              <p className="text-xs text-ink-muted/70">
                {seriesOptions.find((s) => s.slug === form.series_slug)
                  ? `✓ Matches series: ${seriesOptions.find((s) => s.slug === form.series_slug)?.name}`
                  : '⚠ No matching series found — will be stored as-is'}
              </p>
            )}
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">Start Date *</span>
            <input required type="date" value={form.start_date} onChange={(e) => set('start_date', e.target.value)} className="form-input" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">End Date</span>
            <input type="date" value={form.end_date} onChange={(e) => set('end_date', e.target.value)} className="form-input" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">Country *</span>
            <input required value={form.country} onChange={(e) => set('country', e.target.value)} className="form-input" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">State / Region</span>
            <input value={form.region} onChange={(e) => set('region', e.target.value)} className="form-input" placeholder="QLD" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">City</span>
            <input value={form.city} onChange={(e) => set('city', e.target.value)} className="form-input" placeholder="Gold Coast" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">Venue</span>
            <input value={form.venue_name} onChange={(e) => set('venue_name', e.target.value)} className="form-input" placeholder="Broadwater Parklands" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">Official Website</span>
            <input type="url" value={form.website_url} onChange={(e) => set('website_url', e.target.value)} className="form-input" placeholder="https://..." />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">Registration URL</span>
            <input type="url" value={form.registration_url} onChange={(e) => set('registration_url', e.target.value)} className="form-input" placeholder="https://..." />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">Entry Fee From</span>
            <input type="number" value={form.entry_fee_from} onChange={(e) => set('entry_fee_from', e.target.value)} className="form-input" placeholder="75" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">Surface Type</span>
            <select value={form.surface_type} onChange={(e) => set('surface_type', e.target.value)} className="form-input">
              <option value="">— Select —</option>
              <option value="road">Road</option>
              <option value="trail">Trail</option>
              <option value="indoor">Indoor</option>
              <option value="mixed">Mixed</option>
              <option value="open_water">Open Water</option>
            </select>
          </label>
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-xs font-medium text-ink-muted">Description</span>
            <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)}
              className="form-input resize-none" placeholder="Brief event description from official website…" />
          </label>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving}
          className="rounded-lg bg-mint px-5 py-2 text-sm font-semibold text-canvas transition-opacity hover:opacity-90 disabled:opacity-50">
          {saving ? 'Submitting…' : 'Submit for Review'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="rounded-lg border border-wire px-5 py-2 text-sm text-ink-muted transition-colors hover:border-wire-bright hover:text-ink">
          Cancel
        </button>
      </div>
    </form>
  )
}
