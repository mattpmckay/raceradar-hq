import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'outline'

const variantClasses: Record<BadgeVariant, string> = {
  default:  'bg-surface-muted text-gray-300',
  brand:    'bg-brand-500/20 text-brand-400',
  success:  'bg-green-500/20 text-green-400',
  warning:  'bg-yellow-500/20 text-yellow-400',
  danger:   'bg-red-500/20 text-red-400',
  outline:  'border border-surface-border text-gray-400',
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
