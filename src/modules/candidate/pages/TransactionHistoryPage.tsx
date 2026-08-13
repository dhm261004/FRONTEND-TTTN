import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CandidateLayout } from '@/modules/candidate/components/CandidateLayout'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Badge } from '@/shared/components/ui/Badge'
import { Input } from '@/shared/components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/shared/components/ui/Table'
import { mentorPurchasesApi } from '@/modules/mentors/api/mentorPurchases.api'
import { formatCurrencyVnd, formatDate } from '@/shared/lib/format'
import type { MentorPurchase } from '@/modules/mentor/types'

export function TransactionHistoryPage() {
  const [purchases, setPurchases] = useState<MentorPurchase[] | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    void mentorPurchasesApi.listMine().then((items) =>
      setPurchases([...items].sort((a, b) => new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime())),
    )
  }, [])

  const filteredPurchases = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return purchases ?? []
    return (purchases ?? []).filter((p) => {
      const mentorTitle = p.mentor_full_name || p.mentor_job_title || ''
      return mentorTitle.toLowerCase().includes(q) || p.service_name.toLowerCase().includes(q)
    })
  }, [purchases, query])

  const total = purchases?.reduce((sum, p) => sum + p.price, 0) ?? 0

  return (
    <CandidateLayout>
      <h1 className="mb-1 text-2xl font-bold text-brand-ink">Lịch sử giao dịch</h1>
      <p className="mb-6 text-sm text-brand-ink-soft">
        Toàn bộ gói dịch vụ mentor bạn đã thanh toán. Hệ thống chưa có cổng thanh toán thật nên mọi giao dịch được ghi nhận "đã thanh toán" ngay khi đặt mua.
      </p>

      {purchases === null ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : purchases.length === 0 ? (
        <EmptyState
          title="Chưa có giao dịch nào"
          description="Mua một gói dịch vụ mentor để xem lịch sử giao dịch tại đây."
          action={
            <Link to="/mentor" className="text-sm font-semibold text-brand-blue-600">
              Xem danh sách mentor
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-sm text-brand-ink-soft">Tổng đã chi tiêu</span>
            <span className="text-xl font-bold text-brand-ink">{formatCurrencyVnd(total)}</span>
          </div>

          <Input
            className="h-10 max-w-xs"
            placeholder="Tìm theo mentor, gói dịch vụ..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {filteredPurchases.length === 0 ? (
            <p className="py-8 text-center text-sm text-brand-ink-soft">Không có giao dịch nào khớp với từ khoá tìm kiếm.</p>
          ) : (
            <Table>
              <TableHead>
                <tr>
                  <TableHeaderCell>Ngày</TableHeaderCell>
                  <TableHeaderCell>Mentor</TableHeaderCell>
                  <TableHeaderCell>Gói dịch vụ</TableHeaderCell>
                  <TableHeaderCell>Số buổi</TableHeaderCell>
                  <TableHeaderCell>Số tiền</TableHeaderCell>
                  <TableHeaderCell>Trạng thái</TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {filteredPurchases.map((p) => {
                  const mentorTitle = p.mentor_full_name || p.mentor_job_title || 'Mentor'
                  return (
                    <TableRow key={p.id}>
                      <TableCell>{formatDate(p.purchased_at)}</TableCell>
                      <TableCell>
                        {p.mentor_profile_id ? (
                          <Link to={`/mentor/${p.mentor_profile_id}`} className="font-medium text-brand-ink hover:text-brand-blue-600">
                            {mentorTitle}
                          </Link>
                        ) : (
                          <span className="text-brand-ink">{mentorTitle}</span>
                        )}
                      </TableCell>
                      <TableCell>{p.service_name}</TableCell>
                      <TableCell>{p.total_sessions}</TableCell>
                      <TableCell className="font-semibold text-brand-ink">{formatCurrencyVnd(p.price)}</TableCell>
                      <TableCell>
                        <Badge tone="green">Đã thanh toán</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </CandidateLayout>
  )
}
