import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PublicHeader } from '@/modules/scholarships/components/PublicHeader'
import { SiteFooter } from '@/shared/components/layout/SiteFooter'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { useCart } from '@/modules/mentors/cart/CartContext'
import { IconMinus, IconPlus, IconTrash } from '@/modules/mentors/cart/icons'
import { mentorPurchasesApi } from '@/modules/mentors/api/mentorPurchases.api'
import { formatCurrencyVnd } from '@/shared/lib/format'
import { ApiError } from '@/shared/api/types'

export function CartPage() {
  const { items, totalPrice, removeItem, setQuantity, clear } = useCart()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [paying, setPaying] = useState(false)

  const handleCheckout = async () => {
    setPaying(true)
    let succeeded = 0
    let failed = 0
    for (const item of items) {
      for (let i = 0; i < item.quantity; i++) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await mentorPurchasesApi.purchase(item.service_id)
          succeeded++
        } catch (err) {
          failed++
          if (err instanceof ApiError) notify(`${item.service_name}: ${err.message}`, 'error')
        }
      }
    }
    setPaying(false)

    if (succeeded > 0) {
      clear()
      notify(`Đã thanh toán ${succeeded} gói (giả lập).${failed > 0 ? ` ${failed} gói thất bại.` : ''}`)
      navigate('/tai-khoan/giao-dich')
    } else if (failed > 0) {
      notify('Không thanh toán được gói nào. Vui lòng thử lại.', 'error')
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-app-bg">
      <PublicHeader active="mentor" />

      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <p className="mb-2 text-sm text-brand-ink-soft">
          <Link to="/mentor">Mentor</Link> <span className="mx-1">›</span> Giỏ hàng
        </p>
        <h1 className="mb-6 text-2xl font-bold text-brand-ink">Giỏ hàng của bạn</h1>

        {items.length === 0 ? (
          <EmptyState
            title="Giỏ hàng trống"
            description="Thêm gói dịch vụ mentor vào giỏ để thanh toán một lần."
            action={
              <Link to="/mentor" className="text-sm font-semibold text-brand-blue-600">
                Xem danh sách mentor
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              {items.map((item) => (
                <div key={item.service_id} className="flex flex-wrap items-center gap-4 p-4">
                  <div className="size-12 shrink-0 overflow-hidden rounded-full bg-slate-200">
                    {item.mentor_avatar_url && <img src={item.mentor_avatar_url} alt="" className="size-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-brand-ink">{item.service_name}</p>
                    <p className="text-sm text-brand-ink-soft">{item.mentor_name}</p>
                    <p className="text-xs text-brand-ink-soft">
                      {item.duration_minutes} phút/buổi · {item.total_sessions} buổi/gói
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.service_id, item.quantity - 1)}
                      aria-label="Giảm số lượng"
                      className="flex size-6 items-center justify-center rounded text-brand-ink-soft hover:bg-slate-100"
                    >
                      <IconMinus className="size-3.5" />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-brand-ink">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.service_id, item.quantity + 1)}
                      aria-label="Tăng số lượng"
                      className="flex size-6 items-center justify-center rounded text-brand-ink-soft hover:bg-slate-100"
                    >
                      <IconPlus className="size-3.5" />
                    </button>
                  </div>

                  <p className="w-28 shrink-0 text-right font-bold text-brand-ink">{formatCurrencyVnd(item.price * item.quantity)}</p>

                  <button
                    type="button"
                    onClick={() => removeItem(item.service_id)}
                    aria-label="Xoá khỏi giỏ"
                    className="shrink-0 rounded-full p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <IconTrash className="size-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-sm text-brand-ink-soft">Tạm tính</span>
                <span className="text-2xl font-bold text-brand-ink">{formatCurrencyVnd(totalPrice)}</span>
              </div>
              <p className="mt-4 text-xs text-brand-ink-soft">
                Hệ thống chưa tích hợp cổng thanh toán thật — bấm thanh toán bên dưới sẽ ghi nhận từng gói đã được thanh toán ngay lập tức.
              </p>
              <Button className="mt-5 w-full" loading={paying} onClick={() => void handleCheckout()}>
                Thanh toán {formatCurrencyVnd(totalPrice)} (giả lập)
              </Button>
            </div>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  )
}
