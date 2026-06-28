import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'outline'

const variantClasses: Record<BadgeVariant, string> = {
  default:  'bg-panel-raised text-ink-muted',
  brand:    'bg-mint/15 text-mint',
  success:  'bg-green-500/15 text-green-400',
  warning:  'bg-amber-500/15 text-amber-400',
  danger:   'bg-red-500/15 text-red-400',
  outline:  'border border-wire text-ink-muted',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('badge', variantClasses[variant], className)}>
      {children}
    </span>
  )
}
