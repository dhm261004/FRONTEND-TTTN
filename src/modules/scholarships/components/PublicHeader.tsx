import { Link } from 'react-router-dom'
import { SiteHeader } from '@/shared/components/layout/SiteHeader'
import { Button } from '@/shared/components/ui/Button'
import { useAuth } from '@/modules/auth/AuthContext'

export function PublicHeader({ active }: { active?: 'hoc-bong' | 'mentor' | 'skola-vip' }) {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <SiteHeader
      navItems={[
        { label: 'Học bổng', to: '/hoc-bong', active: active === 'hoc-bong' },
        { label: 'Mentor', to: '/mentor', active: active === 'mentor' },
        { label: 'Skola Vip', to: '/skola-vip', active: active === 'skola-vip', tone: 'vip' },
      ]}
      userLabel={user?.email}
      onLogout={isAuthenticated ? () => void logout() : undefined}
      accountTo="/tai-khoan"
      rightContent={
        isAuthenticated ? undefined : (
          <div className="flex items-center gap-2">
            <Link to="/dang-nhap">
              <Button variant="ghost" size="sm">
                Đăng nhập
              </Button>
            </Link>
            <Link to="/dang-ky">
              <Button size="sm">Đăng ký ngay</Button>
            </Link>
          </div>
        )
      }
    />
  )
}
