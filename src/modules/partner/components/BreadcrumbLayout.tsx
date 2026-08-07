import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { SiteHeader } from '@/shared/components/layout/SiteHeader'
import { SiteFooter } from '@/shared/components/layout/SiteFooter'
import { useAuth } from '@/modules/auth/AuthContext'

export interface Crumb {
  label: string
  to?: string
}

export function BreadcrumbLayout({ crumbs, children }: { crumbs: Crumb[]; children: ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-svh flex-col bg-app-bg">
      <SiteHeader
        navItems={[
          { label: 'Thống kê', to: '/doi-tac', active: true },
          { label: 'Skola Vip', to: '/doi-tac', tone: 'vip' },
        ]}
        userLabel={user?.email}
        onLogout={logout}
      />
      <div className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-6">
        <nav className="mb-4 flex items-center gap-2 text-sm text-brand-ink-soft">
          {crumbs.map((crumb, i) => (
            <span key={crumb.label} className="flex items-center gap-2">
              {i > 0 && <span>›</span>}
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-brand-ink">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-brand-ink">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
        {children}
      </div>
      <SiteFooter />
    </div>
  )
}
