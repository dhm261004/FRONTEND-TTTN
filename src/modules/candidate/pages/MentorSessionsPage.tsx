import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CandidateLayout } from '@/modules/candidate/components/CandidateLayout'
import { WeekTimetable } from '@/modules/candidate/components/WeekTimetable'
import { Calendar } from '@/modules/candidate/components/Calendar'
import { mentorSessionsApi } from '@/modules/mentor/api/mentorSessions.api'
import { mentorPurchasesApi } from '@/modules/mentors/api/mentorPurchases.api'
import { SessionStatusBadge } from '@/modules/mentor/components/SessionStatusBadge'
import { Button } from '@/shared/components/ui/Button'
import { Field } from '@/shared/components/ui/Field'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { Textarea } from '@/shared/components/ui/Textarea'
import { Modal } from '@/shared/components/ui/Modal'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/shared/components/ui/Table'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { ApiError } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { formatDate } from '@/shared/lib/format'
import type { MentoringSession, MentorPurchase } from '@/modules/mentor/types'

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']
const DURATION_OPTIONS = [30, 45, 60, 90, 120]

function formatTimeRange(startIso: string, endIso: string) {
  const opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
  return `${new Date(startIso).toLocaleTimeString('vi-VN', opts)} - ${new Date(endIso).toLocaleTimeString('vi-VN', opts)}`
}

function toDateKey(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function MentorSessionsPage() {
  const location = useLocation()
  const { notify } = useToast()
  const [sessions, setSessions] = useState<MentoringSession[] | null>(null)
  const [purchases, setPurchases] = useState<MentorPurchase[]>([])
  const [purchaseById, setPurchaseById] = useState<Record<string, MentorPurchase>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [bookingOpen, setBookingOpen] = useState(false)

  const loadSessions = () => void mentorSessionsApi.listMine().then(setSessions)
  const loadPurchases = () =>
    void mentorPurchasesApi.listMine().then((items) => {
      setPurchases(items)
      setPurchaseById(Object.fromEntries(items.map((p) => [p.id, p])))
    })

  useEffect(() => {
    loadSessions()
    loadPurchases()
  }, [])

  // Đến từ trang mua gói (MentorServiceCheckoutPage) — mở sẵn modal đặt lịch với gói vừa mua.
  useEffect(() => {
    const state = location.state as { openBookingForPurchaseId?: string } | null
    if (state?.openBookingForPurchaseId) setBookingOpen(true)
  }, [location.state])

  const mentorLabel = (session: MentoringSession) => {
    const purchase = purchaseById[session.purchase_id]
    return purchase?.mentor_full_name || purchase?.mentor_job_title || 'Mentor'
  }

  const upcoming = useMemo(
    () =>
      (sessions ?? [])
        .filter((s) => s.status === 'pending' || s.status === 'confirmed')
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    [sessions],
  )
  const history = useMemo(
    () =>
      (sessions ?? [])
        .filter((s) => s.status === 'completed' || s.status === 'canceled' || s.status === 'rescheduled')
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()),
    [sessions],
  )

  const [historyQuery, setHistoryQuery] = useState('')
  const [historyStatus, setHistoryStatus] = useState('')
  const filteredHistory = useMemo(() => {
    const q = historyQuery.trim().toLowerCase()
    return history.filter((s) => {
      if (historyStatus && s.status !== historyStatus) return false
      if (!q) return true
      return s.topic.toLowerCase().includes(q) || mentorLabel(s).toLowerCase().includes(q)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mentorLabel closes over purchaseById, không cần thêm vào deps vì cùng cập nhật với sessions
  }, [history, historyQuery, historyStatus])

  const handleCancel = async (session: MentoringSession) => {
    setBusyId(session.id)
    try {
      const updated = await mentorSessionsApi.update(session.id, { status: 'canceled' })
      setSessions((prev) => (prev ? prev.map((s) => (s.id === updated.id ? updated : s)) : prev))
      notify('Đã huỷ buổi hẹn.')
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể huỷ buổi hẹn.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <CandidateLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-ink">Lịch hẹn mentor</h1>
        <Button size="sm" onClick={() => setBookingOpen(true)}>
          Đặt lịch mới
        </Button>
      </div>

      {sessions === null ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          title="Bạn chưa có buổi hẹn mentor nào"
          description="Mua một gói dịch vụ và đặt lịch để bắt đầu."
          action={
            <Link to="/mentor" className="text-sm font-semibold text-brand-blue-600">
              Xem danh sách mentor
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold text-brand-ink">Thời khoá biểu</h2>
            <WeekTimetable sessions={sessions} mentorLabel={mentorLabel} />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold text-brand-ink">Sắp tới ({upcoming.length})</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-brand-ink-soft">Không có buổi hẹn nào sắp tới.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
                    <div>
                      <p className="font-medium text-brand-ink">{s.topic}</p>
                      <p className="text-xs text-brand-ink-soft">
                        {mentorLabel(s)} · {formatDate(s.start_time)} · {formatTimeRange(s.start_time, s.end_time)}
                      </p>
                      {s.meeting_url && (
                        <a href={s.meeting_url} target="_blank" rel="noreferrer" className="text-xs text-brand-blue-600 hover:underline">
                          Link phòng họp
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <SessionStatusBadge status={s.status} />
                      <Button size="sm" variant="danger" loading={busyId === s.id} onClick={() => void handleCancel(s)}>
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
              <h2 className="font-bold text-brand-ink">Lịch sử ({history.length})</h2>
              {history.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    className="h-9 w-56"
                    placeholder="Tìm theo chủ đề, mentor..."
                    value={historyQuery}
                    onChange={(e) => setHistoryQuery(e.target.value)}
                  />
                  <Select className="h-9 w-40" value={historyStatus} onChange={(e) => setHistoryStatus(e.target.value)}>
                    <option value="">Tất cả trạng thái</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="canceled">Đã huỷ</option>
                    <option value="rescheduled">Đã dời lịch</option>
                  </Select>
                </div>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-brand-ink-soft">Chưa có buổi hẹn nào hoàn thành/bị huỷ.</p>
            ) : filteredHistory.length === 0 ? (
              <p className="text-sm text-brand-ink-soft">Không có buổi hẹn nào khớp với bộ lọc hiện tại.</p>
            ) : (
              <Table>
                <TableHead>
                  <tr>
                    <TableHeaderCell>Buổi học</TableHeaderCell>
                    <TableHeaderCell>Mentor</TableHeaderCell>
                    <TableHeaderCell>Thời gian</TableHeaderCell>
                    <TableHeaderCell>Trạng thái</TableHeaderCell>
                  </tr>
                </TableHead>
                <TableBody>
                  {filteredHistory.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="whitespace-normal">
                        <p className="font-medium text-brand-ink">{s.topic}</p>
                        {s.cancel_reason && <p className="text-xs text-brand-ink-soft">Lý do huỷ: {s.cancel_reason}</p>}
                      </TableCell>
                      <TableCell>{mentorLabel(s)}</TableCell>
                      <TableCell>
                        {formatDate(s.start_time)} · {formatTimeRange(s.start_time, s.end_time)}
                      </TableCell>
                      <TableCell>
                        <SessionStatusBadge status={s.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
        </div>
      )}

      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        purchases={purchases}
        sessions={sessions ?? []}
        initialPurchaseId={(location.state as { openBookingForPurchaseId?: string } | null)?.openBookingForPurchaseId}
        onBooked={() => {
          loadSessions()
          loadPurchases()
        }}
      />
    </CandidateLayout>
  )
}

function BookingModal({
  open,
  onClose,
  purchases,
  sessions,
  initialPurchaseId,
  onBooked,
}: {
  open: boolean
  onClose: () => void
  purchases: MentorPurchase[]
  sessions: MentoringSession[]
  initialPurchaseId?: string
  onBooked: () => void
}) {
  const { notify } = useToast()
  const [purchaseId, setPurchaseId] = useState('')
  const [topic, setTopic] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState('')
  const [duration, setDuration] = useState(60)
  const [submitting, setSubmitting] = useState(false)

  // Chỉ những gói còn buổi trống mới đặt lịch được — gói đã hết buổi chỉ xem được ở "Gói mentor đã mua".
  const bookablePurchases = useMemo(() => purchases.filter((p) => p.remaining_sessions > 0), [purchases])

  useEffect(() => {
    if (!open) return
    setPurchaseId(initialPurchaseId && bookablePurchases.some((p) => p.id === initialPurchaseId) ? initialPurchaseId : '')
    setTopic('')
    setNote('')
    setDate('')
    setSlot('')
    setDuration(60)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialPurchaseId])

  const selectedPurchase = purchases.find((p) => p.id === purchaseId) ?? null

  const markedDates = useMemo(
    () =>
      new Set(
        sessions
          .filter((s) => s.purchase_id === purchaseId && (s.status === 'pending' || s.status === 'confirmed'))
          .map((s) => toDateKey(s.start_time)),
      ),
    [sessions, purchaseId],
  )

  const todayKey = toDateKey(new Date().toISOString())
  const availableSlots = useMemo(() => {
    if (date !== todayKey) return TIME_SLOTS
    const now = new Date()
    return TIME_SLOTS.filter((t) => {
      const [h, m] = t.split(':').map(Number)
      return h > now.getHours() || (h === now.getHours() && m > now.getMinutes())
    })
  }, [date, todayKey])

  const handleSubmit = async () => {
    if (!purchaseId || !topic.trim() || !date || !slot) {
      notify('Vui lòng chọn gói, ngày, khung giờ và nhập chủ đề buổi học.', 'error')
      return
    }
    const startIso = new Date(`${date}T${slot}:00`).toISOString()
    const endIso = new Date(new Date(startIso).getTime() + duration * 60_000).toISOString()
    if (new Date(startIso) <= new Date()) {
      notify('Thời gian bắt đầu phải ở tương lai.', 'error')
      return
    }

    setSubmitting(true)
    try {
      await mentorPurchasesApi.createSession(purchaseId, { topic: topic.trim(), note: note.trim() || undefined, start_time: startIso, end_time: endIso })
      notify('Đã gửi yêu cầu đặt lịch, chờ mentor duyệt.')
      onBooked()
      onClose()
    } catch (err) {
      if (err instanceof ApiError && err.code === 'NO_SESSIONS_REMAINING') {
        notify('Gói này vừa hết buổi, không thể đặt thêm.', 'error')
      } else {
        notify(err instanceof ApiError ? err.message : 'Không thể đặt lịch. Vui lòng thử lại.', 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Đặt lịch mới" size="lg">
      {bookablePurchases.length === 0 ? (
        <div className="space-y-3 text-sm text-brand-ink-soft">
          <p>Bạn chưa có gói mentor nào còn buổi trống để đặt lịch.</p>
          <Link to="/mentor" className="font-semibold text-brand-blue-600 hover:underline" onClick={onClose}>
            Khám phá mentor và mua gói mới →
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          <Field label="Chọn gói đã mua" required>
            <Select value={purchaseId} onChange={(e) => { setPurchaseId(e.target.value); setDate(''); setSlot('') }}>
              <option value="">-- Chọn gói --</option>
              {bookablePurchases.map((p) => {
                const mentorTitle = p.mentor_full_name || p.mentor_job_title || 'Mentor'
                return (
                  <option key={p.id} value={p.id}>
                    {mentorTitle} · {p.service_name} (còn {p.remaining_sessions}/{p.total_sessions} buổi)
                  </option>
                )
              })}
            </Select>
          </Field>

          {selectedPurchase && (
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="lg:w-72 lg:shrink-0">
                <p className="mb-2 text-sm font-medium text-brand-ink">Chọn ngày</p>
                <Calendar value={date} onChange={(d) => { setDate(d); setSlot('') }} markedDates={markedDates} />
                <p className="mt-2 flex items-center gap-1.5 text-xs text-brand-ink-soft">
                  <span className="size-1.5 rounded-full bg-brand-blue-500" /> Ngày đã có buổi hẹn trong gói này
                </p>
              </div>

              <div className="min-w-0 flex-1 space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-brand-ink">
                    Khung giờ bắt đầu {date && <span className="font-normal text-brand-ink-soft">({date})</span>}
                  </p>
                  {!date ? (
                    <p className="text-sm text-brand-ink-soft">Chọn một ngày ở lịch bên trái trước.</p>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-sm text-brand-ink-soft">Không còn khung giờ nào khả dụng trong hôm nay, hãy chọn ngày khác.</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                      {availableSlots.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSlot(t)}
                          className={cn(
                            'rounded-lg border px-2 py-2 text-sm font-medium transition-colors',
                            slot === t
                              ? 'border-brand-blue-500 bg-brand-blue-500 text-white'
                              : 'border-slate-200 text-brand-ink hover:border-brand-blue-300 hover:bg-brand-blue-50',
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Field label="Thời lượng buổi học">
                  <Select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="max-w-40">
                    {DURATION_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d} phút
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Chủ đề buổi học" required>
                  <Input placeholder="VD: Sửa bài luận vòng 2" value={topic} onChange={(e) => setTopic(e.target.value)} />
                </Field>
                <Field label="Ghi chú (không bắt buộc)">
                  <Textarea rows={3} placeholder="Mô tả thêm về nội dung muốn trao đổi..." value={note} onChange={(e) => setNote(e.target.value)} />
                </Field>

                {date && slot && (
                  <p className="rounded-lg bg-brand-blue-50 px-3 py-2 text-sm text-brand-blue-700">
                    Buổi học dự kiến: <strong>{date}</strong>, {slot} –{' '}
                    {new Date(new Date(`${date}T${slot}:00`).getTime() + duration * 60_000).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}

                <Button className="w-full" loading={submitting} onClick={() => void handleSubmit()}>
                  Gửi yêu cầu đặt lịch
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
