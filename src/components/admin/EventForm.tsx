'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/utils'
import type { Tables } from '@/types/supabase'

type EventRow = Tables<'events'>

const DISCIPLINES = [
  'HYROX', 'CrossFit', 'Spartan Race', 'Ironman', 'Triathlon',
  'Marathon', 'Trail Running', 'Deka Fit', 'Tough Mudder', 'Other',
]

const EVENT_TYPES = [
  'race', 'track_day', 'championship_round', 'qualifier', 'festival', 'training_camp', 'other',
]

const REG_STATUSES = [
  { value: '', label: '— Not set —' },
  { value: 'open', label: 'Open' },
  { value: 'closing_soon', label: 'Closing Soon' },
  { value: 'sold_out', label: 'Sold Out' },
  { value: 'coming_soon', label: 'Coming Soon' },
]

type Props = {
  event?: EventRow
}

export function EventForm({ event }: Props) {
  const router = useRouter()
  const isEdit = Boolean(event)

  const [form, setForm] = useState({
    title: event?.title ?? '',
    slug: event?.slug ?? '',
    discipline: event?.discipline ?? 'HYROX',
    event_type: event?.event_type ?? 'race',
    start_date: event?.start_date ?? '',
    end_date: event?.end_date ?? '',
    registration_deadline: event?.registration_deadline ?? '',
    registration_status: event?.registration_status ?? '',
    country: event?.country ?? '',
    region: event?.region ?? '',
    city: event?.city ?? '',
    organiser: event?.organiser ?? '',
    description: event?.description ?? '',
    website_url: event?.website_url ?? '',
    image_url: event?.image_url ?? '',
    is_published: event?.is_published ?? false,
    is_featured: event?.is_featured ?? false,
  })

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = useCallback((key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  function handleTitleChange(value: string) {
    set('title', value)
    if (!slugManuallyEdited) {
      set('slug', slugify(value))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const url = isEdit ? `/api/admin/events/${event!.id}` : '/api/admin/events'
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Core info */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Core</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Title *">
            <input
              required
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="form-input"
              placeholder="AirAsia HYROX Perth"
            />
          </FormField>
          <FormField label="Slug *">
            <input
              required
              value={form.slug}
              onChange={(e) => { setSlugManuallyEdited(true); set('slug', e.target.value) }}
              className="form-input font-mono text-xs"
              placeholder="airasia-hyrox-perth"
            />
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
        </div>
      </section>

      {/* Dates */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Dates</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Start Date *">
            <input
              required
              type="date"
              value={form.start_date}
              onChange={(e) => set('start_date', e.target.value)}
              className="form-input"
            />
          </FormField>
          <FormField label="End Date">
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => set('end_date', e.target.value)}
              className="form-input"
            />
          </FormField>
          <FormField label="Registration Deadline">
            <input
              type="date"
              value={form.registration_deadline}
              onChange={(e) => set('registration_deadline', e.target.value)}
              className="form-input"
            />
          </FormField>
        </div>
        <div className="max-w-xs">
          <FormField label="Registration Status">
            <select value={form.registration_status} onChange={(e) => set('registration_status', e.target.value)} className="form-input">
              {REG_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </FormField>
        </div>
      </section>

      {/* Location */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Location</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Country *">
            <input
              required
              value={form.country}
              onChange={(e) => set('country', e.target.value)}
              className="form-input"
              placeholder="Australia"
            />
          </FormField>
          <FormField label="Region / State">
            <input
              value={form.region}
              onChange={(e) => set('region', e.target.value)}
              className="form-input"
              placeholder="Western Australia"
            />
          </FormField>
          <FormField label="City">
            <input
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              className="form-input"
              placeholder="Perth"
            />
          </FormField>
        </div>
      </section>

      {/* Details */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Organiser">
            <input
              value={form.organiser}
              onChange={(e) => set('organiser', e.target.value)}
              className="form-input"
              placeholder="HYROX GmbH"
            />
          </FormField>
          <FormField label="Website URL">
            <input
              type="url"
              value={form.website_url}
              onChange={(e) => set('website_url', e.target.value)}
              className="form-input"
              placeholder="https://hyrox.com/..."
            />
          </FormField>
          <FormField label="Image URL">
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => set('image_url', e.target.value)}
              className="form-input"
              placeholder="https://..."
            />
          </FormField>
        </div>
        <FormField label="Description">
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className="form-input resize-none"
            placeholder="Short description shown on the event detail page."
          />
        </FormField>
      </section>

      {/* Flags */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Visibility</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => set('is_published', e.target.checked)}
            className="h-4 w-4 rounded border-wire bg-canvas accent-mint"
          />
          <span className="text-sm text-ink">Published (visible on site)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => set('is_featured', e.target.checked)}
            className="h-4 w-4 rounded border-wire bg-canvas accent-mint"
          />
          <span className="text-sm text-ink">Featured (shown in "Featured" row on homepage)</span>
        </label>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-wire pt-6">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-mint px-5 py-2 text-sm font-semibold text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Event'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-wire px-5 py-2 text-sm text-ink-muted transition-colors hover:border-wire-bright hover:text-ink"
          >
            Cancel
          </button>
        </div>

        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 transition-colors hover:border-red-500/60 hover:bg-red-500/10 disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete Event'}
          </button>
        )}
      </div>
    </form>
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
