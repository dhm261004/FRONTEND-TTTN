import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface FieldProps {
  label: ReactNode
  required?: boolean
  error?: string
  hint?: ReactNode
  children: ReactNode
  className?: string
}

export function Field({ label, required, error, hint, children, className }: FieldProps) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-3 block text-sm font-medium text-brand-ink">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-2 block text-xs text-brand-ink-soft">{hint}</span>}
      {error && <span className="mt-2 block text-xs text-red-500">{error}</span>}
    </label>
  )
}
