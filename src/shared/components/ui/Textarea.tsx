import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, error, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-brand-ink placeholder:text-slate-400',
        'focus:outline-none focus:ring-2 focus:ring-brand-blue-400/40 focus:border-brand-blue-400',
        error ? 'border-red-300' : 'border-slate-200',
        className,
      )}
      {...props}
    />
  )
})
