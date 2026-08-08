import { useEffect, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

const SIZE_CLASSES = {
  md: 'max-w-lg',
  lg: 'max-w-3xl',
  xl: 'max-w-4xl',
} as const

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: keyof typeof SIZE_CLASSES
}) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className={cn('relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-xl', SIZE_CLASSES[size])}>
        {/* Rounding/clipping lives on this outer box, scrolling on the inner one — putting overflow-y-auto
            and rounded-2xl on the same element makes the scrollbar cut straight through the rounded corners. */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {title && (
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-brand-ink">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>
          )}
          {children}
          {footer && <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
