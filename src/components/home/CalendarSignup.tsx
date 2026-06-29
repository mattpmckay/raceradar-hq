'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Calendar category definitions ───────────────────────────────────────────

export type CalendarCategory = {
  id: string
  label: string
  emoji: string
}

export const CALENDAR_OPTIONS: CalendarCategory[] = [
  { id: 'all',        label: 'All Fitness Events',      emoji: '🏆' },
  { id: 'hyrox',      label: 'HYROX',                   emoji: '⚡' },
  { id: 'hybrid',     label: 'Hybrid Racing',            emoji: '🏋️' },
  { id: 'functional', label: 'Functional Fitness',       emoji: '💪' },
  { id: 'ocr',        label: 'Spartan / OCR',            emoji: '🏔️' },
  { id: 'ironman',    label: 'Ironman',                  emoji: '🏊' },
  { id: 'triathlon',  label: 'Triathlon',                emoji: '🚴' },
  { id: 'trail',      label: 'Trail Running',            emoji: '🌲' },
  { id: 'marathon',   label: 'Marathon / Road Running',  emoji: '🏃' },
  { id: 'beginner',   label: 'Beginner Friendly',        emoji: '⭐' },
  { id: 'team',       label: 'Team Events',              emoji: '👥' },
]

// ─── Sport → category mapping (for logged-in users) ──────────────────────────

const SPORT_TO_CATEGORIES: Record<string, string[]> = {
  'HYROX':         ['hyrox', 'hybrid'],
  'Deka Fit':      ['hybrid', 'functional'],
  'CrossFit':      ['functional'],
  'Spartan Race':  ['ocr'],
  'Tough Mudder':  ['ocr', 'team'],
  'Ironman':       ['ironman', 'triathlon'],
  'Ironman 70.3':  ['ironman', 'triathlon'],
  'Trail Running': ['trail'],
  'Marathon':      ['marathon'],
  'Road Racing':   ['marathon'],
}

export function sportsToCategories(sports: string[]): string[] {
  const ids = new Set<string>()
  for (const sport of sports) {
    for (const cat of SPORT_TO_CATEGORIES[sport] ?? []) {
      ids.add(cat)
    }
  }
  return [...ids]
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  preferredCategories?: string[]  // pre-derived from user's saved sports
  isPersonalised?: boolean        // show "based on your profile" hint
}

export function CalendarSignup({ preferredCategories = [], isPersonalised = false }: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [selected, setSelected] = useState<string[]>(
    preferredCategories.length > 0 ? preferredCategories : [],
  )
  const [email,     setEmail]     = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  function toggleCategory(id: string) {
    if (id === 'all') {
      setSelected(selected.includes('all') ? [] : ['all'])
      return
    }
    // Selecting a specific category clears 'all'
    const without = selected.filter((s) => s !== 'all')
    setSelected(
      without.includes(id)
        ? without.filter((s) => s !== id)
        : [...without, id],
    )
  }

  const canProceed = selected.length > 0

  const selectedLabels = selected.includes('all')
    ? ['All Fitness Events']
    : CALENDAR_OPTIONS.filter((o) => selected.includes(o.id)).map((o) => o.label)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, categories: selected }),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setError((data as { error?: string }).error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success state ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mint/15 ring-1 ring-mint/30">
          <Check className="h-7 w-7 text-mint" />
        </div>
        <div>
          <p className="font-heading text-lg font-bold text-ink">You&apos;re on the list!</p>
          <p className="mt-1 text-sm text-ink-muted">
            We&apos;ll send your{' '}
            <span className="text-ink">
              {selectedLabels.length === 1 ? selectedLabels[0] : `${selectedLabels.length} calendars`}
            </span>{' '}
            as soon as {selectedLabels.length === 1 ? "it's" : "they're"} ready.
          </p>
        </div>
      </div>
    )
  }

  // ── Step 1 — Choose categories ───────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="font-heading text-xl font-bold text-ink">Choose your calendar</p>
          <p className="mt-1 text-sm text-ink-muted">
            Select the events you want to follow. You can pick more than one.
          </p>
          {isPersonalised && preferredCategories.length > 0 && (
            <p className="mt-2 text-xs text-mint">
              Pre-selected based on your saved sports — adjust as you like.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CALENDAR_OPTIONS.map((opt) => {
            const isSelected = selected.includes(opt.id)
            const isAllSelected = selected.includes('all')
            const isDisabled = isAllSelected && opt.id !== 'all'
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleCategory(opt.id)}
                disabled={isDisabled}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left text-sm font-medium transition-all duration-150',
                  isSelected
                    ? 'border-mint/60 bg-mint/10 text-ink ring-1 ring-mint/30'
                    : 'border-wire bg-panel text-ink-muted hover:border-wire-bright hover:text-ink',
                  isDisabled && 'opacity-40 cursor-not-allowed',
                  opt.id === 'all' && 'col-span-2 sm:col-span-3',
                )}
              >
                <span className="text-base leading-none" aria-hidden>{opt.emoji}</span>
                <span className="flex-1">{opt.label}</span>
                {isSelected && (
                  <span className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-mint">
                    <Check className="h-2.5 w-2.5 text-canvas" strokeWidth={3} />
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => setStep(2)}
          disabled={!canProceed}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-mint px-6 py-3.5 text-sm font-semibold text-canvas transition-all duration-200 hover:bg-mint-300 hover:shadow-lg hover:shadow-mint/20 hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>

        {!canProceed && (
          <p className="text-center text-xs text-ink-subtle">Select at least one calendar to continue.</p>
        )}
      </div>
    )
  }

  // ── Step 2 — Email ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="font-heading text-xl font-bold text-ink">Where should we send it?</p>
        <p className="mt-1 text-sm text-ink-muted">Enter your email and we&apos;ll be in touch when it&apos;s ready.</p>
      </div>

      {/* Confirm selection */}
      <div className="rounded-xl border border-wire bg-panel px-4 py-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">Your selection</p>
        <div className="flex flex-wrap gap-1.5">
          {selectedLabels.map((label) => (
            <span
              key={label}
              className="inline-flex items-center rounded-full border border-mint/30 bg-mint/10 px-2.5 py-0.5 text-xs font-medium text-mint"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError('') }}
          placeholder="your@email.com"
          className="w-full rounded-xl border border-wire bg-panel px-4 py-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint transition-colors"
          aria-label="Email address"
          autoComplete="email"
        />

        {error && (
          <p className="text-sm text-red-400" role="alert">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-mint px-6 py-3.5 text-sm font-semibold text-canvas transition-all duration-200 hover:bg-mint-300 hover:shadow-lg hover:shadow-mint/20 hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {loading ? 'Sending…' : `Get my ${selectedLabels.length === 1 ? selectedLabels[0] : 'Fitness'} Calendar`}
        </button>

        <p className="text-center text-xs text-ink-muted">No spam — ever. Unsubscribe any time.</p>
      </form>

      <button
        type="button"
        onClick={() => setStep(1)}
        className="flex items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-ink mx-auto"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Change selection
      </button>
    </div>
  )
}
