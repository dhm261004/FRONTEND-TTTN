import type { ReactNode } from 'react'
import { SiteHeader } from '@/shared/components/layout/SiteHeader'
import { SiteFooter } from '@/shared/components/layout/SiteFooter'
import { CandidateSidebar } from '@/modules/candidate/components/CandidateSidebar'
import { useAuth } from '@/modules/auth/AuthContext'

export function CandidateLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-svh flex-col bg-app-bg">
      <SiteHeader
        navItems={[
          { label: 'Học bổng', to: '/hoc-bong' },
          { label: 'Mentor', to: '/mentor' },
          { label: 'Skola Vip', to: '/hoc-bong', tone: 'vip' },
        ]}
        userLabel={user?.email}
        onLogout={() => void logout()}
        accountTo="/tai-khoan"
      />
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-6 py-8 lg:flex-row">
        <CandidateSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <SiteFooter />
    </div>
  )
}
