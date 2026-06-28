'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Values must match exact discipline strings stored in the DB
const SPORTS = [
  'HYROX',
  'CrossFit',
  'Deka Fit',
  'Spartan Race',
  'Tough Mudder',
  'Ironman',
  'Ironman 70.3',
  'Marathon',
  'Road Racing',
  'Trail Running',
]

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

export function HeroSearchBar() {
  const router = useRouter()
  const [sport,   setSport]   = useState('')
  const [country, setCountry] = useState('')
  const [query,   setQuery]   = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (sport)   params.set('discipline', sport)
    if (country) params.set('country',    country)
    if (query)   params.set('q',          query)
    router.push(`/events${params.size ? `?${params}` : ''}`)
  }

  return (
    <div className="mt-10 w-full max-w-3xl">
      <div className="flex flex-col gap-2 rounded-2xl border border-wire bg-panel p-2 sm:flex-row sm:items-center sm:gap-0 sm:divide-x sm:divide-wire">

        {/* Sport select */}
        <div className="flex-1 min-w-0">
          <select
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            className="w-full appearance-none bg-transparent px-4 py-3 text-sm font-medium text-ink-muted focus:outline-none focus:text-ink cursor-pointer hover:text-ink transition-colors"
            aria-label="Select sport"
          >
            <option value="">Sport</option>
            {SPORTS.map((s) => (
              <option key={s} value={s} className="bg-panel text-ink">
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Country select */}
        <div className="flex-1 min-w-0">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full appearance-none bg-transparent px-4 py-3 text-sm font-medium text-ink-muted focus:outline-none focus:text-ink cursor-pointer hover:text-ink transition-colors"
            aria-label="Select country"
          >
            <option value="">Country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c} className="bg-panel text-ink">
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Text search */}
        <div className="flex-[2] min-w-0 flex items-center gap-2 px-4">
          <SearchIcon className="h-4 w-4 shrink-0 text-ink-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Event name or keyword…"
            className="w-full bg-transparent py-3 text-sm text-ink placeholder:text-ink-muted focus:outline-none"
            aria-label="Search events"
          />
        </div>

        {/* CTA */}
        <div className="px-2">
          <button
            onClick={handleSearch}
            className="w-full sm:w-auto rounded-xl bg-mint px-6 py-3 text-sm font-semibold text-canvas transition-all duration-200 hover:bg-mint-300 hover:shadow-lg hover:shadow-mint/20 hover:-translate-y-px active:translate-y-0"
          >
            Find Events
          </button>
        </div>
      </div>
    </div>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13.5 13.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
