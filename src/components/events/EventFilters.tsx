'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Search } from 'lucide-react'
import { Select } from '@/components/ui/Select'

const DISCIPLINES = [
  { value: 'HYROX',         label: 'HYROX' },
  { value: 'Spartan Race',  label: 'Spartan Race' },
  { value: 'Ironman',       label: 'Ironman' },
  { value: 'Marathon',      label: 'Marathon' },
  { value: 'Trail Running', label: 'Trail Running' },
  { value: 'Deka Fit',      label: 'Deka Fit' },
]

const EVENT_TYPES = [
  { value: 'race', label: 'Race' },
]

export function EventFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`/events?${params.toString()}`)
    },
    [router, searchParams],
  )

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          className="input pl-9"
          placeholder="Search events..."
          defaultValue={searchParams.get('q') ?? ''}
          onChange={(e) => updateParam('q', e.target.value)}
        />
      </div>

      <Select
        options={DISCIPLINES}
        placeholder="All disciplines"
        value={searchParams.get('discipline') ?? ''}
        onChange={(e) => updateParam('discipline', e.target.value)}
        className="sm:w-48"
      />

      <Select
        options={EVENT_TYPES}
        placeholder="All types"
        value={searchParams.get('type') ?? ''}
        onChange={(e) => updateParam('type', e.target.value)}
        className="sm:w-40"
      />
    </div>
  )
}
