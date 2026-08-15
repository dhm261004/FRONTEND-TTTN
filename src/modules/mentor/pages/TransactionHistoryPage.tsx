import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MentorLayout } from '@/modules/mentor/components/MentorLayout'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Badge } from '@/shared/components/ui/Badge'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/shared/components/ui/Table'
import { Button } from '@/shared/components/ui/Button'
import { vipApi } from '@/modules/vip/api/vip.api'
import type { VipPurchaseResult } from '@/modules/vip/types'
import { formatCurrencyVnd, formatDate } from '@/shared/lib/format'

export function TransactionHistoryPage() {
  const [purchases, setPurchases] = useState<VipPurchaseResult[] | null>(null)

  useEffect(() => {
    void vipApi.listPurchases('mentor').then(setPurchases)
  }, [])

  const total = purchases?.reduce((sum, p) => sum + p.price, 0) ?? 0

  return (
    <MentorLayout>
      <h1 className="mb-1 text-2xl font-bold text-brand-ink">Lịch sử giao dịch</h1>
      <p className="mb-6 text-sm text-brand-ink-soft">
        Toàn bộ lượt mua/gia hạn Skola VIP của bạn. Hệ thống chưa có cổng thanh toán thật nên mọi giao dịch được ghi nhận "đã thanh toán" ngay khi nâng cấp.
      </p>

      {purchases === null ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : purchases.length === 0 ? (
        <EmptyState
          title="Chưa có giao dịch nào"
          description="Nâng cấp Skola VIP để nhận không giới hạn học viên mới mỗi tháng và được ưu tiên hiển thị."
          action={
            <Link to="/skola-vip?tab=mentor">
              <Button size="sm">Xem gói Skola VIP</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-sm text-brand-ink-soft">Tổng đã chi tiêu</span>
            <span className="text-xl font-bold text-brand-ink">{formatCurrencyVnd(total)}</span>
          </div>

          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Ngày</TableHeaderCell>
                <TableHeaderCell>Giao dịch</TableHeaderCell>
                <TableHeaderCell>Hiệu lực đến</TableHeaderCell>
                <TableHeaderCell>Số tiền</TableHeaderCell>
                <TableHeaderCell>Trạng thái</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {purchases.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{formatDate(p.purchased_at)}</TableCell>
                  <TableCell className="font-medium text-brand-ink">✨ Skola VIP · Mentor</TableCell>
                  <TableCell>{formatDate(p.vip_expires_at)}</TableCell>
                  <TableCell className="font-semibold text-brand-ink">{formatCurrencyVnd(p.price)}</TableCell>
                  <TableCell>
                    <Badge tone="green">Đã thanh toán</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </MentorLayout>
  )
}
