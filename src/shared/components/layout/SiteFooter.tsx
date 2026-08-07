import { Logo } from '@/shared/components/layout/Logo'

const columns: { title: string; links: string[] }[] = [
  { title: 'Khám phá', links: ['Học bổng', 'Mentor', 'Nhà tài trợ', 'Sinh viên', 'Skola Vip', 'Sự kiện'] },
  {
    title: 'Dành cho sinh viên',
    links: ['Học bổng', 'Ứng tuyển học bổng', 'AI Match', 'Hồ sơ của tôi', 'Học bổng đã lưu', 'Lịch sử ứng tuyển'],
  },
  {
    title: 'Dành cho nhà tài trợ',
    links: ['Đăng tuyển học bổng', 'Tìm kiếm ứng viên', 'Bảng giá', 'Hợp tác cùng Skola'],
  },
  { title: 'Hỗ trợ', links: ['Trung tâm trợ giúp', 'Chính sách bảo mật', 'Điều khoản sử dụng', 'Liên hệ với chúng tôi'] },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-10 px-6 py-12 sm:grid-cols-3 lg:grid-cols-6">
        <div className="col-span-2">
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-brand-ink-soft">
            SKOLA là nền tảng kết nối sinh viên với các học bổng giá trị đến từ doanh nghiệp giúp đỡ bạn trên con
            đường học tập và phát triển sự nghiệp
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 text-sm font-semibold text-brand-ink">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link} className="text-sm text-brand-ink-soft">
                  {link}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="mb-3 text-sm font-semibold text-brand-ink">Kết nối</h3>
          <div className="flex flex-wrap gap-2">
            {['FB', 'TT', 'YT', 'IN', 'IG'].map((s) => (
              <span
                key={s}
                className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-semibold text-brand-ink-soft"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 px-6 py-4 text-xs text-brand-ink-soft">
        2026 - Bản quyền thuộc về Skola
      </div>
    </footer>
  )
}
