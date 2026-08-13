import { useMemo, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import type { MentoringSession, SessionStatus } from '@/modules/mentor/types'

const DAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
const START_HOUR = 7
const END_HOUR = 21
const SLOTS_PER_HOUR = 2
const TOTAL_SLOTS = (END_HOUR - START_HOUR) * SLOTS_PER_HOUR

const BLOCK_CLASSES: Record<SessionStatus, string> = {
  pending: 'bg-amber-100 border-amber-300 text-amber-800',
  confirmed: 'bg-brand-blue-100 border-brand-blue-300 text-brand-blue-800',
  completed: 'bg-green-100 border-green-300 text-green-800',
  rescheduled: 'bg-slate-100 border-slate-300 text-slate-600',
  canceled: '',
}

function startOfWeek(date: Date) {
  const d = new Date(date)
  const dayIndex = (d.getDay() + 6) % 7 // Thứ 2 = 0
  d.setDate(d.getDate() - dayIndex)
  d.setHours(0, 0, 0, 0)
  return d
}

function slotIndex(date: Date) {
  const hours = date.getHours() + date.getMinutes() / 60
  const idx = Math.round((hours - START_HOUR) * SLOTS_PER_HOUR)
  return Math.min(Math.max(idx, 0), TOTAL_SLOTS)
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function WeekTimetable({ sessions, mentorLabel }: { sessions: MentoringSession[]; mentorLabel: (s: MentoringSession) => string }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  }), [weekStart])

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    return d
  }, [weekStart])

  const visible = useMemo(
    () =>
      sessions.filter((s) => {
        if (s.status === 'canceled') return false
        const start = new Date(s.start_time)
        return start >= weekStart && start < weekEnd
      }),
    [sessions, weekStart, weekEnd],
  )

  const rangeLabel = `${days[0].toLocaleDateString('vi-VN')} - ${days[6].toLocaleDateString('vi-VN')}`

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setWeekStart((w) => { const d = new Date(w); d.setDate(d.getDate() - 7); return d })}
            aria-label="Tuần trước"
            className="flex size-8 items-center justify-center rounded-lg text-brand-ink-soft hover:bg-slate-100"
          >
            ‹
          </button>
          <p className="w-44 text-center text-sm font-semibold text-brand-ink">{rangeLabel}</p>
          <button
            type="button"
            onClick={() => setWeekStart((w) => { const d = new Date(w); d.setDate(d.getDate() + 7); return d })}
            aria-label="Tuần sau"
            className="flex size-8 items-center justify-center rounded-lg text-brand-ink-soft hover:bg-slate-100"
          >
            ›
          </button>
        </div>
        <button
          type="button"
          onClick={() => setWeekStart(startOfWeek(new Date()))}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-brand-ink-soft hover:bg-slate-50"
        >
          Tuần này
        </button>
      </div>

      <div className="overflow-x-auto">
        <div
          className="grid min-w-[760px]"
          style={{ gridTemplateColumns: '56px repeat(7, minmax(100px, 1fr))', gridTemplateRows: `auto repeat(${TOTAL_SLOTS}, 1.75rem)` }}
        >
          <div className="border-b border-slate-100" />
          {days.map((d, i) => (
            <div key={i} className="border-b border-l border-slate-100 px-1 py-2 text-center">
              <p className="text-xs font-semibold text-brand-ink">{DAY_LABELS[i]}</p>
              <p className={cn('text-xs', sameDay(d, new Date()) ? 'font-bold text-brand-blue-600' : 'text-brand-ink-soft')}>
                {d.getDate()}/{d.getMonth() + 1}
              </p>
            </div>
          ))}

          {Array.from({ length: TOTAL_SLOTS }, (_, slot) => {
            const hour = START_HOUR + Math.floor(slot / SLOTS_PER_HOUR)
            const isHourStart = slot % SLOTS_PER_HOUR === 0
            return (
              <div
                key={`label-${slot}`}
                style={{ gridColumn: 1, gridRow: slot + 2 }}
                className="pr-2 text-right text-[10px] text-brand-ink-soft"
              >
                {isHourStart ? `${hour}:00` : ''}
              </div>
            )
          })}

          {days.map((_, dayIdx) =>
            Array.from({ length: TOTAL_SLOTS }, (_, slot) => (
              <div
                key={`cell-${dayIdx}-${slot}`}
                style={{ gridColumn: dayIdx + 2, gridRow: slot + 2 }}
                className={cn('border-l border-slate-100', slot % SLOTS_PER_HOUR === 0 && 'border-t')}
              />
            )),
          )}

          {visible.map((s) => {
            const start = new Date(s.start_time)
            const end = new Date(s.end_time)
            const dayIdx = days.findIndex((d) => sameDay(d, start))
            if (dayIdx === -1) return null
            const rowStart = slotIndex(start) + 2
            const rowEnd = Math.max(slotIndex(end), slotIndex(start) + 1) + 2
            return (
              <div
                key={s.id}
                style={{ gridColumn: dayIdx + 2, gridRow: `${rowStart} / ${rowEnd}` }}
                className={cn('m-0.5 overflow-hidden rounded-md border px-1.5 py-1 text-[11px] leading-tight', BLOCK_CLASSES[s.status])}
                title={`${s.topic} · ${mentorLabel(s)}`}
              >
                <p className="line-clamp-1 font-semibold">{s.topic}</p>
                <p className="line-clamp-1 opacity-80">{mentorLabel(s)}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-brand-ink-soft">
        <LegendDot className="bg-amber-300" label="Chờ duyệt" />
        <LegendDot className="bg-brand-blue-400" label="Đã duyệt" />
        <LegendDot className="bg-green-300" label="Hoàn thành" />
        <LegendDot className="bg-slate-300" label="Đã dời lịch" />
      </div>
    </div>
  )
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn('size-2.5 rounded-full', className)} /> {label}
    </span>
  )
}
