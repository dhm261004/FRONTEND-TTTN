import type { ComponentType, SVGProps } from 'react'
import {
  IconBriefcase,
  IconChart,
  IconIdCard,
  IconLock,
  IconPlusCircle,
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
  { label: 'Hồ sơ công ty', to: '/doi-tac/ho-so', icon: IconIdCard, supported: true },
  { label: 'Bảo mật', to: '/doi-tac/bao-mat', icon: IconLock, supported: true },
]
