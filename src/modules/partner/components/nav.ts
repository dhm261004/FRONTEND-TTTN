import type { ComponentType, SVGProps } from 'react'
import {
  IconBriefcase,
  IconChart,
  IconCreditCard,
  IconIdCard,
  IconLock,
  IconMail,
  IconPlusCircle,
  IconUser,
  IconWallet,
} from '@/modules/partner/components/icons'

export interface PartnerNavItem {
  label: string
  to: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  supported: boolean
}

export const MANAGEMENT_NAV: PartnerNavItem[] = [
  { label: 'Tổng quan', to: '/doi-tac', icon: IconChart, supported: true },
  { label: 'Đăng tải học bổng mới', to: '/doi-tac/hoc-bong/moi', icon: IconPlusCircle, supported: true },
  { label: 'Quản lý học bổng', to: '/doi-tac/hoc-bong', icon: IconBriefcase, supported: true },
  { label: 'Quản lý hồ sơ ứng viên', to: '/doi-tac/ho-so-ung-vien', icon: IconIdCard, supported: true },
  { label: 'Quản lý ngân sách', to: '/doi-tac/ngan-sach', icon: IconWallet, supported: false },
]

export const ACCOUNT_NAV: PartnerNavItem[] = [
  { label: 'Tài khoản', to: '/tai-khoan', icon: IconUser, supported: true },
  { label: 'Sửa hồ sơ công ty', to: '/tai-khoan/ho-so-cong-ty', icon: IconIdCard, supported: true },
  { label: 'Mật khẩu và bảo mật', to: '/tai-khoan/bao-mat', icon: IconLock, supported: true },
  { label: 'Quản lý giao dịch', to: '/tai-khoan/giao-dich', icon: IconCreditCard, supported: false },
  { label: 'Thông báo qua email', to: '/tai-khoan/thong-bao', icon: IconMail, supported: false },
]
