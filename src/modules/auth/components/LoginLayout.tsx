import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/shared/components/layout/Logo'
import bannerUrl from '@/assets/banner-dang-nhap.png'

export function LoginLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-app-bg px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-sm md:grid-cols-2">
        <div className="hidden md:block">
          <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
        </div>

        <div className="flex flex-col justify-center p-8 sm:p-10">
          <Link to="/" className="mb-6">
            <Logo />
          </Link>
          <h1 className="text-xl font-bold text-brand-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-brand-ink-soft">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
