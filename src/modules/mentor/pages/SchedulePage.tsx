import { useEffect, useMemo, useState } from 'react'
import { MentorLayout } from '@/modules/mentor/components/MentorLayout'
import { mentorSessionsApi } from '@/modules/mentor/api/mentorSessions.api'
import { mentorPurchasesApi } from '@/modules/mentor/api/mentorPurchases.api'
import { SessionStatusBadge } from '@/modules/mentor/components/SessionStatusBadge'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { Field } from '@/shared/components/ui/Field'
import { Input } from '@/shared/components/ui/Input'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { ApiError } from '@/shared/api/types'
import { formatDate } from '@/shared/lib/format'
import { cn } from '@/shared/lib/cn'
import type { MentoringSession, MentorPurchaseCandidate } from '@/modules/mentor/types'

const HOUR_START = 7
const HOUR_END = 21
const HOUR_HEIGHT = 48
const WEEKDAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']

function getWeekStart(reference: Date, weekOffset: number): Date {
  const d = new Date(reference)
  const day = d.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diffToMonday + weekOffset * 7)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function formatTimeRange(startIso: string, endIso: string) {
  return `${formatTime(startIso)} - ${formatTime(endIso)}`
}

export function SchedulePage() {
  const { notify } = useToast()
  const [sessions, setSessions] = useState<MentoringSession[] | null>(null)
  const [candidateByPurchase, setCandidateByPurchase] = useState<Record<string, MentorPurchaseCandidate>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [cancelTarget, setCancelTarget] = useState<MentoringSession | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  const loadSessions = () => {
    void mentorSessionsApi.listMine().then((items) => setSessions(items))
  }

  useEffect(() => {
    loadSessions()
    void mentorPurchasesApi.listOwnAsMentor({ limit: 100 }).then((res) => {
      const map: Record<string, MentorPurchaseCandidate> = {}
      for (const p of res.items) map[p.id] = p.candidate
      setCandidateByPurchase(map)
    })
  }, [])

  const studentLabel = (session: MentoringSession) => {
    const candidate = candidateByPurchase[session.purchase_id]
    if (candidate) return candidate.full_name || candidate.email
    return `Học viên #${session.candidate_profile_id.slice(0, 8).toUpperCase()}`
  }

  const pending = useMemo(() => (sessions ?? []).filter((s) => s.status === 'pending'), [sessions])
  const confirmed = useMemo(() => (sessions ?? []).filter((s) => s.status === 'confirmed'), [sessions])
  const history = useMemo(
    () =>
      (sessions ?? [])
        .filter((s) => ['completed', 'canceled', 'rescheduled'].includes(s.status))
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()),
    [sessions],
  )

  const weekStart = useMemo(() => getWeekStart(new Date(), weekOffset), [weekOffset])
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i)),
    [weekStart],
  )
  const weekEnd = useMemo(() => new Date(weekDays[6].getFullYear(), weekDays[6].getMonth(), weekDays[6].getDate() + 1), [weekDays])

  // Confirmed AND completed sessions both stay on the timetable — only canceled/rescheduled ones drop off,
  // since the timetable represents "what happened/will happen this week", not an action queue.
  const timetableThisWeek = useMemo(
    () =>
      (sessions ?? []).filter((s) => {
        if (s.status !== 'confirmed' && s.status !== 'completed') return false
        const start = new Date(s.start_time)
        return start >= weekStart && start < weekEnd
      }),
    [sessions, weekStart, weekEnd],
  )

  const runAction = async (session: MentoringSession, payload: Parameters<typeof mentorSessionsApi.update>[1], successMessage: string) => {
    setBusyId(session.id)
    try {
      const updated = await mentorSessionsApi.update(session.id, payload)
      setSessions((prev) => (prev ? prev.map((s) => (s.id === updated.id ? updated : s)) : prev))
      notify(successMessage)
    } catch (err) {
      if (err instanceof ApiError && err.code === 'NO_SESSIONS_REMAINING') {
        notify('Gói học viên đã hết buổi, không thể duyệt thêm.', 'error')
      } else {
        notify(err instanceof ApiError ? err.message : 'Không thể cập nhật buổi hẹn.', 'error')
      }
    } finally {
      setBusyId(null)
    }
  }

  const handleApprove = (session: MentoringSession) => runAction(session, { status: 'confirmed' }, 'Đã duyệt lịch hẹn.')
  const handleComplete = (session: MentoringSession) => runAction(session, { status: 'completed' }, 'Đã đánh dấu hoàn thành.')

  const openCancelModal = (session: MentoringSession) => {
    setCancelTarget(session)
    setCancelReason('')
  }

  const confirmCancel = async () => {
    if (!cancelTarget) return
    await runAction(cancelTarget, { status: 'canceled', cancel_reason: cancelReason || undefined }, 'Đã huỷ buổi hẹn.')
    setCancelTarget(null)
  }

  return (
    <MentorLayout>
      <h1 className="mb-6 text-2xl font-bold text-brand-ink">Quản lý thời gian</h1>

      {sessions === null ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          <section className="rounded-2xl border-2 border-amber-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold text-brand-ink">Lịch chờ duyệt ({pending.length})</h2>
            {pending.length === 0 ? (
              <p className="text-sm text-brand-ink-soft">Không có buổi hẹn nào đang chờ duyệt.</p>
            ) : (
              <div className="space-y-3">
                {pending.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/40 px-4 py-3">
                    <div>
                      <p className="font-medium text-brand-ink">{s.topic}</p>
                      <p className="text-xs text-brand-ink-soft">
                        {studentLabel(s)} · {formatDate(s.start_time)} · {formatTimeRange(s.start_time, s.end_time)}
                      </p>
                      {s.note && <p className="mt-1 text-xs text-brand-ink-soft">Ghi chú: {s.note}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" loading={busyId === s.id} onClick={() => handleApprove(s)}>
                        Duyệt
                      </Button>
                      <Button size="sm" variant="danger" disabled={busyId === s.id} onClick={() => openCancelModal(s)}>
                        Từ chối
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold text-brand-ink">Lịch đã duyệt ({confirmed.length})</h2>
            {confirmed.length === 0 ? (
              <p className="text-sm text-brand-ink-soft">Chưa có buổi hẹn nào được duyệt.</p>
            ) : (
              <div className="space-y-3">
                {confirmed.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-blue-100 bg-brand-blue-50/30 px-4 py-3">
                    <div>
                      <p className="font-medium text-brand-ink">{s.topic}</p>
                      <p className="text-xs text-brand-ink-soft">
                        {studentLabel(s)} · {formatDate(s.start_time)} · {formatTimeRange(s.start_time, s.end_time)}
                      </p>
                      {s.meeting_url && (
                        <a href={s.meeting_url} target="_blank" rel="noreferrer" className="text-xs text-brand-blue-600 hover:underline">
                          Link phòng họp
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" loading={busyId === s.id} onClick={() => handleComplete(s)}>
                        Hoàn thành
                      </Button>
                      <Button size="sm" variant="danger" disabled={busyId === s.id} onClick={() => openCancelModal(s)}>
                        Huỷ
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-brand-ink">Thời khoá biểu tuần</h2>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-brand-ink-soft">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-brand-blue-500" /> Đã duyệt
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-emerald-500" /> Hoàn thành
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => setWeekOffset((w) => w - 1)}>
                  ‹ Tuần trước
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setWeekOffset(0)}>
                  Tuần này
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setWeekOffset((w) => w + 1)}>
                  Tuần sau ›
                </Button>
              </div>
            </div>
            <WeeklyTimetable days={weekDays} sessions={timetableThisWeek} studentLabel={studentLabel} />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold text-brand-ink">Lịch sử ({history.length})</h2>
            {history.length === 0 ? (
              <p className="text-sm text-brand-ink-soft">Chưa có buổi hẹn nào hoàn thành/bị huỷ.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs text-brand-ink-soft">
                      <th className="py-2 pr-4 font-medium">Buổi học</th>
                      <th className="py-2 pr-4 font-medium">Học viên</th>
                      <th className="py-2 pr-4 font-medium">Thời gian</th>
                      <th className="py-2 pr-4 font-medium">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((s) => (
                      <tr key={s.id} className="border-b border-slate-50 last:border-0">
                        <td className="py-3 pr-4">
                          <p className="font-medium text-brand-ink">{s.topic}</p>
                          {s.cancel_reason && <p className="text-xs text-brand-ink-soft">Lý do huỷ: {s.cancel_reason}</p>}
                        </td>
                        <td className="py-3 pr-4 text-brand-ink-soft">{studentLabel(s)}</td>
                        <td className="py-3 pr-4 text-brand-ink-soft">
                          {formatDate(s.start_time)} · {formatTimeRange(s.start_time, s.end_time)}
                        </td>
                        <td className="py-3 pr-4">
                          <SessionStatusBadge status={s.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      <Modal
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        title="Huỷ buổi hẹn"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelTarget(null)}>
              Đóng
            </Button>
            <Button variant="danger" loading={busyId === cancelTarget?.id} onClick={confirmCancel}>
              Xác nhận huỷ
            </Button>
          </>
        }
      >
        <Field label="Lý do huỷ (không bắt buộc)">
          <Input placeholder="VD: Trùng lịch, học viên yêu cầu đổi giờ..." value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
        </Field>
      </Modal>
    </MentorLayout>
  )
}

function WeeklyTimetable({
  days,
  sessions,
  studentLabel,
}: {
  days: Date[]
  sessions: MentoringSession[]
  studentLabel: (session: MentoringSession) => string
}) {
  const totalHours = HOUR_END - HOUR_START
  const hours = Array.from({ length: totalHours }, (_, i) => HOUR_START + i)

  if (sessions.length === 0) {
    return <EmptyState title="Chưa có buổi hẹn nào trong tuần này" description="Các buổi đã được duyệt hoặc hoàn thành sẽ hiển thị trên thời khoá biểu." />
  }

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[720px] grid-cols-[56px_repeat(7,1fr)]">
        <div />
        {days.map((d, i) => (
          <div key={i} className="border-b border-slate-100 px-2 pb-2 text-center">
            <p className="text-xs font-semibold text-brand-ink">{WEEKDAY_LABELS[i]}</p>
            <p className="text-xs text-brand-ink-soft">{d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</p>
          </div>
        ))}

        <div style={{ height: totalHours * HOUR_HEIGHT }}>
          {hours.map((h) => (
            <div key={h} className="border-t border-slate-100 pr-2 text-right text-[11px] text-brand-ink-soft" style={{ height: HOUR_HEIGHT }}>
              {String(h).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {days.map((day, dayIndex) => {
          const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), HOUR_START, 0, 0)
          const daySessions = sessions.filter((s) => {
            const start = new Date(s.start_time)
            return start.getFullYear() === day.getFullYear() && start.getMonth() === day.getMonth() && start.getDate() === day.getDate()
          })
          return (
            <div key={dayIndex} className="relative border-l border-slate-100" style={{ height: totalHours * HOUR_HEIGHT }}>
              {hours.map((h) => (
                <div key={h} className="border-t border-slate-100" style={{ height: HOUR_HEIGHT }} />
              ))}
              {daySessions.map((s) => {
                const start = new Date(s.start_time)
                const end = new Date(s.end_time)
                const offsetHours = (start.getTime() - dayStart.getTime()) / (1000 * 60 * 60)
                const durationHours = Math.max((end.getTime() - start.getTime()) / (1000 * 60 * 60), 0.5)
                const top = Math.min(Math.max(offsetHours, 0), totalHours) * HOUR_HEIGHT
                const height = Math.min(durationHours, totalHours - Math.max(offsetHours, 0)) * HOUR_HEIGHT
                return (
                  <div
                    key={s.id}
                    className={cn(
                      'absolute inset-x-1 overflow-hidden rounded-lg px-2 py-1 text-[11px] font-medium text-white shadow',
                      s.status === 'completed' ? 'bg-emerald-500' : 'bg-brand-blue-500',
                    )}
                    style={{ top, height: Math.max(height, 20) }}
                    title={`${s.topic} · ${studentLabel(s)} · ${formatTimeRange(s.start_time, s.end_time)}`}
                  >
                    <p className="truncate">{s.topic}</p>
                    <p className="truncate opacity-80">{studentLabel(s)}</p>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
