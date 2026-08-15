import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PublicHeader } from '@/modules/scholarships/components/PublicHeader'
import { SiteFooter } from '@/shared/components/layout/SiteFooter'
import { MentorCard } from '@/modules/mentors/components/MentorCard'
import { Pagination } from '@/shared/components/ui/Pagination'
import { Spinner } from '@/shared/components/ui/Spinner'
import { IconSearch, IconSparkle, IconUsers } from '@/modules/mentor/components/icons'
import { mentorsApi } from '@/modules/mentors/api/mentors.api'
import type { MentorProfile } from '@/modules/mentor/types'

const PAGE_SIZE = 12

export function MentorListPage() {
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<MentorProfile[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 350)
    return () => clearTimeout(timer)
  }, [q])

  useEffect(() => {
    setPage(1)
  }, [debouncedQ])

  useEffect(() => {
    setLoading(true)
    void mentorsApi
      .list({ q: debouncedQ || undefined, page, limit: PAGE_SIZE })
      .then((res) => {
        setItems(res.items)
        setPages(res.pagination.pages)
        setTotal(res.pagination.total)
      })
      .finally(() => setLoading(false))
  }, [debouncedQ, page])

  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <PublicHeader active="mentor" />

      {/* HERO SECTION - Sửa lại dải màu gradient và khoảng cách */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-blue-700 via-brand-blue-600 to-brand-blue-500 pb-32 pt-16">
        {/* Lớp trang trí (z-0 để không đè lên chữ) */}
        <div className="pointer-events-none absolute -left-10 top-4 z-0 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute bottom-0 right-10 z-0 size-52 rounded-full bg-white/10 blur-3xl" />

        {/* Nội dung Hero (z-10 để luôn nằm trên các hình tròn trang trí) */}
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center text-white">
          <p className="mb-4 text-sm text-blue-100">
            <Link to="/" className="hover:text-white hover:underline transition-colors">
              Trang chủ
            </Link>{' '}
            <span className="mx-2 opacity-60">›</span> <span className="font-medium text-white">Mentor</span>
          </p>
          
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md">
            <IconSparkle className="size-4 text-yellow-300" />
            Đội ngũ mentor giàu kinh nghiệm
          </span>
          
          <h1 className="mb-4 text-3xl font-black tracking-tight sm:text-5xl lg:leading-tight">
            Tìm mentor đồng hành <br className="hidden sm:block" /> cùng bạn
          </h1>
          
          <p className="mx-auto mt-4 max-w-2xl text-base text-blue-50 sm:text-lg">
            Trò chuyện 1:1 với những người đã đi trước — xin lời khuyên chọn ngành, chuẩn bị hồ sơ và săn học bổng đúng hướng ngay từ đầu.
          </p>

          {/* Thanh tìm kiếm */}
          <div className="mx-auto mt-8 max-w-lg">
            <div className="flex items-center gap-3 rounded-full bg-white p-2 pr-3 shadow-2xl ring-1 ring-black/5 transition-all focus-within:ring-2 focus-within:ring-brand-blue-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <IconSearch className="size-5" />
              </div>
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo tên hoặc chức danh..."
                className="h-10 min-w-0 flex-1 bg-transparent text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT - Sửa lại margin âm và Grid */}
      <div className="relative z-20 mx-auto -mt-16 w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Thanh trạng thái */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 text-sm shadow-lg ring-1 ring-slate-100">
          <span className="flex items-center gap-2.5 font-semibold text-slate-800">
            <div className="flex size-8 items-center justify-center rounded-full bg-brand-blue-50 text-brand-blue-600">
              <IconUsers className="size-4.5" />
            </div>
            {total != null ? (
              <span>Có <strong className="text-brand-blue-600">{total}</strong> mentor đang sẵn sàng hỗ trợ</span>
            ) : (
              'Đang tải danh sách mentor...'
            )}
          </span>
          {debouncedQ && (
            <span className="text-slate-500 font-medium">
              Kết quả cho <span className="text-slate-800 font-semibold">"{debouncedQ}"</span>
            </span>
          )}
        </div>

        {/* Danh sách Mentor */}
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
            <Spinner />
            <p className="text-sm text-slate-500 animate-pulse">Đang tìm kiếm mentor...</p>
          </div>
        ) : items.length === 0 ? (
          <MentorEmptyState hasQuery={Boolean(debouncedQ)} />
        ) : (
          <>
            {/* Cùng thiết kế thẻ mentor với trang chủ — 2 cột (mobile) -> 3 cột (tablet) -> tối đa 4 cột/hàng */}
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))}
            </div>
            
            {/* Phân trang */}
            {pages > 1 && (
              <div className="mt-14 flex justify-center">
                <Pagination page={page} pages={pages} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <SiteFooter />
    </div>
  )
}

function MentorEmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="mt-8 flex min-h-[350px] flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 px-6 py-16 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-brand-blue-50 text-brand-blue-500">
        <IconUsers className="size-10" />
      </div>
      <div>
        <h3 className="mb-1 text-lg font-bold text-slate-800">
          {hasQuery ? 'Không tìm thấy mentor phù hợp' : 'Chưa có mentor nào'}
        </h3>
        <p className="max-w-sm text-sm text-slate-500">
          {hasQuery 
            ? 'Thử sử dụng một từ khoá khác chung chung hơn, hoặc xoá từ khoá để xem toàn bộ danh sách.' 
            : 'Danh sách mentor đang được cập nhật và sẽ sớm ra mắt.'}
        </p>
      </div>
    </div>
  )
}