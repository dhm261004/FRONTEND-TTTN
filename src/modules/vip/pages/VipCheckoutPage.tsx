import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { PublicHeader } from '@/modules/scholarships/components/PublicHeader'
import { vipApi } from '@/modules/vip/api/vip.api'
import { VIP_PLANS, VIP_PROFILE_PATH } from '@/modules/vip/data/vipPlans'
import type { VipSubject } from '@/modules/vip/types'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { ApiError } from '@/shared/api/types'
import { formatCurrencyVnd } from '@/shared/lib/format'

function isValidSubject(value: string | undefined): value is VipSubject {
  return value === 'candidate' || value === 'partner' || value === 'mentor'
}

export function VipCheckoutPage() {
  const { subject } = useParams<{ subject: string }>()
  const navigate = useNavigate()
  const { notify } = useToast()
  const [submitting, setSubmitting] = useState(false)

  if (!isValidSubject(subject)) return <Navigate to="/skola-vip" replace />

  const plan = VIP_PLANS[subject]

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      await vipApi.purchase(subject)
      notify(`Kích hoạt Skola VIP · ${plan.title} thành công!`)
      navigate(VIP_PROFILE_PATH[subject])
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể kích hoạt VIP, vui lòng thử lại.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-svh bg-app-bg">
      <PublicHeader active="skola-vip" />

      <main className="mx-auto max-w-lg px-4 py-10">
        <h1 className="text-2xl font-bold text-brand-ink">Xác nhận nâng cấp VIP</h1>
        <p className="mt-1 text-sm text-brand-ink-soft">Gói Skola VIP · {plan.title}</p>

        <Card className="mt-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="font-semibold text-brand-ink">Skola VIP · {plan.title}</p>
              <p className="text-xs text-brand-ink-soft">Hiệu lực 1 năm kể từ khi kích hoạt</p>
            </div>
            <p className="text-lg font-bold text-brand-ink">{formatCurrencyVnd(plan.price)}</p>
          </div>

          <ul className="space-y-1.5 text-sm text-brand-ink-soft">
            {plan.rows.slice(0, 3).map((row) => (
              <li key={row.label} className="flex gap-2">
                <span className="text-emerald-600">✓</span>
                <span>{row.vip}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-xl bg-slate-50 p-3 text-xs text-brand-ink-soft">
            Hệ thống mô phỏng thanh toán — chưa có cổng thanh toán thật. Bấm xác nhận sẽ kích hoạt VIP ngay lập tức.
          </div>

          <Button variant="yellow" className="w-full" loading={submitting} onClick={() => void handleConfirm()}>
            Xác nhận thanh toán · {formatCurrencyVnd(plan.price)}
          </Button>
        </Card>
      </main>
    </div>
  )
}
