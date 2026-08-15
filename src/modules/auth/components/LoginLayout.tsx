import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/shared/components/layout/Logo'
import bannerUrl from '@/assets/banner-dang-nhap.png'

export function LoginLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-app-bg px-4 py-4 sm:py-6">
      {/* Khung tổng: Rộng 1080px (rộng hơn), Cao 560px (gọn hơn, chống tràn) */}
      <div className="flex w-full max-w-[1080px] overflow-hidden rounded-3xl bg-white shadow-sm md:h-[560px]">
        
        {/* Cột trái: Cố định rộng 543px, h-full ăn theo chiều cao 560px của card */}
        <div className="hidden shrink-0 w-[543px] h-full overflow-hidden bg-brand-blue-400 md:block">
          <img 
            src={bannerUrl} 
            alt="SKOLA Banner" 
            className="h-full w-full object-cover object-center"
          />
        </div>

        {/* Cột phải: Rộng ~537px, khoảng cách dọc gọn gàng hơn */}
        <div className="flex flex-1 flex-col justify-center px-8 py-6 sm:px-12 md:px-14 overflow-y-auto">
          <Link to="/" className="mb-4 inline-block">
            <Logo className="h-7" />
          </Link>
          
          <h1 className="text-xl font-bold text-brand-ink">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-brand-ink-soft">{subtitle}</p>}
          
          <div className="mt-4">{children}</div>
        </div>

      </div>
    </div>
  )
}