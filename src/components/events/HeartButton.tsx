'use client'

import { Heart } from 'lucide-react'
import { useFavourite } from '@/hooks/useFavourite'

export function HeartButton({
  eventId,
  initialSaved,
}: {
  eventId: string
  initialSaved: boolean
}) {
  const { saved, loading, toggle } = useFavourite(eventId, initialSaved)

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle()
      }}
      disabled={loading}
      aria-label={saved ? 'Remove from saved' : 'Save event'}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-wire bg-canvas/80 backdrop-blur-sm transition-all duration-200 hover:border-red-400/50 hover:bg-red-500/10 disabled:opacity-50"
    >
      <Heart
        className={`h-3.5 w-3.5 transition-all duration-200 ${
          saved ? 'fill-red-400 text-red-400 scale-110' : 'text-ink-muted'
        }`}
      />
    </button>
  )
}
