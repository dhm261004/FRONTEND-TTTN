import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/modules/auth/AuthContext'
import { useCart } from '@/modules/mentors/cart/CartContext'
import { IconCart } from '@/modules/mentors/cart/icons'
import { formatCurrencyVnd } from '@/shared/lib/format'
import { Button } from '@/shared/components/ui/Button'

export function CartButton() {
  const { user } = useAuth()
  const { items, totalCount, totalPrice, removeItem } = useCart()
  const [open, setOpen] = useState(false)

  if (!user?.roles.includes('candidate')) return null

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Giỏ hàng"
        className="relative flex size-10 items-center justify-center rounded-full bg-slate-100 text-brand-ink-soft hover:bg-slate-200"
      >
        <IconCart className="size-[18px]" />
        {totalCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-brand-blue-500 text-[10px] font-bold text-white">
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
            <p className="px-1 pb-2 text-sm font-bold text-brand-ink">Giỏ hàng ({totalCount})</p>
            {items.length === 0 ? (
              <p className="px-1 py-4 text-center text-sm text-brand-ink-soft">Giỏ hàng trống.</p>
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto pr-0.5">
                {items.map((item) => (
                  <div key={item.service_id} className="flex items-start gap-2 rounded-lg border border-slate-100 p-2">
                    <div className="size-9 shrink-0 overflow-hidden rounded-full bg-slate-200">
                      {item.mentor_avatar_url && <img src={item.mentor_avatar_url} alt="" className="size-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-brand-ink">{item.service_name}</p>
                      <p className="line-clamp-1 text-xs text-brand-ink-soft">{item.mentor_name}</p>
                      <p className="text-xs text-brand-ink-soft">
                        {item.quantity} × {formatCurrencyVnd(item.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.service_id)}
                      aria-label="Xoá khỏi giỏ"
                      className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-sm text-brand-ink-soft">Tạm tính</span>
              <span className="font-bold text-brand-ink">{formatCurrencyVnd(totalPrice)}</span>
            </div>
            <Link to="/gio-hang" onClick={() => setOpen(false)}>
              <Button className="mt-3 w-full" disabled={items.length === 0}>
                Thanh toán
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
