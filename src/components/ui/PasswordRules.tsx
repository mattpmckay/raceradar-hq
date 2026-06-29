import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export const PASSWORD_RULES = [
  { id: 'length',    label: 'At least 8 characters',  test: (p: string) => p.length >= 8 },
  { id: 'upper',     label: 'One uppercase letter',    test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lower',     label: 'One lowercase letter',    test: (p: string) => /[a-z]/.test(p) },
  { id: 'number',    label: 'One number',              test: (p: string) => /[0-9]/.test(p) },
] as const

export function validatePassword(password: string): string | null {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) return `Password must include: ${rule.label.toLowerCase()}.`
  }
  return null
}

export function PasswordRules({ password }: { password: string }) {
  if (!password) return null

  return (
    <ul className="space-y-1.5 rounded-lg border border-wire bg-panel p-3">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password)
        return (
          <li key={rule.id} className={cn('flex items-center gap-2 text-xs transition-colors', met ? 'text-mint' : 'text-ink-muted')}>
            <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all', met ? 'border-mint bg-mint/20' : 'border-wire')}>
              {met && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
            </span>
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}
