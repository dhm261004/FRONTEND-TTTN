import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { usePartnerProfile } from '@/modules/partner/PartnerProfileContext'
import { useAuth } from '@/modules/auth/AuthContext'
import type { PartnerNavItem } from '@/modules/partner/components/nav'

export function PartnerSidebar({ items }: { items: PartnerNavItem[] }) {
  const location = useLocation()
  const { profile } = usePartnerProfile()
  const { user } = useAuth()
  const { notify } = useToast()

  const displayName = profile?.company_name || user?.email || 'Nhà tài trợ'
  const shortId = profile ? profile.id.slice(0, 8).toUpperCase() : null

  return (
    <aside className="w-full shrink-0 space-y-4 lg:w-[280px]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
        <div className="mx-auto mb-3 size-14 overflow-hidden rounded-full bg-slate-200">
          {profile?.logo_url && (
            <img src={profile.logo_url} alt="" className="size-full object-cover" />
          )}
        </div>
        <p className="font-semibold text-brand-ink">{displayName}</p>
        <p className="text-xs text-brand-ink-soft">{shortId ? `ID ${shortId}` : 'Nhà tài trợ'}</p>
        <button
          type="button"
          onClick={() => notify('Skola VIP sẽ sớm ra mắt.', 'success')}
          className="mt-4 w-full rounded-xl bg-brand-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-600"
        >
          Nâng cấp Skola VIP
        </button>
      </div>

      <nav className="space-y-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        {items.map((item) => {
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
