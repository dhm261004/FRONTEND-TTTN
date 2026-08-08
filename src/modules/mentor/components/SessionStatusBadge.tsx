import { Badge } from '@/shared/components/ui/Badge'
import type { SessionStatus } from '@/modules/mentor/types'

const LABELS: Record<SessionStatus, string> = {
  pending: 'Chờ duyệt',
  confirmed: 'Đã duyệt',
  completed: 'Hoàn thành',
  canceled: 'Đã huỷ',
  rescheduled: 'Đã dời lịch',
}

const TONES: Record<SessionStatus, 'amber' | 'blue' | 'green' | 'red' | 'slate'> = {
  pending: 'amber',
  confirmed: 'blue',
  completed: 'green',
  canceled: 'red',
  rescheduled: 'slate',
}

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  return <Badge tone={TONES[status]}>{LABELS[status]}</Badge>
}
