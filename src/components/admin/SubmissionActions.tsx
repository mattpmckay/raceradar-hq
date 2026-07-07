'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil } from 'lucide-react'

interface Props {
  eventId: string
  eventSlug: string
  eventTitle: string
}

export function SubmissionActions({ eventId, eventTitle }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleApprove() {
    setLoading('approve')
    setError(null)
    try {
      const res = await fetch(`/api/admin/events/${eventId}/approve`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Approve failed.')
      } else {
        router.refresh()
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(null)
    }
  }

  async function handleReject() {
    if (!window.confirm(`Delete this submission?\n\n"${eventTitle}"\n\nThis cannot be undone.`)) return
    setLoading('reject')
    setError(null)
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Reject failed.')
      } else {
        router.refresh()
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleApprove}
        disabled={loading !== null}
        className="rounded-md bg-mint/15 px-2.5 py-1 text-xs font-semibold text-mint transition-colors hover:bg-mint/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === 'approve' ? '…' : 'Approve'}
      </button>
      <button
        onClick={handleReject}
        disabled={loading !== null}
        className="rounded-md bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === 'reject' ? '…' : 'Reject'}
      </button>
      <Link
        href={`/admin/events/${eventId}/edit`}
        className="btn-ghost p-1.5 text-ink-muted hover:text-ink"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
