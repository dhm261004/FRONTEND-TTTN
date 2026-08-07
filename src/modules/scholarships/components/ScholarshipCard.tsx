import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { formatCurrencyVnd, formatDate } from '@/shared/lib/format'
import { MatchBadge } from '@/modules/scholarships/components/badges'
import type { MatchLabel, Scholarship } from '@/modules/scholarships/types'

export function ScholarshipCard({
  scholarship,
  saved,
  onToggleSave,
  match,
}: {
  scholarship: Scholarship
  saved?: boolean
  onToggleSave?: () => void
  match?: { score: number; label: MatchLabel }
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-video w-full shrink-0 bg-slate-100">
        <Link to={`/hoc-bong/${scholarship.id}`}>
          {scholarship.image_url ? (
            <img src={scholarship.image_url} alt="" className="size-full object-cover" />
          ) : (
            <ScholarshipImageFallback title={scholarship.title} />
          )}
        </Link>

        {match && (
          <div className="absolute left-3 top-3">
            <MatchBadge score={match.score} label={match.label} />
          </div>
        )}

        {onToggleSave && (
          <button
            type="button"
            onClick={onToggleSave}
            aria-label={saved ? 'Bỏ lưu học bổng' : 'Lưu học bổng'}
            className="absolute right-3 top-3 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/90 text-brand-blue-500 shadow-sm backdrop-blur hover:bg-white"
          >
            <BookmarkIcon filled={Boolean(saved)} />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <Link to={`/hoc-bong/${scholarship.id}`} className="block">
          <h3 className="line-clamp-2 text-base font-bold text-brand-ink hover:text-brand-blue-600">
            {scholarship.title}
          </h3>
        </Link>

        <div className="space-y-1 text-sm text-brand-ink-soft">
          <p className="flex items-center gap-1.5">
            <CoinIcon />
            {formatCurrencyVnd(scholarship.total_budget)}
          </p>
          <p className="flex items-center gap-1.5">
            <SeatIcon />
            {scholarship.total_slots != null ? `${scholarship.total_slots} suất` : 'Không giới hạn suất'}
          </p>
          <p className="flex items-center gap-1.5">
            <CalendarIcon />
            {formatDate(scholarship.start_date)} - {formatDate(scholarship.deadline)}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge>{scholarship.value_type}</Badge>
          {scholarship.location_province_city && <Badge>{scholarship.location_province_city}</Badge>}
          {scholarship.majors[0] && <Badge>{scholarship.majors[0].name}</Badge>}
        </div>

        <Link to={`/hoc-bong/${scholarship.id}/ung-tuyen`} className="mt-auto pt-1">
          <Button className="w-full" size="sm">
            Ứng tuyển ngay
          </Button>
        </Link>
      </div>
    </div>
  )
}

const FALLBACK_GRADIENTS = [
  'from-brand-blue-400 to-brand-blue-600',
  'from-brand-yellow-400 to-brand-blue-500',
  'from-brand-blue-500 to-brand-ink',
]

function ScholarshipImageFallback({ title }: { title: string }) {
  // Không có ảnh do đối tác chưa tải lên — dùng gradient + chữ cái đầu để card vẫn cân đối
  // về mặt hình ảnh thay vì để trống, chọn gradient theo hash của tiêu đề cho đa dạng.
  const index = title.charCodeAt(0) % FALLBACK_GRADIENTS.length
  return (
    <div className={`flex size-full items-center justify-center bg-linear-to-br ${FALLBACK_GRADIENTS[index]}`}>
      <GraduationCapIcon className="size-10 text-white/90" />
    </div>
  )
}

function GraduationCapIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="m2 9 10-5 10 5-10 5-10-5Z" strokeLinejoin="round" />
      <path d="M6 11v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5" strokeLinecap="round" />
      <path d="M22 9v6" strokeLinecap="round" />
    </svg>
  )
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M6 4h12v17l-6-4-6 4V4Z" strokeLinejoin="round" />
    </svg>
  )
}

function CoinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9 9.5c0-1 1-1.5 3-1.5s3 .8 3 1.8-1.3 1.2-3 1.7-3 .8-3 1.9 1.4 1.6 3 1.6 3-.5 3-1.5" strokeLinecap="round" />
    </svg>
  )
}

function SeatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="7" r="3.2" />
      <path d="M5 21v-2c0-3 3-5.5 7-5.5s7 2.5 7 5.5v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" />
    </svg>
  )
}
