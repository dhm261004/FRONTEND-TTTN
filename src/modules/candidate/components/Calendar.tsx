import { useState } from 'react'
import { cn } from '@/shared/lib/cn'

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const MONTH_LABELS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
]

const pad = (n: number) => String(n).padStart(2, '0')
const toKey = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`

export function Calendar({
  value,
  onChange,
  markedDates,
  minDate,
}: {
  value: string
  onChange: (date: string) => void
  markedDates?: Set<string>
  minDate?: string
}) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(value ? Number(value.slice(0, 4)) : now.getFullYear())
  const [viewMonth, setViewMonth] = useState(value ? Number(value.slice(5, 7)) - 1 : now.getMonth())

  const todayKey = toKey(now.getFullYear(), now.getMonth(), now.getDate())
  const minKey = minDate ?? todayKey

  const firstWeekday = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7 // 0 = Monday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const goToMonth = (delta: number) => {
    let m = viewMonth + delta
    let y = viewYear
    if (m < 0) {
      m = 11
      y -= 1
    } else if (m > 11) {
      m = 0
      y += 1
    }
    setViewMonth(m)
    setViewYear(y)
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => goToMonth(-1)}
          aria-label="Tháng trước"
          className="flex size-8 items-center justify-center rounded-lg text-brand-ink-soft hover:bg-slate-100"
        >
          ‹
        </button>
        <p className="text-sm font-bold text-brand-ink">
          {MONTH_LABELS[viewMonth]} {viewYear}
        </p>
        <button
          type="button"
          onClick={() => goToMonth(1)}
          aria-label="Tháng sau"
          className="flex size-8 items-center justify-center rounded-lg text-brand-ink-soft hover:bg-slate-100"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-brand-ink-soft">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />
          const key = toKey(viewYear, viewMonth, day)
          const disabled = key < minKey
          const isSelected = key === value
          const isToday = key === todayKey
          const hasSession = markedDates?.has(key)
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onChange(key)}
              className={cn(
                'relative flex h-9 items-center justify-center rounded-lg text-sm transition-colors',
                disabled && 'cursor-not-allowed text-slate-300',
                !disabled && !isSelected && 'text-brand-ink hover:bg-brand-blue-50',
                isSelected && 'bg-brand-blue-500 font-semibold text-white',
                !isSelected && isToday && !disabled && 'font-bold text-brand-blue-600',
              )}
            >
              {day}
              {hasSession && !isSelected && <span className="absolute bottom-1 size-1 rounded-full bg-brand-blue-500" />}
              {hasSession && isSelected && <span className="absolute bottom-1 size-1 rounded-full bg-white" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
