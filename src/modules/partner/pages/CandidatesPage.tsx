import { useEffect, useMemo, useState } from 'react'
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
import { useToast } from '@/shared/components/ui/ToastProvider'
import { ApplicationStatusBadge } from '@/modules/partner/components/ApplicationStatusBadge'
import { usePartnerProfile } from '@/modules/partner/PartnerProfileContext'
import { scholarshipsApi } from '@/modules/partner/api/scholarships.api'
import { applicationsApi } from '@/modules/partner/api/applications.api'
import type { ApplicationStatus, ApplicationWithCandidate, Scholarship } from '@/modules/partner/types'
import { certificateMatches, gpaRequirementCheck, majorsRequirementCheck, type RequirementResult } from '@/modules/partner/lib/requirementMatch'
import { formatDate } from '@/shared/lib/format'
import { IconCheckCircle, IconSearch, IconXCircle } from '@/modules/partner/components/icons'

const PAGE_SIZE = 10

const FILTER_OPTIONS: { value: ApplicationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ xét duyệt' },
  { value: 'won', label: 'Đã được chọn' },
  { value: 'rejected', label: 'Bị từ chối' },
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
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all')
  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  const [items, setItems] = useState<ApplicationWithCandidate[]>([])
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selected, setSelected] = useState<ApplicationWithCandidate | null>(null)

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
    if (!scholarshipId) return
    setLoading(true)
    applicationsApi
      .listForScholarship(scholarshipId, {
        status: filter === 'all' ? undefined : filter,
        q: q || undefined,
        page,
        limit: PAGE_SIZE,
      })
      .then((res) => {
        setItems(res.items)
        setPages(res.pagination.pages)
      })
      .finally(() => setLoading(false))
  }, [scholarshipId, filter, q, page])

  const handleDecision = async (application: ApplicationWithCandidate, status: 'won' | 'rejected') => {
    setUpdatingId(application.id)
    try {
      await applicationsApi.updateStatus(application.id, status)
      notify(status === 'won' ? 'Đã duyệt hồ sơ ứng viên.' : 'Đã từ chối hồ sơ ứng viên.')
      setSelected(null)
      setItems((prev) =>
        filter === 'all'
          ? prev.map((it) => (it.id === application.id ? { ...it, status } : it))
          : prev.filter((it) => it.id !== application.id),
      )
    } catch {
      notify('Không thể cập nhật trạng thái hồ sơ. Vui lòng thử lại.', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const selectedScholarship = useMemo(
    () => scholarships?.find((s) => s.id === scholarshipId) ?? null,
    [scholarships, scholarshipId],
  )

  return (
    <PartnerLayout nav={MANAGEMENT_NAV}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-ink">Quản lý hồ sơ ứng viên</h1>
        <p className="text-sm text-brand-ink-soft">Xem và xét duyệt hồ sơ ứng viên đã nộp cho từng chương trình học bổng</p>
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
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Select
              className="w-72"
              value={scholarshipId}
              onChange={(e) => {
                setPage(1)
                setScholarshipId(e.target.value)
              }}
            >
              {scholarships.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </Select>
            <Select
              className="w-56"
              value={filter}
              onChange={(e) => {
                setPage(1)
                setFilter(e.target.value as ApplicationStatus | 'all')
              }}
            >
              {FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
            <div className="relative min-w-[220px] flex-1">
              <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-10"
                placeholder="Tìm theo tên, trường hoặc email"
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
              />
            </div>
            {selectedScholarship?.total_slots != null && (
              <span className="shrink-0 text-sm text-brand-ink-soft">
                Tổng số suất: <span className="font-semibold text-brand-ink">{selectedScholarship.total_slots}</span>
              </span>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <Spinner />
            ) : items.length === 0 ? (
              <EmptyState
                title="Chưa có hồ sơ nào"
                description="Chưa có ứng viên nào khớp với bộ lọc hiện tại."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-brand-blue-50/60 text-brand-ink-soft">
                    <tr>
                      <th className="px-5 py-3 font-medium">Mã ứng viên</th>
                      <th className="px-5 py-3 font-medium">Tên ứng viên</th>
                      <th className="px-5 py-3 font-medium">Trường</th>
                      <th className="px-5 py-3 font-medium">Ngành</th>
                      <th className="px-5 py-3 font-medium">GPA</th>
                      <th className="px-5 py-3 font-medium">Ngày nộp</th>
                      <th className="px-5 py-3 font-medium">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((it) => (
                      <tr
                        key={it.id}
                        onClick={() => setSelected(it)}
                        className="cursor-pointer hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 font-mono text-xs text-brand-ink-soft">
                          {candidateCode(it.candidate.candidate_profile_id)}
                        </td>
                        <td className="max-w-[200px] px-5 py-4 font-medium text-brand-ink">
                          <div className="flex items-center gap-2">
                            <div className="size-7 shrink-0 overflow-hidden rounded-full bg-slate-200">
                              {it.candidate.avatar_url && <img src={it.candidate.avatar_url} alt="" className="size-full object-cover" />}
                            </div>
                            <span className="truncate">{it.candidate.full_name || it.candidate.email}</span>
                          </div>
                        </td>
                        <td className="max-w-[180px] px-5 py-4 text-brand-ink-soft">
                          <span className="truncate">{it.candidate.current_school ?? '—'}</span>
                        </td>
                        <td className="max-w-[160px] px-5 py-4 text-brand-ink-soft">
                          <span className="truncate" title={it.candidate.target_majors.join(', ')}>
                            {it.candidate.target_majors.length > 0 ? it.candidate.target_majors.join(', ') : '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-brand-ink-soft">{it.candidate.gpa ?? '—'}</td>
                        <td className="px-5 py-4 text-brand-ink-soft">{formatDate(it.created_at)}</td>
                        <td className="px-5 py-4">
                          <ApplicationStatusBadge status={it.status} />
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
        </>
      )}

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        size="lg"
        title={
          selected ? (
            <div className="flex items-center gap-3">
              <div className="size-10 shrink-0 overflow-hidden rounded-full bg-slate-200">
                {selected.candidate.avatar_url && <img src={selected.candidate.avatar_url} alt="" className="size-full object-cover" />}
              </div>
              <span>{selected.candidate.full_name || selected.candidate.email}</span>
            </div>
          ) : undefined
        }
        footer={
          selected?.status === 'pending' ? (
            <>
              <Button
                variant="danger"
                icon={<IconXCircle className="size-4" />}
                loading={updatingId === selected.id}
                onClick={() => handleDecision(selected, 'rejected')}
              >
                Từ chối
              </Button>
              <Button
                icon={<IconCheckCircle className="size-4" />}
                loading={updatingId === selected.id}
                onClick={() => handleDecision(selected, 'won')}
              >
                Duyệt
              </Button>
            </>
          ) : undefined
        }
      >
        {selected && (
          <div className="space-y-6 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs text-brand-ink-soft">{candidateCode(selected.candidate.candidate_profile_id)}</span>
              <ApplicationStatusBadge status={selected.status} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <section>
                <h3 className="mb-3 text-sm font-bold text-brand-ink">Thông tin ứng viên</h3>
                <dl className="space-y-3">
                  <DetailRow label="Email" value={selected.candidate.email} />
                  <DetailRow label="Trường" value={selected.candidate.current_school ?? '—'} />
                  <DetailRow label="GPA" value={selected.candidate.gpa != null ? String(selected.candidate.gpa) : '—'} />
                  <DetailRow label="Tỉnh / Thành phố" value={selected.candidate.province_city ?? '—'} />
                  <DetailRow label="Hoàn cảnh tài chính" value={selected.candidate.financial_need_level ?? '—'} />
                  <DetailRow
                    label="Ngành mục tiêu"
                    value={selected.candidate.target_majors.length > 0 ? selected.candidate.target_majors.join(', ') : '—'}
                  />
                  <DetailRow label="Ngày nộp" value={formatDate(selected.created_at)} />
                </dl>

                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium uppercase text-brand-ink-soft">Chứng chỉ đã nộp cho đơn này</p>
                  {selected.certificates.length === 0 ? (
                    <p className="text-brand-ink-soft">Ứng viên chưa nộp chứng chỉ nào cho đơn này.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {selected.certificates.map((c) => (
                        <li key={c.id} className="flex items-center justify-between gap-3">
                          <span className="text-brand-ink">
                            {c.certificate_type} <span className="text-brand-ink-soft">({c.certificate_score})</span>
                          </span>
                          <FileLink label="Xem tệp" url={c.attachment_url} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium uppercase text-brand-ink-soft">Hồ sơ đính kèm</p>
                  <div className="flex flex-wrap gap-4">
                    <FileLink label="CV đã nộp" url={selected.submitted_cv_url} />
                    <FileLink label="Bài luận đã nộp" url={selected.submitted_essay_url} />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-sm font-bold text-brand-ink">Đối chiếu với yêu cầu học bổng</h3>
                {selectedScholarship ? (
                  <div className="space-y-4">
                    <RequirementCheck label="GPA tối thiểu" result={gpaRequirementCheck(selectedScholarship, selected.candidate.gpa)} />
                    <RequirementCheck label="Ngành phù hợp" result={majorsRequirementCheck(selectedScholarship, selected.candidate.target_majors)} />

                    <div>
                      <p className="mb-1 text-xs font-medium text-brand-ink-soft">Chứng chỉ yêu cầu</p>
                      {selectedScholarship.required_certificates.length === 0 ? (
                        <p className="text-brand-ink-soft">Học bổng không yêu cầu chứng chỉ cụ thể.</p>
                      ) : (
                        <ul className="space-y-2">
                          {selectedScholarship.required_certificates.map((req) => {
                            const match = selected.certificates.find((c) => certificateMatches(c.certificate_type, req.certificate_type))
                            return (
                              <li key={req.id} className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2">
                                  {match ? (
                                    <IconCheckCircle className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                                  ) : (
                                    <IconXCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
                                  )}
                                  <span className="text-brand-ink">
                                    {req.certificate_type}
                                    {match && <span className="text-brand-ink-soft"> — ứng viên có {match.certificate_type} ({match.certificate_score})</span>}
                                  </span>
                                </div>
                                {match && <FileLink label="Xem tệp" url={match.attachment_url} />}
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-brand-ink-soft">Không có thông tin học bổng.</p>
                )}
              </section>
            </div>
          </div>
        )}
      </Modal>
    </PartnerLayout>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-brand-ink-soft">{label}</dt>
      <dd className="font-medium text-brand-ink">{value}</dd>
    </div>
  )
}

function RequirementCheck({ label, result }: { label: string; result: RequirementResult }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-brand-ink-soft">{label}</p>
      <div className="flex items-start gap-2">
        {result.status === 'pass' && <IconCheckCircle className="mt-0.5 size-4 shrink-0 text-emerald-500" />}
        {result.status === 'fail' && <IconXCircle className="mt-0.5 size-4 shrink-0 text-red-500" />}
        {result.status === 'neutral' && <span className="mt-1 size-2 shrink-0 rounded-full bg-slate-300" />}
        <span className="text-brand-ink">{result.text}</span>
      </div>
    </div>
  )
}

function FileLink({ label, url }: { label: string; url: string | null }) {
  if (!url) return <span className="text-xs text-slate-400">{label}: —</span>
  return (
    <a href={url} target="_blank" rel="noreferrer" className="text-xs text-brand-blue-600 hover:underline">
      {label}
    </a>
  )
}
