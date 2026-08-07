import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CandidateLayout } from '@/modules/candidate/components/CandidateLayout'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { formatDate } from '@/shared/lib/format'
import { applicationsApi } from '@/modules/scholarships/api/applications.api'
import { scholarshipsApi } from '@/modules/scholarships/api/scholarships.api'
import { ApplicationStatusBadge } from '@/modules/scholarships/components/badges'
import type { Application, Scholarship } from '@/modules/scholarships/types'

export function AppliedScholarshipsPage() {
  const [rows, setRows] = useState<{ application: Application; scholarship: Scholarship | null }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    void applicationsApi
      .listMine()
      .then(async (applications) => {
        const scholarships = await Promise.all(
          applications.map((a) => scholarshipsApi.get(a.scholarship_id).catch(() => null)),
        )
        setRows(applications.map((application, idx) => ({ application, scholarship: scholarships[idx] })))
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <CandidateLayout>
      <h1 className="mb-6 text-2xl font-bold text-brand-ink">Học bổng đã ứng tuyển</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="Bạn chưa ứng tuyển học bổng nào"
          description="Khám phá danh sách học bổng và ứng tuyển ngay."
          action={
            <Link to="/hoc-bong" className="text-sm font-semibold text-brand-blue-600">
              Xem học bổng
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {rows.map(({ application, scholarship }) => (
            <Link
              key={application.id}
              to={`/hoc-bong/${application.scholarship_id}/ung-tuyen`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-brand-blue-300"
            >
              <div className="min-w-0">
                <p className="font-semibold text-brand-ink hover:text-brand-blue-600">
                  {scholarship?.title ?? 'Học bổng không còn tồn tại'}
                </p>
                <p className="mt-1 text-xs text-brand-ink-soft">Đã nộp ngày {formatDate(application.created_at)}</p>
              </div>
              <ApplicationStatusBadge status={application.status} />
            </Link>
          ))}
        </div>
      )}
    </CandidateLayout>
  )
}
