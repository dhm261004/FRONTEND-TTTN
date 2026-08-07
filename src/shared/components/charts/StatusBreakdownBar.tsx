export interface StatusSegment {
  key: string
  label: string
  value: number
  barClass: string
  swatchClass: string
}

export function StatusBreakdownBar({ segments, total }: { segments: StatusSegment[]; total: number }) {
  if (total === 0) {
    return <p className="text-sm text-brand-ink-soft">Chưa có hồ sơ ứng tuyển nào.</p>
  }

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
        {segments.map((s, i) => {
          if (s.value === 0) return null
          const pct = (s.value / total) * 100
          return (
            <div
              key={s.key}
              className={`h-full ${s.barClass} ${i > 0 ? 'ml-0.5' : ''}`}
              style={{ width: `${pct}%` }}
              title={`${s.label}: ${s.value}`}
            />
          )
        })}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-sm">
            <span className={`size-2.5 rounded-full ${s.swatchClass}`} aria-hidden />
            <span className="text-brand-ink-soft">{s.label}</span>
            <span className="font-semibold tabular-nums text-brand-ink">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
