import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CandidateLayout } from '@/modules/candidate/components/CandidateLayout'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { Field } from '@/shared/components/ui/Field'
import { Textarea } from '@/shared/components/ui/Textarea'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { mentorPurchasesApi } from '@/modules/mentors/api/mentorPurchases.api'
import { IconStar } from '@/modules/mentor/components/icons'
import { formatCurrencyVnd, formatDate } from '@/shared/lib/format'
import { ApiError } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import type { MentorPurchase } from '@/modules/mentor/types'

function StarRatingInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1
        return (
          <button key={star} type="button" onClick={() => onChange(star)} aria-label={`${star} sao`}>
            <IconStar className={cn('size-6', star <= value ? 'fill-current text-amber-400' : 'fill-none text-slate-200')} />
          </button>
        )
      })}
    </div>
  )
}

export function MentorPurchasesPage() {
  const { notify } = useToast()
  const [purchases, setPurchases] = useState<MentorPurchase[] | null>(null)
  const [reviewTarget, setReviewTarget] = useState<MentorPurchase | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    void mentorPurchasesApi.listMine().then(setPurchases)
  }, [])

  const openReview = (purchase: MentorPurchase) => {
    setReviewTarget(purchase)
    setRating(5)
    setComment('')
  }

  const submitReview = async () => {
    if (!reviewTarget) return
    setSubmitting(true)
    try {
      await mentorPurchasesApi.submitReview(reviewTarget.id, { rating, comment: comment.trim() || undefined })
      notify('Đã gửi đánh giá. Cảm ơn bạn!')
      setReviewTarget(null)
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể gửi đánh giá. Vui lòng thử lại.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <CandidateLayout>
      <h1 className="mb-1 text-2xl font-bold text-brand-ink">Gói mentor đã mua</h1>
      <p className="mb-6 text-sm text-brand-ink-soft">
        Muốn đặt buổi hẹn mới? Vào{' '}
        <Link to="/tai-khoan/mentor/lich-hen" className="font-semibold text-brand-blue-600 hover:underline">
          Lịch hẹn mentor
        </Link>
        .
      </p>

      {purchases === null ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : purchases.length === 0 ? (
        <EmptyState
          title="Bạn chưa mua gói mentor nào"
          description="Khám phá danh sách mentor và chọn gói phù hợp với bạn."
          action={
            <Link to="/mentor" className="text-sm font-semibold text-brand-blue-600">
              Xem danh sách mentor
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => {
            const mentorTitle = purchase.mentor_full_name || purchase.mentor_job_title || 'Mentor'
            return (
              <div key={purchase.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-11 shrink-0 overflow-hidden rounded-full bg-slate-200">
                      {purchase.mentor_avatar_url && (
                        <img src={purchase.mentor_avatar_url} alt="" className="size-full object-cover" />
                      )}
                    </div>
                    <div>
                      {purchase.mentor_profile_id ? (
                        <Link to={`/mentor/${purchase.mentor_profile_id}`} className="font-semibold text-brand-ink hover:text-brand-blue-600">
                          {mentorTitle}
                        </Link>
                      ) : (
                        <p className="font-semibold text-brand-ink">{mentorTitle}</p>
                      )}
                      <p className="text-sm text-brand-ink-soft">{purchase.service_name}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-brand-ink">{formatCurrencyVnd(purchase.price)}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div className="text-sm text-brand-ink-soft">
                    <p>
                      Còn lại <span className="font-semibold text-brand-ink">{purchase.remaining_sessions}</span>/{purchase.total_sessions} buổi
                    </p>
                    <p className="text-xs">Mua ngày {formatDate(purchase.purchased_at)}</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => openReview(purchase)}>
                    Đánh giá
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={reviewTarget !== null}
        onClose={() => setReviewTarget(null)}
        title="Đánh giá mentor"
        footer={
          <>
            <Button variant="ghost" onClick={() => setReviewTarget(null)}>
              Đóng
            </Button>
            <Button loading={submitting} onClick={() => void submitReview()}>
              Gửi đánh giá
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Số sao">
            <StarRatingInput value={rating} onChange={setRating} />
          </Field>
          <Field label="Nhận xét (không bắt buộc)">
            <Textarea rows={4} placeholder="Chia sẻ trải nghiệm của bạn..." value={comment} onChange={(e) => setComment(e.target.value)} />
          </Field>
        </div>
      </Modal>
    </CandidateLayout>
  )
}
