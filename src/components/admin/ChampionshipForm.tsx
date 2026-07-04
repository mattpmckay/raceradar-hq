'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/utils'
import type { Tables } from '@/types/supabase'

type ChampionshipRow = Tables<'championships'>
type DisciplineOption = { slug: string; name: string }

type Props = {
  championship?: ChampionshipRow
  disciplines:   DisciplineOption[]
}

function str(v: string | number | null | undefined): string {
  return v == null ? '' : String(v)
}

export function ChampionshipForm({ championship, disciplines }: Props) {
  const router = useRouter()
  const isEdit = Boolean(championship)

  const [form, setForm] = useState({
    name:        str(championship?.name),
    slug:        str(championship?.slug),
    discipline:  str(championship?.discipline),
    country:     str(championship?.country),
    season_year: str(championship?.season_year),
    description: str(championship?.description),
    website_url: str(championship?.website_url),
    organiser:   str(championship?.organiser),
    is_published: championship?.is_published ?? false,
  })

  const [error,    setError]    = useState<string | null>(null)
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: prev.slug && prev.slug !== slugify(prev.name) ? prev.slug : slugify(name),
    }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const url    = isEdit ? `/api/admin/championships/${championship!.id}` : '/api/admin/championships'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json() as { id?: string; error?: string }

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
        return
      }

      if (!isEdit && data.id) {
        router.push(`/admin/championships/${data.id}/edit`)
      } else {
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this championship? This cannot be undone.')) return
    setDeleting(true)

    try {
      const res = await fetch(`/api/admin/championships/${championship!.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Delete failed.')
        return
      }
      router.push('/admin/championships')
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Core fields */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-ink">Championship details</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-muted">Name *</label>
            <input
              className="input w-full"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              placeholder="e.g. HYROX World Championship"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-muted">Slug *</label>
            <input
              className="input w-full font-mono text-sm"
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              required
              placeholder="e.g. hyrox-world-championship"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-muted">Discipline *</label>
            <select
              className="input w-full"
              value={form.discipline}
              onChange={(e) => set('discipline', e.target.value)}
              required
            >
              <option value="">— Select discipline —</option>
              {disciplines.map((d) => (
                <option key={d.slug} value={d.slug}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-muted">Country</label>
            <input
              className="input w-full"
              value={form.country}
              onChange={(e) => set('country', e.target.value)}
              placeholder="e.g. Germany"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-muted">Season year</label>
            <input
              className="input w-full"
              type="number"
              min="2000"
              max="2099"
              value={form.season_year}
              onChange={(e) => set('season_year', e.target.value)}
              placeholder="e.g. 2025"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink-muted">Organiser</label>
          <input
            className="input w-full"
            value={form.organiser}
            onChange={(e) => set('organiser', e.target.value)}
            placeholder="e.g. HYROX GmbH"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink-muted">Website URL</label>
          <input
            className="input w-full"
            type="url"
            value={form.website_url}
            onChange={(e) => set('website_url', e.target.value)}
            placeholder="https://"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink-muted">Description</label>
          <textarea
            className="input w-full min-h-[100px] resize-y"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Brief description of the championship…"
          />
        </div>
      </div>

      {/* Publish */}
      <div className="card flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink">Published</p>
          <p className="text-xs text-ink-muted">Visible on the public championships directory</p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            className="sr-only"
            checked={form.is_published}
            onChange={(e) => set('is_published', e.target.checked)}
          />
          <div className={`h-5 w-9 rounded-full transition-colors ${form.is_published ? 'bg-mint' : 'bg-wire'}`} />
          <div className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.is_published ? 'translate-x-4' : ''}`} />
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create championship'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/championships')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>

        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            {deleting ? 'Deleting…' : 'Delete championship'}
          </button>
        )}
      </div>
    </form>
  )
}
