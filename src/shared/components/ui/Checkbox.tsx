import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode
  hint?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, hint, className, id, ...props },
  ref,
) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 px-4 py-3 text-sm hover:bg-slate-50',
        className,
      )}
    >
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className="mt-0.5 size-4 shrink-0 rounded border-slate-300 text-brand-blue-500 focus:ring-2 focus:ring-brand-blue-400/40"
        {...props}
      />
      <span>
        <span className="text-brand-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-brand-ink-soft">{hint}</span>}
      </span>
    </label>
  )
})
