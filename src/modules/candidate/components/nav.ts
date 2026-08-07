import type { ComponentType, SVGProps } from 'react'
import {
  IconBookmark,
  IconCreditCard,
  IconFolder,
  IconGraduationCap,
  IconLightbulb,
  IconLock,
  IconMail,
  IconMegaphone,
  IconUser,
} from '@/modules/candidate/components/icons'

export interface CandidateNavItem {
  label: string
  to: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  supported: boolean
}

export const CANDIDATE_ACCOUNT_NAV: CandidateNavItem[] = [
  { label: 'Hồ sơ của tôi', to: '/tai-khoan/ho-so', icon: IconFolder, supported: true },
  { label: 'Cài đặt thông tin tài khoản', to: '/tai-khoan', icon: IconUser, supported: true },
  { label: 'Mật khẩu và bảo mật', to: '/tai-khoan/bao-mat', icon: IconLock, supported: true },
  { label: 'Quản lý giao dịch', to: '/tai-khoan/giao-dich', icon: IconCreditCard, supported: false },
  { label: 'Học bổng đã ứng tuyển', to: '/tai-khoan/ung-tuyen', icon: IconGraduationCap, supported: true },
  { label: 'Học bổng đã lưu', to: '/tai-khoan/da-luu', icon: IconBookmark, supported: true },
  { label: 'Cài đặt gợi ý học bổng', to: '/tai-khoan/goi-y', icon: IconLightbulb, supported: false },
  { label: 'Thông báo học bổng', to: '/tai-khoan/thong-bao-hoc-bong', icon: IconMegaphone, supported: false },
  { label: 'Thông báo qua email', to: '/tai-khoan/thong-bao-email', icon: IconMail, supported: false },
]
