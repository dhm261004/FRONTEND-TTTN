import type { ReactNode } from 'react'

export function UnsupportedNotice({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs text-brand-ink-soft">
      <span aria-hidden>ⓘ</span>
      <span>{children}</span>
    </div>
  )
}
