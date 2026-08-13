import { Badge } from '@/shared/components/ui/Badge'
import type { Scholarship } from '@/modules/partner/types'

export function getScholarshipStatus(scholarship: Pick<Scholarship, 'is_active' | 'deadline'>) {
  const isExpired = new Date(scholarship.deadline).getTime() < Date.now()
  if (!scholarship.is_active) return { label: 'Đã đóng đơn', tone: 'slate' as const }
  if (isExpired) return { label: 'Đã hết hạn', tone: 'red' as const }
  return { label: 'Đang mở đơn', tone: 'green' as const }
}

export function ScholarshipStatusBadge({ scholarship }: { scholarship: Pick<Scholarship, 'is_active' | 'deadline'> }) {
  const status = getScholarshipStatus(scholarship)
  return <Badge tone={status.tone}>{status.label}</Badge>
}
