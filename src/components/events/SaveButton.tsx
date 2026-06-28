'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SaveButton({
  eventId,
  initialSaved,
}: {
  eventId: string
  initialSaved: boolean
}) {
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    try {
      const res = await fetch('/api/favourites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_type: 'event', entity_id: eventId }),
      })
      if (res.status === 401) {
        router.push('/login')
        return
      }
      if (res.ok) {
        const data = await res.json() as { saved: boolean }
        setSaved(data.saved)
      }
    } finally {
      setLoading(false)
    }
  }

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
