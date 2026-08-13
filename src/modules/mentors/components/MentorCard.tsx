import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { IconStar } from '@/modules/mentor/components/icons'
import type { MentorProfile } from '@/modules/mentor/types'

export function MentorCard({ mentor }: { mentor: MentorProfile }) {
  const title = mentor.full_name || mentor.job_title || 'Mentor'
  const subtitle = mentor.full_name ? mentor.job_title : null

  return (
    <Link
      to={`/mentor/${mentor.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue-200 hover:shadow-xl"
    >
      <div className="flex justify-center bg-slate-50 pb-5 pt-7">
        <div className="size-24 shrink-0 overflow-hidden rounded-full bg-slate-100 shadow-sm ring-4 ring-white">
          {mentor.avatar_url ? (
            <img
              src={mentor.avatar_url}
              alt=""
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-linear-to-br from-brand-blue-400 to-brand-cocoa-500 text-2xl font-black text-white/90">
              {title.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center gap-1 px-4 pb-1 pt-4 text-center">
        <p className="line-clamp-1 text-base font-bold text-brand-ink group-hover:text-brand-blue-600">{title}</p>
        <p className="line-clamp-1 text-sm text-brand-ink-soft">{subtitle || 'Mentor Skola'}</p>

        <div className="mt-2 flex w-full items-center justify-between px-0.5 text-xs text-brand-ink-soft">
          <span>{mentor.reviews_count ? `${mentor.reviews_count} đánh giá` : 'Chưa có đánh giá'}</span>
          {mentor.average_rating != null && (
            <span className="flex items-center gap-1 font-bold text-brand-ink">
              <IconStar className="size-3.5 fill-current text-brand-yellow-500" />
              {mentor.average_rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 pt-3">
        <Button size="sm" className="w-full">
          Xem hồ sơ
        </Button>
      </div>
    </Link>
  )
}
