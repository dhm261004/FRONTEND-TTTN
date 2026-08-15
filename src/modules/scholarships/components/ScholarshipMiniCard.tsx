import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { formatCurrencyVnd, formatDate } from '@/shared/lib/format'
import { scholarshipLocationLabel, scholarshipValueLabel } from '@/modules/scholarships/components/badges'
import { IconCalendarClock, IconWallet } from '@/modules/mentor/components/icons'
import type { Scholarship } from '@/modules/scholarships/types'

export interface PartnerBadge {
  company_name: string
  logo_url: string | null
}

// Card học bổng gọn (4 cột) - dùng chung cho lưới "Học bổng nổi bật" ở trang chủ và "Học bổng liên quan"
// ở trang chi tiết học bổng, để 2 nơi luôn đồng bộ giao diện thay vì mỗi trang tự vẽ 1 kiểu card riêng.
export function ScholarshipMiniCard({
  scholarship,
  partner,
  saved,
  onToggleSave,
}: {
  scholarship: Scholarship
  partner?: PartnerBadge
  saved: boolean
  onToggleSave: () => void
}) {
  const majorTag = scholarship.majors[0]?.name

  return (
    <div className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-brand-blue-200">
      <div className="mb-4 flex items-start justify-between gap-3">
        <Link to={`/hoc-bong/${scholarship.id}`} className="flex h-8 max-w-[65%] items-center">
          {partner?.logo_url ? (
            <img src={partner.logo_url} alt={partner.company_name} className="h-8 max-w-full object-contain object-left" />
          ) : (
            <span className="truncate text-sm font-bold text-brand-blue-600">{partner?.company_name ?? 'Skola'}</span>
          )}
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            onToggleSave()
          }}
          aria-label={saved ? 'Bỏ lưu học bổng' : 'Lưu học bổng'}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-brand-blue-500 transition-colors hover:bg-brand-blue-50"
        >
          <MiniBookmarkIcon filled={saved} />
        </button>
      </div>

      <Link to={`/hoc-bong/${scholarship.id}`} className="mb-3 block">
        <h3 className="line-clamp-2 min-h-12 text-base font-bold text-brand-ink group-hover:text-brand-blue-600 transition-colors">
          {scholarship.title}
        </h3>
      </Link>

      <div className="mb-4 flex flex-col gap-2 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <IconCalendarClock className="size-4 shrink-0 text-slate-400" />
          <span className="truncate">
            {formatDate(scholarship.start_date)} - {formatDate(scholarship.deadline)}
          </span>
        </div>
        <div className="flex items-center gap-2 font-bold text-brand-blue-600">
          <IconWallet className="size-4 shrink-0" />
          <span>{formatCurrencyVnd(scholarship.total_budget)}</span>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {scholarship.value_type && <MiniTag>{scholarshipValueLabel(scholarship)}</MiniTag>}
        <MiniTag>{scholarshipLocationLabel(scholarship)}</MiniTag>
        {majorTag && <MiniTag>{majorTag}</MiniTag>}
      </div>

      <Link to={`/hoc-bong/${scholarship.id}/ung-tuyen`} className="mt-auto block">
        <Button size="sm" className="w-full">
          Đăng kí ngay
        </Button>
      </Link>
    </div>
  )
}

function MiniBookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M6 4h12v17l-6-4-6 4V4Z" strokeLinejoin="round" />
    </svg>
  )
}

function MiniTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
      {children}
    </span>
  )
}
