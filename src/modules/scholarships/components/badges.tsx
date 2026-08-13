import { Badge, StatusText } from '@/shared/components/ui/Badge'
import type { ApplicationStatus, InteractionType, MatchLabel, Scholarship } from '@/modules/scholarships/types'

// value_type lưu ở backend là code ('percentage'/'fixed_amount'), không phải nhãn hiển thị được — hiện
// thẳng code này ra tag sẽ rất xấu. Với percentage, ưu tiên hiện đúng % nếu partner đã điền funding_percentage.
export function scholarshipValueLabel(scholarship: Pick<Scholarship, 'value_type' | 'funding_percentage'>): string {
  if (scholarship.value_type === 'percentage') {
    return scholarship.funding_percentage != null ? `${scholarship.funding_percentage}% học phí` : 'Theo % học phí'
  }
  if (scholarship.value_type === 'fixed_amount') return 'Số tiền cố định'
  return scholarship.value_type
}

// location_province_cities rỗng = "Toàn quốc" (xem CLAUDE.md 2026-08-11). Hiện tỉnh đầu tiên kèm
// "+N" khi partner chọn nhiều khu vực, để không tràn dòng ở các chỗ hiển thị dạng tag/chip 1 dòng.
export function scholarshipLocationLabel(scholarship: Pick<Scholarship, 'location_province_cities'>): string {
  const cities = scholarship.location_province_cities
  if (cities.length === 0) return 'Toàn quốc'
  if (cities.length === 1) return cities[0]
  return `${cities[0]} +${cities.length - 1}`
}

export function getScholarshipStatus(scholarship: Pick<Scholarship, 'is_active' | 'deadline'>) {
  const isExpired = new Date(scholarship.deadline).getTime() < Date.now()
  if (!scholarship.is_active) return { label: 'Đã đóng đơn', tone: 'slate' as const }
  if (isExpired) return { label: 'Đã hết hạn', tone: 'red' as const }
  return { label: 'Đang mở đơn', tone: 'green' as const }
}

export function ScholarshipStatusBadge({ scholarship }: { scholarship: Pick<Scholarship, 'is_active' | 'deadline'> }) {
  const status = getScholarshipStatus(scholarship)
  return <StatusText tone={status.tone}>{status.label}</StatusText>
}

const INTERACTION_LABELS: Record<InteractionType, string> = {
  saved: 'Đã lưu',
  hidden: 'Đã ẩn',
}

const INTERACTION_TONES: Record<InteractionType, 'blue' | 'amber' | 'green' | 'red' | 'slate'> = {
  saved: 'blue',
  hidden: 'slate',
}

export function InteractionStatusBadge({ type }: { type: InteractionType }) {
  return <Badge tone={INTERACTION_TONES[type]}>{INTERACTION_LABELS[type]}</Badge>
}

const APPLICATION_LABELS: Record<ApplicationStatus, string> = {
  pending: 'Đang chờ xét duyệt',
  won: 'Đã trúng học bổng',
  rejected: 'Bị từ chối',
}

const APPLICATION_TONES: Record<ApplicationStatus, 'blue' | 'amber' | 'green' | 'red' | 'slate'> = {
  pending: 'amber',
  won: 'green',
  rejected: 'red',
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return <Badge tone={APPLICATION_TONES[status]}>{APPLICATION_LABELS[status]}</Badge>
}

export const MATCH_LABELS: Record<MatchLabel, string> = {
  very_good_fit: 'Rất phù hợp',
  good_fit: 'Phù hợp',
  partial_fit: 'Phù hợp một phần',
  low_fit: 'Ít phù hợp',
}

export function MatchBadge({ score, label }: { score: number; label: MatchLabel }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-yellow-300/60 px-2.5 py-1 text-xs font-semibold text-brand-ink">
      Độ phù hợp: {score}% · {MATCH_LABELS[label]}
    </span>
  )
}

// Chấm điểm AI (embedding + LLM judge) trên 4 tiêu chí — xem GET /scholarships/:id/match.
// `criterion` từ API là string tự do (không phải union), nên map này chỉ dùng ?? b.criterion làm fallback
// để không vỡ UI nếu backend thêm tiêu chí mới sau này.
export const CRITERION_LABELS: Record<string, string> = {
  eligibility: 'Điều kiện đủ (GPA, ngoại ngữ, bằng cấp)',
  domain_relevance: 'Phù hợp lĩnh vực (CV vs học bổng)',
  impact_leadership: 'Hoạt động xã hội',
  priority_fit: 'Khớp ưu tiên học bổng',
}
