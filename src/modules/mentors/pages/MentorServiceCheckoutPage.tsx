import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PublicHeader } from '@/modules/scholarships/components/PublicHeader'
import { SiteFooter } from '@/shared/components/layout/SiteFooter'
import { Button } from '@/shared/components/ui/Button'
import { Spinner } from '@/shared/components/ui/Spinner'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { mentorsApi } from '@/modules/mentors/api/mentors.api'
import { mentorPurchasesApi } from '@/modules/mentors/api/mentorPurchases.api'
import { formatCurrencyVnd } from '@/shared/lib/format'
import { ApiError } from '@/shared/api/types'
import type { MentorProfileDetailed, MentorService } from '@/modules/mentor/types'

export function MentorServiceCheckoutPage() {
  const { mentorId, serviceId } = useParams<{ mentorId: string; serviceId: string }>()
  const navigate = useNavigate()
  const { notify } = useToast()

  const [mentor, setMentor] = useState<MentorProfileDetailed | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    if (!mentorId) return
    setLoading(true)
    void mentorsApi
      .get(mentorId)
      .then(setMentor)
      .catch(() => setMentor(null))
      .finally(() => setLoading(false))
  }, [mentorId])

  const service: MentorService | undefined = mentor?.services.find((s) => s.id === serviceId && s.is_active)

  const handleConfirm = async () => {
    if (!serviceId) return
    setPurchasing(true)
    try {
      const purchase = await mentorPurchasesApi.purchase(serviceId)
      notify('Mua gói thành công (thanh toán giả lập).')
      navigate('/tai-khoan/mentor/lich-hen', { state: { openBookingForPurchaseId: purchase.id } })
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể mua gói. Vui lòng thử lại.', 'error')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-app-bg">
        <Spinner />
      </div>
    )
  }

  if (!mentor || !service) {
    return (
      <div className="flex min-h-svh flex-col bg-app-bg">
        <PublicHeader active="mentor" />
        <div className="flex-1 px-6 py-16 text-center text-brand-ink-soft">
          Không tìm thấy gói dịch vụ này.{' '}
          <Link to="/mentor" className="text-brand-blue-600 hover:underline">
            Quay lại danh sách mentor
          </Link>
        </div>
        <SiteFooter />
      </div>
    )
  }

  const mentorTitle = mentor.full_name || mentor.job_title || 'Mentor'

  return (
    <div className="flex min-h-svh flex-col bg-app-bg">
      <PublicHeader active="mentor" />

      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <p className="mb-4 text-sm text-brand-ink-soft">
          <Link to={`/mentor/${mentor.id}`}>{mentorTitle}</Link> <span className="mx-1">›</span> Đặt mua gói
        </p>
        <h1 className="mb-6 text-2xl font-bold text-brand-ink">Xác nhận mua gói dịch vụ</h1>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div className="size-12 shrink-0 overflow-hidden rounded-full bg-slate-200">
              {mentor.avatar_url && <img src={mentor.avatar_url} alt="" className="size-full object-cover" />}
            </div>
            <div>
              <p className="font-semibold text-brand-ink">{mentorTitle}</p>
              {mentor.full_name && mentor.job_title && <p className="text-xs text-brand-ink-soft">{mentor.job_title}</p>}
            </div>
          </div>

          <div className="space-y-3 py-5">
            <p className="text-lg font-bold text-brand-ink">{service.name}</p>
            {service.description && <p className="text-sm text-brand-ink-soft">{service.description}</p>}
            <p className="text-sm text-brand-ink-soft">
              {service.duration_minutes} phút/buổi · {service.total_sessions} buổi
            </p>
            {service.benefits.length > 0 && (
              <ul className="space-y-1 text-sm text-brand-ink-soft">
                {service.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="mt-0.5 text-brand-blue-500">✓</span> {b}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-5">
            <span className="text-sm text-brand-ink-soft">Tổng thanh toán</span>
            <span className="text-2xl font-bold text-brand-ink">{formatCurrencyVnd(service.price)}</span>
          </div>

          <p className="mt-4 text-xs text-brand-ink-soft">
            Hệ thống chưa tích hợp cổng thanh toán thật — bấm xác nhận bên dưới sẽ ghi nhận gói này đã được thanh toán ngay lập tức.
          </p>

          <Button className="mt-5 w-full" loading={purchasing} onClick={() => void handleConfirm()}>
            Xác nhận thanh toán (giả lập)
          </Button>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
