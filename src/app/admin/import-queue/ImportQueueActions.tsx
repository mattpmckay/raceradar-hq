'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ImportQueueActions({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [notes, setNotes]     = useState('')

  async function act(action: 'approve' | 'reject') {
    setLoading(action)
    try {
      const res = await fetch(`/api/admin/import-queue/${id}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action, reviewer_notes: notes || undefined }),
      })
      if (!res.ok) {
        const data = await res.json() as { error: string }
        alert(data.error ?? 'Something went wrong.')
        return
      }
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="shrink-0 flex flex-col gap-2 items-end">
      <textarea
        placeholder="Reviewer notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="form-input w-48 text-xs resize-none"
      />
      <div className="flex gap-2">
        <button
          onClick={() => act('approve')}
          disabled={loading !== null}
          className="rounded-lg bg-mint px-3 py-1.5 text-xs font-semibold text-canvas hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading === 'approve' ? 'Applying…' : 'Approve'}
        </button>
        <button
          onClick={() => act('reject')}
          disabled={loading !== null}
          className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:border-red-500/60 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
        >
          {loading === 'reject' ? 'Rejecting…' : 'Reject'}
        </button>
      </div>
    </div>
  )
}
