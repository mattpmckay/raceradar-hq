'use client'

import { useEffect, useState } from 'react'
import { Clock, TrendingUp } from 'lucide-react'

type CountdownProps = {
  date: string
  label: string
  variant?: 'registration' | 'price'
}

export function DeadlineCountdown({ date, label, variant = 'registration' }: CountdownProps) {
  const [days, setDays] = useState<number | null>(null)

  useEffect(() => {
    const target = new Date(date)
    target.setHours(23, 59, 59, 999)
    const diff = Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    setDays(diff)
  }, [date])

  if (days === null || days < 0) return null

  const isUrgent = days <= 7
  const isSoon   = days <= 14

  const colourClass = isUrgent
    ? 'border-red-500/30 bg-red-500/10 text-red-400'
    : isSoon
    ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
    : 'border-mint/20 bg-mint/5 text-mint'

  const Icon = variant === 'price' ? TrendingUp : Clock

  const message = days === 0
    ? `${label} closes today`
    : days === 1
    ? `${label} closes tomorrow`
    : `${label} closes in ${days} day${days === 1 ? '' : 's'}`

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${colourClass}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}
