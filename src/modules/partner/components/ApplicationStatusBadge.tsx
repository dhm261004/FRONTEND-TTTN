import { Badge } from '@/shared/components/ui/Badge'
import type { ApplicationStatus } from '@/modules/partner/types'

const LABELS: Record<ApplicationStatus, string> = {
  pending: 'Chờ xét duyệt',
  won: 'Đã được chọn',
  rejected: 'Bị từ chối',
}

const TONES: Record<ApplicationStatus, 'blue' | 'amber' | 'green' | 'red' | 'slate'> = {
  pending: 'amber',
  won: 'green',
  rejected: 'red',
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return <Badge tone={TONES[status]}>{LABELS[status]}</Badge>
}
