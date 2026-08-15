import type { ComponentType, SVGProps } from 'react'
import {
  IconAward,
  IconBookmark,
  IconCalendar,
  IconCreditCard,
  IconFolder,
  IconGraduationCap,
  IconLock,
  IconPackage,
} from '@/modules/candidate/components/icons'

export interface CandidateNavItem {
  label: string
  to: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  supported: boolean
}

export const CANDIDATE_ACCOUNT_NAV: CandidateNavItem[] = [
  { label: 'Hồ sơ của tôi', to: '/tai-khoan/ho-so', icon: IconFolder, supported: true },
  { label: 'Skola Vip', to: '/skola-vip?tab=candidate', icon: IconAward, supported: true },
  { label: 'Mật khẩu và bảo mật', to: '/tai-khoan/bao-mat', icon: IconLock, supported: true },
  { label: 'Lịch sử giao dịch', to: '/tai-khoan/giao-dich', icon: IconCreditCard, supported: true },
  { label: 'Học bổng đã ứng tuyển', to: '/tai-khoan/ung-tuyen', icon: IconGraduationCap, supported: true },
  { label: 'Học bổng đã lưu', to: '/tai-khoan/da-luu', icon: IconBookmark, supported: true },
  { label: 'Gói mentor đã mua', to: '/tai-khoan/mentor/goi', icon: IconPackage, supported: true },
  { label: 'Lịch hẹn mentor', to: '/tai-khoan/mentor/lich-hen', icon: IconCalendar, supported: true },
]
