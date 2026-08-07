import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-brand-ink placeholder:text-slate-400',
        'focus:outline-none focus:ring-2 focus:ring-brand-blue-400/40 focus:border-brand-blue-400',
        error ? 'border-red-300' : 'border-slate-200',
        className,
      )}
      {...props}
    />
  )
})
