import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, error, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-brand-ink',
        'focus:outline-none focus:ring-2 focus:ring-brand-blue-400/40 focus:border-brand-blue-400',
        error ? 'border-red-300' : 'border-slate-200',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
})
