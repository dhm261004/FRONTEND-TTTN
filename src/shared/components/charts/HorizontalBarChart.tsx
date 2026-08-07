const BAR_COLOR_CLASSES = {
  blue: 'bg-brand-blue-500',
  green: 'bg-emerald-500',
} as const

export interface HorizontalBarChartDatum {
  label: string
  value: number
}

export function HorizontalBarChart({
  data,
  color = 'blue',
  valueFormatter = (v: number) => String(v),
  emptyLabel = 'Chưa có dữ liệu.',
}: {
  data: HorizontalBarChartDatum[]
  color?: keyof typeof BAR_COLOR_CLASSES
  valueFormatter?: (value: number) => string
  emptyLabel?: string
}) {
  if (data.length === 0) {
    return <p className="text-sm text-brand-ink-soft">{emptyLabel}</p>
  }

  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <ul className="space-y-3.5">
      {data.map((d) => {
        const widthPct = Math.max((d.value / max) * 100, d.value > 0 ? 2 : 0)
        return (
          <li key={d.label}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-brand-ink" title={d.label}>
                {d.label}
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-brand-ink">{valueFormatter(d.value)}</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-100">
              <div
                className={`h-2.5 rounded-full ${BAR_COLOR_CLASSES[color]}`}
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
