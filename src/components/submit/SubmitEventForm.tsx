'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'

const DISCIPLINES = [
  'HYROX', 'CrossFit', 'Deka Fit', 'Spartan Race', 'Tough Mudder',
  'Ironman', 'Ironman 70.3', 'Triathlon', 'Marathon', 'Road Racing',
  'Trail Running', 'Cycling', 'Other',
]

type Field = {
  title: string
  discipline: string
  start_date: string
  country: string
  city: string
  submitter_name: string
  submitter_email: string
  website_url: string
  registration_url: string
  description: string
}

const EMPTY: Field = {
  title:           '',
  discipline:      '',
  start_date:      '',
  country:         '',
  city:            '',
  submitter_name:  '',
  submitter_email: '',
  website_url:     '',
  registration_url: '',
  description:     '',
}

export function SubmitEventForm() {
  const [form, setForm]       = useState<Field>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function set<K extends keyof Field>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/submit-event', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="card flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircle className="h-12 w-12 text-mint" />
        <h2 className="text-xl font-semibold text-ink">Your event has been submitted.</h2>
        <p className="max-w-sm text-sm text-ink-muted">
          Our team will review the details and get in touch via the email you provided.
          Approved events are usually listed within a few business days.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* ── Event details ────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Event Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">

          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-xs font-medium text-ink-muted">Event Name *</span>
            <input
              required
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className="form-input"
              placeholder="HYROX Melbourne 2027"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">Discipline *</span>
            <select
              required
              value={form.discipline}
              onChange={(e) => set('discipline', e.target.value)}
              className="form-input"
            >
              <option value="">Select a discipline…</option>
              {DISCIPLINES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">Start Date *</span>
            <input
              required
              type="date"
              value={form.start_date}
              onChange={(e) => set('start_date', e.target.value)}
              className="form-input"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">Country *</span>
            <input
              required
              value={form.country}
              onChange={(e) => set('country', e.target.value)}
              className="form-input"
              placeholder="Australia"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">City</span>
            <input
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              className="form-input"
              placeholder="Melbourne"
            />
          </label>

        </div>
      </section>

      {/* ── Links ────────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Links</h2>
        <div className="grid gap-4 sm:grid-cols-2">

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">Event Website</span>
            <input
              type="url"
              value={form.website_url}
              onChange={(e) => set('website_url', e.target.value)}
              className="form-input"
              placeholder="https://..."
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">Registration URL</span>
            <input
              type="url"
              value={form.registration_url}
              onChange={(e) => set('registration_url', e.target.value)}
              className="form-input"
              placeholder="https://..."
            />
          </label>

        </div>
      </section>

      {/* ── Description ──────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Description</h2>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-ink-muted">Short Description</span>
          <textarea
            rows={4}
            maxLength={500}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className="form-input resize-none"
            placeholder="Tell us about the event — format, distance, what makes it special."
          />
          <span className="text-xs text-ink-subtle">{form.description.length}/500</span>
        </label>
      </section>

      {/* ── Your details ─────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Your Details</h2>
        <p className="text-xs text-ink-muted">
          Used for review follow-up only. Not shown publicly.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">Your Name or Organisation *</span>
            <input
              required
              value={form.submitter_name}
              onChange={(e) => set('submitter_name', e.target.value)}
              className="form-input"
              placeholder="HYROX GmbH"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">Contact Email *</span>
            <input
              required
              type="email"
              value={form.submitter_email}
              onChange={(e) => set('submitter_email', e.target.value)}
              className="form-input"
              placeholder="events@yourorganisation.com"
            />
          </label>

        </div>
      </section>

      {/* ── Actions ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 border-t border-wire pt-6">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-mint px-6 py-2.5 text-sm font-semibold text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit Event'}
        </button>
        <p className="text-xs text-ink-subtle">
          All submissions are reviewed before going live.
        </p>
      </div>
    </form>
  )
}
