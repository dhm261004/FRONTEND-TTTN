import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/modules/auth/AuthContext'
import { Button } from '@/shared/components/ui/Button'
import type { UserRole } from '@/modules/auth/types'

export function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: UserRole[] }) {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" replace state={{ from: location.pathname }} />
  }

  if (roles && user && !roles.includes(user.role)) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-app-bg px-4 text-center">
        <p className="text-lg font-semibold text-brand-ink">Tài khoản này không có quyền truy cập trang này.</p>
        <p className="text-sm text-brand-ink-soft">Vai trò hiện tại: {user.role}</p>
        <Button variant="secondary" onClick={() => void logout()}>
          Đăng xuất
        </Button>
      </div>
    )
  }

  return <>{children}</>
}
