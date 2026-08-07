import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/shared/components/layout/Logo'
import { cn } from '@/shared/lib/cn'

interface NavItem {
  label: string
  to: string
  active?: boolean
  tone?: 'default' | 'vip'
}

interface SiteHeaderProps {
  navItems?: NavItem[]
  userLabel?: string
  onLogout?: () => void
  accountTo?: string
  /** Thay thế cụm chuông + avatar mặc định bên phải (dùng cho header công khai khi khách chưa đăng nhập). */
  rightContent?: ReactNode
}

export function SiteHeader({ navItems = [], userLabel, onLogout, accountTo = '/tai-khoan', rightContent }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link to="/">
            <Logo />
          </Link>
          <nav className="flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={cn(
                  'text-sm font-medium',
                  item.tone === 'vip'
                    ? 'font-bold text-brand-yellow-500'
                    : item.active
                      ? 'text-brand-blue-600'
                      : 'text-brand-ink-soft hover:text-brand-ink',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {rightContent ?? (
            <>
              <button
                type="button"
                aria-label="Thông báo"
                className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-brand-ink-soft hover:bg-slate-200"
              >
                <BellIcon />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex size-10 items-center justify-center rounded-full bg-slate-300 text-white"
                  aria-label="Tài khoản"
                >
                  <UserIcon />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                      {userLabel && (
                        <div className="px-3 py-2 text-xs text-brand-ink-soft">{userLabel}</div>
                      )}
                      <Link
                        to={accountTo}
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-brand-ink hover:bg-slate-50"
                      >
                        Tài khoản
                      </Link>
                      {onLogout && (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false)
                            onLogout()
                          }}
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50"
                        >
                          Đăng xuất
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" />
    </svg>
  )
}
