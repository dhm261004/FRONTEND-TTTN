import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type Tone = 'green' | 'red' | 'amber' | 'slate' | 'blue'

const toneClasses: Record<Tone, string> = {
  green: 'text-emerald-600',
  red: 'text-red-500',
  amber: 'text-amber-500',
  slate: 'text-slate-400',
  blue: 'text-brand-blue-600',
}

export function StatusText({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={cn('font-medium', toneClasses[tone])}>{children}</span>
}

export function Badge({ tone = 'slate', children }: { tone?: Tone; children: ReactNode }) {
  const bg: Record<Tone, string> = {
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-500',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-100 text-slate-500',
    blue: 'bg-brand-blue-50 text-brand-blue-600',
  }
  return (
    <span className={cn('inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium', bg[tone])}>
      {children}
    </span>
  )
}
