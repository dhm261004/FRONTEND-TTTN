import type { ComponentType, SVGProps } from 'react'
import { cn } from '@/shared/lib/cn'

type Tone = 'blue' | 'green' | 'amber' | 'red' | 'slate'

const toneClasses: Record<Tone, string> = {
  blue: 'bg-brand-blue-50 text-brand-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-500',
  slate: 'bg-slate-100 text-slate-500',
}

export function StatCard({
  icon: IconCmp,
  tone = 'blue',
  label,
  value,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  tone?: Tone
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={cn('mb-3 flex size-10 items-center justify-center rounded-xl', toneClasses[tone])}>
        <IconCmp className="size-5" />
      </div>
      <p className="text-sm text-brand-ink-soft">{label}</p>
      <p className="mt-1 text-2xl font-bold text-brand-ink">{value}</p>
    </div>
  )
}
