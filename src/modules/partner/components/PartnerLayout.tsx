import type { ReactNode } from 'react'
import { SiteHeader } from '@/shared/components/layout/SiteHeader'
import { SiteFooter } from '@/shared/components/layout/SiteFooter'
import { PartnerSidebar } from '@/modules/partner/components/PartnerSidebar'
import { RequirePartnerProfile } from '@/modules/partner/components/RequirePartnerProfile'
import type { PartnerNavItem } from '@/modules/partner/components/nav'
import { useAuth } from '@/modules/auth/AuthContext'

export function PartnerLayout({ nav, children }: { nav: PartnerNavItem[]; children: ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <RequirePartnerProfile>
      <div className="flex min-h-svh flex-col bg-app-bg">
        <SiteHeader
          navItems={[
            { label: 'Thống kê', to: '/doi-tac', active: true },
            { label: 'Skola Vip', to: '/doi-tac', tone: 'vip' },
          ]}
          userLabel={user?.email}
          onLogout={logout}
        />
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-6 py-8 lg:flex-row">
          <PartnerSidebar items={nav} />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
        <SiteFooter />
      </div>
    </RequirePartnerProfile>
  )
}
