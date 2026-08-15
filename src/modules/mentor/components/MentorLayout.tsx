import type { ReactNode } from 'react'
import { SiteHeader } from '@/shared/components/layout/SiteHeader'
import { SiteFooter } from '@/shared/components/layout/SiteFooter'
import { MentorSidebar } from '@/modules/mentor/components/MentorSidebar'
import { RequireMentorProfile } from '@/modules/mentor/components/RequireMentorProfile'
import { useAuth } from '@/modules/auth/AuthContext'

export function MentorLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <RequireMentorProfile>
      <div className="flex min-h-svh flex-col bg-app-bg">
        <SiteHeader
          navItems={[
            { label: 'Bảng điều khiển', to: '/co-van', active: true },
            { label: 'Skola Vip', to: '/skola-vip?tab=mentor', tone: 'vip' },
          ]}
          userLabel={user?.email}
          onLogout={logout}
          accountTo="/co-van"
        />
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-6 py-8 lg:flex-row">
          <MentorSidebar />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
        <SiteFooter />
      </div>
    </RequireMentorProfile>
  )
}
