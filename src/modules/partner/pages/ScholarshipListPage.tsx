import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PartnerLayout } from '@/modules/partner/components/PartnerLayout'
import { MANAGEMENT_NAV } from '@/modules/partner/components/nav'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Pagination } from '@/shared/components/ui/Pagination'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/shared/components/ui/Table'
import { CheckboxFilterDropdown } from '@/shared/components/ui/CheckboxFilterDropdown'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { ScholarshipStatusBadge } from '@/modules/partner/components/ScholarshipStatusBadge'
import { usePartnerProfile } from '@/modules/partner/PartnerProfileContext'
import { scholarshipsApi } from '@/modules/partner/api/scholarships.api'
import { partnerProfileApi } from '@/modules/partner/api/partnerProfile.api'
import type { PartnerStatsByProgram, Scholarship } from '@/modules/partner/types'
import { formatCurrencyVnd, formatDate } from '@/shared/lib/format'
import { downloadBlob } from '@/shared/lib/download'
import { IconDownload, IconSearch } from '@/modules/partner/components/icons'
import { IconPencil } from '@/modules/mentor/components/icons'
import { IconTrash } from '@/modules/mentors/cart/icons'

const PAGE_SIZE = 8

const STATUS_OPTIONS = [
  { value: 'open', label: 'Đang mở đơn', dotClassName: 'bg-emerald-500' },
  { value: 'closed', label: 'Đã đóng đơn', dotClassName: 'bg-slate-400' },
]

type SortField = 'title' | 'deadline' | 'applications_count' | 'total_budget'
type SortOrder = 'asc' | 'desc'

interface SortConfig {
  field: SortField | null
  order: SortOrder
}

// Icon Lịch cho Input Ngày
function IconCalendar({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  )
}

export function ScholarshipListPage() {
  const { profile } = usePartnerProfile()
  const { notify } = useToast()
  const [items, setItems] = useState<Scholarship[]>([])
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  // Rỗng hoặc chọn cả 2 = không lọc; API chỉ nhận đúng 1 giá trị boolean is_active.
  const isActiveParam = statusFilter.length === 1 ? statusFilter[0] === 'open' : undefined

  // State Ngày bắt đầu & kết thúc (dạng "YYYY-MM-DD")
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')

  const [loading, setLoading] = useState(true)
  const [byProgram, setByProgram] = useState<Record<string, PartnerStatsByProgram>>({})
  const [exporting, setExporting] = useState(false)

  // State Sắp xếp cột
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: null,
    order: 'asc',
  })

  useEffect(() => {
    if (!profile) return
    setLoading(true)
    scholarshipsApi
      .list({
        partner_profile_id: profile.id,
        q: q || undefined,
        is_active: isActiveParam,
        page,
        limit: PAGE_SIZE,
      })
      .then((res) => {
        setItems(res.items)
        setPages(res.pagination.pages)
      })
      .finally(() => setLoading(false))
  }, [profile, q, isActiveParam, page])

  useEffect(() => {
    if (!profile) return
    partnerProfileApi.getStats().then((stats) => {
      setByProgram(Object.fromEntries(stats.by_program.map((row) => [row.scholarship_id, row])))
    })
  }, [profile])

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => {
      if (prev.field === field) {
        if (prev.order === 'asc') return { field, order: 'desc' }
        return { field: null, order: 'asc' }
      }
      return { field, order: 'asc' }
    })
  }

  // Danh sách đã LỌC NẰM GỌN TRONG KHOẢNG NGÀY & SẮP XẾP
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items]

    // 1. Lọc nằm gọn 2 đầu theo ngày
    if (fromDate || toDate) {
      // Từ 00:00:00 của ngày bắt đầu
      const filterFromTime = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null
      // Đến 23:59:59 của ngày kết thúc
      const filterToTime = toDate ? new Date(`${toDate}T23:59:59.999`).getTime() : null

      result = result.filter((item) => {
        const itemStartTime = item.start_date
          ? new Date(item.start_date).getTime()
          : item.deadline
          ? new Date(item.deadline).getTime()
          : null

        const itemEndTime = item.deadline ? new Date(item.deadline).getTime() : null

        if (filterFromTime !== null) {
          if (itemStartTime === null || itemStartTime < filterFromTime) return false
        }

        if (filterToTime !== null) {
          if (itemEndTime === null || itemEndTime > filterToTime) return false
        }

        return true
      })
    }

    // 2. Sắp xếp
    if (!sortConfig.field) return result

    return result.sort((a, b) => {
      let aVal: number | string = 0
      let bVal: number | string = 0

      switch (sortConfig.field) {
        case 'title':
          return sortConfig.order === 'asc'
            ? (a.title || '').localeCompare(b.title || '', 'vi')
            : (b.title || '').localeCompare(a.title || '', 'vi')

        case 'deadline':
          aVal = a.deadline ? new Date(a.deadline).getTime() : 0
          bVal = b.deadline ? new Date(b.deadline).getTime() : 0
          break

        case 'applications_count':
          aVal = byProgram[a.id]?.applications_count ?? 0
          bVal = byProgram[b.id]?.applications_count ?? 0
          break

        case 'total_budget':
          aVal = a.total_budget ?? 0
          bVal = b.total_budget ?? 0
          break
      }

      if (aVal < bVal) return sortConfig.order === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.order === 'asc' ? 1 : -1
      return 0
    })
  }, [items, fromDate, toDate, sortConfig, byProgram])

  const handleDelete = async (s: Scholarship) => {
    if (!window.confirm(`Xoá học bổng "${s.title}"? Hành động này không thể hoàn tác.`)) return
    try {
      await scholarshipsApi.remove(s.id)
      notify('Đã xoá học bổng thành công.')
      setItems((prev) => prev.filter((it) => it.id !== s.id))
    } catch {
      notify('Không thể xoá học bổng. Vui lòng thử lại.', 'error')
    }
  }

  const clearDateFilter = () => {
    setFromDate('')
    setToDate('')
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await scholarshipsApi.exportOwn({
        q: q || undefined,
        is_active: isActiveParam,
        from: fromDate || undefined,
        to: toDate || undefined,
      })
      downloadBlob(blob, 'danh-sach-hoc-bong.xlsx')
    } catch {
      notify('Không thể xuất file Excel. Vui lòng thử lại.', 'error')
    } finally {
      setExporting(false)
    }
  }

  return (
    <PartnerLayout nav={MANAGEMENT_NAV}>
      {/* Header Trang */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-ink">Quản lý học bổng</h1>
          <p className="mt-1 text-sm text-brand-ink-soft">
            Quản lý, tạo mới và theo dõi tất cả chương trình học bổng của bạn
          </p>
        </div>
        <Link to="/doi-tac/hoc-bong/moi">
          <Button className="shadow-sm transition-all hover:shadow">
            Đăng tải học bổng mới
          </Button>
        </Link>
      </div>

      {/* Thanh Lọc & Tìm kiếm */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
        {/* Tìm kiếm */}
        <div className="relative min-w-[200px] flex-1">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-10 h-10 rounded-xl"
            placeholder="Tìm kiếm học bổng"
            value={q}
            onChange={(e) => {
              setPage(1)
              setQ(e.target.value)
            }}
          />
        </div>

        {/* Lọc Trạng thái */}
        <CheckboxFilterDropdown
          label="Trạng thái"
          options={STATUS_OPTIONS}
          selected={statusFilter}
          onChange={(next) => {
            setPage(1)
            setStatusFilter(next)
          }}
        />

        {/* --- CHỈ CHỌN NGÀY (CHỈNH SỬA TYPE="DATE") --- */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/60 p-1">
          {/* Ô chọn từ ngày */}
          <div className="relative flex items-center">
            <IconCalendar className="pointer-events-none absolute left-3 size-4 text-slate-400" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-9 w-[150px] rounded-lg border border-slate-200 bg-white pl-9 pr-2 text-xs font-medium text-slate-700 shadow-2xs transition-all focus:border-brand-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue-500/20"
              title="Từ ngày"
            />
          </div>

          <span className="text-xs font-semibold text-slate-400 px-0.5">→</span>

          {/* Ô chọn đến ngày */}
          <div className="relative flex items-center">
            <IconCalendar className="pointer-events-none absolute left-3 size-4 text-slate-400" />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-9 w-[150px] rounded-lg border border-slate-200 bg-white pl-9 pr-2 text-xs font-medium text-slate-700 shadow-2xs transition-all focus:border-brand-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue-500/20"
              title="Đến ngày"
            />
          </div>

          {/* Nút xóa nhanh khi đã chọn ngày */}
          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={clearDateFilter}
              className="ml-1 flex h-7 items-center gap-1 rounded-md bg-slate-200/80 px-2 text-xs font-medium text-slate-600 transition-all hover:bg-red-100 hover:text-red-600"
              title="Xóa bộ lọc ngày"
            >
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Xóa</span>
            </button>
          )}
        </div>

        {/* Nút Xuất báo cáo */}
        <Button
          variant="secondary"
          className="ml-auto h-10 rounded-xl"
          icon={<IconDownload className="size-4" />}
          loading={exporting}
          onClick={handleExport}
        >
          Xuất báo cáo
        </Button>
      </div>

      {/* Bảng Dữ liệu */}
      <Table
        loading={loading}
        empty={
          filteredAndSortedItems.length === 0 ? (
            <EmptyState
              title="Không tìm thấy học bổng"
              description={
                fromDate || toDate || statusFilter.length > 0 || q
                  ? 'Không có học bổng nào nằm gọn hoàn toàn trong khoảng ngày đã chọn.'
                  : 'Đăng học bổng đầu tiên để bắt đầu tiếp cận ứng viên.'
              }
              action={
                <Link to="/doi-tac/hoc-bong/moi">
                  <Button size="sm">Đăng tải học bổng mới</Button>
                </Link>
              }
            />
          ) : undefined
        }
      >
        <TableHead>
          <tr>
            <TableHeaderCell sortable sortActive={sortConfig.field === 'title'} sortOrder={sortConfig.order} onSort={() => handleSort('title')}>
              Chương trình học bổng
            </TableHeaderCell>
            <TableHeaderCell
              sortable
              sortActive={sortConfig.field === 'deadline'}
              sortOrder={sortConfig.order}
              onSort={() => handleSort('deadline')}
            >
              Thời gian & Trạng thái
            </TableHeaderCell>
            <TableHeaderCell
              align="center"
              sortable
              sortActive={sortConfig.field === 'applications_count'}
              sortOrder={sortConfig.order}
              onSort={() => handleSort('applications_count')}
            >
              Số hồ sơ ứng tuyển
            </TableHeaderCell>
            <TableHeaderCell
              align="right"
              sortable
              sortActive={sortConfig.field === 'total_budget'}
              sortOrder={sortConfig.order}
              onSort={() => handleSort('total_budget')}
            >
              Tổng ngân sách
            </TableHeaderCell>
            <TableHeaderCell align="right">Thao tác</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {filteredAndSortedItems.map((s) => {
            const appsCount = byProgram[s.id]?.applications_count ?? '—'
            return (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200/60 bg-slate-100">
                      {s.image_url ? (
                        <img src={s.image_url} alt="" className="size-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </div>
                    <span className="max-w-xs truncate font-medium text-brand-ink sm:max-w-sm">{s.title}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <ScholarshipStatusBadge scholarship={s} />
                    <span className="text-xs text-brand-ink-soft">
                      {s.start_date ? `${formatDate(s.start_date)} – ${formatDate(s.deadline)}` : `Hạn nộp: ${formatDate(s.deadline)}`}
                    </span>
                  </div>
                </TableCell>

                <TableCell align="center" className="font-medium">
                  {appsCount}
                </TableCell>

                <TableCell align="right">{formatCurrencyVnd(s.total_budget)}</TableCell>

                <TableCell align="right">
                  <div className="inline-flex items-center justify-end gap-1.5">
                    <Link
                      to={`/doi-tac/hoc-bong/${s.id}/sua`}
                      aria-label="Sửa"
                      title="Sửa"
                      className="flex size-8 items-center justify-center rounded-lg text-brand-blue-600 transition-colors hover:bg-brand-blue-50"
                    >
                      <IconPencil className="size-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(s)}
                      aria-label="Xoá"
                      title="Xoá"
                      className="flex size-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                    >
                      <IconTrash className="size-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {/* Phân trang */}
      <div className="mt-6">
        <Pagination page={page} pages={pages} onChange={setPage} />
      </div>
    </PartnerLayout>
  )
}