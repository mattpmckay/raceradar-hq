'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function useFavourite(eventId: string, initialSaved: boolean) {
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

  return { saved, loading, toggle }
}
