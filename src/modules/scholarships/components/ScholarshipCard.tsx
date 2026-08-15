import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { formatCurrencyVnd, formatDate } from '@/shared/lib/format'
import { MatchBadge, scholarshipLocationLabel, scholarshipValueLabel } from '@/modules/scholarships/components/badges'
import { IconCalendarClock, IconUsers, IconWallet } from '@/modules/mentor/components/icons'
import type { Scholarship } from '@/modules/scholarships/types'

interface PartnerBadge {
  company_name: string
  logo_url: string | null
}

export function ScholarshipCard({
  scholarship,
  partner,
  saved,
  onToggleSave,
  match,
}: {
  scholarship: Scholarship
  partner?: PartnerBadge
  saved?: boolean
  onToggleSave?: () => void
  match?: { score: number }
}) {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Cờ đã lưu ghim ở góc trên-phải của cả card. */}
      {onToggleSave && (
        <button
          type="button"
          onClick={onToggleSave}
          aria-label={saved ? 'Bỏ lưu học bổng' : 'Lưu học bổng'}
          className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/90 text-brand-blue-600 shadow-md backdrop-blur-sm transition-colors hover:bg-white"
        >
          <BookmarkIcon filled={Boolean(saved)} />
        </button>
      )}

      {/* Padding tăng (p-5/p-6) và các phần tử phóng to hơn (icon, chữ, tag, nút) để card không bị
          trống trải sau khi bỏ ảnh bìa - card giờ chỉ còn thuần nội dung nên cần "đặc" hơn. */}
      <div className="flex flex-1 flex-col justify-between gap-5 p-5 sm:p-6">
        {/* pr-12 chừa chỗ cho nút lưu ghim (size-10) nổi ở góc trên-phải card. */}
        <div className={`flex flex-col gap-3 ${onToggleSave ? 'pr-12' : ''}`}>
          {/* Logo + tên đối tác bên trái, độ phù hợp (nếu có) đẩy hẳn sang phải cùng hàng - không còn
              đặt cạnh tiêu đề như trước. */}
          {(partner || match) && (
            <div className="flex items-center gap-3">
              {partner && (
                <div className="flex min-w-0 items-center gap-3 text-sm font-semibold text-brand-ink-soft">
                  <span className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {partner.logo_url ? (
                      <img src={partner.logo_url} alt="" className="size-full object-contain p-1.5" />
                    ) : (
                      <span className="text-base font-bold text-brand-blue-600">{partner.company_name.charAt(0)}</span>
                    )}
                  </span>
                  <span className="truncate">{partner.company_name}</span>
                </div>
              )}

              {match && (
                <span className="ml-auto shrink-0">
                  <MatchBadge score={match.score} />
                </span>
              )}
            </div>
          )}

          <Link to={`/hoc-bong/${scholarship.id}`} className="block">
            <h3 className="line-clamp-1 text-lg font-bold text-brand-ink hover:text-brand-blue-600 sm:line-clamp-2 sm:text-xl">
              {scholarship.title}
            </h3>
          </Link>

          {/* Icon cùng 1 tông màu xanh thương hiệu, bọc trong khối tròn nhạt cho thân thiện hơn icon
              nét mảnh trơ trọi cũ - phóng to hơn (size-9, chữ text-base) để cân với phần còn lại. */}
          <div className="mt-1 flex flex-col gap-3 text-base text-brand-ink-soft">
            <InfoRow icon={<IconWallet className="size-5" />}>
              <span className="font-semibold text-brand-ink">{formatCurrencyVnd(scholarship.total_budget)}</span>
            </InfoRow>
            <InfoRow icon={<IconUsers className="size-5" />}>
              {scholarship.total_slots != null ? `${scholarship.total_slots} suất` : 'Không giới hạn'}
            </InfoRow>
            <InfoRow icon={<IconCalendarClock className="size-5" />}>
              {formatDate(scholarship.start_date)} - {formatDate(scholarship.deadline)}
            </InfoRow>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Cùng đồng bộ 1 tone màu xanh thương hiệu nổi bật, viền mảnh rõ ràng */}
          <div className="flex flex-wrap items-center gap-2">
            {scholarship.is_vip_exclusive && (
              <span className="inline-flex items-center gap-1 rounded-md border border-brand-yellow-400 bg-brand-yellow-400/15 px-3 py-1.5 text-sm font-bold text-brand-yellow-600">
                ✨ VIP
              </span>
            )}
            <span className="inline-flex items-center rounded-md border border-brand-blue-200 bg-brand-blue-50 px-3 py-1.5 text-sm font-semibold text-brand-blue-700">
              {scholarshipValueLabel(scholarship)}
            </span>
            <span className="inline-flex items-center rounded-md border border-brand-blue-200 bg-brand-blue-50 px-3 py-1.5 text-sm font-semibold text-brand-blue-700">
              {scholarshipLocationLabel(scholarship)}
            </span>
            {scholarship.majors[0] && (
              <span className="inline-flex items-center rounded-md border border-brand-blue-200 bg-brand-blue-50 px-3 py-1.5 text-sm font-semibold text-brand-blue-700">
                {scholarship.majors[0].name}
              </span>
            )}
          </div>

          <Link to={`/hoc-bong/${scholarship.id}/ung-tuyen`} className="shrink-0">
            <Button className="w-full sm:w-auto">Ứng tuyển ngay</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <p className="flex items-center gap-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue-50 text-brand-blue-600">
        {icon}
      </span>
      <span>{children}</span>
    </p>
  )
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M6 4h12v17l-6-4-6 4V4Z" strokeLinejoin="round" />
    </svg>
  )
}

