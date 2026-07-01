'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ImportQueueActions({
  id,
  hasDuplicateWarning = false,
}: {
  id: string
  hasDuplicateWarning?: boolean
}) {
  const router = useRouter()
  const [loading,  setLoading]  = useState<'approve' | 'reject' | null>(null)
  const [notes,    setNotes]    = useState('')
  const [confirmed, setConfirmed] = useState(false)

  async function act(action: 'approve' | 'reject') {
    if (action === 'approve' && hasDuplicateWarning && !confirmed) {
      setConfirmed(true)
      return
    }
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
      setConfirmed(false)
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
      {confirmed && (
        <p className="text-xs text-yellow-400 text-right w-48">
          Potential duplicate detected. Click Approve again to confirm.
        </p>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => act('approve')}
          disabled={loading !== null}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-canvas hover:opacity-90 disabled:opacity-50 transition-opacity ${
            confirmed ? 'bg-yellow-500' : 'bg-mint'
          }`}
        >
          {loading === 'approve' ? 'Applying…' : confirmed ? 'Confirm Approve' : 'Approve'}
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
