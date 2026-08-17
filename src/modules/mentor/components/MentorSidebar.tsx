import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import { useMentorProfile } from '@/modules/mentor/MentorProfileContext'
import { useAuth } from '@/modules/auth/AuthContext'
import { VipBadge, isVipActive } from '@/shared/components/ui/VipBadge'
import { MENTOR_NAV } from '@/modules/mentor/components/nav'

export function MentorSidebar() {
  const location = useLocation()
  const { profile } = useMentorProfile()
  const { user } = useAuth()

  const displayName = profile?.full_name || profile?.job_title || user?.email || 'Mentor'
  const shortId = profile ? profile.id.slice(0, 8).toUpperCase() : null
  const vip = isVipActive(profile?.vip_expires_at)

  return (
    <aside className="w-full shrink-0 space-y-4 lg:w-[280px]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
        <div className="mx-auto mb-3 size-14 overflow-hidden rounded-full bg-slate-200">
          {profile?.avatar_url && <img src={profile.avatar_url} alt="" className="size-full object-cover" />}
        </div>
        <p className="font-semibold text-brand-ink">{displayName}</p>
        <p className="text-xs text-brand-ink-soft">{shortId ? `ID ${shortId}` : 'Mentor'}</p>
        {vip ? (
          <VipBadge expiresAt={profile?.vip_expires_at} className="mt-3" />
        ) : (
          <Link
            to="/skola-vip?tab=mentor"
            className="mt-4 block w-full rounded-xl bg-brand-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-600"
          >
            Nâng cấp Skola VIP
          </Link>
        )}
      </div>

      <nav className="space-y-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        {MENTOR_NAV.map((item) => {
          const active = location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 rounded-xl border-l-4 px-3 py-2.5 text-sm transition-colors',
                active
                  ? 'border-brand-blue-500 bg-brand-blue-50 font-semibold text-brand-blue-600'
                  : 'border-transparent text-brand-ink-soft hover:bg-slate-50',
              )}
            >
              <item.icon className="size-[18px] shrink-0" />
              <span className="flex-1">{item.label}</span>
              {!item.supported && (
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-400">sắp có</span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
