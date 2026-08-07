import { Badge, StatusText } from '@/shared/components/ui/Badge'
import type { ApplicationStatus, InteractionType, MatchLabel, Scholarship } from '@/modules/scholarships/types'

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

const MATCH_LABELS: Record<MatchLabel, string> = {
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
