import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { useCandidateProfile } from '@/modules/candidate/CandidateProfileContext'
import { useAuth } from '@/modules/auth/AuthContext'
import { CANDIDATE_ACCOUNT_NAV } from '@/modules/candidate/components/nav'

export function CandidateSidebar() {
  const location = useLocation()
  const { profile } = useCandidateProfile()
  const { user, logout } = useAuth()
  const { notify } = useToast()

  const displayName = profile?.full_name || user?.email || 'Ứng viên'
  const shortId = profile ? profile.id.slice(0, 8).toUpperCase() : null

  return (
    <aside className="w-full shrink-0 space-y-4 lg:w-[280px]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
        <div className="mx-auto mb-3 size-14 overflow-hidden rounded-full bg-slate-200">
          {profile?.avatar_url && <img src={profile.avatar_url} alt="" className="size-full object-cover" />}
        </div>
        <p className="font-semibold text-brand-ink">{displayName}</p>
        <p className="text-xs text-emerald-600">{user?.is_email_verified ? 'Tài khoản đã xác thực' : 'Chưa xác thực email'}</p>
        <p className="mt-1 text-xs text-brand-ink-soft">
          {shortId && `ID ${shortId} | `}
          {user?.email}
        </p>
      </div>

      <nav className="space-y-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        {CANDIDATE_ACCOUNT_NAV.map((item) => {
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

      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <button
          type="button"
          onClick={() => notify('Tính năng chuyển đổi sang tài khoản mentor sẽ sớm ra mắt.', 'success')}
          className="w-full rounded-xl bg-brand-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-600"
        >
          Chuyển sang tài khoản mentor
        </button>
        <button
          type="button"
          onClick={() => void logout()}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-brand-ink-soft hover:bg-slate-50"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
