import { useEffect, useState } from 'react'
import { MentorLayout } from '@/modules/mentor/components/MentorLayout'
import { useMentorProfile } from '@/modules/mentor/MentorProfileContext'
import { mentorReviewsApi } from '@/modules/mentor/api/mentorReviews.api'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Pagination } from '@/shared/components/ui/Pagination'
import { formatDate } from '@/shared/lib/format'
import { IconStar } from '@/modules/mentor/components/icons'
import type { MentorReviewWithCandidate } from '@/modules/mentor/types'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-amber-400">
      {Array.from({ length: 5 }, (_, i) => (
        <IconStar key={i} className={i < rating ? 'fill-current' : 'fill-none text-slate-200'} />
      ))}
    </div>
  )
}

export function ReviewsPage() {
  const { profile } = useMentorProfile()
  const [averageRating, setAverageRating] = useState<number | null>(null)
  const [reviewsCount, setReviewsCount] = useState(0)
  const [items, setItems] = useState<MentorReviewWithCandidate[] | null>(null)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  useEffect(() => {
    if (!profile) return
    void mentorReviewsApi.getPublicProfile(profile.id).then((p) => {
      setAverageRating(p.average_rating)
      setReviewsCount(p.reviews_count ?? 0)
    })
  }, [profile])

  useEffect(() => {
    if (!profile) return
    setItems(null)
    void mentorReviewsApi.listForMentor(profile.id, { page }).then((res) => {
      setItems(res.items)
      setPages(res.pagination.pages)
    })
  }, [profile, page])

  return (
    <MentorLayout>
      <h1 className="mb-6 text-2xl font-bold text-brand-ink">Đánh giá</h1>

      <div className="mb-6 flex items-center gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-center">
          <p className="text-3xl font-bold text-brand-ink">{averageRating != null ? averageRating.toFixed(1) : '—'}</p>
          {averageRating != null && <StarRating rating={Math.round(averageRating)} />}
        </div>
        <div className="border-l border-slate-100 pl-6">
          <p className="text-sm text-brand-ink-soft">Tổng số đánh giá</p>
          <p className="text-xl font-bold text-brand-ink">{reviewsCount}</p>
        </div>
      </div>

      {items === null ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="Chưa có đánh giá nào" description="Đánh giá từ học viên sẽ hiển thị ở đây sau khi họ hoàn tất mua gói." />
      ) : (
        <div className="space-y-4">
          {items.map((review) => (
            <div key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 overflow-hidden rounded-full bg-slate-200">
                    {review.candidate.avatar_url && (
                      <img src={review.candidate.avatar_url} alt="" className="size-full object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-ink">{review.candidate.full_name || 'Học viên'}</p>
                    <p className="text-xs text-brand-ink-soft">{formatDate(review.created_at)}</p>
                  </div>
                </div>
                <StarRating rating={review.rating} />
              </div>
              {review.comment && <p className="mt-3 text-sm text-brand-ink">{review.comment}</p>}
            </div>
          ))}
          <Pagination page={page} pages={pages} onChange={setPage} />
        </div>
      )}
    </MentorLayout>
  )
}
