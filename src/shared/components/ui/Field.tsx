import type { ReactNode } from 'react'

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
    <label className={className}>
      <span className="mb-2 block text-sm font-medium text-brand-ink">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1.5 block text-xs text-brand-ink-soft">{hint}</span>}
      {error && <span className="mt-1.5 block text-xs text-red-500">{error}</span>}
    </label>
  )
}
