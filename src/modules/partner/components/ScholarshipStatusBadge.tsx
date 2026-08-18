import { Badge } from '@/shared/components/ui/Badge'
import type { Scholarship } from '@/modules/partner/types'

export function getScholarshipStatus(scholarship: Pick<Scholarship, 'is_active' | 'deadline'>) {
  const isExpired = new Date(scholarship.deadline).getTime() < Date.now()
  if (!scholarship.is_active) return { label: 'Đã đóng đơn', tone: 'slate' as const }
  if (isExpired) return { label: 'Đã hết hạn', tone: 'red' as const }
  return { label: 'Đang mở đơn', tone: 'green' as const }
}

export function ScholarshipStatusBadge({ scholarship }: { scholarship: Pick<Scholarship, 'is_active' | 'deadline' | 'is_hidden'> }) {
  const status = getScholarshipStatus(scholarship)
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge tone={status.tone}>{status.label}</Badge>
      {/* is_hidden do admin đặt (kiểm duyệt) — hoàn toàn tách biệt với is_active (đối tác tự đóng mở đơn),
          xem CLAUDE.md#Scholarship.isHidden. Hiện thêm badge riêng, không thay thế badge trạng thái mở/đóng. */}
      {scholarship.is_hidden && <Badge tone="red">Đã bị ẩn bởi quản trị viên</Badge>}
    </div>
  )
}
