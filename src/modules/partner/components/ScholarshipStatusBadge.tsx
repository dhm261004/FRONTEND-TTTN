import { Badge } from '@/shared/components/ui/Badge'
import type { Scholarship } from '@/modules/partner/types'

export function getScholarshipStatus(scholarship: Pick<Scholarship, 'is_active' | 'deadline'>) {
  const isExpired = new Date(scholarship.deadline).getTime() < Date.now()
  if (!scholarship.is_active) return { label: 'Đã đóng đơn', tone: 'slate' as const }
  if (isExpired) return { label: 'Đã hết hạn', tone: 'red' as const }
  return { label: 'Đang mở đơn', tone: 'green' as const }
}

// review_status là vòng đời kiểm duyệt nội dung (mỗi lần đối tác sửa bất kỳ trường nào khác is_active,
// học bổng tự động quay về 'pending' và bị ẩn khỏi trang công khai cho tới khi admin duyệt lại — xem
// ScholarshipsService#update ở api tổng) — HOÀN TOÀN khác is_hidden (admin chủ động ẩn một học bổng đã
// duyệt vì lý do khác, ví dụ nội dung không phù hợp về sau).
export function getReviewStatusInfo(reviewStatus: Scholarship['review_status']) {
  switch (reviewStatus) {
    case 'pending':
      return { label: 'Chờ duyệt', tone: 'amber' as const }
    case 'rejected':
      return { label: 'Bị từ chối', tone: 'red' as const }
    case 'changes_requested':
      return { label: 'Cần chỉnh sửa', tone: 'blue' as const }
    case 'approved':
    default:
      return null
  }
}

export function ScholarshipStatusBadge({
  scholarship,
}: {
  scholarship: Pick<Scholarship, 'is_active' | 'deadline' | 'is_hidden' | 'review_status'>
}) {
  const status = getScholarshipStatus(scholarship)
  const reviewInfo = getReviewStatusInfo(scholarship.review_status)
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {reviewInfo ? (
        <Badge tone={reviewInfo.tone}>{reviewInfo.label}</Badge>
      ) : (
        <Badge tone={status.tone}>{status.label}</Badge>
      )}
      {/* is_hidden do admin đặt (kiểm duyệt) — hoàn toàn tách biệt với is_active (đối tác tự đóng mở đơn),
          xem CLAUDE.md#Scholarship.isHidden. Hiện thêm badge riêng, không thay thế badge trạng thái mở/đóng. */}
      {scholarship.is_hidden && <Badge tone="red">Đã bị ẩn bởi quản trị viên</Badge>}
    </div>
  )
}
