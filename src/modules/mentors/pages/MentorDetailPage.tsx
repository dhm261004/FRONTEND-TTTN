import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PublicHeader } from '@/modules/scholarships/components/PublicHeader'
import { SiteFooter } from '@/shared/components/layout/SiteFooter'
import { StarRating } from '@/modules/mentors/components/StarRating'
import { Button } from '@/shared/components/ui/Button'
import { Spinner } from '@/shared/components/ui/Spinner'
import { Pagination } from '@/shared/components/ui/Pagination'
import { useAuth } from '@/modules/auth/AuthContext'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { mentorsApi } from '@/modules/mentors/api/mentors.api'
import { useCart } from '@/modules/mentors/cart/CartContext'
import { formatCurrencyVnd, formatDate } from '@/shared/lib/format'
import { IconAward, IconCheckCircle, IconGraduationCap, IconQuote } from '@/modules/mentor/components/icons'
import { VipBadge, isVipActive } from '@/shared/components/ui/VipBadge'
import guideMascot from '@/assets/guide-mascot.png'
import type { MentorProfileDetailed, MentorReviewWithCandidate, MentorService } from '@/modules/mentor/types'

export function MentorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { notify } = useToast()
  const { addItem } = useCart()

  const [mentor, setMentor] = useState<MentorProfileDetailed | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<MentorReviewWithCandidate[] | null>(null)
  const [reviewsPage, setReviewsPage] = useState(1)
  const [reviewsPages, setReviewsPages] = useState(1)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    void mentorsApi
      .get(id)
      .then(setMentor)
      .catch(() => setMentor(null))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    setReviews(null)
    void mentorsApi.listReviews(id, { page: reviewsPage }).then((res) => {
      setReviews(res.items)
      setReviewsPages(res.pagination.pages)
    })
  }, [id, reviewsPage])

  const requireCandidate = () => {
    if (!id) return false
    if (!isAuthenticated) {
      navigate('/dang-nhap', { state: { from: `/mentor/${id}` } })
      return false
    }
    if (!user?.roles.includes('candidate')) {
      notify('Chỉ tài khoản sinh viên mới mua được gói mentor.', 'error')
      return false
    }
    return true
  }

  const handleBuyService = (serviceId: string) => {
    if (!id || !requireCandidate()) return
    navigate(`/mentor/${id}/goi/${serviceId}/dat-mua`)
  }

  const handleAddToCart = (service: MentorService) => {
    if (!mentor || !requireCandidate()) return
    addItem({
      service_id: service.id,
      mentor_id: mentor.id,
      mentor_name: mentor.full_name || mentor.job_title || 'Mentor',
      mentor_avatar_url: mentor.avatar_url,
      service_name: service.name,
      price: service.price,
      duration_minutes: service.duration_minutes,
      total_sessions: service.total_sessions,
    })
    notify('Đã thêm vào giỏ hàng.')
  }

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-app-bg">
        <Spinner />
      </div>
    )
  }

  if (!mentor) {
    return (
      <div className="flex min-h-svh flex-col bg-app-bg">
        <PublicHeader active="mentor" />
        <div className="flex-1 px-6 py-16 text-center text-brand-ink-soft">Không tìm thấy mentor.</div>
        <SiteFooter />
      </div>
    )
  }

  const title = mentor.full_name || mentor.job_title || 'Mentor'
  const subtitle = mentor.full_name ? mentor.job_title : null
  const activeServices = mentor.services.filter((s) => s.is_active)
  const lowestPrice = activeServices.length > 0 ? Math.min(...activeServices.map((s) => s.price)) : null

  return (
    <div className="flex min-h-svh flex-col bg-app-bg">
      <PublicHeader active="mentor" />

      <div className="mx-auto w-full max-w-[1440px] flex-1 px-6 pb-8">
        <p className="mt-6 mb-4 text-sm text-brand-ink-soft">
          <Link to="/" className="hover:underline">
            Trang chủ
          </Link>{' '}
          <span className="mx-1">›</span> <Link to="/mentor" className="hover:underline">Mentor</Link>{' '}
          <span className="mx-1">›</span> {title}
        </p>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="min-w-0 flex-1 space-y-6">
            <div className="flex flex-wrap items-end gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="size-24 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-200 shadow-sm sm:size-28">
                {mentor.avatar_url ? (
                  <img src={mentor.avatar_url} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center bg-brand-blue-50 text-3xl font-black text-brand-blue-300">
                    {title.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black text-brand-ink sm:text-3xl">{title}</h1>
                  {isVipActive(mentor.vip_expires_at) && <VipBadge />}
                </div>
                {subtitle && (
                  <p className="mt-1 flex items-center gap-1.5 text-base text-brand-ink-soft sm:text-lg">
                    <IconGraduationCap className="size-5 shrink-0 text-brand-blue-500" />
                    {subtitle}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5">
                    <StarRating rating={mentor.average_rating ? Math.round(mentor.average_rating) : 0} />
                    <span className="font-semibold text-brand-ink">
                      {mentor.average_rating != null ? mentor.average_rating.toFixed(1) : '—'}
                    </span>
                  </span>
                  <span className="text-brand-ink-soft">{mentor.reviews_count ?? 0} đánh giá</span>
                </div>
              </div>
            </div>

            {mentor.bio && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle>Giới thiệu bản thân</SectionTitle>
                <p className="whitespace-pre-line text-sm leading-relaxed text-brand-ink-soft">{mentor.bio}</p>
              </div>
            )}

            {mentor.achievements.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle>Thành tích nổi bật</SectionTitle>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {mentor.achievements.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-start gap-3 rounded-2xl border border-brand-cocoa-100 bg-brand-cocoa-50/60 px-4 py-3"
                    >
                      <IconAward className="mt-0.5 size-5 shrink-0 text-brand-cocoa-500" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-brand-ink">{a.title}</p>
                        {a.description && <p className="text-xs text-brand-ink-soft">{a.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mentor.certificates.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle>Chứng nhận chuyên môn</SectionTitle>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {mentor.certificates.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-start gap-3 rounded-2xl border border-brand-blue-100 bg-brand-blue-50/60 px-4 py-3"
                    >
                      <IconCheckCircle className="mt-0.5 size-5 shrink-0 text-brand-blue-500" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-brand-ink">{c.name}</p>
                        {c.issued_by && <p className="text-xs text-brand-ink-soft">{c.issued_by}</p>}
                        {c.attachment_url && (
                          <a
                            href={c.attachment_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-brand-blue-600 underline decoration-dotted hover:text-brand-blue-800"
                          >
                            Xem minh chứng
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div id="dich-vu" className="scroll-mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionTitle>Gói tư vấn & chi phí</SectionTitle>
              {activeServices.length === 0 ? (
                <p className="text-sm text-brand-ink-soft">Mentor hiện chưa mở bán gói dịch vụ nào.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {activeServices.map((s) => (
                    <ServiceCard
                      key={s.id}
                      service={s}
                      isBestValue={lowestPrice != null && s.price === lowestPrice}
                      onAddToCart={() => handleAddToCart(s)}
                      onBuyNow={() => handleBuyService(s.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionTitle>Học viên nói gì</SectionTitle>
              {reviews === null ? (
                <Spinner />
              ) : reviews.length === 0 ? (
                <p className="text-sm text-brand-ink-soft">Chưa có đánh giá nào.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-4 pl-5">
                      <IconQuote className="absolute left-3 top-3 size-5 text-brand-blue-100" />
                      <div className="flex items-start justify-between gap-3 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="size-9 shrink-0 overflow-hidden rounded-full bg-slate-200">
                            {review.candidate.avatar_url && (
                              <img src={review.candidate.avatar_url} alt="" className="size-full object-cover" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-brand-ink">{review.candidate.full_name || 'Học viên'}</p>
                            <p className="text-xs text-brand-ink-soft">{formatDate(review.created_at)}</p>
                          </div>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      {review.service_name && (
                        <span className="mt-2 ml-6 inline-flex items-center rounded-full bg-brand-blue-50 px-2.5 py-1 text-xs font-medium text-brand-blue-700">
                          Gói: {review.service_name}
                        </span>
                      )}
                      {review.comment && <p className="mt-3 pl-6 text-sm text-brand-ink">{review.comment}</p>}
                    </div>
                  ))}
                  <Pagination page={reviewsPage} pages={reviewsPages} onChange={setReviewsPage} />
                </div>
              )}
            </div>
          </div>

          <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:h-fit lg:w-[280px]">
            {/* Bỏ hẳn card/gradient - bên phải chỉ còn đúng ảnh guide-mascot, không viền/nền/nội dung
                nào khác. Không ép aspect ratio/object-cover nữa - hiện trọn ảnh theo đúng tỉ lệ gốc,
                không crop. */}
            <img src={guideMascot} alt="" className="w-full rounded-3xl" />
          </aside>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}

function SectionTitle({ children }: { children: string }) {
  return <h2 className="mb-3 border-l-4 border-brand-blue-500 pl-3 text-lg font-bold text-brand-ink">{children}</h2>
}

function ServiceCard({
  service,
  isBestValue,
  onAddToCart,
  onBuyNow,
}: {
  service: MentorService
  isBestValue: boolean
  onAddToCart: () => void
  onBuyNow: () => void
}) {
  return (
    <div
      className={`relative flex flex-col gap-3 rounded-2xl border p-5 transition-shadow hover:shadow-md ${
        isBestValue ? 'border-brand-blue-300 bg-brand-blue-50/40' : 'border-slate-200'
      }`}
    >
      {isBestValue && (
        <span className="absolute -top-3 left-4 rounded-full bg-brand-blue-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
          Giá tốt nhất
        </span>
      )}
      <div>
        <p className="font-bold text-brand-ink">{service.name}</p>
        {service.description && <p className="mt-1 text-sm text-brand-ink-soft">{service.description}</p>}
      </div>
      <p className="text-xs text-brand-ink-soft">
        {service.duration_minutes} phút/buổi · {service.total_sessions} buổi
      </p>
      {service.benefits.length > 0 && (
        <ul className="space-y-1 text-xs text-brand-ink-soft">
          {service.benefits.map((b, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <IconCheckCircle className="mt-0.5 size-3.5 shrink-0 text-brand-blue-500" /> {b}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-1 text-lg font-bold text-brand-ink">{formatCurrencyVnd(service.price)}</p>
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onAddToCart}>
          Thêm vào giỏ
        </Button>
        <Button className="flex-1" onClick={onBuyNow}>
          Mua ngay
        </Button>
      </div>
    </div>
  )
}
