import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PartnerLayout } from '@/modules/partner/components/PartnerLayout'
import { MANAGEMENT_NAV } from '@/modules/partner/components/nav'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Pagination } from '@/shared/components/ui/Pagination'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { ScholarshipStatusBadge } from '@/modules/partner/components/ScholarshipStatusBadge'
import { usePartnerProfile } from '@/modules/partner/PartnerProfileContext'
import { scholarshipsApi } from '@/modules/partner/api/scholarships.api'
import { partnerProfileApi } from '@/modules/partner/api/partnerProfile.api'
import type { PartnerStatsByProgram, Scholarship } from '@/modules/partner/types'
import { formatCurrencyVnd, formatDate } from '@/shared/lib/format'
import { IconDownload, IconSearch } from '@/modules/partner/components/icons'

const PAGE_SIZE = 8

type StatusFilter = 'all' | 'open' | 'closed'

export function ScholarshipListPage() {
  const { profile } = usePartnerProfile()
  const { notify } = useToast()
  const [items, setItems] = useState<Scholarship[]>([])
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [loading, setLoading] = useState(true)
  const [byProgram, setByProgram] = useState<Record<string, PartnerStatsByProgram>>({})

  useEffect(() => {
    if (!profile) return
    setLoading(true)
    scholarshipsApi
      .list({
        partner_profile_id: profile.id,
        q: q || undefined,
        is_active: status === 'all' ? undefined : status === 'open',
        page,
        limit: PAGE_SIZE,
      })
      .then((res) => {
        setItems(res.items)
        setPages(res.pagination.pages)
      })
      .finally(() => setLoading(false))
  }, [profile, q, status, page])

  useEffect(() => {
    if (!profile) return
    partnerProfileApi.getStats().then((stats) => {
      setByProgram(Object.fromEntries(stats.by_program.map((row) => [row.scholarship_id, row])))
    })
  }, [profile])

  const handleDelete = async (s: Scholarship) => {
    if (!window.confirm(`Xoá học bổng "${s.title}"? Hành động này không thể hoàn tác.`)) return
    try {
      await scholarshipsApi.remove(s.id)
      notify('Đã xoá học bổng.')
      setItems((prev) => prev.filter((it) => it.id !== s.id))
    } catch {
      notify('Không thể xoá học bổng. Vui lòng thử lại.', 'error')
    }
  }

  return (
    <PartnerLayout nav={MANAGEMENT_NAV}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">Quản lý học bổng</h1>
          <p className="text-sm text-brand-ink-soft">Quản lý, tạo mới và theo dõi tất cả chương trình học bổng của bạn</p>
        </div>
        <Link to="/doi-tac/hoc-bong/moi">
          <Button>Đăng tải học bổng mới</Button>
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-10"
            placeholder="Tìm kiếm học bổng"
            value={q}
            onChange={(e) => {
              setPage(1)
              setQ(e.target.value)
            }}
          />
        </div>
        <Select
          className="w-48"
          value={status}
          onChange={(e) => {
            setPage(1)
            setStatus(e.target.value as StatusFilter)
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="open">Đang mở đơn</option>
          <option value="closed">Đã đóng đơn</option>
        </Select>
        <Button
          variant="secondary"
          icon={<IconDownload className="size-4" />}
          onClick={() => notify('Xuất báo cáo chưa được hỗ trợ ở phiên bản hiện tại.', 'error')}
        >
          Xuất báo cáo
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyState
            title="Chưa có học bổng nào"
            description="Đăng học bổng đầu tiên để bắt đầu tiếp cận ứng viên."
            action={
              <Link to="/doi-tac/hoc-bong/moi">
                <Button size="sm">Đăng tải học bổng mới</Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-blue-50/60 text-brand-ink-soft">
                <tr>
                  <th className="px-5 py-3 font-medium">Tên</th>
                  <th className="px-5 py-3 font-medium">Thời gian</th>
                  <th className="px-5 py-3 font-medium">Ảnh</th>
                  <th className="px-5 py-3 font-medium">Tổng ngân sách</th>
                  <th className="px-5 py-3 font-medium">Số hồ sơ ứng tuyển</th>
                  <th className="px-5 py-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((s) => (
                  <tr key={s.id}>
                    <td className="max-w-xs px-5 py-4 font-medium text-brand-ink">
                      <span className="truncate">{s.title}</span>
                    </td>
                    <td className="px-5 py-4 text-brand-ink-soft">
                      <div>{s.start_date ? `${formatDate(s.start_date)} – ${formatDate(s.deadline)}` : `Hạn nộp: ${formatDate(s.deadline)}`}</div>
                      <div className="mt-1">
                        <ScholarshipStatusBadge scholarship={s} />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                        {s.image_url ? (
                          <img src={s.image_url} alt="" className="size-full object-cover" />
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-brand-ink-soft">{formatCurrencyVnd(s.total_budget)}</td>
                    <td className="px-5 py-4 text-brand-ink-soft">
                      {byProgram[s.id] ? byProgram[s.id].applications_count : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/doi-tac/ho-so-ung-vien?scholarship_id=${s.id}`}
                          className="text-brand-blue-600 hover:underline"
                        >
                          Ứng viên
                        </Link>
                        <Link
                          to={`/doi-tac/hoc-bong/${s.id}/sua`}
                          className="text-brand-blue-600 hover:underline"
                          aria-label="Chỉnh sửa"
                        >
                          Sửa
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(s)}
                          className="text-red-500 hover:underline"
                        >
                          Xoá
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Pagination page={page} pages={pages} onChange={setPage} />
      </div>
    </PartnerLayout>
  )
}
