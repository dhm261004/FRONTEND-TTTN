import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PartnerLayout } from '@/modules/partner/components/PartnerLayout'
import { MANAGEMENT_NAV } from '@/modules/partner/components/nav'
import { Select } from '@/shared/components/ui/Select'
import { Input } from '@/shared/components/ui/Input'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Pagination } from '@/shared/components/ui/Pagination'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/shared/components/ui/Table'
import { CheckboxFilterDropdown } from '@/shared/components/ui/CheckboxFilterDropdown'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { ApplicationStatusBadge } from '@/modules/partner/components/ApplicationStatusBadge'
import { StatCard } from '@/modules/partner/components/StatCard'
import { usePartnerProfile } from '@/modules/partner/PartnerProfileContext'
import { scholarshipsApi } from '@/modules/partner/api/scholarships.api'
import { applicationsApi } from '@/modules/partner/api/applications.api'
import { partnerProfileApi } from '@/modules/partner/api/partnerProfile.api'
import type { ApplicationSort, ApplicationStatus, ApplicationWithCandidate, PartnerStats, Scholarship } from '@/modules/partner/types'
import { certificateMatches, gpaRequirementCheck, majorsRequirementCheck, type RequirementResult } from '@/modules/partner/lib/requirementMatch'
import { formatDate } from '@/shared/lib/format'
import { downloadBlob } from '@/shared/lib/download'
import {
  IconCheckCircle,
  IconClock,
  IconDownload,
  IconSearch,
  IconWallet,
  IconXCircle,
} from '@/modules/partner/components/icons'

const PAGE_SIZE = 10

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ xét duyệt', dotClassName: 'bg-amber-500' },
  { value: 'won', label: 'Đã được chọn', dotClassName: 'bg-emerald-500' },
  { value: 'rejected', label: 'Bị từ chối', dotClassName: 'bg-red-500' },
]

const SORT_OPTIONS: { value: ApplicationSort; label: string; requiresCertificate?: boolean }[] = [
  { value: 'created_at_desc', label: 'Mới nộp trước' },
  { value: 'created_at_asc', label: 'Nộp lâu nhất trước' },
  { value: 'gpa_desc', label: 'GPA cao → thấp' },
  { value: 'gpa_asc', label: 'GPA thấp → cao' },
  { value: 'certificate_score_desc', label: 'Điểm chứng chỉ cao → thấp', requiresCertificate: true },
  { value: 'certificate_score_asc', label: 'Điểm chứng chỉ thấp → cao', requiresCertificate: true },
]

function candidateCode(candidateProfileId: string) {
  return `UV-${candidateProfileId.slice(0, 8).toUpperCase()}`
}

export function CandidatesPage() {
  const { profile } = usePartnerProfile()
  const { notify } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const [scholarships, setScholarships] = useState<Scholarship[] | null>(null)
  const [scholarshipId, setScholarshipId] = useState<string>(searchParams.get('scholarship_id') ?? '')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  // API chỉ nhận đúng 1 giá trị status; chọn 0 hoặc từ 2 trạng thái trở lên nghĩa là không lọc.
  const apiStatusFilter = statusFilter.length === 1 ? (statusFilter[0] as ApplicationStatus) : undefined
  const [certificateType, setCertificateType] = useState('')
  const [minScoreInput, setMinScoreInput] = useState('')
  const [minScore, setMinScore] = useState<number | undefined>(undefined)
  const [sort, setSort] = useState<ApplicationSort>('created_at_desc')
  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  const [items, setItems] = useState<ApplicationWithCandidate[]>([])
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selected, setSelected] = useState<ApplicationWithCandidate | null>(null)
  const [stats, setStats] = useState<PartnerStats | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (!profile) return
    scholarshipsApi.list({ partner_profile_id: profile.id, limit: 100 }).then((res) => {
      setScholarships(res.items)
      setScholarshipId((current) => current || res.items[0]?.id || '')
    })
  }, [profile])

  useEffect(() => {
    if (!scholarshipId) return
    setSearchParams({ scholarship_id: scholarshipId }, { replace: true })
  }, [scholarshipId, setSearchParams])

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      setQ(qInput.trim())
    }, 300)
    return () => clearTimeout(t)
  }, [qInput])

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      const parsed = Number(minScoreInput)
      setMinScore(minScoreInput.trim() && Number.isFinite(parsed) ? parsed : undefined)
    }, 300)
    return () => clearTimeout(t)
  }, [minScoreInput])

  useEffect(() => {
    if (certificateType) return
    setMinScoreInput('')
    setMinScore(undefined)
    setSort((current) => (SORT_OPTIONS.find((o) => o.value === current)?.requiresCertificate ? 'created_at_desc' : current))
  }, [certificateType])

  useEffect(() => {
    if (!scholarshipId) return
    setLoading(true)
    applicationsApi
      .listForScholarship(scholarshipId, {
        status: apiStatusFilter,
        certificate_type: certificateType || undefined,
        certificate_min_score: certificateType ? minScore : undefined,
        sort,
        q: q || undefined,
        page,
        limit: PAGE_SIZE,
      })
      .then((res) => {
        setItems(res.items)
        setPages(res.pagination.pages)
      })
      .finally(() => setLoading(false))
  }, [scholarshipId, apiStatusFilter, certificateType, minScore, sort, q, page])

  useEffect(() => {
    if (!scholarshipId) return
    setStats(null)
    partnerProfileApi.getStats({ scholarship_id: scholarshipId }).then(setStats)
  }, [scholarshipId])

  const handleDecision = async (application: ApplicationWithCandidate, status: 'won' | 'rejected') => {
    setUpdatingId(application.id)
    try {
      await applicationsApi.updateStatus(application.id, status)
      notify(status === 'won' ? 'Đã duyệt hồ sơ ứng viên.' : 'Đã từ chối hồ sơ ứng viên.')
      setSelected(null)
      setItems((prev) =>
        apiStatusFilter === undefined
          ? prev.map((it) => (it.id === application.id ? { ...it, status } : it))
          : prev.filter((it) => it.id !== application.id),
      )
      setStats((prev) =>
        prev
          ? {
              ...prev,
              pending_applications: prev.pending_applications - 1,
              selected_applications: status === 'won' ? prev.selected_applications + 1 : prev.selected_applications,
              rejected_applications: status === 'rejected' ? prev.rejected_applications + 1 : prev.rejected_applications,
            }
          : prev,
      )
    } catch {
      notify('Không thể cập nhật trạng thái hồ sơ. Vui lòng thử lại.', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleExport = async () => {
    if (!scholarshipId) return
    setExporting(true)
    try {
      const blob = await applicationsApi.exportForScholarship(scholarshipId, {
        status: apiStatusFilter,
        certificate_type: certificateType || undefined,
        certificate_min_score: certificateType ? minScore : undefined,
        sort,
        q: q || undefined,
      })
      downloadBlob(blob, `ung-vien-${scholarshipId.slice(0, 8)}.xlsx`)
    } catch {
      notify('Không thể xuất file Excel. Vui lòng thử lại.', 'error')
    } finally {
      setExporting(false)
    }
  }

  const selectedScholarship = useMemo(
    () => scholarships?.find((s) => s.id === scholarshipId) ?? null,
    [scholarships, scholarshipId],
  )

  return (
    <PartnerLayout nav={MANAGEMENT_NAV}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">Quản lý hồ sơ ứng viên</h1>
          <p className="text-sm text-brand-ink-soft">Xem và xét duyệt hồ sơ ứng viên đã nộp cho từng chương trình học bổng</p>
        </div>
        {scholarshipId && (
          <Button variant="secondary" icon={<IconDownload className="size-4" />} loading={exporting} onClick={handleExport}>
            Xuất Excel
          </Button>
        )}
      </div>

      {scholarships === null ? (
        <Spinner />
      ) : scholarships.length === 0 ? (
        <EmptyState
          title="Chưa có học bổng nào"
          description="Đăng học bổng để bắt đầu nhận hồ sơ ứng tuyển từ ứng viên."
        />
      ) : (
        <>
          <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <FilterField label="Chương trình học bổng">
              <Select
                className="h-11 max-w-lg"
                value={scholarshipId}
                onChange={(e) => {
                  setPage(1)
                  setCertificateType('')
                  setScholarshipId(e.target.value)
                }}
              >
                {scholarships.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </Select>
            </FilterField>

            <div className="my-4 border-t border-slate-100" />

            <div className="flex flex-wrap items-end gap-3">
              <FilterField label="Tìm kiếm" className="min-w-60 flex-1">
                <div className="relative">
                  <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="h-11 pl-10"
                    placeholder="Tên, trường hoặc email ứng viên"
                    value={qInput}
                    onChange={(e) => setQInput(e.target.value)}
                  />
                </div>
              </FilterField>

              <FilterField label="Trạng thái" className="w-44">
                <CheckboxFilterDropdown
                  className="w-full"
                  label="Tất cả"
                  options={STATUS_OPTIONS}
                  selected={statusFilter}
                  onChange={(next) => {
                    setPage(1)
                    setStatusFilter(next)
                  }}
                />
              </FilterField>

              {(selectedScholarship?.required_certificates.length ?? 0) > 0 && (
                <>
                  <FilterField label="Chứng chỉ" className="w-52">
                    <Select
                      className="h-11"
                      value={certificateType}
                      onChange={(e) => {
                        setPage(1)
                        setCertificateType(e.target.value)
                      }}
                    >
                      <option value="">Tất cả chứng chỉ</option>
                      {selectedScholarship!.required_certificates.map((req) => (
                        <option key={req.id} value={req.certificate_type}>
                          {req.certificate_type}
                        </option>
                      ))}
                    </Select>
                  </FilterField>
                  {certificateType && (
                    <FilterField label="Điểm tối thiểu" className="w-36">
                      <Input
                        type="number"
                        inputMode="decimal"
                        className="h-11"
                        placeholder="VD: 6.5"
                        value={minScoreInput}
                        onChange={(e) => setMinScoreInput(e.target.value)}
                      />
                    </FilterField>
                  )}
                </>
              )}

              <FilterField label="Sắp xếp" className="w-52">
                <Select
                  className="h-11"
                  value={sort}
                  onChange={(e) => {
                    setPage(1)
                    setSort(e.target.value as ApplicationSort)
                  }}
                >
                  {SORT_OPTIONS.filter((o) => !o.requiresCertificate || certificateType).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </FilterField>

              {(statusFilter.length > 0 || certificateType || minScoreInput || sort !== 'created_at_desc' || q) && (
                <button
                  type="button"
                  onClick={() => {
                    setPage(1)
                    setStatusFilter([])
                    setCertificateType('')
                    setMinScoreInput('')
                    setSort('created_at_desc')
                    setQInput('')
                    setQ('')
                  }}
                  className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-brand-ink-soft transition-colors hover:bg-slate-50 hover:text-red-500"
                >
                  <IconXCircle className="size-4" />
                  Xoá bộ lọc
                </button>
              )}
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              icon={IconWallet}
              tone="blue"
              label="Tổng số suất"
              value={selectedScholarship?.total_slots != null ? String(selectedScholarship.total_slots) : 'Không giới hạn'}
            />
            <StatCard icon={IconCheckCircle} tone="green" label="Đã duyệt" value={stats ? String(stats.selected_applications) : '…'} />
            <StatCard icon={IconClock} tone="amber" label="Đang chờ" value={stats ? String(stats.pending_applications) : '…'} />
            <StatCard icon={IconXCircle} tone="red" label="Từ chối" value={stats ? String(stats.rejected_applications) : '…'} />
          </div>

          <Table
            loading={loading}
            empty={
              items.length === 0 ? (
                <EmptyState title="Chưa có hồ sơ nào" description="Chưa có ứng viên nào khớp với bộ lọc hiện tại." />
              ) : undefined
            }
          >
            <TableHead>
              <tr>
                <TableHeaderCell>Mã ứng viên</TableHeaderCell>
                <TableHeaderCell>Tên ứng viên</TableHeaderCell>
                <TableHeaderCell>Trường</TableHeaderCell>
                <TableHeaderCell>Ngành</TableHeaderCell>
                <TableHeaderCell>GPA</TableHeaderCell>
                <TableHeaderCell>Ngày nộp</TableHeaderCell>
                <TableHeaderCell>Trạng thái</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {items.map((it) => (
                <TableRow key={it.id} onClick={() => setSelected(it)}>
                  <TableCell className="font-mono text-xs font-semibold text-slate-600">
                    {candidateCode(it.candidate.candidate_profile_id)}
                  </TableCell>
                  <TableCell className="max-w-[200px] font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="size-7 shrink-0 overflow-hidden rounded-full bg-slate-200">
                        {it.candidate.avatar_url && <img src={it.candidate.avatar_url} alt="" className="size-full object-cover" />}
                      </div>
                      <span className="truncate">{it.candidate.full_name || it.candidate.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[180px]">
                    <span className="truncate">{it.candidate.current_school ?? '—'}</span>
                  </TableCell>
                  <TableCell className="max-w-[160px]">
                    <span className="truncate" title={it.candidate.target_majors.join(', ')}>
                      {it.candidate.target_majors.length > 0 ? it.candidate.target_majors.join(', ') : '—'}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-slate-800">{it.candidate.gpa ?? '—'}</TableCell>
                  <TableCell>{formatDate(it.created_at)}</TableCell>
                  <TableCell>
                    <ApplicationStatusBadge status={it.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6">
            <Pagination page={page} pages={pages} onChange={setPage} />
          </div>
        </>
      )}

      {/* MODAL CHI TIẾT ỨNG VIÊN */}
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        size="xl"
        title={undefined}
        footer={
          selected?.status === 'pending' ? (
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                variant="danger"
                icon={<IconXCircle className="size-4" />}
                loading={updatingId === selected.id}
                onClick={() => handleDecision(selected, 'rejected')}
              >
                Từ chối hồ sơ
              </Button>
              <Button
                icon={<IconCheckCircle className="size-4" />}
                loading={updatingId === selected.id}
                onClick={() => handleDecision(selected, 'won')}
              >
                Duyệt trúng tuyển
              </Button>
            </div>
          ) : undefined
        }
      >
        {selected && (
          <div className="space-y-3 text-sm">
            {/* DÒNG RIÊNG 1: Nút X đóng cửa sổ ở góc trên bên phải */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                title="Đóng cửa sổ"
                aria-label="Đóng"
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* DÒNG RIÊNG 2: Banner header ứng viên */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3.5">
                <div className="size-12 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white shadow-xs">
                  {selected.candidate.avatar_url ? (
                    <img src={selected.candidate.avatar_url} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center font-bold text-slate-400">
                      {(selected.candidate.full_name || selected.candidate.email)[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {selected.candidate.full_name || 'Ứng viên chưa cập nhật tên'}
                  </h2>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-bold text-slate-700">
                      {candidateCode(selected.candidate.candidate_profile_id)}
                    </span>
                    <span>•</span>
                    <span>Nộp ngày {formatDate(selected.created_at)}</span>
                  </div>
                </div>
              </div>
              
              <ApplicationStatusBadge status={selected.status} />
            </div>

            {/* Khung duy nhất bao trọn nội dung */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white divide-y divide-slate-200 shadow-xs">
              
              {/* Mục 1: Thông tin cá nhân & Học vấn */}
              <div className="p-5 space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Thông tin cá nhân & Học vấn
                </h3>
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  <DetailItem label="Email liên hệ" value={selected.candidate.email} />
                  <DetailItem label="Trường đang học" value={selected.candidate.current_school ?? '—'} />
                  <DetailItem
                    label="Điểm GPA"
                    value={selected.candidate.gpa != null ? String(selected.candidate.gpa) : '—'}
                    highlight
                  />
                  <DetailItem label="Tỉnh / Thành phố" value={selected.candidate.province_city ?? '—'} />
                  <DetailItem label="Hoàn cảnh tài chính" value={selected.candidate.financial_need_level ?? '—'} />
                  <DetailItem
                    label="Ngành mục tiêu"
                    value={
                      selected.candidate.target_majors.length > 0
                        ? selected.candidate.target_majors.join(', ')
                        : '—'
                    }
                  />
                </dl>
              </div>

              {/* Mục 2: Hồ sơ & Tài liệu đính kèm */}
              <div className="p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Hồ sơ & Tài liệu đính kèm
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FileCard label="CV ứng tuyển" url={selected.submitted_cv_url} />
                  <FileCard label="Bài luận cá nhân" url={selected.submitted_essay_url} />
                </div>

                <div className="pt-1">
                  <p className="mb-2 text-xs font-bold text-slate-700">
                    Chứng chỉ đính kèm ({selected.certificates.length}):
                  </p>
                  {selected.certificates.length === 0 ? (
                    <p className="text-xs italic text-slate-400">Ứng viên chưa nộp chứng chỉ nào cho đơn này.</p>
                  ) : (
                    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {selected.certificates.map((c) => (
                        <li
                          key={c.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2"
                        >
                          <span className="text-xs font-bold text-slate-800">
                            {c.certificate_type}{' '}
                            <span className="font-extrabold text-brand-blue-600">({c.certificate_score})</span>
                          </span>
                          <FileLink label="Xem minh chứng" url={c.attachment_url} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Mục 3: Bảng đối chiếu yêu cầu học bổng */}
              <div className="p-5 space-y-4 bg-brand-blue-50/20">
                <div className="flex items-center justify-between border-b border-brand-blue-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Đối chiếu với yêu cầu học bổng
                  </h3>
                  <span className="rounded-full bg-brand-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-brand-blue-700">
                    Tự động đối chiếu
                  </span>
                </div>

                {selectedScholarship ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <RequirementCheckCard
                        label="Mức GPA tối thiểu"
                        result={gpaRequirementCheck(selectedScholarship, selected.candidate.gpa)}
                      />
                      <RequirementCheckCard
                        label="Ngành học phù hợp"
                        result={majorsRequirementCheck(selectedScholarship, selected.candidate.target_majors)}
                      />
                    </div>

                    <div className="space-y-2 pt-2 border-t border-brand-blue-100/80">
                      <p className="text-xs font-bold text-slate-700">Yêu cầu chứng chỉ học bổng</p>
                      {selectedScholarship.required_certificates.length === 0 ? (
                        <p className="text-xs text-slate-500">Học bổng này không yêu cầu chứng chỉ cụ thể.</p>
                      ) : (
                        <ul className="space-y-2">
                          {selectedScholarship.required_certificates.map((req) => {
                            const match = selected.certificates.find((c) =>
                              certificateMatches(c.certificate_type, req.certificate_type),
                            )
                            return (
                              <li
                                key={req.id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-2xs"
                              >
                                <div className="flex items-center gap-2">
                                  {match ? (
                                    <IconCheckCircle className="size-4 shrink-0 text-emerald-500" />
                                  ) : (
                                    <IconXCircle className="size-4 shrink-0 text-red-500" />
                                  )}
                                  <span className="text-xs font-bold text-slate-800">
                                    {req.certificate_type}
                                    {match && (
                                      <span className="text-slate-600 font-normal">
                                        {' '}— ứng viên có:{' '}
                                        <strong className="text-brand-blue-600 font-bold">
                                          {match.certificate_type} ({match.certificate_score})
                                        </strong>
                                      </span>
                                    )}
                                  </span>
                                </div>
                                {match && <FileLink label="Xem minh chứng" url={match.attachment_url} />}
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Không có thông tin học bổng.</p>
                )}
              </div>

            </div>
          </div>
        )}
      </Modal>
    </PartnerLayout>
  )
}

function FilterField({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold text-brand-ink-soft">{label}</label>
      {children}
    </div>
  )
}

function DetailItem({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 border border-slate-200/70">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className={`mt-0.5 text-xs ${highlight ? 'font-bold text-brand-blue-600 text-sm' : 'font-bold text-slate-800'}`}>
        {value}
      </dd>
    </div>
  )
}

function RequirementCheckCard({ label, result }: { label: string; result: RequirementResult }) {
  const isPass = result.status === 'pass'
  const isFail = result.status === 'fail'

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800">{label}</span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
            isPass
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : isFail
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          {isPass && <IconCheckCircle className="size-3" />}
          {isFail && <IconXCircle className="size-3" />}
          {isPass ? 'Đạt yêu cầu' : isFail ? 'Không đạt' : 'Không bắt buộc'}
        </span>
      </div>
      <p className="text-xs font-medium text-slate-600 leading-snug">{result.text}</p>
    </div>
  )
}

function FileLink({ label, url }: { label: string; url: string | null }) {
  if (!url) return <span className="text-[11px] font-medium text-slate-400">—</span>
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue-600 hover:underline"
    >
      <span>{label}</span>
    </a>
  )
}

function FileCard({ label, url }: { label: string; url: string | null }) {
  if (!url) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-3 text-xs">
        <span className="font-medium text-slate-500">{label}</span>
        <span className="text-[11px] font-bold text-slate-400">Chưa nộp</span>
      </div>
    )
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-2xs transition-all hover:border-brand-blue-300 hover:bg-brand-blue-50/30"
    >
      <span className="font-bold text-slate-800 group-hover:text-brand-blue-600">{label}</span>
      <div className="flex items-center gap-1 font-bold text-brand-blue-600">
        <IconDownload className="size-3.5 shrink-0" />
        <span>Tải về xem</span>
      </div>
    </a>
  )
}