import { PublicHeader } from '@/modules/scholarships/components/PublicHeader'
import { SiteFooter } from '@/shared/components/layout/SiteFooter'
import { UnsupportedNotice } from '@/shared/components/ui/UnsupportedNotice'

export function MentorComingSoonPage() {
  return (
    <div className="flex min-h-svh flex-col bg-app-bg">
      <PublicHeader active="mentor" />
      <div className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-16">
        <h1 className="mb-6 text-2xl font-bold text-brand-ink">Mentor</h1>
        <UnsupportedNotice>
          Module Mentor (danh sách mentor, đặt lịch cố vấn) chưa được xây dựng ở giao diện này. Backend đã có sẵn API
          (`mentors`, `mentor-assignments`, `mentoring-sessions`) nhưng phần frontend sẽ được bổ sung ở đợt sau.
        </UnsupportedNotice>
      </div>
      <SiteFooter />
    </div>
  )
}
