import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PublicHeader } from '@/modules/scholarships/components/PublicHeader'
import { SiteFooter } from '@/shared/components/layout/SiteFooter'
import { useAuth } from '@/modules/auth/AuthContext'
import { vipApi } from '@/modules/vip/api/vip.api'
import { VIP_PLANS, VIP_SUBJECT_ORDER } from '@/modules/vip/data/vipPlans'
import type { VipStatus, VipSubject } from '@/modules/vip/types'
import { Button } from '@/shared/components/ui/Button'
import { Spinner } from '@/shared/components/ui/Spinner'
import { formatCurrencyVnd, formatDate } from '@/shared/lib/format'
import { cn } from '@/shared/lib/cn'
import {
  IconArrowRight, IconAward, IconCheckCircle, IconGraduationCap, IconSparkle, IconUsers,
} from '@/modules/mentor/components/icons'
import { IconCrown } from '@/modules/partner/components/icons'

const SUBJECT_LABELS: Record<VipSubject, string> = { candidate: 'Sinh viên', partner: 'Doanh nghiệp', mentor: 'Mentor' }

const TRUST_POINTS = [
  { icon: IconSparkle, title: 'Nổi bật hơn', text: 'Huy hiệu VIP và vị trí ưu tiên giúp hồ sơ/gian hàng của bạn được chú ý trước tiên.' },
  { icon: IconGraduationCap, title: 'Cơ hội tốt hơn', text: 'Không giới hạn truy cập, gợi ý cá nhân hoá bằng AI để không bỏ lỡ cơ hội nào.' },
  { icon: IconUsers, title: 'Tiết kiệm chi phí', text: 'Giảm phí nền tảng/quảng bá và mở khoá toàn bộ tính năng chỉ với một khoản phí nhỏ mỗi năm.' },
]

function isValidSubject(value: string | null): value is VipSubject {
  return value === 'candidate' || value === 'partner' || value === 'mentor'
}

export function VipLandingPage() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [tab, setTab] = useState<VipSubject>(isValidSubject(tabParam) ? tabParam : 'candidate')
  const [status, setStatus] = useState<VipStatus | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setStatus(null)
      return
    }
    void vipApi.getStatus().then(setStatus)
  }, [isAuthenticated])

  const plan = VIP_PLANS[tab]
  const subjectStatus = status?.[tab] ?? null
  const hasRole = user?.roles.includes(tab) ?? false
  const isVip = Boolean(subjectStatus?.is_vip)

  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <PublicHeader active="skola-vip" />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-linear-to-br from-brand-blue-800 via-brand-blue-700 to-brand-blue-500 pb-16 pt-14 sm:pb-24 sm:pt-20">
        <div className="pointer-events-none absolute -left-20 top-0 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-1/4 size-96 rounded-full bg-brand-yellow-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-6 text-center text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wide backdrop-blur-md">
            <IconCrown className="size-4 text-brand-yellow-300" />
            Skola VIP
          </span>
          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            Nâng tầm hồ sơ, <span className="text-brand-yellow-300">bứt phá cơ hội</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-brand-blue-100/90">
            Mở khoá toàn bộ tính năng cao cấp của Skola — dành riêng cho sinh viên, doanh nghiệp và mentor, chỉ từ{' '}
            <span className="font-bold text-white">{formatCurrencyVnd(99000)}/năm</span>.
          </p>

          <div className="mx-auto mt-8 inline-flex flex-wrap justify-center gap-1.5 rounded-2xl border border-white/25 bg-white/10 p-1.5 backdrop-blur-md">
            {VIP_SUBJECT_ORDER.map((subject) => (
              <button
                key={subject}
                type="button"
                onClick={() => {
                  setTab(subject)
                  setSearchParams({ tab: subject })
                }}
                className={cn(
                  'rounded-xl px-5 py-2.5 text-sm font-bold transition-all',
                  tab === subject ? 'bg-white text-brand-blue-700 shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white',
                )}
              >
                {SUBJECT_LABELS[subject]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TRUST POINTS ================= */}
      <section className="relative z-10 mx-auto -mt-10 w-full max-w-5xl px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {TRUST_POINTS.map((point) => (
            <div key={point.title} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-lg shadow-slate-200/50">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue-50 text-brand-blue-600">
                <point.icon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-brand-ink">{point.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-brand-ink-soft">{point.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= PRICING CARDS ================= */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <div className="mx-auto grid max-w-3xl grid-cols-1 items-stretch gap-6 sm:grid-cols-2">
          {/* Phổ thông */}
          <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-bold text-brand-ink-soft">Phổ thông</p>
            <p className="mt-2 text-3xl font-black text-brand-ink">Miễn phí</p>
            <p className="mt-1 text-xs text-brand-ink-soft">Vĩnh viễn, đủ dùng cho nhu cầu cơ bản</p>

            <ul className="mt-6 flex-1 space-y-3.5">
              {plan.rows.map((row) => (
                <li key={row.label} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-300">–</span>
                  <span>
                    <span className="block font-semibold text-brand-ink">{row.label}</span>
                    <span className="text-brand-ink-soft">{row.free}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* VIP */}
          <div className="relative flex flex-col rounded-3xl bg-linear-to-br from-brand-blue-800 via-brand-blue-700 to-brand-blue-600 p-7 text-white shadow-2xl shadow-brand-blue-700/30 ring-2 ring-brand-yellow-400 sm:scale-[1.04]">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-yellow-400 px-4 py-1 text-xs font-black text-brand-ink shadow-md">
              Phổ biến nhất
            </span>

            <div className="flex items-center gap-2">
              <IconCrown className="size-5 text-brand-yellow-300" />
              <p className="text-sm font-bold text-brand-yellow-300">VIP · {plan.title}</p>
            </div>
            <p className="mt-2 text-3xl font-black">{formatCurrencyVnd(plan.price)}</p>
            <p className="mt-1 text-xs text-brand-blue-100/80">/ năm — huỷ hoặc gia hạn bất kỳ lúc nào</p>

            <ul className="mt-6 flex-1 space-y-3.5">
              {plan.rows.map((row) => (
                <li key={row.label} className="flex items-start gap-2.5 text-sm">
                  <IconCheckCircle className="mt-0.5 size-4 shrink-0 text-brand-yellow-300" />
                  <span>
                    <span className="block font-semibold text-white">{row.label}</span>
                    <span className="text-brand-blue-100/90">{row.vip}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-7">
              {!isAuthenticated ? (
                <Link to="/dang-nhap">
                  <Button variant="yellow" className="w-full justify-center">
                    Đăng nhập để nâng cấp <IconArrowRight className="size-4" />
                  </Button>
                </Link>
              ) : !hasRole ? (
                <div className="space-y-2">
                  <Button variant="yellow" className="w-full justify-center" disabled>Nâng cấp ngay</Button>
                  <p className="text-center text-xs text-brand-blue-100/80">
                    Tài khoản của bạn cần có vai trò &ldquo;{SUBJECT_LABELS[tab]}&rdquo; để nâng cấp gói này.
                  </p>
                </div>
              ) : status === null ? (
                <div className="flex justify-center py-1"><Spinner /></div>
              ) : isVip ? (
                <div className="space-y-3 rounded-2xl bg-white/10 p-4 text-center backdrop-blur-sm">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-yellow-400 px-3 py-1 text-xs font-black text-brand-ink">
                    <IconAward className="size-3.5" /> Đang VIP
                  </div>
                  <p className="text-sm text-brand-blue-100/90">Hết hạn {formatDate(subjectStatus?.vip_expires_at)}</p>
                  <Button variant="secondary" size="sm" className="w-full justify-center bg-white" onClick={() => navigate(`/skola-vip/thanh-toan/${tab}`)}>
                    Gia hạn thêm 1 năm
                  </Button>
                </div>
              ) : (
                <Button variant="yellow" className="w-full justify-center" onClick={() => navigate(`/skola-vip/thanh-toan/${tab}`)}>
                  Nâng cấp ngay <IconArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
