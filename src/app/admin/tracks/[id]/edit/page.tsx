import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { TrackForm } from '@/components/admin/TrackForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Edit Track — Admin' }

export default async function EditTrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: track } = await supabase
    .from('tracks')
    .select('*')
    .eq('id', id)
    .single()

  if (!track) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/admin/tracks"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Tracks
        </Link>
        <h1 className="text-2xl font-bold text-ink">{track.name}</h1>
        <p className="mt-1 text-xs text-ink-subtle font-mono">{track.slug}</p>
      </div>

      <TrackForm track={track} />
    </div>
  )
}
