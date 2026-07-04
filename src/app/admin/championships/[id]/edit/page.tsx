import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { ChampionshipForm } from '@/components/admin/ChampionshipForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Edit Championship — Admin' }

export default async function EditChampionshipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const [{ data: championship }, { data: disciplines }] = await Promise.all([
    supabase.from('championships').select('*').eq('id', id).single(),
    supabase.from('disciplines').select('slug, name').eq('is_active', true).order('name'),
  ])

  if (!championship) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/admin/championships"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Championships
        </Link>
        <h1 className="text-2xl font-bold text-ink">{championship.name}</h1>
        <p className="mt-1 text-xs text-ink-subtle font-mono">{championship.slug}</p>
      </div>

      <ChampionshipForm championship={championship} disciplines={disciplines ?? []} />
    </div>
  )
}
