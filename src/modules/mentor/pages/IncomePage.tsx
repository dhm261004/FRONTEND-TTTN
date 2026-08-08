import { useEffect, useMemo, useState } from 'react'
import { MentorLayout } from '@/modules/mentor/components/MentorLayout'
import { useMentorProfile } from '@/modules/mentor/MentorProfileContext'
import { mentorPurchasesApi } from '@/modules/mentor/api/mentorPurchases.api'
import { mentorSessionsApi } from '@/modules/mentor/api/mentorSessions.api'
import { StatCard } from '@/modules/mentor/components/StatCard'
import { SessionStatusBadge } from '@/modules/mentor/components/SessionStatusBadge'
import { Select } from '@/shared/components/ui/Select'
import { Button } from '@/shared/components/ui/Button'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Modal } from '@/shared/components/ui/Modal'
import { formatCurrencyVnd, formatDate } from '@/shared/lib/format'
import { IconBriefcase, IconCheckCircle, IconWallet } from '@/modules/mentor/components/icons'
import type { MentoringSession, MentorServicePurchaseWithCandidate } from '@/modules/mentor/types'

const FETCH_LIMIT = 100

function formatTimeRange(startIso: string, endIso: string) {
  const fmt = (iso: string) => new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  return `${formatDate(startIso)} · ${fmt(startIso)} - ${fmt(endIso)}`
}

export function IncomePage() {
  const { profile } = useMentorProfile()
  const [serviceFilter, setServiceFilter] = useState('')
  const [purchases, setPurchases] = useState<MentorServicePurchaseWithCandidate[] | null>(null)
  const [total, setTotal] = useState(0)
  const [sessions, setSessions] = useState<MentoringSession[]>([])
  const [selectedPurchase, setSelectedPurchase] = useState<MentorServicePurchaseWithCandidate | null>(null)

  useEffect(() => {
    void mentorSessionsApi.listMine().then(setSessions)
  }, [])

  useEffect(() => {
    setPurchases(null)
    mentorPurchasesApi
      .listOwnAsMentor({ service_id: serviceFilter || undefined, limit: FETCH_LIMIT })
      .then((res) => {
        setPurchases(res.items)
        setTotal(res.pagination.total)
      })
  }, [serviceFilter])

  const stats = useMemo(() => {
    const items = purchases ?? []
    return {
      revenue: items.reduce((sum, p) => sum + p.price, 0),
      studentsCount: new Set(items.map((p) => p.candidate.candidate_profile_id)).size,
      sessionsSold: items.reduce((sum, p) => sum + p.total_sessions, 0),
    }
  }, [purchases])

  const sessionsForSelected = selectedPurchase
    ? sessions
        .filter((s) => s.purchase_id === selectedPurchase.id)
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
    : []

  return (
    <MentorLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-ink">Quản lý thu nhập</h1>
        <Select className="w-64" value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
          <option value="">Tất cả gói dịch vụ</option>
          {(profile?.services ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>

      {purchases === null ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icon={IconWallet} tone="blue" label="Tổng doanh thu" value={formatCurrencyVnd(stats.revenue)} />
            <StatCard icon={IconBriefcase} tone="green" label="Số gói đã bán" value={String(total)} />
            <StatCard icon={IconCheckCircle} tone="amber" label="Tổng số buổi đã bán" value={String(stats.sessionsSold)} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <h2 className="font-bold text-brand-ink">Lịch sử giao dịch</h2>
              <p className="text-xs text-brand-ink-soft">
                {stats.studentsCount} học viên · {total > FETCH_LIMIT ? `hiển thị ${FETCH_LIMIT} giao dịch gần nhất` : `${total} giao dịch`} ·
                nhấn vào một dòng để xem các buổi đã đặt
              </p>
            </div>
            {purchases.length === 0 ? (
              <EmptyState title="Chưa có giao dịch nào" description="Khi học viên mua gói dịch vụ của bạn, giao dịch sẽ hiện ở đây." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs text-brand-ink-soft">
                      <th className="px-6 py-3 font-medium">Học viên</th>
                      <th className="px-6 py-3 font-medium">Gói dịch vụ</th>
                      <th className="px-6 py-3 font-medium">Giá</th>
                      <th className="px-6 py-3 font-medium">Buổi còn lại</th>
                      <th className="px-6 py-3 font-medium">Ngày mua</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedPurchase(p)}
                        className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-brand-blue-50/50"
                      >
                        <td className="px-6 py-3">
                          <p className="font-medium text-brand-ink">{p.candidate.full_name || p.candidate.email}</p>
                          <p className="text-xs text-brand-ink-soft">{p.candidate.email}</p>
                        </td>
                        <td className="px-6 py-3 text-brand-ink">{p.service_name}</td>
                        <td className="px-6 py-3 text-brand-ink">{formatCurrencyVnd(p.price)}</td>
                        <td className="px-6 py-3 text-brand-ink">
                          {p.remaining_sessions}/{p.total_sessions}
                        </td>
                        <td className="px-6 py-3 text-brand-ink-soft">{formatDate(p.purchased_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        open={selectedPurchase !== null}
        onClose={() => setSelectedPurchase(null)}
        title="Chi tiết giao dịch"
        size="lg"
        footer={
          <Button variant="ghost" onClick={() => setSelectedPurchase(null)}>
            Đóng
          </Button>
        }
      >
        {selectedPurchase && (
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-brand-ink">{selectedPurchase.candidate.full_name || 'Học viên'}</p>
              <p className="text-sm text-brand-ink-soft">{selectedPurchase.candidate.email}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xs text-brand-ink-soft">Gói dịch vụ</p>
                  <p className="font-medium text-brand-ink">{selectedPurchase.service_name}</p>
                </div>
                <div>
                  <p className="text-xs text-brand-ink-soft">Giá</p>
                  <p className="font-medium text-brand-ink">{formatCurrencyVnd(selectedPurchase.price)}</p>
                </div>
                <div>
                  <p className="text-xs text-brand-ink-soft">Buổi còn lại</p>
                  <p className="font-medium text-brand-ink">
                    {selectedPurchase.remaining_sessions}/{selectedPurchase.total_sessions}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-brand-ink-soft">Ngày mua</p>
                  <p className="font-medium text-brand-ink">{formatDate(selectedPurchase.purchased_at)}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold text-brand-ink">Các buổi đã đặt ({sessionsForSelected.length})</h3>
              {sessionsForSelected.length === 0 ? (
                <p className="text-sm text-brand-ink-soft">Học viên chưa đặt buổi nào trong gói này.</p>
              ) : (
                <div className="space-y-2">
                  {sessionsForSelected.map((s) => (
                    <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-brand-ink">{s.topic}</p>
                        <p className="text-xs text-brand-ink-soft">{formatTimeRange(s.start_time, s.end_time)}</p>
                      </div>
                      <SessionStatusBadge status={s.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </MentorLayout>
  )
}
