'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

const COUNTRIES = [
  'Australia',
  'New Zealand',
  'Singapore',
  'Japan',
  'South Korea',
  'Thailand',
  'Hong Kong',
  'China',
  'Indonesia',
]

const WINDOWS = [
  { label: 'Any time',       value: '' },
  { label: 'This month',     value: 'this-month' },
  { label: 'Next 3 months',  value: '3months' },
  { label: 'Next 6 months',  value: '6months' },
]

const WINDOW_LABELS: Record<string, string> = {
  'this-month': 'This month',
  '3months':    'Next 3 months',
  '6months':    'Next 6 months',
}

const AU_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']

export function EventFilters() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [searchVal, setSearchVal] = useState(searchParams.get('q') ?? '')
  const mounted = useRef(false)

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) { params.set(key, value) } else { params.delete(key) }
      params.delete('page')
      router.push(`/events?${params.toString()}`)
    },
    [router, searchParams],
  )

  const updateCountry = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) { params.set('country', value) } else { params.delete('country') }
      if (value !== 'Australia') params.delete('region')
      params.delete('page')
      router.push(`/events?${params.toString()}`)
    },
    [router, searchParams],
  )

  const clearAll = useCallback(() => {
    const discipline = searchParams.get('discipline')
    const params = new URLSearchParams()
    if (discipline) params.set('discipline', discipline)
    router.push(`/events${params.size ? `?${params}` : ''}`)
    setSearchVal('')
  }, [router, searchParams])

  // Debounced search: fires 350 ms after user stops typing; immediate on clear
  const updateParamRef = useRef(updateParam)
  useEffect(() => { updateParamRef.current = updateParam }, [updateParam])

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    if (searchVal === '') {
      updateParamRef.current('q', '')
      return
    }
    const id = setTimeout(() => updateParamRef.current('q', searchVal.trim()), 350)
    return () => clearTimeout(id)
  }, [searchVal])

  const activeCountry = searchParams.get('country') ?? ''
  const activeRegion  = searchParams.get('region') ?? ''
  const activeQ       = searchParams.get('q') ?? ''
  const activeWindow  = searchParams.get('window') ?? ''
  const hasActiveFilters = !!(activeCountry || activeRegion || activeQ || activeWindow)

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search by name, city, country or sport…"
            className="w-full rounded-xl border border-wire bg-panel pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-mint/50 focus:outline-none focus:ring-1 focus:ring-mint/20 transition-colors"
          />
        </div>

        {/* Country */}
        <FilterSelect
          value={activeCountry}
          onChange={updateCountry}
          aria-label="Filter by country"
        >
          <option value="">All countries</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </FilterSelect>

        {/* Australian state — only shown when Australia is selected */}
        {(activeCountry === 'Australia' || activeCountry === '') && (
          <FilterSelect
            value={activeRegion}
            onChange={(v) => updateParam('region', v)}
            aria-label="Filter by state"
          >
            <option value="">All states</option>
            {AU_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </FilterSelect>
        )}

        {/* Time window */}
        <FilterSelect
          value={activeWindow}
          onChange={(v) => updateParam('window', v)}
          aria-label="Filter by time window"
        >
          {WINDOWS.map((w) => (
            <option key={w.value} value={w.value}>{w.label}</option>
          ))}
        </FilterSelect>

      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {activeQ && (
            <FilterChip
              label={`"${activeQ}"`}
              onRemove={() => { setSearchVal(''); updateParam('q', '') }}
            />
          )}
          {activeCountry && (
            <FilterChip label={activeCountry} onRemove={() => { updateParam('country', ''); updateParam('region', '') }} />
          )}
          {activeRegion && (
            <FilterChip label={activeRegion} onRemove={() => updateParam('region', '')} />
          )}
          {activeWindow && (
            <FilterChip
              label={WINDOW_LABELS[activeWindow] ?? activeWindow}
              onRemove={() => updateParam('window', '')}
            />
          )}
          <button
            onClick={clearAll}
            className="text-xs text-ink-muted underline underline-offset-2 hover:text-ink transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterSelect({
  value,
  onChange,
  children,
  'aria-label': ariaLabel,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
  'aria-label': string
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="w-full sm:w-44 cursor-pointer appearance-none rounded-xl border border-wire bg-panel px-4 py-2.5 pr-9 text-sm text-ink-muted focus:border-mint/50 focus:outline-none focus:ring-1 focus:ring-mint/20 transition-colors"
      >
        {children}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
        <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden>
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-wire/70 bg-panel px-3 py-1 text-xs text-ink-muted">
      {label}
      <button
        onClick={onRemove}
        className="-mr-0.5 ml-0.5 rounded-full p-0.5 hover:bg-wire/60 hover:text-ink transition-colors"
        aria-label={`Remove filter ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}
