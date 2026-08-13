import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PartnerLayout } from '@/modules/partner/components/PartnerLayout'
import { MANAGEMENT_NAV } from '@/modules/partner/components/nav'
import { Button } from '@/shared/components/ui/Button'
import { Select } from '@/shared/components/ui/Select'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { StatCard } from '@/modules/partner/components/StatCard'
import { HorizontalBarChart } from '@/shared/components/charts/HorizontalBarChart'
import { StatusBreakdownBar } from '@/shared/components/charts/StatusBreakdownBar'
import { ScholarshipStatusBadge, getScholarshipStatus } from '@/modules/partner/components/ScholarshipStatusBadge'
import { usePartnerProfile } from '@/modules/partner/PartnerProfileContext'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { scholarshipsApi } from '@/modules/partner/api/scholarships.api'
import { partnerProfileApi } from '@/modules/partner/api/partnerProfile.api'
import type { PartnerStats, Scholarship } from '@/modules/partner/types'
import { formatDate } from '@/shared/lib/format'
import { downloadBlob } from '@/shared/lib/download'
import {
  IconBriefcase,
  IconCheckCircle,
  IconClock,
  IconDownload,
  IconGraduationCap,
  IconIdCard,
  IconXCircle,
} from '@/modules/partner/components/icons'

function recentMonthOptions(count = 12) {
  const now = new Date()
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return { value, label: `Tháng ${d.getMonth() + 1}/${d.getFullYear()}` }
  })
}

function monthToRange(value: string): { from?: string; to?: string } {
  if (!value) return {}
  const [year, month] = value.split('-').map(Number)
  return {
    from: new Date(Date.UTC(year, month - 1, 1, 0, 0, 0)).toISOString(),
    to: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString(),
  }
}

export function DashboardPage() {
  const { profile } = usePartnerProfile()
  const { notify } = useToast()
  const [scholarships, setScholarships] = useState<Scholarship[] | null>(null)
  const [stats, setStats] = useState<PartnerStats | null>(null)
  const [scholarshipFilter, setScholarshipFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [exporting, setExporting] = useState(false)

  const monthOptions = useMemo(() => recentMonthOptions(), [])

  useEffect(() => {
    if (!profile) return
    scholarshipsApi.list({ partner_profile_id: profile.id, limit: 100 }).then((res) => setScholarships(res.items))
  }, [profile])

  useEffect(() => {
    if (!profile) return
    setStats(null)
    partnerProfileApi
      .getStats({ scholarship_id: scholarshipFilter || undefined, ...monthToRange(monthFilter) })
      .then(setStats)
  }, [profile, scholarshipFilter, monthFilter])

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await partnerProfileApi.exportStats({ scholarship_id: scholarshipFilter || undefined, ...monthToRange(monthFilter) })
      downloadBlob(blob, 'thong-ke-doi-tac.xlsx')
    } catch {
      notify('Không thể xuất file Excel. Vui lòng thử lại.', 'error')
    } finally {
      setExporting(false)
    }
  }

  const scopedScholarships = scholarshipFilter ? (scholarships ?? []).filter((s) => s.id === scholarshipFilter) : scholarships ?? []

  const total = scopedScholarships.length
  const open = scopedScholarships.filter((s) => getScholarshipStatus(s).label === 'Đang mở đơn').length
  const closed = total - open
  const upcoming = scopedScholarships
    .filter((s) => getScholarshipStatus(s).label === 'Đang mở đơn')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5)

  return (
    <PartnerLayout nav={MANAGEMENT_NAV}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">Tổng quan thống kê</h1>
          <p className="text-sm text-brand-ink-soft">
            Cập nhật lần cuối: {new Intl.DateTimeFormat('vi-VN').format(new Date())}
          </p>
        </div>
        <Button variant="secondary" icon={<IconDownload className="size-4" />} loading={exporting} onClick={handleExport}>
          Xuất báo cáo
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Select className="w-64" value={scholarshipFilter} onChange={(e) => setScholarshipFilter(e.target.value)}>
          <option value="">Tất cả chương trình</option>
          {(scholarships ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </Select>
        <Select className="w-48" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
          <option value="">Tất cả thời gian</option>
          {monthOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        {(scholarshipFilter || monthFilter) && (
          <button
            type="button"
            onClick={() => {
              setScholarshipFilter('')
              setMonthFilter('')
            }}
            className="text-sm text-brand-blue-600 hover:underline"
          >
            Xoá bộ lọc
          </button>
        )}
      </div>

      {scholarships === null ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={IconGraduationCap} tone="blue" label="Tổng số học bổng" value={String(total)} />
            <StatCard icon={IconCheckCircle} tone="green" label="Đang mở đơn" value={String(open)} />
            <StatCard icon={IconXCircle} tone="slate" label="Đã đóng đơn" value={String(closed)} />
            <StatCard icon={IconBriefcase} tone="amber" label="Học bổng đã đăng" value={String(total)} />
          </div>

          {stats === null ? (
            <Spinner />
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard icon={IconIdCard} tone="blue" label="Tổng hồ sơ ứng tuyển" value={String(stats.total_applications)} />
              <StatCard icon={IconClock} tone="amber" label="Chờ xét duyệt" value={String(stats.pending_applications)} />
              <StatCard icon={IconCheckCircle} tone="green" label="Đã được chọn" value={String(stats.selected_applications)} />
              <StatCard icon={IconXCircle} tone="red" label="Bị từ chối" value={String(stats.rejected_applications)} />
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-brand-ink">Học bổng sắp hết hạn</h2>
            {upcoming.length === 0 ? (
              <EmptyState
                title="Chưa có học bổng đang mở đơn"
                description="Đăng học bổng mới để bắt đầu tiếp cận ứng viên."
                action={
                  <Link to="/doi-tac/hoc-bong/moi">
                    <Button size="sm">Đăng tải học bổng mới</Button>
                  </Link>
                }
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {upcoming.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium text-brand-ink">{s.title}</p>
                      <p className="text-xs text-brand-ink-soft">Hạn nộp: {formatDate(s.deadline)}</p>
                    </div>
                    <ScholarshipStatusBadge scholarship={s} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {stats !== null && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-brand-ink">Tình trạng hồ sơ ứng tuyển</h2>
              <StatusBreakdownBar
                total={stats.total_applications}
                segments={[
                  { key: 'pending', label: 'Chờ xét duyệt', value: stats.pending_applications, barClass: 'bg-amber-500', swatchClass: 'bg-amber-500' },
                  { key: 'selected', label: 'Đã được chọn', value: stats.selected_applications, barClass: 'bg-emerald-500', swatchClass: 'bg-emerald-500' },
                  { key: 'rejected', label: 'Bị từ chối', value: stats.rejected_applications, barClass: 'bg-red-500', swatchClass: 'bg-red-500' },
                ]}
              />
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-brand-ink">So sánh hồ sơ theo chương trình</h2>
              {stats === null ? (
                <Spinner />
              ) : (
                <HorizontalBarChart
                  color="blue"
                  data={[...stats.by_program]
                    .sort((a, b) => b.applications_count - a.applications_count)
                    .slice(0, 8)
                    .map((row) => ({ label: row.title, value: row.applications_count }))}
                  emptyLabel="Chưa có hồ sơ ứng tuyển nào."
                />
              )}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-brand-ink">Phân bổ theo trường đại học</h2>
              {stats === null ? (
                <Spinner />
              ) : (
                <HorizontalBarChart
                  color="green"
                  data={[...stats.by_university]
                    .sort((a, b) => b.selected_count - a.selected_count)
                    .slice(0, 8)
                    .map((row) => ({ label: row.university, value: row.selected_count }))}
                  emptyLabel="Chưa có hồ sơ nào được chọn."
                />
              )}
            </div>
          </div>
        </div>
      )}
    </PartnerLayout>
  )
}
