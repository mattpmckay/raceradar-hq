'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/utils'
import type { Tables } from '@/types/supabase'
import { Trash2, Plus, X } from 'lucide-react'

type ChallengeRow     = Tables<'challenges'>
type RequirementRow   = Tables<'challenge_requirements'>
type TitleRow         = Tables<'challenge_titles'>
type DisciplineRow    = Pick<Tables<'disciplines'>, 'slug' | 'name'>
type EventOption      = { id: string; title: string; slug: string; discipline: string | null }

type RequirementType = 'specific_event' | 'discipline' | 'geographic' | 'any_event'

const FAMILIES = [
  { value: 'series',     label: 'Series — depth within one discipline' },
  { value: 'pursuit',    label: 'Pursuit — breadth across disciplines' },
  { value: 'collection', label: 'Collection — geographic or iconic' },
]

const TIERS = [
  { value: 'starter',   label: 'Starter' },
  { value: 'achiever',  label: 'Achiever' },
  { value: 'explorer',  label: 'Explorer' },
  { value: 'legend',    label: 'Legend' },
]

const GEO_SCOPES = [
  { value: '',          label: '— Not set —' },
  { value: 'australia', label: 'Australia' },
  { value: 'nz',        label: 'New Zealand' },
  { value: 'global',    label: 'Global' },
]

const REQ_TYPES: { value: RequirementType; label: string }[] = [
  { value: 'specific_event', label: 'Specific event' },
  { value: 'discipline',     label: 'Any event in a discipline' },
  { value: 'geographic',     label: 'Any event in a location' },
  { value: 'any_event',      label: 'Any event (wildcard)' },
]

type Props = {
  challenge?:    ChallengeRow
  requirements?: RequirementRow[]
  challengeTitle?: TitleRow | null
  disciplines:   DisciplineRow[]
  events:        EventOption[]
}

function str(v: string | number | null | undefined): string {
  return v == null ? '' : String(v)
}

type NewReqForm = {
  requirement_type: RequirementType
  event_id:         string
  discipline:       string
  country:          string
  region:           string
  min_count:        string
  display_label:    string
}

const emptyReq: NewReqForm = {
  requirement_type: 'discipline',
  event_id:         '',
  discipline:       '',
  country:          '',
  region:           '',
  min_count:        '1',
  display_label:    '',
}

export function ChallengeForm({ challenge, requirements = [], challengeTitle, disciplines, events }: Props) {
  const router  = useRouter()
  const isEdit  = Boolean(challenge)

  const [form, setForm] = useState({
    name:                    challenge?.name ?? '',
    slug:                    challenge?.slug ?? '',
    tagline:                 challenge?.tagline ?? '',
    description:             challenge?.description ?? '',
    family:                  challenge?.family ?? 'series',
    tier:                    challenge?.tier ?? 'starter',
    primary_discipline_slug: challenge?.primary_discipline_slug ?? '',
    geographic_scope:        challenge?.geographic_scope ?? '',
    is_seasonal:             challenge?.is_seasonal ?? false,
    season_year:             str(challenge?.season_year),
    is_retired:              challenge?.is_retired ?? false,
    retired_at:              challenge?.retired_at ?? '',
    badge_image_url:         challenge?.badge_image_url ?? '',
    hero_image_url:          challenge?.hero_image_url ?? '',
    sort_order:              str(challenge?.sort_order ?? 0),
    is_published:            challenge?.is_published ?? false,
  })

  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Title state
  const [titleForm, setTitleForm] = useState({
    title:       challengeTitle?.title ?? '',
    description: challengeTitle?.description ?? '',
  })
  const [savingTitle, setSavingTitle] = useState(false)
  const [titleMsg,    setTitleMsg]    = useState<string | null>(null)

  // Requirement builder state
  const [showReqForm, setShowReqForm]   = useState(false)
  const [newReq,      setNewReq]        = useState<NewReqForm>(emptyReq)
  const [addingReq,   setAddingReq]     = useState(false)
  const [deletingReq, setDeletingReq]   = useState<string | null>(null)
  const [reqError,    setReqError]      = useState<string | null>(null)

  function setField(key: string, value: unknown) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleNameChange(name: string) {
    setForm(f => ({
      ...f,
      name,
      slug: isEdit ? f.slug : slugify(name),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const url    = isEdit ? `/api/admin/challenges/${challenge!.id}` : '/api/admin/challenges'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        is_seasonal:  form.is_seasonal  || false,
        is_retired:   form.is_retired   || false,
        is_published: form.is_published || false,
      }),
    })

    const json = await res.json() as { id?: string; slug?: string; error?: string }

    setSaving(false)

    if (!res.ok) {
      setError(json.error ?? 'Something went wrong.')
      return
    }

    if (isEdit) {
      router.refresh()
    } else {
      router.push(`/admin/challenges/${json.id}/edit`)
    }
  }

  async function handleDelete() {
    if (!challenge) return
    if (!confirm(`Delete "${challenge.name}"? This cannot be undone.`)) return
    setDeleting(true)
    await fetch(`/api/admin/challenges/${challenge.id}`, { method: 'DELETE' })
    router.push('/admin/challenges')
  }

  async function handleSaveTitle(e: React.FormEvent) {
    e.preventDefault()
    if (!challenge) return
    setSavingTitle(true)
    setTitleMsg(null)

    const res = await fetch(`/api/admin/challenges/${challenge.id}/title`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(titleForm),
    })

    setSavingTitle(false)
    setTitleMsg(res.ok ? 'Title saved.' : 'Failed to save title.')
    if (res.ok) router.refresh()
  }

  async function handleDeleteTitle() {
    if (!challenge) return
    if (!confirm('Remove this title from the challenge?')) return
    await fetch(`/api/admin/challenges/${challenge.id}/title`, { method: 'DELETE' })
    setTitleForm({ title: '', description: '' })
    router.refresh()
  }

  async function handleAddRequirement(e: React.FormEvent) {
    e.preventDefault()
    if (!challenge) return
    setAddingReq(true)
    setReqError(null)

    const res = await fetch(`/api/admin/challenges/${challenge.id}/requirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReq),
    })

    const json = await res.json() as { error?: string }
    setAddingReq(false)

    if (!res.ok) {
      setReqError(json.error ?? 'Failed to add requirement.')
      return
    }

    setNewReq(emptyReq)
    setShowReqForm(false)
    router.refresh()
  }

  async function handleDeleteRequirement(reqId: string) {
    if (!challenge) return
    setDeletingReq(reqId)
    await fetch(`/api/admin/challenges/${challenge.id}/requirements/${reqId}`, { method: 'DELETE' })
    setDeletingReq(null)
    router.refresh()
  }

  function reqSummary(req: RequirementRow): string {
    switch (req.requirement_type) {
      case 'specific_event': return `Specific event (×${req.min_count})`
      case 'discipline':     return `${req.discipline ?? '—'} (×${req.min_count})`
      case 'geographic':     return `${[req.region, req.country].filter(Boolean).join(', ')} (×${req.min_count})`
      case 'any_event':      return `Any event (×${req.min_count})`
    }
  }

  const input   = 'w-full rounded-lg border border-wire bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-1 focus:ring-mint'
  const label   = 'block text-xs font-medium text-ink-muted mb-1'
  const section = 'space-y-4 rounded-xl border border-wire bg-panel p-5'

  return (
    <div className="space-y-6">
      {/* ── Challenge fields ── */}
      <form onSubmit={handleSubmit} className="space-y-6">

        <div className={section}>
          <h2 className="text-sm font-semibold text-ink">Identity</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Name *</label>
              <input
                className={input}
                value={form.name}
                onChange={e => handleNameChange(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={label}>Slug *</label>
              <input
                className={input}
                value={form.slug}
                onChange={e => setField('slug', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className={label}>Tagline</label>
            <input
              className={input}
              value={form.tagline}
              onChange={e => setField('tagline', e.target.value)}
              placeholder="Short punchy subtitle"
            />
          </div>

          <div>
            <label className={label}>Description</label>
            <textarea
              className={`${input} min-h-[80px] resize-y`}
              value={form.description}
              onChange={e => setField('description', e.target.value)}
            />
          </div>
        </div>

        <div className={section}>
          <h2 className="text-sm font-semibold text-ink">Classification</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Family *</label>
              <select
                className={input}
                value={form.family}
                onChange={e => setField('family', e.target.value)}
              >
                {FAMILIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Tier *</label>
              <select
                className={input}
                value={form.tier}
                onChange={e => setField('tier', e.target.value)}
              >
                {TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Primary discipline</label>
              <select
                className={input}
                value={form.primary_discipline_slug}
                onChange={e => setField('primary_discipline_slug', e.target.value)}
              >
                <option value="">— None —</option>
                {disciplines.map(d => <option key={d.slug} value={d.slug}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Geographic scope</label>
              <select
                className={input}
                value={form.geographic_scope}
                onChange={e => setField('geographic_scope', e.target.value)}
              >
                {GEO_SCOPES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className={section}>
          <h2 className="text-sm font-semibold text-ink">Season &amp; Status</h2>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_seasonal}
                onChange={e => setField('is_seasonal', e.target.checked)}
                className="rounded border-wire"
              />
              Seasonal challenge
            </label>

            <div>
              <label className={label}>Season year</label>
              <input
                type="number"
                className={input}
                value={form.season_year}
                onChange={e => setField('season_year', e.target.value)}
                placeholder="2026"
                min="2000"
                max="2100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_retired}
                onChange={e => setField('is_retired', e.target.checked)}
                className="rounded border-wire"
              />
              Retired
            </label>

            {form.is_retired && (
              <div>
                <label className={label}>Retired date</label>
                <input
                  type="date"
                  className={input}
                  value={form.retired_at}
                  onChange={e => setField('retired_at', e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <div className={section}>
          <h2 className="text-sm font-semibold text-ink">Media &amp; Display</h2>

          <div>
            <label className={label}>Badge image URL</label>
            <input
              className={input}
              value={form.badge_image_url}
              onChange={e => setField('badge_image_url', e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className={label}>Hero image URL</label>
            <input
              className={input}
              value={form.hero_image_url}
              onChange={e => setField('hero_image_url', e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Sort order</label>
              <input
                type="number"
                className={input}
                value={form.sort_order}
                onChange={e => setField('sort_order', e.target.value)}
                min="0"
              />
            </div>
          </div>
        </div>

        <div className={section}>
          <h2 className="text-sm font-semibold text-ink">Visibility</h2>
          <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={e => setField('is_published', e.target.checked)}
              className="rounded border-wire"
            />
            Published (visible to athletes)
          </label>
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create challenge'}
          </button>

          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="ml-auto text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              {deleting ? 'Deleting…' : 'Delete challenge'}
            </button>
          )}
        </div>
      </form>

      {/* ── Requirements (edit mode only) ── */}
      {isEdit && (
        <div className={section}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">
              Requirements
              <span className="ml-2 text-xs font-normal text-ink-muted">
                ({challenge!.events_required_total} events total)
              </span>
            </h2>
            {!showReqForm && (
              <button
                onClick={() => setShowReqForm(true)}
                className="flex items-center gap-1.5 text-xs text-mint hover:text-mint/80 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add requirement
              </button>
            )}
          </div>

          {/* Existing requirements */}
          {requirements.length > 0 ? (
            <div className="divide-y divide-wire">
              {requirements.map(req => (
                <div key={req.id} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{req.display_label}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{reqSummary(req)}</p>
                    <span className="mt-1 inline-block text-[10px] font-mono text-ink-subtle bg-panel-raised px-1.5 py-0.5 rounded">
                      {req.requirement_type}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteRequirement(req.id)}
                    disabled={deletingReq === req.id}
                    className="shrink-0 text-ink-subtle hover:text-red-400 transition-colors mt-0.5"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            !showReqForm && (
              <p className="text-sm text-ink-muted">No requirements yet. Add at least one.</p>
            )
          )}

          {/* Add requirement form */}
          {showReqForm && (
            <form onSubmit={handleAddRequirement} className="mt-3 space-y-3 rounded-lg border border-wire/60 bg-panel-raised p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-ink">New requirement</p>
                <button
                  type="button"
                  onClick={() => { setShowReqForm(false); setNewReq(emptyReq); setReqError(null) }}
                >
                  <X className="h-4 w-4 text-ink-subtle hover:text-ink transition-colors" />
                </button>
              </div>

              <div>
                <label className={label}>Type *</label>
                <select
                  className={input}
                  value={newReq.requirement_type}
                  onChange={e => setNewReq(r => ({ ...r, requirement_type: e.target.value as RequirementType }))}
                >
                  {REQ_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {newReq.requirement_type === 'specific_event' && (
                <div>
                  <label className={label}>Event *</label>
                  <select
                    className={input}
                    value={newReq.event_id}
                    onChange={e => setNewReq(r => ({ ...r, event_id: e.target.value }))}
                    required
                  >
                    <option value="">— Select event —</option>
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({ev.discipline ?? '—'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {newReq.requirement_type === 'discipline' && (
                <div>
                  <label className={label}>Discipline *</label>
                  <select
                    className={input}
                    value={newReq.discipline}
                    onChange={e => setNewReq(r => ({ ...r, discipline: e.target.value }))}
                    required
                  >
                    <option value="">— Select discipline —</option>
                    {disciplines.map(d => <option key={d.slug} value={d.slug}>{d.name}</option>)}
                  </select>
                </div>
              )}

              {newReq.requirement_type === 'geographic' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={label}>Country</label>
                    <input
                      className={input}
                      value={newReq.country}
                      onChange={e => setNewReq(r => ({ ...r, country: e.target.value }))}
                      placeholder="AU, NZ …"
                    />
                  </div>
                  <div>
                    <label className={label}>Region</label>
                    <input
                      className={input}
                      value={newReq.region}
                      onChange={e => setNewReq(r => ({ ...r, region: e.target.value }))}
                      placeholder="Victoria, Canterbury …"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Min count *</label>
                  <input
                    type="number"
                    className={input}
                    value={newReq.min_count}
                    onChange={e => setNewReq(r => ({ ...r, min_count: e.target.value }))}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className={label}>Display label *</label>
                  <input
                    className={input}
                    value={newReq.display_label}
                    onChange={e => setNewReq(r => ({ ...r, display_label: e.target.value }))}
                    placeholder="Complete any 3 HYROX events"
                    required
                  />
                </div>
              </div>

              {reqError && <p className="text-xs text-red-400">{reqError}</p>}

              <button type="submit" className="btn-primary text-xs py-1.5" disabled={addingReq}>
                {addingReq ? 'Adding…' : 'Add requirement'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ── Earner title (edit mode only) ── */}
      {isEdit && (
        <form onSubmit={handleSaveTitle} className={section}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Earner title</h2>
            {challengeTitle && (
              <button
                type="button"
                onClick={handleDeleteTitle}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Remove title
              </button>
            )}
          </div>
          <p className="text-xs text-ink-muted">
            Athletes who complete this challenge earn this title on their Passport.
          </p>

          <div>
            <label className={label}>Title *</label>
            <input
              className={input}
              value={titleForm.title}
              onChange={e => setTitleForm(t => ({ ...t, title: e.target.value }))}
              placeholder="HYROX Starter"
              required
            />
          </div>

          <div>
            <label className={label}>Title description</label>
            <input
              className={input}
              value={titleForm.description}
              onChange={e => setTitleForm(t => ({ ...t, description: e.target.value }))}
              placeholder="Completed 3 HYROX events"
            />
          </div>

          {titleMsg && <p className="text-xs text-ink-muted">{titleMsg}</p>}

          <button type="submit" className="btn-primary" disabled={savingTitle}>
            {savingTitle ? 'Saving…' : 'Save title'}
          </button>
        </form>
      )}
    </div>
  )
}
