import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CandidateLayout } from '@/modules/candidate/components/CandidateLayout'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Badge } from '@/shared/components/ui/Badge'
import { Input } from '@/shared/components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/shared/components/ui/Table'
import { mentorPurchasesApi } from '@/modules/mentors/api/mentorPurchases.api'
import { vipApi } from '@/modules/vip/api/vip.api'
import { formatCurrencyVnd, formatDate } from '@/shared/lib/format'

interface TransactionRow {
  id: string
  date: string
  amount: number
  searchText: string
  detail: ReactNode
}

export function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<TransactionRow[] | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    void Promise.all([mentorPurchasesApi.listMine(), vipApi.listPurchases('candidate')]).then(([mentorPurchases, vipPurchases]) => {
      const mentorRows: TransactionRow[] = mentorPurchases.map((p) => {
        const mentorTitle = p.mentor_full_name || p.mentor_job_title || 'Mentor'
        return {
          id: `mentor-${p.id}`,
          date: p.purchased_at,
          amount: p.price,
          searchText: `${mentorTitle} ${p.service_name}`.toLowerCase(),
          detail: (
            <div>
              <p className="font-medium text-brand-ink">Gói mentor · {p.service_name}</p>
              {p.mentor_profile_id ? (
                <Link to={`/mentor/${p.mentor_profile_id}`} className="text-xs text-brand-blue-600 hover:underline">
                  {mentorTitle}
                </Link>
              ) : (
                <span className="text-xs text-brand-ink-soft">{mentorTitle}</span>
              )}
            </div>
          ),
        }
      })
      const vipRows: TransactionRow[] = vipPurchases.map((p) => ({
        id: `vip-${p.id}`,
        date: p.purchased_at,
        amount: p.price,
        searchText: 'skola vip nâng cấp',
        detail: (
          <div>
            <p className="font-medium text-brand-ink">✨ Skola VIP · Sinh viên</p>
            <p className="text-xs text-brand-ink-soft">Hiệu lực đến {formatDate(p.vip_expires_at)}</p>
          </div>
        ),
      }))
      setTransactions([...mentorRows, ...vipRows].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    })
  }, [])

  const filteredTransactions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return transactions ?? []
    return (transactions ?? []).filter((t) => t.searchText.includes(q))
  }, [transactions, query])

  const total = transactions?.reduce((sum, t) => sum + t.amount, 0) ?? 0

  return (
    <CandidateLayout>
      <h1 className="mb-1 text-2xl font-bold text-brand-ink">Lịch sử giao dịch</h1>
      <p className="mb-6 text-sm text-brand-ink-soft">
        Toàn bộ gói dịch vụ mentor và gói Skola VIP bạn đã thanh toán. Hệ thống chưa có cổng thanh toán thật nên mọi giao dịch được ghi nhận "đã thanh toán" ngay khi đặt mua.
      </p>

      {transactions === null ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          title="Chưa có giao dịch nào"
          description="Mua một gói dịch vụ mentor hoặc nâng cấp Skola VIP để xem lịch sử giao dịch tại đây."
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
            placeholder="Tìm theo mentor, gói dịch vụ, Skola VIP..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {filteredTransactions.length === 0 ? (
            <p className="py-8 text-center text-sm text-brand-ink-soft">Không có giao dịch nào khớp với từ khoá tìm kiếm.</p>
          ) : (
            <Table>
              <TableHead>
                <tr>
                  <TableHeaderCell>Ngày</TableHeaderCell>
                  <TableHeaderCell>Giao dịch</TableHeaderCell>
                  <TableHeaderCell>Số tiền</TableHeaderCell>
                  <TableHeaderCell>Trạng thái</TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{formatDate(t.date)}</TableCell>
                    <TableCell>{t.detail}</TableCell>
                    <TableCell className="font-semibold text-brand-ink">{formatCurrencyVnd(t.amount)}</TableCell>
                    <TableCell>
                      <Badge tone="green">Đã thanh toán</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </CandidateLayout>
  )
}
