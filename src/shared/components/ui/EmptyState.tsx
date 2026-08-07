import type { ReactNode } from 'react'

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <p className="text-sm font-semibold text-brand-ink">{title}</p>
      {description && <p className="max-w-sm text-sm text-brand-ink-soft">{description}</p>}
      {action}
    </div>
  )
}
