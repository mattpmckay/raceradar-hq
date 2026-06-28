'use client'

import { Heart } from 'lucide-react'
import { useFavourite } from '@/hooks/useFavourite'

export function SaveButton({
  eventId,
  initialSaved,
}: {
  eventId: string
  initialSaved: boolean
}) {
  const { saved, loading, toggle } = useFavourite(eventId, initialSaved)

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`btn-secondary w-full justify-center transition-colors${saved ? ' border-mint/40 text-mint hover:border-mint/60 hover:text-mint' : ''}`}
    >
      <Heart className={`h-4 w-4 transition-all${saved ? ' fill-mint text-mint' : ''}`} />
      {saved ? 'Saved' : 'Save Event'}
    </button>
  )
}
