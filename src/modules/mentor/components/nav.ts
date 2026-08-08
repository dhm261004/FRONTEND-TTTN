import type { ComponentType, SVGProps } from 'react'
import {
  IconBriefcase,
  IconCalendarClock,
  IconIdCard,
  IconLock,
  IconStar,
  IconUser,
  IconUsers,
  IconWallet,
} from '@/modules/mentor/components/icons'

export interface MentorNavItem {
  label: string
  to: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  supported: boolean
}

export const MENTOR_NAV: MentorNavItem[] = [
  { label: 'Tài khoản', to: '/co-van', icon: IconUser, supported: true },
  { label: 'Mật khẩu và bảo mật', to: '/co-van/bao-mat', icon: IconLock, supported: true },
  { label: 'Quản lý thu nhập', to: '/co-van/thu-nhap', icon: IconWallet, supported: true },
  { label: 'Quản lý gói dịch vụ', to: '/co-van/dich-vu', icon: IconBriefcase, supported: true },
  { label: 'Quản lý sinh viên', to: '/co-van/sinh-vien', icon: IconUsers, supported: true },
  { label: 'Quản lý hồ sơ', to: '/co-van/ho-so', icon: IconIdCard, supported: true },
  { label: 'Đánh giá', to: '/co-van/danh-gia', icon: IconStar, supported: true },
  { label: 'Quản lý thời gian', to: '/co-van/lich', icon: IconCalendarClock, supported: true },
]
