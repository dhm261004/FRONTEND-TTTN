import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MentorLayout } from '@/modules/mentor/components/MentorLayout'
import { mentorPurchasesApi } from '@/modules/mentor/api/mentorPurchases.api'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { formatCurrencyVnd, formatDate } from '@/shared/lib/format'
import type { MentorPurchaseCandidate, MentorServicePurchaseWithCandidate } from '@/modules/mentor/types'

const FETCH_LIMIT = 100

interface StudentSummary {
  candidate: MentorPurchaseCandidate
  purchaseCount: number
  totalSpent: number
  serviceNames: string[]
  lastPurchasedAt: string
}

export function StudentsPage() {
  const [purchases, setPurchases] = useState<MentorServicePurchaseWithCandidate[] | null>(null)

  useEffect(() => {
    void mentorPurchasesApi.listOwnAsMentor({ limit: FETCH_LIMIT }).then((res) => setPurchases(res.items))
  }, [])

  const students = useMemo(() => {
    const byCandidate = new Map<string, StudentSummary>()
    for (const p of purchases ?? []) {
      const existing = byCandidate.get(p.candidate.candidate_profile_id)
      if (existing) {
        existing.purchaseCount += 1
        existing.totalSpent += p.price
        if (!existing.serviceNames.includes(p.service_name)) existing.serviceNames.push(p.service_name)
        if (new Date(p.purchased_at) > new Date(existing.lastPurchasedAt)) existing.lastPurchasedAt = p.purchased_at
      } else {
        byCandidate.set(p.candidate.candidate_profile_id, {
          candidate: p.candidate,
          purchaseCount: 1,
          totalSpent: p.price,
          serviceNames: [p.service_name],
          lastPurchasedAt: p.purchased_at,
        })
      }
    }
    return Array.from(byCandidate.values()).sort(
      (a, b) => new Date(b.lastPurchasedAt).getTime() - new Date(a.lastPurchasedAt).getTime(),
    )
  }, [purchases])

  return (
    <MentorLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-ink">Quản lý sinh viên</h1>
        <p className="text-sm text-brand-ink-soft">Danh sách học viên đã mua gói dịch vụ của bạn.</p>
      </div>

      {purchases === null ? (
        <Spinner />
      ) : students.length === 0 ? (
        <EmptyState title="Chưa có học viên nào" description="Khi có học viên mua gói dịch vụ của bạn, họ sẽ xuất hiện ở đây." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((s) => (
            <Link
              key={s.candidate.candidate_profile_id}
              to={`/co-van/sinh-vien/${s.candidate.candidate_profile_id}`}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-brand-blue-300 hover:bg-brand-blue-50/30"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="size-11 shrink-0 overflow-hidden rounded-full bg-slate-200">
                  {s.candidate.avatar_url && <img src={s.candidate.avatar_url} alt="" className="size-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-brand-ink">{s.candidate.full_name || s.candidate.email}</p>
                  <p className="truncate text-xs text-brand-ink-soft">{s.candidate.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-brand-ink-soft">Số gói đã mua</p>
                  <p className="font-medium text-brand-ink">{s.purchaseCount}</p>
                </div>
                <div>
                  <p className="text-xs text-brand-ink-soft">Tổng chi tiêu</p>
                  <p className="font-medium text-brand-ink">{formatCurrencyVnd(s.totalSpent)}</p>
                </div>
              </div>
              <p className="mt-3 truncate text-xs text-brand-ink-soft">Gói: {s.serviceNames.join(', ')}</p>
              <p className="mt-1 text-xs text-brand-ink-soft">Mua gần nhất: {formatDate(s.lastPurchasedAt)}</p>
            </Link>
          ))}
        </div>
      )}
    </MentorLayout>
  )
}
